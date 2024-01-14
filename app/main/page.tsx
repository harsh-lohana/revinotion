"use client";

import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { UrlObject } from "url";

function MainPage() {
  const [loading, setLoading] = useState<any>(false);
  const [title, setTitle] = useState<any>("");
  const [questions, setQusetions] = useState<any>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/title");
      const output = await res.json();
      setTitle(output.title);
      const resq = await fetch("/api/questions");
      const op = await resq.json();
      setQusetions(op.questions);
      console.log(op.questions);
      setLoading(false);
    })();
    return () => {};
  }, []);

  return (
    <div>
      <h1>{title}</h1>
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
                <h1>
                  <Link href={q.url}>{q.name}</Link>
                </h1>
                <div>
                  {
                    q.topics && q.topics.map((t: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }) => (
                      <span key={q.color}>{t.name}</span>
                    ))
                  }
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
}

export default MainPage;
