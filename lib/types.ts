export type ApplicationStatus =
  | "submitted"
  | "screening"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired";

export type JobStatus = "draft" | "published" | "closed";

export type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  status: JobStatus;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  education: string[];
  certifications: string[];
  minYearsExperience: number;
  weights: ScreeningWeights;
  createdAt: string;
};

export type Applicant = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
};

export type ParsedProfile = {
  rawText: string;
  skills: string[];
  education: string[];
  certifications: string[];
  yearsExperience: number;
};

export type ScreeningWeights = {
  semantic: number;
  skills: number;
  experience: number;
  education: number;
  certifications: number;
};

export type ScoreBreakdown = {
  semanticScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  certificationsScore: number;
  ruleBasedScore: number;
  finalScore: number;
  matchedRequirements: string[];
  weakAreas: string[];
  explanation: string;
};

export type ApplicationDocument = {
  id: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type Application = {
  id: string;
  jobId: string;
  applicant: Applicant;
  status: ApplicationStatus;
  coverNote?: string;
  parsedProfile?: ParsedProfile;
  documents?: ApplicationDocument[];
  score?: ScoreBreakdown;
  overrideReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditEventType =
  | "application.created"
  | "document.uploaded"
  | "document.parsed"
  | "score.generated"
  | "status.changed"
  | "override.created"
  | "job.created"
  | "job.updated"
  | "job.published"
  | "job.unpublished";
