# 🚀 CI/CD Instructions - Mobile Build Fix

## ❌ Problem
```
[09:48:46]: No dist found in root of project.
fastlane finished with errors
```

## ✅ Solution

### For CI/CD Systems (GitLab, GitHub Actions, etc.)

**Use this command instead of `npm run build`:**

```bash
npm run build:ionic
```

### Why This Works

1. **Fastlane expects**: Files in `dist/` directory
2. **Next.js creates**: Files in `.next/` directory  
3. **Our script**: Bridges the gap by copying files to `dist/`

### Available Build Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run build` | Standard Next.js build | Web deployment |
| `npm run build:mobile` | Basic mobile build | Local development |
| `npm run build:ionic` | **Robust mobile build** | **CI/CD pipelines** |

### CI/CD Configuration Examples

#### GitLab CI (.gitlab-ci.yml)
```yaml
build_mobile:
  script:
    - npm ci
    - npm run build:ionic  # ← Use this command
    - ls -la dist/          # Verify dist exists
```

#### GitHub Actions
```yaml
- name: Build for mobile
  run: npm run build:ionic  # ← Use this command

- name: Verify dist directory
  run: ls -la dist/
```

#### Ionic Appflow
```json
{
  "build": {
    "commands": [
      "npm ci",
      "npm run build:ionic"  // ← Use this command
    ]
  }
}
```

### What the Script Does

1. ✅ Runs `npm run build` (Next.js)
2. ✅ Creates `dist/` directory
3. ✅ Copies static files from `.next/static` to `dist/_next/static`
4. ✅ Creates mobile-optimized `index.html`
5. ✅ Creates PWA `manifest.json`
6. ✅ Verifies everything is ready

### Expected Output

After successful build, you should see:
```
🎉 Mobile build completed successfully!
📱 The dist/ directory is ready for Capacitor/Fastlane

🚀 Next steps:
   - npx cap sync android
   - npx cap build android
```

### Troubleshooting

If the error persists:

1. **Check the build command** in your CI/CD configuration
2. **Verify** `npm run build:ionic` is being used
3. **Add verification step**:
   ```bash
   ls -la dist/
   find dist/ -type f
   ```

### Files Structure After Build

```
dist/
├── index.html          # Mobile-optimized entry point
├── manifest.json       # PWA configuration
└── _next/
    └── static/         # Next.js static assets
        ├── chunks/
        └── css/
```

---

## 🔧 Quick Fix for Existing CI/CD

**Replace this:**
```bash
npm run build
```

**With this:**
```bash
npm run build:ionic
```

**That's it!** 🎉