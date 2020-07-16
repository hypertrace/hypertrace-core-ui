import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavigableTab } from './navigable-tab';

@Component({
  selector: 'htc-navigable-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-navigable-tab-group>
      <htc-navigable-tab *ngFor="let tab of this.tabs" [path]="tab.path" [hidden]="tab.hidden">
        {{ tab.label }}
      </htc-navigable-tab>
    </htc-navigable-tab-group>
  `
})
export class NavigableTabsComponent {
  @Input()
  public tabs: NavigableTab[] = [];
}
