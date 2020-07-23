import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { TypedSimpleChanges } from '@hypertrace/common';
import { IconSize } from '@hypertrace/components';
import { Subscription } from 'rxjs';
import { FilterBarService } from './filter-bar.service';
import { Filter } from './filter/filter-api';

@Component({
  selector: 'htc-filter-bar',
  styleUrls: ['./filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="filter-bar"
      (focusin)="this.isFocused = true"
      (focusout)="this.isFocused = false"
      [class.focused]="this.isFocused"
    >
      <div class="content">
        <!-- Search Icon -->
        <htc-icon icon="${IconType.Filter}" size="${IconSize.Medium}" class="search-icon"></htc-icon>

        <!-- Filters -->
        <div class="filters">
          <htc-filter
            *ngFor="let filter of this.internalFilters; let index = index"
            class="filter"
            [filter]="filter"
            [scope]="this.scope"
            (apply)="this.onApply($event)"
            (clear)="this.onClear(filter)"
          ></htc-filter>
          <htc-filter
            #filterInput
            class="filter filter-input"
            [clearOnEnter]="true"
            [scope]="this.scope"
            (apply)="this.onInputApply($event)"
          ></htc-filter>
        </div>

        <!-- Clear Button -->
        <htc-icon
          *ngIf="this.internalFilters?.length"
          class="clear-icon"
          icon="${IconType.CloseCircleFilled}"
          size="${IconSize.Small}"
          tabindex="0"
          (keydown.enter)="this.onClearAll()"
          (click)="this.onClearAll()"
        ></htc-icon>
      </div>
    </div>
    <div [innerHTML]="this.instructions" class="instructions"></div>
  `
})
export class FilterBarComponent implements OnChanges {
  @Input()
  public scope!: string; // Required

  @Input()
  public filters?: Filter[] = [];

  @Input()
  public syncWithUrl: boolean = false;

  @Output()
  public readonly filtersChange: EventEmitter<Filter[]> = new EventEmitter();

  @ViewChild('filterInput', { read: ElementRef })
  public readonly filterInput!: ElementRef;

  public isFocused: boolean = false;

  private subscription?: Subscription;
  public internalFilters: Filter[] = [];
  public readonly instructions: string =
    'Select <b>one or more</b> parameters to filter by. The value is ' +
    '<b>case sensitive</b>. Examples: <b>Duration >= 10</b> or <b>Service Name = dataservice</b>';

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly filterBarService: FilterBarService
  ) {}

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.scope) {
      this.onFiltersChanged(this.filters || []);
      this.subscribeToUrlFilters();
    }

    if (changes.syncWithUrl) {
      this.subscribeToUrlFilters();
    }

    if (changes.filters) {
      this.onFiltersChanged(this.filters || []);
    }
  }

  private subscribeToUrlFilters(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.syncWithUrl) {
      this.subscription = this.filterBarService
        .getUrlFilters(this.scope)
        .subscribe(filters => this.onFiltersChanged(filters));
    } else {
      this.onFiltersChanged(this.filters || []);
    }
  }

  private onFiltersChanged(filters: Filter[]): void {
    this.internalFilters = [...filters];
    this.changeDetector.markForCheck();

    this.filtersChange.emit(this.internalFilters);

    if (this.syncWithUrl) {
      this.publishToUrlFilter();
    }
  }

  private publishToUrlFilter(): void {
    this.filterBarService.setUrlFilters(this.internalFilters);
  }

  public onInputApply(filter: Filter): void {
    const foundIndex = this.findFilterIndex(filter);
    if (foundIndex !== undefined) {
      this.updateFilter(filter);
    } else {
      this.insertFilter(filter, this.internalFilters.length + 1);
    }
    this.resetFocus();
  }

  public onApply(filter: Filter): void {
    this.updateFilter(filter);
    this.resetFocus();
  }

  public onClear(filter: Filter): void {
    this.deleteFilter(filter);
    this.resetFocus();
  }

  public onClearAll(): void {
    this.onFiltersChanged([]);
    this.resetFocus(); // TODO: This isn't working. Button remains activeElement. Need to revisit.
  }

  private resetFocus(): void {
    this.filterInput?.nativeElement.focus();
  }

  private findFilterIndex(filter: Filter): number | undefined {
    if (this.internalFilters.length <= 0) {
      return undefined;
    }

    const index = this.findFilter(filter);

    return index >= 0 ? index : undefined;
  }

  private insertFilter(filter: Filter, index: number = 0): void {
    const i = Math.min(this.internalFilters.length, index);

    this.internalFilters.splice(i, 0, filter);
    this.onFiltersChanged(this.internalFilters);
  }

  private updateFilter(filter: Filter): void {
    if (this.internalFilters.length === 0) {
      throw new Error(`Unable to update filter. Filters are empty.`);
    }

    const index = this.findFilter(filter);

    if (index < 0) {
      throw new Error(`Unable to update filter. Filter for '${filter.field}' not found.`);
    }

    this.internalFilters.splice(index, 1, filter);
    this.onFiltersChanged(this.internalFilters);
  }

  private deleteFilter(filter: Filter): void {
    if (this.internalFilters.length === 0) {
      throw new Error(`Unable to delete filter. Filters are empty.`);
    }

    const index = this.findFilter(filter);

    if (index < 0) {
      throw new Error(`Unable to delete filter. Filter for '${filter.field}' not found.`);
    }

    this.internalFilters.splice(index, 1);
    this.onFiltersChanged(this.internalFilters);
  }

  private findFilter(filter: Filter): number {
    return this.internalFilters.findIndex(f => f.field === filter.field);
  }
}
