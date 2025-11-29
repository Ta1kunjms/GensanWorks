import React from "react";

export default function PESOHelpdesk() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">PESO Helpdesk</h1>
      <p className="text-slate-700 mb-6">
        The PESO Helpdesk assists jobseekers, employers, and partners with account issues, job postings, referrals,
        and general platform support.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">How We Can Help</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Account creation, login assistance, and password reset</li>
          <li>Job posting guidance and moderation support</li>
          <li>Referral slip processing and status tracking</li>
          <li>General inquiries about PESO programs and services</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Contact the Helpdesk</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Email: <a href="mailto:peso_gensan@yahoo.com" className="text-primary">peso_gensan@yahoo.com</a></li>
          <li>Phone: <a href="tel:+63835533479" className="text-primary">(083) 553 3479</a></li>
          <li>Facebook: <a href="https://www.facebook.com/PESO.GeneralSantos" className="text-primary" target="_blank" rel="noopener noreferrer">PESO General Santos</a></li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Service Hours</h2>
        <p className="text-slate-700">Monday–Friday, 8:00 AM–5:00 PM (excluding holidays).</p>
      </section>
    </main>
  );
}
