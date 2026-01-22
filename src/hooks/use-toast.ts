import type { ReactNode } from "react";
import { toast as sonnerToast } from "@/components/ui/sonner";

export type AppToastVariant = "default" | "destructive";

export type AppToastInput = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: AppToastVariant;
};

/**
 * Compat layer: many parts of the app call `useToast()` from shadcn.
 * We use Sonner as the single toast system to avoid runtime conflicts.
 */
function toast({ title, description, variant }: AppToastInput) {
  const message = title ?? "";
  const opts = description ? { description } : undefined;

  // Error
  if (variant === "destructive") {
    return sonnerToast.error(message || "Errore", opts);
  }

  // Success heuristic (keeps existing call sites unchanged)
  if (typeof title === "string" && title.toLowerCase().includes("success")) {
    return sonnerToast.success(title, opts);
  }

  return sonnerToast(message || "", opts);
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => {
      // sonner supports dismiss(id?)
      return (sonnerToast as any).dismiss(toastId);
    },
  };
}

export { useToast, toast };
