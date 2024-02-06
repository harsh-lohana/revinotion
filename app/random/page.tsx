"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Random = () => {
  const [loading, setLoading] = useState<any>(false);
  const [randomQuestion, setRandomQusetion] = useState<any>();

  // useEffect(() => {
  //   (async () => {
  //     setLoading(true);
  //     const resq = await fetch("/api/random", { cache: "no-store" });
  //     const op = await resq.json();
  //     setRandomQusetion(op.random);
  //     setLoading(false);
  //   })();
  //   return () => {};
  // }, []);

  return (
    <main className="flex flex-col h-screen items-center">
      <h1 className="text-4xl">Random</h1>
      {/* {randomQuestion && (
        <div className="flex flex-col">
          <Link href={randomQuestion.url}>
            <h1>{randomQuestion.name}</h1>
          </Link>
        </div>
      )} */}
    </main>
  );
};

export default Random;
