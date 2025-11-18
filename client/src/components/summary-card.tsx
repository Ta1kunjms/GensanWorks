import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { SummaryCard as SummaryCardType } from "@shared/schema";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

interface SummaryCardProps {
  title: string;
  data: SummaryCardType;
  testId: string;
}

export function SummaryCard({ title, data, testId }: SummaryCardProps) {
  const isPositive = data.trend === "up";
  const trendColor = isPositive ? "text-success" : "text-destructive";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  // Use actual historical data from backend
  const sparklineData = data.history || [];

  const chartData = {
    labels: sparklineData.map(() => ""),
    datasets: [
      {
        data: sparklineData,
        borderColor: isPositive ? "hsl(151 55% 42%)" : "hsl(4 90% 58%)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Card className="overflow-hidden" data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div className="text-3xl font-bold text-foreground" data-testid={`${testId}-value`}>
              {data.value.toLocaleString()}
            </div>
            {sparklineData.length > 0 && (
              <div className="h-12 w-24 -mb-2">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span data-testid={`${testId}-change`}>{Math.abs(data.change)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
