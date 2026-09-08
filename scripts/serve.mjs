import http from 'http';
import fs from 'fs';
import path from 'path';
import { buildSite } from './build-site.mjs';

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.resolve('site');

// Recompilation automatique des données au démarrage / redémarrage
buildSite(true);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(SITE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 : Ressource non trouvée');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🎣 Fiches Pêche Normandie — Serveur actif [Watch Mode]`);
  console.log(`➡️  Disponible sur : http://localhost:${PORT}`);
  console.log(`⚡ Surveillance active : redémarrage automatique en cas de modification`);
  console.log(`============================================================\n`);
});
