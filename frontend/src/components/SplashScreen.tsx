import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const SPLASH_KEY = "splash_last_shown";
const SPLASH_COOLDOWN = 1000 * 60 * 30; // 30 minutes
const DISCOUNT_END_DATE = new Date();
DISCOUNT_END_DATE.setDate(DISCOUNT_END_DATE.getDate() + 15);

const promos = [
  {
    id: "student",
    title: "学生专属计划",
    subtitle: "认证学生享8折优惠",
    description: "凭.edu邮箱注册，长期享受学生折扣价。",
    cta: "了解更多",
    link: "/auth",
    gradient: "from-purple-600 via-violet-500 to-indigo-500",
    emoji: "🎓",
  },
];

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(SPLASH_KEY);
    const now = Date.now();
    if (!lastShown || now - parseInt(lastShown) > SPLASH_COOLDOWN) {
      setVisible(true);
      setCurrent(Math.floor(Math.random() * promos.length));
    }
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(SPLASH_KEY, Date.now().toString());
    }, 400);
  }, []);

  if (!visible) return null;

  const promo = promos[current];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="推广活动"
    >
      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors safe-top"
        aria-label="关闭广告"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="w-full max-w-sm mx-4 animate-fade-in-up">
        {/* Card */}
        <div
          className={`bg-gradient-to-br ${promo.gradient} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

          <div className="relative">
            <span className="text-5xl mb-4 block">{promo.emoji}</span>
            <p className="text-white/80 text-sm font-medium mb-1">
              {promo.subtitle}
            </p>
            <h2 className="text-3xl font-bold mb-3">{promo.title}</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              {promo.description}
            </p>

            <Link
              to={promo.link}
              onClick={dismiss}
              className="block w-full py-3.5 bg-white text-gray-900 rounded-xl font-bold text-center hover:bg-white/90 transition-colors active:scale-[0.98]"
            >
              {promo.cta}
            </Link>

            <button
              onClick={dismiss}
              className="block w-full mt-3 py-3 text-white/60 text-sm text-center hover:text-white/80 transition-colors"
            >
              跳过广告
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
              aria-label={`查看广告 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
