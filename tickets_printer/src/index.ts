import { io, Socket } from "socket.io-client";

const SERVER_URL = "ws://127.0.0.1:1337";

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
  // TODO
});
