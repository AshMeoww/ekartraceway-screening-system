import type { ParsedProfile } from "@/lib/types";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  isSupportedImageCv,
  MAX_CV_FILE_BYTES,
  MAX_OCR_PDF_PAGES,
  needsOcrFallback,
  recognizeImageText,
  recognizeImagesText,
} from "@/lib/ocr";
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

function pdfWorkerUrl() {
  return pathToFileURL(
    path.join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "worker",
      "pdf.worker.mjs",
    ),
  ).href;
}

export async function extractCvText(file: File) {
  if (file.size > MAX_CV_FILE_BYTES) {
    throw new Error("Upload a CV that is 10 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(pdfWorkerUrl());
    const parser = new PDFParse({ data: buffer });

    try {
      const parsed = await parser.getText();
      const directText = parsed.text.trim();

      if (!needsOcrFallback(directText)) {
        return directText;
      }

      const screenshots = await parser.getScreenshot({
        first: MAX_OCR_PDF_PAGES,
        imageBuffer: true,
        scale: 1.5,
      });
      const images = screenshots.pages
        .map((page) => page.data)
        .filter((data) => data.byteLength > 0)
        .map((data) => Buffer.from(data));
      const ocrText = await recognizeImagesText(images);

      if (!ocrText) {
        throw new Error("CV text could not be extracted. Upload a clearer PDF or DOCX CV.");
      }

      return ocrText;
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

  if (isSupportedImageCv(file.name, file.type)) {
    const ocrText = await recognizeImageText(buffer);

    if (!ocrText) {
      throw new Error("CV text could not be extracted. Upload a clearer image, PDF, or DOCX CV.");
    }

    return ocrText;
  }

  throw new Error("Upload a PDF, DOCX, PNG, JPG, WEBP, BMP, or TIFF CV.");
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
