import { initializeDatabase } from "../server/database";
import { applicantsTable } from "../server/unified-schema";

const firstNames = [
  "Juan", "Maria", "Jose", "Ana", "Pedro", "Rosa", "Miguel", "Carmen", "Antonio", "Luz",
  "Carlos", "Elena", "Ramon", "Sofia", "Manuel", "Isabel", "Ricardo", "Teresa", "Roberto", "Patricia",
  "Fernando", "Angela", "Eduardo", "Gloria", "Luis", "Margarita", "Jorge", "Cristina", "Francisco", "Diana",
  "Alfredo", "Beatriz", "Gabriel", "Monica", "Salvador", "Laura", "Rodrigo", "Cecilia", "Arturo", "Sandra",
  "Raul", "Victoria", "Enrique", "Andrea", "Oscar", "Lorena", "Sergio", "Daniela", "Marco", "Fernanda",
  "Pablo", "Valentina", "Javier", "Natalia", "Felipe", "Carolina", "Alejandro", "Veronica", "Andres", "Melissa",
  "Diego", "Adriana", "Hector", "Gabriela", "Victor", "Paola", "Adrian", "Claudia", "Armando", "Alejandra",
  "Rafael", "Michelle", "Mario", "Jessica", "Gonzalo", "Angelica", "Emilio", "Erika", "Nicolas", "Roxana",
  "Gerardo", "Silvia", "Guillermo", "Yolanda", "Julio", "Marcela", "Alberto", "Liliana", "Ruben", "Alicia",
  "Ernesto", "Sonia", "Ignacio", "Martha", "Dante", "Dulce", "Leonardo", "Alma", "Mauricio", "Luciana"
];

const lastNames = [
  "Santos", "Cruz", "Garcia", "Reyes", "Ramos", "Flores", "Mendoza", "Torres", "Gonzalez", "Lopez",
  "Rivera", "Castillo", "Hernandez", "Morales", "Dela Cruz", "Villanueva", "Aquino", "Pascual", "Santiago", "Bautista",
  "Fernandez", "Gutierrez", "Martinez", "Rodriguez", "Sanchez", "Diaz", "Ramirez", "Perez", "Alvarez", "Jimenez",
  "Gomez", "Chavez", "Velasco", "Romero", "Mercado", "Salazar", "Domingo", "Aguilar", "Medina", "Robles",
  "Castro", "Valencia", "Ortiz", "Vargas", "Luna", "Navarro", "Rios", "Campos", "Marquez", "Cabrera",
  "Estrada", "Valdez", "Cortez", "Vega", "Pacheco", "Herrera", "Cordero", "Suarez", "Guerrero", "Pena",
  "Molina", "Delgado", "Figueroa", "Rosales", "Paredes", "Agustin", "Coronel", "Fuentes", "Natividad", "Lim",
  "Tan", "Ong", "Chua", "Lee", "Go", "Sy", "Yap", "Chan", "Wong", "Lao"
];

const barangays = [
  "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang", "City Heights",
  "Conel", "Dadiangas East", "Dadiangas North", "Dadiangas South", "Dadiangas West",
  "Fatima", "Katangawan", "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog",
  "San Isidro (Lagao)", "San Isidro (Dadiangas)", "San Jose", "Siguel", "Sinawal",
  "Tambler", "Tinagacan", "Upper Labay"
];

const skills = [
  "Computer Literacy", "MS Office", "Data Entry", "Customer Service", "Sales",
  "Marketing", "Accounting", "Bookkeeping", "Cashiering", "Inventory Management",
  "Driving", "Welding", "Carpentry", "Plumbing", "Electrical Work",
  "Auto Mechanic", "Motorcycle Repair", "Heavy Equipment Operation", "Machine Operation",
  "Food Preparation", "Cooking", "Baking", "Waiting Tables", "Bartending",
  "Housekeeping", "Janitorial Services", "Laundry Services", "Caregiving", "Nursing Aide",
  "Teaching", "Tutoring", "Childcare", "Security Services", "Construction Work",
  "Masonry", "Painting", "Tiling", "Roofing", "Landscaping", "Gardening",
  "Farming", "Fishing", "Aquaculture", "Animal Husbandry", "Agricultural Work",
  "Retail Sales", "Merchandising", "Store Management", "Warehouse Work", "Logistics",
  "Delivery Services", "Courier Services", "Messenger Services", "Transportation",
  "Photography", "Videography", "Graphic Design", "Web Design", "Programming",
  "IT Support", "Network Administration", "Database Management", "Social Media Management",
  "Content Writing", "Copywriting", "Editing", "Translation", "Interpretation",
  "Beauty Services", "Hairdressing", "Makeup", "Nail Care", "Massage Therapy",
  "Tailoring", "Sewing", "Dressmaking", "Embroidery", "Crafts Making",
  "Jewelry Making", "Leather Work", "Metal Fabrication", "Furniture Making",
  "Call Center", "Telemarketing", "Technical Support", "Email Support", "Chat Support",
  "Receptionist", "Secretary", "Administrative Assistant", "Filing", "Documentation"
];

const employmentStatuses = [
  "Employed", "Unemployed", "Self-Employed", "Underemployed", "New Entrant"
];

const employmentTypes = [
  "Full-Time", "Part-Time", "Contractual", "Casual", "Self-Employed", "Freelance", "Seasonal"
];

const educationalLevels = [
  "Elementary Graduate", "Elementary Undergraduate", 
  "High School Graduate", "High School Undergraduate",
  "Senior High School Graduate", "Senior High School Undergraduate",
  "College Graduate", "College Undergraduate",
  "Vocational Graduate", "Post Graduate"
];

const courses = [
  "Information Technology", "Computer Science", "Business Administration", "Accounting",
  "Marketing", "Hospitality Management", "Tourism", "Education", "Engineering",
  "Nursing", "Criminology", "Psychology", "Mass Communication", "Arts",
  "Agriculture", "Fisheries", "Marine Engineering", "Automotive Technology",
  "Electrical Technology", "Electronics Technology", "Welding Technology",
  "Food Technology", "Culinary Arts", "Hotel and Restaurant Management",
  "Office Management", "Secretarial", "Bookkeeping", "Caregiving",
  "Automotive Servicing", "Refrigeration and Air Conditioning", "Plumbing",
  "Carpentry", "Masonry", "Tile Setting", "Driving", "Heavy Equipment Operation",
  "Computer Hardware Servicing", "Computer Programming", "Animation",
  "Graphic Design", "Beauty Care", "Cosmetology", "Hairdressing", "Massage Therapy"
];

const religions = [
  "Roman Catholic", "Islam", "Iglesia ni Cristo", "Protestant", "Evangelical",
  "Seventh-Day Adventist", "Baptist", "Mormon", "Jehovah's Witness", "Buddhist", "Other"
];

const civilStatuses = ["Single", "Married", "Widowed", "Separated", "Live-in"];

const sexes = ["Male", "Female"];

const disabilities = ["None", "Visual Impairment", "Hearing Impairment", "Physical Disability", "Speech Impairment"];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomSkills(min: number = 2, max: number = 6): string {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const selectedSkills = new Set<string>();
  
  while (selectedSkills.size < count) {
    selectedSkills.add(randomElement(skills));
  }
  
  return Array.from(selectedSkills).join(", ");
}

function randomAge(min: number = 18, max: number = 60): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateOfBirth(age: number): string {
  const currentYear = 2025;
  const birthYear = currentYear - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
}

function randomHeight(): string {
  const cm = Math.floor(Math.random() * (185 - 150 + 1)) + 150;
  return `${cm} cm`;
}

function randomContactNumber(): string {
  const prefix = randomElement(["0915", "0916", "0917", "0918", "0919", "0920", "0921", "0922", "0923", "0924", "0925", "0926", "0927", "0928", "0929", "0930", "0931", "0932", "0933", "0934", "0935", "0936", "0945", "0946", "0947", "0948", "0949", "0950", "0951", "0955", "0956", "0963", "0965", "0966", "0967", "0968", "0969", "0970", "0975", "0976", "0977", "0978", "0979", "0981", "0982", "0985", "0989", "0991", "0992", "0993", "0994", "0995", "0996", "0997", "0998", "0999"]);
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${suffix}`;
}

function generateApplicant(index: number) {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const middleName = randomElement(firstNames);
  const age = randomAge(18, 60);
  const sex = randomElement(sexes);
  const barangay = randomElement(barangays);
  const employmentStatus = randomElement(employmentStatuses);
  const educationalLevel = randomElement(educationalLevels);
  const disability = Math.random() < 0.05 ? randomElement(disabilities.filter(d => d !== "None")) : "None";
  const isOfw = Math.random() < 0.15; // 15% chance of being OFW
  
  return {
    id: `APP-${Date.now()}-${index}`,
    surname: lastName,
    firstName: firstName,
    middleName: middleName,
    suffix: Math.random() < 0.05 ? randomElement(["Jr.", "Sr.", "II", "III"]) : null,
    dateOfBirth: randomDateOfBirth(age),
    sex: sex,
    religion: randomElement(religions),
    civilStatus: randomElement(civilStatuses),
    height: randomHeight(),
    contactNumber: randomContactNumber(),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@email.com`,
    disability: disability,
    address: `${Math.floor(Math.random() * 500) + 1} ${randomElement(["Main St.", "Rizal Ave.", "Bonifacio St.", "Luna St.", "Mabini St.", "Quezon Ave.", "Aguinaldo St.", "Laurel St.", "Osmeña St.", "Magsaysay Blvd."])}`,
    barangay: barangay,
    municipality: "General Santos City",
    province: "South Cotabato",
    employmentStatus: employmentStatus,
    employmentType: employmentStatus === "Employed" || employmentStatus === "Underemployed" ? randomElement(employmentTypes) : null,
    isOfw: isOfw ? 1 : 0,
    isStudent: age < 25 && Math.random() < 0.3 ? 1 : 0,
    is4psBeneficiary: Math.random() < 0.2 ? 1 : 0,
    educationalAttainment: educationalLevel,
    course: educationalLevel.includes("Graduate") || educationalLevel.includes("Undergraduate") ? randomElement(courses) : null,
    yearGraduated: educationalLevel.includes("Graduate") ? (2025 - Math.floor(Math.random() * 20)).toString() : null,
    eligibility: Math.random() < 0.3 ? randomElement(["Driver's License", "TESDA Certificate", "Professional License", "Civil Service Eligible"]) : null,
    otherSkillsTraining: randomSkills(2, 6),
    preferredOccupation: randomElement([
      "Office Clerk", "Sales Associate", "Customer Service Representative", "Driver",
      "Welder", "Carpenter", "Electrician", "Cook", "Waiter", "Security Guard",
      "Construction Worker", "Factory Worker", "Warehouse Staff", "Delivery Rider",
      "Call Center Agent", "Cashier", "Store Keeper", "Maintenance Staff", "Janitor",
      "Caregiver", "Nursing Aide", "Teacher", "Tutor", "Technician", "Mechanic",
      "Farmer", "Fisherman", "Aquaculture Worker", "Agricultural Worker", "Gardener"
    ]),
    expectedSalary: Math.floor(Math.random() * (20000 - 12000 + 1) + 12000),
    salaryPeriod: "Monthly",
    preferredWorkLocation: Math.random() < 0.7 ? "General Santos City" : randomElement(["Koronadal City", "Tacurong City", "Polomolok", "Tupi", "Tampakan"]),
    employerName: employmentStatus === "Employed" || employmentStatus === "Underemployed" ? 
      randomElement([
        "SM City GenSan", "Robinsons Place GenSan", "Gaisano Grand Mall", "KCC Mall",
        "San Miguel Corporation", "Dole Philippines", "General Milling Corporation", "DMCI",
        "Jollibee", "McDonald's", "Chowking", "Mang Inasal", "Greenwich Pizza",
        "BPO Company", "Call Center Inc.", "Customer Service Solutions", "Tech Support Corp.",
        "Construction Company", "Engineering Firm", "Manufacturing Plant", "Fishing Company"
      ]) : null,
    employerAddress: null,
    activelyLookingForWork: employmentStatus === "Unemployed" || employmentStatus === "New Entrant" || employmentStatus === "Underemployed" ? 1 : 0,
    willingToWorkImmediately: employmentStatus === "Unemployed" || employmentStatus === "New Entrant" ? 1 : 0,
    whenCanStart: randomElement(["Immediately", "1 week", "2 weeks", "1 month", "Upon regularization"]),
    passportNumber: isOfw || Math.random() < 0.1 ? `P${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : null,
    dateRegistered: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seedApplicants() {
  console.log("🌱 Starting to seed 237 applicants...");
  
  try {
    const db = await initializeDatabase();
    const applicants = [];

    // Generate 237 unique applicants
    for (let i = 1; i <= 237; i++) {
      const applicant = generateApplicant(i);
      applicants.push(applicant);
      
      if (i % 50 === 0) {
        console.log(`Generated ${i} applicants...`);
      }
    }

    console.log("💾 Inserting applicants into database...");
    
    // Insert in batches of 50 to avoid memory issues
    for (let i = 0; i < applicants.length; i += 50) {
      const batch = applicants.slice(i, i + 50);
      await db.insert(applicantsTable).values(batch);
      console.log(`Inserted batch ${Math.floor(i / 50) + 1} (${i + 1}-${Math.min(i + 50, applicants.length)} applicants)`);
    }

    console.log("✅ Successfully seeded 237 applicants!");
    console.log("\n📊 Summary:");
    console.log(`- Total Applicants: 237`);
    console.log(`- Barangays Covered: ${barangays.length}`);
    console.log(`- Skills Pool: ${skills.length} different skills`);
    console.log(`- Employment Statuses: ${employmentStatuses.join(", ")}`);
    console.log(`- Education Levels: ${educationalLevels.length} different levels`);
    
    const statusCounts = applicants.reduce((acc: any, app) => {
      acc[app.employmentStatus] = (acc[app.employmentStatus] || 0) + 1;
      return acc;
    }, {});
    
    console.log("\n📈 Employment Status Distribution:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error("❌ Error seeding applicants:", error);
    throw error;
  }
}

// Run the seeder
seedApplicants()
  .then(() => {
    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
