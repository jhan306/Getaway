"use client";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

/**
 * This component only calls ThemeProvider after React has mounted on the client.
 * Until then, we render a plain <>{children}</>.
 */
export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Now that we are on the client, enable the theme provider
    setMounted(true);
  }, []);

  if (!mounted) {
    // On the server (or before the first client render), just render children un-themed.
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
