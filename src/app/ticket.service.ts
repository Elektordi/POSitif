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
    "cash": $localize`espèces`,
    "card": $localize`carte bancaire`,
    "check": $localize`chèque`,
    "preorder": $localize`pré-commande`,
    "free": $localize`exonération`,
    "manual": $localize`opérateur / manuel`
  };

  constructor() {
    this.encoder = new EscPosEncoder();
  }

  init_printer(config: Config) {
    this.config = config;
    window.app.initPrinter(config.ticket_printer_target);
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
    ticket.line($localize`Ticket n°${order.uid}`);
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
    ticket.line(`${order.refund?"Remboursement":"Paiement"} par ${this.methods[order.payment_method!]}`);
    if(order.payment_infos) ticket.line(`(${order.payment_infos})`);
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

    console.log(JSON.stringify(data));
    window.app.printTicket(data);
    return true;
  }
}
