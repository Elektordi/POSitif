import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  error: Howl;
  success: Howl;

  constructor() {
    this.error = new Howl({src: ['/assets/sounds/bip_error.ogg']});
    this.success = new Howl({src: ['/assets/sounds/bip_success.ogg']});
  }

  bip_error() {
    this.error.play();
  }

  bip_success() {
    this.success.play();
  }
}
