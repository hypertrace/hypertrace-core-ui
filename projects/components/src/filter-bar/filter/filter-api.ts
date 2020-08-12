import { FilterAttribute } from '../filter-attribute';

export interface Filter<T = unknown> {
  metadata: FilterAttribute;
  field: string;
  operator: UserFilterOperator;
  value: T;
  userString: string;
  urlString: string;
}

export const enum UserFilterOperator {
  Equals = '=',
  NotEquals = '!=',
  LessThan = '<',
  LessThanOrEqualTo = '<=',
  GreaterThan = '>',
  GreaterThanOrEqualTo = '>=',
  ContainsKey = 'CONTAINS_KEY',
  ContainsKeyValue = 'CONTAINS_KEY_VALUE'
}

export const enum UrlFilterOperator {
  Equals = '_eq_',
  NotEquals = '_neq_',
  LessThan = '_lt_',
  LessThanOrEqualTo = '_lte_',
  GreaterThan = '_gt_',
  GreaterThanOrEqualTo = '_gte_',
  ContainsKey = '_ck_',
  ContainsKeyValue = '_ckv_'
}

export const USER_FILTER_OPERATORS: UserFilterOperator[] = [
  UserFilterOperator.Equals,
  UserFilterOperator.NotEquals,
  UserFilterOperator.GreaterThan,
  UserFilterOperator.GreaterThanOrEqualTo,
  UserFilterOperator.LessThan,
  UserFilterOperator.LessThanOrEqualTo,
  UserFilterOperator.ContainsKey,
  UserFilterOperator.ContainsKeyValue
];

export const URL_FILTER_OPERATORS: UrlFilterOperator[] = [
  UrlFilterOperator.Equals,
  UrlFilterOperator.NotEquals,
  UrlFilterOperator.LessThan,
  UrlFilterOperator.LessThanOrEqualTo,
  UrlFilterOperator.GreaterThan,
  UrlFilterOperator.GreaterThanOrEqualTo,
  UrlFilterOperator.ContainsKey,
  UrlFilterOperator.ContainsKeyValue
];
