import {Meta, Title} from "@angular/platform-browser";

export function pageHeaders(titleService: Title, metaService: Meta, title: string, description: string) {
  titleService.setTitle(title);
  metaService.addTag({name: "description", content: description});
  
  // Facebook
  // https://developers.facebook.com/docs/sharing/webmasters
  metaService.addTag({name: "og:type", content: "website"});
  metaService.addTag({name: "og:title", content: title});
  metaService.addTag({name: "og:description", content: description});
  
  // Twitter
  metaService.addTag({name: "twitter:title", content: title});
  metaService.addTag({name: "twitter:description", content: description});
}
