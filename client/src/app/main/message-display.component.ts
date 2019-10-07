import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {ControlContainer, NgForm} from "@angular/forms";
import {CONTENT_TYPE, isImage, sniffType, toUTF8Array} from "../sniff";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: "message-display",
  viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
  template: `
		<textarea class="form-control" id="message" name="message" #textarea
							[(ngModel)]="message" required [readOnly]="readonly"
							*ngIf="contentType.startsWith('text/')"></textarea>
		<img [src]="fileBlobSafe" *ngIf="isImage(contentType)">
		<a [href]="fileBlobSafe" [ngSwitch]="contentType" *ngIf="!isImage(contentType) && !contentType.startsWith('text/')">
			Download
			<ng-container *ngSwitchCase="'application/x-tar'">tar</ng-container>
			<ng-container *ngSwitchCase="'application/x-bzip2'">bzip2</ng-container>
			<ng-container *ngSwitchCase="'application/x-lzip'">Lzip</ng-container>
			<ng-container *ngSwitchCase="'application/zip'">ZIP</ng-container>
			<ng-container *ngSwitchCase="'application/vnd.rar'">RAR</ng-container>
			<ng-container *ngSwitchCase="'application/x-xar'">RAR</ng-container>
			<ng-container *ngSwitchCase="'application/x-7z-compressed'">7z</ng-container>
			<ng-container *ngSwitchCase="'application/gzip'">gzip</ng-container>
			<ng-container *ngSwitchCase="'application/x-xz'">xz</ng-container>
			<ng-container *ngSwitchCase="'application/lz4'">lz4</ng-container>
			<ng-container *ngSwitchCase="'executable/elf'">ELF</ng-container>
			<ng-container *ngSwitchCase="'executable/exe'">EXE</ng-container>
			<ng-container *ngSwitchCase="'application/pdf'">PDF</ng-container>
			<ng-container *ngSwitchCase="'audio/mpeg'">MP3</ng-container>
			<ng-container *ngSwitchCase="'audio/flac'">FLAC</ng-container>
			<ng-container *ngSwitchCase="'audio/midi'">MIDI</ng-container>
			<ng-container *ngSwitchCase="'video/ogg'">OGG</ng-container>
			<ng-container *ngSwitchCase="'video/webm'">WebM</ng-container>
			<ng-container *ngSwitchCase="'video/mp4'">MP4</ng-container>
			<ng-container *ngSwitchCase="'iso'">ISO</ng-container>
			<ng-container *ngSwitchCase="'application/x-apple-diskimage'">Apple Disk Image</ng-container>
			<ng-container *ngSwitchCase="'font/woff'">WOFF</ng-container>
			<ng-container *ngSwitchCase="'font/woff2'">WOFF2</ng-container>
			<ng-container *ngSwitchDefault>File</ng-container>
		</a>
  `,
  styles: [`
      textarea {
          min-height: 10rem;
          max-height: 50rem;
      }
      
      textarea[readonly] {
          background-color: white;
          resize: none;
      }
  `]
})
export class MessageDisplayComponent implements OnInit {
  isImage = isImage;
  
  constructor(private sanitizer: DomSanitizer) {
  }
  
  ngOnInit(): void {
    setTimeout(() => this.updateHeight());
  }
  
  @ViewChild("textarea")
  textarea: ElementRef<HTMLTextAreaElement>;
  updateHeight(): void {
    if (this.textarea == null) return;
    const element = this.textarea.nativeElement;
    element.style.height = "5px";
    element.style.height = element.scrollHeight + 2 + "px";
  }
  
  @Input()
  public get message() {
    return this.messageValue;
  }
  
  public set message(message: string) {
    this.messageValue = message;
    this.messageChange.emit(this.messageValue);
    
    this.contentType = sniffType(message);
    
    if (this.fileBlob != null) URL.revokeObjectURL(this.fileBlob);
    this.fileBlob = URL.createObjectURL(new Blob([toUTF8Array(message)], {type: this.contentType}));
    this.fileBlobSafe = this.sanitizer.bypassSecurityTrustUrl(this.fileBlob);
    
    this.updateHeight();
  }
  
  public messageValue: string;
  
  @Output()
  public messageChange = new EventEmitter();
  
  @Input()
  readonly = false;
  
  contentType: CONTENT_TYPE;
  
  fileBlob: string;
  fileBlobSafe: SafeUrl;
}
