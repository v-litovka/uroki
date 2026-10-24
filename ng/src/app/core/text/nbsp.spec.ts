import { nbspText } from './nbsp';

describe('nbsp', () => {
  it('склеивает знаки и единицы', () => {
    expect(nbspText('8 · 8 = 64')).toBe('8 · 8 = 64');
    expect(nbspText('36 кг клубники')).toBe('36 кг клубники');
  });
});
