import { Grade, SubjectId } from './catalog.model';

/* =====================================================================
 * Контент — чистые данные + функции-билдеры. Без Angular.
 * Пак → темы → режимы. Режим превращает элемент данных в упражнение.
 * Упражнение — последовательность шагов, которую проигрывает движок.
 * ===================================================================== */

/** Кусок текста в «сцене» упражнения. cls: vb — выделенное слово, gp — пропуск, hl — подсветка. */
export type Seg = string | { t: string; cls: 'vb' | 'gp' | 'hl' };

/** Что показано над шагами. Каждый шаг может дополнить/заменить сцену. */
export interface Prompt {
  /** предложение из кусков */
  sentence?: Seg[];
  /** крупное слово (или «• • •», когда спрятано) */
  big?: string;
  /** серая подсказка-задание под сценой */
  hint?: string;
  /** текст для озвучки: появится кнопка 🔊 и прозвучит автоматически */
  say?: string;
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
}

export interface WhyStep extends StepBase {
  kind: 'why';
  ok: string;
  wrong: string[];
}

/** «Посмотри и запомни» → кнопка «спрятать». Следом обычно идёт InputStep. */
export interface MemorizeStep extends StepBase {
  kind: 'memorize';
  word: string;
  button: string;
}

export type Step = ChoiceStep | InputStep | WhyStep | MemorizeStep;

export interface Exercise {
  /** id элемента данных — по нему копится статистика ошибок */
  itemId: string;
  prompt: Prompt;
  steps: Step[];
}

/** Что нужно режиму от устройства. */
export type Capability = 'tts-ru' | 'tts-en';

export interface Mode<T = unknown> {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needs?: Capability[];
  build(item: T): Exercise;
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

/** Кто «хвалит» ребёнка. 3 класс — кошки; 4 класс — без кошек (собака Луна / нейтрально). */
export type Mascot = 'cats' | 'none';

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
