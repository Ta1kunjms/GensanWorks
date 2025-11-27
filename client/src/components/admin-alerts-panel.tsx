import { Bell, AlertCircle, Clock, CheckCircle2, User, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface AdminAlert {
  id: string;
  type: "request" | "feedback" | "warning" | "info";
  title: string;
  description: string;
  actionUrl?: string;
  count?: number;
  priority: "high" | "medium" | "low";
}

interface AdminAlertsPanelProps {
  alerts: AdminAlert[];
  isLoading: boolean;
}

export function AdminAlertsPanel({ alerts, isLoading }: AdminAlertsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "request":
        return <User className="w-5 h-5 text-blue-500" />;
      case "feedback":
        return <FileText className="w-5 h-5 text-amber-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
      case "medium":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      default:
        return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
    }
  };

  const highPriorityAlerts = alerts.filter(a => a.priority === "high");
  const otherAlerts = alerts.filter(a => a.priority !== "high");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Pending Actions
        </h2>
        {alerts.length > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">All caught up!</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm">No pending actions at this time</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* High Priority Alerts */}
          {highPriorityAlerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {alert.title}
                    {alert.count && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {alert.count}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {alert.description}
                  </p>
                </div>
              </div>
              {alert.actionUrl && (
                <Link href={alert.actionUrl}>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                    View
                  </Button>
                </Link>
              )}
            </div>
          ))}

          {/* Other Alerts */}
          {otherAlerts.length > 0 && (
            <div className="space-y-2">
              {otherAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${getPriorityColor(alert.priority)}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {alert.title}
                        {alert.count && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {alert.count}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  {alert.actionUrl && (
                    <Link href={alert.actionUrl}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
