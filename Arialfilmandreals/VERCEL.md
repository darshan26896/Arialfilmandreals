# Frontend on Vercel · Backend on Render

```
Vercel  →  the website   (src/, public/, dist/)
Render  →  the API       (server/ — its own Node service, MongoDB)
```

---

## 1. Deploy the backend first

Follow `RENDER.md`. Short version:

- Render → **New → Blueprint** → connect the repo (Root Directory is `server`
  in `render.yaml`), or **New → Web Service** with Root Directory `server`,
  Build `npm install`, Start `npm start`.
- Set `MONGODB_URI`, `MONGODB_DB`, `ADMIN_SECRET`, `ADMIN_SETUP_KEY`,
  `ADMIN_EMAIL`, optional `RESEND_API_KEY`.
- Test: `https://YOUR-APP.onrender.com/api/health` → `{"ok":true,…}`

**Copy the Render URL** — you need it in the next step.

---

## 2. Deploy the frontend on Vercel

1. **vercel.com → Add New → Project** → import the same GitHub repository.
2. Vercel reads `vercel.json`:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Before deploying, open **Settings → Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `VITE_API_BASE` | `https://YOUR-APP.onrender.com` |

   *(Or skip this and paste the same URL into `RENDER_URL` in `src/data.ts`.)*
4. **Deploy.**

`.vercelignore` keeps the `server/` folder out of the frontend deployment, so
Vercel only ever uploads the website.

---

## 3. Connect them

Visit the Vercel URL → open `/#admin` → you should see the admin login.

- *"Cannot reach the database"* → `VITE_API_BASE` is missing or wrong.
- It asks for the **setup key** on the first run → enter `ADMIN_SETUP_KEY` and
  create your password. It is stored hashed in MongoDB.

---

## 4. Checklist

- [ ] `https://YOUR-APP.onrender.com/api/health` returns `{"ok":true}`
- [ ] `VITE_API_BASE` is set in Vercel **for Production** (and Preview if you want it)
- [ ] MongoDB Atlas allows access from anywhere (0.0.0.0/0)
- [ ] `ALLOW_SETUP` / `ADMIN_SETUP_KEY` are what you expect
- [ ] Site loads on Vercel, admin panel talks to Render

---

## Notes

- **CORS** is already enabled on the Render server, so a different domain is fine.
- **Render free plan sleeps** — the first admin login after a quiet spell can take
  30–60 seconds. The paid Starter plan removes that.
- **Local development:** run `npm run dev` for the site and `cd server && npm start`
  for the API, then set `VITE_API_BASE=http://localhost:3000`.
- Redeploying Vercel is needed after changing `VITE_API_BASE`; redeploying Render
  is needed after changing its environment variables.
