import prisma from "@/app/lib/prisma";

export async function GET(req) {
  const date = new Date();
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const finalDate = utcDate.toISOString();
  const problems = await prisma.problem.findMany({
    where: {
      createdAt: {
        gte: finalDate
      },
    },
  })
  const potd = problems[0];
  return Response.json({ potd });
}
