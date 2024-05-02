import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { BackendService } from './backend.service';
import { SoundService } from './sound.service';
import { TicketService } from './ticket.service';
import { Category, Product, Config, Order, OrderLine, SyncStatus, Preorder } from './types';
import { KeypadComponent } from './keypad/keypad.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  update_sub?: Subscription;
  terminal_sub?: Subscription;
  crash?: string;
  modal?: string;
  flash_color?: string;
  config?: Config;
  terminal?: string;
  categories_list?: Category[];
  active_category?: Category;
  order: Order;
  last_order?: Order;
  order_history?: Order[];
  pay_error?: string;
  card_ready: boolean = false;
  preorders?: Preorder[];

  @ViewChild('keypad')
  view_keypad!: KeypadComponent;
  @ViewChild('details')
  view_details!: ElementRef<HTMLInputElement>;

  SyncStatus: typeof SyncStatus = SyncStatus; // For enum access

  constructor(public backend: BackendService, public sound: SoundService, public ticket: TicketService, public zone: NgZone) {
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
      this.crash = $localize`Missing POSitif config!`;
      return;
    }
    this.backend.fetch_config().then(data => {
      this.config = data;
      this.pos_init();
    }, err => alert(err));
    this.update_sub = interval(60000).subscribe(_ => {
      this.sync_now();
    });
    if(window.app) {
      this.terminal_sub = interval(1000).subscribe(_ => {
        this.card_ready = window.app.isStripeReady()
      });
    }
  }

  ngOnDestroy() {
    this.update_sub?.unsubscribe();
    this.terminal_sub?.unsubscribe();
  }

  sync_now() {
    this.backend.sync_orders();
    this.backend.fetch_categories().then(data => {
      this.categories_list = data.sort((a,b) => a.display_order - b.display_order);
      this.categories_list.forEach(x => x.products.sort((a,b) => a.display_order - b.display_order));
      if(!this.active_category) this.select_category(this.categories_list[0]);
    })
    this.backend.fetch_preorders().then(data => {
      this.preorders = data;
    })
  }

  pos_init() {
    this.terminal = this.backend.get_terminal_id();
    this.sync_now();
    this.ticket.init_printer(this.config!);
    this.terminal_init();
  }

  terminal_init() {
    if(window.app) {
      window.stripe_get_token = () => {
        this.backend.fetch_stripe_token().then(r => window.app.pushToken(r)).catch(e => { alert(e); window.app.pushToken("ERROR"); });
      }
      this.backend.fetch_stripe_config().then(data => window.app.initStripe(data.stripe_location, "stripe_get_token"));
    }
  }

  terminal_toggle() {
    if(!this.card_ready) {
      this.terminal_init();
    } else {
      window.app.stopStripe();
    }
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
    if(label?.match(/^\//)) {
      if(label == "/dump") {
        alert(JSON.stringify(this.backend.orders_buffer));
      } else if(label == "/shift") {
        this.backend.orders_buffer.shift();
        alert("OK");
      } else if(label == "/flush") {
        this.backend.flush_buffers();
        alert("OK");
      } else if(label == "/resetinstall") {
        this.backend.set_setup({});
        alert("OK");
      } else {
        alert("Unknown debug command!");
      }
      return;
    }
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
    if(this.order.total == 0 && method != 'free') {
      this.sound.bip_error();
      this.flash('red');
      return;
    }
    if(method=="card" && !this.card_ready) {
      this.modal = "error";
      this.pay_error = $localize`Terminal not avaliable!`;
      return;
    }
    this.order.payment_method = method;
    this.order.uid = `${this.config?.ref}_${this.terminal}_${Date.now()}`
    this.pay_error = undefined;
    this.modal = method;
    if(method == "free" && this.order.total == 0) {
      this.pay_confirm(method);
    }
    if(method == "card") {
      if(this.order.total >= 5) {
        window.stripe_payment_callback = (uid, success, data) => {
          this.zone.run(() => {
            if(this.order.uid != uid || !this.modal) return;
            if(success) {
              this.order.payment_infos = data;
              this.pay_confirm("card");
            } else {
              this.pay_error = data;
              this.sound.bip_error();
              this.flash('red');
            }
          });
        }
        window.app.startPayment(Math.trunc(this.order.total*100), this.order.uid, "stripe_payment_callback")
      } else {
        this.pay_error = $localize`Cannot pay by card if total is less than 5€!`;
      }
    }
    if(method == "preorder") {
        window.scan_qrcode_callback = (data) => {
          this.zone.run(() => {
            if(data) {
              const now = new Date().toISOString();
              const preorder = this.preorders?.find(p => p.uid == data && (!p.period_start || p.period_start <= now) && (!p.period_end || p.period_end >= now));
              if(preorder) {
                if(preorder.used + this.order.total <= preorder.max) {
                  this.order.payment_infos = data;
                  preorder.used += this.order.total;
                  this.pay_confirm("preorder");
                  this.backend.update_preorder_used(preorder, preorder.used);
                } else {
                  this.sound.bip_error();
                  this.flash('red');
                  this.pay_error = $localize`Not enough money on preorder for ${this.order.total}€ order. (${preorder.max}€ paid, ${preorder.used}€ used, ${preorder.max-preorder.used}€ remains)`;
                  return;
                }
              } else {
                this.sound.bip_error();
                this.flash('red');
                if(this.preorders?.find(p => p.uid == data)) {
                  this.pay_error = $localize`Preorder not valid for this period!`;
                } else {
                  this.pay_error = $localize`Preorder not found!`;
                }
                return;
              }
            } else {
              this.modal = undefined;
            }
          });
        }
        if(window.app) {
          window.app.scanQrCode("scan_qrcode_callback")
        } else {
          window.scan_qrcode_callback(prompt($localize`No integrated scanner, please enter preorder uid:`) || "")
        }
    }
  }

  pay_confirm(method: string) {
    if(method == "cash") {
      if(this.view_keypad.value < this.order.total) {
        this.sound.bip_error();
        this.flash('red');
        this.pay_error = $localize`Not enough cash for payment!`;
        return;
      }
      this.order.payment_infos = `${this.view_keypad.value}€ - ${this.order.total}€ = ${this.view_keypad.value - this.order.total}€`;
    } else if(method == "check" || method == "manual") {
      if(!this.view_details.nativeElement.value) {
        this.sound.bip_error();
        this.flash('red');
        this.pay_error = $localize`Missing reference!`;
        return;
      }
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

  print_order(order: Order) {
    if(this.ticket.print_order_ticket(order)) {
      this.flash('green');
    }
  }

  load_order_history() {
    this.backend.fetch_orders_history().then(data => this.order_history = data);
  }

}


declare global {
  interface Window {
    app: StripeWebViewApp;
    stripe_get_token(): void;
    stripe_payment_callback(uid: string, success: boolean, data: string): void;
    scan_qrcode_callback(data: string): void;
  }

  interface StripeWebViewApp {
    makeToast(message: string, long: boolean): void;
    initStripe(location: string, token_js_function: string): boolean;
    stopStripe(): boolean;
    isStripeReady(): boolean;
    pushToken(token: string): void;
    startPayment(amount: number, uid: string, callback_js_function: string): void;
    cancelPayment(): void;
    scanQrCode(callback_js_function: string): void;
    initPrinter(target: string): void;
    printTicket(ticket: Uint8Array): void;
  }
}
