import { send } from "../send.ts";

export type User = { UUID: string; socket: WebSocket; peerUUID?: string };
export class Room {
  users: User[] = [];

  addUser(user: User, UUID: string) {
    if (this.users.length > 0) {
      send(user.socket, {
        action: "saveUsers",
        payload: {
          users: this.users.map((user) => ({ UUID: user.UUID, peerUUID: user.peerUUID })).filter((user) => user.peerUUID),
          UUID,
        },
      });
    }
    this.users.push(user);
  }

  removeUser(user: User) {
    this.users = this.users.filter((currentUser) => currentUser !== user);

    for (const currentUser of this.users) {
      send(currentUser.socket, {
        action: "removeUser",
        payload: user.UUID,
      });
    }
  }
}
