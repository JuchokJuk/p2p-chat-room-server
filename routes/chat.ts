import type { Room } from "../Room.ts";
import { send } from "../send.ts";

export function chat(room: Room, socket: WebSocket) {
  const UUID = crypto.randomUUID();

  socket.onopen = () => {
      send(socket, {
        action: "init user",
        payload: UUID,
      });
      room.saveUser(UUID, socket);
  };

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.action === "set peer for existing user") {
      console.log("GOT set peer for existing user", message.payload);
      room.setPeerForExistingUser(UUID, socket, message.payload);
    } else if (message.action === "set peer for new user") {
      console.log("GOT set peer for new user", message.payload);
      room.setPeerForNewUser(message.payload.newUserUUID, message.payload.existingUserUUID, message.payload.peerUUID);
    }
  });

  socket.addEventListener("close", () => {
    room.removeUser(UUID);
  });
}
