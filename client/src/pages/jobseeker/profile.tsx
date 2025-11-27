/**
 * Jobseeker Profile Page - NSRP Registration Form
 * Route: /jobseeker/profile
 * Only accessible to users with role='jobseeker' or 'freelancer'
 * Displays complete NSRP (National Service and Referral Program) registration data
 */
import { useState, useEffect } from 'react';
import { useAuth, authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Settings,
  FileText,
  Phone,
  Mail,
  Calendar,
  Heart,
  Globe,
  Building2,
  CheckCircle2,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import type { Applicant } from '@shared/schema';

export default function JobseekerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Applicant | null>(null);
  const [formData, setFormData] = useState<Partial<Applicant>>({});

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      
      const res = await authFetch(`/api/applicants/${user.id}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch profile' }));
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      
      const data = await res.json();
      console.log('Profile data fetched:', data);
      setProfileData(data);
      setFormData(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Updating profile with data:', formData);
      
      const res = await authFetch(`/api/applicants/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update profile' }));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      setIsEditing(false);
      await fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof Applicant, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helpers for editing array fields in formData
  const updateArrayField = (key: keyof Applicant, index: number, field: string, value: any) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr[index] = { ...(arr[index] || {}), [field]: value };
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  const addArrayItem = (key: keyof Applicant, item: any) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr.push(item);
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  const removeArrayItem = (key: keyof Applicant, index: number) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr.splice(index, 1);
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-600">No profile data found. Please contact administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My NSRP Profile</h1>
          <p className="text-slate-600 mt-1">National Service and Referral Program Registration</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={() => { setIsEditing(false); setFormData(profileData); }} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </TabsTrigger>
          <TabsTrigger value="employment" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                I. Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details from NSRP registration form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Surname *</Label>
                    <Input
                      value={formData.surname || ''}
                      onChange={(e) => handleInputChange('surname', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label>Middle Name</Label>
                    <Input
                      value={formData.middleName || ''}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      placeholder="Middle name"
                    />
                  </div>
                  <div>
                    <Label>Suffix</Label>
                    <Input
                      value={formData.suffix || ''}
                      onChange={(e) => handleInputChange('suffix', e.target.value)}
                      placeholder="Jr., Sr., III"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sex</Label>
                    <select
                      value={formData.sex || 'Male'}
                      onChange={(e) => handleInputChange('sex', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label>Civil Status</Label>
                    <select
                      value={formData.civilStatus || 'Single'}
                      onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      value={formData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="e.g., 5'6"
                    />
                  </div>
                  <div>
                    <Label>Religion</Label>
                    <Input
                      value={formData.religion || ''}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      placeholder="Your religion"
                    />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      value={formData.contactNumber || ''}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Disability</Label>
                    <select
                      value={formData.disability || 'None'}
                      onChange={(e) => handleInputChange('disability', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="None">None</option>
                      <option value="Visual">Visual</option>
                      <option value="Hearing">Hearing</option>
                      <option value="Speech">Speech</option>
                      <option value="Physical">Physical</option>
                      <option value="Mental">Mental</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField icon={User} label="Full Name" value={`${profileData.firstName} ${profileData.middleName || ''} ${profileData.surname} ${profileData.suffix || ''}`.trim()} />
                  <InfoField icon={Calendar} label="Date of Birth" value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not specified'} />
                  <InfoField icon={User} label="Sex" value={profileData.sex} />
                  <InfoField icon={Heart} label="Civil Status" value={profileData.civilStatus} />
                  <InfoField icon={User} label="Height" value={profileData.height || 'Not specified'} />
                  <InfoField icon={Heart} label="Religion" value={profileData.religion || 'Not specified'} />
                  <InfoField icon={Phone} label="Contact Number" value={profileData.contactNumber || 'Not specified'} />
                  <InfoField icon={Mail} label="Email" value={profileData.email || 'Not specified'} />
                  <InfoField icon={User} label="Disability" value={profileData.disability || 'None'} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                II. Address Information
              </CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>House/Street/Village *</Label>
                    <Input
                      value={formData.houseStreetVillage || ''}
                      onChange={(e) => handleInputChange('houseStreetVillage', e.target.value)}
                      placeholder="Complete address"
                    />
                  </div>
                  <div>
                    <Label>Barangay *</Label>
                    <Input
                      value={formData.barangay || ''}
                      onChange={(e) => handleInputChange('barangay', e.target.value)}
                      placeholder="Barangay"
                    />
                  </div>
                  <div>
                    <Label>Municipality/City *</Label>
                    <Input
                      value={formData.municipality || ''}
                      onChange={(e) => handleInputChange('municipality', e.target.value)}
                      placeholder="Municipality or City"
                    />
                  </div>
                  <div>
                    <Label>Province *</Label>
                    <Input
                      value={formData.province || ''}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="Province"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoField icon={MapPin} label="Complete Address" value={`${profileData.houseStreetVillage}, ${profileData.barangay}, ${profileData.municipality}, ${profileData.province}`} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Status Tab */}
        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                III. Employment Status & Preferences
              </CardTitle>
              <CardDescription>Your current employment status and job preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField icon={Briefcase} label="Employment Status" value={profileData.employmentStatus || 'Not specified'} />
                  <InfoField icon={Briefcase} label="Employment Type" value={profileData.employmentType || 'Not specified'} />
                  <InfoField icon={Globe} label="OFW Status" value={profileData.isOFW ? `Yes - ${profileData.owfCountry || 'N/A'}` : 'No'} />
                  <InfoField icon={Globe} label="Former OFW" value={profileData.isFormerOFW ? `Yes - ${profileData.formerOFWCountry || 'N/A'}` : 'No'} />
                  <InfoField icon={CheckCircle2} label="4Ps Beneficiary" value={profileData.is4PSBeneficiary ? `Yes - ID: ${profileData.householdID || 'N/A'}` : 'No'} />
                  <InfoField icon={Calendar} label="Months Unemployed" value={profileData.monthsUnemployed?.toString() || 'N/A'} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Employment Status</Label>
                      <select
                        value={formData.employmentStatus || ''}
                        onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select status</option>
                        <option value="Employed">Employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="New Entrant/Fresh Graduate">New Entrant/Fresh Graduate</option>
                      </select>
                    </div>
                    <div>
                      <Label>Employment Type</Label>
                      <select
                        value={formData.employmentType || ''}
                        onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select type</option>
                        <option value="regular">Regular</option>
                        <option value="contractual">Contractual</option>
                        <option value="part-time">Part-time</option>
                        <option value="self-employed">Self-employed</option>
                      </select>
                    </div>
                    <div>
                      <Label>Months Unemployed</Label>
                      <Input
                        type="number"
                        value={formData.monthsUnemployed ?? ''}
                        onChange={(e) => handleInputChange('monthsUnemployed', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <Label>OFW Status</Label>
                      <select
                        value={formData.isOFW ? 'Yes' : 'No'}
                        onChange={(e) => handleInputChange('isOFW', e.target.value === 'Yes')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <Label>OFW Country</Label>
                      <Input
                        value={formData.owfCountry || ''}
                        onChange={(e) => handleInputChange('owfCountry', e.target.value)}
                        placeholder="Country name"
                      />
                    </div>
                    <div>
                      <Label>Former OFW</Label>
                      <select
                        value={formData.isFormerOFW ? 'Yes' : 'No'}
                        onChange={(e) => handleInputChange('isFormerOFW', e.target.value === 'Yes')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <Label>Former OFW Country</Label>
                      <Input
                        value={formData.formerOFWCountry || ''}
                        onChange={(e) => handleInputChange('formerOFWCountry', e.target.value)}
                        placeholder="Country name"
                      />
                    </div>
                    <div>
                      <Label>4Ps Beneficiary</Label>
                      <select
                        value={formData.is4PSBeneficiary ? 'Yes' : 'No'}
                        onChange={(e) => handleInputChange('is4PSBeneficiary', e.target.value === 'Yes')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <Label>Household ID</Label>
                      <Input
                        value={formData.householdID || ''}
                        onChange={(e) => handleInputChange('householdID', e.target.value)}
                        placeholder="4Ps Household ID"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Preferred Occupations</h3>
                    <TagEditor
                      values={formData.preferredOccupations || []}
                      onChange={(vals) => handleInputChange('preferredOccupations', vals)}
                      placeholder="Add occupation and press Enter"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Preferred Work Locations</h3>
                    <TagEditor
                      values={formData.preferredLocations || []}
                      onChange={(vals) => handleInputChange('preferredLocations', vals)}
                      placeholder="Add location and press Enter"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Preferred Overseas Countries</h3>
                    <TagEditor
                      values={formData.preferredOverseasCountries || []}
                      onChange={(vals) => handleInputChange('preferredOverseasCountries', vals)}
                      placeholder="Add country and press Enter"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                IV. Educational Background
              </CardTitle>
              <CardDescription>Your educational attainment and training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                profileData.education && profileData.education.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.education.map((edu, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InfoField label="Level" value={edu.level} />
                          <InfoField label="Course/Strand" value={edu.course || edu.strand || 'N/A'} />
                          <InfoField label="School" value={edu.schoolName || 'N/A'} />
                          <InfoField label="Year Graduated" value={edu.yearGraduated || 'N/A'} />
                          <InfoField label="Level Reached" value={edu.levelReached || 'N/A'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No educational background specified</p>
                )
              ) : (
                <div className="space-y-3">
                  {(formData.education || []).map((edu: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Level</Label>
                          <Input value={edu.level || ''} onChange={(e) => updateArrayField('education', idx, 'level', e.target.value)} />
                        </div>
                        <div>
                          <Label>Course/Strand</Label>
                          <Input value={edu.course || edu.strand || ''} onChange={(e) => updateArrayField('education', idx, 'course', e.target.value)} />
                        </div>
                        <div>
                          <Label>School</Label>
                          <Input value={edu.schoolName || ''} onChange={(e) => updateArrayField('education', idx, 'schoolName', e.target.value)} />
                        </div>
                        <div>
                          <Label>Year Graduated</Label>
                          <Input value={edu.yearGraduated || ''} onChange={(e) => updateArrayField('education', idx, 'yearGraduated', e.target.value)} />
                        </div>
                        <div>
                          <Label>Level Reached</Label>
                          <Input value={edu.levelReached || ''} onChange={(e) => updateArrayField('education', idx, 'levelReached', e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" onClick={() => removeArrayItem('education', idx)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addArrayItem('education', { level: '', course: '', schoolName: '' })}>Add Education</Button>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Technical/Vocational Training</h3>
                {!isEditing ? (
                  profileData.technicalTraining && profileData.technicalTraining.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.technicalTraining.map((training, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Course" value={training.course} />
                            <InfoField label="Hours of Training" value={training.hoursOfTraining?.toString() || 'N/A'} />
                            <InfoField label="Institution" value={training.trainingInstitution || 'N/A'} />
                            <InfoField label="Skills Acquired" value={training.skillsAcquired || 'N/A'} />
                            <InfoField label="Certificates" value={training.certificatesReceived || 'N/A'} className="md:col-span-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No technical training specified</p>
                  )
                ) : (
                  <div className="space-y-3">
                    {(formData.technicalTraining || []).map((t: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Course</Label>
                            <Input value={t.course || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'course', e.target.value)} />
                          </div>
                          <div>
                            <Label>Hours of Training</Label>
                            <Input type="number" value={t.hoursOfTraining ?? ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'hoursOfTraining', e.target.value ? parseInt(e.target.value) : null)} />
                          </div>
                          <div>
                            <Label>Institution</Label>
                            <Input value={t.trainingInstitution || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'trainingInstitution', e.target.value)} />
                          </div>
                          <div>
                            <Label>Skills Acquired</Label>
                            <Input value={t.skillsAcquired || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'skillsAcquired', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Certificates</Label>
                            <Input value={t.certificatesReceived || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'certificatesReceived', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => removeArrayItem('technicalTraining', idx)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => addArrayItem('technicalTraining', { course: '', hoursOfTraining: null })}>Add Training</Button>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Professional Licenses</h3>
                {!isEditing ? (
                  profileData.professionalLicenses && profileData.professionalLicenses.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.professionalLicenses.map((license, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InfoField label="Eligibility/License" value={license.eligibility} />
                            <InfoField label="Date Taken" value={license.dateTaken || 'N/A'} />
                            <InfoField label="License Number" value={license.licenseNumber || 'N/A'} />
                            <InfoField label="Valid Until" value={license.validUntil || 'N/A'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No professional licenses specified</p>
                  )
                ) : (
                  <div className="space-y-3">
                    {(formData.professionalLicenses || []).map((lic: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Eligibility/License</Label>
                            <Input value={lic.eligibility || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'eligibility', e.target.value)} />
                          </div>
                          <div>
                            <Label>Date Taken</Label>
                            <Input type="date" value={lic.dateTaken || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'dateTaken', e.target.value)} />
                          </div>
                          <div>
                            <Label>License Number</Label>
                            <Input value={lic.licenseNumber || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'licenseNumber', e.target.value)} />
                          </div>
                          <div>
                            <Label>Valid Until</Label>
                            <Input type="date" value={lic.validUntil || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'validUntil', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => removeArrayItem('professionalLicenses', idx)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => addArrayItem('professionalLicenses', { eligibility: '' })}>Add License</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Experience Tab */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                V. Work Experience
              </CardTitle>
              <CardDescription>Your employment history (last 10 years)</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                profileData.workExperience && profileData.workExperience.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.workExperience.map((work, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InfoField label="Company" value={work.companyName} />
                          <InfoField label="Position" value={work.position} />
                          <InfoField label="Duration" value={`${work.numberOfMonths || 0} months`} />
                          <InfoField label="Address" value={work.address || 'N/A'} />
                          <InfoField label="Employment Status" value={work.status || 'N/A'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No work experience specified</p>
                )
              ) : (
                <div className="space-y-3">
                  {(formData.workExperience || []).map((w: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label>Company</Label>
                          <Input value={w.companyName || ''} onChange={(e) => updateArrayField('workExperience', idx, 'companyName', e.target.value)} />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Input value={w.position || ''} onChange={(e) => updateArrayField('workExperience', idx, 'position', e.target.value)} />
                        </div>
                        <div>
                          <Label>Months</Label>
                          <Input type="number" value={w.numberOfMonths ?? ''} onChange={(e) => updateArrayField('workExperience', idx, 'numberOfMonths', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input value={w.address || ''} onChange={(e) => updateArrayField('workExperience', idx, 'address', e.target.value)} />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Input value={w.status || ''} onChange={(e) => updateArrayField('workExperience', idx, 'status', e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" onClick={() => removeArrayItem('workExperience', idx)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addArrayItem('workExperience', { companyName: '', position: '' })}>Add Experience</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                VI. Skills & Language Proficiency
              </CardTitle>
              <CardDescription>Your acquired skills and language abilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Other Skills Acquired</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.otherSkills && profileData.otherSkills.length > 0 ? (
                      profileData.otherSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-slate-500">No skills specified</p>
                    )}
                  </div>
                  {profileData.otherSkillsSpecify && (
                    <p className="mt-3 text-sm text-slate-600">
                      <strong>Additional:</strong> {profileData.otherSkillsSpecify}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Other Skills</h3>
                  <TagEditor
                    values={formData.otherSkills || []}
                    onChange={(vals) => handleInputChange('otherSkills', vals)}
                    placeholder="Add a skill and press Enter"
                  />
                  <div>
                    <Label>Additional Skills (text)</Label>
                    <Input
                      value={formData.otherSkillsSpecify || ''}
                      onChange={(e) => handleInputChange('otherSkillsSpecify', e.target.value)}
                      placeholder="Optional additional description"
                    />
                  </div>
                </div>
              )}

              <Separator />

              {!isEditing ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Language Proficiency
                  </h3>
                  {profileData.languageProficiency && profileData.languageProficiency.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.languageProficiency.map((lang, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <h4 className="font-semibold mb-2">{lang.language}</h4>
                          <div className="flex flex-wrap gap-2">
                            {lang.read && <Badge variant="outline">Read</Badge>}
                            {lang.write && <Badge variant="outline">Write</Badge>}
                            {lang.speak && <Badge variant="outline">Speak</Badge>}
                            {lang.understand && <Badge variant="outline">Understand</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No language proficiency specified</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.languageProficiency || []).map((lang: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <Label>Language</Label>
                          <Input value={lang.language || ''} onChange={(e) => updateArrayField('languageProficiency', idx, 'language', e.target.value)} />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.read} onChange={(e) => updateArrayField('languageProficiency', idx, 'read', e.target.checked)} /> Read
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.write} onChange={(e) => updateArrayField('languageProficiency', idx, 'write', e.target.checked)} /> Write
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.speak} onChange={(e) => updateArrayField('languageProficiency', idx, 'speak', e.target.checked)} /> Speak
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.understand} onChange={(e) => updateArrayField('languageProficiency', idx, 'understand', e.target.checked)} /> Understand
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" onClick={() => removeArrayItem('languageProficiency', idx)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addArrayItem('languageProficiency', { language: '', read: false, write: false, speak: false, understand: false })}>Add Language</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                VII. Job Preferences & Settings
              </CardTitle>
              <CardDescription>Your work preferences and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField icon={Briefcase} label="Preferred Employment Type" value={profileData.employmentType4 || 'Not specified'} />
                <InfoField icon={FileText} label="Account Role" value={user?.role || 'jobseeker'} />
                <InfoField icon={Calendar} label="Profile Created" value={profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'} />
                <InfoField icon={Calendar} label="Last Updated" value={profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : 'N/A'} />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Completeness</h3>
                <ProfileCompleteness data={profileData} />
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 NSRP Registration Information</h4>
                <p className="text-sm text-blue-800">
                  This profile follows the official <strong>National Service and Referral Program (NSRP)</strong> registration form format.
                  Keep your information up-to-date to increase your chances of job placement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ icon: Icon, label, value, className = '' }: { icon?: any; label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <p className="text-slate-900 mt-1">{value}</p>
    </div>
  );
}

// Profile completeness calculator
function ProfileCompleteness({ data }: { data: Applicant }) {
  const fields = [
    { name: 'Personal Info', filled: !!(data.surname && data.firstName && data.dateOfBirth) },
    { name: 'Contact Info', filled: !!(data.contactNumber || data.email) },
    { name: 'Address', filled: !!(data.houseStreetVillage && data.barangay) },
    { name: 'Education', filled: !!(data.education && data.education.length > 0) },
    { name: 'Work Experience', filled: !!(data.workExperience && data.workExperience.length > 0) },
    { name: 'Skills', filled: !!(data.otherSkills && data.otherSkills.length > 0) },
    { name: 'Job Preferences', filled: !!(data.preferredOccupations && data.preferredOccupations.length > 0) },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Profile Completion</span>
        <span className="text-sm font-bold text-purple-600">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-purple-600 to-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {field.filled ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={field.filled ? 'text-slate-900' : 'text-slate-500'}>{field.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple tag editor for string arrays
function TagEditor({ values, onChange, placeholder }: { values: string[]; onChange: (vals: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const v = input.trim();
    if (!v) return;
    const next = [...values, v];
    onChange(next);
    setInput('');
  };

  const removeTag = (idx: number) => {
    const next = values.filter((_, i) => i !== idx);
    onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder || 'Add item and press Enter'} />
        <Button type="button" onClick={addTag} variant="secondary">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 text-slate-800 text-sm">
            {v}
            <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => removeTag(idx)}>×</button>
          </span>
        ))}
        {values.length === 0 && <p className="text-slate-500">No items</p>}
      </div>
    </div>
  );
}
