# LiveKit Weekly Coach (LiveKit + OpenAI)

A local voice-first coaching app built with [LiveKit Agents](https://docs.livekit.io/agents) and a Next.js frontend.

**This project is based on a tutorial on setting up a LiveKit voice agent from [Founders and Coders](https://www.foundersandcoders.com/).**

## What this app does

You run:

- **A Next.js web app** (`frontend/`) that provides the call UI (mic, transcript, controls) and mints **LiveKit access tokens**.
- **A Python LiveKit agent server** (`agent/`) that connects to the room and speaks via **OpenAI Realtime**.

The Python server exposes **two voice agents**:

- **Weekly planning coach (Monday)**: helps you choose 1–3 commitments; **must send a written summary** at the end.
- **Weekly review coach (Friday)**: reflects on the week; automatically includes the Monday commitments if available.

Optionally, the agent can **email** summaries to you (via Resend), and this repo includes **GitHub Actions** that can send Monday/Friday invitation emails on a schedule.

## Repo tour (what’s important)

- **`agent/agent.py`**: LiveKit agent server with two sessions:
  - Default session = planning coach
  - Named agent session `review-coach` = Friday review coach
- **`prompts/weekly_coach_system.txt`**: system prompt for planning coach (requires `send_session_summary` tool call)
- **`prompts/weekly_review_system.txt`**: system prompt for review coach (requires `send_review_summary` tool call)
- **`agent/send_invitation.py`**: sends “Monday planning” or “Friday review” invitation emails via Resend
- **`.github/workflows/*`**: scheduled workflows to send invitations (Mon/Fri @ 10:00 UTC)
- **`frontend/app/api/connection-details/route.ts`**: server route that generates LiveKit participant tokens (and can request agent dispatch)
- **`frontend/app-config.ts`**: reads `AGENT_NAME` to optionally target a specific agent (like `review-coach`)

## Prerequisites

- **LiveKit**: a LiveKit Cloud project (recommended) or a self-hosted LiveKit server
- **OpenAI**: an API key (used by the Python agent’s realtime model)
- **Python**: `>=3.12, <3.14` (as specified in `agent/pyproject.toml`)
- **uv**: Python package manager used by this repo (`uv sync`, `uv run`)
- **Node.js** + **pnpm**: for the Next.js frontend

Optional (only if you want email):

- **Resend** account + API key (`RESEND_API_KEY`)

## Local setup (step-by-step)

### 1) Create LiveKit credentials

In LiveKit Cloud, copy:

- `LIVEKIT_URL` (usually `wss://<project-subdomain>.livekit.cloud`)
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

### 2) Configure the frontend env

The frontend uses these values to mint **participant tokens** (server-side).

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...

# Optional: choose which agent to dispatch to
# AGENT_NAME=review-coach
```

Notes:

- If `AGENT_NAME` is blank/omitted, no specific agent is requested (whatever the LiveKit server decides / default agent).
- Setting `AGENT_NAME=review-coach` makes the frontend request the review agent explicitly.

### 3) Install & run the frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The app will be at `http://localhost:3000`.

### 4) Configure the Python agent env

The agent reads `agent/.env.local` (see `load_dotenv(".env.local")` in `agent/agent.py`).

Create `agent/.env.local`:

```env
# LiveKit (agent connects to your LiveKit project)
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# OpenAI (used by openai.realtime.RealtimeModel)
OPENAI_API_KEY=...

# Optional email support (Resend)
RESEND_API_KEY=...
EMAIL_TO=you@example.com
```

Email behaviour:

- If `RESEND_API_KEY` and `EMAIL_TO` are set, the agent will email session summaries.
- If either is missing, summaries still get posted to the in-call chat, but email is skipped.

### 5) Install & run the agent server

```bash
cd agent
uv sync
uv run python agent.py dev
```

Keep this running while you use the frontend.

## Using the two modes (Planning vs Review)

### Planning coach (default)

- Just open `http://localhost:3000` and start a call.
- At the end of the session, the agent writes a bullet summary via `send_session_summary`.

The Monday summary is persisted to:

- `agent/data/latest_summary.json`

### Review coach (`review-coach`)

Two ways to trigger it:

- **Frontend dispatch**: set `AGENT_NAME=review-coach` in `frontend/.env.local`, restart `pnpm dev`, then start a call.
- **Invitation link / URL param**: open the app with `?mode=review` (e.g. `http://localhost:3000?mode=review`). The frontend will dispatch to `review-coach` automatically.

When the review coach starts, it tries to load `agent/data/latest_summary.json` and injects it into the review prompt.

## Email invitations (optional)

This repo includes a small script + GitHub Actions to send scheduled invitations.

### Send an invitation locally

```bash
cd agent
RESEND_API_KEY=... EMAIL_TO=... APP_URL=http://localhost:3000 uv run python send_invitation.py
```

Send the Friday review version:

```bash
cd agent
RESEND_API_KEY=... EMAIL_TO=... APP_URL=http://localhost:3000 uv run python send_invitation.py review
```

### Automated invites via GitHub Actions

Workflows:

- `.github/workflows/monday-invitation.yaml` (Mon @ 10:00 UTC)
- `.github/workflows/friday-review.yaml` (Fri @ 10:00 UTC)

They require repository secrets:

- `RESEND_API_KEY`
- `EMAIL_TO`
- `APP_URL`

## Troubleshooting

- **Frontend returns 500 from `/api/connection-details`**
  - Ensure `frontend/.env.local` has `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` set.
- **You can’t hear the agent / mic issues**
  - Check browser mic permissions and select the correct input device.
- **Review coach doesn’t mention Monday commitments**
  - Make sure you completed a planning session first (it writes `agent/data/latest_summary.json`).
  - Confirm the file exists and contains valid JSON.
- **Email isn’t being sent**
  - Confirm `RESEND_API_KEY` and `EMAIL_TO` are set in `agent/.env.local`.
  - You can ask the agent to call its `send_test_email` tool to verify delivery.

## Project structure (high-level)

```
livekit-voice-agent/
├── agent/                # Python LiveKit agent server
├── frontend/             # Next.js UI + token-minting API route
├── prompts/              # System prompts for both agents
└── .github/workflows/    # Scheduled invitation emails
```

## Credits / tutorial context

This repository is part of a **Founders and Coders** tutorial, intended for learning how to build a voice-first app with LiveKit Agents + OpenAI Realtime and to integrate lightweight automation (scheduled emails) around it.

## Links

- [LiveKit Agents docs](https://docs.livekit.io/agents)
- [LiveKit Cloud](https://cloud.livekit.io/)
- [Agents UI](https://livekit.io/ui)
- [Founders and Coders](https://www.foundersandcoders.com/)
