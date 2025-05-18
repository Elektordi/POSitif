import { Injectable } from '@angular/core';
import { Config, Order } from './types';
import EscPosEncoder from 'esc-pos-encoder';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  config?: Config;
  encoder: EscPosEncoder;

  methods: any = {
    "cash": $localize`cash`,
    "card": $localize`card`,
    "check": $localize`check`,
    "preorder": $localize`preorder`,
    "free": $localize`exoneration`,
    "manual": $localize`operator / manual`
  };

  constructor() {
    this.encoder = new EscPosEncoder();
  }

  init_printer(config: Config) {
    this.config = config;
    console.log("initPrinter:", JSON.stringify(config.ticket_printer_target));
    if(window.app) {
      window.app.initPrinter(config.ticket_printer_target);
    }
  }

  print_order_ticket(order: Order): boolean {
    const datetime = new Date(order.payment_timestamp!).toLocaleString();
    const refund = order.refund ? -1 : 1;

    var ticket = this.encoder.initialize();
    ticket.raw([ 0x1c, 0x2e ]); // Disable chinese characters on some printers
    ticket.codepage('cp858');
    ticket.align('center');
    ticket.width(2).height(2);
    ticket.line(this.config!.title);
    ticket.width(1).height(1);
    ticket.line(this.config!.ticket_header);
    ticket.align('left');
    ticket.newline();
    ticket.line($localize`Date ${datetime}`);
    ticket.size('small');
    ticket.line($localize`Ticket #${order.uid}`);
    ticket.size('normal');
    ticket.newline();
    order.lines.forEach( (l: any) => {
      ticket.line(`- ${l.label}  ${l.price*refund}€`);
      if(l.qty > 1) ticket.line(`    *${l.qty} = ${l.qty*l.price*refund}€`);
    });
    ticket.newline();
    ticket.line($localize`Total: ${order.total*refund}€`);
    ticket.newline();
    ticket.size('small');
    if(order.refund)
        ticket.line($localize`Refund by ${this.methods[order.payment_method!]}`);
    else
        ticket.line($localize`Paid by ${this.methods[order.payment_method!]}`);
    if(order.payment_infos)
        ticket.line(`(${order.payment_infos})`);
    ticket.size('normal');
    ticket.newline();
    ticket.align('center');
    ticket.line(this.config!.ticket_footer);
    ticket.newline();
    ticket.newline();
    ticket.newline();
    ticket.newline();
    ticket.cut();

    var data = ticket.encode();

    console.log("printTicket:", data);
    if(window.app && this.config!.ticket_printer_target) {
      window.app.printTicket(data);
    } else {
      alert($localize`No printer detected. Ticket output will be in browser console.`);
      var fakedata = new TextDecoder().decode(data);
      console.log("Decoded data:", fakedata);
    }
    return true;
  }
}
