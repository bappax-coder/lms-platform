export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | "platform_admin"
  | "org_admin"
  | "instructor"
  | "learner"
  | "auditor";

export type EnrollmentStatus =
  | "invited"
  | "active"
  | "completed"
  | "failed"
  | "dropped"
  | "expired";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type CertificateStatus = "issued" | "revoked" | "expired" | "superseded";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "graded"
  | "abandoned";

export type QuestionType =
  | "multiple_choice"
  | "multi_select"
  | "true_false"
  | "short_answer";

export type LessonContentType =
  | "video"
  | "article"
  | "scorm"
  | "quiz"
  | "document";

export type DsarType =
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "restriction"
  | "objection";

export type DsarStatus =
  | "received"
  | "in_progress"
  | "completed"
  | "rejected"
  | "partially_completed";

export type ConsentPurpose =
  | "terms_of_service"
  | "privacy_policy"
  | "marketing"
  | "analytics_cookies"
  | "training_record_retention";

export type TrainingComplianceStatus =
  | "compliant"
  | "at_risk"
  | "overdue"
  | "not_started"
  | "exempt"
  | "revoked";

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "enroll"
  | "complete"
  | "issue_certificate"
  | "revoke_certificate"
  | "consent_granted"
  | "consent_withdrawn"
  | "dsar_opened"
  | "dsar_closed";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          legal_name: string | null;
          logo_url: string | null;
          primary_color: string | null;
          timezone: string;
          country_code: string | null;
          retention_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          legal_name?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          timezone?: string;
          country_code?: string | null;
          retention_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          legal_name?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          timezone?: string;
          country_code?: string | null;
          retention_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: AppRole;
          job_title: string | null;
          department: string | null;
          locale: string;
          timezone: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: AppRole;
          job_title?: string | null;
          department?: string | null;
          locale?: string;
          timezone?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: AppRole;
          job_title?: string | null;
          department?: string | null;
          locale?: string;
          timezone?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          member_role: AppRole;
          department: string | null;
          hired_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          member_role?: AppRole;
          department?: string | null;
          hired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          member_role?: AppRole;
          department?: string | null;
          hired_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          slug: string;
          description: string | null;
          code: string;
          version: string;
          passing_score: number;
          duration_minutes: number | null;
          recertification_months: number | null;
          is_published: boolean;
          created_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          slug: string;
          description?: string | null;
          code: string;
          version?: string;
          passing_score?: number;
          duration_minutes?: number | null;
          recertification_months?: number | null;
          is_published?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          code?: string;
          version?: string;
          passing_score?: number;
          duration_minutes?: number | null;
          recertification_months?: number | null;
          is_published?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content_type: LessonContentType;
          content_url: string | null;
          body: string | null;
          duration_seconds: number | null;
          position: number;
          is_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content_type?: LessonContentType;
          content_url?: string | null;
          body?: string | null;
          duration_seconds?: number | null;
          position?: number;
          is_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content_type?: LessonContentType;
          content_url?: string | null;
          body?: string | null;
          duration_seconds?: number | null;
          position?: number;
          is_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "course_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      course_requirements: {
        Row: {
          id: string;
          organization_id: string;
          course_id: string;
          target_role: AppRole | null;
          target_department: string | null;
          due_days_from_assignment: number;
          is_mandatory: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          course_id: string;
          target_role?: AppRole | null;
          target_department?: string | null;
          due_days_from_assignment?: number;
          is_mandatory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          course_id?: string;
          target_role?: AppRole | null;
          target_department?: string | null;
          due_days_from_assignment?: number;
          is_mandatory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_requirements_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_requirements_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          id: string;
          organization_id: string;
          course_id: string;
          user_id: string;
          status: EnrollmentStatus;
          assigned_at: string;
          due_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          progress_percent: number;
          score: number | null;
          assigned_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          course_id: string;
          user_id: string;
          status?: EnrollmentStatus;
          assigned_at?: string;
          due_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          progress_percent?: number;
          score?: number | null;
          assigned_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          course_id?: string;
          user_id?: string;
          status?: EnrollmentStatus;
          assigned_at?: string;
          due_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          progress_percent?: number;
          score?: number | null;
          assigned_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          enrollment_id: string;
          lesson_id: string;
          user_id: string;
          status: ProgressStatus;
          time_spent_seconds: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          lesson_id: string;
          user_id: string;
          status?: ProgressStatus;
          time_spent_seconds?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          lesson_id?: string;
          user_id?: string;
          status?: ProgressStatus;
          time_spent_seconds?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assessments: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string | null;
          title: string;
          passing_score: number;
          max_attempts: number | null;
          time_limit_minutes: number | null;
          is_randomized: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          lesson_id?: string | null;
          title: string;
          passing_score?: number;
          max_attempts?: number | null;
          time_limit_minutes?: number | null;
          is_randomized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          lesson_id?: string | null;
          title?: string;
          passing_score?: number;
          max_attempts?: number | null;
          time_limit_minutes?: number | null;
          is_randomized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          id: string;
          assessment_id: string;
          prompt: string;
          type: QuestionType;
          options: Json;
          points: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          prompt: string;
          type: QuestionType;
          options?: Json;
          points?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          prompt?: string;
          type?: QuestionType;
          options?: Json;
          points?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      question_answer_keys: {
        Row: {
          question_id: string;
          correct_answer: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          question_id: string;
          correct_answer: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          question_id?: string;
          correct_answer?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_answer_keys_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_attempts: {
        Row: {
          id: string;
          assessment_id: string;
          enrollment_id: string;
          user_id: string;
          status: AttemptStatus;
          score: number | null;
          answers: Json;
          started_at: string;
          submitted_at: string | null;
          attempt_number: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          enrollment_id: string;
          user_id: string;
          status?: AttemptStatus;
          score?: number | null;
          answers?: Json;
          started_at?: string;
          submitted_at?: string | null;
          attempt_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          enrollment_id?: string;
          user_id?: string;
          status?: AttemptStatus;
          score?: number | null;
          answers?: Json;
          started_at?: string;
          submitted_at?: string | null;
          attempt_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_attempts_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      certificates: {
        Row: {
          id: string;
          organization_id: string;
          enrollment_id: string;
          user_id: string;
          course_id: string;
          certificate_number: string;
          verification_code: string;
          status: CertificateStatus;
          issued_at: string;
          expires_at: string | null;
          revoked_at: string | null;
          revoked_reason: string | null;
          pdf_path: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          enrollment_id: string;
          user_id: string;
          course_id: string;
          certificate_number: string;
          verification_code: string;
          status?: CertificateStatus;
          issued_at?: string;
          expires_at?: string | null;
          revoked_at?: string | null;
          revoked_reason?: string | null;
          pdf_path?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          enrollment_id?: string;
          user_id?: string;
          course_id?: string;
          certificate_number?: string;
          verification_code?: string;
          status?: CertificateStatus;
          issued_at?: string;
          expires_at?: string | null;
          revoked_at?: string | null;
          revoked_reason?: string | null;
          pdf_path?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: true;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      consents: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          purpose: ConsentPurpose;
          granted: boolean;
          granted_at: string | null;
          withdrawn_at: string | null;
          policy_version: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id?: string | null;
          purpose: ConsentPurpose;
          granted?: boolean;
          granted_at?: string | null;
          withdrawn_at?: string | null;
          policy_version: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string | null;
          purpose?: ConsentPurpose;
          granted?: boolean;
          granted_at?: string | null;
          withdrawn_at?: string | null;
          policy_version?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consents_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          action: AuditAction;
          entity_table: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_id?: string | null;
          action: AuditAction;
          entity_table: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          actor_id?: string | null;
          action?: AuditAction;
          entity_table?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_subject_requests: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          requester_email: string;
          type: DsarType;
          status: DsarStatus;
          due_at: string;
          completed_at: string | null;
          notes: string | null;
          payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          requester_email: string;
          type: DsarType;
          status?: DsarStatus;
          due_at: string;
          completed_at?: string | null;
          notes?: string | null;
          payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          requester_email?: string;
          type?: DsarType;
          status?: DsarStatus;
          due_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "data_subject_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      retention_policies: {
        Row: {
          id: string;
          organization_id: string;
          entity_table: string;
          retain_days: number;
          legal_basis: string;
          anonymize: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          entity_table: string;
          retain_days: number;
          legal_basis: string;
          anonymize?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          entity_table?: string;
          retain_days?: number;
          legal_basis?: string;
          anonymize?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retention_policies_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      worker_access: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          badge_code: string;
          pin_hash: string;
          failed_attempts: number;
          locked_until: string | null;
          last_used_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          badge_code: string;
          pin_hash: string;
          failed_attempts?: number;
          locked_until?: string | null;
          last_used_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          badge_code?: string;
          pin_hash?: string;
          failed_attempts?: number;
          locked_until?: string | null;
          last_used_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "worker_access_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_access_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_holds: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          reason: string;
          started_at: string;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          reason: string;
          started_at?: string;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          reason?: string;
          started_at?: string;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "legal_holds_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "legal_holds_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      worker_badges: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          badge_code: string;
          failed_attempts: number;
          locked_until: string | null;
          last_used_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "worker_access_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worker_access_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
      org_role: {
        Args: { org_id: string };
        Returns: AppRole;
      };
    };
    Enums: {
      app_role: AppRole;
      enrollment_status: EnrollmentStatus;
      progress_status: ProgressStatus;
      certificate_status: CertificateStatus;
      attempt_status: AttemptStatus;
      question_type: QuestionType;
      lesson_content_type: LessonContentType;
      dsar_type: DsarType;
      dsar_status: DsarStatus;
      consent_purpose: ConsentPurpose;
      audit_action: AuditAction;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Organization = Tables<"organizations">;
export type Profile = Tables<"profiles">;
export type OrganizationMember = Tables<"organization_members">;
export type Course = Tables<"courses">;
export type CourseModule = Tables<"course_modules">;
export type Lesson = Tables<"lessons">;
export type CourseRequirement = Tables<"course_requirements">;
export type Enrollment = Tables<"enrollments">;
export type LessonProgress = Tables<"lesson_progress">;
export type Assessment = Tables<"assessments">;
export type Question = Tables<"questions">;
export type QuestionAnswerKey = Tables<"question_answer_keys">;
export type AssessmentAttempt = Tables<"assessment_attempts">;
export type Certificate = Tables<"certificates">;
export type Consent = Tables<"consents">;
export type AuditLog = Tables<"audit_logs">;
export type DataSubjectRequest = Tables<"data_subject_requests">;
export type RetentionPolicy = Tables<"retention_policies">;
export type LegalHold = Tables<"legal_holds">;
export type WorkerAccess = Tables<"worker_access">;

export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  learner?: Profile;
}

export interface CertificateWithRelations extends Certificate {
  course: Pick<Course, "id" | "title" | "code" | "version">;
  learner: Pick<Profile, "id" | "full_name" | "email">;
  organization: Pick<Organization, "id" | "name" | "legal_name" | "logo_url">;
}

export interface LessonCompletionRule {
  requireAllRequiredLessons: boolean;
  minimumScore: number;
  minimumTimeSeconds: number;
}

export const DEFAULT_LESSON_COMPLETION_RULE: LessonCompletionRule = {
  requireAllRequiredLessons: true,
  minimumScore: 80,
  minimumTimeSeconds: 0,
};

export const PII_FIELDS = [
  "email",
  "full_name",
  "ip_address",
  "user_agent",
  "requester_email",
] as const;

export type PiiField = (typeof PII_FIELDS)[number];

export interface ComplianceExportRow {
  learnerName: string;
  email: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  status: TrainingComplianceStatus;
  enrollmentStatus: string;
  progressPercent: number;
  score: number | null;
  dueAt: string | null;
  completedAt: string | null;
  certificateNumber: string | null;
  daysUntilDue: number | null;
}
