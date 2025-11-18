import { jsPDF } from "jspdf";
import type { Referral } from "@shared/schema";

export function generateReferralSlipPDF(referral: Referral) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("GensanWorks", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Official Job Assistance Platform of PESO", 105, 28, { align: "center" });
  doc.text("General Santos City", 105, 35, { align: "center" });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);
  
  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("REFERRAL SLIP", 105, 50, { align: "center" });
  
  // Content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  let yPos = 65;
  const lineHeight = 8;
  
  // Referral ID
  doc.setFont("helvetica", "bold");
  doc.text("Referral ID:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.referralId, 70, yPos);
  
  yPos += lineHeight;
  
  // Date Referred
  doc.setFont("helvetica", "bold");
  doc.text("Date Referred:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.dateReferred, 70, yPos);
  
  yPos += lineHeight + 5;
  
  // Applicant Details Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("APPLICANT INFORMATION", 20, yPos);
  doc.setFontSize(11);
  
  yPos += lineHeight;
  
  doc.setFont("helvetica", "bold");
  doc.text("Name:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.applicant, 70, yPos);
  
  yPos += lineHeight + 5;
  
  // Job Details Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("JOB DETAILS", 20, yPos);
  doc.setFontSize(11);
  
  yPos += lineHeight;
  
  doc.setFont("helvetica", "bold");
  doc.text("Position:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.vacancy, 70, yPos);
  
  yPos += lineHeight;
  
  doc.setFont("helvetica", "bold");
  doc.text("Employer:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.employer, 70, yPos);
  
  yPos += lineHeight + 5;
  
  // Status Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("REFERRAL STATUS", 20, yPos);
  doc.setFontSize(11);
  
  yPos += lineHeight;
  
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(referral.status, 70, yPos);
  
  yPos += lineHeight;
  
  doc.setFont("helvetica", "bold");
  doc.text("Feedback:", 20, yPos);
  doc.setFont("helvetica", "normal");
  
  // Handle long feedback text with wrapping
  const feedbackLines = doc.splitTextToSize(referral.feedback, 120);
  doc.text(feedbackLines, 20, yPos + lineHeight);
  
  yPos += lineHeight * (feedbackLines.length + 2);
  
  // Footer
  doc.setLineWidth(0.5);
  doc.line(20, 270, 190, 270);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("This is an official document from GensanWorks PESO", 105, 280, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" });
  
  // Save the PDF
  doc.save(`referral-slip-${referral.referralId}.pdf`);
}
