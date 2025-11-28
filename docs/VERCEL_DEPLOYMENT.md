# Vercel Deployment Guide

Complete step-by-step guide to deploy your portfolio to Vercel.

## ✨ Why Vercel?

- ⚡ **Zero configuration** - Detects Vite automatically
- 🚀 **Lightning fast** - Edge network worldwide
- 🔄 **Auto-deployments** - Every push to main deploys automatically
- 🌐 **Free SSL** - HTTPS included
- 💰 **Generous free tier** - Perfect for portfolios
- 📱 **Perfect PWA support** - Service workers work flawlessly
- 🔍 **Preview deployments** - Test PRs before merging

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Project

**Before deploying, ensure:**

1. **PWA Icons are ready** (recommended but optional for first deploy)
   - If not ready, see [PWA.md](PWA.md) for icon generation instructions
   - You can add these later and redeploy

2. **Build works locally:**

   ```bash
   npm run build
   npm run start:prod
   ```

   If this works, you're ready to deploy!

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: prepare for deployment"
   git push origin main
   ```

---

### Step 2: Sign Up for Vercel

1. **Go to:** [vercel.com](https://vercel.com)

2. **Sign up:**
   - Click "Start Deploying"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub

---

### Step 3: Import Your Project

1. **Import Git Repository:**
   - Click "Add New..." → "Project"
   - Or click "Import Project"

2. **Select Repository:**
   - Find "my-portfolio" in the list
   - Click "Import"

3. **Configure Project:**

   Vercel will auto-detect everything! You'll see:

   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

   ✅ **These are perfect - don't change them!**

---

### Step 4: Set Environment Variables

**Click "Environment Variables"** and add:

#### Required:

```
Name: VITE_SITE_URL
Value: (leave empty for now, we'll add after deploy)
```

#### Optional (add if you're using them):

```
VITE_APP_TITLE
JP - Engineering

VITE_APP_DESCRIPTION
A modern portfolio showcasing my projects and skills

VITE_ENABLE_ANALYTICS
true

VITE_UMAMI_WEBSITE_ID
(your Umami website ID - if using)
```

💡 **Tip:** You can add these later in Settings → Environment Variables

---

### Step 5: Deploy!

1. **Click "Deploy"**

2. **Wait ~2 minutes** ⏱️
   - Watch the build logs (cool to see!)
   - See each step complete

3. **Success! 🎉**
   - You'll see: "Congratulations! Your project has been deployed."
   - Get a URL like: `https://my-portfolio-abc123.vercel.app`

---

### Step 6: Update Your Site URL

**Important for PWA and sitemap:**

1. **Copy your Vercel URL** (e.g., `https://my-portfolio-abc123.vercel.app`)

2. **Add it to Vercel:**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_SITE_URL` = your Vercel URL
   - Click "Save"

3. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - Or just push a new commit

4. **Update your code:**
   ```bash
   # Update src/pwa-config.ts and src/config/seo.ts with your real URL
   # Then commit and push
   git add .
   git commit -m "chore: update site URL"
   git push origin main
   ```

---

## 🌐 Add a Custom Domain (Optional)

### Using Your Own Domain

1. **Go to:** Project Settings → Domains

2. **Add Domain:**
   - Enter your domain (e.g., `yourname.com`)
   - Click "Add"

3. **Configure DNS:**

   Vercel will show you DNS records to add. Two options:

   **Option A: Nameservers (Recommended)**

   ```
   Update your domain's nameservers to:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

   **Option B: A/CNAME Records**

   ```
   A Record:  @ → 76.76.21.21
   CNAME:     www → cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (5 minutes to 48 hours)

5. **SSL automatically enabled** 🔒

### Free Domain Options

If you don't have a domain:

- **[Namecheap](https://www.namecheap.com/)** - ~$10/year
- **[Cloudflare](https://www.cloudflare.com/products/registrar/)** - At-cost pricing
- **[Google Domains](https://domains.google/)** - ~$12/year
- **Stick with Vercel subdomain** - Free and works great!

---

## 🔄 Automatic Deployments

**Already set up!** Every time you push to GitHub:

```bash
# Make changes to your portfolio
git add .
git commit -m "feat: add new project"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your project
# 3. Deploys to production
# 4. Updates your live site
# ✨ Takes ~2 minutes!
```

---

## 🔍 Preview Deployments

**Test changes before going live:**

1. **Create a branch:**

   ```bash
   git checkout -b feature/new-design
   ```

2. **Make changes and push:**

   ```bash
   git add .
   git commit -m "feat: redesign homepage"
   git push origin feature/new-design
   ```

3. **Create Pull Request on GitHub**

4. **Vercel automatically:**
   - Creates a preview deployment
   - Comments on PR with preview URL
   - Updates preview on every new commit

5. **Test the preview URL**

6. **Merge to main** when satisfied → Auto-deploys to production!

---

## 🧪 Testing Your Deployment

### 1. Check PWA Functionality

**Open your deployed site:**

```
1. Press F12 (DevTools)
2. Go to Application tab
3. Check:
   ✓ Manifest loads
   ✓ Service Worker registers
   ✓ Icons display correctly
```

**Test offline:**

```
1. In DevTools → Network tab
2. Select "Offline" from dropdown
3. Refresh page
4. Should still work! ✅
```

### 2. Run Lighthouse Audit

```
1. Open your site
2. Press F12 (DevTools)
3. Go to Lighthouse tab
4. Select:
   ✓ Performance
   ✓ Accessibility
   ✓ Best Practices
   ✓ SEO
   ✓ Progressive Web App
5. Click "Analyze page load"
```

**Target Scores:**

- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100 (if icons are added)

### 3. Test on Mobile

**Share your link and test:**

- Opens correctly on mobile
- Install prompt appears
- Works offline after first visit
- Responsive design looks good

### 4. Verify SEO

**Check these URLs work:**

- `https://your-site.vercel.app/sitemap.xml` ✓
- `https://your-site.vercel.app/robots.txt` ✓
- `https://your-site.vercel.app/manifest.webmanifest` ✓

---

## ⚙️ Vercel Project Settings

### Key Settings to Know

**General:**

- Project Name: `my-portfolio`
- Framework: Vite
- Root Directory: `./` (don't change)

**Build & Development:**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**

- Add all `VITE_*` variables here
- Can have different values for Production/Preview/Development

**Git:**

- Production Branch: `main`
- Auto-deploy: ✓ Enabled

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics (Free)

1. **Go to:** Project → Analytics
2. **Enable Analytics**
3. **See:**
   - Page views
   - Top pages
   - Visitor countries
   - Performance metrics

### Custom Analytics (Umami)

If using Umami, it's already configured via environment variables!

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Build failed with exit code 1`

**Solutions:**

1. **Check build logs** in Vercel dashboard
2. **Test build locally:**
   ```bash
   npm run build
   ```
3. **Common fixes:**
   ```bash
   # Clear and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```
4. **Check for TypeScript errors**
5. **Verify all environment variables are set**

### 404 on Page Refresh

**Issue:** Refreshing a route gives 404

**Solution:** Vercel should handle this automatically, but if not:

Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment Variables Not Working

**Issue:** Variables undefined in production

**Fixes:**

1. ✓ Variables must start with `VITE_`
2. ✓ Added in Vercel dashboard
3. ✓ Redeploy after adding variables
4. ✓ Check Production scope is selected

### PWA Not Installing

**Issue:** Install prompt doesn't appear

**Checks:**

- ✓ HTTPS enabled (Vercel does this automatically)
- ✓ Icons exist: `/pwa-192x192.png`, `/pwa-512x512.png`
- ✓ Manifest accessible: `/manifest.webmanifest`
- ✓ Service Worker registers (check DevTools)

### Slow Build Times

**Issue:** Builds take too long

**Solutions:**

1. Check bundle size: `npm run analyze`
2. Remove unused dependencies
3. Optimize images before committing
4. Use dynamic imports for large components

---

## 🔒 Security Best Practices

### Environment Variables

✅ **DO:**

- Store secrets in Vercel environment variables
- Use different values for preview/production
- Prefix client-safe variables with `VITE_`

❌ **DON'T:**

- Commit `.env` files to Git
- Expose API keys client-side (unless public)
- Share environment variable values

### Headers

Vercel automatically sets:

- ✓ HTTPS/SSL
- ✓ Security headers
- ✓ CORS (if needed)

---

## 📈 Optimize for Production

### After Initial Deploy

1. **Add PWA Icons**
   - Improves installability
   - Better UX on mobile
   - See [PWA.md](PWA.md) for icon generation instructions

2. **Configure Analytics**
   - Set up Umami or Vercel Analytics
   - Track visitor behavior
   - Monitor performance

3. **Submit to Search Engines**

   ```
   Google Search Console: https://search.google.com/search-console
   Bing Webmaster: https://www.bing.com/webmasters

   Submit: https://your-site.vercel.app/sitemap.xml
   ```

4. **Share Your Portfolio!** 🎉
   - Add to LinkedIn
   - Update GitHub profile
   - Share on Twitter
   - Add to resume

---

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Test changes before production
   - Share preview links with friends
   - Catch bugs early

2. **Check Build Logs**
   - Great for debugging
   - See what's happening
   - Learn about the build process

3. **Monitor Performance**
   - Run Lighthouse monthly
   - Check Vercel Analytics
   - Optimize as needed

4. **Keep Dependencies Updated**
   - Dependabot is configured
   - Review and merge updates
   - Test in preview first

5. **Use Edge Network**
   - Your site is already on it!
   - Fast globally
   - No extra config needed

---

## 📚 Next Steps

After deploying:

- [ ] Test PWA functionality
- [ ] Run Lighthouse audit
- [ ] Add custom domain (optional)
- [ ] Configure analytics
- [ ] Submit sitemap to search engines
- [ ] Share your portfolio!
- [ ] Keep building and improving

---

## 🆘 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 🎉 Congratulations!

Your portfolio is now live on Vercel! 🚀

**What you get:**

- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Auto deployments
- ✅ Preview URLs
- ✅ Perfect PWA support
- ✅ Zero maintenance

Keep building amazing things! 💪
