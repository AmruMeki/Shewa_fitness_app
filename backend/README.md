# Shewa Backend

Minimal Express backend for Shewa Fitness with MySQL and JWT authentication.

Quick start:

1. Copy `.env.example` to `.env` and fill values.
2. Run `npm install` in `backend/`.
3. Run `npm run dev` to start (requires `nodemon`) or `npm start`.
4. Create database and run `schema.sql` or import it into MySQL.

Endpoints:

- `POST /auth/register` — create admin (for initial setup)
- `POST /auth/login` — admin login
- `POST /auth/public-login` — public/member login (returns JWT)
- `GET /admin/dashboard` — protected admin dashboard summary
