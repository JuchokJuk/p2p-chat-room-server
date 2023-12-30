import { send } from "./send.ts";

type Connection = {
  sender: { peerUUID?: string };
  receiver: { peerUUID?: string; UUID?: string };
};

type User = {
  UUID: string;
  socket: WebSocket;
  connections: Connection[];
};

export class Room {
  users: User[] = [];

  saveUser(UUID: string, socket: WebSocket) {
    this.users.push({
      UUID,
      socket,
      connections: [],
    });
  }

  setPeerForExistingUser(UUID: string, socket: WebSocket, connection: Connection) {
    if (this.users.findIndex((user) => user.UUID === UUID) === -1) {
      this.users.push({
        UUID,
        socket,
        connections: [connection],
      });
    } else {
      const user = this.users.find((user) => user.UUID === UUID);
      user?.connections.push(connection);
    }

    const existingUser = this.users.find((user) => user.UUID === connection.receiver.UUID);

    if (!existingUser) return;

    existingUser.connections.push({
      sender: { peerUUID: undefined },
      receiver: { peerUUID: connection.sender.peerUUID, UUID: UUID },
    });

    send(existingUser.socket, {
      action: "generate peer for new user",
      payload: { existingUserUUID: existingUser.UUID, newUserUUID: UUID, newUserPeerUUID: connection.sender.peerUUID },
    });
  }

  setPeerForNewUser(newUserUUID: string, existingUserUUID: string, peerUUID: string) {
    const newUser = this.users.find((user) => user.UUID === newUserUUID);
    const newUserConnection = newUser?.connections.find((connection) => connection.receiver.UUID === existingUserUUID);
    if (!newUserConnection) return;
    newUserConnection.receiver.peerUUID = peerUUID;

    const existingUser = this.users.find((user) => user.UUID === existingUserUUID);
    const existingUserConnection = existingUser?.connections.find((connection) => connection.receiver.UUID === newUserUUID);
    if (!existingUserConnection) return;
    existingUserConnection.sender.peerUUID = peerUUID;

    send(newUser!.socket, {
      action: "save peer from existed user",
      payload: {
        existingUserUUID,
        peerUUID,
      },
    });
  }

  removeUser(UUID: string) {
    for (const user of this.users) {
      user.connections = user.connections.filter((connection) => connection.receiver.UUID !== UUID);
      send(user.socket, {
        action: "remove user",
        payload: UUID,
      });
    }
    this.users = this.users.filter((user) => user.UUID !== UUID);
  }
}
