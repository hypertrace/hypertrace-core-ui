import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IconSize } from '../icon/icon-size';
import { FilterAttribute } from './filter-attribute';
import { FilterBarService, GetFiltersFunction } from './filter-bar.service';
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
            *ngFor="let filter of this.internalFilters$.value; let index = index"
            class="filter"
            [filter]="filter"
            [attributes]="this.attributes"
            (apply)="this.onApply($event)"
            (clear)="this.onClear(filter)"
          ></htc-filter>
          <htc-filter
            #filterInput
            class="filter filter-input"
            [clearOnEnter]="true"
            [attributes]="this.attributes"
            (apply)="this.onInputApply($event)"
          ></htc-filter>
        </div>

        <!-- Clear Button -->
        <htc-icon
          *ngIf="this.internalFilters$.value.length"
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
export class FilterBarComponent implements OnChanges, OnInit {
  @Input()
  public attributes?: FilterAttribute[]; // Required

  @Input()
  public filters?: Filter[] = [];

  @Input()
  public syncWithUrl: boolean = false;

  @Output()
  public readonly filtersChange: EventEmitter<Filter[]> = new EventEmitter();

  @ViewChild('filterInput', { read: ElementRef })
  public readonly filterInput!: ElementRef;

  public isFocused: boolean = false;

  public readonly internalFilters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);

  public readonly instructions: string =
    'Select <b>one or more</b> parameters to filter by. The value is ' +
    '<b>case sensitive</b>. Examples: <b>Duration >= 10</b> or <b>Service Name = dataservice</b>';

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly filterBarService: FilterBarService
  ) {}

  public ngOnChanges(): void {
    if (!!this.attributes) {
      this.syncWithUrl ? this.readFromUrlFilters() : this.onFiltersChanged(this.filters || [], false);
    }
  }

  public ngOnInit(): void {
    if (this.syncWithUrl) {
      this.filterBarService.urlFilterChanges$
        .pipe(map((getFilters: GetFiltersFunction) => getFilters(this.attributes || [])))
        .subscribe(filters => {
          this.internalFilters$.next([...filters]);
          this.changeDetector.markForCheck();
          this.filtersChange.emit(this.internalFilters$.value);
        });
    }
  }

  private onFiltersChanged(filters: Filter[], emit: boolean = true): void {
    this.internalFilters$.next([...filters]);
    this.changeDetector.markForCheck();

    if (this.syncWithUrl && !!this.attributes) {
      this.writeToUrlFilter();
    }

    emit && this.filtersChange.emit(this.internalFilters$.value);
  }

  private readFromUrlFilters(): void {
    this.internalFilters$.next(this.filterBarService.getUrlFilters(this.attributes || []));
  }

  private writeToUrlFilter(): void {
    this.filterBarService.setUrlFilters(this.internalFilters$.value);
  }

  public onInputApply(filter: Filter): void {
    const foundIndex = this.findFilterIndex(filter);
    if (foundIndex !== undefined) {
      this.updateFilter(filter);
    } else {
      this.insertFilter(filter, this.internalFilters$.value.length + 1);
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
    if (this.internalFilters$.value.length <= 0) {
      return undefined;
    }

    const index = this.findFilter(filter);

    return index >= 0 ? index : undefined;
  }

  private insertFilter(filter: Filter, index: number = 0): void {
    const i = Math.min(this.internalFilters$.value.length, index);

    // TODO: Find a better way to do without mutations?
    this.internalFilters$.value.splice(i, 0, filter);
    this.onFiltersChanged(this.internalFilters$.value);
  }

  private updateFilter(filter: Filter): void {
    if (this.internalFilters$.value.length === 0) {
      throw new Error(`Unable to update filter. Filters are empty.`);
    }

    const index = this.findFilter(filter);

    if (index < 0) {
      throw new Error(`Unable to update filter. Filter for '${filter.field}' not found.`);
    }

    this.internalFilters$.value.splice(index, 1, filter);
    this.onFiltersChanged(this.internalFilters$.value);
  }

  private deleteFilter(filter: Filter): void {
    if (this.internalFilters$.value.length === 0) {
      throw new Error(`Unable to delete filter. Filters are empty.`);
    }

    const index = this.findFilter(filter);

    if (index < 0) {
      throw new Error(`Unable to delete filter. Filter for '${filter.field}' not found.`);
    }

    this.internalFilters$.value.splice(index, 1);
    this.onFiltersChanged(this.internalFilters$.value);
  }

  private findFilter(filter: Filter): number {
    return this.internalFilters$.value.findIndex(f => f.field === filter.field);
  }
}
