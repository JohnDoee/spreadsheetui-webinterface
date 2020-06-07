import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';

import { AgGridModule } from 'ag-grid-angular';
import { AgContextMenuModule } from './ag-context-menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CheckboxFilterComponent } from './gridcomponents/checkboxfilter.component';
import { JobqueueComponent } from './jobqueue/jobqueue.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { AgContextMenuComponent } from './ag-context-menu/ag-context-menu.component';
// import { AgContextMenuDirective } from './ag-context-menu.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CheckboxFilterComponent,
    JobqueueComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OverlayModule,
    AgContextMenuModule.forRoot({}),
    AgGridModule.withComponents([
      CheckboxFilterComponent,
    ]),
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  entryComponents: [
    // AgContextMenuComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
