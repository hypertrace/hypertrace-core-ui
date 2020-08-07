import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalOverlayModule } from './modal/modal-overlay.module';
import { OverlayService } from './overlay.service';
import { SheetOverlayModule } from './sheet/sheet-overlay.module';
@NgModule({
  imports: [CommonModule, SheetOverlayModule, ModalOverlayModule],
  providers: [OverlayService]
})
export class OverlayModule {}
