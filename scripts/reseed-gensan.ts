
import { faker } from "@faker-js/faker";
import { initializeDatabase, getDatabase } from "../server/database";
import { usersTable, employersTable, jobsTable } from "../server/unified-schema";

const APPLICANT_COUNT = 456;
const EMPLOYER_COUNT = 32;
const JOB_COUNT = 74;

const CITY = "General Santos City";
const PROVINCE = "South Cotabato";
const REGION = "Region XII (SOCCSKSARGEN)";
const ZIP = "9500";

const barangays = [
  "Apopong", "Baluan", "Batomelong", "Buayan", "Calumpang", "City Heights", "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog", "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay"
];

const schools = [
  "Notre Dame of Dadiangas University",
  "Mindanao State University - Gensan",
  "Holy Trinity College of General Santos",
  "Ramon Magsaysay Memorial Colleges",
  "Goldenstate College",
  "STI College General Santos",
  "AMA Computer College Gensan",
  "Quantum Academy",
  "General Santos City High School",
  "General Santos City SPED Integrated School"
];

const companies = [
  "Tuna King Corporation",
  "RD Fishing Group",
  "KCC Mall of Gensan",
  "SM City General Santos",
  "Robinsons Place Gensan",
  "General Santos Doctors Hospital",
  "Sarangani Bay Development Corp",
  "Philbest Canning",
  "Cargill Philippines",
  "Dole Philippines",
  "East Asia Royale Hotel",
  "Sun City Suites",
  "Greenleaf Hotel Gensan",
  "Tri-Star Manufacturing",
  "General Santos Water District",
  "South Cotabato Electric Cooperative",
  "PLDT General Santos",
  "Globe Telecom Gensan",
  "Microtel by Wyndham",
  "Dolores Farm Resort",
  "London Beach Resort",
  "Gensan Shipyard",
  "General Santos City Hall",
  "Jadewell Parking Systems",
  "Big 8 Corporate Hotel",
  "Hotel San Marco",
  "Tuna Capital Logistics",
  "Mindanao Packaging Corp",
  "Gensan Central Bank Cooperative",
  "Mindanao State Power Corp",
  "SOX Agriventures",
  "Koronadal Finance Hub"
];

const courses = ["BSIT", "BSBA", "BSEd", "BSN", "BSHRM", "BSA", "BSCE", "BSEE", "BSME", "BSChem", "BSCS", "BSPsych", "BSPolSci", "BSECE", "BSArch", "BSPharm", "BSEntrep", "BSAcc", "BSAgri", "BSMath", "BSEcon"];
const positions = [
  "Sales Associate", "IT Specialist", "Nurse", "HR Officer", "Accountant", "Marketing Manager", "Security Guard", "Cashier", "Production Worker", "Driver", "Cook", "Waiter", "Receptionist", "Teacher", "Engineer", "Electrician", "Plumber", "Carpenter", "Designer", "Programmer", "Customer Service Representative", "Store Supervisor", "Warehouse Staff", "Purchasing Officer", "Admin Assistant", "Pharmacist", "Barista", "Chef", "Mechanic", "Technician", "Sales Manager", "Operations Manager", "Project Coordinator", "Field Enumerator", "Office Staff", "Trainer", "Consultant", "Auditor", "Legal Assistant", "Librarian", "Researcher", "Medical Technologist", "Radiologic Technologist", "Physical Therapist", "Dentist", "Veterinarian", "Architect", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer", "Agriculturist", "Forester", "Fishery Technician", "Social Worker", "Nutritionist", "Statistician", "Economist", "Account Executive", "Loan Officer", "Insurance Agent", "Real Estate Agent", "Travel Agent", "Event Coordinator", "Graphic Artist", "Web Developer", "Mobile Developer", "QA Tester", "Systems Analyst", "Network Administrator", "Database Administrator", "IT Support"
];

const dropdowns = {
  gender: ["Male", "Female", "Prefer not to say", "Other"],
  civilStatus: ["Single", "Married", "Widowed", "Separated", "Divorced"],
  educationLevel: ["No formal education", "Elementary", "High School", "Vocational", "College", "Postgraduate"],
  skills: [
    "Computer", "Communication", "Leadership", "Teamwork", "Problem Solving", "Customer Service", "Sales", "Marketing", "Accounting", "Programming", "Design", "Writing", "Teaching", "Driving", "Cooking", "Gardening", "Carpentry", "Electrical", "Plumbing", "Sewing", "Hairdressing", "Machining", "Inventory"
  ],
  employmentStatus: ["Employed", "Unemployed", "Self-Employed", "Student", "Retired"],
  disability: ["None", "Visual", "Hearing", "Mobility", "Cognitive", "Others"],
  employmentType: ["Full-Time", "Part-Time", "Contract", "Temporary", "Internship"],
  jobPreference: ["Office", "Field", "Remote", "Flexible", "Others"],
  relocate: ["Yes", "No"],
  workAbroad: ["Yes", "No"],
  industryType: ["Manufacturing", "Retail", "Services", "Education", "Healthcare", "Agriculture", "Construction", "Finance", "Information Technology", "Transportation", "Hospitality", "Government", "Non-Profit", "Others"],
  companySize: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"],
  salaryPeriod: ["Monthly", "Weekly", "Daily", "Hourly"],
  jobStatus: ["Open", "Closed", "Archived", "Pending", "Filled"],
  genderPreference: ["Any", "Male", "Female"],
  experienceRequired: ["None", "1 year", "2 years", "3 years", "5+ years"],
};

const experienceToYears: Record<string, number> = {
  "None": 0,
  "1 year": 1,
  "2 years": 2,
  "3 years": 3,
  "5+ years": 5,
};

const randomElement = <T>(arr: T[]): T => faker.helpers.arrayElement(arr);
const randomPhone = () => `09${faker.string.numeric({ length: 9 })}`;
const randomDateBetween = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function deleteAll(db: any) {
  await db.delete(jobsTable);
  await db.delete(employersTable);
  await db.delete(usersTable);
}

async function seedApplicants(db: any) {
  for (let i = 0; i < APPLICANT_COUNT; i++) {
    const id = `user_${faker.string.uuid()}`;
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const surname = faker.person.lastName();
    const suffix = faker.number.int({ min: 0, max: 1 }) ? faker.person.suffix() : null;
    const gender = randomElement(dropdowns.gender);
    const civilStatus = randomElement(dropdowns.civilStatus);
    const employmentStatus = randomElement(dropdowns.employmentStatus);
    const employmentType = randomElement(dropdowns.employmentType);
    const educationLevel = randomElement(dropdowns.educationLevel);
    const barangay = randomElement(barangays);
    const address = faker.location.streetAddress();
    const relocateAnswer = randomElement(dropdowns.relocate);
    const workAbroadAnswer = randomElement(dropdowns.workAbroad);
    const skillList = faker.helpers.arrayElements(dropdowns.skills, faker.number.int({ min: 3, max: 6 }));
    const otherSkills = faker.helpers.arrayElements(dropdowns.skills, 2);
    const jobPreference = randomElement(dropdowns.jobPreference);
    const nsrpNumber = `NSRP-${String(i + 1).padStart(4, "0")}-${faker.string.alphanumeric({ length: 4 }).toUpperCase()}`;
    const educationEntry = {
      level: educationLevel,
      schoolName: randomElement(schools),
      course: randomElement(courses),
      yearCompleted: faker.date.past({ years: 5 }).getFullYear(),
    };
    const trainingTitle = `${randomElement(dropdowns.skills)} NCII`;
    const certificationTitle = `${randomElement(dropdowns.skills)} Certification`;
    const workExperience = (employmentStatus === "Employed" || employmentStatus === "Self-Employed")
      ? [
          {
            company: randomElement(companies),
            position: randomElement(positions),
            startDate: randomDateBetween(new Date(2018, 0, 1), new Date(2022, 0, 1)),
            endDate: employmentStatus === "Employed" ? null : randomDateBetween(new Date(2022, 0, 1), new Date()),
          },
        ]
      : [];
    const timestamp = faker.date.recent({ days: 120 });

    await db.insert(usersTable).values({
      id,
      email: `applicant${i + 1}@gensan-demo.local`,
      passwordHash: faker.internet.password({ length: 18 }),
      hasAccount: true,
      role: "jobseeker",
      surname,
      firstName,
      middleName,
      suffix,
      dateOfBirth: faker.date.birthdate({ min: 18, max: 55, mode: "age" }).toISOString().split("T")[0],
      sex: gender,
      religion: "Roman Catholic",
      civilStatus,
      height: `${faker.number.int({ min: 150, max: 185 })} cm`,
      weight: `${faker.number.int({ min: 45, max: 90 })} kg`,
      bloodType: randomElement(["O+", "A+", "B+", "AB+"]),
      contactNumber: randomPhone(),
      disability: gender === "Other" ? randomElement(dropdowns.disability) : "None",
      disabilitySpecify: "None",
      address,
      houseStreetVillage: address,
      barangay,
      municipality: CITY,
      province: PROVINCE,
      zipCode: ZIP,
      employmentStatus,
      employmentType,
      employmentType4: employmentType,
      monthsUnemployed: employmentStatus === "Unemployed" ? faker.number.int({ min: 1, max: 24 }) : 0,
      isOfw: workAbroadAnswer === "Yes" && faker.datatype.boolean(),
      ofwCountry: "",
      isFormerOfw: false,
      formerOFWCountry: null,
      returnToPHDate: null,
      is4psBeneficiary: faker.datatype.boolean(),
      householdID: faker.string.numeric({ length: 12 }),
      nsrpNumber,
      governmentIdType: "PhilSys",
      governmentIdNumber: faker.string.numeric({ length: 12 }),
      willingToRelocate: relocateAnswer === "Yes",
      willingToWorkOverseas: workAbroadAnswer === "Yes",
      jobPreferences: JSON.stringify([{ type: jobPreference, environment: jobPreference }]),
      preferredOccupations: JSON.stringify(faker.helpers.arrayElements(positions, 2)),
      preferredLocations: JSON.stringify([{ city: CITY, province: PROVINCE }]),
      preferredOverseasCountries: JSON.stringify(workAbroadAnswer === "Yes" ? ["Japan", "Singapore", "Qatar"] : []),
      education: JSON.stringify([educationEntry]),
      technicalTraining: JSON.stringify([{ title: trainingTitle, institution: "TESDA Gensan", year: 2023 }]),
      professionalLicenses: JSON.stringify([{ title: certificationTitle, issuedBy: "TESDA", year: 2022 }]),
      languageProficiency: JSON.stringify([
        { language: "Filipino", spoken: "Excellent", written: "Excellent" },
        { language: "English", spoken: "Good", written: "Good" },
      ]),
      workExperience: JSON.stringify(workExperience),
      otherSkills: JSON.stringify(otherSkills),
      skills: JSON.stringify(skillList),
      otherSkillsTraining: trainingTitle,
      otherSkillsSpecify: otherSkills.join(", "),
      attachments: JSON.stringify([{ type: "profile_image", url: faker.image.avatar() }]),
      notes: `Region: ${REGION}`,
      registeredAt: timestamp,
      lastLoginAt: faker.date.recent({ days: 30 }),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

type EmployerRecord = { id: string; establishmentName: string; barangay: string };

async function seedEmployers(db: any): Promise<EmployerRecord[]> {
  const records: EmployerRecord[] = [];

  for (let i = 0; i < EMPLOYER_COUNT; i++) {
    const id = `employer_${faker.string.uuid()}`;
    const establishmentName = `${randomElement(companies)}`;
    const barangay = randomElement(barangays);
    const address = faker.location.streetAddress();
    const contactPerson = faker.person.fullName();
    const contactPhone = randomPhone();
    const industry = randomElement(dropdowns.industryType);
    const timestamp = faker.date.recent({ days: 90 });

    await db.insert(employersTable).values({
      id,
      establishmentName,
      tradeName: `${establishmentName} Gensan`,
      houseStreetVillage: address,
      barangay,
      municipality: CITY,
      province: PROVINCE,
      completeAddress: `${address}, ${barangay}, ${CITY}, ${PROVINCE}`,
      addressDetails: JSON.stringify({ barangay, city: CITY, province: PROVINCE, region: REGION }),
      contactNumber: contactPhone,
      contactEmail: faker.internet.email({ firstName: "hr", lastName: establishmentName.replace(/\s+/g, "").toLowerCase(), provider: "gensanworks.ph" }),
      contactPerson: JSON.stringify({ name: contactPerson, designation: "HR Officer", phone: contactPhone }),
      alternateContacts: JSON.stringify([{ name: faker.person.fullName(), phone: randomPhone() }]),
      email: faker.internet.email({ firstName: establishmentName.split(" ")[0].toLowerCase(), provider: "example.ph" }),
      numberOfPaidEmployees: faker.number.int({ min: 20, max: 600 }),
      numberOfVacantPositions: faker.number.int({ min: 1, max: 20 }),
      industryCodes: JSON.stringify([`IND-${faker.number.int({ min: 100, max: 999 })}`]),
      industryType: JSON.stringify([industry]),
      srsSubscriber: faker.datatype.boolean(),
      subscriptionStatus: faker.datatype.boolean() ? "active" : "inactive",
      companyTin: faker.string.numeric({ length: 9 }),
      companyTaxIdNumber: faker.string.numeric({ length: 12 }),
      businessPermitNumber: `BP-${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`,
      bir2303Number: `BIR-${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`,
      requirements: JSON.stringify(["Mayor's Permit", "DTI Certificate"]),
      attachments: JSON.stringify([{ type: "company_logo", url: faker.image.url() }]),
      chairpersonName: faker.person.fullName(),
      chairpersonContact: randomPhone(),
      secretaryName: faker.person.fullName(),
      secretaryContact: randomPhone(),
      barangayChairperson: faker.person.fullName(),
      barangaySecretary: faker.person.fullName(),
      geographicIdentification: JSON.stringify({ barangay, city: CITY, province: PROVINCE }),
      preparedByName: contactPerson,
      preparedByDesignation: "HR Manager",
      preparedByContact: contactPhone,
      dateAccomplished: timestamp.toISOString().split("T")[0],
      remarks: `${industry} employer based in ${barangay}`,
      isManpowerAgency: industry === "Services" && faker.datatype.boolean(),
      doleCertificationNumber: `DOLE-${faker.string.alphanumeric({ length: 6 }).toUpperCase()}`,
      archived: false,
      archivedAt: null,
      passwordHash: faker.internet.password({ length: 20 }),
      hasAccount: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    records.push({ id, establishmentName, barangay });
  }

  return records;
}

async function seedJobs(db: any, employers: EmployerRecord[]) {
  if (!employers.length) throw new Error("No employers available for job postings");

  for (let i = 0; i < JOB_COUNT; i++) {
    const employer = randomElement(employers);
    const positionTitle = randomElement(positions);
    const status = randomElement(dropdowns.jobStatus).toLowerCase();
    const salaryPeriod = randomElement(dropdowns.salaryPeriod);
    const salaryMin = faker.number.int({ min: 12000, max: 25000 });
    const salaryMax = salaryMin + faker.number.int({ min: 2000, max: 10000 });
    const skillsNeeded = faker.helpers.arrayElements(dropdowns.skills, faker.number.int({ min: 2, max: 4 }));
    const experience = randomElement(dropdowns.experienceRequired);
    const postingStart = randomDateBetween(new Date(2024, 0, 1), new Date());
    const postingEnd = randomDateBetween(postingStart, new Date(postingStart.getTime() + 1000 * 60 * 60 * 24 * 90));

    await db.insert(jobsTable).values({
      id: `job_${faker.string.uuid()}`,
      employerId: employer.id,
      status,
      establishmentName: employer.establishmentName,
      positionTitle,
      description: faker.lorem.paragraphs(2, "\n\n"),
      location: CITY,
      salaryMin,
      salaryMax,
      salaryPeriod,
      salaryAmount: Math.round((salaryMin + salaryMax) / 2),
      salaryType: salaryPeriod.toLowerCase(),
      skills: skillsNeeded.join(", "),
      industryCodes: JSON.stringify([`IND-${faker.number.int({ min: 200, max: 999 })}`]),
      minimumEducationRequired: randomElement(dropdowns.educationLevel),
      mainSkillOrSpecialization: randomElement(dropdowns.skills),
      yearsOfExperienceRequired: experienceToYears[experience],
      agePreference: `${faker.number.int({ min: 18, max: 25 })}-${faker.number.int({ min: 26, max: 40 })}`,
      salary: JSON.stringify({ period: salaryPeriod, currency: "PHP", min: salaryMin, max: salaryMax }),
      startingSalaryOrWage: salaryMin,
      vacantPositions: faker.number.int({ min: 1, max: 12 }),
      paidEmployees: faker.number.int({ min: 15, max: 400 }),
      jobStatus: status,
      contact: JSON.stringify({ email: `apply@${employer.establishmentName.replace(/\s+/g, "-").toLowerCase()}.ph`, phone: randomPhone() }),
      requirements: JSON.stringify({
        qualifications: faker.lorem.sentences(2),
        genderPreference: randomElement(dropdowns.genderPreference),
        certifications: faker.helpers.arrayElements(dropdowns.skills, 2),
      }),
      preparedByName: faker.person.fullName(),
      preparedByDesignation: "HR Officer",
      preparedByContact: randomPhone(),
      dateAccomplished: postingStart.toISOString().split("T")[0],
      attachments: JSON.stringify([]),
      accountMetadata: JSON.stringify({
        postingStartDate: postingStart,
        postingEndDate: postingEnd,
        genderPreference: randomElement(dropdowns.genderPreference),
      }),
      barangay: employer.barangay,
      municipality: CITY,
      province: PROVINCE,
      archived: status === "archived",
      archivedAt: status === "archived" ? postingEnd : null,
      createdAt: postingStart,
      updatedAt: postingEnd,
    });
  }
}

async function main() {
  await initializeDatabase();
  const db = getDatabase();

  console.log("\n🔄 Clearing existing applicants, employers, and jobs...");
  await deleteAll(db);

  console.log("👥 Seeding applicants...");
  await seedApplicants(db);

  console.log("🏢 Seeding employers...");
  const employerRecords = await seedEmployers(db);

  console.log("💼 Seeding jobs...");
  await seedJobs(db, employerRecords);

  console.log("\n✅ Reseed complete: 456 applicants, 32 employers, 74 jobs for General Santos City.\n");
}

main().catch((err) => {
  console.error("Reseed failed", err);
  process.exit(1);
});
