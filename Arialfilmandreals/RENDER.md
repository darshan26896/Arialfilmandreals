# Backend on Render

The backend is a standalone Node service in its own folder — nothing in `server/`
depends on the website code.

```
server/
  package.json        its own dependencies (express, mongodb)
  index.js            Express app + routes
  lib/db.js           MongoDB connection
  routes/auth.js      status | setup | change | login   (MongoDB auth)
  routes/library.js   public read · add/remove with a session token
  routes/otp.js       email login codes
```

Website files (`src/`, `public/`, `dist/`) stay separate and can keep living on
GitHub Pages.

---

## 1. MongoDB Atlas (free)

1. **cloud.mongodb.com** → **Build a Database** → **M0 Free**.
2. Create a database user and copy the password.
3. **Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0)**
   — Render's IPs change, so this is required.
4. **Connect → Drivers** → copy the connection string.

## 2. Render

### Easy way — Blueprint

1. Push this repository to GitHub.
2. **render.com → New → Blueprint** → connect the repo.
3. Render reads `render.yaml` (Root Directory = `server`) and deploys it.

### Manual way

**New → Web Service** → connect the repo, then:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

## 3. Environment variables

| Key | Value |
|---|---|
| `MONGODB_URI` | the Atlas connection string |
| `MONGODB_DB` | `arialfilmandreals` |
| `ADMIN_SECRET` | any long random string |
| `ADMIN_SETUP_KEY` | a phrase only you know (first-time password setup) |
| `ADMIN_EMAIL` | `joysolanki055@gmail.com` |
| `RESEND_API_KEY` | required while `OTP_ENABLED=true` — Resend API key |
| `OTP_FROM` | `onboarding@resend.dev` |
| `OTP_ENABLED` | `true` (recommended; password + OTP) |

## 4. Test it

Open `https://YOUR-APP.onrender.com/api/health` — you should see
`{"ok":true,"service":"arialfilmandreals-api"}`. Then
`/api/library` should return `{"ok":true,"items":[…]}`.

## 5. Point the website at it

The supplied `vercel.json` proxies `/api/*` to `https://arialfilmandreals.onrender.com/api/*`.
Keep `API_BASE` empty in Vercel and remove any `VITE_API_BASE` variable that points directly to Render. This makes the browser see API requests as same-origin, allowing the Secure HttpOnly cookie to work without third-party-cookie restrictions. Vite dev server has the same proxy for local testing.

## 6. Create the admin password

Open `yoursite.com/#admin` → enter the **setup key** → choose a strong password.
It is stored hashed in MongoDB. After that the panel asks for the password and emailed code. A successful OTP verification sets an HttpOnly, Secure, SameSite=Lax cookie for 12 hours. Reloads validate the cookie with the backend; Log out clears it.

---

## API reference

| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/api/health` | — | liveness |
| POST | `/api/auth` | `{action:"status"}` | is a password set? |
| POST | `/api/auth` | `{action:"setup", setupKey, password}` | first run only |
| POST | `/api/auth` | `{action:"change", current, password}` | rotate the password |
| POST | `/api/auth` | `{action:"login", password}` | Sets an HttpOnly cookie only if OTP is disabled; otherwise returns `requiresOtp` |
| POST | `/api/auth` | `{action:"session"}` | Validates the HttpOnly cookie after reload |
| POST | `/api/auth` | `{action:"logout"}` | Clears the HttpOnly cookie |
| GET | `/api/library` | — | public |
| POST | `/api/library` | item + HttpOnly session cookie | add / update |
| DELETE | `/api/library` | `{id}` + HttpOnly session cookie | remove |
| POST | `/api/otp` | `{action:"send"}` / `{action:"verify", code}` | OTP verification sets the HttpOnly cookie |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot reach the database` | Check the Render service and Vercel `/api` rewrite; keep `VITE_API_BASE` unset in Vercel |
| First request slow (30–60 s) | free plan sleeps — expected; Starter removes it |
| `MONGODB_URI is not set` | add it in Render → Environment, redeploy |
| Login always fails | Atlas Network Access must allow `0.0.0.0/0` |
| OTP email never arrives | add `RESEND_API_KEY`, or check Spam |
| 502 | Render → Logs shows the exact error |
