import { Grade, SubjectId } from './catalog.model';

/* =====================================================================
 * Контент — чистые данные + функции-билдеры. Без Angular.
 * Пак → темы → режимы. Режим превращает элемент данных в упражнение.
 * Упражнение — последовательность шагов, которую проигрывает движок.
 * ===================================================================== */

/** Кусок текста в «сцене» упражнения. cls: vb — выделенное слово, gp — пропуск, hl — подсветка. */
export type Seg = string | { t: string; cls: 'vb' | 'gp' | 'hl' };

/** Строка стиха в сцене. */
export interface PoemLine {
  t: string;
  /** строка-пример (выделяется цветом) */
  mul?: boolean;
  /** подсветка (подсказка: «прочитай эти строчки») */
  hl?: boolean;
  /** кусок строки, который спрятан за «?» */
  gap?: string;
  /** кусок строки, который только что вписан (зелёным) */
  good?: string;
}

/** Что показано над шагами. Каждый шаг может дополнить/заменить сцену. */
export interface Prompt {
  /** вопрос крупно над сценой («Вставь букву») */
  ask?: string;
  /**
   * Богатая сцена — доверенный статичный HTML из кода контента
   * (классы: word, gap, ok, sent, blank, why, u1/u2/u3, hlw, seg, hl, pre, addr, memo, ex). См. shared/ui/rich-html.
   */
  html?: string;
  /** стих / несколько строк */
  poem?: PoemLine[];
  /** предложение из кусков */
  sentence?: Seg[];
  /** крупное слово (или «• • •», когда спрятано) */
  big?: string;
  /** серая подсказка-задание под сценой */
  hint?: string;
  /** текст для озвучки: появится кнопка 🔊 */
  say?: string;
  /** озвучить сразу (по умолчанию true) */
  sayAuto?: boolean;
  /** язык озвучки (по умолчанию ru) */
  sayLang?: 'ru' | 'en';
}

export interface StepBase {
  /** изменить сцену, когда шаг становится активным */
  prompt?: Partial<Prompt>;
  /** изменить сцену после верного ответа (например, показать слово целиком) */
  after?: Partial<Prompt>;
  /** короткое сообщение после верного ответа (перед следующим шагом) */
  okMsg?: string;
  /**
   * Подсказки после ошибок: [после 1-й, после 2-й, …] (последняя повторяется).
   * Правило проекта: подсказка НАВОДИТ, а не говорит ответ.
   */
  hints?: string[];
  /** как меняется сцена после 1-й, 2-й… ошибки (например, показать кусочек стиха) */
  wrongPrompt?: Partial<Prompt>[];
  /** свой урок для ошибки на этом шаге (вместо Exercise.lesson) */
  lesson?: Lesson;
  /** после какой ошибки на этом шаге урок (вместо Exercise.lessonAfter) */
  lessonAfter?: number;
}

export interface ChoiceStep extends StepBase {
  kind: 'choice';
  options: string[];
  answer: string;
  /** перемешать варианты (по умолчанию true) */
  shuffle?: boolean;
  /** pics — крупные картинки-эмодзи (послушай и выбери) */
  layout?: 'grid' | 'small' | 'list' | 'pics' | 'cards';
  /** вариант → доверенный HTML (картинка-схема) вместо текста; layout 'cards' */
  optionHtml?: Record<string, string>;
  /** блокировать кнопки N секунд, чтобы ребёнок прочитал */
  lockSec?: number;
  /** ещё верные ответы (например, «.» и «!» для побудительного) */
  accept?: string[];
}

export interface InputStep extends StepBase {
  kind: 'input';
  /** верные ответы (сравнение без регистра, ё = е) */
  answer: string | string[];
  placeholder?: string;
  /** после ошибки показать слово с подсветкой неверных букв */
  showDiff?: 'never' | 'always' | 'second';
  /** цифровая клавиатура на планшете */
  numeric?: boolean;
  /** заведомо неверные ответы — ошибка сразу */
  reject?: string[];
  /**
   * Если ответ не верный и не из reject — мягкое сообщение без ошибки
   * («Такого проверочного слова нет, подбери другое»). unknownLimit — после N таких ответов считать ошибкой.
   */
  unknownMsg?: string;
  unknownLimit?: number;
  /** простить опечатку: близко к верному → «Почти! Проверь буквы», без ошибки */
  typo?: boolean;
  /** ответ засчитан, но он не первый в answer → показать подсказку «лучше подойдёт …» */
  bestNote?: string;
  /** любое число — верно («придумай число») */
  any?: boolean;
  /** что сказать на конкретный неверный ответ: { '30': 'Похоже, получилось сложение…' } */
  feedback?: Record<string, string>;
}

export interface WhyStep extends StepBase {
  kind: 'why';
  ok: string;
  wrong: string[];
}

/**
 * Кнопка-подтверждение: «Запомнила — спрятать», «Прочитала!».
 * lockSec — кнопка станет активной через N секунд (чтобы ребёнок действительно прочитал).
 */
export interface MemorizeStep extends StepBase {
  kind: 'memorize';
  word?: string;
  button: string;
  lockSec?: number;
}

/** Расставь по порядку: нажимать плитки в правильной последовательности. */
export interface OrderStep extends StepBase {
  kind: 'order';
  /** элементы в ПРАВИЛЬНОМ порядке (на экране перемешаются) */
  items: string[];
  /** подсказка, если первым нажат не тот элемент */
  hintFirst?: string;
  /** подсказка после ошибки в середине; {prev} — последний верный элемент */
  hintAfter?: string;
  /** подпись над плитками */
  note?: string;
  /** лишние плитки (не нужны в ответе) */
  extra?: string[];
  /** плитки и собранное — в строку (буквы слова, слова предложения), а не столбиком */
  inline?: boolean;
  /** разделитель собранного в строку: '' для букв, ' ' для слов */
  joiner?: string;
}

/** Нажми на слово в предложении (подлежащее, сказуемое, обращение…). */
export interface TapStep extends StepBase {
  kind: 'tap';
  /** слова предложения как есть (со знаками) */
  words: string[];
  /** верные слова (без знаков препинания) */
  accept: string[];
  /** какие слова подчеркнуть после верного ответа (по умолчанию accept) */
  markWords?: string[];
  /** u1 — одна черта (подлежащее), u2 — две (сказуемое), u3 — пунктир (второстепенный), hl — выделить */
  markAs: 'u1' | 'u2' | 'u3' | 'hl';
  /** что уже подчёркнуто на прошлых шагах */
  marked?: Record<string, 'u1' | 'u2' | 'u3' | 'hl'>;
}

/** Экран-пояснение после ответа: «Верно! + правило», кнопка «Дальше» (можно с блокировкой). */
export interface NoteStep extends StepBase {
  kind: 'note';
  /** доверенный статичный HTML */
  html: string;
  button?: string;
  lockSec?: number;
}

/** Несколько чисел сразу (Домашка): «__ см + __ см + __ см». check — своя проверка (придумай числа), testv — пример верных для тестов. */
export interface NumsStep extends StepBase {
  kind: 'nums';
  fields: { u: string; ok: number }[];
  /** подпись перед окошками */
  pre?: string;
  check?: (v: number[]) => boolean;
  testv?: number[];
}

/** Выбрать несколько (Домашка: «подчеркни выражения с переменной»). options — доверенный HTML, correct — номера верных. */
export interface MultiStep extends StepBase {
  kind: 'multi';
  options: string[];
  correct: number[];
  msgs?: { extra?: string; none?: string; miss?: string };
}

/** Кусок выражения для шага «порядок действий»: текст (доверенный HTML) или знак действия с номером i. */
export type OpPart = { t: 'txt'; html: string } | { t: 'op'; i: number; o: string };
/** Порядок действий: нажимать на знаки по очереди (order — номера знаков в верном порядке). */
export interface OpsStep extends StepBase {
  kind: 'ops';
  parts: OpPart[];
  order: number[];
}

export type Step = ChoiceStep | InputStep | WhyStep | MemorizeStep | OrderStep | TapStep | NoteStep | NumsStep | MultiStep | OpsStep;

/** Урок после ошибки: правило + примеры; после чтения — то же задание заново. */
export interface Lesson {
  title: string;
  /** доверенный статичный HTML (правило и примеры) */
  html: string;
  /** сколько секунд читать (по умолчанию 15) */
  lockSec?: number;
  /** HTML «Задача: …» над уроком (по умолчанию — сцена упражнения) */
  task?: string;
  /**
   * «Реши сама» по шагам (как хитрость в Улице Домиков): после урока вместо повтора задания
   * идут эти шаги, потом — шаги упражнения после ошибочного. Ошибка в них — снова этот урок.
   */
  steps?: Step[];
}

export interface Exercise {
  /** id элемента данных — по нему копится статистика ошибок */
  itemId: string;
  /** как показать элемент взрослому в «трудных местах» (слово, пример) */
  label?: string;
  /** при ошибке — урок с правилом, потом задание заново (вместо подсказок) */
  lesson?: Lesson;
  /** после какой по счёту ошибки на шаге показывать урок (по умолчанию 1; до этого — подсказки шага) */
  lessonAfter?: number;
  /** кнопка «Не знаю, подскажи» под шагом: показывает подсказки шага по очереди (Домашка) */
  askHint?: boolean;
  prompt: Prompt;
  steps: Step[];
}

/** Что нужно режиму от устройства. */
export type Capability = 'tts-ru' | 'tts-en';

/** Итог раунда — для своих правил начисления звёзд. */
export interface RoundStats {
  firstTry: number;
  total: number;
  mistakes: number;
}

export interface Mode<T = unknown> {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needs?: Capability[];
  build(item: T): Exercise;
  /** свои элементы вместо topic.items (например, «весь стих целиком» для режима «Читаем») */
  items?: T[];
  /** заданий в раунде (иначе topic.roundSize ?? 10) */
  roundSize?: number;
  /** перемешивать элементы (по умолчанию true) */
  shuffle?: boolean;
  /** сколько звёзд дать (по умолчанию — число заданий с первого раза) */
  stars?(r: RoundStats): number;
  /** часы в шапке раунда и время в итоге (Улица Домиков) */
  clock?: boolean;
}

export interface Topic<T = unknown> {
  id: string;
  title: string;
  desc: string;
  color: string;
  /** короткое правило (доверенный статичный HTML из кода контента) */
  ruleHtml: string;
  items: T[];
  modes: Mode<T>[];
  /** заданий в раунде (по умолчанию 10) */
  roundSize?: number;
  /** решения для взрослого (Домашка) — показываются только в кабинете взрослого за PIN */
  solutionHtml?: string;
}

/**
 * Кто «хвалит» ребёнка.
 * 'pets' — питомцы, которых взрослый назначил ребёнку в кабинете (по умолчанию Вира и Венди);
 * 'none' — без животных, нейтральные фразы.
 */
export type Mascot = 'pets' | 'none';

export interface Pack {
  id: string;
  grade: Grade;
  subject: SubjectId;
  title: string;
  desc: string;
  color: string;
  mascot: Mascot;
  /** язык интерфейса игры (кнопки, похвала): 'ru' по умолчанию, 'by' — беларуская */
  lang?: 'ru' | 'by';
  bookIds?: string[];
  topics: Topic<any>[];
  /** фразы похвалы/ошибки; иначе — по умолчанию для mascot */
  phrases?: { ok: string[]; bad: string[] };
  /**
   * Ключ legacy-версии в localStorage: при первом запуске звёзды, пройденные
   * режимы и коробки переносятся оттуда (формат { stars, done: { 'topic:mode': 1 }, box: { id: 0..2 } }).
   */
  legacyStorageKey?: string;
  /**
   * Коробки «не знаю / почти знаю / знаю» (по item.id): чаще дают то, что не знаешь;
   * в списке тем — «знаю k из n». Нужны item.id у элементов.
   */
  leitner?: boolean;
}
