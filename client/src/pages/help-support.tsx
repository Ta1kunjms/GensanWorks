import React from "react";

export default function HelpSupport() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Help & Support</h1>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">FAQs</h2>
        <div className="space-y-4 text-slate-700">
          <div>
            <h3 className="font-semibold">How do I create an account?</h3>
            <p>Click Sign Up, choose your role (Jobseeker or Employer), and complete the required fields.</p>
          </div>
          <div>
            <h3 className="font-semibold">I forgot my password, what should I do?</h3>
            <p>Use the Forgot Password link on the login page to reset your password via email.</p>
          </div>
          <div>
            <h3 className="font-semibold">How do I post a job?</h3>
            <p>Employers can navigate to their dashboard and choose Create Job Posting. Fill in the job details and submit for review.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Need More Help?</h2>
        <p className="text-slate-700">Contact the PESO Helpdesk:</p>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Email: <a href="mailto:peso_gensan@yahoo.com" className="text-primary">peso_gensan@yahoo.com</a></li>
          <li>Phone: <a href="tel:+63835533479" className="text-primary">(083) 553 3479</a></li>
        </ul>
      </section>
    </main>
  );
}
