import prisma from "@/app/lib/prisma";

export async function GET(req) {
  const date = new Date();
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  // const newDate = new Date();
  // newDate.setDate(utcDate.getDate() + 1);
  const finalDate = utcDate.toISOString();
  console.log(finalDate)
  const problems = await prisma.problem.findMany({
    where: {
      createdAt: {
        gte: finalDate
      },
    },
  })
  if (problems) {
    const potd = problems[problems.length - 1];
    return Response.json({ potd });
  } else {
    return Response.json({ msg: "No problems found!" })
  }
}
