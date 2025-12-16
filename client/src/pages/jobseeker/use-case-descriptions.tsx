import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function JobseekerUseCases() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; const pageHeight = 297; const margin = 15; const contentWidth = pageWidth - 2*margin;
      const pages = document.querySelectorAll('.jobseeker-usecases-page');
      for (let i=0;i<pages.length;i++) {
        if (i>0) pdf.addPage();
        const canvas = await html2canvas(pages[i] as HTMLElement, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth; const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      }
      pdf.save('GensanWorks_Jobseeker_Use_Cases.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  const useCases1 = [
    { name: "Sign In / Sign Up", description: "Secure account creation and access via email/mobile or SSO with verification, password resets, and session handling." },
    { name: "Manage Profile & Resume", description: "Maintain personal info, education, experience, skills, upload docs, and generate a system resume (PDF)." },
    { name: "Search Jobs", description: "Search with filters, sorting, saved searches, and recommendations based on profile fit and proximity." },
    { name: "View Job Details", description: "Review full vacancy details, employer info, requirements, salary period, and eligibility highlights." },
    { name: "Apply to Job", description: "Submit application with pre-screening answers and required docs; consent and validation enforced." },
    { name: "Track Applications", description: "Track statuses, view timeline and notes, withdraw applications, receive updates." },
  ];

  const useCases2 = [
    { name: "Interview Scheduling", description: "Propose/confirm interview slots with calendar invites and reminders, handle reschedules." },
    { name: "Messaging", description: "In-app messages and alerts for status changes, interviews, and referrals." },
    { name: "Saved Jobs & Alerts", description: "Save/unsave jobs, configure job alerts and saved search notifications." },
    { name: "Account & Security", description: "Change password, manage sessions, enable 2FA where available, and delete account with grace period." },
    { name: "Privacy & Consents", description: "Manage consents, export data, request deletion with audit logs and legal retention handling." },
    { name: "Referrals", description: "Request referral slips, receive unique IDs/PDFs, print and track follow-ups linked to applications." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">Jobseeker Use Case Descriptions</p>
              <p className="text-gray-600 mt-2">Comprehensive list of jobseeker workflows</p>
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
            <div className="jobseeker-usecases-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
              <h2 className="text-xl font-semibold mb-4">Table JS-1</h2>
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

            <div className="jobseeker-usecases-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
              <h2 className="text-xl font-semibold mb-4">Table JS-2</h2>
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
        @media print { .jobseeker-usecases-page { page-break-after: always; } }
      `}</style>
    </div>
  );
}
