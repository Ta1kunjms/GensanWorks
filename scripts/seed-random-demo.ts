import { randomUUID } from "crypto";
import { initializeDatabase } from "../server/database";
import { employersTable, jobsTable, usersTable } from "../server/unified-schema";

// Helpers
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dateStringBetween(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + Math.random() * (end - start));
  return d.toISOString().split("T")[0];
}

// Reference data (Filipino-flavored)
const surnames = [
  "Santos","Reyes","Cruz","Flores","Garcia","Dela Cruz","Ramos","Torres","Gonzales","Lopez",
  "Martinez","Perez","Castro","Mendoza","Rivera","Alvarez","Morales","Gutierrez","Bautista","Padilla",
  "Domingo","Valdez","Aguilar","Aquino","Navarro","Castillo","Villanueva","Vicente","Salazar","Lorenzo",
];

const firstNames = [
  "Juan","Maria","Jose","Ana","Mark","Grace","John","Paul","Rose","James",
  "Jessa","Carlo","Angel","Kim","Liza","Rafael","Cathy","Miguel","Ella","Francis",
  "Aileen","Jerome","Leah","Arvin","Monica","Paolo","Bianca","Noel","Christine","Harold",
];

const middleNames = ["Santos", "Reyes", "Cruz", "Garcia", "Dela Cruz", "Morales", "Aguilar", "Navarro"];
const suffixes = ["Jr.", "Sr.", "III", "IV", "II"];

const barangays = [
  "Lagao","San Isidro","City Heights","Calumpang","Fatima","Bula","Dadiangas East","Dadiangas West",
  "Dadiangas North","Dadiangas South","Apopong","Tambler","Sinawal","Conel","Olympog","Baluan","Buayan",
  "Katangawan","Labangal","Mabuhay","Upper Labay",
];

const establishments = [
  "KCC Mall of Gensan","SM City General Santos","Robinsons Place Gensan","Gensan Public Market",
  "General Santos Doctors Hospital","Notre Dame of Dadiangas University","Mindanao State University Gensan",
  "East Asia Royale Hotel","Tuna Exporters Inc.","San Miguel Foods Gensan","Dole Philippines Gensan",
  "Coca-Cola Bottlers Gensan","Puregold Gensan","Gaisano Mall Gensan","Unilever Gensan","Toyota General Santos",
  "Honda Cars Gensan","Mercury Drug Gensan","7-Eleven Gensan","Jollibee Gensan Branch",
];

const jobTitles = [
  "Sales Associate","Cashier","Nurse","Teacher","Security Guard","Driver","Cook","Waiter","Receptionist",
  "IT Support Staff","HR Officer","Accountant","Engineer","Janitor","Mechanic","Electrician","Pharmacist",
  "Warehouse Staff","Production Worker","Customer Service Representative","Marketing Assistant","Store Manager",
  "Supervisor","Barista","Crew Member","Delivery Rider","Admin Assistant","Purchasing Officer","Maintenance Staff",
  "Chef","Baker","Graphic Designer","Call Center Agent","Medical Technologist","Sales Manager","Operations Manager",
];

const industries = [
  { code: "07", label: "Wholesale and Retail Trade" },
  { code: "09", label: "Transport, Storage and Communication" },
  { code: "14", label: "Health and Social Work" },
  { code: "08", label: "Hotels and Restaurant" },
  { code: "04", label: "Manufacturing" },
  { code: "03", label: "Mining and Quarrying" },
  { code: "06", label: "Construction" },
  { code: "01", label: "Agriculture" },
  { code: "10", label: "Financial Intermediation" },
  { code: "13", label: "Education" },
  { code: "02", label: "Fishing" },
  { code: "11", label: "Real Estate, Renting and Business Activities" },
  { code: "12", label: "Public Administration and Defense" },
  { code: "15", label: "Other Community, Social and Personal Service Activities" },
  { code: "16", label: "Activities of Private Households as Employers" },
  { code: "17", label: "Extra-Territorial Organizations and Bodies" },
  { code: "05", label: "Electrical, Gas and Water Supply" },
];

const civilStatuses = ["Single","Married","Widowed","Separated"];
const sexes = ["Male","Female"];
const religions = ["Catholic","Christian","Muslim","Iglesia ni Cristo","Aglipayan"];
const educations = ["Elementary","Secondary","Senior High","Vocational","College","Graduate"];
const bloodTypes = ["O+","A+","B+","AB+","O-","A-","B-","AB-"];
const employmentStatuses = [
  "Employed","Unemployed","Self-employed","Wage employed","Fisherman/Fisherfolk","Vendor/Retailer",
  "Home-based worker","Transport","Domestic Worker","Freelancer","Artisan/Craft Worker","New Entrant/Fresh Graduate",
  "Finished Contract","Resigned","Retired","Terminated/Laid off due to calamity",
  "Terminated/Laid off (local)","Terminated/Laid off (abroad)","Others",
];

const selfEmployedCategories = [
  "Fisherman/Fisherfolk","Vendor/Retailer","Home-based worker","Transport","Domestic Worker",
  "Freelancer","Artisan/Craft Worker","Others",
];

const unemployedReasons = [
  "New Entrant/Fresh Graduate","Finished Contract","Resigned","Retired",
  "Terminated/Laid off due to calamity","Terminated/Laid off (local)","Terminated/Laid off (abroad)","Others",
];

const employmentTypes = [
  "Wage employed","Self-employed","Fisherman/Fisherfolk","Vendor/Retailer","Home-based worker","Transport",
  "Domestic Worker","Freelancer","Artisan/Craft Worker","Others",
];

const salaryPeriods = ["hourly","daily","weekly","15days","monthly"] as const;
const workflowStatuses = ["pending","active","draft","closed","rejected"] as const;
const jobTenureCodes = ["P","T","C"] as const;

const skillsPool = [
  "Communication","Teamwork","Time Management","Customer Service","Cash Handling","Driving","First Aid",
  "Cooking","Inventory Management","Microsoft Office","Basic Networking","Graphic Design","Bookkeeping",
  "Sales","Marketing","Public Speaking","Data Entry","Equipment Maintenance","Quality Control",
];

const educationDetails = [
  { highest: "College", course: "BSBA Marketing", school: "Notre Dame of Dadiangas University" },
  { highest: "College", course: "BSIT", school: "Mindanao State University Gensan" },
  { highest: "Senior High", course: "ABM", school: "General Santos High" },
  { highest: "Vocational", course: "Automotive Servicing", school: "TESDA Gensan" },
  { highest: "Graduate", course: "MBA", school: "Ateneo de Davao" },
];

const TOTAL_APPLICANTS = 567;
const TOTAL_EMPLOYERS = 40;
const TOTAL_JOBS = 37;

function buildAddress(barangay: string) {
  return {
    houseStreetVillage: `Blk ${randomInt(1, 20)} Lot ${randomInt(1, 30)} ${barangay} Village`,
    barangay,
    municipality: "General Santos City",
    province: "South Cotabato",
    zipCode: "9500",
  };
}

function buildContact(name: string, email: string) {
  return {
    name,
    designation: "HR Officer",
    phone: `09${randomInt(100000000, 999999999)}`,
    email,
  };
}

function buildEmployerRequirements() {
  return {
    srsForm: { submitted: true, reference: `SRS-${randomInt(1000, 9999)}` },
    businessPermit: { submitted: true, reference: `BP-${randomInt(1000, 9999)}` },
    bir2303: { submitted: true, reference: `BIR-${randomInt(1000, 9999)}` },
    companyProfile: { submitted: true },
  };
}

function buildAttachments(prefix: string, index: number) {
  return [
    { type: "document", name: `${prefix}-doc-${index}.pdf`, url: `https://files.gensanworks.test/${prefix}-doc-${index}.pdf` },
    { type: "id", name: `${prefix}-id-${index}.jpg`, url: `https://files.gensanworks.test/${prefix}-id-${index}.jpg` },
  ];
}

async function wipeTables(db: any) {
  console.log("Clearing existing jobs, employers, and applicants...");
  await db.delete(jobsTable);
  await db.delete(employersTable);
  await db.delete(usersTable);
}

async function seedApplicants(db: any) {
  console.log(`Seeding ${TOTAL_APPLICANTS} applicants with complete fields...`);
  const batchSize = 120;

  for (let start = 0; start < TOTAL_APPLICANTS; start += batchSize) {
    const rows: any[] = [];
    const end = Math.min(start + batchSize, TOTAL_APPLICANTS);

    for (let i = start; i < end; i++) {
      const surname = randomFrom(surnames);
      const firstName = randomFrom(firstNames);
      const middleName = randomFrom(middleNames);
      const suffix = randomFrom(suffixes);
      const barangay = randomFrom(barangays);
      const address = buildAddress(barangay);
      const occupation = randomFrom(jobTitles);
      const preferredIndustry = randomFrom(industries);
      const edu = randomFrom(educationDetails);

      const workExperience = [
        {
          company: randomFrom(establishments),
          position: randomFrom(jobTitles),
          start: dateStringBetween(2012, 2018),
          end: dateStringBetween(2019, 2024),
          currentlyWorking: false,
        },
      ];

      const languageProficiency = [
        { language: "English", speaking: "fluent", writing: "fluent" },
        { language: "Filipino", speaking: "fluent", writing: "fluent" },
      ];

      const attachments = buildAttachments("applicant", i + 1);

      rows.push({
        id: `user_seed_${i + 1}`,
        email: `applicant${i + 1}@seed.gensanworks.com`,
        passwordHash: "seeded-applicant-password-hash",
        hasAccount: true,
        role: i % 10 === 0 ? "freelancer" : "jobseeker",
        surname,
        firstName,
        middleName,
        suffix,
        dateOfBirth: dateStringBetween(1980, 2003),
        sex: randomFrom(sexes),
        religion: randomFrom(religions),
        civilStatus: randomFrom(civilStatuses),
        height: `${randomInt(150, 185)} cm`,
        weight: `${randomInt(45, 95)} kg`,
        bloodType: randomFrom(bloodTypes),
        contactNumber: `09${randomInt(100000000, 999999999)}`,
        disability: "None",
        disabilitySpecify: "None",
        address: `${address.houseStreetVillage}, ${address.barangay}, ${address.municipality}, ${address.province} ${address.zipCode}`,
        houseStreetVillage: address.houseStreetVillage,
        barangay: address.barangay,
        municipality: address.municipality,
        province: address.province,
        zipCode: address.zipCode,
        employmentStatus: randomFrom(employmentStatuses),
        employmentStatusDetail: "Actively looking for opportunities",
        selfEmployedCategory: randomFrom(selfEmployedCategories),
        selfEmployedCategoryOther: "N/A",
        unemployedReason: randomFrom(unemployedReasons),
        unemployedReasonOther: "N/A",
        unemployedAbroadCountry: "Singapore",
        employmentType: randomFrom(employmentTypes),
        employmentType4: "Full-time",
        monthsUnemployed: randomInt(0, 18),
        isOfw: i % 7 === 0,
        ofwCountry: "Saudi Arabia",
        isFormerOfw: i % 11 === 0,
        formerOFWCountry: "United Arab Emirates",
        returnToPHDate: dateStringBetween(2018, 2024),
        is4psBeneficiary: i % 5 === 0,
        householdID: `HH-${10000 + i}`,
        nsrpNumber: `NSRP-${(100000 + i).toString()}`,
        governmentIdType: "PhilHealth",
        governmentIdNumber: `PH-${900000 + i}`,
        willingToRelocate: i % 4 === 0,
        willingToWorkOverseas: i % 3 === 0,
        jobPreferences: {
          desiredSalary: { min: 15000, max: 30000, period: "monthly" },
          schedule: "Day shift",
          preferredIndustryCodes: [preferredIndustry.code],
        },
        preferredOccupations: [occupation, randomFrom(jobTitles)],
        preferredLocations: [
          { city: "General Santos City", barangay },
          { city: "Koronadal", barangay: "Zone III" },
        ],
        preferredOverseasCountries: ["Japan", "Singapore", "United Arab Emirates"],
        education: edu,
        technicalTraining: [
          { title: "Basic Computer", hours: 40, provider: "TESDA" },
          { title: "Customer Service", hours: 32, provider: "LGU Gensan" },
        ],
        professionalLicenses: [
          { name: "TESDA NCII", issuedBy: "TESDA", year: 2021 },
        ],
        languageProficiency,
        workExperience,
        otherSkills: ["Driving", "Cooking"],
        skills: [randomFrom(skillsPool), randomFrom(skillsPool), randomFrom(skillsPool)],
        otherSkillsTraining: "Leadership training",
        otherSkillsSpecify: "Basic carpentry",
        attachments,
        notes: "Seeded applicant for demo.",
        registeredAt: new Date(),
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (rows.length > 0) {
      await db.insert(usersTable).values(rows);
    }
  }
}

async function seedEmployers(db: any) {
  console.log(`Seeding ${TOTAL_EMPLOYERS} employers with complete fields...`);
  const rows: any[] = [];

  for (let i = 0; i < TOTAL_EMPLOYERS; i++) {
    const barangay = randomFrom(barangays);
    const address = buildAddress(barangay);
    const industry = randomFrom(industries);
    const altIndustry = randomFrom(industries);
    const contact = buildContact(`${randomFrom(firstNames)} ${randomFrom(surnames)}`, `contact${i + 1}@employer.gensanworks.com`);

    rows.push({
      id: `employer_seed_${i + 1}`,
      establishmentName: establishments[i % establishments.length],
      tradeName: `${establishments[i % establishments.length]} Trading`,
      houseStreetVillage: address.houseStreetVillage,
      barangay: address.barangay,
      municipality: address.municipality,
      province: address.province,
      completeAddress: `${address.houseStreetVillage}, ${address.barangay}, ${address.municipality}, ${address.province} ${address.zipCode}`,
      addressDetails: address,
      contactNumber: contact.phone,
      contactEmail: contact.email,
      contactPerson: contact,
      alternateContacts: [buildContact(`${randomFrom(firstNames)} ${randomFrom(surnames)}`, `alt${i + 1}@gensanworks.com`)],
      email: `employer${i + 1}@seed.gensanworks.com`,
      numberOfPaidEmployees: randomInt(25, 500),
      numberOfVacantPositions: randomInt(3, 25),
      industryCodes: [industry.code, altIndustry.code],
      industryType: { primary: industry.label, secondary: altIndustry.label },
      srsSubscriber: true,
      subscriptionStatus: "active",
      companyTin: `TIN-${200000 + i}`,
      companyTaxIdNumber: `CTAX-${500000 + i}`,
      businessPermitNumber: `BP-${300000 + i}`,
      bir2303Number: `BIR-${400000 + i}`,
      requirements: buildEmployerRequirements(),
      attachments: buildAttachments("employer", i + 1),
      chairpersonName: `${randomFrom(firstNames)} ${randomFrom(surnames)}`,
      chairpersonContact: `09${randomInt(100000000, 999999999)}`,
      secretaryName: `${randomFrom(firstNames)} ${randomFrom(surnames)}`,
      secretaryContact: `09${randomInt(100000000, 999999999)}`,
      barangayChairperson: `${randomFrom(firstNames)} ${randomFrom(surnames)}`,
      barangaySecretary: `${randomFrom(firstNames)} ${randomFrom(surnames)}`,
      geographicIdentification: {
        region: "SOCCSKSARGEN",
        province: address.province,
        city: address.municipality,
        barangay: address.barangay,
      },
      preparedByName: contact.name,
      preparedByDesignation: contact.designation,
      preparedByContact: contact.phone,
      dateAccomplished: dateStringBetween(2022, 2024),
      remarks: "Seeded employer for demo.",
      isManpowerAgency: i % 6 === 0,
      doleCertificationNumber: `DOLE-${600000 + i}`,
      archived: false,
      archivedAt: new Date(),
      passwordHash: "seeded-employer-password-hash",
      hasAccount: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.insert(employersTable).values(rows);
}

async function seedJobs(db: any) {
  console.log(`Seeding ${TOTAL_JOBS} jobs with complete fields...`);
  const employers = await db.select().from(employersTable);
  if (employers.length === 0) {
    console.warn("No employers found; skipping jobs seeding.");
    return;
  }

  const rows: any[] = [];
  for (let i = 0; i < TOTAL_JOBS; i++) {
    const employer = employers[i % employers.length];
    const title = randomFrom(jobTitles);
    const industry = randomFrom(industries);
    const salaryMin = randomInt(12000, 22000);
    const salaryMax = salaryMin + randomInt(3000, 15000);
    const barangay = employer.barangay || randomFrom(barangays);

    rows.push({
      id: `job_seed_${i + 1}`,
      employerId: employer.id,
      status: randomFrom(workflowStatuses),
      establishmentName: employer.establishmentName,
      positionTitle: title,
      description: `Hiring ${title} for ${employer.establishmentName} located in ${barangay}, General Santos City.`,
      location: `${barangay}, General Santos City`,
      salaryMin,
      salaryMax,
      salaryPeriod: randomFrom(salaryPeriods),
      salaryAmount: salaryMax,
      salaryType: "range",
      skills: [randomFrom(skillsPool), randomFrom(skillsPool), randomFrom(skillsPool)].join(", "),
      industryCodes: [industry.code],
      minimumEducationRequired: randomFrom(educations),
      mainSkillOrSpecialization: randomFrom(skillsPool),
      yearsOfExperienceRequired: randomInt(0, 7),
      agePreference: `${randomInt(21, 28)}-${randomInt(35, 45)}`,
      salary: {
        currency: "PHP",
        min: salaryMin,
        max: salaryMax,
        period: randomFrom(salaryPeriods),
        type: "gross",
      },
      startingSalaryOrWage: salaryMin,
      vacantPositions: randomInt(1, 10),
      paidEmployees: randomInt(30, 400),
      jobStatus: randomFrom(jobTenureCodes),
      contact: buildContact(`${randomFrom(firstNames)} ${randomFrom(surnames)}`, `jobs${i + 1}@${employer.establishmentName.replace(/\s+/g, "").toLowerCase()}.com`),
      requirements: {
        mandatory: ["Resume", "Government ID", "Barangay Clearance"],
        niceToHave: ["NBI Clearance", "College Diploma"],
      },
      preparedByName: `${randomFrom(firstNames)} ${randomFrom(surnames)}`,
      preparedByDesignation: "HR Specialist",
      preparedByContact: `09${randomInt(100000000, 999999999)}`,
      dateAccomplished: dateStringBetween(2023, 2024),
      attachments: buildAttachments("job", i + 1),
      accountMetadata: {
        source: "seed-random-demo",
        postedBy: employer.establishmentName,
        postedAt: new Date().toISOString(),
      },
      barangay,
      municipality: "General Santos City",
      province: "South Cotabato",
      archived: false,
      archivedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.insert(jobsTable).values(rows);
}

async function main() {
  const db = await initializeDatabase();

  await wipeTables(db);
  await seedApplicants(db);
  await seedEmployers(db);
  await seedJobs(db);

  console.log("Seed complete: 567 applicants, 40 employers, 37 jobs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
