/**
 * AI-Powered Job Matching System
 * Automatically filters and ranks applicants based on job requirements
 */

interface Applicant {
  id: string;
  firstName: string;
  surname: string;
  middleName?: string | null;
  email: string;
  contactNumber: string;
  sex: string;
  age?: number;
  dateOfBirth?: string;
  barangay: string;
  municipality: string;
  province: string;
  educationalAttainment: string;
  course?: string | null;
  otherSkillsTraining?: string | null;
  preferredOccupation?: string | null;
  employmentStatus: string;
  employmentType?: string | null;
  isOfw: number;
  disability?: string | null;
  activelyLookingForWork: number;
  willingToWorkImmediately: number;
  whenCanStart?: string | null;
  expectedSalary?: number | null;
  salaryPeriod?: string | null;
  preferredWorkLocation?: string | null;
  civilStatus?: string;
}

interface JobPosting {
  id: string;
  title: string;
  description?: string | null;
  requirements?: string | null;
  skills?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: string | null;
  employmentType?: string | null;
  educationLevel?: string | null;
  experienceRequired?: string | null;
  industry?: string | null;
  numberOfPositions?: number | null;
}

interface MatchScore {
  applicantId: string;
  applicantName: string;
  score: number;
  percentage: number;
  breakdown: {
    skillsMatch: number;
    educationMatch: number;
    locationMatch: number;
    salaryMatch: number;
    availabilityMatch: number;
    experienceMatch: number;
    demographicMatch: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Suitable';
}

export class AIJobMatcher {
  /**
   * Main matching function - returns ranked list of suitable applicants
   */
  public matchApplicantsToJob(
    applicants: Applicant[],
    job: JobPosting,
    options: { minScore?: number; maxResults?: number } = {}
  ): MatchScore[] {
    const { minScore = 50, maxResults = Infinity } = options; // No limit - show all qualified

    const scores = applicants
      .map(applicant => this.calculateMatchScore(applicant, job))
      .filter(score => score.percentage >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults === Infinity ? applicants.length : maxResults);

    return scores;
  }

  /**
   * Calculate comprehensive match score for an applicant
   */
  private calculateMatchScore(applicant: Applicant, job: JobPosting): MatchScore {
    const breakdown = {
      skillsMatch: this.calculateSkillsMatch(applicant, job),
      educationMatch: this.calculateEducationMatch(applicant, job),
      locationMatch: this.calculateLocationMatch(applicant, job),
      salaryMatch: this.calculateSalaryMatch(applicant, job),
      availabilityMatch: this.calculateAvailabilityMatch(applicant, job),
      experienceMatch: this.calculateExperienceMatch(applicant, job),
      demographicMatch: this.calculateDemographicMatch(applicant, job),
    };

    // Weighted scoring system (total = 100)
    const weights = {
      skillsMatch: 30,        // Skills are most important
      educationMatch: 20,     // Education requirement
      locationMatch: 15,      // Location preference
      salaryMatch: 10,        // Salary expectations
      availabilityMatch: 10,  // Availability to start
      experienceMatch: 10,    // Experience level
      demographicMatch: 5,    // Other factors
    };

    const score = Object.entries(breakdown).reduce(
      (total, [key, value]) => total + value * weights[key as keyof typeof weights],
      0
    );

    const { matchedSkills, missingSkills } = this.analyzeSkills(applicant, job);
    const strengths = this.identifyStrengths(applicant, job, breakdown);
    const concerns = this.identifyConcerns(applicant, job, breakdown);
    const recommendation = this.determineRecommendation(score);

    return {
      applicantId: applicant.id,
      applicantName: `${applicant.firstName} ${applicant.surname}`,
      score,
      percentage: Math.round(score),
      breakdown,
      matchedSkills,
      missingSkills,
      strengths,
      concerns,
      recommendation,
    };
  }

  /**
   * Skills matching with NLP-like keyword extraction
   */
  private calculateSkillsMatch(applicant: Applicant, job: JobPosting): number {
    const jobSkills = this.extractSkills(job.skills, job.requirements, job.description);
    const applicantSkills = this.extractSkills(
      applicant.otherSkillsTraining,
      applicant.preferredOccupation,
      applicant.course
    );

    if (jobSkills.length === 0) return 1; // No specific skills required
    if (applicantSkills.length === 0) return 0.3; // Has no listed skills

    const matchedCount = jobSkills.filter(jobSkill =>
      applicantSkills.some(appSkill => this.skillsAreSimilar(jobSkill, appSkill))
    ).length;

    const matchRatio = matchedCount / jobSkills.length;
    
    // Bonus for having more skills than required
    const bonusRatio = Math.min(applicantSkills.length / jobSkills.length, 1.2);
    
    return Math.min(matchRatio * bonusRatio, 1);
  }

  /**
   * Education level matching
   */
  private calculateEducationMatch(applicant: Applicant, job: JobPosting): number {
    if (!job.educationLevel) return 1; // No education requirement

    const educationHierarchy = [
      'Elementary Undergraduate',
      'Elementary Graduate',
      'High School Undergraduate',
      'High School Graduate',
      'Senior High School Undergraduate',
      'Senior High School Graduate',
      'Vocational Graduate',
      'College Undergraduate',
      'College Graduate',
      'Post Graduate',
    ];

    const requiredLevel = this.findEducationLevel(job.educationLevel, educationHierarchy);
    const applicantLevel = educationHierarchy.indexOf(applicant.educationalAttainment);

    if (applicantLevel === -1) return 0.5; // Unknown education level

    // Perfect match
    if (applicantLevel === requiredLevel) return 1;

    // Overqualified (slight penalty)
    if (applicantLevel > requiredLevel) {
      const difference = applicantLevel - requiredLevel;
      return Math.max(0.8, 1 - difference * 0.05);
    }

    // Underqualified (larger penalty)
    if (applicantLevel < requiredLevel) {
      const difference = requiredLevel - applicantLevel;
      return Math.max(0.2, 1 - difference * 0.15);
    }

    return 0.5;
  }

  /**
   * Location proximity matching
   */
  private calculateLocationMatch(applicant: Applicant, job: JobPosting): number {
    if (!job.location) return 1; // No location requirement

    const jobLocation = job.location.toLowerCase();
    const applicantLocation = `${applicant.barangay} ${applicant.municipality}`.toLowerCase();
    const preferredLocation = (applicant.preferredWorkLocation || '').toLowerCase();

    // Exact match with current location
    if (applicantLocation.includes(jobLocation) || jobLocation.includes(applicant.municipality.toLowerCase())) {
      return 1;
    }

    // Match with preferred work location
    if (preferredLocation.includes(jobLocation) || jobLocation.includes(preferredLocation)) {
      return 0.95;
    }

    // Same province
    if (jobLocation.includes(applicant.province.toLowerCase())) {
      return 0.7;
    }

    // Willing to relocate (check if OFW or has distant preferred location)
    if (applicant.isOfw || preferredLocation.length > 0) {
      return 0.6;
    }

    return 0.4; // Different location, no indication of willingness to relocate
  }

  /**
   * Salary expectation matching
   */
  private calculateSalaryMatch(applicant: Applicant, job: JobPosting): number {
    if (!job.salaryMin && !job.salaryMax) return 1; // No salary info
    if (!applicant.expectedSalary) return 0.8; // No salary expectation

    const jobSalary = job.salaryMax || job.salaryMin || 0;
    const expectedSalary = applicant.expectedSalary;

    // Normalize to monthly if needed
    const normalizedJobSalary = this.normalizeToMonthly(jobSalary, job.salaryPeriod);
    const normalizedExpectedSalary = this.normalizeToMonthly(expectedSalary, applicant.salaryPeriod);

    // Perfect match within 10%
    if (Math.abs(normalizedJobSalary - normalizedExpectedSalary) / normalizedJobSalary <= 0.1) {
      return 1;
    }

    // Job offers more than expected (great for applicant)
    if (normalizedJobSalary >= normalizedExpectedSalary) {
      return 1;
    }

    // Job offers less than expected
    const deficit = (normalizedExpectedSalary - normalizedJobSalary) / normalizedExpectedSalary;
    
    // Up to 20% less is acceptable
    if (deficit <= 0.2) return 0.8;
    if (deficit <= 0.3) return 0.6;
    if (deficit <= 0.4) return 0.4;
    
    return 0.2; // More than 40% less
  }

  /**
   * Availability matching
   */
  private calculateAvailabilityMatch(applicant: Applicant, job: JobPosting): number {
    let score = 0.5; // Base score

    // Actively looking for work
    if (applicant.activelyLookingForWork) score += 0.2;

    // Willing to work immediately
    if (applicant.willingToWorkImmediately) score += 0.2;

    // Employment status
    if (applicant.employmentStatus === 'Unemployed' || applicant.employmentStatus === 'New Entrant') {
      score += 0.1; // More available
    } else if (applicant.employmentStatus === 'Underemployed') {
      score += 0.05; // Looking for better opportunity
    } else if (applicant.employmentStatus === 'Employed') {
      score -= 0.1; // May need notice period
    }

    // When can start
    const canStart = (applicant.whenCanStart || '').toLowerCase();
    if (canStart.includes('immediately')) score += 0.1;
    else if (canStart.includes('1 week')) score += 0.05;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Experience matching
   */
  private calculateExperienceMatch(applicant: Applicant, job: JobPosting): number {
    // Check if job requires experience
    const experienceRequired = (job.experienceRequired || '').toLowerCase();
    const hasExperienceRequirement = 
      experienceRequired.includes('year') || 
      experienceRequired.includes('experience') ||
      experienceRequired.includes('senior') ||
      experienceRequired.includes('junior');

    if (!hasExperienceRequirement) return 1; // No experience requirement

    const isEmployed = applicant.employmentStatus === 'Employed';
    const wasEmployed = applicant.employmentStatus === 'Underemployed' || applicant.employmentStatus === 'Self-Employed';
    const isNewEntrant = applicant.employmentStatus === 'New Entrant';
    const isOFW = applicant.isOfw === 1;

    // Calculate experience score
    if (experienceRequired.includes('entry') || experienceRequired.includes('junior') || experienceRequired.includes('0')) {
      // Entry level position
      if (isNewEntrant) return 1;
      if (wasEmployed || isEmployed || isOFW) return 0.95; // Has experience for entry level
      return 0.7;
    } else if (experienceRequired.includes('senior') || experienceRequired.includes('3') || experienceRequired.includes('5')) {
      // Senior position
      if (isEmployed || isOFW) return 0.9;
      if (wasEmployed) return 0.7;
      if (isNewEntrant) return 0.2; // Likely not suitable
      return 0.5;
    } else {
      // General experience required
      if (isEmployed || isOFW) return 0.85;
      if (wasEmployed) return 0.75;
      if (isNewEntrant) return 0.4;
      return 0.6;
    }
  }

  /**
   * Demographic and other factors
   */
  private calculateDemographicMatch(applicant: Applicant, job: JobPosting): number {
    let score = 0.5;

    // Age consideration (assuming from dateOfBirth)
    const age = this.calculateAge(applicant.dateOfBirth);
    if (age >= 18 && age <= 55) score += 0.2; // Prime working age
    else if (age > 55 && age <= 65) score += 0.1; // Senior but able
    else if (age < 18) score -= 0.2; // Underage

    // Disability consideration (should not discriminate, just flag for special accommodations)
    if (applicant.disability && applicant.disability !== 'None') {
      // Check if job mentions accessibility or can accommodate
      score += 0.1; // Neutral, but flag for employer consideration
    }

    // 4Ps beneficiary (priority for government programs)
    // Note: This field is not in the current schema, but can be added

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Helper: Extract skills from text
   */
  private extractSkills(...texts: (string | null | undefined)[]): string[] {
    const allText = texts.filter(Boolean).join(' ').toLowerCase();
    
    const skillKeywords = [
      'computer', 'ms office', 'excel', 'word', 'powerpoint', 'data entry',
      'customer service', 'sales', 'marketing', 'accounting', 'bookkeeping',
      'cashier', 'inventory', 'driving', 'driver', 'welding', 'welder',
      'carpentry', 'carpenter', 'plumbing', 'plumber', 'electrical', 'electrician',
      'mechanic', 'automotive', 'machinery', 'machine operator', 'heavy equipment',
      'cooking', 'chef', 'baking', 'baker', 'waiter', 'waitress', 'bartender',
      'housekeeping', 'janitorial', 'laundry', 'caregiver', 'nursing', 'nurse',
      'teaching', 'teacher', 'tutor', 'childcare', 'security', 'guard',
      'construction', 'masonry', 'painting', 'painter', 'tiling', 'roofing',
      'landscaping', 'gardening', 'farming', 'farmer', 'fishing', 'fisherman',
      'aquaculture', 'agriculture', 'retail', 'merchandising', 'warehouse',
      'logistics', 'delivery', 'courier', 'messenger', 'transportation',
      'photography', 'videography', 'graphic design', 'web design', 'programming',
      'it support', 'network', 'database', 'social media', 'content writing',
      'copywriting', 'editing', 'translation', 'beauty', 'hairdressing',
      'makeup', 'massage', 'tailoring', 'sewing', 'crafts', 'call center',
      'telemarketing', 'technical support', 'receptionist', 'secretary',
      'administrative', 'filing', 'documentation', 'communication',
    ];

    return skillKeywords.filter(skill => allText.includes(skill));
  }

  /**
   * Helper: Check if skills are similar
   */
  private skillsAreSimilar(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Similar words
    const synonyms: Record<string, string[]> = {
      'driver': ['driving', 'chauffeur'],
      'welder': ['welding'],
      'carpenter': ['carpentry'],
      'electrician': ['electrical'],
      'mechanic': ['automotive', 'technician'],
      'cook': ['cooking', 'chef', 'culinary'],
      'waiter': ['waitress', 'server'],
      'nurse': ['nursing', 'caregiver'],
      'teacher': ['teaching', 'tutor', 'instructor'],
      'guard': ['security'],
      'farmer': ['farming', 'agriculture'],
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((s1.includes(key) || values.some(v => s1.includes(v))) &&
          (s2.includes(key) || values.some(v => s2.includes(v)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper: Analyze matched and missing skills
   */
  private analyzeSkills(applicant: Applicant, job: JobPosting): { matchedSkills: string[]; missingSkills: string[] } {
    const jobSkills = this.extractSkills(job.skills, job.requirements, job.description);
    const applicantSkills = this.extractSkills(
      applicant.otherSkillsTraining,
      applicant.preferredOccupation,
      applicant.course
    );

    const matchedSkills = jobSkills.filter(jobSkill =>
      applicantSkills.some(appSkill => this.skillsAreSimilar(jobSkill, appSkill))
    );

    const missingSkills = jobSkills.filter(jobSkill =>
      !applicantSkills.some(appSkill => this.skillsAreSimilar(jobSkill, appSkill))
    );

    return { matchedSkills, missingSkills };
  }

  /**
   * Helper: Identify strengths
   */
  private identifyStrengths(applicant: Applicant, job: JobPosting, breakdown: MatchScore['breakdown']): string[] {
    const strengths: string[] = [];

    if (breakdown.skillsMatch >= 0.8) strengths.push('Strong skills match');
    if (breakdown.educationMatch >= 0.9) strengths.push('Meets education requirements');
    if (breakdown.locationMatch >= 0.9) strengths.push('Lives nearby');
    if (breakdown.salaryMatch >= 0.9) strengths.push('Salary expectations align');
    if (breakdown.availabilityMatch >= 0.8) strengths.push('Available immediately');
    if (breakdown.experienceMatch >= 0.8) strengths.push('Has relevant experience');
    
    if (applicant.activelyLookingForWork) strengths.push('Actively job seeking');
    if (applicant.isOfw) strengths.push('International work experience');
    if (applicant.employmentStatus === 'Employed') strengths.push('Currently employed');

    return strengths;
  }

  /**
   * Helper: Identify concerns
   */
  private identifyConcerns(applicant: Applicant, job: JobPosting, breakdown: MatchScore['breakdown']): string[] {
    const concerns: string[] = [];

    if (breakdown.skillsMatch < 0.5) concerns.push('Limited matching skills');
    if (breakdown.educationMatch < 0.5) concerns.push('May not meet education requirements');
    if (breakdown.locationMatch < 0.5) concerns.push('Distance from workplace');
    if (breakdown.salaryMatch < 0.5) concerns.push('Salary expectations may be too high');
    if (breakdown.availabilityMatch < 0.5) concerns.push('May not be immediately available');
    if (breakdown.experienceMatch < 0.5) concerns.push('Limited relevant experience');

    if (applicant.disability && applicant.disability !== 'None') {
      concerns.push(`May require accommodations for ${applicant.disability.toLowerCase()}`);
    }

    if (!applicant.activelyLookingForWork) concerns.push('Not actively looking for work');

    return concerns;
  }

  /**
   * Helper: Determine recommendation level
   */
  private determineRecommendation(score: number): MatchScore['recommendation'] {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 65) return 'Recommended';
    if (score >= 50) return 'Consider';
    return 'Not Suitable';
  }

  /**
   * Helper: Find education level in hierarchy
   */
  private findEducationLevel(text: string, hierarchy: string[]): number {
    const normalized = text.toLowerCase();
    
    for (let i = 0; i < hierarchy.length; i++) {
      if (normalized.includes(hierarchy[i].toLowerCase())) {
        return i;
      }
    }

    // Fallback matching
    if (normalized.includes('college') || normalized.includes('bachelor') || normalized.includes('degree')) {
      return hierarchy.indexOf('College Graduate');
    }
    if (normalized.includes('high school') || normalized.includes('senior high')) {
      return hierarchy.indexOf('Senior High School Graduate');
    }
    if (normalized.includes('vocational') || normalized.includes('tesda')) {
      return hierarchy.indexOf('Vocational Graduate');
    }

    return -1;
  }

  /**
   * Helper: Normalize salary to monthly
   */
  private normalizeToMonthly(salary: number, period?: string | null): number {
    if (!period) return salary;
    
    const normalized = period.toLowerCase();
    
    if (normalized.includes('day') || normalized.includes('daily')) {
      return salary * 26; // Assume 26 working days per month
    }
    if (normalized.includes('hour')) {
      return salary * 8 * 26; // 8 hours/day, 26 days/month
    }
    if (normalized.includes('week')) {
      return salary * 4;
    }
    if (normalized.includes('year') || normalized.includes('annual')) {
      return salary / 12;
    }
    
    return salary; // Assume monthly
  }

  /**
   * Helper: Calculate age from date of birth
   */
  private calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 30; // Default age if unknown
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Export singleton instance
export const aiJobMatcher = new AIJobMatcher();
