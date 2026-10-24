// Путь с ошибкой в Городе Слов: неверный ответ → урок (правило + примеры) → задание заново → верно.
// Плюс: звёзды и коробки переносятся из старой версии (gorod-slov-v1). Скриншоты: tools/shots/lesson-*.png
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const root = 'dist/uroki-ng/browser';
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer(async (q, r) => {
  let p = join(root, decodeURIComponent(q.url.split('?')[0]));
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); r.writeHead(200, { 'content-type': T[extname(p)] || 'application/octet-stream' }); r.end(await readFile(p)); }
  catch { r.writeHead(404); r.end(); }
}).listen(4325);
const U = 'http://localhost:4325/';
await mkdir('tools/shots', { recursive: true });
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  window.__E2E__ = true;
  window.__E2E_FAST__ = true;
  if (!localStorage.getItem('ng-family')) localStorage.setItem('gorod-slov-v1', JSON.stringify({ stars: 33, box: { 'dict:0': 2, 'dict:1': 2, 'dict:2': 1 }, streets: ['dict'], lv: {} }));
});
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
const seen = (sel) => page.waitForSelector(sel, { timeout: 5000 }).then(() => true, () => false);
const ok = (c, m) => { if (!c) throw new Error('✗ ' + m); console.log('✓', m); };
const step = () => page.evaluate(() => window.__STEP__);
const shot = (n) => page.screenshot({ path: `tools/shots/lesson-${n}.png`, fullPage: true });

await page.goto(U + '#/3/ru/slova');
await page.waitForSelector('a[app-topic-card]');
ok(await seen('text=знаю 2 из 61'), 'коробки из старой версии: «знаю 2 из 61»');
ok((await page.innerText('app-stars-badge')).includes('33'), 'звёзды из старой версии: 33');
await shot('1-pack');

await page.goto(U + '#/3/ru/slova/mem/play');
await page.waitForSelector('app-tap-words');
let st = await step();
const wrongWord = (await page.locator('app-tap-words button.chip').allInnerTexts()).map((t) => t.trim()).find((t) => !st.accept.includes(t));
await page.locator('app-tap-words button.chip').filter({ hasText: new RegExp('^\\s*' + wrongWord + '\\s*$') }).first().click();
await page.waitForFunction(() => window.__STEP__?.kind === 'lesson', null, { timeout: 5000 });
ok(await seen('text=Прочитай правило вслух'), 'после ошибки — урок с правилом');
await shot('2-lesson');
await page.click('[data-test=confirm]');
await page.waitForFunction(() => window.__STEP__?.kind === 'tap', null, { timeout: 5000 });
st = await step();
await page.locator('app-tap-words button.chip:not([disabled])').filter({ hasText: new RegExp('^\\s*' + st.accept[0] + '\\s*$') }).first().click();
await page.waitForFunction((a) => window.__STEP__?.kind === 'tap' && window.__STEP__.accept[0] !== a, st.accept[0], { timeout: 5000 });
await shot('3-tap2');
st = await step();
await page.locator('app-tap-words button.chip:not([disabled])').filter({ hasText: new RegExp('^\\s*' + st.accept[0] + '\\s*$') }).first().click();
await page.waitForFunction(() => window.__STEP__?.kind === 'note', null, { timeout: 5000 });
ok(await seen('text=Верно!'), 'после повтора — «Верно!» и правило');
await shot('4-note');

// синонимы на сложном уровне: опечатка прощается, неизвестное слово — мягко
await page.goto(U + '#/3/ru/slova/lex/write');
await page.waitForSelector('app-answer-input');
st = await step();
const ans = st.answer[0];
await page.fill('app-answer-input input', ans.slice(0, -1) + (ans.at(-1) === 'а' ? 'о' : 'а'));
await page.click('app-answer-input button');
ok(await seen('text=Почти! В слове ошибка'), 'опечатка в синониме — «Почти!», без урока');
await page.fill('app-answer-input input', ans);
await page.click('app-answer-input button');
await page.waitForFunction(() => window.__STEP__?.kind === 'note', null, { timeout: 5000 });
ok(true, 'исправленный синоним засчитан');
await shot('5-lex');

await b.close(); srv.close();
console.log('ошибок JS:', errs.length);
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
