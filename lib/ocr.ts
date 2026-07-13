export const MIN_DIRECT_TEXT_CHARACTERS = 120;
export const MAX_CV_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_OCR_PDF_PAGES = 2;

const supportedImageTypes = new Set([
  "image/bmp",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/tiff",
  "image/webp",
]);

const supportedImageExtensions = [".bmp", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"];

export function isSupportedImageCv(fileName: string, mimeType?: string) {
  const normalizedName = fileName.toLowerCase();
  return (
    supportedImageTypes.has(mimeType?.toLowerCase() ?? "") ||
    supportedImageExtensions.some((extension) => normalizedName.endsWith(extension))
  );
}

export function needsOcrFallback(text: string) {
  return text.replace(/\s+/g, " ").trim().length < MIN_DIRECT_TEXT_CHARACTERS;
}

function friendlyOcrError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "OCR could not read this CV.";
}

export async function recognizeImageText(image: Buffer) {
  try {
    const tesseract = await import("tesseract.js");
    const recognize = tesseract.recognize ?? tesseract.default?.recognize;

    if (!recognize) {
      throw new Error("Tesseract OCR is not available in this runtime.");
    }

    const result = await recognize(image, "eng", {
      logger: () => undefined,
    });

    return result.data.text.trim();
  } catch (error) {
    throw new Error(`OCR failed. ${friendlyOcrError(error)}`);
  }
}

export async function recognizeImagesText(images: Buffer[]) {
  const pages = images.slice(0, MAX_OCR_PDF_PAGES);
  const textByPage = await Promise.all(pages.map((image) => recognizeImageText(image)));
  return textByPage.join("\n\n").trim();
}

