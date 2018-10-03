import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app.routes";
import {NotFoundComponent} from "./notFound/notFound.component";
import {HomeComponent} from "./main/home/home.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {MainComponent} from "./main/main.component";
import {FormsModule} from "@angular/forms";
import {DisplayComponent} from "./main/display/display.component";
import {HttpModule} from "@angular/http";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HomeComponent,
    DisplayComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'albright-lions'}),
    CommonModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
