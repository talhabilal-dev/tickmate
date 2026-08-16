import axios from "axios";
import type { TicketResponse } from "./schemas";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;

    if (payload?.message && payload.message.trim()) {
      return payload.message;
    }

    const firstFieldError = payload?.errors?.find((item) =>
      item?.message?.trim(),
    )?.message;
    if (firstFieldError) {
      return firstFieldError;
    }

    if (error.message?.trim()) {
      return error.message;
    }
  }

  return fallback;
};

// Auth API endpoints
export const authApi = {
  signUp: async (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    skills?: string[];
  }) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  signIn: async (data: {
    identifier: string;
    password: string;
    role?: "user" | "admin";
  }) => {
    const endpoint = data.role === "admin" ? "/admin/login" : "/auth/login";
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  checkUsernameAvailability: async (username: string) => {
    const response = await apiClient.get(`/auth/check-username/${username}`);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post("/auth/verify", { token });
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPasswordWithToken: async (data: {
    token: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },
};

// User API endpoints
export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    username?: string;
    email?: string;
    skills?: string[];
  }) => {
    const response = await apiClient.patch("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await apiClient.put("/auth/update-password", {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post("/user/verify-email", { token });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete("/auth/profile");
    return response.data;
  },
};

// Ticket API endpoints
type ApiSuccessResponse = {
  success: boolean;
  message?: string;
};

type CreateTicketRequest = {
  title: string;
  description: string;
  category: string;
  priority?: "low" | "medium" | "high";
  deadline?: Date;
  relatedSkills?: string[];
  helpfulNotes?: string;
  isPublic?: boolean;
};

type CreateTicketResponse = ApiSuccessResponse & {
  ticket: TicketResponse;
};

type SearchSimilarTicketsRequest = {
  title: string;
  description: string;
  category?: string;
  limit?: number;
};

type SearchSimilarTicketsResponse = ApiSuccessResponse & {
  tickets: TicketResponse[];
};

type UpdateTicketRequest = {
  ticketId: number;
  title?: string;
  description?: string;
  category?: string;
  deadline?: Date | null;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  helpfulNotes?: string | null;
  relatedSkills?: string[];
  isPublic?: boolean;
};

type UpdateTicketResponse = ApiSuccessResponse & {
  ticket?: TicketResponse;
};

type GetMyTicketsResponse = ApiSuccessResponse & {
  tickets: TicketResponse[];
};

type TicketSummary = {
  totalTickets: number;
  inProgress: number;
  completed: number;
};

type GetTicketStatsResponse = ApiSuccessResponse & {
  summary: TicketSummary;
  previousSummary: TicketSummary;
  tickets: Array<{
    id: number;
    title: string;
    assignedTo: number | null;
    priority: "low" | "medium" | "high";
    createdAt: string;
    status: "pending" | "in_progress" | "completed";
    relatedSkills: string[];
  }>;
};

type DeleteTicketResponse = ApiSuccessResponse;

type ToggleTicketStatusResponse = ApiSuccessResponse & {
  ticket: TicketResponse;
};

type TicketReplyRequest = {
  ticketId: number;
  message: string;
};

type TicketReplyResponse = ApiSuccessResponse & {
  ticket: TicketResponse;
};

type PublicCompletedTicketsFilters = {
  category?: string;
  skills?: string[];
};

type PublicCompletedTicketsResponse = ApiSuccessResponse & {
  tickets: TicketResponse[];
};

export const ticketApi = {
  getMyTickets: async (): Promise<GetMyTicketsResponse> => {
    const response = await apiClient.get<GetMyTicketsResponse>("/tickets");
    return response.data;
  },

  getTicketStats: async (): Promise<GetTicketStatsResponse> => {
    const response = await apiClient.get<GetTicketStatsResponse>(
      "/tickets/tickets-summary",
    );
    return response.data;
  },

  getAssignedTickets: async (): Promise<GetMyTicketsResponse> => {
    const response = await apiClient.get<GetMyTicketsResponse>(
      "/tickets/get-assigned",
    );
    return response.data;
  },

  getPublicCompletedTickets: async (
    filters?: PublicCompletedTicketsFilters,
  ): Promise<PublicCompletedTicketsResponse> => {
    const params = new URLSearchParams();

    if (filters?.category) {
      params.set("category", filters.category);
    }

    if (filters?.skills && filters.skills.length > 0) {
      params.set("skills", filters.skills.join(","));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/tickets/public-completed?${queryString}`
      : "/tickets/public-completed";

    const response =
      await apiClient.get<PublicCompletedTicketsResponse>(endpoint);
    return response.data;
  },

  createTicket: async (
    data: CreateTicketRequest,
  ): Promise<CreateTicketResponse> => {
    const response = await apiClient.post<CreateTicketResponse>(
      "/tickets",
      data,
    );
    return response.data;
  },

  searchSimilarTickets: async (
    data: SearchSimilarTicketsRequest,
  ): Promise<SearchSimilarTicketsResponse> => {
    const response = await apiClient.post<SearchSimilarTicketsResponse>(
      "/tickets/similar",
      data,
    );
    return response.data;
  },

  getTicketById: async (ticketId: number) => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },

  updateTicket: async (
    data: UpdateTicketRequest,
  ): Promise<UpdateTicketResponse> => {
    const { ticketId, ...updateData } = data;
    const response = await apiClient.put<UpdateTicketResponse>(
      "/tickets/edit-ticket",
      {
        ticketId,
        ...updateData,
      },
    );
    return response.data;
  },

  markTicketCompleted: async (
    ticketId: number,
  ): Promise<ToggleTicketStatusResponse> => {
    const response = await apiClient.put<ToggleTicketStatusResponse>(
      `/tickets/status/${ticketId}`,
    );
    return response.data;
  },

  replyToTicket: async (
    data: TicketReplyRequest,
  ): Promise<TicketReplyResponse> => {
    const response = await apiClient.put<TicketReplyResponse>(
      "/tickets/ticket-reply",
      data,
    );
    return response.data;
  },

  deleteTicket: async (ticketId: number): Promise<DeleteTicketResponse> => {
    const response = await apiClient.delete<DeleteTicketResponse>(
      "/tickets/delete-ticket",
      {
        data: { ticketId },
      },
    );
    return response.data;
  },
};

type AdminAiUsageLog = {
  id: number;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  ticketId: number | null;
  operation: string;
  provider: string;
  modelName: string;
  requestId: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedPromptTokens: number;
  isCacheHit: boolean;
  status: string;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type AdminAiUsageSummary = {
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCacheHits: number;
  totalErrors: number;
};

type GetAdminAiUsageResponse = ApiSuccessResponse & {
  summary: AdminAiUsageSummary;
  logs: AdminAiUsageLog[];
};

type AdminUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
  skills: string[];
  isActive: boolean;
  loginTime: string | null;
  createdAt: string;
};

type GetAdminUsersResponse = ApiSuccessResponse & {
  users: AdminUser[];
};

type UpdateAdminUserResponse = ApiSuccessResponse & {
  user: AdminUser;
};

type AdminTicket = TicketResponse & {
  assignedTo: number | null;
  replies?: Array<{
    message: string | null;
    createdAt: string | null;
    createdBy: string | null;
  }>;
};

type AdminTicketsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AdminTicketFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  category?: string;
};

type GetAdminTicketsResponse = ApiSuccessResponse & {
  tickets: AdminTicket[];
  pagination: AdminTicketsPagination;
};

type ToggleAdminTicketStatusResponse = ApiSuccessResponse & {
  ticket: AdminTicket;
};

type AdminAuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  actorUserId: number | null;
  actorName: string | null;
  targetUserId: number | null;
  targetName: string | null;
  ticketId: number | null;
  assignedFromUserId: number | null;
  assignedFromName: string | null;
  assignedToUserId: number | null;
  assignedToName: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

type AdminAuditLogsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type GetAdminAuditLogsResponse = ApiSuccessResponse & {
  logs: AdminAuditLog[];
  pagination: AdminAuditLogsPagination;
};

export const adminApi = {
  getUsers: async (): Promise<GetAdminUsersResponse> => {
    const response = await apiClient.get<GetAdminUsersResponse>("/admin/users");
    return response.data;
  },

  updateUser: async (data: {
    userId: number;
    role?: "user" | "moderator" | "admin";
    isActive?: boolean;
  }): Promise<UpdateAdminUserResponse> => {
    const response = await apiClient.put<UpdateAdminUserResponse>(
      "/admin/update-user",
      data,
    );
    return response.data;
  },

  deleteUser: async (userId: number): Promise<ApiSuccessResponse> => {
    const response = await apiClient.delete<ApiSuccessResponse>(
      "/admin/delete-user",
      {
        data: { userId },
      },
    );
    return response.data;
  },

  getTickets: async (
    params?: AdminTicketFilters,
  ): Promise<GetAdminTicketsResponse> => {
    const query = new URLSearchParams();

    if (typeof params?.page === "number") {
      query.set("page", String(params.page));
    }

    if (typeof params?.pageSize === "number") {
      query.set("pageSize", String(params.pageSize));
    }

    if (params?.search?.trim()) {
      query.set("search", params.search.trim());
    }

    if (params?.status) {
      query.set("status", params.status);
    }

    if (params?.priority) {
      query.set("priority", params.priority);
    }

    if (params?.category?.trim()) {
      query.set("category", params.category.trim());
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `/admin/tickets?${queryString}`
      : "/admin/tickets";

    const response = await apiClient.get<GetAdminTicketsResponse>(endpoint);
    return response.data;
  },

  toggleTicketStatus: async (
    ticketId: number,
  ): Promise<ToggleAdminTicketStatusResponse> => {
    const response = await apiClient.put<ToggleAdminTicketStatusResponse>(
      "/admin/tickets/toggle-status",
      { ticketId },
    );
    return response.data;
  },

  deleteTicket: async (ticketId: number): Promise<ApiSuccessResponse> => {
    const response = await apiClient.delete<ApiSuccessResponse>(
      "/admin/tickets/delete-ticket",
      {
        data: { ticketId },
      },
    );
    return response.data;
  },

  getAiUsage: async (params?: {
    userId?: number;
    limit?: number;
  }): Promise<GetAdminAiUsageResponse> => {
    const query = new URLSearchParams();

    if (typeof params?.userId === "number") {
      query.set("userId", String(params.userId));
    }

    if (typeof params?.limit === "number") {
      query.set("limit", String(params.limit));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `/admin/ai-usage?${queryString}`
      : "/admin/ai-usage";

    const response = await apiClient.get<GetAdminAiUsageResponse>(endpoint);
    return response.data;
  },

  getAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<GetAdminAuditLogsResponse> => {
    const query = new URLSearchParams();

    if (typeof params?.page === "number") {
      query.set("page", String(params.page));
    }

    if (typeof params?.pageSize === "number") {
      query.set("pageSize", String(params.pageSize));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `/admin/audit-logs?${queryString}`
      : "/admin/audit-logs";

    const response = await apiClient.get<GetAdminAuditLogsResponse>(endpoint);
    return response.data;
  },
};

export default apiClient;
