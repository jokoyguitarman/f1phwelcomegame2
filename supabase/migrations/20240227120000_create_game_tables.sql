-- Factor1 Game: game sessions (one per game run)
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  host_socket_id text
);

comment on table public.game_sessions is 'One row per game run; created when host starts the game.';

-- Factor1 Game: players per session (one pseudonym per user per game)
create table if not exists public.game_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_session_id uuid references public.game_sessions(id) on delete set null,
  pseudonym text not null,
  team_id int not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_session_id)
);

comment on table public.game_players is 'One row per user per game session; pseudonym and team for the entire game.';
create index if not exists idx_game_players_user_session on public.game_players(user_id, game_session_id);

-- Factor1 Game: final results per session (optional history)
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  game_session_id uuid not null references public.game_sessions(id) on delete cascade,
  scores jsonb not null default '{}',
  round_summary jsonb,
  created_at timestamptz not null default now()
);

comment on table public.game_results is 'Final scores and optional round summary per game session.';

-- RLS: disable so only the backend (service role) accesses these tables.
alter table public.game_sessions enable row level security;
alter table public.game_players enable row level security;
alter table public.game_results enable row level security;

create policy "Service role only: game_sessions"
  on public.game_sessions for all
  using (false)
  with check (false);

create policy "Service role only: game_players"
  on public.game_players for all
  using (false)
  with check (false);

create policy "Service role only: game_results"
  on public.game_results for all
  using (false)
  with check (false);
