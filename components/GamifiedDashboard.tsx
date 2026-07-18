"use client";
import { Flame, Lock, Trophy, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { LeaderboardUser, Quest, SkillNode, TimerState } from "@/lib/types";

const initialQuests: Quest[] = [
  { id: "pomodoro", label: "Complete 1 Pomodoro session", xp: 25, completed: false },
  { id: "flashcards", label: "Review 10 flashcards", xp: 15, completed: false },
  { id: "quiz", label: "Score 90% on a module quiz", xp: 40, completed: false },
];
const initialNodes: SkillNode[] = [
  { id: "foundations", title: "Foundations", subject: "Math", completed: true, quizScore: 96, x: 10, y: 44 },
  { id: "algebra", title: "Algebra", subject: "Math", prerequisiteId: "foundations", completed: true, quizScore: 91, x: 35, y: 28 },
  { id: "trig", title: "Trigonometry", subject: "Math", prerequisiteId: "algebra", completed: false, quizScore: 78, x: 60, y: 48 },
  { id: "calculus", title: "Calculus", subject: "Math", prerequisiteId: "trig", completed: false, x: 84, y: 30 },
];
const leaderboard: LeaderboardUser[] = [
  { id: "1", handle: "NovaNerd", total_xp: 12480, current_streak: 34, rank: 1 },
  { id: "2", handle: "QuizKage", total_xp: 11900, current_streak: 28, rank: 2 },
  { id: "3", handle: "You", total_xp: 8420, current_streak: 12, rank: 3 },
];

export function GamifiedDashboard() {
  const [quests, setQuests] = useState(initialQuests);
  const [timerState, setTimerState] = useState<TimerState>("IDLE");
  const [seconds, setSeconds] = useState(25 * 60);
  const [focusInterrupted, setFocusInterrupted] = useState(false);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const xp = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xp, 8420);
  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXp = level * 1000;
  const progress = Math.round(((xp % 1000) / 1000) * 100);
  const nodes = useMemo(() => initialNodes, []);

  const toggleQuest = (id: string) => setQuests((items) => items.map((q) => (q.id === id ? { ...q, completed: !q.completed } : q)));
  const startTimer = () => { if (interval.current) clearInterval(interval.current); setTimerState("RUNNING"); interval.current = setInterval(() => setSeconds((s) => { if (s <= 1) { clearInterval(interval.current!); setTimerState("COMPLETED"); return 0; } return s - 1; }), 1000); };
  const pauseForFocus = () => { if (interval.current) clearInterval(interval.current); setTimerState("PAUSED"); setFocusInterrupted(true); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
    <nav className="rounded-3xl border border-cyan-400/30 bg-slate-950/70 p-5 shadow-glow backdrop-blur"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[.4em] text-cyan-200">Lvl UP Command Center</p><h1 className="text-3xl font-black text-white">Level {level} Scholar</h1></div><div className="min-w-72 flex-1 max-w-xl"><div className="mb-2 flex justify-between text-sm"><span>{xp} XP</span><span>Next: {nextLevelXp} XP</span></div><div className="h-4 rounded-full bg-slate-800"><div className="h-4 rounded-full bg-gradient-to-r from-cyan-300 via-plasma to-gold" style={{ width: `${progress}%` }} /></div></div><div className="flex items-center gap-2 rounded-2xl border border-gold/40 px-4 py-3 text-gold shadow-gold"><Flame /> 12 Day Streak</div></div></nav>
    <section className="grid gap-6 lg:grid-cols-[320px_1fr_320px]"><aside className="space-y-6"><div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Zap className="text-gold" /> Today&apos;s Quest Log</h2>{quests.map((q) => <label key={q.id} className="mb-3 flex cursor-pointer items-center justify-between rounded-2xl bg-white/5 p-3"><span><input className="mr-3" type="checkbox" checked={q.completed} onChange={() => toggleQuest(q.id)} />{q.label}</span><b className="text-gold">+{q.xp}</b></label>)}</div><div className="rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-5 text-center"><h2 className="text-xl font-bold">Focus Timer</h2><div className="mx-auto my-6 grid h-44 w-44 place-items-center rounded-full border-8 border-cyan-300/70 text-4xl font-black shadow-glow">{mm}:{ss}</div><p className="mb-4 text-cyan-200">{timerState}</p><div className="flex justify-center gap-2"><button onClick={startTimer} className="rounded-xl bg-cyan-300 px-4 py-2 font-bold text-slate-950">Start</button><button onClick={pauseForFocus} className="rounded-xl bg-plasma px-4 py-2 font-bold">Sim Distract</button></div></div></aside>
    <section className="relative min-h-[560px] rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-6"><h2 className="mb-2 text-2xl font-black">Skill Tree Workspace</h2><p className="text-slate-300">Unlock nodes by scoring at least 90% on prerequisite AI-generated quizzes.</p><svg className="absolute inset-0 h-full w-full" aria-hidden>{nodes.slice(1).map((node) => { const pre = nodes.find((n) => n.id === node.prerequisiteId)!; return <line key={node.id} x1={`${pre.x}%`} y1={`${pre.y}%`} x2={`${node.x}%`} y2={`${node.y}%`} stroke="rgba(32,247,255,.35)" strokeWidth="4" />; })}</svg>{nodes.map((node) => { const pre = node.prerequisiteId ? nodes.find((n) => n.id === node.prerequisiteId) : undefined; const locked = Boolean(pre && (!pre.completed || (pre.quizScore ?? 0) < 90)); return <button key={node.id} disabled={locked} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-5 text-left shadow-glow ${locked ? "border-slate-600 bg-slate-900 text-slate-500" : "border-cyan-300 bg-cyan-950/80 text-white"}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}><div className="flex items-center gap-2 text-lg font-black">{locked && <Lock size={18} />}{node.title}</div><p>{node.subject} • {node.completed ? "Completed" : "In progress"}</p><p className="text-sm text-gold">Quiz: {node.quizScore ?? "locked"}</p></button>; })}</section>
    <aside className="space-y-6"><div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Trophy className="text-gold" /> Leaderboard</h2>{leaderboard.map((u) => <div key={u.id} className="mb-3 flex items-center justify-between rounded-2xl bg-white/5 p-3"><span>#{u.rank} {u.handle}</span><span className="text-cyan-200">{u.total_xp} XP</span></div>)}</div><div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"><h2 className="text-xl font-bold">Community Threads</h2><p className="mt-3 text-slate-300">Node-scoped Reddit-style posts, nested replies, votes, note sharing, and encrypted study-pack links are backed by Supabase tables.</p></div></aside></section>{focusInterrupted && <div className="fixed inset-0 z-50 grid place-items-center bg-red-950/80 backdrop-blur"><div className="rounded-3xl border border-red-300 bg-slate-950 p-10 text-center shadow-2xl"><h2 className="text-4xl font-black text-red-200">Get Locked Back In</h2><p className="mt-3 text-lg">Focus verification paused the timer and froze XP gains.</p><button onClick={() => setFocusInterrupted(false)} className="mt-6 rounded-xl bg-red-300 px-6 py-3 font-black text-red-950">I&apos;m Focused</button></div></div>}</main>;
}
