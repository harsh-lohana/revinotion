"use client"

import { useEffect, useState } from "react";

const POTD = () => {
  const [loading, setLoading] = useState<any>(false);
  const [randomQuestion, setRandomQusetion] = useState<any>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resq = await fetch("/api/potd");
      const op = await resq.json();
      setRandomQusetion(op.random);
      console.log(randomQuestion);
      setLoading(false);
    })();
    return () => {};
  }, []);

  return (
    <main className="flex flex-col h-screen items-center">
      <h1 className="text-4xl">POTD</h1>
      <h2>{randomQuestion && randomQuestion.name}</h2>
    </main>
  );
};

export default POTD;
