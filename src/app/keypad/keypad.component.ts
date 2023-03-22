import { Component } from '@angular/core';

@Component({
  selector: 'app-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.less']
})
export class KeypadComponent {
  public value: number = 0;

  key(k: number) {
    this.value = this.value*10 + k;
  }

  del() {
    this.value = Math.floor(this.value/10);
  }
}
