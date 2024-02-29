import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unexpected Error",
  description: "Something bad just happened...",
};

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}

export async function generateMetadata() {}
