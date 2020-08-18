import { OverlayConfig } from './../overlay';

export interface SheetOverlayConfig extends OverlayConfig {
  size: SheetSize;
}

export const enum SheetSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  ExtraLarge = 'extra-large'
}
