# AI Interview Memory Agent - Backend Workflow

## Overview

Architecture

Frontend
↓

Next.js API

↓

Neon PostgreSQL (Source of Truth)

↓

Gemini

↓

Deepgram

↓

Cognee Memory

PostgreSQL stores structured data.

Cognee stores semantic memory.

---

# Complete Backend Flow

User Login
↓

Create User (if first login)

↓

Onboarding

↓

Resume Upload

↓

JD Upload

↓

Resume Parsing

↓

JD Parsing

↓

Retrieve Cognee Memory

↓

Prompt Builder

↓

Gemini Question Generation

↓

Interview Session

↓

Deepgram Voice Agent Interview (single WebSocket: STT + LLM control + TTS)

↓

Store Transcripts

↓

Gemini Evaluation

↓

Generate Report

↓

Update Analytics

↓

Update Cognee Memory

↓

Next Interview Uses Memory

---

# Phase 1

Authentication

Clerk

↓

GET /api/auth/me

Create:

- User
- UserProfile
- InterviewAnalytics

---

# Phase 2

Onboarding APIs

POST /api/user/onboarding

GET /api/user/profile

PATCH /api/user/profile

Store

- Experience
- Target Role
- Preferences
- GitHub
- LinkedIn

---

# Phase 3

Resume Upload

POST /api/user/resume

Store

- fileUrl

Later

Resume Parsing

↓

Gemini

↓

Update

Resume

parsedText

skills

projects

summary

---

Job Description

POST /api/user/job-description

Store

- company
- title
- fileUrl

Later

Gemini

↓

Extract

- Required Skills
- Preferred Skills
- Experience
- Role

---

# Phase 4

Interview Creation

POST /api/interview/start

Workflow

Load User

↓

Load Profile

↓

Load Resume

↓

Load JD

↓

Retrieve Cognee Memory

↓

Prompt Builder

↓

Gemini

↓

Generate Questions

↓

Save Interview

↓

Save Questions

↓

Return Interview

---

# Prompt Builder

Input

Resume

+

Job Description

+

User Profile

+

Cognee Memory

Output

Personalized Interview Prompt

Rules

- Focus on weak topics
- Avoid repeated questions
- Increase difficulty gradually
- Include Resume Questions
- Include JD Questions
- Include Behavioral Questions

---

# Phase 5

Voice Interview (Deepgram Voice Agent)

Current architecture uses the Deepgram **Voice Agent** runtime — a single
unified WebSocket — instead of the earlier separate TTS + Streaming STT calls.
One socket handles listen (STT), think (LLM control), and speak (TTS) together.

Endpoint

wss://agent.deepgram.com/v1/agent/converse

Agent config (buildInterviewAgentSettings)

- listen: deepgram nova-3        (STT)
- think:  open_ai gpt-4o         (silent control layer, Deepgram-hosted)
- speak:  deepgram aura-2-thalia-en   (TTS)
- audio in:  linear16 @ 16000 Hz (mic)
- audio out: linear16 @ 24000 Hz (playback)

The agent ("Aria") is a SILENT control layer. It NEVER generates questions,
follow-ups, or commentary. Gemini already produced the questions; the backend
injects each one verbatim.

Token

GET /api/interview/voice/token
↓
Mint short-lived Deepgram access token (TTL 300s)
↓
Browser opens WebSocket, token rides in Sec-WebSocket-Protocol
as ["bearer", <token>]

Turn Flow

Client opens socket
↓
Send Settings (agent config)
↓
InjectAgentMessage (Gemini question, spoken verbatim)
↓
User Speaks
↓
Agent STT streams transcript to client (client accumulates buffer)
↓
Answer complete? → agent calls complete_answer function (client-side)
   fallback: client-side silence timers if the LLM stalls
↓
POST /api/interview/voice/answer
   { interviewId, sequence, transcript, durationSec }
↓
saveAnswerAndAdvance()
   - saveInterviewAnswer() (shared with V1, flips interview to ONGOING)
   - resolve next question by sequence
↓
Return { done, index, totalQuestions, nextQuestion }
↓
Not done → InjectAgentMessage(nextQuestion), repeat
Done → client ends session → POST /api/interview/end

Turn-taking is client-driven (silence timers), never decided by the agent LLM.
KeepAlive frames every 5s sustain the open socket.

Store

Answer

- transcript
- duration
- score
- confidence
- feedback

No audio storage. Client STT buffer is authoritative transcript.

Legacy note

The separate /api/speech/* routes (token, speak, transcribe) still exist for
standalone TTS/STT but the voice interview now runs entirely through the
Voice Agent socket above.

---

# Phase 6

Evaluation

Collect

Resume

JD

Questions

Answers

↓

Gemini

↓

Structured Report

Return

Overall Score

Technical Score

Communication Score

Confidence Score

Behavior Score

Problem Solving

Strengths

Weaknesses

Recommendations

Per Question Feedback

Store Report

---

# Phase 7

Analytics

Update

InterviewAnalytics

Fields

- Average Score
- Total Interviews
- Readiness
- Current Streak

---

# Phase 8

Cognee Memory

After Report

Transform Report

↓

Semantic Knowledge

Store

Strengths

Weak Topics

Repeated Mistakes

Confidence Trend

Communication Trend

Skills Mastered

Skills Missing

Company Readiness

Topics Practiced

Improvement Suggestions

Never store

- Raw Transcript
- Audio
- PDFs

Cognee stores knowledge only.

---

# Future Interview

User Starts Interview

↓

Load Resume

↓

Load JD

↓

Retrieve Cognee Memory

↓

Prompt Builder

↓

Gemini

↓

Generate Personalized Questions

↓

Interview

↓

Evaluation

↓

Update Memory

Repeat forever

---

# API Flow

Authentication

GET /api/auth/me

---

User

POST /api/user/onboarding

GET /api/user/profile

PATCH /api/user/profile

POST /api/user/resume

POST /api/user/job-description

---

Interview

POST /api/interview/start

POST /api/interview/generate

POST /api/interview/answer

POST /api/interview/end

POST /api/interview/cancel

GET /api/interview/history

---

Voice Agent

GET /api/interview/voice/token

POST /api/interview/voice/answer

---

Reports

GET /api/reports/:id

---

Analytics

GET /api/analytics

---

Memory

GET /api/memory/timeline

GET /api/memory/insights

---

Speech

POST /api/speech/token

POST /api/speech/transcribe

POST /api/speech/speak

---

# Responsibilities

Neon PostgreSQL

Stores

- Users
- Profiles
- Resumes
- Job Descriptions
- Interviews
- Questions
- Answers
- Reports
- Analytics

Gemini

Responsible for

- Resume Parsing
- JD Parsing
- Question Generation
- Interview Evaluation
- Feedback
- Report Generation

Deepgram (Voice Agent)

Single unified WebSocket runtime (wss://agent.deepgram.com/v1/agent/converse).
Responsible for

- Speech to Text (listen: nova-3)
- Text to Speech (speak: aura-2-thalia-en)
- Voice Conversation control (think: gpt-4o, silent — speaks only injected questions)
- Turn conducting (backend injects Gemini questions, agent never generates them)

Cognee

Responsible for

- Long-term Memory
- Semantic Relationships
- Weak Topics
- Strength Tracking
- Confidence Trends
- Personalized Context

---

# End-to-End System Flow

User
↓

Authentication

↓

Onboarding

↓

Resume + JD

↓

Parsing

↓

Retrieve Cognee Memory

↓

Prompt Builder

↓

Gemini

↓

Questions

↓

Deepgram Interview

↓

Transcripts

↓

Gemini Evaluation

↓

PostgreSQL Report

↓

Analytics Update

↓

Cognee Memory Update

↓

Dashboard

↓

Next Interview Uses Previous Memory

This creates an AI interviewer that continuously learns from every interview and delivers increasingly personalized mock interviews over time.