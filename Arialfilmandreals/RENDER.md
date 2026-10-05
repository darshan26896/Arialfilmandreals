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
| `RESEND_API_KEY` | *(optional)* resend.com — real OTP emails |
| `OTP_FROM` | `onboarding@resend.dev` |

## 4. Test it

Open `https://YOUR-APP.onrender.com/api/health` — you should see
`{"ok":true,"service":"arialfilmandreals-api"}`. Then
`/api/library` should return `{"ok":true,"items":[…]}`.

## 5. Point the website at it

In `src/data.ts`:

```ts
export const API_BASE = "https://YOUR-APP.onrender.com";
```

Commit and push — the site on GitHub Pages now talks to this API.

## 6. Create the admin password

Open `yoursite.com/#admin` → enter the **setup key** → choose a strong password.
It is stored hashed in MongoDB. After that the panel only asks for the password,
then the emailed code.

---

## API reference

| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/api/health` | — | liveness |
| POST | `/api/auth` | `{action:"status"}` | is a password set? |
| POST | `/api/auth` | `{action:"setup", setupKey, password}` | first run only |
| POST | `/api/auth` | `{action:"change", current, password}` | rotate the password |
| POST | `/api/auth` | `{action:"login", password}` | → `{token}` |
| GET | `/api/library` | — | public |
| POST | `/api/library` | item + `Authorization: Bearer TOKEN` | add / update |
| DELETE | `/api/library` | `{id}` + token | remove |
| POST | `/api/otp` | `{action:"send"}` / `{action:"verify", code}` | login codes |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot reach the database` | `API_BASE` wrong or the service is asleep |
| First request slow (30–60 s) | free plan sleeps — expected; Starter removes it |
| `MONGODB_URI is not set` | add it in Render → Environment, redeploy |
| Login always fails | Atlas Network Access must allow `0.0.0.0/0` |
| OTP email never arrives | add `RESEND_API_KEY`, or check Spam |
| 502 | Render → Logs shows the exact error |
