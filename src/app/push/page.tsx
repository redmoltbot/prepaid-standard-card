"use client";
import { useState, useEffect } from "react";
import Toast, { useToast } from "@/components/Toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PushRecord = {
  id: string | number;
  message: string;
  createdAt: string;
  cardId: string | null;
  scheduledAt: string | null;
  status?: string;
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function PushPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<PushRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/pushes?page=1&itemsPerPage=30");
      const data = await res.json();
      setHistory(data.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      showToast("Enter a message", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/pushes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      showToast("Push notification sent", "success");
      setMessage("");
      fetchHistory();
    } catch {
      showToast("Failed to send notification", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Push Notifications
      </h1>

      {/* Send Section */}
      <div className="space-y-3 mb-8">
        <Textarea
          placeholder="Type your message to all cardholders..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="text-xl p-4 rounded-xl resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-4 text-xl font-bold rounded-2xl h-auto"
        >
          {sending ? "Sending..." : "Send to All Cardholders"}
        </Button>
      </div>

      {/* History Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">
          Previously Sent
        </h2>
        <Button variant="outline" size="sm" onClick={fetchHistory}>Refresh</Button>
      </div>

      {loadingHistory ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-lg">
          No notifications sent yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <p className="text-base text-foreground font-medium">{p.message}</p>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{formatDateTime(p.createdAt)}</span>
                  {p.status && <span className="capitalize">{p.status}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
