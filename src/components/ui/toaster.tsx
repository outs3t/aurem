// Legacy compat: some codebases import "@/components/ui/toaster" (shadcn).
// In this project we standardized on Sonner.
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export function Toaster() {
  return <SonnerToaster />;
}
