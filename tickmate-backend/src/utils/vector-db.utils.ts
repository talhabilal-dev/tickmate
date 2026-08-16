import { OpenAIEmbeddings } from "@langchain/openai";
import { ENV } from "../config/env.config.js";
import { client as qdrantClient } from "../config/vector.config.js";

const COLLECTION_NAME = "tickmate_db";
const EMBEDDING_MODEL = "text-embedding-3-small";

type TicketVectorSource = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "completed";
  helpfulNotes: string | null;
  relatedSkills: string[];
  isPublic: boolean;
  createdBy: number | null;
  assignedTo: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type SimilarTicketSearchInput = {
  title?: string;
  description: string;
  category?: string;
  limit?: number;
  minScore?: number;
};

type SimilarTicketResult = {
  score: number;
  ticket: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    helpfulNotes: string | null;
    relatedSkills: string[];
    createdBy: number | null;
    assignedTo: number | null;
    createdAt: string;
    updatedAt: string;
  };
};

let embeddings: OpenAIEmbeddings | null = null;
let collectionReady = false;

const getEmbeddings = () => {
  if (!ENV.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!embeddings) {
    embeddings = new OpenAIEmbeddings({
      model: EMBEDDING_MODEL,
      openAIApiKey: ENV.OPENAI_API_KEY,
    });
  }

  return embeddings;
};

const buildTicketEmbeddingText = (ticket: {
  title: string;
  description: string;
  category: string;
  helpfulNotes: string | null;
  relatedSkills: string[];
}) => {
  return [
    `Title: ${ticket.title}`,
    `Category: ${ticket.category}`,
    `Description: ${ticket.description}`,
    ticket.helpfulNotes ? `Helpful Notes: ${ticket.helpfulNotes}` : "",
    ticket.relatedSkills.length
      ? `Related Skills: ${ticket.relatedSkills.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const ensureCollection = async (vectorSize: number) => {
  try {
    await qdrantClient.getCollection(COLLECTION_NAME);
    return;
  } catch {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    });
  }
};

const ensurePayloadIndex = async (
  fieldName: string,
  fieldSchema: "keyword" | "bool",
) => {
  try {
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: fieldName,
      field_schema: fieldSchema,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();

    if (message.includes("already exists")) {
      return;
    }

    throw error;
  }
};

const ensureCollectionIndexes = async () => {
  if (collectionReady) {
    return;
  }

  await ensurePayloadIndex("status", "keyword");
  await ensurePayloadIndex("isPublic", "bool");
  collectionReady = true;
};

export const upsertResolvedPublicTicketVector = async (
  ticket: TicketVectorSource,
) => {
  if (ticket.status !== "completed" || !ticket.isPublic) {
    return;
  }

  const embeddingText = buildTicketEmbeddingText(ticket);
  const vector = await getEmbeddings().embedQuery(embeddingText);

  await ensureCollection(vector.length);
  await ensureCollectionIndexes();

  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id: ticket.id,
        vector,
        payload: {
          ticketId: ticket.id,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          status: ticket.status,
          helpfulNotes: ticket.helpfulNotes,
          relatedSkills: ticket.relatedSkills,
          isPublic: ticket.isPublic,
          createdBy: ticket.createdBy,
          assignedTo: ticket.assignedTo,
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      },
    ],
  });
};

export const deleteTicketVector = async (ticketId: number) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [ticketId],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();

    if (message.includes("not found") || message.includes("does not exist")) {
      return;
    }

    throw error;
  }
};

export const searchSimilarResolvedPublicTickets = async (
  input: SimilarTicketSearchInput,
): Promise<SimilarTicketResult[]> => {
  try {
    const configuredMinScore = Number(ENV.SIMILAR_TICKET_MIN_SCORE ?? "0.65");
    const minScore = Number.isFinite(configuredMinScore)
      ? configuredMinScore
      : 0.65;

    const queryText = [
      input.title ? `Title: ${input.title}` : "",
      input.category ? `Category: ${input.category}` : "",
      `Description: ${input.description}`,
    ]
      .filter(Boolean)
      .join("\n");

    const queryVector = await getEmbeddings().embedQuery(queryText);

    await ensureCollection(queryVector.length);
    await ensureCollectionIndexes();

    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: input.limit ?? 5,
      with_payload: true,
      filter: {
        must: [
          { key: "status", match: { value: "completed" } },
          { key: "isPublic", match: { value: true } },
        ],
      },
    });


    return results
      .filter((item) => item.score >= (input.minScore ?? minScore))
      .map((item) => {
        const payload = (item.payload ?? {}) as Record<string, unknown>;

        if (!payload) {
          return null;
        }

        return {
          score: item.score,
          ticket: {
            id: Number(payload.ticketId),
            title: String(payload.title ?? ""),
            description: String(payload.description ?? ""),
            category: String(payload.category ?? ""),
            status: String(payload.status ?? ""),
            helpfulNotes:
              payload.helpfulNotes === null ||
              typeof payload.helpfulNotes === "undefined"
                ? null
                : String(payload.helpfulNotes),
            relatedSkills: Array.isArray(payload.relatedSkills)
              ? payload.relatedSkills.map((skill) => String(skill))
              : [],
            createdBy:
              payload.createdBy === null ||
              typeof payload.createdBy === "undefined"
                ? null
                : Number(payload.createdBy),
            assignedTo:
              payload.assignedTo === null ||
              typeof payload.assignedTo === "undefined"
                ? null
                : Number(payload.assignedTo),
            createdAt: String(payload.createdAt ?? ""),
            updatedAt: String(payload.updatedAt ?? ""),
          },
        };
      })
      .filter((item): item is SimilarTicketResult => Boolean(item));
  } catch (error) {
    throw error;
  }
};
