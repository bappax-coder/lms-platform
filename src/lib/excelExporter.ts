import ExcelJS from "exceljs";
import type {
  AssessmentAttempt,
  AuditLog,
  Certificate,
  ComplianceExportRow,
  Course,
  Enrollment,
  LessonProgress,
  Profile,
} from "./types";

export type ExcelColumn<T> = {
  header: string;
  key: keyof T | string;
  width?: number;
  numFmt?: string;
  value?: (row: T) => ExcelJS.CellValue;
};

export type ExcelSheetConfig<T extends object> = {
  name: string;
  columns: ExcelColumn<T>[];
  rows: T[];
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F4E79" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  name: "Calibri",
  size: 11,
};

const ZEBRA_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF2F2F2" },
};

function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function createWorkbook(title = "LMS Export"): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LMS Platform";
  workbook.lastModifiedBy = "LMS Platform";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.title = title;
  return workbook;
}

export function addWorksheet<T extends object>(
  workbook: ExcelJS.Workbook,
  config: ExcelSheetConfig<T>,
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet(config.name.slice(0, 31), {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = config.columns.map((column) => ({
    header: column.header,
    key: String(column.key),
    width: column.width ?? Math.max(14, column.header.length + 4),
    style: column.numFmt ? { numFmt: column.numFmt } : undefined,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.font = HEADER_FONT;
  headerRow.fill = HEADER_FILL;
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 20;

  config.rows.forEach((row, index) => {
    const values: Record<string, ExcelJS.CellValue> = {};

    config.columns.forEach((column) => {
      const key = String(column.key);
      if (column.value) {
        values[key] = column.value(row);
        return;
      }

      const raw = (row as Record<string, unknown>)[key];
      values[key] = (raw ?? "") as ExcelJS.CellValue;
    });

    const excelRow = worksheet.addRow(values);
    if (index % 2 === 1) {
      excelRow.eachCell((cell) => {
        cell.fill = ZEBRA_FILL;
      });
    }
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: config.columns.length },
  };

  return worksheet;
}

export async function workbookToBuffer(
  workbook: ExcelJS.Workbook,
): Promise<Buffer> {
  const uint8 = await workbook.xlsx.writeBuffer();
  return Buffer.from(uint8);
}

export async function workbookToBlob(workbook: ExcelJS.Workbook): Promise<Blob> {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Browser download is only available in the browser.");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadWorkbook(
  workbook: ExcelJS.Workbook,
  filename: string,
): Promise<void> {
  const blob = await workbookToBlob(workbook);
  triggerBrowserDownload(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function buildEnrollmentWorkbook(
  rows: Array<
    Enrollment & {
      learner?: Pick<Profile, "full_name" | "email" | "department">;
      course?: Pick<Course, "title" | "code">;
    }
  >,
): ExcelJS.Workbook {
  const workbook = createWorkbook("Enrollments");
  addWorksheet(workbook, {
    name: "Enrollments",
    rows,
    columns: [
      {
        header: "Learner",
        key: "learner",
        width: 28,
        value: (row) => row.learner?.full_name ?? row.user_id,
      },
      {
        header: "Email",
        key: "email",
        width: 32,
        value: (row) => row.learner?.email ?? "",
      },
      {
        header: "Department",
        key: "department",
        width: 20,
        value: (row) => row.learner?.department ?? "",
      },
      {
        header: "Course",
        key: "course",
        width: 32,
        value: (row) => row.course?.title ?? row.course_id,
      },
      {
        header: "Course code",
        key: "course_code",
        width: 16,
        value: (row) => row.course?.code ?? "",
      },
      { header: "Status", key: "status", width: 14 },
      { header: "Progress %", key: "progress_percent", width: 12 },
      { header: "Score", key: "score", width: 10 },
      {
        header: "Assigned at",
        key: "assigned_at",
        width: 22,
        value: (row) => formatDate(row.assigned_at),
      },
      {
        header: "Due at",
        key: "due_at",
        width: 22,
        value: (row) => formatDate(row.due_at),
      },
      {
        header: "Completed at",
        key: "completed_at",
        width: 22,
        value: (row) => formatDate(row.completed_at),
      },
    ],
  });
  return workbook;
}

export function buildProgressWorkbook(
  rows: Array<
    LessonProgress & {
      lessonTitle?: string;
      courseTitle?: string;
      learnerName?: string;
    }
  >,
): ExcelJS.Workbook {
  const workbook = createWorkbook("Lesson Progress");
  addWorksheet(workbook, {
    name: "Progress",
    rows,
    columns: [
      {
        header: "Learner",
        key: "learnerName",
        width: 28,
        value: (row) => row.learnerName ?? row.user_id,
      },
      {
        header: "Course",
        key: "courseTitle",
        width: 32,
        value: (row) => row.courseTitle ?? "",
      },
      {
        header: "Lesson",
        key: "lessonTitle",
        width: 32,
        value: (row) => row.lessonTitle ?? row.lesson_id,
      },
      { header: "Status", key: "status", width: 14 },
      { header: "Time spent (s)", key: "time_spent_seconds", width: 16 },
      {
        header: "Completed at",
        key: "completed_at",
        width: 22,
        value: (row) => formatDate(row.completed_at),
      },
    ],
  });
  return workbook;
}

export function buildCertificateWorkbook(
  rows: Array<
    Certificate & {
      learnerName?: string;
      courseTitle?: string;
    }
  >,
): ExcelJS.Workbook {
  const workbook = createWorkbook("Certificates");
  addWorksheet(workbook, {
    name: "Certificates",
    rows,
    columns: [
      { header: "Certificate number", key: "certificate_number", width: 24 },
      { header: "Verification code", key: "verification_code", width: 40 },
      {
        header: "Learner",
        key: "learnerName",
        width: 28,
        value: (row) => row.learnerName ?? row.user_id,
      },
      {
        header: "Course",
        key: "courseTitle",
        width: 32,
        value: (row) => row.courseTitle ?? row.course_id,
      },
      { header: "Status", key: "status", width: 14 },
      {
        header: "Issued at",
        key: "issued_at",
        width: 22,
        value: (row) => formatDate(row.issued_at),
      },
      {
        header: "Expires at",
        key: "expires_at",
        width: 22,
        value: (row) => formatDate(row.expires_at),
      },
      {
        header: "Revoked at",
        key: "revoked_at",
        width: 22,
        value: (row) => formatDate(row.revoked_at),
      },
    ],
  });
  return workbook;
}

export function buildAttemptWorkbook(
  rows: Array<
    AssessmentAttempt & {
      learnerName?: string;
      assessmentTitle?: string;
    }
  >,
): ExcelJS.Workbook {
  const workbook = createWorkbook("Assessment Attempts");
  addWorksheet(workbook, {
    name: "Attempts",
    rows,
    columns: [
      {
        header: "Learner",
        key: "learnerName",
        width: 28,
        value: (row) => row.learnerName ?? row.user_id,
      },
      {
        header: "Assessment",
        key: "assessmentTitle",
        width: 28,
        value: (row) => row.assessmentTitle ?? row.assessment_id,
      },
      { header: "Attempt #", key: "attempt_number", width: 12 },
      { header: "Status", key: "status", width: 14 },
      { header: "Score", key: "score", width: 10 },
      {
        header: "Started at",
        key: "started_at",
        width: 22,
        value: (row) => formatDate(row.started_at),
      },
      {
        header: "Submitted at",
        key: "submitted_at",
        width: 22,
        value: (row) => formatDate(row.submitted_at),
      },
    ],
  });
  return workbook;
}

export function buildAuditLogWorkbook(rows: AuditLog[]): ExcelJS.Workbook {
  const workbook = createWorkbook("Audit Log");
  addWorksheet(workbook, {
    name: "Audit",
    rows,
    columns: [
      {
        header: "Created at",
        key: "created_at",
        width: 22,
        value: (row) => formatDate(row.created_at),
      },
      { header: "Action", key: "action", width: 20 },
      { header: "Entity", key: "entity_table", width: 22 },
      { header: "Entity ID", key: "entity_id", width: 38 },
      { header: "Actor ID", key: "actor_id", width: 38 },
      { header: "Organization ID", key: "organization_id", width: 38 },
      { header: "IP address", key: "ip_address", width: 18 },
      {
        header: "Metadata",
        key: "metadata",
        width: 50,
        value: (row) => JSON.stringify(row.metadata ?? {}),
      },
    ],
  });
  return workbook;
}

export function buildComplianceWorkbook(
  rows: ComplianceExportRow[],
): ExcelJS.Workbook {
  const workbook = createWorkbook("Training Compliance");
  const worksheet = addWorksheet(workbook, {
    name: "Compliance",
    rows,
    columns: [
      { header: "Learner", key: "learnerName", width: 28 },
      { header: "Email", key: "email", width: 32 },
      { header: "Department", key: "department", width: 20 },
      { header: "Course", key: "courseTitle", width: 32 },
      { header: "Course code", key: "courseCode", width: 16 },
      { header: "Compliance", key: "status", width: 14 },
      { header: "Enrollment", key: "enrollmentStatus", width: 14 },
      { header: "Progress %", key: "progressPercent", width: 12 },
      { header: "Score", key: "score", width: 10 },
      { header: "Days until due", key: "daysUntilDue", width: 16 },
      { header: "Due at", key: "dueAt", width: 22 },
      { header: "Completed at", key: "completedAt", width: 22 },
      { header: "Certificate", key: "certificateNumber", width: 24 },
    ],
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const status = String(row.getCell("status").value ?? "");
    const colors: Record<string, string> = {
      compliant: "FFC6EFCE",
      at_risk: "FFFFEB9C",
      overdue: "FFFFC7CE",
      not_started: "FFDDEBF7",
      exempt: "FFD9D9D9",
      revoked: "FFFFC7CE",
    };
    const fillColor = colors[status];
    if (fillColor) {
      row.getCell("status").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
    }
  });

  return workbook;
}

export async function exportEnrollmentsXlsx(
  rows: Parameters<typeof buildEnrollmentWorkbook>[0],
): Promise<Buffer> {
  return workbookToBuffer(buildEnrollmentWorkbook(rows));
}

export async function exportProgressXlsx(
  rows: Parameters<typeof buildProgressWorkbook>[0],
): Promise<Buffer> {
  return workbookToBuffer(buildProgressWorkbook(rows));
}

export async function exportCertificatesXlsx(
  rows: Parameters<typeof buildCertificateWorkbook>[0],
): Promise<Buffer> {
  return workbookToBuffer(buildCertificateWorkbook(rows));
}

export async function exportAttemptsXlsx(
  rows: Parameters<typeof buildAttemptWorkbook>[0],
): Promise<Buffer> {
  return workbookToBuffer(buildAttemptWorkbook(rows));
}

export async function exportAuditLogsXlsx(rows: AuditLog[]): Promise<Buffer> {
  return workbookToBuffer(buildAuditLogWorkbook(rows));
}

export async function exportComplianceXlsx(
  rows: ComplianceExportRow[],
): Promise<Buffer> {
  return workbookToBuffer(buildComplianceWorkbook(rows));
}
