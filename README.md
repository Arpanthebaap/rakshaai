# RakshaAI — Deployment Guide

This folder is a ready-to-deploy version of the RakshaAI prototype with a working backend,
so the live AI reasoning layer works on a real public URL (not just inside Claude).

## Structure
```
deploy/
  public/index.html   → the app (identical UI to the demo file, points at /api/analyze)
  api/analyze.js       → serverless function that calls Claude with your API key
  vercel.json          → routes /api/analyze to the function, everything else to public/
  package.json
```

## Deploy in 5 minutes (Vercel — free tier is enough)

1. Install the CLI once: `npm install -g vercel`
2. From inside this `deploy/` folder: `vercel login`
3. Add your Anthropic API key as a secret environment variable:
   `vercel env add ANTHROPIC_API_KEY`
   (paste a key from https://console.anthropic.com/settings/keys — keep this OFF GitHub)
4. Deploy: `vercel --prod`
5. Vercel prints a live URL — that's your submission's "deployed project/demo URL".

## Alternative: Netlify
Same idea — put `public/index.html` as your publish directory, and convert
`api/analyze.js` into a Netlify Function (`netlify/functions/analyze.js`, same logic,
swap `req.body`/`res.status` for Netlify's `event`/`context` handler signature).
Add `ANTHROPIC_API_KEY` under Site settings → Environment variables.

## Important
- Never put your API key directly in `public/index.html` or commit it to GitHub —
  that exposes it to anyone who views page source. It must only live in the
  serverless function's environment variables.
- If you don't deploy this backend, the app still works — it falls back to the
  offline heuristic pattern-matching engine, which is a genuinely working detector
  on its own. The LLM layer only adds semantic reasoning on top.
