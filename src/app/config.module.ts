import { NgModule } from '@angular/core';
import { DEFAULT_COLOR_PALETTE, GLOBAL_HEADER_HEIGHT } from '@hypertrace/common';
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
      provide: DEFAULT_COLOR_PALETTE,
      useValue: {
        key: 'default',
        colors: ['#001429', '#003149', '#005163', '#007374', '#30947B', '#70B47C', '#B4D17E', '#FFEA8A']
      }
    }
  ]
})
export class ConfigModule {}
