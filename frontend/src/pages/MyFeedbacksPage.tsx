import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { feedbackApi, Feedback } from "../api/feedback";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function MyFeedbacksPage() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackApi.getMyFeedbacks(1, 100);
      setFeedbacks(data.items);
      setError(null);
    } catch (err) {
      console.error("获取反馈失败:", err);
      setError("加载您的反馈失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return { className: "bg-red-500/20 text-red-200", label: "紧急" };
      case "HIGH":
        return { className: "bg-orange-500/20 text-orange-200", label: "高" };
      case "MEDIUM":
        return { className: "bg-yellow-500/20 text-yellow-200", label: "中" };
      case "LOW":
        return { className: "bg-green-500/20 text-green-200", label: "低" };
      default:
        return { className: "bg-gray-500/20 text-gray-200", label: priority };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          className: "bg-yellow-500/20 text-yellow-200",
          label: "待处理",
        };
      case "RESOLVED":
        return { className: "bg-green-500/20 text-green-200", label: "已解决" };
      case "ESCALATED":
        return {
          className: "bg-purple-500/20 text-purple-200",
          label: "已升级",
        };
      case "CHARGEABLE":
        return { className: "bg-red-500/20 text-red-200", label: "可收费" };
      default:
        return { className: "bg-gray-500/20 text-gray-200", label: status };
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "FAULT":
        return "故障";
      case "DAMAGE":
        return "损坏";
      case "SUGGESTION":
        return "建议";
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <PageLayout title="我的反馈" subtitle="查看和跟踪您提交的所有反馈。">
        <LoadingSpinner size="large" showText text="正在加载您的反馈..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="我的反馈" subtitle="查看和跟踪您提交的所有反馈。">
      <div className="flex justify-end mb-6">
        <Link
          to="/feedback/new"
          className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg hover:brightness-110 font-medium transition-colors"
        >
          提交新反馈
        </Link>
      </div>

      {error && (
        <ErrorState title="加载失败" message={error} onRetry={fetchFeedbacks} />
      )}

      {feedbacks.length === 0 ? (
        <EmptyState
          title="暂无反馈"
          message="您尚未提交任何反馈。"
          actionText="提交您的第一条反馈"
          onAction={() => navigate("/feedback/new")}
        />
      ) : (
        <div className="bg-[var(--bg-card)] shadow-[var(--shadow-card)] overflow-hidden rounded-xl border border-[var(--border-line)]">
          <ul className="divide-y divide-[var(--border-line)]">
            {feedbacks.map((feedback) => (
              <li
                key={feedback.id}
                className="px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-[var(--text-main)]">
                        {feedback.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority).className}`}
                      >
                        {getPriorityColor(feedback.priority).label}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status).className}`}
                      >
                        {getStatusColor(feedback.status).label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {feedback.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {getCategoryText(feedback.category)}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {feedback.scooterLocation}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/feedbacks/${feedback.id}`}
                      className="px-3 py-1 text-sm bg-white/10 text-[var(--text-secondary)] rounded-md hover:bg-white/20 hover:text-[var(--text-main)] transition-colors"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
                {feedback.managerNotes && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-300">
                      管理员备注:
                    </p>
                    <p className="text-sm text-blue-200 mt-1">
                      {feedback.managerNotes}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageLayout>
  );
}
