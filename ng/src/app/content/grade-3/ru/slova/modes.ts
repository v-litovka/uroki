/* «Город Слов»: как задание превращается в шаги (перенос mainSpecs/solved/lesson из старой игры). */
import { Exercise, Mode, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { ITEMS, PAIR, PRE_OPTS, QCAT, QREP, RULES, SlovaItem, TEXT, TRIO_WORDS, VOW_OK } from './data';

import {
  MainLabels,
  StreetTexts,
  bare,
  choice,
  esc,
  fillGap,
  lessonOf,
  mainMembers,
  noAccent,
  partShow as partShowKit,
  plain,
  qWrongFrom,
  scene,
  secSent as secSentKit,
  secWords,
  secondaryMembers,
  sent,
  streetExercise,
  streetMode,
  why,
  word,
  words,
} from '../../../common/streets';

const TX: StreetTexts = { correct: 'Верно! +1 ⭐', next: 'Дальше', examples: 'Смотри, как это работает', remember: 'Запомни это слово' };
const LBL: MainLabels = {
  pred: 'Найди сказуемое (что делает?) — две черты',
  subj: 'Найди подлежащее (кто? что?) — одна черта',
  tapSec: (f, q) => `Задай вопрос: ${f} (${q}) … — нажми на это слово`,
  askSec: (f, w) => `Какой вопрос задаём от слова «${f}» к слову «${w}»?`,
};
const qWrong = qWrongFrom(QCAT, QREP);
const partShow = (it: SlovaItem, hl: boolean) => partShowKit(it['parts'], hl ? it['hl'] : -1);
const secSent = (it: SlovaItem, upto: number, hl?: string[]) => secSentKit(it as never, upto, hl);
const preNote = (it: SlovaItem) => {
  const bad = it['p'].replace(it['l'], PRE_OPTS[it['l']][1]);
  return `Приставки «${bad}-» в русском языке нет, поэтому пишем только <b>${it['p']}</b>.`;
};

/* ---------- как выглядит решённое задание ---------- */
export function solved(it: SlovaItem): string {
  switch (it.type) {
    case 'dict':
      return word(fillGap(it['w'], it['l'])) + why('словарное слово — запомни!');
    case 'vow':
      return word(fillGap(it['w'], it['l'])) + why(`проверка: <b>${it['ch']}</b>`);
    case 'pre': {
      const w = plain(it['w'], it['l']);
      return word(`<span class="pre">${w.slice(0, it['p'].length)}</span>${w.slice(it['p'].length)}`) + why(preNote(it));
    }
    case 'pref':
      return word(`<span class="pre">${it['p']}</span>${it['w'].slice(it['p'].length)}`);
    case 'part':
      return partShow(it, true) + why(`«${it['parts'][it['hl']]}» — <b>${it['kind']}</b>`);
    case 'odd':
      return why(`родственные: ${it['words'].filter((w: string) => w !== it['odd']).join(', ')} (корень <b>${it['root']}</b>)<br>лишнее: <b>${it['odd']}</b>`);
    case 'err':
      return word(fillGap(it['w'], it['l'])) + why(`${it['bad'] ? 'было с ошибкой: ' + it['shown'] : 'написано верно'}${it['vw'] ? `<br>проверка: <b>${it['vw'].ch}</b>` : ''}`);
    case 'goal':
      return sent(`${it['s']}<b style="color:var(--good)">${it['m']}</b>`) + why(`<b>${it['g']}</b>${it['g'] === 'побудительное' ? ' — в конце точка или восклицательный знак' : ''}`);
    case 'mark':
      return sent(`${it['s']}<b style="color:var(--good)">${it['m']}</b>`);
    case 'addr':
      return sent(it['s'].split(it['a']).join(`<span class="addr">${it['a']}</span>`)) + why(`обращение: <b>${it['a']}</b>`);
    case 'phr':
      return sent(it['s']) + why(`<b>${it['isS'] ? 'предложение' : 'словосочетание'}</b>`);
    case 'mem':
      return (
        sent(words(it['s']).map((w) => (bare(w) === it['subj'] ? `<span class="u1">${w}</span>` : bare(w) === it['pred'] ? `<span class="u2">${w}</span>` : w)).join(' ')) +
        why(`подлежащее <b>${it['subj']}</b> — одна черта, сказуемое <b>${it['pred']}</b> — две`)
      );
    case 'syn':
    case 'ant':
      return `<p class="why" style="font-size:24px">${it['w']} — <b>${it['a']}</b></p>${it['alts']?.length ? why(`${TEXT.also}: ${it['alts'].join(', ')}`) : ''}`;
    case 'fig':
      return sent(it['s']) + why(`<b>${it['v']}</b> значение`);
    case 'sec':
      return (
        secSent(it, it['sec'].length) +
        why((it['sec'] as string[][]).map((x) => x[0].toLowerCase() + ' (' + x[1] + ') <b>' + secWords(x).join(' ').toLowerCase() + '</b>').join('<br>'))
      );
    case 'mnog':
      return sent(it['s']) + why(`«${it['w']}» — <b>${it['a']}</b>`);
    case 'trio':
      return sent((it['ph'] as string[]).map((p) => p.replace('…', `<b style="color:var(--good)">${it['w']}</b>`)).join('<br>')) + why(`${it['w']} — <b>многозначное слово</b>`);
    case 'fraz':
      return `<p class="why" style="font-size:22px">«${it['s']}» — <b>${it['a']}</b></p>`;
  }
  return '';
}

/* ---------- правило к заданию ---------- */
function errRule(it: SlovaItem, src: string, ch?: string) {
  const w = plain(it['w'], it['l']);
  const i = it['w'].indexOf('_');
  const hl = `${w.slice(0, i)}<b>${it['l']}</b>${w.slice(i + 1)}`;
  if (src === 'dict') return { title: 'Словарное слово', text: `«${hl}» — словарное слово. Его <b>нельзя проверить</b>, его надо <b>запомнить</b>. Прочитай по слогам, как пишется.` };
  if (src === 'vow') {
    const c = noAccent(ch!);
    return { title: 'Безударная гласная в корне', text: `В слове «${hl}» гласная в корне без ударения. <b>Проверяй ударением</b>: ${c} — слышно <b>${/ё/.test(c) ? 'ё, значит пишем е' : it['l']}</b>.` };
  }
  return { title: 'Приставка', text: `В слове «${hl}» приставка <b>${it['p']}-</b>. ${preNote(it)}` };
}
export function ruleFor(it: SlovaItem): { title: string; text: string } {
  if (it.type === 'err') return errRule(it, it['src'], it['vw']?.ch);
  if (it.type === 'dict') return errRule(it, 'dict');
  if (it.type === 'vow') return errRule(it, 'vow', it['ch']);
  if (it.type === 'pre') return errRule(it, 'pre');
  return RULES[it.type];
}

/* ---------- задание без ответа (для экрана урока) ---------- */
function taskView(it: SlovaItem): string {
  switch (it.type) {
    case 'dict':
    case 'vow':
    case 'pre':
      return word(fillGap(it['w'], '?', 'gap'));
    case 'pref':
      return word(it['w']);
    case 'part':
      return partShow(it, true);
    case 'odd':
      return sent(it['words'].join(', '));
    case 'err':
      return word(it['shown']);
    case 'goal':
      return sent(`${it['s']}…`);
    case 'mark':
      return sent(`${it['s']} <span class="blank"></span>`);
    case 'syn':
    case 'ant':
      return sent(it['w']);
    case 'trio':
      return sent(it['ph'].join('<br>'));
    case 'fraz':
      return sent(`«${it['s']}»`);
    default:
      return sent(it['s']);
  }
}

/** урок после ошибки: правило + 2 примера того же типа (словарное — само слово) */
function lessonFor(it: SlovaItem) {
  const others = it.type === 'dict' ? [] : shuffle(ITEMS.filter((x) => x.type === it.type && x.id !== it.id)).slice(0, 2).map(solved);
  return lessonOf(RULES[it.type], TX, others, it.type === 'dict' ? solved(it) : undefined);
}

/* ---------- шаги ---------- */
type Lv = 0 | 1 | 2;

function checkSpec(v: { w: string; l: string; ch: string; wrong: string[] }, show: string, lv: Lv): Step {
  if (lv) {
    return {
      kind: 'input',
      answer: VOW_OK[v.w] ?? [noAccent(v.ch)],
      reject: [...v.wrong, plain(v.w, v.l), plain(v.w, PAIR[v.l])],
      unknownMsg: 'Это слово не подходит как проверочное. Подбери другое: измени слово, чтобы гласная в корне стала ударной.',
      placeholder: 'слово',
      prompt: scene({ ask: 'Напиши проверочное слово', show, note: 'Измени слово так, чтобы гласная в корне стала ударной' }),
    };
  }
  const ch = noAccent(v.ch);
  return choice({ ask: 'Выбери проверочное слово', show, note: 'Проверочное слово — родственное, и гласная в нём под ударением' }, shuffle([ch, ...v.wrong]), ch);
}

export function steps(it: SlovaItem, lv: Lv): Step[] {
  const gapW = word(fillGap(it['w'] ?? '', '?', 'gap'));
  switch (it.type) {
    case 'dict': {
      const alt = it['alt'] || PAIR[it['l']];
      if (lv === 0) return [choice({ ask: 'Вставь букву', show: gapW }, shuffle([it['l'], alt]), it['l'], { letters: true })];
      const out: Step[] = [{ kind: 'input', answer: it['l'], placeholder: 'буква', prompt: scene({ ask: 'Напечатай пропущенную букву', show: gapW }) }];
      if (lv === 2) {
        const w = plain(it['w'], it['l']);
        out.push(
          { kind: 'memorize', word: w, button: 'Готова! Писать слово', prompt: { ask: 'Напиши слово целиком', html: word(esc(w)), hint: 'Посмотри на слово и запомни. Сейчас оно спрячется — напишешь его целиком.' }, after: { html: word('• • •'), hint: undefined } },
          { kind: 'input', answer: w, placeholder: 'слово', showDiff: 'always', hints: ['Красные буквы — неверные. Исправь их.'] },
        );
      }
      return out;
    }
    case 'vow': {
      const v = { w: it['w'], l: it['l'], ch: it['ch'], wrong: it['wrong'] };
      return [
        { ...checkSpec(v, gapW, lv), ...(lv ? {} : { prompt: scene({ ask: 'Сначала проверь: какое слово проверочное?', show: gapW, note: 'Проверочное слово — родственное, и гласная в нём под ударением' }) }) } as Step,
        choice({ ask: 'Теперь вставь букву', show: gapW + why(`проверка: <b>${it['ch']}</b>`) }, shuffle([it['l'], PAIR[it['l']]]), it['l'], { letters: true }),
      ];
    }
    case 'pre':
      return [
        choice({ ask: 'Сначала найди приставку', show: gapW, note: 'Приставка стоит перед корнем' }, shuffle([it['p'], ...it['dec']].map((x: string) => x + '-')), it['p'] + '-'),
        choice({ ask: 'Теперь вставь букву', show: gapW + why(preNote(it)) }, shuffle(PRE_OPTS[it['l']].slice()), it['l'], { letters: true }),
      ];
    case 'pref':
      return [choice({ ask: 'Найди приставку', show: word(it['w']) }, shuffle([it['p'], ...it['dec']].map((x: string) => x + '-')), it['p'] + '-')];
    case 'part':
      return [choice({ ask: 'Какая часть слова выделена?', show: partShow(it, true) }, ['приставка', 'корень', 'суффикс', 'окончание'], it['kind'])];
    case 'odd':
      return [choice({ ask: 'Какое слово лишнее? Остальные — родственные' }, shuffle(it['words'].slice()), it['odd'])];
    case 'err': {
      const right = plain(it['w'], it['l']);
      const out: Step[] = [choice({ ask: 'Слово написано верно?', show: word(it['shown']) }, ['Верно', 'Есть ошибка'], it['bad'] ? 'Есть ошибка' : 'Верно')];
      if (it['bad']) out.push(choice({ ask: 'Как написать правильно?' }, shuffle([right, it['shown']]), right));
      if (it['vw']) out.push(checkSpec(it['vw'], word(fillGap(it['w'], it['l'])), lv));
      return out;
    }
    case 'goal':
      return [
        choice({ ask: 'Какое это предложение по цели?', show: sent(`${it['s']}…`) }, ['повествовательное', 'вопросительное', 'побудительное'], it['g'], { long: true }),
        choice({ ask: 'Какой знак поставить в конце?', show: sent(`${it['s']} <span class="blank"></span>`) + why(`<b>${it['g']}</b>`) }, ['.', '?', '!'], it['m'], {
          letters: true,
          accept: it['g'] === 'побудительное' ? ['.', '!'] : undefined,
        }),
      ];
    case 'mark':
      return [choice({ ask: 'Какой знак поставить в конце?', show: sent(`${it['s']} <span class="blank"></span>`) }, ['.', '?', '!'], it['m'], { letters: true })];
    case 'addr':
      return [{ kind: 'tap', words: words(it['s']), accept: [it['a']], markAs: 'hl', prompt: scene({ ask: 'Нажми на обращение' }) }];
    case 'phr':
      return [choice({ ask: 'Это предложение или словосочетание?', show: sent(it['s']) }, ['предложение', 'словосочетание'], it['isS'] ? 'предложение' : 'словосочетание')];
    case 'mem':
      return mainMembers(it as never, LBL);
    case 'syn':
    case 'ant': {
      const name = it.type === 'syn' ? 'синоним' : 'антоним';
      if (lv)
        return [
          {
            kind: 'input',
            answer: [it['a'], ...(it['alts'] ?? [])],
            bestNote: TEXT.better(it['a']),
            reject: [...it['d'], it['w']],
            typo: true,
            unknownMsg: TEXT.unknown,
            unknownLimit: 2,
            placeholder: 'слово',
            prompt: scene({ ask: `Напиши ${name} к слову «${it['w']}»`, note: TEXT.note }),
          },
        ];
      return [choice({ ask: `Найди ${name} к слову «${it['w']}»` }, shuffle([it['a'], ...it['d']]), it['a'])];
    }
    case 'fig':
      return [choice({ ask: 'Значение прямое или переносное?', show: sent(it['s']) }, ['прямое', 'переносное'], it['v'])];
    case 'sec':
      return secondaryMembers(it as never, LBL, qWrong);
    case 'mnog':
      return [
        choice(
          { ask: `Что значит слово «${it['w']}» в этом предложении?`, show: sent(it['s'].replace(new RegExp('(^|[^а-яё])(' + it['w'] + ')', 'i'), '$1<span class="hlw">$2</span>')) },
          shuffle([it['a'], ...it['d']]),
          it['a'],
          { long: true },
        ),
      ];
    case 'trio':
      return [choice({ ask: 'Какое слово подходит ко всем трём?', show: sent(it['ph'].join('<br>')) }, shuffle([it['w'], ...shuffle(TRIO_WORDS.filter((t) => t !== it['w'])).slice(0, 2)]), it['w'])];
    case 'fraz':
      return [choice({ ask: `Что значит «${it['s']}»?` }, shuffle([it['a'], ...it['d']]), it['a'], { long: true })];
  }
  return [];
}

/** упражнение: шаги + «Верно! и правило» + урок на случай ошибки */
export function exercise(it: SlovaItem, lv: Lv): Exercise {
  return streetExercise(it, steps(it, lv), solved(it), ruleFor(it), lessonFor(it), TX);
}

/* ---------- режимы = уровни улиц ---------- */
const mode = (id: string, title: string, icon: string, desc: string, lv: Lv): Mode<SlovaItem> => streetMode(id, title, icon, desc, (it: SlovaItem) => exercise(it, lv));

export const MODES_BY_STREET: Record<string, Mode<SlovaItem>[]> = {
  dict: [mode('choose', 'Выбери букву', '👆', 'Выбрать букву из двух', 0), mode('type', 'Напечатай букву', '⌨️', 'Напечатать букву самой', 1), mode('spell', 'Буква и всё слово', '✏️', 'Буква, потом всё слово по памяти', 2)],
  vow: [mode('pick', 'Проверочное — выбрать', '👆', 'Проверочное слово — выбрать из трёх', 0), mode('write', 'Проверочное — написать', '⌨️', 'Проверочное слово — написать самой', 1)],
  err: [mode('pick', 'Проверочное — выбрать', '👆', 'Найди ошибку, проверочное — выбрать', 0), mode('write', 'Проверочное — написать', '⌨️', 'Найди ошибку, проверочное — написать самой', 1)],
  lex: [mode('pick', 'Выбрать слово', '👆', 'Выбрать из трёх', 0), mode('write', 'Написать слово', '⌨️', 'Напечатать слово самой', 1)],
};
MODES_BY_STREET['dict2'] = MODES_BY_STREET['dict'];
export const playMode = (desc: string) => [mode('play', 'Играть', '▶️', desc, 0)];
