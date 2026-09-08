import { apiClient, endpoints } from "@/lib/api-client";
import type {
  Announcement,
  Assignment,
  BlogPost,
  Course,
  Module,
  Quiz,
  Resource,
  Result,
  Student,
  Testimonial,
} from "@/types";

export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

export { apiClient, endpoints };

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeCourse(raw: any): Course {
  return {
    slug: String(raw?.slug || ""),
    title: String(raw?.title || ""),
    program: String(raw?.program || ""),
    category: String(raw?.category || ""),
    instructor: String(raw?.instructor || ""),
    duration: String(raw?.duration || ""),
    level: String(raw?.level || ""),
    lessons: Number(raw?.lessons || 0),
    progress: 0,
    description: String(raw?.description || ""),
    image: String(raw?.imageUrl || ""),
  };
}

function normalizeModule(raw: any): Module {
  const lessons = (raw?.lessons || []).map((l: any) => ({
    id: String(l?._id || l?.id || ""),
    title: String(l?.title || ""),
    type: String(l?.type || "Video") as Module["lessons"][number]["type"],
    duration: String(l?.duration || ""),
    locked: false,
    videoUrl: l?.videoUrl || undefined,
    pdfUrl: l?.pdfUrl || undefined,
    fileUrl: l?.fileUrl || undefined,
    content: l?.content || undefined,
  }));
  return {
    id: String(raw?._id || raw?.id || ""),
    title: String(raw?.title || ""),
    summary: String(raw?.summary || ""),
    lessons,
  };
}

function normalizeResource(raw: any): Resource {
  return {
    slug: String(raw?.slug || ""),
    title: String(raw?.title || ""),
    description: String(raw?.description || ""),
    type: String(raw?.type || "PDF") as Resource["type"],
    category: String(raw?.category || ""),
    access: String(raw?.access || "free") as Resource["access"],
    locked: String(raw?.access) === "enrolled",
    meta: String(raw?.meta || ""),
  };
}

function normalizeAnnouncement(raw: any): Announcement {
  return {
    id: String(raw?._id || raw?.id || ""),
    category: String(raw?.category || "Announcement") as Announcement["category"],
    title: String(raw?.title || ""),
    description: String(raw?.description || ""),
    date: String(raw?.date || ""),
  };
}

function normalizeBlogPost(raw: any): BlogPost {
  return {
    slug: String(raw?.slug || ""),
    title: String(raw?.title || ""),
    excerpt: String(raw?.excerpt || ""),
    category: String(raw?.category || ""),
    author: String(raw?.author || ""),
    date: String(raw?.date || ""),
    readTime: String(raw?.readTime || ""),
    image: String(raw?.imageUrl || ""),
    featured: Boolean(raw?.featured),
  };
}

function normalizeTestimonial(raw: any): Testimonial {
  const t: Testimonial = {
    name: String(raw?.name || ""),
    program: String(raw?.program || ""),
    quote: String(raw?.quote || ""),
    initials: String(raw?.initials || ""),
  };
  if (raw?.achievement) t.achievement = String(raw.achievement);
  return t;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const api = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.courses.list);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeCourse) : [];
    } catch {
      return [];
    }
  },

  getCourse: async (slug: string): Promise<Course | undefined> => {
    try {
      const res = await apiClient.get<any>(endpoints.courses.detail(slug));
      const raw = res?.data ?? res;
      return raw ? normalizeCourse(raw) : undefined;
    } catch {
      return undefined;
    }
  },

  getCourseModules: async (slug: string): Promise<Module[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.courses.modules(slug));
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeModule) : [];
    } catch {
      return [];
    }
  },

  getResources: async (): Promise<Resource[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.resources.list);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeResource) : [];
    } catch {
      return [];
    }
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.announcements);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeAnnouncement) : [];
    } catch {
      return [];
    }
  },

  getPosts: async (): Promise<BlogPost[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.blog.list);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeBlogPost) : [];
    } catch {
      return [];
    }
  },

  getPost: async (slug: string): Promise<BlogPost | undefined> => {
    try {
      const res = await apiClient.get<any>(endpoints.blog.detail(slug));
      const raw = res?.data ?? res;
      return raw ? normalizeBlogPost(raw) : undefined;
    } catch {
      return undefined;
    }
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.testimonials);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items.map(normalizeTestimonial) : [];
    } catch {
      return [];
    }
  },

  getStudent: async (): Promise<Student | null> => {
    try {
      return await apiClient.get<Student>(endpoints.student.profile);
    } catch {
      return null;
    }
  },

  getAssignments: async (): Promise<Assignment[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.student.assignments);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.student.quizzes);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  getResults: async (): Promise<Result[]> => {
    try {
      const res = await apiClient.get<any>(endpoints.student.results);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },
};
