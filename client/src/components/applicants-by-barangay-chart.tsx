import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { BarChartData } from "@shared/schema";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ApplicantsByBarangayChartProps {
  data: BarChartData;
}

export function ApplicantsByBarangayChart({ data }: ApplicantsByBarangayChartProps) {
  const chartData = {
    labels: data.barangays,
    datasets: [
      {
        label: "Job Seeker",
        data: data.jobSeeker,
        backgroundColor: "hsl(220 40% 7%)",
        borderRadius: 4,
        maxBarThickness: 20,
      },
      {
        label: "Freelancer",
        data: data.freelancer,
        backgroundColor: "hsl(215 92% 58%)",
        borderRadius: 4,
        maxBarThickness: 20,
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
        max: 100,
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
    <Card data-testid="chart-applicants-by-barangay">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Applicants by Barangay</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
