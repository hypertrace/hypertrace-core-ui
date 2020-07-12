import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { ButtonModule, ComboBoxModule, IconModule } from '@hypertrace/components';
import { FilterBarComponent } from './filter-bar.component';
import { FILTER_BUILDERS, FilterBuilderConstructor } from './filter/builder/filter-builder';
import { FilterBuilderService } from './filter/builder/filter-builder.service';
import { NumberFilterBuilder } from './filter/builder/number-filter-builder';
import { StringArrayFilterBuilder } from './filter/builder/string-array-filter-builder';
import { StringFilterBuilder } from './filter/builder/string-filter-builder';
import { FilterComponent } from './filter/filter.component';

@NgModule({
  imports: [CommonModule, IconModule, ButtonModule, ComboBoxModule],
  exports: [FilterBarComponent],
  declarations: [FilterBarComponent, FilterComponent],
  providers: [
    {
      provide: FILTER_BUILDERS,
      useValue: [NumberFilterBuilder, StringFilterBuilder, StringArrayFilterBuilder]
    }
  ]
})
export class FilterBarModule {
  public constructor(
    @Inject(FILTER_BUILDERS) filterBuilders: FilterBuilderConstructor<unknown>[],
    filterBuilderService: FilterBuilderService
  ) {
    filterBuilderService.registerAll(filterBuilders);
  }
}
