import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'htc-checkbox',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-checkbox
      labelPosition="after"
      [checked]="this.checked"
      (change)="onCheckboxChange($event)"
      [disabled]="this.disabled"
      class="htc-checkbox"
      (click)="$event.stopPropagation()"
      ><htc-label class="label" *ngIf="this.label" [label]="this.label"></htc-label>
    </mat-checkbox>
  `
})
export class CheckboxComponent {
  @Input()
  public label?: string;

  @Input()
  public checked: boolean | undefined;

  @Input()
  public disabled: boolean | undefined;

  @Output()
  public readonly checkedChange: EventEmitter<boolean> = new EventEmitter();

  public onCheckboxChange(event: MatCheckboxChange): void {
    this.checked = event.checked;
    this.checkedChange.emit(this.checked);
  }
}
