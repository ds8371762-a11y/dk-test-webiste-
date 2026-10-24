// Full-page screenshot via the locally installed Google Chrome (headless).
// Usage: node screenshot.mjs http://localhost:3000 [label]
// Optional env: WIDTH (default 1440), HEIGHT (default 6000).
// Saves to ./temporary screenshots/screenshot-N[-label].png, never overwriting.
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, 'temporary screenshots');
const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const [url, label] = process.argv.slice(2);
if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}
if (url.startsWith('file:')) {
  console.error('Refusing file:// URLs. Serve the project with `node serve.mjs` and use http://localhost:3000.');
  process.exit(1);
}

const chrome = CHROME_PATHS.find((p) => existsSync(p));
if (!chrome) {
  console.error('Google Chrome not found. Install it or add its path to CHROME_PATHS.');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// Next free number, so existing screenshots are never overwritten.
const used = readdirSync(OUT_DIR)
  .map((f) => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const n = (used.length ? Math.max(...used) : 0) + 1;

const safeLabel = label ? `-${label.replace(/[^a-z0-9-_]+/gi, '-')}` : '';
const outFile = join(OUT_DIR, `screenshot-${n}${safeLabel}.png`);

const width = Number(process.env.WIDTH) || 1440;
const height = Number(process.env.HEIGHT) || 6000;
if (width < 500) {
  console.warn('Note: headless Chrome renders no narrower than 500px. Screenshot will be cropped below that.');
}

const args = [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  `--window-size=${Math.max(width, 500)},${height}`,
  '--virtual-time-budget=5000',
  `--screenshot=${outFile}`,
  url,
];

execFile(chrome, args, { timeout: 60000 }, (err) => {
  if (err && !existsSync(outFile)) {
    console.error('Screenshot failed:', err.message);
    process.exit(1);
  }
  console.log(outFile);
});
