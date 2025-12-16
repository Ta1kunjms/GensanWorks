import { storage } from "../server/storage";
import type { Employer } from "../server/unified-schema";

async function main() {
  // Create a simple employer
  const employer: Employer = {
    id: `emp_seed_${Date.now()}`,
    establishmentName: "Gensan Fresh Foods",
    barangay: "Lagao",
    municipality: "General Santos City",
    province: "South Cotabato",
    contactNumber: "09171234567",
    email: "hr@gensanfreshfoods.ph",
    companyIndustry: "Food & Beverage",
    companyType: "Private",
    companySize: "Small",
    status: "active",
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Employer;

  const createdEmployer = await storage.addEmployer(employer);

  const jobs = [
    {
      positionTitle: "Production Supervisor",
      description: "Oversee daily production line, ensure quality and safety compliance.",
      location: "Lagao, General Santos City",
      salaryMin: 18000,
      salaryMax: 25000,
      salaryPeriod: "monthly" as const,
      employmentType: "Full-time",
      status: "active" as const,
      minimumEducationRequired: "Bachelor's",
      yearsOfExperienceRequired: 2,
      vacancies: 3,
    },
    {
      positionTitle: "QA Analyst",
      description: "Perform in-process quality checks and maintain QA reports.",
      location: "Lagao, General Santos City",
      salaryMin: 16000,
      salaryMax: 22000,
      salaryPeriod: "monthly" as const,
      employmentType: "Full-time",
      status: "active" as const,
      minimumEducationRequired: "Bachelor's",
      yearsOfExperienceRequired: 1,
      vacancies: 2,
    },
    {
      positionTitle: "Warehouse Assistant",
      description: "Handle receiving, inventory, and dispatch of goods.",
      location: "Lagao, General Santos City",
      salaryMin: 12000,
      salaryMax: 16000,
      salaryPeriod: "monthly" as const,
      employmentType: "Full-time",
      status: "active" as const,
      minimumEducationRequired: "High School",
      yearsOfExperienceRequired: 0,
      vacancies: 4,
    },
  ];

  for (const job of jobs) {
    await storage.addJobPost(createdEmployer.id, createdEmployer.establishmentName || createdEmployer.name || "", {
      employerId: createdEmployer.id,
      positionTitle: job.positionTitle,
      description: job.description,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryPeriod: job.salaryPeriod,
      minimumEducation: job.minimumEducationRequired,
      yearsOfExperience: job.yearsOfExperienceRequired,
      status: job.status,
      salaryType: undefined,
      salaryAmount: undefined,
      jobStatus: "approved",
      skills: undefined,
    });
  }

  console.log("Seed complete:", {
    employerId: createdEmployer.id,
    jobs: jobs.map((j) => j.positionTitle),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
