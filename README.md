# LocaLino till

Order till for LocaLino Pizza. An installable web app (PWA): works offline, installs to the home screen, prints chef tickets over Bluetooth, and syncs the menu and orders through Firebase.

## Files
- `index.html`, `css/app.css`, `js/app.js`: the app
- `sw.js`, `manifest.webmanifest`, `icons/`: offline support and install
- `vendor/`: Firebase libraries (kept here so the app does not depend on an outside CDN)
- `fonts/`: Archivo and IBM Plex Mono
- `firebase-config.js`: Firebase project settings (not secret)
- `firestore.rules`: security rules to paste into the Firebase console
- `FIREBASE-SETUP.md`: one-off cloud setup

## Updating the live site
1. Change files.
2. Run `node tools/stamp.js` (gives the service worker a new version so tablets notice the change).
3. `git add -A`, `git commit`, `git push`.

Tablets show "A new version is ready" and update when someone taps **Update now**, so nothing changes mid-order.
