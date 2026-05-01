import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";

type AuthTab = "login" | "register";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [insuranceAcknowledged, setInsuranceAcknowledged] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    emergencyContact?: string;
  }>({});

  const validateEmail = (email: string): string | null => {
    if (!email) return "邮箱不能为空";
    if (!email.includes("@") || !email.includes(".")) return "邮箱格式不正确";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "密码不能为空";
    if (password.length < 6) return "密码长度至少6位";
    return null;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ): string | null => {
    if (!confirmPassword) return "请确认密码";
    if (password !== confirmPassword) return "两次输入的密码不一致";
    return null;
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    if (activeTab === "register") {
      const confirmError = validateConfirmPassword(password, confirmPassword);
      if (confirmError) errors.confirmPassword = confirmError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (activeTab === "register" && !insuranceAcknowledged) {
      setError("请阅读并同意保险条款后才能注册");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "register") {
        await register(
          email,
          password,
          insuranceAcknowledged,
          emergencyContact,
        );
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "操作失败，请重试";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setError(null);
    setFormErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 text-base rounded-lg border transition-all duration-200 outline-none
    bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50
    disabled:opacity-60 touch-target
    ${
      hasError
        ? "!border-rose-500 ring-2 ring-rose-500/20"
        : "border-[var(--border-line)] focus:border-[var(--mclaren-orange)] focus:ring-2 focus:ring-[var(--mclaren-orange)]/20"
    }`;

  return (
    <PageLayout showBottomNav={false}>
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8 relative"
        role="main"
        id="main-content"
      >
        {/* Animated background blobs */}
        <div
          className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--mclaren-orange)]/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--mclaren-orange)]/5 blur-3xl" />
        </div>

        <div className="glass-card w-full max-w-md p-8 md:p-10 relative animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <svg
                className="w-12 h-12 text-[var(--mclaren-orange)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
              电动滑板车租赁系统
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              欢迎使用我们的租赁服务
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b border-[var(--border-line)] mb-6"
            role="tablist"
          >
            {(["login", "register"] as AuthTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`flex-1 py-3 text-base font-medium transition-all duration-200 relative ${
                  activeTab === tab
                    ? "text-[var(--mclaren-orange)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                }`}
                onClick={() => handleTabChange(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab === "login" ? "登录" : "注册"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[var(--mclaren-orange)] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            role="tabpanel"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--text-main)]"
              >
                邮箱地址{" "}
                <span className="text-[var(--text-secondary)]">（必填）</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                disabled={isLoading}
                required
                aria-required="true"
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                className={inputClass(!!formErrors.email)}
              />
              {formErrors.email && (
                <div
                  id="email-error"
                  className="text-xs text-rose-400"
                  role="alert"
                >
                  {formErrors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--text-main)]"
              >
                密码{" "}
                <span className="text-[var(--text-secondary)]">（必填）</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                disabled={isLoading}
                required
                aria-required="true"
                aria-invalid={!!formErrors.password}
                aria-describedby={
                  formErrors.password ? "password-error" : undefined
                }
                className={inputClass(!!formErrors.password)}
              />
              {formErrors.password && (
                <div
                  id="password-error"
                  className="text-xs text-rose-400"
                  role="alert"
                >
                  {formErrors.password}
                </div>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {activeTab === "register" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[var(--text-main)]"
                >
                  确认密码{" "}
                  <span className="text-[var(--text-secondary)]">（必填）</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.confirmPassword}
                  aria-describedby={
                    formErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  className={inputClass(!!formErrors.confirmPassword)}
                />
                {formErrors.confirmPassword && (
                  <div
                    id="confirm-password-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {formErrors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Insurance Acknowledgment (Register only) */}
            {activeTab === "register" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                  <input
                    id="insuranceAcknowledged"
                    type="checkbox"
                    checked={insuranceAcknowledged}
                    onChange={(e) => setInsuranceAcknowledged(e.target.checked)}
                    disabled={isLoading}
                    required
                    aria-required="true"
                    className="mt-1 w-4 h-4 rounded border-[var(--border-line)] bg-[var(--bg-input)] accent-[var(--mclaren-orange)] cursor-pointer"
                  />
                  <label
                    htmlFor="insuranceAcknowledged"
                    className="text-sm font-medium text-[var(--text-main)] cursor-pointer"
                  >
                    我已阅读并同意保险条款{" "}
                    <span className="text-[var(--text-secondary)]">
                      （必填）
                    </span>
                  </label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] ml-7">
                  在使用我们的租赁服务前，您需要确认了解并同意我们的保险条款和免责声明。
                </p>
              </div>
            )}

            {/* Emergency Contact (Register only) */}
            {activeTab === "register" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="emergencyContact"
                  className="text-sm font-medium text-[var(--text-main)]"
                >
                  紧急联系人{" "}
                  <span className="text-[var(--text-secondary)]">（可选）</span>
                </label>
                <input
                  id="emergencyContact"
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="姓名 - 电话号码"
                  disabled={isLoading}
                  className={inputClass(!!formErrors.emergencyContact)}
                />
                {formErrors.emergencyContact && (
                  <div
                    id="emergency-contact-error"
                    className="text-xs text-rose-400"
                    role="alert"
                  >
                    {formErrors.emergencyContact}
                  </div>
                )}
                <p className="text-xs text-[var(--text-secondary)]">
                  请提供紧急联系人的姓名和电话号码，格式如：张三 - 13812345678
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="p-3 border border-rose-500/30 bg-rose-500/10 rounded-lg text-sm text-rose-200 text-center"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mclaren-btn-3d w-full py-3.5 text-base touch-target"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  处理中...
                </span>
              ) : activeTab === "login" ? (
                "登录"
              ) : (
                "注册"
              )}
            </button>

            {/* Help Text */}
            <div className="text-center mt-2">
              {activeTab === "login" ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  还没有账号？{" "}
                  <button
                    type="button"
                    className="text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] font-medium bg-transparent border-none cursor-pointer underline transition-colors"
                    onClick={() => handleTabChange("register")}
                  >
                    立即注册
                  </button>
                </p>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  已有账号？{" "}
                  <button
                    type="button"
                    className="text-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange-hover)] font-medium bg-transparent border-none cursor-pointer underline transition-colors"
                    onClick={() => handleTabChange("login")}
                  >
                    立即登录
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
