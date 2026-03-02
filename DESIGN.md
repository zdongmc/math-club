# System Design Document

## Overview

This is the technology platform for the Hallie Wells Middle School Competition Math Club. It consists of four interconnected systems: a public website, a parent portal, interactive educational games, and competition-day tools. All systems are built with vanilla HTML/CSS/JavaScript (no frameworks) and use Google services for data storage and backend computation.

## Architecture Diagram

```
                         GitHub Pages (static hosting)
                                    |
                    +----- docs/ ------+
                    |                  |
              Main Website        Game Pages
           (6 content pages)    (copies served
            + shared header)     from docs/)
                    |
                    | links to
                    v
        Google Apps Script (4 projects)
        +---------------------------+---------------------------+
        |                           |                           |
   Parent Portal            Game Backends (3)          Google Forms (3)
   (Code.js +               - Training Kitchen              |
    Checkin.html)            - Algebra Kitchen               |
        |                    - Prime Leaderboard             |
        |                           |                        |
        +--------+------------------+------------------------+
                 |
           Google Sheets
           (central data store)
```

## System Components

### 1. Main Website (`docs/`)

Static HTML served via GitHub Pages from the `/docs` folder. Deploys automatically on push to `main`.

| File | Purpose |
|------|---------|
| `index.html` | Redirects to announcements |
| `announcements.html` | Club news and event notifications |
| `club.html` | Club info, resources, embedded Google Calendar |
| `materials.html` | Links to learning materials and PDFs |
| `competitions.html` | Competition details, dates, external links |
| `competition-reference-2025-26.html` | Full 2025-26 competition schedule |
| `registration.html` | Links to Google Forms and parent portal |
| `header-template.js` | Shared navigation component loaded by all pages |

**Design pattern:** Each page is a self-contained HTML document with embedded CSS and inline `<script>` blocks. The only shared code is `header-template.js`, which injects a consistent header/navigation bar via `loadHeader()` on DOMContentLoaded.

### 2. Parent Portal (`math-club-attendance/`)

A Google Apps Script web app that lets parents look up their child's records by MCPS ID. Deployed at a stable URL that never changes.

**Backend (`Code.js`, ~1,770 lines):**
- `lookupStudentByMcpsId()` is the main entry point -- searches four sheets in priority order, then aggregates data from competition-specific sheets
- Separate result functions per competition: `getMathcountsResults()`, `getMoemsResults()`, `getMathLeagueResults()`, `getMathKangarooResults()`, `getAmc8Results()`, `getNoeticResults()`
- Noetic sign-up management: `signUpForNoetic()`, `updateNoeticGradePreference()`, `dropNoeticSignUp()`
- Form completion tracking: `checkFormCompletion()` checks two required forms

**Frontend (`Checkin.html`):**
- Single-page application served by Apps Script's `doGet()`
- Parent enters MCPS ID, JavaScript calls `google.script.run` to invoke backend functions
- Renders student info, attendance history, form status, and competition results/sign-ups
- Custom modal dialogs for Noetic sign-up/modify/drop (no browser popups)

**Student lookup order:**
1. Form Responses 1 (email pattern `[ID]@mcpsmd.net`)
2. Attendance Records (column B)
3. School List (column B)
4. Form Responses 2 (column C)

### 3. Interactive Games (`mathdetective/`)

Educational games with separate Apps Script backends for progress tracking.

| Game | Frontend | Backend | Data Store |
|------|----------|---------|------------|
| Training Kitchen | `training-kitchen.html` | `training-kitchen-backend/` | Shared Sheet A |
| Algebra Kitchen | `algebra-kitchen.html` | `algebra-kitchen-backend/` | Shared Sheet A |
| Prime or Not | `prime-or-not.html` | `prime-leaderboard/` | Separate Sheet B |
| Math Detective | `detective.html` | None (client-only) | None |

**Game progression system:**
- Training Kitchen has 5 skill modules with mastery tests (80% to pass)
- Completing all 5 modules grants "Certified Chef" status
- Algebra Kitchen checks Certified Chef status before unlocking
- Star ratings (1-3) are persisted and only overwrite on improvement

**Backend pattern:** Each game backend follows the same structure:
- `doGet(e)` routes on `action` URL parameter
- Functions read/write to a dedicated Google Sheet tab
- Returns JSON responses consumed by frontend `fetch()` calls
- Public access (`ANYONE_ANONYMOUS`), no authentication required

### 4. Competition-Day Tools

Standalone HTML files with embedded timers, slideshows, and interactive displays used during competition events.

| Directory | Tool | Key Features |
|-----------|------|--------------|
| `mathcounts/` | Countdown round questions | 60 questions, MathJax, 60s timer, keyboard nav |
| `mathcounts/` | Countdown slideshow | 19 slides, editable names, awards |
| `mathcounts/` | Bracket display | Tournament bracket visualization |
| `MathLeague/` | Meet timer slides | 3 rounds (Team/Relay/Individual), voice announcements |
| `MOEMS/` | Contest timer | 30-min timer with voice announcements |
| `AMC8/` | Contest timer | Contest timing display |
| `MBMT/` | Diagnostic tests | 5 subject areas with instant feedback |

These are fully self-contained -- no backend calls, no external dependencies beyond MathJax CDN for math rendering. Designed to work offline once loaded.

## Data Architecture

### Google Sheets as Database

All persistent data lives in Google Sheets, accessed through Apps Script.

**Parent Portal Sheet (11+ tabs):**

| Tab | Source | Key Columns |
|-----|--------|-------------|
| Form Responses 1 | Google Form | Timestamp, Name, Grade, Email, Parent info |
| School List | School export | Email, Student ID, Name |
| Form Responses 2 | Google Form | Timestamp, Name, MCPS ID, Grade, Competition selections |
| Attendance Records | Manual entry | Name, Student ID, Date columns with TRUE values |
| MATHCOUNTS | Manual entry | Name, ID, Sprint/Target/Individual scores, Rank, Fees |
| MOEMS | Manual entry | Name, ID, 5 contest scores, Total, Fee/Paid |
| Math League | Manual entry | Name, ID, ARML, 4 meet teams + scores, Team results |
| Math Kangaroo | Manual entry | Name, MK ID |
| AMC 8 | Manual entry | ID, Score, PDF link |
| Noetic Learning | Portal sign-ups | Timestamp, MCPS ID, Name, Grade, Preference |

**Game Progress Sheet (shared by Training Kitchen + Algebra Kitchen):**
- Roster tab: Student name lookup by MCPS ID
- Training Kitchen tab: Module 1-5 completion dates
- Algebra Kitchen tab: Dish star ratings

**Prime Leaderboard Sheet (separate):**
- Single tab with player scores, accuracy, millisecond-precision timing

### Data Flow

```
Google Forms --> Google Sheets <-- Manual entry by coach
                     |
                     v
              Apps Script Backend
              (reads sheets, aggregates)
                     |
                     v
              JSON response to frontend
                     |
                     v
              Browser renders HTML
```

Competition results flow is manual: coach enters scores into sheets after each event. The portal reads and displays them in real time.

## Deployment

### GitHub Pages (Main Website)

Push to `main` branch automatically deploys the `docs/` folder. No build step.

### Google Apps Script (4 Projects)

Each project uses the `clasp` CLI for local development:

| Project | Script ID | Stable URL Suffix |
|---------|-----------|-------------------|
| Parent Portal | `1fif0wIdKDZQ...` | `...Y9udIEskvIMJ/exec` |
| Training Kitchen | `1UylPA2eIg_O...` | Separate URL |
| Algebra Kitchen | `1we0rmj2d9JF...` | Separate URL |
| Prime Leaderboard | `1OaLaE9nIdQp...` | Separate URL |

**Deployment workflow:**
1. Edit files locally
2. `clasp push --force` syncs code to Apps Script
3. For parent portal: update the existing deployment via Apps Script web UI (preserves stable URL)
4. For game backends: `clasp deploy --description "..."` creates a new versioned deployment

The parent portal URL is referenced in `registration.html` and must never change. Game backend URLs are embedded in their respective frontend HTML files.

## Design Decisions

**Why no framework?** The site is maintained by a math coach, not a web developer. Vanilla HTML means any page can be opened in a browser, edited in any text editor, and understood without build tool knowledge.

**Why separate Apps Script projects for games?** Isolation. Each game can be deployed, updated, and debugged independently. A bug in the prime leaderboard backend cannot affect the parent portal.

**Why Google Sheets instead of a database?** The coach already uses Google Sheets for all club data. Sheets serve as both the data entry interface (for the coach) and the database (for the portal). No migration or new tools required.

**Why copies of game HTML in `docs/`?** Games need to be accessible from the main website (GitHub Pages). The canonical source lives in `mathdetective/`, with copies in `docs/` for serving.

**Why `ANYONE_ANONYMOUS` access?** Parents need to look up records without a Google account. The portal only exposes read access to individual student data (keyed by MCPS ID), not bulk data.

## Security Model

- No authentication on the parent portal; access control is knowledge of the student's MCPS ID
- Apps Script backends execute as the owner account, limiting sheet access to what the code exposes
- No API keys, secrets, or credentials in source code
- MCPS IDs validated as numeric strings before sheet lookups
- Student names matched case-insensitively
- Competition question files (e.g., `countdown-round-questions.html`) are in `.gitignore` and never pushed to GitHub

## Styling

Consistent visual identity across all pages:
- **Primary:** Red gradient `#dc2626` to `#991b1b`
- **Games:** Warm amber/cream `#fffbeb` to `#fef3c7`
- **Typography:** Segoe UI / system sans-serif
- **Layout:** CSS Grid with `auto-fit` / `minmax()` for responsive behavior
- **Breakpoints:** 768px (tablet), 480px (mobile)
- No CSS preprocessors or utility frameworks
