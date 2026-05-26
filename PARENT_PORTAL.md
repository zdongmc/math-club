# Parent Portal (Google Apps Script)

Located in `math-club-attendance/`. Deployed as a Google Apps Script web app.

**Production URL**: https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec  
**Script ID**: `1fif0wIdKDZQUjJgFaf-SOEDj60OqNz2pKXWezwpZlGlmJrqubXTBIZ2i`

## Files

- `Code.js` — All backend Google Apps Script functions
- `Checkin.html` — Parent-facing web interface
- `Kiosk.html` — Student self-serve attendance kiosk (served at `?kiosk=1`)
- `CertDraw.html` — Teacher-only certificate drawing interface (served at `?certdraw=1`)
- `appsscript.json` — Must have `"access": "ANYONE_ANONYMOUS"` for public access
- `.clasp.json` — Clasp CLI deployment config

## Attendance Kiosk (`Kiosk.html`)

**Kiosk URL**: `[production URL]?kiosk=1` — bookmark this on the classroom device.

Student self-serve check-in used at the start of each club meeting. Teacher opens the URL once and leaves it up; students walk up and type their MCPS ID.

**UI:**
- Teacher bar: today's date
- Large centered ID input — auto-focused, Enter submits
- Confirmation: green success ("Welcome, Joyce! This is your 12th club meeting.") / amber if already checked in / red if ID not found — auto-clears after 4 seconds
- Session counter at the bottom showing how many students have checked in this session

**Backend:**
- `findStudentNameByMcpsId()` — lightweight 4-sheet name lookup (no competition data, fast for a kiosk line)
- `checkInStudent(mcpsId)` — finds or creates the student row, finds or creates today's date column, detects duplicate check-ins, sets cell to `TRUE` (preserving checkbox validation) with a `Checked in: HH:mm` note, recounts and updates the total in col C

## Backend Functions (`Code.js`)

**Core lookup:**
- `lookupStudentByMcpsId()` — Main entry point: searches 4 sheets, returns student info, attendance, competitions, forms, and results
- `findStudentNameByMcpsId()` — Lightweight version: name only, no competition data; used by kiosk
- `getStudentAttendanceHistory()` — Attendance by student name
- `getStudentCompetitionSignups()` — Competition sign-ups by MCPS ID
- `checkFormCompletion()` — Which required forms student has completed

**Competition results:**
- `getMathcountsResults()` — MATHCOUNTS results by MCPS ID
- `getMoemsResults()` — MOEMS results by MCPS ID (hidden in UI)
- `getMathLeagueResults()` — Math League team, ARML tracking, qualifier score, meet scores, cumulative score
- `getMathKangarooResults()` — Math Kangaroo registration by student name (case-insensitive)
- `getNoeticResults()` — Noetic sign-up status, grade level, publish permission, username, password, score
- `getNoeticSignUpCounts()` — Count of sign-ups by grade level
- `signUpForNoetic()`, `updateNoeticGradePreference()`, `dropNoeticSignUp()`, `submitNoeticPermission(mcpsId, permission)`

**Purple Comet team management:**
- `getPurpleCometSheet()`, `isPurpleCometDeadlinePassed()`
- `getPurpleCometResults(mcpsId)` — Returns myTeam (with submissionLink col J, scoreReportLink col K), pendingInvites, allTeams
- `getAvailableStudents()` — Roster minus students already on a team
- `createPurpleCometTeam(mcpsId, studentName, grade, teamName, teamType)`
- `joinPurpleCometTeam(mcpsId, studentName, grade, teamName)`
- `inviteToPurpleCometTeam(creatorMcpsId, invitees)`
- `acceptPurpleCometInvite(mcpsId, studentName, grade, teamName)`
- `rejectPurpleCometInvite(mcpsId, teamName)`
- `leavePurpleCometTeam(mcpsId, newCreatorMcpsId)`
- `revokePurpleCometInvite(creatorMcpsId, inviteeMcpsId)`

**Kiosk attendance:**
- `findStudentNameByMcpsId(idStr)` — name-only lookup across 4 sheets; fast path for kiosk
- `checkInStudent(mcpsId)` — records attendance for today; sets checkbox to `TRUE`, stores check-in time in cell note; returns `{success, name, totalCount, alreadyCheckedIn}`

**Noetic Summer Certificate Drawing:**
- `getDrawingStatus(mcpsId)` — returns `{eligible, alreadyWon, certLink, certsRemaining, entries, baseEntry, ponEntries, noeticParticipant, rangeStatus}`; `baseEntry` is 1 for Noetic participants, 0 otherwise; `certLink` is the Google Drive PDF link if this student has already won
- `getCertDrawPool()` — full draw pool: Noetic participants (base=1, any grade) + non-Noetic PON leaders (base=0); excludes prior winners; returns `{success, certsRemaining, certsDrawn, winners, pool}`; each winner includes `certLink`
- `recordCertWinner(mcpsId, entriesAtWin)` — appends to "Cert Winners 2026" sheet with cert number (col E) and Drive link (col F); returns updated pool state plus `certLink` and `certNumber`
- `getCertWinnersSheet()` — get/create "Cert Winners 2026" sheet
- `getPONDrawingLeaderboard_()` — internal; opens PON sheet via `SpreadsheetApp.openById(PON_SHEET_ID)`; finds #1 per qualifying range (rangeSize ≥ 20, totalQuestions ≥ 20); no eligibility filter — all MCPS ID holders compete
- `lookupStudentForPON` GET action — `?action=lookupStudentForPON&id=<mcpsId>` returns `{success, name}` or `{success:false, error:'not_found'}`; called by the Prime or Not game frontend for MCPS ID login

**Carderock:**
- `getCarderockSheet()`, `isCarderockDeadlinePassed()`
- `getCarderockResults(mcpsId)` — Returns signedUp, signUpDate (string), status, team, permissionSlipLink, totalSignUps
- `signUpForCarderock(mcpsId, studentName, grade)`, `dropCarderockSignUp(mcpsId)`

## Student Lookup Process

MCPS ID is entered → system searches these sheets **in order**, stops at first match:
1. **Form Responses 1** — by email pattern `[ID]@mcpsmd.net`
2. **Attendance Records** — by Student ID in column B
3. **School List** — by Student ID in column B
4. **Form Responses 2** — by MCPS ID in column C

Once found, uses the student's **name** (not ID) to match attendance records and check form completion.

**Form Completion:**
- Club Registration Form — checks if name appears in Form Responses 1
- Extracurricular Activities Form — checks if name or ID appears in School List

## Checkin.html UI Behavior

MCPS ID lookup form (variable-length numeric IDs, validated with `/^\d+$/`).

**Club Meetings**: Attendance dates + total meeting count (e.g., "5 meetings attended").

**MATHCOUNTS**:
- School Level: Sprint/Target/Individual scores, rank, chapter advancement
- Chapter Level (if advanced): Sprint/Target/Individual, Team Round/20, Team Score/64, State advancement
- Fee: green checkmark if paid; yellow alert with payment link ($40) if not (only shown when advancing)

**MOEMS**: 5 contests (Nov 21, Dec 19, Jan 9, Feb 6, Mar 6). Per contest: score/5, "Did Not Attend", or "Score Pending". Total score in gold box. Fee: green checkmark or yellow alert with link ($5 or $25).

**Math League**: 4 meets (Nov 14, Dec 12, Jan 20, Feb 13). Per meet:
- Team assignment: team name, "Individual Round Only", or "Did Not Attend" (if NA)
- Individual score/6 or "Did Not Attend" (blue box)
- Team results: Team Score/12, Relay 1/8, Relay 2/8, Team Individual Score, Team Total/64 (gold box, only if team attended)
- ARML tracking status; ARML Qualifier Score in blue box if applicable; Cumulative score in amber box

**AMC 8**: Competition date (January 23, 2026). Score out of 25 with link to individual PDF score report.

**Math Kangaroo**: Always shown. If registered: green checkmark, MK ID, username/password. If not: yellow alert with invitation code `MDCLARK0003001@2026math`, fee info ($18/$35 late), competition date.

**Noetic Learning** (contest completed April 10, 2026; registration closed):
- If registered: "✓ Contest Completed", score/100 in gold box (or "Score pending" with link), award badges (Honorable Mention / National Honor Roll / Team Winner, from cols K/L/M), login credentials (col H/I), 6 practice PDFs (password: "noetic")
- If not registered: "Registration Closed"
- **IMPORTANT**: `lookupStudentByMcpsId` assembles Noetic data inline (does NOT call `getNoeticResults()`). Both must be kept in sync when adding new fields.

**Purple Comet** (deadline April 17, 2026):
- Teams of 1-6; open or invite-only; roles: `creator`, `member`, `invited`
- Main screen: invite notification bar, inline team card, Browse All Teams button
- If on a team: member list, revoke buttons (creator), Invite Students button, Leave Team button
- If not on a team: Create a Team button; pending invites shown (if any)
- Browse modal: sorted open→invite-only→full, then by most open spaces, then alphabetically
- After deadline: purple "Contest Complete" banner + read-only card + submission/score report/certificate PDFs (cols J/K/L) + results grid (cols M–P: team score, overall/country/state rank)
- All actions use `google.script.run` + `showMessage()` + `lookupStudent()` refresh

**☀️ Summer Certificate Drawing** (shown to all students):
- All students see this section — not gated by Noetic sign-up
- Noetic participants: gold entry-count banner showing `baseEntry (1) + ponEntries`; per-range standings table (⭐ = ranges where they currently lead); link to Prime or Not game
- Non-Noetic with entries: same banner but `baseEntry = 0`; entry count = ranges led only
- Non-Noetic with 0 entries: amber "no entries yet" message + play button
- Already won: green trophy banner + green "📄 View Your Certificate" button linking to their Google Drive PDF (from `certLink`)
- All certs drawn: gray "all certificates drawn" message

**Carderock** (deadline April 13, 2026; 8 spots max):
- Before deadline + not signed up: "Indicate Interest" → security acknowledgement modal (5 Navy base access cards)
- Signed up: green "✓ Signed Up" card + amber photo release form + gray day-of-event rules + permission slip box
- Permission slip: green "✓ Received" if col G has link; otherwise blue "📋 Required" with blank download + return instructions
- Status: "Selected" (green) or "Alternate" (amber) with optional team name
- `signUpDate` stored as string (not Date) to avoid Apps Script serialization issues

## Certificate Drawing Teacher Interface (`CertDraw.html`)

Served at `[production URL]?certdraw=1`. Teacher-only projected drawing screen (brown/gold color scheme).

**Top bar:** certificates remaining pill + eligible student count + total entry count.

**Spinning wheel:** "Spin the Wheel" button → fetches live pool from `getCertDrawPool()` → pre-picks winner (weighted random, proportional to entries) → canvas wheel spins ≥ 2 full rotations with tick sounds (pitch rises/falls with speed) → decelerates and lands on winner → ascending fanfare plays → winner banner pops in → "Confirm Winner" button → calls `recordCertWinner()` → status bar shows cert number + clickable Drive link.

**Wheel rendering:** each student's slice is proportional to their entry count; color-coded dots in pool table match slice colors; first name displayed on each slice; labels clipped to their wedge.

**Entry pool table:** Student | Entries | Ranges Leading — sorted by entries desc.

**Winners list:** previous winners shown as gold chips at bottom.

## `doGet()` URL Routing

| Parameter | Handler |
|-----------|---------|
| `?action=lookupStudentForPON&id=<mcpsId>` | Returns `{success, name}` JSON — called by Prime or Not game |
| `?action=signUpNoetic&...` | Noetic sign-up |
| `?action=updateNoeticGradePreference&...` | Grade preference update |
| `?action=signUpCarderock&...` | Carderock sign-up |
| `?action=dropCarderock&...` | Carderock drop |
| `?certdraw=1` | Serves `CertDraw.html` |
| `?kiosk=1` | Serves `Kiosk.html` |
| *(default)* | Serves `Checkin.html` (parent portal) |

## Data Sources (Google Sheets)

### Form Responses 1 — Club Registration Form
`A=Timestamp, B=First Name, C=Last Name, D=Grade, E=Email, F+=Parent Info`

### School List — Extracurricular Activities Form
`A=Email, B=Student ID, C=Last Name, D=First Name`

### Form Responses 2 — Competition Sign-up Form
`A=Timestamp, B=Name, C=MCPS ID, D=Grade, E=Parent Name, F=Parent Phone, G=MATHCOUNTS, H=Lunch, I=MOEMS, J=AMC 8, K=Math League`

### Attendance Records
`A=Student Name, B=Student ID, C=Total attendance count, D+=Date headers` (values: `true` or timestamp strings like "time - meeting type")

### MOEMS
`A=Name, B=ID, C=Grade, D-H=Contest 1-5 scores, I=Total, J=Fee amount, K=Paid`  
Score values: `NA`=not attending, blank=pending, number=score  
Paid (col K): `TRUE/true/Yes/Y/Paid` = paid

### Math League
Student rows: `A=Name, B=ID, C=Grade, D=ARML Tracking, E=Meet1 Team, F=Meet1 Score, G=Meet2 Team, H=Meet2 Score, I=Meet3 Team, J=Meet3 Score, K=Meet4 Team, L=Meet4 Score, M=Total`  
Col D: `"Yes"/"Y"` = ARML on, `"No"` = off, numeric = ARML Qualifier score (shown as blue box)  
Team rows 2-8: Team A, B, C, JV A, JV B, JV C, JV Mixed  
Team score cols: `O=Team, P=Meet1 Score/12, Q=Meet1 Relay1/8, R=Meet1 Relay2/8, S=Meet1 Ind, T=Meet1 Total/64` (Meet 2: U-Y, Meet 3: Z-AD, Meet 4: AE-AI)  
Score values: `NA`=did not attend, blank=pending, number=score

### MATHCOUNTS
School: `A=Name, B=ID, G=Sprint, H=Target, I=Individual, J=Rank, K=Chapter Advancement`  
Chapter: `O=Sprint, P=Target, Q=Individual, R=Team Round/20, S=Team Score/64 (from row 2), T=State Advancement`  
State: `U=Sprint, V=Target, W=Individual`  
Fee: `M="$40" or "NA", N=paid status`

### Math Kangaroo
`A=Name, B=MK ID (not MCPS ID), C=(unused), D=Username, E=Password`  
Lookup is by student name, case-insensitive.

### Noetic Learning
`A=Name, B=MCPS ID, C=Grade, D=Sign-up Timestamp, E=Grade Preference (own/mixed), F=Contest Grade Level (6/7/8), G=Publish Permission (yes/no), H=Username, I=Password, J=Score/100, K=Honorable Mention (checkbox), L=National Honor Roll (checkbox), M=Team Winner (checkbox)`

### Carderock
`A=Name, B=MCPS ID, C=Grade, D=Timestamp, E=Status, F=Team, G=Permission Slip Link`  
No header row in sheet — code starts at row 1. Sign-up blocked if totalSignUps >= 8 or after April 13, 2026.

### Cert Winners 2026
`A=Name, B=MCPS ID, C=Win Timestamp, D=Entries At Win, E=Cert #, F=Cert Link`  
Created automatically by `getCertWinnersSheet()` on first use. Max 9 rows (CERT_TOTAL). Winners are excluded from `getCertDrawPool()`. Cert links are Google Drive PDF URLs; cert number = draw order (1 = first winner). To undo a winner, delete the row manually.

### Prime or Not (external sheet, read-only from portal)
Sheet ID: `19P1KPhQXMMsYEgx8dpmhZQynegf5iygu4nqLMNXU4ss`  
Opened via `SpreadsheetApp.openById(PON_SHEET_ID)` in `getPONDrawingLeaderboard_()`.  
`A=Timestamp, B=Player Name, C=Min, D=Max, E=Questions, F=Correct, G=Incorrect, H=Accuracy%, I=Total ms, J=Time Display, K=MCPS ID`  
Only rows with a non-empty col K contribute to drawing entries.

### Purple Comet
`A=Team Name, B=MCPS ID, C=Student Name, D=Grade, E=Role, F=Team Type, G=Timestamp, H=Login Name, I=Password, J=Submission PDF, K=Score Report PDF, L=Certificate PDF, M=Team Score, N=Overall Rank, O=Country Rank, P=State Rank`  
Cols J–P are team-level (same across all rows for that team); portal reads first non-empty value.  
Role: `creator` (owner + active), `member` (active), `invited` (pending)  
Active count excludes `invited`. Size limit: 6 active members.  
Team name: 1-30 chars, alphanumeric + spaces/hyphens/underscores, unique case-insensitive.

## Deployment Process

1. Edit files in `math-club-attendance/`
2. `clasp push --force`
3. *(Optional)* `clasp deploy --description "TEST: ..."` → test with new URL → delete when done
4. **Promote to production**: Go to https://script.google.com/home → open project → Deploy → Manage deployments → Edit (pencil) next to the deployment ending `...Y9udIEskvIMJ` → select new version → Deploy
5. The stable URL (`...Y9udIEskvIMJ`) stays the same; only the code version changes

**Never create a new deployment for production changes** — always edit the existing one to preserve the URL referenced in `registration.html`.
