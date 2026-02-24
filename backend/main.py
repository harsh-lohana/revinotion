import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from notion_client import AsyncClient

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
DATABASE_ID = os.getenv("NOTION_DATABSE_ID")

@app.get("/")
def home():
    return {"message": "Hello World 🚀"}

@app.get("/questions")
async def get_questions():
    response = await notion.databases.retrieve(database_id=DATABASE_ID)
    print(response["data_sources"])
    DATA_SOURCE_ID = response["data_sources"][0]["id"]
    title = response["data_sources"][0]["name"]
    print(DATA_SOURCE_ID, title)
    response = await notion.data_sources.query(**{"data_source_id": DATA_SOURCE_ID})
    questions = []
    for page in response["results"]:
        name_prop = page["properties"]["Name"]["title"][0]["text"]
        questions.append({
            "name": name_prop["content"],
            "link": name_prop.get("link", {}).get("url"),
            "topics": [t["name"] for t in page["properties"]["Topics"]["multi_select"]],
        })
    for q in questions:
        print(q)
    return {"questions": questions}