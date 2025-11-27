import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Home,
  Award,
  Target,
  TrendingUp,
  Clock,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth";
import { Input } from "@/components/ui/input";

interface JobDetails {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  skills?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  employmentType?: string;
  educationLevel?: string;
  experienceRequired?: string;
  industry?: string;
  numberOfPositions?: number;
  status?: string;
  createdAt?: string;
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

interface ApplicantDetails {
  id: string;
  firstName: string;
  surname: string;
  middleName?: string;
  email: string;
  contactNumber: string;
  sex: string;
  age?: number;
  dateOfBirth?: string;
  barangay: string;
  municipality: string;
  province: string;
  address?: string;
  educationalAttainment: string;
  course?: string;
  yearGraduated?: string;
  otherSkillsTraining?: string;
  preferredOccupation?: string;
  employmentStatus: string;
  employmentType?: string;
  expectedSalary?: number;
  salaryPeriod?: string;
  preferredWorkLocation?: string;
  civilStatus?: string;
  disability?: string;
  activelyLookingForWork: number;
  willingToWorkImmediately: number;
  whenCanStart?: string;
}

export default function JobMatchingPage() {
  const [, params] = useRoute("/admin/jobs/:id/match");
  const jobId = params?.id;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applicantDetails, setApplicantDetails] = useState<Record<string, ApplicantDetails>>({});
  const [expandedApplicants, setExpandedApplicants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [minScore, setMinScore] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // Try unified job endpoint first
      let response = await authFetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        // Fallback: job vacancy endpoint (raw vacancy shape)
        const fallback = await authFetch(`/api/job-vacancies/${jobId}`);

        if (!fallback.ok) {
          throw new Error('Failed to fetch job details');
        }

        const vacancy = await fallback.json();
        const normalized: JobDetails = {
          id: vacancy.id,
          title: vacancy.positionTitle,
          description: vacancy.jobDescription,
          requirements: vacancy.additionalRequirements,
          skills: vacancy.mainSkillOrSpecialization,
          location: `${vacancy.barangay || ''}${vacancy.barangay ? ', ' : ''}${vacancy.municipality || ''}`,
          salaryMin: vacancy.startingSalaryOrWage,
          salaryMax: vacancy.maximumSalaryOrWage,
          salaryPeriod: vacancy.salaryType,
          employmentType: vacancy.typeOfEmployment,
          educationLevel: vacancy.minimumEducationRequired,
          experienceRequired: vacancy.yearsOfExperienceRequired ? `${vacancy.yearsOfExperienceRequired} years` : undefined,
          industry: vacancy.industryType || vacancy.industry,
          numberOfPositions: vacancy.numberOfVacancies,
          status: vacancy.jobStatus,
          createdAt: vacancy.createdAt,
        };
        setJob(normalized);
        return;
      }

      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    try {
      setMatching(true);
      // Removed hardcoded maxResults=100 to allow unlimited qualified applicants
      const response = await authFetch(`/api/jobs/${jobId}/match?minScore=${minScore}`);

      if (!response.ok) {
        throw new Error('Failed to run matching');
      }

      const data = await response.json();
      setMatches(data.matches || []);
      setHasMatched(true);
      
      toast({
        title: "✨ AI Matching Complete",
        description: `Found ${data.total ?? data.matches.length} qualified applicants`,
      });
    } catch (error) {
      console.error('Error running matching:', error);
      toast({
        title: "Error",
        description: "Failed to run AI matching",
        variant: "destructive",
      });
    } finally {
      setMatching(false);
    }
  };

  const fetchApplicantDetails = async (applicantId: string) => {
    if (applicantDetails[applicantId]) return; // Already fetched

    try {
      const response = await authFetch(`/api/applicants/${applicantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch applicant details');
      }

      const data = await response.json();
      setApplicantDetails(prev => ({
        ...prev,
        [applicantId]: data,
      }));
    } catch (error) {
      console.error('Error fetching applicant details:', error);
      toast({
        title: "Error",
        description: "Failed to load applicant details",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = async (applicantId: string) => {
    const newExpanded = new Set(expandedApplicants);
    
    if (newExpanded.has(applicantId)) {
      newExpanded.delete(applicantId);
    } else {
      newExpanded.add(applicantId);
      await fetchApplicantDetails(applicantId);
    }
    
    setExpandedApplicants(newExpanded);
  };

  const getSuitabilityLevel = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended':
        return { level: 'Highly Suitable', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-200' };
      case 'Recommended':
        return { level: 'Suitable', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200' };
      case 'Consider':
        return { level: 'Moderately Suitable', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { level: 'Less Suitable', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const formatSalary = (min?: number, max?: number, period?: string) => {
    const p = period || 'Monthly';
    if (min && max) return `₱${min.toLocaleString()} - ₱${max.toLocaleString()} / ${p}`;
    if (min) return `₱${min.toLocaleString()} / ${p}`;
    if (max) return `₱${max.toLocaleString()} / ${p}`;
    return 'Negotiable';
  };

  const filteredMatches = matches.filter(match =>
    match.applicantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelected = (applicantId: string) => {
    const next = new Set(selected);
    next.has(applicantId) ? next.delete(applicantId) : next.add(applicantId);
    setSelected(next);
  };

  const exportCSV = () => {
    const rows = filteredMatches.map(m => ({
      applicantName: m.applicantName,
      recommendation: m.recommendation,
      matchPercentage: m.percentage,
      matchedSkills: m.matchedSkills.join('; '),
      concerns: m.concerns.join('; '),
    }));
    const header = Object.keys(rows[0] || { applicantName: '', recommendation: '', matchPercentage: '', matchedSkills: '', concerns: '' }).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-matches-${job?.title || jobId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printMatches = () => {
    window.print();
  };

  const saveShortlist = () => {
    const key = `shortlist_${jobId}`;
    localStorage.setItem(key, JSON.stringify(Array.from(selected)));
    toast({ title: 'Shortlist saved', description: `${selected.size} applicant(s) saved for this job.` });
  };

  const sendInvites = async () => {
    if (selected.size === 0) {
      toast({ title: 'No applicants selected', description: 'Select applicants to invite.', variant: 'destructive' });
      return;
    }
    // Placeholder action – integrate with referrals or notifications later
    toast({ title: 'Invites queued', description: `Prepared invites for ${selected.size} applicant(s).` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
            <Link href="/admin/jobs">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Navigation */}
      <div className="mb-6">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      {/* Job Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <CardDescription className="text-base">
                {job.industry && (
                  <span className="inline-flex items-center mr-4">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.industry}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
              {job.status || 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Salary */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Salary Range</p>
                <p className="font-semibold">{formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}</p>
              </div>
            </div>

            {/* Employment Type */}
            {job.employmentType && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <p className="font-semibold">{job.employmentType}</p>
                </div>
              </div>
            )}

            {/* Education */}
            {job.educationLevel && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Education</p>
                  <p className="font-semibold">{job.educationLevel}</p>
                </div>
              </div>
            )}

            {/* Positions */}
            {job.numberOfPositions && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Positions Available</p>
                  <p className="font-semibold">{job.numberOfPositions}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Description */}
          {job.description && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Requirements
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Skills */}
          {job.skills && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Required Skills
              </h3>
              <p className="text-gray-700">{job.skills}</p>
            </div>
          )}

          {/* Experience */}
          {job.experienceRequired && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Experience Required
              </h3>
              <p className="text-gray-700">{job.experienceRequired}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Matching Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                AI-Powered Applicant Matching
              </CardTitle>
              <CardDescription className="mt-1">
                Find the most qualified applicants automatically using AI analysis
              </CardDescription>
            </div>
            {!hasMatched ? (
              <Button
                onClick={runMatching}
                disabled={matching}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {matching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Find Qualified Applicants
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-sm text-gray-600">Minimum Score</p>
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    className="border rounded px-3 py-1 text-sm font-medium"
                  >
                    <option value="30">30% - All</option>
                    <option value="50">50% - Default</option>
                    <option value="65">65% - Good Match</option>
                    <option value="80">80% - Best Match</option>
                  </select>
                </div>
                <Button
                  onClick={runMatching}
                  disabled={matching}
                  variant="outline"
                >
                  {matching ? 'Refreshing...' : 'Refresh Results'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {hasMatched && (
          <CardContent>
            {/* Search and Stats */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applicants by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
                <Button variant="outline" size="sm" onClick={printMatches}>Print</Button>
                <Button variant="outline" size="sm" onClick={saveShortlist} disabled={selected.size===0}>Save Shortlist</Button>
                <Button size="sm" onClick={sendInvites} disabled={selected.size===0}>Send Invites</Button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Showing <span className="font-semibold">{filteredMatches.length}</span> qualified applicants · Selected <span className="font-semibold">{selected.size}</span>
            </div>

            {/* Legend */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-3">Suitability Levels:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Highly Suitable (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Suitable (65-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Moderately Suitable (50-64%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm">Less Suitable (&lt;50%)</span>
                </div>
              </div>
            </div>

            {/* Applicants List */}
            {filteredMatches.length > 0 ? (
              <div className="space-y-2">
                {filteredMatches.map((match) => {
                  const suitability = getSuitabilityLevel(match.recommendation);
                  const isExpanded = expandedApplicants.has(match.applicantId);
                  const details = applicantDetails[match.applicantId];

                  return (
                    <div
                      key={match.applicantId}
                      className={`border rounded-lg transition-all ${isExpanded ? `${suitability.border} shadow-md` : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {/* Compact View - Always Visible */}
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleExpand(match.applicantId)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-1 h-12 ${suitability.color} rounded-full`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selected.has(match.applicantId)}
                                onChange={(e) => { e.stopPropagation(); toggleSelected(match.applicantId); }}
                                className="h-4 w-4"
                              />
                              <h3 className="font-semibold text-lg">{match.applicantName}</h3>
                              <Badge className={`${suitability.color} text-white`}>
                                {suitability.level}
                              </Badge>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${suitability.textColor} ${suitability.bgLight}`}>
                                {match.percentage}% Match
                              </span>
                            </div>
                            {!isExpanded && match.strengths.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {match.strengths.slice(0, 2).join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className={`px-4 pb-4 border-t ${suitability.bgLight}`}>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            {/* Left Column - Match Analysis */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Why {suitability.level}?
                                </h4>
                                
                                {/* Match Breakdown */}
                                <div className="bg-white p-3 rounded-lg mb-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">MATCH BREAKDOWN</p>
                                  <div className="space-y-2">
                                    {Object.entries(match.breakdown).map(([key, value]) => (
                                      <div key={key} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full ${
                                                value >= 0.8 ? 'bg-green-500' :
                                                value >= 0.6 ? 'bg-blue-500' :
                                                value >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${(value as number) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="font-medium w-12 text-right">
                                            {Math.round((value as number) * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Strengths */}
                                {match.strengths.length > 0 && (
                                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      STRENGTHS
                                    </p>
                                    <ul className="space-y-1">
                                      {match.strengths.map((strength, idx) => (
                                        <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                          <span className="text-green-500 mt-0.5">✓</span>
                                          <span>{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Matched Skills */}
                                {match.matchedSkills.length > 0 && (
                                  <div className="bg-white p-3 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-green-700 mb-2">
                                      ✓ MATCHED SKILLS ({match.matchedSkills.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {match.matchedSkills.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs bg-green-100 text-green-700">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Concerns */}
                                {match.concerns.length > 0 && (
                                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      CONSIDERATIONS
                                    </p>
                                    <ul className="space-y-1">
                                      {match.concerns.map((concern, idx) => (
                                        <li key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                                          <span className="text-orange-500 mt-0.5">⚠</span>
                                          <span>{concern}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Missing Skills */}
                                {match.missingSkills.length > 0 && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-orange-700 mb-2">
                                      ⚠ MISSING SKILLS ({match.missingSkills.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {match.missingSkills.map((skill, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs text-orange-600 border-orange-300">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column - Applicant Details */}
                            <div className="space-y-4">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Applicant Information
                              </h4>

                              {details ? (
                                <div className="space-y-3">
                                  {/* Contact Information */}
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">CONTACT</p>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {details.email}
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {details.contactNumber}
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Home className="h-4 w-4 text-gray-400" />
                                        {details.barangay}, {details.municipality}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Education */}
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">EDUCATION</p>
                                    <div className="space-y-1 text-sm">
                                      <p className="font-medium text-gray-800">{details.educationalAttainment}</p>
                                      {details.course && <p className="text-gray-600">{details.course}</p>}
                                      {details.yearGraduated && (
                                        <p className="text-gray-500 text-xs">Graduated: {details.yearGraduated}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Employment */}
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">EMPLOYMENT STATUS</p>
                                    <div className="space-y-1 text-sm">
                                      <p className="font-medium text-gray-800">{details.employmentStatus}</p>
                                      {details.preferredOccupation && (
                                        <p className="text-gray-600">Prefers: {details.preferredOccupation}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Skills */}
                                  {details.otherSkillsTraining && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-xs font-semibold text-gray-600 mb-2">SKILLS & TRAINING</p>
                                      <p className="text-sm text-gray-700">{details.otherSkillsTraining}</p>
                                    </div>
                                  )}

                                  {/* Availability */}
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">AVAILABILITY</p>
                                    <div className="space-y-1 text-sm">
                                      {details.activelyLookingForWork === 1 && (
                                        <p className="text-green-600 flex items-center gap-2">
                                          <CheckCircle2 className="h-4 w-4" />
                                          Actively looking for work
                                        </p>
                                      )}
                                      {details.willingToWorkImmediately === 1 && (
                                        <p className="text-green-600 flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          Available immediately
                                        </p>
                                      )}
                                      {details.whenCanStart && (
                                        <p className="text-gray-700">Can start: {details.whenCanStart}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Salary Expectation */}
                                  {details.expectedSalary && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-xs font-semibold text-gray-600 mb-2">SALARY EXPECTATION</p>
                                      <p className="text-sm font-medium text-gray-800">
                                        ₱{details.expectedSalary.toLocaleString()} / {details.salaryPeriod || 'Monthly'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                                  <p className="text-sm text-gray-600">Loading details...</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-4 border-t flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              <Mail className="mr-2 h-4 w-4" />
                              Contact Applicant
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Shortlist for Interview
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matching Applicants Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? "No applicants match your search criteria."
                    : "Try lowering the minimum match score to see more applicants."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
