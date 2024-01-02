export type User = { socket: WebSocket; peerUUID?: string };
export class Room {
  users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
  }
  removeUser(user: User) {
    this.users = this.users.filter((currentUser) => currentUser !== user);
  }
}
