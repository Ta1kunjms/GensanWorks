import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RecentActivity } from "@shared/schema";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card data-testid="card-recent-activities">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3"
                data-testid={`activity-${activity.id}`}
              >
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  {activity.message}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
