import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const msg = req.cookies.get("redirect-msg");
  return new Response(JSON.stringify({ success: 1, data: msg ? msg.value : "" }), {
    status: 200,
    headers: {
      "Set-Cookie": `redirect-msg=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
    },
  });
}
