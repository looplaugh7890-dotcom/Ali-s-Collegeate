/**
 * Shared domain types.
 *
 * These describe the shapes the UI consumes today from the mock data layer
 * (`src/data/*`) and the shapes a future Laravel API is expected to return.
 * Components should depend on these types — never on the mock arrays directly.
 */

export type ID = string;

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  initials: string;
}

export interface Student {
  id: ID;
  user: User;
  rollNumber: string;
  className: string;
  stream: "Science" | "Commerce" | "Arts" | "Skill";
  section?: string;
  guardianName?: string;
  enrolledCourseIds: ID[];
  admissionDate: string;
}

export interface Program {
  slug: string;
  name: string;
  category: string;
  blurb: string;
  duration: string;
  level: string;
}

export type LessonType = "Video" | "PDF" | "DOCX" | "TXT" | "Quiz" | "Assignment";

export interface Lesson {
  id: ID;
  title: string;
  type: LessonType;
  duration: string;
  locked: boolean;
  videoUrl?: string;
  pdfUrl?: string;
  fileUrl?: string;
  content?: string;
}

export interface Module {
  id: ID;
  title: string;
  summary?: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  program: string;
  category: string;
  instructor: string;
  duration: string;
  level: string;
  lessons: number;
  progress: number;
  description: string;
  image: string;
}

export type ResourceType =
  | "PDF"
  | "Video"
  | "Document"
  | "Past Paper"
  | "Study Material"
  | "Scholarship"
  | "Exam Schedule";

export type AccessLevel = "free" | "login" | "enrolled";

export interface Resource {
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  access: AccessLevel;
  locked: boolean;
  meta: string;
}

export type AssignmentStatus = "pending" | "submitted" | "graded" | "overdue";

export interface Assignment {
  id: ID;
  title: string;
  courseSlug: string;
  courseTitle: string;
  dueDate: string;
  status: AssignmentStatus;
  marks?: string;
  instructions: string;
}

export type QuizStatus = "upcoming" | "available" | "completed";

export interface Quiz {
  id: ID;
  title: string;
  courseSlug: string;
  courseTitle: string;
  questions: number;
  durationMinutes: number;
  status: QuizStatus;
  scheduledFor: string;
  score?: number;
}

export interface Result {
  id: ID;
  assessment: string;
  courseTitle: string;
  date: string;
  obtained: number;
  total: number;
  grade: string;
}

export type AdmissionStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "accepted"
  | "rejected";

export interface Admission {
  id: ID;
  applicationNumber: string;
  studentName: string;
  className: string;
  stream: string;
  submittedAt?: string;
  status: AdmissionStatus;
  payment?: Payment;
}

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface Payment {
  id: ID;
  reference: string;
  amount: number;
  currency: "PKR";
  method: "bank-transfer" | "cash" | "online";
  status: PaymentStatus;
  paidAt?: string;
}

export type AnnouncementCategory =
  | "Announcement"
  | "Event"
  | "Academic Update"
  | "Reminder";

export interface Announcement {
  id: ID;
  category: AnnouncementCategory;
  title: string;
  description: string;
  date: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
  featured?: boolean;
}

export interface Testimonial {
  name: string;
  program: string;
  quote: string;
  achievement?: string;
  initials: string;
  /** Placeholder entries are replaced with verified testimonials after launch. */
  placeholder?: boolean;
}
