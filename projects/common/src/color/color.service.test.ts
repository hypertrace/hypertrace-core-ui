import { createServiceFactory } from '@ngneat/spectator/jest';
import { ColorPalette } from './color-palette';
import { BLUE_COLOR_PALETTE, ColorService, RED_COLOR_PALETTE } from './color.service';

describe('Color service', () => {
  const defaultColors = ['rgb(0, 0, 0)', 'rgb(255, 255, 255)'];
  const createService = createServiceFactory({
    service: ColorService,
    providers: [
      { provide: BLUE_COLOR_PALETTE, useValue: defaultColors },
      { provide: RED_COLOR_PALETTE, useValue: defaultColors }
    ]
  });
  test('should support a default palette if no palette is requested', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette()).toEqual(new ColorPalette(defaultColors));
  });

  test('should use default palette if requested palette is not registered', () => {
    const spectator = createService();
    expect(spectator.service.getColorPalette('foo')).toEqual(new ColorPalette(defaultColors));
  });

  test('should support registering and using a color palette', () => {
    const spectator = createService();
    const paletteColors = ['rgb(20, 20, 20)', 'rgb(50, 50, 50)'];
    spectator.service.registerColorPalette('foo', paletteColors);
    expect(spectator.service.getColorPalette('foo')).toEqual(new ColorPalette(paletteColors));
  });

  test('should support building a custom palette that is not registered', () => {
    const spectator = createService();
    const paletteColors = ['rgb(20, 20, 20)', 'rgb(50, 50, 50)'];
    expect(spectator.service.getColorPalette(paletteColors)).toEqual(new ColorPalette(paletteColors));
  });
});
