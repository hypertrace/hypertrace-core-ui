import { TemplateRef, Type } from '@angular/core';

export interface OverlayConfig {
  showHeader?: boolean;
  title?: string;
  closeOnNavigate?: boolean;
  content: TemplateRef<unknown> | Type<unknown>;
}
