import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { ComboBoxModule } from '../combo-box/combo-box.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { FilterTabComponent } from './filter-tab.component';
import { FilterTabsComponent } from './filter-tabs.component';

@NgModule({
  imports: [CommonModule, IconModule, ButtonModule, ComboBoxModule, LabelModule],
  exports: [FilterTabsComponent],
  declarations: [FilterTabsComponent, FilterTabComponent]
})
export class FilterTabsModule {}
