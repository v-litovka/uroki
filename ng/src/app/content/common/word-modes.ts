/* Общие режимы для «слов»: Запомни и напиши, Диктант. Используются в нескольких паках. */
import { Exercise, Mode } from '../../core/models';

export interface Why {
  ok: string;
  wrong: string[];
}

const why = (w: Why) => ({ kind: 'why' as const, ok: w.ok, wrong: w.wrong, prompt: { hint: undefined } });

/** Посмотри → спрячь → напиши по памяти (ошибочные буквы подсвечиваются). */
export const lookWrite = (id: string, w: string, wy: Why): Exercise => ({
  itemId: id,
  label: w,
  prompt: {},
  steps: [
    { kind: 'memorize', word: w, button: 'Спрятать слово', prompt: { big: w, hint: 'Посмотри на слово и запомни. Потом оно спрячется.' }, after: { big: '• • •', hint: 'Напиши слово по памяти' } },
    { kind: 'input', answer: w, placeholder: 'слово', showDiff: 'always', hints: ['Красные буквы — с ошибкой:'], after: { big: w } },
    why(wy),
  ],
});

/** Послушай → напиши (нужен русский голос на устройстве). */
export const sayWrite = (id: string, w: string, wy: Why): Exercise => ({
  itemId: id,
  label: w,
  prompt: { say: w, hint: 'Послушай слово и напиши его' },
  steps: [
    { kind: 'input', answer: w, placeholder: 'слово', showDiff: 'second', hints: ['Послушай ещё раз и проверь каждую букву.', 'Правильно так:'], after: { say: undefined, hint: undefined, big: w } },
    why(wy),
  ],
});

export const writeModes = <T extends { id: string; w: string }>(wy: (it: T) => Why): Mode<T>[] => [
  { id: 'write', title: 'Запомни и напиши', icon: '✏️', desc: 'Слово спрячется — напиши его', build: (it) => lookWrite(it.id, it.w, wy(it)) },
  { id: 'dict', title: 'Диктант', icon: '🎧', desc: 'Слушай и пиши', needs: ['tts-ru'], build: (it) => sayWrite(it.id, it.w, wy(it)) },
];
