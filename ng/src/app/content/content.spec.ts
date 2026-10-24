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
          for (const it of t.items) {
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
