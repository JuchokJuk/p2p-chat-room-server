import { send } from "../send.ts";
import { Room } from "./Room.ts";

export function chat(room: Room, socket: WebSocket) {
  const currentUser = {
    UUID: crypto.randomUUID(),
    socket,
    peerUUID: undefined,
  };

  let timeoutId: number;

  function close() {
    socket.close();
    room.removeUser(currentUser);
  }

  socket.addEventListener("open", () => {

    room.addUser(currentUser);
    timeoutId = setTimeout(close, 10000);
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.action === "heartbeat") {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(close, 10000);
    } else if (message.action === "save peer UUID") {
      currentUser.peerUUID = message.payload;
      for (const user of room.users) {
        if (user !== currentUser) {
          send(user.socket, {
            action: "add user",
            payload: { UUID: currentUser.UUID, peerUUID: currentUser.peerUUID },
          });
        }
      }
    }
  });

  socket.addEventListener("close", () => {
    clearTimeout(timeoutId);
    room.removeUser(currentUser);
  });
}
