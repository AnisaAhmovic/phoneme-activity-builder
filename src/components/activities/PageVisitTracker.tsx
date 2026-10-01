"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageVisitTracker() {
  const path = usePathname();
  const [warning, setWarning] = useState(false);
  useEffect(() => {
    const id = crypto.randomUUID();
    let total = 0;
    let last = performance.now();
    let visible = document.visibilityState === "visible";
    let disposed = false;
    const flush = () => {
      const now = performance.now();
      if (visible) total = Math.min(1_800_000, total + now - last);
      last = now;
      visible = document.visibilityState === "visible";
      void fetch("/api/page-visits", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, path, activeMs: Math.round(total) }),
      })
        .then((response) => {
          if (!disposed) setWarning(!response.ok);
        })
        .catch(() => {
          if (!disposed) setWarning(true);
        });
    };
    flush();
    const timer = window.setInterval(flush, 15000);
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [path]);
  return warning ? (
    <p className="telemetry-warning" role="status">
      Usage monitoring is temporarily unavailable. Page-time figures may be
      incomplete.
    </p>
  ) : null;
}
