# MicroHabit Demo

MicroHabit is a mobile-first wellness prototype that turns health video ideas into 7-day micro-action challenges, health graph progress, badges, points, and companion growth feedback.

The current demo focuses on a soft, playful wellness experience for habit formation:

- AI-style video analysis flow
- Health graph preview and node lighting
- 7-day challenge setup and daily actions
- Check-in success and review report screens
- Micro badge / companion growth center

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Framer Motion
- Lucide React
- FastAPI
- SQLAlchemy 2
- PostgreSQL

## Getting Started

Install dependencies:

```bash
npm install
```

Create and install the backend virtual environment from the project root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Start the API server:

```bash
npm run dev:backend
```

Start the local development server:

```bash
npm run dev:frontend
```

The frontend uses the real API by default at `http://127.0.0.1:8000`. Set `VITE_USE_MOCK_API=true` to use the original in-browser mock adapter.

For uploaded Douyin video files, configure Ark before starting the backend:

```bash
ARK_API_KEY=...
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_VISION_MODEL=doubao-seed-2-0-lite-260215
ARK_AUDIO_MODEL=doubao-seed-2-0-lite-260428
MICROHABIT_STORAGE_DIR=./storage
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  app/        App shell, router, query client, and flow store
  mocks/      Demo API handlers and scenario data
  pages/      Mobile prototype pages
  shared/     Shared components, types, and global styles
backend/
  app/        FastAPI app, routes, SQLAlchemy models, services
  alembic/    Database migration environment
  tests/      API flow tests
```

Prototype references are kept under:

```text
stitch_microhabit_wellness_prototype/
```

## Notes

- Demo scenarios still use deterministic seed data. Uploaded videos run through local media extraction plus Ark audio/vision analysis when `ARK_API_KEY` is configured.
- Runtime flow state is persisted in browser storage only for device id and lightweight UI state.
- The app is designed around a 390px mobile viewport while still running in a desktop browser.
