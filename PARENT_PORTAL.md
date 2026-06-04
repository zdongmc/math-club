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
- `lookupStudentByMcpsId()` — Main entry point: searches 4 sheets, returns student info, attendance, competitions, forms, and results. Grade fallback order: Form Responses 1 (by email) → Form Responses 2 (by MCPS ID) → Form Responses 1 (by name match, for students whose Form Responses 1 email doesn't follow the `mcpsid@mcpsmd.net` pattern but were found via Attendance Records or School List)
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
- `getDrawingStatus(mcpsId)` — returns `{eligible, alreadyWon, certLink, certsRemaining, entries, baseEntry, ponEntries, noeticParticipant, rangeStatus}`; `baseEntry` is 1 for Noetic participants, 0 otherwise; `certLink` is the Google Drive PDF link if this student has already won. Falls back to `CERT_LINKS[position]` when col F is missing (handles winners recorded before the cert link column was added)
- `getCertDrawPool()` — full draw pool: Noetic participants (base=1, any grade) + non-Noetic PON leaders (base=0); excludes prior winners; passes `wonIds` to `getPONDrawingLeaderboard_` so winners cascade to the next eligible player per range
- `recordCertWinner(mcpsId, entriesAtWin)` — appends to "Cert Winners 2026" sheet with cert number (col E) and Drive link (col F); syncs all winner IDs to "Cert Winners" tab in the PON spreadsheet so the public leaderboard cascades automatically; returns updated pool state plus `certLink` and `certNumber`
- `getCertWinnersSheet()` — get/create "Cert Winners 2026" sheet
- `getPONDrawingLeaderboard_(excludeIds)` — internal; opens PON sheet via `SpreadsheetApp.openById(PON_SHEET_ID)`; finds #1 per qualifying range (rangeSize ≥ 20, totalQuestions ≥ 20); skips any MCPS ID in `excludeIds` (used to cascade past prior winners)
- `getCertWinners` GET action — `?action=getCertWinners` returns `{success, wonIds:[...]}` array of winner MCPS IDs; public endpoint used by the leaderboard page
- `lookupStudentForPON` GET action — `?action=lookupStudentForPON&id=<mcpsId>` returns `{success, name}` or `{success:false, error:'not_found'}`; called by the Prime or Not game frontend for MCPS ID login

**Carderock:**
- `getCarderockSheet()`, `isCarderockDeadlinePassed()`
- `getCarderockResults(mcpsId)` — columns: A=Name, B=MCPS ID, C=Grade, D=Timestamp, E=PermissionSlipLink, F=Team, G=SprintScore, H=TargetScore, I=IndividualScore, J=TeamRoundScore, K=TeamScore, L=ScoreReportLink, M=IndividualRank, N=TeamRank; returns all fields plus `signedUp`, `signUpDate`, `totalSignUps`
- `signUpForCarderock(mcpsId, studentName, grade)`, `dropCarderockSignUp(mcpsId)`
- Portal display (post-contest): team badge + score tiles (Sprint/Target/Individual/Indiv.Rank/TeamRound/TeamScore/TeamRank) + Score Report link + Permission Slip link

**End-of-Year Party Sign-Up:**
- `const PARTY_SIGNUP_OPEN = new Date() < new Date('2026-06-04T00:00:00-04:00')` — auto-closes end of Wednesday June 3 (party is Thursday June 4, 3:15–4:15 PM)
- `getPartySignUpSheet()` — get/create "Party Sign-Up 2026" sheet (cols: Timestamp, MCPS ID, Student Name, Grade, StudentAttending, Parent1Name, Parent2Name)
- `getPartySignUpStatus(mcpsId)` — returns `{open, signedUp, studentAttending, parent1Name, parent2Name}`
- `submitPartyRSVP(mcpsId, studentName, grade, studentAttending, parent1Name, parent2Name)` — gates on deadline; upserts by MCPS ID; parent names required for office check-in
- Shown in portal when `open` OR already `signedUp`; student checkbox + up to 2 parent name fields
- `lookupStudentByMcpsId` returns `partySignUpStatus` alongside other data

**End-of-Year Survey:**
- `const SURVEY_OPEN = true` — currently open; set to `false` and redeploy to close
- `getSurveySheet()` — get/create "Survey 2026" sheet
- `getSurveyStatus(mcpsId)` — returns `{surveyOpen, parentSubmitted, studentSubmitted}`; included in `lookupStudentByMcpsId` response as `surveyStatus`
- `submitSurveyResponse(mcpsId, role, answers)` — validates role, duplicate-checks by (MCPS ID + role), appends row; returns `{success, message}`
- `getSurveySummary()` — returns tallies for all multiple-choice fields; used by `?survey=1` Survey Results page. Column indices updated for new schema: satisfaction(49), childAttitude(50), commFrequency(63), meetingFormat(36), mathConfidence(39), mathEnjoyment(40), clubSize(41), coachAttention(42), membershipGate(45), compGate(46), carderockAlloc(47), coachRatio(55), websiteUsefulness(56), portalUsefulness(57)
- **Survey bonus entries:** each submitted role (student or parent) adds +1 drawing entry for that student

**Club Awards Voting:**
- `const VOTING_OPEN = new Date() < new Date('2026-06-04T00:00:00-04:00')` — auto-closes midnight June 3 EDT
- `const VOTING_PUBLISHED = new Date() >= new Date('2026-06-04T00:00:00-04:00')` — auto-publishes June 4
- `getVotesSheet()` — get/create "Votes 2026" sheet (cols: Timestamp, VoterMcpsId, mvp, glue, calculator, darkhorse, rookie, leader, highschool)
- `getVotingPool()` — returns `{open, sixth, seventh, eighth}` candidate arrays filtered by grade; uses Attendance Records (slice(2) to skip both header rows) + Form Responses 1/2 for grade enrichment
- `getVotingStatus(mcpsId)` — returns `{votingOpen, hasVoted, currentPicks, votingPublished}`; `currentPicks` maps category key → `{mcpsId, name}` with names resolved from attendance
- `submitVote(mcpsId, picks)` — gates on VOTING_OPEN; validates open-category uniqueness; updates existing row or appends new one (allows vote changes while voting is open)
- `getVoteResults()` — tallies all votes per category; always available to CertDraw teacher view regardless of VOTING_PUBLISHED
- `getStudentVotingTitle(mcpsId)` — returns `{title, emoji}` of winning category if VOTING_PUBLISHED; null otherwise
- 7 categories defined in `VOTE_CATEGORIES` constant: MVP/Glue/Calculator/DarkHorse (open pool), Rookie (6th), Leader (7th), HighSchool (8th)
- `lookupStudentByMcpsId` returns `votingStatus` and `votingTitle` alongside other data

**MOEMS awards:** columns O=SilverPin (18–22), P=Patch (8–25), Q=HighAchievement (team 148–175); shown as badge chips in portal and year record

**AMC 8 sheet columns:** A=Name, B=MCPS ID, C=Grade, D=Score(/25), E=Registered (checkbox), F=PDF score report link, G=Young Women in Mathematics Award (any truthy value); YWM award shown as purple badge in portal and year record for Ella Shang and Joyce Shang (2026)

**Math Kangaroo:** name-based lookup (col A); no scores available (individual accounts only); national/state winners released ~June 1 — add col F=Award if needed

**Math League — regional recognition:** hardcoded in portal and year record — any student on a Varsity team (team name not starting with "JV") at Meet #3 (meetIndex 2) sees "🏆 Region 1 Meet #3 Winners" (Hallie Wells won Region 1 Meet #3 with avg 49.667)

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

**Math Kangaroo**: Always shown. If registered: green checkmark, MK ID, username/password; links to answer key (Drive PDF), results/rankings at mathkangaroo.us, and [National and State Winners List](https://mathkangaroo.org/mks/national-and-state-winners/). If not: yellow alert with invitation code `MDCLARK0003001@2026math`, fee info ($18/$35 late), competition date.

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

**☀️ Summer Certificate Drawing** (shown to all students; appears just below the Club Awards vote card):
- All students see this section — not gated by Noetic sign-up
- Noetic participants: gold entry-count banner showing `baseEntry (1) + ponEntries`; per-range standings table (⭐ = ranges where they currently lead); link to Prime or Not game
- Non-Noetic with entries: same banner but `baseEntry = 0`; entry count = ranges led only
- Non-Noetic with 0 entries: amber "no entries yet" message + play button
- Already won: green trophy banner + green "📄 View Your Certificate" button linking to their Google Drive PDF (from `certLink`)
- All certs drawn: gray "all certificates drawn" message

**📋 End of Year Survey** (shown when `SURVEY_OPEN = true` in Code.js, or always when `?surveyPreview=1`):
- Appears after the Party RSVP section; Required Forms moved to bottom of page (registration period over)
- Parent / Student role toggle — each role submits independently; one submission per (MCPS ID + role) enforced server-side
- Default tab: Parent; auto-switches to Student if parent already submitted but student hasn't
- **8th grade detection:** `is8th = /^8/.test(gradeLevel)` — handles "8th grade", "8", "8th" etc.
- **`SURVEY_PREVIEW`** is injected as a string (`'true'`/`'false'`) and compared with `=== 'true'` to avoid truthy-string bug

**Student survey — question order:**
1. Favorite activity or competition (open text)
2. What would you change (open text)
3. **Competition block** — all 8 competitions (MATHCOUNTS, MOEMS, MCPS Math League, Math Kangaroo, AMC 8, Noetic, Purple Comet, Carderock):
   - `done` flag: `!!result.mathcounts` etc.; Noetic: `result.noetic.signedUp`; Purple Comet: `result.purpleComet.myTeam`; Carderock: `result.carderock.signedUp`
   - Participated → 1–5 star rating + prep question (Yes/Somewhat/No) + optional feedback; MATHCOUNTS card also asks about chapter selection method; Math League card asks about team formation
   - Not participated → why not (Not interested / Schedule conflict / Missed sign-up / Felt unprepared / Other open text)
4. Math confidence (Much more confident → Less confident)
5. Math enjoyment (Yes definitely → Less than before)
6. Meeting format radio (More competition prep / Keep current balance / More games)
7. Club size (Too small / About right / A bit large / Too large)
8. Coach attention (Yes plenty / Somewhat / No)
9. **Policy questions:** club membership try-out / competition sign-up gate / Carderock allocation
10. **Looking ahead:** 6th/7th → returning Yes/No/Maybe; 8th → high school text + coaching interest (Yes/Maybe reveals WhatsApp phone)
11. Words of wisdom (8th graders only, open text)
12. General suggestions

**Parent survey — question order:**
1. **Overall experience:** overall satisfaction (⭐ 1–5) → child attitude → personalized time commitment (uses `result.attendance.dates.length` + competition list)
2. **Competitions:** worthwhile checkboxes (participated) → wish participated checkboxes → suggest new → MATHCOUNTS selection method (if participated) → Math League team formation (if participated)
3. **Information channels:** website usefulness → portal usefulness → WhatsApp communication frequency → communication topics
4. **Planning:** expenses (t-shirt / printing / snacks / special events / celebration, each Yes/Maybe/No) → what would you change
5. **Policy:** club membership try-out → competition sign-up gate → Carderock allocation → coach ratio
6. **Looking ahead:** 8th → coach support; 6th/7th → returning + volunteer (Yes/Maybe reveals phone)
7. **Wrap-up:** general suggestions → how they heard about math club (checkboxes)

- Submit → server-side duplicate check → success refreshes portal via `lookupStudent()`
- **Survey 2026 sheet schema:** Timestamp, MCPS ID, Student Name, Role, Returning, CoachingInterest, WhatsAppPhone, VolunteerInterest, VolunteerPhone, CoachingSupport, then per-competition student columns (Rating/Prep/Feedback/NotDone × 8), then general: SuggestedCompetitions, MeetingFormat, FavoriteActivity, WhatChange, MathConfidence, MathEnjoyment, ClubSize, CoachAttention, MATHCOUNTS_Selection, MathLeague_Teams, MembershipGate, CompGate, CarderockAlloc, WordsOfWisdom, Satisfaction, ChildAttitude, HowJoined, TimeCommitment, WorthwhileContests, WishParticipated, CoachRatio, WebsiteUsefulness, PortalUsefulness, Exp_TShirt/Printing/Snacks/Events/Celebration, CommFrequency, CommTopics, Suggestions

**Carderock** (deadline April 13, 2026; 8 spots max; contest May 1, 2026):
- Before deadline + not signed up: "Indicate Interest" → security acknowledgement modal
- Post-contest (signed up): single green card showing team + score tiles (Sprint/30, Target/16, Individual/46, Indiv.Rank, TeamRound/20, TeamScore/64, TeamRank) + Score Report link + Permission Slip link
- Max scores same as MATHCOUNTS: hardcoded in portal and year record
- `signUpDate` stored as string (not Date) to avoid Apps Script serialization issues

**☀️ Summer Certificate Drawing — survey bonus entries:**
- Completing student survey: +1 drawing entry; completing parent survey: +1 more (max +2 per student)
- `getCertDrawPool()` reads "Survey 2026" sheet and adds `surveyBonus` count to each pool entry
- CertDraw pool table shows "survey ×1" or "survey ×2" in the entry breakdown column

**🏅 Year Record Certificate** (`buildStudentYearRecord(result, contests)` in Checkin.html):
- Shown on student tab when `studentDone = true` OR `VOTING_PREVIEW = true`
- Sections: header (school name, 2025–2026) → student name/grade → achievement badges → voted title (if VOTING_PUBLISHED) → club meetings count → competition results → footer + print button
- **Achievement badges:** 🌱 Founding Member (everyone), 📅 Regular Attendee (15+ meetings), ⭐ Dedicated Member (25+), 🎽 Competitor (1–3 competitions), 🏆 Multi-Sport (4–6), 🥇 Full Competitor (all 7 open competitions excluding Carderock)
- **Voted title:** shown if `result.votingTitle` is non-null (requires VOTING_PUBLISHED = true)
- **Print button:** opens a new window with only the year record HTML; `.no-print` elements (links) are stripped from print output
- **`VOTING_PREVIEW`** template variable: `?votingPreview=1` shows voting form regardless of VOTING_OPEN

## Certificate Drawing Teacher Interface (`CertDraw.html`)

Served at `[production URL]?certdraw=1`. Teacher-only projected drawing screen (brown/gold color scheme). Drawing only — survey and votes tabs removed.

**Top bar:** certificates remaining pill + eligible student count + total entry count.

**Drawing:**
- "Spin the Wheel" button → fetches live pool from `getCertDrawPool()` → pre-picks winner (weighted random, proportional to entries) → canvas wheel spins ≥ 2 full rotations with tick sounds (pitch rises/falls with speed) → decelerates and lands on winner → ascending fanfare plays → winner banner pops in → "Confirm Winner" button → calls `recordCertWinner()` → status bar shows cert number + clickable Drive link.
- Wheel rendering: each student's slice proportional to entry count; color-coded dots in pool table match slice colors; first name on each slice; labels clipped to wedge.
- Entry pool table: Student | Entries | Ranges Leading — sorted by entries desc.
- Winners list: previous winners shown as gold chips at bottom.

## Survey Results Page (`SurveyResults.html`)

Served at `[production URL]?survey=1`. Standalone page showing end-of-year survey tallies.
- Response counts (total / parent / student) + last-refreshed timestamp + Refresh button
- Bar-chart tally cards grouped by: Overall Experience (Parent), Student Responses, Club Policy Questions
- Uses `getSurveySummary()` backend function

## Year-End Party Slides (`PartySlides.html`)

Served at `[production URL]?party=1`. Full-screen projected slides for the June 4 year-end party. Hardcoded stats: `totalMeetings=55`, `contentWeeks=28`, `competitionsOffered=8`.
- Data loaded on startup via `getPartySlideData()` (batch function reading all competition/attendance sheets) + `getVoteResults()` + PON leaderboard API fetch
- Navigation: arrow keys, spacebar, or click to advance
- **Drawing slide:** embedded spinning wheel (same wheel/audio as CertDraw) — spin, confirm saves winner and refreshes pool, spin again for next drawing; cert winners slide rebuilds automatically; PON slide also refreshes after each draw
- **Cert winners slide:** shows drawing winners + a note that all other students receive a 25% off coupon (distributed at the party)
- **Badge slides:** name chips animate in with staggered pop-in (60ms stagger)
- **Competition highlights:** MATHCOUNTS, Math League, AMC 8, MOEMS, Noetic, Purple Comet (hardcoded: Comet Spiral — 2nd place High School Mixed Team, 23/30, Ella Shang + students from Longfellow & H-B Woodlawn), Carderock (hardcoded: Arjun Lakshmanan — Countdown Round); no Math Kangaroo slide
- **Completionists slide:** hardcoded — Arjun Lakshmanan & Fariq Molla (all 8 competitions including Carderock); appears after Full Competitors badge slide
- **Award reveals:** 2 slides per award — intro slide (category + description) then reveal slide (winner pops in + fanfare plays automatically); `awardStartIdx` set dynamically in `buildSlides()` so slide count changes don't break it
- **Parent thank you slide:** name chips animate in, then closing "every math club parent" message fades in after (~0.9s delay)
- **8th grade sendoff:** names + high schools from survey responses; high school names normalized (`normalizeHighSchool()`) — Clarksburg HS, Poolesville HS, Damascus HS; others shown as-is
- **PON leaderboard slide:** shows preset ranges (1–20, 21–40, 41–60, 61–80, 81–100) only; fetches live from PON API

`getPartySlideData()` returns: stats, badges (dedicated/regular/fullCompetitor/multiSport/competitor), recognitions (mcTeam, mcIndividual, mcState, mathLeagueMeet3Teams grouped by team, ywmAward, noeticHM/NHR/TeamW, moemsHA/Pin/Patch), eighthGraders (with highSchool from survey), certWinners

**Competition participation counting** (used for badge logic in `getPartySlideData()` and `done` flags in the portal `contests` array):

| Competition | Counts as competed when… |
|---|---|
| MATHCOUNTS | Row exists in sheet (proctored exam) |
| MOEMS | ≥1 of 5 contest scores (cols D–H) is a number — all-NA students excluded |
| Math League | ≥1 of 4 individual meet scores (cols F/H/J/L) is a number — all-NA students excluded |
| Math Kangaroo | Row exists in sheet (registration = participation; no scores available) |
| AMC 8 | Score (col D) is a number 0–25; NA/blank excluded; score=0 is valid |
| Noetic | `signedUp = true` (sign-up = participation) |
| Purple Comet | Row exists with `role ≠ 'invited'` (excludes pending invites) |
| Carderock | Signed up (field trip — signed up = attended) |

Badges: 🥇 Full Competitor = all 7 open competitions (excludes Carderock); 🏆 Multi-Sport = 4–6; 🎽 Competitor = 1–3. AMC 8 `score=0` bug fixed: `getAmc8Results()` uses explicit null-check instead of falsy check.

## `doGet()` URL Routing

| Parameter | Handler |
|-----------|---------|
| `?action=lookupStudentForPON&id=<mcpsId>` | Returns `{success, name}` JSON — called by Prime or Not game |
| `?action=signUpNoetic&...` | Noetic sign-up |
| `?action=updateNoeticGradePreference&...` | Grade preference update |
| `?action=signUpCarderock&...` | Carderock sign-up |
| `?action=dropCarderock&...` | Carderock drop |
| `?certdraw=1` | Serves `CertDraw.html` — drawing interface only |
| `?survey=1` | Serves `SurveyResults.html` — standalone survey tally page |
| `?party=1` | Serves `PartySlides.html` — year-end party slides |
| `?kiosk=1` | Serves `Kiosk.html` |
| `?surveyPreview=1` | Serves `Checkin.html` with survey + year record visible (bypasses `SURVEY_OPEN`) |
| `?votingPreview=1` | Serves `Checkin.html` with voting section visible (bypasses `VOTING_OPEN`) |
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
