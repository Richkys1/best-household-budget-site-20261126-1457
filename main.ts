// DompetKeluarga — entrypoint (Node 22+, standard library only).
//
//   node main.ts                 copies app/ + screenshots/ to ./out and
//                                writes ./out/dossier.json
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//                                same, but to the named directory
//   node main.ts --serve         serves app/ at http://localhost:8080
//
// The site itself is plain static files under app/; this program only
// stages them for the make.fun gate and builds the dossier with the
// vendored buildDossier() helper. Nothing here fetches anything.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const APP_DIR = join(HERE, 'app');
const SHOTS_DIR = join(HERE, 'screenshots');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function fail(message: string): never {
  console.error('main.ts: ' + message);
  process.exit(1);
}

function stageSite(outDir: string): void {
  if (!existsSync(APP_DIR) || !statSync(APP_DIR).isDirectory()) fail('app/ is missing');
  if (!existsSync(join(APP_DIR, 'index.html'))) fail('app/index.html is missing');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(APP_DIR, join(outDir, 'app'), { recursive: true });
  if (existsSync(SHOTS_DIR)) cpSync(SHOTS_DIR, join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 4 * 1024 * 1024,
    screenshots: { max: 8, max_bytes: 4 * 1024 * 1024 },
    app_max_files: 1000,
    app_max_bytes: 10 * 1024 * 1024
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log('staged app/ + screenshots/ into ' + outDir + ' (dossier.json ' + dossier.length + ' bytes)');
}

// Serve app/ locally for a quick look. Serves only files inside app/,
// resolves / to index.html, and never follows a path outside the folder.
function serveSite(port: number): void {
  const server = createServer((req, res) => {
    const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
    const file = resolve(APP_DIR, rel);
    if (!file.startsWith(APP_DIR + '/') && file !== APP_DIR) {
      res.writeHead(403); res.end('forbidden'); return;
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  server.listen(port, () => console.log('DompetKeluarga at http://localhost:' + port + '/'));
}

const args = process.argv.slice(2);
if (args.includes('--serve')) {
  const port = Number(process.env.PORT || 8080);
  serveSite(Number.isSafeInteger(port) && port > 0 ? port : 8080);
} else {
  stageSite(resolve(process.env.MAKEFUN_OUTPUT_DIR || join(HERE, 'out')));
}
