import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputModule } from '../../../input/input.module';
import { SelectModule } from '../../../select/select.module';
import { KeyValueFilterContentRendererComponent } from './key-value-filter-content-renderer.component';

@NgModule({
  imports: [SelectModule, InputModule, CommonModule],
  declarations: [KeyValueFilterContentRendererComponent]
})
export class KeyValueFilterModule {}
