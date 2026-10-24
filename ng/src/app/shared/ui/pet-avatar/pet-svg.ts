/* Параметрический рисунок питомца (кошка / собака) по окрасу, узору и телосложению.
 * Толстая кошка — по мотивам Виры, худая — по мотивам Венди. Только наш статичный SVG. */
import { Pet } from '../../../core/models';

export type PetMood = 'happy' | 'sad' | 'sly' | 'wow';

/** затемнить/осветлить #rrggbb */
export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  const r = ch((n >> 16) & 255),
    g = ch((n >> 8) & 255),
    b = ch(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 > 200;
};

function eyesAndMouth(cx: number, ey: number, mood: PetMood, dark: string) {
  const l = cx - 13,
    r = cx + 13;
  const eyes =
    mood === 'sly'
      ? `<path d="M${l - 5} ${ey}h10M${r - 5} ${ey}h10" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`
      : `<ellipse cx="${l}" cy="${ey}" rx="4.8" ry="6.2" fill="${dark}"/><ellipse cx="${r}" cy="${ey}" rx="4.8" ry="6.2" fill="${dark}"/>` +
        `<circle cx="${l + 1.6}" cy="${ey - 2}" r="1.7" fill="#fff"/><circle cx="${r + 1.6}" cy="${ey - 2}" r="1.7" fill="#fff"/>`;
  const my = ey + 12;
  const mouth =
    mood === 'sad'
      ? `M${cx - 8} ${my + 2}q8 -6 16 0`
      : mood === 'wow'
        ? `M${cx - 4} ${my}a4 5 0 1 0 8 0a4 5 0 1 0 -8 0`
        : `M${cx - 8} ${my}q4 5 8 0q4 5 8 0`;
  return { eyes, mouth: `<path d="${mouth}" fill="none" stroke="${dark}" stroke-width="2.2" stroke-linecap="round"/>` };
}

function cat(p: Pet, mood: PetMood): { svg: string; vb: string; ratio: number } {
  const { body, marks, pattern, build } = p.look;
  const outline = isLight(body) ? '#d9d9d9' : shade(body, -0.25);
  const tail = pattern === 'plain' ? shade(body, -0.2) : marks;
  const dark = '#222';
  if (build === 'fat') {
    const { eyes, mouth } = eyesAndMouth(62, 48, mood, dark);
    const spots =
      pattern === 'spots'
        ? `<path d="M30 92c8-10 22-8 22 2s-16 14-22 6z" fill="${marks}"/><path d="M78 118c10-8 22-2 18 8s-18 6-18-8z" fill="${marks}"/><ellipse cx="58" cy="128" rx="8" ry="5" fill="${marks}"/>`
        : pattern === 'stripes'
          ? `<path d="M36 96q26 -8 52 0M30 110q32 -8 64 0M36 124q26 -8 52 0" stroke="${marks}" stroke-width="5" fill="none" stroke-linecap="round"/>`
          : '';
    const headMark =
      pattern === 'spots'
        ? `<path d="M30 40c4-14 20-16 24-6s-6 18-16 16-10-4-8-10z" fill="${marks}"/>`
        : pattern === 'stripes'
          ? `<path d="M52 26l10 8 10-8M46 32h-6M78 32h6" stroke="${marks}" stroke-width="3" stroke-linecap="round" fill="none"/>`
          : '';
    return {
      vb: '0 0 124 150',
      ratio: 1.21,
      svg: `<path d="M96 128c20 4 26-14 16-24" fill="none" stroke="${tail}" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="62" cy="106" rx="42" ry="38" fill="${body}" stroke="${outline}" stroke-width="2"/>${spots}
<ellipse cx="44" cy="140" rx="11" ry="6" fill="${body}" stroke="${outline}" stroke-width="2"/><ellipse cx="80" cy="140" rx="11" ry="6" fill="${body}" stroke="${outline}" stroke-width="2"/>
<path d="M30 36l2-26 20 14z" fill="${pattern === 'spots' ? marks : body}" stroke="${outline}" stroke-width="2"/><path d="M94 36l-2-26-20 14z" fill="${body}" stroke="${outline}" stroke-width="2"/>
<path d="M90 32l-1-14-10 8z" fill="#f2b6c0"/>
<ellipse cx="62" cy="50" rx="35" ry="29" fill="${body}" stroke="${outline}" stroke-width="2"/>${headMark}
${eyes}<ellipse cx="62" cy="56" rx="4" ry="3" fill="#f29aaa"/>${mouth}
<path d="M34 56h14M34 61l14-2M90 56h-14M90 61l-14-2" stroke="#999" stroke-width="1.4" stroke-linecap="round"/>`,
    };
  }
  // обычная/худая — по мотивам Венди
  const rx = build === 'thin' ? 22 : 28;
  const { eyes, mouth } = eyesAndMouth(60, 44, mood, dark);
  const stripes =
    pattern === 'stripes'
      ? `<path d="M${60 - rx + 6} 92h${2 * rx - 12}M${60 - rx + 4} 104h${2 * rx - 8}M${60 - rx + 6} 116h${2 * rx - 12}" stroke="${marks}" stroke-width="4" stroke-linecap="round"/>`
      : pattern === 'spots'
        ? `<ellipse cx="${60 - rx / 2}" cy="98" rx="7" ry="6" fill="${marks}"/><ellipse cx="${60 + rx / 2}" cy="118" rx="8" ry="6" fill="${marks}"/>`
        : '';
  const headMark =
    pattern === 'stripes'
      ? `<path d="M52 24l8 8 8-8M48 30h-6M72 30h6" stroke="${marks}" stroke-width="3" stroke-linecap="round" fill="none"/>`
      : pattern === 'spots'
        ? `<ellipse cx="74" cy="34" rx="8" ry="6" fill="${marks}"/>`
        : '';
  return {
    vb: '0 0 120 150',
    ratio: 1.25,
    svg: `<path d="M84 132c22 0 30-20 20-34" fill="none" stroke="${tail}" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="60" cy="108" rx="${rx}" ry="32" fill="${body}" stroke="${outline}" stroke-width="1.5"/>${stripes}
<ellipse cx="60" cy="112" rx="${rx / 2}" ry="20" fill="#fff" opacity=".3"/>
<ellipse cx="50" cy="138" rx="8" ry="5" fill="${body}" stroke="${outline}" stroke-width="1.5"/><ellipse cx="70" cy="138" rx="8" ry="5" fill="${body}" stroke="${outline}" stroke-width="1.5"/>
<path d="M34 34l4-26 18 16z" fill="${body}" stroke="${outline}" stroke-width="1.5"/><path d="M86 34l-4-26-18 16z" fill="${body}" stroke="${outline}" stroke-width="1.5"/>
<path d="M39 30l2-14 9 9z" fill="#e7a7a0"/><path d="M81 30l-2-14-9 9z" fill="#e7a7a0"/>
<ellipse cx="60" cy="46" rx="29" ry="25" fill="${body}" stroke="${outline}" stroke-width="1.5"/>${headMark}
${eyes}<path d="M57 51l3 3 3-3z" fill="#d97a7a"/>${mouth}
<path d="M34 50h12M34 55l12-2M86 50h-12M86 55l-12-2" stroke="${isLight(body) ? '#999' : shade(body, -0.5)}" stroke-width="1.4" stroke-linecap="round"/>`,
  };
}

function dog(p: Pet, mood: PetMood): { svg: string; vb: string; ratio: number } {
  const { body, marks, pattern, build } = p.look;
  const outline = isLight(body) ? '#d9d9d9' : shade(body, -0.3);
  const rx = build === 'fat' ? 34 : build === 'thin' ? 24 : 29;
  const dark = '#222';
  const { eyes } = eyesAndMouth(60, 46, mood, dark);
  const mouth =
    mood === 'sad'
      ? `<path d="M52 72q8 -6 16 0" fill="none" stroke="${dark}" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="M50 66q10 10 20 0" fill="none" stroke="${dark}" stroke-width="2.2" stroke-linecap="round"/>` +
        (mood === 'happy' ? `<path d="M56 70q4 10 8 0z" fill="#e8798a"/>` : '');
  const spots =
    pattern === 'spots'
      ? `<ellipse cx="${60 - rx / 2}" cy="100" rx="9" ry="7" fill="${marks}"/><ellipse cx="${60 + rx / 2.5}" cy="120" rx="8" ry="6" fill="${marks}"/><ellipse cx="44" cy="40" rx="7" ry="6" fill="${marks}"/>`
      : pattern === 'stripes'
        ? `<path d="M${60 - rx + 8} 98h${2 * rx - 16}M${60 - rx + 6} 112h${2 * rx - 12}" stroke="${marks}" stroke-width="4" stroke-linecap="round"/>`
        : '';
  return {
    vb: '0 0 120 150',
    ratio: 1.25,
    svg: `<path d="M${60 + rx - 4} 104q22 -6 18 -30" fill="none" stroke="${body}" stroke-width="7" stroke-linecap="round"/>
<rect x="${60 - rx + 6}" y="120" width="10" height="24" rx="5" fill="${shade(body, -0.08)}"/><rect x="${60 + rx - 16}" y="120" width="10" height="24" rx="5" fill="${shade(body, -0.08)}"/>
<ellipse cx="60" cy="108" rx="${rx}" ry="26" fill="${body}" stroke="${outline}" stroke-width="1.5"/>
<rect x="${60 - rx / 2 - 5}" y="124" width="10" height="22" rx="5" fill="${body}"/><rect x="${60 + rx / 2 - 5}" y="124" width="10" height="22" rx="5" fill="${body}"/>${spots}
<path d="M38 36l-6-32 24 22z" fill="${body}" stroke="${outline}" stroke-width="1.5"/><path d="M82 36l6-32-24 22z" fill="${body}" stroke="${outline}" stroke-width="1.5"/>
<path d="M38 30l-3-18 12 12z" fill="#e7a7a0"/><path d="M82 30l3-18-12 12z" fill="#e7a7a0"/>
<ellipse cx="60" cy="48" rx="27" ry="25" fill="${body}" stroke="${outline}" stroke-width="1.5"/>
<ellipse cx="60" cy="62" rx="15" ry="11" fill="${shade(body, 0.25)}"/>
${eyes}<ellipse cx="60" cy="57" rx="5" ry="4" fill="${dark}"/>${mouth}`,
  };
}

export function petSvg(p: Pet, mood: PetMood = 'happy', size = 60): string {
  const d = p.kind === 'dog' ? dog(p, mood) : cat(p, mood);
  return `<svg viewBox="${d.vb}" width="${size}" height="${Math.round(size * d.ratio)}" role="img" aria-label="${p.name.replace(/"/g, '')}" style="display:block;overflow:visible">${d.svg}</svg>`;
}
