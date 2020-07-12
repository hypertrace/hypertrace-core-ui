import { LoggerService } from '@hypertrace/common';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { IconTableCellRendererComponent } from './data-cell/icon/icon-table-cell-renderer.component';
import { NumericTableCellRendererComponent } from './data-cell/numeric/numeric-table-cell-renderer.component';
import { TextTableCellRendererComponent } from './data-cell/text/text-table-cell-renderer.component';
import { TimestampTableCellRendererComponent } from './data-cell/timestamp/timestamp-table-cell-renderer.component';
import { TableCellRendererService } from './table-cell-renderer.service';

describe('Table cell renderer service', () => {
  const createService = createServiceFactory({
    service: TableCellRendererService,
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

  test('should set default to first registered renderer automatically', () => {
    const spectator = createService();

    spectator.service.registerAll([
      TextTableCellRendererComponent,
      IconTableCellRendererComponent,
      NumericTableCellRendererComponent
    ]);
    const found = spectator.service.lookup(undefined); // Nothing specified so should get default
    expect(found).toEqual(TextTableCellRendererComponent);
  });

  test('should set default to specified renderer', () => {
    const spectator = createService();

    spectator.service.registerAll(
      [TextTableCellRendererComponent, IconTableCellRendererComponent, NumericTableCellRendererComponent],
      IconTableCellRendererComponent
    );
    const found = spectator.service.lookup(undefined); // Nothing specified so should get default
    expect(found).toEqual(IconTableCellRendererComponent);
  });

  test('should get default when requested renderer not found', () => {
    const spectator = createService();

    spectator.service.registerAll(
      [TextTableCellRendererComponent, IconTableCellRendererComponent, NumericTableCellRendererComponent],
      IconTableCellRendererComponent
    );
    const found = spectator.service.lookup(TimestampTableCellRendererComponent.type);
    expect(found).toEqual(IconTableCellRendererComponent);
  });
});
