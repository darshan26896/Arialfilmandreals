# Deploying the backend on Render

The backend is three small API files (`api/`) plus `server.js`, which serves them
**and** the built website. MongoDB holds the admin password and the library.

```
api/auth.js      password login, setup, change      → session token
api/library.js   read the library (public)          → add / remove (token)
api/otp.js       email login codes
server.js        Express: serves dist/ + mounts the API
render.yaml      Render blueprint
```

---

## 1. MongoDB Atlas (free)

1. Create an account at **cloud.mongodb.com** → **Build a Database** → **M0 Free**.
2. Create a database user (username + password — copy the password).
3. **Network Access** → **Add IP Address** → *Allow access from anywhere*
   (`0.0.0.0/0`). Render's IPs change, so this is required.
4. **Connect → Drivers** → copy the connection string. It looks like:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 2. Render

### Easy way — Blueprint

1. Push this project to GitHub.
2. **render.com** → **New → Blueprint** → connect your GitHub repo.
3. Render reads `render.yaml` and creates the web service.
4. It asks for the values marked `sync: false` — paste them in (table below).

### Manual way

**New → Web Service** → connect the repo, then:

| Setting | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `node server.js` |
| Health Check Path | `/api/library` |
| Plan | Free (or Starter to avoid sleeping) |

---

## 3. Environment variables

Set these in Render → **Environment**:

| Key | Where it comes from |
|---|---|
| `MONGODB_URI` | the Atlas connection string |
| `MONGODB_DB` | `arialfilmandreals` |
| `ADMIN_SECRET` | any long random string (signs session tokens) |
| `ADMIN_SETUP_KEY` | a phrase only you know — needed for first-time password setup |
| `ADMIN_EMAIL` | `joysolanki055@gmail.com` (OTP codes go here) |
| `RESEND_API_KEY` | *(optional)* resend.com — real OTP emails |
| `OTP_FROM` | `onboarding@resend.dev` |
| `ALLOW_SETUP` | `false` |

---

## 4. Deploy and test

1. Click **Deploy** — the build runs `npm ci && npm run build`, then `node server.js`.
2. When it is live, open your service URL in the browser:

```
https://YOUR-APP.onrender.com/api/library
```

You should see JSON (`{"ok":true,"items":[…]}`). If you see that, the backend works.

Also try `POST` testing later through the admin panel — the login screen tells you
whether the database is reachable.

---

## 5. Point the website at it (Option B)

Your site can stay on GitHub Pages. In `src/data.ts`:

```ts
export const API_BASE = "https://YOUR-APP.onrender.com";
```

Commit and push. Now the site calls your Render API. (Leave `API_BASE` empty if
you serve the site from Render itself.)

---

## 6. Create the admin password

1. Open `yoursite.com/#admin` (or the Render URL with `#admin`).
2. It asks for the **owner setup key** — the value of `ADMIN_SETUP_KEY`.
3. Enter a strong password (12+ characters) twice.
4. It is saved to MongoDB, hashed. From then on the panel only asks for the
   password, then the email code.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot reach the database` | `API_BASE` missing or wrong; check the service is awake |
| First request takes 30–60 s | Free plan sleeps — expected. Upgrade to Starter to avoid it |
| `MONGODB_URI is not set` | Add the variable in Render → Environment, then redeploy |
| Login always fails | Atlas **Network Access** must allow `0.0.0.0/0` |
| OTP email never arrives | Add `RESEND_API_KEY`, or check Spam — the fallback uses your form relay |
| 502 from Render | Open the Logs tab in Render — the error is printed there |
