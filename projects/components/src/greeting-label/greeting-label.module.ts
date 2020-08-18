import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreetingLabelComponent } from './greeting-label.component';

@NgModule({
  declarations: [GreetingLabelComponent],
  exports: [GreetingLabelComponent],
  imports: [CommonModule]
})
export class GreetingLabelModule {}
