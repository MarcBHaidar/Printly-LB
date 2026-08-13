# Printly LB

Vercel-ready Next.js application for the Printly LB website, portfolio, quote
uploads, testimonials, and administration area.

## Deploy on Vercel

1. Import the GitHub repository into Vercel.
2. Leave **Framework Preset** set to **Next.js**.
3. Leave **Build Command** and **Output Directory** at their defaults.
4. Create a Vercel Blob store and connect it to the project.
5. Add the environment variables listed in `.env.example`.
6. Redeploy the latest commit.

The required runtime values are:

- `DATABASE_URL`: Neon or another serverless-compatible PostgreSQL connection.
- `BLOB_READ_WRITE_TOKEN`: added automatically when a Vercel Blob store is
  connected to the project.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: initial admin credentials.
- `ADMIN_SESSION_SECRET`: a strong random value used to sign admin sessions.

The public landing page and bundled portfolio imagery work without database or
Blob credentials. Database-backed projects, testimonials, uploads, and admin
features require the corresponding environment variables.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run a production verification with:

```bash
npm run build
```
