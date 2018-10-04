import {Component, OnDestroy, OnInit} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/index";
import {PrivatepmService} from "../../privatepm.service";

@Component({
  templateUrl: "./display.component.html"
})
export class DisplayComponent implements OnInit, OnDestroy {
  constructor(private title: Title,
              private meta: Meta,
              private route: ActivatedRoute,
              private ppm: PrivatepmService) {
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
  
  private process(encrypted: string): void {
    this.ppm.output(encrypted).then(result => {
      this.message = result;
    }).catch(() => {
      this.message = "Sorry, that message was not found.";
    });
  }
}
