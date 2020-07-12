import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '../../content/content-holder';

@Component({
  selector: 'htc-panel-body',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelBodyComponent extends ContentHolder {}
