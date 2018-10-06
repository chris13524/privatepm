import {Component} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import {Router} from "@angular/router";
import {PrivatepmService} from "../../privatepm.service";

@Component({
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private ppm: PrivatepmService) {
    pageHeaders(title, meta,
      "PrivatePM",
      "A service that encrypts your messages and only allows decryption for the time you specify.");
  }
  
  message = "";
  expiration = 60 * 60 * 24;
  
  submit() {
    // Encrypt the message
    this.ppm.input(this.message, this.expiration).then(encrypted => {
      // Navigate the user to the display page
      this.router.navigate(["d", encrypted], {queryParams: {generated: true}});
    });
  }
}
