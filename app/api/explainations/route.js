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
  const q = res.results;
  return Response.json({ q });
}
