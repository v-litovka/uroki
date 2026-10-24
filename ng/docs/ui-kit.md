# UI-кит (shared/ui)

Все общие элементы — компоненты. Глобальных классов вроде `.btn` / `.card` **нет**: нужна кнопка — используй `app-btn`.
Каждый компонент: `name.ts` + `name.html` (если шаблон длиннее строки) + `name.scss`. Импорт: `import { Button, Card } from '../../shared/ui';`

## Стили

| Файл | Что внутри |
|---|---|
| `src/styles/_tokens.scss` | CSS-переменные: `--ink`, `--muted`, `--paper`, `--sun`, `--good`, `--trap`, `--ghost`, `--accent`, шрифты `--display` / `--body` |
| `src/styles/_base.scss` | сброс, фон страницы, фокус. Больше глобально ничего не добавлять |
| `src/styles/_animations.scss` | `@keyframes app-shake`, reduced-motion |
| `src/styles/_mixins.scss` | `raised()` — фирменная рамка с тенью, `pressable()`, `display($size)` — рукописный шрифт, `shake`, `bare-interactive`, `state-right` / `state-bad` |

В scss компонента: `@use 'mixins' as m;` (путь подключён в `angular.json → stylePreprocessorOptions`).
Цвет пака/темы передаётся через CSS-переменную (`--c`, `--accent`), а не через новые классы.

## Компоненты

| Компонент | Селектор | Входы | Где используется |
|---|---|---|---|
| Button | `button[app-btn]`, `a[app-btn]` | `variant: primary/ghost`, `size: md/lg` | «Проверить», итог раунда, шпаргалка |
| IconButton | `button[app-icon-btn]`, `a[app-icon-btn]` | `muted` | верхняя панель |
| Card | `app-card` | `center` | упражнение, итог |
| Option | `button[app-option]` | `state: idle/right/bad`, `variant: word/text` | внутри OptionGrid |
| OptionGrid | `app-option-grid` | `options`, `answer`, `layout: grid/small/list`, `doShuffle`, `lockSec` → `(picked)` | шаг choice, «Почему?» |
| AnswerInput | `app-answer-input` | `answer`, `placeholder` → `(typed)` | шаг input |
| WhyStepView | `app-why-step-view` | `ok`, `wrong[]` → `(answered)` | шаг why |
| Feedback | `app-feedback` | `ok`, `text`, `pet` | похвала/подсказка |
| PetAvatar | `app-pet-avatar` | `pet`, `mood: happy/sad/sly/wow`, `size` | везде, где питомец (рисунок по окрасу или эмодзи) |
| PetGroup | `app-pet-group` | `pets[]`, `size: sm/md/lg`, `names` | шапка пака, итог, кабинет |
| StarsBadge | `app-stars-badge` | `stars`, `level` | верхняя панель |
| TopBar | `app-top-bar` | — (берёт из `HeaderService`) | оболочка |
| Tabs | `app-tabs` | `items: {label, link, active}[]`, `label` | хаб: классы |
| GameTile | `a[app-game-tile]` | `tag`, `title`, `desc`, `color` | хаб |
| TopicCard | `a[app-topic-card]` | `badge`, `title`, `desc`, `color` | пак |
| ModeItem | `a[app-mode-item]` | `icon`, `title`, `desc`, `done` | тема |
| PageHero | `app-page-hero` | `title`, `text`, `size: md/lg/xl`; слот `[aside]` + основной | хаб, пак, тема |
| RuleBox | `app-rule-box` | `html` (статичный, из контента), `color` | тема |
| ProgressBar | `app-progress-bar` | `value 0…1` | раунд |
| Sentence | `app-sentence` | `segs: Seg[]` (текст / vb / gp / hl) | сцена упражнения |
| BigWord | `app-big-word` | `text` | сцена |
| Hint | `app-hint` | контент | сцена |
| SayButton | `button[app-say-button]` | — | сцена (озвучка) |
| LetterDiff | `app-letter-diff` | `letters: {ch, bad}[]` | ошибка в слове |
| LevelUp | `app-level-up` | `level` | итог раунда |
| Poem | `app-poem` | `lines: PoemLine[]` (mul, hl, gap, good) | сцена: стих |
| OrderTiles | `app-order-tiles` | `items` (в верном порядке) → `(wrong)`, `(done)` | шаг order |
| Segmented | `app-segmented` | `options: {value,label}[]`, `[(value)]` | кабинет взрослого |
| Swatches | `app-swatches` | `colors: {id,name}[]`, `[(value)]` | окрас питомца |
| EmojiPicker | `app-emoji-picker` | `items[]`, `[(value)]`, `allowNone` | аватар, иконка питомца |
| StatCard | `app-stat-card` | `value`, `label` | кабинеты |
| Section | `app-section` | `title`, `note` + контент | кабинеты |
| Field | `app-field` | `label` + поле внутри | формы |
| RichHtml | `app-rich-html` | `html` (доверенный, из контента) | сцены Города Слов, урок, «Верно + правило» |
| TapWords | `app-tap-words` | `words`, `accept`, `markWords`, `markAs: u1/u2/u3/hl`, `marked` → `(picked)` | шаг tap |
| ConfirmButton | `app-confirm-button` | `label`, `lockSec` → `(confirmed)` | шаг memorize («Прочитала!») |

Компоненты экранов (не общие): `features/play/round-header`, `features/play/round-finish`, `engine/prompt-view`, `engine/exercise-player`.

## Правила

- Компонент из `shared/ui` «глупый»: только `input()` / `output()`, без сервисов прогресса и роутера (исключение — `TopBar`, он часть оболочки).
- Новый элемент, который нужен в двух местах, — сразу в `shared/ui` + строка в `index.ts` + строка в этой таблице.
- Для e2e используй селекторы компонентов (`button[app-option]`, `a[app-topic-card]`) или `data-test`, а не классы.
