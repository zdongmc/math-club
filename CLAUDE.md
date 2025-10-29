# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML website for the Hallie Wells Middle School Competition Math Club with an integrated Google Apps Script parent portal for student records. The main site is static HTML, while the parent portal is a web app deployed through Google Apps Script.

## Architecture

### Main Website Structure
- `index.html` - Redirects to announcements.html
- `header-template.js` - Shared header/navigation component loaded by all pages
- `announcements.html` - Announcements page content
- `club.html` - Club information page content
- `competitions.html` - Competition details and schedule
- `registration.html` - Registration & Records page with links to Google Form and Parent Portal
- `HWMS.jpeg` - School logo image
- `README.md` - Basic project description

### Parent Portal System (Google Apps Script)
Located in `math-club-attendance/` directory:
- `Code.js` - Backend Google Apps Script functions
  - `lookupStudentByMcpsId()` - Main lookup function that searches 4 sheets for student by MCPS ID
  - `getStudentAttendanceHistory()` - Retrieves attendance data by student name
  - `getStudentCompetitionSignups()` - Retrieves competition sign-ups by MCPS ID
  - `checkFormCompletion()` - Checks which required forms student has completed
  - Connects to Google Sheets with student data
- `Checkin.html` - Parent-facing web interface
  - MCPS ID lookup form (accepts variable-length numeric IDs)
  - Shows required forms completion status with links to complete missing forms
  - Displays attendance history (dates only as compact badges)
  - Shows all 4 competitions (MATHCOUNTS, MCPS Math League, MOEMS, AMC 8)
  - MOEMS displays 5 individual contests with Yes/No status
  - Math League displays 4 individual meets with Yes/No status
  - MATHCOUNTS shows School Competition date (November 8, 2025)
  - AMC 8 shows competition date (January 23, 2026)
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
- MOEMS shows 5 individual contests (Nov 21, Dec 19, Jan 9, Feb 6, Mar 6) with Yes/No
- Math League shows 4 individual meets (Nov 14, Dec 12, Jan 16, Feb 13) with Yes/No
- MATHCOUNTS displays: "Yes - I will attend the School Competition on November 8th and if selected, pay the $40 fee to attend the Chapter Competition"
- AMC 8 displays: "January 23, 2026"

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