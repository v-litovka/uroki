/* «Город Слов»: как задание превращается в шаги (перенос mainSpecs/solved/lesson из старой игры). */
import { Exercise, Mode, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { ITEMS, PAIR, PRE_OPTS, QCAT, QREP, RULES, SlovaItem, TEXT, TRIO_WORDS, VOW_OK } from './data';

/* ---------- HTML-кусочки (как в старой игре) ---------- */
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fillGap = (w: string, l: string, cls = 'ok') => w.replace('_', `<span class="${cls}">${l}</span>`);
const plain = (w: string, l: string) => w.replace('_', l);
const word = (inner: string) => `<div class="word">${inner}</div>`;
const sent = (inner: string) => `<div class="sent">${inner}</div>`;
const why = (inner: string) => `<p class="why">${inner}</p>`;
const words = (s: string) => s.split(' ');
const bare = (w: string) => w.replace(/[.,!?…]/g, '');
const noAccent = (s: string) => s.replace(/́/g, '');
const partShow = (it: SlovaItem, hl: boolean) =>
  word(it['parts'].map((p: string, i: number) => `<span class="seg${hl && i === it['hl'] ? ' hl' : ''}">${p}</span>`).join(''));
const secWords = (x: string[]) => (x[3] ? [x[3], x[2]] : [x[2]]);
const qWrong = (q: string) => {
  const c = Object.keys(QCAT).find((k) => QCAT[k].includes(q));
  return shuffle(Object.keys(QREP).filter((k) => k !== c).map((k) => QREP[k])).slice(0, 2);
};
function secSent(it: SlovaItem, upto: number, hl?: string[]) {
  const marks: Record<string, string> = { [it['pred']]: 'u2', [it['subj']]: 'u1' };
  (it['sec'] as string[][]).slice(0, upto).forEach((x) => secWords(x).forEach((w) => (marks[w] = 'u3')));
  return sent(
    words(it['s'])
      .map((w) => {
        const b = bare(w);
        let h = marks[b] ? `<span class="${marks[b]}">${w}</span>` : w;
        if (hl?.includes(b)) h = `<span class="hlw">${h}</span>`;
        return h;
      })
      .join(' '),
  );
}
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
  const r = RULES[it.type];
  let ex = '';
  if (it.type === 'dict') ex = `<p class="sub">Запомни это слово</p><div class="memo">${solved(it)}</div>`;
  else {
    const others = shuffle(ITEMS.filter((x) => x.type === it.type && x.id !== it.id)).slice(0, 2);
    if (others.length) ex = `<p class="sub">Смотри, как это работает</p><div class="exs">${others.map((o) => `<div class="ex">${solved(o)}</div>`).join('')}</div>`;
  }
  return { title: r.title, html: `<p>${r.text}</p>${ex}` };
}

/* ---------- шаги ---------- */
interface Spec {
  ask: string;
  show?: string;
  note?: string;
}
const scene = (sp: Spec) => ({ ask: sp.ask, html: sp.show || undefined, hint: sp.note || undefined });
const choice = (sp: Spec, opts: string[], ans: string, o: { letters?: boolean; long?: boolean; accept?: string[] } = {}): Step => ({
  kind: 'choice',
  options: opts,
  answer: ans,
  accept: o.accept,
  shuffle: false,
  layout: o.letters ? 'small' : o.long || opts.some((x) => x.length > 11) ? 'list' : 'grid',
  prompt: scene(sp),
});
type Lv = 0 | 1 | 2;
type Mark = 'u1' | 'u2' | 'u3' | 'hl';

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
      return [
        { kind: 'tap', words: words(it['s']), accept: [it['pred']], markAs: 'u2', prompt: scene({ ask: 'Найди сказуемое (что делает?) — две черты' }) },
        { kind: 'tap', words: words(it['s']), accept: [it['subj']], markAs: 'u1', marked: { [it['pred']]: 'u2' }, prompt: scene({ ask: 'Найди подлежащее (кто? что?) — одна черта' }) },
      ];
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
    case 'sec': {
      const marked: Record<string, Mark> = { [it['pred']]: 'u2' };
      const out: Step[] = [
        { kind: 'tap', words: words(it['s']), accept: [it['pred']], markAs: 'u2', prompt: scene({ ask: 'Найди сказуемое (что делает?) — две черты' }) },
        { kind: 'tap', words: words(it['s']), accept: [it['subj']], markAs: 'u1', marked: { ...marked }, prompt: scene({ ask: 'Найди подлежащее (кто? что?) — одна черта' }) },
      ];
      marked[it['subj']] = 'u1';
      (it['sec'] as string[][]).forEach((x, k) => {
        const ww = secWords(x);
        if (k % 2 === 0 || Math.random() < 0.3)
          out.push({
            kind: 'tap',
            words: words(it['s']),
            accept: [x[2]],
            markWords: ww,
            markAs: 'u3',
            marked: { ...marked },
            prompt: scene({ ask: `Задай вопрос: ${x[0].toLowerCase()} (${x[1]}) … — нажми на это слово` }),
          });
        else out.push(choice({ ask: `Какой вопрос задаём от слова «${x[0].toLowerCase()}» к слову «${ww.join(' ').toLowerCase()}»?`, show: secSent(it, k, [x[0], ...ww]) }, shuffle([x[1], ...qWrong(x[1])]), x[1]));
        ww.forEach((w) => (marked[w] = 'u3'));
      });
      return out;
    }
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
  const r = ruleFor(it);
  return {
    itemId: it.id,
    label: it.label,
    prompt: {},
    steps: [
      ...steps(it, lv),
      {
        kind: 'note',
        html: `<p class="verdict">Верно! +1 ⭐</p>${solved(it)}<div class="rulebox"><b>${r.title}</b><p>${r.text}</p></div>`,
        button: 'Дальше',
        lockSec: 3,
        prompt: { ask: undefined, html: undefined, hint: undefined },
      },
    ],
    lesson: lessonFor(it),
  };
}

/* ---------- режимы = уровни улиц ---------- */
const mode = (id: string, title: string, icon: string, desc: string, lv: Lv): Mode<SlovaItem> => ({ id, title, icon, desc, build: (it) => exercise(it, lv) });

export const MODES_BY_STREET: Record<string, Mode<SlovaItem>[]> = {
  dict: [mode('choose', 'Выбери букву', '👆', 'Выбрать букву из двух', 0), mode('type', 'Напечатай букву', '⌨️', 'Напечатать букву самой', 1), mode('spell', 'Буква и всё слово', '✏️', 'Буква, потом всё слово по памяти', 2)],
  vow: [mode('pick', 'Проверочное — выбрать', '👆', 'Проверочное слово — выбрать из трёх', 0), mode('write', 'Проверочное — написать', '⌨️', 'Проверочное слово — написать самой', 1)],
  err: [mode('pick', 'Проверочное — выбрать', '👆', 'Найди ошибку, проверочное — выбрать', 0), mode('write', 'Проверочное — написать', '⌨️', 'Найди ошибку, проверочное — написать самой', 1)],
  lex: [mode('pick', 'Выбрать слово', '👆', 'Выбрать из трёх', 0), mode('write', 'Написать слово', '⌨️', 'Напечатать слово самой', 1)],
};
MODES_BY_STREET['dict2'] = MODES_BY_STREET['dict'];
export const playMode = (desc: string) => [mode('play', 'Играть', '▶️', desc, 0)];
