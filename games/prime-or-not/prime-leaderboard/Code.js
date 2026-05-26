/**
 * Prime or Not Leaderboard - Google Apps Script Backend
 *
 * Scores are stored in a Google Sheet with columns:
 * A: Timestamp, B: Player Name, C: Min Range, D: Max Range,
 * E: Total Questions, F: Correct, G: Incorrect, H: Accuracy %,
 * I: Total Time (milliseconds), J: Time Display, K: MCPS ID (optional)
 */

const SHEET_ID = '19P1KPhQXMMsYEgx8dpmhZQynegf5iygu4nqLMNXU4ss';
const SHEET_NAME = 'Leaderboard';

// Parent portal production URL — used for student lookup (MCPS ID → name)
const PORTAL_URL = 'https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec';

/**
 * Submit a new score to the leaderboard.
 * mcpsId is optional — pass null for guest plays.
 */
function submitScore(playerName, minRange, maxRange, correct, incorrect, totalMilliseconds, mcpsId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!playerName || playerName.trim() === '') {
      return { success: false, error: 'Player name is required' };
    }

    playerName = playerName.trim().substring(0, 50);

    const totalQuestions = correct + incorrect;
    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const milliseconds = totalMilliseconds % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;

    const mcpsIdClean = mcpsId ? mcpsId.toString().trim() : '';

    sheet.appendRow([
      new Date(),
      playerName,
      minRange,
      maxRange,
      totalQuestions,
      correct,
      incorrect,
      accuracy,
      totalMilliseconds,
      timeDisplay,
      mcpsIdClean    // col K
    ]);

    // Force time display cell (col J) to plain text
    const lastRow = sheet.getLastRow();
    const timeCell = sheet.getRange(lastRow, 10);
    timeCell.setNumberFormat('@STRING@');
    timeCell.setValue(timeDisplay);

    return { success: true, message: 'Score submitted successfully!' };

  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get top scores from the leaderboard, filtered by range and optionally question count.
 */
function getLeaderboard(minRange, maxRange, totalQuestions, limit = 50) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, scores: [] };
    }

    const scores = data.slice(1)
      .filter(row => {
        const matchesRange = row[2] == minRange && row[3] == maxRange;
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
        totalMilliseconds: row[8],
        timeDisplay: row[9],
        countsForDrawing: !!(row[10] || '').toString().trim()
      }))
      .sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.totalMilliseconds - b.totalMilliseconds;
      })
      .slice(0, limit);

    return { success: true, scores };

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { success: false, error: error.toString(), scores: [] };
  }
}

/**
 * Get all unique ranges that have scores.
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
      rangesSet.add(`${row[2]}-${row[3]}`);
    });

    const ranges = Array.from(rangesSet).map(key => {
      const [min, max] = key.split('-');
      return { min: parseInt(min), max: parseInt(max), label: `${min}-${max}` };
    });

    return { success: true, ranges };

  } catch (error) {
    console.error('Error getting ranges:', error);
    return { success: false, error: error.toString(), ranges: [] };
  }
}

/**
 * Return per-range leaders for the summer certificate drawing.
 *
 * Rules:
 * - Only scores with a non-empty MCPS ID count (col K).
 * - Range must have at least 20 numbers (max - min + 1 >= 20).
 * - Must have played at least Math.min(rangeSize, 50) questions.
 * - Leader = highest accuracy; ties broken by fastest time.
 *
 * Returns all qualifying ranges (presets + any valid custom ranges),
 * sorted by min then max.
 */
function getDrawingLeaderboard() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return { success: true, ranges: [] };
    }

    // rangeKey -> { min, max, minQuestions, leader }
    const rangeMap = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const mcpsId = (row[10] || '').toString().trim();
      if (!mcpsId) continue; // skip guest plays

      const min = Number(row[2]);
      const max = Number(row[3]);
      const rangeSize = max - min + 1;
      if (rangeSize < 20) continue;

      const minQRequired = Math.min(rangeSize, 50);
      const totalQ = Number(row[4]);
      if (totalQ < minQRequired) continue;

      const accuracy = Number(row[7]);
      const ms = Number(row[8]);
      const key = `${min}-${max}`;

      if (!rangeMap[key]) {
        rangeMap[key] = { min, max, minQuestions: minQRequired, label: `${min}–${max}`, leader: null };
      }

      const cur = rangeMap[key].leader;
      const better = !cur
        || accuracy > cur.accuracy
        || (accuracy === cur.accuracy && ms < cur.totalMilliseconds);

      if (better) {
        rangeMap[key].leader = {
          name: (row[1] || '').toString().trim(),
          mcpsId,
          accuracy,
          timeDisplay: (row[9] || '').toString(),
          totalMilliseconds: ms
        };
      }
    }

    const ranges = Object.values(rangeMap).sort((a, b) =>
      a.min !== b.min ? a.min - b.min : a.max - b.max
    );

    return { success: true, ranges };

  } catch (error) {
    console.error('Error getting drawing leaderboard:', error);
    return { success: false, error: error.toString(), ranges: [] };
  }
}

/**
 * Web app entry point — GET requests.
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

  if (action === 'getDrawingLeaderboard') {
    const result = getDrawingLeaderboard();
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web app entry point — POST requests.
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
        data.totalMilliseconds,
        data.mcpsId || null
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
 * Initialize the spreadsheet with proper headers.
 * Run once after creating the sheet.
 */
function initializeSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    const headers = [
      'Timestamp', 'Player Name', 'Min Range', 'Max Range',
      'Total Questions', 'Correct', 'Incorrect', 'Accuracy %',
      'Total Time (milliseconds)', 'Time Display', 'MCPS ID'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange('J:J').setNumberFormat('@STRING@');

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
 * Fix time display formatting for existing data.
 */
function fixTimeDisplayFormat() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    sheet.getRange('J:J').setNumberFormat('@STRING@');

    for (let i = 1; i < data.length; i++) {
      const totalMilliseconds = data[i][8];
      if (totalMilliseconds && typeof totalMilliseconds === 'number') {
        const totalSeconds = Math.floor(totalMilliseconds / 1000);
        const ms = totalMilliseconds % 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
        sheet.getRange(i + 1, 10).setValue(timeDisplay);
      }
    }

    Logger.log('Time display format fixed successfully!');
    return { success: true };

  } catch (error) {
    Logger.log('Error fixing time display: ' + error);
    return { success: false, error: error.toString() };
  }
}
