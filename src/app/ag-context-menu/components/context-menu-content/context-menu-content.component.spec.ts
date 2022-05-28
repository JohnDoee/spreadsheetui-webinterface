import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  ElementRef,
  EventEmitter,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ContextMenuItemDirective } from '../../directives/context-menu-item/context-menu-item.directive';
import { ContextMenuService } from '../../services/context-menu/context-menu.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import {
  ContextMenuContentComponent,
  TESTING_WRAPPER,
} from './context-menu-content.component';

describe('Component: ContextMenuContentComponent', () => {
  let component: ContextMenuContentComponent<unknown>;
  let fixture: ComponentFixture<ContextMenuContentComponent<unknown>>;
  let keyManager: ActiveDescendantKeyManager<ContextMenuItemDirective<unknown>>;

  const configureTestingModule = (autoFocus?: boolean) => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      providers: [
        ContextMenuService,
        ...(typeof autoFocus === 'boolean' ? [] : []),
      ],
      declarations: [ContextMenuContentComponent],
    });
    fixture = TestBed.createComponent(ContextMenuContentComponent);
    component = fixture.componentInstance;
  };

  const mockActiveDescendantKeyManager = () => {
    keyManager = {
      onKeydown: jasmine.createSpy('onKeydown'),
    } as unknown as ActiveDescendantKeyManager<
      ContextMenuItemDirective<unknown>
    >;
    spyOn(TESTING_WRAPPER, 'ActiveDescendantKeyManager').and.returnValue({
      withWrap: jasmine.createSpy('withWrap').and.returnValue(keyManager),
    } as unknown as ActiveDescendantKeyManager<ContextMenuItemDirective<unknown>>);
  };

  it('should create', () => {
    configureTestingModule();
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    it('should set item to each menu item property', () => {
      configureTestingModule();
      component.menuDirectives = [
        { value: undefined, execute: new Subject() },
        { value: undefined, execute: new Subject() },
        { value: undefined, execute: new Subject() },
      ] as ContextMenuItemDirective<unknown>[];

      component.value = { id: 'a' };

      component.ngOnInit();

      expect(component.menuDirectives).toEqual([
        jasmine.objectContaining({ value: component.value }),
        jasmine.objectContaining({ value: component.value }),
        jasmine.objectContaining({ value: component.value }),
      ]);
    });

    it('should bind menuItem execution to execute emitter', () => {
      configureTestingModule();
      const execute = jasmine.createSpy('execute');
      component.execute.subscribe(execute);

      const emitterA = new EventEmitter();
      const emitterB = new EventEmitter();
      const emitterC = new EventEmitter();

      const menuA: ContextMenuItemDirective<unknown> = {
        value: undefined,
        execute: emitterA,
      } as ContextMenuItemDirective<unknown>;
      const menuB: ContextMenuItemDirective<unknown> = {
        value: undefined,
        execute: emitterB,
      } as ContextMenuItemDirective<unknown>;
      const menuC: ContextMenuItemDirective<unknown> = {
        value: undefined,
        execute: emitterC,
      } as ContextMenuItemDirective<unknown>;
      component.menuDirectives = [menuA, menuB, menuC];

      component.ngOnInit();

      const eventA = {
        event: new MouseEvent('click'),
        item: { id: 'a' },
      };
      const eventB = {
        event: new MouseEvent('click'),
        item: { id: 'a' },
      };
      const eventC = {
        event: new MouseEvent('click'),
        item: { id: 'a' },
      };
      emitterA.emit(eventA);
      expect(execute).toHaveBeenCalledWith({ ...eventA, menuDirective: menuA });
      emitterB.emit(eventB);
      expect(execute).toHaveBeenCalledWith({ ...eventB, menuDirective: menuB });
      emitterC.emit(eventC);
      expect(execute).toHaveBeenCalledWith({ ...eventC, menuDirective: menuC });
      expect(execute).toHaveBeenCalledTimes(3);
    });
  });

  describe('#ngAfterViewInit', () => {
    it('should update overlay position', () => {
      configureTestingModule();
      component.overlayRef = jasmine.createSpyObj('OverlayRef', [
        'updatePosition',
      ]);
      component.ngAfterViewInit();
      expect(component.overlayRef?.updatePosition).toHaveBeenCalled();
    });

    it('should not fail if overlay is not defined', () => {
      configureTestingModule();
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('#stopEvent', () => {
    it('should stop event propagation', () => {
      configureTestingModule();
      const event = jasmine.createSpyObj('event', ['stopPropagation']);
      component.stopEvent(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('#isMenuItemDisabled', () => {
    it('should return true if menu is disabled', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        disabled: true,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemDisabled(menu)).toBe(true);
    });

    it('should return false if menu is not disabled', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        disabled: false,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemDisabled(menu)).toBe(false);
    });

    it('should return true if the evaluation of the menu disabled property is true', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        disabled: (item: unknown) => true,
      } as unknown as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemDisabled(menu)).toBe(true);
    });

    it('should return false if the evaluation of the menu disabled property is false', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        disabled: (item: unknown) => false,
      } as unknown as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemDisabled(menu)).toBe(false);
    });
  });

  describe('#isMenuItemVisible', () => {
    it('should return true if menu is visible', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        visible: true,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemVisible(menu)).toBe(true);
    });

    it('should return false if menu is not visible', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        visible: false,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemVisible(menu)).toBe(false);
    });

    it('should return true if the evaluation of the menu visible property is true', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        visible: (item: unknown) => true,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemVisible(menu)).toBe(true);
    });

    it('should return false if the evaluation of the menu visible property is false', () => {
      configureTestingModule();
      const menu: ContextMenuItemDirective<unknown> = {
        visible: (item: unknown) => false,
      } as ContextMenuItemDirective<unknown>;
      expect(component.isMenuItemVisible(menu)).toBe(false);
    });
  });

  describe('#onKeyArrowDownOrUp', () => {
    it('should passe event to keyManager if is leaf', () => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = true;
      component.onKeyArrowDownOrUp(event);
      expect(keyManager.onKeydown).toHaveBeenCalledWith(event);
    });

    it('should not passe event to keyManager if is not leaf', () => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = false;
      component.onKeyArrowDownOrUp(event);
      expect(keyManager.onKeydown).not.toHaveBeenCalled();
    });
  });

  describe('#onKeyArrowRight', () => {
    describe('when ltr', () => {
      beforeEach(() => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        spyOn(component, 'onOpenSubMenu');
      });

      it('should open active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(component.onOpenSubMenu).toHaveBeenCalledWith(
          keyManager.activeItem as ContextMenuItemDirective<unknown>,
          event
        );
      });

      it('should not close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).not.toHaveBeenCalled();
      });

      it('should not open active if activeItemIndex is null', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        (keyManager.activeItemIndex as any) = null;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });

      it('should not open active sub menu if this is not leaf', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = false;
        component.onKeyArrowRight(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });

      it('should not open sub menu if there is no active', () => {
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });
    });

    describe('when rtl', () => {
      beforeEach(() => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        spyOn(component, 'onOpenSubMenu');
        component.dir = 'rtl';
      });

      it('should not open active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });

      it('should close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown', { keyCode: 39 });
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).toHaveBeenCalledWith({
          event,
          excludeRootMenu: true,
        });
      });

      it('should not close active sub menu if activeItemIndex is null', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        (keyManager.activeItemIndex as any) = null;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown', { keyCode: 39 });
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).not.toHaveBeenCalled();
      });

      it('should close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown', { keyCode: 37 });
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).toHaveBeenCalledWith({
          event,
          excludeRootMenu: false,
        });
      });

      it('should not close active sub menu if this is not leaf', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = false;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).not.toHaveBeenCalledWith();
      });

      it('should not close active sub menu if there is no active item', () => {
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(closeLeafMenu).not.toHaveBeenCalledWith();
      });
    });

    it('should cancel event', () => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      spyOn(component, 'onOpenSubMenu');
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      spyOnProperty(event, 'target', 'get').and.returnValue(
        document.createElement('div')
      );
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.isLeaf = true;
      component.onKeyArrowRight(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(event.stopPropagation).toHaveBeenCalledWith();
    });

    ['input', 'textarea', 'select'].forEach((tagName) => {
      it(`should not cancel event if event target is "${tagName}"`, () => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        spyOn(component, 'onOpenSubMenu');
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        spyOnProperty(event, 'target', 'get').and.returnValue(
          document.createElement(tagName)
        );
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        component.isLeaf = true;
        component.onKeyArrowRight(event);
        expect(event.preventDefault).not.toHaveBeenCalledWith();
        expect(event.stopPropagation).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('#onKeyArrowLeft', () => {
    describe('when rtl', () => {
      beforeEach(() => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        spyOn(component, 'onOpenSubMenu');
        component.dir = 'rtl';
      });

      it('should open active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(component.onOpenSubMenu).toHaveBeenCalledWith(
          keyManager.activeItem as ContextMenuItemDirective<unknown>,
          event
        );
      });

      it('should not close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(closeLeafMenu).not.toHaveBeenCalled();
      });

      it('should not open active sub menu if this is not leaf', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = false;
        component.onKeyArrowLeft(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });

      it('should not open sub menu if there is no active', () => {
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });
    });

    describe('when ltr', () => {
      beforeEach(() => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        spyOn(component, 'onOpenSubMenu');
      });

      it('should not open active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(component.onOpenSubMenu).not.toHaveBeenCalled();
      });

      it('should close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown', { keyCode: 37 });
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(closeLeafMenu).toHaveBeenCalledWith({
          event,
          excludeRootMenu: true,
        });
      });

      it('should close active sub menu', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown', { keyCode: 39 });
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(closeLeafMenu).toHaveBeenCalledWith({
          event,
          excludeRootMenu: false,
        });
      });

      it('should not close active sub menu if this is not leaf', () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = false;
        component.onKeyArrowLeft(event);
        expect(closeLeafMenu).not.toHaveBeenCalledWith();
      });

      it('should not close active sub menu if there is no active item', () => {
        const closeLeafMenu = jasmine.createSpy('subscriber');
        component.closeLeafMenu.subscribe(closeLeafMenu);
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(closeLeafMenu).not.toHaveBeenCalledWith();
      });
    });

    it('should cancel event', () => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      spyOn(component, 'onOpenSubMenu');
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      spyOnProperty(event, 'target', 'get').and.returnValue(
        document.createElement('div')
      );
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.isLeaf = true;
      component.onKeyArrowLeft(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(event.stopPropagation).toHaveBeenCalledWith();
    });

    ['input', 'textarea', 'select'].forEach((tagName) => {
      it(`should not cancel event if event target is "${tagName}"`, () => {
        mockActiveDescendantKeyManager();
        configureTestingModule();
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        spyOn(component, 'onOpenSubMenu');
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        spyOnProperty(event, 'target', 'get').and.returnValue(
          document.createElement(tagName)
        );
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.preventDefault).not.toHaveBeenCalledWith();
        expect(event.stopPropagation).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('#onKeyEnterOrSpace', () => {
    beforeEach(() => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      spyOn(component, 'onOpenSubMenu');
    });

    it('should open active sub menu', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = true;
      component.onKeyEnterOrSpace(event);
      expect(component.onOpenSubMenu).toHaveBeenCalledWith(
        keyManager.activeItem as ContextMenuItemDirective<unknown>,
        event
      );
    });

    it('should not open active sub menu if this is not leaf', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = false;
      component.onKeyEnterOrSpace(event);
      expect(component.onOpenSubMenu).not.toHaveBeenCalled();
    });

    it('should not open sub menu if there is no active sub menu', () => {
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = true;
      component.onKeyEnterOrSpace(event);
      expect(component.onOpenSubMenu).not.toHaveBeenCalled();
    });

    it('should cancel event', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      spyOnProperty(event, 'target', 'get').and.returnValue(
        document.createElement('div')
      );
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.isLeaf = true;
      component.onKeyEnterOrSpace(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(event.stopPropagation).toHaveBeenCalledWith();
    });

    ['input', 'textarea', 'select'].forEach((tagName) => {
      it(`should not cancel event if event target is "${tagName}"`, () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        spyOnProperty(event, 'target', 'get').and.returnValue(
          document.createElement(tagName)
        );
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        component.isLeaf = true;
        component.onKeyEnterOrSpace(event);
        expect(event.preventDefault).not.toHaveBeenCalledWith();
        expect(event.stopPropagation).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('#onKeyArrowEscape', () => {
    beforeEach(() => {
      mockActiveDescendantKeyManager();
      configureTestingModule();
      spyOn(component, 'onOpenSubMenu');
    });

    it('should close active sub menu', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      const closeLeafMenu = jasmine.createSpy('subscriber');
      component.closeLeafMenu.subscribe(closeLeafMenu);
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = true;
      component.onKeyArrowEscape(event);
      expect(closeLeafMenu).toHaveBeenCalledWith({
        event,
        excludeRootMenu: false,
      });
    });

    it('should not close active sub menu if this is not leaf', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      const closeLeafMenu = jasmine.createSpy('subscriber');
      component.closeLeafMenu.subscribe(closeLeafMenu);
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = false;
      component.onKeyArrowEscape(event);
      expect(closeLeafMenu).not.toHaveBeenCalledWith();
    });

    it('should not close active sub menu if there is no active item', () => {
      const closeLeafMenu = jasmine.createSpy('subscriber');
      component.closeLeafMenu.subscribe(closeLeafMenu);
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      component.isLeaf = true;
      component.onKeyArrowEscape(event);
      expect(closeLeafMenu).not.toHaveBeenCalledWith();
    });

    it('should cancel event', () => {
      const directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      (keyManager.activeItem as any) = directive;
      component.ngOnInit();
      const event = new KeyboardEvent('mousedown');
      spyOnProperty(event, 'target', 'get').and.returnValue(
        document.createElement('div')
      );
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.isLeaf = true;
      component.onKeyArrowEscape(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(event.stopPropagation).toHaveBeenCalledWith();
    });

    ['input', 'textarea', 'select'].forEach((tagName) => {
      it(`should not cancel event if event target is "${tagName}"`, () => {
        const directive = new ContextMenuItemDirective(
          undefined as unknown as TemplateRef<{ item: any }>
        );
        (keyManager.activeItem as any) = directive;
        component.ngOnInit();
        const event = new KeyboardEvent('mousedown');
        spyOnProperty(event, 'target', 'get').and.returnValue(
          document.createElement(tagName)
        );
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        component.isLeaf = true;
        component.onKeyArrowEscape(event);
        expect(event.preventDefault).not.toHaveBeenCalledWith();
        expect(event.stopPropagation).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('#onClickOrRightClick', () => {
    let mouseEvent: MouseEvent;
    let subscriber: jasmine.Spy<jasmine.Func>;

    beforeEach(() => {
      subscriber = jasmine.createSpy('subscriber');
      component.closeAllMenus.subscribe(subscriber);
    });

    it('should close all menus', () => {
      mouseEvent = new MouseEvent('click');
      component.onClickOrRightClick(mouseEvent);
      expect(subscriber).toHaveBeenCalledWith({ event: mouseEvent });
    });

    it('should not close all menus if this is a click event with right button (not the same as contextmenu event)', () => {
      mouseEvent = new MouseEvent('click', { button: 2 });
      component.onClickOrRightClick(mouseEvent);
      expect(subscriber).not.toHaveBeenCalled();
    });

    it('should not close all menus if the event is within the current contextmenu', () => {
      mouseEvent = new MouseEvent('click');
      const target = document.createElement('div');
      spyOnProperty(mouseEvent, 'target', 'get').and.returnValue(target);
      const elementRef = fixture.debugElement.injector.get(ElementRef);
      spyOn(elementRef.nativeElement, 'contains').and.returnValue(true);
      component.onClickOrRightClick(mouseEvent);
      expect(elementRef.nativeElement.contains).toHaveBeenCalledWith(target);
      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('#onCloseLeafMenu', () => {
    let event: KeyboardEvent;
    let closeLeafMenu: jasmine.Spy<jasmine.Func>;

    beforeEach(() => {
      configureTestingModule();

      component.ngOnInit();

      closeLeafMenu = jasmine.createSpy('subscriber');
      component.closeLeafMenu.subscribe(closeLeafMenu);
    });

    it('should notify closeLeafMenu', () => {
      event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: jasmine.createSpy('preventDefault'),
        target: document.createElement('div'),
      } as unknown as KeyboardEvent;
      component.isLeaf = true;
      component.onKeyArrowLeft(event);
      expect(closeLeafMenu).toHaveBeenCalledWith({
        event,
        excludeRootMenu: false,
      });
    });

    it('should notify closeLeafMenu when key press is arrow left', () => {
      event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: jasmine.createSpy('preventDefault'),
        target: document.createElement('div'),
        keyCode: 37,
      } as unknown as KeyboardEvent;
      component.isLeaf = true;
      component.onKeyArrowLeft(event);
      expect(closeLeafMenu).toHaveBeenCalledWith({
        event,
        excludeRootMenu: true,
      });
    });

    it('should not notify closeLeafMenu if not isLeaf', () => {
      event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: jasmine.createSpy('preventDefault'),
        target: document.createElement('div'),
      } as unknown as KeyboardEvent;
      component.isLeaf = false;
      component.onKeyArrowLeft(event);
      expect(closeLeafMenu).not.toHaveBeenCalled();
    });

    describe('when event target is an arbitrary html element', () => {
      it('should stop event propagation', () => {
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: document.createElement('div'),
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.stopPropagation).toHaveBeenCalled();
      });

      it('should prevent default event', () => {
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: document.createElement('div'),
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });
    describe('when event target is not an arbitrary html element', () => {
      it('should not stop event propagation if event target is undefined', () => {
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: undefined,
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.stopPropagation).not.toHaveBeenCalled();
      });

      it('should not prevent default event if event target is undefined', () => {
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: undefined,
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      it('should not stop event propagation if event target is contentEditable', () => {
        const div = document.createElement('div');
        div.contentEditable = 'true';
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: div,
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.stopPropagation).not.toHaveBeenCalled();
      });

      it('should not prevent default event if event target is contentEditable', () => {
        const div = document.createElement('div');
        div.contentEditable = 'true';
        event = {
          stopPropagation: jasmine.createSpy('stopPropagation'),
          preventDefault: jasmine.createSpy('preventDefault'),
          target: div,
        } as unknown as KeyboardEvent;
        component.isLeaf = true;
        component.onKeyArrowLeft(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      ['input', 'textarea', 'select'].forEach((tag) => {
        it(`should not stop event propagation if event target is an <${tag}>`, () => {
          event = {
            stopPropagation: jasmine.createSpy('stopPropagation'),
            preventDefault: jasmine.createSpy('preventDefault'),
            target: document.createElement(tag),
          } as unknown as KeyboardEvent;
          component.isLeaf = true;
          component.onKeyArrowLeft(event);
          expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it(`should not prevent default event if event target is is an <${tag}>`, () => {
          event = {
            stopPropagation: jasmine.createSpy('stopPropagation'),
            preventDefault: jasmine.createSpy('preventDefault'),
            target: document.createElement(tag),
          } as unknown as KeyboardEvent;
          component.isLeaf = true;
          component.onKeyArrowLeft(event);
          expect(event.preventDefault).not.toHaveBeenCalled();
        });
      });
    });

    it('should not stop event propagation if is not isLeaf', () => {
      event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: jasmine.createSpy('preventDefault'),
      } as unknown as KeyboardEvent;
      component.isLeaf = false;
      component.onKeyArrowLeft(event);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('should not prevent default event if is not isLeaf', () => {
      event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: jasmine.createSpy('preventDefault'),
        target: document.createElement('div'),
      } as unknown as KeyboardEvent;
      component.isLeaf = false;
      component.onKeyArrowLeft(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('#closeMenu', () => {
    let closeAllMenus: jasmine.Spy<jasmine.Func>;

    beforeEach(() => {
      configureTestingModule();
      closeAllMenus = jasmine.createSpy('closeAllMenus');
      component.closeAllMenus.subscribe(closeAllMenus);
    });

    it('should not notify close all menus if it is a right click', () => {
      const event = new MouseEvent('click', { button: 2 });
      component.onClickOrRightClick(event);
      expect(closeAllMenus).not.toHaveBeenCalled();
    });

    it('should notify close all menus if event is not a click', () => {
      const event = new MouseEvent('mousedown', { button: 2 });
      component.onClickOrRightClick(event);
      expect(closeAllMenus).toHaveBeenCalledWith({ event });
    });

    it('should notify close all menus if event is not a right click', () => {
      const event = new MouseEvent('click', { button: 1 });
      component.onClickOrRightClick(event);
      expect(closeAllMenus).toHaveBeenCalledWith({ event });
    });
  });

  describe('#onOpenSubMenu', () => {
    let openSubMenu: jasmine.Spy<jasmine.Func>;
    let directive: ContextMenuItemDirective<unknown>;
    let nativeElement: HTMLElement;

    beforeEach(() => {
      mockActiveDescendantKeyManager();
      (keyManager.activeItemIndex as any) = 0;
      configureTestingModule();
      component.ngOnInit();
      directive = new ContextMenuItemDirective(
        undefined as unknown as TemplateRef<{ item: any }>
      );
      nativeElement = document.createElement('li');
      component.liElementRefs = new QueryList<ElementRef>();
      spyOn(component.liElementRefs, 'toArray').and.returnValue([
        new ElementRef(nativeElement),
      ]);
      directive.subMenu =
        TestBed.createComponent(ContextMenuComponent).componentInstance;
      component.value = { id: 'a' };
      openSubMenu = jasmine.createSpy('openSubMenu');
      component.openSubMenu.subscribe(openSubMenu);
    });

    it('should not emit on openSubMenu if keyManager as no active element', () => {
      (keyManager.activeItemIndex as any) = null;
      component.onOpenSubMenu(directive, new KeyboardEvent('keydown'));
      expect(openSubMenu).not.toHaveBeenCalled();
    });

    it('should emit on openSubMenu anchored to element on keyboard event', () => {
      component.onOpenSubMenu(directive, new KeyboardEvent('keydown'));
      expect(openSubMenu).toHaveBeenCalledWith({
        anchoredTo: 'element',
        anchorElement: nativeElement,
        contextMenu: directive.subMenu,
        value: component.value,
        parentContextMenu: component,
      });
    });

    it('should emit on openSubMenu anchored to element on mouse event with currentTarget', () => {
      const event = new MouseEvent('mousedown');
      const currentTarget = document.createElement('div');
      spyOnProperty(event, 'currentTarget', 'get').and.returnValue(
        currentTarget
      );
      component.onOpenSubMenu(directive, event);
      expect(openSubMenu).toHaveBeenCalledWith({
        anchoredTo: 'element',
        anchorElement: currentTarget,
        contextMenu: directive.subMenu,
        value: component.value,
        parentContextMenu: component,
      });
    });

    it('should emit on openSubMenu mouse position on mouse event without target', () => {
      const event = new MouseEvent('mousedown', { clientX: 42, clientY: 58 });
      component.onOpenSubMenu(directive, event);
      expect(openSubMenu).toHaveBeenCalledWith({
        anchoredTo: 'position',
        x: 42,
        y: 58,
        contextMenu: directive.subMenu,
        value: component.value,
      });
    });
  });

  describe('#onMenuItemSelect', () => {
    let menu: ContextMenuItemDirective<unknown>;
    let event: MouseEvent;

    beforeEach(() => {
      configureTestingModule();
      spyOn(component, 'onOpenSubMenu');
      component.value = { id: 'a' };
      menu = jasmine.createSpyObj('menu', ['triggerExecute']);
      event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      spyOn(event, 'preventDefault');
      spyOnProperty(event, 'target', 'get').and.returnValue(
        document.createElement('div')
      );
    });

    it('should stop event propagation', () => {
      component.onMenuItemSelect(menu, event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should preventDefault event', () => {
      component.onMenuItemSelect(menu, event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should try to open sub menu', () => {
      component.onMenuItemSelect(menu, event);
      expect(component.onOpenSubMenu).toHaveBeenCalledWith(menu, event);
    });

    it('should execute if there is no sub menu', () => {
      component.onMenuItemSelect(menu, event);
      expect(menu.triggerExecute).toHaveBeenCalledWith(event, component.value);
    });

    it('should not execute if there is sub menu', () => {
      menu.subMenu = {} as ContextMenuComponent<unknown>;
      component.onMenuItemSelect(menu, event);
      expect(menu.triggerExecute).not.toHaveBeenCalled();
    });
  });
});
