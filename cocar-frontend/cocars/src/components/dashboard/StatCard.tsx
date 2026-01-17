import { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "emerald" | "blue" | "slate" | "purple";
  footer?: ReactNode;
  loading?: boolean;
};

export default function StatCard({ label, value, icon: Icon, tone = "emerald", footer, loading }: Props) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <div className="card-theme rounded-3xl border border-theme p-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tones[tone]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-4">
        <div className="text-2xl font-extrabold text-theme-primary">
          {loading ? "…" : value}
        </div>
        <div className="text-sm text-theme-tertiary font-semibold mt-1">{label}</div>
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}
