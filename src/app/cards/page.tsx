"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type CardRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string | null;
  device: string | null;
  balance: {
    currentNumberOfUses: number;
    numberStampsTotal: number;
    stampsBeforeReward: number;
  } | null;
  customerId: string | null;
  installLink: string | null;
  shareLink: string | null;
  customer: {
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}


function exportCSV(cards: CardRow[]) {
  const today = new Date().toISOString().slice(0, 10);
  const headers = ["Card ID", "Customer ID", "Customer Name", "Phone", "Email", "Last Active", "Haircuts Remaining", "Status", "Device", "Install Link", "Share Link"];
  const rows = cards.map((c) => [
    c.id,
    c.customerId ?? "",
    `${c.customer.firstName} ${c.customer.surname ?? ""}`.trim(),
    c.customer.phone ?? "",
    c.customer.email ?? "",
    c.updatedAt ?? "",
    String(c.balance?.currentNumberOfUses ?? 0),
    c.status ?? "",
    c.device ?? "",
    c.installLink ?? "",
    c.shareLink ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cards_export_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  // filter state
  const [toDate, setToDate] = useState("");
  const [minStamps, setMinStamps] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "installed" | "not_installed">("");

  const fetchCards = () => {
    setLoading(true);
    fetch("/api/cards?page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setCards(d.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const filtered = cards.filter((c) => {
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(c.updatedAt) > end) return false;
    }
    if (minStamps !== "") {
      const min = parseInt(minStamps, 10);
      if (!isNaN(min) && min > 0) {
        const total = c.balance?.currentNumberOfUses ?? 0;
        if (total < min) return false;
      }
    }
    if (statusFilter !== "") {
      if (c.status !== statusFilter) return false;
    }
    return true;
  });

  const hasFilters = toDate || (minStamps !== "" && minStamps !== "0") || statusFilter !== "";

  const clearFilters = () => {
    setToDate("");
    setMinStamps("");
    setStatusFilter("");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Cards
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)}>
            Export CSV
          </Button>
          <Button size="sm" onClick={fetchCards}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="block text-xs font-medium mb-1">
                Not active since
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl"
              />
            </div>
            <div className="flex-1">
              <Label className="block text-xs font-medium mb-1">
                Min. Haircuts Remaining
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={minStamps}
                onChange={(e) => setMinStamps(e.target.value)}
                className="w-full rounded-xl"
              />
            </div>
            <div className="flex-1">
              <Label className="block text-xs font-medium mb-1">
                Card Status
              </Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "" | "installed" | "not_installed")}
                className="w-full rounded-xl border border-border bg-card text-foreground px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="installed">Installed</option>
                <option value="not_installed">Not Installed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {filtered.length} of {cards.length} cards
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--clr-danger)] font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="cursor-pointer active:scale-95 transition-transform"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {c.customer.firstName} {c.customer.surname || ""}
                    </div>
                    <div className="text-base text-muted-foreground mt-0.5">
                      {c.customer.phone || "No phone"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[var(--clr-primary)] text-base font-medium">
                      {c.id}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Last active: {formatDate(c.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Haircuts remaining: </span>
                    <span className="text-foreground font-medium">
                      {c.balance?.currentNumberOfUses ?? 0}
                    </span>
                  </div>
                  {c.device && (
                    <div>
                      <span className="text-muted-foreground">Device: </span>
                      <span className="text-foreground">{c.device}</span>
                    </div>
                  )}
                  {c.status && (
                    <Badge
                      className={
                        c.status === "installed"
                          ? "bg-[var(--clr-success-bg)] text-[var(--clr-success)] border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {c.status === "not_installed" ? "Not Installed" : c.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-lg">
              {cards.length === 0 ? "No cards found." : "No cards match the current filters."}
            </div>
          )}
        </div>
      )}

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
