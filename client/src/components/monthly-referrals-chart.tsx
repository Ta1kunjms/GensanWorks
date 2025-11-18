import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { LineChartData } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyReferralsChartProps {
  data: LineChartData;
}

export function MonthlyReferralsChart({ data }: MonthlyReferralsChartProps) {
  const chartData = {
    labels: data.months,
    datasets: [
      {
        label: "Referred",
        data: data.referred,
        borderColor: "hsl(25 95% 53%)",
        backgroundColor: "hsl(25 95% 53% / 0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Hired",
        data: data.hired,
        borderColor: "hsl(151 55% 42%)",
        backgroundColor: "hsl(151 55% 42% / 0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Feedback",
        data: data.feedback,
        borderColor: "hsl(215 92% 58%)",
        backgroundColor: "hsl(215 92% 58% / 0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "start" as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(215 20% 90%)",
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Card data-testid="chart-monthly-referrals">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Referrals Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
