/**
 * Система наград (одинаковая во всех играх):
 * уровень n открывается при lvlAt(n) звёзд: 20, 50, 90, 140, 200…
 * Звёзды никогда не сгорают.
 */
export const lvlAt = (n: number) => 5 * n * (n + 3);

export function levelOf(stars: number) {
  let n = 0;
  while (lvlAt(n + 1) <= stars) n++;
  return n;
}
