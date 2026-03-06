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

Run the server on Railway, Render, or Fly.io (WebSockets supported). Build the client with `npm run build` and serve the `client/dist` folder (or host static files and point API/socket to the server URL).
