import { PACKS } from './registry';
import { ENTRIES } from '../core/catalog/entries';
import { matches } from '../shared/utils/text';

/**
 * Проверка ВСЕХ паков: каждый режим строит корректное упражнение для каждого элемента.
 * Ловит опечатки в данных до того, как их увидит ребёнок.
 */
describe('контент', () => {
  for (const [id, load] of Object.entries(PACKS)) {
    it(`пак ${id}: все упражнения корректны`, async () => {
      const pack = await load();
      expect(pack.id).toBe(id);
      for (const t of pack.topics) {
        expect(t.items.length).toBeGreaterThan(0);
        for (const m of t.modes) {
          const items = m.items ?? t.items;
          expect(items.length, `${t.id}/${m.id}: нет элементов`).toBeGreaterThan(0);
          for (const it of items) {
            for (let rep = 0; rep < 3; rep++) {
              const ex = m.build(it);
              const where = `${t.id}/${m.id}/${ex.itemId}`;
              expect(ex.steps.length, where).toBeGreaterThan(0);
              for (const st of ex.steps) {
                if (st.kind === 'choice') {
                  expect(st.options, where).toContain(st.answer);
                  expect(new Set(st.options).size, where + ' дубли вариантов').toBe(st.options.length);
                }
                if (st.kind === 'input') expect(matches(String(Array.isArray(st.answer) ? st.answer[0] : st.answer), st.answer), where).toBe(true);
                if (st.kind === 'tap') {
                  const ws = st.words.map((w) => w.replace(/[.,!?…:;«»"]/g, ''));
                  for (const a of st.accept) expect(ws, where + ' слово для нажатия есть в предложении').toContain(a);
                }
                if (st.kind === 'order') {
                  expect(st.items.length, where).toBeGreaterThan(1);
                  // одинаковые буквы в слове (apple) — можно: плитки с одинаковым текстом взаимозаменяемы
                  if (!st.inline) expect(new Set(st.items).size, where + ' одинаковые строки — порядок неоднозначен').toBe(st.items.length);
                }
                if (st.kind === 'why') {
                  expect(st.ok.length, where).toBeGreaterThan(0);
                  expect(st.wrong.length, where).toBeGreaterThan(0);
                }
              }
              // правило проекта: никаких «мама»; исключение — английская лексика (mum → мама), см. CLAUDE.md
              const txt = JSON.stringify(ex).toLowerCase();
              if (!(pack.subject === 'en' && /\bmum\b/.test(txt))) expect(txt, where).not.toMatch(/мам[аыеуой]/);
            }
          }
        }
      }
    });
  }

  it('у каждой плитки-пака есть пак в реестре', () => {
    for (const e of ENTRIES) if (e.kind === 'pack') expect(PACKS[e.packId], e.id).toBeTruthy();
  });

  it('4 класс — без кошек', async () => {
    for (const load of Object.values(PACKS)) {
      const p = await load();
      if (p.grade === 4) {
        expect(JSON.stringify(p.topics.map((t) => t.items))).not.toMatch(/Вир|Венди/);
      }
    }
  });
});

describe('Стишок умножения', () => {
  it('каждый пример: ответ = x · y, и он есть в строке стиха', async () => {
    const { ALL_FACTS } = await import('./grade-3/math/stih/items');
    expect(ALL_FACTS.length).toBeGreaterThan(20);
    for (const f of ALL_FACTS) {
      expect(f.v).toBe(f.x * f.y);
      expect(f.block.L[f.i].t, f.id).toContain(f.g);
      // в «спрятанном» куске цифры ответа (с пробелом/nbsp для «2 4»)
      expect(f.g.replace(/[^\d]/g, '').startsWith(String(f.v)), f.id).toBe(true);
    }
  });
});

describe('Город Слов', () => {
  it('каждое задание: урок после ошибки и финальный экран с правилом', async () => {
    const { PACK } = await import('./grade-3/ru/slova/pack');
    const { ITEMS } = await import('./grade-3/ru/slova/data');
    expect(ITEMS.length).toBeGreaterThan(400);
    expect(new Set(ITEMS.map((x) => x.id)).size).toBe(ITEMS.length);
    for (const t of PACK.topics)
      for (const m of t.modes)
        for (const it of (m.items ?? t.items).slice(0, 500)) {
          const ex = m.build(it);
          expect(ex.lesson?.title, ex.itemId).toBeTruthy();
          expect(ex.steps.at(-1)?.kind, ex.itemId).toBe('note');
          expect(ex.steps.length, ex.itemId).toBeGreaterThan(1);
        }
  });
});

describe('Горад Слоў', () => {
  it('каждое задание: урок, финальный экран, варианты без пустых', async () => {
    const { PACK } = await import('./grade-3/by/slovy/pack');
    const { ITEMS } = await import('./grade-3/by/slovy/data');
    expect(PACK.lang).toBe('by');
    expect(ITEMS.length).toBeGreaterThan(400);
    expect(new Set(ITEMS.map((x) => x.id)).size).toBe(ITEMS.length);
    for (const t of PACK.topics)
      for (const m of t.modes)
        for (const it of m.items ?? t.items) {
          const ex = m.build(it);
          expect(ex.lesson?.title, ex.itemId).toBeTruthy();
          expect(ex.steps.at(-1)?.kind, ex.itemId).toBe('note');
          expect(ex.steps.length, ex.itemId).toBeGreaterThan(1);
          for (const s of ex.steps) {
            if (s.kind === 'choice') {
              expect(s.options.every((o) => typeof o === 'string' && o.length > 0), ex.itemId).toBe(true);
              expect(s.options, ex.itemId).toContain(s.answer);
            }
            expect(JSON.stringify(s), ex.itemId).not.toContain('undefined');
          }
        }
  });
});

describe('Улица Домиков', () => {
  it('все домики × все варианты: ответ сходится, у урока есть «реши сама»', async () => {
    const { CARDS } = await import('./grade-3/math/ulica/hacks');
    const { exercise } = await import('./grade-3/math/ulica/modes');
    expect(CARDS.length).toBe(36);
    for (const c of CARDS)
      for (const hide of ['top', 'x', 'y'] as const) {
        const ex = exercise(c, hide);
        const main = ex.steps[0];
        expect(main.kind).toBe('input');
        const ans = Number((main as { answer: string }).answer);
        expect(hide === 'top' ? ans : c.n / ans, `${c.id} ${hide}`).toBe(hide === 'top' ? c.n : hide === 'x' ? c.y : c.x);
        const ls = ex.lesson!;
        expect(ls.steps?.length, `${c.id} ${hide}`).toBeGreaterThan(0);
        // последний шаг «реши сама» даёт ответ задачи
        expect(Number((ls.steps!.at(-1) as { answer: string }).answer), `${c.id} ${hide}`).toBe(ans);
        for (const s of [...ex.steps, ...ls.steps!]) expect(JSON.stringify(s)).not.toMatch(/undefined|NaN/);
        expect(ls.html).not.toMatch(/undefined|NaN/);
      }
  });
});

describe('English', () => {
  it('«mum» — только в двух местах данных (лексика), не больше', async () => {
    const src = JSON.stringify(await import('./grade-3/en/english/data')).toLowerCase();
    expect(src.match(/\bmum\b/g)?.length ?? 0).toBeLessThanOrEqual(2);
    expect(src.match(/мам[аыеуой]/g)?.length ?? 0).toBeLessThanOrEqual(2);
  });
});
