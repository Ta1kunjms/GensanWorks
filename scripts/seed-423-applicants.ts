import { initializeDatabase } from "../server/database";
import { applicantsTable } from "../server/unified-schema";

// Random data pools
const firstNames = [
  "Juan", "Maria", "Jose", "Ana", "Pedro", "Rosa", "Carlos", "Elena", "Miguel", "Sofia",
  "Luis", "Carmen", "Ramon", "Isabel", "Antonio", "Teresa", "Francisco", "Luz", "Manuel", "Cristina",
  "Ricardo", "Patricia", "Roberto", "Angela", "Fernando", "Gloria", "Eduardo", "Diana", "Rodrigo", "Sandra",
  "Alejandro", "Lucia", "Diego", "Margarita", "Javier", "Beatriz", "Rafael", "Silvia", "Ernesto", "Adriana",
  "Alberto", "Victoria", "Sergio", "Catalina", "Jorge", "Dolores", "Oscar", "Pilar", "Raul", "Susana"
];

const middleNames = [
  "Santos", "Cruz", "Reyes", "Garcia", "Gonzales", "Rivera", "Torres", "Ramos", "Flores", "Mendoza",
  "Castro", "Lopez", "Morales", "Ortiz", "Gutierrez", "Chavez", "Ruiz", "Diaz", "Fernandez", "Alvarez",
  "Sanchez", "Ramirez", "Castillo", "Vargas", "Herrera", "Silva", "Medina", "Aguilar", "Jimenez", "Navarro"
];

const lastNames = [
  "dela Cruz", "Santiago", "Bautista", "Villanueva", "Aquino", "Pascual", "Mercado", "Domingo", "Alcantara", "Custodio",
  "Manalo", "Evangelista", "Soriano", "Valencia", "Tolentino", "Miranda", "Rosario", "Salazar", "Marquez", "Padilla",
  "Velasco", "Guerrero", "Navarro", "Suarez", "Rojas", "Galvez", "Esteban", "Pineda", "Moreno", "Ayala",
  "Sarmiento", "Valdez", "Zamora", "Cordero", "Cabrera", "Ponce", "Caballero", "Delgado", "Escobar", "Mendez"
];

const barangays = [
  "Lagao", "Calumpang", "San Isidro", "Fatima", "Buayan", "Apopong", "Tambler", "Bula",
  "City Heights", "Olympog", "San Jose", "Katangawan", "Mabuhay", "Baluan", "Labangal",
  "Dadiangas North", "Dadiangas South", "Dadiangas East", "Dadiangas West", "Siguel",
  "Tinagacan", "Conel", "Upper Labay", "Sinawal", "Ligaya"
];

const municipalities = [
  "General Santos City", "Koronadal City", "Polomolok", "Tupi", "Tampakan",
  "Surallah", "Banga", "Norala", "Lake Sebu", "T'boli"
];

const provinces = [
  "South Cotabato", "Sultan Kudarat", "Sarangani", "Cotabato"
];

const schools = [
  "Mindanao State University", "Notre Dame of Dadiangas University", "General Santos City National High School",
  "Philippine College of Technology", "Andres Soriano Colleges", "Dadiangas North Central Elementary School",
  "University of Mindanao", "Holy Trinity College", "General Santos City Pilot Elementary School",
  "Fatima National High School", "Lagao National High School", "Notre Dame of Marbel University",
  "Sultan Kudarat State University", "University of Southern Mindanao", "Glan School of Fisheries",
  "Koronadal National Comprehensive High School", "Surallah National High School", "Polomolok National High School"
];

const courses = [
  "Bachelor of Science in Information Technology", "Bachelor of Science in Computer Science",
  "Bachelor of Science in Business Administration", "Bachelor of Elementary Education",
  "Bachelor of Secondary Education", "Bachelor of Science in Nursing", "Bachelor of Science in Accountancy",
  "Bachelor of Science in Civil Engineering", "Bachelor of Science in Electrical Engineering",
  "Bachelor of Science in Mechanical Engineering", "Bachelor of Arts in Communication",
  "Bachelor of Science in Hotel and Restaurant Management", "Bachelor of Science in Tourism Management",
  "Bachelor of Science in Agriculture", "Bachelor of Science in Fisheries"
];

const employmentStatuses = ["employed", "unemployed", "self-employed", "underemployed"];
const employmentTypes = ["full-time", "part-time", "contract", "freelance", "seasonal"];
const genders = ["male", "female"];
const civilStatuses = ["single", "married", "widowed", "separated"];

const skills = [
  "Computer Literacy", "Data Entry", "Customer Service", "Sales", "Communication Skills",
  "Microsoft Office", "Bookkeeping", "Cashiering", "Typing", "Inventory Management",
  "Basic Accounting", "Social Media Management", "Administrative Support", "Filing",
  "Receptionist", "Telephone Etiquette", "Time Management", "Problem Solving",
  "Teamwork", "Leadership", "Driving", "Cooking", "Welding", "Carpentry", "Plumbing"
];

// Helper functions
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAge(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBirthdate(): Date {
  const age = randomAge(18, 60);
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
}

function randomPhoneNumber(): string {
  const prefix = randomItem(["0915", "0916", "0917", "0926", "0927", "0935", "0936", "0945", "0955", "0956", "0975", "0977", "0995", "0997"]);
  const suffix = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${suffix}`;
}

function generateRandomSkills(): string {
  const numSkills = Math.floor(Math.random() * 5) + 2; // 2-6 skills
  const selectedSkills = [];
  for (let i = 0; i < numSkills; i++) {
    const skill = randomItem(skills);
    if (!selectedSkills.includes(skill)) {
      selectedSkills.push(skill);
    }
  }
  return JSON.stringify(selectedSkills);
}

function generateEducation(school: string, course: string): string {
  const educationData = [
    {
      level: "tertiary",
      school: school,
      course: course,
      yearGraduated: String(randomAge(2010, 2024))
    }
  ];
  return JSON.stringify(educationData);
}

async function seedApplicants() {
  console.log("🌱 Starting to seed 423 applicants...");
  
  const db = await initializeDatabase();

  const applicantsToInsert = [];
  
  // Generate random created dates over the past 2 years
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const now = new Date();

  for (let i = 0; i < 423; i++) {
    const firstName = randomItem(firstNames);
    const middleName = randomItem(middleNames);
    const surname = randomItem(lastNames);
    const gender = randomItem(genders);
    const birthdate = randomBirthdate();
    const age = new Date().getFullYear() - birthdate.getFullYear();
    const civilStatus = randomItem(civilStatuses);
    const barangay = randomItem(barangays);
    const municipality = randomItem(municipalities);
    const province = randomItem(provinces);
    const phone = randomPhoneNumber();
    const email = `${firstName.toLowerCase()}.${surname.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@gmail.com`;
    const school = randomItem(schools);
    const course = randomItem(courses);
    const employmentStatus = randomItem(employmentStatuses);
    const employmentType = randomItem(employmentTypes);
    const isOFW = randomBoolean();
    const isFormerOFW = !isOFW && randomBoolean(); // Can only be former if not current
    const is4PsBeneficiary = randomBoolean();
    const skillsData = generateRandomSkills();
    const educationData = generateEducation(school, course);
    const createdAt = randomDate(twoYearsAgo, now);
    const updatedAt = createdAt;

    applicantsToInsert.push({
      firstName,
      middleName,
      surname,
      dateOfBirth: birthdate.toISOString().split('T')[0],
      age,
      gender,
      civilStatus,
      barangay,
      municipality,
      province,
      contactNumber: phone,
      email,
      educationalAttainment: "College Graduate",
      course,
      yearGraduated: String(randomAge(2010, 2024)),
      school,
      skills: skillsData,
      workExperience: JSON.stringify([]),
      employmentStatus,
      employmentType,
      currentEmployer: employmentStatus === "employed" ? "Sample Company Inc." : null,
      position: employmentStatus === "employed" ? "Staff" : null,
      disabilityStatus: randomBoolean() ? "none" : "pwd",
      isOFW,
      isFormerOFW,
      is4PsBeneficiary,
      createdAt,
      updatedAt
    });

    // Log progress every 50 applicants
    if ((i + 1) % 50 === 0) {
      console.log(`Generated ${i + 1} applicants...`);
    }
  }

  console.log("💾 Inserting 423 applicants into database...");
  
  try {
    // Insert with unique IDs to avoid collision since Date.now() would be the same
    const applicantsWithIds = applicantsToInsert.map((applicant, index) => ({
      ...applicant,
      id: `applicant_${Date.now()}_${index}`
    }));
    
    await db.insert(applicantsTable).values(applicantsWithIds);
    console.log("✅ Successfully inserted 423 applicants!");
    
    // Verify count
    const allApplicants = await db.query.applicantsTable.findMany();
    console.log(`📊 Total applicants in database: ${allApplicants.length}`);
  } catch (error) {
    console.error("❌ Error inserting applicants:", error);
    throw error;
  }
}

seedApplicants()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
