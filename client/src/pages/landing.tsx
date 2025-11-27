import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Briefcase, 
  Users, 
  Building2, 
  CheckCircle2, 
  Search,
  FileText,
  UserCheck,
  Award,
  Shield,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Target,
  Zap,
  Globe,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Laptop,
  Smartphone,
  HeadphonesIcon,
  GraduationCap,
  Wrench,
  Stethoscope,
  Code,
  TrendingDown,
  ArrowUpRight,
  PhoneCall,
  Mail,
  Video,
  Download,
  Play
} from "lucide-react";
import { useState } from "react";

interface PublicStats {
  jobseekersRegistered: number;
  employersParticipating: number;
  jobsMatched: number;
}

interface SkillData {
  skill: string;
  percentage: number;
}

interface ImpactMetrics {
  avgTimeToInterview: string;
  avgSalary: string;
  satisfactionRate: string;
  yearsOfService: number;
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Fetch real-time statistics from the database
  const { data: stats, isLoading } = useQuery<PublicStats>({
    queryKey: ['/api/public/stats'],
    queryFn: async () => {
      const res = await fetch('/api/public/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });

  // Fetch skills data
  const { data: skillsData, isLoading: skillsLoading } = useQuery<SkillData[]>({
    queryKey: ['/api/public/skills'],
    queryFn: async () => {
      const res = await fetch('/api/public/skills');
      if (!res.ok) throw new Error('Failed to fetch skills');
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 40000,
  });

  // Fetch impact metrics
  const { data: impactData, isLoading: impactLoading } = useQuery<ImpactMetrics>({
    queryKey: ['/api/public/impact'],
    queryFn: async () => {
      const res = await fetch('/api/public/impact');
      if (!res.ok) throw new Error('Failed to fetch impact');
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 40000,
  });

  const formatNumber = (num: number) => num.toLocaleString();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  const faqs = [
    {
      question: "How do I register as a jobseeker on GensanWorks?",
      answer: "Click on 'Sign Up' or 'Get Started' button, fill in your personal information, upload your resume, and complete your profile. Registration is completely free for jobseekers. You'll need a valid email address and government-issued ID for verification."
    },
    {
      question: "Is there a fee to use GensanWorks?",
      answer: "No, GensanWorks is completely free for jobseekers. You can create profiles, search for jobs, apply to unlimited positions, and access career resources at no cost. Employers may have different service packages for premium features."
    },
    {
      question: "How can employers post job vacancies?",
      answer: "Employers need to register for an employer account, verify their company information with PESO, and then they can post unlimited job vacancies through the employer portal. The verification process ensures all job postings are legitimate and from verified companies."
    },
    {
      question: "What documents do I need to upload?",
      answer: "At minimum, upload your resume/CV. Additional documents like educational certificates, diplomas, professional licenses, NCII certifications, and employment records will strengthen your profile and increase your chances of being matched with quality jobs."
    },
    {
      question: "How does the AI-powered job matching system work?",
      answer: "Our intelligent matching system analyzes your skills, work experience, education level, location preferences, and salary expectations to recommend jobs that best match your profile. You'll receive instant notifications when new matching opportunities are posted. The more complete your profile, the better the matches."
    },
    {
      question: "Can I apply for jobs outside General Santos City?",
      answer: "Yes! While we focus on General Santos City opportunities, our platform also features jobs from across SOCCSKSARGEN region and nationwide. You can set your location preferences in your profile to control which job opportunities you see."
    },
    {
      question: "How long does it take to get hired?",
      answer: "Based on our data, most candidates receive their first interview invitation within 48 hours of application. The average time from application to job offer is 2-3 weeks, depending on the position and industry. Our streamlined process helps speed up hiring."
    },
    {
      question: "What makes GensanWorks different from other job platforms?",
      answer: "GensanWorks is the official PESO platform, meaning all employers and jobs are verified by the government. We offer AI-powered matching, direct employer communication, career guidance programs, and local support from PESO staff. Plus, it's completely free for jobseekers with no hidden charges."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Header - Clean and minimal */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <a href="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/peso-gsc-logo.png" alt="PESO GSC" className="h-11 w-11 transition-transform group-hover:scale-105 duration-200" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-slate-900 tracking-tight">GensanWorks</span>
                <span className="text-xs text-slate-500">Public Employment Service Office</span>
              </div>
            </a>
            <nav className="hidden lg:flex items-center gap-1">
              <a href="/#services" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium">Services</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium">How It Works</a>
              <a href="/about" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium">About</a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium">Contact</a>
              <div className="flex items-center gap-2 ml-6 pl-6 border-l border-slate-200">
                <a href="/jobseeker/login"><Button variant="ghost" className="font-medium text-sm">Login</Button></a>
                <a href="/jobseeker/signup"><Button className="font-medium text-sm bg-blue-600 hover:bg-blue-700">Get Started</Button></a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and professional */}
      <section className="relative w-full bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full opacity-40 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Official Government Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Connect Talent with<br/>
                <span className="text-blue-600">Opportunity</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                The official employment facilitation platform of General Santos City. Empowering careers, strengthening businesses, building our community's future together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="/jobseeker/signup" className="flex-1 sm:flex-initial">
                  <Button size="lg" className="w-full sm:w-auto text-sm px-8 py-6 bg-blue-600 hover:bg-blue-700">
                    Find Your Dream Job
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
                <a href="/employer/signup" className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-8 py-6 border-slate-300 hover:bg-slate-50">
                    Hire Top Talent
                  </Button>
                </a>
              </div>
              
              {/* Quick access links */}
              <div className="flex flex-wrap gap-5 pt-4">
                <a href="/jobseeker/login" className="text-sm text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
                  Jobseeker Login →
                </a>
                <a href="/employer/login" className="text-sm text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
                  Employer Login →
                </a>
              </div>
            </div>
            
            {/* Right content - Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mb-1" />
                  ) : (
                    <div className="text-3xl font-bold text-slate-900 mb-0.5">{formatNumber(stats?.jobseekersRegistered || 0)}+</div>
                  )}
                  <p className="text-sm text-slate-600">Active Jobseekers</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow mt-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mb-1" />
                  ) : (
                    <div className="text-3xl font-bold text-slate-900 mb-0.5">{formatNumber(stats?.employersParticipating || 0)}+</div>
                  )}
                  <p className="text-sm text-slate-600">Partner Companies</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow col-span-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mb-1" />
                  ) : (
                    <div className="text-3xl font-bold text-slate-900 mb-0.5">{formatNumber(stats?.jobsMatched || 0)}+</div>
                  )}
                  <p className="text-sm text-slate-600">Successful Job Matches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="w-full bg-white border-y border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Government Certified</p>
                <p className="text-xs text-slate-500">Official PESO Platform</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Data Protected</p>
                <p className="text-xs text-slate-500">Secure & Confidential</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Quality Service</p>
                <p className="text-xs text-slate-500">ISO Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners / Industry Leaders */}
      <section className="w-full bg-slate-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Trusted By Leading Companies</p>
            <h2 className="text-2xl font-bold text-slate-900">Our Industry Partners</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
            {/* Partner logos - using placeholder boxes with company names */}
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">General Milling Corp</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">SM City GenSan</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">Dole Philippines</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">Gaisano Mall</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">Robinsons Place</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 bg-white rounded-xl hover:shadow-sm transition-shadow border border-slate-100">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">KCC Mall</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How GensanWorks Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple, efficient, and effective. Get started in three easy steps and unlock your career potential.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <UserCheck className="w-7 h-7 text-blue-600" />
                </div>
                <div className="absolute top-6 right-6 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Create Your Profile</h3>
                <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                  Sign up and build your professional profile with your skills, experience, and career goals.
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Upload resume and certificates</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Highlight your skills</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Set job preferences</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-7 h-7 text-green-600" />
                </div>
                <div className="absolute top-6 right-6 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Search & Apply</h3>
                <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                  Browse thousands of job opportunities and apply with one click using your profile.
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Advanced search filters</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">AI-powered job matching</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Track application status</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-7 h-7 text-purple-600" />
                </div>
                <div className="absolute top-6 right-6 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Get Hired</h3>
                <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                  Receive interview invitations, connect with employers, and land your dream job.
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Direct employer communication</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Interview scheduling</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">Job offer management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section id="services" className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Comprehensive Employment Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to succeed in your career journey or find the perfect candidate for your team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/jobseeker/jobs" className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all border border-slate-100 cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors">
                <Search className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Search Portal</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Browse thousands of verified job opportunities across various industries.
              </p>
              <span className="text-sm text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Jobs <ChevronRight className="w-4 h-4" />
              </span>
            </a>
            
            <a href="/employer/jobs" className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all border border-slate-100 cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-green-600 transition-colors">
                <FileText className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post Job Vacancies</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Reach qualified candidates quickly with our streamlined posting system.
              </p>
              <span className="text-sm text-green-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Post a Job <ChevronRight className="w-4 h-4" />
              </span>
            </a>
            
            <a href="/help" className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all border border-slate-100 cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-purple-600 transition-colors">
                <Target className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Career Development</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Access training programs, workshops, and professional development resources.
              </p>
              <span className="text-sm text-purple-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn More <ChevronRight className="w-4 h-4" />
              </span>
            </a>
            
            <a href="/contact" className="group bg-slate-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all border border-slate-100 cursor-pointer">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-amber-600 transition-colors">
                <Users className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Fairs & Events</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Participate in career fairs, recruitment drives, and networking events.
              </p>
              <span className="text-sm text-amber-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View Events <ChevronRight className="w-4 h-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Browse by Job Category */}
      <section className="w-full bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Browse Jobs by Category</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore thousands of opportunities across diverse industries and find the perfect match for your skills.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href="/jobseeker/jobs?category=technology" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-blue-200">
              <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Technology & IT</h3>
              <p className="text-xs text-slate-500 mb-2">2,341 jobs available</p>
              <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=healthcare" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-green-200">
              <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <Stethoscope className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Healthcare</h3>
              <p className="text-xs text-slate-500 mb-2">1,876 jobs available</p>
              <span className="text-xs text-green-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=education" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-purple-200">
              <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Education</h3>
              <p className="text-xs text-slate-500 mb-2">1,432 jobs available</p>
              <span className="text-xs text-purple-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=engineering" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-amber-200">
              <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Engineering</h3>
              <p className="text-xs text-slate-500 mb-2">1,098 jobs available</p>
              <span className="text-xs text-amber-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=customer-service" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-pink-200">
              <div className="w-11 h-11 bg-pink-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
                <HeadphonesIcon className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Customer Service</h3>
              <p className="text-xs text-slate-500 mb-2">987 jobs available</p>
              <span className="text-xs text-pink-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=sales" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-cyan-200">
              <div className="w-11 h-11 bg-cyan-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-cyan-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Sales & Marketing</h3>
              <p className="text-xs text-slate-500 mb-2">1,654 jobs available</p>
              <span className="text-xs text-cyan-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs?category=admin" className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all hover:border-indigo-200">
              <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">Admin & Office</h3>
              <p className="text-xs text-slate-500 mb-2">1,234 jobs available</p>
              <span className="text-xs text-indigo-600 font-medium inline-flex items-center gap-0.5">
                View Jobs <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a href="/jobseeker/jobs" className="group bg-white p-5 rounded-xl border border-slate-300 hover:shadow-md transition-all hover:border-slate-400">
              <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                <Search className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">All Categories</h3>
              <p className="text-xs text-slate-500 mb-2">10,000+ jobs available</p>
              <span className="text-xs text-slate-700 font-medium inline-flex items-center gap-0.5">
                Browse All <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">
                Why Choose GensanWorks?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We provide a trusted, efficient, and secure platform backed by PESO General Santos City's credibility and commitment to excellence.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">AI-Powered Matching</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Our intelligent system matches jobseekers with relevant opportunities based on skills, experience, and preferences.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Verified & Secure</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">All employers and job postings are verified by PESO to ensure legitimacy, safety, and quality.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Real-Time Updates</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Receive instant notifications about new jobs, application status, and interview schedules.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Local & Beyond</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Access jobs in General Santos City and connect with opportunities nationwide.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 lg:p-10 border border-slate-200">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Official PESO Platform</h3>
                  <p className="text-slate-600 text-sm">Trusted by thousands across General Santos</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">Government Approved</span>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">Data Privacy Compliant</span>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">Free for Jobseekers</span>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">24/7 Platform Access</span>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Introduction / About PESO */}
      <section className="w-full bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">Watch Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Empowering GenSan's Workforce Since 1999
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Learn how PESO General Santos City has been connecting talent with opportunity for over two decades, creating sustainable employment and driving economic growth in our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 text-sm font-semibold">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Video
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 py-5 text-sm font-semibold">
                  Learn More About PESO
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-lg">
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </div>
                </div>
                {/* Placeholder for video thumbnail */}
                <img src="/peso-gsc-logo.png" alt="PESO Video" className="w-full h-full object-cover opacity-30" />
              </div>
              {/* Stats overlay */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">95%</div>
                    <div className="text-xs text-slate-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Dashboard */}
      <section className="w-full bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Our Impact in Numbers</h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Data-driven results that showcase the power of connecting talent with opportunity in General Santos City.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +24%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(stats?.jobseekersRegistered || 0)}
              </div>
              <p className="text-sm text-slate-600 font-medium">Total Jobseekers</p>
              <p className="text-xs text-slate-500 mt-1">Active profiles this year</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +18%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(stats?.employersParticipating || 0)}
              </div>
              <p className="text-sm text-slate-600 font-medium">Partner Employers</p>
              <p className="text-xs text-slate-500 mt-1">Verified companies</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div className="px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +32%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(stats?.jobsMatched || 0)}
              </div>
              <p className="text-sm text-slate-600 font-medium">Successful Placements</p>
              <p className="text-xs text-slate-500 mt-1">Jobs matched & filled</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +15%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {impactLoading ? <Skeleton className="h-8 w-20" /> : impactData?.satisfactionRate || "94.5%"}
              </div>
              <p className="text-sm text-slate-600 font-medium">Satisfaction Rate</p>
              <p className="text-xs text-slate-500 mt-1">User feedback score</p>
            </div>
          </div>

          {/* Additional Impact Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-600 rounded-xl p-5 text-white shadow-sm">
              <div className="text-3xl font-bold mb-1">
                {impactLoading ? <Skeleton className="h-8 w-20 bg-blue-500" /> : impactData?.avgTimeToInterview || "48 hrs"}
              </div>
              <p className="text-blue-100 text-sm font-medium">Average Time to First Interview</p>
            </div>
            <div className="bg-green-600 rounded-xl p-5 text-white shadow-sm">
              <div className="text-3xl font-bold mb-1">
                {impactLoading ? <Skeleton className="h-8 w-20 bg-green-500" /> : impactData?.avgSalary || "₱32.5K"}
              </div>
              <p className="text-green-100 text-sm font-medium">Average Starting Salary</p>
            </div>
            <div className="bg-purple-600 rounded-xl p-5 text-white shadow-sm">
              <div className="text-3xl font-bold mb-1">
                {impactLoading ? <Skeleton className="h-8 w-20 bg-purple-500" /> : `${impactData?.yearsOfService || 25} years`}
              </div>
              <p className="text-purple-100 text-sm font-medium">Serving General Santos City</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Success Stories</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Real people, real results. See how GensanWorks has transformed careers and businesses across our city.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "As a fresh graduate with no work experience, I was worried about finding a job. GensanWorks' career counseling and resume workshop gave me the confidence I needed. I got hired as a junior software developer within 2 weeks!"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Maria Rodriguez</p>
                  <p className="text-xs text-slate-600">Software Developer at TechHub GSC</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "Our company struggled to find qualified local talent. GensanWorks connected us with amazing candidates—verified, skilled, and ready to work. We've hired 5 employees in just one month and saved thousands on recruitment costs."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-green-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  JT
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">John Tan</p>
                  <p className="text-xs text-slate-600">HR Manager, GenSan Tech Inc.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "After being unemployed for 8 months, I was losing hope. The PESO team through GensanWorks not only helped me update my skills but matched me with a company looking for exactly my expertise. I'm now thriving in my career!"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  AS
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Anna Santos</p>
                  <p className="text-xs text-slate-600">Senior Marketing Specialist</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional testimonial row */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "The AI matching system is incredible! It recommended jobs I hadn't even considered but turned out to be perfect for my skills. Got 3 interview calls in the first week. This platform truly understands what jobseekers need."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-orange-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  RD
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Roberto Del Rosario</p>
                  <p className="text-xs text-slate-600">Electrical Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "As a working mother returning to the workforce after 5 years, I was nervous. GensanWorks made the transition smooth with flexible job options and supportive employers. I'm now balancing work and family perfectly."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-pink-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  LC
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Linda Cruz</p>
                  <p className="text-xs text-slate-600">Administrative Assistant</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-7 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                "From application to job offer in just 10 days! The direct messaging feature let me communicate with the HR manager instantly. No more waiting weeks for email responses. GensanWorks revolutionizes job hunting."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-11 h-11 bg-cyan-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                  PM
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Paolo Mendoza</p>
                  <p className="text-xs text-slate-600">Customer Service Representative</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Announcements */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Latest News & Announcements</h2>
          <p className="text-lg text-slate-600">Stay updated with the latest employment opportunities and events</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-blue-600 p-6 text-white">
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider">UPCOMING EVENT</div>
              <h3 className="text-xl font-bold">City-Wide Job Fair 2025</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                Join our biggest job fair of the year on December 10, 2025 at the City Hall Grounds. Over 100 companies actively hiring!
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                <MapPin className="w-4 h-4" />
                <span>City Hall, General Santos</span>
              </div>
              <a href="/contact" className="text-blue-600 font-semibold hover:underline text-sm inline-flex items-center gap-1 group">
                Register Now <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-green-600 p-6 text-white">
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider">NEW FEATURE</div>
              <h3 className="text-xl font-bold">Enhanced Employer Portal</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                We've launched new tools for employers: advanced filtering, bulk messaging, and detailed analytics dashboard.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                <Clock className="w-4 h-4" />
                <span>Available Now</span>
              </div>
              <a href="/employer/signup" className="text-green-600 font-semibold hover:underline text-sm inline-flex items-center gap-1 group">
                Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-purple-600 p-6 text-white">
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider">FREE TRAINING</div>
              <h3 className="text-xl font-bold">Resume Writing Workshop</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-5 text-sm leading-relaxed">
                Free online seminar for jobseekers: Learn how to create a compelling resume that gets noticed by employers.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                <Clock className="w-4 h-4" />
                <span>Every Saturday, 2PM</span>
              </div>
              <a href="/help" className="text-purple-600 font-semibold hover:underline text-sm inline-flex items-center gap-1 group">
                Register Free <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills in Demand Section */}
      <section className="w-full py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Top Skills in Demand</h2>
            <p className="text-base text-slate-600">What employers in General Santos are looking for right now</p>
          </div>

          {skillsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Most In-Demand Skills from Our Database</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3.5">
                {skillsData && skillsData.length > 0 ? (
                  skillsData.map((item, index) => {
                    const colors = [
                      'blue', 'purple', 'pink', 'orange', 'cyan', 
                      'green', 'indigo', 'teal', 'amber', 'rose'
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-slate-900 text-sm">{item.skill}</span>
                          <span className={`text-${color}-600 font-semibold text-sm`}>{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-2 rounded-full transition-all duration-500`}
                            style={{width: `${item.percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-slate-500 py-6 text-sm">
                    No skills data available yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Training Programs CTA */}
          <div className="mt-6 bg-blue-600 rounded-xl p-6 text-center shadow-sm">
            <h3 className="text-xl font-bold text-white mb-2">Want to learn these skills?</h3>
            <p className="text-blue-100 text-sm mb-4">PESO General Santos offers FREE training programs to help you develop in-demand skills</p>
            <a href="/training" className="inline-flex items-center gap-1.5 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:shadow-md transition-shadow text-sm">
              Browse Training Programs <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600">Quick answers to common questions about GensanWorks</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-semibold text-base text-slate-900">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="w-full bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay Connected with GensanWorks</h2>
          <p className="text-base text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest job postings, career tips, and employment news delivered to your inbox.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3 rounded-lg text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-shadow"
              >
                Subscribe
              </Button>
            </div>
          </form>
          
          <p className="text-blue-100 text-xs mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Mobile App Promotion (Future Ready) */}
      <section className="w-full bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Coming Soon</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Take Your Job Search Mobile
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Soon you'll be able to search for jobs, apply instantly, and manage your career from anywhere with the GensanWorks mobile app. Get notified the moment we launch!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-0.5">Instant Job Alerts</h3>
                    <p className="text-slate-400 text-sm">Get real-time notifications for new job matches</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-0.5">One-Tap Apply</h3>
                    <p className="text-slate-400 text-sm">Apply to jobs with a single tap using your saved profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-0.5">Chat with Employers</h3>
                    <p className="text-slate-400 text-sm">Direct messaging with hiring managers on the go</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-5 text-sm font-semibold rounded-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Notify Me at Launch
                </Button>
              </div>

              <div className="flex items-center gap-5 pt-4">
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-7 h-7 bg-white/10 rounded flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">iOS & Android</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-7 h-7 bg-white/10 rounded flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Free Download</span>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-[260px] h-[520px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-slate-800 rounded-[2.5rem] shadow-lg border-[6px] border-slate-700">
                  {/* Screen */}
                  <div className="absolute inset-2 bg-gradient-to-b from-slate-50 to-white rounded-[2rem] overflow-hidden">
                    {/* Content placeholder */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg"></div>
                        <div className="font-semibold text-slate-900 text-sm">GensanWorks</div>
                      </div>
                      {[1,2,3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                          <div className="h-3 bg-slate-200 rounded mb-1.5"></div>
                          <div className="h-2.5 bg-slate-100 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-b-xl"></div>
                </div>
                {/* Floating elements */}
                <div className="absolute -right-6 top-16 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute -left-6 bottom-28 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-10 lg:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-base text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of jobseekers and employers who have found success through GensanWorks. Your next opportunity is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/jobseeker/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-5 text-sm font-semibold rounded-lg">
                  Start as Jobseeker
                </Button>
              </a>
              <a href="/employer/signup">
                <Button variant="outline" size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-0 px-8 py-5 text-sm font-semibold rounded-lg">
                  Start as Employer
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="w-full bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* PESO Information */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/peso-gsc-logo.png" alt="PESO Logo" className="h-10 w-10" />
                <span className="font-bold text-lg">GensanWorks</span>
              </div>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                <span className="font-semibold block mb-0.5">City Government of General Santos</span>
                Public Employment Service Office
              </p>
              <a href="/help" className="text-sm text-primary hover:underline font-medium">Accessibility Statement</a>
            </div>

            {/* Contact us */}
            <div>
              <h3 className="font-bold text-slate-900 mb-5 text-sm">Contact Us</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="/contact" className="text-primary hover:underline font-medium">PESO Helpdesk</a>
                </li>
                <li>
                  <a href="tel:+63831234567" className="text-slate-600 hover:text-primary transition-colors">
                    📞 (083) 123-4567
                  </a>
                </li>
                <li>
                  <a href="mailto:peso@gensancity.gov.ph" className="text-slate-600 hover:text-primary transition-colors">
                    ✉️ peso@gensancity.gov.ph
                  </a>
                </li>
              </ul>
              <h4 className="font-bold text-slate-900 mt-6 mb-3 text-sm">Follow Us</h4>
              <div className="flex gap-2.5">
                <a href="https://www.facebook.com/pesogensan" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-base">📘</span>
                </a>
                <a href="https://twitter.com/pesogensan" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                  <span className="text-base">🐦</span>
                </a>
                <a href="https://www.linkedin.com/company/pesogensan" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <span className="text-base">💼</span>
                </a>
              </div>
            </div>

            {/* About us */}
            <div>
              <h3 className="font-bold text-slate-900 mb-5 text-sm">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/about" className="text-slate-600 hover:text-primary transition-colors">About PESO</a></li>
                <li><a href="/help" className="text-slate-600 hover:text-primary transition-colors">Help & Support</a></li>
                <li><a href="/privacy" className="text-slate-600 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/contact" className="text-slate-600 hover:text-primary transition-colors">Contact Information</a></li>
                <li><a href="/admin/login" className="text-slate-600 hover:text-primary transition-colors">Admin Portal</a></li>
              </ul>
            </div>

            {/* Legal & Resources */}
            <div>
              <h3 className="font-bold text-slate-900 mb-5 text-sm">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="https://dole.gov.ph" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary transition-colors">Department of Labor (DOLE)</a></li>
                <li><a href="https://www.philJobNet.gov.ph" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary transition-colors">PhilJobNet</a></li>
                <li><a href="https://psa.gov.ph" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary transition-colors">Philippine Statistics Authority</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
            <div className="mb-3 md:mb-0">
              <span>© 2025 City Government of General Santos. All rights reserved.</span>
            </div>
            <div>
              <span>Discover more on </span>
              <a href="https://gensancity.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                gensancity.gov.ph
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
