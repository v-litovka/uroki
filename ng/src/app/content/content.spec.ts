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
                if (st.kind === 'order') {
                  expect(st.items.length, where).toBeGreaterThan(1);
                  expect(new Set(st.items).size, where + ' одинаковые строки — порядок неоднозначен').toBe(st.items.length);
                }
                if (st.kind === 'why') {
                  expect(st.ok.length, where).toBeGreaterThan(0);
                  expect(st.wrong.length, where).toBeGreaterThan(0);
                }
              }
              // правило проекта: никаких «мама»
              expect(JSON.stringify(ex).toLowerCase(), where).not.toMatch(/мам[аыеуой]/);
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
        expect(p.mascot).not.toBe('cats');
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
