import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.resolve(__dirname, "../data/seed/employers-with-jobs.json");

const companyTypes = ["Private", "Government", "NGO", "Cooperative", "Others"] as const;
const industries = [
  "Manufacturing",
  "Services",
  "Agriculture",
  "Construction",
  "Retail",
  "Education",
  "Healthcare",
  "Finance",
  "Transportation",
  "Information Technology",
  "Others",
] as const;
const jobTypes = [
  "Full-Time",
  "Part-Time",
  "Contractual",
  "Temporary",
  "Internship",
  "Seasonal",
] as const;
const salaryPeriods = ["Monthly", "Weekly", "Daily", "Hourly"] as const;
const jobStatuses = ["Open", "Closed", "Archived", "Pending"] as const;

type CompanyType = typeof companyTypes[number];
type Industry = typeof industries[number];
type JobType = typeof jobTypes[number];
type SalaryPeriod = typeof salaryPeriods[number];
type JobStatus = typeof jobStatuses[number];

type EmployerSeed = {
  id: string;
  email: string;
  password: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactNumber: string;
  companyType: CompanyType;
  industry: Industry;
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
  jobType: JobType;
  industry: Industry;
  location: string;
  salary: number;
  salaryPeriod: SalaryPeriod;
  qualifications: string;
  vacancies: number;
  status: JobStatus;
  postedAt: string;
  updatedAt: string;
  archived: "Yes" | "No";
};

const companyNames = [
  "AgriSouth Cooperative",
  "GenCity Logistics",
  "Mindanao Tech Forge",
  "Dadiangas Health Network",
  "Socsargen Construction Guild",
  "Pioneer Retail Group",
  "TriMarine Manufacturing",
  "Sunrise Education Services",
  "Harborview Hospitality",
  "Apex Finance Hub",
  "Streamline IT Solutions",
  "Metro Transport Systems",
  "Greenfields Agriculture",
  "Sigma Healthcare Partners",
  "Crestline Services Cooperative",
  "SolidBuild Construction",
  "Horizon Retail Collective",
  "BrightMinds Education Center",
  "VitalCare Hospital Group",
  "CloudPort Techworks",
];

const streetNames = [
  "Pioneer Avenue",
  "Pendatun Avenue",
  "Quirino Drive",
  "Santiago Boulevard",
  "National Highway",
  "Katangawan Road",
  "Silway River Drive",
  "Lagao Commercial Strip",
  "Mabuhay Road",
  "Bula-Lagao Road",
];

const barangays = [
  "Lagao",
  "Bula",
  "San Isidro",
  "Mabuhay",
  "Baluan",
  "Apopong",
  "Labangal",
  "City Heights",
  "Fatima",
  "Calumpang",
  "Tambler",
  "Conel",
  "Katangawan",
  "Sinawal",
  "Buayan",
  "Dadiangas South",
  "Dadiangas West",
  "Upper Labay",
  "Olympog",
  "Tinagacan",
];

const cities = [
  "General Santos City, South Cotabato",
  "Koronadal City, South Cotabato",
  "Polomolok, South Cotabato",
  "Tupi, South Cotabato",
  "Alabel, Sarangani",
  "Maasim, Sarangani",
  "Tacurong City, Sultan Kudarat",
  "Kidapawan City, Cotabato",
  "Digos City, Davao del Sur",
  "Davao City, Davao del Sur",
];

const contactFirstNames = [
  "Adrian",
  "Bianca",
  "Carlos",
  "Diane",
  "Evan",
  "Fiona",
  "Gabriel",
  "Hannah",
  "Ian",
  "Jessa",
  "Ken",
  "Lara",
  "Marco",
  "Nina",
  "Owen",
  "Paula",
  "Quinn",
  "Rafael",
  "Sofia",
  "Trent",
  "Uma",
  "Victor",
  "Willow",
  "Xavier",
  "Yvette",
  "Zach",
];

const contactLastNames = [
  "Alvarez",
  "Bautista",
  "Castillo",
  "Dizon",
  "Espino",
  "Fernandez",
  "Garcia",
  "Hidalgo",
  "Inocencio",
  "Jimenez",
  "Katigbak",
  "Lopez",
  "Mendoza",
  "Navarro",
  "Ortega",
  "Padilla",
  "Querubin",
  "Ramirez",
  "Santos",
  "Tolentino",
  "Uy",
  "Valdez",
  "Wilson",
  "Yap",
  "Zamora",
];

const jobTitleByIndustry: Record<Industry, string[]> = {
  Manufacturing: [
    "Production Supervisor",
    "Quality Assurance Analyst",
    "Plant Electrician",
    "Industrial Engineer",
    "Maintenance Planner",
  ],
  Services: [
    "Client Success Manager",
    "Operations Coordinator",
    "Service Desk Lead",
    "Customer Insights Analyst",
    "Workflow Supervisor",
  ],
  Agriculture: [
    "Farm Operations Manager",
    "Agronomist",
    "Supply Chain Coordinator",
    "Post-Harvest Specialist",
    "Agri Sales Officer",
  ],
  Construction: [
    "Project Engineer",
    "Site Safety Officer",
    "Quantity Surveyor",
    "Architectural Designer",
    "MEP Supervisor",
  ],
  Retail: [
    "Store Manager",
    "Merchandising Specialist",
    "Inventory Planner",
    "Visual Display Lead",
    "Retail Trainer",
  ],
  Education: [
    "Academic Program Head",
    "STEM Instructor",
    "Learning Experience Designer",
    "Registrar Associate",
    "Guidance Counselor",
  ],
  Healthcare: [
    "Clinical Nurse Supervisor",
    "Medical Technologist",
    "Health Informatics Analyst",
    "Pharmacy Operations Lead",
    "Wellness Program Coordinator",
  ],
  Finance: [
    "Credit Analyst",
    "Financial Planning Associate",
    "Risk Compliance Officer",
    "Payroll Specialist",
    "Treasury Analyst",
  ],
  Transportation: [
    "Fleet Manager",
    "Route Planning Officer",
    "Logistics Analyst",
    "Maintenance Scheduler",
    "Operations Dispatcher",
  ],
  "Information Technology": [
    "Full Stack Developer",
    "UX Engineer",
    "Systems Administrator",
    "Data Analyst",
    "Cloud Support Lead",
  ],
  Others: [
    "HR Business Partner",
    "Legal Compliance Officer",
    "Procurement Specialist",
    "Communications Officer",
    "Sustainability Lead",
  ],
};

const industryFocus: Record<Industry, string> = {
  Manufacturing: "lean manufacturing and equipment reliability",
  Services: "service-level optimization",
  Agriculture: "crop management best practices",
  Construction: "on-site coordination and safety compliance",
  Retail: "multi-branch retail execution",
  Education: "curriculum innovation",
  Healthcare: "patient experience and DOH standards",
  Finance: "regulatory reporting and financial modeling",
  Transportation: "route efficiency and fleet readiness",
  "Information Technology": "cloud-based solutions and DevOps routines",
  Others: "cross-functional stakeholder alignment",
};

const locations = [
  "General Santos City, South Cotabato",
  "Koronadal City, South Cotabato",
  "Polomolok, South Cotabato",
  "Tupi, South Cotabato",
  "Alabel, Sarangani",
  "Maasim, Sarangani",
  "Tacurong City, Sultan Kudarat",
  "Kidapawan City, Cotabato",
];

const baseDate = new Date("2023-01-05T07:30:00.000Z");

const pad = (value: number, size = 3) => String(value).padStart(size, "0");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const pick = <T,>(arr: T[], index: number) => arr[index % arr.length];

const buildQualifications = (jobType: JobType, industry: Industry, years: number) => {
  const focus = industryFocus[industry] ?? industryFocus.Others;
  return `Bachelor's degree or equivalent experience required; ${years}+ years working with ${
    industry.toLowerCase()
  } operations; Comfortable with ${jobType.toLowerCase()} schedules and ${focus}.`;
};

function createEmployers(): EmployerSeed[] {
  return companyNames.map((companyName, index) => {
    const id = `EMP-${pad(index + 1, 3)}`;
    const companyType = companyTypes[index % companyTypes.length];
    const industry = industries[index % industries.length];
    const street = pick(streetNames, index + 1);
    const barangay = pick(barangays, index + 3);
    const city = pick(cities, index + 5);
    const contactPerson = `${pick(contactFirstNames, index + 2)} ${pick(contactLastNames, index + 4)}`;
    const baseTimestamp = new Date(baseDate.getTime() + index * 1000 * 60 * 60 * 24 * 6);
    const updatedTimestamp = new Date(baseTimestamp.getTime() + (index % 5) * 86_400_000);
    const registrationDate = baseTimestamp.toISOString().slice(0, 10);

    return {
      id,
      email: `hr@${slugify(companyName)}.com`,
      password: `SecurePass!${pad(index + 1, 2)}`,
      companyName,
      companyAddress: `${street}, Brgy. ${barangay}, ${city}`,
      contactPerson,
      contactNumber: `+63 917 ${pad(100000 + index * 137, 6)}`,
      companyType,
      industry,
      registrationDate,
      profileImage: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(companyName)}`,
      businessPermitNumber: `GEN-${2024 + (index % 2)}-${pad(1000 + index, 4)}`,
      tinNumber: `TIN-${pad(700000000 + index * 19, 9)}`,
      sssNumber: `SSS-${pad(330000000 + index * 23, 9)}`,
      philHealthNumber: `PH-${pad(760000000 + index * 17, 9)}`,
      pagIbigNumber: `HDMF-${pad(880000000 + index * 29, 9)}`,
      createdAt: baseTimestamp.toISOString(),
      updatedAt: updatedTimestamp.toISOString(),
    } satisfies EmployerSeed;
  });
}

function createJobs(employers: EmployerSeed[]): JobSeed[] {
  const jobs: JobSeed[] = [];
  employers.forEach((employer, employerIndex) => {
    const titles = jobTitleByIndustry[employer.industry] ?? jobTitleByIndustry.Others;
    for (let i = 0; i < 10; i += 1) {
      const globalIndex = employerIndex * 10 + i;
      const jobType = jobTypes[globalIndex % jobTypes.length];
      const salaryPeriod = salaryPeriods[(employerIndex + i) % salaryPeriods.length];
      const status = jobStatuses[(employerIndex + i) % jobStatuses.length];
      const positionTitle = `${titles[(i + employerIndex) % titles.length]}`;
      const baseSalary = 18000 + employerIndex * 1200 + i * 950;
      const postedAt = new Date(baseDate.getTime() + (employerIndex * 10 + i) * 86_400_000).toISOString();
      const updatedAt = new Date(new Date(postedAt).getTime() + (i % 5) * 86_400_000).toISOString();
      const yearsNeeded = 1 + ((employerIndex + i) % 5);

      jobs.push({
        id: `JOB-${pad(globalIndex + 1, 4)}`,
        employerId: employer.id,
        positionTitle,
        jobDescription: `${positionTitle} needed at ${employer.companyName} to drive ${employer.industry.toLowerCase()} initiatives across SOCSARGEN.`,
        jobType,
        industry: employer.industry,
        location: pick(locations, employerIndex + i),
        salary: baseSalary,
        salaryPeriod,
        qualifications: buildQualifications(jobType, employer.industry, yearsNeeded),
        vacancies: 1 + ((employerIndex + i) % 5),
        status,
        postedAt,
        updatedAt,
        archived: status === "Archived" ? "Yes" : "No",
      });
    }
  });
  return jobs;
}

async function main() {
  const employers = createEmployers();
  const jobs = createJobs(employers);
  const payload = {
    generatedAt: new Date().toISOString(),
    counts: { employers: employers.length, jobs: jobs.length },
    employers,
    jobs,
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf-8");

  console.log(`✅ Generated ${employers.length} employers and ${jobs.length} jobs.`);
  console.log(`📄 Output saved to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error("Failed to generate employer/job seed data", error);
  process.exit(1);
});
