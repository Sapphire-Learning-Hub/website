export function validateAnnouncementFields(
  title: unknown,
  body: unknown,
): { title: string; body: string } | { error: string } {
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedBody = typeof body === "string" ? body.trim() : "";
  if (!trimmedTitle || trimmedTitle.length > 100) {
    return { error: "标题必填且不超过 100 字。" };
  }
  if (!trimmedBody || trimmedBody.length > 2000) {
    return { error: "内容必填且不超过 2000 字。" };
  }
  return { title: trimmedTitle, body: trimmedBody };
}
