import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { ContextMenuContentComponent } from '../../components/context-menu-content/context-menu-content.component';

export interface ContextMenuStackItem<T> {
  overlayRef: OverlayRef;
  contextMenuContentComponent: ContextMenuContentComponent<T>;
}

@Injectable({
  providedIn: 'root',
})
export class ContextMenuStackService<T> {
  private stack: ContextMenuStackItem<T>[] = [];

  /**
   * Add an item to the stack
   */
  public push(value: ContextMenuStackItem<T>) {
    this.stack.push(value);
  }

  /**
   * Return the stack size
   */
  public size(): number {
    return this.stack.length;
  }

  /**
   * Return true if the stack is empty
   */
  public isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Clear the whole stack
   */
  public closeAll(): void {
    this.stack.forEach((item) => this.dispose(item));
    this.stack = [];
  }

  /**
   * Detach and dispose sub menu's overlays of the given ContextMenuContentComponent
   */
  public destroySubMenus(contextMenu: ContextMenuContentComponent<T>): void {
    if (!contextMenu) {
      return;
    }

    const index = this.stack.findIndex(
      ({ overlayRef }) => overlayRef === contextMenu.overlayRef
    );
    this.stack.slice(index + 1).forEach((item) => {
      this.dispose(item);
    });
  }

  /**
   * Destroy leaf menu and return true if the destroyed menu is the root
   */
  public closeLeafMenu(excludeRootMenu: boolean): boolean {
    const item = this.disposeLastDetached();

    if (!item) {
      return false;
    }

    const moreThanOneItem = this.size() > 1;
    const isNotEmptyAndDoesNotExcludeRootMenu =
      !excludeRootMenu && !this.isEmpty();

    if (moreThanOneItem || isNotEmptyAndDoesNotExcludeRootMenu) {
      this.dispose(item);
    }

    if (isNotEmptyAndDoesNotExcludeRootMenu) {
      return true;
    }

    const newValue = this.disposeLastDetached();

    if (newValue) {
      newValue.contextMenuContentComponent.isLeaf = true;
    }

    return false;
  }

  /**
   * Starting by most recent items, dispose all detached item and return the most recent attached one
   */
  private disposeLastDetached(): ContextMenuStackItem<T> | undefined {
    let item = this.last();

    if (!item) {
      return;
    }

    while (
      item &&
      this.size() > 1 &&
      item.overlayRef &&
      this.isDetached(item)
    ) {
      this.dispose(item);
      this.pop();
      item = this.last();
    }
    return item;
  }

  private last(): ContextMenuStackItem<T> | undefined {
    if (this.isEmpty()) {
      return;
    }

    return this.stack[this.stack.length - 1];
  }

  private pop(): ContextMenuStackItem<T> | undefined {
    const value = this.stack.pop();
    return this.dispose(value);
  }

  private isDetached(item: ContextMenuStackItem<T>): boolean {
    return !item.overlayRef.hasAttached();
  }

  private dispose(
    item: ContextMenuStackItem<T> | undefined
  ): ContextMenuStackItem<T> | undefined {
    if (item) {
      item.overlayRef.detach();
      item.overlayRef.dispose();
    }

    return item;
  }
}
