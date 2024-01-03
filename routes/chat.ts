import { send } from "../send.ts";
import { Room, User } from "./Room.ts";

export function chat(room: Room, socket: WebSocket) {
  const currentUser: User = {
    UUID: crypto.randomUUID(),
    socket,
    peerUUID: undefined,
  };

  let timeoutId: number;

  const actions = {
    heartbeat: () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(socket.close.bind(socket), 10000);
    },
    savePeerUUID: (UUID: string) => {
      currentUser.peerUUID = UUID;
      for (const user of room.users) {
        if (user !== currentUser) {
          send(user.socket, {
            action: "addUser",
            payload: { UUID: currentUser.UUID, peerUUID: currentUser.peerUUID },
          });
        }
      }
    },
  };

  type Action = keyof typeof actions;
  type Message = { action: Action; payload: any };

  socket.onopen = () => {
    console.log("OPEN", currentUser.UUID);

    timeoutId = setTimeout(socket.close.bind(socket), 10000);
    room.addUser(currentUser);
  };

  socket.onmessage = (event) => {
    console.log("MESSAGE", currentUser.UUID, event.data);

    const message = JSON.parse(event.data) as Message;

    actions[message.action](message.payload);
  };

  socket.onclose = () => {
    console.log("CLOSE", currentUser.UUID);

    clearTimeout(timeoutId);
    room.removeUser(currentUser);
  };
}
