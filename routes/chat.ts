import { send } from "../send.ts";
import { Room } from "./Room.ts";

export function chat(room: Room, socket: WebSocket) {
  const currentUser = {
    socket,
    peerUUID: undefined,
  };

  let timeoutId: number;

  function close() {
    socket.close();
    removeUser();
  }

  function removeUser() {
    clearTimeout(timeoutId);
    room.removeUser(currentUser)
  }

  socket.addEventListener("open", () => {
    room.addUser(currentUser)
    if (room.users.length > 0) {
      send(socket, {
        action: "save users",
        payload: room.users.map((user) => user.peerUUID).filter((peerUUID) => peerUUID !== currentUser.peerUUID),
      });
    }
    timeoutId = setTimeout(close, 10000);
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.action === "heartbeat") {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(close, 10000);
    } else if (message.action === "save peer UUID") {
      for (const user of room.users) {
        if (user.peerUUID) {
          send(user.socket, {
            action: "add user",
            payload: message.payload,
          });
        }
      }
      currentUser.peerUUID = message.payload;
    }
  });

  socket.addEventListener("close", removeUser);
}
