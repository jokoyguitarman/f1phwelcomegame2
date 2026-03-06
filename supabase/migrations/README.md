# Supabase migrations

Run these in order (by filename) via Supabase CLI or paste the SQL into the [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard).

## CLI

```bash
# link project first (one-time)
npx supabase link --project-ref YOUR_PROJECT_REF

# run migrations
npx supabase db push
```

Or run a single file:

```bash
npx supabase db execute -f supabase/migrations/20240227120000_create_game_tables.sql
```

## Tables

- **game_sessions** — One row when the host starts a game. `id` is used as `game_session_id` for players.
- **game_players** — One row per user per session: `user_id` (from Auth), `game_session_id`, `pseudonym`, `team_id`. Unique on `(user_id, game_session_id)`.
- **game_results** — Optional: final `scores` (jsonb) and `round_summary` per session.

RLS is enabled with policies that deny all; the backend uses the **service role** key and bypasses RLS.
