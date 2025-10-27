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
  - `lookupStudentByMcpsId()` - Main lookup function for student records
  - `getStudentAttendanceHistory()` - Retrieves attendance data
  - `getStudentCompetitionSignups()` - Retrieves competition sign-ups
  - Connects to Google Sheets with student data
- `Checkin.html` - Parent-facing web interface
  - MCPS ID lookup form
  - Displays attendance history (dates only, no times)
  - Shows all 4 competitions (MATHCOUNTS, MCPS Math League, MOEMS, AMC 8)
  - MOEMS and Math League display individual dates with Yes/No status
- `appsscript.json` - Apps Script configuration
- `.clasp.json` - Clasp CLI configuration for deployment

**Data Sources:**
- **Form Responses 1** - Student registration data
- **Form Responses 2** - Competition sign-up data (MATHCOUNTS, MOEMS, AMC 8, Math League)
- **Attendance Records** - Manual attendance tracking sheet with dates as columns

**Deployment:**
- Deployed as Google Apps Script web app
- Execute as: Owner account
- Access: Anyone (no login required for parents)
- URL: https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec

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
2. Push changes using `clasp push` (requires clasp CLI and authentication)
3. Deploy using `clasp deploy -i [DEPLOYMENT_ID] -d "Description"`
4. Current deployment ID: `AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ`

**Key Implementation Details:**
- MCPS IDs can be variable length (not just 6 digits)
- Attendance dates stored as column headers in "Attendance Records" sheet
- Date columns contain `true` values or timestamp strings
- Competition sign-ups parsed from "Form Responses 2" sheet
- Always displays all 4 competitions (signed up or not)
- MOEMS shows 5 individual contests with Yes/No
- Math League shows 4 individual meets with Yes/No

**Important Notes:**
- Web app must be set to "Execute as: Me" and "Who has access: Anyone"
- Changes require redeployment to take effect on the live URL
- Test function `testLookup190949()` available for debugging in Apps Script editor

### Key Design Patterns
- Use the established red gradient theme (#dc2626 to #991b1b)
- Maintain responsive grid layouts with `auto-fit` and `minmax()`
- Include hover effects and smooth transitions
- Use semantic HTML structure with proper heading hierarchy
- Implement loading states and error handling for dynamic content

### External Dependencies
- **Student Registration Form**: https://forms.gle/PMdmzV79ZZd5jBso6 (Google Form)
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