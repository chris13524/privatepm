import {OnDestroy, Pipe, PipeTransform} from "@angular/core";
import {Observable, Subject} from "rxjs";

export const SECOND = 1;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

@Pipe({name: "time"})
export class TimePipe implements PipeTransform, OnDestroy {
  ngOnDestroy(): void {
    if (this.timeout != null) clearTimeout(this.timeout);
  }
  
  timeout: number;
  
  transform(value: number): Observable<string> {
    const subject = new Subject<string>();
    this.timeout = setTimeout(() => this.live(subject, value));
    return subject;
  }
  
  private live(obs: Subject<string>, value: number): void {
    const ttl = value - Date.now() / 1000;
    obs.next(format(ttl));
    
    const delay = next(ttl);
    
    this.timeout = <number><any>setTimeout(() => this.live(obs, value), delay * 1000);
  }
}

function mod(a, n) {
  return ((a % n) + n) % n;
}

export function format(value: number): string {
  const [c, unit] = count(value);
  
  let time = c + " " + unit;
  
  if (c != 1) {
    time += "s";
  }
  
  let text;
  if (value < 0) {
    text = time + " ago";
  } else {
    text = "in " + time;
  }
  
  return text;
}

function count(ttl: number): [number, string] {
  const abs = Math.abs(ttl);
  let func;
  if (ttl >= 0) {
    func = Math.ceil;
  } else {
    func = Math.floor;
  }
  
  if (abs <= MINUTE) {
    return [func(abs / SECOND), "second"];
  } else if (abs <= HOUR) {
    return [func(abs / MINUTE), "minute"];
  } else if (abs <= DAY) {
    return [func(abs / HOUR), "hour"];
  } else {
    return [func(abs / DAY), "day"];
  }
}

export function next(ttl: number): number {
  const abs = Math.abs(ttl);
  
  let next;
  if (abs <= MINUTE) {
    next = mod(ttl, SECOND) || SECOND;
  } else if (abs <= HOUR) {
    next = mod(ttl, MINUTE) || MINUTE;
  } else if (abs <= DAY) {
    next = mod(ttl, HOUR) || HOUR;
  } else {
    next = mod(ttl, DAY) || DAY;
  }
  return next;
}
