export function send(socket: WebSocket, message: { action: string; payload: unknown }) {
  const rawMessage = JSON.stringify({
    action: message.action,
    payload: message.payload,
  });

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(rawMessage);
  }
}
