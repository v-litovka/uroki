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
}

export interface ChoiceStep extends StepBase {
  kind: 'choice';
  options: string[];
  answer: string;
  /** перемешать варианты (по умолчанию true) */
  shuffle?: boolean;
  layout?: 'grid' | 'small' | 'list';
  /** блокировать кнопки N секунд, чтобы ребёнок прочитал */
  lockSec?: number;
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
}

export type Step = ChoiceStep | InputStep | WhyStep | MemorizeStep | OrderStep;

export interface Exercise {
  /** id элемента данных — по нему копится статистика ошибок */
  itemId: string;
  /** как показать элемент взрослому в «трудных местах» (слово, пример) */
  label?: string;
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
  bookIds?: string[];
  topics: Topic<any>[];
  /** фразы похвалы/ошибки; иначе — по умолчанию для mascot */
  phrases?: { ok: string[]; bad: string[] };
  /**
   * Ключ legacy-версии в localStorage: при первом запуске звёзды и пройденные
   * режимы переносятся оттуда (формат { stars, done: { 'topic:mode': 1 } }).
   */
  legacyStorageKey?: string;
}
