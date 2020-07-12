import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SheetOverlayComponent } from './overlay/sheet-overlay.component';
import { SheetOverlayService } from './overlay/sheet-overlay.service';
import { SheetComponent } from './sheet.component';

@NgModule({
  imports: [CommonModule, ButtonModule, TooltipModule],
  declarations: [SheetComponent, SheetOverlayComponent],
  providers: [SheetOverlayService],
  exports: [SheetComponent]
})
export class SheetModule {}
