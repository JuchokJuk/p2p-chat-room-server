import { Router } from "./Router.ts";
import { Room } from "./Room.ts";
import { debug } from "./routes/debug.ts";
import { chat } from "./routes/chat.ts";

const router = new Router();

const room = new Room();

router.get("/debug", () => {
  return debug(room);
});

router.get("/chat", (request: Request) => {
  return chat(request, room);
});

Deno.serve(async (r) => await router.route(r));
