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
**`math-kangaroo-team-2026.html`** — Whole-club team review activity for the 2026 competition.

**Format:** Two teams compete in one-on-one rounds. Both teams rotate through all members (everyone plays). Team with most points wins — no individual champion.

**Flow:**
1. **Attendance** — check off present students; add walk-ins by name
2. **Match Preview** — always shown before game starts; lists every round as `Blue name  1  Orange name` in a center-aligned table. Team names are editable here (defaults: "Blue" / "Orange"). If teams are unequal (odd attendance), the shorter team picks which player goes twice as the last round against a named opponent.
3. **Board** — score bars, current matchup with PICKS/answers badges, question grid, queue strips
4. **Question** — timer auto-starts on question selection; teacher reveals answer; verdict buttons award points
5. **Game Over** — scores count up from 0 with an accelerating drumroll, then winner pops in with fanfare

**Question grid:** 60 questions (30 per grade level), grouped into labeled point-value boxes:
- ★★★ 3 pts • 1:00 timer (Q1–10)
- ★★★★ 4 pts • 1:30 timer (Q11–20)
- ★★★★★ 5 pts • 2:00 timer (Q21–30)

Questions display as screenshots from `2026Competition/` (`5_6q01.png`–`5_6q30.png`, `7_8q01.png`–`7_8q30.png`). Answer key embedded in HTML.

**Team assignment:** Snake draft by rank (rank 1 → Blue, rank 2 → Orange, rank 3 → Blue…). Weakest plays first, strongest plays last. If odd attendance, shorter team picks who plays twice via the Match Preview screen.

**Picker alternation:** Blue picks on even rounds, Orange on odd rounds.

**Scoring:** Correct = question's point value to that team. Both correct = both teams score. Neither = 0 pts. Round always advances.

**Teacher popup** (`🎓 Teacher View`): separate window showing question + answer in gold + 4 verdict buttons (Blue ✓, Orange ✓, Both ✓, Neither) that call back via `window.opener`.

**Student roster:** Reuses ranking from `noetic/noetic-countdown.html` — 78 students, ranks 67–78 = attendance-only.

**2026 answer keys:**
- Grade 5/6: D C D E A B E C C D · C D A D A B D E C B · B C E D C D B B C C
- Grade 7/8: E B B E A D E D C C · C A E E C D B A C A · D C B B D D B D A E

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
