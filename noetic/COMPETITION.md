# Noetic 2026 Spring — Countdown Challenge Design

## Overview
File: `noetic-countdown.html` (self-contained, no external dependencies)

King-of-the-Hill competition using problems from the three Noetic Learning Math Contest 2026 Spring sample tests (G6, G7, G8). Designed for a full math club session with two physical buzzers.

---

## Game Format

### King of the Hill
- One student holds the buzzers as **champion**
- Students challenge in a **seeded queue** (weakest seed first, strongest last)
- Each match: challenger picks a category → question is served → verdict determines outcome
- **Challenger correct**: challenger becomes the new champion
- **Champion correct**: challenger is eliminated, next challenger steps up
- **Neither (1st)**: challenger picks again — a red "Last Chance" banner appears on both the category screen and the question screen
- **Neither (2nd)**: challenger is eliminated, next challenger steps up
- Game ends when the queue is empty

### Match decision tree
```
Question posed
├── ✓ Challenger correct → Challenger becomes Champion
├── ✓ Champion correct  → Challenger eliminated
└── Neither (1st)       → Last Chance banner shown
    └── Challenger picks again → Question posed (Q2)
        ├── ✓ Challenger correct → Challenger becomes Champion
        ├── ✓ Champion correct  → Challenger eliminated
        └── Neither (2nd)       → Challenger eliminated
```
After any elimination: queue empty → Game Over; otherwise next challenger steps up.

### Why seeded queue (weakest first)?
- Early matches pair weaker students against each other with easier questions still available
- As the game progresses, both the competitors and the available questions get harder naturally
- By the time rank-1 competes, most easy questions are used up — creates a difficulty ramp

### Two-buzzer logistics
- Two physical buzzers, one per competitor
- All other students watch; audience energy builds as the champion streak grows
- Teacher manages the board (category selection) and verdict buttons

---

## Category Selection

The **challenger** always picks the category. This gives the challenger strategic agency and keeps matches interesting even when facing a stronger champion.

### Last Chance banner
When the challenger is on their second question (after a first "neither"), a red banner reading **"⚠ Last chance — challenger must succeed here to unseat current champion"** appears on both the category selection screen and the question screen.

### Board display
Each category card shows:
- Category name
- **Time allowed for the next question** (updates as questions are used)
- **8 progress dots** — filled dots = used questions, empty = remaining
- Grayed out (not clickable) when all 8 questions are exhausted

### If a category is exhausted
The card grays out but stays visible. The challenger must pick from remaining categories.

---

## Variable Timing

Questions are ordered easiest → hardest within each category. Time allowed scales with difficulty:

| Question position | Difficulty | Time |
|---|---|---|
| 1–2 | Easy | 45 seconds |
| 3–4 | Easy-Medium | 60 seconds |
| 5–6 | Medium–Hard | 90 seconds |
| 7–8 | Hard–Very Hard | 120 seconds |

The timer appears on the category card so challengers can factor time into strategy.

---

## Categories & Questions

6 categories × 8 questions each = 48 total, drawn from the three Noetic sample tests.

### Shape & Space
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G7 #2 | Easy | Rectangle length = 3×width, perimeter = 128 in |
| 2 | G6 #4 | Easy-Med | Triangle ABC (9 sub-triangles), area 72; find trapezoid BCDE area |
| 3 | G6 #3 | Med | Marching band: 7-row and 6-row rectangles; 150–200 people |
| 4 | G6 #15 / G7 #11 | Med | Three tiles A (side 4), B (side 6), C glued together; find perimeter |
| 5 | G8 #16 | Hard | Triangle OAD: OA=OB=BC, OC=CD, ∠AOB=20°; find ∠CDO |
| 6 | G8 #19 | Hard | Two acute triangles; 4 of 6 angles known (80°,75°,40°,15°); find largest |
| 7 | G8 #4 | Hard | 4cm cube painted, cut to 1cm³; how many have exactly 2 green faces |
| 8 | G8 #20 | Very Hard | Square ABCD side 2in; circles radius 2 at B and D; find overlap area (π=3.14) |

### Numbers & Patterns
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G6 #11 | Easy | Other 4-digit multiple of 2178 using same digits 1,2,7,8 |
| 2 | G6 #10 | Easy | Number line A–G equally spaced; A=−28, G=2; find E |
| 3 | G7 #4 | Easy-Med | Greatest whole number < 400 divisible by 3, 5, and 7 |
| 4 | G8 #9 | Med | Number line A–G equally spaced; A=¼, G=½; which point is ⅓ |
| 5 | G6 #14 | Med | Toy cars: remainders 1, 2, 4 in groups of 2, 3, 5; fewer than 50 |
| 6 | G7 #6 | Med-Hard | Positive integer w satisfying ¼ < 2/w < ⅓ |
| 7 | G8 #5 | Hard | Sum of two largest prime factors of 2310 |
| 8 | G8 #10 | Hard | Ones digit of 27²⁷ |

### Counting & Probability
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G6 #2 | Easy | Minimum coins (pennies/nickels/dimes/quarters) to make 43¢ |
| 2 | G6 #12 | Easy | Darts: 4pt or 9pt each; total 51; how many 9-pt darts |
| 3 | G6 #9 | Easy-Med | 5-cell row, star in center; how many rectangles contain it |
| 4 | G7 #7 | Med | 6 points; triangles using P + 2 of the other 5 |
| 5 | G7 #9 | Med | Greatest 4-digit number with digit product = 90 |
| 6 | G8 #8 | Med-Hard | Fair die rolled twice; P(product is odd) as percent |
| 7 | G8 #11 | Hard | 3-digit numbers from {4,5,7,8,9}, no repeats, divisible by 6 |
| 8 | G8 #12 | Hard | Choose 6 from {1–8} whose sum is 27; how many ways |

### Rates & Work
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G6 #5 | Easy | 60 cal/12 min; how long to burn 540 cal |
| 2 | G6 #6 | Easy | Tulip:iris = 3:5; 12 more iris than tulip; find total tulips |
| 3 | G7 #3 | Easy-Med | Math camp: each day 3 more problems than previous; 51 total; find day 1 |
| 4 | G7 #8 / G8 #6 | Med | Lucia 3 mph, Maria 5 mph, both 1 mile; how many min sooner Maria |
| 5 | G7 #10 | Med | 60 people; ⅓ of boys paired with ½ of girls; find number of boys |
| 6 | G6 #18 / G7 #16 | Med-Hard | Ryan 6hr, Seth 12hr; Seth joins 3hr later; how many more hours |
| 7 | G8 #17 | Hard | Ryan 6hr, Seth 12hr; Seth joins 5hr later; how many more **minutes** |
| 8 | G7 #15 | Hard | Marble triangle; alternating black/white rows; 10 more white; find row count |

### Fractions & Percents
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G6 #7 | Easy | Mom=¾ Dad, Dad=⅔ Grandma, Mom=36; find Grandma's age |
| 2 | G8 #3 | Easy-Med | Ratio Jim:Sam:Wade = 3:7:5; Jim+Sam = 30; find Wade's score |
| 3 | G6 #13 | Med | 4 tests avg 83, 6 tests avg 93; overall average of all 10 |
| 4 | G7 #18 / G8 #15 | Med | ⅔ in choir, ½ in band, 27 in both; find total students |
| 5 | G6 #20 / G7 #19 | Med-Hard | ¾ checked out 1 book; 105 didn't; books = 5% of library; find total |
| 6 | G7 #14 | Hard | Shyam 180 cards; 25% more than Hussain; Hussain 20% more than Caleb |
| 7 | G6 #19 | Hard | Bead strings [Y][R][B][Y]=34mm, [Y][Y][B][Y][Y][B]=34mm; find [B][R][Y] |
| 8 | G7 #20 / G8 #18 | Very Hard | Cups of 18% solution + 1 cup 30% → 20% mixture |

### Logic & Algebra
| # | Source | Difficulty | Problem summary |
|---|---|---|---|
| 1 | G7 #5 | Easy | Pet survey: 28 students, 11 dogs-only, 9 cats-only, 3 neither; find both |
| 2 | G8 #2 | Easy | Operation x#y = x²−y²; find 11#10 |
| 3 | G7 #17 / G8 #14 | Med | Reverse 2-digit number; new number 36 less; find tens−ones difference |
| 4 | G6 #8 | Med | Cross-shaped grid; place 1,2,3,4 so row and column each sum to 11 |
| 5 | G7 #13 | Med | Balance scale: 2 bowls+1 mug vs 2 cups+1 mug (two clues); which is heaviest |
| 6 | G6 #17 | Med-Hard | 40 guests, 20 pairs, 14 allergic, 8 cherry-pie pairs; find both-allergic pairs |
| 7 | G6 #16 / G7 #12 | Hard | Cryptarithmetic: AA + AB + AB = CCA |
| 8 | G8 #13 | Hard | Cryptarithmetic: AA + AB + A = BA |

---

## Student Roster & Ranking

Students are defined in the `STUDENTS` array with `{rank, name, grade}`.

**Ranking methodology:** Normalized composite score across MATHCOUNTS, AMC 8, Math League, MOEMS, and Noetic Learning (4:1 weighting: prior competitions : Noetic). Noetic scores are normalized within each grade-level group (G6/G7/G8) before combining. Source file: `noetic/NoeticScores.csv`.

**Rank cutoff:** Ranks 1–66 = students with competition data. Ranks 67–78 = attendance-only students (no prior competition data), who are snake-drafted last in team activities.

---

## Queue Logic

On game start, present students are sorted by rank **descending** (highest rank number = weakest = first in queue). The weakest student begins as champion; the second-weakest is the first challenger.

After each match, the loser leaves and the next student in the queue steps up. The game ends when rank 1 has competed and the final match resolves.

---

## Teacher View

A separate popup window (👁 Teacher View button in the board footer) shows:
- Current champion and challenger names
- When board is shown: **"[Challenger name] is choosing a category…"**
- When a question is active: category name, question number, time allowed, full question text, **answer** (large gold text), and solution hint
- Updates automatically as the game progresses; does not show answers to students on the main display

Open it before starting the game and drag it to the laptop screen. The main window stays on the student display.

---

## Inline SVG Diagrams

The following questions include embedded SVG diagrams:
- Shape & Space Q2 — Triangle ABC with 9 sub-triangles, trapezoid BCDE shaded
- Shape & Space Q4 — Tiles A/B/C arrangement
- Shape & Space Q5 — Triangle OAD with points B, C on AD and tick-mark equal-length indicators
- Shape & Space Q7 — 3D cube (oblique projection) with 4×4 grid on front, top, and right faces; hidden edges dashed
- Shape & Space Q8 — Two overlapping circles with shaded lens region
- Numbers & Patterns Q2 — Number line A–G with −28 and 2 labeled
- Numbers & Patterns Q4 — Number line A–G with ¼ and ½ labeled
- Counting & Probability Q3 — 5-cell row with star in center
- Counting & Probability Q4 — 6 points scattered in a plane with P labeled
- Logic & Algebra Q4 — Cross-shaped grid with 5 and 6 placed
- Logic & Algebra Q7 — Column addition AA + AB + AB = CCA (right-aligned, monospace)
- Logic & Algebra Q8 — Column addition AA + AB + A = BA (right-aligned, monospace)
- Fractions & Percents Q7 — Three bead strings with colored oval beads
