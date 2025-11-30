# Performance Budget

This project enforces **strict bundle size limits** to ensure fast load times and optimal user experience.

## 📊 Current Limits

| Asset Type        | Limit  | Purpose               |
| ----------------- | ------ | --------------------- |
| **App Chunks**    | 150 KB | Your application code |
| **Vendor Chunks** | 400 KB | Third-party libraries |
| **CSS Files**     | 40 KB  | Stylesheets           |
| **Total Bundle**  | 650 KB | All assets combined   |

## 🚦 How It Works

The build will **automatically fail** if any bundle exceeds these limits. This happens:

- ✅ On every production build (`npm run build`)
- ✅ In CI/CD pipelines
- ✅ Before deployment

## 📈 Current Bundle Sizes

As of last build:

```
✅ CSS: 1.52 KB (limit: 40 KB)
✅ App code: 6.13 KB (limit: 150 KB)
✅ Vendor (React): 194.92 KB (limit: 400 KB)
✅ Total: 211.40 KB (limit: 650 KB)
```

**Status**: 🟢 All limits passing with plenty of headroom!

## 🔧 Adjusting Limits

Limits are configured in `vite.config.ts`:

```typescript
const BUNDLE_SIZE_LIMITS = {
  appChunk: 150, // KB - your application code
  vendorChunk: 400, // KB - third-party libraries
  totalSize: 650, // KB - entire bundle
  cssFile: 40, // KB - stylesheets
};
```

### When to Adjust Limits

**Increase limits only if:**

- You've exhausted all optimization options
- The features justify the size increase
- You've documented the reason

**Always prefer optimization over increasing limits:**

- Code splitting
- Dynamic imports
- Tree shaking
- Compression

## 🔍 Analyzing Your Bundle

### Quick Analysis

```bash
npm run analyze
```

This will:

1. Build with sourcemaps
2. Open an interactive visualization
3. Show what's taking up space

### What to Look For

- **Large dependencies**: Can you find lighter alternatives?
- **Duplicated code**: Can you extract shared modules?
- **Unused code**: Can you tree-shake better?
- **Large components**: Can you lazy-load them?

## 💡 Optimization Strategies

### 1. Code Splitting

Split large features into separate chunks that load on demand:

```typescript
// Instead of this:
import HeavyComponent from './HeavyComponent';

// Do this:
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 2. Dynamic Imports

Load features only when needed:

```typescript
// Load analytics only when user consents
if (userConsent) {
  const analytics = await import('./analytics');
  analytics.init();
}
```

### 3. Tree Shaking

Import only what you need:

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';

// ✅ Good - imports specific function
import debounce from 'lodash/debounce';
```

### 4. Lazy Load Images

Use native lazy loading:

```tsx
<img src="large-image.jpg" loading="lazy" alt="Description" />
```

### 5. Compression

Ensure your hosting platform serves compressed assets:

- Brotli compression (better)
- Gzip compression (fallback)

## 🚨 When Build Fails

If the build fails due to bundle size:

```
🚨 Bundle size limit exceeded:

❌ app-chunk.js: 200.43 KB (limit: 150 KB)
❌ Total bundle size 700.12 KB exceeds limit of 650 KB

💡 Consider:
   - Code splitting
   - Dynamic imports
   - Tree shaking unused code
   - Analyzing bundle with: npm run analyze
```

### Steps to Fix

1. **Run the analyzer**:

   ```bash
   npm run analyze
   ```

2. **Identify the largest chunks** in the visualization

3. **Apply optimizations** based on what you find

4. **Rebuild and verify**:

   ```bash
   npm run build
   ```

5. **If optimization isn't enough**, consider whether the limit increase is justified

## 📱 Performance Targets

These bundle sizes support:

- ⚡ **Fast 3G**: < 5 second load
- 📡 **4G**: < 2 second load
- 🚀 **Broadband**: < 1 second load

### Lighthouse Scores

Target scores (on fast 3G throttled):

- **Performance**: 90+
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Time to Interactive**: < 4s

Run Lighthouse locally with:

```bash
npm run lighthouse
```

## 🎯 Best Practices

### Do's ✅

- Keep bundles under limits
- Use code splitting liberally
- Lazy load non-critical features
- Monitor bundle size in every PR
- Run analyzer before adding large dependencies

### Don'ts ❌

- Don't import entire libraries
- Don't bundle development-only code
- Don't inline large assets
- Don't disable the size checks
- Don't increase limits without justification

## 📚 Resources

- [Web.dev: Performance Budgets](https://web.dev/performance-budgets-101/)
- [Vite: Build Optimizations](https://vitejs.dev/guide/build.html)
- [React: Code Splitting](https://react.dev/reference/react/lazy)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

## 🔄 Regular Maintenance

**Monthly**:

- Review bundle sizes
- Check for new optimizations
- Update dependencies

**Per Feature**:

- Run analyzer before/after
- Document size impact
- Optimize if needed

**Per Release**:

- Verify all limits passing
- Document any limit changes
- Run full Lighthouse audit

---

**Remember**: Every kilobyte counts. Smaller bundles = happier users! 🎉
