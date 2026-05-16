"use client";
import { useState, useEffect } from "react";
import Toast, { useToast } from "@/components/Toast";
import ActivityLogComp from "@/components/ActivityLog";
import ThemeToggle from "@/components/ThemeToggle";
import BarcodeScanner from "@/components/BarcodeScanner";
import { addLogEntry } from "@/lib/activityLog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ExternalLink } from "lucide-react";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SupaBarbers";

export default function HomePage() {
  const [cardNum, setCardNum] = useState("");
  const [stampsStr, setStampsStr] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetch("/api/cards?templateId=1094541&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => {
        const count = d.meta?.totalItems ?? d.data?.length ?? null;
        setTotalCustomers(count);
      })
      .catch(() => {});
  }, []);

  const handleStamp = async (action: "add-stamp" | "subtract-stamp") => {
    if (!cardNum.trim()) {
      showToast("Enter a card number", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardNum.trim()}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardNum.trim(),
          visits: Math.max(1, parseInt(stampsStr) || 1),
          comment,
          purchaseSum: 0.1,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.code >= 400) {
        const msg =
          action === "subtract-stamp" && (data.code === 422 || data.message?.includes("Operation failed"))
            ? "No haircuts remaining. Top up first."
            : data.message || "Action failed";
        showToast(msg, "error");
        return;
      }
      const stamps = Math.max(1, parseInt(stampsStr) || 1);
      addLogEntry({
        cardNumber: cardNum.trim(),
        action,
        count: stamps,
        comment,
      });
      showToast(
        `${action === "subtract-stamp" ? "Redeemed" : "Topped up"} ${stamps} haircut${stamps !== 1 ? "s" : ""}`,
        "success"
      );
      setCardNum("");
      setStampsStr("1");
      setComment("");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (code: string) => {
    setCardNum(code);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">{APP_NAME}</h1>
        <ThemeToggle />
      </div>

      {/* Action Form */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Serial Card Number"
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value)}
            className="text-xl p-4 pr-14 h-auto rounded-xl"
          />
          <button
            onClick={() => setIsScannerOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--clr-primary)] active:opacity-70"
            aria-label="Scan barcode"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
        <Input
          type="number"
          min={1}
          value={stampsStr}
          onChange={(e) => setStampsStr(e.target.value)}
          onBlur={() => {
            const n = parseInt(stampsStr);
            if (!stampsStr || n < 1 || isNaN(n)) setStampsStr("1");
          }}
          className="text-xl p-4 h-auto rounded-xl"
        />
        <Input
          type="text"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-xl p-4 h-auto rounded-xl"
        />
        <div className="flex gap-3">
          <Button
            onClick={() => handleStamp("subtract-stamp")}
            disabled={loading}
            className="flex-1 py-4 text-xl font-bold rounded-2xl h-auto"
          >
            {loading ? "..." : "✂ Redeem"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStamp("add-stamp")}
            disabled={loading}
            className="flex-1 py-4 text-xl font-bold rounded-2xl h-auto"
          >
            {loading ? "..." : "+ Top Up"}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 mb-6">
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[var(--clr-primary)]">
              {totalCustomers ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[var(--clr-primary)]">
              {totalCustomers ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Cards Issued</div>
          </CardContent>
        </Card>
      </div>

      {/* Telegram Button */}
      <a
        href="https://t.me/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-4 text-xl font-bold rounded-2xl mb-6 border border-border bg-card text-foreground active:scale-95 transition-transform"
      >
        <ExternalLink className="w-5 h-5" />
        Connect to Telegram
      </a>

      {/* Activity Log */}
      <ActivityLogComp />
    </div>
  );
}
