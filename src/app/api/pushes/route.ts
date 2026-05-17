import { dwFetch } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  searchParams.set("templateId", process.env.TEMPLATE_ID!);
  try {
    const res = await dwFetch(`/pushes?${searchParams.toString()}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await dwFetch("/pushes", {
      method: "POST",
      body: JSON.stringify({
        message: body.message ?? "",
        templateId: Number(process.env.TEMPLATE_ID),
        cardId: body.cardId ?? null,
        scheduledAt: body.scheduledAt ?? null,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
