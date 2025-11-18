import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { DoughnutChartData } from "@shared/schema";

ChartJS.register(ArcElement, Tooltip, Legend);

interface JobseekerFreelancerChartProps {
  data: DoughnutChartData;
}

export function JobseekerFreelancerChart({ data }: JobseekerFreelancerChartProps) {
  const total = data.jobSeeker + data.freelancer;
  const jobSeekerPercent = ((data.jobSeeker / total) * 100).toFixed(2);
  const freelancerPercent = ((data.freelancer / total) * 100).toFixed(2);

  const chartData = {
    labels: ["Job Seeker", "Freelancer"],
    datasets: [
      {
        data: [data.jobSeeker, data.freelancer],
        backgroundColor: ["hsl(220 40% 7%)", "hsl(215 92% 58%)"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card data-testid="chart-jobseeker-freelancer">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Jobseeker vs Freelancer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative h-[200px] w-[200px]">
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[hsl(220,40%,7%)]" />
                <span className="text-sm font-medium text-foreground">Job Seeker</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="jobseeker-count">
                {data.jobSeeker.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{jobSeekerPercent}%</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span className="text-sm font-medium text-foreground">Freelancer</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="freelancer-count">
                {data.freelancer.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{freelancerPercent}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
