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
      "A simple tool that encrypts a message, but only allows decryption for a period of time.");
  }
}
