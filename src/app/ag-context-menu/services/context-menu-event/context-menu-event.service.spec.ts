import { OverlayModule } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ContextMenuContentComponent } from '../../components/context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { ContextMenuEventService } from '../context-menu-event/context-menu-event.service';

describe('Service: ContextMenuEventService', () => {
  let service: ContextMenuEventService<unknown>;
  let onShow: jasmine.Spy<jasmine.Func>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContextMenuComponent, ContextMenuContentComponent],
      imports: [OverlayModule],
    });
    service = TestBed.inject(ContextMenuEventService);
    onShow = jasmine.createSpy('onShow');
    service.onShow.subscribe(onShow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#show', () => {
    it('should emit a show event with position', () => {
      const component =
        TestBed.createComponent(ContextMenuComponent).componentInstance;
      service.show({
        anchoredTo: 'position',
        contextMenu: component,
        x: 42,
        y: 34,
        value: { any: 'thing' },
      });
      expect(onShow).toHaveBeenCalledWith({
        anchoredTo: 'position',
        contextMenu: component,
        x: 42,
        y: 34,
        value: { any: 'thing' },
      });
    });

    it('should emit a show event with element', () => {
      const component =
        TestBed.createComponent(ContextMenuComponent).componentInstance;
      const parent = TestBed.createComponent(
        ContextMenuContentComponent
      ).componentInstance;
      const anchorElement = document.createElement('div');
      service.show({
        anchoredTo: 'element',
        contextMenu: component,
        anchorElement,
        parentContextMenu: parent,
        value: { any: 'thing' },
      });
      expect(onShow).toHaveBeenCalledWith({
        anchoredTo: 'element',
        contextMenu: component,
        anchorElement,
        parentContextMenu: parent,
        value: { any: 'thing' },
      });
    });
  });
});
