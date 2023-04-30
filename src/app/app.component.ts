import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { BackendService } from './backend.service';
import { SoundService } from './sound.service';
import { Category, Product, Config, Order, OrderLine, SyncStatus } from './types';
import { KeypadComponent } from './keypad/keypad.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  crash?: string;
  modal?: string;
  flash_color?: string;
  config?: Config;
  terminal?: string;
  categories_list?: Category[];
  active_category?: Category;
  order: Order;
  last_order?: Order;

  @ViewChild('keypad')
  view_keypad!: KeypadComponent;
  @ViewChild('details')
  view_details!: ElementRef<HTMLInputElement>;

  SyncStatus: typeof SyncStatus = SyncStatus; // For enum access

  constructor(public backend: BackendService, public sound: SoundService, public zone: NgZone) {
    this.order = {lines: [], total: 0, refund: false};
  }

  ngAfterViewInit() {
    const query = window.document.location.search;
    if(query && query.startsWith("?setup&")) {
        const params = new URLSearchParams(query) as any;
        this.backend.set_setup({
            backend_url: params.get("backend"),
            backend_key: params.get("key"),
            store: parseInt(params.get("store")),
            terminal: parseInt(params.get("terminal")),
        });
    }

    if(!this.backend.setup.backend_url) {
      this.crash = "Missing POSitif config!";
      return;
    }
    this.pos_init();
  }

  pos_init() {
    this.backend.fetch_config().then(data => this.config = data, err => alert(err));
    this.terminal = this.backend.get_terminal_id();
    this.backend.fetch_categories().then(data => {
      this.categories_list = data.sort((a,b) => a.display_order - b.display_order);
      this.categories_list.forEach(x => x.products.sort((a,b) => a.display_order - b.display_order));
      this.select_category(this.categories_list[0]);
    });

    window.stripe_get_token = () => {
      this.backend.fetch_stripe_token().then(r => window.app.pushToken(r)).catch(e => { alert(e); window.app.pushToken("ERROR"); });
    }
    this.backend.fetch_stripe_config().then(data => window.app.initStripe(data.stripe_location, "stripe_get_token"));
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
    this.order.payment_method = method;
    this.order.uid = `${this.config?.ref}_${this.terminal}_${Date.now()}`
    this.modal = method;
    if(method == "free" && this.order.total == 0) {
      this.pay_confirm(method);
    }
    if(method == "card" && this.order.total >= 5) {
      window.stripe_payment_callback = (uid, success, data) => {
        this.zone.run(() => {
          if(this.order.uid != uid) return;
          if(success) {
            this.order.payment_infos = data;
            this.pay_confirm("card");
          } else {
            this.sound.bip_error();
            this.flash('red');
          }
        });
      }
      window.app.startPayment(Math.trunc(this.order.total*100), this.order.uid, "stripe_payment_callback")
    }
  }

  pay_confirm(method: string) {
    if(method == "cash") {
      if(this.view_keypad.value < this.order.total) {
        this.sound.bip_error();
        this.flash('red');
        return;
      }
      this.order.payment_infos = `${this.view_keypad.value}€ - ${this.order.total}€ = ${this.view_keypad.value - this.order.total}€`;
    } else if(method == "check" || method == "manual") {
      this.order.payment_infos = this.view_details.nativeElement.value;
    }
    this.order.payment_timestamp = Date.now();
    this.backend.push_order(this.order);
    
    this.clear_cart();
    this.order.refund = false;
    this.modal = undefined;
    this.sound.bip_success();
    this.flash('green');
  }

  pay_cancel(method: string) {
    if(method == "card") {
      window.app.cancelPayment();
    }
    this.modal = undefined;
  }

  flash(color: string) {
    this.flash_color = color;
    (async () => { 
      await new Promise(f => setTimeout(f, 200));
      this.flash_color = undefined;
    })();
  }

  show_last_order() {
    this.last_order = this.backend.get_last_order();
  }

}


declare global {
  interface Window {
    app: StripeWebViewApp;
    stripe_get_token(): void;
    stripe_payment_callback(uid: string, success: boolean, data: string): void;
  }

  interface StripeWebViewApp {
    makeToast(message: string, long: boolean): void;
    initStripe(location: string, token_js_function: string): void;
    pushToken(token: string): void;
    startPayment(amount: number, uid: string, callback_js_function: string): void;
    cancelPayment(): void;
    scanQrCode(callback_js_function: string): void;
  }
}