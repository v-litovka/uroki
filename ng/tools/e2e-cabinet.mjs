// Сценарий кабинетов: взрослый настраивает (дети, питомец, слова, задание) → ребёнок выполняет → взрослый видит.
// Запуск: npx ng build && node tools/e2e-cabinet.mjs  (скриншоты в tools/shots/cab-*.png)
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
}).listen(4324);
const U = 'http://localhost:4324/';
await mkdir('tools/shots', { recursive: true });
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => { window.__E2E__ = true; });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
const shot = (n) => page.screenshot({ path: `tools/shots/cab-${n}.png`, fullPage: true });
const seen = (sel) => page.waitForSelector(sel, { timeout: 5000 }).then(() => true, () => false);
async function login(pin = '2924') {
  for (let i = 0; i < 3; i++) {
    await page.waitForSelector('app-parent-login [data-test=pin]');
    await page.fill('[data-test=pin]', pin);
    await page.press('[data-test=pin]', 'Enter');
    if (await page.waitForSelector('app-parent-progress', { timeout: 4000 }).then(() => true, () => false)) { if (i) console.log('RETRY', i, page.url()); return; }
  }
  throw new Error('не удалось войти');
}
const ok = (cond, msg) => { if (!cond) throw new Error('✗ ' + msg); console.log('✓', msg); };

async function playRound() {
  for (let k = 0; k < 200; k++) {
    if (await page.$('app-round-finish')) return;
    const st = await page.evaluate(() => window.__STEP__);
    if (!st) { await page.waitForTimeout(150); continue; }
    if (st.kind === 'choice') await page.locator('app-option-grid button[app-option]:not([disabled])').filter({ hasText: new RegExp('^\\s*' + st.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$') }).first().click();
    else if (st.kind === 'input') { await page.fill('app-answer-input input', String(st.answer)); await page.click('app-answer-input button'); }
    else if (st.kind === 'why') await page.locator('app-why-step-view button[app-option]:not([disabled])', { hasText: st.ok }).first().click();
    else if (st.kind === 'memorize') await page.locator('[data-test=confirm]').click({ timeout: 20000 });
    await page.waitForFunction((prev) => JSON.stringify(window.__STEP__) !== JSON.stringify(prev) || document.querySelector('app-round-finish'), st, { timeout: 5000 }).catch(() => {});
  }
  throw new Error('раунд не закончился');
}

// 1. кабинет ребёнка → вход взрослого
await page.goto(U + '#/me');
await page.waitForSelector('app-me-page');
await shot('1-me');
await page.click('text=Для взрослых');
await page.fill('[data-test=pin]', '1111');
await page.click('app-parent-login button');
ok(await seen('text=Неверный PIN'), 'неверный PIN не пускает');
await page.fill('[data-test=pin]', '2924');
await page.click('app-parent-login button');
await page.waitForSelector('app-parent-progress');
ok(true, 'вход по PIN 2924');

// 2. дети: переименовать «Я» → Соня, добавить Аню (4 класс)
await page.click('app-tabs >> text=Дети и уровни');
await page.click('app-parent-children button.link');
await page.fill('[data-test=child-name]', 'Соня');
await page.click('[data-test=child-save]');
await page.click('[data-test=child-new]');
await page.fill('[data-test=child-name]', 'Аня');
await page.click('app-segmented >> text=4 класс');
await page.click('[data-test=child-save]');
await page.waitForTimeout(300); ok((await page.locator('app-parent-children .kid').count()) === 2, 'двое детей');

// 3. питомец: собака Луна для Ани
await page.click('app-tabs >> text=Питомцы');
await page.click('[data-test=pet-new]');
await page.fill('[data-test=pet-name]', 'Луна');
await page.click('app-segmented >> text=Собака');
await page.click('app-swatches button[title="тёмно-серый"]');
await page.locator('label.kid', { hasText: 'Соня' }).locator('input').uncheck();
await page.locator('label.kid', { hasText: 'Аня' }).locator('input').check();
await shot('2-pet-editor');
await page.click('[data-test=pet-save]');
ok(await seen('app-parent-pets >> text=Луна'), 'питомец Луна добавлен');

// 4. слова Соне (выбрать Соню в переключателе)
await page.click('app-parent-shell app-segmented >> text=Соня');
await page.click('app-tabs >> text=Слова');
await page.fill('[data-test=words-bulk]', 'кОрова\nвОрОбей\nаККуратно\nгОра — горы');
await page.click('[data-test=words-bulk-add]');
ok(await seen('text=Добавлено: 4.'), '4 слова списком');
await page.fill('[data-test=word-input]', 'пенал');
await page.locator('.letters button').nth(1).click();
await page.click('[data-test=word-add]');
await page.waitForTimeout(300); ok((await page.locator('app-parent-words .word').count()) === 5, 'слово по буквам');
await shot('3-words');

// 5. задание: Работа над ошибками → -тся/-ться → Выбери, 1 раз
await page.click('app-tabs >> text=Задания');
await page.selectOption('[data-test=task-game]', 'rabota');
await page.waitForSelector('[data-test=task-topic]');
await page.selectOption('[data-test=task-topic]', 'tsa');
await page.selectOption('[data-test=task-mode]', 'choose');
await page.click('[data-test=task-add]');
ok(await seen('app-parent-tasks >> text=0 из 1'), 'задание создано');
await page.click('app-parent-shell >> text=Выйти');

// 6. ребёнок: хаб с приветствием и заданием, «Мои слова»
await page.goto(U + '#/3');
await page.waitForSelector('a[app-game-tile]');
ok(await seen('text=Привет, Соня!'), 'приветствие по имени');
ok(await seen('a[app-game-tile] >> text=Мои словарные слова'), 'плитка «Мои слова»');
await shot('4-hub');
await page.click('a.task');
await page.waitForSelector('app-exercise-player');
await playRound();
await shot('5-finish');
await page.goto(U + '#/3/ru/moi-slova/words/letter');
await page.waitForSelector('app-exercise-player', { timeout: 8000 }).catch(async () => { await shot('dbg-myword'); console.log(page.url(), await page.innerText('app-shell')); });
await shot('6-myword');
await playRound();
await page.goto(U + '#/me');
await page.waitForSelector('app-me-page');
ok(await seen('app-me-page >> text=1 из 1'), 'у ребёнка задание выполнено');
await shot('7-me-after');

// 7. взрослый видит историю и выполненное задание
await page.click('text=Для взрослых');
await login();
ok(await seen('app-parent-progress >> text=✅'), 'взрослый: задание ✅');
await page.waitForTimeout(300); ok((await page.locator('app-parent-progress .row').count()) >= 2, 'взрослый: история раундов');
await shot('8-parent-progress');

// 8. переключиться на Аню: 4 класс, питомец Луна
await page.goto(U + '#/me');
await page.click('app-me-page .kid >> text=Аня');
ok(await seen('app-me-page >> text=4 класс'), 'Аня — 4 класс');
ok(await seen('app-me-page figcaption >> text=Луна'), 'у Ани питомец Луна');
await shot('9-anya');
await page.goto(U + '#/');
await page.waitForSelector('a[app-game-tile]');
ok(page.url().endsWith('#/4'), 'главная открывается на 4 классе');

await b.close(); srv.close();
console.log('ошибок JS:', errs.length);
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
