"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Star } from "@/app/components/icons";
import type { RepoRow } from "@/lib/queries";

type Editing = {
  id: number;
  display_name: string;
  override_description: string;
  position: string;
};

export default function RepoManager({
  items,
  intervalMinutes,
}: {
  items: RepoRow[];
  intervalMinutes: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [rebindTargets, setRebindTargets] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missingRepos = items.filter((repo) => repo.missing);
  const liveRepos = items.filter((repo) => !repo.missing);

  async function call(path: string, method: string, body?: object) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "操作失败，请重试。");
        return null;
      }
      router.refresh();
      return data;
    } catch {
      setError("网络错误，请重试。");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setNotice(null);
    const data = await call("/api/admin/repos/sync", "POST");
    if (data?.ok) {
      const parts = [`已同步 ${data.count} 个仓库`];
      if (typeof data.contributors === "number") {
        parts.push(`${data.contributors} 位贡献者`);
      }
      if (typeof data.events === "number") {
        parts.push(`${data.events} 条动态`);
      }
      let message = `${parts.join("、")}。`;
      if (data.missing > 0) {
        message += `${data.missing} 条仓库记录无法对应到 GitHub。`;
      }
      setNotice(message);
    }
  }

  async function rebind(missingId: number) {
    const targetId = Number(rebindTargets[missingId]);
    if (!targetId) {
      setError("请先选择要绑定的目标仓库。");
      return;
    }
    const data = await call(`/api/admin/repos/${missingId}/rebind`, "POST", {
      targetId,
    });
    if (data?.ok) setNotice("已将覆盖信息绑定到新仓库。");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const data = await call(`/api/admin/repos/${editing.id}`, "PATCH", {
      display_name: editing.display_name,
      override_description: editing.override_description,
      position: Number(editing.position) || 0,
    });
    if (data?.ok) setEditing(null);
  }

  function repoLabel(repo: RepoRow): string {
    return repo.display_name
      ? `${repo.display_name}（${repo.github_name}）`
      : repo.github_name;
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-title">仓库管理</h1>
        <button
          type="button"
          className="button button-primary admin-new"
          disabled={busy}
          onClick={refresh}
        >
          {busy ? "同步中…" : "立即同步"} <ArrowDownRight />
        </button>
      </div>

      <p className="admin-note">
        每 {intervalMinutes} 分钟自动从 GitHub 同步一次；名称/简介覆盖与显示设置在同步后保留。
        同步不会删除记录：无法对应到 GitHub 的仓库会标记为失联，由你决定移除或绑定到改名后的新仓库。
      </p>
      {notice ? <p className="admin-notice">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {missingRepos.length > 0 ? (
        <div className="admin-missing">
          <b>
            {missingRepos.length} 条记录无法对应到 GitHub 仓库
            （可能已删除、转移或改名）
          </b>
          <ul>
            {missingRepos.map((repo) => (
              <li key={repo.id}>
                <div className="admin-missing-head">
                  <span className="admin-missing-name">{repoLabel(repo)}</span>
                  <span className="admin-missing-meta">
                    最后同步 {repo.fetched_at}
                    {repo.display_name || repo.override_description
                      ? " · 含自定义覆盖信息"
                      : ""}
                  </span>
                </div>
                <div className="admin-missing-actions">
                  <select
                    value={rebindTargets[repo.id] ?? ""}
                    disabled={busy || liveRepos.length === 0}
                    onChange={(event) =>
                      setRebindTargets({
                        ...rebindTargets,
                        [repo.id]: event.target.value,
                      })
                    }
                  >
                    <option value="">选择改名后的新仓库…</option>
                    {liveRepos.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.github_name}
                      </option>
                    ))}
                  </select>
                  <span className="admin-actions">
                    <button
                      type="button"
                      disabled={busy || liveRepos.length === 0}
                      onClick={() => rebind(repo.id)}
                    >
                      绑定覆盖信息
                    </button>
                    <button
                      type="button"
                      className="danger"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`确定移除「${repo.github_name}」的记录吗？其覆盖信息将一并删除。`)) {
                          call(`/api/admin/repos/${repo.id}`, "DELETE");
                        }
                      }}
                    >
                      移除记录
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {editing ? (
        <form className="admin-editor" onSubmit={save}>
          <label htmlFor="repo-name">展示名称（留空使用 GitHub 名称）</label>
          <input
            id="repo-name"
            value={editing.display_name}
            maxLength={100}
            onChange={(event) =>
              setEditing({ ...editing, display_name: event.target.value })
            }
          />
          <label htmlFor="repo-desc">展示简介（留空使用 GitHub 简介）</label>
          <textarea
            id="repo-desc"
            value={editing.override_description}
            maxLength={500}
            rows={3}
            onChange={(event) =>
              setEditing({
                ...editing,
                override_description: event.target.value,
              })
            }
          />
          <label htmlFor="repo-position">排序（数字越小越靠前）</label>
          <input
            id="repo-position"
            type="number"
            min={0}
            max={9999}
            value={editing.position}
            onChange={(event) =>
              setEditing({ ...editing, position: event.target.value })
            }
          />
          <div className="admin-editor-actions">
            <button className="button button-primary" type="submit" disabled={busy}>
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

      {liveRepos.length === 0 && missingRepos.length === 0 ? (
        <p className="admin-empty">
          还没有仓库数据，点击「立即同步」从 GitHub 拉取。
        </p>
      ) : null}

      {liveRepos.length > 0 ? (
        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>仓库</th>
              <th>展示名称</th>
              <th>简介</th>
              <th><Star /> / 语言</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {liveRepos.map((repo) => (
              <tr key={repo.id}>
                <td>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    {repo.github_name} <ArrowUpRight />
                  </a>
                </td>
                <td>{repo.display_name ?? "—"}</td>
                <td className="admin-message">
                  {repo.override_description ?? repo.description ?? "—"}
                </td>
                <td>
                  <Star /> {repo.stargazers_count}
                  {repo.language ? ` · ${repo.language}` : ""}
                </td>
                <td>{repo.position}</td>
                <td>
                  <span
                    className={`admin-badge ${repo.visible ? "processed" : "pending"}`}
                  >
                    {repo.visible ? "展示中" : "已隐藏"}
                  </span>
                </td>
                <td>
                  <span className="admin-actions">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setEditing({
                          id: repo.id,
                          display_name: repo.display_name ?? "",
                          override_description: repo.override_description ?? "",
                          position: String(repo.position),
                        })
                      }
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        call(`/api/admin/repos/${repo.id}`, "PATCH", {
                          visible: !repo.visible,
                        })
                      }
                    >
                      {repo.visible ? "隐藏" : "展示"}
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : null}
    </div>
  );
}
