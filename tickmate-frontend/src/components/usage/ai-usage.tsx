"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UsageLog {
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
}

interface UsageAnalyticsProps {
  data: UsageLog[];
}

export function UsageAnalytics({ data }: UsageAnalyticsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartTextColor = isDark ? "#a3a3a3" : "#525252";
  const chartGridColor = isDark ? "#27272a" : "#e4e4e7";
  const tooltipBackgroundColor = isDark ? "#18181b" : "#ffffff";
  const tooltipBorderColor = isDark ? "#3f3f46" : "#d4d4d8";
  const tooltipTextColor = isDark ? "#f4f4f5" : "#18181b";

  const tooltipStyle = {
    backgroundColor: tooltipBackgroundColor,
    border: `1px solid ${tooltipBorderColor}`,
    color: tooltipTextColor,
  };

  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        averageTokensPerRequest: 0,
        cacheHitRate: 0,
        successRate: 0,
        tokenBreakdown: [],
        timeSeriesData: [],
        providerStats: [],
        operationStats: [],
        userStats: [],
      };
    }

    // Calculate totals
    const totalRequests = data.length;
    const successCount = data.filter((log) => log.status === "success").length;
    const cacheHitCount = data.filter((log) => log.is_cache_hit).length;
    const totalTokens = data.reduce((sum, log) => sum + log.total_tokens, 0);
    const totalPromptTokens = data.reduce(
      (sum, log) => sum + log.prompt_tokens,
      0,
    );
    const totalCompletionTokens = data.reduce(
      (sum, log) => sum + log.completion_tokens,
      0,
    );
    const averageTokensPerRequest = Math.round(totalTokens / totalRequests);
    const cacheHitRate = Math.round((cacheHitCount / totalRequests) * 100);
    const successRate = Math.round((successCount / totalRequests) * 100);

    // Token breakdown
    const tokenBreakdown = [
      { name: "Prompt Tokens", value: totalPromptTokens, fill: "#6366f1" },
      {
        name: "Completion Tokens",
        value: totalCompletionTokens,
        fill: "#3b82f6",
      },
    ];

    // Group by date for time series
    const dateMap = new Map<
      string,
      { date: string; tokens: number; requests: number }
    >();
    data.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = dateMap.get(date) || { date, tokens: 0, requests: 0 };
      existing.tokens += log.total_tokens;
      existing.requests += 1;
      dateMap.set(date, existing);
    });
    const timeSeriesData = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Provider statistics
    const providerMap = new Map<
      string,
      { provider: string; count: number; tokens: number }
    >();
    data.forEach((log) => {
      const existing = providerMap.get(log.provider) || {
        provider: log.provider,
        count: 0,
        tokens: 0,
      };
      existing.count += 1;
      existing.tokens += log.total_tokens;
      providerMap.set(log.provider, existing);
    });
    const providerStats = Array.from(providerMap.values()).sort(
      (a, b) => b.count - a.count,
    );

    // Operation statistics
    const operationMap = new Map<
      string,
      { operation: string; count: number; tokens: number }
    >();
    data.forEach((log) => {
      const existing = operationMap.get(log.operation) || {
        operation: log.operation,
        count: 0,
        tokens: 0,
      };
      existing.count += 1;
      existing.tokens += log.total_tokens;
      operationMap.set(log.operation, existing);
    });
    const operationStats = Array.from(operationMap.values()).sort(
      (a, b) => b.count - a.count,
    );

    const userMap = new Map<
      number,
      {
        userId: number;
        name: string;
        email: string;
        requests: number;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
      }
    >();

    data.forEach((log) => {
      const existing = userMap.get(log.user_id) || {
        userId: log.user_id,
        name: log.user_name?.trim() || "Unknown User",
        email: log.user_email?.trim() || "-",
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      };

      existing.requests += 1;
      existing.inputTokens += log.prompt_tokens;
      existing.outputTokens += log.completion_tokens;
      existing.totalTokens += log.total_tokens;
      userMap.set(log.user_id, existing);
    });

    const userStats = Array.from(userMap.values()).sort(
      (a, b) => b.totalTokens - a.totalTokens,
    );

    return {
      totalRequests,
      totalTokens,
      averageTokensPerRequest,
      cacheHitRate,
      successRate,
      tokenBreakdown,
      timeSeriesData,
      providerStats,
      operationStats,
      userStats,
    };
  }, [data]);

  const StatCard = ({
    label,
    value,
    unit = "",
  }: {
    label: string;
    value: number | string;
    unit?: string;
  }) => (
    <div className="rounded-lg border border-primary/10 bg-card p-4 transition-all hover:border-primary/30">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gradient-ai">
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && <span className="ml-1 text-sm">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-ai">
            AI Usage Analytics
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track AI usage across users and token consumption
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={analytics.totalRequests} />
          <StatCard label="Total Tokens" value={analytics.totalTokens} />
          <StatCard
            label="Avg Tokens/Request"
            value={analytics.averageTokensPerRequest}
          />
          <StatCard
            label="Success Rate"
            value={analytics.successRate}
            unit="%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-primary/10 bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Cache Hit Rate</h3>
            <div className="flex items-end gap-4">
              <div className="text-5xl font-bold text-gradient-ai">
                {analytics.cacheHitRate}%
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                of requests used cache
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">
              Provider Distribution
            </h3>
            <div className="space-y-2">
              {analytics.providerStats.slice(0, 3).map((provider) => (
                <div
                  key={provider.provider}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">
                    {provider.provider}
                  </span>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {provider.count} calls
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.tokenBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.tokenBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Token Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.timeSeriesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={{ fill: "#7c3aed", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Requests Per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.timeSeriesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor }}
                  />
                  <Bar dataKey="requests" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Operations Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.operationStats.map((op) => (
                  <div
                    key={op.operation}
                    className="flex justify-between items-center p-3 rounded-lg border border-primary/10 bg-muted/20"
                  >
                    <div>
                      <p className="font-semibold capitalize">{op.operation}</p>
                      <p className="text-sm text-muted-foreground">
                        {op.tokens.toLocaleString()} tokens
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {op.count} calls
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Per User Token Details</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No user usage data available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/10 text-left text-muted-foreground">
                      <th className="py-2 pr-3">User</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Requests</th>
                      <th className="py-2 pr-3">Input Tokens</th>
                      <th className="py-2 pr-3">Output Tokens</th>
                      <th className="py-2 pr-3">Total Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.userStats.map((user) => (
                      <tr
                        key={user.userId}
                        className="border-b border-primary/5"
                      >
                        <td className="py-2 pr-3 font-medium">{user.name}</td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-2 pr-3">
                          {user.requests.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">
                          {user.inputTokens.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">
                          {user.outputTokens.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3 font-semibold">
                          {user.totalTokens.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-8">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
