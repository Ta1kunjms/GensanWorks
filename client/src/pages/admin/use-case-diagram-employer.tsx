import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function UseCaseDiagramEmployer() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const el = document.getElementById('ucd-employer');
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = 210, margin = 10, contentWidth = pageWidth - 2*margin;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
      pdf.save('GensanWorks_Use_Case_Diagram_Employer.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <p className="text-2xl font-bold">Use Case Diagram — Employer</p>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" className="gap-2"><Printer className="w-4 h-4"/>Print</Button>
            <Button onClick={generatePDF} disabled={isGenerating} className="gap-2"><Download className="w-4 h-4"/>{isGenerating? 'Generating...' : 'Download PDF'}</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="ucd-employer" className="bg-white p-4 rounded-lg border-2 border-gray-200 print:border-0">
              <svg width="794" height="1123" viewBox="0 0 794 1123" xmlns="http://www.w3.org/2000/svg">
                {/* Actor */}
                <text x="50" y="80" fontSize="16" fontWeight="bold">Actor: Employer</text>

                {/* Main use cases (left column) */}
                <g>
                  <ellipse cx="220" cy="160" rx="95" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="166" fontSize="12" textAnchor="middle">Registration & Sign In</text>

                  <ellipse cx="220" cy="240" rx="100" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="246" fontSize="12" textAnchor="middle">Company Profile Management</text>

                  <ellipse cx="220" cy="320" rx="95" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="326" fontSize="12" textAnchor="middle">Post Job Vacancy</text>

                  <ellipse cx="220" cy="400" rx="95" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="406" fontSize="12" textAnchor="middle">Manage Job Postings</text>

                  <ellipse cx="220" cy="480" rx="95" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="486" fontSize="12" textAnchor="middle">Candidate Search</text>

                  <ellipse cx="220" cy="560" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="566" fontSize="12" textAnchor="middle">Application Review</text>

                  <ellipse cx="220" cy="640" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="646" fontSize="12" textAnchor="middle">Shortlisting</text>

                  <ellipse cx="220" cy="720" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="726" fontSize="12" textAnchor="middle">Interview Scheduling</text>

                  <ellipse cx="220" cy="800" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="806" fontSize="12" textAnchor="middle">Offer & Hiring</text>

                  <ellipse cx="220" cy="880" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="886" fontSize="12" textAnchor="middle">Referral Feedback</text>

                  <ellipse cx="220" cy="960" rx="98" ry="28" fill="#fff" stroke="#1f2937" strokeWidth="2"/>
                  <text x="220" y="966" fontSize="12" textAnchor="middle">Analytics & Reports</text>
                </g>

                {/* Sub use cases (right column, ovals) */}
                <g>
                  <ellipse cx="620" cy="160" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="166" fontSize="12" textAnchor="middle">Verification</text>

                  <ellipse cx="620" cy="230" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="236" fontSize="12" textAnchor="middle">Branding Assets</text>

                  <ellipse cx="620" cy="300" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="306" fontSize="12" textAnchor="middle">Screening Qs</text>

                  <ellipse cx="620" cy="370" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="376" fontSize="12" textAnchor="middle">Archive/Pause</text>

                  <ellipse cx="620" cy="440" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="446" fontSize="12" textAnchor="middle">AI Recs</text>

                  <ellipse cx="620" cy="510" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="516" fontSize="12" textAnchor="middle">Notes/Tags</text>

                  <ellipse cx="620" cy="580" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="586" fontSize="12" textAnchor="middle">Teammates/Roles</text>

                  <ellipse cx="620" cy="650" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="656" fontSize="12" textAnchor="middle">Calendar</text>

                  <ellipse cx="620" cy="720" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="726" fontSize="12" textAnchor="middle">Templates</text>

                  <ellipse cx="620" cy="790" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="796" fontSize="12" textAnchor="middle">Onboarding</text>

                  <ellipse cx="620" cy="860" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="866" fontSize="12" textAnchor="middle">Outcome Report</text>

                  <ellipse cx="620" cy="930" rx="65" ry="25" fill="#fff" stroke="#dc2626" strokeWidth="2"/>
                  <text x="620" y="936" fontSize="12" textAnchor="middle">Exports</text>
                </g>

                {/* Include relationships (dashed) */}
                <g stroke="#6b7280" strokeDasharray="6 4">
                  <line x1="315" y1="160" x2="555" y2="160" strokeWidth="2" />
                  <text x="435" y="150" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="320" y1="240" x2="555" y2="230" strokeWidth="2" />
                  <text x="440" y="220" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="320" x2="555" y2="300" strokeWidth="2" />
                  <text x="435" y="290" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="400" x2="555" y2="370" strokeWidth="2" />
                  <text x="435" y="360" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="480" x2="555" y2="440" strokeWidth="2" />
                  <text x="435" y="430" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="560" x2="555" y2="510" strokeWidth="2" />
                  <text x="435" y="520" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="640" x2="555" y2="580" strokeWidth="2" />
                  <text x="435" y="590" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="720" x2="555" y2="650" strokeWidth="2" />
                  <text x="435" y="670" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="800" x2="555" y2="720" strokeWidth="2" />
                  <text x="435" y="740" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="880" x2="555" y2="860" strokeWidth="2" />
                  <text x="435" y="850" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>

                  <line x1="315" y1="960" x2="555" y2="930" strokeWidth="2" />
                  <text x="435" y="920" fontSize="11" textAnchor="middle">&lt;&lt;include&gt;&gt;</text>
                </g>

                {/* Legend small circles */}
                <g transform="translate(240,1040)">
                  <circle cx="10" cy="0" r="8" fill="#fff" stroke="#1f2937" strokeWidth="2" />
                  <text x="26" y="4" fontSize="11">Main Use Case</text>
                  <circle cx="150" cy="0" r="8" fill="#fff" stroke="#dc2626" strokeWidth="2" />
                  <text x="166" y="4" fontSize="11">Sub Use Case</text>
                  <line x1="280" y1="0" x2="308" y2="0" stroke="#6b7280" strokeDasharray="6 4" strokeWidth="2" />
                  <text x="316" y="4" fontSize="11">include</text>
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
