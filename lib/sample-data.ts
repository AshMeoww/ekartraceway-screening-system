import type { Application, Job } from "@/lib/types";
import { scoreApplicant } from "@/lib/scoring";

export const defaultWeights = {
  semantic: 35,
  skills: 30,
  experience: 20,
  education: 10,
  certifications: 5,
};

export const sampleJobs: Job[] = [
  {
    id: "job-track-associate",
    slug: "track-operations-associate",
    title: "Track Operations Associate",
    department: "Operations",
    location: "To be confirmed",
    employmentType: "Full-time",
    status: "published",
    summary:
      "Support guest flow, track readiness, safety briefings, and daily operations for an electric karting venue.",
    responsibilities: [
      "Coordinate guest check-in and session staging.",
      "Support safety briefings and race turnaround workflows.",
      "Document incidents and operational handoffs clearly.",
    ],
    requirements: [
      "Customer service experience",
      "Comfort working in fast-paced operations",
      "Clear communication and safety awareness",
    ],
    skills: ["customer service", "operations", "safety", "communication"],
    education: ["high school diploma"],
    certifications: ["first aid"],
    minYearsExperience: 1,
    weights: defaultWeights,
    createdAt: "2026-07-10T00:00:00.000Z",
  },
  {
    id: "job-hr-coordinator",
    slug: "hr-coordinator",
    title: "HR Coordinator",
    department: "People",
    location: "Hybrid",
    employmentType: "Part-time",
    status: "published",
    summary:
      "Coordinate applicant intake, screening documentation, and human-reviewed hiring workflows.",
    responsibilities: [
      "Maintain applicant records and screening notes.",
      "Coordinate interview scheduling and status updates.",
      "Keep hiring documentation accurate and auditable.",
    ],
    requirements: [
      "HR or administrative coordination experience",
      "Strong attention to detail",
      "Comfort with applicant tracking tools",
    ],
    skills: ["hr coordination", "administration", "documentation", "scheduling"],
    education: ["associate degree"],
    certifications: [],
    minYearsExperience: 2,
    weights: defaultWeights,
    createdAt: "2026-07-10T00:00:00.000Z",
  },
];

const sampleParsedProfile = {
  rawText:
    "Customer service associate with 3 years of operations experience. Skilled in safety briefings, scheduling, documentation, and guest communication. First aid certified.",
  skills: ["customer service", "operations", "safety", "communication", "scheduling"],
  education: ["high school diploma"],
  certifications: ["first aid"],
  yearsExperience: 3,
};

export const sampleApplications: Application[] = [
  {
    id: "app-demo-001",
    jobId: "job-track-associate",
    applicant: {
      id: "applicant-demo-001",
      fullName: "Demo Applicant",
      email: "demo.applicant@example.com",
      phone: "555-0100",
    },
    status: "screening",
    coverNote: "Interested in helping launch an organized guest operations flow.",
    parsedProfile: sampleParsedProfile,
    score: scoreApplicant(sampleJobs[0], sampleParsedProfile),
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
  },
];
