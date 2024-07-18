import { AuthPage } from "@/components/app/Auth/Auth";
import { isLoggedIn } from "@/lib/lucia/utils";

export default async function Page() {
  await isLoggedIn();
  return <AuthPage />;
}
