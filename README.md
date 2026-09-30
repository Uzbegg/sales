# Infinity Sales

MVP web CRM for Telegram-assisted equipment sales.

## Stack
- Frontend: Next.js + React
- Backend: FastAPI
- Database: PostgreSQL
- Queue/cache: Redis
- Telegram layer: Telethon (disabled until credentials are configured)
- Deployment: Docker Compose

## MVP modules
- Dashboard
- Leads
- Excel/CSV import
- Campaigns
- Telegram Accounts
- Inbox
- Templates
- Products
- Status pipeline

## Local start
1. Copy `.env.example` to `.env`
2. Fill database credentials
3. Run:
   ```bash
   docker compose up --build
   ```
4. Frontend: http://localhost:3000
5. API docs: http://localhost:8000/docs

Telegram credentials are intentionally not committed to Git.


<!-- redeploy: 2026-09-30 vercel refresh -->
