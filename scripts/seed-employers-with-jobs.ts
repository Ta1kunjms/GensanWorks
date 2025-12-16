import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "../server/database";
import { employersTable, jobsTable } from "../server/unified-schema";
import { hashPassword } from "../server/auth";
import { eq, inArray } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.resolve(__dirname, "../data/seed/employers-with-jobs.json");

const salaryPeriodMap: Record<string, "hourly" | "daily" | "weekly" | "15days" | "monthly"> = {
  hourly: "hourly",
  Hourly: "hourly",
  daily: "daily",
  Daily: "daily",
  weekly: "weekly",
  Weekly: "weekly",
  biweekly: "15days",
  Biweekly: "15days",
  "15days": "15days",
  Monthly: "monthly",
  monthly: "monthly",
};

const jobStatusMap: Record<string, "pending" | "active" | "closed" | "draft" | "rejected"> = {
  open: "active",
  Open: "active",
  pending: "pending",
  Pending: "pending",
  closed: "closed",
  Closed: "closed",
  archived: "closed",
  Archived: "closed",
};

const industryCodeMap: Record<string, { code: string; description: string }> = {
  Manufacturing: { code: "04", description: "Manufacturing" },
  Services: { code: "08", description: "Services" },
  Agriculture: { code: "01", description: "Agriculture" },
  Construction: { code: "06", description: "Construction" },
  Retail: { code: "07", description: "Retail" },
  Education: { code: "13", description: "Education" },
  Healthcare: { code: "14", description: "Healthcare" },
  Finance: { code: "10", description: "Finance" },
  Transportation: { code: "09", description: "Transportation" },
  "Information Technology": { code: "11", description: "Information Technology" },
  Others: { code: "99", description: "Others" },
};

type EmployerSeed = {
  id: string;
  email: string;
  password: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactNumber: string;
  companyType: string;
  industry: string;
  registrationDate: string;
  profileImage: string;
  businessPermitNumber: string;
  tinNumber: string;
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  createdAt: string;
  updatedAt: string;
};

type JobSeed = {
  id: string;
  employerId: string;
  positionTitle: string;
  jobDescription: string;
  jobType: string;
  industry: string;
  location: string;
  salary: number;
  salaryPeriod: string;
  qualifications: string;
  vacancies: number;
  status: string;
  postedAt: string;
  updatedAt: string;
  archived: "Yes" | "No";
};

type SeedPayload = {
  employers: EmployerSeed[];
  jobs: JobSeed[];
};

const passwordHashCache = new Map<string, string>();
async function resolvePasswordHash(password: string) {
  if (!passwordHashCache.has(password)) {
    passwordHashCache.set(password, await hashPassword(password));
  }
  return passwordHashCache.get(password)!;
}

const mapSalaryPeriod = (period: string) =>
  salaryPeriodMap[period] || salaryPeriodMap[period.trim().toLowerCase()] || "monthly";

const mapJobStatus = (status: string) =>
  jobStatusMap[status] || jobStatusMap[status.trim().toLowerCase()] || "pending";

const toBoolean = (value: string) => value.trim().toLowerCase() === "yes";

function splitAddress(address: string) {
  const parts = address.split(",").map((segment) => segment.trim());
  const [street = "", maybeBarangay = "", maybeMunicipality = "", maybeProvince = ""] = parts;
  const barangay = maybeBarangay.replace(/^Brgy\.\s*/i, "");
  return {
    houseStreetVillage: street,
    barangay: barangay || undefined,
    municipality: maybeMunicipality || undefined,
    province: maybeProvince || undefined,
  };
}

async function buildEmployerRows(
  employers: EmployerSeed[],
  jobsByEmployer: Map<string, JobSeed[]>,
) {
  const rows = [] as any[];

  for (const employer of employers) {
    const relatedJobs = jobsByEmployer.get(employer.id) || [];
    const totalVacancies = relatedJobs.reduce((sum, job) => sum + job.vacancies, 0);
    const employeesEstimate = 40 + relatedJobs.length * 8;
    const address = splitAddress(employer.companyAddress);
    const contact = {
      personName: employer.contactPerson,
      designation: "HR Manager",
      contactNumber: employer.contactNumber,
      email: employer.email,
    };
    const industryCode = industryCodeMap[employer.industry] || industryCodeMap.Others;

    rows.push({
      id: employer.id,
      establishmentName: employer.companyName,
      tradeName: employer.companyName,
      houseStreetVillage: address.houseStreetVillage,
      barangay: address.barangay,
      municipality: address.municipality,
      province: address.province,
      completeAddress: employer.companyAddress,
      contactNumber: employer.contactNumber,
      contactEmail: employer.email,
      contactPerson: contact,
      email: employer.email,
      numberOfPaidEmployees: employeesEstimate,
      numberOfVacantPositions: totalVacancies,
      industryType: [employer.industry],
      industryCodes: [industryCode],
      srsSubscriber: true,
      subscriptionStatus: "subscriber",
      companyTin: employer.tinNumber,
      businessPermitNumber: employer.businessPermitNumber,
      requirements: {
        companyType: employer.companyType,
        registrationDate: employer.registrationDate,
        ids: {
          tinNumber: employer.tinNumber,
          sssNumber: employer.sssNumber,
          philHealthNumber: employer.philHealthNumber,
          pagIbigNumber: employer.pagIbigNumber,
        },
      },
      attachments: {
        profileImage: employer.profileImage,
      },
      preparedByName: employer.contactPerson,
      preparedByDesignation: "HR Manager",
      preparedByContact: employer.contactNumber,
      dateAccomplished: employer.registrationDate,
      remarks: `${employer.companyType} / ${employer.industry}`,
      passwordHash: await resolvePasswordHash(employer.password),
      hasAccount: true,
      createdAt: new Date(employer.createdAt),
      updatedAt: new Date(employer.updatedAt),
    });
  }

  return rows;
}

function buildJobRows(jobs: JobSeed[], employerLookup: Map<string, EmployerSeed>) {
  return jobs.map((job) => {
    const employer = employerLookup.get(job.employerId);
    if (!employer) {
      throw new Error(`Missing employer for job ${job.id} (${job.employerId})`);
    }
    const industryCode = industryCodeMap[job.industry] || industryCodeMap.Others;
    const archived = toBoolean(job.archived);

    return {
      id: job.id,
      employerId: job.employerId,
      establishmentName: employer.companyName,
      positionTitle: job.positionTitle,
      description: job.jobDescription,
      location: job.location,
      salaryAmount: job.salary,
      salaryMin: Math.max(0, job.salary - 2000),
      salaryMax: job.salary + 2000,
      salaryPeriod: mapSalaryPeriod(job.salaryPeriod),
      skills: job.qualifications,
      requirements: [{ label: "Employment Type", value: job.jobType }, { label: "Qualifications", value: job.qualifications }],
      industryCodes: [industryCode],
      jobStatus: job.jobType,
      vacantPositions: job.vacancies,
      status: mapJobStatus(job.status),
      archived,
      archivedAt: archived ? new Date(job.updatedAt) : null,
      createdAt: new Date(job.postedAt),
      updatedAt: new Date(job.updatedAt),
    };
  });
}

async function main() {
  const raw = await readFile(SEED_FILE, "utf-8");
  const data = JSON.parse(raw) as SeedPayload;
  const db = await initializeDatabase();

  const jobsByEmployer = new Map<string, JobSeed[]>();
  data.jobs.forEach((job) => {
    if (!jobsByEmployer.has(job.employerId)) {
      jobsByEmployer.set(job.employerId, []);
    }
    jobsByEmployer.get(job.employerId)!.push(job);
  });
  const employerLookup = new Map(data.employers.map((employer) => [employer.id, employer] as const));

  const employerRows = await buildEmployerRows(data.employers, jobsByEmployer);
  const jobRows = buildJobRows(data.jobs, employerLookup);
  const employerIds = data.employers.map((employer) => employer.id);

  if (employerIds.length) {
    await db.delete(jobsTable).where(inArray(jobsTable.employerId, employerIds));
    await db.delete(employersTable).where(inArray(employersTable.id, employerIds));
  }

  if (employerRows.length) {
    await db.insert(employersTable).values(employerRows);
  }
  if (jobRows.length) {
    await db.insert(jobsTable).values(jobRows);
  }

  console.log(`✅ Inserted ${employerRows.length} employers and ${jobRows.length} jobs from ${path.relative(process.cwd(), SEED_FILE)}.`);
}

main().catch((error) => {
  console.error("❌ Failed to insert employers/jobs", error);
  process.exit(1);
});
