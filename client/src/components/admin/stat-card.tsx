import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const variantStyles = {
  slate: {
    gradient: "from-slate-50 to-white",
    darkGradient: "dark:from-slate-800/60 dark:to-slate-900/60",
    border: "border-slate-200 dark:border-slate-700/60",
    label: "text-slate-600 dark:text-slate-300",
    helper: "text-slate-500 dark:text-slate-400",
    iconBg: "bg-slate-200/80 dark:bg-slate-700/60",
    iconColor: "text-slate-700 dark:text-slate-200",
  },
  blue: {
    gradient: "from-blue-50 to-blue-100",
    darkGradient: "dark:from-blue-900/40 dark:to-blue-800/30",
    border: "border-blue-200 dark:border-blue-700/60",
    label: "text-blue-700 dark:text-blue-200",
    helper: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-200/70 dark:bg-blue-800/50",
    iconColor: "text-blue-700 dark:text-blue-200",
  },
  emerald: {
    gradient: "from-emerald-50 to-emerald-100",
    darkGradient: "dark:from-emerald-900/40 dark:to-emerald-800/30",
    border: "border-emerald-200 dark:border-emerald-700/60",
    label: "text-emerald-700 dark:text-emerald-200",
    helper: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-200/70 dark:bg-emerald-800/50",
    iconColor: "text-emerald-700 dark:text-emerald-200",
  },
  amber: {
    gradient: "from-amber-50 to-amber-100",
    darkGradient: "dark:from-amber-900/40 dark:to-amber-800/30",
    border: "border-amber-200 dark:border-amber-700/60",
    label: "text-amber-700 dark:text-amber-200",
    helper: "text-amber-600 dark:text-amber-300",
    iconBg: "bg-amber-200/70 dark:bg-amber-800/50",
    iconColor: "text-amber-700 dark:text-amber-100",
  },
  purple: {
    gradient: "from-purple-50 to-purple-100",
    darkGradient: "dark:from-purple-900/40 dark:to-purple-800/30",
    border: "border-purple-200 dark:border-purple-700/60",
    label: "text-purple-700 dark:text-purple-200",
    helper: "text-purple-600 dark:text-purple-300",
    iconBg: "bg-purple-200/70 dark:bg-purple-800/50",
    iconColor: "text-purple-700 dark:text-purple-100",
  },
  red: {
    gradient: "from-rose-50 to-rose-100",
    darkGradient: "dark:from-rose-900/40 dark:to-rose-800/30",
    border: "border-rose-200 dark:border-rose-700/60",
    label: "text-rose-700 dark:text-rose-200",
    helper: "text-rose-600 dark:text-rose-300",
    iconBg: "bg-rose-200/70 dark:bg-rose-800/50",
    iconColor: "text-rose-700 dark:text-rose-200",
  },
  cyan: {
    gradient: "from-cyan-50 to-cyan-100",
    darkGradient: "dark:from-cyan-900/40 dark:to-cyan-800/30",
    border: "border-cyan-200 dark:border-cyan-700/60",
    label: "text-cyan-700 dark:text-cyan-200",
    helper: "text-cyan-600 dark:text-cyan-300",
    iconBg: "bg-cyan-200/70 dark:bg-cyan-800/50",
    iconColor: "text-cyan-700 dark:text-cyan-200",
  },
} as const;

export type AdminStatVariant = keyof typeof variantStyles;

interface AdminStatCardProps {
  title: string;
  value: string | number;
  helper?: string;
  trend?: number | null;
  icon?: ReactNode;
  variant?: AdminStatVariant;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  helper,
  trend,
  icon,
  variant = "slate",
  className,
}: AdminStatCardProps) {
  const styles = variantStyles[variant] ?? variantStyles.slate;
  const trendLabel =
    trend != null ? `${trend > 0 ? "↑" : trend < 0 ? "↓" : "–"} ${Math.abs(trend)}% from last period` : null;

  return (
    <div
      className={cn(
        "bg-gradient-to-br rounded-2xl border p-6 hover:shadow-lg transition-shadow",
        styles.gradient,
        styles.darkGradient,
        styles.border,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium mb-1", styles.label)}>{title}</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{value}</p>
          {(helper || trendLabel) && (
            <p className={cn("text-xs mt-1", styles.helper)}>{helper ?? trendLabel}</p>
          )}
        </div>
        {icon && (
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-xl", styles.iconBg, styles.iconColor)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminStatCardSkeleton() {
  return <Skeleton className="h-32 rounded-2xl" />;
}
