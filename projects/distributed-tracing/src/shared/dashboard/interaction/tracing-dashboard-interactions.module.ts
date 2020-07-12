import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { SpanTraceNavigationHandlerModel } from './span-trace/model/span-trace-navigation-handler.model';
@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [SpanTraceNavigationHandlerModel]
    })
  ]
})
export class TracingDashboardInteractionsModule {}
