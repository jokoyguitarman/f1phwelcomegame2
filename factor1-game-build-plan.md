# Factor1 Team Icebreaker Game — Cursor Build Plan

## Project Overview

Build a real-time multiplayer browser game for Factor1's team onboarding events. The game accommodates ~55 players (52 existing + 3–5 newbies) split into 5 teams. No user accounts required. Players join via a shared link, pick a pseudonym, and are auto-assigned to a balanced team. One designated host controls the game from a separate dashboard.

The session lasts ~30 minutes and consists of three game rounds:
1. **Zoom Spy** — progressively revealed images, teams guess what it is
2. **4 Pics 1 Word (Factor1 Edition)** — four images representing a company value, teams guess the word
3. **Pass the Pen** — collaborative team drawing relay, other teams guess the word

---

## Tech Stack (Recommended)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast setup, component-friendly |
| Realtime | Socket.IO | Easiest WebSocket abstraction for game state sync |
| Backend | Node.js + Express | Pairs naturally with Socket.IO |
| Styling | Tailwind CSS | Utility-first, fast to iterate |
| Fonts | Syne (headings) + DM Sans (body) — via Google Fonts | Distinctive, modern feel |
| Canvas (Round 3) | HTML5 Canvas API | Native, no extra lib needed |
| Hosting | Railway / Render / Fly.io | One-click Node deploys with WebSocket support |

> **Note:** Do NOT use Vercel/Netlify for this — they don't support persistent WebSocket connections well. Use Railway, Render, or Fly.io.

---

## Color Palette & Branding

```css
--f1-orange: #FF5C1A;      /* Primary brand color */
--f1-teal:   #00C4B4;
--f1-yellow: #FFD600;
--f1-purple: #7C3AED;
--f1-pink:   #F43F8E;
--f1-dark:   #0A0A0F;      /* Background */
--f1-card:   #13131A;      /* Card/panel background */

/* Team colors — one per team */
--team-1: #FF5C1A;   /* Blaze */
--team-2: #00C4B4;   /* Surge */
--team-3: #FFD600;   /* Volt */
--team-4: #7C3AED;   /* Nova */
--team-5: #F43F8E;   /* Pulse */
```

Team names: **Blaze, Surge, Volt, Nova, Pulse**

---

## Project Structure

```
factor1-game/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── socket.js              # Socket.IO client singleton
│   │   ├── screens/
│   │   │   ├── JoinScreen.jsx
│   │   │   ├── LobbyScreen.jsx
│   │   │   ├── GameScreen.jsx     # Wrapper that renders active round
│   │   │   └── ResultsScreen.jsx
│   │   ├── rounds/
│   │   │   ├── ZoomSpy.jsx        # Round 1
│   │   │   ├── FourPicsOneWord.jsx # Round 2
│   │   │   └── PassThePen.jsx     # Round 3
│   │   ├── host/
│   │   │   └── HostDashboard.jsx
│   │   └── components/
│   │       ├── Scoreboard.jsx
│   │       ├── TeamBadge.jsx
│   │       ├── Timer.jsx
│   │       └── PlayerChip.jsx
│   └── public/
│       └── images/
│           ├── zoom-spy/          # Zoom spy image sets (see content section)
│           └── four-pics/         # 4 pics sets (see content section)
│
└── server/
    ├── index.js                   # Express + Socket.IO server
    ├── gameState.js               # In-memory game state manager
    ├── teamAssignment.js          # Fair team distribution logic
    └── rounds/
        ├── zoomSpy.js
        ├── fourPics.js
        └── passThePen.js
```

---

## Screens & User Flows

### 1. Join Screen (`/`)

**URL:** `https://yourdomain.com/` (everyone gets this same link)

**UI Elements:**
- Factor1 logo + tagline: *"Let's play."*
- Heading: *"Enter the game"*
- Input: **Pseudonym** (required, max 20 chars)
- Input: **Email** (optional) — label: *"Get a rejoin link in case you close this tab"*
- Button: **Join the Game**
- Small text at bottom: `"Are you the host? →"` (links to `/host`)

**On submit:**
- Emit `player:join` socket event with `{ pseudonym, email }`
- Server responds with `{ playerId, teamId, teamName, teamColor }`
- Redirect to `/lobby`

**Validation:**
- Pseudonym cannot be empty
- Pseudonym must be unique (server enforces; returns error if taken)
- Show inline error states on the input fields

---

### 2. Lobby Screen (`/lobby`)

**UI Elements:**
- Header: Logo left, player's team badge right (color-coded pill: e.g. "⬤ Team Blaze")
- Left panel: Grid of all 5 team cards, each showing team name, color stripe, and player chips (pseudonyms) currently in that team
- Right panel: "Waiting for host to start the game..." with animated pulse ring + player count (e.g. "43 / 55 joined")
- If email was provided, show: *"We've noted your email. You can rejoin at any time."*

**Realtime updates:**
- When new players join, their chip appears in the correct team card in real time
- When host starts game, all clients navigate to the game screen

---

### 3. Host Dashboard (`/host`)

**Access:** Via the small "Are you the host?" link on the join screen, or by navigating to `/host` directly. No password needed (keep it simple), but consider adding a one-time code you share privately in Slack.

**UI Sections:**

**Lobby Controls:**
- Live player count per team
- Button: **Start Game** (enabled once at least 10 players have joined, or manually override)
- Toggle: show/hide player list

**In-Game Controls (shown during gameplay):**
- Current round indicator + question number
- Button: **Next Question** (advances to next image/question)
- Button: **Skip** (skip a question without awarding points)
- Timer display (mirrors what players see)
- Live answer feed: as teams submit answers, show them here in real time
- Button to manually **Award/Revoke points** for a team
- Button: **End Round** → moves to next round
- **For Round 3 (Pass the Pen):** Word display (only the host and drawing team see the word), button to confirm a correct guess

**Scoreboard Panel:**
- Always visible on the right: team scores, sorted by rank
- "Crown" emoji next to the leading team

---

### 4. Game Screen (`/game`)

This is a wrapper screen. It renders the active round component based on game state.

**Persistent elements across all rounds:**
- Top bar: Round name + round number (e.g. "Round 1 of 3 — Zoom Spy"), Factor1 logo
- Bottom bar: Live team scoreboard (compact horizontal strip)
- Team badge in corner (player's own team, always highlighted)

---

### 5. Results Screen

Shown after all 3 rounds complete.

**UI Elements:**
- Confetti animation on load
- Podium display: 1st, 2nd, 3rd place teams (with their color and team name)
- Full scoreboard: all 5 teams ranked
- "🎉 Thanks for playing, Factor1!" message
- Newbie shoutout section: list of newbie pseudonyms with a "Welcome to the team!" message

---

## Round Specifications

---

### Round 1: Zoom Spy

**Concept:** A heavily cropped/zoomed image is shown. Every few seconds, it zooms out to reveal more. Teams race to guess the subject first.

**Flow per question:**
1. Host clicks **Next Question**
2. All clients receive the image set for this question
3. Image reveals on a countdown schedule:
   - Stage 1 (most zoomed in): show for **30 seconds**
   - Stage 2 (partially revealed): show for **20 seconds**
   - Stage 3 (more revealed): show for **15 seconds**
   - Stage 4 (almost full): show for **10 seconds**
   - Stage 5 (full image): show for **5 seconds**, then lock answers
4. At any point before lock, a team can type and submit their guess
5. **First team to submit the correct answer wins the points for that question**
6. Points scale with how early they guess:
   - Correct at Stage 1 → 5 points
   - Stage 2 → 4 points
   - Stage 3 → 3 points
   - Stage 4 → 2 points
   - Stage 5 → 1 point
7. Once a team submits a correct answer, the image fully reveals for everyone and the round shows who got it
8. Wrong guesses are shown to the host only (not to other players)
9. Each team gets **1 guess per stage** (to prevent spam)

**Image implementation:**
- Store image sets as folders: `public/images/zoom-spy/q1/stage1.jpg`, `stage2.jpg`, etc.
- Use CSS `transform: scale()` + `overflow: hidden` for the zoom effect, or pre-crop images in Photoshop/Figma
- Pre-cropped is more reliable — 5 crops per image, each less zoomed than the last

**UI details:**
- The image fills most of the screen
- Timer bar animates across the top (shrinks from full to empty per stage)
- Stage indicator: "Stage 1 of 5" shown subtly
- Answer input: a single text field + submit button fixed to the bottom
- When correct answer comes in: big celebration overlay, "TEAM SURGE GOT IT! 🎉 +5 pts", then auto-advance after 3s

**Suggested number of questions:** 6–8 (keeps pace fast)

**Placeholder image ideas (swap these with your own):**
- A keyboard close-up → reveal: mechanical keyboard
- Coffee beans macro → reveal: latte art
- Fabric texture → reveal: office chair
- Circuit board → reveal: smartphone
- Blurred logo → reveal: a well-known brand
- Close-up of an eye → reveal: a famous painting

**Image answer keys (configure in `server/rounds/zoomSpy.js`):**
```js
const zoomSpyQuestions = [
  { id: 'q1', answer: 'keyboard', folder: 'zoom-spy/q1', stages: 5 },
  { id: 'q2', answer: 'coffee', folder: 'zoom-spy/q2', stages: 5 },
  // etc.
];
```

---

### Round 2: 4 Pics 1 Word — Factor1 Edition

**Concept:** Four images that collectively represent one of Factor1's core values. Teams type the word.

**Factor1 Core Values (official — use these descriptions for the round):**

| Value | Official description | Icon / colour note |
|-------|----------------------|--------------------|
| **Empowerment** | Delegation with guidance and taking ownership of your role. | Orange diamond, star icon |
| **Honesty** | Being truthful, honest and staying true to your word. | Light green diamond, magnifying glass |
| **Courage** | Being brave and resilient in the face of challenges and growth opportunities with open communication. | Purple diamond, upward bar graph |
| **Fairness** | Believe in fair and equal treatment of all without bias. | Pink diamond, lightbulb |
| **Inclusivity** | An organisational culture with collaborative efforts to achieve unity. | Teal diamond, document/clipboard with checklist |
| **Flexibility** | Managing personal and work commitments whilst considering balanced results for all. | Blue diamond, artist palette |
| **Respect** | Treating others with consideration, dignity and empathy. | Violet/dark pink diamond, handshake |

Use 5–7 of these values for the round. When revealing the answer, show the value name and the **official description** above as the teachable moment.

**Image ideas per value (4 pics each; source from Unsplash/Pexels):**
1. **EMPOWERMENT** — person lifting weights, someone on a stage with a mic, a key unlocking a door, a plant growing through concrete
2. **HONESTY** — a mirror reflection, an open book, a handshake, a magnifying glass on text
3. **COURAGE** — a person jumping off a cliff into water, a lion, a firefighter, raising a hand in a crowd
4. **FAIRNESS** — a balance/scale, blindfolded figure (Lady Justice), two equal halves of an orange, a referee
5. **RESPECT** — a bow, two people listening, a trophy being handed over, hands cupped around a small plant
6. **INCLUSIVITY** — a circle of diverse hands, a puzzle completing, a ramp next to stairs, a group around a table
7. **FLEXIBILITY** — a yoga pose, a stretchy rubber band, a willow tree bending, a Swiss Army knife

**Flow per question:**
1. Host clicks **Next Question**
2. All 4 images for the value appear simultaneously in a 2×2 grid
3. Teams have **45 seconds** to type and submit their one-word answer
4. Correct answer = the exact value word (case-insensitive)
5. First team to submit correctly wins **3 points**; second correct team wins **1 point**
6. After time expires or both points awarded, reveal the answer with the **official core value description** (see table above), e.g. *"EMPOWERMENT — Delegation with guidance and taking ownership of your role."*
7. The explanation is a teachable moment — keep it to 1–2 sentences

**UI details:**
- 2×2 image grid, images are square-cropped and equal size
- Large input field below with team color accent
- Timer bar at the top
- Submitted answers appear as a loading indicator for that team (dots animating) until confirmed right or wrong
- On correct: team name flashes in their color + points animation
- Blank tiles for each team in a row at the bottom showing their answer status: ✓ or ✗ or ⏳

**Answer config (`server/rounds/fourPics.js`):**
```js
const fourPicsQuestions = [
  {
    id: 'fp1',
    answer: 'empowerment',
    images: ['fp1-a.jpg', 'fp1-b.jpg', 'fp1-c.jpg', 'fp1-d.jpg'],
    explanation: 'Delegation with guidance and taking ownership of your role.'
  },
  {
    id: 'fp2',
    answer: 'honesty',
    images: ['fp2-a.jpg', 'fp2-b.jpg', 'fp2-c.jpg', 'fp2-d.jpg'],
    explanation: 'Being truthful, honest and staying true to your word.'
  },
  // etc. — use official descriptions from Core Values table above
];
```

**Image sourcing:** Use Unsplash or Pexels for royalty-free images. Store in `public/images/four-pics/`.

---

### Round 3: Pass the Pen

**Concept:** A drawing relay. One word is shown to the drawing team only. Team members take turns drawing — each person draws for **15 seconds**, then the next person takes over. Other teams try to guess the word from the evolving drawing.

**Flow:**
1. Host clicks **Start Round**
2. System randomly selects a team to draw first
3. Only that team sees the word (shown in a banner at the top: *"Your team is drawing: 🎨 TEAMWORK"*)
4. Drawing order within the team is randomized (or goes in join order)
5. First drawer gets 15 seconds. A visible countdown shows. Canvas is active only for the current drawer
6. After 15s, control auto-passes to next team member. A visual transition ("Next up: @NickName!") is shown
7. Other teams have a guess input open the entire time — they can guess at any point
8. **Correct guess by a guessing team = 3 pts for that team + 1 pt for the drawing team**
9. If nobody guesses after all drawers have gone (or 2 full rotations), reveal the word — no points
10. Then rotate: the next team draws a different word
11. Each team gets to draw once

**Canvas implementation:**
- Use HTML5 Canvas API
- On the drawer's screen: canvas is interactive (mousedown/mousemove/mouseup + touch events)
- On all other screens: canvas is read-only, receiving draw strokes via Socket.IO in real time
- Emit `draw:stroke` events: `{ x, y, type: 'start'|'move'|'end', color, brushSize }`
- Server broadcasts strokes to all players in the room
- Canvas state is stored server-side as an array of strokes so late-joiners or refreshers can replay it

**Drawing tools (keep it simple):**
- Color palette: 8 colors (black, white, red, blue, green, yellow, orange, brown)
- Brush sizes: small / medium / large
- Eraser tool
- Clear button (only available to current drawer, clears canvas for everyone)

**Word list for Pass the Pen (mix of easy and tricky):**
```
meeting, deadline, coffee, laptop, teamwork, presentation, brainstorm, 
launch, feedback, onboarding, strategy, sprint, milestone, bug, deploy,
pizza, weekend, standup, async, pivot, roadmap, celebration, office dog
```
You can add or remove words from this list in the config.

**UI details:**
- Left: Canvas (large, takes up ~70% of screen width)
- Right: Chat/guess panel — scrollable, shows all guesses from all teams with team color labels
- Top banner: whose turn it is to draw, countdown timer
- Drawing team sees the word; guessing teams see "Guess the word!" prompt
- When correct guess: canvas freezes, big overlay: *"TEAM VOLT GUESSED IT! 🔥"*, then 3s pause, then next team draws

---

## Server-Side Game State

Manage all game state on the server in memory (a simple JS object). Do NOT rely on client state for anything authoritative.

```js
// gameState.js structure
const state = {
  phase: 'lobby' | 'round1' | 'round2' | 'round3' | 'results',
  players: {
    [socketId]: { pseudonym, email, teamId, joinedAt }
  },
  teams: {
    1: { name: 'Blaze', color: '#FF5C1A', score: 0, playerIds: [] },
    2: { name: 'Surge', color: '#00C4B4', score: 0, playerIds: [] },
    3: { name: 'Volt',  color: '#FFD600', score: 0, playerIds: [] },
    4: { name: 'Nova',  color: '#7C3AED', score: 0, playerIds: [] },
    5: { name: 'Pulse', color: '#F43F8E', score: 0, playerIds: [] },
  },
  currentRound: null,
  currentQuestion: null,
  roundState: {} // round-specific data
};
```

---

## Team Assignment Logic

Auto-assign every new player to the team with the fewest members. On ties, assign randomly among tied teams.

```js
// teamAssignment.js
function assignTeam(state) {
  const teamSizes = Object.entries(state.teams).map(([id, t]) => ({
    id,
    size: t.playerIds.length
  }));
  const minSize = Math.min(...teamSizes.map(t => t.size));
  const candidates = teamSizes.filter(t => t.size === minSize);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return chosen.id;
}
```

With 55 players across 5 teams, each team gets 11 players. This is perfectly balanced.

---

## Socket.IO Events Reference

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `player:join` | `{ pseudonym, email }` | Player joins the lobby |
| `answer:submit` | `{ answer, questionId }` | Team submits an answer |
| `draw:stroke` | `{ x, y, type, color, size }` | Drawer sends a stroke |
| `draw:clear` | `{}` | Drawer clears the canvas |
| `host:startGame` | `{}` | Host starts the game |
| `host:nextQuestion` | `{}` | Host advances to next question |
| `host:endRound` | `{}` | Host ends current round |
| `host:awardPoints` | `{ teamId, points }` | Host manually adjusts score |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `join:success` | `{ playerId, teamId, teamName, teamColor, allTeams }` | Confirms join, sends team info |
| `join:error` | `{ message }` | Pseudonym taken or other error |
| `lobby:update` | `{ teams, playerCount }` | New player joined, update lobby |
| `game:start` | `{ phase }` | Game is starting |
| `round:start` | `{ round, questionData }` | New round begins |
| `question:next` | `{ questionData }` | Next question loaded |
| `question:reveal` | `{ stage, imageUrl }` | Next zoom stage revealed (Round 1) |
| `answer:correct` | `{ teamId, teamName, points }` | A team got it right |
| `answer:wrong` | `{ teamId }` | (host only) Wrong answer submitted |
| `round:end` | `{ scores }` | Round ended, show scores |
| `draw:stroke` | `{ x, y, type, color, size }` | Broadcast drawing stroke |
| `draw:clear` | `{}` | Broadcast canvas clear |
| `draw:turn` | `{ playerId, pseudonym, timeLeft }` | Whose turn to draw |
| `game:end` | `{ finalScores }` | Game over |

---

## Email Rejoin Flow

When a player provides their email on join:
1. Store `{ email, pseudonym, teamId, rejoinToken }` server-side
2. Generate a `rejoinToken` (a short random UUID)
3. Construct a rejoin URL: `https://yourdomain.com/?rejoin=TOKEN`
4. Send email via **Resend** (free tier, easiest API) or **Nodemailer + Gmail SMTP**
5. When a player hits the rejoin URL, auto-fill their pseudonym and skip the join form — take them straight to the lobby or active game

**Email content (keep it short):**
```
Subject: Your Factor1 Game link 🎮

Hey [Pseudonym]!

Here's your link to rejoin the Factor1 team game:
[REJOIN_URL]

Click it anytime to jump back in.

— The Factor1 Game
```

> This feature is optional to implement first — build the core game first, add email after.

---

## Content Checklist (Things to Prepare Before Playing)

### Zoom Spy Images
Prepare **6–8 image sets**, each with 5 crops (stage 1 = most zoomed, stage 5 = full image).
- Tools: Photoshop, Figma, or even Canva
- Recommended image size: 800×800px for each stage
- Name them: `q1/stage1.jpg` through `q1/stage5.jpg`

### 4 Pics 1 Word Images
Prepare **5–7 sets**, each with 4 images.
- Source from Unsplash.com or Pexels.com (free, no attribution required)
- Square-crop all images to 400×400px
- Name them: `fp1-a.jpg`, `fp1-b.jpg`, `fp1-c.jpg`, `fp1-d.jpg`

### Pass the Pen Words
Customize the word list in `server/rounds/passThePen.js` — add industry-specific terms, internal jokes, or Factor1-specific references for extra laughs.

---

## Suggested Development Order

1. **Server: Setup Express + Socket.IO + basic game state**
2. **Join flow: Join screen → team assignment → lobby**
3. **Lobby: Real-time team cards + player chips**
4. **Host dashboard: Lobby controls + game start**
5. **Round 1 (Zoom Spy): Image reveal + answer submission + scoring**
6. **Round 2 (4 Pics): Image grid + answer + explanation reveal**
7. **Round 3 (Pass the Pen): Canvas + real-time strokes + guess flow**
8. **Results screen + final scoreboard**
9. **Polish: Animations, sound effects (optional), mobile responsiveness**
10. **Email rejoin (optional, add last)**

---

## Notes for Cursor

- All game logic and state lives server-side. Clients are display-only.
- The host is just a regular Socket.IO client with a `isHost: true` flag. They get additional events and controls.
- For simplicity, there's no database — everything is in memory. The game is ephemeral; it only needs to last ~30 minutes.
- Use `socket.to(roomId).emit()` for broadcasting. Put everyone in a single room called `'factor1-game'`.
- For the canvas in Round 3, throttle `draw:stroke` emissions to every 10ms on the client to avoid flooding the socket.
- Build mobile-responsive — some players will be on phones.
- Add a reconnect handler: if a player disconnects and reconnects, match them by their stored `playerId` (from localStorage) and restore their team assignment.

---

## Out of Scope (keep it simple)

- No authentication or user accounts
- No database (in-memory only)
- No spectator mode
- No chat (except guesses in Round 3)
- No video/audio
- No custom avatars
