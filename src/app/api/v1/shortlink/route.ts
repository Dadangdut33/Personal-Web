import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { shortLinkModel } from "../../../../models/shortlink";

type ResponseData = {
  data?: any;
  message: string;
};

export async function GET(req: NextRequest, { params }: { params: any }) {
  await connectDB();
  const q = req.nextUrl.searchParams.get("shorten");
  if (!q) return NextResponse.json({ data: null, message: "Bad request" }, { status: 400 });

  const fetched = await shortLinkModel.findOneAndUpdate({ shorten: q }, { $inc: { clickCount: 1 } });
  if (!fetched) return NextResponse.json({ data: null, message: "Not found" }, { status: 404 });

  return NextResponse.json({ data: fetched, message: "Success" }, { status: 200 });
}
