# Factor1 Team Icebreaker Game

A real-time multiplayer browser game for team onboarding: **Draw Saurus** (drawing relay, teams guess the word).

## Stack

- **Client:** React, Vite, Tailwind CSS, Socket.IO client
- **Server:** Node.js, Express, Socket.IO

## Run locally

### 1. Server

```bash
cd server
npm install
npm run dev
```

Runs at `http://localhost:3001`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Runs at `http://localhost:5173` and proxies Socket.IO to the server.

### 3. Play

- Open `http://localhost:5173` — join with a display name (and optional email).
- Open `http://localhost:5173/host` in another tab — click "Set host" then "Start Game" (min 1 player for testing).
- Host uses **Next Question** to skip to the next word/team, and **End Round** to finish the game and show results. Draw Saurus advances automatically on correct guess or when time runs out.

See `factor1-game-build-plan.md` for full rules (Pass the Pen / Draw Saurus section).

## Env

- `PORT` — server port (default 3001).

## Deploy

Run the server on Railway, Render, or Fly.io (WebSockets supported). Build the client with `npm run build` and serve the `client/dist` folder.

### Vercel (client) + Render (server)

1. Deploy the **server** to Render (e.g. from `server/` with build command `npm install`, start command `npm start`). Note the URL (e.g. `https://f1-ph-welcome-game.onrender.com`).
2. Deploy the **client** to Vercel:
   - **Root Directory:** set to **`client`** (required — the app lives in this folder).
   - Build command: `npm run build`. Output directory: `dist`.
   - Add env var **`VITE_SOCKET_URL`** = `https://f1-ph-welcome-game.onrender.com` (no trailing slash).
3. Redeploy the client after saving the env var so the build picks it up.
4. Open the Vercel app URL to play; the client will connect to the Render server.
