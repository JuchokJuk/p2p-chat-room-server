export function send(socket: WebSocket, message: { action: string; payload: any }) {
  const rawMessage = JSON.stringify({
    action: message.action,
    payload: message.payload,
  });

  if (socket.readyState === 1) {
    socket.send(rawMessage);
  }
}
