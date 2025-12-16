import { db } from "../server/db";
import { users, employers, jobs } from "../server/schema";
import { faker } from "@faker-js/faker";

// Real Gensan barangays
const barangays = [
  "Apopong", "Baluan", "Batomelong", "Buayan", "Calumpang", "City Heights", "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog", "San Isidro", "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay"
];
const schools = [
  "Notre Dame of Dadiangas University", "Mindanao State University Gensan", "General Santos City High School", "Holy Trinity College", "Ramon Magsaysay Memorial Colleges", "Goldenstate College", "AMA Computer College", "STI College Gensan", "Quantum Academy", "General Santos City SPED Integrated School"
];
const companies = [
  "Tuna King Corporation", "Gensan Mall", "KCC Mall of Gensan", "SM City General Santos", "Robinsons Place Gensan", "East Asia Royale Hotel", "General Santos Doctors Hospital", "RD Fishing Group", "Concord Tuna Corporation", "Dole Philippines", "San Miguel Foods Inc.", "Gaisano Mall", "Jadewell Parking Systems", "Cargill Philippines", "Philbest Canning Corporation", "Sarangani Bay Development Corp.", "Gensan Shipyard", "Tri-Star Manufacturing", "South Cotabato Electric Cooperative", "PLDT Gensan", "Globe Telecom Gensan", "Sun City Suites", "Microtel by Wyndham", "Hotel San Marco", "Greenleaf Hotel Gensan", "Big 8 Corporate Hotel", "London Beach Resort", "Dolores Farm Resort", "General Santos Water District", "General Santos City Hall", "General Santos City Police Office", "General Santos City Fire Station", "General Santos City Public Market", "General Santos City Central Bank"
];
const courses = ["BSIT", "BSBA", "BSEd", "BSN", "BSHRM", "BSA", "BSCE", "BSEE", "BSME", "BSChem", "BSCS", "BSPsych", "BSPolSci", "BSECE", "BSArch", "BSPharm", "BSEntrep", "BSAcc", "BSAgri", "BSMath", "BSEcon"];
const positions = ["Sales Associate", "IT Specialist", "Nurse", "HR Officer", "Accountant", "Marketing Manager", "Security Guard", "Cashier", "Production Worker", "Driver", "Cook", "Waiter", "Receptionist", "Teacher", "Engineer", "Electrician", "Plumber", "Carpenter", "Designer", "Programmer", "Customer Service Rep", "Manager", "Supervisor", "Janitor", "Warehouse Staff", "Purchasing Officer", "Admin Assistant", "Storekeeper", "Pharmacist", "Barista", "Chef", "Mason", "Mechanic", "Technician", "Sales Manager", "Operations Manager", "Project Coordinator", "Field Staff", "Office Staff", "Trainer", "Consultant", "Auditor", "Legal Assistant", "Librarian", "Researcher", "Medical Technologist", "Radiologic Technologist", "Physical Therapist", "Dentist", "Veterinarian", "Architect", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer", "Geologist", "Agriculturist", "Forester", "Fishery Technician", "Social Worker", "Nutritionist", "Statistician", "Economist", "Account Executive", "Loan Officer", "Insurance Agent", "Real Estate Agent", "Travel Agent", "Event Coordinator", "Graphic Artist", "Web Developer", "Mobile Developer", "QA Tester", "Systems Analyst", "Network Administrator", "Database Administrator", "IT Support" ];

const dropdowns = {
  gender: ["Male", "Female", "Prefer not to say", "Other"],
  civil_status: ["Single", "Married", "Widowed", "Separated", "Divorced"],
  education_level: ["No formal education", "Elementary", "High School", "Vocational", "College", "Postgraduate"],
  skills: ["Computer", "Communication", "Leadership", "Teamwork", "Problem Solving", "Customer Service", "Sales", "Marketing", "Accounting", "Programming", "Design", "Writing", "Teaching", "Driving", "Cooking", "Gardening", "Carpentry", "Electrical", "Plumbing", "Sewing", "Hairdressing", "Others"],
  employment_status: ["Employed", "Unemployed", "Self-Employed", "Student", "Retired"],
  disability: ["None", "Visual", "Hearing", "Mobility", "Cognitive", "Others"],
  employment_type: ["Full-Time", "Part-Time", "Contract", "Temporary", "Internship"],
  job_preference: ["Office", "Field", "Remote", "Flexible", "Others"],
  willing_to_relocate: ["Yes", "No"],
  willing_to_work_abroad: ["Yes", "No"],
  industry_type: ["Manufacturing", "Retail", "Services", "Education", "Healthcare", "Agriculture", "Construction", "Finance", "Information Technology", "Transportation", "Hospitality", "Government", "Non-Profit", "Others"],
  company_size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"],
  salary_period: ["Monthly", "Weekly", "Daily", "Hourly"],
  status: ["Open", "Closed", "Archived", "Pending", "Filled"],
  gender_preference: ["Any", "Male", "Female"],
  experience_required: ["None", "1 year", "2 years", "3 years", "5+ years"],
};

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedApplicants() {
  for (let i = 0; i < 456; i++) {
    await db.insert(users).values({
      first_name: faker.person.firstName(),
      middle_name: faker.person.middleName(),
      last_name: faker.person.lastName(),
      suffix: faker.person.suffix(),
      gender: random(dropdowns.gender),
      birth_date: faker.date.birthdate(),
      civil_status: random(dropdowns.civil_status),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      barangay: random(barangays),
      city: "General Santos City",
      region: "Region XII",
      education_level: random(dropdowns.education_level),
      school_name: random(schools),
      course: random(courses),
      skills: faker.helpers.arrayElements(dropdowns.skills, 3).join(", "),
      employment_status: random(dropdowns.employment_status),
      registration_date: faker.date.past(),
      username: faker.internet.userName(),
      password_hash: faker.internet.password(),
      profile_image: faker.image.avatar(),
      is_nsrp: faker.datatype.boolean(),
      nsrp_number: faker.string.uuid(),
      nsrp_registration_date: faker.date.past(),
      fourps_beneficiary: faker.datatype.boolean(),
      disability: random(dropdowns.disability),
      disability_type: random(dropdowns.disability) !== "None" ? random(dropdowns.disability) : "",
      employment_type: random(dropdowns.employment_type),
      job_preference: random(dropdowns.job_preference),
      willing_to_relocate: random(dropdowns.willing_to_relocate),
      willing_to_work_abroad: random(dropdowns.willing_to_work_abroad),
      other_skills: faker.helpers.arrayElements(dropdowns.skills, 2).join(", "),
      trainings: faker.lorem.words(2),
      certifications: faker.lorem.words(2),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

async function seedEmployers() {
  for (let i = 0; i < 32; i++) {
    await db.insert(employers).values({
      company_name: random(companies),
      company_address: faker.location.streetAddress(),
      contact_person: faker.person.fullName(),
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      industry_type: random(dropdowns.industry_type),
      registration_date: faker.date.past(),
      username: faker.internet.userName(),
      password_hash: faker.internet.password(),
      company_logo: faker.image.url(),
      company_description: faker.lorem.sentence(),
      company_size: random(dropdowns.company_size),
      company_website: faker.internet.url(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

async function seedJobs() {
  for (let i = 0; i < 74; i++) {
    await db.insert(jobs).values({
      employer_id: faker.number.int({ min: 1, max: 32 }),
      position_title: random(positions),
      job_description: faker.lorem.paragraph(),
      qualifications: faker.lorem.sentence(),
      education_required: random(dropdowns.education_level),
      skills_required: faker.helpers.arrayElements(dropdowns.skills, 3).join(", "),
      employment_type: random(dropdowns.employment_type),
      salary: faker.number.int({ min: 10000, max: 50000 }),
      salary_period: random(dropdowns.salary_period),
      status: random(dropdowns.status),
      archived: faker.datatype.boolean(),
      created_at: new Date(),
      updated_at: new Date(),
      location: "General Santos City",
      experience_required: random(dropdowns.experience_required),
      age_requirement: faker.number.int({ min: 18, max: 60 }),
      gender_preference: random(dropdowns.gender_preference),
      posting_start_date: faker.date.past(),
      posting_end_date: faker.date.future(),
    });
  }
}

async function main() {
  await seedApplicants();
  await seedEmployers();
  await seedJobs();
  console.log("Seeding complete!");
}

main();
