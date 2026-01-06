# NovaFix (local dev)

This repository is a static front-end that demonstrates a wallet troubleshooting UI and a minimal contact backend for development.

Quick start

1. Install server dependencies (Node 16+ recommended):

```fish
cd /home/dox/Documents/blockaid
npm install
```

2. Start the contact API server:

```fish
# runs server on port 3000
npm start
```

3. Start a static file server to serve the client (open another terminal):

```fish
# python built-in
python3 -m http.server 8000
# open http://localhost:8000 in your browser
```

Notes

- Contact form now POSTS to `/api/contact` (server listens on port 3000). When running both client and server locally, the client will POST to the same host; if you host client separately, adjust the `fetch()` URL accordingly.
- The server app stores contact submissions in `server/contacts.jsonl` (newline-delimited JSON). This is for local dev only — for production integrate with a proper datastore or email/webhook.
- The client was hardened to avoid direct innerHTML insertion of step content and to better handle wallet/network state.
