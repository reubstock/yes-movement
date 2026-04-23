# YES Movement — Project Guide

## What This Is
A website for the YES Movement.

## Running Locally
```bash
npm install
npm start        # runs on http://localhost:3001
npm run dev      # same, with nodemon auto-restart
```

## Tech Stack
- **Backend**: Node.js + Express (`server/index.js`)
- **Database**: In-memory JS store (`server/store.js`)
- **Frontend**: Vanilla HTML/CSS/JS, no framework
- **Deployment**: Vercel (`vercel.json` routes all traffic through Express)

## File Structure
```
public/
  index.html       — Homepage
  events.html      — Events page
  members.html     — Members directory
  about.html       — About page with join form
  css/styles.css   — All styles
  js/nav.js        — Active nav link + mobile hamburger toggle

server/
  index.js         — Express app, static file serving, API route mounting
  store.js         — In-memory data store with seeded members and events
  routes/
    members.js     — GET /api/members, GET /api/members/:id, POST /api/members
    events.js      — GET /api/events(?upcoming=true), POST /api/events
```

## Deployment
- **Repo**: https://github.com/reubstock/yes-movement
- Vercel auto-deploys on push to `main`
- `vercel.json` routes all requests through `server/index.js`
- Node 22 is pinned in `package.json`
- Data does not persist across Vercel cold starts — seeded data is always available
