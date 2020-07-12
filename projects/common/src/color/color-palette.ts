import { rgb } from 'd3-color';
import { interpolateRgbBasis, quantize } from 'd3-interpolate';

export class ColorPalette {
  private readonly basisColors: string[];
  public constructor(basisColors: string[]) {
    if (basisColors.length < 2) {
      throw Error('A color palette must consist of at least 2 colors');
    }
    this.basisColors = basisColors.map(color => rgb(color).toString());
  }

  public forNColors(count: number): string[] {
    if (count === this.basisColors.length) {
      // Use as is if palette size matches, don't interpolate
      return [...this.basisColors];
    }

    if (count === 2) {
      // Use the middle and end colors for generating 2 colors from a larger palette
      return this.forNColors(3).slice(0, 2);
    }

    // Otherwise, use standard interpolation

    const colorInterpolator = interpolateRgbBasis(this.basisColors);

    return quantize(colorInterpolator, count);
  }

  public forOriginalColors(): string[] {
    return [...this.basisColors];
  }
}
