# Data Science Dashboard

Monorepo with two independently deployable Next.js apps:

| Folder      | Purpose                              | Vercel Root Directory | Local dev port |
| ----------- | ------------------------------------ | --------------------- | -------------- |
| `private/`  | Internal dashboard                   | `private`             | 3000           |
| `public/`   | Member-facing page                   | `public`              | 3001           |

Each app has its own `package.json`, lockfile and `node_modules`, so each Vercel
project only installs and builds its own folder.

## Local development

```bash
npm run install:all   # install deps for both apps
npm run dev:private   # http://localhost:3000
npm run dev:public    # http://localhost:3001
```

## Deploying to Vercel

Create two Vercel projects from this repository and set **Settings → Build and
Deployment → Root Directory** to `private` for one and `public` for the other.
Framework preset: Next.js (auto-detected).

## Certificates (Neon)

Certificates are designed in the private dashboard (**Certificates** page) and
downloaded by members from the public site.

1. Create a Neon project and copy its connection string.
2. Put it in `private/.env.local` **and** `public/.env.local`:
   ```
   DATABASE_URL=postgresql://...
   ```
   (on Vercel, set `DATABASE_URL` on both projects; optionally set
   `NEXT_PUBLIC_PUBLIC_SITE_URL` on the private project to the public site's URL).
3. Create the tables once: `npm --prefix private run db:migrate`.

Flow: dashboard → pick one of the 12 designs, edit title/wording/signatories,
publish → public `/` lists published certificates → `/c/<slug>` lets a visitor
type their name and download a PDF or PNG (rendered in the browser). Each
download increments a counter shown in the dashboard.

`private/lib/certificate/` and `public/lib/certificate/` are copies of the same
renderer; keep them in sync when changing a template. The dashboard API has no
authentication yet.
