import { Component } from '@angular/core';

@Component({
  selector: 'app-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.less']
})
export class KeypadComponent {
  public value: number = 0;
  buffer: string = "0";

  key(k: string) {
    if(this.buffer.length == 9) return;
    if(this.buffer.includes(".")) {
      if(k==".") return;
      if(this.buffer.length - this.buffer.indexOf(".") > 2) return;
    }
    this.buffer += k;
    this.update();
  }

  del() {
    this.buffer = this.buffer.substring(0, this.buffer.length-1);
    this.update();
  }

  update() {
    while(this.buffer.startsWith("0")) this.buffer = this.buffer.substring(1);
    if(this.buffer.startsWith(".")) this.buffer = "0"+this.buffer;
    if(this.buffer == "") this.buffer = "0";
    this.value = parseFloat(this.buffer);
  }
}