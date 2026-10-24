/** Нормализация ответа: регистр, ё = е, лишние пробелы, ведущий дефис («-тся»). */
export function norm(s: string) {
  return String(s).trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').replace(/^-/, '');
}

export function matches(input: string, answer: string | string[]) {
  const a = Array.isArray(answer) ? answer : [answer];
  return a.some((x) => norm(x) === norm(input));
}

/** Посимвольное сравнение: какие буквы правильного слова ребёнок написал неверно. */
export function diffLetters(typed: string, right: string): { ch: string; bad: boolean }[] {
  const t = norm(typed);
  return [...right].map((ch, i) => ({ ch, bad: !(t[i] && t[i] === norm(ch)) }));
}

/** plural(5, ['звезда','звезды','звёзд']) */
export function plural(n: number, f: [string, string, string]) {
  const a = Math.abs(n) % 100,
    b = a % 10;
  if (a > 10 && a < 20) return f[2];
  if (b > 1 && b < 5) return f[1];
  if (b === 1) return f[0];
  return f[2];
}
