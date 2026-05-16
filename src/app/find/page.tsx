"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

type CardRow = {
  id: string;
  customer: {
    firstName: string;
    surname: string | null;
    phone: string | null;
    email: string | null;
  };
};

export default function FindPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cards?templateId=1094541&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setCards(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? cards.filter((c) => {
        const q = query.toLowerCase();
        return (
          `${c.customer.firstName} ${c.customer.surname || ""}`.toLowerCase().includes(q) ||
          (c.customer.phone || "").includes(q) ||
          (c.customer.email || "").toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">
        Find
      </h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, phone, or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-xl pl-10 p-4 h-auto rounded-xl"
          autoFocus
        />
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-lg">
          No results found.
        </div>
      )}

      {!loading && !query.trim() && (
        <div className="text-center py-8 text-muted-foreground text-lg">
          Start typing to search customers.
        </div>
      )}

      <div className="space-y-3">
        {results.map((c) => (
          <Card
            key={c.id}
            onClick={() => setSelected(c.id)}
            className="cursor-pointer active:scale-95 transition-transform"
          >
            <CardContent className="p-4">
              <div className="text-lg font-semibold text-foreground">
                {c.customer.firstName} {c.customer.surname || ""}
              </div>
              <div className="text-base text-muted-foreground">
                {c.customer.phone || "No phone"} · {c.customer.email || "No email"}
              </div>
              <div className="text-sm font-mono text-[var(--clr-primary)] mt-1">{c.id}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
