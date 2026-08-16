"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UsageAnalytics } from "@/components/usage/ai-usage";
import { adminApi, authApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

type UsageLogView = {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  ticket_id: number;
  operation: string;
  provider: string;
  model_name: string;
  request_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_prompt_tokens: number;
  is_cache_hit: boolean;
  status: string;
  error_message: string | null;
  metadata: string;
  created_at: string;
};

const mapToUsageView = (log: {
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
}): UsageLogView => {
  return {
    id: log.id,
    user_id: log.userId ?? 0,
    user_name: log.userName ?? undefined,
    user_email: log.userEmail ?? undefined,
    ticket_id: log.ticketId ?? 0,
    operation: log.operation,
    provider: log.provider,
    model_name: log.modelName,
    request_id: log.requestId ?? "",
    prompt_tokens: log.promptTokens,
    completion_tokens: log.completionTokens,
    total_tokens: log.totalTokens,
    cached_prompt_tokens: log.cachedPromptTokens,
    is_cache_hit: log.isCacheHit,
    status: log.status,
    error_message: log.errorMessage,
    metadata: JSON.stringify(log.metadata ?? {}),
    created_at: log.createdAt,
  };
};

export default function AdminAiUsagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [usageLogs, setUsageLogs] = useState<UsageLogView[]>([]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/auth/signin");
    } catch (_error) {
      router.push("/auth/signin");
    }
  };

  useEffect(() => {
    const fetchAiUsage = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getAiUsage({ limit: 200 });
        const rows = Array.isArray(response.logs)
          ? response.logs.map(mapToUsageView)
          : [];
        setUsageLogs(rows);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessage(
            error,
            "Failed to load AI usage data",
          ),
          variant: "destructive",
        });

        if (
          (error as any)?.response?.status === 401 ||
          (error as any)?.response?.status === 403
        ) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiUsage();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-ai mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading AI usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <header className="border-b border-primary/10 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gradient-ai">
                Admin Control Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage system and users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <UsageAnalytics data={usageLogs} />
      </main>
    </div>
  );
}
