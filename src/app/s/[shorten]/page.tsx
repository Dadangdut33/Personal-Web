import { notFound, redirect } from "next/navigation";

import { api_v1 } from "../../../lib";
import { IShortLinkModel } from "../../../models/shortlink";

async function page() {
  return <p>Redirecting...</p>;
}

export async function generateMetadata({ params }: { params: { shorten: string } }) {
  const fetched = await fetch(`${api_v1}/shortlink?shorten=${params.shorten}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (fetched.status !== 200) return notFound();
  const parsed = await fetched.json();
  const { data }: { data: IShortLinkModel } = parsed;
  if (!data) return notFound();

  redirect(data.url);
}

export default page;
