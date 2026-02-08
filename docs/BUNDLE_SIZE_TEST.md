# Testing Bundle Size Limits

This document shows how to verify that bundle size limits are properly enforced.

## 🧪 Manual Test

To test that the build fails when limits are exceeded:

### 1. Temporarily Lower a Limit

Edit `vite.config.ts`:

```typescript
const BUNDLE_SIZE_LIMITS = {
  appChunk: 5, // Lowered from 150 to 5 KB
  vendorChunk: 400,
  totalSize: 650,
  cssFile: 70,
};
```

### 2. Try to Build

```bash
npm run build
```

### 3. Expected Failure

You should see:

```
🚨 Bundle size limit exceeded:

❌ index-Cgzczrl3.js: 6.13 KB (limit: 5 KB)

💡 Consider:
   - Code splitting
   - Dynamic imports
   - Tree shaking unused code
   - Analyzing bundle with: npm run analyze

Error: Build failed due to bundle size limits
```

### 4. Restore Original Limits

Revert `vite.config.ts` to original values:

```typescript
const BUNDLE_SIZE_LIMITS = {
  appChunk: 150,
  vendorChunk: 400,
  totalSize: 650,
  cssFile: 70,
};
```

### 5. Verify Build Succeeds

```bash
npm run build
```

Should show:

```
✅ All bundle size checks passed!
```

## 🤖 CI/CD Integration

The bundle size checks run automatically in CI/CD. A failed build will:

- ❌ Prevent deployment
- 📊 Show which files exceeded limits
- 💡 Suggest optimization strategies
- 🚫 Block PR merge (if configured)

## 📊 Monitoring

### Current Status

Run this to see current bundle sizes:

```bash
npm run build
```

### Analyze Bundle

To analyze bundle composition:

```bash
npm run build:analyze
```

### Trends Over Time

To track bundle size changes:

1. **In CI**: Save build output to artifacts
2. **In PRs**: Compare bundle sizes before/after
3. **In monitoring**: Track bundle size metrics

### GitHub Actions Example

```yaml
- name: Build and check bundle size
  run: npm run build

- name: Upload bundle stats
  uses: actions/upload-artifact@v5
  with:
    name: bundle-stats
    path: dist/
```

## 🔍 Bundle Analysis in CI

For detailed analysis in CI/CD:

```yaml
- name: Analyze bundle
  run: npm run build:analyze
  if: failure() # Only run if build failed
```

This helps debug bundle size issues directly from CI logs.

## ✅ Best Practices

1. **Run locally before pushing**: `npm run build`
2. **Check analysis for large features**: `npm run build:analyze`
3. **Monitor bundle size in PRs**: Compare before/after
4. **Set up alerts**: Notify team when approaching limits
5. **Document size increases**: Justify in PR descriptions

## 🎯 Success Criteria

A good performance budget should:

- ✅ Pass on every commit to main
- ✅ Prevent accidental bloat
- ✅ Encourage optimization
- ✅ Enable fast deployment
- ✅ Support target user experience

---

**Remember**: These limits protect your users' experience! 🚀
