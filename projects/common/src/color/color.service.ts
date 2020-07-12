import { Inject, Injectable, InjectionToken } from '@angular/core';
import { rgb } from 'd3-color';
import { ColorPalette } from './color-palette';
import { ColorPaletteType } from './color-palette-type';

export const BLUE_COLOR_PALETTE: InjectionToken<string[]> = new InjectionToken(ColorPaletteType.Blue);
export const RED_COLOR_PALETTE: InjectionToken<string[]> = new InjectionToken(ColorPaletteType.Red);

export type ColorPaletteKey = string | symbol;

@Injectable({ providedIn: 'root' })
export class ColorService {
  private static readonly DEFAULT_PALETTE_KEY: string = ColorPaletteType.Blue;

  private readonly registeredPalettes: Map<ColorPaletteKey, string[]> = new Map();

  public constructor(
    @Inject(BLUE_COLOR_PALETTE) blueColorPalette: string[],
    @Inject(RED_COLOR_PALETTE) redColorPalette: string[]
  ) {
    this.registerColorPalette(ColorPaletteType.Blue, blueColorPalette);
    this.registerColorPalette(ColorPaletteType.Red, redColorPalette);
  }

  public getColorPalette(colorPalette: ColorPaletteKey | string[] = ColorService.DEFAULT_PALETTE_KEY): ColorPalette {
    const basisColors = Array.isArray(colorPalette) ? colorPalette : this.getBasisColors(colorPalette);

    return new ColorPalette(basisColors);
  }

  public registerColorPalette(key: ColorPaletteKey, basisColors: string[]): void {
    this.registeredPalettes.set(key, basisColors);
  }

  public brighter(colorHex: string, basis: number): string {
    return rgb(colorHex).brighter(basis).hex();
  }

  public darker(colorHex: string, basis: number): string {
    return rgb(colorHex).darker(basis).hex();
  }

  private getBasisColors(key: ColorPaletteKey): string[] {
    return this.registeredPalettes.get(key) || this.registeredPalettes.get(ColorService.DEFAULT_PALETTE_KEY)!;
  }
}
