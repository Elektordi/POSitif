import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Category, Product, Config, Order, SyncStatus } from './types';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  sync: SyncStatus;
  syncing: boolean;
  last_downlink_ok: boolean;
  last_uplink_ok: boolean;
  orders_buffer: Order[];
  timer: Subscription;

  constructor() {
    this.sync = SyncStatus.DEFAULT;
    this.syncing = this.last_downlink_ok = this.last_uplink_ok = false;
    this.orders_buffer = [];
    const stored = localStorage.getItem("orders_buffer");
    if(stored) this.orders_buffer = JSON.parse(stored);
    this.update_sync_state();
    this.timer = interval(10000).subscribe(val => this.sync_now());
  }

  fetch_config(): Config {
    return {title: "Sample snack bar", store_id: "test", terminal_id: "042", api_key: "testapikey"};
  }

  list_categories(): Category[] {
    return [
      {id: 1, name: "Misc."},
      {id: 2, name: "Cold Drinks"},
      {id: 3, name: "Hot Drinks"},
    ];
  }

  list_products(cat: Category): Product[] {
    if(cat.id == 1) return [
      {id: 1, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 2, name: "Cup (return)", desc: "Max 3 per person.", price: -1, photo: "/assets/products/cup-return.jpg"},
    ];
    if(cat.id == 2) return [
      {id: 1, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 20, name: "Blond Beer", desc: "Belgian beer, 8%", price: 3, photo: "/assets/products/beer.jpg"},
      {id: 21, name: "White Beer", desc: "Belgian beer, 7%", price: 3, photo: "/assets/products/beerwhite.jpg"},
    ];
    if(cat.id == 3) return [
      {id: 1, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 30, name: "Coffee", desc: "15cl", price: 0.5, photo: "/assets/products/coffee.jpg"},
      {id: 31, name: "Tea", desc: "30cl\nBlack or Green tea", price: 0.5, photo: "/assets/products/tea.jpg"},
    ];
    return [];
  }

  push_order(order: Order) {
    this.orders_buffer.push(order);
    this.flush_buffers();
  }

  flush_buffers() {
    localStorage.setItem("orders_buffer", JSON.stringify(this.orders_buffer));
    this.update_sync_state();
  }
  
  update_sync_state() {
    if(!this.last_downlink_ok || !this.last_uplink_ok) {
      this.sync = SyncStatus.ERROR;
      return
    }
    if(this.orders_buffer.length == 0) this.sync = SyncStatus.OK;
    else this.sync = SyncStatus.WARNING;
  }

  sync_now() {
    this.syncing = true;
    this.flush_buffers();
    (async () => { 
      await new Promise(f => setTimeout(f, 1000));
      this.syncing = false;
    })();
    
  }
}
