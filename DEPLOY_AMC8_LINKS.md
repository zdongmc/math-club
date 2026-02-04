# Quick Deployment Guide - AMC 8 Score Report Links

**Status**: Code ready, manual deployment needed
**Time Required**: ~10 minutes

---

## One-Time Setup (Already Done)
- ✅ Google Drive folder created with 49 PDF files
- ✅ Code updated with PDF link functionality
- ✅ Changes committed to GitHub (commit: `58c8710`)

---

## Deploy to Production (YOU DO THIS NOW)

### Step 1: Copy Updated Code to Apps Script
```
1. Go to: https://script.google.com/home
2. Open project: Math Club Parent Portal (ID: 1fif0wIdKDZQUjJgFaf-SOEDj60OqNz2pKXWezwpZlGlmJrqubXTBIZ2i)
3. Open Code.js tab
4. Copy from GitHub: https://github.com/zdongmc/math-club/blob/main/math-club-attendance/Code.js
5. Replace EVERYTHING in Code.js with the new code
6. Save (Ctrl+S or Cmd+S)
```

### Step 2: Copy Updated HTML to Apps Script
```
1. Open Checkin.html tab in same Apps Script project
2. Copy from GitHub: https://github.com/zdongmc/math-club/blob/main/math-club-attendance/Checkin.html
3. Replace EVERYTHING with the new code
4. Save (Ctrl+S or Cmd+S)
```

### Step 3: Create New Deployment
```
1. Click "Deploy" button (top right)
2. Click "New deployment"
3. Select Type: "Web app"
4. Click "Deploy"
5. Go back to "Manage deployments"
6. Find existing deployment (ends in ...Y9udIEskvIMJ)
7. Click pencil icon to edit
8. Select "New version" dropdown
9. Add description: "Add AMC 8 score report PDF links"
10. Click "Deploy"
```

---

## Test It Works

### Test Case 1: Student WITH Score
```
1. Open parent portal URL
2. Enter MCPS ID of a student with AMC 8 score
3. Expected:
   - See AMC 8 section
   - Score shows (e.g., "Your Score: 22 out of 25")
   - Blue "📄 Download Score Report" button appears
   - Click button → PDF opens in new tab
```

### Test Case 2: Student WITHOUT Score
```
1. Enter MCPS ID of a student with no AMC 8 score
2. Expected:
   - See AMC 8 section
   - Shows "No score recorded yet."
   - NO download button
```

---

## Files Modified

| File | Location | Status |
|------|----------|--------|
| Code.js | math-club-attendance/ | ✅ Updated |
| Checkin.html | math-club-attendance/ | ✅ Updated |

---

## What Changed

### Code.js
- Added: `const AMC8_FOLDER_ID = '1wRU08nJSVcSy2ed3blxepkVj1BmyU6ru'`
- Added: `getAMC8ScoreReportLink(firstName, lastName)` function
- Updated: `getAmc8Results()` to return score from spreadsheet
- Updated: `lookupStudentByMcpsId()` to fetch PDF link

### Checkin.html
- Simplified: AMC 8 section (no more registration checks)
- Changed: Only shows score if it exists in spreadsheet
- Added: "📄 Download Score Report" button when PDF available

---

## If Something Goes Wrong

### Symptoms
- AMC 8 section not showing
- "Download Score Report" button missing
- PDF link not working

### Solution
1. Go to Apps Script → "Manage deployments"
2. Click pencil on the problematic deployment
3. Revert to previous version
4. Document the error

---

## Before You Deploy

Verify:
- [ ] You have access to Google Apps Script project
- [ ] Google Drive folder exists with 49 PDFs
- [ ] Student names match PDF filenames
- [ ] You have a few student MCPS IDs to test with
- [ ] You know the current deployment ID (...Y9udIEskvIMJ)

---

## After Deployment

Send to parents:
- "Your child's AMC 8 score report is now available in the parent portal!"
- "Just log in with your MCPS ID and click the blue 'Download Score Report' button"

---

**Estimated Time**: 10 minutes
**Difficulty**: Easy (copy-paste code)
**Risk**: Low (can rollback to previous version)

Good luck! 🎉
