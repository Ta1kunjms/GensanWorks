import React from "react";

export default function AboutPESO() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">About PESO</h1>
      <p className="text-slate-700 mb-6">
        The Public Employment Service Office (PESO) of General Santos City serves as a non-fee charging multi‑employment
        service facility that provides employment facilitation services to jobseekers and manpower assistance to
        employers in alignment with national labor policies.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Mandate and Mission</h2>
        <p className="text-slate-700">
          PESO’s mission is to connect jobseekers with decent work opportunities, support employers, and strengthen
          local livelihood through efficient employment facilitation and partnership with national agencies.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Core Services</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Job matching and referral</li>
          <li>Career guidance and employment coaching</li>
          <li>Labor market information dissemination</li>
          <li>Support for local recruitment activities and job fairs</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Get in Touch</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>Email: <a href="mailto:peso_gensan@yahoo.com" className="text-primary">peso_gensan@yahoo.com</a></li>
          <li>Phone: <a href="tel:+63835533479" className="text-primary">(083) 553 3479</a></li>
        </ul>
      </section>
    </main>
  );
}
