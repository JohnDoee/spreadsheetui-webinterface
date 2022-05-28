import {
  FullscreenOverlayContainer,
  OverlayContainer,
  OverlayModule,
} from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContextMenuContentComponent } from './components/context-menu-content/context-menu-content.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuItemDirective } from './directives/context-menu-item/context-menu-item.directive';
import { ContextMenuDirective } from './directives/context-menu/context-menu.directive';
import { ContextMenuHoverDirective } from './directives/contextMenu.hover.directive';

@NgModule({
  declarations: [
    ContextMenuDirective,
    ContextMenuComponent,
    ContextMenuContentComponent,
    ContextMenuItemDirective,
    ContextMenuHoverDirective,
  ],
  providers: [
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ],
  exports: [
    ContextMenuDirective,
    ContextMenuComponent,
    ContextMenuItemDirective,
  ],
  imports: [CommonModule, OverlayModule],
})
export class ContextMenuModule {}
