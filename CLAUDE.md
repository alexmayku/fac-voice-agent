# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-first weekly coaching app with two rituals: **Monday planning** (choose 1-3 commitments) and **Friday review** (reflect on the week). Built with a Python LiveKit agent backend and Next.js frontend.

## Development Commands

### Agent (Python, in `agent/`)
```bash
uv sync                          # Install dependencies
uv run python agent.py dev       # Run dev server
uv run python agent.py start     # Run production server
```

### Frontend (Next.js, in `frontend/`)
```bash
pnpm install                     # Install dependencies
pnpm dev                         # Dev server with Turbopack (localhost:3000)
pnpm build                       # Production build
pnpm lint                        # ESLint
pnpm format                      # Prettier format
pnpm format:check                # Check formatting
```

### Docker
```bash
docker build -t my-agent:latest agent/
docker build -t my-frontend:latest frontend/
```

## Architecture

### Two-Service Design
- **`agent/`** — Python 3.12 LiveKit Agents server using OpenAI Realtime API for voice
- **`frontend/`** — Next.js 15 (App Router) with Clerk auth, mints LiveKit tokens

### Data Flow
```
Browser → Clerk auth → POST /api/connection-details (mint token + agent name)
  → LiveKit Server → Python Agent (OpenAI Realtime voice)
  → Function tools (save summary, send email)
```

### Agent Routing
The frontend sends an agent name via `RoomConfiguration` metadata. The agent server (`agent.py`) reads `ctx.job.metadata` to instantiate either `VoiceAgent` (planning) or `ReviewAgent` (review). The review agent loads Monday commitments from `agent/data/latest_summary.json` and injects them into its system prompt.

URL param `?mode=review` triggers review mode from the frontend.

### Key Files
- **`agent/agent.py`** — Agent server entry point, defines both agent classes and their function tools
- **`agent/prompts/weekly_coach_system.txt`** — Planning coach system prompt
- **`agent/prompts/weekly_review_system.txt`** — Review coach system prompt
- **`agent/data/latest_summary.json`** — Monday summary persisted for Friday review
- **`frontend/app/api/connection-details/route.ts`** — Token minting with agent dispatch
- **`frontend/components/app/app.tsx`** — Main app component, mode selection, session management
- **`frontend/components/app/welcome-view.tsx`** — Mode selection UI
- **`frontend/lib/utils.ts`** — App config loading and token source utilities
- **`frontend/app-config.ts`** — Configuration interface and defaults

### Agent Function Tools
Both agents expose callable tools and **must** call their summary tool before ending:
- `VoiceAgent`: `save_note`, `get_notes`, `send_test_email`, `send_session_summary`
- `ReviewAgent`: `save_note`, `get_notes`, `send_test_email`, `send_review_summary`

### Frontend Stack
React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui components, Clerk auth, LiveKit Components React

### Infrastructure
- Kubernetes manifests in `k8s/` (frontend + agent deployments, service, ingress)
- GitHub Actions: `deploy.yml` (push to main → Docker build → K8s deploy), `monday-invitation.yaml` and `friday-review.yaml` (scheduled invitation emails via Resend)

## Environment Variables

### Agent (`agent/.env.local`)
Required: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`
Optional: `RESEND_API_KEY`, `EMAIL_TO` (for email summaries)

### Frontend (`frontend/.env.local`)
Required: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
Optional: `AGENT_NAME` (blank=default, "review-coach" for explicit dispatch), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
