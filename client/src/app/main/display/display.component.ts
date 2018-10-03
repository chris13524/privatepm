import {Component, OnDestroy, OnInit} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import * as CryptoJS from "crypto-js";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/index";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Component({
  templateUrl: "./display.component.html"
})
export class DisplayComponent implements OnInit, OnDestroy {
  constructor(private title: Title,
              private meta: Meta,
              private route: ActivatedRoute,
              private http: HttpClient) {
    title.setTitle("Private PM");
    meta.addTag({name: "robots", content: "noindex"});
  }
  
  private subscription: Subscription;
  
  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe(params => {
      let encrypted = params.get("encrypted");
      if (encrypted == null) throw new Error();
      this.process(encrypted);
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  message = "";
  
  private hash(message: string): string {
    return CryptoJS.SHA256(message).toString();
  }
  
  private process(encrypted: string): void {
    let hash = this.hash(encrypted);
    this.http.get<string>(environment.api + "/" + hash, {responseType: <any>"text"})
      .subscribe(key => {
        this.message = CryptoJS.AES.decrypt(encrypted
          .replace(/_/g, "/")
          .replace(/\./g, "+")
          .replace(/-/g, "="), key).toString(CryptoJS.enc.Utf8);
      }, error => {
        this.message = "Sorry, that message was not found.";
      });
  }
}
