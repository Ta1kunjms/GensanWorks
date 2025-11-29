import React from "react";

export default function AccessibilityStatement() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Accessibility Statement</h1>
      <p className="text-slate-700 mb-6">
        The City Government of General Santos Public Employment Service Office (PESO) is committed to ensuring that
        our digital services are accessible to all users, including persons with disabilities in accordance with
        Republic Act No. 10754 (Expanded Benefits and Privileges of Persons with Disability) and relevant
        international standards such as <a className="text-primary" href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer">WCAG 2.1 AA</a>.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Conformance Status</h2>
        <p className="text-slate-700">
          We aim for WCAG 2.1 Level AA conformance. The application uses semantic HTML, ARIA attributes where needed,
          keyboard navigability, sufficient color contrast, and descriptive labels for interactive components.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Measures We Implement</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Keyboard-accessible navigation and controls</li>
          <li>Text alternatives for icons and meaningful imagery</li>
          <li>Readable typography and sufficient color contrast</li>
          <li>Consistent component patterns and focus management</li>
          <li>Form validation messages announced to assistive technologies</li>
          <li>
            Governance aligned with
            {" "}
            <a className="text-primary" href="https://privacy.gov.ph/npc-circular-16-01-security-of-personal-data-in-government-agencies/" target="_blank" rel="noopener noreferrer">NPC Circulars</a>
            {" "}on security of personal data in government agencies
          </li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Known Limitations</h2>
        <p className="text-slate-700">
          Some third‑party content or embedded media may not fully meet accessibility standards. We continuously work
          to improve these areas and welcome feedback.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Feedback and Support</h2>
        <p className="text-slate-700">
          If you encounter accessibility barriers, please contact the PESO Helpdesk:
        </p>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Email: <a href="mailto:peso_gensan@yahoo.com" className="text-primary">peso_gensan@yahoo.com</a></li>
          <li>Phone: <a href="tel:+63835533479" className="text-primary">(083) 553 3479</a></li>
          <li>Facebook: <a href="https://www.facebook.com/PESO.GeneralSantos" className="text-primary" target="_blank" rel="noopener noreferrer">PESO General Santos</a></li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Assessment Approach</h2>
        <p className="text-slate-700">
          Accessibility is evaluated through automated tools, manual testing with screen readers, and user feedback.
          We periodically review and update this statement. For privacy considerations, our practices align with the
          <a className="text-primary ml-1" href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer">Data Privacy Act of 2012 (RA 10173)</a>
          {" "}and its <a className="text-primary" href="https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/" target="_blank" rel="noopener noreferrer">Implementing Rules and Regulations</a>.
        </p>
      </section>
    </main>
  );
}
