import { Client } from "@notionhq/client";

const secret = process.env.NOTION_SECRET;
const dbId = process.env.NOTION_DATABASE_ID;

const notion = new Client({
  auth: secret,
});

export async function GET(req) {
  if (!secret || !dbId) throw new Error("Missing Notion stuff!");
  const res = await notion.databases.retrieve({
    database_id: dbId,
  });
  const title = res.title[0].plain_text;
  return Response.json({ title });
}

export const dynamic = 'force-dynamic'