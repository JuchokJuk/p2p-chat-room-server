import { Router } from "./Router.ts";
import { debug } from "./routes/debug.ts";
import { chat } from "./routes/chat.ts";
import { Room } from "./routes/Room.ts";

const router = new Router();

const room = new Room();

router.get("/debug", () => {
  return debug(room);
});

router.get("/chat", (request: Request) => {
  if (request.headers.get("upgrade") !== "websocket") return new Response(null, { status: 501 });
  const { socket, response } = Deno.upgradeWebSocket(request);

  chat(room, socket);

  return response;
});

Deno.serve(async (request) => await router.route(request));
