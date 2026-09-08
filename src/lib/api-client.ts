const API_BASE = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    body: body != null ? JSON.stringify(body) : null,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({ success: false, message: "Request failed" }));

  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  // Unwrap the response envelope
  if (json.success !== undefined && json.data !== undefined) {
    return json.data as T;
  }

  // Fallback for responses without envelope (auth endpoints return { user, token })
  return json as T;
}

// Special request for auth that needs the full response (token + user)
async function authRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    body: body != null ? JSON.stringify(body) : null,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({ success: false, message: "Request failed" }));

  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  // Auth endpoints return { success, data: { user, token }, message }
  if (json.success && json.data) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  auth: {
    post: <T>(endpoint: string, body?: unknown) => authRequest<T>(endpoint, { method: "POST", body }),
  },
};

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  courses: {
    list: "/courses",
    detail: (slug: string) => `/courses/${slug}`,
    modules: (slug: string) => `/courses/${slug}/modules`,
    adminList: "/courses/admin",
    adminDetail: (id: string) => `/courses/admin/${id}`,
    modulesAdd: (id: string) => `/courses/${id}/modules`,
    moduleUpdate: (id: string, moduleId: string) => `/courses/${id}/modules/${moduleId}`,
    moduleDelete: (id: string, moduleId: string) => `/courses/${id}/modules/${moduleId}`,
    lessonsAdd: (id: string, moduleId: string) => `/courses/${id}/modules/${moduleId}/lessons`,
    lessonUpdate: (id: string, moduleId: string, lessonId: string) => `/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
    lessonDelete: (id: string, moduleId: string, lessonId: string) => `/courses/${id}/modules/${moduleId}/lessons/${lessonId}`,
  },
  resources: {
    list: "/resources",
    detail: (slug: string) => `/resources/${slug}`,
  },
  blog: {
    list: "/blog",
    detail: (slug: string) => `/blog/${slug}`,
  },
  announcements: "/announcements",
  testimonials: "/testimonials",
  applications: {
    submit: "/applications",
    status: (num: string) => `/applications/status/${num}`,
    list: "/applications",
    detail: (id: string) => `/applications/${id}`,
    updateStatus: (id: string) => `/applications/${id}/status`,
    stats: "/applications/stats/overview",
  },
  student: {
    profile: "/student/profile",
    courses: "/student/courses",
    allCourses: "/student/courses/all",
    enroll: (courseId: string) => `/student/enroll/${courseId}`,
    assignments: "/student/assignments",
    submitAssignment: (id: string) => `/student/assignments/${id}/submit`,
    quizzes: "/student/quizzes",
    results: "/student/results",
    resources: "/student/resources",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    students: "/admin/students",
    assignments: "/admin/assignments",
    submissions: "/admin/submissions",
    gradeSubmission: (id: string) => `/admin/submissions/${id}/grade`,
    quizzes: "/admin/quizzes",
    quizQuestions: (quizId: string) => `/admin/quizzes/${quizId}/questions`,
    quizQuestion: (quizId: string, qId: string) => `/admin/quizzes/${quizId}/questions/${qId}`,
    payments: "/admin/payments",
    contacts: "/admin/contacts",
    markRead: (id: string) => `/admin/contacts/${id}/read`,
  },
  payments: {
    createSession: "/payments/create-session",
    verify: (ref: string) => `/payments/verify/${ref}`,
    history: "/payments/history",
  },
  contact: "/contact",
  uploads: "/uploads",
};
