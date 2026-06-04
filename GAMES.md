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

**Quick range presets:** 1-20, 21-40, 41-60, 61-80, 81-100 (non-overlapping decades)  
**Default question count:** 20 (pre-filled, editable). Custom ranges count for the drawing — play any range with 20+ questions.

**URL params accepted by the game:** `?min=` and `?max=` pre-fill range settings on the settings screen. `?mcpsId=` pre-fills student ID. "View Leaderboard" from settings/results links to the leaderboard with `?mcpsId=` only (no range params).

**Leaderboard page (`prime-or-not-leaderboard.html`) — two sections:**
- **Drawing Standings** (top): one row per qualifying range showing current #1 leader, accuracy, time, and a ▶ Play button that opens the game pre-filled with that range. Viewer's rows highlighted when `?mcpsId=` present; entry count shown.
- **Leaderboards by Range** (bottom): pill tabs, one per range with any recorded scores (from `getRanges` API). Clicking a tab loads all players for that range sorted accuracy desc, time asc (no question-count filter). **Play Game** button at bottom pre-fills the selected tab's range.

**Ranking:** accuracy primary, time tiebreaker only.

**Backend (`prime-leaderboard/Code.js`):**
- `submitScore(data)` — stores score with millisecond precision; `data.mcpsId` (nullable) written to col K
- `getLeaderboard(min, max)` — all scores for a range; omit `total` to include all session lengths; sorted accuracy desc, time asc
- `getRanges` (action) — all unique `{min, max, label}` pairs that have any scores
- `getDrawingLeaderboard()` — per-range #1 leaders among rows with non-empty col K; rangeSize ≥ 20, totalQuestions ≥ 20; reads winner IDs from "Cert Winners" tab (synced by `recordCertWinner`) and cascades past them; once all 9 certs are awarded (`wonIds.size >= CERT_TOTAL`), cascade is disabled and full leaderboard is shown
- `lookupStudentForPON(mcpsId)` — validates MCPS ID against parent portal sheet; returns `{success, name}`

**Winner cascade:** When a student wins the certificate drawing, `recordCertWinner` in the parent portal writes all winner IDs to a "Cert Winners" tab in the PON Google Sheet. `getDrawingLeaderboard` reads this tab and skips those IDs, cascading each range to the next best non-winner. This mirrors the same cascade in `getPONDrawingLeaderboard_` used by the CertDraw pool.

**Google Sheet:** https://docs.google.com/spreadsheets/d/19P1KPhQXMMsYEgx8dpmhZQynegf5iygu4nqLMNXU4ss  
Columns: `A=Timestamp, B=Player Name, C=Min, D=Max, E=Questions, F=Correct, G=Incorrect, H=Accuracy%, I=Total ms, J=Time Display, K=MCPS ID`  
Script ID: `1OaLaE9nIdQpMUtn3bmqMQYXSi_iYqMOiqf27nJzllOf7oCXvwhr8TByu`  
API URL: https://script.google.com/macros/s/AKfycbwddZFUQ7G0s4NrXfvbUQcSR2wTAPQ3_q0YQthV6Hok5gOQztPt14nMeXMwAcCEkguV/exec

**Two-copy rule:** `games/prime-or-not/prime-or-not.html` is the source; `docs/prime-or-not.html` is what GitHub Pages serves. Always `cp` both files after editing. Same for the leaderboard.

---

## Zebra Tournament

**File:** `games/zebra/tournament.html`  
**No backend** — fully self-contained HTML, no Google Sheets integration.

**Format:** Single-elimination bracket, rolling (not round-locked). Up to 7 simultaneous games on physical boards. Supports any number of students; bracket size rounds up to the next power of 2.

**Bye distribution:** Byes are spread randomly across round-1 matches — one bye per match, never two byes in the same match. This guarantees every player gets at most one bye and no one advances past round 1 without playing. Mathematically guaranteed for any N: since N > bracketSize/2 by definition, numByes < halfSize always holds.

**Setup:** Teacher enters student names (one per line) → randomized seeding → bracket generated with byes distributed automatically.

**Running view:** Left panel shows active board cards (teacher taps player name to declare winner, with confirmation step + single-level undo). Right panel shows the full bracket tree with SVG connector lines, color-coded by status (active/done/ready/pending). "Up Next" queue lists matches ready to start as soon as a board frees.

**Timing:** With 20–25 students and 7 boards, rolling format completes in ~40–45 min. Variable board sizes (small boards = faster games) don't affect total time — boards refill immediately.

**Champion screen:** Full-screen winner reveal with confetti.

---

## Standalone Games Pattern

Each game with Google Sheets integration gets its own Apps Script project:
- **Structure**: `<game>-backend/` folder with `Code.js`, `appsscript.json`, `.clasp.json`
- **Deploy**: `clasp push --force` → `clasp deploy --description "description"`
- **Benefits**: Separate deployments, separate sheets, no coupling with parent portal
