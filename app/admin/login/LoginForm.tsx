"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight } from "@/app/components/icons";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "登录失败，请重试。");
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={onSubmit}>
      <p className="kicker">
        <span /> ADMIN ACCESS
      </p>
      <h1>管理后台</h1>
      <label htmlFor="admin-username">USERNAME</label>
      <input
        id="admin-username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />
      <label htmlFor="admin-password">PASSWORD</label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "登录中…" : "登录"} <ArrowDownRight />
      </button>
    </form>
  );
}
