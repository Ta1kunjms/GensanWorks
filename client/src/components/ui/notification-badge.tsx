import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
  variant?: "default" | "danger" | "warning" | "success";
  pulse?: boolean; // Add pulsing animation for urgent items
}

/**
 * NotificationBadge - Displays a small circular badge with a count
 * Used for showing unread notifications, messages, or new items in the sidebar
 * 
 * @param count - Number to display (hides badge if 0)
 * @param maxCount - Maximum number before showing "+" suffix (default: 99)
 * @param variant - Color theme: default (blue), danger (red), warning (amber), success (green)
 * @param pulse - Enable pulsing animation for urgent notifications
 * @param className - Additional Tailwind CSS classes
 */
export function NotificationBadge({
  count,
  maxCount = 99,
  className,
  variant = "default",
  pulse = false,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    danger: "bg-red-500 text-white",
    warning: "bg-amber-500 text-white",
    success: "bg-green-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1 shadow-sm transition-all duration-200",
        variantStyles[variant],
        "animate-in fade-in zoom-in duration-200",
        pulse && "animate-pulse",
        className
      )}
      aria-label={`${count} unread items`}
      role="status"
    >
      {displayCount}
    </span>
  );
}
