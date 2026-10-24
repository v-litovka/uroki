/* «Горад Слоў»: як заданне ператвараецца ў крокі (перенос mainSpecs/solved/lesson из старой игры). */
import { Exercise, Mode, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { ITEMS, QCAT, QREP, RULES, SlovyItem, TEXT, TRIO_WORDS, UV_OPTS } from './data';

import {
  MainLabels,
  StreetTexts,
  bare,
  choice,
  esc,
  fillGap,
  lessonOf,
  mainMembers,
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

const TX: StreetTexts = { correct: 'Правільна! +1 ⭐', next: 'Далей', examples: 'Глядзі, як гэта працуе', remember: 'Запомні гэта слова' };
const LBL: MainLabels = {
  pred: 'Знайдзі выказнік (што робіць?) — дзве лініі',
  subj: 'Знайдзі дзейнік (хто? што?) — адна лінія',
  tapSec: (f, q) => `Задай пытанне: ${f} (${q}) … — націсні на гэтае слова`,
  askSec: (f, w) => `Якое пытанне задаём ад слова «${f}» да слова «${w}»?`,
};
const qWrong = qWrongFrom(QCAT, QREP);
const partShow = (it: SlovyItem) => partShowKit(it['parts'], it['hl']);
const secSent = (it: SlovyItem, upto: number) => secSentKit(it as never, upto);
const isSent = (w: string) => /\s/.test(w);
const shown = (w: string, l: string, cls = 'ok') => (isSent(w) ? sent(fillGap(w, l, cls)) : word(fillGap(w, l, cls)));
/** тыпы-«словы»: правіла на экране «Правільна» — пра гэта слова */
const WORD_TYPES = ['dict', 'ak', 'uv', 'zs', 'dzc', 'zac', 'dvo', 'apos', 'par'];

/* ---------- як выглядае вырашанае заданне ---------- */
export function solved(it: SlovyItem): string {
  const full = it['w'] && it['l'] !== undefined ? shown(it['w'], it['l']) : '';
  switch (it.type) {
    case 'dict':
      return full + why('слоўнікавае слова — запомні!');
    case 'ak':
      return full + why(`${it['acc']} — ${it['st'] ? 'пад націскам' : 'без націску'}`);
    case 'uv':
      return full + why(`перад гукам: <b>${it['bef']}</b>`);
    case 'zs':
      return full + why(`пасля прыстаўкі — <b>${it['snd']}</b> гук, таму <b>${it['l']}</b>`);
    case 'dzc':
      return full + why(it['soft'] ? 'пасля — е, ё, ю, я, і або ь' : 'пасля — іншая літара');
    case 'zac':
      return full;
    case 'dvo':
      return full + why(it['btw'] ? 'паміж галоснымі — падаўжаецца' : 'побач няма галоснага — не падаўжаецца');
    case 'apos':
      return full + why(it['hs'] === 'цвёрды' ? 'пасля цвёрдага — апостраф' : 'пасля мяккага — мяккі знак');
    case 'par':
      return full + why(`праверка: <b>${it['ch']}</b>`);
    case 'err':
      return full + why(it['bad'] ? 'было з памылкай: ' + it['shown'] : 'напісана правільна');
    case 'type':
      return sent(`${it['s']}<b style="color:var(--good)">${it['m']}</b>`) + why(`<b>${it['g']}</b>${it['m'] === '!' || it['m'] === '?!' ? ', клічны' : ''}`);
    case 'mem':
      return (
        sent(words(it['s']).map((w) => (bare(w) === it['subj'] ? `<span class="u1">${w}</span>` : bare(w) === it['pred'] ? `<span class="u2">${w}</span>` : w)).join(' ')) +
        why(`дзейнік <b>${it['subj']}</b> — адна лінія, выказнік <b>${it['pred']}</b> — дзве`)
      );
    case 'syn':
    case 'ant':
      return `<p class="why" style="font-size:24px">${it['w']} — <b>${it['a']}</b></p>${it['alts']?.length ? why(`${TEXT.also}: ${it['alts'].join(', ')}`) : ''}`;
    case 'fig':
      return sent(it['s']) + why(`<b>${it['v']}</b> значэнне`);
    case 'sec':
      return (
        secSent(it, it['sec'].length) +
        why((it['sec'] as string[][]).map((x) => x[0].toLowerCase() + ' (' + x[1] + ') <b>' + secWords(x).join(' ').toLowerCase() + '</b>').join('<br>'))
      );
    case 'mnog':
    case 'hom':
      return sent(it['s']) + why(`«${it['w']}» — <b>${it['a']}</b>`);
    case 'trio':
      return sent((it['ph'] as string[]).map((p) => p.replace('…', `<b style="color:var(--good)">${it['w']}</b>`)).join('<br>')) + why(`${it['w']} — <b>мнагазначнае слова</b>`);
    case 'part':
      return partShow(it) + why(`«${it['parts'][it['hl']]}» — <b>${it['kind']}</b>`);
    case 'odd':
      return why(`роднасныя: ${it['words'].filter((w: string) => w !== it['odd']).join(', ')} (корань <b>${it['root']}</b>)<br>лішняе: <b>${it['odd']}</b>`);
  }
  return '';
}

/* ---------- правіла да задання ---------- */
const wordRule = (it: SlovyItem, src: string) => {
  const r = RULES[src];
  return { title: r.title, text: `Правільна: <b class="big">${plain(it['w'], `<u>${it['l']}</u>`)}</b>. ${r.text}` };
};
export function ruleFor(it: SlovyItem): { title: string; text: string } {
  if (it.type === 'err') return wordRule(it, it['src']);
  if (WORD_TYPES.includes(it.type)) return wordRule(it, it.type);
  return RULES[it.type];
}

/** урок пасля памылкі: правіла + 2 прыклады таго ж тыпу (слоўнікавае — само слова) */
function lessonFor(it: SlovyItem) {
  const others = it.type === 'dict' ? [] : shuffle(ITEMS.filter((x) => x.type === it.type && x.id !== it.id)).slice(0, 2).map(solved);
  return lessonOf(RULES[it.type], TX, others, it.type === 'dict' ? solved(it) : undefined);
}

/* ---------- крокі ---------- */
type Lv = 0 | 1 | 2;

export function steps(it: SlovyItem, lv: Lv): Step[] {
  const ph = it.type === 'uv' ? 'у/ў' : '?';
  const show = it['w'] ? shown(it['w'], ph, 'gap') : '';
  const letter = (ask = 'Цяпер устаў літару') => choice({ ask, show }, shuffle([it['l'], it['alt']]), it['l'], { letters: true });
  const opened = it['w'] ? word(fillGap(it['w'], it['l'])) : '';
  switch (it.type) {
    case 'dict': {
      if (lv === 0) return [letter('Устаў літару')];
      const out: Step[] = [{ kind: 'input', answer: it['l'], placeholder: 'літара', prompt: scene({ ask: 'Надрукуй прапушчаную літару', show }) }];
      if (lv === 2) {
        const w = plain(it['w'], it['l']);
        out.push(
          {
            kind: 'memorize',
            word: w,
            button: 'Гатова! Пісаць слова',
            prompt: { ask: 'Напішы слова цалкам', html: word(esc(w)), hint: 'Паглядзі на слова і запомні. Зараз яно схаваецца — напішаш яго цалкам.' },
            after: { html: word('• • •'), hint: undefined },
          },
          { kind: 'input', answer: w, placeholder: 'слова', showDiff: 'always', hints: ['Чырвоныя літары — няправільныя. Выправі іх.'] },
        );
      }
      return out;
    }
    case 'ak':
      return [
        letter('Устаў літару'),
        choice({ ask: 'Гэты галосны пад націскам ці без націску?', show: opened, note: 'Вымаві слова ўголас і паслухай, дзе націск' }, ['пад націскам', 'без націску'], it['st'] ? 'пад націскам' : 'без націску'),
      ];
    case 'uv':
      return [choice({ ask: 'Што стаіць перад гукам [у]?', show }, UV_OPTS.slice(), it['bef'], { long: true }), letter()];
    case 'zs':
      return [letter('Устаў літару ў прыстаўку'), choice({ ask: 'Гук пасля прыстаўкі звонкі ці глухі?', show: opened, note: 'Глухія: к, п, т, ф, х, ц, ч, ш, с' }, ['звонкі', 'глухі'], it['snd'])];
    case 'dzc': {
      const hd = it['soft'] ? it['alt'] : it['l'];
      const sf = it['soft'] ? it['l'] : it['alt'];
      return [choice({ ask: `Што пісаць: <b>${hd}</b> ці <b>${sf}</b>? Спачатку паглядзі на літару пасля пропуску. Гэта е, ё, ю, я, і або ь?`, show }, ['так', 'не'], it['soft'] ? 'так' : 'не'), letter()];
    }
    case 'zac':
      return [letter('Устаў літару')];
    case 'dvo': {
      const pair = [it['l'], it['alt']].sort((x: string, y: string) => x.length - y.length).join('</b> ці <b>');
      return [choice({ ask: `Што пісаць: <b>${pair}</b>? Спачатку паглядзі: зычны стаіць паміж галоснымі?`, show }, ['так', 'не'], it['btw'] ? 'так' : 'не'), letter()];
    }
    case 'apos':
      return [
        choice({ ask: 'Што пісаць: <b>апостраф (’)</b> ці <b>мяккі знак (ь)</b>? Спачатку паглядзі: перад пропускам цвёрды ці мяккі зычны?', show }, ['цвёрды', 'мяккі'], it['hs']),
        letter('Цяпер устаў апостраф або мяккі знак'),
      ];
    case 'par':
      return [choice({ ask: 'Спачатку правер: якое слова праверачнае?', show, note: 'У праверачным слове пасля зычнага стаіць галосны' }, shuffle([it['ch'], ...it['wrong']]), it['ch']), letter()];
    case 'err': {
      const right = plain(it['w'], it['l']);
      const out: Step[] = [choice({ ask: 'Слова напісана правільна?', show: word(it['shown']) }, ['Правільна', 'Ёсць памылка'], it['bad'] ? 'Ёсць памылка' : 'Правільна')];
      if (it['bad']) out.push(choice({ ask: 'Як напісаць правільна?' }, shuffle([right, it['shown']]), right));
      return out;
    }
    case 'type':
      return [
        choice({ ask: 'Які гэта сказ па мэце выказвання?', show: sent(`${it['s']}…`) }, ['апавядальны', 'пытальны', 'пабуджальны'], it['g'], { long: true }),
        choice({ ask: 'Які знак паставіць у канцы?', show: sent(`${it['s']} <span class="blank"></span>`) + why(`<b>${it['g']}</b>`) }, ['.', '?', '!', '?!'], it['m'], {
          letters: true,
          accept: it['okv'],
        }),
      ];
    case 'mem':
      return mainMembers(it as never, LBL);
    case 'syn':
    case 'ant': {
      const name = it.type === 'syn' ? 'сінонім' : 'антонім';
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
            placeholder: 'слова',
            prompt: scene({ ask: `Напішы ${name} да слова «${it['w']}»`, note: TEXT.note }),
          },
        ];
      return [choice({ ask: `Знайдзі ${name} да слова «${it['w']}»` }, shuffle([it['a'], ...it['d']]), it['a'])];
    }
    case 'fig':
      return [choice({ ask: 'Значэнне прамое ці пераноснае?', show: sent(it['s']) }, ['прамое', 'пераноснае'], it['v'])];
    case 'sec':
      return secondaryMembers(it as never, LBL, qWrong);
    case 'mnog':
      return [
        choice(
          { ask: `Што значыць слова «${it['w']}» у гэтым сказе?`, show: sent(it['s'].replace(new RegExp('(^|[^а-яёіў])(' + it['w'] + ')', 'i'), '$1<span class="hlw">$2</span>')) },
          shuffle([it['a'], ...it['d']]),
          it['a'],
          { long: true },
        ),
      ];
    case 'trio':
      return [choice({ ask: 'Якое слова падыходзіць да ўсіх трох?', show: sent(it['ph'].join('<br>')) }, shuffle([it['w'], ...shuffle(TRIO_WORDS.filter((t) => t !== it['w'])).slice(0, 2)]), it['w'])];
    case 'hom':
      return [choice({ ask: `Што значыць слова «${it['w']}» у гэтым сказе?`, show: sent(it['s']) }, shuffle([it['a'], ...it['d']]), it['a'], { long: true })];
    case 'part':
      return [choice({ ask: 'Якая частка слова выдзелена?', show: partShow(it) }, ['корань', 'канчатак'], it['kind'])];
    case 'odd':
      return [choice({ ask: 'Якое слова лішняе? Астатнія — роднасныя' }, shuffle(it['words'].slice()), it['odd'])];
  }
  return [];
}

/** заданне: крокі + «Правільна! і правіла» + урок на выпадак памылкі */
export function exercise(it: SlovyItem, lv: Lv): Exercise {
  return streetExercise(it, steps(it, lv), solved(it), ruleFor(it), lessonFor(it), TX);
}

/* ---------- рэжымы = узроўні вуліц ---------- */
const mode = (id: string, title: string, icon: string, desc: string, lv: Lv): Mode<SlovyItem> => streetMode(id, title, icon, desc, (it: SlovyItem) => exercise(it, lv));

export const MODES_BY_STREET: Record<string, Mode<SlovyItem>[]> = {
  dict: [
    mode('choose', 'Выберы літару', '👆', 'Выбраць літару з дзвюх', 0),
    mode('type', 'Надрукуй літару', '⌨️', 'Надрукаваць літару самой', 1),
    mode('spell', 'Літара і ўсё слова', '✏️', 'Літара, потым усё слова па памяці', 2),
  ],
  lex: [mode('pick', 'Выбраць слова', '👆', 'Выбраць з трох', 0), mode('write', 'Напісаць слова', '⌨️', 'Надрукаваць слова самой', 1)],
};
MODES_BY_STREET['dict2'] = MODES_BY_STREET['dict'];
export const playMode = (desc: string) => [mode('play', 'Гуляць', '▶️', desc, 0)];
