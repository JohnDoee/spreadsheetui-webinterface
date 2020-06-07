import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { ContextMenuAttachDirective } from './contextMenu.attach.directive';
import { ContextMenuComponent } from './contextMenu.component';
import { ContextMenuItemDirective } from './contextMenu.item.directive';
import { IContextMenuOptions } from './contextMenu.options';
import { ContextMenuService } from './contextMenu.service';
import { CONTEXT_MENU_OPTIONS } from './contextMenu.tokens';
import { ContextMenuContentComponent } from './contextMenuContent.component';
import { ContextMenuHoverDirective } from './contextMenu.hover.directive';


@NgModule({
  declarations: [
    ContextMenuAttachDirective,
    ContextMenuComponent,
    ContextMenuContentComponent,
    ContextMenuItemDirective,
    ContextMenuHoverDirective,
  ],
  entryComponents: [
    ContextMenuContentComponent,
  ],
  exports: [
    ContextMenuAttachDirective,
    ContextMenuComponent,
    ContextMenuItemDirective,
  ],
  imports: [
    CommonModule,
    OverlayModule,
  ],
})
export class AgContextMenuModule {
  public static forRoot(options?: IContextMenuOptions): ModuleWithProviders {
    return {
      ngModule: AgContextMenuModule,
      providers: [
        ContextMenuService,
        {
          provide: CONTEXT_MENU_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
