# Игры (Angular)

Учебные игры для 3 и 4 класса: таблица умножения, задачи, домашка, русский, белорусский, английский.

- Новый адрес: https://v-litovka.github.io/uroki/app/
- Старый сайт (те же игры, без Angular): https://v-litovka.github.io/uroki/

## Быстрый старт

```bash
npm install
npm start          # http://localhost:4200
```

Требуется Node.js 22.12+ (или 24+) и npm 11 (с npm 10.9 бывает ошибка `Cannot read properties of null (reading 'edgesOut')`).
Angular 21. Обновить до свежего: `npx ng update @angular/core @angular/cli`.

## Как устроено

- Хаб «Игры» — Angular (`src/app/hub`), список игр — `src/app/core/games.ts`.
- Сами игры пока — готовые офлайн-HTML в `public/legacy/` (копируются в сборку как есть).
- Переписывать игры на Angular можно по одной: см. `docs/migration.md`.

Подробно для работы с Claude: **`CLAUDE.md`**. Описание игр: `docs/games.md`. Хвосты: `docs/open-items.md`.

## Выкладка

```bash
npm run publish    # собирает с base-href /uroki/app/ и кладёт в ../app
cd .. && git add -A && git commit -m "..." && git push
```
