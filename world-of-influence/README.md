This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local development (Supabase)

To run against Supabase so you see real auth, persistence, and real-time data locally:

1. **Copy env example and add your keys**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local`: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your [Supabase](https://supabase.com) project (Project Settings → API). Use the same project as production to iterate on real data.

2. **Restart the dev server** after changing `.env.local` (Next.js inlines `NEXT_PUBLIC_*` at build time).

3. **Confirm** in the browser console you see `[Supabase] Configured — local build is using your Supabase project.` If you see a warning instead, check `.env.local` and restart.

4. **Forgot password:** Add your reset page to Supabase → Authentication → URL Configuration → Redirect URLs: `http://localhost:3000/auth/reset-password` (and your production URL, e.g. `https://your-app.vercel.app/auth/reset-password`).

Optional: for Satellite/Drone location search, add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
