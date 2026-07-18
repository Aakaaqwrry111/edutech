import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase";
import type { LeaderboardUser } from "@/lib/types";
export async function GET() {
  try {
    const data = await supabaseRest<Omit<LeaderboardUser, "rank">[]>("profiles?select=id,handle,total_xp,current_streak&order=total_xp.desc,current_streak.desc&limit=50");
    return NextResponse.json({ leaderboard: data.map((user, index) => ({ ...user, rank: index + 1 })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Leaderboard query failed" }, { status: 500 });
  }
}
