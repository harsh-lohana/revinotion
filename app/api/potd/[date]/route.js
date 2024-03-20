import prisma from "@/app/lib/prisma";

export async function GET(req, context) {
    const { params } = context;
    const { date } = params;
    const problems = await prisma.problem.findMany({
        where: {
            createdAt: {
                gte: date
            },
        },
    });
    console.log(problems);
    const potd = problems[0];
    return Response.json({ potd });
}
