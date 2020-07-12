import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, Type } from '@angular/core';
import { Filter } from '../model/filter';
import { FilterCollection, FilterConfig } from '../model/filter-collection';

@Component({
  selector: 'htc-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-select [selected]="this.selectedFilter" (selectedChange)="this.addFilter($event)" placeholder="Filter...">
      <htc-select-option
        *ngFor="let filterConfig of this.availableFilters"
        [value]="filterConfig"
        [label]="filterConfig.displayName"
      >
      </htc-select-option>
    </htc-select>
    <div style="display: flex; flex-direction: column;">
      <ng-container *ngFor="let renderedFilter of this.currentFilters">
        <htc-filter-renderer
          [renderer]="renderedFilter.renderer"
          [filter]="renderedFilter.filter"
          [filterConfig]="renderedFilter.config"
          (filterRemove)="this.removeFilter(renderedFilter.config)"
          (filterChange)="this.updateFilter(renderedFilter.config, $event)"
        >
        </htc-filter-renderer>
      </ng-container>
    </div>
  `
})
export class FilterPanelComponent<TConfig extends FilterConfig> implements OnChanges {
  @Input()
  public filterCollection?: FilterCollection<TConfig>;

  @Output()
  public readonly filterCollectionChange: EventEmitter<FilterCollection<unknown>> = new EventEmitter();

  public availableFilters: TConfig[] = [];
  public currentFilters: FilterRenderInfo<TConfig>[] = [];
  public selectedFilter?: TConfig; // Tracking it only so we can clear the selection

  public ngOnChanges(): void {
    this.updateFiltersInView();
  }

  public addFilter(config: TConfig): void {
    this.selectedFilter = config;
    this.filterCollection = this.filterCollection!.set(config, config.defaultValue());
    this.emitIfFilterCollectionValid();
  }

  public updateFilter(config: TConfig, newFilter: Filter): void {
    this.filterCollection = this.filterCollection!.set(config, newFilter);
    this.emitIfFilterCollectionValid();
  }

  public removeFilter(config: TConfig): void {
    this.selectedFilter = undefined;
    this.filterCollection = this.filterCollection!.remove(config);
    this.emitIfFilterCollectionValid();
  }

  private getFilterRenderInfo(): FilterRenderInfo<TConfig>[] {
    if (!this.filterCollection) {
      return [];
    }

    return Array.from(this.filterCollection.getCurrentFilters())
      .filter(([config]) => config.renderer)
      .map(([config, filter]) => ({
        filter: filter,
        config: config,
        renderer: config.renderer!
      }));
  }

  private getAvailableFilters(): TConfig[] {
    if (!this.filterCollection) {
      return [];
    }

    return this.filterCollection.getCurrentAllowedFilters();
  }

  private emitIfFilterCollectionValid(): void {
    const allFilters = this.filterCollection && Array.from(this.filterCollection.getCurrentFilters().values());

    if (allFilters && allFilters.every(filter => filter.isValid())) {
      this.filterCollectionChange.emit(this.filterCollection);
    } else {
      this.updateFiltersInView();
    }
  }

  private updateFiltersInView(): void {
    this.currentFilters = this.getFilterRenderInfo();
    this.availableFilters = this.getAvailableFilters();
  }
}

interface FilterRenderInfo<TConfig extends FilterConfig> {
  filter: Filter;
  renderer: Type<unknown>;
  config: TConfig;
}
