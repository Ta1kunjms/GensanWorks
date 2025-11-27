import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface EmploymentStatusChartProps {
  isLoading?: boolean;
  data?: {
    employed: number;
    unemployed: number;
    selfEmployed: number;
    newEntrant: number;
  };
}

export function EmploymentStatusChart({ 
  isLoading, 
  data = { employed: 0, unemployed: 0, selfEmployed: 0, newEntrant: 0 }
}: EmploymentStatusChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-[350px]" />;
  }

  const chartData = [
    { name: "Employed", value: data.employed, color: "#10b981" },
    { name: "Unemployed", value: data.unemployed, color: "#ef4444" },
    { name: "Self-Employed", value: data.selfEmployed, color: "#f59e0b" },
    { name: "New Entrant", value: data.newEntrant, color: "#3b82f6" },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-gray-500">
        <p>No employment data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toString()} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
