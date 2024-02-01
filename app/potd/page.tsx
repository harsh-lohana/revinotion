"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const POTD = () => {
  const [loading, setLoading] = useState<any>(false);
  const [problems, setProblems] = useState<any>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resq = await fetch("/api/potd", { cache: "no-store" });
      const op = await resq.json();
      setProblems(op.potd);
      console.log(op.potd);
      setLoading(false);
    })();
    return () => {};
  }, []);

  return (
    <main className="flex flex-col h-screen items-center">
      <h1 className="text-4xl">POTD</h1>
      {/* {problems && (
        <div className="flex flex-col">
          <Link href={problems[0].url}>
            <h1>{problems[0].name}</h1>
          </Link>
        </div>
      )} */}
    </main>
  );
};

export default POTD;
