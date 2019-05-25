import {Component, OnInit} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import {ActivatedRoute, Router} from "@angular/router";
import {PrivatepmService} from "../../privatepm.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Component({
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private route: ActivatedRoute,
              private ppm: PrivatepmService,
              private http: HttpClient) {
    pageHeaders(title, meta,
      "PrivatePM",
      "A simple tool that encrypts a message, but only allows decryption for a period of time.");
  }
  
  ngOnInit(): void {
    this.http.get(environment.api + "/serverSide").toPromise()
      .then(() => this.supportsServerSide = true)
      .catch(() => this.supportsServerSide = false);
    
    this.route.queryParamMap.subscribe(params => {
      if (params.get("title")) {
        if (this.message != "") this.message += "\n";
        this.message += params.get("title");
      }
      if (params.get("text")) {
        if (this.message != "") this.message += "\n";
        this.message += params.get("text");
      }
      if (params.get("url")) {
        if (this.message != "") this.message += "\n";
        this.message += params.get("url");
      }
    });
  }
  
  message = "";
  supportsServerSide = false;
  serverSide = false;
  expiration = 60 * 60 * 24;
  
  submit() {
    // Encrypt the message
    this.ppm.input(this.message, this.expiration, this.serverSide).then(encrypted => {
      // Navigate the user to the display page
      this.router.navigate(["d"], {fragment: encrypted, queryParams: {generated: true}});
    });
  }
}
