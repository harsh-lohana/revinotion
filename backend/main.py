import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from notion_client import AsyncClient
from services.redis import get_redis
from datetime import datetime, time

def seconds_until_midnight() -> int:
    now = datetime.now()
    midnight = datetime.combine(now.date(), time(0, 0, 0))
    # If it's already past midnight, get next midnight
    if now >= midnight:
        from datetime import timedelta
        midnight += timedelta(days=1)
    return int((midnight - now).total_seconds())

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

notion = AsyncClient(auth=os.getenv("NOTION_TOKEN"))
DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

@app.get("/")
def home():
    return {"message": "Hello World 🚀"}

async def fetch_all_blocks(block_id):
    blocks = []
    start_cursor = None
    while True:
        response = await notion.blocks.children.list(block_id = block_id, start_cursor = start_cursor)
        for block in response["results"]:
            if block.get("has_children"):
                block["children"] = await fetch_all_blocks(block["id"])
            blocks.append(block)
        if not response.get("has_more"):
            break
        start_cursor = response.get("next_cursor")
    return blocks

def parse_block(block):
    block_type = block["type"]
    block_id = block["id"]

    parsed = {
        "id": block_id,
        "type": block_type,
        "has_children": block.get("has_children", False),
        "text": "",
        "extra": {}
    }

    # Most text-based blocks store content in rich_text
    if block_type in block and "rich_text" in block[block_type]:
        rich_text = block[block_type]["rich_text"]
        parsed["text"] = "".join(
            rt.get("plain_text", "") for rt in rich_text
        )

    # Handle common special blocks
    if block_type == "heading_1":
        parsed["level"] = 1
    elif block_type == "heading_2":
        parsed["level"] = 2
    elif block_type == "heading_3":
        parsed["level"] = 3
    elif block_type == "to_do":
        parsed["extra"]["checked"] = block["to_do"].get("checked", False)
    elif block_type == "image":
        parsed["extra"]["image_url"] = (
            block["image"].get("file", {}).get("url")
            or block["image"].get("external", {}).get("url")
        )
    elif block_type == "code":
        parsed["extra"]["language"] = block["code"].get("language")

    # Include children if present
    if block.get("children"):
        parsed["children"] = [parse_block(child) for child in block["children"]]

    return parsed

@app.get("/questions")
async def get_questions():
    redis = await get_redis()
    cached = await redis.get("daily:problem")
    if cached:
        print("REDIS CACHE")
        return json.loads(cached)

    response = await notion.databases.retrieve(database_id=DATABASE_ID)
    DATA_SOURCE_ID = response["data_sources"][0]["id"]
    title = response["data_sources"][0]["name"]
    response = await notion.data_sources.query(**{"data_source_id": DATA_SOURCE_ID})
    # print(response["results"])
    questions = []
    for page in response["results"]:
        name_prop = page["properties"]["Name"]["title"][0]["text"]
        blocks = await fetch_all_blocks(page["id"])
        parsed_blocks = [parse_block(block) for block in blocks]
        questions.append({
            "name": name_prop["content"],
            "link": name_prop.get("link", {}).get("url"),
            "topics": [t["name"] for t in page["properties"]["Topics"]["multi_select"]],
            "blocks": parsed_blocks
        })
    await redis.setex("daily:problem", seconds_until_midnight(), json.dumps(questions))
    # for q in questions:
    #     print(q)
    return {"questions": questions}