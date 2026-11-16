// Run after changing any app file:  node tools/stamp.js
// Gives the service worker a new version so tablets pick up the change.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..');
const swPath = path.join(root, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
const m = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!m) throw new Error('ASSETS list not found in sw.js');
const files = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).filter((f) => f !== './');
const h = crypto.createHash('sha1');
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) throw new Error('Listed in sw.js but missing: ' + f);
  h.update(f).update(fs.readFileSync(p));
}
const v = h.digest('hex').slice(0, 10);
sw = sw.replace(/const VERSION = '[^']*';/, "const VERSION = '" + v + "';");
fs.writeFileSync(swPath, sw);
console.log('sw.js version ' + v + ' (' + files.length + ' files)');
