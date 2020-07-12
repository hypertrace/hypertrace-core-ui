import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { SelectModule } from '../select/select.module';
import { KeyValueFilterModule } from './filters/key-value/key-value-filter.module';
import { NumericFilterModule } from './filters/numeric/numeric-filter.module';
import { FilterPanelComponent } from './rendering/filter-panel.component';
import { FilterRendererComponent } from './rendering/filter-renderer.component';

@NgModule({
  declarations: [FilterPanelComponent, FilterRendererComponent],
  imports: [CommonModule, SelectModule, ButtonModule, KeyValueFilterModule, NumericFilterModule],
  exports: [FilterPanelComponent]
})
export class FilterModule {}
