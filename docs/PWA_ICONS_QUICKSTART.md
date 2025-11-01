# PWA Icons Quick Start

## 🎯 What You Need

Two icon files in your `public/` folder:

- `pwa-192x192.png` (192 × 192 pixels)
- `pwa-512x512.png` (512 × 512 pixels)

## ⚡ Fastest Method: Online Generator

### Option 1: Favicon.io (Easiest)

1. Go to **[https://favicon.io/favicon-converter/](https://favicon.io/favicon-converter/)**
2. Upload your logo (PNG or JPG)
3. Click "Download"
4. Extract the zip file
5. Copy `android-chrome-192x192.png` → Rename to `pwa-192x192.png`
6. Copy `android-chrome-512x512.png` → Rename to `pwa-512x512.png`
7. Move both files to your `public/` folder

### Option 2: PWA Builder (Recommended)

1. Go to **[https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)**
2. Upload your logo (1024×1024 recommended)
3. Adjust padding if needed
4. Click "Download"
5. Extract and find:
   - `android-chrome-192.png` → Rename to `pwa-192x192.png`
   - `android-chrome-512.png` → Rename to `pwa-512x512.png`
6. Move to `public/` folder

### Option 3: RealFaviconGenerator (Most Comprehensive)

1. Go to **[https://realfavicongenerator.net/](https://realfavicongenerator.net/)**
2. Upload your logo
3. Customize settings (optional)
4. Generate icons
5. Download the package
6. Find and rename:
   - `android-chrome-192x192.png` → `pwa-192x192.png`
   - `android-chrome-512x512.png` → `pwa-512x512.png`
7. Move to `public/` folder

## 🛠️ Using Command Line (For Developers)

### Install PWA Asset Generator

```bash
npm install -g pwa-asset-generator
```

### Generate Icons

```bash
# From a source logo (1024x1024 recommended)
pwa-asset-generator path/to/your/logo.png public/ \
  --icon-only \
  --type png \
  --background "#242424" \
  --padding "10%"
```

This will generate all required sizes automatically!

## 🎨 Design Tips

### Source Image Guidelines

| Aspect      | Recommendation                        |
| ----------- | ------------------------------------- |
| **Size**    | 1024×1024 pixels (or larger)          |
| **Format**  | PNG with transparent background       |
| **Content** | Keep important elements in center 80% |
| **Design**  | Simple, recognizable at small sizes   |
| **Text**    | Avoid (or use large, bold text only)  |
| **Colors**  | High contrast, 2-3 colors max         |

### What Makes a Good PWA Icon?

✅ **Good:**

- Simple geometric shapes
- Single letter/monogram
- Iconic symbol
- Bold colors
- Transparent background

❌ **Avoid:**

- Complex illustrations
- Small text
- Detailed photos
- Thin lines
- Gradients (use sparingly)

## 📏 Quick Photoshop/GIMP Steps

1. **Open your logo** (high resolution)
2. **Canvas size:** Make it square (e.g., 1024×1024)
3. **Center your logo**
4. **Add padding:** Keep logo in center ~80% area
5. **Export 512×512:**
   - File → Export → PNG
   - Width: 512, Height: 512
   - Name: `pwa-512x512.png`
6. **Export 192×192:**
   - Resize to 192×192
   - Export as `pwa-192x192.png`
7. **Move to `public/` folder**

## 🧪 Test Your Icons

After adding icons:

```bash
# Build your project
npm run build

# Preview in production mode
npm run start:prod
```

### Check in Browser:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the sidebar
4. Verify icons are listed and load correctly

## ✅ Checklist

- [ ] Created/acquired source logo (1024×1024 recommended)
- [ ] Generated `pwa-192x192.png`
- [ ] Generated `pwa-512x512.png`
- [ ] Moved both files to `public/` folder
- [ ] Built project: `npm run build`
- [ ] Tested in browser DevTools → Application → Manifest
- [ ] Icons show up correctly (no broken images)

## 🆘 Troubleshooting

**Icons not showing in manifest?**

- Check file names match exactly: `pwa-192x192.png`, `pwa-512x512.png`
- Ensure files are in `public/` folder (not `src/`)
- Rebuild: `npm run build`
- Clear cache and reload

**Icons look blurry or pixelated?**

- Use a higher resolution source image
- Export at exact sizes (don't let browser scale)
- Use PNG format, not JPG

**Background color issues?**

- Update `theme_color` and `background_color` in `src/pwa-config.ts`
- Match your site's primary color

## 📚 Additional Resources

- [PWA Icons Guidelines](https://web.dev/add-manifest/#icons)
- [Maskable Icons Editor](https://maskable.app/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

---

Need more help? Check the full [PWA Setup Guide](PWA_SETUP.md).
