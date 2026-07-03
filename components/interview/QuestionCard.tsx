"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InterviewQuestion } from "@/types";

interface Props {
  question: InterviewQuestion;
  index: number;
  total: number;
  onNext?: () => void;
}

/** Displays a single interview step. */
export function InterviewStepCard({ question, index, total, onNext }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-zinc-500">
          {question.type} · Step {index + 1} / {total}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{question.prompt}</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
}
