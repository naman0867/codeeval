# CodeEval — Interview Platform

A full-stack coding interview platform with a sandboxed compiler supporting Python, JavaScript, Java, and C++.

## Architecture

```
frontend/          React + Monaco Editor + Vite
backend/
  src/
    routes/        REST API (auth, problems, submissions, sessions)
    workers/       Bull queue worker — Docker execution engine
    services/      DB (Prisma), queue (Bull/Redis), logger
    middleware/    JWT auth
  prisma/          Schema + migrations + seed
docker-compose.yml PostgreSQL + Redis for local dev
```

## Quick start

### 1. Prerequisites
- Node.js 20+
- Docker Desktop (running)
- npm 9+

### 2. Start infrastructure
```bash
docker compose up -d
```

### 3. Install dependencies
```bash
npm install
```

### 4. Configure backend environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed (defaults work with docker-compose)
```

### 5. Run migrations and seed
```bash
npm run db:migrate    # creates tables
npm run db:seed       # creates demo users + Two Sum problem
```

### 6. Pull Docker images for the sandbox
```bash
docker pull python:3.12-alpine
docker pull node:20-alpine
docker pull eclipse-temurin:21-alpine
docker pull gcc:13-alpine
```

### 7. Start the app
```bash
npm run dev
```

- Frontend → http://localhost:5173
- API      → http://localhost:4000

### Demo credentials
| Role        | Email                     | Password     |
|-------------|---------------------------|--------------|
| Admin       | admin@codeeval.dev        | admin123     |
| Interviewer | interviewer@codeeval.dev  | password123  |

---

## How submissions work

```
User submits code
       ↓
POST /api/submissions   (creates DB record, returns submission ID)
       ↓
Bull queue (Redis)      (job enqueued)
       ↓
Worker process          (picks up job)
       ↓
docker run --rm         (isolated container per language)
  --network none        no internet access
  --memory 256m         memory cap
  --cpu-quota 50000     50% of one CPU
  --pids-limit 64       no fork bombs
       ↓
Judge engine            (compare output to expected, produce verdict)
       ↓
POST verdict → DB       (submission updated, test results persisted)
       ↓
Frontend polls GET /api/submissions/:id  (every 1.5s until complete)
```

### Verdict codes
| Code | Meaning              |
|------|----------------------|
| AC   | Accepted (all pass)  |
| WA   | Wrong Answer         |
| TLE  | Time Limit Exceeded  |
| MLE  | Memory Limit Exceeded|
| RE   | Runtime Error        |
| CE   | Compile Error        |

---

## Development

```bash
# Database UI
npm run db:studio -w backend

# Run only backend
npm run dev -w backend

# Run only frontend
npm run dev -w frontend
```

---

## Phase roadmap

- [x] **Phase 1** — Foundation: auth, Monaco editor, submission pipeline, Docker sandbox
- [ ] **Phase 2** — Problem admin panel (create/edit problems + test cases)
- [ ] **Phase 3** — Interview sessions (invite link, session tracking)
- [ ] **Phase 4** — Playback / replay system for reviewers
- [ ] **Phase 5** — Leaderboard, analytics, email notifications
