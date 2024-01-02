import { User } from "../main.ts";

export function debug(users: User[]) {
  const response = new Response(JSON.stringify(users), { status: 200 });
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
}
