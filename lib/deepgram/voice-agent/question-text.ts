/**
 * The text the voice agent speaks for a question.
 *
 * It is the same text the live room shows on the question card and the
 * report evaluates: `displayQuestion` (questions from the backend) or
 * `prompt` (questions from the interview payload). The generated
 * `ttsTranscript` is only a fallback because it is written separately and
 * can name different facts than the card, such as a different company.
 */
export function spokenQuestionText(question: {
  displayQuestion?: string | null;
  prompt?: string | null;
  ttsTranscript?: string | null;
}): string {
  return (
    question.displayQuestion?.trim() ||
    question.prompt?.trim() ||
    question.ttsTranscript?.trim() ||
    ""
  );
}
