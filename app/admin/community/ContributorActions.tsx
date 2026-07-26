"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContributorActions({
  id,
  hidden,
}: {
  id: number;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/contributors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      if (response.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="admin-actions">
      <button type="button" disabled={busy} onClick={toggle}>
        {hidden ? "显示" : "隐藏"}
      </button>
    </span>
  );
}
