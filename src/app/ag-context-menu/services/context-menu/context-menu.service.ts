import { Injectable } from '@angular/core';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { ContextMenuEventService } from '../context-menu-event/context-menu-event.service';

export interface ContextMenuOpenAtPositionOptions<T> {
  /**
   * Optional associated data to the context menu, will be emitted when a menu item is selected
   */
  value?: T;
  /**
   * The horizontal position of the menu
   */
  x: number;
  /**
   * The vertical position of the menu
   */
  y: number;
}
export interface ContextMenuOpenAtElementOptions<T> {
  /**
   * Optional associated data to the context menu, will be emitted when a menu item is selected
   */
  value?: T;
  /**
   * The horizontal position of the menu
   */
  x: number;
  /**
   * The vertical position of the menu
   */
  y: number;
}

/**
 * Programmatically open a ContextMenuComponent to a X/Y position
 */
@Injectable({
  providedIn: 'root',
})
export class ContextMenuService<T> {
  constructor(private contextMenuEventService: ContextMenuEventService<T>) {}
  /**
   * Show the given `ContextMenuComponent` at a specified X/Y position
   */
  public show(
    contextMenu: ContextMenuComponent<T>,
    options: ContextMenuOpenAtPositionOptions<T> = { x: 0, y: 0 }
  ) {
    this.contextMenuEventService.show({
      anchoredTo: 'position',
      contextMenu,
      value: options.value,
      x: options.x,
      y: options.y,
    });
  }
}
