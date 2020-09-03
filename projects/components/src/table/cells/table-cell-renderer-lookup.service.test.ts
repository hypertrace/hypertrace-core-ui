import { LoggerService } from '@hypertrace/common';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { IconTableCellRendererComponent } from './data-renderers/icon/icon-table-cell-renderer.component';
import { NumericTableCellRendererComponent } from './data-renderers/numeric/numeric-table-cell-renderer.component';
import { TextTableCellRendererComponent } from './data-renderers/text/text-table-cell-renderer.component';
import { TableCellRendererLookupService } from './table-cell-renderer-lookup.service';

describe('Table cell renderer service', () => {
  const createService = createServiceFactory({
    service: TableCellRendererLookupService,
    providers: [mockProvider(LoggerService)]
  });

  test('should be able to lookup registered cell renderers', () => {
    const spectator = createService();

    spectator.service.registerAll([
      TextTableCellRendererComponent,
      IconTableCellRendererComponent,
      NumericTableCellRendererComponent
    ]);
    const found = spectator.service.lookup(IconTableCellRendererComponent.type);
    expect(found).toEqual(IconTableCellRendererComponent);
  });
});
