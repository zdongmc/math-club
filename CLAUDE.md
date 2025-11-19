# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML website for the Hallie Wells Middle School Competition Math Club with an integrated Google Apps Script parent portal for student records. The main site is static HTML, while the parent portal is a web app deployed through Google Apps Script.

## Architecture

### Main Website Structure
- `index.html` - Redirects to announcements.html
- `header-template.js` - Shared header/navigation component loaded by all pages
- `announcements.html` - Announcements page content
- `club.html` - Club information page with collapsible Club Materials & Resources section
  - **MOEMS Resources**: Message to Parents, Sample Test (PDF), What Every Young Mathlete Should Know
  - **MATHCOUNTS Resources**: Message to Parents, Info Slides, various practice materials
  - **AMC 8 Resources**: Message to Parents, Past AMC 8 Problems, AMC 8 Mock Tests
  - **Math Kangaroo Resources**: Sample Questions, Math Kangaroo Scoring, Math Kangaroo Awards
  - **MCPS Math League Resources**: FAQ and meet information
- `competitions.html` - Competition details, schedules, and external resource links
  - Competition table with official sites and practice resources
  - Calendar view of all competition dates
- `registration.html` - Registration & Records page with links to Google Form and Parent Portal
- `HWMS.jpeg` - School logo image
- `README.md` - Basic project description

### Parent Portal System (Google Apps Script)
Located in `math-club-attendance/` directory:
- `Code.js` - Backend Google Apps Script functions
  - `lookupStudentByMcpsId()` - Main lookup function that searches 4 sheets for student by MCPS ID, returns student info, attendance, competitions, forms, and results
  - `getStudentAttendanceHistory()` - Retrieves attendance data by student name
  - `getStudentCompetitionSignups()` - Retrieves competition sign-ups by MCPS ID
  - `checkFormCompletion()` - Checks which required forms student has completed
  - `getMathcountsResults()` - Retrieves MATHCOUNTS competition results by MCPS ID
  - `getMoemsResults()` - Retrieves MOEMS contest results by MCPS ID (hidden in UI)
  - `getMathLeagueResults()` - Retrieves Math League team, ARML tracking, and meet scores by MCPS ID
  - `getMathKangarooResults()` - Retrieves Math Kangaroo registration status by student name (case-insensitive)
  - Connects to Google Sheets with student data
- `Checkin.html` - Parent-facing web interface
  - MCPS ID lookup form (accepts variable-length numeric IDs)
  - Shows required forms completion status with links to complete missing forms
  - **Club Meetings** section: Displays attendance dates with total meeting count summary (e.g., "5 meetings attended")
  - **Competitions** section: Shows all competition sign-ups and results
  - **MATHCOUNTS**: Shows School Competition date, displays competition results (Sprint/Target/Individual scores, rank, chapter advancement status). For students advancing to Chapter Competition, displays $40 fee payment status: green checkmark if paid, or yellow alert with payment link if not paid (only shown if column M is not "NA")
  - **MOEMS**: Displays 5 individual contests with Yes/No status. Shows fee payment status: green checkmark if paid, or yellow alert with payment link ($5 or $25 based on fee amount) if not paid (results built but hidden in UI)
  - **Math League**: Organized by meets (Meet #1-4). Each meet shows:
    - Sign-up status (Signed Up/Not Signed Up)
    - Individual results (score out of 6 or "Did Not Attend")
    - Team results (Team Score/12, Relay 1/8, Relay 2/8, Team Individual Score, Team Total/64)
    - Team assignment displayed at top (separate from ARML tracking)
    - ARML tracking status shown as smaller note below team assignment
  - **AMC 8**: Shows competition date (January 23, 2026)
  - **Math Kangaroo**: Always displayed for all students. Shows either:
    - If registered: Green checkmark with "Registered for Math Kangaroo", competition date (March 19, 2026), and Math Kangaroo ID
    - If not registered: Yellow alert with complete registration instructions including invitation code (MDCLARK0003001@2026math), fees ($18 by Dec 31, $35 late), and competition date
- `appsscript.json` - Apps Script configuration
- `.clasp.json` - Clasp CLI configuration for deployment

**Data Sources (Google Sheets):**
- **Form Responses 1** - Club Registration Form responses
  - Columns: A=Timestamp, B=First Name, C=Last Name, D=Grade Level, E=Email, F+=Parent Info
  - Used for: Student lookup by email pattern, checking Club Registration Form completion
- **School List** - Extracurricular Activities Form responses (from school)
  - Columns: A=Email, B=Student ID, C=Last Name, D=First Name
  - Used for: Student lookup by ID, checking Extracurricular Activities Form completion
- **Form Responses 2** - Competition Sign-up Form responses
  - Columns: A=Timestamp, B=Name, C=MCPS ID, D=Grade, E=Parent Name, F=Parent Phone, G=MATHCOUNTS, H=Lunch, I=MOEMS, J=AMC 8, K=Math League
  - Used for: Student lookup by ID, retrieving competition sign-ups
- **Attendance Records** - Manual attendance tracking
  - Columns: A=Student Name, B=Student ID, C+=Date headers with TRUE values or timestamps
  - Used for: Student lookup by ID, retrieving attendance history
- **MOEMS** - MOEMS contest results
  - Columns: A=Name, B=ID, C=Grade, D-H=Contest 1-5 scores, I=Total, J=Fee, K=Paid
  - Contest scores: "NA" = not attending, blank = attending but score pending, number = score
  - Fee (Column J): Fee amount (e.g., 5, 25)
  - Paid (Column K): TRUE/true/Yes/Y/Paid = paid, FALSE/false/blank = not paid
  - Used for: Retrieving MOEMS contest results and fee payment status by MCPS ID (results currently hidden in UI)
- **Math League** - Math League meet results and ARML tracking
  - Student data columns: A=Team, B=Name, C=ID, D=Grade, E=ARML Tracking (Yes/No), F=Placeholder, G=Meet #1 individual score (out of 6), H-J=Meet #2-4 (future)
  - Team results rows (2-8): Team A (row 2), Team B (row 3), Team C (row 4), Team JV A (row 5), Team JV B (row 6), Team JV C (row 7), Team JV Mixed (row 8)
  - Team score columns (for each meet): N=Team Score (out of 12), O=Relay 1 (out of 8), P=Relay 2 (out of 8), Q=Team Individual Score (sum), R=Team Total (out of 64)
  - Individual scores: "NA" = did not attend, number = score, blank = will attend but score pending
  - Used for: Retrieving team assignment, ARML tracking status, individual meet scores, and team meet scores by MCPS ID
- **MATHCOUNTS** - MATHCOUNTS competition results
  - Columns: A=Name, B=ID, G=Sprint Round, H=Target Round, I=Individual Score, J=Rank, K=Chapter Advancement, M=Fee Required, N=Fee Paid
  - Fee Required (Column M): "$40" or "NA" (if NA, fee info not displayed)
  - Fee Paid (Column N): "Yes"/"Y"/"Paid"/TRUE = paid, anything else = not paid
  - Used for: Retrieving MATHCOUNTS results and fee payment status by MCPS ID
- **Math Kangaroo** - Math Kangaroo registration
  - Columns: A=Name, B=MK ID (Math Kangaroo assigned ID, not MCPS ID)
  - Used for: Retrieving Math Kangaroo registration status by student name (case-insensitive)

**Student Lookup Process:**
When an MCPS ID is entered, the system searches in this order:
1. Form Responses 1 (by email pattern: `[ID]@mcpsmd.net`)
2. Attendance Records (by Student ID in column B)
3. School List (by Student ID in column B)
4. Form Responses 2 (by MCPS ID in column C)

Once found, uses student **name** to:
- Match attendance records in Attendance Records sheet
- Check form completion in Form Responses 1 and School List sheets

**Form Completion Tracking:**
- **Club Registration Form**: Checks if student name appears in Form Responses 1
- **Extracurricular Activities Form**: Checks if student name or ID appears in School List
- Displays green checkmark if completed, red "Complete Form" button with link if missing

**Deployment:**
- Deployed as Google Apps Script web app
- Execute as: Owner account (must be set via web UI)
- Access: Anyone (no login required for parents)
- URL: https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec
- Script ID: 1fif0wIdKDZQUjJgFaf-SOEDj60OqNz2pKXWezwpZlGlmJrqubXTBIZ2i

### MATHCOUNTS Competition Materials
Located in `mathcounts/` directory:

**countdown-round-questions.html** - Interactive question display with timer
- 60 MATHCOUNTS countdown round questions with MathJax rendering
- 60-second countdown timer for each question with visual/audio warnings
- Timer controls: Start (Space bar), Pause (Escape), Reset
- Show/hide answer functionality
- Keyboard navigation: Arrow keys to move between questions
- SVG diagrams embedded for questions 44, 53, and 57
- Red gradient theme matching main site design

**countdown-round-slideshow.html** - Competition day presentation (19 slides)
- Slide 1: Welcome slide for families
- Slide 2: Individual score calculation explanation
- Slide 3: Top 14 scorers with editable names/scores and reveal functionality
- Slides 4-7: Countdown round instructions (rules, answering, winning, final four)
- Slides 8-12: Match slides 1-5 (editable participant names)
- Slide 13: Final Four Rounds special rules (positioned before Match 6)
- Slides 14-17: Match slides 6-9 (editable participant names)
- Slide 18: Awards slide with three sections:
  - Hallie Wells Middle School MATHCOUNTS Champion (trophy SVG)
  - Top 4 Hallie Wells MATHCOUNTS School Team (badge SVG)
  - 14 Students advancing to Chapter Competition (star SVG)
- Slide 19: Sudden Victory tie-breaking rules with return buttons to all matches

**Key Features:**
- All match slides have editable name fields (contenteditable) with semi-transparent backgrounds
- "Sudden Victory" button on each match slide jumps to slide 19
- Sudden Victory slide has return buttons for all 9 matches
- Keyboard navigation works except when editing fields
- MathJax integration for math rendering
- Red gradient theme (#dc2626 to #991b1b) with gold accents (#ffd700)
- Responsive design with mobile support

### Navigation System
The `header-template.js` provides a shared navigation component for all pages:
- Navigation items: Announcements, Club Info, Competition Info, Registration & Records
- Active page highlighting based on current URL
- Responsive design with mobile-friendly layout
- Red gradient theme with white navigation pills

### Styling Approach
- Consistent design system across all pages using CSS custom properties
- Red gradient theme (#dc2626 to #991b1b) used throughout
- Responsive design with mobile-first approach
- Shared CSS patterns for sections, cards, and interactive elements
- CSS animations and transitions for enhanced user experience

### Content Structure
Each content page follows a consistent pattern:
- Full HTML document structure (not fragments)
- Shared styling conventions and color scheme
- Responsive grid layouts for content organization
- Interactive elements with hover states and animations

## Development Workflow

### File Organization
- All HTML files are self-contained with embedded CSS and JavaScript
- No external dependencies or build process required
- Images stored in root directory
- Simple file serving - can be opened directly in browser or served via any static web server

### Making Changes to Main Website
1. **Navigation Updates**: Modify the navigation in `header-template.js` - all pages load this shared component
2. **Content Updates**: Edit the individual HTML files (announcements.html, club.html, etc.)
3. **Styling**: Each page has its own embedded styles, but maintain consistency with the established design system
4. **New Pages**: Create new HTML file and add navigation item to `header-template.js`

### Working with Parent Portal (Apps Script)
**Deployment Process:**
1. Make changes to files in `math-club-attendance/` directory
2. Push changes using `clasp push --force` (requires clasp CLI and authentication with correct Google account)
3. **IMPORTANT**: Pushing code only updates the script files, NOT the live deployment
4. To update the live URL, must manually update deployment in Apps Script web UI:
   - Go to https://script.google.com/home
   - Open the parent portal project
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (pencil icon) next to the deployment ending in `...Y9udIEskvIMJ`
   - Select **"New version"** from dropdown
   - Add a description
   - Click **Deploy**
5. This keeps the same URL stable while updating the code

**Key Implementation Details:**
- MCPS IDs can be variable length (not just 6 digits) - validation uses `/^\d+$/`
- Student lookup searches 4 sheets in order, stops at first match
- Attendance lookup uses **student name** (must match exactly)
- Attendance dates stored as column headers in "Attendance Records" sheet (starting column C)
- Date columns contain `true` values or timestamp strings like "time - meeting type"
- Competition sign-ups parsed from "Form Responses 2" sheet by MCPS ID
- Always displays all 4 competitions (signed up or not)
- **MOEMS**: Shows 5 individual contests (Nov 21, Dec 19, Jan 9, Feb 6, Mar 6) with Yes/No. Results section built with contest scores and totals but hidden with `display: none`
- **Math League**: Organized by meets in gray containers. Shows team assignment and ARML tracking at top. Each meet (Nov 14, Dec 12, Jan 16, Feb 13) displays:
  - Sign-up status badge (Signed Up/Not Signed Up)
  - Individual results in blue box if available (score out of 6 or "Did Not Attend")
  - Team results in gold box if available (Team Score/12, Relay 1/8, Relay 2/8, Team Individual Score, Team Total/64)
- **MATHCOUNTS**: Displays signup details and competition results if available (Sprint/Target/Individual scores out of 30/16/46, rank, chapter advancement status)
- **AMC 8**: Displays "January 23, 2026"

**Data Quality Requirements:**
- **Student names must match exactly** across all sheets (case-insensitive, but spelling must be identical)
- Common issues to avoid:
  - Name spelling variations (e.g., "Devaguptapu" vs "Devaguptapo")
  - Parent names entered instead of student names in School List
  - Same MCPS ID assigned to multiple students
  - Duplicate entries for same student with same ID
  - ID typos (e.g., missing leading digits like "1013986" vs "10113986")
- Use provided Python script to check for name/ID mismatches before deploying

**Important Notes:**
- Web app deployment must be set to "Execute as: Me" and "Who has access: Anyone" (via web UI)
- Changes require manual deployment update (not automatic with clasp push)
- Test function `testLookup190949()` available for debugging in Apps Script editor
- Current stable deployment URL must not change - always edit existing deployment, never create new one

### Data Quality Checks
To verify data consistency across sheets before making portal changes, use this Python script:

```python
import csv
from difflib import SequenceMatcher

# Checks for:
# 1. Name spelling mismatches between sheets
# 2. Same ID assigned to different students
# 3. Same student with different IDs
# 4. Names with extra spaces
# 5. Similar IDs (possible typos)

# Run from math-club directory:
# python3 check_data_quality.py
```

Common data quality issues:
- Student names spelled differently in different sheets
- Parent names accidentally entered in School List instead of student names
- Duplicate MCPS IDs for different students
- Missing or incorrect leading digits in IDs
- Extra spaces in names

### Key Design Patterns
- Use the established red gradient theme (#dc2626 to #991b1b)
- Maintain responsive grid layouts with `auto-fit` and `minmax()`
- Include hover effects and smooth transitions
- Use semantic HTML structure with proper heading hierarchy
- Implement loading states and error handling for dynamic content

### External Dependencies
- **Club Registration Form**: https://forms.gle/PMdmzV79ZZd5jBso6 (Google Form)
- **Extracurricular Activities Form**: https://docs.google.com/forms/d/e/1FAIpQLSfublOE3YoXop_RTQn0IykEI1EOZZgPlx_Fn2Or0xD-ucSYZw/viewform (Google Form - from school)
- **Competition Sign-up Form**: https://docs.google.com/forms/d/e/1FAIpQLScYpMKiwcsPvePzsacLdJKKxqjIrxVMEGHEfl5AJO0ilwqBgA/viewform (Google Form)
- **Parent Portal**: https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec (Google Apps Script)
- **Google Sheets**: Connected to Apps Script for student data storage
- Competition information includes links to external competition websites
- No JavaScript frameworks or libraries are used on the main website

## Contact Information
- Math Coach: Prof. Jojo (zdongmc@gmail.com)
- School: Hallie Wells Middle School, Clarksburg, MD

## Competitions Featured
The site provides detailed information about middle school math competitions including MOEMS, MATHCOUNTS, AMC 8, Math Kangaroo, Purple Comet Math Meet, and Noetic Learning Math Contest with schedules, costs, and registration details for the 2025-2026 school year.