import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({ url: "file:./app.db" });

// Barangays in General Santos City
const barangays = [
  "Apopong", "Baluan", "Batomelong", "Buayan", "Bula", "Calumpang", 
  "City Heights", "Conel", "Dadiangas East", "Dadiangas North", 
  "Dadiangas South", "Dadiangas West", "Fatima", "Katangawan", 
  "Labangal", "Lagao", "Ligaya", "Mabuhay", "Olympog", "San Isidro",
  "San Jose", "Siguel", "Sinawal", "Tambler", "Tinagacan", "Upper Labay"
];

// Skills categories
const technicalSkills = [
  "Web Development", "Mobile App Development", "Graphic Design", 
  "Video Editing", "Data Entry", "Microsoft Office", "AutoCAD",
  "Bookkeeping", "Social Media Management", "Content Writing",
  "SEO/SEM", "Network Administration", "Database Management",
  "Programming (Python)", "Programming (Java)", "UI/UX Design",
  "Digital Marketing", "WordPress", "Photoshop", "Excel Advanced"
];

const softSkills = [
  "Communication", "Leadership", "Time Management", "Problem Solving",
  "Teamwork", "Adaptability", "Critical Thinking", "Customer Service",
  "Organization", "Attention to Detail"
];

const tradeSkills = [
  "Carpentry", "Plumbing", "Electrical Work", "Welding", "Masonry",
  "Heavy Equipment Operation", "Automotive Repair", "HVAC Technician",
  "Painting", "Construction Management"
];

const serviceSkills = [
  "Food Service", "Bartending", "Housekeeping", "Security",
  "Driving (Professional)", "Sales", "Retail Management", "Cashiering",
  "Warehouse Operations", "Logistics Coordination"
];

// Sample applicants data
const sampleApplicants = [
  {
    surname: "Dela Cruz",
    firstName: "Maria",
    middleName: "Santos",
    dateOfBirth: "1995-03-15",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'3\"",
    contactNumber: "09171234567",
    email: "maria.delacruz@email.com",
    barangay: "Dadiangas North",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Information Technology", school: "Mindanao State University - GenSan", yearGraduated: "2017" }
    ],
    skills: ["Web Development", "JavaScript", "React", "Node.js", "Communication", "Problem Solving"],
    workExperience: [
      { company: "TechStart Inc.", position: "Junior Developer", duration: "2017-2019" }
    ]
  },
  {
    surname: "Reyes",
    firstName: "Juan",
    middleName: "Pablo",
    dateOfBirth: "1992-07-22",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'7\"",
    contactNumber: "09281234568",
    email: "juan.reyes@email.com",
    barangay: "Apopong",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Civil Engineering", school: "Notre Dame of Dadiangas University", yearGraduated: "2015" }
    ],
    skills: ["AutoCAD", "Construction Management", "Project Planning", "Leadership", "Critical Thinking"],
    workExperience: [
      { company: "Build Right Construction", position: "Site Engineer", duration: "2015-Present" }
    ]
  },
  {
    surname: "Garcia",
    firstName: "Sarah",
    middleName: "Mae",
    dateOfBirth: "1998-11-05",
    sex: "Female",
    religion: "Iglesia ni Cristo",
    civilStatus: "Single",
    height: "5'2\"",
    contactNumber: "09391234569",
    email: "sarah.garcia@email.com",
    barangay: "City Heights",
    employmentStatus: "Unemployed",
    employmentType: "Part-time",
    education: [
      { level: "College", course: "BS Tourism Management", school: "Cor Jesu College", yearGraduated: "2020" }
    ],
    skills: ["Customer Service", "Communication", "Event Planning", "Social Media Management", "MS Office"],
    workExperience: []
  },
  {
    surname: "Santos",
    firstName: "Roberto",
    middleName: "Cruz",
    dateOfBirth: "1988-05-30",
    sex: "Male",
    religion: "Born Again Christian",
    civilStatus: "Married",
    height: "5'9\"",
    contactNumber: "09451234570",
    email: "roberto.santos@email.com",
    barangay: "Bula",
    employmentStatus: "Self-employed",
    employmentType: "Self-employed",
    education: [
      { level: "Vocational", course: "Welding Technology", school: "TESDA GenSan", yearGraduated: "2008" }
    ],
    skills: ["Welding", "Metal Fabrication", "Blueprint Reading", "Problem Solving", "Time Management"],
    workExperience: [
      { company: "Own Business", position: "Welding Services", duration: "2010-Present" }
    ]
  },
  {
    surname: "Aquino",
    firstName: "Jennifer",
    middleName: "Lopez",
    dateOfBirth: "1996-09-12",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'4\"",
    contactNumber: "09561234571",
    email: "jennifer.aquino@email.com",
    barangay: "Lagao",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Accountancy", school: "University of Mindanao - GenSan", yearGraduated: "2018" }
    ],
    skills: ["Bookkeeping", "Excel Advanced", "QuickBooks", "Attention to Detail", "Organization"],
    workExperience: [
      { company: "ABC Accounting Firm", position: "Junior Accountant", duration: "2018-2021" }
    ]
  },
  {
    surname: "Fernandez",
    firstName: "Miguel",
    middleName: "Angelo",
    dateOfBirth: "1993-02-18",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'8\"",
    contactNumber: "09671234572",
    email: "miguel.fernandez@email.com",
    barangay: "Fatima",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Computer Science", school: "Mindanao State University - GenSan", yearGraduated: "2016" }
    ],
    skills: ["Programming (Python)", "Data Analysis", "SQL", "Problem Solving", "Critical Thinking"],
    workExperience: [
      { company: "Data Solutions Inc.", position: "Data Analyst", duration: "2017-Present" }
    ]
  },
  {
    surname: "Ramos",
    firstName: "Angelica",
    middleName: "Rose",
    dateOfBirth: "1999-06-25",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'1\"",
    contactNumber: "09781234573",
    email: "angelica.ramos@email.com",
    barangay: "Labangal",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Psychology", school: "Notre Dame of Dadiangas University", yearGraduated: "2021" }
    ],
    skills: ["Communication", "Counseling", "Research", "Empathy", "Active Listening"],
    workExperience: []
  },
  {
    surname: "Torres",
    firstName: "Ricardo",
    middleName: "Manuel",
    dateOfBirth: "1990-12-08",
    sex: "Male",
    religion: "Seventh-day Adventist",
    civilStatus: "Married",
    height: "5'10\"",
    contactNumber: "09891234574",
    email: "ricardo.torres@email.com",
    barangay: "Buayan",
    employmentStatus: "Self-employed",
    employmentType: "Self-employed",
    education: [
      { level: "High School", school: "GenSan National High School", yearGraduated: "2008" }
    ],
    skills: ["Driving (Professional)", "Logistics Coordination", "Time Management", "Customer Service"],
    workExperience: [
      { company: "Own Business", position: "Tricycle Driver", duration: "2010-Present" }
    ]
  },
  {
    surname: "Villanueva",
    firstName: "Christine",
    middleName: "Joy",
    dateOfBirth: "1997-04-14",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'5\"",
    contactNumber: "09101234575",
    email: "christine.villanueva@email.com",
    barangay: "San Isidro",
    employmentStatus: "Employed",
    employmentType: "Part-time",
    education: [
      { level: "College", course: "AB Communication", school: "Cor Jesu College", yearGraduated: "2019" }
    ],
    skills: ["Content Writing", "Social Media Management", "Photography", "Creativity", "Communication"],
    workExperience: [
      { company: "Digital Media Agency", position: "Content Creator", duration: "2020-Present" }
    ]
  },
  {
    surname: "Mendoza",
    firstName: "Patrick",
    middleName: "James",
    dateOfBirth: "1991-08-20",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'6\"",
    contactNumber: "09211234576",
    email: "patrick.mendoza@email.com",
    barangay: "Calumpang",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "Vocational", course: "Electrical Installation and Maintenance", school: "TESDA GenSan", yearGraduated: "2011" }
    ],
    skills: ["Electrical Work", "Troubleshooting", "Safety Compliance", "Problem Solving", "Attention to Detail"],
    workExperience: [
      { company: "Power Solutions Corp.", position: "Electrician", duration: "2012-Present" }
    ]
  },
  {
    surname: "Cruz",
    firstName: "Diana",
    middleName: "Marie",
    dateOfBirth: "2000-01-30",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'3\"",
    contactNumber: "09321234577",
    email: "diana.cruz@email.com",
    barangay: "Olympog",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Nursing", school: "Mindanao Medical Foundation College", yearGraduated: "2022" }
    ],
    skills: ["Healthcare", "Patient Care", "First Aid", "Compassion", "Teamwork"],
    workExperience: []
  },
  {
    surname: "Bautista",
    firstName: "Carlos",
    middleName: "Antonio",
    dateOfBirth: "1989-10-17",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'11\"",
    contactNumber: "09431234578",
    email: "carlos.bautista@email.com",
    barangay: "Tambler",
    employmentStatus: "Self-employed",
    employmentType: "Self-employed",
    education: [
      { level: "Vocational", course: "Automotive Servicing", school: "TESDA GenSan", yearGraduated: "2009" }
    ],
    skills: ["Automotive Repair", "Engine Diagnostics", "Customer Service", "Problem Solving", "Mechanical Skills"],
    workExperience: [
      { company: "Own Business", position: "Auto Mechanic", duration: "2011-Present" }
    ]
  },
  {
    surname: "Santiago",
    firstName: "Kristine",
    middleName: "Anne",
    dateOfBirth: "1994-07-03",
    sex: "Female",
    religion: "United Church of Christ",
    civilStatus: "Single",
    height: "5'2\"",
    contactNumber: "09541234579",
    email: "kristine.santiago@email.com",
    barangay: "Siguel",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Business Administration", school: "University of Mindanao - GenSan", yearGraduated: "2016" }
    ],
    skills: ["Sales", "Marketing", "Customer Relations", "Negotiation", "Communication"],
    workExperience: [
      { company: "GenSan Mall", position: "Sales Supervisor", duration: "2017-Present" }
    ]
  },
  {
    surname: "Morales",
    firstName: "Benjamin",
    middleName: "Luis",
    dateOfBirth: "1987-03-28",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'7\"",
    contactNumber: "09651234580",
    email: "benjamin.morales@email.com",
    barangay: "Baluan",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Marine Engineering", school: "John Paul II College of Davao", yearGraduated: "2010" }
    ],
    skills: ["Maritime Operations", "Engine Maintenance", "Safety Management", "Leadership", "Technical Skills"],
    workExperience: [
      { company: "Ocean Freight Inc.", position: "Marine Engineer", duration: "2011-Present" }
    ],
    isOfw: true
  },
  {
    surname: "Rivera",
    firstName: "Jasmine",
    middleName: "Lyn",
    dateOfBirth: "1995-11-19",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'4\"",
    contactNumber: "09761234581",
    email: "jasmine.rivera@email.com",
    barangay: "Ligaya",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Hospitality Management", school: "Cor Jesu College", yearGraduated: "2017" }
    ],
    skills: ["Food Service", "Hotel Operations", "Customer Service", "Team Management", "Organization"],
    workExperience: [
      { company: "Luxury Hotel GenSan", position: "Front Desk Associate", duration: "2017-2020" }
    ]
  },
  {
    surname: "Gonzales",
    firstName: "Raymond",
    middleName: "Paul",
    dateOfBirth: "1992-05-07",
    sex: "Male",
    religion: "Baptist",
    civilStatus: "Single",
    height: "5'9\"",
    contactNumber: "09871234582",
    email: "raymond.gonzales@email.com",
    barangay: "Conel",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Architecture", school: "Mindanao State University - GenSan", yearGraduated: "2015" }
    ],
    skills: ["AutoCAD", "SketchUp", "3D Modeling", "Design Thinking", "Project Management"],
    workExperience: [
      { company: "Design Studio GenSan", position: "Junior Architect", duration: "2016-Present" }
    ]
  },
  {
    surname: "Flores",
    firstName: "Michelle",
    middleName: "Ann",
    dateOfBirth: "1998-08-15",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'1\"",
    contactNumber: "09981234583",
    email: "michelle.flores@email.com",
    barangay: "Mabuhay",
    employmentStatus: "Unemployed",
    employmentType: "Part-time",
    education: [
      { level: "College", course: "AB Multimedia Arts", school: "Notre Dame of Dadiangas University", yearGraduated: "2020" }
    ],
    skills: ["Graphic Design", "Video Editing", "Adobe Photoshop", "Adobe Premiere", "Creativity"],
    workExperience: [
      { company: "Freelance", position: "Graphic Designer", duration: "2020-2022" }
    ]
  },
  {
    surname: "Castillo",
    firstName: "Anthony",
    middleName: "Jose",
    dateOfBirth: "1986-12-22",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'8\"",
    contactNumber: "09191234584",
    email: "anthony.castillo@email.com",
    barangay: "Dadiangas East",
    employmentStatus: "Self-employed",
    employmentType: "Self-employed",
    education: [
      { level: "College", course: "BS Fisheries", school: "Mindanao State University - GenSan", yearGraduated: "2008" }
    ],
    skills: ["Fishing Operations", "Fish Processing", "Business Management", "Entrepreneurship", "Leadership"],
    workExperience: [
      { company: "Own Business", position: "Fish Vendor", duration: "2010-Present" }
    ]
  },
  {
    surname: "Pascual",
    firstName: "Stephanie",
    middleName: "Grace",
    dateOfBirth: "1996-02-11",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'3\"",
    contactNumber: "09201234585",
    email: "stephanie.pascual@email.com",
    barangay: "Katangawan",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Education Major in English", school: "Notre Dame of Dadiangas University", yearGraduated: "2018" }
    ],
    skills: ["Teaching", "Curriculum Development", "Communication", "Patience", "Organization"],
    workExperience: [
      { company: "GenSan Elementary School", position: "English Teacher", duration: "2019-Present" }
    ]
  },
  {
    surname: "Navarro",
    firstName: "Gabriel",
    middleName: "Vincent",
    dateOfBirth: "1993-09-04",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'10\"",
    contactNumber: "09301234586",
    email: "gabriel.navarro@email.com",
    barangay: "Dadiangas South",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "Vocational", course: "Heavy Equipment Operation", school: "TESDA GenSan", yearGraduated: "2013" }
    ],
    skills: ["Heavy Equipment Operation", "Backhoe", "Excavator", "Safety Procedures", "Maintenance"],
    workExperience: [
      { company: "Construction Corp", position: "Heavy Equipment Operator", duration: "2014-2022" }
    ]
  },
  {
    surname: "Salazar",
    firstName: "Hannah",
    middleName: "Faith",
    dateOfBirth: "1999-04-28",
    sex: "Female",
    religion: "Christian",
    civilStatus: "Single",
    height: "5'2\"",
    contactNumber: "09401234587",
    email: "hannah.salazar@email.com",
    barangay: "San Jose",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Information Systems", school: "University of Mindanao - GenSan", yearGraduated: "2021" }
    ],
    skills: ["Database Management", "SQL", "Network Administration", "IT Support", "Problem Solving"],
    workExperience: []
  },
  {
    surname: "Domingo",
    firstName: "Marco",
    middleName: "Luis",
    dateOfBirth: "1990-06-16",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'6\"",
    contactNumber: "09501234588",
    email: "marco.domingo@email.com",
    barangay: "Dadiangas West",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "Vocational", course: "Plumbing Technology", school: "TESDA GenSan", yearGraduated: "2010" }
    ],
    skills: ["Plumbing", "Pipe Installation", "Repair Services", "Problem Solving", "Customer Service"],
    workExperience: [
      { company: "Home Services Inc.", position: "Plumber", duration: "2011-Present" }
    ]
  },
  {
    surname: "Mercado",
    firstName: "Sophia",
    middleName: "Claire",
    dateOfBirth: "1997-10-09",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'4\"",
    contactNumber: "09601234589",
    email: "sophia.mercado@email.com",
    barangay: "Batomelong",
    employmentStatus: "Employed",
    employmentType: "Part-time",
    education: [
      { level: "College", course: "BS Pharmacy", school: "Mindanao Medical Foundation College", yearGraduated: "2019" }
    ],
    skills: ["Pharmaceutical Knowledge", "Customer Service", "Inventory Management", "Attention to Detail", "Communication"],
    workExperience: [
      { company: "Mercury Drug", position: "Pharmacy Assistant", duration: "2020-Present" }
    ]
  },
  {
    surname: "Valdez",
    firstName: "Daniel",
    middleName: "Mark",
    dateOfBirth: "1988-01-25",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Married",
    height: "5'11\"",
    contactNumber: "09701234590",
    email: "daniel.valdez@email.com",
    barangay: "Sinawal",
    employmentStatus: "Self-employed",
    employmentType: "Self-employed",
    education: [
      { level: "Vocational", course: "Carpentry", school: "TESDA GenSan", yearGraduated: "2008" }
    ],
    skills: ["Carpentry", "Furniture Making", "Wood Working", "Blueprint Reading", "Craftsmanship"],
    workExperience: [
      { company: "Own Business", position: "Carpenter", duration: "2009-Present" }
    ]
  },
  {
    surname: "Perez",
    firstName: "Isabella",
    middleName: "Rose",
    dateOfBirth: "2001-03-12",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'1\"",
    contactNumber: "09801234591",
    email: "isabella.perez@email.com",
    barangay: "Tinagacan",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    is4psBeneficiary: true,
    education: [
      { level: "College", course: "BS Social Work", school: "Notre Dame of Dadiangas University", yearGraduated: "2023" }
    ],
    skills: ["Social Work", "Community Organizing", "Counseling", "Empathy", "Communication"],
    workExperience: []
  },
  {
    surname: "Gutierrez",
    firstName: "Nathan",
    middleName: "James",
    dateOfBirth: "1991-07-31",
    sex: "Male",
    religion: "Pentecostal",
    civilStatus: "Single",
    height: "5'8\"",
    contactNumber: "09901234592",
    email: "nathan.gutierrez@email.com",
    barangay: "Upper Labay",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Criminology", school: "Mindanao State University - GenSan", yearGraduated: "2013" }
    ],
    skills: ["Security Management", "Law Enforcement", "Investigation", "Physical Fitness", "Discipline"],
    workExperience: [
      { company: "Security Agency", position: "Security Guard", duration: "2014-Present" }
    ]
  },
  {
    surname: "Hernandez",
    firstName: "Samantha",
    middleName: "Joy",
    dateOfBirth: "1995-12-18",
    sex: "Female",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'5\"",
    contactNumber: "09121234593",
    email: "samantha.hernandez@email.com",
    barangay: "Dadiangas North",
    employmentStatus: "Employed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Marketing Management", school: "University of Mindanao - GenSan", yearGraduated: "2017" }
    ],
    skills: ["Digital Marketing", "SEO/SEM", "Social Media Advertising", "Analytics", "Content Strategy"],
    workExperience: [
      { company: "Digital Marketing Agency", position: "Marketing Specialist", duration: "2018-Present" }
    ]
  },
  {
    surname: "Jimenez",
    firstName: "Kevin",
    middleName: "Dale",
    dateOfBirth: "1994-05-23",
    sex: "Male",
    religion: "Roman Catholic",
    civilStatus: "Single",
    height: "5'7\"",
    contactNumber: "09221234594",
    email: "kevin.jimenez@email.com",
    barangay: "Lagao",
    employmentStatus: "Unemployed",
    employmentType: "Full-time",
    education: [
      { level: "College", course: "BS Hotel and Restaurant Management", school: "Cor Jesu College", yearGraduated: "2016" }
    ],
    skills: ["Restaurant Management", "Food Service", "Bartending", "Customer Service", "Team Leadership"],
    workExperience: [
      { company: "Fine Dining Restaurant", position: "Restaurant Supervisor", duration: "2017-2022" }
    ]
  }
];

async function seedApplicants() {
  console.log("🌱 Starting to seed sample applicants...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const applicant of sampleApplicants) {
    try {
      const id = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      // Format full name
      const fullName = `${applicant.firstName} ${applicant.middleName ? applicant.middleName + ' ' : ''}${applicant.surname}`.trim();

      await client.execute({
        sql: `INSERT INTO users (
          id, email, password_hash, has_account, role, surname, first_name, middle_name,
          date_of_birth, sex, religion, civil_status, height, contact_number, barangay, municipality, province,
          employment_status, employment_type, is_ofw, is_4ps_beneficiary, education, skills, work_experience,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          applicant.email,
          '$2a$10$samplehashfortesting', // dummy bcrypt hash
          0,
          'jobseeker',
          applicant.surname,
          applicant.firstName,
          applicant.middleName || null,
          applicant.dateOfBirth,
          applicant.sex,
          applicant.religion,
          applicant.civilStatus,
          applicant.height,
          applicant.contactNumber,
          applicant.barangay,
          'General Santos City',
          'South Cotabato',
          applicant.employmentStatus,
          applicant.employmentType,
          applicant.isOfw ? 1 : 0,
          applicant.is4psBeneficiary ? 1 : 0,
          JSON.stringify(applicant.education),
          JSON.stringify(applicant.skills),
          JSON.stringify(applicant.workExperience || []),
          now,
          now
        ]
      });

      console.log(`✓ Added: ${fullName} (${applicant.barangay})`);
      successCount++;

      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));

    } catch (error: any) {
      console.error(`✗ Failed to add ${applicant.firstName} ${applicant.surname}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Successfully added: ${successCount} applicants`);
  console.log(`   Failed: ${errorCount} applicants`);
  console.log(`\n📊 Summary by Location:`);
  
  const locationCounts: Record<string, number> = {};
  sampleApplicants.forEach(app => {
    locationCounts[app.barangay] = (locationCounts[app.barangay] || 0) + 1;
  });
  
  Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([barangay, count]) => {
      console.log(`   ${barangay}: ${count} applicant${count > 1 ? 's' : ''}`);
    });
}

seedApplicants()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  });
