# MATHCOUNTS Competition Materials

This folder contains all materials for running the Hallie Wells Middle School MATHCOUNTS School Competition on November 8, 2025.

## Competition Overview

MATHCOUNTS is a national math competition program for middle school students. The school competition consists of:
- **Sprint Round**: 30 questions, 40 minutes, no calculator
- **Target Round**: 8 questions (4 pairs), 6 minutes per pair, calculator allowed
- **Team Round**: 10 questions, 20 minutes, calculators allowed
- **Countdown Round**: 60 questions, 60 seconds each, top 10 students compete in sequential ladder format

## Files in this Folder

### Competition Slideshows

**mathcounts-competition-slideshow.html**
- Main presentation for the entire competition day
- Includes welcome, schedule, instructions for all rounds, and answer reveals
- Red gradient theme matching school branding
- Keyboard navigation (arrow keys) and jump-to-slide functionality
- Sections:
  - Welcome and schedule (8:30 AM - 1:30 PM)
  - Sprint Round instructions and answers (30 questions)
  - Target Round instructions and answers (8 questions)
  - Team Round instructions and answers (10 questions)
  - Competition structure explanation (Top 14 → Chapter, Top 10 → Countdown)
  - Notes about lunch break and parent return time (12:00 PM)

**countdown-round-slideshow.html**
- Interactive presentation for the Countdown Round (12:00 - 1:10 PM)
- 66 total slides including:
  - Welcome back slide for families
  - Individual score calculation explanation (Sprint + 2×Target)
  - Top 14 scorers slide with editable fields and manual reveal functionality
  - Sequential ladder format explanation (3 slides)
  - Competition instructions
  - 60 individual question slides with 60-second timers each
- Features:
  - Auto-starting 60-second timer for each question
  - Visual timer states (normal, warning at <20s, critical at <10s)
  - Voice countdown for last 10 seconds
  - Show/hide answer functionality
  - Manual reveal for top scorer names (click to reveal, Hide All/Show All buttons)
  - Names typed into editable fields persist while page stays open
  - MathJax support for mathematical notation
- Format: Sequential "King of the Hill" ladder
  - #10 vs #9, winner stays to face #8, winner faces #7, etc.
  - Matches 1-5: Up to 3 problems, most correct wins
  - Matches 6-9 (Final Four): First to 3 correct wins
  - Winner of final match is Countdown Round champion

**countdown-round-questions.md**
- All 60 countdown round questions extracted from official MATHCOUNTS materials
- Formatted in Markdown with LaTeX math notation
- Each question includes answer
- Includes math notation examples at the end for reference

### Question PDFs

**Q1_10.pdf** through **Q51_60.pdf**
- Official MATHCOUNTS question PDFs (6 files total)
- Each contains 10 questions with diagrams
- Used as source material for countdown-round-questions.md
- Diagrams referenced when needed (e.g., Question 3 has 3 circles diagram)

### Official Competition Materials

**MATHCOUNTS2026_School_Competition_110525.pdf**
- Official 2026 School Competition rules and guidelines
- Pages 3-4 contain Countdown Round rules (sequential ladder format)
- Source of truth for competition format and rules

**MATHCOUNTS-Volunteer-Guide.pdf**
- Guide for volunteers running the competition
- Contains logistics, setup, and scoring information

**MATHCOUNTS School Competition Day Schedule.pdf**
- Detailed schedule template for the competition day
- Used as reference for creating slideshow schedule

### Supporting Materials

**mathcounts-table-signs.html**
- Printable table assignment signs for lunch/seating
- Lists students assigned to each table (Tables 1-9)
- Designed for printing as PDF to create physical table signs
- NOT CURRENTLY USED - old version that was deleted from parent directory

**mathcounts-countdown-bracket.html**
- Editable bracket for 10 students
- NOT NEEDED based on official rules (competition uses sequential ladder, not bracket)
- Kept for reference but not used in actual competition
- Has first round (2 matches), quarterfinals (4 matches), semifinals (2 matches), finals

## Design Patterns

### Slideshow Structure
Both main slideshows follow this pattern:
- Full HTML documents with embedded CSS and JavaScript
- No external dependencies except MathJax CDN
- Red gradient theme (#dc2626 to #991b1b) matching school branding
- Responsive design for projection
- Keyboard navigation:
  - Left/Right arrows: Navigate slides
  - Space: Advance to next slide
  - Home/End: First/last slide
- Jump-to-slide input field in navigation
- Active slide tracking with `.active` class

### Timer Implementation (Countdown Round)
- Each question slide has unique timer (timer-1 through timer-60)
- Timer states:
  - Normal: Gray background
  - Warning (<20s): Yellow/orange with pulse animation
  - Critical (<10s): Red with fast pulse + voice countdown
- Controls: Start, Pause, Reset, Show Answer
- Timers use `setInterval` for countdown
- Web Speech Synthesis API for voice countdown

### Editable Content
- Uses `contenteditable="true"` attribute for inline editing
- Top scorer names and scores can be typed directly
- Manual reveal functionality with JavaScript click handlers
- Content persists while page remains open (not saved to file)

## Competition Day Workflow

1. **Morning Session** (8:30 AM - 11:30 AM)
   - Open mathcounts-competition-slideshow.html
   - Present welcome, schedule, and round instructions
   - Proctor Sprint, Target, and Team rounds
   - Reveal answers after each round

2. **Lunch Break** (11:30 AM - 12:00 PM)
   - Students eat lunch
   - Coach calculates individual scores: Sprint + 2×(Target)
   - Prepare top 14 scorer list

3. **Afternoon Session** (12:00 PM - 1:30 PM)
   - Open countdown-round-slideshow.html
   - Type in top 14 scorer names and scores
   - Present countdown round format explanation
   - Run sequential ladder matches with timers
   - Awards ceremony (1:10 - 1:30 PM)

## Key Competition Rules

### Individual Score Calculation
- **Formula**: Sprint Score + 2×(Target Score)
- **Maximum Score**: 30 + 2×8 = 46 points
- **Top 14 scorers**: Advance to Chapter Competition
- **Top 10 scorers**: Compete in Countdown Round

### Countdown Round Format (Sequential Ladder)
- Start with #10 vs #9
- Winner stays, loser eliminated
- Winner faces next challenger (#8, #7, #6, #5, #4, #3, #2, #1)
- **Matches 1-5**: Up to 3 problems, student with most correct wins
- **Matches 6-9** (when #4 enters): First to 3 correct wins
- Each problem: 60 seconds to solve
- No calculators allowed
- Buzzer rules: First to buzz answers; if wrong, opponent gets remaining time

## Technical Notes

### MathJax Configuration
Both slideshows load MathJax for mathematical notation:
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

Inline math: `$x^2 + y^2 = r^2$`
Display math: `$$\frac{a}{b} = \frac{c}{d}$$`

### Browser Compatibility
- Designed for modern browsers (Chrome, Firefox, Safari, Edge)
- Uses CSS Grid, Flexbox, and custom properties
- Web Speech Synthesis API for voice countdown (may not work in all browsers)
- Print-friendly for PDF generation (table signs, bracket)

### File Serving
- All files are self-contained HTML (no build process)
- Can be opened directly in browser via file:// protocol
- Or served via any static web server
- Recommended: Keep all files together in same directory for consistent theming

## Contact
- Math Coach: Prof. Jojo (zdongmc@gmail.com)
- School: Hallie Wells Middle School, Clarksburg, MD
- Competition Date: November 8, 2025
