# Lvl UP

Lvl UP is a gamified EdTech SaaS MVP for AI-assisted study compression, quiz generation, focus verification, social threads, and leaderboards.

## Run the Next.js app

```bash
npm install
npm run dev
```

Required environment variables:

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server mutations

## Run the vision service

```bash
cd services/vision
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
