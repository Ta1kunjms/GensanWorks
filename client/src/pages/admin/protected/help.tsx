/**
 * Admin Help Page
 * Route: /admin/help
 * Only accessible to users with role='admin'
 * Comprehensive FAQ and support documentation
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, FileText, HelpCircle, ChevronDown, Mail, Phone, Globe } from "lucide-react";

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: "Getting Started",
      question: "What is GensanWorks?",
      answer: "GensanWorks is an Official Job Assistance Platform for PESO (Public Employment Service Office) in General Santos City. It helps connect job seekers with employers and manages employment records.",
    },
    {
      category: "Getting Started",
      question: "How do I navigate the admin dashboard?",
      answer: "The left sidebar contains all main sections: Dashboard (overview), Applicants, Employers, Jobs, Matching, Reports, Users, Access Requests, and Settings. Click any menu item to navigate.",
    },
    {
      category: "Getting Started",
      question: "What are the different user roles?",
      answer: "There are 3 main roles: Admin (manages the platform), Employers (post jobs and manage applications), and Job Seekers/Applicants (search jobs and apply).",
    },

    // Applicants
    {
      category: "Applicants",
      question: "How do I add a new applicant?",
      answer: "Go to Applicants page and click 'Add Applicant' button. Fill in their personal details (name, contact info, barangay, education, skills, work experience). Click Save to create the applicant profile.",
    },
    {
      category: "Applicants",
      question: "How do I edit an applicant's information?",
      answer: "Navigate to the Applicants page, find the applicant you want to edit, and click the edit icon. Update their details and save changes.",
    },
    {
      category: "Applicants",
      question: "What information is required for a new applicant?",
      answer: "Required fields include: First Name, Last Name, Email, Contact Number, Barangay, Municipality, Province, Date of Birth, Sex, and Civil Status. Additional optional fields include education, technical training, language proficiency, and work experience.",
    },
    {
      category: "Applicants",
      question: "How do I filter applicants by employment status?",
      answer: "On the Applicants page, use the status filter dropdown to view applicants by: Employed, Unemployed, Self-employed, or New Entrant. You can also search by name or contact details.",
    },
    {
      category: "Applicants",
      question: "How do I delete an applicant record?",
      answer: "In the Applicants table, locate the applicant and click the delete/trash icon. Confirm the deletion when prompted. Note: This action cannot be undone.",
    },

    // Employers
    {
      category: "Employers",
      question: "How do I add a new employer?",
      answer: "Go to Employers page and click 'Add Employer' button. Enter company name, industry, contact person details, address, and contact information. Save to create the employer account.",
    },
    {
      category: "Employers",
      question: "What company details are required?",
      answer: "Required: Company Name, Industry, Contact Person Name, Email, Phone Number, Barangay, Municipality, Province, and Address.",
    },
    {
      category: "Employers",
      question: "How do I manage employer access requests?",
      answer: "Go to Access Requests page to see pending employer registration requests. Review applicant information and click Approve to activate their account or Reject to deny access.",
    },
    {
      category: "Employers",
      question: "Can I edit employer information?",
      answer: "Yes, go to Employers page, find the employer, and click the edit icon. Update their company details and save changes.",
    },

    // Jobs
    {
      category: "Jobs",
      question: "How do I add a new job posting?",
      answer: "Go to Jobs page and click 'Add Job Post'. Select an employer, enter job title, description, salary range, location, and required qualifications. Click Save to publish the job.",
    },
    {
      category: "Jobs",
      question: "What details should I include in a job posting?",
      answer: "Include: Job Title, Employer, Job Description, Salary Range (from/to), Location/Barangay, Employment Type (Full-time, Part-time, etc.), Required Skills, Qualifications, and Application Deadline.",
    },
    {
      category: "Jobs",
      question: "How do I manage job applications?",
      answer: "Go to Jobs page, select a job, and view all applications. You can update application status (Pending, Reviewed, Shortlisted, Hired, Rejected) by clicking on each application.",
    },
    {
      category: "Jobs",
      question: "How do I close or archive a job posting?",
      answer: "Click the job to open details, then look for the Close/Archive button. This will mark the job as inactive and prevent new applications.",
    },

    // Matching
    {
      category: "Matching",
      question: "What is the Matching feature?",
      answer: "Matching helps connect qualified applicants with suitable job positions automatically. It analyzes applicant skills, experience, and location against job requirements.",
    },
    {
      category: "Matching",
      question: "How do I run automated matching?",
      answer: "Go to Matching page and click 'Run Matching'. The system will analyze all active applicants and available jobs, then suggest matches based on qualifications.",
    },
    {
      category: "Matching",
      question: "Can I manually match applicants with jobs?",
      answer: "Yes, on the Matching page you can manually select an applicant and job, then create a match. This is useful when the automated system doesn't catch a good fit.",
    },

    // Reports & Analytics
    {
      category: "Reports",
      question: "What reports are available?",
      answer: "Available reports include: Employment Status Distribution, Applicants in General Santos City, Monthly Referrals, Job Seeker Demographics, and Employer Activity. Access from Reports page.",
    },
    {
      category: "Reports",
      question: "How do I export reports?",
      answer: "Most pages have an 'Export' or 'Generate Report' button. Select date range if prompted, then choose export format (typically CSV or PDF). The file will download automatically.",
    },
    {
      category: "Reports",
      question: "How do I generate employment statistics?",
      answer: "Go to Dashboard to see real-time statistics. For detailed reports, use the Reports page to generate reports by employment status, location, or date range.",
    },
    {
      category: "Reports",
      question: "Can I filter reports by date range?",
      answer: "Yes, most reports have date range filters. Select Start Date and End Date, then apply filter to update the report data.",
    },

    // Dashboard
    {
      category: "Dashboard",
      question: "What information is shown on the Dashboard?",
      answer: "The Dashboard displays: Total Applicants, Total Employers, Total Jobs, Total Matches, Employment Status Breakdown, Applicants in General Santos City, and Monthly Referral Trends.",
    },
    {
      category: "Dashboard",
      question: "How do I refresh dashboard data?",
      answer: "Click the Refresh icon (circular arrows) in the top right of the dashboard. This will update all statistics and charts with the latest data.",
    },
    {
      category: "Dashboard",
      question: "What do the charts represent?",
      answer: "Charts show: Employment Status (Employed, Unemployed, Self-employed, New Entrant), Geographic Distribution (Applicants in General Santos City), Monthly Referrals (hiring trends over time).",
    },

    // Users & Permissions
    {
      category: "Users & Permissions",
      question: "How do I manage admin users?",
      answer: "Go to Users page to view all admin users. Click on a user to view their details. Admins can edit or deactivate user accounts.",
    },
    {
      category: "Users & Permissions",
      question: "How do I create a new admin user?",
      answer: "Go to Users page and click 'Add Admin User'. Enter name, email, set a password, and assign their role. Save to create the admin account.",
    },
    {
      category: "Users & Permissions",
      question: "Can I reset a user's password?",
      answer: "Go to Users page, find the user, and click Edit. Look for Password Reset option and set a new temporary password. User will be notified of the new password.",
    },
    {
      category: "Users & Permissions",
      question: "How do I deactivate a user account?",
      answer: "Go to Users page, find the user account, and click Deactivate. The user will no longer be able to access the system.",
    },

    // Settings
    {
      category: "Settings",
      question: "What settings can I configure?",
      answer: "Settings include: System Configuration, Email Settings, Notification Preferences, User Roles and Permissions, Database Backups, and System Logs.",
    },
    {
      category: "Settings",
      question: "How do I configure email notifications?",
      answer: "Go to Settings > Email Configuration. Enter SMTP server details, configure notification templates for applicants and employers, and test the settings.",
    },

    // Troubleshooting
    {
      category: "Troubleshooting",
      question: "Why can't I see some applicants in search results?",
      answer: "Applicants may be filtered by status, barangay, or search criteria. Check all active filters at the top of the Applicants page and clear any that might be hiding results.",
    },
    {
      category: "Troubleshooting",
      question: "What should I do if a page won't load?",
      answer: "Try refreshing the page (F5), clearing browser cache, or logging out and logging back in. If the problem persists, contact technical support.",
    },
    {
      category: "Troubleshooting",
      question: "How do I recover deleted data?",
      answer: "Deleted records cannot be recovered. Always ensure data is backed up regularly. Contact system administrator for backup restoration.",
    },
    {
      category: "Troubleshooting",
      question: "The dashboard numbers don't match my records?",
      answer: "Click Refresh on the dashboard. If numbers still don't match, check that all filters are cleared and verify the date range settings.",
    },

    // Best Practices
    {
      category: "Best Practices",
      question: "How often should I back up data?",
      answer: "Regular backups should be performed daily. Configure automatic backups in Settings to ensure data protection.",
    },
    {
      category: "Best Practices",
      question: "What's the best way to manage large numbers of applicants?",
      answer: "Use filters to organize by status, barangay, or skills. Create targeted reports for specific regions or employment statuses to manage data more effectively.",
    },
    {
      category: "Best Practices",
      question: "How should I handle duplicate applicant records?",
      answer: "Review duplicate records carefully to confirm they're the same person. Keep the more complete record and delete duplicates to maintain data integrity.",
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-[1920px]">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
          <p className="text-slate-600 mt-1">Get answers to your questions and learn how to use GensanWorks</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-blue-100 rounded-lg p-2 group-hover:bg-blue-200 transition">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Comprehensive FAQ</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Browse answers to frequently asked questions organized by topic</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-green-300 hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-green-100 rounded-lg p-2 group-hover:bg-green-200 transition">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Step-by-Step Guides</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Learn how to perform common tasks with detailed instructions</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-purple-300 hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-purple-100 rounded-lg p-2 group-hover:bg-purple-200 transition">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Get in touch with our support team for additional help</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search help topics (e.g., 'How to add applicant', 'export data')..."
            className="pl-10 w-full py-6 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          
          {searchQuery ? (
            // Search Results
            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                <>
                  <p className="text-sm text-slate-600">Found {filteredFAQs.length} results for "{searchQuery}"</p>
              {filteredFAQs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition cursor-pointer overflow-hidden"
                      onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    >
                      <div className="p-4 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="font-medium text-slate-900 text-sm">{faq.question}</h3>
                          {expandedFAQ === idx && (
                            <p className="text-slate-600 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${
                            expandedFAQ === idx ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-slate-600">No results found for "{searchQuery}". Try a different search term.</p>
                </Card>
              )}
            </div>
          ) : (
            // Categorized FAQs
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-2 mt-4">
                  {faqs
                    .filter((faq) => faq.category === category)
                    .map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition cursor-pointer overflow-hidden"
                        onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                      >
                        <div className="p-4 flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 text-sm">{faq.question}</h3>
                            {expandedFAQ === idx && (
                              <p className="text-slate-600 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform ${
                              expandedFAQ === idx ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Still need help?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Our support team is available to assist you with any questions or issues.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-50 rounded-lg p-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-900">Email</p>
              </div>
              <p className="text-sm text-slate-600 ml-11">support@gensanworks.gov.ph</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-50 rounded-lg p-2">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-semibold text-slate-900">Phone</p>
              </div>
              <p className="text-sm text-slate-600 ml-11">(083) 501-1234</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-50 rounded-lg p-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-semibold text-slate-900">Office Hours</p>
              </div>
              <p className="text-sm text-slate-600 ml-11">Mon - Fri, 8:00 AM - 5:00 PM</p>
            </div>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Us a Message
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="text-amber-600 font-semibold">•</span>
              <span>Use keyboard shortcut <kbd className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-mono">Ctrl+K</kbd> to search across the platform</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-semibold">•</span>
              <span>Hover over icons to see helpful tooltips</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-semibold">•</span>
              <span>Use filters on list pages to find exactly what you need</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-semibold">•</span>
              <span>Export data regularly to keep local backups</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-semibold">•</span>
              <span>Check the Dashboard weekly for platform updates and statistics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
