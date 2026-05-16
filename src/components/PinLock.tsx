"use client";
import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SupaBarbers";
const CORRECT_PIN = process.env.NEXT_PUBLIC_PIN ?? "7777";

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (!/^\d$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(false);

    if (index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (next.every((d) => d !== "")) {
      if (next.join("") === CORRECT_PIN) {
        onUnlock();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setDigits(["", "", "", ""]);
          inputRefs[0].current?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && digits[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <Lock className="w-16 h-16 text-[var(--clr-primary)] mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-foreground">{APP_NAME}</h1>
      <p className="text-lg text-muted-foreground mb-8">Enter PIN to continue</p>

      <div className={`flex gap-4 mb-4 ${shake ? "animate-shake" : ""}`}>
        {inputRefs.map((ref, i) => (
          <Input
            key={i}
            ref={ref}
            type="password"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-16 h-16 text-center text-3xl font-bold rounded-xl
              focus:ring-2 focus:ring-[var(--clr-primary)]
              ${error ? "border-[var(--clr-danger)]" : ""}`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-[var(--clr-danger)] text-lg font-medium">Incorrect PIN</p>
      )}
    </div>
  );
}
