# Factor1 Team Icebreaker Game

A real-time multiplayer browser game for team onboarding: Zoom Spy, 4 Pics 1 Word (Factor1 values), and Pass the Pen.

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
- Open `http://localhost:5173/host` in another tab — click "Set host" then "Start Game" (min 10 players).
- Host uses **Next Question** to advance Zoom Spy / 4 Pics, and **End Round** to move to the next round. **Pass the Pen** advances automatically on correct guess or time.

## Images

- **Zoom Spy:** Add image sets under `client/public/images/zoom-spy/q1/` … `q6/` with `stage1.jpg` … `stage5.jpg` per set.
- **4 Pics:** Add images under `client/public/images/four-pics/` (e.g. `fp1-a.jpg` … `fp1-d.jpg` per value).

See `factor1-game-build-plan.md` for full content and rules.

## Env

- `PORT` — server port (default 3001).

## Deploy

Run the server on Railway, Render, or Fly.io (WebSockets supported). Build the client with `npm run build` and serve the `client/dist` folder.

### Vercel (client) + Render (server)

1. Deploy the **server** to Render (e.g. from `server/` with build command `npm install`, start command `npm start`). Note the URL (e.g. `https://f1-ph-welcome-game.onrender.com`).
2. Deploy the **client** to Vercel: connect the repo, set **Root Directory** to `client`, build command `npm run build`, output directory `dist`.
3. In Vercel, add an **Environment Variable**: `VITE_SOCKET_URL` = `https://f1-ph-welcome-game.onrender.com` (no trailing slash). Redeploy so the build picks it up.
4. Open the Vercel app URL to play; the client will connect to the Render server for the game.
