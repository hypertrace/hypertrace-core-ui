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
            <htc-label
              *ngIf="!this.multiSelectMode"
              class="trigger-label"
              [label]="selected?.label || this.placeholder"
            ></htc-label>
            <htc-label
              *ngIf="this.multiSelectMode"
              class="trigger-label"
              [label]="this.createTriggerLabel()"
            ></htc-label>
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
  public selected?: V;

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
  public readonly selectedChange: EventEmitter<V> = new EventEmitter<V>();

  @ContentChildren(SelectOptionComponent)
  public items?: QueryList<SelectOptionComponent<V>>;

  public selected$?: Observable<SelectOption<V> | SelectOption<V>[] | undefined>;

  public groupPosition: SelectGroupPosition = SelectGroupPosition.Ungrouped;

  public get justifyClass(): string {
    if (this.justify !== undefined) {
      return this.justify;
    }

    return this.showBorder ? SelectJustify.Left : SelectJustify.Right;
  }

  public constructor(
    private readonly loggerService: LoggerService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  public createTriggerLabel(): string | undefined {
    if (this.multiSelectMode) {
      const selectedItemsLength = ((this.selected ?? []) as SelectOption<V>[]).length;
      if (selectedItemsLength === 0) {
        return this.placeholder;
      } else if (selectedItemsLength === 1) {
        return ((this.selected ?? []) as SelectOption<V>[])[0].label;
      } else {
        return `${((this.selected ?? []) as SelectOption<V>[])[0].label} and ${selectedItemsLength - 1} more`;
      }
    } else {
      return ((this.selected ?? {}) as SelectOption<V>).label ?? this.placeholder;
    }
  }

  public ngAfterContentInit(): void {
    this.selected$ = this.buildObservableOfSelected();
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (this.items !== undefined && changes.selected !== undefined) {
      this.selected$ = this.buildObservableOfSelected();
    }
  }

  public isSelectedItem(item: SelectOptionComponent<V>): boolean {
    if (this.multiSelectMode) {
      return ((this.selected ?? []) as SelectOption<V>[]).filter(option => option.value === item.value).length > 0;
    } else {
      return this.selected === item.value;
    }
  }

  public updateGroupPosition(position: SelectGroupPosition): void {
    this.groupPosition = position;
    this.changeDetector.markForCheck();
  }

  private buildObservableOfSelected(): Observable<SelectOption<V> | SelectOption<V>[] | undefined> {
    if (!this.items) {
      return EMPTY;
    }

    return queryListAndChanges$(this.items).pipe(
      switchMap(items => merge(of(undefined), ...items.map(option => option.optionChange$))),
      map(() => this.findItem(this.selected))
    );
  }

  public onSelectionChange(item: SelectOptionComponent<V>): void {
    if (this.multiSelectMode) {
      const selectionArray = (this.selected ?? []) as SelectOption<V>[];
      if (selectionArray.map(option => option.value).includes(item.value)) {
        ((this.selected ?? []) as SelectOption<V>[]).forEach((option, index) => {
          if (option.value === item.value) {
            ((this.selected ?? []) as SelectOption<V>[]).splice(index, 1);

            return;
          }
        });
      } else {
        ((this.selected ?? []) as SelectOption<V>[]).push(item);
      }
    } else {
      this.selected = item.value;
    }
    this.selected$ = this.buildObservableOfSelected();
    this.selectedChange.emit(this.selected);
  }

  private findItem(value: V | undefined): SelectOption<V> | SelectOption<V>[] | undefined {
    if (this.items === undefined) {
      this.loggerService.warn(`Invalid items for select option '${String(value)}'`);

      return undefined;
    }

    if (this.multiSelectMode) {
      const selectedValues = ((this.selected ?? []) as SelectOption<V>[]).map(item => item.value);

      return this.items.filter(item => selectedValues.includes(item.value));
    } else {
      return this.items.find(item => item.value === value);
    }
  }
}
