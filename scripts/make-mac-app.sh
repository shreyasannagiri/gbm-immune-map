#!/bin/bash
#
# Build "GBM Immune Map.app" — a double-clickable Mac app that opens the
# figure in its own chromeless window. The whole figure is one HTML file
# inside the bundle, so the app needs no server, no Node, and no network.
#
#   npm run app
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/desktop/GBM Immune Map.app"
PAGE="$ROOT/dist/standalone.html"

[ -f "$PAGE" ] || { echo "run 'npm run build:artifact' first"; exit 1; }

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cp "$PAGE" "$APP/Contents/Resources/app.html"

# icon, if Pillow is available in the repo venv
if [ -x "$ROOT/.venv-pillow/bin/python3" ]; then
  PY="$ROOT/.venv-pillow/bin/python3"
elif PY="$(command -v python3)"; then :; else PY=""; fi
if [ -n "$PY" ] && "$PY" -c "import PIL" 2>/dev/null; then
  "$PY" "$ROOT/scripts/make-icon.py" >/dev/null 2>&1 || true
  [ -f "$ROOT/build/icon/icon.icns" ] && cp "$ROOT/build/icon/icon.icns" "$APP/Contents/Resources/icon.icns"
fi

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>GBM Immune Map</string>
  <key>CFBundleDisplayName</key><string>GBM Immune Map</string>
  <key>CFBundleIdentifier</key><string>edu.lab.gbm-immune-map</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>launch</string>
  <key>CFBundleIconFile</key><string>icon</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

cat > "$APP/Contents/MacOS/launch" <<'SH'
#!/bin/bash
# Open the bundled figure in its own window: a Chromium browser in app mode
# gives a clean standalone window; otherwise fall back to the default browser.
HERE="$(cd "$(dirname "$0")/../Resources" && pwd)"
PAGE="file://$HERE/app.html"

for BROWSER in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
  if [ -d "/Applications/$BROWSER.app" ]; then
    open -na "$BROWSER" --args \
      --app="$PAGE" \
      --window-size=1680,1020 \
      --allow-file-access-from-files
    exit 0
  fi
done

open "$PAGE"
SH

chmod +x "$APP/Contents/MacOS/launch"

# make sure Finder picks up the icon straight away
touch "$APP"

echo "built: $APP"
