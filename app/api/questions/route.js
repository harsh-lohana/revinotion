import { Client } from "@notionhq/client";

const secret = process.env.NOTION_SECRET;
const dbId = process.env.NOTION_DATABASE_ID;

const notion = new Client({
  auth: secret,
});

export async function GET(req) {
  if (!secret || !dbId) throw new Error("Missing Notion stuff!");
  const res = await notion.databases.query({
    database_id: dbId,
  });
  const questions = [];
  const q = res.results;
  for(let i = 0; i < q.length; i++) {
    const topics = [];
    for(let j = 0; j < q[i].properties.Topics.multi_select.length; j++) {
      topics.push({
        name: q[i].properties.Topics.multi_select[j].name,
        color: q[i].properties.Topics.multi_select[j].color
      })
    }
    questions.push({
      name: q[i].properties.Name.title[0].plain_text,
      topics,
      url: q[i].properties.Name.title[0].href
    })
  }
  return Response.json({ questions });
}
