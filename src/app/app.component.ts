import { Component } from '@angular/core';
import { BackendService } from './backend.service';
import { Category, Product, Config, Order, SyncStatus } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  unlocked: boolean;
  sync: SyncStatus;
  config? : Config;
  categories_list? : Category[];
  active_category? : Category;
  products_list? : Product[];
  order : Order;

  SyncStatus: typeof SyncStatus = SyncStatus; // For enum access

  constructor(private backend: BackendService) {
    this.order = {lines: [], total: 0};
    this.unlocked = true; // TODO
    this.sync = SyncStatus.OK; // TODO
  }

  ngAfterViewInit() {
    this.config = this.backend.fetch_config();
    this.categories_list = this.backend.list_categories();
    if (this.categories_list) this.select_category(this.categories_list[0]);
  }

  sync_now() {
    alert("Sync! (TODO)");
  }

  select_category(category: Category) {
    this.active_category = category;
    this.products_list = this.backend.list_products(category);
  }

  add_cart(product: Product) {
    const l = this.order.lines.find(e => e.product == product);
    if(l)
      l.qty += 1;
    else
      this.order.lines.push({product: product, qty: 1});
    this.refresh_total();
  }

  sub_cart(product: Product) {
    var l = this.order!.lines.find(e => e.product == product);
    if(!l) return;
    if(l.qty > 1)
      l.qty -= 1;
    else
      this.order.lines = this.order.lines.filter(e => e.product != product);
    this.refresh_total();
  }

  refresh_total() {
    this.order.total = this.order.lines.reduce((a, v) => a + v.product.price * v.qty, 0);
  }

  clear_cart() {
    this.order = {lines: [], total: 0};
  }

  lock_pos() {
    this.unlocked = false;
  }

  unlock_pos() {
    this.unlocked = true;
  }

  pay(method: string) {
    alert("Pay! (TODO)");
  }
}
