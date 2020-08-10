import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PopoverModule } from '../popover/popover.module';
import { SelectGroupComponent } from './select-group.component';
import { SelectOptionComponent } from './select-option.component';
import { SelectComponent } from './select.component';
import { InputModule } from '../input/input.module';
import { DividerModule } from '../divider/divider.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IconModule,
    LabelModule,
    LetAsyncModule,
    PopoverModule,
    InputModule,
    DividerModule
  ],
  declarations: [SelectComponent, SelectOptionComponent, SelectGroupComponent],
  exports: [SelectComponent, SelectOptionComponent, SelectGroupComponent]
})
export class SelectModule {}
