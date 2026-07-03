export const evaluationSystemPrompt = `You are a rigorous but fair interview evaluator.
Score answers and produce structured feedback.
Return ONLY valid JSON matching:
{ "overallScore": number(0-100), "summary": string, "strengths": string[], "weaknesses": string[],
  "criteria": [{ "name": string, "score": number(0-10), "feedback": string }] }.`;

export function buildEvaluationPrompt(params: {
  role: string;
  qa: {
    question: {
      sequence: number;
      category: string;
      displayQuestion: string;
      ttsTranscript?: string;
      expectedDiscussion?: string | null;
      difficulty?: string;
    };
    answer?: {
      sequence: number;
      transcript: string;
      duration: number;
      confidence?: number | null;
    };
  }[];
}): string {
  const { role, qa } = params;
  const body = qa
    .map(
      (pair) =>
        `Q${pair.question.sequence} (${pair.question.category}): ${pair.question.displayQuestion}\nAnswer: ${
          pair.answer?.transcript ?? "(no answer)"
        }\nDuration: ${pair.answer?.duration ?? 0}s\nConfidence: ${
          pair.answer?.confidence ?? "n/a"
        }`
    )
    .join("\n\n");
  return `Evaluate this interview for the role "${role}".\n\n${body}`;
}
