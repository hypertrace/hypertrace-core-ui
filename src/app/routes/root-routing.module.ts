import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { ExternalUrlNavigator, TraceRoute } from '@hypertrace/common';
import { NotFoundComponent, NotFoundModule } from '@hypertrace/components';
import { ApplicationFrameComponent } from '../application-frame/application-frame.component';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ApplicationFrameComponent,
        children: [
          {
            path: '',
            redirectTo: 'spans',
            pathMatch: 'full'
          },
          {
            path: 'spans',
            loadChildren: () => import('@hypertrace/distributed-tracing').then(module => module.SpanListPageModule)
          },
          {
            path: 'trace',
            loadChildren: () => import('@hypertrace/distributed-tracing').then(module => module.TraceDetailPageModule)
          },
          {
            path: 'error',
            component: NotFoundComponent
          }
        ]
      },
      {
        path: 'external',
        canActivate: [ExternalUrlNavigator],
        component: NotFoundComponent // Not actually used, but required by router
      },
      {
        path: '**',
        redirectTo: 'error',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    NotFoundModule,
    RouterModule.forRoot(ROUTE_CONFIG, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class RootRoutingModule {}
