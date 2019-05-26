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
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {PrivatepmService} from "./privatepm.service";
import {AboutComponent} from "./main/about/about.component";
import {TimePipe} from "./time.pipe";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {MessageDisplayComponent} from "./main/message-display.component";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HomeComponent,
    DisplayComponent,
    AboutComponent,
    NotFoundComponent,
    TimePipe,
    MessageDisplayComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'albright-lions'}),
    CommonModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule
  ],
  providers: [PrivatepmService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
