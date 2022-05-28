import { OverlayModule } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { ContextMenuEventService } from '../../services/context-menu-event/context-menu-event.service';
import { ContextMenuService } from '../../services/context-menu/context-menu.service';
import { ContextMenuDirective } from './context-menu.directive';

@Component({
  template: '<div contextMenu></div>',
})
class TestHostComponent {}

describe('Directive: ContextMenuDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: ContextMenuDirective<unknown>;
  let contextMenuEventService: ContextMenuEventService<unknown>;
  let onShow: jasmine.Spy<jasmine.Func>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [ContextMenuEventService],
      declarations: [ContextMenuDirective, TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    const directiveEl = fixture.debugElement.query(
      By.directive(ContextMenuDirective)
    );
    directive = directiveEl.injector.get(ContextMenuDirective);
    contextMenuEventService = TestBed.inject(ContextMenuEventService);
    onShow = jasmine.createSpy('onShow');
    contextMenuEventService.onShow.subscribe(onShow);
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('#new', () => {
    it('should create an instance', () => {
      expect(directive).toBeTruthy();
    });
  });

  describe('#onContextMenu', () => {
    it('should show attached context menu', () => {
      directive.contextMenu =
        TestBed.createComponent(ContextMenuComponent).componentInstance;
      directive.contextMenuValue = { id: 'a' };
      const event = new MouseEvent('contextmenu', { clientX: 42, clientY: 34 });
      directive.onContextMenu(event);
      expect(onShow).toHaveBeenCalledWith({
        anchoredTo: 'position',
        contextMenu: directive.contextMenu,
        x: 42,
        y: 34,
        value: directive.contextMenuValue,
      });
    });

    it('should not show attached context menu if it is disabled', () => {
      directive.contextMenu =
        TestBed.createComponent(ContextMenuComponent).componentInstance;
      directive.contextMenu.disabled = true;
      directive.contextMenuValue = { id: 'a' };
      const event = new MouseEvent('contextmenu');
      directive.onContextMenu(event);
      expect(onShow).not.toHaveBeenCalled();
    });

    it('should show nothing if not context menu is attached', () => {
      directive.contextMenuValue = { id: 'a' };
      const event = new MouseEvent('contextmenu');
      directive.onContextMenu(event);
      expect(onShow).not.toHaveBeenCalled();
    });
  });
});
