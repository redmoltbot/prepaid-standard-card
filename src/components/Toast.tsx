"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl text-white text-lg font-semibold shadow-lg
        ${type === "success" ? "bg-[var(--clr-success)]" : "bg-[var(--clr-danger)]"}`}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "success") =>
    setToast({ message, type });

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}
