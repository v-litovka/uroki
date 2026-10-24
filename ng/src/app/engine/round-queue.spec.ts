import { RoundQueue } from './round-queue';

describe('RoundQueue', () => {
  it('ошибка повторяется в конце и не считается «с первого раза»', () => {
    const q = new RoundQueue(['a', 'b', 'c'], 10, false);
    q.complete(true); // a — ошибка
    q.complete(false); // b
    q.complete(false); // c
    expect(q.done).toBe(false);
    expect(q.current.item).toBe('a');
    expect(q.current.again).toBe(true);
    q.complete(true); // a снова с ошибкой — больше не повторяем
    expect(q.done).toBe(true);
    expect(q.firstTry).toBe(2);
    expect(q.total).toBe(3);
  });

  it('берёт не больше size', () => {
    expect(new RoundQueue([1, 2, 3, 4, 5], 3).total).toBe(3);
  });
});
