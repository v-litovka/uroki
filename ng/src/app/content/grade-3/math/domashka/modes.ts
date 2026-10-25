/* «Домашка»: упражнение тетради (legacy.ts → PAGES) → шаги движка.
 * Правила (CLAUDE.md): ответ НЕ показываем; подсказки наводят; данные ребёнок вводит сам, потом они появляются на доске;
 * после верного ответа — «Почему?»; в конце — запись для тетради (промежуточное — серым, карандашом). */
import { Exercise, Mode, OpPart, Prompt, Step } from '../../../../core/models';
import { DM, LegacyEx, LegacyItem, LegacyStep } from './legacy';

const { exprHTML, tokens } = DM;
const OPN: Record<string, string> = { '+': 'сложение', '−': 'вычитание', '·': 'умножение', ':': 'деление' };
const apply = (a: number, o: string, b: number) => (o === '+' ? a + b : o === '−' ? a - b : o === '·' ? a * b : a / b);
/** подсказки и сообщения показываются текстом — убираем теги и сущности */
export const plainText = (h: string) =>
  h
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
const fmt = (o: string) => (/^[\d\s()+−·:a-z]+$/.test(o) ? exprHTML(o) : o);

/** «Похоже, получилось сложение, а знак тут «·»» — для каждого другого действия заранее */
function numFeedback(st: LegacyStep): Record<string, string> | undefined {
  if (!st.act) return undefined;
  const { a, o, b } = st.act;
  const fb: Record<string, string> = {};
  for (const p of '+−·:') {
    if (p === o || (p === ':' && (b === 0 || a % b !== 0))) continue;
    const r = apply(a, p, b);
    if (r !== apply(a, o, b) && fb[String(r)] === undefined) fb[String(r)] = `Похоже, получилось ${OPN[p]}, а знак тут «${o}» — ${OPN[o]}.`;
  }
  return fb;
}

/** выражение → куски для шага «порядок действий» (знаки — кнопки) */
function opParts(expr: string): OpPart[] {
  let k = 0;
  return tokens(expr).map((x): OpPart => {
    if (x.t === 'op') return { t: 'op', i: k++, o: x.o! };
    if (x.t === 'v') return { t: 'txt', html: x.name === '□' ? '<span class="bx"></span>' : `<i class="var">${x.name}</i>` };
    return { t: 'txt', html: x.t === 'n' ? String(x.v) : x.t };
  });
}

/** запись для тетради — как в старой игре (copyHTML) */
export function copyHTML(ex: LegacyEx): string {
  let rec = ex.items.map((it) => it.record || (it.steps.length ? it.steps[it.steps.length - 1].board || '' : ''));
  const cols = ex.items.map((i) => i.col).filter(Boolean) as (string | number)[][];
  if (cols.length)
    rec = [
      `<table class="tblc">${['Уменьшаемое', 'Вычитаемое', 'Разность']
        .map((h, r) => `<tr><th>${h}</th>${cols.map((c) => `<td>${r === 2 ? '<b>' + c[r] + '</b>' : c[r]}</td>`).join('')}</tr>`)
        .join('')}</table>`,
    ];
  rec = rec.filter(Boolean);
  const pen = rec.join('').includes('class="pen"') ? '<p class="penl">✏️ ПРОМЕЖУТОЧНЫЕ ОТВЕТЫ (СЕРЫЕ) ПЕРЕПИШИ КАРАНДАШОМ В ТЕТРАДЬ!</p>' : '';
  return `${pen}<div class="copy">${rec.map((r) => `<div class="bl">${r}</div>`).join('')}</div>`;
}

function header(ex: LegacyEx, i: number) {
  const n = ex.items.length;
  const prog = n > 1 ? `<div class="prog"><span>Пример ${i + 1} из ${n}</span>${ex.items.map((_, k) => `<i class="${k < i ? 'd' : k === i ? 'c' : ''}"></i>`).join('')}</div>` : '';
  return `<div class="task"><div class="tt">${ex.text}</div><details class="rulebox"><summary>📖 Правило</summary><div>${ex.rule}</div></details></div>${prog}`;
}
const boardHtml = (b: string) => (b ? `<div class="board">${b}</div>` : '');

/** один шаг legacy → шаг движка (без «почему?») */
function convert(st: LegacyStep, prompt: Partial<Prompt>): Step {
  const hints = (st.hints ?? []).map(plainText);
  const base = { prompt, hints };
  switch (st.k) {
    case 'pick': {
      const opts = st.opts!;
      const ids = opts.map((_, k) => `o${k}`);
      return {
        ...base,
        kind: 'choice',
        options: ids,
        optionHtml: Object.fromEntries(opts.map((o, k) => [ids[k], st.signs || st.svg ? o : fmt(o)])),
        answer: ids[st.ok],
        accept: (st.alt ?? []).map((k) => ids[k]),
        shuffle: false,
        layout: st.svg ? 'cards' : st.signs ? 'small' : opts.some((o) => plainText(o).length > 14) ? 'list' : 'grid',
      };
    }
    case 'num':
      return { ...base, kind: 'input', numeric: true, answer: String(st.ok), any: !!st.any, placeholder: '?', feedback: numFeedback(st) };
    case 'nums':
      return { ...base, kind: 'nums', fields: st.fields!, pre: st.pre, check: st.check, testv: st.testv };
    case 'multi':
      return { ...base, kind: 'multi', options: st.opts!.map((o) => (st.raw ? o : exprHTML(o))), correct: st.ok, msgs: st.msgs };
    case 'order':
      return { ...base, kind: 'ops', parts: opParts(st.expr!), order: st.ok };
    case 'note':
      return { ...base, kind: 'note', html: '', button: st.btn || 'Готово', lockSec: 3 };
  }
  throw new Error('Домашка: неизвестный шаг ' + st.k);
}

/** «Почему?» после верного ответа: два варианта причины; один вариант — кнопка-подтверждение на 5 с */
function whyStep(st: LegacyStep, html: (q: string) => string): Step {
  const w = st.why!;
  const opt = st.k === 'pick' ? st.opts![st.ok] : '';
  const q = w.q || (st.k === 'pick' && !st.svg ? `Почему <b>${st.signs ? opt : fmt(opt)}</b>?` : 'Почему?');
  const prompt = { ask: undefined, html: html(`<p class="wh">Верно! ${q}</p>`), hint: undefined };
  if (!w.no?.length) return { kind: 'note', html: '', button: w.ok, lockSec: 5, prompt };
  return { kind: 'why', ok: w.ok, wrong: w.no, prompt };
}

function itemSteps(ex: LegacyEx, it: LegacyItem, i: number): Step[] {
  const head = header(ex, i);
  let board = it.start || '';
  const out: Step[] = [];
  for (const st of it.steps) {
    const q = `<p class="q">${st.q}</p>`;
    const step = convert(st, { ask: undefined, html: head + boardHtml(board) + q + (st.show ?? ''), hint: undefined });
    // данные появляются на доске только ПОСЛЕ верного ответа
    if (st.board) {
      board = st.board;
      step.after = { html: head + boardHtml(board) + q };
    }
    out.push(step);
    if (st.why) out.push(whyStep(st, (w) => head + boardHtml(board) + w));
  }
  if (i < ex.items.length - 1 && out.length) out[out.length - 1].okMsg = 'Верно! Дальше следующий пример.';
  return out;
}

export interface ExItem extends LegacyEx {
  id: string;
  page: number;
}

export function exercise(ex: ExItem): Exercise {
  const steps = ex.items.flatMap((it, i) => itemSteps(ex, it, i));
  steps.push({
    kind: 'note',
    html: `<p class="verdict">Упражнение ${ex.n} решено!</p><p class="sub">Перепиши в тетрадь</p>${copyHTML(ex)}`,
    button: 'Готово',
    prompt: { ask: undefined, html: undefined, hint: undefined },
  });
  return { itemId: ex.id, label: `стр. ${ex.page} № ${ex.n}: ${plainText(ex.title)}`, prompt: {}, steps, askHint: true };
}

export const exMode = (ex: ExItem): Mode<ExItem> => ({
  id: `e${ex.n}`,
  title: `№ ${ex.n}. ${plainText(ex.title)}`,
  icon: '✏️',
  desc: plainText(ex.text).slice(0, 110),
  items: [ex],
  roundSize: 1,
  shuffle: false,
  build: exercise,
});
