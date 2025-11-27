import { getDatabase, initializeDatabase } from "../server/database";
import { applicantsTable } from "../server/unified-schema";

async function seedApplicants() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    const testApplicants = [
      {
        firstName: "Maria",
        surname: "Santos",
        email: "maria.santos@gmail.com",
        contactNumber: "09171234567",
        barangay: "Dadiangas North",
        municipality: "General Santos City",
        province: "South Cotabato",
        employmentType: "Jobseeker",
        employmentStatus: "Unemployed",
        sex: "Female",
        civilStatus: "Single",
        dateOfBirth: "1995-05-15",
        address: "Purok 5",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Juan",
        surname: "Dela Cruz",
        email: "juan.delacruz@yahoo.com",
        contactNumber: "09287654321",
        barangay: "Calumpang",
        municipality: "General Santos City",
        province: "South Cotabato",
        employmentType: "Freelancer",
        employmentStatus: "Self-employed",
        sex: "Male",
        civilStatus: "Married",
        dateOfBirth: "1988-12-20",
        address: "Purok 8",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Anna",
        surname: "Reyes",
        email: "anna.reyes@outlook.com",
        contactNumber: "09356789012",
        barangay: "Bula",
        municipality: "General Santos City",
        province: "South Cotabato",
        employmentType: "Jobseeker",
        employmentStatus: "New Entrant",
        sex: "Female",
        civilStatus: "Single",
        dateOfBirth: "2000-03-10",
        address: "Purok 3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("Adding test applicants...");
    
    for (const applicant of testApplicants) {
      await db.insert(applicantsTable).values(applicant);
      console.log(`✓ Added: ${applicant.firstName} ${applicant.surname}`);
    }
    
    console.log("\n✅ Successfully added 3 test applicants!");
    console.log("\nRefresh the admin applicants page to see them.");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

seedApplicants();
