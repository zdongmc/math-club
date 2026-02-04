# Quick Deployment Guide - AMC 8 Score Report Links

**Status**: ✅ Deployed and working
**Last Updated**: February 4, 2026

---

## Completed Setup
- ✅ Google Drive folder created with 49 PDF files
- ✅ Code updated to read PDF links from spreadsheet
- ✅ Changes committed to GitHub
- ✅ Deployed to live parent portal (version @82)

---

## How It Works

## Implementation Details

### Spreadsheet Setup
The AMC 8 tab in the Google Sheet contains:
- **Column A**: Student Name
- **Column B**: MCPS ID
- **Column C**: Grade
- **Column D**: Score (out of 25)
- **Column E**: (unused)
- **Column F**: PDF Link (direct Google Drive link to individual PDF)

Example:
```
Name          | ID     | Grade | Score | E | PDF Link
Nathaniel Lam | 190949 | 6     | 16    |   | https://drive.google.com/file/d/1uw7c3eQnEYGK3jPBs90slHckmc8MbZLO/view?usp=drive_link
```

### Backend (Code.js)
The `getAmc8Results(mcpsId)` function:
1. Searches AMC 8 tab for student by MCPS ID (Column B)
2. Reads score from Column D
3. Reads PDF link from Column F
4. Returns both score and pdfLink to frontend

### Frontend (Checkin.html)
The AMC 8 section:
1. Displays score if it exists: "Your Score: 16 out of 25"
2. Shows download button if PDF link exists
3. Button opens PDF in new browser tab (not forced download)
4. Shows "No score recorded yet" if no score in spreadsheet

---

## Files Modified

| File | Location | Status |
|------|----------|--------|
| Code.js | math-club-attendance/ | ✅ Updated |
| Checkin.html | math-club-attendance/ | ✅ Updated |

---

## What Changed

### Code.js
- Updated: `getAmc8Results()` now reads both score (Column D) and PDF link (Column F) from spreadsheet
- Updated: `lookupStudentByMcpsId()` includes AMC 8 results (score + link) in response

### Checkin.html
- AMC 8 section displays score if it exists: "Your Score: X out of 25"
- Shows "📄 Download Score Report" button when PDF link is available
- Button opens PDF in new browser tab
- Shows "No score recorded yet." if no score in spreadsheet

---

## Maintaining the Solution

### Adding New Scores
1. Add student name and MCPS ID to AMC 8 spreadsheet (Columns A & B)
2. Enter score in Column D
3. Enter PDF link in Column F (direct Google Drive link)
4. Save - changes appear immediately in parent portal

### Updating an Existing Score
1. Update the score in Column D
2. Update the PDF link in Column F if needed
3. Save - parent portal reflects changes instantly

### Removing a Score
1. Delete the score from Column D
2. Clear the PDF link from Column F
3. Save - "No score recorded yet" message will appear

---

## Troubleshooting

### PDF Link Not Showing
- **Check**: Is Column F populated with a valid Google Drive link?
- **Check**: Is the link in format: `https://drive.google.com/file/d/FILE_ID/view?usp=...`
- **Fix**: Add or correct the link in Column F

### Score Not Showing
- **Check**: Is the score entered in Column D?
- **Check**: Does the MCPS ID in Column B match what the parent enters?
- **Fix**: Add the score and verify the student ID is correct

### Wrong Score Showing
- **Check**: Are there duplicate MCPS IDs in the sheet?
- **Fix**: Delete duplicate rows, keep only one entry per student

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

## Questions Answered

**Q: Why does the PDF open in the browser instead of downloading?**
A: This is the standard Google Drive behavior. Users can save/download from the browser's menu if needed.

**Q: Can students see other students' reports?**
A: No - each parent only sees their child's data based on MCPS ID lookup.

**Q: What if a student doesn't have a PDF link yet?**
A: The download button won't appear until Column F is populated with a link.

**Q: Do I need to redeploy after updating the spreadsheet?**
A: No - changes appear immediately in the parent portal. Just save the spreadsheet.

**Q: What if there are duplicate MCPS IDs?**
A: The first match found will be returned. Keep MCPS IDs unique in the spreadsheet.

---

## Google Drive Folder Reference
- **Location**: https://drive.google.com/drive/folders/1wRU08nJSVcSy2ed3blxepkVj1BmyU6ru
- **Contains**: 49 individual AMC 8 score report PDFs
- **Note**: Links to individual PDFs are stored in Column F of the spreadsheet

---

**Status**: ✅ Live and working (version @82)
**Last Tested**: February 4, 2026
