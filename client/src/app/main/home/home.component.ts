import {Component} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {pageHeaders} from "../../utils";
import * as CryptoJS from "crypto-js";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Component({
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  constructor(private title: Title,
              private meta: Meta,
              private router: Router,
              private http: HttpClient) {
    pageHeaders(title, meta, "PrivatePM", "A service that encrypts your messages and only allows retrieval for the time you specify");
  }
  
  message = "";
  
  submit() {
    let key = this.genKey();
    console.log(key);
    let encrypted = this.encrypt(this.message, key);
    this.store(encrypted, key).then(() => {
        this.router.navigate([encrypted]);
    });
  }
  
  private genKey(): string {
    return CryptoJS.lib.WordArray.random(256).toString();
  }
  
  private encrypt(message: string, key: string): string {
    return CryptoJS.AES.encrypt(message, key)
      .toString()
      .replace(/\//g, "_")
      .replace(/\+/g, ".")
      .replace(/=/g, "-");
  }
  
  private hash(message: string): string {
    return CryptoJS.SHA256(message).toString();
  }
  
  private async store(encrypted: string, key: string): Promise<void> {
    let hash = this.hash(encrypted);
    
    return new Promise<void>(resolve => {
      this.http.put(environment.api + "/" + hash, key, {responseType: "text"})
        .subscribe(() => resolve());
    });
  }
}
