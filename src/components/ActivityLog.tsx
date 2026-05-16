"use client";
import { useEffect, useState } from "react";
import { getLog } from "@/lib/activityLog";
import type { ActivityLog } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function ActivityLogComp() {
  const [log, setLog] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLog(getLog());
  }, []);

  if (log.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">No recent activity.</p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-foreground">
        Recent Activity
      </h2>
      <div className="space-y-2">
        {log.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-muted"
          >
            <div className="flex justify-between items-center">
              <Badge
                className={
                  entry.action === "add-stamp"
                    ? "bg-[var(--clr-success-bg)] text-[var(--clr-success)] border-0"
                    : "bg-[var(--clr-danger-bg)] text-[var(--clr-danger)] border-0"
                }
              >
                {entry.action === "add-stamp" ? "+" : "-"}
                {entry.count} haircut{entry.count !== 1 ? "s" : ""}
                {entry.action === "subtract-reward" ? " (reward)" : ""}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-muted-foreground text-sm">
              Card: {entry.cardNumber}
            </div>
            {entry.comment && (
              <div className="text-muted-foreground text-sm">{entry.comment}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
