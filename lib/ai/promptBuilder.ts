export function buildInterviewGenerationPrompt(params: {
  role: string;
  companyType?: string;
  interviewType?: string; // Technical, Behavioral, System Design
  difficulty?: string;
  resumeText?: string;
  jobDescriptionText?: string;
  candidateMemoryText?: string;
}): string {
  const {
    role,
    companyType,
    interviewType,
    difficulty,
    resumeText,
    jobDescriptionText,
    candidateMemoryText,
  } = params;

  let prompt = `Generate 8-10 interview questions for a ${difficulty || "MEDIUM"} level ${role} interview.\n`;

  if (interviewType === "Behavioral") {
    prompt += `\nINTERVIEW TYPE: Behavioral.
Focus primarily on Leadership, Ownership, Teamwork, Communication, Conflict Resolution, and Resume experiences.
At most ONE technical discussion question.`;
  } else if (interviewType === "System Design") {
    prompt += `\nINTERVIEW TYPE: System Design.
Focus on High Level Design, Scalability, Databases, APIs, Microservices, Caching, and relevant Resume Projects.
At most ONE DSA discussion question.`;
  } else {
    prompt += `\nINTERVIEW TYPE: Technical.
Generate:
- 2 to 3 DSA discussion questions.
- 2 Resume/Project deep dives.
- 1 to 2 Core CS / Tech Stack questions.
- 1 Job Description question (if provided).`;
  }

  if (companyType === "Big Tech" || companyType === "FAANG") {
    prompt += `\n\nCOMPANY CONTEXT: FAANG / Big Tech.
Make the DSA questions Medium to Hard difficulty and deeply analytical. Focus on scale and optimal complexity.`;
  } else if (companyType === "Startup") {
    prompt += `\n\nCOMPANY CONTEXT: Startup.
Keep DSA minimal (0-1 Easy/Medium question). Focus heavily on Resume, Projects, APIs, Databases, and practical real-world engineering.`;
  } else {
    prompt += `\n\nCOMPANY CONTEXT: MNC.
Include 1-2 Medium DSA questions, but focus on Core CS, Resume, and practical engineering.`;
  }

  if (resumeText) {
    prompt += `\n\nCANDIDATE RESUME:\n${resumeText.substring(0, 3000)}`;
  }

  if (jobDescriptionText) {
    prompt += `\n\nTARGET JOB DESCRIPTION:\n${jobDescriptionText.substring(0, 2000)}`;
  }

  if (candidateMemoryText) {
    prompt += `\n\n--------------------------------\nCandidate Memory\n\nUse this concise history to adapt topic selection, depth, and follow-up style. It is secondary context: Resume, Job Description, and Interview Configuration remain primary.\n\n${candidateMemoryText.substring(0, 3500)}\n\nAdaptive personalization instructions for Gemini:\n- Preserve the existing interview rules, company template, interview type, and total question count.\n- Use Candidate Memory only to choose WHICH DSA, Core CS, backend, behavioral, or system-design topics to emphasize.\n- Focus more heavily on recurring weaknesses and previously missed topics. If relevant to the role/JD, include at least one discussion question that revisits a recurring weakness.\n- For recurring strengths, avoid beginner questions. Ask deeper architecture, scalability, debugging, trade-off, production, or edge-case questions instead.\n- If prior recommendations appear addressed, verify improvement with a more advanced or applied version rather than repeating the identical question.\n- If communication or confidence has improved, increase technical depth and reduce easy resume-only questions.\n- If previous interviews showed excellent performance in a topic, reduce its weight and allocate more attention to weaker areas.\n- Avoid repeating identical interview questions unless intentional reinforcement is clearly beneficial.\n- Memory should personalize the interview, not dominate it.\n--------------------------------`;
  }

  return prompt;
}
