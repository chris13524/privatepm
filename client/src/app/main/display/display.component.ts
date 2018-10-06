import {Component, OnDestroy, OnInit} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/index";
import {PrivatepmService} from "../../privatepm.service";

@Component({
  templateUrl: "./display.component.html",
  styleUrls: ["./display.component.css"]
})
export class DisplayComponent implements OnInit, OnDestroy {
  constructor(private title: Title,
              private meta: Meta,
              private route: ActivatedRoute,
              private ppm: PrivatepmService,
              private router: Router) {
    title.setTitle("Private PM");
    meta.addTag({name: "robots", content: "noindex"});
  }
  
  private queryParamSubscription: Subscription | null;
  private paramSubscription: Subscription | null;
  
  ngOnInit(): void {
    this.queryParamSubscription = this.route.queryParamMap.subscribe(params => {
      // The `generated` parameter indicates that we just generated it and aren't being linked later on
      let generated = params.get("generated");
      if (generated) {
        // Record that this was generated
        this.generated = true;
        // Remove the parameter in the URL
        this.router.navigate([], {queryParams: {generated: null}, queryParamsHandling: "merge"});
      } else {
        this.paramSubscription = this.route.paramMap.subscribe(params => {
          // Retrieve the encrypted value
          let encrypted = params.get("encrypted");
          if (encrypted == null) throw new Error();
          // Decrypt it
          this.process(encrypted);
        });
      }
    });
    
  }
  
  ngOnDestroy(): void {
    if (this.queryParamSubscription != null) this.queryParamSubscription.unsubscribe();
    if (this.paramSubscription != null) this.paramSubscription.unsubscribe();
  }
  
  generated = false;
  
  model: {
    status: "success" | "pending" | "notFound",
    message: string
  } = {
    status: "pending",
    message: ""
  };
  
  private process(encrypted: string): void {
    this.ppm.output(encrypted).then(result => {
      this.model = {
        status: "success",
        message: result
      };
    }).catch(() => {
      this.model = {
        status: "notFound",
        message: ""
      };
    });
  }
}
