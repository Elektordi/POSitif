import { Injectable } from '@angular/core';
import { Config, Order } from './types';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  config?: Config;

  methods: any = {
    "cash": $localize`espèces`,
    "card": $localize`carte bancaire`,
    "check": $localize`chèque`,
    "preorder": $localize`pré-commande`,
    "free": $localize`exonération`,
    "manual": $localize`opérateur (manuel)`
  };

  constructor() { }

  init_printer(config: Config) {
    this.config = config;
    window.app.initPrinter(config.ticket_printer_target);
  }

  print_order_ticket(order: Order): boolean {
    const datetime = new Date(order.payment_timestamp!).toLocaleString();
    const refund = order.refund ? -1 : 1;

    var ticket = "\x1bt\x00";  // Select font C
    ticket += this.config!.ticket_header;
    ticket += "\n\n";
    ticket += $localize`Ticket #${order.uid}\n`;
    ticket += $localize`Date ${datetime}\n`;
    order.lines.forEach( (l: any) => {
      ticket += `- ${l.label}  ${l.price*refund}€\n`;
      if(l.qty > 1) ticket += `    *${l.qty} = ${l.qty*l.price*refund}€\n`;
    });
    ticket += $localize`Total: ${order.total*refund}€\n`;
    ticket += `${order.refund?"Remboursement":"Paiement"} par ${this.methods[order.payment_method!]}\n`;
    if(order.payment_infos) ticket += `(${order.payment_infos})\n`
    ticket += "\n";
    ticket += this.config!.ticket_footer;
    ticket += "\n\x1bd\x06\x1dV\x00";  // Print and feed 6 lines, Select Cut Mode and Cut Paper
    console.log(JSON.stringify(ticket));
    window.app.printTicket(ticket);
    return true;
  }
}
