import { ARRAY_PROPERTY, Model, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Trace, TraceType } from '../../../../../shared/graphql/model/schema/trace';
import {
  TraceGraphQlQueryHandlerService,
  TRACE_GQL_REQUEST
} from '../../../../../shared/graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { GraphQlDataSourceModel } from '../graphql-data-source.model';
import { AttributeSpecificationModel } from '../specifiers/attribute-specification.model';

@Model({
  type: 'trace-data-source'
})
export class TraceDataSourceModel extends GraphQlDataSourceModel<Trace> {
  @ModelProperty({
    key: 'trace',
    required: true,
    type: STRING_PROPERTY.type
  })
  public traceType!: TraceType;

  @ModelProperty({
    key: 'traceId',
    required: true,
    type: STRING_PROPERTY.type
  })
  public traceId!: string;

  @ModelProperty({
    key: 'trace-attributes',
    type: ARRAY_PROPERTY.type,
    required: false
  })
  public traceSpecifications: AttributeSpecificationModel[] = [];

  @ModelProperty({
    key: 'spans-attributes',
    type: ARRAY_PROPERTY.type,
    required: false
  })
  public spansSpecifications: AttributeSpecificationModel[] = [];

  public getData(): Observable<Trace> {
    return this.queryIsolated<TraceGraphQlQueryHandlerService>({
      requestType: TRACE_GQL_REQUEST,
      traceType: this.traceType,
      traceId: this.traceId,
      spanLimit: 100,
      timeRange: this.getTimeRangeOrThrow(),
      traceProperties: this.traceSpecifications,
      spanProperties: this.spansSpecifications
    }).pipe(mergeMap(response => (response ? of(response) : EMPTY)));
  }
}
