# Prime or Not Leaderboard - Google Apps Script Setup

This directory contains the Google Apps Script backend for the Prime or Not game leaderboard.

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Prime or Not Leaderboard" (or any name you prefer)
4. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the `SPREADSHEET_ID_HERE` part

### 2. Create Google Apps Script Project

1. From your Google Sheet, go to **Extensions** → **Apps Script**
2. This will create a new Apps Script project linked to your sheet
3. Delete the default `Code.gs` content
4. Copy the entire content from `Code.js` in this directory
5. Paste it into the Apps Script editor
6. **IMPORTANT:** Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Spreadsheet ID from step 1

### 3. Initialize the Sheet

1. In the Apps Script editor, select the `initializeSheet` function from the dropdown
2. Click the **Run** button (▶)
3. You'll be prompted to authorize the script - click **Review permissions**
4. Choose your Google account
5. Click **Advanced** → **Go to [Project Name] (unsafe)** → **Allow**
6. The function will create a "Leaderboard" sheet with proper headers

### 4. Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description:** "Prime or Not Leaderboard API v1"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. Copy the **Web app URL** (it will look like: `https://script.google.com/macros/s/XXXXX/exec`)
7. Click **Done**

### 5. Update the Game HTML File

1. Open `prime-or-not.html` in a text editor
2. Find this line near the top of the `<script>` section:
   ```javascript
   const LEADERBOARD_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web app URL you copied in step 4
4. Save the file

### 6. Test the Leaderboard

1. Open `prime-or-not.html` in a web browser
2. Enter your name in the settings
3. Play the game
4. After completing a game, click **Submit to Leaderboard**
5. Click **View Leaderboard** to see your score

### Updating the Script (After Initial Deployment)

When you make changes to the Google Apps Script code:

1. Edit the code in the Apps Script editor
2. Save the file (Ctrl+S or Cmd+S)
3. Go to **Deploy** → **Manage deployments**
4. Click the **Edit** icon (pencil) next to your deployment
5. Change **Version** to **New version**
6. Add a description (optional)
7. Click **Deploy**

**Important:** The Web app URL remains the same - you don't need to update the HTML file again.

## Using Clasp (Optional - For Advanced Users)

If you prefer to manage the script from the command line using [clasp](https://github.com/google/clasp):

1. Install clasp globally:
   ```bash
   npm install -g @google/clasp
   ```

2. Login to your Google account:
   ```bash
   clasp login
   ```

3. Create a new Apps Script project or connect to existing one:
   ```bash
   cd mathdetective/prime-leaderboard
   clasp create --type standalone --title "Prime or Not Leaderboard"
   ```
   Or if connecting to existing project:
   ```bash
   clasp clone YOUR_SCRIPT_ID
   ```

4. Push your local code to Apps Script:
   ```bash
   clasp push
   ```

5. Deploy using the web UI (step 4 above)

## Spreadsheet Structure

The leaderboard sheet has the following columns:

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When the score was submitted |
| B | Player Name | Name entered by the player |
| C | Min Range | Minimum number in the range |
| D | Max Range | Maximum number in the range |
| E | Total Questions | Total number of questions answered |
| F | Correct | Number of correct answers |
| G | Incorrect | Number of incorrect answers |
| H | Accuracy % | Percentage of correct answers |
| I | Total Time (seconds) | Total time in seconds |
| J | Time Display | Formatted time (MM:SS) |

## Leaderboard Features

- **Range-specific leaderboards:** Each number range (e.g., 1-100, 1-200) has its own leaderboard
- **Sorting:** Scores are sorted by accuracy (descending), then by time (ascending)
- **Top 50:** Only the top 50 scores per range are displayed
- **Medal indicators:** Top 3 players get gold 🥇, silver 🥈, and bronze 🥉 medals
- **Security:** Player names are sanitized to prevent XSS attacks

## Troubleshooting

**Error: "Script not authorized"**
- Make sure you've authorized the script in step 3
- Check that the deployment is set to "Execute as: Me" and "Who has access: Anyone"

**Error: "Leaderboard not configured"**
- Verify that you've updated the `LEADERBOARD_API_URL` in the HTML file
- Make sure the URL is the Web app URL, not the script URL

**Scores not appearing**
- Check the Google Sheet to see if scores are being saved
- Look in the browser console (F12) for any error messages
- Verify that the sheet name is exactly "Leaderboard"

**Deployment URL changed after update**
- Always use **Edit** on existing deployment, never create a new one
- New deployments get new URLs and require updating the HTML file

## Privacy & Data

- Player names and scores are stored in your Google Sheet
- The sheet is private to you unless you share it
- The web app is accessible to anyone with the URL
- No email addresses or personal information are collected beyond the player name
