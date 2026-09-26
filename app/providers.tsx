"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      {children}
    </QueryClientProvider>
  );
}
