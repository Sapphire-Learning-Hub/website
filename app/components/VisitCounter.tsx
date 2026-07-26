"use client";

import { useEffect, useState } from "react";

export default function VisitCounter({
  initialTotal,
}: {
  initialTotal: number | null;
}) {
  const [total, setTotal] = useState<number | null>(initialTotal);

  useEffect(() => {
    if (sessionStorage.getItem("sapphire-visited")) return;
    sessionStorage.setItem("sapphire-visited", "1");
    fetch("/api/visits", { method: "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && typeof data.total === "number") setTotal(data.total);
      })
      .catch(() => {});
  }, []);

  if (total === null) return null;
  return (
    <span className="visit-counter" aria-label={`累计访问 ${total} 次`}>
      VISITS / {String(total).padStart(5, "0")}
    </span>
  );
}
