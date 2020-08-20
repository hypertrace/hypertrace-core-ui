import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { FilterBuilderConstructor, FILTER_BUILDERS } from '../filter-bar/filter/builder/filter-builder';
import { FilterBuilderService } from '../filter-bar/filter/builder/filter-builder.service';
import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';
import { FilterButtonComponent } from './filter-button.component';

@NgModule({
  imports: [CommonModule, IconModule, PopoverModule],
  exports: [FilterButtonComponent],
  declarations: [FilterButtonComponent]
})
export class FilterButtonModule {
  public constructor(
    @Inject(FILTER_BUILDERS) filterBuilders: FilterBuilderConstructor<unknown>[],
    filterBuilderService: FilterBuilderService
  ) {
    filterBuilderService.registerAll(filterBuilders);
  }
}
