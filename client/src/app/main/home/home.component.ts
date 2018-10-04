import {Component} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import {Router} from "@angular/router";
import {PrivatepmService} from "../../privatepm.service";

@Component({
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private ppm: PrivatepmService) {
    pageHeaders(title, meta, "PrivatePM", "A service that encrypts your messages and only allows retrieval for the time you specify");
  }
  
  message = "";
  
  submit() {
    this.ppm.input(this.message).then(encrypted => {
      this.router.navigate([encrypted]);
    });
  }
}
