# AGENTS.md — working notes for JAVID REAL ESTATE

Persian (RTL) editorial real-estate site for قشم / درگهان.
**Frontend:** React 18 + Vite (`frontend/`). **Backend:** FastAPI + PostgreSQL (`backend/`).

Everything runs from `docker-compose.base44.yml`. There is no prebuilt app image —
both app services run the cloned source with live reload.

## Everyday commands

```bash
docker compose -f docker-compose.base44.yml up -d --build     # start / apply compose or image changes
docker compose -f docker-compose.base44.yml ps                 # service state
docker compose -f docker-compose.base44.yml logs -f backend    # backend log (uvicorn --reload)
docker compose -f docker-compose.base44.yml logs -f frontend   # Vite log
docker compose -f docker-compose.base44.yml restart backend    # after changing Python-only imports
docker compose -f docker-compose.base44.yml run --rm migrate   # re-run schema + seed job
```

Ports: **3000** = the web entry point (the preview). **8000** = raw API, handy for curl.

## Things that are easy to get wrong

- **Single origin on purpose.** The browser only talks to port 3000; Vite proxies
  `/api` and `/media` to `backend:8000`. That is why admin sessions work with a plain
  httpOnly cookie and why there is no CORS setup to debug. Do not point the frontend at
  `http://localhost:8000` — use relative `/api` paths.
- **Schema and seed data are owned by the `migrate` service**, not by application startup.
  Changed a model? Re-create it: `docker compose -f docker-compose.base44.yml run --rm migrate`.
  There is no Alembic; the job uses `create_all` and is idempotent.
- **No demo listings on purpose.** The seed creates only the seven property categories,
  the site-settings row and the administrator account. Listings must be entered in the
  dashboard — never seed fictional properties or prices.
- **Admin account** comes from `.env.base44-defaults` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
  The seed never overwrites a password changed from the dashboard; to force it back from
  the environment, set `ADMIN_RESET_PASSWORD=1` for one `migrate` run.
- **Uploads** land in the `uploads` volume (`/app/uploads` in the backend) and are served
  at `/media/...`. Deleting that volume loses property images.
- **Dependencies**: backend requirements are baked into the image (rebuild after editing
  `backend/requirements.txt`); frontend deps live in the `node-modules` volume and are
  installed with `npm ci` on every container start, so `frontend/package-lock.json` is the
  source of truth.
- **Fonts are self-hosted** in `frontend/public/fonts` (Vazirmatn, Cormorant Garamond,
  Inter) — the site must not depend on Google Fonts being reachable from Iran.
- **Imagery** in `frontend/public/images` is placeholder editorial photography (`qeshm.jpg`
  is a real Qeshm coastline photo from Wikimedia Commons). Replace with real property and
  office photography; the homepage/section images are also editable in the dashboard under
  تنظیمات سایت.

## Sandbox-only overrides (all gated on `BASE44_PREVIEW_MODE === "1"`)

`frontend/vite.config.js`:

- appends `.${BASE44_SANDBOX_HOST_DOMAIN}` to `server.allowedHosts` (the sandbox id
  rotates, so a wildcard is required);
- sets `server.hmr = { protocol: 'wss', clientPort: 443 }` because the preview proxy serves
  the dev server over https on 443.

With the flag unset or any other value, none of this applies and Vite keeps its defaults.
`CORS_ORIGINS` in compose only affects direct (non-proxied) API calls, since the browser
normally reaches the API through the Vite proxy on the same origin.

## Gotchas worth knowing before you change things

- **Money columns are BIGINT.** Iranian property amounts are quoted in billions of
  toman, so `price` / `deposit` / `monthly_rent` must never go back to `Integer`.
  `migrate` widens existing databases (`ensure_money_columns`) because `create_all`
  only creates missing tables.
- **Deleting a listing never deletes leads.** `DELETE /api/admin/properties/{id}`
  first clears `inquiries.property_id` (each inquiry keeps its own copy of the
  property title), so the delete succeeds and customer inquiries survive. The
  database enforces the same rule: `inquiries.property_id` carries
  `ON DELETE SET NULL`, re-created idempotently by `migrate`
  (`ensure_inquiry_property_fk`), so a raw delete can never fail on — or destroy —
  an inquiry either.
- **Public listings only ever expose `published` records.** An unpublished or deleted
  slug returns 404 from `/api/properties/{slug}` while staying visible in
  `/api/admin/properties`.
- **No demo listings are seeded, by design.** Until real files are entered in the
  dashboard the public sections show Persian empty states and category counts stay at
  zero. Never seed fictional properties or prices.

## Verifying it works

```bash
curl -sI http://localhost:3000/                       # Vite serves the SPA
curl -s  http://localhost:3000/api/categories         # API + DB through the proxy
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@javid.local","password":"javid-dev-1404"}'   # returns {"user": …} and sets a cookie
```

Public listing data is only ever exposed for `published` properties; unpublished records
return 404 from `/api/properties/{slug}` while staying visible in `/api/admin/properties`.

Two gestures cannot be driven by the preview automation and deserve a manual pass
after changes: choosing a value in a React-controlled `<select>` (the automation's
fill helper refuses selects — exercise the same code path with a `?category=…` or
`?transaction=…` URL), and `window.confirm()` delete dialogs, which automation
auto-dismisses.
