export const enum FilterType {
  // From AttributeMetadataType
  Boolean = 'BOOLEAN',
  String = 'STRING',
  Number = 'LONG',
  StringMap = 'STRING_MAP',
  Timestamp = 'TIMESTAMP'
}

export const toFilterType = (type: string): FilterType => {
  switch (type) {
    case 'BOOLEAN':
      return FilterType.Boolean;
    case 'STRING':
      return FilterType.String;
    case 'LONG':
      return FilterType.Number;
    case 'STRING_MAP':
      return FilterType.StringMap;
    case 'TIMESTAMP':
      return FilterType.Timestamp;
    default:
      throw Error(`Unable to convert type '${type}' to FilterType`);
  }
};
