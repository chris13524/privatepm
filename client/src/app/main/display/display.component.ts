import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Meta, Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/index";
import {PrivatepmService} from "../../privatepm.service";
import {faCopy, faShareAlt} from "@fortawesome/free-solid-svg-icons";

@Component({
  templateUrl: "./display.component.html",
  styleUrls: ["./display.component.css"]
})
export class DisplayComponent implements OnInit, OnDestroy {
  faCopy = faCopy;
  faShareAlt = faShareAlt;
  
  constructor(private title: Title,
              private meta: Meta,
              private route: ActivatedRoute,
              private ppm: PrivatepmService,
              private router: Router) {
    title.setTitle("PrivatePM");
    meta.addTag({name: "robots", content: "noindex"});
  }
  
  private queryParamSubscription: Subscription | null;
  private fragmentSubscription: Subscription | null;
  
  ngOnInit(): void {
    this.sharingAvailable = "share" in navigator;
    
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      this.encrypted = fragment;
      this.queryParamSubscription = this.route.queryParamMap.subscribe(params => {
        this.address = window.location.href;
        // The `generated` parameter indicates that we just generated it and aren't being linked later on
        let generated = params.get("generated");
        if (generated) {
          // Record that this was generated
          this.generated = true;
          // Remove the parameter in the URL
          this.router.navigate([], {
            fragment: fragment,
            queryParams: {generated: null},
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        } else {
          // Decrypt the fragment
          this.process(fragment);
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    if (this.queryParamSubscription != null) this.queryParamSubscription.unsubscribe();
    if (this.fragmentSubscription != null) this.fragmentSubscription.unsubscribe();
    if (this.timeout != null) clearTimeout(this.timeout);
  }
  
  generated = false;
  address = "";
  @ViewChild("copyArea") copyArea: ElementRef;
  
  encrypted = "";
  
  model: {
    status: "success" | "pending" | "notFound",
    message: string,
    expiration: number
  } = {
    status: "pending",
    message: "",
    expiration: 0
  };
  
  sharingAvailable = false;
  
  timeout: number;
  
  private process(encrypted: string): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.ppm.output(encrypted).then(result => {
      this.model = {
        status: "success",
        message: result.message,
        expiration: Date.now() / 1000 + result.expiration
      };
      this.timeout = setTimeout(() => {
        this.model = {
          status: "notFound",
          message: "",
          expiration: 0,
        };
        this.generated = false;
      }, result.expiration * 1000);
    }).catch(() => {
      this.model = {
        status: "notFound",
        message: "",
        expiration: 0
      };
    });
  }
  
  copyAddress(): void {
    if (this.sharingAvailable) {
      (<any>navigator).share({
        //title: null,
        //text: null,
        url: this.address,
      }).catch(() => alert("Failed to share."));
    } else {
      const copyTextarea = this.copyArea.nativeElement;
      copyTextarea.focus();
      copyTextarea.select();
      
      try {
        if (!document.execCommand("copy")) {
          alert("Failed to copy.");
        }
      } catch (err) {
        alert("Failed to copy.");
      }
    }
  }
  
  destroy(): void {
    this.ppm.destroy(this.encrypted)
      .then(() => this.router.navigate(["/"]))
      .catch(() => this.router.navigate(["/"]));
  }
}
