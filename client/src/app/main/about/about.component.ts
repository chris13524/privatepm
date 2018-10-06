import {Component} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import {Router} from "@angular/router";
import {PrivatepmService} from "../../privatepm.service";

@Component({
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"]
})
export class AboutComponent {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private ppm: PrivatepmService) {
    pageHeaders(title, meta,
      "About | PrivatePM",
      "A service that encrypts your messages and only allows decryption for the time you specify.");
  }
}
