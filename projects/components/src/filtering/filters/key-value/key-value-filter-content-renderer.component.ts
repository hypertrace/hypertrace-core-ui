import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FilterOperatorType } from '../../model/filter-operator-type';
import { FILTER_RENDERER_API, FilterRendererApi } from '../../rendering/filter-renderer.component';
import { KeyValueFilter } from './key-value-filter';

@Component({
  selector: 'htc-key-value-filter-content-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./key-value-filter-content-renderer.component.scss'],
  template: `
    <span>
      {{ this.api.filterConfig.displayName }}
    </span>
    <htc-select
      placeholder="Operator"
      [selected]="this.currentFilter.operator"
      (selectedChange)="this.updateOperator($event)"
    >
      <htc-select-option
        *ngFor="let operator of this.allowedOperators"
        [value]="operator.value"
        [label]="operator.label"
      >
      </htc-select-option>
    </htc-select>
    <htc-input [value]="this.currentFilter.value" (valueChange)="this.updateValue($event)" placeholder="Value">
    </htc-input>
  `
})
export class KeyValueFilterContentRendererComponent {
  public currentFilter: KeyValueFilter;
  public constructor(
    @Inject(FILTER_RENDERER_API)
    public readonly api: FilterRendererApi<KeyValueFilter>
  ) {
    this.currentFilter = api.filter;
  }

  public readonly allowedOperators: OperatorSelectOption[] = [
    {
      label: '=',
      value: FilterOperatorType.Equals
    },
    {
      label: '!=',
      value: FilterOperatorType.NotEquals
    }
  ];

  public updateOperator(newOperator: FilterOperatorType): void {
    this.currentFilter = this.currentFilter.withOperator(newOperator);
    this.emitUpdateIfValid();
  }

  public updateValue(newValue: string): void {
    this.currentFilter = this.currentFilter.withValue(newValue);
    this.emitUpdateIfValid();
  }

  private emitUpdateIfValid(): void {
    if (this.currentFilter.isValid()) {
      this.api.filterChange(this.currentFilter);
    }
  }
}

interface OperatorSelectOption {
  label: string;
  value: FilterOperatorType;
}
