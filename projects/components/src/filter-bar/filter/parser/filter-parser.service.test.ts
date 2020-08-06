import { FilterAttribute } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderService } from '../builder/filter-builder.service';
import { NumberFilterBuilder } from '../builder/number-filter-builder';
import { StringFilterBuilder } from '../builder/string-filter-builder';
import { UserFilterOperator } from '../filter-api';
import { FilterParserService } from './filter-parser.service';

describe('Filter Parser service', () => {
  let spectator: SpectatorService<FilterParserService>;

  const attributes: FilterAttribute[] = [
    {
      name: 'callMeMaybe',
      displayName: "Here's my number",
      units: '',
      type: 'LONG',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    },
    {
      name: 'call',
      displayName: 'Call count',
      units: '',
      type: 'LONG',
      scope: 'TRACE_SCOPE',
      requiresAggregation: false,
      allowedAggregations: [],
      groupable: false
    }
  ];

  const numberBuilder = new NumberFilterBuilder();
  const stringBuilder = new StringFilterBuilder();

  const buildService = createServiceFactory({
    service: FilterParserService,
    providers: [
      mockProvider(FilterBuilderService, {
        lookup: (attribute: FilterAttribute) => {
          switch (attribute.type) {
            case 'LONG':
              return numberBuilder;
            case 'STRING':
            default:
              return stringBuilder;
          }
        }
      })
    ]
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('correctly parses complete url filter string to Filter', () => {
    expect(spectator.service.parseUrlFilterString('call_eq_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.Equals, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_neq_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.NotEquals, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_lt_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.LessThan, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_lte_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.LessThanOrEqualTo, 100)
    );

    expect(spectator.service.parseUrlFilterString('call_gt_100', attributes)).toEqual(
      numberBuilder.buildFilter(attributes[1], UserFilterOperator.GreaterThan, 100)
    );
  });

  test('correctly parses complete user filter string to Filter', () => {
    const expected = numberBuilder.buildFilter(attributes[1], UserFilterOperator.GreaterThanOrEqualTo, 100);

    expect(spectator.service.parseUserFilterString('call count >= 100', attributes[1])).toEqual(expected);
    expect(spectator.service.parseUserFilterString('call count>=100', attributes[1])).toEqual(expected);
    expect(spectator.service.parseUserFilterString('  call count   >=    100   ', attributes[1])).toEqual(expected);
    expect(spectator.service.parseUserFilterString('calls >= 100', attributes[1])).not.toEqual(expected);
  });
});
