import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'htc-filter-tab',
  styleUrls: ['./filter-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-tab">
      <htc-label class="label" [label]="this.label"></htc-label>
    </div>
  `
})
export class FilterTabComponent {
  @Input()
  public label?: string;

  public constructor(public readonly elementRef: ElementRef) {}
}
