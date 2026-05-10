import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scootersApi } from "../api/scooters";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { FleetTable } from "../components/admin/FleetTable";
import { AddScooterModal } from "../components/admin/AddScooterModal";
import { FleetStats } from "../components/admin/FleetStats";
import { DeleteConfirmationModal } from "../components/admin/DeleteConfirmationModal";
import { useToast } from "../components/ToastProvider";
import { Scooter } from "../types";
import { scooterKeys } from "../utils/queryKeys";

export default function AdminFleetPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: scootersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: scooterKeys.list("admin"),
    queryFn: () => scootersApi.getAll(1, 100),
  });

  const scooters = scootersData?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (location: string) => scootersApi.create(location),
    onSuccess: () => {
      showToast("新增车辆成功，默认状态为可用。", "success");
      queryClient.invalidateQueries({ queryKey: scooterKeys.all });
      setIsModalOpen(false);
    },
    onError: () => showToast("新增失败，请稍后再试。", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Scooter["status"] }) =>
      scootersApi.updateStatus(id, status),
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: () => {
      showToast("状态已更新。", "success");
      queryClient.invalidateQueries({ queryKey: scooterKeys.all });
    },
    onError: () => showToast("状态更新失败，请重试。", "error"),
    onSettled: () => setUpdatingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scootersApi.delete(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      showToast("车辆已删除。", "success");
      queryClient.invalidateQueries({ queryKey: scooterKeys.all });
      setIsDeleteModalOpen(false);
      setSelectedScooter(null);
    },
    onError: () => showToast("删除失败，请稍后再试。", "error"),
    onSettled: () => setDeletingId(null),
  });

  const forceResetMutation = useMutation({
    mutationFn: (id: string) => scootersApi.forceReset(id),
    onMutate: (id) => setUpdatingId(id),
    onSuccess: () => {
      showToast("幽灵车辆已强制重置为可用状态。", "success");
      queryClient.invalidateQueries({ queryKey: scooterKeys.all });
    },
    onError: (error: Error) => {
      showToast(error.message || "强制重置失败", "error");
    },
    onSettled: () => setUpdatingId(null),
  });

  const handleToggleStatus = (scooter: Scooter) => {
    if (scooter.status === "RENTED") {
      showToast("车辆处于租用中，无法手动切换状态。请使用强制重置功能。", "warning");
      return;
    }
    const nextStatus =
      scooter.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    updateMutation.mutate({ id: scooter.id, status: nextStatus });
  };

  const handleForceReset = (scooter: Scooter) => {
    if (scooter.status !== "RENTED") return;
    if (!window.confirm(`确定要强制重置车辆 ${(scooter.id ?? '').slice(0, 8)}… (${scooter.location}) 吗？这将把状态从"租用中"改为"可用"。请确认该车辆没有活跃的骑行订单。`)) {
      return;
    }
    forceResetMutation.mutate(scooter.id);
  };

  const handleDeleteClick = (scooter: Scooter) => {
    setSelectedScooter(scooter);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedScooter) {
      deleteMutation.mutate(selectedScooter.id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedScooter(null);
  };

  // Loading
  if (isLoading) {
    return (
      <PageLayout
        title="车队管理后台"
        subtitle="查看车辆、添加新车、切换可用性，并保持前后端权限一致。"
      >
        <LoadingSpinner size="large" showText text="正在加载车队数据…" />
      </PageLayout>
    );
  }

  // Error
  if (isError) {
    const message = error instanceof Error ? error.message : "未知错误";
    return (
      <PageLayout title="车队管理后台" subtitle="数据加载失败">
        <ErrorState
          title="加载失败"
          message={message}
          onRetry={() => refetch()}
        />
      </PageLayout>
    );
  }

  const hasData = scooters.length > 0;

  return (
    <PageLayout
      title="车队管理后台"
      subtitle="查看车辆、添加新车、切换可用性，并保持前后端权限一致。"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
              Admin · Fleet
            </p>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">
              车队管理后台
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              查看车辆、添加新车、切换可用性，并保持前后端权限一致。
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              刷新
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              + 添加车辆
            </button>
          </div>
        </header>

        {hasData ? (
          <>
            <FleetStats scooters={scooters} />
            <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Fleet Table
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--text-main)]">
                    车辆列表
                  </h2>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  当前共{" "}
                  <span className="font-semibold text-[var(--text-main)]">
                    {scooters.length}
                  </span>{" "}
                  辆
                </div>
              </div>
              <FleetTable
                scooters={scooters}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
                onForceReset={handleForceReset}
                updatingId={updatingId}
                deletingId={deletingId}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="还没有车辆"
            message="点击下方按钮快速添加第一辆车。"
            actionText="添加车辆"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </div>

      <AddScooterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(location) => createMutation.mutateAsync(location)}
        isSubmitting={createMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        scooter={selectedScooter}
        isDeleting={deleteMutation.isPending}
      />
    </PageLayout>
  );
}
