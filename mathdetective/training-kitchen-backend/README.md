# Training Kitchen Backend

Google Apps Script backend for the Training Kitchen math training game.

## Setup Instructions

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "Training Kitchen Progress"
3. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```

### 2. Create the Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/home)
2. Click **New Project**
3. Name it "Training Kitchen Backend"
4. Delete the default code and paste the contents of `Code.js`
5. **Important:** Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID from step 1
6. Also verify `PARENT_PORTAL_SHEET_ID` is correct for looking up students

### 3. Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - Description: "Training Kitchen API v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the Web app URL (it looks like `https://script.google.com/macros/s/ABC123.../exec`)

### 4. Update the HTML File

1. Open `mathdetective/training-kitchen.html`
2. Find the line: `const APPS_SCRIPT_URL = '...'`
3. Replace with your new Web app URL

### 5. Initialize the Sheet

1. In the Apps Script editor, select `initializeSheet` from the function dropdown
2. Click **Run**
3. This will create the "Progress" sheet with proper headers

## Using clasp (Optional)

If you prefer to manage the code locally:

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Clone this project (after creating it in the web UI)
clasp clone [SCRIPT_ID]

# Or create a new project
clasp create --title "Training Kitchen Backend" --type webapp

# Push changes
clasp push

# Deploy
clasp deploy
```

Create a `.clasp.json` file:
```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

## Data Structure

The Progress sheet has the following columns:

| Column | Content |
|--------|---------|
| A | Student Name |
| B | MCPS ID |
| C | Module 1: Basic Ops (completion date) |
| D | Module 2: Pre-Algebra (completion date) |
| E | Module 3: PEMDAS (completion date) |
| F | Module 4: Fractions (completion date) |
| G | Module 5: Balancing (completion date) |

## API Endpoints

All endpoints use GET requests with query parameters.

### Get Training Progress

```
?action=getTrainingProgress&mcpsId=123456
```

Returns:
```json
{
  "success": true,
  "studentName": "John Smith",
  "mcpsId": "123456",
  "progress": {
    "module1": "1/20/2026",
    "module2": null,
    "module3": null,
    "module4": null,
    "module5": null
  },
  "completedCount": 1,
  "chefLevel": "Prep Cook"
}
```

### Record Training Progress

```
?action=recordTrainingProgress&mcpsId=123456&module=1&passed=true
```

Returns:
```json
{
  "success": true,
  "message": "Module 1 completed!",
  "completionDate": "1/20/2026"
}
```
