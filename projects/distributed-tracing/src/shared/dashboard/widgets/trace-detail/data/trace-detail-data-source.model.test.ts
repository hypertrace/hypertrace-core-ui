import {
  ObservedGraphQlRequest,
  spanIdKey,
  TRACE_GQL_REQUEST,
  TRACE_SCOPE,
  TraceGraphQlQueryHandlerService,
  traceIdKey,
  traceTypeKey
} from '@hypertrace/distributed-tracing';
import { ModelApi } from '@hypertrace/hyperdash';
import { TraceDetailDataSourceModel } from './trace-detail-data-source.model';

describe('Trace detail data source model', () => {
  const testTimeRange = { startTime: new Date(1568907645141), endTime: new Date(1568911245141) };
  let model!: TraceDetailDataSourceModel;
  let emittedQueries: unknown;

  beforeEach(() => {
    const mockApi: Partial<ModelApi> = {
      getTimeRange: jest.fn(() => testTimeRange)
    };
    model = new TraceDetailDataSourceModel();
    model.trace = {
      [traceIdKey]: 'test',
      [traceTypeKey]: TRACE_SCOPE
    };
    model.api = mockApi as ModelApi;
    model.query$.subscribe((query: ObservedGraphQlRequest<TraceGraphQlQueryHandlerService>) => {
      const request = query.buildRequest([]);
      emittedQueries = request;

      if (request.requestType === TRACE_GQL_REQUEST && request.traceType === TRACE_SCOPE) {
        const responseObserver = query.responseObserver;
        responseObserver.next({
          test: 'test',
          [traceIdKey]: 'test',
          [traceTypeKey]: TRACE_SCOPE,
          statusCode: '200',
          tags: {},
          requestUrl: 'test-url',
          spans: [
            {
              test: 'test',
              [spanIdKey]: 'test'
            }
          ]
        });

        responseObserver.complete();
      } else {
        const responseObserver = query.responseObserver;
        responseObserver.next({
          test: 'test',
          [traceIdKey]: 'test',
          [traceTypeKey]: TRACE_SCOPE,
          statusCode: '200',
          tags: {},
          spans: [
            {
              test: 'test',
              [spanIdKey]: 'test'
            }
          ]
        });

        responseObserver.complete();
      }
    });
  });

  test('builds expected request', () => {
    const data$ = model.getData();
    data$.subscribe();

    expect(emittedQueries).toEqual(
      expect.objectContaining({
        requestType: TRACE_GQL_REQUEST,
        traceId: 'test',
        spanLimit: 0,
        timeRange: expect.objectContaining({ from: testTimeRange.startTime, to: testTimeRange.endTime }),
        traceProperties: expect.arrayContaining([
          expect.objectContaining({ name: 'tags' }),
          expect.objectContaining({ name: 'statusCode' })
        ])
      })
    );
  });
});
