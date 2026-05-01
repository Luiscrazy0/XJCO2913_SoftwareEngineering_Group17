import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  feedbackApi,
  UpdateFeedbackRequest,
  DamageType,
} from "../api/feedback";
import PageLayout from "../components/PageLayout";
import ErrorState from "../components/ErrorState";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { feedbackKeys } from "../utils/queryKeys";

export default function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();
  const role = user?.role ?? null;

  const [formData, setFormData] = useState<UpdateFeedbackRequest>({});
  const [isEditing, setIsEditing] = useState(false);

  const feedbackKey = id
    ? feedbackKeys.detail(id, role)
    : feedbackKeys.detail("missing", role);

  const {
    data: feedback,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: feedbackKey,
    queryFn: () => feedbackApi.getById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFeedbackRequest) => feedbackApi.update(id!, data),
    onSuccess: (updatedFeedback) => {
      showToast("Feedback updated successfully", "success");
      queryClient.setQueryData(feedbackKey, updatedFeedback);
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      setIsEditing(false);
    },
    onError: () => showToast("Failed to update feedback", "error"),
  });

  useEffect(() => {
    if (feedback) {
      setFormData({
        priority: feedback.priority,
        status: feedback.status,
        managerNotes: feedback.managerNotes || "",
        resolutionCost: feedback.resolutionCost,
        damageType: feedback.damageType,
      });
    }
  }, [feedback]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || undefined : value,
    }));
  };

  const handleDamageTypeChange = (damageType: DamageType) => {
    setFormData((prev) => {
      const newData = { ...prev, damageType };
      // Business rule: If damage type is NATURAL, set resolutionCost to 0 and status to RESOLVED
      if (damageType === "NATURAL") {
        newData.resolutionCost = 0;
        newData.status = "RESOLVED";
      }
      // Business rule: If damage type is INTENTIONAL, set status to CHARGEABLE
      if (damageType === "INTENTIONAL") {
        newData.status = "CHARGEABLE";
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (feedback) {
      setFormData({
        priority: feedback.priority,
        status: feedback.status,
        managerNotes: feedback.managerNotes || "",
        resolutionCost: feedback.resolutionCost,
        damageType: feedback.damageType,
      });
    }
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-white";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "RESOLVED":
        return "bg-green-500 text-white";
      case "ESCALATED":
        return "bg-purple-500 text-white";
      case "CHARGEABLE":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DAMAGE":
        return "bg-red-500 text-white";
      case "FAULT":
        return "bg-orange-500 text-white";
      case "SUGGESTION":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Loading
  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--mclaren-orange)] border-t-transparent" />
          <p className="mt-4 text-[var(--text-secondary)]">
            Loading feedback details…
          </p>
        </div>
      </PageLayout>
    );
  }

  // Error
  if (isError || !feedback) {
    const message =
      error instanceof Error ? error.message : "Feedback not found";
    return (
      <PageLayout>
        <ErrorState
          title="Failed to load"
          message={message}
          onRetry={() => refetch()}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
              Admin · Feedback Detail
            </p>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">
              Feedback Details
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Ticket ID: <span className="font-mono">{feedback.id}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={role === "MANAGER" ? "/admin/feedbacks" : "/my-feedbacks"}
              className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 shadow-sm"
            >
              Back to List
            </Link>
            {role === "MANAGER" &&
              (!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                >
                  Edit Feedback
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-red-500 hover:bg-red-500/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={updateMutation.isPending}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Feedback Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                Feedback Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Title
                  </p>
                  <p className="text-lg font-medium text-[var(--text-main)]">
                    {feedback.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Category
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(feedback.category)}`}
                  >
                    {feedback.category}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Priority
                  </p>
                  {isEditing ? (
                    <select
                      name="priority"
                      value={formData.priority || feedback.priority}
                      onChange={handleInputChange}
                      className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] w-full"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(feedback.priority)}`}
                    >
                      {feedback.priority}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Status
                  </p>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status || feedback.status}
                      onChange={handleInputChange}
                      className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] w-full"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="ESCALATED">Escalated</option>
                      <option value="CHARGEABLE">Chargeable</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}
                    >
                      {feedback.status}
                    </span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Description
                  </p>
                  <p className="text-[var(--text-main)] mt-1 whitespace-pre-wrap">
                    {feedback.description}
                  </p>
                </div>

                {feedback.imageUrl && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      Image
                    </p>
                    <div className="mt-2">
                      <img
                        src={feedback.imageUrl}
                        alt="Feedback"
                        className="rounded-lg max-w-full h-auto max-h-64 object-contain border border-[var(--border-line)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manager Notes Card */}
            <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                Manager Notes
              </h2>
              {isEditing ? (
                <textarea
                  name="managerNotes"
                  value={formData.managerNotes || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                  placeholder="Add notes about this feedback..."
                />
              ) : (
                <p className="text-[var(--text-main)] whitespace-pre-wrap">
                  {feedback.managerNotes || "No notes added yet."}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Management & Related Info */}
          <div className="space-y-6">
            {/* Management Actions Card — admin only */}
            {role === "MANAGER" && (
              <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                  Management Actions
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">
                      Damage Type
                    </p>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDamageTypeChange("NATURAL")}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${formData.damageType === "NATURAL" ? "bg-green-600 text-white" : "bg-[var(--bg-main)] border border-[var(--border-line)] text-[var(--text-main)]"}`}
                          >
                            Natural Damage
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDamageTypeChange("INTENTIONAL")
                            }
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${formData.damageType === "INTENTIONAL" ? "bg-red-600 text-white" : "bg-[var(--bg-main)] border border-[var(--border-line)] text-[var(--text-main)]"}`}
                          >
                            Intentional Damage
                          </button>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {formData.damageType === "NATURAL"
                            ? "No charge will be applied. Status will be set to RESOLVED."
                            : formData.damageType === "INTENTIONAL"
                              ? "Status will be set to CHARGEABLE. Please set resolution cost below."
                              : "Select damage type to apply business rules."}
                        </p>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${feedback.damageType === "INTENTIONAL" ? "bg-red-500 text-white" : feedback.damageType === "NATURAL" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}
                      >
                        {feedback.damageType || "Not specified"}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">
                      Resolution Cost
                    </p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-main)]">$</span>
                        <input
                          type="number"
                          name="resolutionCost"
                          value={formData.resolutionCost || ""}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="flex-1 rounded-lg border border-[var(--border-line)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-medium text-[var(--text-main)]">
                        ${feedback.resolutionCost?.toFixed(2) || "0.00"}
                      </p>
                    )}
                  </div>

                  {feedback.status === "CHARGEABLE" &&
                    feedback.resolutionCost &&
                    feedback.resolutionCost > 0 && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                        <p className="text-sm font-medium text-red-200">
                          Chargeable Damage
                        </p>
                        <p className="text-xs text-red-200/80 mt-1">
                          This feedback requires payment of $
                          {feedback.resolutionCost.toFixed(2)} from the user.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Related Information Card */}
            <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                Related Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Submitted By
                  </p>
                  <p className="text-[var(--text-main)] font-medium">
                    {feedback.createdByEmail}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Scooter
                  </p>
                  <p className="text-[var(--text-main)] font-medium">
                    ID: {feedback.scooterId}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Location: {feedback.scooterLocation}
                  </p>
                </div>

                {feedback.bookingId && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      Booking
                    </p>
                    <p className="text-[var(--text-main)] font-medium">
                      ID: {feedback.bookingId}
                    </p>
                    {feedback.bookingStartTime && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Start:{" "}
                        {new Date(feedback.bookingStartTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    Last Updated
                  </p>
                  <p className="text-[var(--text-main)]">
                    {new Date(feedback.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">
                      Feedback Created
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-500 text-sm">↻</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">
                      Last Updated
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(feedback.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {feedback.status === "RESOLVED" && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-500 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-main)]">
                        Resolved
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Status changed to RESOLVED
                      </p>
                    </div>
                  </div>
                )}

                {feedback.status === "CHARGEABLE" && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-sm">$</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-main)]">
                        Chargeable
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Requires payment: $
                        {feedback.resolutionCost?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
