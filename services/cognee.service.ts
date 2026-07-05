import { getCogneeClient } from "@/lib/cognee/client";

export type CogneeRecallResult = unknown[];

export type CandidateMemoryRecallParams = {
  userId: string;
  role?: string | null;
  company?: string | null;
  interviewType?: string | null;
};

export type CandidateMemoryFocus = {
  recurringStrengths: string[];
  recurringWeaknesses: string[];
  previouslyMissedTopics: string[];
  recentRecommendations: string[];
};

export type CandidateMemoryContext = {
  memories: string[];
  formatted: string | null;
  count: number;
  focus: CandidateMemoryFocus;
};

export async function healthCheck(): Promise<unknown> {
  const client = getCogneeClient();
  await client.initialize();
  return client.request("/health");
}

function serializeMemory(memory: unknown): string {
  return typeof memory === "string" ? memory : JSON.stringify(memory, null, 2);
}

function memoryFileName(memory: unknown): string {
  if (memory && typeof memory === "object" && "interviewId" in memory) {
    const interviewId = (memory as { interviewId?: unknown }).interviewId;
    if (typeof interviewId === "string" && interviewId.trim()) {
      return `interview-memory-${interviewId}-${Date.now()}.json`;
    }
  }

  return `memory-${Date.now()}.txt`;
}

export async function remember(memory: unknown): Promise<unknown> {
  const client = getCogneeClient();
  await client.initialize();

  const serializedMemory = serializeMemory(memory);
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([serializedMemory], { type: "application/json" }),
    memoryFileName(memory),
  );
  formData.append("datasetName", client.userId);
  formData.append("run_in_background", "false");

  return client.request("/api/v1/remember", {
    method: "POST",
    formData,
  });
}

export async function recall(query: string): Promise<CogneeRecallResult> {
  const client = getCogneeClient();
  await client.initialize();

  return client.request<CogneeRecallResult>("/api/v1/recall", {
    method: "POST",
    body: {
      query,
      datasets: [client.userId],
      scope: "graph",
      topK: 5,
    },
  });
}

function getRecallText(entry: unknown): string | null {
  if (!entry || typeof entry !== "object") return null;

  const record = entry as Record<string, unknown>;
  const text = record.text ?? record.content ?? record.answer;

  return typeof text === "string" && text.trim() ? text.trim() : null;
}

function buildCandidateMemoryQuery(
  params: CandidateMemoryRecallParams,
): string {
  const company = params.company?.trim() || "the target company";
  const role = params.role?.trim() || "the target role";
  const interviewType =
    params.interviewType?.trim() || "the upcoming interview";

  return `Retrieve only relevant previous semantic interview memories for candidate ${params.userId} preparing for a ${interviewType} interview for ${role} at ${company}.
Focus on information that should adapt the next Gemini-generated interview.
Return concise structured context using these exact headings when evidence exists:
- Recurring Strengths
- Recurring Weaknesses
- Previously Practiced Topics
- Previously Missed Topics
- Communication Trend
- Confidence Trend
- Improvement Since Last Interview
- Areas Still Needing Practice
- Recent Recommendations
Prioritize repeated patterns over one-off observations. Do not include raw transcripts, resume text, job descriptions, audio, or interview questions.`;
}

function isUsefulMemoryText(memory: string): boolean {
  return !/no (relevant |previous )?(interview )?memor(y|ies)|don't have|do not have|not enough information|unable to find/i.test(
    memory,
  );
}

function splitMemoryLines(memories: string[]): string[] {
  return memories.flatMap((memory) =>
    memory
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*•\s]+/, "").trim())
      .filter(Boolean),
  );
}

function normalizeFocusItem(value: string): string {
  return value.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
}

function extractSectionItems(
  memories: string[],
  sectionNames: string[],
): string[] {
  const lines = splitMemoryLines(memories);
  const sectionPattern = new RegExp(
    `^(${sectionNames.map((name) => name.replace(/\s+/g, "\\s+")).join("|")})\\b[:：]?`,
    "i",
  );
  const nextSectionPattern =
    /^(recurring strengths|technical strengths|strengths|recurring weaknesses|technical weaknesses|weaknesses|previously practiced topics|previously missed topics|missing topic|missing topics|recent recommendations|prior recommendations|recommendations|communication trend|confidence trend|improvement since last interview|areas still needing practice)\b/i;
  const items: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (sectionPattern.test(line)) {
      inSection = true;
      const inline = line.replace(sectionPattern, "").trim();
      if (inline) items.push(normalizeFocusItem(inline));
      continue;
    }

    if (inSection && nextSectionPattern.test(line)) {
      inSection = false;
    }

    if (inSection && !/:$/.test(line)) {
      items.push(normalizeFocusItem(line));
    }
  }

  return Array.from(new Set(items)).slice(0, 5);
}

function buildCandidateMemoryFocus(memories: string[]): CandidateMemoryFocus {
  return {
    recurringStrengths: extractSectionItems(memories, [
      "Recurring Strengths",
      "Technical Strengths",
      "Strengths",
    ]),
    recurringWeaknesses: extractSectionItems(memories, [
      "Recurring Weaknesses",
      "Technical Weaknesses",
      "Weaknesses",
    ]),
    previouslyMissedTopics: extractSectionItems(memories, [
      "Previously Missed Topics",
      "Missing Topics",
      "Missing Topic",
    ]),
    recentRecommendations: extractSectionItems(memories, [
      "Recent Recommendations",
      "Prior Recommendations",
      "Recommendations",
    ]),
  };
}

function formatCandidateMemory(memories: string[]): string | null {
  if (memories.length === 0) return null;

  return memories
    .map((memory, index) => `Memory ${index + 1}:\n${memory}`)
    .join("\n\n")
    .slice(0, 3500);
}

export async function recallCandidateMemory(
  params: CandidateMemoryRecallParams,
): Promise<CandidateMemoryContext> {
  try {
    console.log("[Cognee] Recall started...", {
      userId: params.userId,
      role: params.role,
      company: params.company,
      interviewType: params.interviewType,
    });

    const result = await recall(buildCandidateMemoryQuery(params));
    const memories = result
      .map(getRecallText)
      .filter((memory): memory is string => Boolean(memory))
      .filter(isUsefulMemoryText);

    console.log(`[Cognee] Retrieved ${memories.length} relevant memories`);

    const focus = buildCandidateMemoryFocus(memories);

    return {
      memories,
      formatted: formatCandidateMemory(memories),
      count: memories.length,
      focus,
    };
  } catch (reason) {
    console.error("[Cognee] Recall failed", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });

    return {
      memories: [],
      formatted: null,
      count: 0,
      focus: {
        recurringStrengths: [],
        recurringWeaknesses: [],
        previouslyMissedTopics: [],
        recentRecommendations: [],
      },
    };
  }
}
