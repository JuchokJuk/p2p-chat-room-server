import type { Room } from "../Room.ts";
import { send } from "../send.ts";

export function chat(room: Room, socket: WebSocket) {
  const UUID = crypto.randomUUID();

  let timeoutId: number;

  socket.addEventListener("open", () => {
    send(socket, {
      action: "init user",
      payload: UUID,
    });
    room.saveUser(UUID, socket);

    timeoutId = setTimeout(socket.close, 10000);
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.action === "heartbeat") {
      console.log("heartbeat");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(socket.close, 10000);
    } else if (message.action === "set peer for existing user") {
      room.setPeerForExistingUser(UUID, socket, message.payload);
    } else if (message.action === "set peer for new user") {
      room.setPeerForNewUser(message.payload.newUserUUID, message.payload.existingUserUUID, message.payload.peerUUID);
    }
  });

  socket.addEventListener("close", () => {
    console.log("remove user");
    clearTimeout(timeoutId);
    room.removeUser(UUID);
  });
}
