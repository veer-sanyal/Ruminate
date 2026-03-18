# ReadFlow — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** March 2026
**Author:** Product Team
**Status:** Ready for Development

---

## Executive Summary

ReadFlow is a web-based reading application that combines AI-narrated book reading with guided reflection and connected journaling to help nonfiction readers retain more and translate insights into real behavior change. The product serves people who read self-help, psychology, business, and health books and want a structured system for applying what they read to their lives.

The primary reading mode is AI text-to-speech narration with real-time word highlighting. Post-chapter reflection prompts escalate in depth from intellectual to identity-level. A daily journal connects reading themes to the user's real life, with AI pattern observation and micro-behavioral experiments.

**Core loop:** Upload → Listen → Reflect → Journal → Track

---

## Problem Statement

Nonfiction readers, particularly those reading for personal growth, face three compounding problems:

1. **Retention decay.** People forget 70–90% of what they read within a week. Passive reading — even with highlighting — doesn't create durable memories.

2. **Insight-to-action gap.** Readers regularly finish books, feel inspired, and change nothing. The book's ideas never connect to specific situations in their lives.

3. **Pattern blindness.** The same themes (avoidance, self-doubt, people-pleasing) appear across multiple books a person reads and across their daily experiences, but without a system to surface those patterns, readers never connect the dots.

Existing solutions address these individually (audiobooks for convenience, journaling apps for reflection, reading trackers for accountability) but nothing ties reading, reflection, and daily behavior change into a single coherent experience.

---

## Target User

### Primary Persona

**Name:** The Intentional Reader
**Age:** 20–35
**Reads:** 2–10 nonfiction books per year (self-help, psychology, business, health)
**Motivation:** Wants to actually change, not just consume information
**Frustration:** "I keep reading about the same things but nothing changes"

**Behavioral markers:**
- Has a backlog of books they feel guilty about not finishing
- Has tried journaling but couldn't stick with it (blank page problem)
- Reads book summaries or highlights but knows they're not the same as real engagement
- Interested in therapy/self-improvement but may not be in therapy
- Willing to spend 5 extra minutes per reading session if the app makes reflection easy

### Non-Target Users

- Speed-reading enthusiasts optimizing for WPM
- Fiction readers looking for an audiobook replacement
- Students doing academic research
- People who want a knowledge management tool (Notion/Obsidian)

---

## Success Metrics

### North Star Metric

**Reflection completion rate:** % of finished chapters that receive at least one reflection prompt response. Target: 40%+ after 30 days.

This metric captures the core value proposition — users aren't just consuming content, they're engaging with it.

### Primary Metrics

| Metric | Target (30-day) | Why It Matters |
|--------|----------------|----------------|
| Chapters completed per user/week | 3+ | Reading engagement |
| Journal entries per user/week | 4+ | Journaling habit formed |
| Experiment acceptance rate | 30%+ | Users converting insight to action |
| 7-day retention | 50%+ | Product stickiness |
| 30-day retention | 30%+ | Long-term habit formation |

### Secondary Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Books uploaded per user | 2+ in first month | Library investment |
| Avg. session length | 15+ min | Deep engagement |
| Theme threads surfaced | 1+ per user within 3 weeks | Pattern detection working |
| Comprehension "Got it" rate | 60%+ | Content being understood |
| NPS | 40+ | Willingness to recommend |

### Guardrail Metrics (things that should NOT happen)

| Metric | Threshold | Action |
|--------|-----------|--------|
| AI reflection dismissed without reading | >50% | Rethink timing/length |
| Journal entries <20 words avg | Consistent | Prompts aren't resonating |
| "Lost" checkpoint rate | >30% per user | Narration speed too fast, content too dense |
| Processing errors | >5% of uploads | Text extraction pipeline needs work |

---

## Requirements by MVP

### MVP1: Narrated Reader (4–6 weeks)

**Goal:** Validate that people enjoy listening to books with word highlighting and will finish chapters this way.

#### Functional Requirements

| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| M1-01 | User can sign up with email/password or Google OAuth | Must have | Supabase Auth |
| M1-02 | User completes 4-step onboarding (focus areas, coach tone, voice, privacy) | Must have | Sets personalization defaults |
| M1-03 | User can upload EPUB files | Must have | Primary format |
| M1-04 | User can upload PDF files | Must have | With quality warnings |
| M1-05 | App extracts text and detects chapters from uploaded files | Must have | epub.js + pdf.js |
| M1-06 | User can manually edit chapter boundaries (reorder, rename, merge, split) | Should have | Essential for bad auto-detection |
| M1-07 | Library displays books in a grid with cover, title, author, progress | Must have | Three tabs: Reading, Finished, Collections |
| M1-08 | Book detail page shows chapters, progress, and "Continue Reading" CTA | Must have | |
| M1-09 | AI narration plays chapter audio with word-level highlighting | Must have | **Core feature** — OpenAI TTS + timestamps |
| M1-10 | User can control narration speed (0.75x–2.5x) | Must have | Presets + slider |
| M1-11 | Scrub bar with waveform lets user seek within chapter | Must have | wavesurfer.js |
| M1-12 | Double-tap replays current sentence | Must have | |
| M1-13 | Long-press shows paragraph view overlay | Should have | |
| M1-14 | Confusion flag button logs passages for later clarification | Should have | |
| M1-15 | Chunk checkpoints (Got it/Kinda/Lost) every 3–5 minutes | Should have | |
| M1-16 | Reading progress persists across sessions | Must have | listen_progress_ms |
| M1-17 | Chapter completion screen with next chapter navigation | Must have | |
| M1-18 | TTS audio cached per chapter per voice | Must have | Supabase Storage |
| M1-19 | Settings page with profile, reading preferences, privacy controls | Must have | |
| M1-20 | Processing status visible during book upload/extraction | Must have | Polling + badge |
| M1-21 | Empty state for first-time library | Should have | Warm illustration + upload CTA |
| M1-22 | Reading sessions tracked (duration, speed, words consumed) | Should have | For later insights |

#### Exit Criteria for MVP1

- 10+ test users have finished at least 1 full chapter via narration
- Average satisfaction rating ≥ 7/10 for the narration experience
- Word highlighting sync is accurate to within 100ms
- TTS generation completes within 60 seconds per chapter

---

### MVP2: Reflection + RSVP (3–4 weeks)

**Goal:** Validate that post-chapter reflection increases engagement and that the AI prompts feel valuable, not generic.

#### Functional Requirements

| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| M2-01 | AI distillation pipeline runs on book upload (summary, claims, identity beliefs, payoff questions) | Must have | GPT-4o-mini per chapter |
| M2-02 | Reflection Sprint page with user summary section | Must have | |
| M2-03 | 3 AI-generated prompts at escalating depth (intellectual → personal → identity) | Must have | **Key differentiator** |
| M2-04 | Depth tags on prompts ("personal," "go deeper") | Should have | Invitations, not demands |
| M2-05 | Connection topics linking to earlier chapters or other books | Should have | 2–4 per chapter |
| M2-06 | "Turn into recall questions" generates 3–5 questions | Nice to have | |
| M2-07 | Confusion flag clarifications shown in reflection | Should have | AI explains flagged passages |
| M2-08 | RSVP mode with centered word display and ORP highlighting | Must have | |
| M2-09 | RSVP WPM control with presets (200/300/450) | Must have | |
| M2-10 | Smart pausing in RSVP (punctuation, long words, paragraph breaks) | Should have | |
| M2-11 | Mode toggle between Narration and RSVP in reader | Must have | |
| M2-12 | All reader features work in RSVP mode (scrub, replay, paragraph view, confusion, checkpoints) | Must have | |
| M2-13 | Reflection is skippable without nagging | Must have | Auto-summary saved |

#### Exit Criteria for MVP2

- 40%+ of completed chapters receive at least one reflection response
- Users report prompts feel "relevant to my life" (not generic) in 60%+ of cases
- RSVP mode is used by at least 15% of users
- Average reflection time: 2–5 minutes (not too short, not too long)

---

### MVP3: Journal + Personalization + Insights (3–4 weeks)

**Goal:** Validate the reading-to-life connection. Do users actually change behavior when the app helps them notice patterns and suggests experiments?

#### Functional Requirements

| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| M3-01 | Daily journal page with emotional check-in (emoji/word selector) | Must have | |
| M3-02 | AI-generated behavior prompt tied to recent reading | Must have | |
| M3-03 | AI-generated theme question tied to current book | Must have | |
| M3-04 | Identity prompt for self-help books ("go deeper" tag) | Should have | |
| M3-05 | Freeform entry section (large textarea, voice-to-text) | Must have | **The main event** |
| M3-06 | AI reflection generated after saving (2–4 sentences, pattern observation, open question) | Must have | **Key differentiator** |
| M3-07 | Micro-experiment suggestion after AI reflection | Must have | Low-stakes, one-rep, specific |
| M3-08 | Experiment accept/modify/skip flow | Must have | |
| M3-09 | Next-day experiment follow-up prompt | Should have | |
| M3-10 | Past journal entries browsable (collapsed cards, tap to expand) | Must have | |
| M3-11 | Theme thread detection via embedding similarity | Must have | Cron job, daily |
| M3-12 | Theme threads displayed with label, description, related entries/chapters | Must have | |
| M3-13 | Thread surfacing in journal ("You've been thinking about X…") | Should have | Gentle callout |
| M3-14 | Thread dismiss action | Must have | |
| M3-15 | Journal-informed prompt personalization (last 3 entries as context) | Should have | Opt-in only |
| M3-16 | Coach tone applied to all AI-generated content | Must have | direct/gentle/analytical |
| M3-17 | Focus areas used in prompt generation context | Must have | |
| M3-18 | Privacy controls enforced (local-only journal, no personalization, delete raw text) | Must have | Non-negotiable |
| M3-19 | Insights dashboard: stat cards (time, books, streaks) | Must have | |
| M3-20 | Insights: reading time bar chart (last 30 days) | Should have | |
| M3-21 | Insights: speed trend line chart | Nice to have | |
| M3-22 | Insights: comprehension line chart (% Got it) | Nice to have | |
| M3-23 | Crisis content detection → static resource card | Must have | **Safety-critical** |
| M3-24 | Landing page with hero, how-it-works, features, CTA | Must have | For launch |

#### Exit Criteria for MVP3

- 50%+ of active users journal at least 4 times per week
- 30%+ of micro-experiments are accepted
- At least 1 theme thread surfaced per user within 3 weeks of journaling
- Users rate AI reflections as "helpful" or "insightful" 50%+ of the time
- Zero incidents of inappropriate AI responses to crisis content

---

## Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Page load time (library, journal) | < 1.5s |
| Reader page load (text visible) | < 1s |
| TTS generation time per chapter | < 60s |
| Word highlight sync accuracy | Within 100ms |
| AI reflection generation | < 5s |
| Book processing (upload → ready) | < 5 min for 300-page book |

### Security & Privacy

| Requirement | Details |
|-------------|---------|
| Authentication | Supabase Auth with JWT, row-level security on all tables |
| Data encryption | HTTPS in transit, encrypted at rest (Supabase default) |
| Local-only journal option | When enabled, entries stored in browser only (IndexedDB), never sent to server |
| Raw text deletion | When enabled, chapter raw_text cleared after distillation completes |
| No data sold | Journal content and reading data never shared with third parties |
| GDPR compliance | Data export (JSON), account deletion removes all user data |

### Scalability

MVP is designed for 100–1,000 users. Key bottlenecks to monitor:
- TTS generation queue (concurrent OpenAI API calls)
- AI distillation during book upload spikes
- Supabase Storage for audio files (~50MB per book)
- Daily cron jobs for journal prompts and theme detection

---

## Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Word-level TTS timestamps inaccurate | Medium | High | Test with multiple voice models. Fallback: forced alignment post-processing. |
| PDF text extraction too unreliable | High | Medium | EPUB as primary format. PDF gets quality check + manual chapter editing. Clear user messaging. |
| AI prompts feel generic | Medium | High | Prompts generated from distilled content (not raw text). Human review of prompt quality in testing. |
| TTS cost per book too high | Medium | Medium | Aggressive caching. Evaluate cheaper providers. Free tier limits books/month. |
| Theme detection false positives | Medium | Low | Conservative threshold (0.82). User can dismiss threads. Never pathologizing language. |
| User writes crisis content | Low | Critical | Keyword + classifier detection. Static resource card. No AI response. Tested before launch. |

---

## Dependencies & Integrations

| Dependency | Type | Risk |
|-----------|------|------|
| OpenAI TTS API | External service | Rate limits, pricing changes, downtime |
| OpenAI GPT-4o-mini | External service | Model deprecation, quality changes |
| Supabase | Infrastructure | Free tier limits, pgvector performance |
| Vercel | Hosting | Cold starts on edge functions |
| Google Fonts | Static assets | CDN availability (minimal risk) |

---

## Out of Scope (Not in MVP1–3)

- Mobile native app (web-first, PWA considered for post-MVP)
- Social features (sharing reflections, reading groups)
- Spaced repetition system (recall questions exist but no SRS scheduling)
- Marketplace / book store integration
- Multi-language support
- Collaborative annotations
- Integration with Kindle, Apple Books, or other reading platforms
- Podcast / article reading (books only)

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0: Setup | 1 week | Project scaffolding, Supabase, auth, layout components |
| MVP1: Narrated Reader | 4–6 weeks | Upload, library, narrated reader with word highlighting |
| MVP1 Testing | 1 week | 10+ users, feedback collection, bug fixes |
| MVP2: Reflection + RSVP | 3–4 weeks | Distillation pipeline, reflection sprint, RSVP mode |
| MVP2 Testing | 1 week | Prompt quality review, RSVP usability testing |
| MVP3: Journal + Insights | 3–4 weeks | Journal, AI reflection, experiments, themes, insights, landing page |
| MVP3 Testing | 1 week | Full product testing, crisis detection verification |
| **Total** | **~14–18 weeks** | **Complete product ready for public launch** |

---

## Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Tech Lead | | | Pending |
| Design Lead | | | Pending |

---

## Appendices

### A. Related Documents

- [ReadFlow Product Concept](./ReadFlow_Product_Concept.md) — Vision, target user, feature descriptions
- [ReadFlow User Flows](./ReadFlow_User_Flows.md) — Mermaid flow diagrams for all user journeys
- [ReadFlow Architecture](./ReadFlow_Architecture.md) — Tech stack, data model, API routes, page specs
- [ReadFlow Design System](./ReadFlow_Design_System.md) — Colors, typography, components, animations, AI tone
- [ReadFlow System Prompt](./ReadFlow_System_Prompt.md) — Context document for AI-assisted development
- [ReadFlow First Prompt](./ReadFlow_First_Prompt.md) — Build plan generation prompt

### B. Cost Estimates

| Item | Per Book | Per User/Month | Notes |
|------|----------|---------------|-------|
| TTS narration | $1–$10 | Varies | Cached after first listen |
| AI distillation | $0.25–$0.75 | Varies | One-time per book |
| Journal AI (daily) | — | $0.30–$1.50 | 1–2 calls/day |
| Theme detection | — | ~$0.10 | Daily cron |
| Supabase (free tier) | — | $0 | Up to 500MB, 50K auth users |
| Vercel (free tier) | — | $0 | Up to 100GB bandwidth |
| **Total infrastructure** | | **$0.50–$3/user/month** | At MVP scale |

### C. Pricing Model (Proposed)

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 book/month, 3 journal entries/week, narration at 1.0x only |
| Pro | $9/month | Unlimited books, daily journal, all speeds, theme threads |
| Annual | $79/year | Same as Pro, ~27% discount |
