import {
  AttributeMetadata,
  AttributeMetadataType,
  TRACE_SCOPE,
  UserFilterOperator
} from '@hypertrace/distributed-tracing';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { FilterBuilderService } from '../builder/filter-builder.service';
import { NumberFilterBuilder } from '../builder/number-filter-builder';
import { StringFilterBuilder } from '../builder/string-filter-builder';
import { FilterParserService } from './filter-parser.service';

describe('Filter Parser service', () => {
  let spectator: SpectatorService<FilterParserService>;

  const calls: AttributeMetadata = {
    name: 'calls',
    displayName: 'Call Count',
    units: '',
    type: AttributeMetadataType.Number,
    scope: TRACE_SCOPE,
    requiresAggregation: false,
    allowedAggregations: []
  };

  const numberBuilder = new NumberFilterBuilder();
  const stringBuilder = new StringFilterBuilder();

  const buildService = createServiceFactory({
    service: FilterParserService,
    providers: [
      mockProvider(FilterBuilderService, {
        lookup: (attribute: AttributeMetadata) => {
          switch (attribute.type) {
            case AttributeMetadataType.Number:
              return numberBuilder;
            case AttributeMetadataType.String:
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
    expect(spectator.service.parseUrlFilterString('calls_eq_100', calls)).toEqual(
      numberBuilder.buildFilter(calls, UserFilterOperator.Equals, 100)
    );

    expect(spectator.service.parseUrlFilterString('calls_neq_100', calls)).toEqual(
      numberBuilder.buildFilter(calls, UserFilterOperator.NotEquals, 100)
    );

    expect(spectator.service.parseUrlFilterString('calls_lt_100', calls)).toEqual(
      numberBuilder.buildFilter(calls, UserFilterOperator.LessThan, 100)
    );

    expect(spectator.service.parseUrlFilterString('calls_lte_100', calls)).toEqual(
      numberBuilder.buildFilter(calls, UserFilterOperator.LessThanOrEqualTo, 100)
    );

    expect(spectator.service.parseUrlFilterString('calls_gt_100', calls)).toEqual(
      numberBuilder.buildFilter(calls, UserFilterOperator.GreaterThan, 100)
    );
  });

  test('correctly parses complete user filter string to Filter', () => {
    const expected = numberBuilder.buildFilter(calls, UserFilterOperator.GreaterThanOrEqualTo, 100);

    expect(spectator.service.parseUserFilterString('call count >= 100', calls)).toEqual(expected);
    expect(spectator.service.parseUserFilterString('call count>=100', calls)).toEqual(expected);
    expect(spectator.service.parseUserFilterString('  call count   >=    100   ', calls)).toEqual(expected);
    expect(spectator.service.parseUserFilterString('calls >= 100', calls)).not.toEqual(expected);
  });
});
