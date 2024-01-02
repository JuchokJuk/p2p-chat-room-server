import { Router } from "./Router.ts";
import { debug } from "./routes/debug.ts";
import { chat } from "./routes/chat.ts";

const router = new Router();

export type User = { socket: WebSocket; peerUUID?: string };

const users: User[] = [];

router.get("/debug", () => {
  return debug(users);
});

router.get("/chat", (request: Request) => {
  if (request.headers.get("upgrade") !== "websocket") return new Response(null, { status: 501 });
  const { socket, response } = Deno.upgradeWebSocket(request);

  chat(users, socket);

  return response;
});

Deno.serve(async (r) => await router.route(r));
