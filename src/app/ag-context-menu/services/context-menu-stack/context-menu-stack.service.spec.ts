import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ContextMenuContentComponent } from '../../components/context-menu-content/context-menu-content.component';
import {
  ContextMenuStackItem,
  ContextMenuStackService,
} from './context-menu-stack.service';

describe('Service: ContextMenuStackService', () => {
  let service: ContextMenuStackService<unknown>;

  const createContextMenuContentComponent =
    (): ContextMenuContentComponent<unknown> => {
      return TestBed.createComponent(ContextMenuContentComponent)
        .componentInstance;
    };

  const createOverlayRef = (): OverlayRef => {
    return TestBed.inject(Overlay).create();
  };

  const createStackItem = (): ContextMenuStackItem<unknown> => {
    return {
      contextMenuContentComponent: createContextMenuContentComponent(),
      overlayRef: createOverlayRef(),
    };
  };

  const spyOnStackItemOverlayRef = (item: ContextMenuStackItem<unknown>) => {
    return {
      detach: spyOn(item.overlayRef, 'detach'),
      dispose: spyOn(item.overlayRef, 'dispose'),
      hasAttached: spyOn(item.overlayRef, 'hasAttached'),
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
    });
    service = TestBed.inject(ContextMenuStackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#push', () => {
    it('should push an item to the stack', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      const item3 = createStackItem();
      service.push(item);
      service.push(item2);
      service.push(item3);
      expect(service.size()).toEqual(3);
    });
  });

  describe('#size', () => {
    it('should return the size of the stack', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      service.push(item);
      service.push(item2);
      expect(service.size()).toEqual(2);
    });
  });
  describe('#isEmpty', () => {
    it('should return true if the stack is empty', () => {
      expect(service.isEmpty()).toEqual(true);
    });

    it('should return false if the stack is not empty', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      service.push(item);
      service.push(item2);
      expect(service.isEmpty()).toEqual(false);
    });

    it('should return true after having been cleared', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      service.push(item);
      service.push(item2);
      service.closeAll();
      expect(service.isEmpty()).toEqual(true);
    });
  });

  describe('#closeAll', () => {
    it('should clear the stack', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      service.push(item);
      service.push(item2);
      service.closeAll();
      expect(service.isEmpty()).toEqual(true);
    });
  });

  describe('#destroySubMenus', () => {
    it('should destroy subMenus of the given menu', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      const item3 = createStackItem();
      const item4 = createStackItem();
      service.push(item);
      service.push(item2);
      service.push(item3);
      service.push(item4);
      const contextMenuComponent = createContextMenuContentComponent();
      contextMenuComponent.overlayRef = item2.overlayRef;

      const { detach: detach3, dispose: dispose3 } =
        spyOnStackItemOverlayRef(item3);
      const { detach: detach4, dispose: dispose4 } =
        spyOnStackItemOverlayRef(item4);

      service.destroySubMenus(contextMenuComponent);
      expect(detach4).toHaveBeenCalled();
      expect(dispose4).toHaveBeenCalled();
      expect(detach3).toHaveBeenCalled();
      expect(dispose3).toHaveBeenCalled();
    });

    it('should return undefined if given component is not defined', () => {
      const result = service.destroySubMenus(
        undefined as unknown as ContextMenuContentComponent<unknown>
      );
      expect(result).toBeUndefined();
    });
  });

  describe('#closeLeafMenu', () => {
    it('should return false when there is no item left in the stack', () => {
      const result = service.closeLeafMenu(false);
      expect(result).toEqual(false);
    });

    it('should return the true if destroyed root menu', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      const item3 = createStackItem();
      const item4 = createStackItem();
      service.push(item);
      service.push(item2);
      service.push(item3);
      service.push(item4);

      const { hasAttached: hasAttached2 } = spyOnStackItemOverlayRef(item2);
      const {
        detach: detach3,
        dispose: dispose3,
        hasAttached: hasAttached3,
      } = spyOnStackItemOverlayRef(item3);
      const {
        detach: detach4,
        dispose: dispose4,
        hasAttached: hasAttached4,
      } = spyOnStackItemOverlayRef(item4);

      hasAttached2.and.returnValue(true);
      hasAttached3.and.returnValue(true);
      hasAttached4.and.returnValue(false);
      const result = service.closeLeafMenu(false);
      expect(detach3).toHaveBeenCalled();
      expect(dispose3).toHaveBeenCalled();
      expect(detach4).toHaveBeenCalled();
      expect(dispose4).toHaveBeenCalled();
      expect(result).toEqual(true);
    });

    it('should return the true if destroyed root menu', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      const item3 = createStackItem();
      const item4 = createStackItem();
      service.push(item);
      service.push(item2);
      service.push(item3);
      service.push(item4);

      const { hasAttached: hasAttached2 } = spyOnStackItemOverlayRef(item2);
      const {
        detach: detach3,
        dispose: dispose3,
        hasAttached: hasAttached3,
      } = spyOnStackItemOverlayRef(item3);
      const {
        detach: detach4,
        dispose: dispose4,
        hasAttached: hasAttached4,
      } = spyOnStackItemOverlayRef(item4);

      hasAttached2.and.returnValue(false);
      hasAttached3.and.returnValue(false);
      hasAttached4.and.returnValue(false);
      const result = service.closeLeafMenu(false);
      expect(detach3).toHaveBeenCalled();
      expect(dispose3).toHaveBeenCalled();
      expect(detach4).toHaveBeenCalled();
      expect(dispose4).toHaveBeenCalled();
      expect(result).toEqual(true);
    });

    it('should return false if destroyed root menu', () => {
      const item = createStackItem();
      const item2 = createStackItem();
      const item3 = createStackItem();
      const item4 = createStackItem();
      service.push(item);
      service.push(item2);
      service.push(item3);
      service.push(item4);

      const { hasAttached: hasAttached2 } = spyOnStackItemOverlayRef(item2);
      const {
        detach: detach3,
        dispose: dispose3,
        hasAttached: hasAttached3,
      } = spyOnStackItemOverlayRef(item3);
      const {
        detach: detach4,
        dispose: dispose4,
        hasAttached: hasAttached4,
      } = spyOnStackItemOverlayRef(item4);

      hasAttached2.and.returnValue(true);
      hasAttached3.and.returnValue(false);
      hasAttached4.and.returnValue(false);
      const result = service.closeLeafMenu(true);
      expect(detach3).toHaveBeenCalled();
      expect(dispose3).toHaveBeenCalled();
      expect(detach4).toHaveBeenCalled();
      expect(dispose4).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
  });
});
