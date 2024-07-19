import { isEditor } from "@/lib/lucia/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await isEditor();
  return <>{children}</>;
}
