import React from "react";

export default function ContactInformation() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h1>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Office</h2>
        <p className="text-slate-700">City Government of General Santos – Public Employment Service Office (PESO)</p>
        <p className="text-slate-700">4th Flr. GSC Investment Action Center Building, City Hall Compound, GSC</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Get in Touch</h2>
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
