import { isEmpty } from 'lodash-es';
import { Filter } from '../../model/filter';
import { FilterOperatorType } from '../../model/filter-operator-type';
import { FilterType } from '../../model/filter-type';

export class NumericFilter<O extends FilterOperatorType = FilterOperatorType> implements Filter {
  public static for(key: string): NumericFilter {
    return new NumericFilter(key);
  }

  public static forContentString(contentsAsString: string): NumericFilter {
    const CONTENT_REGEX: RegExp = /([^,]+)\.([^,]*)\.([^,]*)\.?([^,]*)$/;
    const matches = CONTENT_REGEX.exec(contentsAsString);
    if (!matches || matches.length !== 5) {
      throw new Error(`Unexpected content string for numeric filter: ${contentsAsString}`);
    }

    const key = matches[1];
    const operator = isEmpty(matches[2]) ? undefined : (matches[2] as FilterOperatorType);
    const firstValue = isEmpty(matches[3]) ? undefined : parseInt(matches[3]); // TODO floats?
    const secondValue = isEmpty(matches[4]) ? undefined : parseInt(matches[4]);

    if (firstValue !== undefined && secondValue !== undefined) {
      return new NumericFilter(key, operator, undefined, [firstValue, secondValue]);
    }

    return new NumericFilter(key, operator, firstValue);
  }

  public readonly type: FilterType.Numeric = FilterType.Numeric;
  private readonly isRangeFilter: boolean;

  private constructor(
    public readonly key: string,
    public readonly operator?: O,
    public readonly value?: number,
    public readonly valueRange?: [number, number]
  ) {
    this.isRangeFilter = valueRange !== undefined;
  }

  public withValue(value: number): NumericFilter<O> {
    return new NumericFilter(this.key, this.operator, value);
  }

  public withValueRange(valueRange: [number, number]): NumericFilter<O> {
    return new NumericFilter(this.key, this.operator, undefined, valueRange);
  }

  public withOperator(operator: O): NumericFilter<O> {
    return new NumericFilter(this.key, operator, this.value);
  }

  public contentsAsString(): string {
    return `${this.key}.${String(this.operator || '')}.${this.valueAsString()}`;
  }

  public isValid(): boolean {
    return (
      this.operator !== undefined &&
      ((this.value !== undefined && !this.isRangeFilter) || (this.valueRange !== undefined && this.isRangeFilter))
    );
  }

  public getSummaryString(): string {
    throw new Error('Method not implemented.');
  }
  public getTooltipString(): string {
    throw new Error('Method not implemented.');
  }

  private valueAsString(): string {
    if (this.isRangeFilter) {
      return `${this.valueRange![0]}.${this.valueRange![1]}`;
    }
    if (this.value !== undefined) {
      return `${this.value}`;
    }

    return '';
  }
}
