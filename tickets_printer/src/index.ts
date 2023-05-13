import { io, Socket } from "socket.io-client";
import { Printer } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";
import got from "got";

import dotenv from "dotenv"
dotenv.config()

const SERVER_URL = process.env.SERVER_URL || "http://127.0.0.1:1337";
const SERVER_KEY = process.env.SERVER_KEY || "invalid";

const got_options = {
	headers: {
		Authorization: `Bearer ${SERVER_KEY}`
	}
};

const device = new USB(0x04b8, 0x0202);
const printer = new Printer(device, { encoding: 'cp858' });


console.log("Connecting...")
const socket: Socket = io(SERVER_URL.replace(/^http/, "ws"));

socket.on("connect", () => {
  console.log("Connected!")
});

socket.on("connect_error", (reason) => {
  console.log("Failed to connect! "+reason)
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected! "+reason)
});

socket.on("ticket:create", (data) => {
  console.log(data);

  got.get(`${SERVER_URL}/api/tickets/${data.id}?populate[]=order&populate[]=order.store&populate[]=order.lines`, got_options).json().then((res: any) => {
    const ticket = res.data;
    const order = ticket.order;
    console.log(order);

    device.open(function(error: any){
      if(error) {
        console.log(error);
      } else {
        printer.setCharacterCodeTable(19);
        printer.font('A');
        printer.style('NORMAL');

        if(order.store.ticket_header) {
          printer.align('CT');
          order.store.ticket_header.split(/\n/).forEach( (l: string) => {
            printer.text(l);
          });
          printer.newLine();
        }

        const datetime = new Date(order.payment_timestamp).toLocaleString();
        const refund = order.refund ? -1 : 1;

        printer.align('LT');
        printer.text(`Ticket #${order.uid}`)
        printer.text(`Date ${datetime}`)
        printer.newLine();
        order.lines.forEach( (l: any) => {
          printer.text(`- ${l.label}  ${l.price*refund}€`);
          if(l.qty > 1) printer.text(`    *${l.qty} = ${l.qty*l.price*refund}€`);
        });
        printer.newLine();
        printer.text(`Total: ${order.total*refund}€`)
        printer.text(`${order.refund?"Refunded":"Paid"} with ${order.payment_method}`)
        if(order.payment_infos) printer.text(`(${order.payment_infos})`)
        printer.newLine();

        if(ticket.contents) {
          ticket.contents.split(/\n/).forEach( (l: string) => {
            printer.text(l);
          });
          printer.newLine();
        }

        if(order.store.ticket_footer) {
          printer.align('CT');
          order.store.ticket_footer.split(/\n/).forEach( (l: string) => {
            printer.text(l);
          });
          printer.newLine();
        }

        printer.cut();
        printer.close();
      }
    });
  }).catch(function(err) {
    console.log(err);
  });
  return;

});

