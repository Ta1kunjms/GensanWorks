import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SystemAlert {
  id: string;
  message: string;
  field?: string;
  route: string;
  method: string;
  timestamp: string;
}

interface Props {
  limit?: number;
  className?: string;
}

const formatTimestamp = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function SystemAlertsCard({ limit = 5, className }: Props) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await authFetch("/api/admin/system-alerts");
      const data = await res.json();
      setAlerts(Array.isArray(data?.alerts) ? data.alerts.slice(0, limit) : []);
    } catch (error) {
      console.error("Failed to load system alerts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={cn("border-orange-100", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-base font-semibold">
            Recent Validation Alerts
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" aria-label="Refresh alerts" onClick={fetchAlerts} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">All clear. No recent validation issues.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-orange-100 bg-orange-50/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-orange-900">{alert.message}</div>
                  <Badge variant="outline" className="border-orange-200 text-orange-800">
                    {alert.method} {alert.route}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-2">
                  <span>{formatTimestamp(alert.timestamp)}</span>
                  {alert.field && <span className="text-orange-700">Field: {alert.field}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
