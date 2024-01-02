import { User } from "../main.ts";
import { send } from "../send.ts";

export function chat(users: User[], socket: WebSocket) {
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
    users = users.filter((user) => user.peerUUID !== currentUser.peerUUID);
  }

  socket.addEventListener("open", () => {
    users.push(currentUser);
    if (users.length > 0) {
      send(socket, {
        action: "save users",
        payload: users.map((user) => user.peerUUID).filter((peerUUID) => peerUUID !== currentUser.peerUUID),
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
      for (const user of users) {
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
