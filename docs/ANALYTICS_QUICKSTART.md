# 🚀 Umami Analytics - Quick Setup

## Step 1: Create Umami Account (5 minutes)

1. Go to **[https://cloud.umami.is/signup](https://cloud.umami.is/signup)**
2. Sign up for free (100k events/month)
3. Click **"Add Website"**
4. Enter your portfolio details:
   - **Name**: My Portfolio
   - **Domain**: yourportfolio.com (or localhost for testing)
5. Click **"Save"**
6. Copy your **Website ID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## Step 2: Update Environment Variables (2 minutes)

Add these to your `.env` file:

```bash
# Enable Analytics
VITE_ENABLE_ANALYTICS=true

# Umami Configuration (paste your Website ID from Step 1)
VITE_UMAMI_WEBSITE_ID=your-website-id-here
VITE_UMAMI_SRC=https://cloud.umami.is/script.js
```

**Example:**

```bash
VITE_ENABLE_ANALYTICS=true
VITE_UMAMI_WEBSITE_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
VITE_UMAMI_SRC=https://cloud.umami.is/script.js
```

## Step 3: Test It (2 minutes)

```bash
# Start development server
npm run start:dev

# Open http://localhost:5173
# Check browser console - you should see:
# [Analytics] Umami initialized
```

Then:

1. Navigate around your site
2. Click on the Vite/React logos (external link tracking example)
3. Go to your Umami dashboard
4. You should see page views and events appearing!

## That's It! ✅

Your analytics is now tracking:

- 📊 Page views
- 🌍 Visitor locations
- 📱 Devices & browsers
- 🔗 External link clicks
- 🎯 Custom events you add

## Next Steps

- Add event tracking to your projects: `trackProjectClick('Project Name', 'github')`
- Add resume download tracking: `trackResumeDownload()`
- Add contact tracking: `trackContact('email')`
- See full documentation in `ANALYTICS_SETUP.md`

## Need Help?

- Check `ANALYTICS_SETUP.md` for detailed guide
- Visit [Umami Documentation](https://umami.is/docs)
- Check browser console for `[Analytics]` logs
