import { Component } from '@angular/core';
import { BackendService } from './backend.service';
import { SoundService } from './sound.service';
import { Category, Product, Config, Order, SyncStatus } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  modal?: string;
  flash_color?: string;
  config? : Config;
  terminal? : string;
  categories_list? : Category[];
  active_category? : Category;
  order : Order;

  SyncStatus: typeof SyncStatus = SyncStatus; // For enum access

  constructor(public backend: BackendService, public sound: SoundService) {
    this.order = {lines: [], total: 0, refund: false};
  }

  ngAfterViewInit() {
    this.terminal = "001"; // TODO
    this.backend.fetch_config().then(data => this.config = data);
    this.backend.fetch_categories().then(data => {
      // @ts-ignore: y.photo.url raises ts exception
      data.forEach(x => x.products.forEach(y => y.photo = y.photo ? this.backend.media_url(y.photo.url) : undefined));
      console.log(data);
      this.categories_list = data;
      this.select_category(this.categories_list[0])
    });
  }

  select_category(category: Category) {
    this.active_category = category;
  }

  add_cart(product: Product) {
    const l = this.order.lines.find(e => e.product.id == product.id);
    if(l)
      l.qty += 1;
    else
      this.order.lines.push({product: product, qty: 1});
    this.refresh_total();
  }

  sub_cart(product: Product) {
    var l = this.order!.lines.find(e => e.product.id == product.id);
    if(!l) return;
    if(l.qty > 1)
      l.qty -= 1;
    else
      this.order.lines = this.order.lines.filter(e => e.product.id != product.id);
    this.refresh_total();
  }

  refresh_total() {
    this.order.total = this.order.lines.reduce((a, v) => a + v.product.price * v.qty, 0);
  }

  clear_cart() {
    this.order = {lines: [], total: 0, refund: this.order.refund};
  }

  toggle_refund() {
    this.clear_cart();
    this.order.refund = !this.order.refund;
  }

  pay(method: string) {
    if(this.order.lines.length == 0) {
      this.sound.bip_error();
      this.flash('red');
      return;
    }
    this.modal = method;
    this.order.payment_method = method;
  }

  pay_confirm(method: string) {
    this.order.payment_infos = "TODO";
    this.order.payment_timestamp = Date.now();
    this.order.uid = `${this.config?.ref}_${this.terminal}_${this.order.payment_timestamp}`
    this.backend.push_order(this.order);
    
    this.clear_cart();
    this.order.refund = false;
    this.modal = undefined;
    this.sound.bip_success();
    this.flash('green');
  }

  flash(color: string) {
    this.flash_color = color;
    (async () => { 
      await new Promise(f => setTimeout(f, 200));
      this.flash_color = undefined;
    })();
  }
}
