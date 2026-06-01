# Math Kangaroo Competition Tools

## 2026 Team Review

`math-kangaroo-team-2026.html` is a whole-club team review activity for the 2026 competition. Four teams (Blue, Orange, Green, Purple) compete simultaneously on every question; everyone plays. First team to reach the win-score threshold wins. Multiple games can be played back-to-back without reloading — questions are never reused within a session.

### Flow

1. **Attendance** — check off present students (minimum 4); add walk-ins by name
2. **Match Preview** — shows the rotation order for all 4 teams in a table. Team names are editable (defaults: Blue / Orange / Green / Purple). Win score is shown at the bottom. If teams are unequal, each short team gets a volunteer picker — one player from that team is chosen to go twice in the extra round (defaults to the last player in the queue).
3. **Board** — 4 score bars (scaled to win score), current active players with PICKS/answers badges, question grid, 4 queue strips
4. **Question** — timer auto-starts on question selection; teacher reveals answer; teacher checks which teams answered correctly and clicks Submit Verdict
5. **Game Over** — scores count up with drumroll, winner pops in with fanfare; Play Again returns to Attendance with same students pre-checked

### Questions

- 60 questions total: 30 per grade level (5/6 and 7/8)
- Grouped by point value: ★★★ 3 pts / 1:00 (Q1–10), ★★★★ 4 pts / 1:30 (Q11–20), ★★★★★ 5 pts / 2:00 (Q21–30)
- Displayed as screenshot images from `2026Competition/` (`5_6q01.png`–`5_6q30.png`, `7_8q01.png`–`7_8q30.png`)
- Answer key embedded in HTML; used questions are never reused across games in a session

### Team Assignment

4-team snake draft by rank (rank 1 → Blue, rank 2 → Orange, rank 3 → Green, rank 4 → Purple, rank 5 → Blue…). Weakest plays first, strongest plays last.

In subsequent games, draft order uses each student's actual `correct/played` ratio from the session rather than static rank, so teams rebalance based on observed performance.

### Win Condition

**Fixed rounds** — the game runs for exactly `maxTeamSize` rounds (the size of the largest team), so every student plays at least once. Most points at the end wins. Score bars scale to the maximum possible score (`maxRounds × 5`). Round count is shown in the Match Preview footer and updated each round on the board.

### Picker

The trailing team (lowest score) picks each question. On a tie, tied teams rotate by round number.

### Scoring

Each team answers simultaneously. Any combination of teams can score on a question — each correct team earns the question's point value. Neither correct = 0 pts. Round always advances.

### Uneven Teams

With uneven attendance (e.g. 27 students → 7+7+7+6), short teams pick one volunteer to go twice in the extra round. Shown and selectable in the Match Preview screen.

### Teacher View

Opens automatically when the game launches ("Let's Go!" on the Match Preview screen). Can also be opened manually via the `🎓 Teacher View` button on the Board or Question screen. Subsequent clicks focus the existing window rather than opening a new one. Resets to idle state when Play Again is triggered.

The teacher view contains:
- **Active players bar** — shows the current student from each team
- **Picker line** — shows which team is picking, in that team's color
- **Question grid** — two compact rows (Grade 5/6 and 7/8), color-coded by point value (blue 3pt / amber 4pt / red 5pt). Clicking a chip selects that question on the main screen. Used chips are grayed out; the active chip is highlighted in gold.
- **Question display** — mirrors what's shown on the main screen
- **Answer** — shown in gold after Reveal Answer is clicked
- **Reveal Answer button** — controls the main screen reveal
- **Verdict checkboxes** — bidirectionally synced with the main screen; checking either updates the other
- **Submit Verdict button** — awards points and advances the round

On the main board, only the picking team shows a "PICKS" badge; non-picking teams show no badge.

### Student Roster

Reuses ranking from `noetic/noetic-countdown.html` — 78 students; ranks 67–78 = attendance-only.

### 2026 Answer Keys

- **Grade 5/6:** D C D E A B E C C D · C D A D A B D E C B · B C E D C D B B C C
- **Grade 7/8:** E B B E A D E D C C · C A E E C D B A C A · D C B B D D B D A E

---

## Practice Competition

## Overview

`math-kangaroo-competition.html` is a standalone HTML file that runs a competitive practice session for Math Kangaroo problems from 10 years of sample questions (2016-2025). Two students compete simultaneously on the same device, with a live animated race track displaying scores in the center column.

## How to Use

1. Open `math-kangaroo-competition.html` in a web browser
2. Assign one student to represent **Level 5/6** and another to represent **Level 7/8**
3. For each year, both students select their answers (A-E) for the 3-point, 4-point, and 5-point questions
4. Click **Lock In Answers** to submit and score all three answers for that year
5. Reload the page to reset and start a new competition

## Features

### Questions
- **30 questions per level**: 3 questions from each of 10 years (2016-2025)
- **Point values**: 3-point, 4-point, and 5-point questions per year
- **Grouped by year**: Each year is a card with all three questions and a single Lock In Answers button
- **Answer format**: Multiple choice (A-E) via radio buttons
- All three questions in a year must be answered before locking in

### Scoring
- **Maximum score per level**: 120 points (10 years × 12 points)
- **Scoring method**: Points awarded based on question value
  - 3-point question correct = 3 points
  - 4-point question correct = 4 points
  - 5-point question correct = 5 points
- **Score display**: Shows `score/attempted` per level, updating as years are locked in
- **Feedback per row**: ✓ Correct or ✗ Answer: X shown inline after locking
- **Year card color**: Green border (3/3 correct), orange (1-2/3), red (0/3)

### Race Track (center column)
- Two vertical fill bars — blue for Level 5/6, orange for Level 7/8
- **Dynamic scaling**: The finish line scales to total points attempted so far (12 per locked year), not a fixed 120 — so the race always looks competitive
- Milestone markers at 25%, 50%, and 75% of current maximum update their labels as more years are locked
- 🦘 kangaroo emoji rides the top of each bar with a springy bounce animation on every correct lock
- Flash overlay on milestone events:
  - **🎉 Perfect Year!** — all 3 correct in a year
  - **🏆 Perfect Score!** — all years locked, all correct

### Sound Effects (Web Audio API)
- **All 3 correct**: ascending C→E→G fanfare + kangaroo boing
- **1–2 correct**: single ding + small boing
- **All 3 wrong**: descending Eb→Bb "wah wah"
- **Perfect Score**: extended C→E→G→C6 fanfare + double boing

### Layout
- **3-column layout**: Level 5/6 questions | race track | Level 7/8 questions
- **Full viewport height**: question panels scroll independently, race track is always visible
- **Single computer**: both students enter answers on the same device

## Answer Key

The answer key is embedded in the HTML file (3-pt, 4-pt, 5-pt per level):

```
2016: 5/6 = C, C, B | 7/8 = C, E, E
2017: 5/6 = E, D, D | 7/8 = C, E, C
2018: 5/6 = D, C, C | 7/8 = E, C, C
2019: 5/6 = E, C, D | 7/8 = D, C, B
2020: 5/6 = E, A, E | 7/8 = A, A, A
2021: 5/6 = D, D, B | 7/8 = A, C, B
2022: 5/6 = D, D, D | 7/8 = B, C, A
2023: 5/6 = D, B, E | 7/8 = A, E, E
2024: 5/6 = B, C, E | 7/8 = D, B, B
2025: 5/6 = B, C, A | 7/8 = B, B, A
```

## Technical Details

- **No external dependencies**: Fully self-contained HTML/CSS/JavaScript
- **No internet required**: Runs completely offline
- **No data saved**: Reload the page to reset
- **Sound**: Generated via Web Audio API — no audio files needed
- **Browser compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Notes

- Unanswered years score 0 points; all three questions in a year must be answered together
- Locked answers cannot be changed
- This is a practice tool using sample questions; it's not an official Math Kangaroo competition
