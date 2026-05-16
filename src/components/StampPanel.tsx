"use client";
import { useState } from "react";
import Toast, { useToast } from "@/components/Toast";
import { addLogEntry } from "@/lib/activityLog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StampPanelProps {
  cardId: string;
  onSuccess: () => void;
}

export default function StampPanel({ cardId, onSuccess }: StampPanelProps) {
  const [stampsStr, setStampsStr] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleAction = async (action: "add-stamp" | "subtract-stamp") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardId,
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
      addLogEntry({ cardNumber: cardId, action, count: stamps, comment });
      showToast(
        `${action === "subtract-stamp" ? "Redeemed" : "Topped up"} ${stamps} haircut${stamps !== 1 ? "s" : ""}`,
        "success"
      );
      setComment("");
      onSuccess();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
      <Input
        type="number"
        min={1}
        value={stampsStr}
        onChange={(e) => setStampsStr(e.target.value)}
        onBlur={() => {
          const n = parseInt(stampsStr);
          if (!stampsStr || n < 1 || isNaN(n)) setStampsStr("1");
        }}
        className="text-xl p-3 h-auto rounded-xl"
      />
      <Input
        type="text"
        placeholder="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="text-lg p-3 h-auto rounded-xl"
      />
      <div className="flex gap-3">
        <Button
          onClick={() => handleAction("subtract-stamp")}
          disabled={loading}
          className="flex-1 py-4 text-xl font-bold rounded-2xl h-auto"
        >
          {loading ? "..." : "✂ Redeem"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAction("add-stamp")}
          disabled={loading}
          className="flex-1 py-4 text-xl font-bold rounded-2xl h-auto"
        >
          {loading ? "..." : "+ Top Up"}
        </Button>
      </div>
    </div>
  );
}
