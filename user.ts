import type { Room } from "./Room.ts";
import { send } from "./send.ts";

export function user(room: Room, socket: WebSocket) {
  const UUID = crypto.randomUUID();

  socket.onopen = () => {
    if (room.users.length === 0) {
      send(socket, {
        action: "init first user",
        payload: UUID,
      });
    } else {
      send(socket, {
        action: "generate peers for existing users",
        payload: room.users.map((user) => user.UUID),
      });
    }
  };

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.action === "save first user") {
      console.log("GOT save first user", message.payload);
      room.saveFirstUser(UUID, socket);
    } else if (message.action === "set peer for existing user") {
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
