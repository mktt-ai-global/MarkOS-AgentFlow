# AgentFlow Static Site Package

This package contains the built static frontend only.

## Contents

- `index.html`
- `assets/`

## Quick Deploy

1. Upload the package contents to your static web root on the VPS.
2. Serve it with Nginx, Caddy, or any static file server.
3. If you want the frontend to talk to a backend on the VPS later, set `VITE_API_BASE_URL` before rebuilding the frontend.

## Current Behavior

- Without a reachable backend API, the site falls back to the built-in demo/static mode.
- The current build was generated from `frontend/dist`.
