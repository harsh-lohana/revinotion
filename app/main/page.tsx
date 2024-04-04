"use client";

import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { UrlObject } from "url";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation";

function MainPage() {
  const [loading, setLoading] = useState<any>(false);
  const [title, setTitle] = useState<any>("");
  const [questions, setQusetions] = useState<any>();
  const [date, setDate] = useState<Date | any>(new Date());

  const { push } = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/title", { cache: "no-store" })
      const output = await res.json();
      setTitle(output.title);
      const resq = await fetch("/api/questions", {
        next: {
          revalidate: 0,
        }
      });
      const op = await resq.json();
      setQusetions(op.questions);
      setLoading(false);
    })();
    return () => { };
  }, []);

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    console.log(date);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const newDate = new Date();
    newDate.setDate(utcDate.getDate() + 1);
    push(`/potd/${newDate.toISOString()}`)
  }, [date]);

  return (
    <main className="flex flex-col h-screen items-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="flex gap-4">
        <div>
          {questions &&
            questions?.map(
              (q: {
                color: Key | null | undefined;
                topics: any;
                id: string | undefined;
                url: string | UrlObject;
                name:
                | string
                | number
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | PromiseLikeOfReactNode
                | null
                | undefined;
              }) => (
                <div key={q.id}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <Link href={q.url}>{q.name}</Link>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex">
                          {q.topics &&
                            q.topics.map(
                              (t: {
                                color: ReactNode;
                                name:
                                | string
                                | number
                                | boolean
                                | ReactElement<
                                  any,
                                  string | JSXElementConstructor<any>
                                >
                                | Iterable<ReactNode>
                                | ReactPortal
                                | PromiseLikeOfReactNode
                                | null
                                | undefined;
                              }) => (
                                <div key={q.id}>
                                  <h3 className="bg-green-200 w-fit px-2 py-1 mx-1 rounded-xl flex justify-center items-center">
                                    {t.name}
                                  </h3>
                                </div>
                              )
                            )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )
            )}
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
    </main>
  );
}

export default MainPage;

export const dynamic = "force-dynamic";
