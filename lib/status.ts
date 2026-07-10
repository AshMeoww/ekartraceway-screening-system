import type { ApplicationStatus } from "@/lib/types";

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ["screening", "rejected"],
  screening: ["shortlisted", "interview", "rejected"],
  shortlisted: ["interview", "rejected"],
  interview: ["hired", "rejected"],
  rejected: ["screening"],
  hired: [],
};

export function canTransitionStatus(from: ApplicationStatus, to: ApplicationStatus) {
  return from === to || allowedTransitions[from].includes(to);
}

export function assertStatusTransition(from: ApplicationStatus, to: ApplicationStatus) {
  if (!canTransitionStatus(from, to)) {
    throw new Error(`Cannot move application from ${from} to ${to}.`);
  }
}
