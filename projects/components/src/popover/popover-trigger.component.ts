import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '../content/content-holder';

@Component({
  selector: 'htc-popover-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CONTENT_HOLDER_TEMPLATE
})
export class PopoverTriggerComponent extends ContentHolder {}
