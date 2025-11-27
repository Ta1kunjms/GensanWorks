import { initializeDatabase } from "../server/database";
import { applicantsTable } from "../server/unified-schema";

async function checkAddress() {
  const db = await initializeDatabase();
  const applicants = await db.select().from(applicantsTable).limit(3);
  
  console.log("Applicant address fields:");
  applicants.forEach((a) => {
    console.log({
      id: a.id,
      name: `${a.firstName} ${a.surname}`,
      houseStreetVillage: a.houseStreetVillage,
      barangay: a.barangay,
      municipality: a.municipality,
      province: a.province,
    });
  });
}

checkAddress().catch(console.error);
