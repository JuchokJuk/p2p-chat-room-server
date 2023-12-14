import { Room } from "../Room.ts";

export function debug(room: Room) {
  const response = new Response(JSON.stringify(room.users), { status: 200 });
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
}
