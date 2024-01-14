"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function MainPage() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQusetions] = useState();

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
        {
          questions && questions.map(q => (
            <h1><Link href={q.url}>{q.name}</Link></h1>
          ))
        }
      </div>
    </div>
  );
}

export default MainPage;
