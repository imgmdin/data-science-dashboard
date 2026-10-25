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
