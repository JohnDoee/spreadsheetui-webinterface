import {
  CloseScrollStrategy,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayModule,
  OverlayRef,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ComponentRef, ElementRef, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ContextMenuItemDirective } from '../../directives/context-menu-item/context-menu-item.directive';
import { ContextMenuEventService } from '../../services/context-menu-event/context-menu-event.service';
import { ContextMenuStackService } from '../../services/context-menu-stack/context-menu-stack.service';
import { ContextMenuContentComponent } from '../context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from './context-menu.component';
import { IContextMenuContext } from './context-menu.component.interface';

describe('Component: ContextMenuComponent', () => {
  let component: ContextMenuComponent<unknown>;
  let fixture: ComponentFixture<ContextMenuComponent<unknown>>;
  let contextMenuEventService: ContextMenuEventService<unknown>;
  let scrollStrategyClose: jasmine.Spy<jasmine.Func>;
  let overlayPosition: jasmine.Spy<jasmine.Func>;
  let overlayFlexibleConnectedTo: jasmine.Spy<jasmine.Func>;
  let overlayWithPositions: jasmine.Spy<jasmine.Func>;
  let overlayCreate: jasmine.Spy<jasmine.Func>;
  let overlayRefAttach: jasmine.Spy<jasmine.Func>;
  let overlayRefDetach: jasmine.Spy<jasmine.Func>;
  let overlayRefDispose: jasmine.Spy<jasmine.Func>;
  let positionStrategy: FlexibleConnectedPositionStrategy;
  let overlayRef: OverlayRef;
  let contextMenuContentRef: ComponentRef<ContextMenuContentComponent<unknown>>;
  let closeScrollStrategy: CloseScrollStrategy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [ContextMenuEventService],
      declarations: [ContextMenuComponent],
    }).compileComponents();
    contextMenuContentRef = {
      instance: {
        execute: new Subject(),
        closeAllMenus: new Subject(),
        closeLeafMenu: new Subject(),
        openSubMenu: new Subject(),
      },
      onDestroy: jasmine.createSpy('onDestroy'),
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    } as unknown as ComponentRef<ContextMenuContentComponent<unknown>>;
    overlayRefAttach = jasmine
      .createSpy('attach')
      .and.returnValue(contextMenuContentRef);
    overlayRefDetach = jasmine.createSpy('detach');
    overlayRefDispose = jasmine.createSpy('dispose');
    positionStrategy = {
      id: 'position-strategy',
    } as unknown as FlexibleConnectedPositionStrategy;
    overlayRef = {
      id: 'overlay-ref',
      attach: overlayRefAttach,
      detach: overlayRefDetach,
      dispose: overlayRefDispose,
    } as unknown as OverlayRef;
    overlayWithPositions = jasmine
      .createSpy('withPositions')
      .and.returnValue(positionStrategy);
    overlayCreate = jasmine.createSpy('create').and.returnValue(overlayRef);
    overlayFlexibleConnectedTo = jasmine
      .createSpy('flexibleConnectedTo')
      .and.returnValue({ withPositions: overlayWithPositions });
    overlayPosition = jasmine
      .createSpy('position')
      .and.returnValue({ flexibleConnectedTo: overlayFlexibleConnectedTo });
    closeScrollStrategy = {
      id: 'closeScrollStrategy',
    } as unknown as CloseScrollStrategy;
    scrollStrategyClose = jasmine
      .createSpy('strategyClose')
      .and.returnValue(closeScrollStrategy);
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [
        ContextMenuEventService,
        {
          provide: Overlay,
          useValue: {
            position: overlayPosition,
            create: overlayCreate,
          },
        },
        {
          provide: ScrollStrategyOptions,
          useValue: {
            close: scrollStrategyClose,
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ContextMenuComponent);
    contextMenuEventService = TestBed.inject(ContextMenuEventService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    describe('#onMenuEvent', () => {
      let open: jasmine.Spy<jasmine.Func>;
      let close: jasmine.Spy<jasmine.Func>;
      let a: ContextMenuItemDirective<unknown>;
      let b: ContextMenuItemDirective<unknown>;
      let c: ContextMenuItemDirective<unknown>;
      let d: ContextMenuItemDirective<unknown>;
      let value: unknown;

      beforeEach(() => {
        a = {
          visible: false,
        } as ContextMenuItemDirective<unknown>;
        b = {
          visible: true,
        } as ContextMenuItemDirective<unknown>;
        c = {
          visible: (item: unknown) => false,
        } as ContextMenuItemDirective<unknown>;
        d = {
          visible: (item: unknown) => true,
        } as ContextMenuItemDirective<unknown>;
        spyOn(component, 'openContextMenu');
        open = jasmine.createSpy('open');
        component.open.subscribe(open);
        close = jasmine.createSpy('close');
        component.close.subscribe(close);

        value = { id: 'a' };
        const menuItems = new QueryList<ContextMenuItemDirective<unknown>>();
        menuItems.reset([a, b, c, d]);
        component.menuItems = menuItems;
        component.menuClass = 'custom-class';
        component.dir = 'rtl';
        component.ngOnInit();
      });

      describe('with all required properties', () => {
        beforeEach(() => {
          TestBed.inject(ContextMenuEventService).show({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu: component,
            value,
          });
        });

        it('should set item', () => {
          expect(component.value).toEqual(value);
        });

        it('should open context menu', () => {
          expect(component.openContextMenu).toHaveBeenCalledWith({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu: component,
            value,
            dir: 'rtl',
            menuItemDirectives: [b, d],
            menuClass: 'custom-class',
          });
        });

        it('should notify open menu', () => {
          expect(open).toHaveBeenCalledWith({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu: component,
            value,
          });
        });
      });

      describe('with contextMenu not defined', () => {
        beforeEach(() => {
          TestBed.inject(ContextMenuEventService).show({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu: undefined as unknown as ContextMenuComponent<unknown>,
            value,
          });
        });

        it('should set item', () => {
          expect(component.value).toEqual(value);
        });

        it('should set visible items', () => {
          expect(component.visibleMenuItems).toEqual([b, d]);
        });

        it('should open context menu', () => {
          expect(component.openContextMenu).toHaveBeenCalledWith({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            value,
            contextMenu: undefined as unknown as ContextMenuComponent<unknown>,
            menuItemDirectives: [b, d],
            menuClass: 'custom-class',
            dir: 'rtl',
          });
        });

        it('should notify open menu', () => {
          expect(open).toHaveBeenCalledWith({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            value,
            contextMenu: undefined as unknown as ContextMenuComponent<unknown>,
          });
        });
      });

      describe('when disabled', () => {
        beforeEach(() => {
          component.disabled = true;
          TestBed.inject(ContextMenuEventService).show({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu: undefined as unknown as ContextMenuComponent<unknown>,
            value,
          });
        });

        it('should not set item', () => {
          expect(component.value).toBeUndefined();
        });

        it('should set visible items', () => {
          expect(component.visibleMenuItems).toEqual([]);
        });

        it('should open context menu', () => {
          expect(component.openContextMenu).not.toHaveBeenCalled();
        });

        it('should notify open menu', () => {
          expect(open).not.toHaveBeenCalled();
        });
      });

      describe('when contextMenu being another component instance', () => {
        beforeEach(() => {
          TestBed.inject(ContextMenuEventService).show({
            anchoredTo: 'position',
            x: 0,
            y: 0,
            contextMenu:
              TestBed.createComponent(ContextMenuComponent).componentInstance,
            value,
          });
        });

        it('should not set item', () => {
          expect(component.value).toBeUndefined();
        });

        it('should set visible items', () => {
          expect(component.visibleMenuItems).toEqual([]);
        });

        it('should open context menu', () => {
          expect(component.openContextMenu).not.toHaveBeenCalled();
        });

        it('should notify open menu', () => {
          expect(open).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('#openContextMenu', () => {
    let contextMenuStackService: ContextMenuStackService<unknown>;

    beforeEach(() => {
      contextMenuStackService = TestBed.inject(ContextMenuStackService);
      spyOn(contextMenuStackService, 'push');
      spyOn(contextMenuStackService, 'closeAll');
      spyOn(contextMenuStackService, 'destroySubMenus');
      spyOn(contextMenuStackService, 'closeLeafMenu');
    });

    describe('when open anchoredTo position', () => {
      it('should close all other menus', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          value: {},
          dir: 'rtl',
          menuClass: '',
          menuItemDirectives: [],
        };
        const subscriber = jasmine.createSpy('subscriber');
        component.close.subscribe(subscriber);
        component.openContextMenu(context);
        expect(contextMenuStackService.closeAll).toHaveBeenCalled();
      });

      it('should get a position strategy with position and create an overlay from it', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          value: {},
          dir: undefined,
          menuClass: '',
          menuItemDirectives: [],
        };
        component.openContextMenu(context);

        expect(overlayPosition).toHaveBeenCalled();
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith({
          x: 0,
          y: 0,
        });
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuContentComponent: contextMenuContentRef.instance,
        });
      });

      it('should get a position strategy with position LTR and create an overlay from it', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          value: {},
          dir: 'ltr',
          menuClass: '',
          menuItemDirectives: [],
        };
        component.openContextMenu(context);

        expect(overlayPosition).toHaveBeenCalled();
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith({
          x: 0,
          y: 0,
        });
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuContentComponent: contextMenuContentRef.instance,
        });
      });

      /*       it('should get a position strategy with position parent LTR and create an overlay from it', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          parentContextMenu: {
            dir: 'ltr',
          } as unknown as ContextMenuContentComponent<unknown>,
          item: {},
          dir: 'ltr',
          menuClass: '',
          menuDirectives: [],
        };
        component.openContextMenu(context);

        expect(overlayPosition).toHaveBeenCalled();
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith({
          x: 0,
          y: 0,
        });
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuComponent: contextMenuContentRef.instance,
        });
      }); */

      it('should get a position strategy with position RTL and create an overlay from it', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          value: {},
          dir: 'rtl',
          menuClass: '',
          menuItemDirectives: [],
        };
        component.openContextMenu(context);

        expect(overlayPosition).toHaveBeenCalled();
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith({
          x: 0,
          y: 0,
        });
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center',
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuContentComponent: contextMenuContentRef.instance,
        });
      });
    });

    describe('when open anchoredTo element', () => {
      it('should close all sub menus', () => {
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'element',
          anchorElement: document.createElement('div'),
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          parentContextMenu: TestBed.createComponent(
            ContextMenuContentComponent
          ).componentInstance,
          value: {},
          dir: 'rtl',
          menuClass: '',
          menuItemDirectives: [],
        };
        const subscriber = jasmine.createSpy('subscriber');
        component.close.subscribe(subscriber);
        component.openContextMenu(context);
        expect(contextMenuStackService.destroySubMenus).toHaveBeenCalled();
      });

      it('should get a position strategy with anchor Element and create an overlay from it', () => {
        const anchorElement = document.createElement('div');
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'element',
          anchorElement,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          parentContextMenu: TestBed.createComponent(
            ContextMenuContentComponent
          ).componentInstance,
          value: {},
          dir: undefined,
          menuClass: '',
          menuItemDirectives: [],
        };
        context.parentContextMenu.dir = 'ltr';
        component.openContextMenu(context);

        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith(
          jasmine.any(ElementRef)
        );
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith(
          jasmine.objectContaining({
            nativeElement: anchorElement,
          })
        );
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuContentComponent: contextMenuContentRef.instance,
        });
      });

      it('should get a position strategy with anchor Element RTL and create an overlay from it', () => {
        const anchorElement = document.createElement('div');
        const context: IContextMenuContext<unknown> = {
          anchoredTo: 'element',
          anchorElement,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          parentContextMenu: TestBed.createComponent(
            ContextMenuContentComponent
          ).componentInstance,
          value: {},
          dir: undefined,
          menuClass: '',
          menuItemDirectives: [],
        };
        context.parentContextMenu.dir = 'rtl';
        component.openContextMenu(context);

        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith(
          jasmine.any(ElementRef)
        );
        expect(overlayFlexibleConnectedTo).toHaveBeenCalledWith(
          jasmine.objectContaining({
            nativeElement: anchorElement,
          })
        );
        expect(overlayWithPositions).toHaveBeenCalledWith([
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ]);
        expect(overlayCreate).toHaveBeenCalledWith({
          positionStrategy,
          panelClass: 'ngx-contextmenu',
          scrollStrategy: closeScrollStrategy,
        });

        expect(contextMenuStackService.push).toHaveBeenCalledWith({
          overlayRef,
          contextMenuContentComponent: contextMenuContentRef.instance,
        });
      });
    });

    describe('with created contextMenuContentComponent', () => {
      let a: ContextMenuItemDirective<unknown>;
      let b: ContextMenuItemDirective<unknown>;
      let c: ContextMenuItemDirective<unknown>;
      let d: ContextMenuItemDirective<unknown>;
      let context: IContextMenuContext<unknown>;
      let value: unknown;

      beforeEach(() => {
        a = {
          visible: false,
        } as ContextMenuItemDirective<unknown>;
        b = {
          visible: true,
        } as ContextMenuItemDirective<unknown>;
        c = {
          visible: (item: unknown) => false,
        } as ContextMenuItemDirective<unknown>;
        d = {
          visible: (item: unknown) => true,
        } as ContextMenuItemDirective<unknown>;

        value = { id: 'a' };
        const menuItems = new QueryList<ContextMenuItemDirective<unknown>>();
        menuItems.reset([a, b, c, d]);
        component.menuItems = menuItems;
        component.menuClass = 'custom-class';
        component.dir = 'rtl';
        context = {
          anchoredTo: 'position',
          x: 0,
          y: 0,
          contextMenu:
            TestBed.createComponent(ContextMenuComponent).componentInstance,
          value,
          dir: 'rtl',
          menuClass: 'menu-class',
          menuItemDirectives: [a, b, c, d],
        };
      });

      it('should set contextMenuContentComponent properties', () => {
        component.openContextMenu(context);
        expect(contextMenuContentRef.instance.value).toEqual({ id: 'a' });
        expect(contextMenuContentRef.instance.menuDirectives).toEqual([
          a,
          b,
          c,
          d,
        ]);
        expect(contextMenuContentRef.instance.overlayRef).toEqual(overlayRef);
        expect(contextMenuContentRef.instance.isLeaf).toEqual(true);
        expect(contextMenuContentRef.instance.menuClass).toEqual('menu-class');
        expect(contextMenuContentRef.instance.dir).toEqual('rtl');
      });

      it('should close all context menu when instance execute', () => {
        component.openContextMenu(context);
        const event = {
          event: new MouseEvent('click'),
          item: { id: 'a' },
          menuDirective: a,
        };
        contextMenuContentRef.instance.execute.next(event);
        expect(contextMenuStackService.closeAll).toHaveBeenCalled();
      });

      it('should close all context menu when instance closeAllMenus', () => {
        component.openContextMenu(context);
        const event = {
          event: new MouseEvent('click'),
          item: { id: 'a' },
          menuDirective: a,
        };
        contextMenuContentRef.instance.closeAllMenus.next(event);
        expect(contextMenuStackService.closeAll).toHaveBeenCalled();
      });

      it('should close leaf menus excluding root when instance closeLeafMenu', () => {
        component.openContextMenu(context);
        const event = {
          event: new MouseEvent('click'),
          excludeRootMenu: true,
        };
        (contextMenuStackService.closeLeafMenu as jasmine.Spy).and.returnValue(
          true
        );
        contextMenuContentRef.instance.closeLeafMenu.next(event);
        expect(contextMenuStackService.closeLeafMenu).toHaveBeenCalledWith(
          true
        );
      });

      it('should close leaf menus when instance closeLeafMenu', () => {
        component.openContextMenu(context);
        const event = {
          event: new MouseEvent('click'),
          excludeRootMenu: false,
        };
        const close = jasmine.createSpy('subscriber');
        component.close.subscribe(close);
        (contextMenuStackService.closeLeafMenu as jasmine.Spy).and.returnValue(
          false
        );
        contextMenuContentRef.instance.closeLeafMenu.next(event);
        expect(close).not.toHaveBeenCalled();
        expect(contextMenuStackService.closeLeafMenu).toHaveBeenCalledWith(
          false
        );
      });

      it('should open sub menu menus when instance emits openSubMenu, set its isLeaf property to false and show it', () => {
        component.openContextMenu(context);
        spyOn(contextMenuEventService, 'show');
        contextMenuContentRef.instance.openSubMenu.next(context);
        expect(contextMenuStackService.destroySubMenus).toHaveBeenCalledWith(
          contextMenuContentRef.instance
        );
        expect(contextMenuContentRef.instance.isLeaf).toEqual(false);
        expect(contextMenuEventService.show).toHaveBeenCalledWith(context);
      });

      it('should not open sub menu menus when instance emits openSubMenu without menu and set its isLeaf property to true', () => {
        component.openContextMenu(context);
        spyOn(contextMenuEventService, 'show');
        delete (context as any).contextMenu;
        contextMenuContentRef.instance.openSubMenu.next(context);
        expect(contextMenuStackService.destroySubMenus).toHaveBeenCalledWith(
          contextMenuContentRef.instance
        );
        expect(contextMenuContentRef.instance.isLeaf).toEqual(true);
        expect(contextMenuEventService.show).not.toHaveBeenCalled();
      });

      it('should inactive all menu items when instance is destroyed', () => {
        component.openContextMenu(context);
        (contextMenuContentRef.onDestroy as jasmine.Spy).calls.argsFor(0)[0]();
        expect(a.isActive).toEqual(false);
        expect(b.isActive).toEqual(false);
        expect(c.isActive).toEqual(false);
        expect(d.isActive).toEqual(false);
      });

      it('should close all menu items when instance is destroyed', () => {
        component.openContextMenu(context);
        const close = jasmine.createSpy('subscriber');
        component.close.subscribe(close);
        (contextMenuContentRef.onDestroy as jasmine.Spy).calls.argsFor(0)[0]();
        expect(close).toHaveBeenCalled();
      });

      it('should detect changes on created instance', () => {
        component.openContextMenu(context);
        expect(
          contextMenuContentRef.changeDetectorRef.detectChanges
        ).toHaveBeenCalled();
      });
    });
  });
});
