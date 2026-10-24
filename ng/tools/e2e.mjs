// Полное прохождение ВСЕХ Angular-паков из хаба: каждая тема, каждый режим, раунд до «Готово!».
// Отвечает правильно, читая текущий шаг через тестовый хук window.__STEP__.
// Нужен playwright: npm i -D playwright && npx playwright install chromium
// Запуск: npx ng build && node tools/e2e.mjs   (ширина 390 px; скриншоты в tools/shots/)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const root = 'dist/uroki-ng/browser';
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer(async (q, r) => {
  let p = join(root, decodeURIComponent(q.url.split('?')[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); r.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }); r.end(await readFile(p)); }
  catch { r.writeHead(404); r.end(); }
}).listen(4319);
const base = 'http://localhost:4319/';
await mkdir('tools/shots', { recursive: true });

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => { window.__E2E__ = true; });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));

async function playRound(label) {
  for (let k = 0; k < 200; k++) {
    if (await page.$('app-round-finish')) return;
    const st = await page.evaluate(() => window.__STEP__);
    if (!st) { await page.waitForTimeout(200); continue; }
    if (st.kind === 'choice') {
      const btn = page.locator('app-exercise-player > app-card > app-option-grid button[app-option]:not([disabled])', { hasText: st.answer }).filter({ hasText: new RegExp('^\\s*' + st.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$') });
      if (await btn.count()) await btn.first().click(); else { await page.waitForTimeout(150); continue; }
    } else if (st.kind === 'input') {
      const inp = page.locator('app-answer-input input:not([disabled])');
      if (!(await inp.count())) { await page.waitForTimeout(150); continue; }
      await inp.fill(Array.isArray(st.answer) ? st.answer[0] : st.answer);
      await page.locator('app-answer-input button').click();
    } else if (st.kind === 'why') {
      const btn = page.locator('app-why-step-view button[app-option]:not([disabled])', { hasText: st.ok });
      if (await btn.count()) await btn.first().click(); else { await page.waitForTimeout(150); continue; }
    } else if (st.kind === 'memorize') {
      await page.locator('[data-test=memorize]').click();
    }
    await page.waitForTimeout(250);
    // ждём смены шага/упражнения
    await page.waitForFunction((prev) => window.__STEP__ !== prev || document.querySelector('app-round-finish'), st, { timeout: 5000 }).catch(() => {});
  }
  await page.screenshot({ path: 'tools/shots/stuck.png' }); console.log(JSON.stringify(await page.evaluate(() => window.__STEP__)), await page.innerText('app-card').catch(()=>''));
  throw new Error('раунд не закончился: ' + label);
}

let rounds = 0;
for (const grade of [3, 4]) {
  await page.goto(base + '#/' + grade);
  await page.waitForSelector('a[app-game-tile]');
  const packs = await page.$$eval('a[app-game-tile]', (a) => a.map((x) => x.getAttribute('href')).filter((h) => h && h.startsWith('#/')));
  for (const ph of packs) {
    await page.goto(base + ph);
    await page.waitForSelector('a[app-topic-card]');
    await page.screenshot({ path: `tools/shots/pack-${ph.replace(/\W+/g, '_')}.png`, fullPage: true });
    const topics = await page.$$eval('a[app-topic-card]', (a) => a.map((x) => x.getAttribute('href')));
    for (const th of topics) {
      await page.goto(base + th);
      await page.waitForSelector('a[app-mode-item]');
      const modes = await page.$$eval('a[app-mode-item]', (a) => a.map((x) => x.getAttribute('href')));
      for (const mh of modes) {
        await page.goto(base + mh);
        await page.waitForSelector('app-exercise-player');
        if (rounds === 0) await page.screenshot({ path: 'tools/shots/first-step.png' });
        await playRound(mh);
        rounds++;
        console.log('✓', mh);
      }
    }
  }
}
await page.screenshot({ path: 'tools/shots/fin.png' });
await b.close(); srv.close();
console.log('раундов:', rounds, 'ошибок JS:', errs.length);
if (errs.length) console.log(errs.join('\n'));
process.exit(errs.length || !rounds ? 1 : 0);
