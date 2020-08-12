import { FilterType } from '../../filter-type';
import { UserFilterOperator } from '../filter-api';
import { AbstractFilterBuilder } from './abstract-filter-builder';

export class NumberFilterBuilder extends AbstractFilterBuilder<number | undefined> {
  public convertValue(value: unknown): number | undefined {
    return value === undefined || isNaN(Number(value)) ? undefined : Number(value);
  }

  public convertValueToString(value: unknown): string {
    const converted = this.convertValue(value);

    return converted === undefined ? '' : String(converted);
  }

  public supportedValue(): FilterType {
    return FilterType.Number;
  }

  public supportedOperators(): UserFilterOperator[] {
    return [
      UserFilterOperator.Equals,
      UserFilterOperator.NotEquals,
      UserFilterOperator.GreaterThan,
      UserFilterOperator.GreaterThanOrEqualTo,
      UserFilterOperator.LessThan,
      UserFilterOperator.LessThanOrEqualTo
    ];
  }
}