/**
 * AI-Powered Job Matching System with Groq LLM
 * Uses llama3-70b-8192 for unbiased, intelligent candidate matching
 * Trained to be 100% objective and fair in evaluating candidates
 */

import Groq from 'groq-sdk';

// Initialize Groq client with API key from environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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
  
  // NSRP fields (JSON arrays)
  education?: any[] | string | null;
  technicalTraining?: any[] | string | null;
  workExperience?: any[] | string | null;
  otherSkills?: any[] | string | null;
  otherSkillsSpecify?: string | null;
  preferredOccupations?: any[] | string | null;
  professionalLicenses?: any[] | string | null;
  
  // Legacy fields (backward compatibility)
  educationalAttainment?: string;
  course?: string | null;
  otherSkillsTraining?: string | null;
  preferredOccupation?: string | null;
  
  employmentStatus: string;
  employmentType?: string | null;
  isOfw?: number | boolean;
  disability?: string | null;
  activelyLookingForWork?: number | boolean;
  willingToWorkImmediately?: number | boolean;
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
  
  // AI-generated insights
  aiComment?: string;           // Personalized explanation of why they're qualified
  whyQualified?: string;        // Specific reasons for qualification
  hiringRecommendation?: string; // Actionable advice for employer
  potentialRole?: string;       // Suggested position/role fit
  developmentAreas?: string[];  // Areas where candidate can improve
}

export class AIJobMatcher {
  /**
   * Main matching function - Hybrid approach for speed + intelligence
   * 1. Fast pre-filter with rule-based scoring
   * 2. AI evaluation for top candidates only
   */
  public async matchApplicantsToJob(
    applicants: Applicant[],
    job: JobPosting,
    options: { minScore?: number; maxResults?: number; useAI?: boolean } = {}
  ): Promise<MatchScore[]> {
    const { minScore = 50, maxResults = Infinity, useAI = true } = options;

    if (applicants.length === 0) return [];

    try {
      console.log(`[AI Matcher] Processing ${applicants.length} applicants for "${job.title}"`);
      
      // PHASE 1: Fast rule-based pre-filtering (instant)
      console.log(`[AI Matcher] Phase 1: Rule-based pre-filtering...`);
      const quickScores = applicants
        .map(applicant => this.calculateMatchScore(applicant, job))
        .filter(score => score.percentage >= minScore - 20) // More lenient threshold for pre-filter
        .sort((a, b) => b.score - a.score);

      console.log(`[AI Matcher] Pre-filter found ${quickScores.length} potential matches`);

      // If no AI or very few candidates, return rule-based scores
      if (!useAI || applicants.length <= 10) {
        console.log(`[AI Matcher] Using rule-based scores only`);
        return quickScores
          .filter(score => score.percentage >= minScore)
          .slice(0, maxResults === Infinity ? quickScores.length : maxResults);
      }

      // PHASE 2: AI evaluation for top candidates only (smart but focused)
      const topCandidates = quickScores.slice(0, Math.min(15, quickScores.length)); // Max 15 for AI
      console.log(`[AI Matcher] Phase 2: AI evaluation for top ${topCandidates.length} candidates...`);
      
      const aiScores = await this.groqBatchMatch(
        topCandidates.map(s => applicants.find(a => a.id === s.applicantId)!).filter(Boolean),
        job
      );

      // Merge: AI scores for top candidates + rule-based for the rest
      const restScores = quickScores.slice(topCandidates.length);
      const finalScores = [...aiScores, ...restScores]
        .filter(score => score.percentage >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults === Infinity ? applicants.length : maxResults);

      console.log(`[AI Matcher] ✓ Complete: ${finalScores.length} qualified matches`);
      return finalScores;
      
    } catch (error) {
      console.error('[AI Matcher] Error, using fallback:', error);
      // Fallback to pure rule-based
      const scores = applicants
        .map(applicant => this.calculateMatchScore(applicant, job))
        .filter(score => score.percentage >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults === Infinity ? applicants.length : maxResults);

      return scores;
    }
  }

  /**
   * Groq AI-powered batch matching - processes multiple applicants intelligently
   * Optimized for speed with parallel processing
   */
  private async groqBatchMatch(applicants: Applicant[], job: JobPosting): Promise<MatchScore[]> {
    const results: MatchScore[] = [];
    
    // Process in parallel batches for speed (3 at a time)
    const batchSize = 3;
    for (let i = 0; i < applicants.length; i += batchSize) {
      const batch = applicants.slice(i, i + batchSize);
      console.log(`[AI Matcher] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(applicants.length/batchSize)}...`);
      
      const batchResults = await Promise.all(
        batch.map(applicant => this.groqMatchApplicant(applicant, job))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Use Groq AI to intelligently match a single applicant to a job
   */
  private async groqMatchApplicant(applicant: Applicant, job: JobPosting): Promise<MatchScore> {
    try {
      const prompt = this.buildGroqPrompt(applicant, job);
      
      console.log(`[Groq] Matching applicant ${applicant.firstName} ${applicant.surname} to ${job.title}...`);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruitment AI specialized in INTELLIGENT, context-aware job-candidate matching. Your task is to evaluate candidates based on whether they have RELEVANT SKILLS and QUALIFICATIONS, including related/transferable skills.

⚠️ CRITICAL RULES FOR SMART MATCHING:

1. **UNDERSTAND JOB-SPECIFIC SKILLS:**
   - "Graphic Designer" needs: Adobe Photoshop, Illustrator, InDesign, Canva, CorelDraw, visual design, layout, creative software
   - "Web Developer" needs: HTML, CSS, JavaScript, programming, coding, web design
   - "Chef" needs: cooking, culinary arts, food preparation, kitchen management
   - "Driver" needs: driving license, navigation, vehicle operation, delivery experience
   - "Administrative Assistant" needs: MS Office, Word, Excel, filing, documentation, clerical work

2. **RECOGNIZE RELATED & TRANSFERABLE SKILLS:**
   - Adobe Photoshop/Illustrator/InDesign = relevant for Graphic Design jobs
   - MS Office (Word/Excel/PowerPoint) = relevant for Admin/Office jobs
   - Computer literacy = relevant for IT Support, Data Entry, Office work
   - Customer service experience = relevant for Receptionist, Sales, Call Center
   - Cooking/Baking = relevant for Chef, Kitchen Staff, Food Service

3. **BE STRICT WITH UNRELATED SKILLS:**
   - Sewing/Tailoring skills → NOT relevant for IT/Graphic Design (score 0-20%)
   - Teaching experience → NOT relevant for Driver/Mechanic jobs (score 0-20%)
   - Cooking skills → NOT relevant for Programming jobs (score 0-20%)
   - Generic skills alone (communication, teamwork) → NOT sufficient for technical roles (score 0-30%)

4. **SCORING RULES (BE FAIR BUT STRICT):**
   - **80-100%**: Has DIRECT matching skills (e.g., Photoshop for Graphic Designer) + relevant experience + education
   - **60-79%**: Has RELATED skills (e.g., CorelDraw for Graphic Designer) or some matching skills with minor gaps
   - **40-59%**: Has TRANSFERABLE skills (e.g., general computer skills for IT) but needs training
   - **20-39%**: Has FEW relevant skills, mostly unqualified, wrong background
   - **0-19%**: Has NO relevant skills - completely wrong profession/skillset

5. **EXAMPLES OF CORRECT SCORING:**
   ✅ GOOD MATCH (80%+):
   - Job: Graphic Designer → Candidate: Adobe Photoshop, Illustrator, visual design experience
   - Job: Web Developer → Candidate: HTML, CSS, JavaScript, programming courses
   - Job: Chef → Candidate: Culinary school, cooking experience, food preparation
   
   ⚠️ MODERATE MATCH (50-70%):
   - Job: Graphic Designer → Candidate: Canva, basic design, willing to learn Adobe
   - Job: IT Support → Candidate: Computer literacy, MS Office, technical interest
   
   ❌ BAD MATCH (0-30%):
   - Job: Graphic Designer → Candidate: Sewing, baking, no design software
   - Job: Web Developer → Candidate: Teaching, sales, no programming experience
   - Job: Driver → Candidate: Graphic design, office work, no driving license

6. **NON-DISCRIMINATION:**
   - DO NOT discriminate based on: age, gender, disability, civil status, ethnicity
   - DO evaluate: actual job-specific skills, relevant experience, trainability
   - Consider reasonable accommodations for disabilities

BE INTELLIGENT: Look for RELEVANT and RELATED skills. If candidate has Adobe software skills, they CAN do graphic design. If they only have sewing skills, they CANNOT. Match based on actual job requirements!`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile', // Latest Llama 3.3 70B model for best job matching
        temperature: 0.3, // Low temperature for consistent, objective results
        max_tokens: 1500,
        top_p: 0.9,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq AI');
      }

      console.log(`[Groq] Raw response for ${applicant.firstName}:`, response.substring(0, 200));

      // Parse the AI response into structured data
      const result = this.parseGroqResponse(response, applicant, job);
      console.log(`[Groq] ✓ Matched ${applicant.firstName}: ${result.percentage}% (${result.recommendation})`);
      return result;
      
    } catch (error) {
      console.error(`[Groq] ✗ AI error for ${applicant.firstName} ${applicant.surname}:`, error instanceof Error ? error.message : error);
      // Fallback to rule-based matching for this applicant
      const fallbackResult = this.calculateMatchScore(applicant, job);
      console.log(`[Groq] Using fallback score for ${applicant.firstName}: ${fallbackResult.percentage}%`);
      return fallbackResult;
    }
  }

  /**
   * Build comprehensive prompt for Groq AI
   */
  private buildGroqPrompt(applicant: Applicant, job: JobPosting): string {
    const salaryRange = job.salaryMin || job.salaryMax 
      ? `₱${job.salaryMin?.toLocaleString() || 'N/A'} - ₱${job.salaryMax?.toLocaleString() || 'N/A'} ${job.salaryPeriod || 'per month'}`
      : 'Not specified';
    
    return `Evaluate this candidate for the job position and provide a detailed, unbiased assessment.

JOB POSITION:
Title: ${job.title}
Description: ${job.description || 'Not specified'}
Requirements: ${job.requirements || 'Not specified'}
Required Skills: ${job.skills || 'Not specified'}
Education Level: ${job.educationLevel || 'Not specified'}
Experience Required: ${job.experienceRequired || 'Not specified'}
Location: ${job.location || 'Not specified'}
Salary Range: ${salaryRange}
Employment Type: ${job.employmentType || 'Not specified'}
Industry: ${job.industry || 'Not specified'}
Number of Positions: ${job.numberOfPositions || 1}

CANDIDATE PROFILE:
Name: ${applicant.firstName} ${applicant.surname}
Education: ${this.formatEducation(applicant)}
Skills & Training: ${this.formatSkills(applicant)}
Work Experience: ${this.formatWorkExperience(applicant)}
Preferred Occupation: ${this.formatPreferredOccupations(applicant)}
Current Employment Status: ${applicant.employmentStatus}
Employment Type Seeking: ${applicant.employmentType || 'Any'}
Location: ${applicant.barangay}, ${applicant.municipality}, ${applicant.province}
Preferred Work Location: ${applicant.preferredWorkLocation || 'Not specified'}
Expected Salary: ${applicant.expectedSalary ? `₱${applicant.expectedSalary} ${applicant.salaryPeriod || 'per month'}` : 'Not specified'}
Actively Looking: ${applicant.activelyLookingForWork ? 'Yes' : 'No'}
Available Immediately: ${applicant.willingToWorkImmediately ? 'Yes' : 'No'}
Can Start: ${applicant.whenCanStart || 'Not specified'}
Has Disability: ${applicant.disability && applicant.disability !== 'None' ? applicant.disability : 'No'}
Is OFW/Has International Experience: ${applicant.isOfw ? 'Yes' : 'No'}

EVALUATION TASK:
Provide a JSON response with the following structure (must be valid JSON). Be generous with scoring - if a candidate has any relevant skills or shows potential, give them credit. Most candidates should score above 50 if they have basic qualifications.

{
  "overallScore": <number 0-100>,
  "breakdown": {
    "skillsMatch": <decimal 0-1>,
    "educationMatch": <decimal 0-1>,
    "locationMatch": <decimal 0-1>,
    "salaryMatch": <decimal 0-1>,
    "availabilityMatch": <decimal 0-1>,
    "experienceMatch": <decimal 0-1>,
    "demographicMatch": <decimal 0-1>
  },
  "matchedSkills": [<list of matching skills>],
  "missingSkills": [<list of required but missing skills>],
  "strengths": [<list of candidate strengths for this role, 3-5 items>],
  "concerns": [<list of potential concerns, 1-3 items or empty array>],
  "recommendation": "<Highly Recommended|Recommended|Consider|Not Suitable>",
  "reasoning": "<brief explanation of the score and recommendation>",
  
  "aiComment": "<2-3 sentences explaining why this candidate is a good/poor fit for this specific role. Be specific and professional.>",
  "whyQualified": "<Concise explanation of their key qualifications: education, experience, skills that match the job.>",
  "hiringRecommendation": "<Actionable advice for the employer: interview questions to ask, trial period suggestions, or training needs.>",
  "potentialRole": "<If not perfect for this role, suggest alternative positions they'd excel at within the company.>",
  "developmentAreas": [<1-3 specific skills or areas where candidate could improve to be even better for this role>]
}

SCORING CRITERIA (Be generous and realistic):
- skillsMatch: How well candidate's skills align with job requirements (0-1). Give 0.7+ if they have related skills even if not exact matches.
- educationMatch: Education level meets requirements (0-1). Give 0.8+ if they meet minimum or have relevant training.
- locationMatch: Geographic feasibility (0-1). Give 0.8+ if they're in the same city/province.
- salaryMatch: Salary expectations alignment (0-1). Give 0.8+ if expectations are reasonable or not specified.
- availabilityMatch: Immediate availability and willingness (0-1). Give 0.8+ if actively looking.
- experienceMatch: Relevant work experience (0-1). Give 0.6+ if they have some related experience or are willing to learn.
- demographicMatch: Other factors like legal working age, only factual considerations (0-1). Default to 1.0 unless there's a specific legal barrier.

IMPORTANT SCORING GUIDELINES:
- Most qualified candidates should score 60-80 range
- Only reject (below 50) if truly unsuitable
- Be objective and fair, but not overly harsh
- Focus on potential and trainability, not just perfect matches
- Consider that many jobs can train on specific skills
- Do not discriminate based on protected characteristics
- Return ONLY valid JSON, no additional text or markdown`;
  }

  /**
   * Parse Groq AI response into MatchScore structure
   */
  private parseGroqResponse(response: string, applicant: Applicant, job: JobPosting): MatchScore {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      const parsed = JSON.parse(jsonStr);

      return {
        applicantId: applicant.id,
        applicantName: `${applicant.firstName} ${applicant.surname}`,
        score: parsed.overallScore,
        percentage: Math.round(parsed.overallScore),
        breakdown: {
          skillsMatch: parsed.breakdown.skillsMatch,
          educationMatch: parsed.breakdown.educationMatch,
          locationMatch: parsed.breakdown.locationMatch,
          salaryMatch: parsed.breakdown.salaryMatch,
          availabilityMatch: parsed.breakdown.availabilityMatch,
          experienceMatch: parsed.breakdown.experienceMatch,
          demographicMatch: parsed.breakdown.demographicMatch,
        },
        matchedSkills: parsed.matchedSkills || [],
        missingSkills: parsed.missingSkills || [],
        strengths: parsed.strengths || [],
        concerns: parsed.concerns || [],
        recommendation: parsed.recommendation as MatchScore['recommendation'],
        
        // AI-generated insights
        aiComment: parsed.aiComment || this.generateFallbackComment(parsed, applicant, job),
        whyQualified: parsed.whyQualified || this.generateWhyQualified(parsed, applicant, job),
        hiringRecommendation: parsed.hiringRecommendation || this.generateHiringRecommendation(parsed, applicant, job),
        potentialRole: parsed.potentialRole || job.title,
        developmentAreas: parsed.developmentAreas || [],
      };
    } catch (error) {
      console.error('Failed to parse Groq response:', error);
      console.error('Response was:', response);
      // Fallback to rule-based scoring
      return this.calculateMatchScore(applicant, job);
    }
  }

  /**
   * Generate fallback AI comment if not provided
   */
  private generateFallbackComment(parsed: any, applicant: Applicant, job: JobPosting): string {
    const score = parsed.overallScore || 50;
    const name = applicant.firstName;
    
    if (score >= 80) {
      return `${name} is an excellent match for this ${job.title} position. Their qualifications align well with the job requirements, and they demonstrate strong potential for success in this role.`;
    } else if (score >= 65) {
      return `${name} is a good candidate for this ${job.title} position. They possess relevant skills and experience that would benefit the role, with some areas for development.`;
    } else if (score >= 50) {
      return `${name} shows potential for this ${job.title} position. While they may need some training, they have foundational skills that could be developed for success in this role.`;
    } else {
      return `${name} may not be the best fit for this specific ${job.title} position at this time. Consider other roles that better match their current skill set.`;
    }
  }

  /**
   * Generate why qualified explanation if not provided
   */
  private generateWhyQualified(parsed: any, applicant: Applicant, job: JobPosting): string {
    const parts: string[] = [];
    
    if (parsed.breakdown?.educationMatch >= 0.7) {
      parts.push(`Meets education requirements (${applicant.educationalAttainment})`);
    }
    if (parsed.matchedSkills?.length > 0) {
      parts.push(`Has ${parsed.matchedSkills.length} matching skill(s)`);
    }
    if (parsed.breakdown?.locationMatch >= 0.8) {
      parts.push(`Lives in convenient location`);
    }
    if (applicant.activelyLookingForWork) {
      parts.push(`Actively seeking employment`);
    }
    
    return parts.length > 0 
      ? parts.join(', ') + '.'
      : `Candidate demonstrates basic qualifications for the ${job.title} role.`;
  }

  /**
   * Generate hiring recommendation if not provided
   */
  private generateHiringRecommendation(parsed: any, applicant: Applicant, job: JobPosting): string {
    const score = parsed.overallScore || 50;
    
    if (score >= 80) {
      return `Schedule an interview immediately to assess cultural fit and discuss start date. This candidate is likely to receive multiple offers.`;
    } else if (score >= 65) {
      return `Conduct a phone screening to verify skills and availability. Consider a practical assessment to evaluate hands-on capabilities.`;
    } else if (score >= 50) {
      return `If hiring, plan for a training period to develop specific skills. Consider mentorship or on-the-job training programs.`;
    } else {
      return `This candidate may be better suited for entry-level or alternative positions. Provide feedback and encourage skill development.`;
    }
  }

  /**
   * Suggest alternative role if not perfect fit
   */
  private suggestAlternativeRole(parsed: any, applicant: Applicant, job: JobPosting): string {
    const score = parsed.overallScore || 50;
    
    if (score >= 70) {
      return job.title; // Perfect for this role
    }
    
    // Suggest alternative based on skills
    const skills = applicant.otherSkillsTraining?.toLowerCase() || '';
    const course = applicant.course?.toLowerCase() || '';
    const preferredJob = applicant.preferredOccupation?.toLowerCase() || '';
    
    if (skills.includes('computer') || skills.includes('it') || course.includes('computer')) {
      return 'IT Support / Data Entry / Administrative Assistant';
    } else if (skills.includes('customer') || skills.includes('sales')) {
      return 'Customer Service Representative / Sales Associate';
    } else if (skills.includes('cook') || skills.includes('food')) {
      return 'Kitchen Staff / Food Service Worker';
    } else if (skills.includes('driver') || skills.includes('driving')) {
      return 'Delivery Driver / Company Driver';
    } else if (preferredJob) {
      return preferredJob;
    }
    
    return 'Entry-level position with training opportunities';
  }

  /**
   * Identify specific development areas
   */
  private identifyDevelopmentAreas(parsed: any, applicant: Applicant, job: JobPosting): string[] {
    const areas: string[] = [];
    const breakdown = parsed.breakdown || {};
    
    if (breakdown.skillsMatch < 0.6) {
      areas.push(`Develop skills in: ${job.skills || 'job-specific requirements'}`);
    }
    if (breakdown.educationMatch < 0.6 && job.educationLevel) {
      areas.push(`Consider pursuing ${job.educationLevel} or relevant certifications`);
    }
    if (breakdown.experienceMatch < 0.6) {
      areas.push(`Gain practical experience through internships or volunteer work`);
    }
    if (parsed.missingSkills && parsed.missingSkills.length > 0) {
      areas.push(`Learn: ${parsed.missingSkills.slice(0, 3).join(', ')}`);
    }
    if (areas.length === 0) {
      areas.push('Continue professional development to stay competitive');
    }
    
    return areas.slice(0, 3); // Max 3 development areas
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
    // CRITICAL: Skills matching is now 50% of total score - MUST have relevant skills!
    const weights = {
      skillsMatch: 50,        // Skills are MOST important - 50% of total
      educationMatch: 15,     // Education requirement
      experienceMatch: 15,    // Experience level  
      locationMatch: 10,      // Location preference
      availabilityMatch: 5,   // Availability to start
      salaryMatch: 3,         // Salary expectations
      demographicMatch: 2,    // Other factors
    };

    const score = Object.entries(breakdown).reduce(
      (total, [key, value]) => total + value * weights[key as keyof typeof weights],
      0
    );

    const { matchedSkills, missingSkills } = this.analyzeSkills(applicant, job);
    const strengths = this.identifyStrengths(applicant, job, breakdown);
    const concerns = this.identifyConcerns(applicant, job, breakdown);
    const recommendation = this.determineRecommendation(score);

    // Generate AI-style comments even for rule-based scoring
    const parsedData = { overallScore: score, breakdown, matchedSkills, missingSkills, strengths, concerns, recommendation };

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
      
      // Add AI-style insights to rule-based matches too
      aiComment: this.generateFallbackComment(parsedData, applicant, job),
      whyQualified: this.generateWhyQualified(parsedData, applicant, job),
      hiringRecommendation: this.generateHiringRecommendation(parsedData, applicant, job),
      potentialRole: this.suggestAlternativeRole(parsedData, applicant, job),
      developmentAreas: this.identifyDevelopmentAreas(parsedData, applicant, job),
    };
  }

  /**
   * Skills matching with NLP-like keyword extraction
   * CRITICAL: Must match job-specific skills, not just generic keywords
   */
  private calculateSkillsMatch(applicant: Applicant, job: JobPosting): number {
    const jobSkills = this.extractSkills(job.skills, job.requirements, job.description, job.title);
    
    // USE NSRP FIELDS NOW!
    const applicantSkills = this.extractSkills(
      this.formatSkills(applicant),
      this.formatPreferredOccupations(applicant),
      this.formatWorkExperience(applicant),
      this.formatEducation(applicant)
    );

    if (jobSkills.length === 0) return 0.7; // No specific skills listed - moderate score
    if (applicantSkills.length === 0) return 0.1; // Has NO listed skills - very low score

    const matchedCount = jobSkills.filter(jobSkill =>
      applicantSkills.some(appSkill => this.skillsAreSimilar(jobSkill, appSkill))
    ).length;

    const matchRatio = matchedCount / jobSkills.length;
    
    // CRITICAL: If NO skills match, score should be very low (0-20%)
    if (matchedCount === 0) {
      return 0.1; // 10% - basically unqualified
    }
    
    // If only partial match, penalize heavily
    if (matchRatio < 0.5) {
      return matchRatio * 0.4; // Max 20% if less than half skills match
    }
    
    // Good match - scale normally
    return matchRatio;
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
    const applicantLevel = educationHierarchy.indexOf(applicant.educationalAttainment || '');

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
   * Helper: Extract skills from text with intelligent job title parsing
   * CRITICAL: Extract actual job-specific skills AND related technologies
   */
  private extractSkills(...texts: (string | null | undefined)[]): string[] {
    const allText = texts.filter(Boolean).join(' ').toLowerCase();
    
    // Comprehensive skill database with related technologies
    const skillKeywords = [
      // Computer/IT/Design - EXPANDED with specific software
      'graphic design', 'graphic designer', 'graphics', 'visual design', 'layout design',
      'adobe photoshop', 'photoshop', 'adobe illustrator', 'illustrator', 
      'adobe indesign', 'indesign', 'coreldraw', 'canva', 'figma', 'sketch',
      'design software', 'creative suite', 'adobe creative',
      'computer', 'computer literacy', 'ms office', 'microsoft office',
      'excel', 'word', 'powerpoint', 'data entry', 'typing',
      
      // PROGRAMMING & DEVELOPMENT - with all common variations
      'programming', 'coding', 'coder', 'developer', 'software development', 'software engineer',
      'web design', 'web development', 'web developer', 'website', 'frontend', 'backend', 'fullstack',
      'html', 'css', 
      'javascript', 'js', 'typescript', 'ts',
      'react', 'react.js', 'reactjs', 'react js',
      'node', 'node.js', 'nodejs', 'node js',
      'python', 'java', 'php', 'c++', 'c#', 'csharp', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'angular', 'vue', 'vue.js', 'vuejs',
      'jquery', 'bootstrap', 'tailwind',
      'sql', 'mysql', 'postgresql', 'mongodb', 'database',
      'git', 'github', 'version control',
      'api', 'rest', 'restful', 'graphql',
      
      'it support', 'technical support', 'helpdesk', 'network', 'database',
      
      // Office/Admin
      'customer service', 'customer support', 'client service',
      'sales', 'marketing', 'accounting', 'bookkeeping',
      'cashier', 'inventory', 'receptionist', 'secretary', 'administrative',
      'filing', 'documentation', 'clerical', 'office work',
      'communication', 'call center', 'telemarketing',
      
      // Trade/Technical
      'driving', 'driver', 'chauffeur', 'delivery driver',
      'welding', 'welder', 'carpentry', 'carpenter', 'woodworking',
      'plumbing', 'plumber', 'electrical', 'electrician', 'wiring',
      'mechanic', 'automotive', 'auto repair', 'technician',
      'machinery', 'machine operator', 'heavy equipment', 'construction',
      'masonry', 'painting', 'painter', 'tiling', 'roofing',
      
      // Service/Hospitality
      'cooking', 'chef', 'culinary', 'food preparation', 'kitchen',
      'baking', 'baker', 'pastry', 'waiter', 'waitress', 'server', 'bartender',
      'housekeeping', 'janitorial', 'cleaning', 'laundry', 
      'caregiver', 'caregiving', 'nursing', 'nurse', 'healthcare',
      'beauty', 'hairdressing', 'makeup', 'massage', 'spa',
      
      // Education/Care
      'teaching', 'teacher', 'tutor', 'instructor', 'educator',
      'childcare', 'daycare',
      
      // Security/Safety
      'security', 'guard', 'watchman', 'safety',
      
      // Agriculture
      'landscaping', 'gardening', 'farming', 'farmer', 'agriculture',
      'fishing', 'fisherman', 'aquaculture',
      
      // Retail/Warehouse
      'retail', 'merchandising', 'warehouse', 'logistics', 'delivery',
      'courier', 'messenger', 'transportation',
      
      // Creative/Media
      'photography', 'photo editing', 'videography', 'video editing',
      'social media', 'content writing', 'copywriting', 'editing', 'translation',
      
      // Manufacturing/Production
      'tailoring', 'sewing', 'seamstress', 'garments', 'quality control',
      'production', 'assembly', 'crafts', 'manufacturing',
    ];

    // Extract skills that appear in the text
    const foundSkills = skillKeywords.filter(skill => allText.includes(skill));
    
    // INTELLIGENT JOB TITLE PARSING - infer required skills from job titles
    const inferredSkills: string[] = [];
    
    // Design-related jobs
    if (allText.match(/graphic\s+design/)) {
      inferredSkills.push('graphic design', 'adobe photoshop', 'illustrator', 'visual design');
    }
    if (allText.match(/web\s+(design|developer)/)) {
      inferredSkills.push('web design', 'web development', 'html', 'css');
    }
    
    // IT/Computer jobs
    if (allText.match(/it\s+support|technical\s+support/)) {
      inferredSkills.push('it support', 'computer', 'technical support');
    }
    if (allText.match(/programmer|developer|coding/)) {
      inferredSkills.push('programming', 'coding', 'software development');
    }
    
    // Office/Admin jobs
    if (allText.match(/admin|secretary|receptionist|clerical/)) {
      inferredSkills.push('administrative', 'ms office', 'filing', 'documentation');
    }
    if (allText.match(/customer\s+service/)) {
      inferredSkills.push('customer service', 'communication');
    }
    
    // Service jobs
    if (allText.match(/chef|cook/)) {
      inferredSkills.push('cooking', 'chef', 'food preparation');
    }
    if (allText.match(/driver/)) {
      inferredSkills.push('driving', 'driver');
    }
    if (allText.match(/nurse|caregiver/)) {
      inferredSkills.push('nursing', 'caregiver', 'healthcare');
    }
    
    // Combine and deduplicate
    // Combine and deduplicate
    const allSkills = foundSkills.concat(inferredSkills);
    return Array.from(new Set(allSkills));
  }

  /**
   * Helper: Check if skills are similar or related
   * SMART MATCHING: Recognizes related skills and technologies (e.g., Photoshop → Graphic Design)
   */
  private skillsAreSimilar(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // One contains the other (for compound skills)
    if (s1.length > 4 && s2.length > 4) {
      if (s1.includes(s2) || s2.includes(s1)) return true;
    }

    // COMPREHENSIVE skill relationship mapping
    // Each group contains skills that are DIRECTLY RELATED to each other
    const skillGroups: Record<string, string[]> = {
      // ═══════════════════════════════════════════════════════════
      // DESIGN & CREATIVE - software tools qualify for design jobs
      // ═══════════════════════════════════════════════════════════
      'graphic design': [
        'graphic designer', 'graphics', 'visual design', 'layout', 'design',
        'adobe photoshop', 'photoshop', 'adobe illustrator', 'illustrator',
        'adobe indesign', 'indesign', 'coreldraw', 'canva', 'figma', 'sketch',
        'design software', 'creative suite', 'adobe creative', 'adobe',
        'photo editing', 'image editing', 'digital design'
      ],
      'web design': [
        'web development', 'web developer', 'website design', 'website',
        'html', 'css', 'javascript', 'frontend', 'ui design', 'ux design'
      ],
      
      // ═══════════════════════════════════════════════════════════
      // COMPUTER & IT - general computer skills qualify for IT jobs
      // ═══════════════════════════════════════════════════════════
      'computer': [
        'computer literacy', 'computer skills', 'pc', 'laptop',
        'ms office', 'microsoft office', 'word', 'excel', 'powerpoint',
        'office software', 'office applications'
      ],
      'it support': [
        'technical support', 'tech support', 'helpdesk', 'it technician',
        'troubleshooting', 'computer repair', 'hardware', 'software support'
      ],
      'programming': [
        'coding', 'coder', 'developer', 'software development', 'software engineer',
        'programmer', 'development', 'software', 'code'
      ],
      'javascript': [
        'js', 'javascript', 'ecmascript', 'es6', 'es2015'
      ],
      'typescript': [
        'ts', 'typescript', 'type script'
      ],
      'python': [
        'python', 'django', 'flask', 'python3', 'py'
      ],
      'java': [
        'java', 'spring', 'spring boot', 'jsp'
      ],
      'react': [
        'react', 'react.js', 'reactjs', 'react js', 'react native'
      ],
      'node': [
        'node', 'node.js', 'nodejs', 'node js', 'express', 'express.js'
      ],
      'web development': [
        'web developer', 'web design', 'website', 'frontend', 'front-end',
        'backend', 'back-end', 'fullstack', 'full-stack', 'full stack',
        'html', 'css', 'responsive design'
      ],
      'data entry': [
        'typing', 'encoder', 'data encoding', 'data processing',
        'transcription', 'keyboard skills'
      ],
      
      // ═══════════════════════════════════════════════════════════
      // OFFICE & ADMINISTRATIVE
      // ═══════════════════════════════════════════════════════════
      'administrative': [
        'admin', 'secretary', 'receptionist', 'clerical', 'office work',
        'filing', 'documentation', 'office assistant', 'admin assistant'
      ],
      'customer service': [
        'customer support', 'customer care', 'client service', 'customer relations',
        'call center', 'helpdesk', 'client support'
      ],
      'sales': [
        'selling', 'salesperson', 'sales associate', 'sales representative',
        'marketing', 'retail sales', 'merchandising'
      ],
      'accounting': [
        'bookkeeping', 'accountant', 'financial', 'payroll', 'accounts'
      ],
      
      // ═══════════════════════════════════════════════════════════
      // TRADES & TECHNICAL
      // ═══════════════════════════════════════════════════════════
      'driver': ['driving', 'chauffeur', 'delivery driver', 'courier', 'operator'],
      'welder': ['welding', 'fabrication', 'metal work'],
      'carpenter': ['carpentry', 'woodworking', 'joinery', 'woodwork'],
      'electrician': ['electrical', 'wiring', 'electrical work', 'electronics'],
      'mechanic': ['automotive', 'auto repair', 'technician', 'mechanical', 'repair'],
      'plumber': ['plumbing', 'pipefitting', 'pipe work'],
      'construction': ['builder', 'masonry', 'building', 'contractor'],
      
      // ═══════════════════════════════════════════════════════════
      // SERVICE & HOSPITALITY
      // ═══════════════════════════════════════════════════════════
      'cook': [
        'cooking', 'chef', 'culinary', 'kitchen', 'food preparation',
        'food service', 'kitchen staff', 'line cook'
      ],
      'baker': ['baking', 'pastry', 'bakery', 'pastry chef'],
      'waiter': ['waitress', 'server', 'waitstaff', 'food server', 'restaurant server'],
      'bartender': ['bar', 'mixology', 'bartending', 'bar staff'],
      'housekeeping': ['cleaning', 'janitorial', 'cleaner', 'housekeeper', 'custodian'],
      
      // ═══════════════════════════════════════════════════════════
      // HEALTHCARE & CARE
      // ═══════════════════════════════════════════════════════════
      'nurse': ['nursing', 'healthcare', 'medical', 'patient care', 'health worker'],
      'caregiver': ['caregiving', 'care', 'elderly care', 'care assistant', 'care worker'],
      
      // ═══════════════════════════════════════════════════════════
      // EDUCATION
      // ═══════════════════════════════════════════════════════════
      'teacher': ['teaching', 'tutor', 'instructor', 'educator', 'education'],
      
      // ═══════════════════════════════════════════════════════════
      // SECURITY
      // ═══════════════════════════════════════════════════════════
      'guard': ['security', 'security guard', 'watchman', 'security officer'],
      
      // ═══════════════════════════════════════════════════════════
      // AGRICULTURE
      // ═══════════════════════════════════════════════════════════
      'farmer': ['farming', 'agriculture', 'agricultural', 'farm worker'],
      
      // ═══════════════════════════════════════════════════════════
      // MANUFACTURING & PRODUCTION
      // ═══════════════════════════════════════════════════════════
      'seamstress': ['sewing', 'tailoring', 'garments', 'tailor', 'dressmaking'],
      'quality control': ['qc', 'inspection', 'testing', 'quality assurance', 'qa'],
    };

    // Check if both skills belong to the same group (= they're related)
    for (const [mainSkill, relatedSkills] of Object.entries(skillGroups)) {
      const allSkillsInGroup = [mainSkill, ...relatedSkills];
      
      const s1Matches = allSkillsInGroup.some(skill => 
        s1.includes(skill) || skill.includes(s1)
      );
      const s2Matches = allSkillsInGroup.some(skill => 
        s2.includes(skill) || skill.includes(s2)
      );
      
      if (s1Matches && s2Matches) {
        return true; // Both skills are in the same group = related!
      }
    }

    return false; // Skills are not related
  }

  /**
   * Helper: Analyze matched and missing skills
   */
  private analyzeSkills(applicant: Applicant, job: JobPosting): { matchedSkills: string[]; missingSkills: string[] } {
    const jobSkills = this.extractSkills(job.skills, job.requirements, job.description, job.title);
    const applicantSkills = this.extractSkills(
      this.formatSkills(applicant),
      this.formatPreferredOccupations(applicant),
      this.formatWorkExperience(applicant),
      this.formatEducation(applicant)
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

    // Skills mismatch
    if (breakdown.skillsMatch < 0.5) {
      const percentage = Math.round(breakdown.skillsMatch * 100);
      concerns.push(`Skills Gap - Only ${percentage}% of required skills match. The applicant will likely need significant training or upskilling to succeed in this position.`);
    } else if (breakdown.skillsMatch < 0.7) {
      const percentage = Math.round(breakdown.skillsMatch * 100);
      concerns.push(`Partial Skills Match - Currently shows ${percentage}% skills alignment. The applicant will benefit from some on-the-job training to fill gaps in specific skill areas.`);
    }

    // Education concerns
    if (breakdown.educationMatch < 0.5) {
      concerns.push(`Education Requirement - The applicant's educational background does not fully meet the position requirements. Please assess whether their work experience and practical skills can compensate for this gap.`);
    } else if (breakdown.educationMatch < 0.7) {
      concerns.push(`Education Note - The applicant's educational qualifications are close to requirements but not an exact match. Their degree or certification level differs from the preferred qualifications.`);
    }

    // Location/distance
    if (breakdown.locationMatch < 0.5) {
      concerns.push(`Location Challenge - The applicant lives at a significant distance from the workplace. This may negatively impact daily commute time, punctuality, reliability, and long-term retention. Consider offering remote work options or relocation assistance if this candidate is otherwise strong.`);
    } else if (breakdown.locationMatch < 0.7) {
      concerns.push(`Location Note - The applicant lives at a moderate distance from the workplace. It is recommended to discuss their transportation plans and commute preferences during the interview to ensure this is sustainable.`);
    }

    // Salary expectations
    if (breakdown.salaryMatch < 0.5) {
      concerns.push(`Salary Mismatch - The applicant's expected salary significantly exceeds your offered salary range. Negotiation may be very difficult unless you can provide flexible benefits, bonuses, or other compensation to bridge this gap.`);
    } else if (breakdown.salaryMatch < 0.7) {
      concerns.push(`Salary Consideration - The applicant's salary expectation is moderately higher than what you are offering. During negotiations, discuss the total compensation package including health benefits, allowances, bonuses, and growth opportunities.`);
    }

    // Availability concerns
    if (breakdown.availabilityMatch < 0.5) {
      concerns.push(`Availability Issue - The applicant may not be immediately available to start work. Please clarify their current employment status, notice period requirements, and discuss start date flexibility to ensure alignment with your hiring timeline.`);
    }

    // Experience gap
    if (breakdown.experienceMatch < 0.5) {
      const percentage = Math.round(breakdown.experienceMatch * 100);
      concerns.push(`Experience Gap - The applicant has limited relevant work experience (only ${percentage}% match with requirements). Carefully assess their potential, learning ability, and genuine willingness to grow in this role.`);
    } else if (breakdown.experienceMatch < 0.7) {
      const percentage = Math.round(breakdown.experienceMatch * 100);
      concerns.push(`Experience Note - The applicant has some relevant experience (${percentage}% match with requirements), but they will likely need mentoring and guidance in specific technical or specialized areas of the role.`);
    }

    // Disability accommodations
    if (applicant.disability && applicant.disability !== 'None' && applicant.disability.trim() !== '') {
      const disabilityName = applicant.disability.toLowerCase().replace(/disability/i, '').trim();
      concerns.push(`Accessibility Requirement - The applicant has disclosed a disability related to ${disabilityName}. You must ensure your workplace provides proper accessibility features and reasonable accommodations such as wheelchair ramps, screen readers, assistive technology, adjusted work hours, or other necessary support to comply with disability inclusion laws.`);
    }

    // Job seeking status
    if (!applicant.activelyLookingForWork) {
      concerns.push(`Job Search Status - The applicant has indicated they are not actively seeking new employment at this time. They may be currently employed and satisfied, may require an exceptionally compelling offer to consider switching, or may have personal commitments. You should verify their genuine interest level and availability before investing time in the interview process.`);
    }

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

  /**
   * Helper: Format NSRP education field
   */
  private formatEducation(applicant: Applicant): string {
    // Try NSRP education array first
    if (applicant.education) {
      try {
        const edu = typeof applicant.education === 'string' 
          ? JSON.parse(applicant.education) 
          : applicant.education;
        
        if (Array.isArray(edu) && edu.length > 0) {
          const highest = edu[edu.length - 1]; // Last entry is usually highest
          return `${highest.level || ''} ${highest.course || ''}`.trim() || 'Not specified';
        }
      } catch (e) {
        // Fall through to legacy
      }
    }
    
    // Fall back to legacy fields
    const level = applicant.educationalAttainment || 'Not specified';
    const course = applicant.course ? ` (${applicant.course})` : '';
    return `${level}${course}`;
  }

  /**
   * Helper: Format NSRP skills fields
   */
  private formatSkills(applicant: Applicant): string {
    const skills: string[] = [];
    
    // Try NSRP technical training
    if (applicant.technicalTraining) {
      try {
        const training = typeof applicant.technicalTraining === 'string'
          ? JSON.parse(applicant.technicalTraining)
          : applicant.technicalTraining;
        
        if (Array.isArray(training)) {
          training.forEach((t: any) => {
            if (t.course) skills.push(t.course);
            if (t.skills) skills.push(t.skills);
          });
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Try NSRP other skills
    if (applicant.otherSkills) {
      try {
        const otherSkills = typeof applicant.otherSkills === 'string'
          ? JSON.parse(applicant.otherSkills)
          : applicant.otherSkills;
        
        if (Array.isArray(otherSkills)) {
          skills.push(...otherSkills.map((s: any) => typeof s === 'string' ? s : s.skill || ''));
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Other skills specify
    if (applicant.otherSkillsSpecify) {
      skills.push(applicant.otherSkillsSpecify);
    }
    
    // Fall back to legacy field
    if (skills.length === 0 && applicant.otherSkillsTraining) {
      skills.push(applicant.otherSkillsTraining);
    }
    
    return skills.length > 0 ? skills.join(', ') : 'Not specified';
  }

  /**
   * Helper: Format NSRP work experience
   */
  private formatWorkExperience(applicant: Applicant): string {
    if (!applicant.workExperience) return 'Not specified';
    
    try {
      const experience = typeof applicant.workExperience === 'string'
        ? JSON.parse(applicant.workExperience)
        : applicant.workExperience;
      
      if (Array.isArray(experience) && experience.length > 0) {
        return experience
          .map((exp: any) => `${exp.position || 'Position'} at ${exp.company || 'Company'}`)
          .join('; ');
      }
    } catch (e) {
      return 'Not specified';
    }
    
    return 'Not specified';
  }

  /**
   * Helper: Format NSRP preferred occupations
   */
  private formatPreferredOccupations(applicant: Applicant): string {
    // Try NSRP preferred occupations array
    if (applicant.preferredOccupations) {
      try {
        const occupations = typeof applicant.preferredOccupations === 'string'
          ? JSON.parse(applicant.preferredOccupations)
          : applicant.preferredOccupations;
        
        if (Array.isArray(occupations) && occupations.length > 0) {
          return occupations.join(', ');
        }
      } catch (e) {
        // Fall through
      }
    }
    
    // Fall back to legacy field
    return applicant.preferredOccupation || 'Not specified';
  }
}

// Export singleton instance
export const aiJobMatcher = new AIJobMatcher();
