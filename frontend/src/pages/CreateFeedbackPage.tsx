import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { feedbackApi, FeedbackCategory } from "../api/feedback";
import { scootersApi } from "../api/scooters";
import { bookingsApi } from "../api/bookings";
import type { Booking, Scooter } from "../types";
import PageLayout from "../components/PageLayout";

export default function CreateFeedbackPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "FAULT" as FeedbackCategory,
    scooterId: "",
    bookingId: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchScooters();
    fetchBookings();
  }, []);

  const fetchScooters = async () => {
    try {
      const data = await scootersApi.getAll(1, 100);
      const items = data.items;
      setScooters(items);
      if (items.length > 0 && !formData.scooterId) {
        setFormData((prev) => ({ ...prev, scooterId: items[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch scooters:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getMyBookings(1, 100);
      setBookings(data.items);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        bookingId: formData.bookingId || undefined,
        imageUrl: formData.imageUrl || undefined,
      };
      await feedbackApi.create(payload);
      navigate("/my-feedbacks");
    } catch (error) {
      console.error("Failed to create feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass = `w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-line)] text-[var(--text-main)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 focus:border-[var(--mclaren-orange)] placeholder-[var(--text-secondary)]/50 transition-all duration-200 touch-target`;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">
            提交反馈
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            报告故障、损坏或提供改进建议。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              标题 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="问题的简要概括"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              详细描述 *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className={inputClass}
              placeholder="请详细描述遇到的问题..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              类别 *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="FAULT" className="bg-[var(--bg-card)]">
                故障 / 技术问题
              </option>
              <option value="DAMAGE" className="bg-[var(--bg-card)]">
                损坏报告
              </option>
              <option value="SUGGESTION" className="bg-[var(--bg-card)]">
                改进建议
              </option>
            </select>
            {formData.category === "DAMAGE" && (
              <p className="text-xs text-amber-300/80 mt-1">
                损坏报告会自动标记为高优先级。
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="scooterId"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              滑板车 *
            </label>
            <select
              id="scooterId"
              name="scooterId"
              value={formData.scooterId}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="" className="bg-[var(--bg-card)]">
                选择一辆滑板车
              </option>
              {scooters.map((scooter) => (
                <option
                  key={scooter.id}
                  value={scooter.id}
                  className="bg-[var(--bg-card)]"
                >
                  {scooter.location} ({scooter.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bookingId"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              关联预约{" "}
              <span className="text-[var(--text-secondary)]">（可选）</span>
            </label>
            <select
              id="bookingId"
              name="bookingId"
              value={formData.bookingId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="" className="bg-[var(--bg-card)]">
                无特定预约
              </option>
              {bookings.map((booking) => (
                <option
                  key={booking.id}
                  value={booking.id}
                  className="bg-[var(--bg-card)]"
                >
                  预约 #{booking.id.slice(0, 8)} -{" "}
                  {new Date(booking.startTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="imageUrl"
              className="text-sm font-medium text-[var(--text-main)]"
            >
              图片链接{" "}
              <span className="text-[var(--text-secondary)]">（可选）</span>
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 border border-[var(--border-line)] text-[var(--text-main)] rounded-lg font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && (
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {loading ? "提交中..." : "提交反馈"}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
