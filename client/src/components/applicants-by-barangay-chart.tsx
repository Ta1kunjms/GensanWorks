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
  // Calculate the maximum value across all datasets
  const maxValue = Math.max(
    ...data.employed,
    ...data.unemployed,
    ...data.selfEmployed,
    ...data.newEntrant
  );
  
  // Set y-axis max to 120% of the highest value (adds 20% buffer)
  // Round up to nearest multiple of 5 for cleaner scale
  const yAxisMax = Math.ceil((maxValue * 1.2) / 5) * 5;

  const chartData = {
    labels: data.barangays,
    datasets: [
      {
        label: "Employed",
        data: data.employed,
        backgroundColor: "hsl(142 76% 36%)",
        borderRadius: 4,
        maxBarThickness: 20,
      },
      {
        label: "Unemployed",
        data: data.unemployed,
        backgroundColor: "hsl(0 84% 60%)",
        borderRadius: 4,
        maxBarThickness: 20,
      },
      {
        label: "Self-Employed",
        data: data.selfEmployed,
        backgroundColor: "hsl(38 92% 50%)",
        borderRadius: 4,
        maxBarThickness: 20,
      },
      {
        label: "New Entrant",
        data: data.newEntrant,
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
        max: yAxisMax,
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
        <CardTitle className="text-lg font-semibold">Applicants in General Santos City</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
