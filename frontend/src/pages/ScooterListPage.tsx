import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { scootersApi } from "../api/scooters";
import ScooterCard from "../components/ScooterCard";
import BookingModal from "../components/BookingModal";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import SidePromo from "../components/SidePromo";
import OnboardingGuide, { isOnboardingComplete } from "../components/OnboardingGuide";
import { Scooter } from "../types";
import { useSearchParams } from "react-router-dom";
import { scooterKeys } from "../utils/queryKeys";

export default function ScooterListPage() {
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const autoOpenedRef = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      setShowOnboarding(true)
    }
  }, [])

  // 使用TanStack Query获取车辆数据
  const {
    data: scootersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: scooterKeys.list("public"),
    queryFn: async () => {
      try {
        const data = await scootersApi.getAll(1, 100);
        return data;
      } catch (err) {
        console.error("获取车辆数据失败:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const scooters = scootersData?.items ?? [];

  // 处理预约按钮点击
  const handleBookClick = (scooter: Scooter) => {
    setSelectedScooter(scooter);
    setIsBookingModalOpen(true);
  };

  // 处理预约成功
  const handleBookingSuccess = () => {
    // 重新获取车辆数据
    refetch();
  };

  // 处理关闭预约弹窗
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedScooter(null);
  };

  // 过滤出可用的车辆
  const availableScooters = scooters.filter(
    (scooter) => scooter.status === "AVAILABLE",
  );

  // 从地图页跳转时自动打开预订弹窗
  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (!scooters.length) return;

    const highlightId = searchParams.get("highlight");
    const shouldAutoBook = searchParams.get("book") === "1";
    if (!highlightId || !shouldAutoBook) return;

    const target = scooters.find((scooter) => scooter.id === highlightId);
    if (target && target.status === "AVAILABLE") {
      setSelectedScooter(target);
      setIsBookingModalOpen(true);
      autoOpenedRef.current = true;
    }
  }, [scooters, searchParams]);

  // 处理加载状态
  if (isLoading) {
    return (
      <PageLayout title="发现车辆" subtitle="正在从后端API获取数据中...">
        <LoadingSpinner size="large" showText text="正在加载车辆信息..." />
      </PageLayout>
    );
  }

  // 处理错误状态
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : "获取车辆信息时发生未知错误";

    return (
      <PageLayout title="发现车辆" subtitle="获取数据时发生错误">
        <ErrorState
          title="加载失败"
          message={errorMessage + "。请检查后端服务、网络连接和API端点。"}
          onRetry={() => refetch()}
        />
      </PageLayout>
    );
  }

  // 处理空状态
  if (availableScooters.length === 0) {
    const message =
      scooters.length > 0
        ? `共有 ${scooters.length} 辆车辆，但都处于不可用状态。`
        : "当前没有可用的电动车，请稍后再试。";
    return (
      <PageLayout title="发现车辆" subtitle="当前没有可用的电动车">
        <EmptyState title="暂无可用车辆" message={message} />
      </PageLayout>
    );
  }

  // 成功状态：显示车辆列表
  return (
    <>
      {showOnboarding && <OnboardingGuide onComplete={() => setShowOnboarding(false)} />}
      <PageLayout
        title="发现车辆"
        subtitle={`当前有 ${availableScooters.length} 辆可用车辆`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableScooters.map((scooter: Scooter) => (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  onBook={handleBookClick}
                />
              ))}
            </div>
          </div>

          {/* Sidebar ads - desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <SidePromo />
            </div>
          </div>
        </div>

        {/* 调试信息（开发环境显示） */}
        {import.meta.env.DEV && (
          <div className="mt-12 p-6 bg-[var(--bg-input)] rounded-xl border border-[var(--border-line)]">
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-4">
              调试信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  API响应数据
                </h3>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-line)] overflow-auto">
                  <pre className="text-xs text-[var(--text-secondary)]">
                    {JSON.stringify(scooters, null, 2)}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  系统状态
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-main)]">
                  <li className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      后端API:
                    </span>
                    <span className="font-medium text-emerald-300">正常</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      车辆总数:
                    </span>
                    <span className="font-medium">{scooters.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      可用车辆:
                    </span>
                    <span className="font-medium text-emerald-300">
                      {availableScooters.length}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      不可用车辆:
                    </span>
                    <span className="font-medium text-rose-300">
                      {scooters.length - availableScooters.length}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </PageLayout>

      {/* 预约弹窗 */}
      {selectedScooter && (
        <BookingModal
          scooter={selectedScooter}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
}
