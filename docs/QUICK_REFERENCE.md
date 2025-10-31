# Quick Reference Guide

## 🚀 Quick Deploy to Vercel

**Fastest way to get your portfolio live:**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project" → Select "my-portfolio"
4. Click "Deploy"
5. Done in 2 minutes! 🎉

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed guide.

## 🚀 Common Commands

### Development

```bash
npm run start:dev          # Start dev server
npm run build              # Build for production
npm run start:prod         # Preview production build
```

### Testing

```bash
npm test                   # Unit tests (watch)
npm run test:unit          # Unit tests (run once)
npm run test:coverage      # Tests with coverage
npm run test:e2e           # E2E tests
npm run test:a11y          # Accessibility tests
```

### Code Quality

```bash
npm run lint:fix           # Fix linting issues
npm run analyze            # Analyze bundle size
```

### Releases

```bash
npm run release            # Auto-version release
npm run release:patch      # Patch version (0.0.X)
npm run release:minor      # Minor version (0.X.0)
npm run release:major      # Major version (X.0.0)
```

### Utilities

```bash
npm run sitemap:generate   # Generate sitemap manually
```

## 📁 Project Structure

```
my-portfolio/
├── public/               # Static assets
│   ├── pwa-192x192.png  # PWA icon (192×192)
│   ├── pwa-512x512.png  # PWA icon (512×512)
│   ├── robots.txt       # Search engine rules
│   └── sitemap.xml      # Auto-generated sitemap
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── pwa-config.ts    # PWA configuration
├── scripts/             # Build scripts
│   ├── generate-sitemap.ts
│   └── vite-plugin-sitemap.ts
├── docs/                # Documentation
├── e2e/                 # E2E tests
└── dist/                # Build output
```

## 🔧 Configuration Files

| File                   | Purpose                     |
| ---------------------- | --------------------------- |
| `vite.config.ts`       | Vite build configuration    |
| `tsconfig.json`        | TypeScript configuration    |
| `eslint.config.js`     | ESLint rules                |
| `playwright.config.ts` | E2E test configuration      |
| `vitest.config.ts`     | Unit test configuration     |
| `.versionrc.json`      | Changelog generation config |
| `commitlint.config.js` | Commit message rules        |
| `src/pwa-config.ts`    | PWA/Service Worker config   |

## 🌍 Environment Variables

Create a `.env` file in the root:

```env
# Required
VITE_APP_TITLE="My Portfolio"
VITE_APP_DESCRIPTION="A modern portfolio website"
VITE_API_URL="https://api.example.com"

# Optional
VITE_SITE_URL="https://yoursite.com"
VITE_ENABLE_ANALYTICS="true"
VITE_UMAMI_WEBSITE_ID="your-id"
VITE_SENTRY_DSN="your-dsn"
```

## 📝 Commit Convention

```bash
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation
style:    # Code style (formatting)
refactor: # Code refactoring
perf:     # Performance improvement
test:     # Tests
build:    # Build system
ci:       # CI/CD
chore:    # Maintenance
```

**Examples:**

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve navigation bug on mobile"
git commit -m "docs: update setup instructions"
```

## 🎯 PWA Quick Setup

1. **Generate icons:**
   - Visit: https://favicon.io/favicon-converter/
   - Upload logo → Download
   - Rename to `pwa-192x192.png` and `pwa-512x512.png`
   - Place in `public/` folder

2. **Configure manifest:**
   - Edit `src/pwa-config.ts`
   - Update name, colors, description

3. **Test:**
   ```bash
   npm run build
   npm run start:prod
   ```

   - Open DevTools → Application → Manifest
   - Verify icons and service worker

## 🧪 Testing Checklist

- [ ] Unit tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] A11y tests pass: `npm run test:a11y`
- [ ] Linting passes: `npm run lint:ci`
- [ ] Bundle size within limits: `npm run build`
- [ ] PWA works offline
- [ ] Lighthouse score 90+

## 🚀 Deployment Checklist

### Before Deploy

- [ ] All tests passing
- [ ] PWA icons in `public/`
- [ ] Environment variables set
- [ ] `VITE_SITE_URL` configured
- [ ] Build succeeds locally
- [ ] Bundle sizes acceptable

### Platform Setup (Vercel)

- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variables
- [ ] Enable HTTPS
- [ ] Test deployment

### Post-Deploy

- [ ] Site loads correctly
- [ ] PWA installable
- [ ] Service worker registers
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Analytics working (if enabled)
- [ ] Error tracking working (if enabled)
- [ ] Run Lighthouse audit

## 📊 Monitoring

### Key URLs

- Production: `https://yoursite.com`
- Sitemap: `https://yoursite.com/sitemap.xml`
- Robots: `https://yoursite.com/robots.txt`
- Manifest: `https://yoursite.com/manifest.webmanifest`

### Tools

- **Lighthouse** - Performance & PWA audit
- **Chrome DevTools** - Debugging & testing
- **Sentry** - Error monitoring (if configured)
- **Umami** - Analytics (if configured)

## 🆘 Common Issues

### Service Worker Not Registering

```bash
# Clear cache and reload
# Check: DevTools → Application → Service Workers
# Verify HTTPS enabled (required for PWA)
```

### Build Fails

```bash
# Check TypeScript errors
npm run build

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### PWA Icons Missing

```bash
# Verify files exist:
ls -la public/pwa-*.png

# Should show:
# pwa-192x192.png
# pwa-512x512.png
```

### Sitemap Not Generating

```bash
# Set VITE_SITE_URL environment variable
echo "VITE_SITE_URL=https://yoursite.com" >> .env

# Generate manually
npm run sitemap:generate
```

## 📚 Documentation Index

- [README](../README.md) - Project overview
- [Quick Reference](QUICK_REFERENCE.md) - This file
- [Vercel Deployment](VERCEL_DEPLOYMENT.md) - ⭐ Deploy your portfolio
- [PWA Setup](PWA_SETUP.md) - Full PWA guide
- [PWA Icons](PWA_ICONS_QUICKSTART.md) - Icon generation
- [Changelog Guide](CHANGELOG_GUIDE.md) - Version management
- [Sentry Setup](SENTRY_SETUP.md) - Error monitoring
- [Analytics Setup](ANALYTICS_SETUP.md) - Analytics integration
- [SEO Guide](SEO.md) - SEO optimization
- [Accessibility Testing](ACCESSIBILITY_TESTING.md) - A11y testing
- [Environment Variables](ENV.md) - Configuration

## 💡 Pro Tips

1. **Use the right commit type** - It affects versioning
2. **Test PWA offline** - Always test without network
3. **Check bundle size** - Keep it under limits
4. **Update icons** - Generate proper PWA icons before deploy
5. **Set VITE_SITE_URL** - Required for sitemap generation
6. **Run Lighthouse** - Aim for 90+ scores
7. **Enable HTTPS** - Required for PWA features
8. **Test on mobile** - PWA features shine on mobile

---

Need more details? Check the [full documentation](../README.md#-additional-documentation).
