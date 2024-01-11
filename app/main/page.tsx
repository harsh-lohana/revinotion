"use client";

import { useEffect, useState } from "react";

function MainPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/title");
      const output = await res.json();
      setTitle(output.title);
      const res1 = await fetch("/api/questions");
      const op = await res1.json();
      setQ(op.q);
      setLoading(false);
    })();
    return () => {};
  }, []);

  return (
    <div>
      <h1>{title}</h1>
      <h1>{q}</h1>
    </div>
  );
}

export default MainPage;
