import { complete, parseJSON } from "./index";
import { resumeParsingSystemPrompt } from "./prompts/resume";

export interface ParsedResume {
  summary: string;
  experience: string;
  skills: string[];
  projects: { title: string; description: string; technologies: string[] }[];
  education: { degree: string; institution: string }[];
  certifications: string[];
}

export async function parseResumeText(resumeText: string): Promise<ParsedResume> {
  const raw = await complete(resumeParsingSystemPrompt, resumeText, {
    provider: "gemini",
    json: true,
  });
  return parseJSON<ParsedResume>(raw);
}
