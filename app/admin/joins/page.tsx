import { ArrowLeft, ArrowRight } from "@/app/components/icons";
import { isDbConfigured } from "@/lib/db";
import { listJoinRequests, type JoinRequest } from "@/lib/queries";
import AdminNav from "../AdminNav";
import { requireAdmin } from "../require-admin";
import JoinActions from "./JoinActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("zh-CN");
}

export default async function AdminJoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    params.status === "pending" || params.status === "processed"
      ? params.status
      : undefined;

  let items: JoinRequest[] = [];
  let total = 0;
  if (isDbConfigured) {
    ({ items, total } = await listJoinRequests(page, PAGE_SIZE, status));
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterQuery = status ? `&status=${status}` : "";

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <div className="admin-toolbar">
          <h1 className="admin-title">加入申请</h1>
          <nav className="admin-filter" aria-label="状态筛选">
            <a href="/admin/joins" className={!status ? "active" : undefined}>
              全部
            </a>
            <a
              href="/admin/joins?status=pending"
              className={status === "pending" ? "active" : undefined}
            >
              待处理
            </a>
            <a
              href="/admin/joins?status=processed"
              className={status === "processed" ? "active" : undefined}
            >
              已处理
            </a>
          </nav>
        </div>

        {items.length === 0 ? (
          <p className="admin-empty">暂无申请记录。</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>称呼</th>
                <th>联系方式</th>
                <th>留言</th>
                <th>时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.contact}</td>
                  <td className="admin-message">{item.message ?? "—"}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <span className={`admin-badge ${item.status}`}>
                      {item.status === "pending" ? "待处理" : "已处理"}
                    </span>
                  </td>
                  <td>
                    <JoinActions id={item.id} status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 ? (
          <nav className="admin-pager" aria-label="分页">
            {page > 1 ? (
              <a href={`/admin/joins?page=${page - 1}${filterQuery}`}><ArrowLeft /> 上一页</a>
            ) : null}
            <span>
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <a href={`/admin/joins?page=${page + 1}${filterQuery}`}>下一页 <ArrowRight /></a>
            ) : null}
          </nav>
        ) : null}
      </main>
    </>
  );
}
