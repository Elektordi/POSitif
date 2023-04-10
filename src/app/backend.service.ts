import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { interval, Subscription, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Category, Product, Config, Order, SyncStatus } from './types';

const BACKEND_URL = "http://localhost:1337";
const BACKEND_KEY = "5605a2d37bd074f0ff90422e44d212f9deb18b7f0af6dd79fc2916151d21da2dfe866ca883a2c4022d6bd3676a017c9f4bf4c7966e1298a66a9567b5e1deead3cdea92e6ce4e75ba0a94bd3b54574a37b29742aac7ac54a2c417e69b71457e7bdba4167fd4cfa4663e0917bd17d64577123ebf1bbbe9472d18ba4aaf77ab9adb";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  sync: SyncStatus;
  syncing: boolean;
  last_call_ok: boolean;
  orders_buffer: Order[];
  last_order: Order;
  timer: Subscription;
  httpOptions: {}

  constructor(private http: HttpClient) {
    this.sync = SyncStatus.DEFAULT;
    this.syncing = this.last_call_ok = false;
    this.orders_buffer = [];
    this.last_order = {lines: [], total: 0, refund: false};
    var stored = localStorage.getItem("orders_buffer");
    if(stored) this.orders_buffer = JSON.parse(stored);
    var stored = localStorage.getItem("last_order");
    if(stored) this.last_order = JSON.parse(stored);
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'Bearer '+BACKEND_KEY
      })
    };
    this.update_sync_state();
    this.timer = interval(10000).subscribe(val => this.sync_now());
  }

  handleError(error: HttpErrorResponse) {
    this.last_call_ok = false;
    this.update_sync_state();

    if(error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  fetch_config(): Promise<Config> {
    return new Promise((resolve, reject) => {
      // TODO: Select store
      this.http.get<Strapi>(`${BACKEND_URL}/api/stores`, this.httpOptions)
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => resolve(data.data[0]));
    });
  }

  fetch_categories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      // TODO: Filter by store
      this.http.get<Strapi>(`${BACKEND_URL}/api/categories?populate[]=products&populate[]=products.photo`, this.httpOptions)
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => { this.last_call_ok = true; this.update_sync_state(); resolve(data.data); })
    });
  }

  media_url(url: string) {
    return BACKEND_URL + url;
  }

  push_order(order: Order) {
    this.last_order = JSON.parse(JSON.stringify(order)); // Deepcopy
    // @ts-ignore: prepare data for backend
    order.lines.forEach(x => x.product = x.product?.id); order.store = 1;
    this.orders_buffer.push(order);
    this.flush_buffers();
  }

  flush_buffers() {
    localStorage.setItem("orders_buffer", JSON.stringify(this.orders_buffer));
    localStorage.setItem("last_order", JSON.stringify(this.last_order));
    this.update_sync_state();
    if(this.orders_buffer.length == 0) return;
    var data = {data: this.orders_buffer[0]};
    this.http.post<Strapi>(`${BACKEND_URL}/api/orders`, data, this.httpOptions)
      .pipe(catchError(err => this.handleError(err)))
      .subscribe((data) => {console.log(data); this.last_call_ok = true; this.orders_buffer.shift(); this.flush_buffers();})
  }
  
  update_sync_state() {
    if(!this.last_call_ok && this.orders_buffer.length > 0) {
      this.sync = SyncStatus.ERROR;
      return
    }
    if(!this.last_call_ok || this.orders_buffer.length > 0) {
      this.sync = SyncStatus.WARNING;
      return
    }
    this.sync = SyncStatus.OK;
  }

  sync_now() {
    this.syncing = true;
    this.flush_buffers();
    // TODO: Update categories from backend
    (async () => { 
      await new Promise(f => setTimeout(f, 1000));
      this.syncing = false;
    })();
    
  }

  get_last_order() : Order {
    return this.last_order;
  }
}

interface Strapi {
  data: any | any[],
  meta?: {
    pagination?: {
      page: number,
      pageSize: number,
      pageCount: number,
      total: number
    }
  },
  error?: {
    status: number,
    name: string,
    message: string,
    details: any
  }
}
