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

Deepgram Voice Interview

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

Voice Interview

Question

↓

Deepgram TTS

↓

User Speaks

↓

Deepgram Streaming STT

↓

Transcript

↓

Store Answer

Repeat

Store

Answer

- transcript
- duration
- score
- confidence
- feedback

No audio storage.

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

POST /api/interview/answer

POST /api/interview/end

GET /api/interview/history

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

Deepgram

Responsible for

- Speech to Text
- Text to Speech
- Voice Conversation

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