# Algebra Kitchen - Quick Start Guide

**Status**: Frontend ✅ Ready | Backend ⏳ Needs Deployment

---

## TL;DR

1. **Frontend**: Already done and in `/docs/` - ready for GitHub Pages
2. **Backend**: Requires 1-2 hours of setup
3. **Files**: All code is in `mathdetective/algebra-kitchen*` directories

---

## What Works Right Now (No Backend)

✅ Complete game is playable
✅ All 10 problems generate correctly per session
✅ Star calculation works
✅ Results screen displays
✅ Offline mode works fine

Just visit `docs/algebra-kitchen.html` and play!

---

## What Needs Backend Deployment

⏳ **Persistent score storage** - scores disappear on reload
⏳ **Cross-session access** - can't see previous star ratings
⏳ **Production use** - students expect their progress to save

---

## Deploy Backend (1-2 hours)

### Step 1: Create Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click **+ New project**
3. Name it: `Algebra Kitchen Backend`
4. **Save the Script ID** you're given

### Step 2: Copy Code
1. Open `mathdetective/algebra-kitchen-backend/Code.js`
2. Copy entire file
3. Paste into Apps Script editor, replacing existing code
4. Save

### Step 3: Update Config
1. In Apps Script, click **Project Settings**
2. Copy the **Project ID**
3. Open `mathdetective/algebra-kitchen-backend/.clasp.json`
4. Update:
   ```json
   {
     "scriptId": "YOUR_SCRIPT_ID_HERE",
     "projectIdSettings": {
       "projectId": "YOUR_PROJECT_ID_HERE"
     }
   }
   ```

### Step 4: Deploy
1. In Apps Script editor, click **Deploy** → **New deployment**
2. **Type**: Select "Web app"
3. **Execute as**: Your email (sheet owner)
4. **Who has access**: Anyone (no login required)
5. Click **Deploy**
6. **Copy the deployment URL** (looks like: `https://script.google.com/macros/s/ABC123/exec`)

### Step 5: Connect Frontend
1. Open `docs/algebra-kitchen.html`
2. Find line ~1169:
   ```javascript
   const ALGEBRA_KITCHEN_URL = 'https://script.google.com/macros/s/PLACEHOLDER/exec';
   ```
3. Replace `PLACEHOLDER` with your deployment ID (the `ABC123` part)
4. Also update `mathdetective/algebra-kitchen.html` with the same URL

### Step 6: Test
1. Visit `docs/algebra-kitchen.html`
2. Login with a Certified Chef's MCPS ID
3. Complete a test (80%+ to pass)
4. Check Google Sheet: `https://docs.google.com/spreadsheets/d/1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI`
5. New "Algebra Kitchen" tab should have your score

---

## Verify It Works

### Test Case 1: Non-Certified Chef
- MCPS ID: (someone who hasn't completed Training Kitchen)
- Expected: Locked screen
- ✅ Pass if locked screen appears

### Test Case 2: Certified Chef
- MCPS ID: (someone with all 5 Training Kitchen modules done)
- Expected: Dashboard with stars
- ✅ Pass if dashboard loads

### Test Case 3: Score Saving
- Complete test with 8/10 (pass)
- Expected: Stars awarded (1-3 depending on time)
- Check Google Sheet for saved stars
- ✅ Pass if visible in sheet

---

## File Locations

```
docs/
  └── algebra-kitchen.html            ← Copy this to browser

mathdetective/
  ├── algebra-kitchen.html            ← Same file, local copy
  └── algebra-kitchen-backend/
      ├── Code.js                     ← Copy to Apps Script
      ├── appsscript.json             ← Copy to manifest
      ├── .clasp.json                 ← Update with Script ID
      └── README.md                   ← Detailed instructions
```

---

## Troubleshooting

### "Locked screen always appears"
**Problem**: Backend is returning "Not Certified Chef"
**Solution**: Verify student has all 5 Training Kitchen modules (columns C-G) filled in Training Kitchen sheet

### "Scores not saving"
**Problem**: Backend deployment URL not updated in frontend
**Solution**: Check `ALGEBRA_KITCHEN_URL` constant is correct deployment URL

### "Google Sheet not created"
**Problem**: First time running, sheet might not exist
**Solution**: This should auto-create. If not, run `initializeAlgebraSheet()` in Apps Script console

### "CORS errors"
**Problem**: Old browser or CORS issue
**Solution**: Apps Script handles this - should work in all modern browsers

---

## Data Location

**Spreadsheet**: https://docs.google.com/spreadsheets/d/1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI

**Sheets used**:
- `Roster` - student names & MCPS IDs (read-only)
- `Training Kitchen` - module completion (read-only, checked for Certified Chef)
- `Algebra Kitchen` - star ratings (auto-created if missing)

---

## What Each File Does

| File | Purpose |
|------|---------|
| `algebra-kitchen.html` | The game itself - login, lesson, practice, test, results |
| `Code.js` | Backend functions - lookup student, check if Certified Chef, save stars |
| `appsscript.json` | Configuration - sets public access |
| `.clasp.json` | Deployment config - maps to your Apps Script project |
| `README.md` | Full deployment guide with all details |
| `ALGEBRA_KITCHEN_STATUS.md` | Detailed status of entire project |

---

## How Stars Work

**Formula**:
- Accuracy = (correct / 10) × 100%
- Speed = max(0, 1 - (time in ms / 600000)) × 100%
  - 0 sec = 100% speed bonus
  - 10 min = 0% speed bonus
- Combined = (Accuracy × 0.6) + (Speed × 0.4)

**Awards**:
- Combined ≥ 0.85 → **3 stars** ⭐⭐⭐
- Combined ≥ 0.72 OR 100% accuracy → **2 stars** ⭐⭐☆
- Combined < 0.72 → **1 star** ⭐☆☆
- (Minimum 1 star on any pass ≥ 80%)

**Update rule**: Only saves if newStars > currentStars (keeps best score)

---

## Features Summary

### Login & Access
- MCPS ID validation
- Certified Chef check (requires Training Kitchen completion)
- Locked screen for unqualified students

### Learning
- 5-step lesson with worked examples
- Substitution method
- Elimination method

### Practice
- 10 problems with hints
- Immediate feedback
- Progress tracking

### Testing
- 10 problems, no hints
- Millisecond timer
- 80% pass threshold
- Auto-save to Google Sheet

### Rating
- 1-3 stars based on speed + accuracy
- Only updates if better than previous
- "New best!" celebration message

---

## Keyboard Support

- **Enter**: Submit answer / Next problem
- **Tab**: Move between fields

---

## Mobile Support

✅ Fully responsive
✅ Touch-friendly buttons
✅ Single column layout at 768px and below

---

## Browser Requirements

Works in:
- ✅ Chrome / Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

Does NOT require:
- ✅ Any external libraries
- ✅ Special plugins
- ✅ Server setup (pure client-side + Google Apps Script)

---

## Next Steps

1. **Now**: Frontend is ready - can commit to GitHub
2. **When ready**: Follow deployment guide above for backend
3. **After deploy**: Test with sample students
4. **Then**: Announce to club members

---

## Contact

Questions? Check:
1. `ALGEBRA_KITCHEN_STATUS.md` - comprehensive status
2. `mathdetective/algebra-kitchen-backend/README.md` - detailed deployment
3. Inline code comments - specific implementation details

---

**Ready to deploy? Start with Step 1 above!** ⬆️
