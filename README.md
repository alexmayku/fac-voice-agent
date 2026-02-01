# LiveKit Voice Agent

A voice AI app built with [LiveKit Agents](https://docs.livekit.io/agents): a Python agent that speaks and remembers notes, and a Next.js frontend for real-time voice interaction.

**This project is a tutorial from [Founders and Coders](https://www.foundersandcoders.com/).**

## What’s in this repo

- **`agent/`** — Python voice agent (LiveKit Agents + OpenAI Realtime) with tools to save and recall notes.
- **`frontend/`** — Next.js app using [Agents UI](https://livekit.io/ui) for the voice interface, audio controls, and chat transcript.

You run the agent and the frontend separately; the frontend connects to LiveKit and talks to your agent in a room.

## Prerequisites

- **Python 3.13+** (agent)
- **Node.js** and **pnpm** (frontend)
- A [LiveKit Cloud](https://cloud.livekit.io/) project (or self-hosted LiveKit server)
- An [OpenAI API key](https://platform.openai.com/api-keys) (for the agent’s voice model)

## Quick start

### 1. LiveKit credentials

Create a project in [LiveKit Cloud](https://cloud.livekit.io/) and note:

- **LIVEKIT_URL** (e.g. `wss://your-project.livekit.cloud`)
- **LIVEKIT_API_KEY**
- **LIVEKIT_API_SECRET**

### 2. Run the agent

```bash
cd agent
uv sync
cp .env.example .env.local   # if you have an example; otherwise create .env.local
```

In `agent/.env.local` set:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_api_key
```

Then start the agent:

```bash
uv run python agent.py dev
```

### 3. Run the frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
```

In `frontend/.env.local` set the same LiveKit values:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

Start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), allow microphone access, and start a call. The agent will greet you and can remember things when you ask.

## Project structure

```
livekit-voice-agent/
├── agent/           # Python voice agent (LiveKit Agents + OpenAI)
│   ├── agent.py     # VoiceAgent with save_note / get_notes tools
│   └── pyproject.toml
├── frontend/        # Next.js + Agents UI voice client
│   ├── app/         # Routes, API (connection-details for tokens)
│   ├── components/  # agents-ui, app, ui
│   └── package.json
└── README.md
```

## Agent behaviour

The Python agent uses OpenAI’s Realtime API for low-latency voice. It has two tools:

- **save_note** — Saves a note when the user asks to remember something.
- **get_notes** — Returns saved notes when the user asks what was remembered.

Notes are stored in memory for the lifetime of the agent process.

## Frontend

The frontend is based on the [LiveKit Agent Starter for React](https://github.com/livekit-examples/agent-starter-react). See `frontend/README.md` for structure, configuration, and customisation (branding, app config, Agents UI components).

## Tutorial context

This repository is part of a **Founders and Coders** tutorial. It is intended for learning how to build a voice AI app with LiveKit and OpenAI.

## Links

- [LiveKit Agents docs](https://docs.livekit.io/agents)
- [LiveKit Cloud](https://cloud.livekit.io/)
- [Founders and Coders](https://www.foundersandcoders.com/)
