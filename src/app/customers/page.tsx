"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CardRow = {
  id: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

const PAGE_SIZE = 30;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomersPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchCards = async () => {
    setPage(1);
    setLoading(true);
    try {
      const res = await fetch("/api/cards?page=1&itemsPerPage=100");
      const data = await res.json();
      setCards(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const paged = cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(cards.length / PAGE_SIZE);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Customers
        </h1>
        <Button size="sm" onClick={fetchCards}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map((c) => (
              <Card
                key={c.id}
                onClick={() => setSelected(c.id)}
                className="cursor-pointer active:scale-95 transition-transform"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-semibold text-foreground">
                      {c.customer.firstName} {c.customer.surname || ""}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2 shrink-0">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                    <span className="font-mono text-[var(--clr-primary)] font-medium">{c.id}</span>
                    <span>·</span>
                    <span>{c.customer.phone || "—"}</span>
                    {c.customer.email && (
                      <>
                        <span>·</span>
                        <span className="truncate">{c.customer.email}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {cards.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-lg">
                No customers found.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </Button>
              <span className="py-2 px-4 text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => {
            setSelected(null);
            fetchCards();
          }}
        />
      )}
    </div>
  );
}
