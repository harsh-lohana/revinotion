import prisma from "@/app/lib/prisma";

export async function GET(req) {
  let lastDay = Date.now() - (24 * 60 * 60 * 1000);
  lastDay = new Date(lastDay).toISOString();
  const problems = await prisma.problem.findMany({
    where: {
      createdAt: {
        gte: lastDay
      },
    },
  })
  const potd = problems[problems.length - 1];
  return Response.json({ potd });
}
