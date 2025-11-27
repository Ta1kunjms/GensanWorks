import { Users, Heart, Globe, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PesoMetricsProps {
  placementRate?: number;
  fourPsBeneficiaries?: number;
  ofwApplicants?: number;
  topSkill?: string;
}

export function PesoMetrics({
  placementRate = 0,
  fourPsBeneficiaries = 0,
  ofwApplicants = 0,
  topSkill = "No data",
}: PesoMetricsProps) {
  const metrics = [
    {
      label: "Placement Rate",
      value: `${placementRate.toFixed(1)}%`,
      icon: Award,
      color: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
      textColor: "text-green-600 dark:text-green-300",
      description: "Referrals successfully hired",
    },
    {
      label: "4Ps Beneficiaries",
      value: fourPsBeneficiaries.toString(),
      icon: Heart,
      color: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800",
      textColor: "text-red-600 dark:text-red-300",
      description: "Active 4Ps registered applicants",
    },
    {
      label: "OFW Applicants",
      value: ofwApplicants.toString(),
      icon: Globe,
      color: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800",
      textColor: "text-blue-600 dark:text-blue-300",
      description: "OFW & Former OFW applicants",
    },
    {
      label: "Top Skill Demand",
      value: topSkill,
      icon: Users,
      color: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
      textColor: "text-purple-600 dark:text-purple-300",
      description: "Most requested skill",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className={`pb-3 ${metric.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {metric.label}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {metric.description}
                  </CardDescription>
                </div>
                <Icon className={`w-5 h-5 ${metric.textColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${metric.textColor}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
