import prisma from "@/app/lib/prisma";

export async function GET(req) {
  const today = new Date();
  const current = today.getDate();
  const yesterday = new Date();
  yesterday.setDate(current - 1);
  const potd = await prisma.problem.findMany({
    where: {
      createdAt: {
        gt: yesterday,
        lte: today
      },
    },
  })
  return Response.json({ potd });
}
