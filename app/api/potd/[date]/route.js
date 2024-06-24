import prisma from "@/app/lib/prisma";

export async function GET(req, context) {
    const { params } = context;
    const { date } = params;

    var startOfDay = new Date(date);
    startOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
    startOfDay.setUTCHours(0, 0, 0, 0);
    var endOfDay = new Date(date);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log(date, startOfDay, endOfDay)

    const problems = await prisma.problem.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            },
        },
    });
    console.log(problems);
    const potd = problems[0];
    return Response.json({ potd });
}
