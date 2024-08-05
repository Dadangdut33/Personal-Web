import { env, isProd } from '@/lib/env.mjs';

export default function Analytics() {
  // only load the analytics script in production
  if (isProd)
    return <script defer src="https://umami-dadangdut33.vercel.app/x.js" data-website-id={env.UMAMI_ID}></script>;
  return null;
}
