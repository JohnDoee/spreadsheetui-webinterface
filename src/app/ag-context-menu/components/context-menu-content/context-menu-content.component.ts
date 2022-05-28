import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextMenuItemDirective } from '../../directives/context-menu-item/context-menu-item.directive';
import { evaluateIfFunction } from '../../helper/evaluate';
import {
  ContextMenuCloseLeafEvent,
  ContextMenuOpenEvent,
} from '../context-menu/context-menu.component.interface';

const ARROW_LEFT_KEYCODE = 37;
const ARROW_RIGHT_KEYCODE = 39;

/**
 * For testing purpose only
 */
export const TESTING_WRAPPER = {
  ActiveDescendantKeyManager,
};

@Component({
  selector: 'context-menu-content',
  templateUrl: './context-menu-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuContentComponent<T>
  implements OnInit, OnDestroy, AfterViewInit
{
  /**
   * The list of `ContextMenuItemDirective` that represent each menu items
   */
  @Input()
  public menuDirectives: ContextMenuItemDirective<T>[] = [];

  /**
   * The item on which the menu act
   */
  @Input()
  public value?: T;

  /**
   * The orientation of the component
   * @see https://developer.mozilla.org/fr/docs/Web/HTML/Global_attributes/dir
   */
  @Input()
  @HostBinding('attr.dir')
  public dir: 'ltr' | 'rtl' | undefined;

  /**
   * The parent menu of the instance
   */
  @Input()
  public parentContextMenu!: ContextMenuContentComponent<T>;

  /**
   * A CSS class to apply a theme to the the menu
   */
  @Input()
  public menuClass: string = '';

  /**
   * The overlay ref associated to the instance
   */
  @Input()
  public overlayRef: OverlayRef | undefined;

  /**
   * Wether the instance is a leaf menu or not
   */
  @Input()
  public isLeaf = false;

  /**
   * Emit when a menu item is selected
   */
  @Output()
  public execute: EventEmitter<{
    event: MouseEvent | KeyboardEvent;
    value?: T;
    menuDirective: ContextMenuItemDirective<T>;
  }> = new EventEmitter();

  /**
   * Emit when a sub menu is opened
   */
  @Output()
  public openSubMenu: EventEmitter<ContextMenuOpenEvent<T>> =
    new EventEmitter();

  /**
   * Emit when a leaf menu is closed
   */
  @Output()
  public closeLeafMenu: EventEmitter<ContextMenuCloseLeafEvent> = new EventEmitter();

  /**
   * Emit when all menus is closed
   */
  @Output()
  public closeAllMenus: EventEmitter<{
    event: MouseEvent;
  }> = new EventEmitter();

  /**
   * @internal
   */
  @ViewChildren('li')
  public liElementRefs!: QueryList<ElementRef>;

  private keyManager!: ActiveDescendantKeyManager<ContextMenuItemDirective<T>>;
  private subscription: Subscription = new Subscription();

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  /**
   * @internal
   */
  public ngOnInit(): void {
    this.setupDirectives();
  }

  /**
   * @internal
   */
  public ngAfterViewInit() {
    this.overlayRef?.updatePosition();
  }

  /**
   * @internal
   */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * @internal
   */
  @HostListener('window:keydown.ArrowDown', ['$event'])
  @HostListener('window:keydown.ArrowUp', ['$event'])
  public onKeyArrowDownOrUp(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }

    this.keyManager.onKeydown(event);
  }

  /**
   * @internal
   */
  @HostListener('window:keydown.ArrowRight', ['$event'])
  public onKeyArrowRight(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }

    if (this.dir === 'rtl') {
      this.closeActiveItemSubMenu(event);
      return;
    }

    this.openActiveItemSubMenu(event);
  }

  /**
   * @internal
   */
  @HostListener('window:keydown.ArrowLeft', ['$event'])
  public onKeyArrowLeft(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }

    if (this.dir === 'rtl') {
      this.openActiveItemSubMenu(event);
      return;
    }

    this.closeActiveItemSubMenu(event);
  }

  /**
   * @internal
   */
  @HostListener('window:keydown.Enter', ['$event'])
  @HostListener('window:keydown.Space', ['$event'])
  public onKeyEnterOrSpace(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }

    if (!this.keyManager.activeItem) {
      return;
    }

    this.onMenuItemSelect(this.keyManager.activeItem, event);
  }

  /**
   * @internal
   */
  @HostListener('window:keydown.Escape', ['$event'])
  public onKeyArrowEscape(event: KeyboardEvent): void {
    if (!this.isLeaf) {
      return;
    }

    this.closeActiveItemSubMenu(event);
  }

  /**
   * @internal
   */
  @HostListener('document:click', ['$event'])
  @HostListener('document:contextmenu', ['$event'])
  public onClickOrRightClick(event: MouseEvent): void {
    if (event.type === 'click' && event.button === 2) {
      return;
    }

    if (this.elementRef.nativeElement.contains(event.target as Node)) {
      return;
    }

    this.closeAllMenus.emit({ event });
  }

  /**
   * @internal
   */
  public stopEvent(event: MouseEvent) {
    event.stopPropagation();
  }

  /**
   * @internal
   */
  public isMenuItemDisabled(menuItem: ContextMenuItemDirective<T>): boolean {
    return evaluateIfFunction(menuItem.disabled, this.value);
  }

  /**
   * @internal
   */
  public isMenuItemVisible(menuItem: ContextMenuItemDirective<T>): boolean {
    return evaluateIfFunction(menuItem.visible, this.value);
  }

  /**
   * @internal
   */
  public onOpenSubMenu(
    menuItem: ContextMenuItemDirective<T>,
    event: MouseEvent | KeyboardEvent
  ): void {
    if (this.keyManager.activeItemIndex === null || !menuItem.subMenu) {
      return;
    }

    const anchorElementRef =
      this.liElementRefs.toArray()[this.keyManager.activeItemIndex];
    const anchorElement = anchorElementRef && anchorElementRef.nativeElement;

    if (anchorElement && event instanceof KeyboardEvent) {
      this.openSubMenu.emit({
        anchoredTo: 'element',
        anchorElement,
        contextMenu: menuItem.subMenu,
        value: this.value,
        parentContextMenu: this,
      });
    } else if (event.currentTarget) {
      this.openSubMenu.emit({
        anchoredTo: 'element',
        anchorElement: event.currentTarget,
        contextMenu: menuItem.subMenu,
        value: this.value,
        parentContextMenu: this,
      });
    } else {
      this.openSubMenu.emit({
        anchoredTo: 'position',
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY,
        contextMenu: menuItem.subMenu,
        value: this.value,
      });
    }
  }

  /**
   * @internal
   */
  public onMenuItemSelect(
    menuItem: ContextMenuItemDirective<T>,
    event: MouseEvent | KeyboardEvent
  ): void {
    this.cancelEvent(event);
    this.onOpenSubMenu(menuItem, event);
    if (!menuItem.subMenu) {
      this.triggerExecute(menuItem, event);
    }
  }

  private triggerExecute(
    menuItem: ContextMenuItemDirective<T>,
    event: MouseEvent | KeyboardEvent
  ): void {
    menuItem.triggerExecute(event, this.value);
  }

  private setupDirectives() {
    this.menuDirectives.forEach((menuDirective) => {
      menuDirective.value = this.value;
      this.subscription.add(
        menuDirective.execute.subscribe((event) =>
          this.execute.emit({ ...event, menuDirective })
        )
      );
    });
    const queryList = new QueryList<ContextMenuItemDirective<T>>();
    queryList.reset(this.menuDirectives);
    this.keyManager = new TESTING_WRAPPER.ActiveDescendantKeyManager<
      ContextMenuItemDirective<T>
    >(queryList).withWrap();
  }

  private openActiveItemSubMenu(event: KeyboardEvent) {
    if (this.keyManager.activeItemIndex === null) {
      return;
    }

    this.cancelEvent(event);

    if (this.keyManager.activeItem) {
      this.onOpenSubMenu(this.keyManager.activeItem, event);
    }
  }

  private closeActiveItemSubMenu(event: KeyboardEvent) {
    if (this.keyManager.activeItemIndex === null) {
      return;
    }

    this.cancelEvent(event);

    this.closeLeafMenu.emit({
      excludeRootMenu:
        this.dir === 'rtl'
          ? event.keyCode === ARROW_RIGHT_KEYCODE
          : event.keyCode === ARROW_LEFT_KEYCODE,
      event,
    });
  }

  private cancelEvent(event?: MouseEvent | KeyboardEvent): void {
    if (!event || !event.target) {
      return;
    }

    const target = event.target as HTMLElement;
    if (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
      target.isContentEditable
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}
