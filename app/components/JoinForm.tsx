"use client";

import { useState } from "react";
import { ArrowDownRight, Check } from "./icons";

type Status = "idle" | "submitting" | "success" | "error";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message, website }),
      });
      if (response.ok) {
        setStatus("success");
        return;
      }
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "提交失败，请稍后再试。");
      setStatus("error");
    } catch {
      setError("网络错误，请稍后再试。");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="join-success" role="status">
        <b><Check /> 已收到你的申请</b>
        <p>我们会尽快通过你留下的联系方式与你联络，欢迎加入。</p>
      </div>
    );
  }

  return (
    <form className="join-form" onSubmit={onSubmit}>
      <div className="join-field">
        <label htmlFor="join-name">NAME / 称呼</label>
        <input
          id="join-name"
          value={name}
          maxLength={50}
          required
          placeholder="怎么称呼你"
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="join-field">
        <label htmlFor="join-contact">CONTACT / 联系方式</label>
        <input
          id="join-contact"
          value={contact}
          maxLength={100}
          required
          placeholder="邮箱、QQ 或微信"
          onChange={(event) => setContact(event.target.value)}
        />
      </div>
      <div className="join-field join-field-wide">
        <label htmlFor="join-message">MESSAGE / 想说的话（可选）</label>
        <textarea
          id="join-message"
          value={message}
          maxLength={1000}
          rows={4}
          placeholder="介绍一下你自己，或聊聊你想做的项目"
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <div className="join-trap" aria-hidden="true">
        <label htmlFor="join-website">Website</label>
        <input
          id="join-website"
          value={website}
          tabIndex={-1}
          autoComplete="off"
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button
        className="button button-primary"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "提交中…" : "提交申请"} <ArrowDownRight />
      </button>
    </form>
  );
}
