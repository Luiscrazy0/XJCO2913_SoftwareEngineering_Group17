import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const userNavigation = [
    { name: "发现车辆", href: "/scooters" },
    { name: "站点地图", href: "/map" },
    { name: "我的预约", href: "/bookings" },
    { name: "我的反馈", href: "/my-feedbacks" },
    { name: "常见问题", href: "/faq" },
  ];

  const adminNavigation = [
    { name: "管理后台", href: "/admin" },
    { name: "车队管理", href: "/admin/fleet" },
    { name: "用户管理", href: "/admin/users" },
    { name: "员工预约", href: "/admin/staff-booking" },
    { name: "价格配置", href: "/admin/pricing" },
    { name: "反馈管理", href: "/admin/feedbacks" },
    { name: "高优先级", href: "/admin/high-priority" },
    { name: "收入统计", href: "/statistics" },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path + "/"));
  const isAdminArea = adminNavigation.some((item) =>
    location.pathname.startsWith(item.href),
  );
  const isAdminActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(e.target as Node)
      ) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-line)] safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 md:h-16 items-center">
            <div className="flex items-center shrink-0">
              <Link
                to={user ? (user.role === 'MANAGER' ? '/admin' : '/scooters') : '/'}
                className="flex items-center"
                aria-label="AAA电动车租赁 - 返回首页"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8 text-[var(--mclaren-orange)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="ml-2 text-base md:text-xl font-bold text-[var(--text-main)] whitespace-nowrap">
                  AAA电动车租赁
                </span>
              </Link>
            </div>

            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-3 rounded-md text-[var(--text-secondary)] hover:bg-white/5 touch-target"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
                <span className="sr-only">
                  {mobileOpen ? "关闭菜单" : "打开菜单"}
                </span>
              </button>
            </div>

            <div className="hidden md:flex flex-row flex-nowrap items-center space-x-1">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? "text-[var(--mclaren-orange)] bg-white/5"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {user?.role === "MANAGER" && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className={`px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap flex items-center gap-1 ${
                      isAdminArea
                        ? "text-[var(--mclaren-orange)] bg-white/5"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5"
                    }`}
                    aria-expanded={adminMenuOpen}
                    aria-haspopup="true"
                  >
                    管理
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${adminMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {adminMenuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-[var(--bg-card)] border border-[var(--border-line)] rounded-lg shadow-xl py-1 z-40 animate-fade-in">
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setAdminMenuOpen(false)}
                          className={`block px-4 py-2 text-sm transition-colors duration-150 whitespace-nowrap ${
                            isAdminActive(item.href)
                              ? "text-[var(--mclaren-orange)] bg-white/10"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4 shrink-0">
              {user ? (
                <>
                  <Link
                    to="/payment-methods"
                    className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--mclaren-orange)] rounded-md transition-colors duration-200"
                  >
                    支付方式
                  </Link>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-[var(--mclaren-orange)] font-medium text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-[var(--text-main)] flex items-center gap-2">
                        {user.email}
                        {user.role === "MANAGER" && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-[var(--border-line)] bg-white/10 text-[var(--mclaren-orange)]">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {user.role === "MANAGER" ? "管理员" : "用户"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
                  >
                    退出
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] hover:bg-white/5 rounded-md transition-colors duration-200"
                >
                  登录/注册
                </Link>
              )}
            </div>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`md:hidden border-t border-[var(--border-line)] bg-[var(--bg-card)] overflow-hidden transition-all duration-300 ease-out ${
            mobileOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0 border-transparent"
          }`}
          role="dialog"
          aria-label="移动导航菜单"
          aria-hidden={!mobileOpen}
        >
          <div className="px-4 pb-6 space-y-4">
            <div className="flex flex-col space-y-3 pt-4">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 touch-target ${
                    isActive(item.href)
                      ? "text-[var(--mclaren-orange)] bg-white/10 border-l-4 border-[var(--mclaren-orange)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5 active:bg-white/10"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user?.role === "MANAGER" && (
                <>
                  <div className="pt-2 border-t border-[var(--border-line)]">
                    <p className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      管理功能
                    </p>
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 touch-target ${
                        isAdminActive(item.href)
                          ? "text-[var(--mclaren-orange)] bg-white/10 border-l-4 border-[var(--mclaren-orange)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5 active:bg-white/10"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              <Link
                to="/payment-methods"
                className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 touch-target ${
                  isActive("/payment-methods")
                    ? "text-[var(--mclaren-orange)] bg-white/10 border-l-4 border-[var(--mclaren-orange)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-white/5 active:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                支付方式
              </Link>
            </div>

            <div className="pt-4 border-t border-[var(--border-line)]">
              {user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center touch-target">
                      <span className="text-[var(--mclaren-orange)] font-medium text-base">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-base font-medium text-[var(--text-main)] flex items-center gap-2">
                        <span className="truncate" title={user.email}>
                          {user.email}
                        </span>
                        {user.role === "MANAGER" && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full border border-[var(--border-line)] bg-white/10 text-[var(--mclaren-orange)]">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] mt-1">
                        {user.role === "MANAGER" ? "管理员" : "用户"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors duration-200 touch-target"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-[var(--mclaren-orange)] hover:bg-[var(--mclaren-orange-hover)] active:bg-[var(--mclaren-orange-depth)] rounded-lg transition-colors duration-200 touch-target"
                  onClick={() => setMobileOpen(false)}
                >
                  登录/注册
                </Link>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full px-4 py-3 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-line)] rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors duration-200 touch-target"
                aria-label="关闭菜单"
              >
                关闭菜单
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
