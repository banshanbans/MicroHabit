# MicroHabit Backend

FastAPI + PostgreSQL backend for the MicroHabit prototype.

## Setup

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
docker compose up -d postgres
npm run dev:backend
```

The API runs at `http://127.0.0.1:8000`.

Uploaded video analysis requires:

```bash
ARK_API_KEY=...
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_VISION_MODEL=doubao-seed-2-0-lite-260215
ARK_AUDIO_MODEL=doubao-seed-2-0-lite-260428
MICROHABIT_STORAGE_DIR=./storage
MICROHABIT_MAX_UPLOAD_MB=200
MICROHABIT_KEYFRAME_MAX_COUNT=10
```

## Tests

```bash
PYTHONPYCACHEPREFIX=/private/tmp/microhabit_pycache .venv/bin/python -m pytest backend/tests
```

## Migrations

```bash
MICROHABIT_DATABASE_URL=postgresql+psycopg://microhabit:microhabit@127.0.0.1:5432/microhabit .venv/bin/alembic -c backend/alembic.ini upgrade head
```

The startup script runs Alembic migrations before launching the API.
