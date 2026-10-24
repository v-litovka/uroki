# Исходники legacy-игр

Это то, из чего собирались HTML в `public/legacy/`. Пути внутри `build.sh` — **исторические** (временная папка, где их собирали),
перед запуском поправь `cd …` и путь вывода на свои.

| Папка | Собирается в | Как |
|---|---|---|
| `domashka/` | `domashka/` | `build.sh`: склейка `schemes, engine, content, pages28, builders, pages_rest, fixK, pages36, lib38, pages38, pages48, whys, app` в `shell.html` вместо `/*JS*/` → `tools/build2.py` (встраивает шрифты) → мета-теги PWA → `tools/nbsp.py` |
| `stih/` | `stih/` | `blocks.py` генерирует данные блоков → `app.js`; `build.sh` = кошки из `english/cats.js` (до `const CAT_OK`) + `app.js` в `shell.html` |
| `rabota/` | `rabota/` | как `stih` (кошки + `app.js` → `shell.html`) |
| `english/` | `english/` | `data.js, cats.js, app.js, grammar.js` → `shell.html` |
| `zadachi/` | `zadachi/` (3 кл.) | `assemble.py` + `cfg3.json` + `shared.js` + `content.js` поверх `engine-base.html` |
| `horad-slou/` | `slovy/` | старая версия; актуальная правилась прямо в `public/legacy/slovy/index.html` |
| `tools/` | — | `build2.py` (шрифты + вырезание `window.__TEST__`), `nbsp.py` (скрипт неразрывных пробелов), `build.py/build3.py/assemble_g.py` — старые сборщики |

**Важно:** `build2.py` берёт `@font-face` из старого хаба (`index.html` с base64-шрифтами). Шрифты уже есть внутри любой собранной игры — можно вырезать оттуда.
Игры `ulica`, `slova`, все `4klass/*` правились прямо в собранном HTML — их исходник и есть `public/legacy/.../index.html`.

`*.mjs` — Playwright-тесты (полные прохождения). Импорт playwright там из `/opt/node-tools/...` — замени на `playwright`.
