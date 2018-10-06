import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {NotFoundComponent} from "./notFound/notFound.component";
import {HomeComponent} from "./main/home/home.component";
import {MainComponent} from "./main/main.component";
import {DisplayComponent} from "./main/display/display.component";
import {AboutComponent} from "./main/about/about.component";

const routes: Routes = [
  {
    path: "", component: MainComponent, children: [
      {path: "", component: HomeComponent},
      {path: "about", component: AboutComponent},
      {path: "d/:encrypted", component: DisplayComponent}
    ]
  },
  {path: "**", component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    //preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
