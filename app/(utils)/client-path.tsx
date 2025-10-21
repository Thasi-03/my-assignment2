"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// This component runs on the client side.
// It saves the current page path in localStorage and cookies
// so we can display “Last visited: /escape” etc. in layout.tsx.
export default function ClientPathRemember() {
  const path = usePathname();
  useEffect(() => {
    try {
      localStorage.setItem("last_path", path);
      document.cookie = `last_path=${path}; path=/; max-age=2592000`;
    } catch {}
  }, [path]);
  return null;
}
