"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookIcon, CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LandingPage = () => {

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
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Ace LeetCode with Our Daily Challenges
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Revise LeetCode questions with our curated 'Problem of the Day' feature to improve your coding skills.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                    prefetch={false}
                  >
                    Signup/Signin
                  </Link>
                </div>
              </div>
              <img
                src="/leetcode.png"
                width="700"
                height="550"
                alt="leetcode"
                className="mx-auto overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Improve Your Coding Skills Daily</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Our 'Problem of the Day' feature provides you with a carefully selected LeetCode question to
                    practice every day. Become a better problem solver.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Today's Problem</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {problem && problem.name}
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button variant="outline" onClick={() => console.log(problem.url)}>View Problem</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
