import type {
  AssessmentAttempt,
  AuditAction,
  AuditLog,
  Certificate,
  ComplianceExportRow,
  Consent,
  Course,
  CourseRequirement,
  DataSubjectRequest,
  Enrollment,
  Json,
  LegalHold,
  Lesson,
  LessonCompletionRule,
  LessonProgress,
  OrganizationMember,
  PiiField,
  Profile,
  RetentionPolicy,
  TablesInsert,
  TrainingComplianceStatus,
} from "./types";
import { DEFAULT_LESSON_COMPLETION_RULE, PII_FIELDS } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const GDPR_DSAR_SLA_DAYS = 30;
const AT_RISK_WINDOW_DAYS = 14;

export interface ComplianceItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  mandatory: boolean;
  status: TrainingComplianceStatus;
  enrollment: Enrollment | null;
  certificate: Certificate | null;
  dueAt: Date | null;
  completedAt: Date | null;
  daysUntilDue: number | null;
  score: number | null;
  reasons: string[];
}

export interface LearnerComplianceReport {
  userId: string;
  learnerName: string;
  email: string;
  department: string | null;
  generatedAt: string;
  overallStatus: TrainingComplianceStatus;
  completionRate: number;
  items: ComplianceItem[];
  overdueCount: number;
  atRiskCount: number;
  nextDueAt: string | null;
}

export interface OrganizationComplianceSummary {
  organizationId: string;
  generatedAt: string;
  learnerCount: number;
  itemCount: number;
  compliantCount: number;
  overdueCount: number;
  atRiskCount: number;
  notStartedCount: number;
  completionRate: number;
  rows: ComplianceExportRow[];
}

export interface PortableLearnerRecord {
  subject: Pick<
    Profile,
    "id" | "email" | "full_name" | "job_title" | "department" | "locale" | "timezone"
  >;
  memberships: OrganizationMember[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  attempts: AssessmentAttempt[];
  certificates: Certificate[];
  consents: Consent[];
  exportedAt: string;
  format: "application/json";
}

export interface ErasureDecision {
  allowed: boolean;
  blockedReasons: string[];
  anonymizeInstead: boolean;
}

export interface CompletionEvaluation {
  complete: boolean;
  progressPercent: number;
  reasons: string[];
}

export interface AuditEventInput {
  organizationId?: string | null;
  actorId?: string | null;
  action: AuditAction;
  entityTable: string;
  entityId?: string | null;
  metadata?: Record<string, Json | undefined>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function diffDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addMonths(date: Date, months: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

export function recertificationDueDate(
  completedAt: Date,
  recertificationMonths: number | null | undefined,
): Date | null {
  if (!recertificationMonths || recertificationMonths <= 0) {
    return null;
  }
  return addMonths(completedAt, recertificationMonths);
}

export function dsarDueDate(receivedAt: Date = new Date()): Date {
  return addDays(receivedAt, GDPR_DSAR_SLA_DAYS);
}

export function isActiveLegalHold(
  holds: LegalHold[],
  userId: string,
  at: Date = new Date(),
): boolean {
  return holds.some((hold) => {
    if (hold.user_id !== userId) {
      return false;
    }
    const started = toDate(hold.started_at);
    const released = toDate(hold.released_at);
    if (!started || started > at) {
      return false;
    }
    return !released || released > at;
  });
}

export function hasValidConsent(
  consents: Consent[],
  purpose: Consent["purpose"],
  policyVersion?: string,
): boolean {
  return consents.some((consent) => {
    if (consent.purpose !== purpose || !consent.granted || consent.withdrawn_at) {
      return false;
    }
    if (policyVersion && consent.policy_version !== policyVersion) {
      return false;
    }
    return true;
  });
}

export function classifyPii(record: Record<string, unknown>): PiiField[] {
  return PII_FIELDS.filter((field) => {
    const value = record[field];
    return value !== undefined && value !== null && value !== "";
  });
}

export function redactPii<T extends Record<string, unknown>>(record: T): T {
  const copy = { ...record };
  for (const field of PII_FIELDS) {
    if (field in copy && copy[field]) {
      (copy as Record<string, unknown>)[field] = "[REDACTED]";
    }
  }
  return copy;
}

export function computeRetentionExpiry(
  createdAt: Date | string,
  policy: Pick<RetentionPolicy, "retain_days">,
): Date {
  const created = toDate(createdAt);
  if (!created) {
    throw new Error("Invalid createdAt for retention calculation.");
  }
  return addDays(created, policy.retain_days);
}

export function shouldAnonymize(
  createdAt: Date | string,
  policy: RetentionPolicy,
  at: Date = new Date(),
): boolean {
  if (!policy.anonymize) {
    return false;
  }
  return computeRetentionExpiry(createdAt, policy) <= at;
}

export function evaluateLessonCompletion(
  lessons: Lesson[],
  progress: LessonProgress[],
  enrollment: Pick<Enrollment, "score" | "progress_percent">,
  rule: LessonCompletionRule = DEFAULT_LESSON_COMPLETION_RULE,
): CompletionEvaluation {
  const reasons: string[] = [];
  const requiredLessons = lessons.filter((lesson) => lesson.is_required);
  const progressByLesson = new Map(progress.map((item) => [item.lesson_id, item]));

  const completedRequired = requiredLessons.filter((lesson) => {
    const item = progressByLesson.get(lesson.id);
    return item?.status === "completed";
  });

  if (rule.requireAllRequiredLessons && completedRequired.length < requiredLessons.length) {
    reasons.push(
      `Required lessons incomplete (${completedRequired.length}/${requiredLessons.length}).`,
    );
  }

  const totalTime = progress.reduce((sum, item) => sum + item.time_spent_seconds, 0);
  if (totalTime < rule.minimumTimeSeconds) {
    reasons.push(
      `Minimum time not met (${totalTime}s of ${rule.minimumTimeSeconds}s).`,
    );
  }

  const score = enrollment.score ?? 0;
  if (score < rule.minimumScore) {
    reasons.push(`Minimum score not met (${score} of ${rule.minimumScore}).`);
  }

  const totalLessons = lessons.length || 1;
  const completedLessons = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed").length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return {
    complete: reasons.length === 0,
    progressPercent,
    reasons,
  };
}

function requirementMatchesMember(
  requirement: CourseRequirement,
  member: OrganizationMember,
): boolean {
  const roleOk = !requirement.target_role || requirement.target_role === member.member_role;
  const departmentOk =
    !requirement.target_department ||
    requirement.target_department.toLowerCase() === (member.department ?? "").toLowerCase();
  return roleOk && departmentOk;
}

function resolveDueAt(
  requirement: CourseRequirement | undefined,
  enrollment: Enrollment | null,
  member: OrganizationMember,
): Date | null {
  if (enrollment?.due_at) {
    return toDate(enrollment.due_at);
  }
  if (!requirement) {
    return null;
  }
  const origin = toDate(enrollment?.assigned_at) ?? toDate(member.hired_at) ?? toDate(member.created_at);
  if (!origin) {
    return null;
  }
  return addDays(origin, requirement.due_days_from_assignment);
}

function certificateIsValid(certificate: Certificate | null, at: Date): boolean {
  if (!certificate || certificate.status !== "issued") {
    return false;
  }
  const expires = toDate(certificate.expires_at);
  return !expires || expires > at;
}

function deriveItemStatus(input: {
  enrollment: Enrollment | null;
  certificate: Certificate | null;
  dueAt: Date | null;
  at: Date;
  mandatory: boolean;
}): { status: TrainingComplianceStatus; reasons: string[] } {
  const reasons: string[] = [];
  const { enrollment, certificate, dueAt, at, mandatory } = input;

  if (!mandatory && !enrollment) {
    return { status: "exempt", reasons: ["Course is not assigned and is not mandatory."] };
  }

  if (certificate?.status === "revoked") {
    reasons.push("Certificate has been revoked.");
    return { status: "revoked", reasons };
  }

  if (certificateIsValid(certificate, at) && enrollment?.status === "completed") {
    return { status: "compliant", reasons };
  }

  if (enrollment?.status === "completed" && !certificateIsValid(certificate, at)) {
    reasons.push("Completion recorded but certificate is missing, expired, or invalid.");
    if (dueAt && dueAt < at) {
      return { status: "overdue", reasons };
    }
    return { status: "at_risk", reasons };
  }

  if (!enrollment || enrollment.status === "invited" || enrollment.status === "active") {
    if (dueAt && dueAt < at) {
      reasons.push("Training is past due.");
      return { status: "overdue", reasons };
    }
    if (dueAt && diffDays(at, dueAt) <= AT_RISK_WINDOW_DAYS) {
      reasons.push(`Due within ${AT_RISK_WINDOW_DAYS} days.`);
      return { status: "at_risk", reasons };
    }
    if (!enrollment || enrollment.status === "invited") {
      return { status: "not_started", reasons };
    }
    return { status: "at_risk", reasons: ["Training is in progress."] };
  }

  if (enrollment.status === "failed" || enrollment.status === "expired") {
    reasons.push(`Enrollment status is ${enrollment.status}.`);
    return { status: dueAt && dueAt < at ? "overdue" : "at_risk", reasons };
  }

  if (enrollment.status === "dropped") {
    return { status: mandatory ? "overdue" : "exempt", reasons: ["Enrollment was dropped."] };
  }

  return { status: "not_started", reasons };
}

function rankStatus(status: TrainingComplianceStatus): number {
  const order: Record<TrainingComplianceStatus, number> = {
    overdue: 0,
    revoked: 1,
    at_risk: 2,
    not_started: 3,
    exempt: 4,
    compliant: 5,
  };
  return order[status];
}

export function evaluateLearnerCompliance(input: {
  member: OrganizationMember;
  profile: Profile;
  courses: Course[];
  requirements: CourseRequirement[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  at?: Date;
}): LearnerComplianceReport {
  const at = input.at ?? new Date();
  const enrollmentByCourse = new Map(input.enrollments.map((item) => [item.course_id, item]));
  const certificateByEnrollment = new Map(
    input.certificates.map((item) => [item.enrollment_id, item]),
  );
  const courseById = new Map(input.courses.map((course) => [course.id, course]));

  const requirementCourseIds = new Set(
    input.requirements
      .filter((requirement) => requirementMatchesMember(requirement, input.member))
      .map((requirement) => requirement.course_id),
  );

  const assignedCourseIds = new Set(input.enrollments.map((item) => item.course_id));
  const courseIds = new Set([...requirementCourseIds, ...assignedCourseIds]);

  const items: ComplianceItem[] = [...courseIds].flatMap((courseId) => {
    const course = courseById.get(courseId);
    if (!course) {
      return [];
    }

    const requirement = input.requirements.find(
      (item) => item.course_id === courseId && requirementMatchesMember(item, input.member),
    );
    const enrollment = enrollmentByCourse.get(courseId) ?? null;
    const certificate = enrollment
      ? certificateByEnrollment.get(enrollment.id) ?? null
      : null;
    const dueAt = resolveDueAt(requirement, enrollment, input.member);
    const { status, reasons } = deriveItemStatus({
      enrollment,
      certificate,
      dueAt,
      at,
      mandatory: Boolean(requirement?.is_mandatory),
    });

    const completedAt = toDate(enrollment?.completed_at);
    const recertDue = completedAt
      ? recertificationDueDate(completedAt, course.recertification_months)
      : null;
    const effectiveDue = recertDue && dueAt ? (recertDue < dueAt ? recertDue : dueAt) : recertDue ?? dueAt;

    return [
      {
        courseId: course.id,
        courseTitle: course.title,
        courseCode: course.code,
        mandatory: Boolean(requirement?.is_mandatory),
        status,
        enrollment,
        certificate,
        dueAt: effectiveDue,
        completedAt,
        daysUntilDue: effectiveDue ? diffDays(at, effectiveDue) : null,
        score: enrollment?.score ?? null,
        reasons,
      },
    ];
  });

  const actionable = items.filter((item) => item.status !== "exempt");
  const overdueCount = items.filter((item) => item.status === "overdue" || item.status === "revoked").length;
  const atRiskCount = items.filter((item) => item.status === "at_risk").length;
  const compliantCount = items.filter((item) => item.status === "compliant").length;
  const overallStatus = items.reduce<TrainingComplianceStatus>((worst, item) => {
    return rankStatus(item.status) < rankStatus(worst) ? item.status : worst;
  }, "compliant");

  const nextDue = items
    .map((item) => item.dueAt)
    .filter((date): date is Date => Boolean(date) && date > at)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return {
    userId: input.profile.id,
    learnerName: input.profile.full_name,
    email: input.profile.email,
    department: input.member.department ?? input.profile.department,
    generatedAt: at.toISOString(),
    overallStatus: actionable.length === 0 ? "exempt" : overallStatus,
    completionRate: actionable.length === 0 ? 100 : Math.round((compliantCount / actionable.length) * 100),
    items,
    overdueCount,
    atRiskCount,
    nextDueAt: nextDue ? nextDue.toISOString() : null,
  };
}

export function evaluateOrganizationCompliance(input: {
  organizationId: string;
  reports: LearnerComplianceReport[];
}): OrganizationComplianceSummary {
  const rows: ComplianceExportRow[] = input.reports.flatMap((report) =>
    report.items.map((item) => ({
      learnerName: report.learnerName,
      email: report.email,
      department: report.department ?? "",
      courseTitle: item.courseTitle,
      courseCode: item.courseCode,
      status: item.status,
      enrollmentStatus: item.enrollment?.status ?? "unassigned",
      progressPercent: item.enrollment?.progress_percent ?? 0,
      score: item.score,
      dueAt: item.dueAt ? item.dueAt.toISOString() : null,
      completedAt: item.completedAt ? item.completedAt.toISOString() : null,
      certificateNumber: item.certificate?.certificate_number ?? null,
      daysUntilDue: item.daysUntilDue,
    })),
  );

  const itemCount = rows.length;
  const compliantCount = rows.filter((row) => row.status === "compliant").length;
  const overdueCount = rows.filter((row) => row.status === "overdue").length;
  const atRiskCount = rows.filter((row) => row.status === "at_risk").length;
  const notStartedCount = rows.filter((row) => row.status === "not_started").length;

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    learnerCount: input.reports.length,
    itemCount,
    compliantCount,
    overdueCount,
    atRiskCount,
    notStartedCount,
    completionRate: itemCount === 0 ? 100 : Math.round((compliantCount / itemCount) * 100),
    rows,
  };
}

export function isErasureBlocked(input: {
  userId: string;
  holds: LegalHold[];
  certificates: Certificate[];
  openRequests: DataSubjectRequest[];
  consents: Consent[];
  retainTrainingRecordsByLaw?: boolean;
  at?: Date;
}): ErasureDecision {
  const at = input.at ?? new Date();
  const blockedReasons: string[] = [];

  if (isActiveLegalHold(input.holds, input.userId, at)) {
    blockedReasons.push("An active legal hold prevents erasure.");
  }

  const open = input.openRequests.filter(
    (request) =>
      request.user_id === input.userId &&
      request.status !== "completed" &&
      request.status !== "rejected",
  );
  if (open.length > 0) {
    blockedReasons.push("Another data-subject request is already in progress.");
  }

  const liveCertificates = input.certificates.filter(
    (certificate) =>
      certificate.user_id === input.userId &&
      certificate.status === "issued" &&
      certificateIsValid(certificate, at),
  );
  const mustRetain =
    input.retainTrainingRecordsByLaw ||
    hasValidConsent(input.consents, "training_record_retention");

  if (liveCertificates.length > 0 && mustRetain) {
    blockedReasons.push(
      "Issued training certificates must be retained under legal obligation or recorded consent.",
    );
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    anonymizeInstead: blockedReasons.length > 0,
  };
}

export function buildPortableLearnerRecord(input: {
  profile: Profile;
  memberships: OrganizationMember[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  attempts: AssessmentAttempt[];
  certificates: Certificate[];
  consents: Consent[];
}): PortableLearnerRecord {
  return {
    subject: {
      id: input.profile.id,
      email: input.profile.email,
      full_name: input.profile.full_name,
      job_title: input.profile.job_title,
      department: input.profile.department,
      locale: input.profile.locale,
      timezone: input.profile.timezone,
    },
    memberships: input.memberships,
    enrollments: input.enrollments,
    progress: input.progress,
    attempts: input.attempts,
    certificates: input.certificates,
    consents: input.consents,
    exportedAt: new Date().toISOString(),
    format: "application/json",
  };
}

export function buildAuditEvent(
  input: AuditEventInput,
): TablesInsert<"audit_logs"> {
  return {
    organization_id: input.organizationId ?? null,
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_table: input.entityTable,
    entity_id: input.entityId ?? null,
    metadata: (input.metadata ?? {}) as Json,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  };
}

export function isDsarOverdue(
  request: Pick<DataSubjectRequest, "due_at" | "status">,
  at: Date = new Date(),
): boolean {
  if (request.status === "completed" || request.status === "rejected") {
    return false;
  }
  const due = toDate(request.due_at);
  return Boolean(due && due < at);
}

export function summarizeAuditActions(logs: AuditLog[]): Record<AuditAction, number> {
  return logs.reduce(
    (counts, log) => {
      counts[log.action] = (counts[log.action] ?? 0) + 1;
      return counts;
    },
    {} as Record<AuditAction, number>,
  );
}
