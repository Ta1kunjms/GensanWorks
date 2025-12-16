import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  badge,
  icon,
  actions,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {actions && <div className="flex flex-wrap gap-3 justify-end">{actions}</div>}
      {children}
    </div>
  );
}
