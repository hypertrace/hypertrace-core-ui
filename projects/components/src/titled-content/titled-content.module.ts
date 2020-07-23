import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LinkModule } from '../link/link.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { TitledHeaderControlDirective } from './header-controls/titled-header-control.directive';
import { TitledContentComponent } from './titled-content.component';

@NgModule({
  declarations: [TitledContentComponent, TitledHeaderControlDirective],
  exports: [TitledContentComponent, TitledHeaderControlDirective],
  imports: [LabelModule, CommonModule, LinkModule, ButtonModule, IconModule, TooltipModule]
})
export class TitledContentModule {}
