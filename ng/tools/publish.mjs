// Сборка для GitHub Pages и копирование в папку сайта.
// Проект лежит в репозитории v-litovka/uroki в папке ng/, собранное приложение — в app/
// → открывается по адресу https://v-litovka.github.io/uroki/app/
//
// Запуск: npm run publish   (потом git add/commit/push из корня репозитория)
// Другая папка/адрес: PAGES_DIR=../somewhere BASE_HREF=/uroki/somewhere/ npm run publish
import { execSync } from 'node:child_process';
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.env.BASE_HREF || '/uroki/app/';
const out = resolve(process.env.PAGES_DIR || '../app');

execSync(`npx ng build --base-href ${base}`, { stdio: 'inherit' });
const dist = resolve('dist/uroki-ng/browser');
if (!existsSync(dist)) throw new Error('нет сборки: ' + dist);
rmSync(out, { recursive: true, force: true });
cpSync(dist, out, { recursive: true });
writeFileSync(resolve(out, '.nojekyll'), '');
console.log('Готово:', out, '→', base);
