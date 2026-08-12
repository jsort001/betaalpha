export type UserRole = "undergrad" | "alumni";
export const EXEC_POSITIONS = [
  "President",
  "Vice President",
  "Treasurer",
  "PR",
  "Community Service Chair",
] as const;
export type ExecPosition = (typeof EXEC_POSITIONS)[number];
export type TaskStatus = "not_started" | "in_progress" | "done" | "blocked";
export type RecurrenceRule = "weekly" | "monthly" | "semester";
export const BOARD_CATEGORIES = [
  "Administrative",
  "Community Service",
  "Cultural",
  "Intake",
  "Fundraising",
  "Social",
] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

// Static titles for boards that recur on a predictable schedule, kept
// consistent across years for tracking purposes. Add new ones here as
// they come up.
export const RECURRING_BOARD_TITLES = [
  "Fall Informational",
  "Spring Informational",
] as const;

// Tasks auto-created on a new board when its name matches a key here.
// Only applies on creation, not editing, and only for titles listed —
// add an entry whenever a recurring title should seed its own tasks.
const INFORMATIONAL_TASK_TEMPLATE = [
  "Reserve room and date",
  "Reserve AV equipment",
  "Order food",
  "Update powerpoint presentation",
  "Design flyer",
  "Distribute flyers",
];

export const BOARD_TASK_TEMPLATES: Record<string, string[]> = {
  "Fall Informational": INFORMATIONAL_TASK_TEMPLATE,
  "Spring Informational": INFORMATIONAL_TASK_TEMPLATE,
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          created_at?: string;
        };
        Update: Partial<{
          email: string;
          name: string;
          role: UserRole;
        }>;
        Relationships: [];
      };
      allowlist: {
        Row: {
          email: string;
          name: string;
          assigned_role: UserRole;
        };
        Insert: {
          email: string;
          name: string;
          assigned_role: UserRole;
        };
        Update: Partial<{
          name: string;
          assigned_role: UserRole;
        }>;
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: BoardCategory | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: BoardCategory | null;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          category: BoardCategory | null;
        }>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          description: string | null;
          owner_id: string | null;
          pending_owner_email: string | null;
          due_date: string | null;
          status: TaskStatus;
          priority: string;
          recurrence_rule: RecurrenceRule | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          title: string;
          description?: string | null;
          owner_id?: string | null;
          pending_owner_email?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          priority?: string;
          recurrence_rule?: RecurrenceRule | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          board_id: string;
          title: string;
          description: string | null;
          owner_id: string | null;
          pending_owner_email: string | null;
          due_date: string | null;
          status: TaskStatus;
          priority: string;
          recurrence_rule: RecurrenceRule | null;
        }>;
        Relationships: [];
      };
      task_history: {
        Row: {
          id: string;
          task_id: string;
          changed_by: string | null;
          change_type: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          changed_by?: string | null;
          change_type: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          pledge_year: string | null;
          major: string | null;
          undergrad_grad_date: string | null;
          grad_degree: string | null;
          school_attended: string | null;
          grad_school_grad_date: string | null;
          job_field: string | null;
          employer: string | null;
          job_title: string | null;
          location: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          pledge_year?: string | null;
          major?: string | null;
          undergrad_grad_date?: string | null;
          grad_degree?: string | null;
          school_attended?: string | null;
          grad_school_grad_date?: string | null;
          job_field?: string | null;
          employer?: string | null;
          job_title?: string | null;
          location?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          email: string | null;
          phone: string | null;
          pledge_year: string | null;
          major: string | null;
          undergrad_grad_date: string | null;
          grad_degree: string | null;
          school_attended: string | null;
          grad_school_grad_date: string | null;
          job_field: string | null;
          employer: string | null;
          job_title: string | null;
          location: string | null;
        }>;
        Relationships: [];
      };
      exec_board: {
        Row: {
          id: string;
          name: string;
          position: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: string;
          created_at?: string;
        };
        Update: Partial<{
          name: string;
          position: string;
        }>;
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      comment_mentions: {
        Row: {
          comment_id: string;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          user_id: string;
        };
        Update: never;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_date: string;
          end_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          title: string;
          description: string | null;
          location: string | null;
          start_date: string;
          end_date: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
