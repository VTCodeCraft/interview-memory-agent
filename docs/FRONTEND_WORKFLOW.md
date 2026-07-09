# AI Interview Memory Agent - Frontend Workflow

## Overview

The frontend guides the user through a complete AI interview journey.

The application has two user flows:

- First-Time User
- Returning User

---

# First-Time User Flow

Landing Page
↓
Sign In / Sign Up (Clerk)
↓
Onboarding
↓
Resume Upload
↓
Job Description Upload
↓
Dashboard
↓
Interview Setup
↓
AI Interview
↓
Processing
↓
Interview Report
↓
Memory Timeline
↓
Analytics
↓
Dashboard

---

# Returning User Flow

Sign In
↓
Dashboard
↓
Interview Setup
↓
AI Interview
↓
Processing
↓
Report
↓
Dashboard

The AI retrieves previous memories before generating questions.

---

# Page Breakdown

## 1. Landing Page (/)

Purpose:
- Introduce product
- Explain AI Memory
- Show features

CTA:
- Get Started

↓

Redirect to Clerk Authentication

---

## 2. Authentication

Handled by Clerk.

Backend:

- Check user exists
- Create user if first login

If profile incomplete

↓

Onboarding

Else

↓

Dashboard

---

## 3. Onboarding (/onboarding)

Collect:

### Step 1

- Current Role
- Experience
- GitHub
- LinkedIn

↓

### Step 2

- Target Companies
- Interview Types
- Preferred Difficulty
- Voice/Text Mode

↓

### Step 3

Upload Resume

↓

### Step 4

Upload Job Description (Optional)

↓

Dashboard

---

## 4. Dashboard (/dashboard)

Main home page.

Display:

- Welcome Card
- AI Readiness Score
- Current Streak
- Recent Interview
- Memory Summary
- Weak Topics
- Strong Skills
- Quick Analytics

Primary CTA

Start Interview

---

## 5. Interview Setup (/interview/setup)

Choose:

- Company
- Role
- Difficulty
- Duration
- Interview Mode

Show AI Recommendations

Example:

Weak Topics:
- Redis
- System Design

Strong Topics:
- React
- Next.js

↓

Generate Interview

---

## 6. Live Interview (/interview/live)

Display:

- Current Question
- AI Voice
- Microphone
- Live Transcript
- Progress
- Timer

Flow

AI asks question

↓

User answers

↓

Transcript updates live

↓

Next Question

Repeat

---

## 7. Processing Screen (/interview/processing)

Loading states:

- Evaluating Answers
- Generating Report
- Updating Memory
- Building Analytics

↓

Navigate to Report

---

## 8. Report (/reports/:id)

Display:

Overall Score

Technical Score

Communication

Confidence

Behavior

Problem Solving

Strengths

Weaknesses

Recommendations

Question-wise Feedback

Buttons

- Dashboard
- Memory Timeline
- Start New Interview

---

## 9. Memory Timeline (/memory)

Displays long-term AI memory.

Examples:

Interview 1
↓
Weak React

Interview 2
↓
React Improved

Interview 3
↓
Redis Weak

Interview 4
↓
Confidence Improved

Sections

- Timeline
- Repeated Mistakes
- Growth
- Mastered Skills
- AI Observations

---

## 10. Analytics (/analytics)

Charts

- Interview Scores
- Confidence Trend
- Skill Growth
- Company Readiness
- Weekly Activity
- Interview Frequency

---

## 11. Interview History (/reports)

Display all previous interviews.

Each card:

- Company
- Role
- Date
- Score
- Report Button

---

## 12. Settings (/settings)

Manage:

- Profile
- Resume
- Target Companies
- Preferences
- Notifications
- AI Memory Settings
- Account

---

# Frontend State Flow

Landing
↓

Authentication
↓

Onboarding
↓

Dashboard
↓

Interview
↓

Report
↓

Memory Updated
↓

Dashboard

---

# Important UX Notes

Never ask the user to upload Resume every interview.

Store:

- Latest Resume
- Latest JD

Allow replacing them anytime.

---

Memory should always be visible.

Dashboard should constantly show:

- Latest Score
- Improvement
- Current Weak Topics
- Next Recommendation

The user should feel the AI remembers them.