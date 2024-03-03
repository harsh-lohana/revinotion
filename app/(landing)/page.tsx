"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CodeIcon } from "lucide-react";

const page = () => {

  const [loading, setLoading] = useState<any>(false);
  const [problem, setProblem] = useState<any>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resq = await fetch("/api/potd", { cache: "no-store" });
      const op = await resq.json();
      setProblem(op.potd);
      console.log(op.potd);
      setLoading(false);
    })();
    return () => { };
  }, []);

  return (
    <main className='flex flex-col w-screen items-center justify-between p-10'>
      {problem && (
        <div className="m-2 w-4/5">
          <h2 className="text-2xl font-bold">Today's POTD</h2>
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
      <div className="m-2 w-4/5">
        <h2 className="text-2xl font-bold">Master LeetCode</h2>
        <p className="text-lg font-semibold">
          Sharpen your skills with daily coding challenges. From algorithms to data structures, we've got you covered.
        </p>
      </div>
      <div className="m-2 w-4/5">
        <h2 className="text-2xl font-bold">About Notion</h2>
        <p className="text-lg font-semibold">
          Notion is a freemium productivity and note-taking web application
          developed by Notion Labs Inc. It offers organizational tools including
          task management, project tracking, to-do lists, and bookmarking.
        </p>
      </div>
      <div className="m-2 w-4/5">
        <h2 className="text-2xl font-bold">ReviNotion</h2>
        <p className="text-lg font-semibold">
          ReviNotion is a web application enabling users to encounter new
          LeetCode questions and revise them regularly. A question from a pool
          of question submitted earlier is selected as the POTD (Problem Of the
          Day) for revision. It is built using the Notion API and a Notion
          database.
        </p>
      </div>
    </main>
  );
};

export default page;
