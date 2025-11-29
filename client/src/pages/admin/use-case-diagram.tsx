import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function UseCaseDiagram() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);

      // Get all diagram pages
      const pages = document.querySelectorAll('.diagram-page');
      
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center the image on the page
        const x = margin;
        const y = margin;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }

      pdf.save('GensanWorks_Admin_Use_Case_Diagram.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Use Case Diagram</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive visualization of administrator functionalities in GensanWorks
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button 
                onClick={generatePDF} 
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Use Case Diagram Preview
            </CardTitle>
            <CardDescription>
              Below is the comprehensive use case diagram showing all administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Page 1: Use Case Diagram */}
              <div className="diagram-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
                <UseCaseDiagramPage1 />
              </div>

              {/* Page 2: Use Case Descriptions Part 1 */}
              <div className="diagram-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
                <UseCaseDescriptionsPage1 />
              </div>

              {/* Page 3: Use Case Descriptions Part 2 */}
              <div className="diagram-page bg-white p-8 rounded-lg border-2 border-gray-200 print:border-0">
                <UseCaseDescriptionsPage2 />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .diagram-page, .diagram-page * {
            visibility: visible;
          }
          .diagram-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            page-break-after: always;
          }
          nav, header, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Page 1: Main Use Case Diagram
function UseCaseDiagramPage1() {
  return (
    <div className="w-full h-auto min-h-[1000px] relative">
      {/* Header removed for A4 fit */}

      {/* SVG Use Case Diagram */}
      <svg viewBox="0 0 900 1850" className="w-full border border-gray-300 rounded-lg bg-white">
        {/* Title (boundary removed) */}
        <text x="445" y="35" textAnchor="middle" className="text-sm font-semibold">GensanWorks Admin System</text>

        {/* Admin Actor */}
        <g id="admin-actor">
          {/* Stick figure */}
          <circle cx="60" cy="800" r="18" fill="none" stroke="#333" strokeWidth="2"/>
          <line x1="60" y1="818" x2="60" y2="860" stroke="#333" strokeWidth="2"/>
          <line x1="60" y1="835" x2="35" y2="855" stroke="#333" strokeWidth="2"/>
          <line x1="60" y1="835" x2="85" y2="855" stroke="#333" strokeWidth="2"/>
          <line x1="60" y1="860" x2="35" y2="895" stroke="#333" strokeWidth="2"/>
          <line x1="60" y1="860" x2="85" y2="895" stroke="#333" strokeWidth="2"/>
          <text x="60" y="915" textAnchor="middle" className="text-xs font-semibold">Administrator</text>
        </g>

        {/* Use Cases - Column 1 (Left) */}
        {/* Use Case 1: Authentication */}
        <ellipse cx="220" cy="100" rx="70" ry="30" fill="#E3F2FD" stroke="#1976D2" strokeWidth="2"/>
        <text x="220" y="96" textAnchor="middle" className="text-[11px]">Admin</text>
        <text x="220" y="108" textAnchor="middle" className="text-[11px]">Authentication</text>
        <line x1="85" y1="800" x2="160" y2="115" stroke="#666" strokeWidth="1.5"/>

        {/* Use Case 2: View Dashboard */}
        <ellipse cx="220" cy="170" rx="70" ry="30" fill="#E3F2FD" stroke="#1976D2" strokeWidth="2"/>
        <text x="220" y="166" textAnchor="middle" className="text-[11px]">View Dashboard</text>
        <text x="220" y="178" textAnchor="middle" className="text-[11px]">Summary</text>
        <line x1="85" y1="800" x2="165" y2="190" stroke="#666" strokeWidth="1.5"/>

        {/* Use Case 3: Manage Applicants */}
        <ellipse cx="220" cy="260" rx="70" ry="30" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2"/>
        <text x="220" y="256" textAnchor="middle" className="text-[11px]">Manage</text>
        <text x="220" y="268" textAnchor="middle" className="text-[11px]">Applicants</text>
        <line x1="85" y1="800" x2="175" y2="280" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Manage Applicants (right column circles) */}
        <ellipse cx="620" cy="220" rx="65" ry="25" fill="white" stroke="#689F38" strokeWidth="1.5"/>
        <text x="620" y="218" textAnchor="middle" className="text-[9px]">View</text>
        <text x="620" y="228" textAnchor="middle" className="text-[9px]">Details</text>
        <line x1="290" y1="255" x2="596" y2="232" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="244" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="270" rx="65" ry="25" fill="white" stroke="#689F38" strokeWidth="1.5"/>
        <text x="620" y="268" textAnchor="middle" className="text-[9px]">Edit Info</text>
        <line x1="290" y1="260" x2="596" y2="270" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="265" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="320" rx="65" ry="25" fill="white" stroke="#689F38" strokeWidth="1.5"/>
        <text x="620" y="318" textAnchor="middle" className="text-[9px]">Delete /</text>
        <text x="620" y="328" textAnchor="middle" className="text-[9px]">Export</text>
        <line x1="290" y1="268" x2="596" y2="308" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="288" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 4: Manage Employers */}
        <ellipse cx="220" cy="380" rx="70" ry="30" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2"/>
        <text x="220" y="376" textAnchor="middle" className="text-[11px]">Manage</text>
        <text x="220" y="388" textAnchor="middle" className="text-[11px]">Employers</text>
        <line x1="85" y1="800" x2="180" y2="400" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Manage Employers */}
        <ellipse cx="620" cy="370" rx="65" ry="25" fill="white" stroke="#689F38" strokeWidth="1.5"/>
        <text x="620" y="368" textAnchor="middle" className="text-[9px]">Verify</text>
        <text x="620" y="378" textAnchor="middle" className="text-[9px]">Account</text>
        <line x1="290" y1="380" x2="596" y2="378" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="379" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="420" rx="65" ry="25" fill="white" stroke="#689F38" strokeWidth="1.5"/>
        <text x="620" y="418" textAnchor="middle" className="text-[9px]">Suspend /</text>
        <text x="620" y="428" textAnchor="middle" className="text-[9px]">Delete</text>
        <line x1="290" y1="388" x2="596" y2="410" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="399" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 5: Manage Job Postings */}
        <ellipse cx="220" cy="490" rx="70" ry="30" fill="#FFF3E0" stroke="#F57C00" strokeWidth="2"/>
        <text x="220" y="486" textAnchor="middle" className="text-[11px]">Manage Job</text>
        <text x="220" y="498" textAnchor="middle" className="text-[11px]">Postings</text>
        <line x1="85" y1="800" x2="185" y2="510" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Job Postings */}
        <ellipse cx="620" cy="470" rx="65" ry="25" fill="white" stroke="#FBC02D" strokeWidth="1.5"/>
        <text x="620" y="468" textAnchor="middle" className="text-[9px]">Approve /</text>
        <text x="620" y="478" textAnchor="middle" className="text-[9px]">Reject</text>
        <line x1="290" y1="485" x2="596" y2="472" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="479" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="520" rx="65" ry="25" fill="white" stroke="#FBC02D" strokeWidth="1.5"/>
        <text x="620" y="518" textAnchor="middle" className="text-[9px]">Archive /</text>
        <text x="620" y="528" textAnchor="middle" className="text-[9px]">Feature</text>
        <line x1="290" y1="493" x2="596" y2="510" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="502" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="570" rx="65" ry="25" fill="white" stroke="#FBC02D" strokeWidth="1.5"/>
        <text x="620" y="568" textAnchor="middle" className="text-[9px]">Posting</text>
        <text x="620" y="578" textAnchor="middle" className="text-[9px]">Analytics</text>
        <line x1="290" y1="500" x2="596" y2="554" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="527" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 6: Manage Applications */}
        <ellipse cx="220" cy="600" rx="70" ry="30" fill="#FFF3E0" stroke="#F57C00" strokeWidth="2"/>
        <text x="220" y="596" textAnchor="middle" className="text-[11px]">Manage</text>
        <text x="220" y="608" textAnchor="middle" className="text-[11px]">Applications</text>
        <line x1="85" y1="800" x2="185" y2="620" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Applications */}
        <ellipse cx="620" cy="620" rx="65" ry="25" fill="white" stroke="#FBC02D" strokeWidth="1.5"/>
        <text x="620" y="618" textAnchor="middle" className="text-[9px]">Update</text>
        <text x="620" y="628" textAnchor="middle" className="text-[9px]">Status</text>
        <line x1="290" y1="600" x2="596" y2="614" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="607" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="670" rx="65" ry="25" fill="white" stroke="#FBC02D" strokeWidth="1.5"/>
        <text x="620" y="668" textAnchor="middle" className="text-[9px]">Match</text>
        <text x="620" y="678" textAnchor="middle" className="text-[9px]">Score</text>
        <line x1="290" y1="608" x2="596" y2="658" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="633" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 7: Manage Referrals */}
        <ellipse cx="220" cy="710" rx="70" ry="30" fill="#FCE4EC" stroke="#C2185B" strokeWidth="2"/>
        <text x="220" y="706" textAnchor="middle" className="text-[11px]">Manage</text>
        <text x="220" y="718" textAnchor="middle" className="text-[11px]">Referrals</text>
        <line x1="85" y1="800" x2="185" y2="725" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Referrals */}
        <ellipse cx="620" cy="720" rx="65" ry="25" fill="white" stroke="#E91E63" strokeWidth="1.5"/>
        <text x="620" y="718" textAnchor="middle" className="text-[9px]">Create</text>
        <text x="620" y="728" textAnchor="middle" className="text-[9px]">Referral</text>
        <line x1="290" y1="710" x2="596" y2="716" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="713" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="770" rx="65" ry="25" fill="white" stroke="#E91E63" strokeWidth="1.5"/>
        <text x="620" y="768" textAnchor="middle" className="text-[9px]">Track</text>
        <text x="620" y="778" textAnchor="middle" className="text-[9px]">Follow-up</text>
        <line x1="290" y1="718" x2="596" y2="760" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="739" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="820" rx="65" ry="25" fill="white" stroke="#E91E63" strokeWidth="1.5"/>
        <text x="620" y="818" textAnchor="middle" className="text-[9px]">Print</text>
        <text x="620" y="828" textAnchor="middle" className="text-[9px]">Slip</text>
        <line x1="290" y1="725" x2="596" y2="804" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="764" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 8: View Analytics */}
        <ellipse cx="220" cy="820" rx="70" ry="30" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2"/>
        <text x="220" y="816" textAnchor="middle" className="text-[11px]">View Analytics</text>
        <text x="220" y="828" textAnchor="middle" className="text-[11px]">& Dashboards</text>
        <line x1="85" y1="800" x2="155" y2="820" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Analytics */}
        <ellipse cx="620" cy="870" rx="65" ry="25" fill="white" stroke="#0288D1" strokeWidth="1.5"/>
        <text x="620" y="868" textAnchor="middle" className="text-[9px]">View</text>
        <text x="620" y="878" textAnchor="middle" className="text-[9px]">Trends</text>
        <line x1="290" y1="820" x2="596" y2="858" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="839" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="920" rx="65" ry="25" fill="white" stroke="#0288D1" strokeWidth="1.5"/>
        <text x="620" y="918" textAnchor="middle" className="text-[9px]">Market</text>
        <text x="620" y="928" textAnchor="middle" className="text-[9px]">Intel</text>
        <line x1="290" y1="828" x2="596" y2="908" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="868" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 9: Generate Reports */}
        <ellipse cx="220" cy="930" rx="70" ry="30" fill="#F3E5F5" stroke="#7B1FA2" strokeWidth="2"/>
        <text x="220" y="926" textAnchor="middle" className="text-[11px]">Generate</text>
        <text x="220" y="938" textAnchor="middle" className="text-[11px]">Reports</text>
        <line x1="85" y1="800" x2="165" y2="915" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Reports */}
        <ellipse cx="620" cy="970" rx="65" ry="25" fill="white" stroke="#8E24AA" strokeWidth="1.5"/>
        <text x="620" y="968" textAnchor="middle" className="text-[9px]">Standard</text>
        <text x="620" y="978" textAnchor="middle" className="text-[9px]">Reports</text>
        <line x1="290" y1="925" x2="596" y2="958" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="941" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="1020" rx="65" ry="25" fill="white" stroke="#8E24AA" strokeWidth="1.5"/>
        <text x="620" y="1018" textAnchor="middle" className="text-[9px]">NSRP</text>
        <text x="620" y="1028" textAnchor="middle" className="text-[9px]">Comp.</text>
        <line x1="290" y1="933" x2="596" y2="1008" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="970" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="1070" rx="65" ry="25" fill="white" stroke="#8E24AA" strokeWidth="1.5"/>
        <text x="620" y="1068" textAnchor="middle" className="text-[9px]">Schedule</text>
        <text x="620" y="1078" textAnchor="middle" className="text-[9px]">Reports</text>
        <line x1="290" y1="940" x2="596" y2="1056" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="998" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 10: System Configuration */}
        <ellipse cx="220" cy="1040" rx="70" ry="30" fill="#FFF3E0" stroke="#E65100" strokeWidth="2"/>
        <text x="220" y="1036" textAnchor="middle" className="text-[11px]">System</text>
        <text x="220" y="1048" textAnchor="middle" className="text-[11px]">Configuration</text>
        <line x1="85" y1="800" x2="175" y2="1020" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Configuration */}
        <ellipse cx="620" cy="1120" rx="65" ry="25" fill="white" stroke="#EF6C00" strokeWidth="1.5"/>
        <text x="620" y="1118" textAnchor="middle" className="text-[9px]">User</text>
        <text x="620" y="1128" textAnchor="middle" className="text-[9px]">Settings</text>
        <line x1="290" y1="1040" x2="596" y2="1108" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1074" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="1170" rx="65" ry="25" fill="white" stroke="#EF6C00" strokeWidth="1.5"/>
        <text x="620" y="1168" textAnchor="middle" className="text-[9px]">Security</text>
        <text x="620" y="1178" textAnchor="middle" className="text-[9px]">Settings</text>
        <line x1="290" y1="1048" x2="596" y2="1158" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1103" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 11: Manage Notifications */}
        <ellipse cx="220" cy="1150" rx="70" ry="30" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2"/>
        <text x="220" y="1146" textAnchor="middle" className="text-[11px]">Manage</text>
        <text x="220" y="1158" textAnchor="middle" className="text-[11px]">Notifications</text>
        <line x1="85" y1="800" x2="180" y2="1130" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for Notifications */}
        <ellipse cx="620" cy="1220" rx="65" ry="25" fill="white" stroke="#4CAF50" strokeWidth="1.5"/>
        <text x="620" y="1218" textAnchor="middle" className="text-[9px]">Broadcast</text>
        <text x="620" y="1228" textAnchor="middle" className="text-[9px]">Message</text>
        <line x1="290" y1="1150" x2="596" y2="1208" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1179" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="1270" rx="65" ry="25" fill="white" stroke="#4CAF50" strokeWidth="1.5"/>
        <text x="620" y="1268" textAnchor="middle" className="text-[9px]">Email</text>
        <text x="620" y="1278" textAnchor="middle" className="text-[9px]">Template</text>
        <line x1="290" y1="1158" x2="596" y2="1258" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1208" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Use Case 12: System Health */}
        <ellipse cx="220" cy="1260" rx="70" ry="30" fill="#FFEBEE" stroke="#C62828" strokeWidth="2"/>
        <text x="220" y="1256" textAnchor="middle" className="text-[11px]">System Health</text>
        <text x="220" y="1268" textAnchor="middle" className="text-[11px]">Monitoring</text>
        <line x1="85" y1="800" x2="185" y2="1245" stroke="#666" strokeWidth="1.5"/>

        {/* Sub-use cases for System Health */}
        <ellipse cx="620" cy="1320" rx="65" ry="25" fill="white" stroke="#D32F2F" strokeWidth="1.5"/>
        <text x="620" y="1318" textAnchor="middle" className="text-[9px]">Perf.</text>
        <text x="620" y="1328" textAnchor="middle" className="text-[9px]">Metrics</text>
        <line x1="290" y1="1260" x2="596" y2="1308" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1284" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        <ellipse cx="620" cy="1370" rx="65" ry="25" fill="white" stroke="#D32F2F" strokeWidth="1.5"/>
        <text x="620" y="1368" textAnchor="middle" className="text-[9px]">Error</text>
        <text x="620" y="1378" textAnchor="middle" className="text-[9px]">Logs</text>
        <line x1="290" y1="1268" x2="596" y2="1358" stroke="#999" strokeWidth="1" strokeDasharray="4,3"/>
        <text x="443" y="1313" className="text-[8px] fill-gray-600">&lt;&lt;include&gt;&gt;</text>

        {/* Legend - compact circles */}
        <g transform="translate(240, 1460)">
          <text x="0" y="0" className="text-xs font-semibold">Legend</text>
          <g transform="translate(0, 14)">
            <circle cx="8" cy="8" r="8" fill="#E3F2FD" stroke="#1976D2" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Authentication</text>
          </g>
          <g transform="translate(110, 14)">
            <circle cx="8" cy="8" r="8" fill="#E8F5E9" stroke="#388E3C" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">User Mgmt</text>
          </g>
          <g transform="translate(200, 14)">
            <circle cx="8" cy="8" r="8" fill="#FFF3E0" stroke="#F57C00" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Job/App</text>
          </g>
          <g transform="translate(270, 14)">
            <circle cx="8" cy="8" r="8" fill="#FCE4EC" stroke="#C2185B" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Referrals</text>
          </g>
          <g transform="translate(0, 34)">
            <circle cx="8" cy="8" r="8" fill="#E1F5FE" stroke="#0288D1" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Analytics</text>
          </g>
            <g transform="translate(110, 34)">
            <circle cx="8" cy="8" r="8" fill="#F3E5F5" stroke="#7B1FA2" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Reports</text>
          </g>
          <g transform="translate(180, 34)">
            <circle cx="8" cy="8" r="8" fill="#FFF3E0" stroke="#E65100" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Config</text>
          </g>
          <g transform="translate(240, 34)">
            <circle cx="8" cy="8" r="8" fill="#E8F5E9" stroke="#388E3C" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Notif.</text>
          </g>
          <g transform="translate(300, 34)">
            <circle cx="8" cy="8" r="8" fill="#FFEBEE" stroke="#C62828" strokeWidth="1"/>
            <text x="22" y="12" className="text-[8px]">Sys Health</text>
          </g>
        </g>
      </svg>

      {/* Footer removed for A4 fit */}
    </div>
  );
}

// Page 2: Use Case Descriptions Part 1
function UseCaseDescriptionsPage1() {
  const useCases1 = [
    {
      name: "Admin Authentication",
      description: "This use case is used by administrators to securely log into the system and gain access to their administrative privileges. Authentication ensures a secure disconnect, preventing unauthorized access to administrative features."
    },
    {
      name: "View Dashboard Summary",
      description: "Administrators can view comprehensive dashboard showing key performance indicators, statistics, and recent activities. The dashboard provides real-time overview of applicants, employers, job postings, applications, and referrals with visual charts and metrics."
    },
    {
      name: "Manage Applicant Accounts",
      description: "Administrators can manage applicant accounts in various ways. This includes viewing complete applicant profiles, editing applicant information, deleting or archiving accounts, exporting applicant data, and bulk importing applicants from CSV/Excel files."
    },
    {
      name: "Manage Employer Accounts",
      description: "Administrators can manage employer accounts including verifying employer registration and business documents, editing company information, suspending or unsuspending accounts for policy violations, and deleting employer accounts when necessary."
    },
    {
      name: "Manage Job Postings",
      description: "Administrators can oversee all job postings in the system. This includes reviewing and approving pending job postings, editing job details, archiving filled or expired positions, featuring priority job postings, and viewing job posting analytics and performance metrics."
    },
    {
      name: "Manage Job Applications",
      description: "Administrators can track and manage all job applications submitted by applicants. This includes viewing application details, updating application status through the workflow, viewing AI-generated match scores, adding admin notes, bulk status updates, and generating application reports."
    }
  ];

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Table 1</h2>
        <p className="text-lg text-gray-700 mt-2">Use Cases of Administrator (Part 1)</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-2 border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-gray-400 p-3 text-left font-bold w-1/3">Use Case</th>
            <th className="border-2 border-gray-400 p-3 text-left font-bold w-2/3">Description</th>
          </tr>
        </thead>
        <tbody>
          {useCases1.map((useCase, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border-2 border-gray-400 p-3 align-top font-semibold">
                {useCase.name}
              </td>
              <td className="border-2 border-gray-400 p-3 align-top text-sm leading-relaxed">
                {useCase.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p className="font-semibold">GensanWorks Administrator Use Case Descriptions</p>
        <p>Page 2 of 3</p>
      </div>
    </div>
  );
}

// Page 3: Use Case Descriptions Part 2
function UseCaseDescriptionsPage2() {
  const useCases2 = [
    {
      name: "Manage Referrals",
      description: "Administrators can create, track, and manage referrals between applicants and employers. This includes creating new referral slips, updating referral status, tracking follow-up schedules, printing referral slips for submission, logging communication with employers and applicants, and generating referral outcome reports."
    },
    {
      name: "View Analytics & Dashboards",
      description: "Administrators can access comprehensive analytics dashboards showing system performance metrics, user trends, and employment statistics. Features include viewing applicant demographics, employer activity trends, job market intelligence, supply-demand analysis, customizable dashboard widgets, and real-time statistics with auto-refresh."
    },
    {
      name: "Generate Reports",
      description: "Administrators can generate various standard and custom reports for different stakeholders. This includes monthly activity summaries, NSRP compliance reports for DOLE submission, placement success reports, custom report builder with filters, scheduled recurring reports via email, and executive summary reports for management."
    },
    {
      name: "System Configuration",
      description: "Administrators with super admin privileges can configure system-wide settings. This includes general settings (office info, branding, timezone), authentication and password policies, email and SMTP configuration, job posting rules and requirements, security settings and access control, managing admin users and permissions, and database maintenance operations."
    },
    {
      name: "Manage Notifications & Communications",
      description: "Administrators can manage all system notifications and communications with users. Features include viewing admin notification inbox, sending direct messages to users, creating broadcast announcements, managing email templates with variables, viewing notification delivery statistics, configuring notification rules and triggers, and handling user support requests."
    },
    {
      name: "System Health Monitoring",
      description: "Administrators can monitor system health and performance metrics in real-time. This includes viewing server status and resource usage, monitoring database performance and response times, tracking error logs and alerts, viewing API performance metrics, performing comprehensive health checks, and accessing system audit logs for troubleshooting."
    }
  ];

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Table 2</h2>
        <p className="text-lg text-gray-700 mt-2">Use Cases of Administrator (Part 2)</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-2 border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-gray-400 p-3 text-left font-bold w-1/3">Use Case</th>
            <th className="border-2 border-gray-400 p-3 text-left font-bold w-2/3">Description</th>
          </tr>
        </thead>
        <tbody>
          {useCases2.map((useCase, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border-2 border-gray-400 p-3 align-top font-semibold">
                {useCase.name}
              </td>
              <td className="border-2 border-gray-400 p-3 align-top text-sm leading-relaxed">
                {useCase.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-300">
        <p className="text-sm leading-relaxed text-gray-700">
          <span className="font-semibold">Summary: </span>
          The 12 major use cases of Administrators provide a comprehensive framework for managing the GensanWorks system. 
          Administrators utilize these cases to handle user management, job and application tracking, referral services, 
          system analytics, reporting, configuration, communications, and system health monitoring. Each use case encompasses 
          multiple sub-functions and workflows, ensuring administrators have complete control and visibility over all 
          aspects of the employment services platform.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p className="font-semibold">GensanWorks Administrator Use Case Descriptions</p>
        <p>Page 3 of 3</p>
      </div>
    </div>
  );
}
