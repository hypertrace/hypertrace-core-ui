import { FilterType } from './filter-type';

export interface Filter {
  contentsAsString(): string;
  readonly type: FilterType;
  getSummaryString(): string;
  getTooltipString(): string;
  isValid(): boolean;
}
