import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";

export default function ForbiddenPage() {
  return (
    <PageLayout showBottomNav={false}>
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="surface-card surface-lift rounded-lg p-10 max-w-lg text-center">
          <div className="text-5xl mb-4" aria-hidden>
            🔒
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
            403 无权限访问
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            当前账号没有访问该页面的权限。如需开通，请联系管理员。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/scooters"
              className="px-4 py-2 rounded-md text-white bg-[var(--mclaren-orange)] hover:brightness-110 transition-colors"
            >
              返回首页
            </Link>
            <a
              href="mailto:admin@example.com"
              className="px-4 py-2 rounded-md text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 transition-colors"
            >
              联系管理员
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
