import { Component } from '@angular/core';
import { BackendService } from './backend.service';
import { SoundService } from './sound.service';
import { Category, Product, Config, Order, OrderLine, SyncStatus } from './types';

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
      this.categories_list = data.sort((a,b) => a.display_order - b.display_order);
      this.categories_list.forEach(x => x.products.sort((a,b) => a.display_order - b.display_order));
      this.select_category(this.categories_list[0]);
    });
  }

  select_category(category?: Category) {
    this.active_category = category;
  }

  add_cart(product: Product) {
    const l = this.order.lines.find(e => e.product && e.product.id == product.id);
    if(l)
      l.qty += 1;
    else
      this.order.lines.push({product: product, label: product.name, qty: 1, price: product.price});
    this.refresh_total();
  }

  add_custom(label: string, price: number) {
    if(!label || !price) return;
    this.order.lines.push({label: label, qty: 1, price: price});
    this.refresh_total();
  }

  update_cart(line: OrderLine, update: number) {
    line.qty += update;
    if(line.qty <= 0) {
      this.order.lines = this.order.lines.filter(l => l !== line);
    }
    this.refresh_total();
  }

  refresh_total() {
    this.order.total = this.order.lines.reduce((a, v) => a + v.price * v.qty, 0);
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
