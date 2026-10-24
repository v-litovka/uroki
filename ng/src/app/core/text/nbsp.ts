/**
 * Неразрывные пробелы: «8 · 8 = 64» и «64 кг» не должны рваться переносом.
 * Работает на всём документе (MutationObserver) — так же, как скрипт в legacy-играх.
 */
const OP = /(\S) ([·:+−=×<>]) (?=\S)/g;
const UN = /(\d) (?=(кг|км|см|дм|мм|м|г|ч|мин|р\.|т|ц|га|м²|дм²|см²|км\/ч|м\/мин|м\/с|см\/мин)(?![а-яё]))/g;

export function nbspText(v: string) {
  return v.replace(OP, '$1 $2 ').replace(OP, '$1 $2 ').replace(UN, '$1 ');
}

function fix(root: Node) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = w.nextNode())) nodes.push(n as Text);
  for (const t of nodes) {
    const v = t.nodeValue ?? '';
    const v2 = nbspText(v);
    if (v2 !== v) t.nodeValue = v2;
  }
}

export function startNbsp(root: HTMLElement = document.body) {
  try {
    fix(root);
    new MutationObserver((ms) =>
      ms.forEach((m) => {
        m.addedNodes.forEach((x) => (x.nodeType === 1 ? fix(x) : x.parentNode && fix(x.parentNode)));
        if (m.type === 'characterData' && m.target.parentNode) fix(m.target.parentNode);
      }),
    ).observe(root, { childList: true, subtree: true, characterData: true });
  } catch {
    /* ignore */
  }
}
