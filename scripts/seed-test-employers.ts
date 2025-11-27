import { initializeDatabase } from "../server/database";
import { employersTable, jobVacanciesTable } from "../server/unified-schema";

async function seedTestData() {
  console.log("🌱 Seeding test employers and job vacancies with dates...");

  try {
    const db = await initializeDatabase();

    // Get current date for reference
    const now = new Date();
    const today = now.getTime();
    const yesterday = today - 86400000; // 1 day ago
    const tomorrow = today + 86400000; // 1 day in future
    const nextWeek = today + 604800000; // 7 days from now

    console.log(`Current timestamp: ${now.toISOString()}`);

    // Create sample employers with dates
    const employer1 = {
      id: `employer_today_${Date.now()}`,
      establishmentName: "Today's Tech Company",
      houseStreetVillage: "123 Main St",
      barangay: "Baluan",
      municipality: "General Santos City",
      province: "South Cotabato",
      contactNumber: "555-0001",
      email: "today@techcompany.com",
      numberOfPaidEmployees: 50,
      numberOfVacantPositions: 5,
      industryType: ["IT", "Software"],
      srsSubscriber: true,
      preparedByName: "John Doe",
      preparedByDesignation: "HR Manager",
      preparedByContact: "555-1234",
      dateAccomplished: new Date().toISOString().split('T')[0],
      remarks: "Created today for testing",
      archived: false,
      createdAt: new Date(today),
      updatedAt: new Date(today),
    };

    const employer2 = {
      id: `employer_yesterday_${Date.now()}`,
      establishmentName: "Yesterday's Manufacturing",
      houseStreetVillage: "456 Oak Ave",
      barangay: "Apopong",
      municipality: "General Santos City",
      province: "South Cotabato",
      contactNumber: "555-0002",
      email: "yesterday@manufacturing.com",
      numberOfPaidEmployees: 100,
      numberOfVacantPositions: 10,
      industryType: ["Manufacturing"],
      srsSubscriber: true,
      preparedByName: "Jane Smith",
      preparedByDesignation: "Operations Manager",
      preparedByContact: "555-5678",
      dateAccomplished: new Date(yesterday).toISOString().split('T')[0],
      remarks: "Created yesterday for testing",
      archived: false,
      createdAt: new Date(yesterday),
      updatedAt: new Date(yesterday),
    };

    const employer3 = {
      id: `employer_nextweek_${Date.now()}`,
      establishmentName: "Next Week's Services",
      houseStreetVillage: "789 Pine Rd",
      barangay: "Batomelong",
      municipality: "General Santos City",
      province: "South Cotabato",
      contactNumber: "555-0003",
      email: "nextweek@services.com",
      numberOfPaidEmployees: 75,
      numberOfVacantPositions: 8,
      industryType: ["Services"],
      srsSubscriber: false,
      preparedByName: "Bob Johnson",
      preparedByDesignation: "Recruitment Lead",
      preparedByContact: "555-9999",
      dateAccomplished: new Date(nextWeek).toISOString().split('T')[0],
      remarks: "Created next week for testing",
      archived: false,
      createdAt: new Date(nextWeek),
      updatedAt: new Date(nextWeek),
    };

    console.log("Creating employers...");
    await db.insert(employersTable).values(employer1);
    console.log(`✓ Created employer (today): ${employer1.establishmentName}`);
    
    await db.insert(employersTable).values(employer2);
    console.log(`✓ Created employer (yesterday): ${employer2.establishmentName}`);
    
    await db.insert(employersTable).values(employer3);
    console.log(`✓ Created employer (next week): ${employer3.establishmentName}`);

    // Create sample job vacancies with dates
    const vacancy1 = {
      id: `vacancy_today_${Date.now()}`,
      employerId: employer1.id,
      establishmentName: employer1.establishmentName,
      positionTitle: "Senior Software Engineer",
      numberOfVacancies: 3,
      industryType: ["IT"],
      minimumEducationRequired: "Bachelor's Degree",
      mainSkillOrSpecialization: "Full Stack Development",
      yearsOfExperienceRequired: 5,
      agePreference: "25-40",
      startingSalaryOrWage: 50000,
      salaryType: "Monthly",
      jobStatus: "Permanent",
      benefits: ["Health Insurance", "13th Month Pay", "Retirement Plan"],
      additionalRequirements: "Must know React and Node.js",
      jobDescription: "We are looking for experienced full stack developers",
      preparedByName: "John Doe",
      preparedByDesignation: "HR Manager",
      preparedByContact: "555-1234",
      dateAccomplished: new Date().toISOString().split('T')[0],
      archived: false,
      createdAt: new Date(today),
      updatedAt: new Date(today),
    };

    const vacancy2 = {
      id: `vacancy_yesterday_${Date.now()}`,
      employerId: employer2.id,
      establishmentName: employer2.establishmentName,
      positionTitle: "Production Manager",
      numberOfVacancies: 2,
      industryType: ["Manufacturing"],
      minimumEducationRequired: "Associate's Degree",
      mainSkillOrSpecialization: "Production Planning",
      yearsOfExperienceRequired: 7,
      agePreference: "30-50",
      startingSalaryOrWage: 40000,
      salaryType: "Monthly",
      jobStatus: "Permanent",
      benefits: ["Health Insurance", "13th Month Pay"],
      additionalRequirements: "ISO certification preferred",
      jobDescription: "Manage production teams and optimize workflows",
      preparedByName: "Jane Smith",
      preparedByDesignation: "Operations Manager",
      preparedByContact: "555-5678",
      dateAccomplished: new Date(yesterday).toISOString().split('T')[0],
      archived: false,
      createdAt: new Date(yesterday),
      updatedAt: new Date(yesterday),
    };

    console.log("\nCreating job vacancies...");
    await db.insert(jobVacanciesTable).values(vacancy1);
    console.log(`✓ Created vacancy (today): ${vacancy1.positionTitle}`);
    
    await db.insert(jobVacanciesTable).values(vacancy2);
    console.log(`✓ Created vacancy (yesterday): ${vacancy2.positionTitle}`);

    console.log("\n✅ Test data seeded successfully!");
    console.log("\nTest scenarios:");
    console.log("  • Select 'Day' view (Nov 26): Should show 1 employer + 1 job vacancy");
    console.log("  • Select 'Week' or 'Month' view: Should show all 3 employers + 2 vacancies");
    console.log("  • Select 'Day' view (Nov 27): Should show 0 records (no data in future)");

  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedTestData().then(() => {
  process.exit(0);
});
