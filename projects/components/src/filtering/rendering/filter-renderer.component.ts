import { PortalInjector } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  InjectionToken,
  Injector,
  Input,
  OnChanges,
  Output,
  Type
} from '@angular/core';
import { Filter } from '../model/filter';
import { FilterConfig } from '../model/filter-collection';

@Component({
  selector: 'htc-filter-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="rendererInjector">
      <ng-container *ngComponentOutlet="renderer; injector: rendererInjector"> </ng-container>
      <htc-button label="Remove" (click)="this.filterRemove.emit()"> </htc-button>
      <htc-button label="Apply" (click)="this.filterChange.emit(this.currentFilter)" [disabled]="!this.currentFilter">
      </htc-button>
    </ng-container>
  `
})
export class FilterRendererComponent implements OnChanges {
  @Input()
  public filter?: Filter;

  @Input()
  public filterConfig?: FilterConfig;

  @Input()
  public renderer?: Type<unknown>;

  @Output()
  public readonly filterChange: EventEmitter<Filter> = new EventEmitter();

  @Output()
  public readonly filterRemove: EventEmitter<void> = new EventEmitter();

  public rendererInjector?: Injector;
  public currentFilter?: Filter;

  public constructor(private readonly injector: Injector) {}

  public ngOnChanges(): void {
    if (this.filter && this.renderer && this.filterConfig) {
      this.rendererInjector = new PortalInjector(
        this.injector,
        new WeakMap([[FILTER_RENDERER_API, this.buildApiForFilter(this.filter, this.filterConfig)]])
      );
    }
  }

  private buildApiForFilter(filter: Filter, filterConfig: FilterConfig): FilterRendererApi<Filter> {
    return {
      filter: filter,
      filterConfig: filterConfig,
      filterChange: newFilter => (this.currentFilter = newFilter)
    };
  }
}

export interface FilterRendererApi<T extends Filter> {
  filter: T;
  filterConfig: FilterConfig;
  filterChange(newFilter: T): void;
}

export const FILTER_RENDERER_API: InjectionToken<FilterRendererApi<Filter>> = new InjectionToken('FILTER_RENDERER_API');
