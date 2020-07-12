import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import { FilterBarModule } from '../../shared/components/filter-bar/filter-bar.module';
import { TracingDashboardModule } from '../../shared/dashboard/tracing-dashboard.module';
import { SpanListPageComponent } from './span-list.page.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: SpanListPageComponent
  }
];

@NgModule({
  imports: [TracingDashboardModule, CommonModule, FilterBarModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [SpanListPageComponent]
})
export class SpanListPageModule {}
