/**
 * Algebra Kitchen - Google Apps Script Backend
 *
 * This script manages student progress for the Algebra Kitchen game.
 * Progress is stored in a Google Sheet with columns:
 * A: Name, B: MCPS ID, C: Dish 1 Stars (rating 0-3)
 *
 * Uses the same spreadsheet as Training Kitchen.
 */

const SHEET_ID = '1MSYlXi37I9x4PMSpf8ovtmq6zLMwY_-vK7SBlydCjnI';
const ROSTER_SHEET_NAME = 'Roster';
const TRAINING_KITCHEN_SHEET = 'Training Kitchen';
const ALGEBRA_KITCHEN_SHEET = 'Algebra Kitchen';

/**
 * Look up student info from the Roster tab
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
 * Check if student has completed all 5 Training Kitchen modules
 */
function isCertifiedChef(mcpsId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TRAINING_KITCHEN_SHEET);

    if (!sheet) {
      return false;
    }

    const data = sheet.getDataRange().getValues();
    const mcpsIdStr = mcpsId.toString().trim();

    // Look for student row
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      if (rowId === mcpsIdStr) {
        // Check if all 5 modules (columns C-G) are completed
        const module1 = data[i][2];
        const module2 = data[i][3];
        const module3 = data[i][4];
        const module4 = data[i][5];
        const module5 = data[i][6];

        const allCompleted = module1 && module2 && module3 && module4 && module5;
        return allCompleted ? true : false;
      }
    }

    return false;

  } catch (error) {
    Logger.log('Error checking chef status: ' + error.toString());
    return false;
  }
}

/**
 * Get the Algebra Kitchen sheet, creating it if needed
 */
function getAlgebraSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(ALGEBRA_KITCHEN_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(ALGEBRA_KITCHEN_SHEET);
    const headers = ['Name', 'MCPS ID', 'Dish 1 Stars'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 120);
  }

  return sheet;
}

/**
 * Get student's Algebra Kitchen progress
 * Returns: { success, studentName, mcpsId, isCertifiedChef, dish1Stars }
 */
function getAlgebraProgress(mcpsId) {
  try {
    // First look up the student
    const studentLookup = lookupStudent(mcpsId);
    if (!studentLookup.success) {
      return studentLookup;
    }

    const studentName = studentLookup.name;
    const mcpsIdStr = studentLookup.mcpsId;

    // Check if Certified Chef
    const certified = isCertifiedChef(mcpsIdStr);

    if (!certified) {
      return { success: false, message: 'Complete Training Kitchen first!' };
    }

    const sheet = getAlgebraSheet();
    const data = sheet.getDataRange().getValues();

    let dish1Stars = 0;

    // Look for student by MCPS ID
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      if (rowId === mcpsIdStr) {
        dish1Stars = parseInt(data[i][2] || 0);
        break;
      }
    }

    return {
      success: true,
      studentName: studentName,
      mcpsId: mcpsIdStr,
      isCertifiedChef: true,
      dish1Stars: dish1Stars
    };

  } catch (error) {
    Logger.log('Error getting algebra progress: ' + error.toString());
    return { success: false, message: 'Error retrieving progress: ' + error.message };
  }
}

/**
 * Record Algebra Kitchen progress
 * Only updates if newStars > currentStars
 */
function recordAlgebraProgress(mcpsId, dish, newStars) {
  try {
    if (dish !== 1) {
      return { success: false, message: 'Only Dish 1 is available' };
    }

    newStars = Math.max(1, Math.min(3, parseInt(newStars))); // Clamp to 1-3

    // First look up the student
    const studentLookup = lookupStudent(mcpsId);
    if (!studentLookup.success) {
      return studentLookup;
    }

    const studentName = studentLookup.name;
    const mcpsIdStr = studentLookup.mcpsId;

    // Check if Certified Chef
    const certified = isCertifiedChef(mcpsIdStr);
    if (!certified) {
      return { success: false, message: 'Not a Certified Chef yet' };
    }

    const sheet = getAlgebraSheet();
    const data = sheet.getDataRange().getValues();

    // Find student row or create new one
    let studentRowIndex = -1;
    let currentStars = 0;

    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      if (rowId === mcpsIdStr) {
        studentRowIndex = i + 1;
        currentStars = parseInt(data[i][2] || 0);
        break;
      }
    }

    // If student not found, add new row
    if (studentRowIndex === -1) {
      const newRow = [studentName, mcpsIdStr, 0];
      sheet.appendRow(newRow);
      studentRowIndex = sheet.getLastRow();
      currentStars = 0;
    }

    // Only update if newStars > currentStars
    let updated = false;
    if (newStars > currentStars) {
      sheet.getRange(studentRowIndex, 3).setValue(newStars);
      updated = true;
    }

    return {
      success: true,
      message: 'Progress recorded',
      currentStars: currentStars,
      newStars: updated ? newStars : currentStars,
      updated: updated
    };

  } catch (error) {
    Logger.log('Error recording algebra progress: ' + error.toString());
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
      case 'getAlgebraProgress':
        result = getAlgebraProgress(e.parameter.mcpsId);
        break;

      case 'recordAlgebraProgress':
        const dish = parseInt(e.parameter.dish);
        const stars = parseInt(e.parameter.stars);
        result = recordAlgebraProgress(e.parameter.mcpsId, dish, stars);
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
 * Initialize the Algebra Kitchen sheet
 */
function initializeAlgebraSheet() {
  try {
    getAlgebraSheet();
    Logger.log('Algebra Kitchen sheet initialized successfully!');
    return { success: true };
  } catch (error) {
    Logger.log('Error initializing sheet: ' + error);
    return { success: false, error: error.toString() };
  }
}
