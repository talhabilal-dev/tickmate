import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { ENV } from "../config/env.config.js";
import db from "../config/db.config.js";
import { aiUsageLogsTable } from "../models/model.js";

const ticketAnalysisSchema = z.object({
  summary: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  helpfulNotes: z.string().min(1),
  relatedSkills: z.array(z.string().min(1)),
});

type TicketAnalysis = z.infer<typeof ticketAnalysisSchema>;

type AnalyzeTicketInput = {
  title: string;
  description: string;
  userId?: number | null;
  ticketId?: number | null;
};

type TokenUsageMetrics = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedPromptTokens: number;
};

const openaiApiKey = ENV.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is required to analyze tickets");
}

new ChatOpenAI({

})

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.1,
  maxRetries: 2,
  timeout: 15000,
  maxTokens: 500,
});

const resolveTokenUsage = (response: unknown): TokenUsageMetrics => {
  const metadata =
    typeof response === "object" && response !== null && "response_metadata" in response
      ? (response as { response_metadata?: Record<string, unknown> }).response_metadata
      : undefined;

  const tokenUsage =
    metadata && typeof metadata === "object"
      ? (metadata.tokenUsage as Record<string, unknown> | undefined)
      : undefined;

  const usage =
    metadata && typeof metadata === "object"
      ? (metadata.usage as Record<string, unknown> | undefined)
      : undefined;

  const usageMetadata =
    typeof response === "object" && response !== null && "usage_metadata" in response
      ? ((response as { usage_metadata?: Record<string, unknown> }).usage_metadata ?? undefined)
      : undefined;

  const promptTokens = Number(
    usage?.prompt_tokens ?? tokenUsage?.promptTokens ?? usageMetadata?.input_tokens ?? 0
  );
  const completionTokens = Number(
    usage?.completion_tokens ??
    tokenUsage?.completionTokens ??
    usageMetadata?.output_tokens ??
    0
  );
  const totalTokens = Number(
    usage?.total_tokens ?? tokenUsage?.totalTokens ?? usageMetadata?.total_tokens ?? 0
  );

  const promptTokenDetails =
    usage && typeof usage.prompt_tokens_details === "object"
      ? (usage.prompt_tokens_details as Record<string, unknown>)
      : undefined;

  const inputTokenDetails =
    usageMetadata && typeof usageMetadata.input_token_details === "object"
      ? (usageMetadata.input_token_details as Record<string, unknown>)
      : undefined;

  const cachedPromptTokens = Number(
    promptTokenDetails?.cached_tokens ?? inputTokenDetails?.cache_read ?? 0
  );

  return {
    promptTokens: Number.isFinite(promptTokens) ? promptTokens : 0,
    completionTokens: Number.isFinite(completionTokens) ? completionTokens : 0,
    totalTokens: Number.isFinite(totalTokens) ? totalTokens : 0,
    cachedPromptTokens: Number.isFinite(cachedPromptTokens) ? cachedPromptTokens : 0,
  };
};

const persistUsageLog = async (params: {
  input: AnalyzeTicketInput;
  status: "success" | "error";
  response?: unknown;
  errorMessage?: string;
}) => {
  try {
    const metadata =
      params.response &&
        typeof params.response === "object" &&
        "response_metadata" in params.response
        ? ((params.response as { response_metadata?: unknown }).response_metadata as
          | Record<string, unknown>
          | undefined)
        : undefined;

    const requestId =
      params.response && typeof params.response === "object" && "id" in params.response
        ? String((params.response as { id?: unknown }).id ?? "")
        : null;

    const modelName =
      metadata && typeof metadata.model_name === "string"
        ? metadata.model_name
        : "gpt-4.1-mini";

    const provider =
      metadata && typeof metadata.model_provider === "string"
        ? metadata.model_provider
        : "openai";

    const usage = params.response ? resolveTokenUsage(params.response) : resolveTokenUsage(null);

    await db.insert(aiUsageLogsTable).values({
      userId:
        typeof params.input.userId === "number" && Number.isInteger(params.input.userId)
          ? params.input.userId
          : null,
      ticketId:
        typeof params.input.ticketId === "number" && Number.isInteger(params.input.ticketId)
          ? params.input.ticketId
          : null,
      operation: "ticket_analysis",
      provider,
      modelName,
      requestId: requestId || null,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      cachedPromptTokens: usage.cachedPromptTokens,
      isCacheHit: usage.cachedPromptTokens > 0,
      status: params.status,
      errorMessage: params.errorMessage ?? null,
      metadata:
        metadata && typeof metadata === "object"
          ? {
            finishReason: metadata.finish_reason ?? null,
            systemFingerprint: metadata.system_fingerprint ?? null,
          }
          : null,
    });
  } catch (loggingError) {
    if (loggingError instanceof Error) {
      console.error("Failed to persist AI usage log", loggingError.message);
    } else {
      console.error("Failed to persist AI usage log", loggingError);
    }
  }
};

const SYSTEM_PROMPT = `You are an expert AI assistant that processes technical support tickets.
Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.
IMPORTANT:
- Respond with only valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.`;

const extractJsonText = (raw: string): string => {
  const fencedMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1).trim();
  }

  return raw.trim();
};

const readModelContent = (
  content: string | Array<string | { text?: string }>
): string => {
  if (typeof content === "string") {
    return content;
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      return typeof part.text === "string" ? part.text : "";
    })
    .join("\n");
};

const analyzeTicket = async (
  ticket: AnalyzeTicketInput
): Promise<TicketAnalysis | null> => {
  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Only return a strict JSON object with this exact shape:
{
  "summary": "Short summary of the ticket",
  "priority": "low|medium|high",
  "helpfulNotes": "Detailed technical notes and useful links",
  "relatedSkills": ["React", "PostgreSQL"]
}

Ticket information:
- Title: ${ticket.title}
- Description: ${ticket.description}`),
    ]);

    const raw = readModelContent(
      response.content as string | Array<string | { text?: string }>
    );
    const jsonText = extractJsonText(raw);
    const parsedJson: unknown = JSON.parse(jsonText);

    const parsed = ticketAnalysisSchema.safeParse(parsedJson);
    if (!parsed.success) {
      console.error("Failed to validate AI output", parsed.error.flatten());
      await persistUsageLog({
        input: ticket,
        status: "error",
        response,
        errorMessage: "Failed to validate AI output",
      });
      return null;
    }

    await persistUsageLog({
      input: ticket,
      status: "success",
      response,
    });

    return parsed.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to analyze ticket", message);
    await persistUsageLog({
      input: ticket,
      status: "error",
      errorMessage: message,
    });
    return null;
  }
};

export default analyzeTicket;
