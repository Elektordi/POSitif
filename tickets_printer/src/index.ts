import { io, Socket } from "socket.io-client";
import escpos from "escpos";
// @ts-ignore
import USB from "escpos-usb";


const device = new USB(0x04b8, 0x0202);
const printer = new escpos.Printer(device, { encoding: '858' });

const SERVER_URL = process.env.SERVER_URL || "ws://127.0.0.1:1337";

console.log("Connecting...")
const socket: Socket = io(SERVER_URL);

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
  console.log(data)
  const text = data.contents;

  device.open(function(error: any){
    if(error) {
      console.log(error);
    } else {
      printer.font('B');
      printer.style('NORMAL');
      printer.align('LT');
      printer.size(1, 1);
      text.split(/\n/).forEach( (e: string) => {
        printer.text(e);
      });
      printer.newLine();
      printer.cut();
      printer.close();
    }
  });
});

