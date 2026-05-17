import { dwFetch } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await dwFetch(`/cards/${params.id}`);
    const envelope = await res.json();
    const card = envelope.data;
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: card.id,
      serialNumber: card.id,
      customerId: card.customerId,
      createdAt: card.createdAt,
      stamps: card.balance?.currentNumberOfUses ?? 0,
      rewards: card.balance?.numberRewardsUnused ?? 0,
      comment: null,
      downloadUrl: card.installLink || card.shareLink || null,
      installLink: card.installLink ?? null,
      shareLink: card.shareLink ?? null,
      customer: {
        id: card.customer.id,
        firstName: card.customer.firstName,
        surname: card.customer.surname ?? null,
        phone: card.customer.phone ?? null,
        email: card.customer.email ?? null,
        serialNumber: card.id,
        createdAt: card.customer.createdAt,
        externalUserId: card.customer.externalUserId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await dwFetch(`/cards/${params.id}`, { method: "DELETE" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
