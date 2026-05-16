"use client";
import { useState, useEffect } from "react";
import type { CardInfo } from "@/types";
import StampPanel from "@/components/StampPanel";
import Toast, { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Minus } from "lucide-react";

interface CustomerModalProps {
  serialNumber: string;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomerModal({
  serialNumber,
  onClose,
}: CustomerModalProps) {
  const [card, setCard] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    surname: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | "card" | "customer">(null);
  const { toast, showToast, hideToast } = useToast();

  const fetchCard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${serialNumber}`);
      if (!res.ok) throw new Error();
      const data: CardInfo = await res.json();
      setCard(data);
      setEditForm({
        firstName: data.customer.firstName || "",
        surname: data.customer.surname || "",
        phone: data.customer.phone || "",
        email: data.customer.email || "",
      });
    } catch {
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialNumber]);

  const handleSaveEdit = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      showToast("Customer updated", "success");
      setEditing(false);
      fetchCard();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    try {
      const res = await fetch(`/api/cards/${serialNumber}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!card) return;
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[var(--clr-surface-raised)] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Card Details
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xl text-muted-foreground">
            Loading...
          </div>
        ) : !card ? (
          <div className="text-center py-16 text-xl text-red-500">
            Failed to load card data.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Card Stats */}
            <Card>
              <CardContent className="grid grid-cols-2 gap-3 text-base pt-4">
                <span className="text-muted-foreground">Serial #</span>
                <span className="font-mono font-medium text-foreground break-all">
                  {card.serialNumber}
                </span>
                <span className="text-muted-foreground">Haircuts Remaining</span>
                <span className="font-bold text-[var(--clr-primary)] text-2xl">
                  {card.stamps}
                </span>
                <span className="text-muted-foreground">Joined</span>
                <span className="text-foreground">{formatDate(card.createdAt)}</span>
                {card.downloadUrl && (
                  <>
                    <span className="text-muted-foreground">Download</span>
                    <a
                      href={card.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--clr-primary)] underline"
                    >
                      Open link
                    </a>
                  </>
                )}
                {card.comment && (
                  <>
                    <span className="text-muted-foreground">Comment</span>
                    <span className="text-foreground">{card.comment}</span>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            {editing ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">
                  Edit Customer
                </h3>
                {(
                  [
                    { field: "firstName", label: "First Name", type: "text" },
                    { field: "surname", label: "Surname", type: "text" },
                    { field: "phone", label: "Phone", type: "tel" },
                    { field: "email", label: "Email", type: "email" },
                  ] as const
                ).map(({ field, label, type }) => (
                  <div key={field} className="space-y-1">
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      type={type}
                      placeholder={label}
                      value={editForm[field]}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="grid grid-cols-2 gap-3 text-base pt-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium">
                    {card.customer.firstName} {card.customer.surname || ""}
                  </span>
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">
                    {card.customer.phone || "—"}
                  </span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground break-all">
                    {card.customer.email || "—"}
                  </span>
                  <span className="text-muted-foreground">Customer ID</span>
                  <span className="text-foreground font-mono text-sm break-all">
                    {card.customer.id}
                  </span>
                  {card.customer.externalUserId && (
                    <>
                      <span className="text-muted-foreground">External ID</span>
                      <span className="text-foreground font-mono text-sm">
                        {card.customer.externalUserId}
                      </span>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Haircut Actions */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">
                Haircut Credits
              </h3>
              <StampPanel cardId={serialNumber} onSuccess={fetchCard} />
            </div>

            {/* Management Actions */}
            {confirmDelete ? (
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "var(--clr-danger-bg)" }}
              >
                <p className="text-base font-semibold text-[var(--clr-danger)] text-center">
                  {confirmDelete === "card"
                    ? "Permanently delete this card?"
                    : "Permanently delete this customer and all their data?"}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      if (confirmDelete === "card") handleDeleteCard();
                      else handleDeleteCustomer();
                    }}
                  >
                    Yes, delete
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                <Button
                  variant="outline"
                  className="border-[var(--clr-danger)] text-[var(--clr-danger)]"
                  onClick={() => setConfirmDelete("card")}
                >
                  Del Card
                </Button>
                <Button variant="destructive" onClick={() => setConfirmDelete("customer")}>
                  Del Customer
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
