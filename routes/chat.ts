import { Room } from "../Room.ts";
import { user } from "../user.ts";

export function chat(request: Request, room: Room) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(request);

  user(room, socket);

  return response;
}
