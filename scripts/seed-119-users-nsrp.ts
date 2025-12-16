import bcrypt from "bcryptjs";
import { initializeDatabase, getDatabase } from "../server/database";
import { usersTable } from "../server/unified-schema";
import { like } from "drizzle-orm";

const genders = ["Male", "Female"] as const;
const civilStatuses = ["Single", "Married", "Widowed", "Separated"] as const;
const educationLevels = ["Elementary", "High School", "Vocational", "College", "Postgraduate"] as const;
const employmentStatuses = ["Employed", "Unemployed", "Self-Employed", "Student"] as const;
const nsrpStatuses = ["Active", "Inactive", "Pending"] as const;
const governmentIdTypes = ["SSS", "PhilHealth", "Pag-IBIG", "TIN"] as const;
const jobPreferences = ["Full-Time", "Part-Time", "Contractual", "Seasonal", "Internship"] as const;

const barangays = [
  "Lagao", "Calumpang", "San Isidro", "Fatima", "Apopong", "Tambler", "Bula", "City Heights", "Mabuhay", "Baluan", "Labangal", "Dadiangas North", "Dadiangas South", "Dadiangas East", "Dadiangas West", "San Jose", "Katangawan",
];
const municipalities = ["General Santos City", "Polomolok", "Koronadal City", "Tupi", "Tampakan"];
const provinces = ["South Cotabato", "Sarangani", "Sultan Kudarat"];
const skillPool = [
  "Auto Mechanic", "Beautician", "Carpentry Work", "Computer Literate", "Domestic Chores", "Driver", "Electrician", "Embroidery", "Gardening", "Masonry", "Painter/Artist", "Painting Jobs", "Photography", "Plumbing", "Sewing Dresses", "Stenography", "Tailoring",
];
const schools = [
  "Mindanao State University", "Notre Dame of Dadiangas University", "General Santos City National High School", "Holy Trinity College", "University of Mindanao", "Lagao National High School", "Notre Dame of Marbel University", "Sultan Kudarat State University",
];

function randomItem<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}
function randomPhone(): string {
  const prefix = randomItem(["0915", "0916", "0917", "0926", "0935", "0945", "0956", "0965", "0977", "0995"]);
  const suffix = String(randomInt(1000000, 9999999));
  return `${prefix}${suffix}`;
}
function pickSkills(): string[] {
  const count = randomInt(3, 6);
  const selections = new Set<string>();
  while (selections.size < count) {
    selections.add(randomItem(skillPool));
  }
  return Array.from(selections);
}

async function seedApplicants() {
  await initializeDatabase();
  const db = getDatabase();
  const seedPrefix = "seed_119_";
  console.log(`🧹 Removing previous seed entries with prefix ${seedPrefix}*`);
  await db.delete(usersTable).where(like(usersTable.id, `${seedPrefix}%`));
  const records = [];
  for (let i = 1; i <= 119; i++) {
    const firstName = randomItem([
      "Juan", "Maria", "Jose", "Ana", "Pedro", "Rosa", "Carlos", "Elena", "Miguel", "Sofia", "Luis", "Carmen", "Ramon", "Isabel", "Antonio", "Teresa", "Francisco", "Luz", "Manuel", "Cristina", "Ricardo", "Patricia", "Fernando", "Gloria", "Eduardo", "Diana", "Rodrigo", "Sandra", "Alejandro", "Lucia",
    ]);
    const surname = randomItem([
      "dela Cruz", "Santiago", "Bautista", "Villanueva", "Aquino", "Pascual", "Mercado", "Domingo", "Alcantara", "Custodio", "Manalo", "Evangelista", "Soriano", "Valencia", "Tolentino", "Miranda", "Rosario", "Salazar", "Marquez", "Padilla", "Velasco", "Guerrero", "Navarro", "Suarez", "Rojas", "Galvez", "Esteban", "Pineda", "Moreno", "Ayala",
    ]);
    const email = `${firstName.toLowerCase()}.${surname.replace(/\s+/g, "").toLowerCase()}${100 + i}@gensanworks.test`;
    const passwordPlain = `SeedUser${1000 + i}!`;
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const barangay = randomItem(barangays);
    const municipality = randomItem(municipalities);
    const province = randomItem(provinces);
    const purok = randomInt(1, 12);
    const address = `Purok ${purok}, ${barangay}, ${municipality}, ${province}`;
    const birthDate = randomDate(1978, 2005);
    const educationLevel = randomItem(educationLevels);
    const schoolName = randomItem(schools);
    const skills = pickSkills();
    const employmentStatus = randomItem(employmentStatuses);
    const jobPreference = randomItem(jobPreferences);
    const nsrpNumber = `NSRP-${2024 + (i % 2)}-${String(1000 + i).padStart(4, "0")}`;
    const governmentIdType = randomItem(governmentIdTypes);
    const createdAt = randomDate(2023, 2024);
    const updatedAt = new Date(createdAt.getTime() + randomInt(1, 90) * 24 * 60 * 60 * 1000);
    records.push({
      id: `${seedPrefix}${String(i).padStart(4, "0")}`,
      passwordHash,
      role: "jobseeker",
      surname,
      firstName,
      middleName: null,
      suffix: null,
      dateOfBirth: birthDate.toISOString().split("T")[0],
      sex: randomItem(genders),
      religion: "Roman Catholic",
      civilStatus: randomItem(civilStatuses),
      height: `${randomInt(150, 185)} cm`,
      contactNumber: randomPhone(),
      email,
      disability: null,
      disabilitySpecify: null,
      address,
      barangay,
      municipality,
      province,
      employmentStatus,
      employmentType: jobPreference,
      monthsUnemployed: employmentStatus === "Unemployed" ? randomInt(1, 12) : 0,
      isOfw: 0,
      owfCountry: null,
      isFormerOfw: 0,
      formerOFWCountry: null,
      returnToPHDate: null,
      is4psBeneficiary: randomInt(0, 1),
      householdID: null,
      preferredOccupations: JSON.stringify([`${jobPreference} ${employmentStatus}`]),
      preferredLocations: JSON.stringify([municipality]),
      preferredOverseasCountries: JSON.stringify([]),
      employmentType4: jobPreference,
      education: JSON.stringify([
        {
          level: educationLevel,
          schoolName,
          course: "General Course",
          yearGraduated: String(randomInt(2005, 2023)),
        },
      ]),
      technicalTraining: JSON.stringify([]),
      professionalLicenses: JSON.stringify([]),
      languageProficiency: JSON.stringify([]),
      workExperience: JSON.stringify([]),
      skills: JSON.stringify(skills),
      otherSkillsSpecify: null,
      createdAt,
      updatedAt,
    });
  }
  console.log("🌱 Inserting 119 applicants...");
  await db.insert(usersTable).values(records);
  console.log("✅ Done seeding 119 applicants.");
  console.log("ℹ️ Default passwords follow the pattern SeedUser1001! .. SeedUser1120!");
}

seedApplicants()
  .then(() => {
    console.log("🎉 Seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  });
