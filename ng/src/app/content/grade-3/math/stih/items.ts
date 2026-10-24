import { BLOCKS_RAW } from './data';

export interface Line {
  t: string;
  /** пример: x × y */
  x?: number;
  y?: number;
  /** что спрятано в «Допиши ответ» */
  g?: string;
  /** как это звучит словами («два четыре») */
  w?: string;
}

export interface Fact {
  id: string;
  /** номер строки в кусочке */
  i: number;
  x: number;
  y: number;
  v: number;
  g: string;
  w: string;
  block: Block;
}

export interface Block {
  id: string;
  name: string;
  L: Line[];
  F: Fact[];
}

export const BLOCKS: Block[] = BLOCKS_RAW.map((b) => {
  const L: Line[] = b.lines.map((l) => (typeof l === 'string' ? { t: l } : { t: l[0], x: l[1], y: l[2], g: l[3], w: l[4] }));
  const blk: Block = { id: b.id, name: b.name, L, F: [] };
  blk.F = L.flatMap((l, i) =>
    l.x ? [{ id: `${b.id}-${l.x}x${l.y}`, i, x: l.x, y: l.y!, v: l.x * l.y!, g: l.g!, w: l.w!, block: blk }] : [],
  );
  return blk;
});

/**
 * Какие строки «в паре» со строкой-примером i (кошки + пример).
 * Исключения — длинные связки, как в исходной игре.
 */
export function pairOf(b: Block, i: number): number[] {
  const L = b.L;
  if (b.id === '7' && i === 5) return [2, 3, 4, 5];
  if (b.id === '4a' && i === 2) return [0, 1, 2, 3];
  if (i > 0 && !L[i - 1].x) return [i - 1, i];
  if (i + 1 < L.length && !L[i + 1].x) return [i, i + 1];
  return [i];
}

/** Строчка про кошек к примеру (если есть). */
export function catLine(f: Fact): string | null {
  const P = pairOf(f.block, f.i).filter((j) => !f.block.L[j].x);
  return P.length ? f.block.L[P[0]].t : null;
}

export const ALL_FACTS: Fact[] = BLOCKS.flatMap((b) => b.F);
