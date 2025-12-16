import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Settings,
  Shield,
  ArrowRight
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  priority?: "high" | "medium" | "low";
  badge?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActionsBar({ actions }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: "access-requests",
      label: "Admin Access Requests",
      description: "Review pending admin account requests",
      icon: <Shield className="w-5 h-5" />,
      href: "/admin/access-requests",
      priority: "high",
    },
    {
      id: "manage-employers",
      label: "Manage Employers",
      description: "View and manage employer accounts",
      icon: <Briefcase className="w-5 h-5" />,
      href: "/admin/employers",
    },
    {
      id: "manage-applicants",
      label: "Manage Applicants",
      description: "View and manage applicant profiles",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/applicants",
    },
    {
      id: "manage-jobs",
      label: "Manage Job Posts",
      description: "Review and manage job vacancies",
      icon: <FileText className="w-5 h-5" />,
      href: "/admin/jobs",
    },
    {
      id: "reports",
      label: "Analytics",
      description: "Explore dashboards and generate reports",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin/reports",
    },
    {
      id: "settings",
      label: "System Settings",
      description: "Configure system preferences",
      icon: <Settings className="w-5 h-5" />,
      href: "/admin/settings",
    },
  ];

  const finalActions = actions || defaultActions;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-blue-500" />
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {finalActions.map(action => (
          <Link key={action.id} href={action.href}>
            <div className={`group p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              action.priority === 'high'
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-400'
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-blue-400'
            } hover:shadow-md`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  action.priority === 'high'
                    ? 'bg-red-200 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {action.icon}
                </div>
                {action.badge && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500 text-white">
                    {action.badge}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                {action.label}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                {action.description}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Open
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
