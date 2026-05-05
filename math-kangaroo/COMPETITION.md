# Math Kangaroo Practice Competition

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
