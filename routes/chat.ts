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
      timeoutId = setTimeout(disconnectInactiveUser, 10000);
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

  function disconnectInactiveUser(){
    currentUser.socket.close();
    clearTimeout(timeoutId);
    room.removeUser(currentUser);
  }

  type Action = keyof typeof actions;
  type Message = { action: Action; payload: any };

  socket.onopen = () => {
    timeoutId = setTimeout(disconnectInactiveUser, 10000);
    room.addUser(currentUser);
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as Message;

    actions[message.action](message.payload);
  };

  socket.onclose = () => {
    clearTimeout(timeoutId);
    room.removeUser(currentUser);
  };
}
