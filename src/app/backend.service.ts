import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Category, Setup, Config, StripeConfig, Order, SyncStatus } from './types';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  setup: Setup;
  sync: SyncStatus;
  syncing: boolean;
  last_call_ok: boolean;
  orders_buffer: Order[];
  last_order: Order;

  constructor(private http: HttpClient) {
    this.sync = SyncStatus.DEFAULT;
    this.syncing = this.last_call_ok = false;
    this.setup = {};
    this.orders_buffer = [];
    this.last_order = {lines: [], total: 0, refund: false};

    var stored = localStorage.getItem("setup");
    if(stored) this.setup = JSON.parse(stored);
    var stored = localStorage.getItem("orders_buffer");
    if(stored) this.orders_buffer = JSON.parse(stored);
    var stored = localStorage.getItem("last_order");
    if(stored) this.last_order = JSON.parse(stored);

    this.update_sync_state();
  }

  httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: `Bearer ${this.setup.backend_key}`
      })
    }
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

  set_setup(setup: Setup) {
    this.setup = setup;
    localStorage.setItem("setup", JSON.stringify(this.setup));
  }

  fetch_config(): Promise<Config> {
    return new Promise((resolve, reject) => {
      if(!this.setup.backend_url) return reject("Backend url missing.");
      this.http.get<Strapi>(`${this.setup.backend_url}/api/stores/${this.setup.store}`, this.httpOptions())
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => resolve(data.data));
    });
  }

  fetch_categories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      if(!this.setup.backend_url) return reject("Backend url missing.");
      this.http.get<Strapi>(`${this.setup.backend_url}/api/categories?filters[store][id][$eq]=${this.setup.store}&populate[]=products&populate[]=products.photo`, this.httpOptions())
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => { this.last_call_ok = true; this.update_sync_state(); resolve(data.data); })
    });
  }

  fetch_stripe_config(): Promise<StripeConfig> {
    return new Promise((resolve, reject) => {
      if(!this.setup.backend_url) return reject("Backend url missing.");
      this.http.get<Strapi>(`${this.setup.backend_url}/api/config`, this.httpOptions())
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => resolve(data.data));
    });
  }

  fetch_stripe_token(): Promise<string> {
    return new Promise((resolve, reject) => {
      if(!this.setup.backend_url) return reject("Backend url missing.");
      this.http.post<Strapi>(`${this.setup.backend_url}/api/config/token`, {}, this.httpOptions())
        .pipe(catchError(err => this.handleError(err)))
        .subscribe((data) => resolve(data.data));
    });
  }

  get_terminal_id(): string {
    return ('000'+(this.setup.terminal || 0).toString()).slice(-3);
  }

  media_url(url: string) {
    return this.setup.backend_url + url;
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
    this.http.post<Strapi>(`${this.setup.backend_url}/api/orders`, data, this.httpOptions())
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

  sync_orders() {
    this.syncing = true;
    this.flush_buffers();
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
