import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="bg-white shadow-sm rounded-lg p-10 max-w-lg text-center border border-slate-200">
        <div className="text-5xl mb-4" aria-hidden>
          🔒
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">403 无权限访问</h1>
        <p className="text-slate-600 mb-6">当前账号没有访问该页面的权限。如需开通，请联系管理员。</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/scooters"
            className="px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors"
          >
            返回首页
          </Link>
          <a
            href="mailto:admin@example.com"
            className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            联系管理员
          </a>
        </div>
      </div>
    </div>
  )
}

