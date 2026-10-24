// Дымовой тест: собранное приложение открывается, у 3 и 4 класса есть плитки,
// каждая legacy-игра загружается без JS-ошибок, кнопка «назад» ведёт в хаб.
// Нужен playwright: npm i -D playwright && npx playwright install chromium
// Запуск: npx ng build && node tools/smoke.mjs
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const root = 'dist/uroki-ng/browser';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer(async (req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end('404'); }
}).listen(4317);

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = [];
page.on('pageerror', (e) => errs.push(page.url() + ': ' + e.message));
let fail = 0;
for (const grade of [3, 4]) {
  await page.goto(`http://localhost:4317/#/${grade}`);
  const links = await page.$$eval('a.g', (a) => a.map((x) => x.getAttribute('href')));
  console.log(`${grade} класс: ${links.length} игр`);
  if (!links.length) fail++;
  for (const href of links) {
    await page.goto('http://localhost:4317/' + href);
    await page.waitForTimeout(400);
    const back = await page.$('a[href*="#/"]');
    if (!back) { console.log('  нет ссылки в хаб:', href); fail++; }
  }
}
await b.close(); srv.close();
if (errs.length) console.log('JS-ошибки:\n' + errs.join('\n'));
process.exit(fail || errs.length ? 1 : 0);
