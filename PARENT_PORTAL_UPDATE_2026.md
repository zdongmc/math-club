# Parent Portal Update - AMC 8 Score Reports

**Deployment Date**: February 4, 2026
**Status**: ✅ Code committed to GitHub, ready for Apps Script deployment

---

## What Changed

The parent portal now displays AMC 8 score reports with direct download links for individual students.

### Before
- ❌ No way for parents to access their child's AMC 8 score report
- ❌ Scores only visible in spreadsheet

### After
- ✅ Parents can view scores in portal
- ✅ Direct link to download individual PDF score report
- ✅ Clean, simple interface (no more sign-up/registration checks)

---

## Features Added

### AMC 8 Section in Parent Portal
When a student has a score recorded in the AMC 8 spreadsheet tab:

1. **Score Display**
   - Shows: "Your Score: X out of 25"
   - Blue box for clear visibility

2. **Download Button**
   - "📄 Download Score Report" link
   - Opens PDF in new tab
   - Individual link (only their child's report)

3. **Privacy**
   - Each parent only sees their own child's report
   - No access to other students' reports

---

## Technical Implementation

### Backend Changes (`Code.js`)
1. **Added Google Drive folder reference**
   ```javascript
   const AMC8_FOLDER_ID = '1wRU08nJSVcSy2ed3blxepkVj1BmyU6ru';
   ```

2. **New function: `getAMC8ScoreReportLink(firstName, lastName)`**
   - Searches Google Drive folder for `{LastName}_{FirstInitial}AMC8ScoreReport.pdf`
   - Returns shareable Google Drive link
   - Pattern: `Smith_jAMC8ScoreReport.pdf` → `https://drive.google.com/file/d/{ID}/view`

3. **Updated `getAmc8Results(mcpsId)`**
   - Now returns the score from the AMC 8 tab (column E)
   - Simplified to only fetch score (no registration checks)
   - Returns: `{ score: 22 }`

4. **Updated `lookupStudentByMcpsId()`**
   - Calls `getAMC8ScoreReportLink()` when fetching AMC 8 results
   - Adds `pdfLink` to the result object
   - Logs errors gracefully if PDF not found

### Frontend Changes (`Checkin.html`)
1. **Simplified AMC 8 section**
   - Removed registration status checks
   - Removed registration link
   - Now shows score if it exists

2. **Added PDF download button**
   - Blue gradient button matching portal design
   - Opens in new tab
   - Only shows if PDF link is available

---

## Deployment Instructions

### Step 1: Update Apps Script
1. Go to [Google Apps Script](https://script.google.com/home)
2. Open the Math Club Parent Portal project (ID: `1fif0wIdKDZQUjJgFaf-SOEDj60OqNz2pKXWezwpZlGlmJrqubXTBIZ2i`)
3. Open the `Code.js` file
4. Replace entire contents with the updated code from GitHub:
   - Repository: https://github.com/zdongmc/math-club
   - File: `math-club-attendance/Code.js`
   - Latest commit: `58c8710`

### Step 2: Update HTML Template
1. In the same Apps Script project, open `Checkin.html`
2. Replace the AMC 8 section with updated code:
   - File: `math-club-attendance/Checkin.html`
   - Latest commit: `58c8710`

### Step 3: Deploy New Version
1. In Apps Script editor, click **Deploy** → **Manage deployments**
2. Find the existing deployment (ends with `...Y9udIEskvIMJ`)
3. Click the **Edit** (pencil) icon
4. Select **"New version"** from dropdown
5. Add description: "Add AMC 8 score report PDF links"
6. Click **Deploy**

### Step 4: Verify
1. Visit parent portal: [Deployment URL]
2. Enter a student MCPS ID who has an AMC 8 score
3. You should see:
   - AMC 8 section with score displayed
   - Blue "📄 Download Score Report" button
4. Click button → should open their PDF in new tab

---

## Data Locations

### Google Drive Folder
- **Location**: https://drive.google.com/drive/folders/1wRU08nJSVcSy2ed3blxepkVj1BmyU6ru
- **Contains**: 49 individual AMC 8 score report PDFs
- **Naming**: `{LastName}_{FirstInitial}AMC8ScoreReport.pdf`
- **Example**: `Smith_jAMC8ScoreReport.pdf`

### Google Sheet
- **Tab**: AMC 8
- **Columns**:
  - A: Name
  - B: MCPS ID
  - C: Grade
  - D: Unknown
  - E: Score (out of 25)

---

## Testing Checklist

After deployment, verify:

- [ ] **Student with score**: Login with a student MCPS ID who has an AMC 8 score
  - [ ] Score displays correctly (e.g., "Your Score: 22 out of 25")
  - [ ] Blue "Download Score Report" button appears
  - [ ] Click button opens PDF in new tab

- [ ] **Student without score**: Login with a student who has no score
  - [ ] Shows "No score recorded yet."
  - [ ] No download button appears

- [ ] **Wrong name format**: Verify student names match the PDF filenames
  - [ ] If PDF not found, button simply doesn't appear (graceful)

- [ ] **Privacy**: Verify only their child's report shows
  - [ ] Try multiple student IDs
  - [ ] Each should only get their own report

---

## Rollback Plan

If something goes wrong:

1. Go to Apps Script deployment settings
2. Select previous version (before this update)
3. Click Revert
4. Document what went wrong

---

## Future Enhancements

- Could add PDF preview in portal (currently just download link)
- Could add score history if multiple years tracked
- Could add comparison to class average

---

## Key Points

✅ **Simplification**: No more registration checks (AMC 8 is past)
✅ **Privacy**: Each parent only sees their child
✅ **User Experience**: One-click PDF access from portal
✅ **Graceful Handling**: Missing PDFs don't break anything
✅ **Easy Maintenance**: Folder-based system, no hardcoded links

---

## Questions

**Q: What if a student's PDF is missing?**
A: The download button simply won't appear. No error, no confusion.

**Q: Do I need to update the PDFs or folder?**
A: No, the PDFs in Google Drive are already organized and named correctly.

**Q: Can students see other students' reports?**
A: No - each parent gets an individual link to only their child's report.

**Q: What if a student takes AMC 8 again next year?**
A: Update the score in the AMC 8 tab, and the new link will appear automatically.

---

## Commit Details

- **Repository**: https://github.com/zdongmc/math-club
- **Commit**: `58c8710`
- **Files Changed**: 2 (Code.js, Checkin.html)
- **Lines Added**: 125
- **Lines Removed**: 78

---

## Deployment Status

| Step | Status | Notes |
|------|--------|-------|
| Code updated | ✅ Complete | Committed to GitHub |
| Google Drive setup | ✅ Complete | Folder ID added, PDFs uploaded |
| Backend function added | ✅ Complete | `getAMC8ScoreReportLink()` |
| Frontend updated | ✅ Complete | AMC 8 section simplified |
| Apps Script deployment | ⏳ Manual | See deployment instructions above |
| Testing | ⏳ Manual | Verify with sample students |

---

*Last updated: February 4, 2026*
