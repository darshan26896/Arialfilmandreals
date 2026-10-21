# Persistent admin session (12 hours)

This project uses an HttpOnly, Secure cookie named `afm_admin_session`. The cookie is issued only after a valid password + OTP flow (unless `OTP_ENABLED=false` on the backend), expires after 12 hours, and is never returned to JavaScript or stored in localStorage.

## Deployment

1. Deploy the updated `server/` folder to Render.
2. Ensure `ADMIN_SECRET` is a strong random value of at least 32 characters; Render's generated secret is suitable.
3. Keep `OTP_ENABLED=true` on Render to require password + OTP.
4. Deploy the updated frontend to Vercel. The included `vercel.json` rewrite proxies `/api/*` to Render.
5. Remove `VITE_API_BASE` from Vercel environment variables if it points directly at Render. The frontend should call same-origin `/api/...`.
6. Redeploy both services after configuration changes.

## Behavior

- Password step checks MongoDB but does not create a session while OTP is required.
- OTP verification sets the HttpOnly cookie.
- On opening `#admin`, the frontend calls `/api/auth` with action `session`; the server validates expiry/signature.
- The Log out button calls action `logout` and clears the cookie.
- Library writes and Cloudinary signature requests read the cookie server-side.

The Vercel rewrite is important: direct browser requests to the Render domain may be treated as third-party cookies and blocked by some browsers. The rewrite makes requests first-party from the browser's perspective.
