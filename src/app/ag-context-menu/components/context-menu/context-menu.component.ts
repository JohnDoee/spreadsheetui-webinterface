import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextMenuItemDirective } from '../../directives/context-menu-item/context-menu-item.directive';
import { evaluateIfFunction } from '../../helper/evaluate';
import { ContextMenuEventService } from '../../services/context-menu-event/context-menu-event.service';
import { ContextMenuStackService } from '../../services/context-menu-stack/context-menu-stack.service';
import { ContextMenuContentComponent } from '../context-menu-content/context-menu-content.component';
import {
  getPositionsToAnchorElement,
  getPositionsToXY,
} from './context-menu.component.helpers';
import {
  ContextMenuCloseEvent,
  ContextMenuOpenEvent,
  IContextMenuContext,
} from './context-menu.component.interface';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'context-menu',
  template: '',
})
export class ContextMenuComponent<T> implements OnDestroy {
  /**
   * A CSS class to apply to the context menu overlay, ideal for theming and custom styling
   */
  @Input()
  public menuClass = '';

  /**
   * Disable the whole context menu
   */
  @Input()
  public disabled = false;

  /**
   * Whether the menu is oriented to the right (default: `ltr`) or to the right (`rtl`)
   */
  @Input()
  public dir: 'ltr' | 'rtl' | undefined;

  /**
   * Emit when the menu is opened
   */
  @Output()
  public open: EventEmitter<ContextMenuOpenEvent<T>> = new EventEmitter();

  /**
   * Emit when the menu is closed
   */
  @Output()
  public close: EventEmitter<void> = new EventEmitter();

  /**
   * The menu item directives defined inside the component
   */
  @ContentChildren(ContextMenuItemDirective)
  public menuItems!: QueryList<ContextMenuItemDirective<T>>;

  /**
   * @internal
   */
  public visibleMenuItems: ContextMenuItemDirective<T>[] = [];
  /**
   * @internal
   */
  public value?: T;

  private subscription: Subscription = new Subscription();

  constructor(
    private overlay: Overlay,
    private scrollStrategy: ScrollStrategyOptions,
    private contextMenuStack: ContextMenuStackService<T>,
    private contextMenuEventService: ContextMenuEventService<T>
  ) {}

  /**
   * @internal
   */
  public ngOnInit(): void {
    const subscription = this.contextMenuEventService.onShow.subscribe(
      (menuEvent) => {
        this.onMenuEvent(menuEvent);
      }
    );

    this.subscription.add(subscription);
  }

  /**
   * @internal
   */
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Open context menu
   */
  public openContextMenu(context: IContextMenuContext<T>) {
    let positionStrategy: FlexibleConnectedPositionStrategy;

    if (context.anchoredTo === 'position') {
      positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo({
          x: context.x,
          y: context.y,
        })
        .withPositions(getPositionsToXY(context.dir));
      this.closeAllContextMenus({ eventType: 'cancel' });
    } else {
      const { anchorElement, parentContextMenu } = context;
      positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(new ElementRef(anchorElement))
        .withPositions(getPositionsToAnchorElement(parentContextMenu.dir));
      this.contextMenuStack.destroySubMenus(parentContextMenu);
    }

    const overlayRef = this.overlay.create({
      positionStrategy,
      panelClass: 'ngx-contextmenu',
      scrollStrategy: this.scrollStrategy.close(),
    });
    this.attachContextMenu(overlayRef, context);
  }

  private onMenuEvent(event: ContextMenuOpenEvent<T>): void {
    if (this.disabled) {
      return;
    }

    const { contextMenu, value } = event;

    if (contextMenu && contextMenu !== this) {
      return;
    }

    this.value = value;
    this.setVisibleMenuItems();

    this.openContextMenu({
      ...event,
      menuItemDirectives: this.visibleMenuItems,
      menuClass: this.menuClass,
      dir: this.dir,
    });

    this.open.next(event);
  }

  private attachContextMenu(
    overlayRef: OverlayRef,
    context: IContextMenuContext<T>
  ): void {
    const { value, menuItemDirectives } = context;
    const contextMenuContentRef = overlayRef.attach(
      new ComponentPortal<ContextMenuContentComponent<T>>(
        ContextMenuContentComponent
      )
    );

    const { instance: contextMenuContentComponent } = contextMenuContentRef;

    contextMenuContentComponent.value = value;
    contextMenuContentComponent.menuDirectives = menuItemDirectives;
    contextMenuContentComponent.overlayRef = overlayRef;
    contextMenuContentComponent.isLeaf = true;
    contextMenuContentComponent.menuClass = this.getMenuClass(context);
    contextMenuContentComponent.dir = this.getDir(context);
    contextMenuContentRef.changeDetectorRef.detectChanges;

    this.contextMenuStack.push({
      overlayRef,
      contextMenuContentComponent,
    });

    const subscriptions: Subscription = new Subscription();
    subscriptions.add(
      contextMenuContentComponent.execute.subscribe((executeEvent) =>
        this.closeAllContextMenus({ eventType: 'execute', ...executeEvent })
      )
    );
    subscriptions.add(
      contextMenuContentComponent.closeAllMenus.subscribe((closeAllEvent) =>
        this.closeAllContextMenus({ eventType: 'cancel', ...closeAllEvent })
      )
    );
    subscriptions.add(
      contextMenuContentComponent.closeLeafMenu.subscribe(
        (closeLeafMenuEvent) =>
          this.destroyLeafMenu(!!closeLeafMenuEvent.excludeRootMenu)
      )
    );
    subscriptions.add(
      contextMenuContentComponent.openSubMenu.subscribe(
        (openSubMenuEvent: ContextMenuOpenEvent<T>) => {
          this.contextMenuStack.destroySubMenus(contextMenuContentComponent);
          if (!openSubMenuEvent.contextMenu) {
            contextMenuContentComponent.isLeaf = true;
            return;
          }
          contextMenuContentComponent.isLeaf = false;
          this.contextMenuEventService.show(openSubMenuEvent);
        }
      )
    );
    contextMenuContentRef.onDestroy(() => {
      this.close.next();
      menuItemDirectives.forEach((menuItem) => (menuItem.isActive = false));
      subscriptions.unsubscribe();
    });
    contextMenuContentRef.changeDetectorRef.detectChanges();
  }

  private getMenuClass(event: IContextMenuContext<T>): string {
    return (
      event.menuClass ||
      (event.anchoredTo === 'element' && event?.parentContextMenu?.menuClass) ||
      ''
    );
  }

  private getDir(event: IContextMenuContext<T>): 'ltr' | 'rtl' | undefined {
    return (
      event.dir ||
      (event.anchoredTo === 'element' && event?.parentContextMenu?.dir) ||
      undefined
    );
  }

  private closeAllContextMenus(closeEvent: ContextMenuCloseEvent): void {
    this.contextMenuStack.closeAll();
  }

  private destroyLeafMenu(excludeRootMenu: boolean): void {
    this.contextMenuStack.closeLeafMenu(excludeRootMenu);
  }

  private isMenuItemVisible(menuItem: ContextMenuItemDirective<T>): boolean {
    return evaluateIfFunction(menuItem.visible, this.value);
  }

  private setVisibleMenuItems(): void {
    this.visibleMenuItems = this.menuItems.filter((menuItem) =>
      this.isMenuItemVisible(menuItem)
    );
  }
}
