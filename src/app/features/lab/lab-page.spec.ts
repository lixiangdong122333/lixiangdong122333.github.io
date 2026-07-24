import { calculateContrastRatio } from './lab-page';

describe('calculateContrastRatio', () => {
  it('returns the WCAG maximum ratio for black and white', () => {
    expect(calculateContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('is symmetrical', () => {
    const forward = calculateContrastRatio('#047857', '#f8fafc');
    const reverse = calculateContrastRatio('#f8fafc', '#047857');

    expect(forward).toBeCloseTo(reverse, 8);
  });
});
