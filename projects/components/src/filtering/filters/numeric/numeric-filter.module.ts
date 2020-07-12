import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputModule } from '../../../input/input.module';
import { SelectModule } from '../../../select/select.module';
import { NumericFilterContentRendererComponent } from './numeric-filter-content-renderer.component';

@NgModule({
  imports: [CommonModule, SelectModule, InputModule],
  declarations: [NumericFilterContentRendererComponent]
})
export class NumericFilterModule {}
