import { dwFetch } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  searchParams.set("templateId", process.env.TEMPLATE_ID!);
  try {
    const res = await dwFetch(`/cards?${searchParams.toString()}`);
    const data = await res.json();
    const active = (data.data ?? []).filter((c: { status: string }) => c.status !== "deleted");
    return NextResponse.json(
      { ...data, data: active, meta: { ...data.meta, totalItems: active.length } },
      { status: res.status }
    );
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
