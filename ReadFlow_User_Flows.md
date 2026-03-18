# ReadFlow — User Flow Diagrams

---

## 1. New User Flow (First Visit → First Reading Session)

```mermaid
flowchart TD
    A[Landing Page — /] --> B[Sign Up — /signup]
    B --> C[Onboarding — /onboarding]
    
    C --> C1[Step 1: Focus Areas]
    C1 --> C2[Step 2: Coach Tone]
    C2 --> C3[Step 3: Voice Preview]
    C3 --> C4[Step 4: Privacy Settings]
    C4 --> C5[Upload First Book prompt]
    
    C5 --> D[Library — /library\nempty state, upload modal opens]
    D --> E[Book Processing\nextract → chunk → distill\n~1-3 min async]
    E --> F[Book Detail — /library/:bookId\nchapters, 'Start Reading']
    F --> G[AI-Narrated Reader — /read/:bookId/:chId\nfirst chapter begins playing]

    style A fill:#f5f5f4,stroke:#78716c
    style B fill:#faece7,stroke:#d85a30
    style C fill:#eeedfe,stroke:#534ab7
    style C1 fill:#eeedfe,stroke:#534ab7
    style C2 fill:#eeedfe,stroke:#534ab7
    style C3 fill:#eeedfe,stroke:#534ab7
    style C4 fill:#eeedfe,stroke:#534ab7
    style C5 fill:#e1f5ee,stroke:#0f6e56
    style D fill:#e1f5ee,stroke:#0f6e56
    style E fill:#faeeda,stroke:#854f0b
    style F fill:#e6f1fb,stroke:#185fa5
    style G fill:#e6f1fb,stroke:#185fa5
```

### Time Estimates
| Step | Duration |
|------|----------|
| Sign up | ~30 seconds |
| Onboarding (4 steps) | ~2 minutes |
| Book processing | ~1–3 minutes (async) |
| **Total to first value** | **~5 minutes** |

### Key Design Decisions
- Onboarding defaults to narration mode (not RSVP)
- Upload modal opens automatically on first visit to library
- Book processing happens async — user sees progress badge on book card
- If audio isn't cached yet when user opens reader, show "Generating narration…" with option to switch to RSVP

---

## 2. Returning User Flow (Daily Session)

```mermaid
flowchart TD
    A[Open App / Login] --> B[Library — /library]
    
    B --> J[Daily Journal\n/journal]
    B --> R[Continue Reading\nBook Detail → Reader]
    B --> U[Upload New Book]
    
    %% Journal path
    J --> J1[Emotional check-in]
    J1 --> J2[Behavior + Theme prompts]
    J2 --> J3[Freeform entry]
    J3 --> J4[Save → AI Reflection appears]
    J4 --> J5[Micro-experiment suggested]
    J5 --> J6{Theme thread surfaced?}
    J6 -->|Yes| J7[Explore thread →]
    J6 -->|No| B2[Back to Library or Insights]
    
    %% Reading path
    R --> RD[Book Detail — /library/:bookId]
    RD --> RE[Reader — /read/:bookId/:chId]
    
    RE --> RE1[AI Narration mode]
    RE --> RE2[RSVP mode]
    
    RE1 --> CK[Checkpoints every 3-5 min\nGot it / Kinda / Lost]
    RE2 --> CK
    CK --> CF[Confusion flags logged]
    CF --> CC[Chapter Complete!]
    
    CC --> RF[Reflection Sprint\n/reflect/:bookId/:chId]
    CC --> NC[Next Chapter → Reader]
    
    %% Reflection sub-flow
    RF --> RF1[Write your summary]
    RF1 --> RF2[Respond to AI prompts\n3 depth levels]
    RF2 --> RF3[Review connections]
    RF3 --> RF4[Generate recall questions?]
    RF4 --> DONE[Done → Next chapter or Library]
    
    %% Next chapter loops back
    NC --> RE
    
    %% Upload path
    U --> UP[Processing async]
    UP -.-> B

    style A fill:#f5f5f4,stroke:#78716c
    style B fill:#e1f5ee,stroke:#0f6e56
    style J fill:#fbeaf0,stroke:#993556
    style J1 fill:#fbeaf0,stroke:#993556
    style J2 fill:#fbeaf0,stroke:#993556
    style J3 fill:#fbeaf0,stroke:#993556
    style J4 fill:#fbeaf0,stroke:#993556
    style J5 fill:#fbeaf0,stroke:#993556
    style RE fill:#e6f1fb,stroke:#185fa5
    style RE1 fill:#e6f1fb,stroke:#185fa5
    style RE2 fill:#e6f1fb,stroke:#185fa5
    style CK fill:#faeeda,stroke:#854f0b
    style CC fill:#e1f5ee,stroke:#0f6e56
    style RF fill:#eeedfe,stroke:#534ab7
    style RF1 fill:#eeedfe,stroke:#534ab7
    style RF2 fill:#eeedfe,stroke:#534ab7
    style RF3 fill:#eeedfe,stroke:#534ab7
    style RF4 fill:#eeedfe,stroke:#534ab7
```

### Session Patterns

**Quick session (10 min):** Library → Journal check-in → Done

**Standard session (30 min):** Library → Reader (1 chapter) → Reflection Sprint → Done

**Deep session (60+ min):** Journal → Reader (2–3 chapters) → Reflection → Insights review

---

## 3. Book Processing Pipeline Flow

```mermaid
flowchart TD
    UP[User uploads EPUB/PDF] --> S1[Store file in Supabase Storage\nCreate book record\nstatus: uploading]
    S1 --> S2{File format?}
    S2 -->|EPUB| E1[Parse with epub.js\nExtract chapters from NCX/TOC]
    S2 -->|PDF| P1[Parse with pdf.js\nDetect headings for chapters]
    E1 --> QC[Quality Check\n>5% garbled? <500 words?]
    P1 --> QC
    QC -->|Pass| S3[Create chapter records\nstatus: extracting → distilling]
    QC -->|Fail| ERR[status: error\nSuggest EPUB version]
    S3 --> D1[For each chapter:\nGPT-4o-mini distillation\nsummary, claims, identity_beliefs]
    D1 --> D2[Generate embeddings\nStore in pgvector]
    D2 --> D3[Synthesize book-level\nai_summary + theme_tags]
    D3 --> READY[status: ready\nBook available for reading]

    style UP fill:#faece7,stroke:#d85a30
    style S1 fill:#faeeda,stroke:#854f0b
    style S3 fill:#faeeda,stroke:#854f0b
    style D1 fill:#eeedfe,stroke:#534ab7
    style D2 fill:#eeedfe,stroke:#534ab7
    style D3 fill:#eeedfe,stroke:#534ab7
    style READY fill:#eaf3de,stroke:#3b6d11
    style ERR fill:#fcebeb,stroke:#a32d2d
```

---

## 4. AI Narration & Word Highlighting Flow

```mermaid
flowchart TD
    OPEN[User opens chapter] --> CHK{Audio cached?}
    CHK -->|Yes| PLAY[Load audio + timestamps\nEnable play button]
    CHK -->|No| GEN[POST /api/.../audio\nGenerate TTS with word timestamps]
    GEN --> WAIT[Show 'Generating narration…'\nUser can read silently or use RSVP]
    WAIT --> CACHE[Store audio + timestamps\nin Supabase Storage]
    CACHE --> PLAY
    
    PLAY --> SYNC[Audio plays → position tracked\nMatch position to timestamp array\nHighlight current word]
    SYNC --> CK{3-5 min checkpoint?}
    CK -->|Yes| RATE[Got it / Kinda / Lost]
    RATE -->|Lost| SLOW[Decrease speed 0.1x]
    RATE -->|Got it| CONT[Continue]
    RATE -->|Kinda| CONT
    CK -->|No| CONT
    SLOW --> CONT
    CONT --> END{End of chapter?}
    END -->|No| SYNC
    END -->|Yes| COMPLETE[Chapter Complete screen\nReflect or Next Chapter]

    style GEN fill:#faeeda,stroke:#854f0b
    style PLAY fill:#e6f1fb,stroke:#185fa5
    style SYNC fill:#e6f1fb,stroke:#185fa5
    style RATE fill:#faeeda,stroke:#854f0b
    style COMPLETE fill:#e1f5ee,stroke:#0f6e56
```

---

## 5. Daily Journal AI Reflection Flow

```mermaid
flowchart TD
    OPEN[User opens /journal] --> LOAD[Load today's prompts\nbehavior + theme + identity]
    LOAD --> EC[Emotional check-in\nemoji/word selector]
    EC --> BC[Behavior check-in\nAI prompt + text response]
    BC --> TC[Theme question\nAI prompt + text response]
    TC --> FF[Freeform entry\nopen-ended writing]
    FF --> EXP{Yesterday's experiment?}
    EXP -->|Yes| REPORT[Report experiment outcome]
    EXP -->|No| SAVE
    REPORT --> SAVE[Save entry]
    
    SAVE --> CRISIS{Crisis language detected?}
    CRISIS -->|Yes| RESOURCE[Show static resource card\n988 Lifeline, Crisis Text Line\nBypass AI reflection]
    CRISIS -->|No| REFLECT[Generate AI reflection\nPattern observation\n2-4 sentences + open question]
    
    REFLECT --> SHOW[Show AI reflection card\n300ms fade-in]
    SHOW --> MICRO[Generate micro-experiment\nOne specific, low-stakes action]
    MICRO --> CHOICE{User chooses}
    CHOICE -->|I'll try it| ACCEPT[Log experiment\nFollow up tomorrow]
    CHOICE -->|Modify| EDIT[Edit experiment text\nThen accept]
    CHOICE -->|Skip| DONE[Done]
    ACCEPT --> DONE
    EDIT --> DONE

    DONE --> THREAD{Theme thread surfaced?}
    THREAD -->|Yes| CALLOUT[Gentle callout:\n'You've been thinking about X…\nExplore this thread →']
    THREAD -->|No| FIN[Session complete]
    CALLOUT --> FIN

    style EC fill:#fbeaf0,stroke:#993556
    style BC fill:#fbeaf0,stroke:#993556
    style TC fill:#fbeaf0,stroke:#993556
    style FF fill:#fbeaf0,stroke:#993556
    style REFLECT fill:#eeedfe,stroke:#534ab7
    style MICRO fill:#faeeda,stroke:#854f0b
    style RESOURCE fill:#fcebeb,stroke:#a32d2d
    style ACCEPT fill:#eaf3de,stroke:#3b6d11
```

---

## 6. Navigation Map

```mermaid
flowchart LR
    LANDING[/ Landing] --> SIGNUP[/signup]
    LANDING --> LOGIN[/login]
    SIGNUP --> ONBOARD[/onboarding]
    LOGIN --> LIBRARY[/library]
    LOGIN --> ONBOARD
    ONBOARD --> LIBRARY
    
    LIBRARY --> DETAIL[/library/:bookId]
    LIBRARY --> JOURNAL[/journal]
    LIBRARY --> INSIGHTS[/insights]
    LIBRARY --> SETTINGS[/settings]
    
    DETAIL --> READER[/read/:bookId/:chId]
    DETAIL --> REFLECT[/reflect/:bookId/:chId]
    
    READER --> REFLECT
    READER --> READER
    REFLECT --> READER
    REFLECT --> DETAIL
    REFLECT --> LIBRARY

    style LANDING fill:#f5f5f4,stroke:#78716c
    style LIBRARY fill:#e1f5ee,stroke:#0f6e56
    style READER fill:#e6f1fb,stroke:#185fa5
    style REFLECT fill:#eeedfe,stroke:#534ab7
    style JOURNAL fill:#fbeaf0,stroke:#993556
    style INSIGHTS fill:#faeeda,stroke:#854f0b
```

### Sidebar Navigation (persistent on authenticated pages)
| Icon | Label | Route |
|------|-------|-------|
| book-open | Library | /library |
| pen-line | Journal | /journal |
| bar-chart-3 | Insights | /insights |
| settings | Settings | /settings |

Sidebar collapses to icons on mobile. On the reader page, the sidebar is hidden entirely for distraction-free experience. Mobile uses a bottom tab bar instead.
