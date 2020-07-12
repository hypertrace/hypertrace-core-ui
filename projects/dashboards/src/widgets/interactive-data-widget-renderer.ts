import { ChangeDetectorRef, Inject } from '@angular/core';
import { RENDERER_API, RendererApi } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { WidgetRenderer } from './widget-renderer';

export abstract class InteractiveDataWidgetRenderer<TModel extends object, TData = unknown> extends WidgetRenderer<
  TModel,
  TData
> {
  public constructor(@Inject(RENDERER_API) api: RendererApi<TModel>, changeDetector: ChangeDetectorRef) {
    super(api, changeDetector);
  }

  protected abstract buildDataObservable(): Observable<TData>;

  protected updateDataObservable(): void {
    this.data$ = this.buildDataObservable();
  }
}
