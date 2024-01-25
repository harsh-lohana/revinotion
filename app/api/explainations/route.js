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
  const pageIds = [];
  for(let i = 0; i < q.length; i++) {
    pageIds.push(q[i].id);
  }
  // const pages = [];
  const pageId = pageIds[0];
  const response = await notion.pages.retrieve({ page_id: pageId });
  console.log(response);
  return Response.json({ response });
}

export const dynamic = 'force-dynamic'
