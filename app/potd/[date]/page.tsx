"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CodeIcon } from "lucide-react";

export default function POTDPage({ params }: {
    params: { date: string }
}) {

    const [loading, setLoading] = useState<any>(false);
    const [problem, setProblem] = useState<any>();

    const date = params.date;

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/potd/${date}`, { cache: "no-store" });
            const output = await res.json();
            setProblem(output.potd);
            console.log(output.potd);
            setLoading(false);
        })();
        return () => { };
    }, [date]);

    return (
        <main>
            {problem && (
                <div className="m-2 w-4/5">
                    <h2 className="text-2xl font-bold">POTD</h2>
                    <div className="flex gap-2">
                        <CodeIcon className="w-16 h-16 rounded-lg p-2 bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400" />
                        <div className="flex flex-col justify-center">
                            <h3 className="text-lg font-semibold">{problem.name}</h3>
                            <Link href={problem.url}>
                                Link 🔗
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
