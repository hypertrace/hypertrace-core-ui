import { isEmpty } from 'lodash';
import { Filter } from '../../model/filter';
import { FilterOperatorType } from '../../model/filter-operator-type';
import { FilterType } from '../../model/filter-type';

// TODO K, V should be less limited but need to know how to serialize/deserialize
// TODO without knowing key/value contents, how do we make them parseable _and_ readable (i.e. not base64)
export class KeyValueFilter<
  K extends string = string,
  V extends string = string,
  O extends FilterOperatorType = FilterOperatorType
> implements Filter {
  public static for<K extends string, V extends string>(key: K): KeyValueFilter<K, V> {
    return new KeyValueFilter(key);
  }

  public static forContentString<K extends string, V extends string>(contentsAsString: string): KeyValueFilter<K, V> {
    const CONTENT_REGEX: RegExp = /([^,]+)\.([^,]*)\.([^,]*)$/;
    const matches = CONTENT_REGEX.exec(contentsAsString);
    if (!matches || matches.length !== 4) {
      throw new Error(`Unexpected content string for key value filter: ${contentsAsString}`);
    }

    const key = matches[1] as K;
    const operator = isEmpty(matches[2]) ? undefined : (matches[2] as FilterOperatorType);
    const value = isEmpty(matches[3]) ? undefined : (matches[3] as V);

    return new KeyValueFilter(key, operator, value);
  }

  public readonly type: FilterType.KeyValue = FilterType.KeyValue;

  private constructor(public readonly key: K, public readonly operator?: O, public readonly value?: V) {}

  public withValue(value: V): KeyValueFilter<K, V> {
    return new KeyValueFilter(this.key, this.operator, value);
  }

  public withOperator(operator: O): KeyValueFilter<K, V> {
    return new KeyValueFilter(this.key, operator, this.value);
  }

  public contentsAsString(): string {
    return `${String(this.key)}.${String(this.operator || '')}.${String(this.value || '')}`;
  }

  public isValid(): boolean {
    return this.key !== undefined && this.operator !== undefined && this.value !== undefined;
  }

  public getSummaryString(): string {
    throw new Error('Method not implemented.');
  }
  public getTooltipString(): string {
    throw new Error('Method not implemented.');
  }
}
