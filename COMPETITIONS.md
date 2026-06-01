# Competition Materials

## MATHCOUNTS (`mathcounts/`)

| File | Description |
|------|------------|
| `countdown-round-questions.html` | 60 questions with 60-sec timer, MathJax rendering, SVG diagrams for Q44/53/57. **Local-only — never push to GitHub** (in `.gitignore`) |
| `countdown-round-slideshow.html` | 19-slide competition day presentation |
| `mathcounts-competition.html` | Competition day info: date, format, schedule, results |
| `countdown-bracket-2025.html` | Tournament bracket visualization |

**Slideshow structure (19 slides):**
- Slide 1: Welcome
- Slide 2: Individual score calculation
- Slide 3: Top 14 scorers with editable names/scores and reveal
- Slides 4-7: Countdown round rules
- Slides 8-12: Match slides 1-5 (contenteditable participant names)
- Slide 13: Final Four special rules
- Slides 14-17: Match slides 6-9
- Slide 18: Awards (Champion, Top 4 Team, 14 advancing)
- Slide 19: Sudden Victory tiebreaker rules + return buttons for all 9 matches

**Key features:**
- All match slides have editable contenteditable name fields
- "Sudden Victory" button on each match slide jumps to slide 19
- Keyboard navigation (except when editing fields)
- MathJax for math rendering
- Red gradient theme with gold accents

**Other resources:** PDFs (schedules, volunteer guides, practice problems Q1-60), `mathcounts group preferences.txt`

---

## Math League (`math-league/`)

**`math-league-meet-slides.html`** — Standalone meet timer presentation (~60 min, 64 points possible):

| Round | Time | Points | Notes |
|-------|------|--------|-------|
| Team Round | 20 min | 12 | 6 questions, calculators allowed |
| Relay Rounds (×2) | 8 min each | 16 total | No calculators |
| Individual Round | 24 min | 36 | 6 problems, no communication |

**Timer features:**
- Voice announcements: start, halfway, 5min, 2min, 1min, 10-sec countdown, time's up
- Relay special: "4 minutes remaining - bonus window ended"
- Visual indicators: normal (white/blue) → warning (yellow) → critical (red pulse)
- Controls: Start/Pause/Reset + keyboard shortcuts (Space=start, arrows=navigate)

**Meet dates 2025-2026:** Nov 14, Dec 12, Jan 20, Feb 13

**Other resources:** `Math League Meet Information 2025-2026.pdf`, `Middle School Mathematics League FAQ 2025-26.pdf`

---

## Math Kangaroo (`math-kangaroo/`)

### Practice Competition
**`math-kangaroo-competition.html`** — Two-player side-by-side practice using 2016–2025 historical questions.
- 3-column layout: Level 5/6 panel | race track | Level 7/8 panel
- 30 questions per level (10 years × 3-pt / 4-pt / 5-pt question per year)
- Groups locked per year; inline ✓/✗ feedback; animated kangaroo race track
- Answer key embedded; Web Audio API fanfare sounds

### 2026 Team Review
**`math-kangaroo-team-2026.html`** — Whole-club team review activity for the 2026 competition. Four teams (Blue/Orange/Green/Purple) answer simultaneously each round; fixed rounds (one per largest team size, so everyone plays at least once), most points wins. Trailing team picks questions. Teams rebalance between games using actual performance data. No question reuse within a session.

Full design details: **`math-kangaroo/COMPETITION.md`**

---

## Noetic (`noetic/`)

**`noetic/noetic-countdown.html`** — King-of-the-hill tournament using Spring 2026 Noetic sample questions.

Full design details (format, categories, questions, timing, SVG diagrams, ranking methodology): **`noetic/COMPETITION.md`**

---

## MOEMS (`moems/`)

**`moems-contest-slides.html`** — 2-slide contest day presentation:
- Slide 1: Format and rules (5 problems, 30 minutes, no calculators)
- Slide 2: 30-minute timer with voice announcements at 15/10/5 min + 10-sec countdown
  - Visual indicators: normal (white) → warning (yellow) → critical (red pulse)
  - Controls: Start/Pause/Reset; keyboard: Space=start, arrows=navigate

**Other resources:**
- `moems_vocabulary_activity.md` — Interactive vocabulary lesson plan
- `moems_vocab_claude_md.md` — Extended vocabulary reference
- `What Every Young Mathlete Should Know.pdf` — Preparatory guide
