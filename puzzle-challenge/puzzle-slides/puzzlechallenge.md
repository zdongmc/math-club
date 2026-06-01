# Math Puzzle Challenge

## Overview

A 45-minute team activity for 20–25 students (grades 6–8) using 52 math puzzle cards from the [Early Family Math / Math for Love Deck 2-5](https://www.earlyfamilymath.org/deck-2-5). Students work in teams of 3 (occasionally 4) to solve open-ended puzzles, competing to claim as many cards as possible.

## Materials

- 52 laminated puzzle cards (printed from `Puzzle Cards - Questions Only.pdf`)
- Coach's laptop with `coach.html` open
- A central table to spread the cards face-up

## Card Point Values

Point values follow 2^level, reflecting the non-linear difficulty increase between tiers.

| Level | Points | Card Values | Count | Topics |
|-------|--------|-------------|-------|--------|
| 0 | 1 pt | Ace, 2, 3, 4 | 15 cards | Equal Sums, Magic Squares, Stick Areas, Letter Substitutions, etc. |
| 1 | 2 pts | 5, 6, 7 | 12 cards | Königsberg bridges, Product Equals Sum, Mystery Sums, Fractions, etc. |
| 2 | 4 pts | 8, 9, 10 | 12 cards | Equal Products, Combining Digits, Extreme Products, Finding Squares, etc. |
| 3 | 8 pts | Jack, Queen, King | 12 cards | Handshakes at a Party, Pirates with Gold, Water Cups, Fractions, etc. |

Maximum possible score: 15×1 + 12×2 + 12×4 + 12×8 = 15 + 24 + 48 + 96 = **183 points**

**Range bonus:** +5 points awarded to any team that claims at least one card from every level (0–3).

## Activity Rules

1. All 52 laminated cards are spread face-up on a central table.
2. Teams of 3–4 students self-select any card to attempt.
3. The team works on the puzzle at their seat.
4. When ready, they bring the card to the coach for verification.
   - **Correct:** Card is claimed by that team (coach marks it in `coach.html`). Team immediately grabs another card.
   - **Wrong:** Card returns to the table. Team must choose a **different** card — but may attempt the returned card again later if it hasn't been claimed.
5. Each card can only be claimed by one team (first correct answer wins it).
6. At the end of 45 minutes, the coach clicks **Show Results** for the final standings.

## Scoring

- Each claimed card is worth its level's point value (1, 2, 4, or 8 pts)
- **Range bonus:** +5 pts for claiming at least one card from each of the four levels
- Highest total wins

## Team Formation

Teams are generated automatically by `coach.html` using a **rank-based snake draft** with a grade-spread fallback for unranked students.

### Team size

Number of teams = `floor(attendance / 3)`, targeting teams of 3. When attendance isn't divisible by 3, some teams get 4 members.

| Students present | Teams | Sizes |
|-----------------|-------|-------|
| 18 | 6 | all 3s |
| 20 | 6 | four 3s + two 4s |
| 21 | 7 | all 3s |
| 24 | 8 | all 3s |
| 25 | 8 | seven 3s + one 4 |

### Algorithm

1. **Before the activity**, open `coach.html` and go to the attendance screen.
2. **Check off each student** who is present. Students are listed alphabetically within each grade column (6th, 7th, 8th). Any student not on the list can be added by typing their name and selecting their grade.
3. Click **Generate Teams**. The algorithm:
   - **Students with competition data (ranked 1–66):** sorted by composite performance rank (computed from MATHCOUNTS, AMC 8, Math League, and MOEMS scores), then snake-assigned across all teams
   - **Students without competition data:** interleaved by grade (one 6th → one 7th → one 8th → repeat), then snake-assigned into the remaining slots
   - Snake pattern: A → B → C → … → last → last → … → C → B → A → A → … so no single team gets consecutive top-ranked students
4. Review the generated teams on the **Teams screen**. Members are listed alphabetically. Team names are editable — rename them before starting if desired.
5. Click **Start Activity**.

### Walk-in students

Students added manually on the day are placed in the unranked pool and interleaved by grade before snake-drafting. They have minimal impact on overall team balance.

### Typical result with 20–25 students

6–8 teams of 3 (occasionally 4), with competition-balanced rosters and unranked students spread across teams by grade.

## Timeline

| Time | Activity |
|------|----------|
| 0:00 | Check attendance and generate teams in `coach.html`, spread cards, announce teams |
| 0:05 | Teams start grabbing cards |
| 0:40 | Call time |
| 0:40–0:45 | Coach clicks **Show Results** for animated reveal; announce winner |

## Tips

- Encourage teams to mix difficulty — grabbing only 1-pt cards is safe but slow; higher-value cards are harder but worth more
- The range bonus (+5 pts) rewards breadth — teams that only cherry-pick easy cards miss out
- A team member can be verifying with the coach while the rest of the team starts the next card
- If the table gets crowded, stagger cards by point value in four sections

---

## Coach Tool: `coach.html`

A browser-based tool with four screens. Open locally — no internet required.

### Screen 1: Attendance
- Students listed alphabetically by grade (6th / 7th / 8th columns)
- Check each student present; unknown students can be typed in with a grade
- **Select All / Clear All** buttons for quick setup
- Click **Generate Teams →** when done (requires at least 2 students)

### Screen 2: Teams
- Displays all generated teams with member names (alphabetical) and grade distribution
- Team names are editable — click the colored header to rename
- Click **← Back** to adjust attendance or **Start Activity →** to proceed

### Screen 3: Game Grid
- Team roster strip at top shows all teams and their members throughout the activity
- All 52 cards displayed in four rows grouped by level (Level 0 → Level 3)
- **Available cards:** white tiles — click to open Answer View
- **Claimed cards:** tile turns to the claiming team's color with team name shown
- Header shows count of claimed vs. total cards (e.g., `12 / 52 claimed`)
- **Show Results →** button opens the final results screen
- **Reset** button (confirmation required) clears all claimed cards

### Answer View
Opened by clicking any available card tile. Shows:
- **Question image** (left) — the puzzle as printed on the laminated card
- **Answer key image** (right) — full solution notes from Early Family Math
- **Award buttons** — one per team; click to mark card as claimed and return to grid
- **Return to Table** button — sends card back to available (wrong answer); plays a descending tone

### Screen 4: Results (projection screen)
- Click anywhere to reveal teams one at a time, **last place first**
- Each reveal: card slides in, score animates up from 0
- Sound escalates by rank: soft 2-note tone for lower places → 3-note chime → 4-note ascending → 5-note fanfare for winner
- Winner reveal: gold glow pulse, "🎉 Team X wins!" banner, confetti burst, sparkle flourish
- Range bonus (+5 pts) shown as a gold badge on qualifying teams
- **← Back to Game** returns to the grid without resetting

### Sound Effects
- **Level 0 (1 pt) claimed:** 2-note chime
- **Level 1 (2 pts) claimed:** 3-note ascending chime
- **Level 2 (4 pts) claimed:** 4-note ascending chime
- **Level 3 (8 pts) claimed:** 5-note fanfare
- **Return to table:** descending "wah-wah" tones
- **Results reveal:** escalating tones by place; winner gets full fanfare + sparkle

---

## File Structure

```
puzzle-challenge/
├── puzzle-slides/
│   ├── coach.html                  # Coach tool (this activity)
│   ├── index.html                  # Student-facing slideshow (separate use)
│   ├── puzzlechallenge.md          # This file
│   ├── images/                     # Question page images (01.png – 52.png)
│   └── answers/                    # Answer key images (01.png – 52.png)
├── 2-5 Card Deck Puzzles of the Week 10.19.23/
│   └── *.pdf                       # Source PDFs (question + answer key per file)
├── EFM Puzzles of the Week A to F 10.19.23/
│   └── *.pdf                       # Additional EFM puzzle PDFs
└── PuzzleCards.pdf                 # Print-ready PDF for laminating
```

## Sources

- Puzzles: [Early Family Math Deck 2-5](https://www.earlyfamilymath.org/deck-2-5), a collaboration between [Early Family Math](https://www.earlyfamilymath.org) and [Math for Love](https://mathforlove.com)
- © Early Family Math 2023
