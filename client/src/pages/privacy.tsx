import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
      <p className="text-slate-700 mb-6">
        This Privacy Policy explains how the City Government of General Santos – PESO collects, uses, and protects your
        personal information in connection with the GensanWorks platform, in accordance with the
        <a className="text-primary ml-1" href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer">Data Privacy Act of 2012 (Republic Act No. 10173)</a>,
        its Implementing Rules and Regulations (IRR), and relevant National Privacy
        Commission (NPC) issuances.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Account details (name, email, contact number)</li>
          <li>Profile information for jobseekers and employers</li>
          <li>Job postings and application data</li>
          <li>System logs (IP address, device/browser information) for security and fraud prevention</li>
          <li>Communications with support (messages, inquiries, and responses)</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">How We Use Information</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Provide and improve employment facilitation services</li>
          <li>Communicate updates, job matches, and service announcements</li>
          <li>Ensure platform security and integrity</li>
          <li>Comply with legal obligations and regulatory reporting</li>
          <li>Conduct aggregated analytics to improve service delivery (non-identifiable)</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Data Sharing</h2>
        <p className="text-slate-700">
          We may share data with authorized government agencies and partner employers strictly for employment facilitation
          purposes, subject to applicable laws and data protection standards.
        </p>
        <p className="text-slate-700">
          Any sharing is governed by data sharing agreements, confidentiality clauses, and safeguards consistent with
          <a className="text-primary ml-1" href="https://privacy.gov.ph/npc-circular-16-01-security-of-personal-data-in-government-agencies/" target="_blank" rel="noopener noreferrer">NPC Circulars</a>
          {" "}and the{" "}
          <a className="text-primary" href="https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/" target="_blank" rel="noopener noreferrer">DPA 2012 IRR</a>.
          {" "}We do not sell personal data.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Your Rights Under the Data Privacy Act</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Right to be informed – understand how your data is collected and used</li>
          <li>Right to object – opt out of certain processing, where applicable</li>
          <li>Right to access – request a copy of your personal data</li>
          <li>Right to rectify – correct inaccurate or incomplete data</li>
          <li>Right to erasure or blocking – request deletion or suspension of processing subject to legal retention</li>
          <li>Right to data portability – obtain and reuse your data in a structured format where applicable</li>
          <li>Right to damages – seek redress for violations under the DPA</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Legal Bases for Processing</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Consent for optional features and communications</li>
          <li>Performance of a public mandate and legitimate interests in employment facilitation</li>
          <li>Compliance with legal obligations and regulatory requirements</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Data Retention</h2>
        <p className="text-slate-700">
          We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, comply
          with legal requirements, and resolve disputes. When retention is no longer necessary, data is securely deleted
          or anonymized.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Security Measures</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Access controls and role-based permissions</li>
          <li>Encryption in transit (HTTPS) and secure storage practices</li>
          <li>Audit logging, secure development lifecycle, and periodic reviews</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Children’s Privacy</h2>
        <p className="text-slate-700">
          The platform is intended for individuals of legal working age. If we learn that data from minors was collected
          without appropriate consent, we will take steps to delete such information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact and Data Protection Officer</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Email: <a href="mailto:peso_gensan@yahoo.com" className="text-primary">peso_gensan@yahoo.com</a></li>
          <li>Phone: <a href="tel:+63835533479" className="text-primary">(083) 553 3479</a></li>
          <li>Address: 4th Flr. GSC Investment Action Center Building, City Hall Compound, GSC</li>
          <li>For privacy concerns, you may also contact the National Privacy Commission: <a className="text-primary" href="https://privacy.gov.ph/" target="_blank" rel="noopener noreferrer">privacy.gov.ph</a></li>
        </ul>
      </section>
    </main>
  );
}
