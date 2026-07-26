"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight } from "@/app/components/icons";

export default function SetupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("两次输入的密码不一致。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/setup", {
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
      setError(data?.error ?? "创建失败，请重试。");
      // 409 means someone else finished setup first; show the login form.
      if (response.status === 409) router.refresh();
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={onSubmit}>
      <p className="kicker">
        <span /> FIRST-RUN SETUP
      </p>
      <h1>创建管理员</h1>
      <p className="setup-hint">
        检测到还没有管理员账号。设置首个管理员，完成后台初始化。
      </p>
      <label htmlFor="setup-username">USERNAME</label>
      <input
        id="setup-username"
        value={username}
        maxLength={50}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />
      <label htmlFor="setup-password">PASSWORD（至少 8 位）</label>
      <input
        id="setup-password"
        type="password"
        value={password}
        minLength={8}
        maxLength={128}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        required
      />
      <label htmlFor="setup-confirm">CONFIRM PASSWORD</label>
      <input
        id="setup-confirm"
        type="password"
        value={confirm}
        minLength={8}
        maxLength={128}
        onChange={(event) => setConfirm(event.target.value)}
        autoComplete="new-password"
        required
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "创建中…" : "创建并进入后台"} <ArrowDownRight />
      </button>
    </form>
  );
}
