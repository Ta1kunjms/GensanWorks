import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, X, ChevronDown, ChevronUp, Briefcase, UserCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth";
import { handleApiError } from "@/lib/error-logger";
import { useFieldErrors } from "@/lib/field-errors";
import { ViewApplicantModal } from "@/components/view-applicant-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  // AI-generated insight fields (optional)
  aiComment?: string;
  whyQualified?: string;
  hiringRecommendation?: string;
  potentialRole?: string;
  developmentAreas?: string[];
}

interface AIMatchResult {
  jobId: string;
  jobTitle: string;
  matches: MatchScore[];
  total: number;
  criteria: {
    minScore: number;
    maxResults: number;
  };
}

interface AIApplicantInsight {
  aiComment?: string;
  whyQualified?: string;
  hiringRecommendation?: string;
  potentialRole?: string;
  developmentAreas?: string[];
}

interface AIJobMatchingModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

type ShortlistField = "selectedApplicants";

export function AIJobMatchingModal({ jobId, jobTitle, onClose }: AIJobMatchingModalProps) {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<AIMatchResult | null>(null);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(50);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [viewApplicantModalOpen, setViewApplicantModalOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState<Record<string, boolean>>({});
  const [aiInsights, setAiInsights] = useState<Record<string, AIApplicantInsight>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string | undefined>>({});
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);
  const { toast } = useToast();
  const { fieldErrors, clearFieldError, setErrorsAndFocus } = useFieldErrors<ShortlistField>();

  useEffect(() => {
    fetchMatches();
  }, [jobId, minScore]);

  useEffect(() => {
    if (selectedApplicants.size > 0) {
      clearFieldError("selectedApplicants");
    }
  }, [selectedApplicants, clearFieldError]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/jobs/${jobId}/match?minScore=${minScore}&useAI=true&includeInsights=false`);

      if (!response.ok) {
        throw new Error('Failed to fetch AI matches');
      }

      const data = await response.json();
      setMatchData(data);
    } catch (error) {
      handleApiError(error, `/api/jobs/${jobId}/match`, 'GET');
      toast({
        title: "Error",
        description: "Failed to load AI matching results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async (applicantId: string) => {
    if (aiInsights[applicantId] || aiLoading[applicantId]) {
      return;
    }
    setAiLoading((prev) => ({ ...prev, [applicantId]: true }));
    setAiError((prev) => ({ ...prev, [applicantId]: undefined }));
    try {
      const response = await authFetch(`/api/jobs/${jobId}/applicant/${applicantId}/ai-insights`);
      if (!response.ok) {
        throw new Error("Failed to load AI assessment");
      }
      const data: AIApplicantInsight = await response.json();
      setAiInsights((prev) => ({ ...prev, [applicantId]: data }));
    } catch (error: any) {
      const message = error?.message || "Failed to load AI assessment";
      setAiError((prev) => ({ ...prev, [applicantId]: message }));
      toast({
        title: "AI Assessment Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAiLoading((prev) => ({ ...prev, [applicantId]: false }));
    }
  };

  const fetchApplicantDetails = async (applicantId: string) => {
    try {
      const response = await authFetch(`/api/applicants/${applicantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applicant details');
      }
      const applicant = await response.json();
      console.log('Fetched applicant data:', applicant);
      console.log('Education:', applicant.education);
      console.log('Technical Training:', applicant.technicalTraining);
      console.log('Work Experience:', applicant.workExperience);
      console.log('Skills:', applicant.skills);
      setSelectedApplicant(applicant);
      setViewApplicantModalOpen(true);
    } catch (error) {
      handleApiError(error, '/api/applicants', 'GET');
      toast({
        title: "Error",
        description: "Failed to load applicant profile",
        variant: "destructive",
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended':
        return 'bg-green-500 hover:bg-green-600';
      case 'Recommended':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Consider':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 65) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const toggleExpand = (applicantId: string) => {
    setExpandedApplicant(expandedApplicant === applicantId ? null : applicantId);
  };

  const toggleApplicantSelection = (applicantId: string) => {
    setSelectedApplicants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicantId)) {
        newSet.delete(applicantId);
      } else {
        newSet.add(applicantId);
      }
      return newSet;
    });
  };

  const selectAllVisibleApplicants = () => {
    if (!matchData?.matches) return;
    const allIds = matchData.matches.map(m => m.applicantId);
    setSelectedApplicants(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedApplicants(new Set());
  };

  const handleShortlistSelected = async () => {
    if (selectedApplicants.size === 0) {
      setErrorsAndFocus({
        selectedApplicants: "Please select at least one applicant to shortlist",
      });
      return;
    }

    setShowShortlistDialog(true);
  };

  const confirmShortlist = async () => {
    setShowShortlistDialog(false);
    setShortlistLoading(true);

    try {
      const applicantIds = Array.from(selectedApplicants);
      
      const response = await authFetch(`/api/jobs/${jobId}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicantIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to shortlist applicants');
      }

      const result = await response.json();

      toast({
        title: "✅ Shortlisting Complete!",
        description: `Successfully shortlisted ${result.summary.successful} applicant(s). Notifications have been sent.`,
      });

      // Clear selection after successful shortlist
      setSelectedApplicants(new Set());

      // Optionally refresh the matches to show updated status
      // await fetchMatches();
    } catch (error: any) {
      handleApiError(error, '/api/applications', 'POST');
      toast({
        title: "Error",
        description: error.message || "Failed to shortlist applicants",
        variant: "destructive",
      });
    } finally {
      setShortlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
              AI Job Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing applicants with AI...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-6xl mx-4 my-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-purple-500" />
                AI Job Matching Results
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="font-semibold">{jobTitle}</span>
                <br />
                Found {matchData?.total || 0} suitable applicants
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Minimum Match Score:</label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="30">30% (Show All)</option>
                <option value="50">50% (Default)</option>
                <option value="65">65% (Recommended+)</option>
                <option value="80">80% (Highly Recommended Only)</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchMatches}
              >
                Refresh
              </Button>
            </div>

            {/* Shortlisting Actions */}
            {matchData?.matches && matchData.matches.length > 0 && (
              <div
                className={`p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border dark:border-blue-800 ${
                  fieldErrors.selectedApplicants ? "border-destructive" : "border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedApplicants.size > 0
                        ? `${selectedApplicants.size} applicant${selectedApplicants.size > 1 ? "s" : ""} selected`
                        : "Select applicants to shortlist"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedApplicants.size > 0 ? (
                      <>
                        <Button size="sm" variant="outline" onClick={deselectAll}>
                          Clear Selection
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleShortlistSelected}
                          disabled={shortlistLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {shortlistLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Shortlist Selected ({selectedApplicants.size})
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={selectAllVisibleApplicants}
                        aria-invalid={!!fieldErrors.selectedApplicants}
                        className="aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-destructive"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Select All Visible
                      </Button>
                    )}
                  </div>
                </div>

                {selectedApplicants.size === 0 && fieldErrors.selectedApplicants && (
                  <p className="mt-2 text-xs text-destructive">{fieldErrors.selectedApplicants}</p>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="max-h-[600px] overflow-y-auto">
          {matchData?.matches && matchData.matches.length > 0 ? (
            <div className="space-y-3">
              {matchData.matches.map((match) => (
                <div
                  key={match.applicantId}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                    selectedApplicants.has(match.applicantId) 
                      ? 'bg-blue-50 border-blue-400 dark:bg-blue-950/20 dark:border-blue-700' 
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox for selection */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedApplicants.has(match.applicantId)}
                        onCheckedChange={() => toggleApplicantSelection(match.applicantId)}
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{match.applicantName}</h3>
                        <Badge className={getRecommendationColor(match.recommendation)}>
                          {match.recommendation}
                        </Badge>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(match.percentage)}`}>
                          {match.percentage}% Match
                        </span>
                      </div>

                      {/* Strengths */}
                      {match.strengths.length > 0 && (
                        <div className="flex items-start gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {match.strengths.slice(0, 3).join(' â€¢ ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Matched Skills */}
                      {match.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {match.matchedSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.matchedSkills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{match.matchedSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Concerns */}
                      {match.concerns.length > 0 && expandedApplicant !== match.applicantId && (
                        <div className="flex items-start gap-2 text-sm text-orange-600">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{match.concerns.length} concern(s)</span>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {expandedApplicant === match.applicantId && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {/* Match Breakdown */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Match Breakdown:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(match.breakdown).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">
                                    {Math.round((value as number) * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* All Matched Skills */}
                          {match.matchedSkills.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-green-700">
                                âœ“ Matched Skills ({match.matchedSkills.length}):
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {match.matchedSkills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs bg-green-50">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Skills */}
                          {match.missingSkills.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">
                                âš  Missing Skills ({match.missingSkills.length}):
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs text-orange-600">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* All Concerns */}
                          {match.concerns.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">
                                Concerns:
                              </h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {match.concerns.map((concern, idx) => (
                                  <li key={idx}>{concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Toggle AI Assessment */}
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentlyExpanded = Boolean(aiExpanded[match.applicantId]);
                                const nextExpanded = !currentlyExpanded;
                                setAiExpanded(prev => ({ ...prev, [match.applicantId]: nextExpanded }));
                                if (nextExpanded) {
                                  fetchAiInsights(match.applicantId);
                                }
                              }}
                            >
                              {aiExpanded[match.applicantId] ? (
                                <span className="flex items-center gap-1"><ChevronUp className="h-4 w-4" /> Hide AI Assessment</span>
                              ) : (
                                <span className="flex items-center gap-1"><ChevronDown className="h-4 w-4" /> Show AI Assessment</span>
                              )}
                            </Button>
                          </div>

                          {aiExpanded[match.applicantId] && (
                            <div className="space-y-3">
                              {aiLoading[match.applicantId] && (
                                <div className="text-sm text-gray-600">Generating AI assessmentâ€¦</div>
                              )}
                              {aiError[match.applicantId] && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                                  {aiError[match.applicantId]}
                                </div>
                              )}

                              {(() => {
                                const insight = aiInsights[match.applicantId] || {
                                  aiComment: match.aiComment,
                                  whyQualified: match.whyQualified,
                                  hiringRecommendation: match.hiringRecommendation,
                                  potentialRole: match.potentialRole,
                                  developmentAreas: match.developmentAreas,
                                };
                                if (
                                  !insight.aiComment &&
                                  !insight.whyQualified &&
                                  !insight.hiringRecommendation &&
                                  !insight.potentialRole &&
                                  !(insight.developmentAreas && insight.developmentAreas.length > 0)
                                ) {
                                  return null;
                                }

                                return (
                                  <>
                                    {insight.aiComment && (
                                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-purple-800 mb-1 flex items-center gap-1">
                                          <Sparkles className="h-3 w-3" /> AI ANALYSIS
                                        </p>
                                        <p className="text-sm text-purple-700">{insight.aiComment}</p>
                                      </div>
                                    )}
                                    {insight.whyQualified && (
                                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                          <CheckCircle2 className="h-3 w-3" /> WHY QUALIFIED
                                        </p>
                                        <p className="text-sm text-blue-700">{insight.whyQualified}</p>
                                      </div>
                                    )}
                                    {insight.hiringRecommendation && (
                                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-indigo-800 mb-1 flex items-center gap-1">
                                          <TrendingUp className="h-3 w-3" /> HIRING RECOMMENDATION
                                        </p>
                                        <p className="text-sm text-indigo-700">{insight.hiringRecommendation}</p>
                                      </div>
                                    )}
                                    {insight.potentialRole && insight.potentialRole !== jobTitle && (
                                      <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-cyan-800 mb-1 flex items-center gap-1">
                                          <Briefcase className="h-3 w-3" /> ALTERNATIVE ROLE SUGGESTION
                                        </p>
                                        <p className="text-sm text-cyan-700">{insight.potentialRole}</p>
                                      </div>
                                    )}
                                    {insight.developmentAreas && insight.developmentAreas.length > 0 && (
                                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                                          <TrendingUp className="h-3 w-3" /> DEVELOPMENT AREAS
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                                          {insight.developmentAreas.map((area, idx) => (
                                            <li key={idx}>{area}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExpand(match.applicantId)}
                      >
                        {expandedApplicant === match.applicantId ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Details
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => fetchApplicantDetails(match.applicantId)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
              <p className="text-gray-600">
                Try lowering the minimum match score to see more applicants.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Applicant Modal */}
      {selectedApplicant && (
        <ViewApplicantModal
          open={viewApplicantModalOpen}
          onOpenChange={setViewApplicantModalOpen}
          applicant={selectedApplicant}
        />
      )}

      {/* Shortlist Confirmation Dialog */}
      <AlertDialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Confirm Shortlisting
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to shortlist <strong>{selectedApplicants.size}</strong> applicant
                {selectedApplicants.size > 1 ? 's' : ''} for <strong>{jobTitle}</strong>.
              </p>
              <p className="text-sm">
                Each applicant will receive a notification with instructions to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Visit the PESO office for further processing</li>
                <li>Request a referral slip if needed</li>
                <li>Prepare for the next stage of the hiring process</li>
              </ul>
              <p className="text-sm font-medium text-blue-600">
                The employer will also be notified of all shortlisted candidates.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmShortlist}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Shortlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
