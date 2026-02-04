# Algebra Kitchen Backend - Deployment Guide

## Overview

The Algebra Kitchen backend is a separate Google Apps Script project that handles student progress tracking for the Algebra Kitchen game. It uses the same Google Sheet as Training Kitchen and checks whether students have completed all 5 Training Kitchen modules before allowing access to Algebra Kitchen.

## Setup Instructions

### Step 1: Create a New Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **+ New project**
3. Name it: `Algebra Kitchen Backend`
4. You'll be given a new **Script ID** (save this!)

### Step 2: Copy Code Files

1. Copy all files from this directory to your new Apps Script project:
   - **Code.js** → paste into the script editor
   - **appsscript.json** → replace the manifest file

### Step 3: Update .clasp.json

1. In `.clasp.json`, replace:
   - `PLACEHOLDER_SCRIPT_ID` with your new Script ID
   - `PLACEHOLDER_PROJECT_ID` with your Google Cloud Project ID

2. Run in terminal from this directory:
   ```bash
   clasp push --force
   ```

### Step 4: Deploy as Web App

1. In Google Apps Script editor, click **Deploy** → **New deployment**
2. Select **Type**: Web app
3. Configure:
   - **Execute as**: (your email) - the account that owns the spreadsheet
   - **Who has access**: Anyone (no login)
4. Click **Deploy** and copy the deployment URL

### Step 5: Update Frontend URL

1. Open `/Users/goldie/workspace/math-club/docs/algebra-kitchen.html`
2. Find this line:
   ```javascript
   const ALGEBRA_KITCHEN_URL = 'https://script.google.com/macros/s/PLACEHOLDER/exec';
   ```
3. Replace `PLACEHOLDER` with your deployment ID (the part between `/s/` and `/exec`)
4. Save the file

4. Also update `/Users/goldie/workspace/math-club/mathdetective/algebra-kitchen.html` with the same URL

### Step 6: Verify the Google Sheet

Confirm the spreadsheet at `https://docs.google.com/spreadsheets/d/1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI` has:

- **Roster** sheet with columns: Name, MCPS ID
- **Training Kitchen** sheet with columns: Name, MCPS ID, Module 1-5 (completion dates)
- **Algebra Kitchen** sheet (will be created automatically) with columns: Name, MCPS ID, Dish 1 Stars

## How It Works

### `getAlgebraProgress(mcpsId)`
- Looks up student in Roster
- Checks if all 5 Training Kitchen modules are completed (Certified Chef status)
- Returns current star rating for Dish 1 (0 if none)
- **Returns locked screen if not Certified Chef**

### `recordAlgebraProgress(mcpsId, dish, stars)`
- Records the star rating (1-3) for a dish
- **Only updates if `newStars > currentStars`** (keeps best rating)
- Prevents duplicate or lower scores from overwriting better ones

### `isCertifiedChef(mcpsId)`
- Checks if student has non-empty values in columns C-G (all 5 modules)
- Returns true only if ALL modules are complete

## Testing

### Offline Mode
- If the backend isn't deployed yet, the frontend works in **offline mode**
- No scores are saved, but students can still play and practice
- Once backend is live, scores auto-save without any frontend changes

### Manual Testing
Run this in Google Apps Script console after deployment:
```javascript
Logger.log(getAlgebraProgress('1013986')); // Use a real MCPS ID
```

Expected response (if not Certified Chef):
```json
{
  "success": false,
  "message": "Complete Training Kitchen first!"
}
```

Expected response (if Certified Chef, no prior scores):
```json
{
  "success": true,
  "studentName": "Jane Doe",
  "mcpsId": "1013986",
  "isCertifiedChef": true,
  "dish1Stars": 0
}
```

## Important Notes

- **Shared Spreadsheet**: Uses the same Google Sheet as Training Kitchen (`1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI`)
- **No External Dependencies**: Pure Google Apps Script, no libraries required
- **Public Access**: Set to "Anyone (no login)" so parents can't interfere with deployment
- **Automatic Sheet Creation**: If "Algebra Kitchen" tab doesn't exist, it's created on first use

## Deployment URL Format

Once deployed, your URL will look like:
```
https://script.google.com/macros/s/AKfycbw...../exec
```

Update the frontend constant:
```javascript
const ALGEBRA_KITCHEN_URL = 'https://script.google.com/macros/s/AKfycbw...../exec';
```

## Data Quality Verification

Before deploying, ensure:
- ✅ All student names match exactly between sheets (case-sensitive spelling)
- ✅ MCPS IDs are consistent across sheets
- ✅ Training Kitchen Module 1-5 columns (C-G) have completion dates for all Certified Chefs
- ✅ No parent names accidentally in the Roster

## Version History

- **v1.0** - Initial deployment for Dish 1: Systems of Equations
- Future: Additional dishes will add columns D, E, etc. to Algebra Kitchen sheet

## Contact

For issues or questions, contact: zdongmc@gmail.com
