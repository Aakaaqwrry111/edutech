create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists skill_nodes (
  id text primary key,
  title text not null,
  prerequisite_id text references skill_nodes(id),
  completed_by uuid[] not null default '{}'
);
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  node_id text references skill_nodes(id),
  score numeric not null,
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  node_id text references skill_nodes(id),
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  study_pack_id uuid,
  share_token text unique,
  votes integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  parent_comment_id uuid references community_comments(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  body text not null,
  votes integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists profiles_leaderboard_idx on profiles (total_xp desc, current_streak desc);
