import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 p-6">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">PESO — General Santos City</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The Philippine Employment Service Office (PESO) — General Santos City provides employment facilitation,
              labour market information, and referral services for jobseekers and employers.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Services</h3>
                <ul className="list-disc ml-5 text-sm text-muted-foreground">
                  <li>Job matching and referrals</li>
                  <li>Employer job posting and applicant screening</li>
                  <li>Career guidance and trainings</li>
                  <li>Employment fairs and events</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  PESO General Santos City — City Hall Compound, General Santos City
                </p>
                <p className="text-sm text-muted-foreground">Phone: (083) 123-4567 | Email: peso@gensancity.gov.ph</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Link href="/jobseeker/signup">
                <Button variant="default">Sign up as Applicant</Button>
              </Link>

              <Link href="/employer/signup">
                <Button variant="outline">Sign up as Employer</Button>
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 bg-primary/5 p-8 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <img src="/peso-gsc-logo.png" alt="PESO" className="mx-auto h-20 w-20" />
              <h2 className="text-xl font-semibold">Welcome to GensanWorks</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Choose your path: find jobs, post vacancies, and connect with the workforce in General Santos City.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
