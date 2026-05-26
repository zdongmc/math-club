# Interactive Games (`games/`)

## Math Detective

| File | Description |
|------|------------|
| `games/math-detective/detective.html` | Main student-facing multi-case adventure |
| `games/math-detective/detective-classroom.html` | Teacher/projected classroom version |
| `games/math-detective/detective-certificate.html` | Achievement certificate generator |
| `games/math-detective/answer-key.html` | Complete solutions for instructors |
| `games/math-detective/final-challenge.html` | Advanced culminating challenge |
| `games/math-detective/generate-certificate-pdf.py` | Python script for batch PDF certificate generation |

---

## Training Kitchen

**File:** `games/training-kitchen/training-kitchen.html` (also copied to `docs/`)  
**URL:** https://script.google.com/macros/s/AKfycbyhI3zS593H2vHpPhbsgj5CZUHcUnYeISd_8rPLPcWX81jHf92a4N6KCUW2PtpRWqt4/exec  
**Backend:** `games/training-kitchen/training-kitchen-backend/`

**5 modules:** Basic Operations, Pre-Algebra, PEMDAS, Fractions/Decimals, Balancing Equations  
Each module: Lesson (5 steps) → Practice (10 problems with hints) → Mastery Test (10 problems, 80% to pass)  
Students can test-out by jumping directly to the Mastery Test.

**Chef credential levels:** Kitchen Trainee → Prep Cook → Line Cook → Certified Chef

**Backend (`training-kitchen-backend/Code.js`):**
- `lookupStudent(mcpsId)` — Reads student name from parent portal sheet (read-only)
- `getProgress(mcpsId)` — Module completion dates
- `saveProgress(mcpsId, studentName, module)` — Records completion

**Google Sheet:** https://docs.google.com/spreadsheets/d/1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI  
Columns: `A=Student Name, B=MCPS ID, C-G=Module 1-5 completion dates`  
Script ID: `1UylPA2eIg_OvElEziMy20NZs6SgbKO3UvcUHRAGnIeCHSz58DYzEhBl_`

---

## Algebra Kitchen

**File:** `games/algebra-kitchen/algebra-kitchen.html` (also copied to `docs/`)  
**URL:** https://script.google.com/macros/s/AKfycbw6kaj6j92g9C2txlLaMcFU8crA_H6RXLjOnjZYbniLkCCfHdmI0LLUYOcWNQPi9n4AUg/exec  
**Backend:** `games/algebra-kitchen/algebra-kitchen-backend/`  
**Prerequisite:** All 5 Training Kitchen modules completed (Certified Chef status)

Accepts `mcpsId` URL param for auto-login from Training Kitchen.

**Star rating system (1-3 stars, 80% accuracy to pass):**
- Combined score = `(accuracy × 0.6) + (speedFactor × 0.4)` where `speedFactor = max(0, 1 - elapsedMs/600000)`
- 3 stars ≥ 0.85 | 2 stars ≥ 0.72 (or 100% accuracy) | 1 star = any pass

**Dish 1: Systems of Equations**
- 5-step lesson (What Is a System?, Substitution, Elimination, Checking, Summary)
- Practice: 10 problems with hints, no timer
- Test: 10 problems, no hints, 10-minute timer (starts at test begin, not first problem render)
- Two-answer validation: both x and y required; focus moves to empty field on partial entry

**Problem generation factories:**
- **Factory A** (substitution-friendly): coefficient 1 on x; determinant check, falls back to B after 50 failures
- **Factory B** (elimination-friendly): matching coefficient on y
- Solutions: x, y ∈ [-10, 10], reject both-zero; coefficients in [1, 5]

**Backend (`algebra-kitchen-backend/Code.js`):**
- `lookupStudent(mcpsId)` — Student name from Roster tab (read-only)
- `getAlgebraProgress(mcpsId)` — Returns `{ success, studentName, mcpsId, isCertifiedChef, dish1Stars }`, checks Training Kitchen cols C-G
- `recordAlgebraProgress(mcpsId, dish, stars)` — Only overwrites if `stars > currentStars`; returns `{ success, currentStars, newStars, updated }`

**Google Sheet** (same as Training Kitchen): https://docs.google.com/spreadsheets/d/1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI
- **Roster tab** — `B=MCPS ID, A=Name` (read-only)
- **Training Kitchen tab** — cols C-G completion dates (read-only)
- **Algebra Kitchen tab** — `A=Name, B=MCPS ID, C=Dish 1 Stars`

Script ID: `1we0rmj2d9JFEhogb0b1Ag82MMarJCKkdfVG92cmVe3GTv8HkORT6Lme_`

---

## Would You Rather? Math Edition

**File:** `games/would-you-rather.html`  
**No backend** — fully self-contained, no login or data persistence required.

**Format:** Whole-class discussion activity for math club meetings (~45 min). Teacher controls pacing via a private popup; student screen is projected for the class.

**Voting mechanic:** Students move their name magnet to the A or B side of the whiteboard before the timer expires.

**Flow:**
1. Teacher opens the file on the projector computer and clicks **🎓 Open Teacher View** (popup on teacher's laptop)
2. Teacher clicks a question chip or Prev/Next to push a question to the student screen
3. A 15-second countdown starts automatically — students move their magnet
4. Teacher clicks **Reveal Answer** — math explanation slides in, winner card glows gold
5. Repeat for all 21 questions

**21 pre-built questions** designed so the intuitive answer is usually wrong — ordered by increasing difficulty:
- **Percentage & money traps (Q1–3):** Stacking discounts, compound raises, stock up-then-down
- **Geometry (Q4–5):** Cylinder radius vs height, pizza area (two 10" vs one 14")
- **Math identities (Q6–9):** √ split, difference of squares, average speed trap, sum of powers
- **Probability (Q10–13):** HH vs die roll, six rolls vs coin flip, both-red vs same-suit cards, expected value dice bets
- **Number theory & algebra (Q14–16):** 3²⁰ vs 2³⁰, fraction face-off, monthly vs annual loan
- **Hard (Q17–21):** Calendar probability, exponential vs linear growth, 2-digit multiples, marble sampling, compound interest grand finale

**Winner balance:** 10 A wins, 11 B wins, 0 ties across 21 questions. Questions were redesigned to be counterintuitive — even crowd-copying leads to wrong answers.

**Timer:** 15 seconds. Warn threshold at 8s (yellow), critical at 4s (red + pulse). "TIME'S UP!" message prompts students to lock in their vote before reveal.

**Teacher popup controls:**
- Question chips (1–21) for direct navigation — clicking immediately shows on student screen
- **← Prev** / **Next →** buttons
- **Reveal Answer** button

---

## Which Is Bigger? — Estimation Edition

**File:** `games/which-is-bigger.html`  
**No backend** — fully self-contained, no login or data persistence required.

**Format:** Whole-class Fermi estimation activity for math club meetings (~45 min). Same teacher-popup / projected-screen format as Would You Rather. Color scheme: blue/pink for A/B, gold accents — matches WYR's overall look.

**Design rule:** Every quantity appears at most once across all 24 questions. Once a number is revealed it never reappears.

**Voting mechanic:** Students move their name magnet to the A or B side of the whiteboard before the timer expires.

**Flow:**
1. Teacher opens the file and clicks **🎓 Open Teacher View** (popup)
2. Teacher navigates to a question — it appears on the projected screen
3. A 15-second countdown starts — students vote on which quantity is larger
4. Teacher clicks **Reveal Answer** — the actual numbers slide in, winner card glows gold with a "🏆 Bigger" badge
5. Repeat for all 24 questions

**24 pre-built questions** ordered by increasing difficulty for middle schoolers:
- **Easy — both quantities are familiar (Q1–6):** Inches in a mile vs seconds in a day; hairs on head vs English words; ways to make $1 vs days in a year; people alive vs lifetime heartbeats; poker hands vs seconds in 30 days; steps around Earth vs rice grains in a pound
- **Easy–Medium — one quantity needs estimation (Q7–12):** US roads vs Earth-Sun distance; books published vs Milky Way stars; words in all books vs ants on Earth; years since dinosaurs vs age of universe; known animal species vs body hairs; miles of blood vessels vs Earth's equator
- **Medium — biology and cosmic scale (Q13–18):** Molecules in a drop of water vs insects on Earth; gut bacteria vs all humans ever; body cells vs trees on Earth; years since Aztec Empire vs years since Stonehenge; brain neurons vs Andromeda stars; beach sand vs observable universe stars
- **Hard — combinatorics and the very large (Q19–24):** Ocean liters vs Rubik's cube positions; 20! book arrangements vs atoms in a grain of sand; 2¹⁰⁰ coin-flip outcomes vs molecules in a breath; Sudoku grids vs seconds since Big Bang; 52! card shuffles vs body atoms; a googol vs atoms in the universe

**Winner balance:** 12 A wins, 12 B wins, 0 ties across 24 questions.

**Timer:** 15 seconds. Warn threshold at 8s (yellow), critical at 4s (red + pulse). "TIME'S UP!" message prompts students to lock in before reveal.

**Teacher popup controls:**
- Question chips (1–24) for direct navigation
- **← Prev** / **Next →** buttons
- **Reveal Answer** button

---

## Prime or Not

**Files:** `games/prime-or-not/prime-or-not.html` and `docs/prime-or-not.html` (two copies — keep in sync)  
**Leaderboard:** `games/prime-or-not/prime-or-not-leaderboard.html` and `docs/prime-or-not-leaderboard.html`  
**Backend:** `games/prime-or-not/prime-leaderboard/`  
**Live URL:** https://zdongmc.github.io/math-club/prime-or-not.html

**Gameplay:** Login screen (optional MCPS ID or "Play as Guest") → Settings (player name, range 1-300, question count) → numbers one at a time → click Prime / Not Prime (or Left/Right arrow keys). Wrong answers show prime factorization. Results screen shows time in `MM:SS.MSS` format.

**MCPS ID login:** Optional. On submit, calls the parent portal `?action=lookupStudentForPON&id=...` endpoint to validate and auto-fill the player name. "Play as Guest" skips login; guest scores still submit to the leaderboard but don't count for the drawing. MCPS ID is stored in `gameState.mcpsId` and passed to `submitScore()`.

**Quick range presets:** 1-20, 1-50, 1-100, 1-200, 50-150, 100-300

**Leaderboard:** Top 50 scores filtered by range + question count. Sorted by accuracy desc, then time asc.  
**Drawing Standings section** (top of leaderboard page): live per-range leaders for the Noetic Summer Certificate Drawing. Highlights the viewer's rows when `?mcpsId=` URL param is present. Shows entry count for eligible students.

**Backend (`prime-leaderboard/Code.js`):**
- `submitScore(data)` — stores score with millisecond precision; `data.mcpsId` (nullable) written to col K
- `getLeaderboard()` — sorted scores
- `getAvailableRanges()` — unique ranges with scores
- `getDrawingLeaderboard()` — per-range #1 leaders among rows with non-empty col K; rangeSize ≥ 20, totalQuestions ≥ Math.min(rangeSize, 50)
- `lookupStudentForPON(mcpsId)` — validates MCPS ID against parent portal sheet; returns `{success, name}`

**Google Sheet:** https://docs.google.com/spreadsheets/d/19P1KPhQXMMsYEgx8dpmhZQynegf5iygu4nqLMNXU4ss  
Columns: `A=Timestamp, B=Player Name, C=Min, D=Max, E=Questions, F=Correct, G=Incorrect, H=Accuracy%, I=Total ms, J=Time Display, K=MCPS ID`  
Script ID: `1OaLaE9nIdQpMUtn3bmqMQYXSi_iYqMOiqf27nJzllOf7oCXvwhr8TByu`  
API URL: https://script.google.com/macros/s/AKfycbwddZFUQ7G0s4NrXfvbUQcSR2wTAPQ3_q0YQthV6Hok5gOQztPt14nMeXMwAcCEkguV/exec

**Two-copy rule:** `games/prime-or-not/prime-or-not.html` is the source; `docs/prime-or-not.html` is what GitHub Pages serves. Always `cp` both files after editing. Same for the leaderboard.

---

## Standalone Games Pattern

Each game with Google Sheets integration gets its own Apps Script project:
- **Structure**: `<game>-backend/` folder with `Code.js`, `appsscript.json`, `.clasp.json`
- **Deploy**: `clasp push --force` → `clasp deploy --description "description"`
- **Benefits**: Separate deployments, separate sheets, no coupling with parent portal
