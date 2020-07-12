import { NgModule } from '@angular/core';
import { BLUE_COLOR_PALETTE, GLOBAL_HEADER_HEIGHT, RED_COLOR_PALETTE } from '@hypertrace/common';
import { GRAPHQL_URI } from '@hypertrace/graphql-client';
import { environment } from '../environments/environment';
import { FeatureResolverModule } from './shared/feature-resolver/feature-resolver.module';

@NgModule({
  imports: [FeatureResolverModule],
  providers: [
    {
      provide: GRAPHQL_URI,
      useValue: environment.graphqlUri
    },
    {
      provide: GLOBAL_HEADER_HEIGHT,
      useValue: '56px'
    },
    {
      provide: BLUE_COLOR_PALETTE,
      useValue: ['#001429', '#003149', '#005163', '#007374', '#30947B', '#70B47C', '#B4D17E', '#FFEA8A']
    },
    {
      provide: RED_COLOR_PALETTE,
      useValue: ['#EEC200', '#F7902D', '#E8654B', '#C44660', '#923768', '#5B2F60', '#27244A', '#001429']
    }
  ]
})
export class ConfigModule {}
