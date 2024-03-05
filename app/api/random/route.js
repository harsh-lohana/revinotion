import { Client } from "@notionhq/client";
import prisma from "@/app/lib/prisma";

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
  for (let i = 0; i < q.length; i++) {
    const topics = [];
    for (let j = 0; j < q[i].properties.Topics.multi_select.length; j++) {
      topics.push({
        name: q[i].properties.Topics.multi_select[j].name,
        color: q[i].properties.Topics.multi_select[j].color,
      });
    }
    questions.push({
      id: q[i].id,
      name: q[i].properties.Name.title[0].plain_text,
      topics,
      url: q[i].properties.Name.title[0].href,
    });
  }
  const random = questions[Math.floor(Math.random() * questions.length)];
  const potd = await prisma.problem.create({
    data: {
      name: random.name,
      url: random.url,
      topics: random.topics
    },
  });
  return Response.json({potd});
}
