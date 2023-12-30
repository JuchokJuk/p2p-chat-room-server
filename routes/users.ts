import { Room } from "../Room.ts";

export function users(room: Room) {
  const response = new Response(JSON.stringify(room.users.map((user) => user.UUID)), { status: 200 });
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
}
