import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { DetailSheetInteractionContainerComponent } from './container/detail-sheet-interaction-container.component';
import { DetailSheetInteractionHandlerModel } from './detail-sheet-interaction-handler.model';
import { DetailSheetInteractionHandlerService } from './detail-sheet-interaction-handler.service';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [DetailSheetInteractionHandlerModel]
    })
  ],
  declarations: [DetailSheetInteractionContainerComponent],
  providers: [DetailSheetInteractionHandlerService]
})
export class DetailSheetInteractionModule {}
