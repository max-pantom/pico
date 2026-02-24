# Pico Electron Icons

Place your app icons in this folder with these exact names:

- `icon.icns` (macOS)
- `icon.ico` (Windows)
- `icon.png` (Linux + runtime dev window icon)

Recommended source size before conversion: `1024x1024` PNG.

## Convert on macOS

From a 1024x1024 source PNG (`icon-1024.png`):

```bash
mkdir icon.iconset
sips -z 16 16     icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon-1024.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon-1024.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_512x512.png
cp icon-1024.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns
```

## Build desktop packages

```bash
npm run desktop:dist
```

Output artifacts are generated in `release/`.
