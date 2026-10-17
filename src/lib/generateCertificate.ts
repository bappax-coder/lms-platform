import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  type RGB,
} from "pdf-lib";
import type { CertificateStatus } from "./types";

export interface CertificatePayload {
  learnerName: string;
  courseTitle: string;
  courseCode?: string;
  organizationName: string;
  legalName?: string | null;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: Date | string;
  expiresAt?: Date | string | null;
  instructorName?: string | null;
  verificationUrl?: string | null;
  logoBytes?: Uint8Array | ArrayBuffer | null;
  logoMimeType?: "png" | "jpg" | "jpeg";
  primaryColor?: string | null;
  status?: CertificateStatus;
}

export interface GeneratedCertificate {
  bytes: Uint8Array;
  fileName: string;
  verificationCode: string;
  mimeType: "application/pdf";
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

function parseDate(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid certificate date.");
  }
  return date;
}

function formatDisplayDate(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "certificate";
}

function hexToRgb(hex: string | null | undefined, fallback: RGB): RGB {
  if (!hex) {
    return fallback;
  }

  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return fallback;
  }

  const value = Number.parseInt(full, 16);
  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

export async function sha256Hex(input: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(input),
    );
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(input).digest("hex");
}

export async function buildCertificateVerificationCode(input: {
  certificateNumber: string;
  learnerName: string;
  courseTitle: string;
  issuedAt: Date | string;
}): Promise<string> {
  const issuedAt = parseDate(input.issuedAt).toISOString();
  const material = [
    input.certificateNumber,
    input.learnerName.trim().toLowerCase(),
    input.courseTitle.trim().toLowerCase(),
    issuedAt,
  ].join("|");
  return sha256Hex(material);
}

export function verifyCertificateCode(
  expected: string,
  actual: string,
): boolean {
  if (expected.length !== actual.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  }
  return mismatch === 0;
}

function drawDoubleBorder(
  page: ReturnType<PDFDocument["addPage"]>,
  color: RGB,
): void {
  page.drawRectangle({
    x: 24,
    y: 24,
    width: PAGE_WIDTH - 48,
    height: PAGE_HEIGHT - 48,
    borderColor: color,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: PAGE_WIDTH - 68,
    height: PAGE_HEIGHT - 68,
    borderColor: rgb(0.72, 0.62, 0.28),
    borderWidth: 1,
  });
}

export async function generateCertificatePdf(
  payload: CertificatePayload,
): Promise<GeneratedCertificate> {
  const issuedAt = parseDate(payload.issuedAt);
  const expiresAt = payload.expiresAt ? parseDate(payload.expiresAt) : null;
  const primary = hexToRgb(payload.primaryColor, rgb(0.12, 0.31, 0.47));
  const ink = rgb(0.12, 0.14, 0.16);
  const muted = rgb(0.35, 0.38, 0.42);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificate of Completion — ${payload.learnerName}`);
  pdf.setAuthor(payload.organizationName);
  pdf.setSubject(payload.courseTitle);
  pdf.setKeywords([
    payload.certificateNumber,
    payload.verificationCode,
    payload.courseCode ?? "",
  ]);
  pdf.setCreationDate(issuedAt);
  pdf.setModificationDate(new Date());
  pdf.setProducer("LMS Platform");

  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  drawDoubleBorder(page, primary);

  page.drawText("CERTIFICATE OF COMPLETION", {
    x: 0,
    y: 0,
    size: 42,
    font: serifBold,
    color: rgb(0.86, 0.89, 0.92),
    rotate: degrees(28),
    opacity: 0.18,
  });

  if (payload.logoBytes) {
    const bytes =
      payload.logoBytes instanceof Uint8Array
        ? payload.logoBytes
        : new Uint8Array(payload.logoBytes);
    const mime = payload.logoMimeType ?? "png";
    const image =
      mime === "jpg" || mime === "jpeg"
        ? await pdf.embedJpg(bytes)
        : await pdf.embedPng(bytes);
    const scaled = image.scaleToFit(120, 56);
    page.drawImage(image, {
      x: PAGE_WIDTH / 2 - scaled.width / 2,
      y: 500,
      width: scaled.width,
      height: scaled.height,
    });
  }

  const orgLabel = payload.organizationName.toUpperCase();
  const orgWidth = sansBold.widthOfTextAtSize(orgLabel, 12);
  page.drawText(orgLabel, {
    x: PAGE_WIDTH / 2 - orgWidth / 2,
    y: payload.logoBytes ? 478 : 510,
    size: 12,
    font: sansBold,
    color: primary,
  });

  page.drawText("Certificate of Completion", {
    x: PAGE_WIDTH / 2 - serifBold.widthOfTextAtSize("Certificate of Completion", 32) / 2,
    y: 430,
    size: 32,
    font: serifBold,
    color: primary,
  });

  page.drawText("This is to certify that", {
    x: PAGE_WIDTH / 2 - serifItalic.widthOfTextAtSize("This is to certify that", 14) / 2,
    y: 392,
    size: 14,
    font: serifItalic,
    color: muted,
  });

  page.drawText(payload.learnerName, {
    x: PAGE_WIDTH / 2 - serifBold.widthOfTextAtSize(payload.learnerName, 28) / 2,
    y: 348,
    size: 28,
    font: serifBold,
    color: ink,
  });

  page.drawLine({
    start: { x: 180, y: 338 },
    end: { x: PAGE_WIDTH - 180, y: 338 },
    thickness: 0.8,
    color: rgb(0.72, 0.62, 0.28),
  });

  page.drawText("has successfully completed", {
    x:
      PAGE_WIDTH / 2 -
      serif.widthOfTextAtSize("has successfully completed", 14) / 2,
    y: 312,
    size: 14,
    font: serif,
    color: muted,
  });

  page.drawText(payload.courseTitle, {
    x: PAGE_WIDTH / 2 - serifBold.widthOfTextAtSize(payload.courseTitle, 20) / 2,
    y: 278,
    size: 20,
    font: serifBold,
    color: ink,
  });

  if (payload.courseCode) {
    const codeLabel = `Course code: ${payload.courseCode}`;
    page.drawText(codeLabel, {
      x: PAGE_WIDTH / 2 - sans.widthOfTextAtSize(codeLabel, 11) / 2,
      y: 256,
      size: 11,
      font: sans,
      color: muted,
    });
  }

  const issuedLabel = `Issued on ${formatDisplayDate(issuedAt)}`;
  page.drawText(issuedLabel, {
    x: PAGE_WIDTH / 2 - sans.widthOfTextAtSize(issuedLabel, 12) / 2,
    y: 226,
    size: 12,
    font: sans,
    color: ink,
  });

  if (expiresAt) {
    const expiryLabel = `Valid until ${formatDisplayDate(expiresAt)}`;
    page.drawText(expiryLabel, {
      x: PAGE_WIDTH / 2 - sans.widthOfTextAtSize(expiryLabel, 11) / 2,
      y: 208,
      size: 11,
      font: sans,
      color: muted,
    });
  }

  page.drawLine({
    start: { x: 120, y: 150 },
    end: { x: 280, y: 150 },
    thickness: 1,
    color: primary,
  });
  page.drawText(payload.instructorName || "Authorized Instructor", {
    x: 120,
    y: 132,
    size: 10,
    font: sans,
    color: ink,
  });
  page.drawText("Instructor / Authorized signatory", {
    x: 120,
    y: 118,
    size: 9,
    font: sans,
    color: muted,
  });

  page.drawLine({
    start: { x: PAGE_WIDTH - 280, y: 150 },
    end: { x: PAGE_WIDTH - 120, y: 150 },
    thickness: 1,
    color: primary,
  });
  page.drawText(payload.legalName || payload.organizationName, {
    x: PAGE_WIDTH - 280,
    y: 132,
    size: 10,
    font: sans,
    color: ink,
  });
  page.drawText("Issuing organization", {
    x: PAGE_WIDTH - 280,
    y: 118,
    size: 9,
    font: sans,
    color: muted,
  });

  const footerY = 58;
  page.drawText(`Certificate No. ${payload.certificateNumber}`, {
    x: 56,
    y: footerY,
    size: 9,
    font: sans,
    color: muted,
  });
  page.drawText(`Verification: ${payload.verificationCode.slice(0, 32)}`, {
    x: 56,
    y: footerY - 14,
    size: 8,
    font: sans,
    color: muted,
  });

  if (payload.verificationUrl) {
    page.drawText(payload.verificationUrl, {
      x:
        PAGE_WIDTH -
        56 -
        sans.widthOfTextAtSize(payload.verificationUrl, 8),
      y: footerY - 14,
      size: 8,
      font: sans,
      color: primary,
    });
  }

  if (payload.status && payload.status !== "issued") {
    page.drawText(payload.status.toUpperCase(), {
      x: PAGE_WIDTH / 2 - sansBold.widthOfTextAtSize(payload.status.toUpperCase(), 36) / 2,
      y: PAGE_HEIGHT / 2 - 18,
      size: 36,
      font: sansBold,
      color: rgb(0.75, 0.16, 0.16),
      rotate: degrees(-18),
      opacity: 0.55,
    });
  }

  const bytes = await pdf.save();
  const fileName = `${sanitizeFilePart(payload.certificateNumber)}-${sanitizeFilePart(payload.learnerName)}.pdf`;

  return {
    bytes,
    fileName,
    verificationCode: payload.verificationCode,
    mimeType: "application/pdf",
  };
}

export async function generateIssuedCertificate(
  payload: Omit<CertificatePayload, "verificationCode"> & {
    verificationCode?: string;
  },
): Promise<GeneratedCertificate> {
  const verificationCode =
    payload.verificationCode ??
    (await buildCertificateVerificationCode({
      certificateNumber: payload.certificateNumber,
      learnerName: payload.learnerName,
      courseTitle: payload.courseTitle,
      issuedAt: payload.issuedAt,
    }));

  return generateCertificatePdf({
    ...payload,
    verificationCode,
    status: payload.status ?? "issued",
  });
}
