import type { ParsedProfile } from "@/lib/types";
import { tokenize } from "@/lib/text-similarity";

const knownSkills = [
  "administration",
  "communication",
  "customer service",
  "documentation",
  "first aid",
  "hr coordination",
  "operations",
  "safety",
  "scheduling",
  "training",
];

export async function extractCvText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const parsed = await parser.getText();
      return parsed.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }

  throw new Error("Upload a PDF or DOCX CV.");
}

export function parseProfileFromText(rawText: string): ParsedProfile {
  const normalized = rawText.toLowerCase();
  const skills = knownSkills.filter((skill) => normalized.includes(skill));
  const yearsMatch = normalized.match(/(\d{1,2})\+?\s+(?:years|yrs)/);
  const yearsExperience = yearsMatch ? Number(yearsMatch[1]) : 0;
  const education = [
    "high school diploma",
    "associate degree",
    "bachelor",
    "master",
  ].filter((item) => normalized.includes(item));
  const certifications = ["first aid", "cpr", "osha"].filter((item) =>
    normalized.includes(item),
  );

  return {
    rawText,
    skills: skills.length > 0 ? skills : Array.from(new Set(tokenize(rawText))).slice(0, 8),
    education,
    certifications,
    yearsExperience,
  };
}
