# HaDay · Hebraic Mentor

Biblical Hebrew vocabulary trainer for first-year students (BIBL 630).

- Drill, write (handwriting), and quiz high-frequency lemmas
- Weak-word focus from misses and lapses
- Tanakh verse examples with the target word highlighted
- Each classmate creates an account; progress stays with that account

## Run on your machine

```bash
cd haday
npm install
npm run dev
```

Then open the URL the terminal prints (port 8080).

## Publish independently (free)

1. This folder is already on GitHub.
2. Create a free [Neon](https://neon.tech) Postgres database and copy the connection string.
3. Import this repo in [Vercel](https://vercel.com) (Hobby is free). Set **Root Directory** to `haday`.
4. In Vercel project settings, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `BETTER_AUTH_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `BETTER_AUTH_SECRET` | A long random string (generate one and keep it private) |

Email + password sign-in works with those three. Google and X in the Grok preview use Grok’s sign-in broker; to keep those buttons on your own site you later add your own Google/X developer apps.

## Scripts

- `npm run dev` — local app
- `npm run build` — production build + database migrate
- `npm run typecheck` — TypeScript check
