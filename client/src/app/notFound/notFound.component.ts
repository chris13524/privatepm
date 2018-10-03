import {Component} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";

@Component({
	templateUrl: "./notFound.component.html"
})
export class NotFoundComponent {
  constructor(private title: Title, private meta: Meta) {
    title.setTitle("Page Not Found");
    meta.addTag({name: "robots", content: "noindex"});
  }
}
