/**
 * Prime or Not Leaderboard - Google Apps Script Backend
 *
 * This script manages the leaderboard for the Prime or Not game.
 * Scores are stored in a Google Sheet with columns:
 * A: Timestamp, B: Player Name, C: Min Range, D: Max Range,
 * E: Total Questions, F: Correct, G: Incorrect, H: Accuracy %,
 * I: Total Time (seconds), J: Time Display
 */

// IMPORTANT: Replace this with your actual Google Sheets ID
const SHEET_ID = '19P1KPhQXMMsYEgx8dpmhZQynegf5iygu4nqLMNXU4ss';
const SHEET_NAME = 'Leaderboard';

/**
 * Submit a new score to the leaderboard
 */
function submitScore(playerName, minRange, maxRange, correct, incorrect, totalSeconds) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Validate inputs
    if (!playerName || playerName.trim() === '') {
      return { success: false, error: 'Player name is required' };
    }

    playerName = playerName.trim().substring(0, 50); // Limit name length

    const totalQuestions = correct + incorrect;
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

    // Add row to sheet
    sheet.appendRow([
      new Date(),
      playerName,
      minRange,
      maxRange,
      totalQuestions,
      correct,
      incorrect,
      accuracy,
      totalSeconds,
      timeDisplay
    ]);

    return { success: true, message: 'Score submitted successfully!' };

  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get top scores from the leaderboard
 * Filters by range, total questions, and sorts by accuracy (desc), then time (asc)
 */
function getLeaderboard(minRange, maxRange, totalQuestions, limit = 50) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, scores: [] };
    }

    // Skip header row and filter by range and total questions
    const scores = data.slice(1)
      .filter(row => {
        const matchesRange = row[2] == minRange && row[3] == maxRange;
        // If totalQuestions is provided, filter by it; otherwise show all
        const matchesQuestions = totalQuestions ? row[4] == totalQuestions : true;
        return matchesRange && matchesQuestions;
      })
      .map(row => ({
        timestamp: row[0],
        playerName: row[1],
        minRange: row[2],
        maxRange: row[3],
        totalQuestions: row[4],
        correct: row[5],
        incorrect: row[6],
        accuracy: row[7],
        totalSeconds: row[8],
        timeDisplay: row[9]
      }))
      .sort((a, b) => {
        // Sort by accuracy (descending), then by time (ascending)
        if (b.accuracy !== a.accuracy) {
          return b.accuracy - a.accuracy;
        }
        return a.totalSeconds - b.totalSeconds;
      })
      .slice(0, limit);

    return { success: true, scores: scores };

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { success: false, error: error.toString(), scores: [] };
  }
}

/**
 * Get all unique ranges that have scores
 */
function getAvailableRanges() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, ranges: [] };
    }

    const rangesSet = new Set();
    data.slice(1).forEach(row => {
      const rangeKey = `${row[2]}-${row[3]}`;
      rangesSet.add(rangeKey);
    });

    const ranges = Array.from(rangesSet).map(key => {
      const [min, max] = key.split('-');
      return { min: parseInt(min), max: parseInt(max), label: `${min}-${max}` };
    });

    return { success: true, ranges: ranges };

  } catch (error) {
    console.error('Error getting ranges:', error);
    return { success: false, error: error.toString(), ranges: [] };
  }
}

/**
 * Web app entry point - handles GET and POST requests
 */
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getLeaderboard') {
    const minRange = parseInt(e.parameter.min) || 1;
    const maxRange = parseInt(e.parameter.max) || 100;
    const totalQuestions = e.parameter.total ? parseInt(e.parameter.total) : null;
    const limit = parseInt(e.parameter.limit) || 50;

    const result = getLeaderboard(minRange, maxRange, totalQuestions, limit);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getRanges') {
    const result = getAvailableRanges();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web app entry point - handles POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'submitScore') {
      const result = submitScore(
        data.playerName,
        data.minRange,
        data.maxRange,
        data.correct,
        data.incorrect,
        data.totalSeconds
      );

      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the spreadsheet with proper headers
 * Run this once after creating the sheet
 */
function initializeSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Set headers
    const headers = [
      'Timestamp',
      'Player Name',
      'Min Range',
      'Max Range',
      'Total Questions',
      'Correct',
      'Incorrect',
      'Accuracy %',
      'Total Time (seconds)',
      'Time Display'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column J (Time Display) to plain text format to prevent time conversion
    sheet.getRange('J:J').setNumberFormat('@STRING@');

    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    Logger.log('Sheet initialized successfully!');
    return { success: true };

  } catch (error) {
    Logger.log('Error initializing sheet: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Fix time display formatting for existing data
 * Run this once to fix any cells that were converted to date-time format
 */
function fixTimeDisplayFormat() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Set column J to plain text format
    sheet.getRange('J:J').setNumberFormat('@STRING@');

    // Fix each row's time display
    for (let i = 1; i < data.length; i++) {
      const totalSeconds = data[i][8]; // Column I: Total Time (seconds)
      if (totalSeconds && typeof totalSeconds === 'number') {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;
        sheet.getRange(i + 1, 10).setValue(timeDisplay); // Column J
      }
    }

    Logger.log('Time display format fixed successfully!');
    return { success: true };

  } catch (error) {
    Logger.log('Error fixing time display: ' + error);
    return { success: false, error: error.toString() };
  }
}
