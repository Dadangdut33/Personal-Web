import { isProd } from "@/lib/env.mjs";

export default function Analytics() {
  // only load the analytics script in production
  if (isProd) return <></>;

  return null;
}
