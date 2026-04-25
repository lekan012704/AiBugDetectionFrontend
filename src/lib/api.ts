// API Configuration
// Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = (): string | null => localStorage.getItem("bugdetect_token");

interface RequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, params } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }

    const query = searchParams.toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (body && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const message =
      (data as any)?.detail ||
      (data as any)?.message ||
      (data as any)?.title ||
      res.statusText;

    throw new ApiError(res.status, message, data);
  }

  return (data ?? {}) as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ===== AUTH =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isFinancialInstitution?: boolean;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>("/users/login", { method: "POST", body: data }),

  verifyEmail: () =>
    request("/users/verify-email", { method: "POST" }),

  forgotPassword: (email: string) =>
    request("/users/forgot-password", { method: "POST", body: { email } }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request("/users/change-password", { method: "POST", body: data }),

  updateProfile: (data: Partial<UserProfile>) =>
    request("/users/update", { method: "PUT", body: data }),

  deleteUser: (userId: string) =>
    request(`/users/${userId}`, { method: "DELETE" }),
};

// ===== ANALYSIS =====
export interface SubmitCodeResponse {
  sessionId: string;
  status: string;
  questions: AnalysisQuestion[];
}

export interface AnalysisQuestion {
  questionId: number;
  question: string;
  options: string[];
  relatedPrinciple?: string;
  context?: string;
  priority?: string;
  questionType?: string;
}

// Recursively convert PascalCase keys to camelCase
// so the backend's PascalCase JSON works with frontend camelCase types.
function toCamel(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(toCamel);

  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      out[camelKey] = toCamel(value);
    }

    return out;
  }

  return input;
}

function normalizeSubmitResponse(raw: unknown): SubmitCodeResponse {
  const data = toCamel(raw) as any;
  const followUp = data.followUpQuestions ?? data.questions ?? [];

  return {
    sessionId: data.sessionId,
    status: data.status,
    questions: Array.isArray(followUp)
      ? followUp.map((question: any) => ({
          questionId: question.questionId,
          question: question.question,
          options: question.options ?? [],
          relatedPrinciple: question.relatedPrinciple,
          context: question.context,
          priority: question.priority,
          questionType: question.questionType,
        }))
      : [],
  };
}

function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  const data = toCamel(raw) as any;

  return {
    sessionId: data.sessionId,
    status: data.status,
    detectedContext: data.detectedContext,
    overallCodeQuality: data.overallCodeQuality,
    executiveSummary: data.executiveSummary,
    architectureAssessment: data.architectureAssessment,
    patternCompliance: data.patternCompliance ?? [],
    solidViolations: data.solidViolations ?? [],
    architectureViolations: data.architectureViolations ?? [],
    patternMisuses: data.patternMisuses ?? [],
    dryViolations: data.dryViolations ?? [],
    kissViolations: data.kissViolations ?? [],
    yagniViolations: data.yagniViolations ?? [],
    asyncViolations: data.asyncViolations ?? [],
    diViolations: data.diViolations ?? [],
    bugs: data.bugs ?? [],
    securityIssues: data.securityIssues ?? [],
    performanceIssues: data.performanceIssues ?? [],
    businessLogicIssues: data.businessLogicIssues ?? [],
    serviceInjectionIssues: data.serviceInjectionIssues ?? [],
    refactoringPriorities: data.refactoringPriorities ?? [],
    quickWins: data.quickWins ?? [],
    longTermRecommendations: data.longTermRecommendations ?? [],
    totalIssuesFound: data.totalIssuesFound ?? 0,
    criticalIssues: data.criticalIssues ?? 0,
    highIssues: data.highIssues ?? 0,
    mediumIssues: data.mediumIssues ?? 0,
    lowIssues: data.lowIssues ?? 0,
    aiProvider: data.aiProvider,
    fallbackUsed: data.fallbackUsed,
    analyzedAt: data.analyzedAt,
  };
}

function normalizeSessionsResponse(raw: unknown): Session[] {
  const data = toCamel(raw) as any;

  // Backend returns paged result: { data: [...], totalCount, pageNumber, ... }
  if (Array.isArray(data?.data)) return data.data;

  // Backward compatibility if backend later returns an array directly.
  if (Array.isArray(data)) return data;

  return [];
}

export interface QuestionAnswer {
  questionId: number;
  question: string;
  answer: string;
  relatedPrinciple?: string;
}

export interface DeepAnalysisRequest {
  sessionId: string;
  answers: QuestionAnswer[];
}

export interface AnalysisIssue {
  id?: string;
  title: string;
  description?: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  lineNumber?: number | null;
  endLineNumber?: number | null;
  codeSnippet?: string | null;
  principleViolated?: string | null;
  patternViolated?: string | null;
  architectureLayerViolated?: string | null;
  developerIntent?: string | null;
  contradiction?: string | null;
  suggestedFix?: string | null;
  fixedCode?: string | null;
  explanation?: string | null;
  refactoringSteps?: string | null;
  issueType?: string;
  foundInPhase?: string;
  phase?: string;
}

export interface ServiceInjectionIssue {
  serviceName: string;
  issue: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  principleViolated?: string;
  suggestedFix?: string;
  lineNumber?: number | null;
}

export interface PatternCompliance {
  pattern: string;
  developerIntended: boolean;
  complianceScore: number;
  summary: string;
}

export interface DetectedContext {
  language?: string;
  framework?: string;
  codeComplexity?: string;
  architecture?: string;
  cluesFound?: unknown[];
  suspectedPatterns?: string[];
  suspectedPrinciples?: string[];
  injectedServices?: unknown[];
}

export interface AnalysisResult {
  sessionId: string;
  status: string;
  detectedContext?: DetectedContext;
  overallCodeQuality?: string;
  executiveSummary?: string;
  architectureAssessment?: string;
  patternCompliance: PatternCompliance[];
  solidViolations: AnalysisIssue[];
  architectureViolations: AnalysisIssue[];
  patternMisuses: AnalysisIssue[];
  dryViolations: AnalysisIssue[];
  kissViolations: AnalysisIssue[];
  yagniViolations: AnalysisIssue[];
  asyncViolations: AnalysisIssue[];
  diViolations: AnalysisIssue[];
  bugs: AnalysisIssue[];
  securityIssues: AnalysisIssue[];
  performanceIssues: AnalysisIssue[];
  businessLogicIssues: AnalysisIssue[];
  serviceInjectionIssues: ServiceInjectionIssue[];
  refactoringPriorities: string[];
  quickWins: string[];
  longTermRecommendations: string[];
  totalIssuesFound: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  aiProvider?: string;
  fallbackUsed?: boolean;
  analyzedAt?: string;
}

export interface Session {
  sessionId: string;
  status: string;
  detectedLanguage?: string;
  detectedArchitecture?: string | null;
  language?: string;
  submissionType?: string;
  fileName?: string | null;
  gitHubUrl?: string | null;
  overallCodeQuality?: string | null;
  totalIssuesFound?: number;
  criticalIssues?: number;
  highIssues?: number;
  mediumIssues?: number;
  lowIssues?: number;
  aiProvider?: string;
  fallbackUsed?: boolean;
  createdAt?: string;
  finalAnalyzedAt?: string | null;
}

export const analysisApi = {
  submitSnippet: async (language: string, codeSnippet: string) => {
    const formData = new FormData();
    formData.append("submissionType", "Snippet");
    formData.append("language", language);
    formData.append("codeSnippet", codeSnippet);

    const raw = await request<unknown>("/analysis/submit", {
      method: "POST",
      formData,
    });

    return normalizeSubmitResponse(raw);
  },

  submitFile: async (language: string, file: File) => {
    const formData = new FormData();
    formData.append("submissionType", "File");
    formData.append("language", language);
    formData.append("file", file);

    const raw = await request<unknown>("/analysis/submit", {
      method: "POST",
      formData,
    });

    return normalizeSubmitResponse(raw);
  },

  submitGitHubUrl: async (language: string, gitHubUrl: string) => {
    const formData = new FormData();
    formData.append("submissionType", "GitHubUrl");
    formData.append("language", language);
    formData.append("gitHubUrl", gitHubUrl);

    const raw = await request<unknown>("/analysis/submit", {
      method: "POST",
      formData,
    });

    return normalizeSubmitResponse(raw);
  },

  submitMultipleFiles: async (language: string, files: File[]) => {
    const formData = new FormData();
    formData.append("submissionType", "MultipleFiles");
    formData.append("language", language);
    files.forEach((file) => formData.append("files", file));

    const raw = await request<unknown>("/analysis/submit", {
      method: "POST",
      formData,
    });

    return normalizeSubmitResponse(raw);
  },

  deepAnalysis: async (data: DeepAnalysisRequest) => {
    const raw = await request<unknown>("/analysis/deep", {
      method: "POST",
      body: data,
    });

    return normalizeAnalysisResult(raw);
  },

  getMySessions: async () => {
    const raw = await request<unknown>("/analysis/my-sessions");
    return normalizeSessionsResponse(raw);
  },

  getSession: async (sessionId: string) => {
    const raw = await request<unknown>(`/analysis/${sessionId}`);
    return normalizeAnalysisResult(raw);
  },

  getInitialScan: async (sessionId: string) => {
    const raw = await request<unknown>(`/analysis/${sessionId}/initial`);
    return normalizeSubmitResponse(raw);
  },

  getIssues: async (
    sessionId: string,
    filters?: { severity?: string; issueType?: string; phase?: string }
  ) => {
    const raw = await request<unknown>(`/analysis/${sessionId}/issues`, {
      params: filters,
    });

    const data = toCamel(raw);
    return Array.isArray(data) ? (data as AnalysisIssue[]) : [];
  },

  deleteSession: (sessionId: string) =>
    request(`/analysis/${sessionId}`, { method: "DELETE" }),
};

// Token management helpers
export const tokenManager = {
  setToken: (token: string) => localStorage.setItem("bugdetect_token", token),
  getToken,
  removeToken: () => localStorage.removeItem("bugdetect_token"),
};
