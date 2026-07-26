"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinActions({
  id,
  status,
}: {
  id: number;
  status: "pending" | "processed";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: object) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/joins/${id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="admin-actions">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          call("PATCH", {
            status: status === "pending" ? "processed" : "pending",
          })
        }
      >
        {status === "pending" ? "标记已处理" : "标记待处理"}
      </button>
      <button
        type="button"
        className="danger"
        disabled={busy}
        onClick={() => {
          if (window.confirm("确定删除这条申请吗？")) call("DELETE");
        }}
      >
        删除
      </button>
    </span>
  );
}
