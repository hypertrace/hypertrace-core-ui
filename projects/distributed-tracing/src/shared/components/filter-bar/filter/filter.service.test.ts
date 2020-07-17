import { fakeAsync } from '@angular/core/testing';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { AttributeMetadata, AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import { TRACE_SCOPE } from '../../../graphql/model/schema/trace';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { FilterBuilderService } from './builder/filter-builder.service';
import { NumberFilterBuilder } from './builder/number-filter-builder';
import { StringFilterBuilder } from './builder/string-filter-builder';
import { UserFilterOperator } from './filter-api';
import { FilterService } from './filter.service';

describe('Filter service', () => {
  let spectator: SpectatorService<FilterService>;

  const attributes: AttributeMetadata[] = [
    {
      name: 'calls',
      displayName: 'Calls',
      units: '',
      type: AttributeMetadataType.Number,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: []
    },
    {
      name: 'duration',
      displayName: 'Latency',
      units: 'ms',
      type: AttributeMetadataType.Number,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: []
    },
    {
      name: 'durationSelf',
      displayName: 'Self Latency',
      units: 'ms',
      type: AttributeMetadataType.String,
      scope: TRACE_SCOPE,
      requiresAggregation: false,
      allowedAggregations: []
    }
  ];

  const numberBuilder = new NumberFilterBuilder();
  const stringBuilder = new StringFilterBuilder();

  const buildService = createServiceFactory({
    service: FilterService,
    providers: [
      mockProvider(MetadataService, {
        getFilterAttributes: () => of(attributes)
      }),
      mockProvider(FilterBuilderService, {
        isSupportedType: () => true,
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

  test('correctly finds matching filters with no user text', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.lookupAvailableMatchingFilters(TRACE_SCOPE)).toBe('(x|)', {
        x: [
          {
            metadata: attributes[0],
            field: attributes[0].name,
            userString: attributes[0].displayName
          },
          {
            metadata: attributes[1],
            field: attributes[1].name,
            userString: attributes[1].displayName
          },
          {
            metadata: attributes[2],
            field: attributes[2].name,
            userString: attributes[2].displayName
          }
        ]
      });
    });
  }));

  test('correctly finds matching filters with partial user text', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.lookupAvailableMatchingFilters(TRACE_SCOPE, 'a')).toBe('(x|)', {
        x: [
          {
            metadata: attributes[0],
            field: attributes[0].name,
            userString: attributes[0].displayName
          },
          {
            metadata: attributes[1],
            field: attributes[1].name,
            userString: attributes[1].displayName
          },
          {
            metadata: attributes[2],
            field: attributes[2].name,
            userString: attributes[2].displayName
          }
        ]
      });
    });

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.lookupAvailableMatchingFilters(TRACE_SCOPE, 'Laten')).toBe('(x|)', {
        x: [
          {
            metadata: attributes[1],
            field: attributes[1].name,
            userString: attributes[1].displayName
          },
          {
            metadata: attributes[2],
            field: attributes[2].name,
            userString: attributes[2].displayName
          }
        ]
      });
    });
  }));

  test('correctly builds operator filters when field is matched', fakeAsync(() => {
    runFakeRxjs(({ expectObservable }) => {
      expectObservable(spectator.service.lookupAvailableMatchingFilters(TRACE_SCOPE, 'calls')).toBe('(x|)', {
        x: [
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.Equals),
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.NotEquals),
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.GreaterThan),
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.GreaterThanOrEqualTo),
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.LessThan),
          numberBuilder.buildFilter(attributes[0], UserFilterOperator.LessThanOrEqualTo)
        ]
      });
    });
  }));
});
