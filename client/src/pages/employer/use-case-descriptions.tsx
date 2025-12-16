import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function EmployerUseCases() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; const margin = 15; const contentWidth = pageWidth - 2*margin;
      const pages = document.querySelectorAll('.employer-usecases-page');
      for (let i=0;i<pages.length;i++) {
        if (i>0) pdf.addPage();
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth; const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      }
      pdf.save('GensanWorks_Employer_Use_Cases.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  const useCases1 = [
    { name: "Registration & Sign In", description: "Create and verify employer account with business documents; sign in to manage hiring." },
    { name: "Company Profile Management", description: "Maintain public profile, locations, contacts, industry codes, logos, and NSRP-required fields." },
    { name: "Post Job Vacancy", description: "Create compliant postings with screening questions, required documents, and NSRP fields." },
    { name: "Manage Job Postings", description: "Edit, pause, feature, archive, and extend vacancy visibility within policy." },
    { name: "Candidate Search", description: "Search applicants and use AI recommendations respecting privacy and throttling." },
    { name: "Application Review", description: "View applicants with match scores, review details, add notes/tags, shortlist or reject." },
  ];

  const useCases2 = [
    { name: "Shortlisting", description: "Move candidates to shortlist, manage stages, apply tags, and collaborate." },
    { name: "Interview Scheduling", description: "Coordinate interviews, send calendar invites, handle reschedules and timezone considerations." },
    { name: "Offer & Hiring", description: "Issue offers, mark hires, record start dates, and handoff to onboarding." },
    { name: "Referral Feedback", description: "Provide PESO-required outcomes for referred applicants, with audit trail." },
    { name: "Analytics & Reports", description: "Dashboards for applicants per job, time-to-fill, sources; export and schedule reports." },
    { name: "Notifications & Communications", description: "Receive alerts and message candidates using curated templates and anti-spam limits." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">Employer Use Case Descriptions</p>
              <p className="text-gray-600 mt-2">Comprehensive list of employer workflows</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.print()} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Use Case Descriptions Preview
            </CardTitle>
            <CardDescription>Two A4 pages, ready for export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="employer-usecases-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
              <h2 className="text-xl font-semibold mb-4">Table ER-1</h2>
              <table className="w-full border-collapse border-2 border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-2 border-gray-400 p-3 text-left font-bold w-1/3">Use Case</th>
                    <th className="border-2 border-gray-400 p-3 text-left font-bold w-2/3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases1.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-400 p-3 align-top font-semibold">{u.name}</td>
                      <td className="border-2 border-gray-400 p-3 align-top text-sm leading-relaxed">{u.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="employer-usecases-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
              <h2 className="text-xl font-semibold mb-4">Table ER-2</h2>
              <table className="w-full border-collapse border-2 border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-2 border-gray-400 p-3 text-left font-bold w-1/3">Use Case</th>
                    <th className="border-2 border-gray-400 p-3 text-left font-bold w-2/3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases2.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-400 p-3 align-top font-semibold">{u.name}</td>
                      <td className="border-2 border-gray-400 p-3 align-top text-sm leading-relaxed">{u.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print { .employer-usecases-page { page-break-after: always; } }
      `}</style>
    </div>
  );
}
