import { env, isProd } from "@/lib/env.mjs";

export default function Analytics() {
  // only load the analytics script in production
  if (isProd) return <script defer src="/api/umami" data-website-id={env.UMAMI_ID}></script>;
  return null;
}
