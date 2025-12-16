import { hashPassword } from "../server/auth";
import { initializeDatabase } from "../server/database";
import { adminsTable, applicantsTable, employersTable, jobsTable, applicationsTable } from "../server/unified-schema";
import { eq, sql } from "drizzle-orm";
import { nsrpEmploymentTypes } from "../shared/schema";

type EmployerRow = typeof employersTable.$inferInsert;
type JobRow = typeof jobsTable.$inferInsert;
type ApplicantRow = typeof applicantsTable.$inferInsert;

type EmployerSeedEntry = {
  row: EmployerRow;
  contactPerson: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
};

const passwordHashCache = new Map<string, string>();

async function getPasswordHash(password: string) {
  if (!passwordHashCache.has(password)) {
    passwordHashCache.set(password, await hashPassword(password));
  }
  return passwordHashCache.get(password)!;
}

const barangays = [
  "Apopong",
  "Baluan",
  "Batomelong",
  "Buayan",
  "Bula",
  "Calumpang",
  "City Heights",
  "Conel",
  "Dadiangas North",
  "Dadiangas South",
  "Dadiangas West",
  "Fatima",
  "Katangawan",
  "Labangal",
  "Lagao",
  "Ligaya",
  "Mabuhay",
  "Olympog",
  "San Isidro",
  "San Jose",
  "Siguel",
  "Sinawal",
  "Tambler",
  "Tinagacan",
  "Upper Labay",
];

const streetNames = [
  "Pioneer Avenue",
  "Pendatun Avenue",
  "Quirino Drive",
  "National Highway",
  "Santiago Boulevard",
  "Jose Catolico Sr. Avenue",
  "Atis Street",
  "Mangga Street",
  "Champaca Street",
  "Silway River Road",
];

const remarksList = [
  "Maintains active coordination with PESO for local placements.",
  "Completed documentary compliance for 2024 renewal.",
  "Participates in PESO job fairs quarterly.",
  "Provides apprenticeship slots for senior high graduates.",
  "Accredited for special recruitment activities.",
];

const industries = [
  "Information Technology",
  "Manufacturing",
  "Logistics",
  "Healthcare",
  "Construction",
  "Hospitality",
  "Agriculture",
  "Education",
  "Retail",
  "BPO",
  "Marine Services",
  "Energy",
];

const preparedByPeople = [
  "Angelo Ferrer",
  "Beverly Ramirez",
  "Carlos Dizon",
  "Danica Villarta",
  "Emmanuel Sison",
  "Fatima Amorado",
];

const preferredLocationsPool = [
  "General Santos City",
  "Koronadal City",
  "Polomolok",
  "Tupi",
  "Alabel",
  "Maasim",
];

const overseasCountries = [
  "Japan",
  "Canada",
  "Australia",
  "Qatar",
  "United Arab Emirates",
  "New Zealand",
  "Singapore",
  "Norway",
  "Germany",
  "United States",
];

const applicantFirstNames = [
  "Aljon",
  "Bianca",
  "Carlo",
  "Danica",
  "Eloisa",
  "Franco",
  "Gelyn",
  "Harvey",
  "Ivy",
  "Jerome",
  "Kristine",
  "Lemuel",
  "Maricel",
  "Nikko",
  "Owen",
  "Patricia",
  "Queenie",
  "Rogelio",
  "Shaira",
  "Tristan",
  "Ulysses",
  "Veronica",
  "Wency",
  "Xian",
  "Yvette",
  "Zandro",
];

const applicantSurnames = [
  "Agbayani",
  "Bautista",
  "Castro",
  "Dela Cruz",
  "Enriquez",
  "Flores",
  "Gonzales",
  "Hernandez",
  "Isidro",
  "Jimenez",
  "Katigbak",
  "Lazaro",
  "Manalo",
  "Navarro",
  "Ocampo",
  "Panganiban",
  "Quintana",
  "Rosales",
  "Serrano",
  "Tolentino",
  "Uy",
  "Valdez",
  "Yap",
  "Zamora",
  "Reyes",
  "Soriano",
];

const applicantMiddleNames = [
  "Alcantara",
  "Buenaventura",
  "Calderon",
  "De Mesa",
  "Escobar",
  "Fulgencio",
  "Guadalupe",
  "Hermosa",
  "Ilagan",
  "Jaro",
  "Legaspi",
  "Mercado",
];

const applicantSuffixes = ["Jr.", "Sr.", "III", "IV", "II", "V"];

const religions = [
  "Roman Catholic",
  "Islam",
  "Protestant",
  "Iglesia ni Cristo",
  "Baptist",
  "Born Again Christian",
];

const civilStatuses = ["Single", "Married", "Widowed", "Separated"];
const sexes = ["Female", "Male"];
const employmentStatuses = ["employed", "unemployed", "self-employed", "fresh graduate", "freelancer"];
const employmentTypes = [...nsrpEmploymentTypes];

const trainingPrograms = [
  "TESDA - Web Development NC III",
  "TESDA - Shielded Metal Arc Welding NC II",
  "TESDA - Cookery NC II",
  "TESDA - Bookkeeping NC III",
  "TESDA - Electrical Installation and Maintenance NC II",
  "TESDA - Contact Center Services NC II",
  "TESDA - Plumbing NC II",
  "TESDA - Visual Graphic Design NC III",
];

const licenseCatalog = [
  "Civil Service Professional",
  "PRC Registered Nurse",
  "PRC Licensed Teacher",
  "NCII - Shielded Metal Arc Welding",
  "NCII - Bookkeeping",
  "PRC Mechanical Engineer",
  "NCIII - Events Management",
  "PRC Certified Public Accountant",
];

const skillClusters = [
  ["Data analysis", "Excel modeling", "Presentation design"],
  ["Customer service", "Conflict resolution", "CRM utilization"],
  ["Hardware diagnostics", "Basic programming", "Network setup"],
  ["Food safety", "Quality inspection", "Documentation"],
  ["Field monitoring", "Community organizing", "Technical writing"],
  ["Financial reporting", "Tax compliance", "ERP navigation"],
];

const schools = [
  "Notre Dame of Dadiangas University",
  "Mindanao State University - General Santos",
  "Holy Trinity College",
  "RMMC Colleges",
  "Ateneo de Davao University",
  "AMA Computer College General Santos",
  "STI College General Santos",
  "Systems Technology Institute",
  "General Santos City National High School",
  "Philippine Women's College of Davao",
];

const courseList = [
  "BS Information Technology",
  "BS Accountancy",
  "BS Civil Engineering",
  "BS Mechanical Engineering",
  "BSBA Marketing",
  "BS Criminology",
  "BS Psychology",
  "BS Hospitality Management",
  "BS Agriculture",
  "BS Marine Engineering",
  "BS Nursing",
  "BS Pharmacy",
  "BS Computer Engineering",
  "BS Industrial Engineering",
  "BSEd Mathematics",
  "BS Fisheries",
];

const companyList = [
  "GenTuna Corp",
  "AgriVentures",
  "SoSeas Logistics",
  "DDS Tech",
  "SMC Health",
  "Lagao Precision",
  "Conel Renewables",
  "Tambler Marine",
  "KatAgro",
  "Pioneer Suites",
  "PoloCon",
  "Kalaja BPO",
];

const dialects = ["Cebuano", "Hiligaynon", "Ilocano", "Maguindanaon", "Tagakaulo", "Blaan"];

type EmployerProfile = {
  establishmentName: string;
  tradeName: string;
  barangay: string;
  industryCodes: { code: string; description: string; }[];
  industryType: { majorGroup: string; subSector: string; };
  focusRemark: string;
  contactName: string;
  contactDesignation: string;
  addressLine: string;
  subscriptionStatus: "active" | "for renewal" | "pending";
  srsSubscriber: boolean;
  isManpowerAgency: boolean;
  municipality?: string;
  province?: string;
};

const employerProfiles: EmployerProfile[] = [
  {
    establishmentName: "General Santos Tuna Processing Corporation",
    tradeName: "GenTuna Corp",
    barangay: "Tambler",
    industryCodes: [
      { code: "1020", description: "Processing and preserving of fish" },
      { code: "4630", description: "Wholesale of food and beverages" },
    ],
    industryType: { majorGroup: "Manufacturing", subSector: "Food Processing" },
    focusRemark: "Exports grade-A tuna loins and partners with local fisherfolk.",
    contactName: "Ramon D. Morales",
    contactDesignation: "HR and Admin Manager",
    addressLine: "Lot 5, Tambler Industrial Estate",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Mindanao AgriVentures Cooperative",
    tradeName: "AgriVentures",
    barangay: "Katangawan",
    industryCodes: [
      { code: "0161", description: "Support activities for crop production" },
      { code: "4620", description: "Wholesale of agricultural raw materials" },
    ],
    industryType: { majorGroup: "Agriculture", subSector: "Agri-Support Services" },
    focusRemark: "Supplies fresh produce to national supermarket chains.",
    contactName: "Leah P. Villarin",
    contactDesignation: "People and Culture Lead",
    addressLine: "Purok Malakas, Katangawan Service Road",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Southern Seas Logistics",
    tradeName: "SoSeas Logistics",
    barangay: "Labangal",
    industryCodes: [
      { code: "5229", description: "Other transportation support activities" },
      { code: "5210", description: "Warehousing and storage" },
    ],
    industryType: { majorGroup: "Logistics", subSector: "Freight Forwarding" },
    focusRemark: "Operates cold-chain trucks serving SOCSARGEN corridor.",
    contactName: "Julius I. Ferrer",
    contactDesignation: "Operations Director",
    addressLine: "Km 5 National Highway, Labangal",
    subscriptionStatus: "for renewal",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Dadiangas Digital Solutions",
    tradeName: "DDS Tech",
    barangay: "Dadiangas North",
    industryCodes: [
      { code: "6201", description: "Computer programming activities" },
      { code: "6202", description: "Computer consultancy and facilities management" },
    ],
    industryType: { majorGroup: "Information Technology", subSector: "Software Development" },
    focusRemark: "Builds software for local cooperatives and MSMEs.",
    contactName: "Ivy Anne Custodio",
    contactDesignation: "Talent Acquisition Lead",
    addressLine: "3F Pioneer Plaza, Pioneer Avenue",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "SOCSARGEN Medical Center",
    tradeName: "SMC Health",
    barangay: "Lagao",
    industryCodes: [
      { code: "8610", description: "Hospital activities" },
      { code: "8690", description: "Other human health activities" },
    ],
    industryType: { majorGroup: "Healthcare", subSector: "Hospital" },
    focusRemark: "Expanding specialty clinics and telemedicine unit.",
    contactName: "Dr. Celina M. Borromeo",
    contactDesignation: "Medical HR Director",
    addressLine: "Jose Catolico Sr. Avenue, Lagao",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Lagao Precision Manufacturing",
    tradeName: "Lagao Precision",
    barangay: "Lagao",
    industryCodes: [
      { code: "2599", description: "Manufacture of other fabricated metal products" },
      { code: "2815", description: "Manufacture of bearings and driving elements" },
    ],
    industryType: { majorGroup: "Manufacturing", subSector: "Metal Works" },
    focusRemark: "Supplies machine parts for regional canning lines.",
    contactName: "Marc Adrian Dechavez",
    contactDesignation: "Plant HR Partner",
    addressLine: "Block 8, Lagao Industrial Park",
    subscriptionStatus: "for renewal",
    srsSubscriber: false,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Conel Renewable Energy Services",
    tradeName: "Conel Renewables",
    barangay: "Conel",
    industryCodes: [
      { code: "4220", description: "Construction of utility projects" },
      { code: "7110", description: "Architectural and engineering activities" },
    ],
    industryType: { majorGroup: "Energy", subSector: "Renewable Installations" },
    focusRemark: "Deploys solar rooftops for agribusiness clients.",
    contactName: "Noel K. Dayrit",
    contactDesignation: "People Operations Supervisor",
    addressLine: "Sitio Kalaja, Conel Road",
    subscriptionStatus: "pending",
    srsSubscriber: false,
    isManpowerAgency: true,
  },
  {
    establishmentName: "Tambler Marine Works",
    tradeName: "Tambler Marine",
    barangay: "Tambler",
    industryCodes: [
      { code: "3011", description: "Building of ships and floating structures" },
      { code: "3315", description: "Repair and maintenance of ships and boats" },
    ],
    industryType: { majorGroup: "Marine Services", subSector: "Shipbuilding" },
    focusRemark: "Handles vessel dry-docking for tuna fleets.",
    contactName: "Kristine Mae Ubaldo",
    contactDesignation: "HR Business Partner",
    addressLine: "Slipway Complex, Tambler Shoreline",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Katangawan Agro Traders",
    tradeName: "KatAgro",
    barangay: "Katangawan",
    industryCodes: [
      { code: "4789", description: "Retail trade not in stores" },
      { code: "4711", description: "Retail sale in non-specialized stores with food" },
    ],
    industryType: { majorGroup: "Agriculture", subSector: "Trading" },
    focusRemark: "Consolidates corn and coconut produce from upland farmers.",
    contactName: "Dencio A. Fajardo",
    contactDesignation: "General Manager",
    addressLine: "Km 12, Katangawan Highway",
    subscriptionStatus: "active",
    srsSubscriber: false,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Pioneer Hospitality Group",
    tradeName: "Pioneer Suites",
    barangay: "Dadiangas West",
    industryCodes: [
      { code: "5510", description: "Short term accommodation activities" },
      { code: "5610", description: "Restaurants and mobile food service activities" },
    ],
    industryType: { majorGroup: "Hospitality", subSector: "Hotels and Restaurants" },
    focusRemark: "Operates business hotel and convention center.",
    contactName: "Shaira D. Gementiza",
    contactDesignation: "HR and Guest Experience Lead",
    addressLine: "Pioneer Ave cor. Laurel St.",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Polomolok Construction Consortium",
    tradeName: "PoloCon",
    barangay: "San Jose",
    industryCodes: [
      { code: "4210", description: "Construction of roads and railways" },
      { code: "4390", description: "Other specialized construction activities" },
    ],
    industryType: { majorGroup: "Construction", subSector: "Infrastructure" },
    focusRemark: "Handles road widening projects in SOCSARGEN.",
    contactName: "Engr. Felix S. Lascuna",
    contactDesignation: "Project HR Head",
    addressLine: "Purok Masagana, San Jose",
    subscriptionStatus: "for renewal",
    srsSubscriber: false,
    isManpowerAgency: false,
  },
  {
    establishmentName: "Kalaja IT and Business Outsourcing",
    tradeName: "Kalaja BPO",
    barangay: "City Heights",
    industryCodes: [
      { code: "8299", description: "Other business support service activities" },
      { code: "8220", description: "Activities of call centers" },
    ],
    industryType: { majorGroup: "BPO", subSector: "Shared Services" },
    focusRemark: "Provides CX support for fintech startups.",
    contactName: "Luis Gerardo Ponce",
    contactDesignation: "Senior Recruitment Manager",
    addressLine: "Kalaja Ridge IT Park",
    subscriptionStatus: "active",
    srsSubscriber: true,
    isManpowerAgency: true,
  },
];

type JobCatalogItem = {
  title: string;
  description: string;
  specialization: string;
  education: string;
  yearsExperience: number;
  salaryMin: number;
  salaryMax: number;
  agePreference: string;
  jobStatus: string;
  barangay: string;
  requirements: string[];
  industryCodes: { code: string; description: string; }[];
  vacancies: number;
  dateOffset: number;
  priority: "standard" | "high" | "critical";
  contactShift: string;
  focus: string;
};

const jobCatalog: JobCatalogItem[] = [
  {
    title: "Software Engineer",
    description: "Develops and maintains modular web applications for cooperatives and MSME partners.",
    specialization: "Full Stack Web Development",
    education: "Bachelor's Degree in Computer Science or related field",
    yearsExperience: 3,
    salaryMin: 32000,
    salaryMax: 48000,
    agePreference: "22-40",
    jobStatus: "Open for Placement",
    barangay: "Dadiangas North",
    requirements: [
      "Updated resume and portfolio",
      "Government-issued ID",
      "NBI clearance (valid within 6 months)",
      "Proof of completed TESDA/bootcamp trainings",
    ],
    industryCodes: [
      { code: "6201", description: "Computer programming activities" },
      { code: "6202", description: "Computer consultancy and facilities management" },
    ],
    vacancies: 3,
    dateOffset: 1,
    priority: "high",
    contactShift: "Mon-Fri 08:00-17:00",
    focus: "Experience shipping React + Node.js solutions",
  },
  {
    title: "Network Administrator",
    description: "Ensures secure and reliable LAN/WAN infrastructure across production sites.",
    specialization: "Enterprise Network Operations",
    education: "Bachelor's Degree in Information Technology or Electronics Engineering",
    yearsExperience: 4,
    salaryMin: 28000,
    salaryMax: 42000,
    agePreference: "23-40",
    jobStatus: "For Recruitment",
    barangay: "Lagao",
    requirements: [
      "Updated resume",
      "CCNA or equivalent certification",
      "Barangay and police clearances",
      "Drug test result",
    ],
    industryCodes: [
      { code: "6110", description: "Wired telecommunications activities" },
      { code: "9511", description: "Repair of computers and peripheral equipment" },
    ],
    vacancies: 2,
    dateOffset: 3,
    priority: "standard",
    contactShift: "Mon-Sat 07:00-16:00",
    focus: "Handled multi-site VLAN segmentation",
  },
  {
    title: "Talent Acquisition Specialist",
    description: "Leads end-to-end hiring campaigns for hospitality and logistics roles.",
    specialization: "Recruitment Marketing",
    education: "Bachelor's Degree in Psychology, HR, or related course",
    yearsExperience: 2,
    salaryMin: 24000,
    salaryMax: 34000,
    agePreference: "21-35",
    jobStatus: "Open for Placement",
    barangay: "Dadiangas West",
    requirements: [
      "Detailed resume",
      "Portfolio of hiring campaigns",
      "Proof of HR trainings",
      "Barangay clearance",
    ],
    industryCodes: [
      { code: "7830", description: "Other human resources provision" },
      { code: "7810", description: "Activities of employment placement agencies" },
    ],
    vacancies: 2,
    dateOffset: 4,
    priority: "standard",
    contactShift: "Mon-Fri 09:00-18:00",
    focus: "Experience using ATS and analytics dashboards",
  },
  {
    title: "Electrical Project Engineer",
    description: "Supervises power distribution upgrades for agro-processing clients.",
    specialization: "Industrial Electrical Systems",
    education: "Licensed Electrical Engineer",
    yearsExperience: 5,
    salaryMin: 38000,
    salaryMax: 55000,
    agePreference: "25-45",
    jobStatus: "For Deployment",
    barangay: "Conel",
    requirements: [
      "PRC ID and current PTR",
      "Project portfolio",
      "Medical certificate",
      "Proof of safety trainings",
    ],
    industryCodes: [
      { code: "4321", description: "Electrical installation" },
      { code: "7110", description: "Engineering activities" },
    ],
    vacancies: 1,
    dateOffset: 5,
    priority: "high",
    contactShift: "Project-based schedule",
    focus: "Handled at least 5M PHP electrical retrofits",
  },
  {
    title: "Mechanical Maintenance Technician",
    description: "Conducts predictive maintenance on canning line equipment.",
    specialization: "Rotating Equipment Maintenance",
    education: "Vocational diploma or BS in Mechanical Engineering",
    yearsExperience: 3,
    salaryMin: 22000,
    salaryMax: 30000,
    agePreference: "21-38",
    jobStatus: "Open for Placement",
    barangay: "Tambler",
    requirements: [
      "Resume",
      "NCII - Mechanical Maintenance certificate",
      "Industrial medical exam",
      "Pag-IBIG/SSS numbers",
    ],
    industryCodes: [
      { code: "3312", description: "Repair of machinery" },
      { code: "2825", description: "Manufacture of lifting and handling equipment" },
    ],
    vacancies: 4,
    dateOffset: 6,
    priority: "standard",
    contactShift: "Shift: 06:00-14:00 / 14:00-22:00",
    focus: "Capable of interpreting OEM manuals",
  },
  {
    title: "Accounting Associate",
    description: "Prepares statutory reports and supports SAP migration for manufacturing plant.",
    specialization: "General Accounting",
    education: "BS Accountancy or Management Accounting",
    yearsExperience: 2,
    salaryMin: 23000,
    salaryMax: 31000,
    agePreference: "21-35",
    jobStatus: "Open for Placement",
    barangay: "Lagao",
    requirements: [
      "Transcript of records",
      "BIR 1902/2316 copies",
      "Updated resume",
      "Certificate of employment",
    ],
    industryCodes: [
      { code: "6920", description: "Accounting, bookkeeping and auditing activities" },
      { code: "7010", description: "Head offices activities" },
    ],
    vacancies: 3,
    dateOffset: 7,
    priority: "standard",
    contactShift: "Mon-Fri 08:00-17:00",
    focus: "Hands-on with SAP or NetSuite",
  },
  {
    title: "Logistics Coordinator",
    description: "Monitors inbound/outbound shipment schedules and creates delivery dashboards.",
    specialization: "Fleet and Inventory Coordination",
    education: "Bachelor's Degree in Supply Chain, Industrial Engineering, or related course",
    yearsExperience: 3,
    salaryMin: 25000,
    salaryMax: 36000,
    agePreference: "22-38",
    jobStatus: "For Recruitment",
    barangay: "Labangal",
    requirements: [
      "Resume",
      "LTFRB certificate (if any)",
      "Barangay and police clearances",
      "Driver's license copy",
    ],
    industryCodes: [
      { code: "5221", description: "Service activities incidental to land transportation" },
      { code: "5224", description: "Cargo handling" },
    ],
    vacancies: 2,
    dateOffset: 8,
    priority: "standard",
    contactShift: "Mon-Sat 06:00-15:00",
    focus: "Advanced Excel and Power BI reporting",
  },
  {
    title: "Food Safety Officer",
    description: "Implements HACCP and GMP protocols within tuna processing facility.",
    specialization: "Quality and Food Safety",
    education: "BS Food Technology, Biology or related course",
    yearsExperience: 4,
    salaryMin: 30000,
    salaryMax: 42000,
    agePreference: "23-40",
    jobStatus: "Open for Placement",
    barangay: "Bula",
    requirements: [
      "Resume",
      "Trainings on HACCP/ISO22000",
      "Medical certificate",
      "Drug test result",
    ],
    industryCodes: [
      { code: "7120", description: "Technical testing and analysis" },
      { code: "5629", description: "Other food service activities" },
    ],
    vacancies: 2,
    dateOffset: 9,
    priority: "high",
    contactShift: "Mon-Sat 07:00-16:00",
    focus: "Led at least two GMP audits",
  },
  {
    title: "Production Supervisor",
    description: "Supervises 3 shift teams ensuring yield targets for canned tuna lines.",
    specialization: "Manufacturing Operations",
    education: "BS Industrial Engineering or any engineering course",
    yearsExperience: 5,
    salaryMin: 35000,
    salaryMax: 48000,
    agePreference: "25-45",
    jobStatus: "Open for Placement",
    barangay: "Tambler",
    requirements: [
      "Resume",
      "Certificate of employment",
      "Leadership training certificates",
      "Government IDs",
    ],
    industryCodes: [
      { code: "1030", description: "Processing and preserving of fruit and vegetables" },
      { code: "1075", description: "Manufacture of prepared meals and dishes" },
    ],
    vacancies: 3,
    dateOffset: 10,
    priority: "critical",
    contactShift: "Shift-based",
    focus: "Handled 150+ headcount operations",
  },
  {
    title: "Quality Assurance Analyst",
    description: "Designs testing scenarios for financial platforms supported by the BPO team.",
    specialization: "Software Quality Assurance",
    education: "Bachelor's Degree in IT or Computer Engineering",
    yearsExperience: 2,
    salaryMin: 26000,
    salaryMax: 36000,
    agePreference: "21-35",
    jobStatus: "Open for Placement",
    barangay: "City Heights",
    requirements: [
      "Resume",
      "ISTQB or equivalent certificate",
      "Portfolio of test plans",
      "Government IDs",
    ],
    industryCodes: [
      { code: "6209", description: "Other information technology service activities" },
      { code: "8299", description: "Other business support service activities" },
    ],
    vacancies: 4,
    dateOffset: 11,
    priority: "high",
    contactShift: "Shift: 15:00-00:00",
    focus: "Worked with automation frameworks",
  },
  {
    title: "Marine Engineer",
    description: "Provides engine maintenance and dry-dock planning for carrier vessels.",
    specialization: "Marine Propulsion Systems",
    education: "BS Marine Engineering with PRC license",
    yearsExperience: 5,
    salaryMin: 42000,
    salaryMax: 62000,
    agePreference: "25-45",
    jobStatus: "For Deployment",
    barangay: "Tambler",
    requirements: [
      "Seafarer documents",
      "Seaman's book",
      "Medical and dental records",
      "Proof of previous vessel assignments",
    ],
    industryCodes: [
      { code: "3012", description: "Building of pleasure and sporting boats" },
      { code: "5222", description: "Service activities incidental to water transportation" },
    ],
    vacancies: 1,
    dateOffset: 12,
    priority: "critical",
    contactShift: "Project-based schedule",
    focus: "Experienced with tuna carrier fleets",
  },
  {
    title: "Warehouse Manager",
    description: "Implements barcode-controlled inventory and safety SOPs for regional hub.",
    specialization: "Warehouse and Distribution",
    education: "Bachelor's Degree in Supply Chain, IE, or Business",
    yearsExperience: 6,
    salaryMin: 36000,
    salaryMax: 52000,
    agePreference: "27-45",
    jobStatus: "Open for Placement",
    barangay: "Labangal",
    requirements: [
      "Resume",
      "Risk assessment samples",
      "NBI and police clearances",
      "Supervisory trainings",
    ],
    industryCodes: [
      { code: "5210", description: "Warehousing and storage" },
      { code: "5224", description: "Cargo handling" },
    ],
    vacancies: 1,
    dateOffset: 13,
    priority: "high",
    contactShift: "Mon-Sat with rotating rest day",
    focus: "Experience with WMS migration",
  },
  {
    title: "Customer Success Lead",
    description: "Guides multi-channel support teams for fintech accounts.",
    specialization: "Customer Experience Management",
    education: "Bachelor's Degree in Communication, Marketing, or related",
    yearsExperience: 4,
    salaryMin: 30000,
    salaryMax: 43000,
    agePreference: "23-38",
    jobStatus: "Open for Placement",
    barangay: "City Heights",
    requirements: [
      "Resume",
      "Case studies of CX improvements",
      "Government IDs",
      "Character references",
    ],
    industryCodes: [
      { code: "8220", description: "Activities of call centers" },
      { code: "8299", description: "Other business support service activities" },
    ],
    vacancies: 2,
    dateOffset: 14,
    priority: "high",
    contactShift: "Shift: 16:00-01:00",
    focus: "Handled international fintech accounts",
  },
  {
    title: "Graphic Designer",
    description: "Produces layout assets for nationwide agri-campaigns and trade fairs.",
    specialization: "Visual Communications",
    education: "Bachelor's Degree in Multimedia Arts or related",
    yearsExperience: 2,
    salaryMin: 21000,
    salaryMax: 28000,
    agePreference: "20-34",
    jobStatus: "Open for Placement",
    barangay: "Katangawan",
    requirements: [
      "Portfolio link",
      "Resume",
      "Barangay clearance",
      "Work samples in PDF",
    ],
    industryCodes: [
      { code: "7410", description: "Specialized design activities" },
      { code: "7310", description: "Advertising" },
    ],
    vacancies: 2,
    dateOffset: 15,
    priority: "standard",
    contactShift: "Mon-Fri 09:00-18:00",
    focus: "Adobe CC + motion graphics",
  },
  {
    title: "Operations Analyst",
    description: "Builds dashboards that track yield, downtime, and manpower loading.",
    specialization: "Process Improvement",
    education: "BS Industrial Engineering or Mathematics",
    yearsExperience: 3,
    salaryMin: 27000,
    salaryMax: 37000,
    agePreference: "22-38",
    jobStatus: "Open for Placement",
    barangay: "Bula",
    requirements: [
      "Resume",
      "Excel/Power BI sample reports",
      "Transcripts",
      "COE",
    ],
    industryCodes: [
      { code: "7020", description: "Management consultancy activities" },
      { code: "7110", description: "Engineering activities" },
    ],
    vacancies: 2,
    dateOffset: 16,
    priority: "standard",
    contactShift: "Mon-Fri 08:00-17:00",
    focus: "Lean Six Sigma exposure",
  },
  {
    title: "Registered Nurse",
    description: "Provides critical care support for specialty wards and telemedicine triage.",
    specialization: "Clinical Nursing",
    education: "BS Nursing with PRC license",
    yearsExperience: 2,
    salaryMin: 29000,
    salaryMax: 42000,
    agePreference: "21-40",
    jobStatus: "Open for Placement",
    barangay: "Lagao",
    requirements: [
      "PRC license",
      "BLS/ACLS certificates",
      "Medical clearance",
      "Immunization record",
    ],
    industryCodes: [
      { code: "8610", description: "Hospital activities" },
      { code: "8690", description: "Other human health activities" },
    ],
    vacancies: 6,
    dateOffset: 17,
    priority: "critical",
    contactShift: "Rotating 12-hour shifts",
    focus: "Experience in telemetry or ICU",
  },
  {
    title: "Clinical Pharmacist",
    description: "Dispenses medication and leads antimicrobial stewardship sessions.",
    specialization: "Hospital Pharmacy",
    education: "BS Pharmacy with PRC license",
    yearsExperience: 3,
    salaryMin: 32000,
    salaryMax: 46000,
    agePreference: "23-40",
    jobStatus: "For Recruitment",
    barangay: "Lagao",
    requirements: [
      "PRC ID",
      "Certificate of Employment",
      "Trainings on pharmacovigilance",
      "Government IDs",
    ],
    industryCodes: [
      { code: "4773", description: "Dispensing chemist in specialized stores" },
      { code: "8690", description: "Other human health activities" },
    ],
    vacancies: 2,
    dateOffset: 18,
    priority: "high",
    contactShift: "Mon-Sun shifting",
    focus: "Hospital background required",
  },
  {
    title: "Hospitality Supervisor",
    description: "Drives guest experience KPIs for business hotel and events center.",
    specialization: "Front Office and Events",
    education: "BS Hospitality Management or Tourism",
    yearsExperience: 4,
    salaryMin: 26000,
    salaryMax: 36000,
    agePreference: "23-38",
    jobStatus: "Open for Placement",
    barangay: "Dadiangas West",
    requirements: [
      "Resume",
      "Proof of supervisory experience",
      "Barangay clearance",
      "NCII - Events Management (optional)",
    ],
    industryCodes: [
      { code: "5510", description: "Short term accommodation activities" },
      { code: "8230", description: "Organization of conventions and trade shows" },
    ],
    vacancies: 3,
    dateOffset: 19,
    priority: "standard",
    contactShift: "Shift: 07:00-15:00 / 15:00-23:00",
    focus: "Handled Banquet or Front Office teams",
  },
  {
    title: "Senior High School Teacher",
    description: "Delivers STEM and entrepreneurship tracks for private school partner.",
    specialization: "Academic Teaching",
    education: "BSEd or BS with 18 units of education",
    yearsExperience: 2,
    salaryMin: 22000,
    salaryMax: 30000,
    agePreference: "22-40",
    jobStatus: "Open for Placement",
    barangay: "Mabuhay",
    requirements: [
      "PRC LET rating",
      "Lesson plan samples",
      "NBI clearance",
      "Medical certificate",
    ],
    industryCodes: [
      { code: "8521", description: "General secondary education" },
      { code: "8541", description: "Post-secondary non-tertiary education" },
    ],
    vacancies: 4,
    dateOffset: 20,
    priority: "standard",
    contactShift: "Mon-Fri academic schedule",
    focus: "STEM specialization preferred",
  },
  {
    title: "Agricultural Technologist",
    description: "Guides cooperatives on sustainable farm technologies and value chain.",
    specialization: "Agri Extension Services",
    education: "BS Agriculture or Agribusiness",
    yearsExperience: 3,
    salaryMin: 24000,
    salaryMax: 33000,
    agePreference: "22-40",
    jobStatus: "Open for Placement",
    barangay: "Katangawan",
    requirements: [
      "Resume",
      "BARMM or DA training certificates",
      "Barangay clearance",
      "Driver's license",
    ],
    industryCodes: [
      { code: "0161", description: "Support activities for crop production" },
      { code: "7490", description: "Other professional, scientific and technical activities" },
    ],
    vacancies: 3,
    dateOffset: 21,
    priority: "standard",
    contactShift: "Fieldwork with flexible schedule",
    focus: "Trained in Good Agricultural Practices",
  },
  {
    title: "Construction Project Manager",
    description: "Oversees DPWH road projects and ensures compliance to timelines and safety.",
    specialization: "Infrastructure Project Management",
    education: "Licensed Civil Engineer",
    yearsExperience: 7,
    salaryMin: 55000,
    salaryMax: 72000,
    agePreference: "28-50",
    jobStatus: "Open for Placement",
    barangay: "San Jose",
    requirements: [
      "PRC license",
      "DPWH accreditation",
      "Project portfolio",
      "Medical and drug test",
    ],
    industryCodes: [
      { code: "4210", description: "Construction of roads and railways" },
      { code: "4290", description: "Construction of other civil engineering projects" },
    ],
    vacancies: 1,
    dateOffset: 22,
    priority: "critical",
    contactShift: "Project-based schedule",
    focus: "Handled >300M PHP infrastructure packages",
  },
  {
    title: "Civil Engineer",
    description: "Prepares structural designs and BOQs for multiple vertical projects.",
    specialization: "Structural Engineering",
    education: "Licensed Civil Engineer",
    yearsExperience: 3,
    salaryMin: 33000,
    salaryMax: 46000,
    agePreference: "23-40",
    jobStatus: "For Recruitment",
    barangay: "San Jose",
    requirements: [
      "PRC ID",
      "Structural design samples",
      "Barangay clearance",
      "Medical certificate",
    ],
    industryCodes: [
      { code: "7110", description: "Architectural and engineering activities" },
      { code: "4290", description: "Construction of other civil engineering projects" },
    ],
    vacancies: 3,
    dateOffset: 23,
    priority: "high",
    contactShift: "Mon-Sat 08:00-17:00",
    focus: "STAAD or ETABS expertise",
  },
  {
    title: "Instrumentation Technician",
    description: "Installs sensors and monitors PLC-controlled cold storage systems.",
    specialization: "Industrial Instrumentation",
    education: "Vocational diploma or BS in Electronics",
    yearsExperience: 3,
    salaryMin: 24000,
    salaryMax: 34000,
    agePreference: "21-38",
    jobStatus: "Open for Placement",
    barangay: "Labangal",
    requirements: [
      "Resume",
      "NCII - Instrumentation certificate",
      "Medical clearance",
      "Barangay clearance",
    ],
    industryCodes: [
      { code: "3320", description: "Installation of industrial machinery" },
      { code: "2711", description: "Manufacture of electric motors, generators and transformers" },
    ],
    vacancies: 2,
    dateOffset: 24,
    priority: "standard",
    contactShift: "Shift: 07:00-15:00",
    focus: "PLC troubleshooting experience",
  },
  {
    title: "Data Analyst",
    description: "Creates KPI dashboards combining sales, inventory, and HR datasets.",
    specialization: "Business Intelligence",
    education: "BS Statistics, Mathematics, or IT",
    yearsExperience: 2,
    salaryMin: 26000,
    salaryMax: 36000,
    agePreference: "21-35",
    jobStatus: "Open for Placement",
    barangay: "Bula",
    requirements: [
      "Resume",
      "Portfolio of dashboards",
      "Government IDs",
      "Certificate of trainings",
    ],
    industryCodes: [
      { code: "6311", description: "Data processing, hosting and related activities" },
      { code: "7020", description: "Management consultancy activities" },
    ],
    vacancies: 3,
    dateOffset: 25,
    priority: "high",
    contactShift: "Mon-Fri 09:00-18:00",
    focus: "Advanced Power BI/DAX skills",
  },
  {
    title: "Cybersecurity Specialist",
    description: "Monitors SIEM alerts and enforces security policies for BPO accounts.",
    specialization: "Security Operations",
    education: "BS IT or Computer Engineering",
    yearsExperience: 4,
    salaryMin: 36000,
    salaryMax: 52000,
    agePreference: "23-40",
    jobStatus: "Open for Placement",
    barangay: "City Heights",
    requirements: [
      "Resume",
      "Security certifications (CEH, CompTIA Security+)",
      "NBI clearance",
      "2 character references",
    ],
    industryCodes: [
      { code: "6209", description: "Other information technology service activities" },
      { code: "6202", description: "Computer consultancy" },
    ],
    vacancies: 2,
    dateOffset: 26,
    priority: "critical",
    contactShift: "Shift: 22:00-07:00",
    focus: "SIEM/SOC background required",
  },
  {
    title: "Call Center Team Lead",
    description: "Coaches 15 blended-support agents handling fintech customers.",
    specialization: "BPO Operations",
    education: "Bachelor's Degree or at least 2 years college",
    yearsExperience: 3,
    salaryMin: 28000,
    salaryMax: 38000,
    agePreference: "21-38",
    jobStatus: "Open for Placement",
    barangay: "City Heights",
    requirements: [
      "Resume",
      "Performance scorecards",
      "COE",
      "Government IDs",
    ],
    industryCodes: [
      { code: "8220", description: "Activities of call centers" },
      { code: "8291", description: "Activities of collection agencies" },
    ],
    vacancies: 4,
    dateOffset: 27,
    priority: "standard",
    contactShift: "Shift: 20:00-05:00",
    focus: "Fintech voice/chat experience",
  },
  {
    title: "Executive Assistant",
    description: "Supports C-level executives with calendaring, reports, and compliance.",
    specialization: "Executive Support",
    education: "Bachelor's Degree in Business Administration or related",
    yearsExperience: 4,
    salaryMin: 26000,
    salaryMax: 36000,
    agePreference: "24-40",
    jobStatus: "Open for Placement",
    barangay: "Dadiangas North",
    requirements: [
      "Resume",
      "Writing sample",
      "COE",
      "Government IDs",
    ],
    industryCodes: [
      { code: "8211", description: "Combined office administrative service activities" },
      { code: "8299", description: "Other business support service activities" },
    ],
    vacancies: 1,
    dateOffset: 28,
    priority: "standard",
    contactShift: "Mon-Fri 08:00-17:00",
    focus: "Board support experience",
  },
  {
    title: "Marketing Manager",
    description: "Leads omnichannel campaigns promoting premium resort and F&B outlets.",
    specialization: "Brand and Digital Marketing",
    education: "BSBA Marketing, MassCom, or related",
    yearsExperience: 6,
    salaryMin: 42000,
    salaryMax: 58000,
    agePreference: "27-45",
    jobStatus: "Open for Placement",
    barangay: "Dadiangas West",
    requirements: [
      "Campaign deck sample",
      "COE",
      "Government IDs",
      "Medical certificate",
    ],
    industryCodes: [
      { code: "7310", description: "Advertising" },
      { code: "5510", description: "Short term accommodation" },
    ],
    vacancies: 1,
    dateOffset: 29,
    priority: "high",
    contactShift: "Mon-Sat 09:00-18:00",
    focus: "Handled hotel or lifestyle brand",
  },
  {
    title: "Sales Consultant",
    description: "Manages corporate accounts for industrial equipment leasing.",
    specialization: "Technical Sales",
    education: "Bachelor's Degree in Engineering or Business",
    yearsExperience: 3,
    salaryMin: 23000,
    salaryMax: 33000,
    agePreference: "22-38",
    jobStatus: "Open for Placement",
    barangay: "Lagao",
    requirements: [
      "Resume",
      "Sales performance records",
      "Driver's license",
      "Barangay clearance",
    ],
    industryCodes: [
      { code: "4659", description: "Wholesale of machinery" },
      { code: "4610", description: "Agents involved in the sale of agricultural raw materials" },
    ],
    vacancies: 4,
    dateOffset: 30,
    priority: "standard",
    contactShift: "Mon-Sat 08:00-17:00",
    focus: "B2B background essential",
  },
  {
    title: "IT Support Specialist",
    description: "Provides L2 troubleshooting for hybrid workplace and field teams.",
    specialization: "Technical Support",
    education: "BS IT or Computer Science",
    yearsExperience: 2,
    salaryMin: 22000,
    salaryMax: 30000,
    agePreference: "20-35",
    jobStatus: "Open for Placement",
    barangay: "Apopong",
    requirements: [
      "Resume",
      "CompTIA A+/Network+ certificates (optional)",
      "Barangay clearance",
      "Government IDs",
    ],
    industryCodes: [
      { code: "6202", description: "Computer consultancy" },
      { code: "9512", description: "Repair of communication equipment" },
    ],
    vacancies: 5,
    dateOffset: 31,
    priority: "standard",
    contactShift: "Shift: 07:00-16:00 / 13:00-22:00",
    focus: "Strong endpoint management skills",
  },
  {
    title: "Legal Compliance Officer",
    description: "Tracks permits, contract compliance, and regulatory filings for agro-processing sites.",
    specialization: "Regulatory Compliance",
    education: "Bachelor's Degree in Law, Political Science, or related",
    yearsExperience: 4,
    salaryMin: 34000,
    salaryMax: 46000,
    agePreference: "24-42",
    jobStatus: "For Recruitment",
    barangay: "Katangawan",
    requirements: [
      "Resume",
      "Sample compliance tracker",
      "COE",
      "Government IDs",
    ],
    industryCodes: [
      { code: "6910", description: "Legal activities" },
      { code: "7020", description: "Management consultancy activities" },
    ],
    vacancies: 1,
    dateOffset: 32,
    priority: "high",
    contactShift: "Mon-Fri 09:00-18:00",
    focus: "Experience with FDA and DENR submissions",
  },
  {
    title: "Purchasing Officer",
    description: "Sources packaging materials, manages vendor scorecards, and negotiates terms.",
    specialization: "Procurement",
    education: "Bachelor's Degree in Business or Engineering",
    yearsExperience: 3,
    salaryMin: 24000,
    salaryMax: 33000,
    agePreference: "22-38",
    jobStatus: "Open for Placement",
    barangay: "Lagao",
    requirements: [
      "Resume",
      "List of handled categories",
      "Barangay clearance",
      "Supplier references",
    ],
    industryCodes: [
      { code: "4610", description: "Agents involved in the sale of raw materials" },
      { code: "7020", description: "Management consultancy activities" },
    ],
    vacancies: 2,
    dateOffset: 33,
    priority: "standard",
    contactShift: "Mon-Fri 08:30-17:30",
    focus: "SAP procurement module experience",
  },
  {
    title: "Community Development Worker",
    description: "Implements livelihood and workforce readiness programs with barangay partners.",
    specialization: "Community Organizing",
    education: "Bachelor's Degree in Social Work, Development Communication, or related",
    yearsExperience: 3,
    salaryMin: 22000,
    salaryMax: 30000,
    agePreference: "22-40",
    jobStatus: "Open for Placement",
    barangay: "Sinawal",
    requirements: [
      "Resume",
      "Portfolio of community projects",
      "Barangay clearance",
      "Health certificate",
    ],
    industryCodes: [
      { code: "8890", description: "Other social work activities without accommodation" },
      { code: "8413", description: "Regulation of and contribution to more efficient operation of businesses" },
    ],
    vacancies: 4,
    dateOffset: 34,
    priority: "high",
    contactShift: "Fieldwork with flexible hours",
    focus: "Experience leading DOLE/TESDA community projects",
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const pad = (value: number, length = 2) => value.toString().padStart(length, "0");

const registrationDateRangeStart = new Date("2021-01-01T00:00:00Z");
const registrationDateRangeEnd = new Date();
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const randomDateBetween = (start: Date, end: Date) => {
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (endMs <= startMs) {
    return new Date(startMs);
  }
  const randomTimestamp = startMs + Math.random() * (endMs - startMs);
  return new Date(randomTimestamp);
};

async function upsertAdmin(db: any, {
  id,
  name,
  email,
  password,
}: { id: string; name: string; email: string; password: string; }) {
  const passwordHash = await getPasswordHash(password);
  const existing = await db.query.adminsTable.findFirst({
    where: (table: typeof adminsTable) => eq(table.email, email.trim().toLowerCase()),
  });
  if (existing) {
    await db
      .update(adminsTable)
      .set({ name, passwordHash, role: "admin" })
      .where(eq(adminsTable.id, existing.id));
    console.log(`✓ Admin updated: ${email}`);
    return existing.id;
  }
  await db.insert(adminsTable).values({
    id,
    name,
    email,
    passwordHash,
    role: "admin",
  });
  console.log(`✓ Admin created: ${email}`);
  return id;
}

function createEmployerSeedData(passwordHash: string, count: number): EmployerSeedEntry[] {
  const baseLatitude = 6.1103;
  const baseLongitude = 125.1749;
  const entries: EmployerSeedEntry[] = [];
  for (let i = 0; i < count; i++) {
    const profile = employerProfiles[i % employerProfiles.length];
    const index = i;
    const id = `employer_demo_${pad(index + 1, 2)}`;
    const municipality = profile.municipality ?? "General Santos City";
    const province = profile.province ?? "South Cotabato";
    const slug = slugify(profile.tradeName);
    const contactPhone = `083-555-${pad(2100 + index * 11, 4)}`;
    const contactEmail = `hr.${slug}@gensanworks-demo.ph`;
    const alternateContacts = [
      {
        name: `${profile.contactName.split(" ")[0]} Alternate`,
        role: "Operations Lead",
        mobile: `09${(920000000 + index * 12345).toString().padStart(9, "0")}`,
        email: `ops.${slug}@gensanworks-demo.ph`,
      },
      {
        name: "Finance Desk",
        role: "Finance Supervisor",
        mobile: `09${(930000000 + index * 7654).toString().padStart(9, "0")}`,
        email: `finance.${slug}@gensanworks-demo.ph`,
      },
    ];
    const requirementDate = `2024-${pad(((index + 2) % 12) + 1)}-${pad(((index + 5) % 20) + 5)}`;
    const requirementSet = [
      { name: "SRS Form 2A", status: "submitted", reference: `SRS-${id}`, submittedAt: requirementDate },
      { name: "Business Permit", status: "submitted", reference: `BP-${pad(150 + index, 3)}`, submittedAt: requirementDate },
      { name: "BIR 2303", status: "submitted", reference: `BIR-${2020 + index}`, submittedAt: requirementDate },
      { name: "Company Profile", status: "submitted", reference: `CP-${id}`, submittedAt: requirementDate },
    ];
    const attachments = [
      { label: "Business Permit", url: `https://demo.gensanworks.ph/attachments/employers/${id}/business-permit.pdf` },
      { label: "BIR 2303", url: `https://demo.gensanworks.ph/attachments/employers/${id}/bir-2303.pdf` },
      { label: "Company Profile", url: `https://demo.gensanworks.ph/attachments/employers/${id}/company-profile.pdf` },
    ];
    const geo = {
      region: "Region XII",
      province,
      municipality,
      barangay: profile.barangay,
      latitude: Number(baseLatitude + index * 0.01).toFixed(4),
      longitude: Number(baseLongitude + index * 0.008).toFixed(4),
    };
    const preparedByName = preparedByPeople[index % preparedByPeople.length];
    const employerRow: EmployerRow = {
      id,
      establishmentName: profile.establishmentName,
      tradeName: profile.tradeName,
      houseStreetVillage: profile.addressLine,
      barangay: profile.barangay,
      municipality,
      province,
      completeAddress: `${profile.addressLine}, Brgy. ${profile.barangay}, ${municipality}, ${province}`,
      addressDetails: JSON.stringify({
        street: profile.addressLine,
        barangay: profile.barangay,
        municipality,
        province,
        zipCode: "9500",
        plusCode: `VX${pad(50 + index, 2)}+${pad(20 + index, 2)} GenSan`,
      }),
      contactNumber: contactPhone,
      contactEmail,
      contactPerson: JSON.stringify({
        name: profile.contactName,
        designation: profile.contactDesignation,
        phone: contactPhone,
        email: contactEmail,
      }),
      alternateContacts: JSON.stringify(alternateContacts),
      email: `employer${pad(index + 1, 2)}@gensanworks-demo.ph`,
      numberOfPaidEmployees: 140 + index * 18,
      numberOfVacantPositions: 4 + (index % 6),
      industryCodes: JSON.stringify(profile.industryCodes),
      industryType: JSON.stringify(profile.industryType),
      srsSubscriber: profile.srsSubscriber,
      subscriptionStatus: profile.subscriptionStatus,
      companyTin: `TIN-${pad(200 + index, 3)}-${pad(500 + index * 7, 3)}-${pad(100 + index, 3)}`,
      companyTaxIdNumber: `CT-${pad(320 + index, 3)}-${pad(900 + index * 5, 4)}`,
      businessPermitNumber: `BP-24-${pad(150 + index, 3)}`,
      bir2303Number: `BIR-R12-${2020 + index}-${pad(50 + index, 3)}`,
      requirements: JSON.stringify(requirementSet),
      attachments: JSON.stringify(attachments),
      chairpersonName: `Hon. ${profile.barangay} Barangay Captain`,
      chairpersonContact: `083-552-${pad(3100 + index * 8, 4)}`,
      secretaryName: `Sec. ${profile.barangay} Council`,
      secretaryContact: `083-553-${pad(4100 + index * 5, 4)}`,
      barangayChairperson: `Hon. ${profile.barangay} Barangay Captain`,
      barangaySecretary: `Ms. ${profile.barangay} Barangay Secretary`,
      geographicIdentification: JSON.stringify(geo),
      preparedByName,
      preparedByDesignation: "PESO Employment Facilitator",
      preparedByContact: `0965${(8000000 + index * 3511).toString().padStart(7, "0")}`,
      dateAccomplished: `2024-${pad(((index + 3) % 12) + 1)}-${pad(((index + 6) % 20) + 3)}`,
      remarks: profile.focusRemark ?? remarksList[index % remarksList.length],
      isManpowerAgency: profile.isManpowerAgency,
      doleCertificationNumber: `DOLE-R12-${2021 + index}-${pad(300 + index, 3)}`,
      archived: false,
      archivedAt: null,
      passwordHash,
      hasAccount: true,
    };

    entries.push({
      row: employerRow,
      contactPerson: {
        name: profile.contactName,
        designation: profile.contactDesignation,
        phone: contactPhone,
        email: contactEmail,
      },
    });
  }
  return entries;
}

function createJobSeedData(employers: EmployerSeedEntry[], count: number): JobRow[] {
  const baseDate = new Date("2024-09-15T00:00:00Z");
  const jobs: JobRow[] = [];
  for (let i = 0; i < count; i++) {
    const job = jobCatalog[i % jobCatalog.length];
    const index = i;
    const employerEntry = employers[index % employers.length];
    const jobId = `job_demo_${pad(index + 1, 3)}`;
    const accomplishedDate = new Date(baseDate.getTime() + job.dateOffset * 24 * 60 * 60 * 1000);
    const requirementsPayload = job.requirements.map((req, reqIndex) => ({
      label: req,
      mandatory: reqIndex < job.requirements.length - 1,
      notes: job.focus,
    }));
    jobs.push({
      id: jobId,
      employerId: employerEntry.row.id,
      status: "approved",
      establishmentName: employerEntry.row.establishmentName,
      positionTitle: job.title,
      description: job.description,
      industryCodes: JSON.stringify(job.industryCodes),
      minimumEducationRequired: job.education,
      mainSkillOrSpecialization: job.specialization,
      yearsOfExperienceRequired: job.yearsExperience,
      agePreference: job.agePreference,
      salary: JSON.stringify({
        min: job.salaryMin,
        max: job.salaryMax,
        currency: "PHP",
        frequency: "monthly",
      }),
      startingSalaryOrWage: job.salaryMin,
      vacantPositions: job.vacancies,
      paidEmployees: employerEntry.row.numberOfPaidEmployees ?? 80,
      jobStatus: job.jobStatus,
      contact: JSON.stringify({
        person: employerEntry.contactPerson.name,
        designation: employerEntry.contactPerson.designation,
        email: employerEntry.contactPerson.email,
        phone: employerEntry.contactPerson.phone,
        officeHours: job.contactShift,
      }),
      requirements: JSON.stringify(requirementsPayload),
      preparedByName: employerEntry.row.preparedByName,
      preparedByDesignation: employerEntry.row.preparedByDesignation,
      preparedByContact: employerEntry.row.preparedByContact,
      dateAccomplished: accomplishedDate.toISOString().split("T")[0],
      attachments: JSON.stringify([
        { label: "Job Description", url: `https://demo.gensanworks.ph/attachments/jobs/${jobId}.pdf` },
        { label: "Org Chart", url: `https://demo.gensanworks.ph/attachments/jobs/${jobId}-orgchart.pdf` },
      ]),
      accountMetadata: JSON.stringify({
        source: "demo-seed",
        batch: "gensanworks-2024",
        priority: job.priority,
        reviewStatus: "vetted",
      }),
      barangay: job.barangay,
      municipality: employerEntry.row.municipality ?? "General Santos City",
      province: employerEntry.row.province ?? "South Cotabato",
      archived: false,
      archivedAt: null,
    } satisfies JobRow);
  }
  return jobs;
}

function createApplicantSeedData(passwordHash: string, count: number): ApplicantRow[] {
  const applicantRows: ApplicantRow[] = [];
  for (let index = 0; index < count; index += 1) {
    const firstName = applicantFirstNames[index % applicantFirstNames.length];
    const surname = applicantSurnames[(index * 3) % applicantSurnames.length];
    const middleName = applicantMiddleNames[(index * 5) % applicantMiddleNames.length];
    const suffix = applicantSuffixes[index % applicantSuffixes.length];
    const year = 1982 + (index % 20);
    const month = ((index % 12) + 1);
    const day = ((index * 3) % 27) + 1;
    const dateOfBirth = `${year}-${pad(month)}-${pad(day)}`;
    const religion = religions[index % religions.length];
    const civilStatus = civilStatuses[index % civilStatuses.length];
    const sex = sexes[index % sexes.length];
    const employmentStatus = employmentStatuses[index % employmentStatuses.length];
    const employmentType = employmentTypes[index % employmentTypes.length];
    const monthsUnemployed = employmentStatus === "unemployed" ? (index % 18) + 1 : employmentStatus === "fresh graduate" ? (index % 6) + 2 : 0;
    const barangay = barangays[index % barangays.length];
    const municipality = "General Santos City";
    const province = "South Cotabato";
    const street = streetNames[index % streetNames.length];
    const contactNumber = `09${(900000000 + index).toString().padStart(9, "0")}`;
    const disability = index % 11 === 0 ? "Hearing impairment" : index % 13 === 0 ? "Orthopedic impairment" : "None";
    const isOFW = index % 7 === 0;
    const isFormerOFW = index % 5 === 0;
    const ofwCountry = isOFW ? overseasCountries[index % overseasCountries.length] : "Not applicable";
    const formerCountry = isFormerOFW ? overseasCountries[(index + 3) % overseasCountries.length] : "Not applicable";
    const returnToPHDate = isFormerOFW ? `202${index % 4}-${pad(((index + 4) % 12) + 1)}-15` : "Not applicable";
    const is4ps = index % 6 === 0;
    const preferredOccupations = [
      jobCatalog[index % jobCatalog.length].title,
      jobCatalog[(index + 9) % jobCatalog.length].title,
    ];
    const preferredLocations = [
      "General Santos City",
      preferredLocationsPool[(index + 2) % preferredLocationsPool.length],
      preferredLocationsPool[(index + 3) % preferredLocationsPool.length],
    ];
    const interestedOverseas = isOFW || isFormerOFW || index % 4 === 0;
    const preferredCountries = interestedOverseas
      ? [
        overseasCountries[index % overseasCountries.length],
        overseasCountries[(index + 5) % overseasCountries.length],
      ]
      : ["Prefers local opportunities"];
    const languageProficiency = [
      { language: "Filipino", read: true, write: true, speak: true, understand: true },
      { language: "English", read: true, write: true, speak: true, understand: true },
      {
        language: dialects[index % dialects.length],
        read: true,
        write: index % 2 === 0,
        speak: true,
        understand: true,
      },
    ];
    const educationHistory = [
      {
        level: "College",
        course: courseList[index % courseList.length],
        schoolName: schools[(index + 3) % schools.length],
        yearGraduated: `${2010 + (index % 12)}`,
        honorsReceived: index % 17 === 0 ? "With honors" : "None",
      },
      {
        level: "Senior High School",
        strand: index % 2 === 0 ? "STEM" : "ABM",
        schoolName: "General Santos City National High School",
        yearGraduated: `${2008 + (index % 12)}`,
      },
    ];
    const trainingProgram = trainingPrograms[index % trainingPrograms.length];
    const trainingHistory = [
      {
        course: trainingProgram,
        trainingType: "TESDA-certified",
        hoursOfTraining: 120 + (index % 60),
        trainingInstitution: "TESDA General Santos",
        skillsAcquired: [`Competencies in ${trainingProgram}`],
        certificatesReceived: `${trainingProgram} Certificate`,
        dateCompleted: `202${index % 5}-${pad(((index + 3) % 12) + 1)}-20`,
        sponsoredBy: index % 4 === 0 ? "DOLE SPES" : "Company-funded",
      },
    ];
    const licenseInfo = licenseCatalog[index % licenseCatalog.length];
    const licenseHistory = [
      {
        eligibility: licenseInfo,
        licenseNumber: `${slugify(licenseInfo).toUpperCase().slice(0, 6)}-${pad(3000 + index, 5)}`,
        validUntil: `202${(index % 4) + 5}-${pad(((index + 5) % 12) + 1)}-28`,
        issuedBy: licenseInfo.includes("PRC") ? "PRC" : "TESDA",
        rating: `${82 + (index % 15)}`,
        examPlace: "General Santos City",
      },
    ];
    const companyName = companyList[(index + 4) % companyList.length];
    const jobTitle = jobCatalog[(index + 6) % jobCatalog.length].title;
    const startYear = 2011 + (index % 8);
    const endYear = startYear + 2 + (index % 3);
    const workExperience = [
      {
        companyName,
        address: `${barangay}, General Santos City`,
        position: jobTitle,
        numberOfMonths: Math.max(12, (endYear - startYear) * 12),
        startDate: `${startYear}-${pad(((index % 12) + 1))}-01`,
        endDate: `${endYear}-${pad((((index + 5) % 12) + 1))}-01`,
        status: index % 4 === 0 ? "regular" : "contractual",
        industry: industries[(index + 5) % industries.length],
        monthlySalary: 15000 + (index % 15) * 700,
        reasonForLeaving: index % 3 === 0 ? "Career advancement" : "Project completion",
        highlights: [
          "Implemented productivity improvements",
          "Handled cross-functional coordination",
        ],
      },
    ];
    const otherSkills = skillClusters[index % skillClusters.length];
    const registeredAtDate = randomDateBetween(registrationDateRangeStart, registrationDateRangeEnd);
    const updatedAtTime = Math.min(
      registeredAtDate.getTime() + (index % 90) * DAY_IN_MS,
      registrationDateRangeEnd.getTime(),
    );
    const updatedAtDate = new Date(updatedAtTime);
    const applicantRow = {
      id: `applicant_demo_${pad(index + 1, 4)}`,
      surname,
      firstName,
      middleName,
      suffix,
      dateOfBirth,
      sex,
      religion,
      civilStatus,
      height: `${150 + (index % 35)} cm`,
      contactNumber,
      email: `applicant${pad(index + 1, 3)}@demo.gensanworks.com`,
      profileImage: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${surname}`)}`,
      houseStreetVillage: `Block ${(index % 30) + 1}, ${street}, Purok ${(index % 7) + 1}`,
      barangay,
      municipality,
      province,
      disability,
      disabilitySpecify: disability === "None" ? "Not applicable" : disability,
      employmentStatus,
      employmentType,
      monthsUnemployed,
      isOFW,
      owfCountry: ofwCountry,
      isFormerOFW,
      formerOFWCountry: formerCountry,
      returnToPHDate,
      is4PSBeneficiary: is4ps,
      householdID: is4ps ? `4PS-${2020 + (index % 5)}-${pad(index + 1, 4)}` : "Not registered",
      preferredOccupations: JSON.stringify(preferredOccupations),
      preferredLocations: JSON.stringify(preferredLocations),
      preferredOverseasCountries: JSON.stringify(preferredCountries),
      employmentType4: nsrpEmploymentTypes[index % nsrpEmploymentTypes.length],
      languageProficiency: JSON.stringify(languageProficiency),
      education: JSON.stringify(educationHistory),
      technicalTraining: JSON.stringify(trainingHistory),
      professionalLicenses: JSON.stringify(licenseHistory),
      workExperience: JSON.stringify(workExperience),
      otherSkills: JSON.stringify(otherSkills),
      otherSkillsSpecify: `Experienced in ${otherSkills.join(", ")}`,
      passwordHash,
      role: "jobseeker",
      hasAccount: true,
      registeredAt: registeredAtDate,
      createdAt: registeredAtDate,
      updatedAt: updatedAtDate,
    };
    applicantRows.push(applicantRow as ApplicantRow);
  }
  return applicantRows;
}

async function chunkedInsert(db: any, table: any, rows: any[], chunkSize = 100) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    if (chunk.length) {
      await db.insert(table).values(chunk);
    }
  }
}

async function seedDatabase() {
  console.log("🌱 Seeding database with comprehensive demo data...");

  try {
    const db = await initializeDatabase();

    console.log("Clearing existing demo data...");
    await db.delete(applicationsTable);
    await db.delete(jobsTable);
    await db.delete(applicantsTable);
    await db.delete(employersTable);
    await db.delete(adminsTable);

    console.log("Ensuring admin account...");
    await upsertAdmin(db, {
      id: "admin_demo_account",
      name: "System Administrator",
      email: "admin@local.test",
      password: "adminpass",
    });

    console.log("Creating employer profiles (45)...");
    const employerPasswordHash = await getPasswordHash("EmployerDemoPass123!");
    const employerEntries = createEmployerSeedData(employerPasswordHash, 45);
    await chunkedInsert(db, employersTable, employerEntries.map((entry) => entry.row), 15);

    console.log("Creating job postings (75)...");
    const jobEntries = createJobSeedData(employerEntries, 75);
    await chunkedInsert(db, jobsTable, jobEntries, 25);

    console.log("Creating applicant profiles (765)...");
    const jobseekerPasswordHash = await getPasswordHash("JobseekerDemoPass123!");
    const applicantEntries = createApplicantSeedData(jobseekerPasswordHash, 765);
    await chunkedInsert(db, applicantsTable, applicantEntries, 50);

    const [employerCountRow] = await db.select({ count: sql<number>`count(*)` }).from(employersTable);
    const [jobCountRow] = await db.select({ count: sql<number>`count(*)` }).from(jobsTable);
    const [applicantCountRow] = await db.select({ count: sql<number>`count(*)` }).from(applicantsTable);

    console.log("\n✅ Database seeded successfully!");
    console.log("─────────────────────────────");
    console.log(`• Employers: ${Number(employerCountRow?.count ?? 0)}`);
    console.log(`• Jobs: ${Number(jobCountRow?.count ?? 0)}`);
    console.log(`• Applicants: ${Number(applicantCountRow?.count ?? 0)}`);
    console.log("─────────────────────────────");
    console.log("Sample credentials:");
    console.log("  Admin        : admin@local.test / adminpass");
    console.log("  Employer     : employer01@gensanworks-demo.ph / EmployerDemoPass123!");
    console.log("  Jobseeker    : applicant001@demo.gensanworks.com / JobseekerDemoPass123!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase().catch(console.error);
