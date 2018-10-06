import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "time"})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 60) {
      return value + " second" + (value > 1 ? "s" : "");
    } else if (value < 60 * 60) {
      let val = Math.round(value / 60);
      return val + " minute" + (val > 1 ? "s" : "");
    } else if (value < 60 * 60 * 24) {
      let val = Math.round(value / 60 / 60);
      return val + " hour" + (val > 1 ? "s" : "");
    } else {
      let val = Math.round(value / 60 / 60 / 24);
      return val + " day" + (val > 1 ? "s" : "");
    }
  }
}
