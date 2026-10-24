# Архитектура

Цель: много классов, предметов и учебников, новые игры добавляются **данными**, а не новым кодом.
Код (движок, экраны) пишется один раз; контент растёт.

## Слои и правило зависимостей

```
features  (экраны: хаб, пак, тема, раунд; потом — админка)
   │  собирают всё вместе, знают про роутер
   ▼
engine    (проигрыватель упражнений, очередь раунда)        shared/ui (кнопки-варианты, ввод, «почему?», кошки…)
   │  знает только модели шагов, не знает конкретный контент       │  «глупые» компоненты: input → output
   ▼                                                              ▼
core      (модели, хранилище, профиль, прогресс, звук, озвучка, каталог)
   ▲
content   (паки: данные + функции build) — зависит ТОЛЬКО от core/models и shared/utils
```

- `content/` не импортирует Angular, `features/` и `engine/`. Это чистые данные и функции → их легко тестировать, генерировать скриптами по фото страниц, а потом хоть вынести в JSON/на сервер.
- `engine/` не знает, что такое «-тся» или «К1 · К = ОК»: он проигрывает **шаги**.
- `shared/ui` ничего не знает о прогрессе и маршрутах.
- `features/` — единственное место, где есть роутер и связывание.

## Папки

```
src/app/
  core/
    models/            типы: Grade, Subject, Book, CatalogEntry, Pack, Topic, Mode, Exercise, Step, Profile, Attempt
    catalog/           subjects.ts, books.ts, entries.ts (плитки хаба), pack-loader.service.ts
    storage/           KeyValueStore + KV_STORE (localStorage сейчас; сервер — потом)
    profile/           ProfileService (сейчас один ребёнок; задел под несколько)
    progress/          levels.ts (lvlAt), ProgressService (звёзды, пройденное, журнал попыток)
    audio/             SfxService (WebAudio), SpeechService (озвучка, проверка голоса)
    layout/            HeaderService (что показать в верхней панели)
    text/              nbsp (неразрывные пробелы)
  shared/
    ui/                cat, feedback, option-grid, answer-input, why-step, rule-box, progress-bar, top-bar
    utils/             norm/matches/diffLetters/plural, shuffle/pick
  engine/
    exercise-player.ts проигрывает Exercise: сцена + шаги, подсказки, «почему?»
    prompt-view.ts     сцена: предложение из кусков, крупное слово, подсказка, 🔊
    round-queue.ts     раунд из N, повтор ошибок в конце, «с первого раза»
  content/
    registry.ts        id пака → ленивый import
    grade-3/ru/rabota/ data.ts (сырые данные) · items.ts (элементы) · modes.ts (режимы → шаги) · pack.ts
  features/
    shell/  hub/  pack/  topic/  play/  admin/ (пока README)
public/legacy/         старые игры как есть
```

## Модель контента

```
Каталог (core/catalog/entries.ts) — плитки хаба: класс, предмет, учебник(и)
  └─ Pack            одна «игра»: класс, предмет, mascot ('cats' | 'none'), bookIds, legacyStorageKey
       └─ Topic      тема: правило (ruleHtml), элементы items[], режимы modes[]
            └─ Mode  режим: build(item) → Exercise; needs: ['tts-ru'] — показывать, если есть голос
                 └─ Exercise  itemId, prompt (сцена), steps[]
                      └─ Step  choice | input | why | memorize  (+ новые типы по мере надобности)
```

У каждого шага: `prompt` (как меняется сцена при старте шага), `after` (после верного ответа), `okMsg`, `hints[]`
(после 1-й, 2-й… ошибки — **наводящие**, не ответ).

### Адреса

`#/3` хаб · `#/3/ru/rabota` пак · `#/3/ru/rabota/tsa` тема · `#/3/ru/rabota/tsa/choose` раунд.
Hash-маршруты — потому что GitHub Pages не отдаёт index.html на глубокие ссылки.

## Рецепты

**Новая тема в существующем паке** — добавить данные в `data.ts`, элемент в `items.ts`, объект темы в `pack.ts`. Режимы можно переиспользовать (`sentenceModes()`, `softModes()`…).

**Новый пак (игра)**
1. `content/grade-N/<предмет>/<имя>/pack.ts` → `export const PACK: Pack = {...}`.
2. Строка в `content/registry.ts`.
3. Плитка `{ kind: 'pack', … packId }` в `core/catalog/entries.ts`.
4. `npm test` — тест `content.spec.ts` сам прогонит **все** режимы на **всех** элементах (варианты содержат ответ, нет «мама», в 4 классе нет кошек).
5. `npm run e2e` — Playwright пройдёт каждый режим до «Готово!».

**Новый класс** — добавить число в `Grade` (`catalog.model.ts`) и `GRADES` (`subjects.ts`), книги в `books.ts`.
Для 4 класса и старше: `mascot: 'none'` (без кошек), тексты нейтральные по роду.

**Новый учебник** — запись в `books.ts`, `bookIds` у пака/плитки. Для «Домашки»-подобных игр удобно: Pack = книга, Topic = страница, item = номер задания.

**Новый тип шага** (например, `order` — расставить по порядку, `table` — таблица К1·К=ОК, `scheme` — выбрать схему)
1. Тип в `content.model.ts` (`Step` union).
2. «Глупый» компонент в `shared/ui/` (или `engine/steps/`), input → output.
3. `@case` в `engine/exercise-player.ts`.
4. Ветка в `tools/e2e.mjs` (как правильно ответить) и проверка в `content.spec.ts`.

**Перенос legacy-игры** — см. `docs/migration.md`.

## Прогресс и хранение

- Ключи: `ng:<profileId>:pack:<packId>` → `{ stars, done: {'topic:mode': 1} }`; `ng:<profileId>:attempts` → журнал попыток (до 2000 последних).
- `legacyStorageKey` у пака: при первом запуске звёзды и пройденные режимы переносятся из старой HTML-версии (проверено тестом).
- Всё хранение — через `KV_STORE`. Сменить localStorage на сервер = одна строка в `app.config.ts`.

## Админка для ребёнка и родителей (план, ещё не делаем)

Заделы уже есть: `Profile` (role child/parent), `ProfileService`, profileId в ключах, журнал `Attempt`, `KV_STORE`.

1. **Профили**: экран «Кто играет?» (несколько детей на одном устройстве), у каждого свой класс → хаб открывается на нём.
2. **Родительский вход**: PIN (как 2924 в Домашке) → ленивый маршрут `#/admin`, guard `parentGuard`.
3. **Отчёты** из `Attempt`: где ошибается чаще всего (по itemId → слово/пример), сколько занималась по дням, какие режимы пройдены.
4. **Задания от родителя**: «на сегодня — тема -тся/-ться, 2 раунда» → плашка в хабе у ребёнка; назначение хранится как документ в KV_STORE.
5. **Свои слова/примеры**: родитель добавляет элементы в тему (например, слова из нового диктанта) — элементы хранятся отдельно и подмешиваются к `topic.items`.
6. **Синхронизация между устройствами** (iPad ребёнка ↔ телефон родителя): `KeyValueStore` с сервером (Supabase/Firebase/свой API), офлайн-первый — пишем локально, синхронизируем в фоне. До этого — экспорт/импорт прогресса файлом/QR.

Чего избегать: не класть в контент-паки логику админки; не читать localStorage напрямую мимо `KV_STORE`.

## Мобильное приложение

- **PWA** (`ng add @angular/pwa`) — иконка на iPad, офлайн, бесплатно. Рекомендуемый первый шаг.
- **Capacitor** — нативная оболочка iOS/Android из той же сборки; `SpeechService` и `KV_STORE` подменяются плагинами. Прогресс из браузера туда не переедет сам — нужен экспорт/импорт.

## Тесты

- `npm test` (vitest): уровни, очередь раунда, перенос legacy-прогресса, nbsp и **полная проверка контента всех паков**.
- `npm run e2e` (Playwright, 390 px): все legacy-игры открываются; все Angular-паки проходятся до конца. Хук `window.__E2E__` → `window.__STEP__` (текущий шаг) включается только тестом.
