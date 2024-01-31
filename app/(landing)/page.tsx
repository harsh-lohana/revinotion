const page = () => {
  return (
    <main className="flex flex-col w-screen items-center justify-between p-10">
      <div className="m-2">
        <h2 className="text-2xl font-bold">About Notion</h2>
        <p className="text-lg font-semibold">
          Notion is a freemium productivity and note-taking web application
          developed by Notion Labs Inc. It offers organizational tools including
          task management, project tracking, to-do lists, and bookmarking.
        </p>
      </div>
      <div className="m-2">
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
