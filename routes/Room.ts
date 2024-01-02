import { send } from "../send.ts";

export type User = { UUID: string; socket: WebSocket; peerUUID?: string };
export class Room {
  users: User[] = [];

  addUser(user: User) {
    if (this.users.length > 0) {
      send(user.socket, {
        action: "save users",
        payload: this.users.map((user) => ({ UUID: user.UUID, peerUUID: user.peerUUID })).filter((user) => user.peerUUID !== undefined),
      });
    }
    this.users.push(user);
  }

  removeUser(user: User) {
    this.users = this.users.filter((currentUser) => currentUser !== user);

    for (const currentUser of this.users) {
      send(currentUser.socket, {
        action: "remove user",
        payload: user.UUID,
      });
    }
  }
}
