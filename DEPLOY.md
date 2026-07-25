# Deploying RakshaAI

RakshaAI is already live at **[rakshaai-psi.vercel.app](https://rakshaai-psi.vercel.app/)**. This guide is for deploying your own copy or redeploying after changes.

## Structure

```
public/index.html   → the app (dashboard, call simulator, scanner, EN/HI i18n)
api/analyze.js       → serverless function that calls Claude with your API key
vercel.json          → routes /api/analyze to the function, everything else to public/
package.json
```

## Deploy in 5 minutes (Vercel)

### Option A — GitHub integration (no CLI needed, recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Select this repository → **Import**
4. Framework preset: **Other**
5. Before deploying, expand **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: a key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
6. Click **Deploy**

Every future push to `main` automatically redeploys.

### Option B — CLI

```bash
npm install -g vercel
vercel login
vercel env add ANTHROPIC_API_KEY    # paste your key when prompted
vercel --prod
```

## Alternative: Netlify

Same idea — set `public/` as the publish directory, and convert `api/analyze.js` into a Netlify Function (`netlify/functions/analyze.js`, same logic, swap `req.body`/`res.status` for Netlify's `event`/`context` handler signature). Add `ANTHROPIC_API_KEY` under Site settings → Environment variables.

## Important

- **Never commit your API key.** It must only live in the hosting platform's environment variables — not in `public/index.html`, not in any file in this repo. Anything in `public/` is served as-is to every visitor.
- If the backend isn't deployed or the API call fails for any reason, the app still works — it falls back to the offline heuristic pattern-matching engine, which is a genuinely working detector on its own. The LLM layer only adds semantic reasoning on top.
- After deploying, test both the English and Hindi (हिं) toggle, and both the Live Call Monitor and Message/UPI Scanner tabs, to confirm the AI reasoning layer is reachable in production.
