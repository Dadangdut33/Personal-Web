import { Cookie } from "lucia";
import { cookies } from "next/headers";

export function setRedirectMsgCookie(msg: string) {
  try {
    cookies().set(
      new Cookie("redirect-msg", msg, {
        path: "/",
        maxAge: 60 * 60 * 24,
      })
    );
  } catch (error) {
    console.log("Error Setting Cookies: ", error);
  }
}
