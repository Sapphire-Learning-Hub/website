"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight } from "@/app/components/icons";
import type { Announcement } from "@/lib/queries";

type Editing = { id: number | null; title: string; body: string };

export default function AnnouncementManager({
  items,
}: {
  items: Announcement[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, method: string, body?: object) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "操作失败，请重试。");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("网络错误，请重试。");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const payload = { title: editing.title, body: editing.body };
    const ok =
      editing.id === null
        ? await call("/api/admin/announcements", "POST", payload)
        : await call(`/api/admin/announcements/${editing.id}`, "PATCH", payload);
    if (ok) setEditing(null);
  }

  return (
    <div className="admin-announcements">
      <div className="admin-toolbar">
        <h1 className="admin-title">公告管理</h1>
        <button
          type="button"
          className="button button-primary admin-new"
          onClick={() => setEditing({ id: null, title: "", body: "" })}
        >
          新建公告 <ArrowDownRight />
        </button>
      </div>

      {editing ? (
        <form className="admin-editor" onSubmit={save}>
          <label htmlFor="ann-title">TITLE</label>
          <input
            id="ann-title"
            value={editing.title}
            maxLength={100}
            required
            onChange={(event) =>
              setEditing({ ...editing, title: event.target.value })
            }
          />
          <label htmlFor="ann-body">BODY</label>
          <textarea
            id="ann-body"
            value={editing.body}
            maxLength={2000}
            rows={5}
            required
            onChange={(event) =>
              setEditing({ ...editing, body: event.target.value })
            }
          />
          {error ? <p className="form-error">{error}</p> : null}
          <div className="admin-editor-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={busy}
            >
              {busy ? "保存中…" : "保存"} <ArrowDownRight />
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              取消
            </button>
          </div>
        </form>
      ) : null}

      {items.length === 0 && !editing ? (
        <p className="admin-empty">暂无公告，点击「新建公告」创建第一条。</p>
      ) : null}

      <ul className="admin-announcement-list">
        {items.map((item) => (
          <li key={item.id}>
            <div className="admin-announcement-head">
              <b>{item.title}</b>
              <span className={`admin-badge ${item.published ? "processed" : "pending"}`}>
                {item.published ? "已发布" : "未发布"}
              </span>
            </div>
            <p>{item.body}</p>
            <span className="admin-actions">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setEditing({ id: item.id, title: item.title, body: item.body })
                }
              >
                编辑
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  call(`/api/admin/announcements/${item.id}`, "PATCH", {
                    published: !item.published,
                  })
                }
              >
                {item.published ? "下线" : "发布"}
              </button>
              <button
                type="button"
                className="danger"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("确定删除这条公告吗？")) {
                    call(`/api/admin/announcements/${item.id}`, "DELETE");
                  }
                }}
              >
                删除
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
