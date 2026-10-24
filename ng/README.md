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

- Слои: `core` (модели, прогресс, хранилище) → `shared/ui` + `engine` (проигрыватель упражнений) → `content` (паки: данные + режимы) → `features` (экраны). Подробно: `docs/architecture.md`.
- Плитки хаба — `src/app/core/catalog/entries.ts`. На Angular уже работает «Работа над ошибками»; остальные игры пока готовые офлайн-HTML в `public/legacy/`.
- Переносить игры можно по одной: `docs/migration.md`.

Подробно для работы с Claude: **`CLAUDE.md`**. Описание игр: `docs/games.md`. Хвосты: `docs/open-items.md`.

## Выкладка

```bash
npm run publish    # собирает с base-href /uroki/app/ и кладёт в ../app
cd .. && git add -A && git commit -m "..." && git push
```
