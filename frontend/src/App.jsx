import { useState, useEffect, useMemo } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── API ───────────────────────────────────────────────────────────────────────
async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const raw = await res.json();

  console.log(raw);

  // Handle {questions:[...]}, {data:[...]}, or bare array
  const data = Array.isArray(raw) ? raw : (raw.questions ?? raw.data ?? Object.values(raw));

  return data.map(q => ({
    id:     q.id,
    name:   q.name,
    link:   q.link,
    topics: Array.isArray(q.topics) ? q.topics.filter(Boolean) : [],
  }));
}

// ─── LOCAL PERSISTENCE ─────────────────────────────────────────────────────────
const LS_KEY = "leetrevise_local";

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? {}; }
  catch { return {}; }
}
function saveLocal(map) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {}
}

const DEFAULT_LOCAL = { status: "Unsolved", difficulty: "Medium", notes: "", lastReviewed: null };

function mergeWithLocal(questions, localMap) {
  return questions.map(q => ({
    ...q,
    ...(localMap[q.id] ?? DEFAULT_LOCAL),
  }));
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getRevisionScore(q) {
  if (q.status === "Unsolved") return 100;
  if (q.status === "Review")   return 80;
  if (!q.lastReviewed)         return 60;
  return Math.floor((Date.now() - new Date(q.lastReviewed)) / 86400000);
}
function getProblemOfDay(questions) {
  if (!questions.length) return null;
  return [...questions].sort((a, b) => getRevisionScore(b) - getRevisionScore(a))[0];
}

// ─── COLOR MAPS ────────────────────────────────────────────────────────────────
const DIFF_CLS = {
  Easy:   "text-teal-300   bg-teal-400/10   border border-teal-400/30",
  Medium: "text-yellow-300 bg-yellow-400/10 border border-yellow-400/30",
  Hard:   "text-rose-400   bg-rose-500/10   border border-rose-400/30",
};
const STATUS_CLS = {
  Solved:   "text-teal-300   bg-teal-400/10   border border-teal-400/30",
  Review:   "text-yellow-300 bg-yellow-400/10 border border-yellow-400/30",
  Unsolved: "text-slate-400  bg-slate-700/40  border border-slate-600/50",
};
const STATUS_DOT = {
  Solved:   "bg-teal-400",
  Review:   "bg-yellow-400",
  Unsolved: "bg-slate-500",
};
const STATUS_BTN_ACTIVE = {
  Solved:   "border-teal-400/50   bg-teal-400/10   text-teal-300",
  Review:   "border-yellow-400/50 bg-yellow-400/10 text-yellow-300",
  Unsolved: "border-slate-500/50  bg-slate-700/30  text-slate-300",
};
const DIFF_BTN_ACTIVE = {
  Easy:   "border-teal-400/50   bg-teal-400/10   text-teal-300",
  Medium: "border-yellow-400/50 bg-yellow-400/10 text-yellow-300",
  Hard:   "border-rose-400/50   bg-rose-500/10   text-rose-400",
};

// ─── BADGE ─────────────────────────────────────────────────────────────────────
function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
function DiffBadge({ d }) {
  return d ? <Badge className={DIFF_CLS[d]}>{d}</Badge> : null;
}
function StatusBadge({ s }) {
  return (
    <Badge className={STATUS_CLS[s]}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
      {s}
    </Badge>
  );
}
function TagBadge({ tag }) {
  return <Badge className="text-slate-300 bg-slate-700/60 border border-slate-600/50">{tag}</Badge>;
}

// ─── QUESTION CARD ─────────────────────────────────────────────────────────────
function QuestionCard({ q, onClick, isPotd }) {
  return (
    <div
      onClick={() => onClick(q)}
      className={`group flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all duration-150
        ${isPotd
          ? "bg-blue-900/30 border-blue-500/50 hover:border-blue-400"
          : "bg-slate-800/60 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800"}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-slate-100 font-semibold text-sm mb-1.5 truncate group-hover:text-white transition-colors">
          {q.name}
          {isPotd && <span className="ml-2 text-xs text-blue-400 font-normal">🔥 Today</span>}
        </p>
        <div className="flex flex-wrap gap-1">
          {q.topics.slice(0, 4).map(t => <TagBadge key={t} tag={t} />)}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {q.difficulty && <DiffBadge d={q.difficulty} />}
        <StatusBadge s={q.status} />
      </div>
    </div>
  );
}

// ─── QUESTION MODAL ────────────────────────────────────────────────────────────
function QuestionModal({ q, onClose, onSaveLocal }) {
  const [status,     setStatus]     = useState(q.status);
  const [difficulty, setDifficulty] = useState(q.difficulty ?? "Medium");
  const [notes,      setNotes]      = useState(q.notes ?? "");
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSaveLocal(q.id, { status, difficulty, notes, lastReviewed: new Date().toISOString().split("T")[0] });
    setSaving(false);
    onClose();
  };

  const btnBase = "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all";
  const btnInactive = "text-slate-400 border-slate-700 bg-transparent hover:border-slate-500 hover:text-slate-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-8 max-h-[88vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors text-lg leading-none"
        >×</button>

        <h2 className="text-white text-xl font-bold mb-1 pr-8">{q.name}</h2>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {q.topics.map(t => <TagBadge key={t} tag={t} />)}
        </div>

        <a
          href={q.link} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-semibold mb-6 transition-colors"
        >
          Open Problem ↗
        </a>

        <div className="mb-5">
          <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase mb-2">Difficulty <span className="text-slate-600 normal-case font-normal tracking-normal">(saved locally)</span></p>
          <div className="flex gap-2 flex-wrap">
            {["Easy", "Medium", "Hard"].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`${btnBase} ${difficulty === d ? DIFF_BTN_ACTIVE[d] : btnInactive}`}
              >{d}</button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase mb-2">Status <span className="text-slate-600 normal-case font-normal tracking-normal">(saved locally)</span></p>
          <div className="flex gap-2 flex-wrap">
            {["Solved", "Review", "Unsolved"].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`${btnBase} ${status === s ? STATUS_BTN_ACTIVE[s] : btnInactive}`}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase mb-2">Notes / Approach <span className="text-slate-600 normal-case font-normal tracking-normal">(saved locally)</span></p>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Write your approach, key insights, time/space complexity..."
            className="w-full min-h-[130px] bg-slate-800 border border-slate-600 rounded-xl p-3 text-slate-100 text-sm font-mono leading-relaxed outline-none resize-y focus:border-blue-500/60 transition-colors placeholder:text-slate-600"
          />
        </div>

        {q.lastReviewed && (
          <p className="text-slate-500 text-xs mb-5">
            Last reviewed: {new Date(q.lastReviewed).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}

        <button
          onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── PROBLEM OF THE DAY ────────────────────────────────────────────────────────
function ProblemOfDay({ question, onClick }) {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleSub = async e => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 500));
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  if (!question) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-900/50 via-slate-800/60 to-indigo-900/40 p-6 mb-8">
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-blue-400 text-[11px] font-extrabold tracking-[0.14em] uppercase mb-2">🔥 Problem of the Day</p>
          <h3 className="text-white text-lg font-bold mb-2.5">{question.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {question.difficulty && <DiffBadge d={question.difficulty} />}
            {question.topics.map(t => <TagBadge key={t} tag={t} />)}
          </div>
        </div>
        <button
          onClick={() => onClick(question)}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/40"
        >
          Solve Now →
        </button>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-700/50">
        <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase mb-2">📧 Daily email reminder</p>
        <form onSubmit={handleSub} className="flex gap-2 flex-wrap">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900/70 border border-slate-600 rounded-lg text-slate-100 text-sm outline-none focus:border-blue-500/60 placeholder:text-slate-600 transition-colors"
          />
          <button type="submit"
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              sent
                ? "bg-teal-400/10 border-teal-400/30 text-teal-300"
                : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500"
            }`}
          >{sent ? "✓ Subscribed!" : "Subscribe"}</button>
        </form>
      </div>
    </div>
  );
}

// ─── STATS BAR ─────────────────────────────────────────────────────────────────
function StatsBar({ questions }) {
  const solved   = questions.filter(q => q.status === "Solved").length;
  const review   = questions.filter(q => q.status === "Review").length;
  const unsolved = questions.filter(q => q.status === "Unsolved").length;
  const pct      = Math.round((solved / (questions.length || 1)) * 100);

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {[
        { label: "Total",    value: questions.length, cls: "text-blue-400" },
        { label: "Solved",   value: solved,           cls: "text-teal-400" },
        { label: "Review",   value: review,           cls: "text-yellow-400" },
        { label: "Unsolved", value: unsolved,         cls: "text-rose-400" },
        { label: "Progress", value: `${pct}%`,        cls: "text-violet-400" },
      ].map(({ label, value, cls }) => (
        <div key={label} className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 text-center">
          <p className={`text-2xl font-extrabold mb-0.5 tabular-nums ${cls}`}>{value}</p>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── FLASHCARD VIEW ────────────────────────────────────────────────────────────
function FlashcardView({ questions }) {
  const [idx,     setIdx]  = useState(0);
  const [flipped, setFlip] = useState(false);

  const q    = questions[idx % (questions.length || 1)];
  const next = () => { setFlip(false); setIdx(i => i + 1); };

  const ratings = [
    { label: "Again", cls: "text-rose-400    bg-rose-500/10    border-rose-400/30    hover:bg-rose-500/20" },
    { label: "Hard",  cls: "text-yellow-300  bg-yellow-400/10  border-yellow-400/30  hover:bg-yellow-400/20" },
    { label: "Good",  cls: "text-blue-400    bg-blue-500/10    border-blue-400/30    hover:bg-blue-500/20" },
    { label: "Easy",  cls: "text-teal-300    bg-teal-400/10    border-teal-400/30    hover:bg-teal-400/20" },
  ];

  if (!questions.length) {
    return <div className="flex items-center justify-center py-20 text-slate-500 text-sm">No questions match your filters.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <p className="text-slate-400 text-sm tabular-nums">{(idx % questions.length) + 1} / {questions.length}</p>

      <div
        onClick={() => setFlip(f => !f)}
        className="w-full max-w-xl min-h-[280px] bg-slate-800/70 border border-slate-700 hover:border-slate-500 rounded-2xl p-10 cursor-pointer transition-all duration-150 flex flex-col justify-center select-none"
      >
        {!flipped ? (
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-4">{q.name}</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {q.difficulty && <DiffBadge d={q.difficulty} />}
              {q.topics.map(t => <TagBadge key={t} tag={t} />)}
            </div>
            <p className="text-slate-500 text-sm">Click to reveal your notes →</p>
          </div>
        ) : (
          <div>
            <p className="text-blue-400 text-[11px] font-bold tracking-widest uppercase mb-3">Your Notes / Approach</p>
            <p className="text-slate-100 text-base leading-relaxed font-mono">
              {q.notes || "No notes yet — click 'Solve Now' to add your approach."}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {ratings.map(({ label, cls }) => (
          <button key={label} onClick={next}
            className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${cls}`}
          >{label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [questions,    setQuestions]    = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDiff,   setFilterDiff]   = useState("All");
  const [filterTag,    setFilterTag]    = useState("All");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [view,         setView]         = useState("list");

  // Fetch from backend on mount, merge with localStorage immediately
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchQuestions();
        const localMap = loadLocal();
        setQuestions(mergeWithLocal(data, localMap));
      } catch (e) {
        setError(`Could not reach backend at ${API_BASE}. Is your server running? (${e.message})`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allTopics = useMemo(
    () => ["All", ...Array.from(new Set(questions.flatMap(q => q.topics))).sort()],
    [questions]
  );

  const filtered = useMemo(() => questions.filter(q => {
    const mQ = q.name.toLowerCase().includes(search.toLowerCase());
    const mS = filterStatus === "All" || q.status    === filterStatus;
    const mD = filterDiff   === "All" || q.difficulty === filterDiff;
    const mT = filterTag    === "All" || q.topics.includes(filterTag);
    return mQ && mS && mD && mT;
  }), [questions, search, filterStatus, filterDiff, filterTag]);

  const potd     = useMemo(() => getProblemOfDay(questions), [questions]);
  const progress = Math.round((questions.filter(q => q.status === "Solved").length / (questions.length || 1)) * 100);

  // Update a question's local fields, persist to localStorage
  const handleSaveLocal = (id, fields) => {
    setQuestions(qs => {
      const updated = qs.map(q =>
        q.id === id ? { ...q, ...fields } : q
      );
      // Persist only the local fields to localStorage
      const localMap = Object.fromEntries(
        updated.map(q => [q.id, {
          status:       q.status,
          difficulty:   q.difficulty,
          notes:        q.notes,
          lastReviewed: q.lastReviewed,
        }])
      );
      saveLocal(localMap);
      return updated;
    });
  };

  const navBtn = (v, label) => (
    <button key={v} onClick={() => setView(v)}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
        view === v ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
      }`}
    >{label}</button>
  );

  const selectCls = "px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 outline-none hover:border-slate-500 focus:border-slate-500 transition-colors cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="font-extrabold text-white tracking-tight text-[15px]">LeetRevise</span>
            {!loading && !error && (
              <Badge className="text-teal-300 bg-teal-400/10 border border-teal-400/30">
                ● {questions.length} questions loaded
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {navBtn("list",      "📋 List")}
            {navBtn("flashcard", "🃏 Flashcard")}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-5 px-4 py-4 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-300 text-sm leading-relaxed">
            <p className="font-bold mb-1">⚠️ Backend unreachable</p>
            <p className="text-rose-400/80">{error}</p>
            <p className="mt-2 text-slate-500 text-xs">Make sure your server is running at <code className="font-mono bg-slate-800 px-1 rounded">{API_BASE}</code> and CORS is enabled.</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-slate-500 text-sm">Fetching questions from {API_BASE}…</p>
          </div>
        ) : !error && (
          <>
            <ProblemOfDay question={potd} onClick={setSelected} />
            <StatsBar questions={questions} />

            {/* Progress bar */}
            <div className="mb-6 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* ── FILTERS ── */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="flex-1 min-w-[180px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-500 transition-colors"
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
                {["All", "Solved", "Review", "Unsolved"].map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={filterDiff}   onChange={e => setFilterDiff(e.target.value)}   className={selectCls}>
                {["All", "Easy", "Medium", "Hard"].map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={filterTag}    onChange={e => setFilterTag(e.target.value)}    className={selectCls}>
                {allTopics.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <p className="text-slate-500 text-xs mb-3 tabular-nums">
              {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* ── VIEWS ── */}
            {view === "list" ? (
              <div className="flex flex-col gap-2">
                {filtered.map(q => (
                  <QuestionCard key={q.id} q={q} onClick={setSelected} isPotd={potd?.id === q.id} />
                ))}
                {!filtered.length && (
                  <div className="text-center text-slate-500 py-16 text-sm">No questions match your filters.</div>
                )}
              </div>
            ) : (
              <FlashcardView questions={filtered} />
            )}
          </>
        )}
      </main>

      {selected && (
        <QuestionModal
          q={selected}
          onClose={() => setSelected(null)}
          onSaveLocal={handleSaveLocal}
        />
      )}
    </div>
  );
}