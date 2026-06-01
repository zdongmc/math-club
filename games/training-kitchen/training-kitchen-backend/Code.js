/**
 * Training Kitchen - Google Apps Script Backend
 *
 * This script manages student progress for the Training Kitchen math training game.
 * Progress is stored in a Google Sheet with columns:
 * A: Name, B: MCPS ID, C: Module 1, D: Module 2, E: Module 3, F: Module 4, G: Module 5
 *
 * Module columns store the date the student passed the mastery test (blank if not completed).
 */

const SHEET_ID = '1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI';
const PROGRESS_SHEET_NAME = 'Training Kitchen';
const ROSTER_SHEET_NAME = 'Roster';

/**
 * Look up student info from the Roster tab
 * Roster tab has: Column A = Name, Column B = MCPS ID
 */
function lookupStudent(mcpsId) {
  try {
    const mcpsIdStr = mcpsId.toString().trim();

    if (!mcpsIdStr || !/^\d+$/.test(mcpsIdStr)) {
      return { success: false, message: 'Please enter a valid MCPS ID' };
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const rosterSheet = ss.getSheetByName(ROSTER_SHEET_NAME);

    if (!rosterSheet || rosterSheet.getLastRow() <= 1) {
      return { success: false, message: 'Roster not found' };
    }

    const data = rosterSheet.getDataRange().getValues();

    // Look for student by MCPS ID in column B
    for (let i = 1; i < data.length; i++) {
      const studentId = (data[i][1] || '').toString().trim();
      if (studentId === mcpsIdStr) {
        const studentName = (data[i][0] || '').toString().trim();
        return { success: true, name: studentName, mcpsId: mcpsIdStr };
      }
    }

    return { success: false, message: 'Student not found with MCPS ID: ' + mcpsIdStr };

  } catch (error) {
    Logger.log('Error looking up student: ' + error.toString());
    return { success: false, message: 'Error looking up student: ' + error.message };
  }
}

/**
 * Get the progress sheet, creating it if needed
 */
function getProgressSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(PROGRESS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(PROGRESS_SHEET_NAME);
    const headers = ['Name', 'MCPS ID', 'Module 1: Basic Ops', 'Module 2: Pre-Algebra', 'Module 3: PEMDAS', 'Module 4: Fractions', 'Module 5: Balancing'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 100);
    for (let i = 3; i <= 7; i++) {
      sheet.setColumnWidth(i, 150);
    }
  }

  return sheet;
}

/**
 * Get student's training progress
 */
function getTrainingProgress(mcpsId) {
  try {
    // First look up the student
    const studentLookup = lookupStudent(mcpsId);
    if (!studentLookup.success) {
      return studentLookup;
    }

    const studentName = studentLookup.name;
    const mcpsIdStr = studentLookup.mcpsId;

    const sheet = getProgressSheet();
    const data = sheet.getDataRange().getValues();

    // Default progress
    const progress = {
      module1: null,
      module2: null,
      module3: null,
      module4: null,
      module5: null
    };

    // Look for student by MCPS ID
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      if (rowId === mcpsIdStr) {
        progress.module1 = data[i][2] ? data[i][2].toString() : null;
        progress.module2 = data[i][3] ? data[i][3].toString() : null;
        progress.module3 = data[i][4] ? data[i][4].toString() : null;
        progress.module4 = data[i][5] ? data[i][5].toString() : null;
        progress.module5 = data[i][6] ? data[i][6].toString() : null;
        break;
      }
    }

    // Calculate completed count and chef level
    const completedCount = [progress.module1, progress.module2, progress.module3, progress.module4, progress.module5]
      .filter(m => m !== null && m !== '').length;

    let chefLevel;
    if (completedCount === 0) {
      chefLevel = 'Kitchen Trainee';
    } else if (completedCount <= 2) {
      chefLevel = 'Prep Cook';
    } else if (completedCount <= 4) {
      chefLevel = 'Line Cook';
    } else {
      chefLevel = 'Certified Chef';
    }

    return {
      success: true,
      studentName: studentName,
      mcpsId: mcpsIdStr,
      progress: progress,
      completedCount: completedCount,
      chefLevel: chefLevel
    };

  } catch (error) {
    Logger.log('Error getting training progress: ' + error.toString());
    return { success: false, message: 'Error retrieving progress: ' + error.message };
  }
}

/**
 * Record module completion
 */
function recordTrainingProgress(mcpsId, moduleNumber, passed) {
  try {
    if (!passed) {
      return { success: true, message: 'Progress not recorded (test not passed)' };
    }

    // First look up the student
    const studentLookup = lookupStudent(mcpsId);
    if (!studentLookup.success) {
      return studentLookup;
    }

    const studentName = studentLookup.name;
    const mcpsIdStr = studentLookup.mcpsId;

    const sheet = getProgressSheet();
    const data = sheet.getDataRange().getValues();

    // Find student row or create new one
    let studentRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      if (rowId === mcpsIdStr) {
        studentRowIndex = i + 1;
        break;
      }
    }

    // If student not found, add new row
    if (studentRowIndex === -1) {
      const newRow = [studentName, mcpsIdStr, '', '', '', '', ''];
      sheet.appendRow(newRow);
      studentRowIndex = sheet.getLastRow();
    }

    // Record the completion date
    const moduleColumnIndex = moduleNumber + 2; // Module 1 -> column 3
    const completionDate = new Date().toLocaleDateString();
    sheet.getRange(studentRowIndex, moduleColumnIndex).setValue(completionDate);

    return {
      success: true,
      message: 'Module ' + moduleNumber + ' completed!',
      completionDate: completionDate
    };

  } catch (error) {
    Logger.log('Error recording training progress: ' + error.toString());
    return { success: false, message: 'Error recording progress: ' + error.message };
  }
}

/**
 * Web app entry point - handles GET requests
 */
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
      case 'getTrainingProgress':
        result = getTrainingProgress(e.parameter.mcpsId);
        break;

      case 'recordTrainingProgress':
        const moduleNum = parseInt(e.parameter.module);
        const passed = e.parameter.passed === 'true';
        result = recordTrainingProgress(e.parameter.mcpsId, moduleNum, passed);
        break;

      default:
        result = { success: false, message: 'Unknown action: ' + action };
    }
  } catch (error) {
    result = { success: false, message: 'Error: ' + error.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize the spreadsheet
 * Run this once after creating the sheet
 */
function initializeSheet() {
  try {
    getProgressSheet();
    Logger.log('Sheet initialized successfully!');
    return { success: true };
  } catch (error) {
    Logger.log('Error initializing sheet: ' + error);
    return { success: false, error: error.toString() };
  }
}
