import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { LoggerService, queryListAndChanges$, SubscriptionLifecycle, TypedSimpleChanges } from '@hypertrace/common';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { SelectGroupPosition } from './select-group-position';
import { SelectJustify } from './select-justify';
import { SelectOption } from './select-option';
import { SelectOptionComponent } from './select-option.component';
import { SelectSize } from './select-size';

@Component({
  selector: 'htc-select',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div
      class="select"
      [ngClass]="[
        this.size,
        this.groupPosition,
        this.showBorder ? 'border' : '',
        this.disabled ? 'disabled' : '',
        !this.multiSelectMode && selected ? selected.style.toString() : ''
      ]"
      *htcLetAsync="this.selected$ as selected"
    >
      <htc-popover [disabled]="this.disabled" [closeOnClick]="!this.multiSelectMode" class="select-container">
        <htc-popover-trigger>
          <div class="trigger-content" [ngClass]="this.justifyClass">
            <htc-icon *ngIf="this.icon" class="trigger-prefix-icon" [icon]="this.icon" size="${IconSize.Small}">
            </htc-icon>
            <htc-label class="trigger-label" [label]="this.triggerLabel"></htc-label>
            <htc-icon class="trigger-icon" icon="${IconType.ChevronDown}" size="${IconSize.Small}"> </htc-icon>
          </div>
        </htc-popover-trigger>
        <htc-popover-content>
          <div class="select-content">
            <div *ngFor="let item of items" (click)="this.onSelectionChange(item)" class="select-option">
              <input *ngIf="this.multiSelectMode" type="checkbox" [checked]="this.isSelectedItem(item)" />
              <span class="label">{{ item.label }}</span>
              <htc-icon
                class="status-icon"
                *ngIf="!this.multiSelectMode && this.highlightSelected && this.isSelectedItem(item)"
                icon="${IconType.Checkmark}"
                size="${IconSize.Small}"
              >
              </htc-icon>
            </div>
          </div>
        </htc-popover-content>
      </htc-popover>
    </div>
  `
})
export class SelectComponent<V> implements AfterContentInit, OnChanges {
  @Input()
  public size: SelectSize = SelectSize.Medium;

  @Input()
  public selected?: V | V[];

  @Input()
  public icon?: string;

  @Input()
  public placeholder?: string;

  @Input()
  public disabled: boolean = false;

  @Input()
  public showBorder: boolean = false;

  @Input()
  public justify?: SelectJustify;

  @Input()
  public highlightSelected: boolean = true;

  @Input()
  public multiSelectMode: boolean = false;

  @Output()
  public readonly selectedChange: EventEmitter<V | V[]> = new EventEmitter<V | V[]>();

  @ContentChildren(SelectOptionComponent)
  public items?: QueryList<SelectOptionComponent<V>>;

  public selected$?: Observable<SelectOption<V>[] | SelectOption<V> | undefined>;

  public groupPosition: SelectGroupPosition = SelectGroupPosition.Ungrouped;
  public triggerLabel?: string;

  public get justifyClass(): string {
    if (this.justify !== undefined) {
      return this.justify;
    }

    return this.showBorder ? SelectJustify.Left : SelectJustify.Right;
  }

  public constructor(
    private readonly loggerService: LoggerService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.setTriggerLabel();
  }

  public ngAfterContentInit(): void {
    this.selected$ = this.buildObservableOfSelected();
    this.setTriggerLabel();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (this.items !== undefined && changes.selected !== undefined) {
      this.selected$ = this.buildObservableOfSelected();
    }
    this.setTriggerLabel();
  }

  private setTriggerLabel(): void {
    if (this.multiSelectMode) {
      const selectedItems: SelectOptionComponent<V>[] | undefined = this.items?.filter(item =>
        (this.selected as V[]).includes(item.value)
      );
      if (selectedItems === undefined || selectedItems.length === 0) {
        this.triggerLabel = this.placeholder;
      } else if (selectedItems.length === 1) {
        this.triggerLabel = selectedItems[0].label;
      } else {
        this.triggerLabel = `${selectedItems[0].label} and ${selectedItems.length - 1} more`;
      }
    } else {
      this.triggerLabel = this.items?.find(item => item.value === (this.selected as V))?.label || this.placeholder;
    }
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    if (this.multiSelectMode) {
      return this.selected !== undefined && (this.selected as V[]).filter(value => value === item.value).length > 0;
    } else {
      return this.selected !== undefined && this.selected === item.value;
    }
  }

  public updateGroupPosition(position: SelectGroupPosition): void {
    this.groupPosition = position;
    this.changeDetector.markForCheck();
  }

  private buildObservableOfSelected(): Observable<SelectOption<V>[] | SelectOption<V> | undefined> {
    if (!this.items) {
      return EMPTY;
    }

    return queryListAndChanges$(this.items).pipe(
      switchMap(items => merge(of([]), ...items.map(option => option.optionChange$))),
      map(() => this.findItem(this.selected))
    );
  }

  public onSelectionChange(item: SelectOptionComponent<V>): void {
    if (this.multiSelectMode) {
      // If selected in undefined
      if (this.selected === undefined) {
        this.selected = [item.value];
      } else {
        const selectedItems: V[] = [...(this.selected as V[])];
        if (selectedItems.includes(item.value)) {
          // Remove if already selected
          this.selected = selectedItems.filter(value => value !== item.value);
        } else {
          // Add if not present already
          (this.selected as V[]).push(item.value);
        }
      }
    } else {
      this.selected = item.value;
    }
    this.setTriggerLabel();
    this.selected$ = this.buildObservableOfSelected();
    this.selectedChange.emit(this.selected);
  }

  // Find the select option object for a value
  private findItem(value: V | V[] | undefined): SelectOption<V> | SelectOption<V>[] | undefined {
    if (this.items === undefined) {
      this.loggerService.warn(`Invalid items for select option '${String(value)}'`);

      return undefined;
    }
    if (this.multiSelectMode) {
      return this.items.filter(item => (this.selected as V[]).includes(item.value));
    } else {
      return this.items.find(item => item.value === value);
    }
  }
}
