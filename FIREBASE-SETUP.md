# Firebase setup (menu and orders)

1. console.firebase.google.com > your project (`localiino`).
2. Build > Firestore Database > Create database (production mode, region eur3 or europe-west2).
3. Build > Authentication > Get started > Sign-in method:
   - enable **Google**
   - enable **Anonymous** (each tablet uses this to send orders; without it orders stay on the tablet and the Menu & prices screen shows a problem)
4. Authentication > Settings > Authorized domains > add `andrewfraser.com` and `andrewfraser95.github.io`.
5. Firestore > Rules: paste `firestore.rules`, replace `YOUR_EMAIL@gmail.com` with your own Google email (Annmarie's is already in), Publish.
6. `firebase-config.js` already holds your project config.
7. Run `node tools/stamp.js`, then commit and push. Open the till > Menu & prices > Sign in with Google > Save to all tablets.

## How it works
- **Menu:** only the owner accounts can change it. Other tablets pick it up automatically and keep a copy for offline use. Every save is also kept in `menuHistory`.
- **Orders:** each tablet saves orders on itself first, then sends them to the cloud (also after a dropped connection). Tablets can only add orders. They cannot read or change anyone's.
- **Order history:** signed in as an owner, Orders, the dashboard and the CSV export show every tablet's orders from the last 30 days. Signed out, a tablet shows its own.
- **Tablet names:** set one per tablet in Menu & prices > This tablet. It appears on tickets in history and as a Tablet column in the CSV.
- **Void an order:** Orders > tap the order > Void this order. It comes off the tablet's takings at once; the cloud copy is removed the same way as Reset today. Another tablet's order can only be voided by a signed-in owner.
- **Reset today:** removes the day's orders from the tablet. The cloud copies are deleted straight away if an owner is signed in, otherwise the next time an owner signs in on that tablet.
- The cloud keeps all orders. The tablet itself keeps 30 days.

## Notes
- The `apiKey` in `firebase-config.js` is meant to be public. GitHub may warn about it; that is a false positive. To be tidy, restrict it in Google Cloud Console > APIs & Services > Credentials > the browser key > Websites: `andrewfraser.com/*` and `andrewfraser95.github.io/*`.
- The first time the app is opened on a tablet it needs internet once to store itself. After that it opens offline.
