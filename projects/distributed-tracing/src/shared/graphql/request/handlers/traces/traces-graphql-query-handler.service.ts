import { Injectable } from '@angular/core';
import { forkJoinSafeEmpty } from '@hypertrace/common';
import { GraphQlHandlerType, GraphQlQueryHandler, GraphQlSelection } from '@hypertrace/graphql-client';
import { Dictionary } from 'lodash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphQlFilter } from '../../../model/schema/filter/graphql-filter';
import { GraphQlSortBySpecification } from '../../../model/schema/sort/graphql-sort-by-specification';
import { Specification } from '../../../model/schema/specifier/specification';
import { GraphQlTimeRange } from '../../../model/schema/timerange/graphql-time-range';
import { resolveTraceType, Trace, traceIdKey, TraceType, traceTypeKey } from '../../../model/schema/trace';
import { GraphQlArgumentBuilder } from '../../builders/argument/graphql-argument-builder';
import { GraphQlSelectionBuilder } from '../../builders/selections/graphql-selection-builder';

@Injectable({ providedIn: 'root' })
export class TracesGraphQlQueryHandlerService implements GraphQlQueryHandler<GraphQlTracesRequest, TracesResponse> {
  private readonly argBuilder: GraphQlArgumentBuilder = new GraphQlArgumentBuilder();
  private readonly selectionBuilder: GraphQlSelectionBuilder = new GraphQlSelectionBuilder();
  public readonly type: GraphQlHandlerType.Query = GraphQlHandlerType.Query;

  public matchesRequest(request: unknown): request is GraphQlTracesRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      (request as Partial<GraphQlTracesRequest>).requestType === TRACES_GQL_REQUEST
    );
  }

  public convertRequest(request: GraphQlTracesRequest): GraphQlSelection {
    return {
      path: 'traces',
      arguments: [
        this.argBuilder.forTraceType(resolveTraceType(request.traceType)),
        this.argBuilder.forLimit(request.limit),
        this.argBuilder.forTimeRange(request.timeRange),
        ...this.argBuilder.forOffset(request.offset),
        ...this.argBuilder.forOrderBy(request.sort),
        ...this.argBuilder.forFilters(request.filters)
      ],
      children: [
        {
          path: 'results',
          children: [{ path: 'id' }, ...this.selectionBuilder.fromSpecifications(request.properties)]
        },
        {
          path: 'total'
        }
      ]
    };
  }

  public convertResponse(response: TracesServerResponse, request: GraphQlTracesRequest): Observable<TracesResponse> {
    return forkJoinSafeEmpty(response.results.map(traceResult => this.normalizeTrace(traceResult, request))).pipe(
      map(results => ({
        total: response.total,
        results: results
      }))
    );
  }

  private normalizeTrace(rawResult: Dictionary<unknown>, request: GraphQlTracesRequest): Observable<Trace> {
    return forkJoinSafeEmpty(
      request.properties.map(spec => {
        const alias = spec.resultAlias();
        const data = spec.extractFromServerData(rawResult);

        return of({
          alias: alias,
          data: data
        });
      })
    ).pipe(
      map(results => {
        const trace: Trace = {
          [traceIdKey]: rawResult.id as string,
          [traceTypeKey]: resolveTraceType(request.traceType)
        };

        results.forEach(result => (trace[result.alias] = result.data));

        return trace;
      })
    );
  }
}

export const TRACES_GQL_REQUEST = Symbol('GraphQL Traces Request');

export interface GraphQlTracesRequest {
  requestType: typeof TRACES_GQL_REQUEST;
  traceType?: TraceType;
  properties: Specification[];
  timeRange: GraphQlTimeRange;
  limit: number;
  offset?: number;
  sort?: GraphQlSortBySpecification;
  filters?: GraphQlFilter[];
}

export interface TracesResponse {
  results: Trace[];
  total: number;
}

interface TracesServerResponse {
  results: Dictionary<unknown>[];
  total: number;
}
