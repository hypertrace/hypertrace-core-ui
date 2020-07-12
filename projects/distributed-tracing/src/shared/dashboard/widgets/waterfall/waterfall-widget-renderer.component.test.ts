import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { BLUE_COLOR_PALETTE, NavigationService, RED_COLOR_PALETTE } from '@hypertrace/common';
import { byText, createComponentFactory, mockProvider } from '@ngneat/spectator/jest';

import { RENDERER_API } from '@hypertrace/hyperdash-angular';

import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { GraphQlRequestService } from '@hypertrace/graphql-client';
import { getMockFlexLayoutProviders } from '@hypertrace/test-utils';
import { EMPTY, of } from 'rxjs';
import { AttributeMetadataType } from '../../../graphql/model/metadata/attribute-metadata';
import { SpanType } from '../../../graphql/model/schema/span';
import { MetadataService } from '../../../services/metadata/metadata.service';
import { WaterfallWidgetRendererComponent } from './waterfall-widget-renderer.component';
import { WaterfallWidgetModule } from './waterfall-widget.module';
import { WaterfallData } from './waterfall/waterfall-chart';

describe('Waterfall widget renderer component', () => {
  const mockResponse: WaterfallData[] = [
    {
      id: 'first-id',
      isCurrentExecutionEntrySpan: true,
      parentId: '',
      startTime: 1571339873680,
      endTime: 1571339873680,
      duration: {
        value: 1,
        units: 'ms'
      },
      name: 'Span Name 1',
      serviceName: 'Service Name 1',
      protocolName: 'Protocol Name 1',
      spanType: SpanType.Entry,
      requestHeaders: {},
      requestBody: 'Request Body',
      responseHeaders: {},
      responseBody: 'Response Body',
      tags: {}
    },
    {
      id: 'second-id',
      isCurrentExecutionEntrySpan: false,
      parentId: 'first-id',
      startTime: 1571339873680,
      endTime: 1571339873680,
      duration: {
        value: 2,
        units: 'ms'
      },
      name: 'Span Name 2',
      serviceName: 'Service Name 2',
      protocolName: 'Protocol Name 2',
      spanType: SpanType.Exit,
      requestHeaders: {},
      requestBody: '',
      responseHeaders: {},
      responseBody: '',
      tags: {}
    }
  ];

  const createComponent = createComponentFactory<WaterfallWidgetRendererComponent>({
    component: WaterfallWidgetRendererComponent,
    providers: [
      {
        provide: RENDERER_API,
        useValue: {
          getTimeRange: jest.fn(),
          model: {
            getData: jest.fn(() => of(mockResponse))
          },
          change$: EMPTY,
          dataRefresh$: EMPTY,
          timeRangeChanged$: EMPTY
        }
      },
      {
        provide: BLUE_COLOR_PALETTE,
        useValue: ['black', 'white']
      },
      {
        provide: RED_COLOR_PALETTE,
        useValue: ['black', 'white']
      },
      mockProvider(GraphQlRequestService, {
        queryImmediately: () => EMPTY
      }),
      mockProvider(MetadataService, {
        getAttribute: (scope: string, attributeKey: string) =>
          of({
            name: attributeKey,
            displayName: 'Latency',
            units: 'ms',
            type: AttributeMetadataType.Number,
            scope: scope,
            requiresAggregation: false,
            allowedAggregations: []
          })
      }),
      ...getMockFlexLayoutProviders()
    ],
    mocks: [NavigationService],
    declareComponent: false,
    imports: [WaterfallWidgetModule, HttpClientTestingModule, IconLibraryTestingModule]
  });

  test('renders the widget', fakeAsync(() => {
    const spectator = createComponent();
    tick(200);

    const table = spectator.query('htc-table')!;
    expect(table).toExist();

    const chart = spectator.query('htc-waterfall-chart')!;
    expect(chart).toExist();
  }));

  test('gets callback when collapsing all', fakeAsync(() => {
    const spectator = createComponent();
    const spy = spyOn(spectator.component, 'onCollapseAll');

    const button = spectator.query(byText('Collapse All'));
    spectator.click(button!);
    tick(200);

    expect(spy).toHaveBeenCalled();
  }));

  test('gets callback when expanding all', fakeAsync(() => {
    const spectator = createComponent();
    const spy = spyOn(spectator.component, 'onExpandAll');

    const button = spectator.query(byText('Expand All'));
    spectator.click(button!);
    tick(200);

    expect(spy).toHaveBeenCalled();
  }));
});
