import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseRest } from "@/lib/supabase";
export async function POST(request: Request) {
  const { node_id, author_id, title, body, study_pack_id } = await request.json();
  const share_token = study_pack_id ? randomBytes(24).toString("base64url") : null;
  try {
    const posts = await supabaseRest<unknown[]>("community_posts", { method: "POST", body: JSON.stringify({ node_id, author_id, title, body, study_pack_id, share_token }) });
    return NextResponse.json({ post: posts[0], share_url: share_token ? `/share/${share_token}` : null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Post creation failed" }, { status: 500 });
  }
}
