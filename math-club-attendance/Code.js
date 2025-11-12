// Math Club Parent Portal System
const REGISTRATION_SHEET_NAME = 'Form Responses 1';
const COMPETITION_SIGNUP_SHEET_NAME = 'Form Responses 2';
const ATTENDANCE_SHEET_NAME = 'Attendance Records';
const SCHOOL_LIST_SHEET_NAME = 'School List';

function doGet() {
  return HtmlService.createTemplateFromFile('Checkin')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getRegistrationSheet() {
  return getSpreadsheet().getSheetByName(REGISTRATION_SHEET_NAME);
}

function getAttendanceSheet() {
  let sheet = getSpreadsheet().getSheetByName(ATTENDANCE_SHEET_NAME);
  if (!sheet) {
    // Create attendance sheet if it doesn't exist
    sheet = getSpreadsheet().insertSheet(ATTENDANCE_SHEET_NAME);
    const headers = ['Student Name', 'Student ID'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // Set column widths for better visibility
    sheet.setColumnWidth(1, 200); // Student Name
    sheet.setColumnWidth(2, 100); // Student ID
  }
  return sheet;
}

function findOrCreateDateColumn(sheet, meetingDate) {
  // Parse date more carefully to avoid timezone issues
  const dateParts = meetingDate.split('-'); // ['2025', '09', '25']
  const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();

  // Get current headers
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headers = headerRange.getValues()[0];

  // Look for existing column with this date
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === targetDate) {
      return i + 1; // Return 1-based column number
    }
  }

  // Column doesn't exist, create it
  const newColumnIndex = sheet.getLastColumn() + 1;
  sheet.getRange(1, newColumnIndex).setValue(targetDate);
  sheet.getRange(1, newColumnIndex).setFontWeight('bold');
  sheet.setColumnWidth(newColumnIndex, 100);

  return newColumnIndex;
}

function getAllStudents() {
  try {
    const registrationSheet = getRegistrationSheet();
    if (!registrationSheet) {
      throw new Error('Registration sheet not found');
    }

    const registrationData = registrationSheet.getDataRange().getValues();
    if (registrationData.length <= 1) {
      return [];
    }

    const seenStudents = new Map(); // To handle duplicates

    // First, process Form Responses data
    for (let i = 1; i < registrationData.length; i++) {
      const row = registrationData[i];
      if (row.length === 0) continue;

      // Columns: A=Timestamp, B=First Name, C=Last Name, D=?, E=Email
      const firstName = (row[1] || '').toString().trim();
      const lastName = (row[2] || '').toString().trim();
      const email = (row[4] || '').toString().trim();

      if (!firstName && !lastName) continue;

      const fullName = `${firstName} ${lastName}`.trim();

      // Extract student ID from email if it matches pattern: digits@mcpsmd.net
      let studentId = '';
      const emailMatch = email.match(/(\d+)@mcpsmd\.net/);
      if (emailMatch) {
        studentId = emailMatch[1];
      }

      // Create unique key - prioritize student ID if available, otherwise use full name
      const key = studentId ? `id_${studentId}` : `name_${fullName.toLowerCase()}`;

      // Keep most recent registration for duplicates
      if (!seenStudents.has(key) || new Date(row[0]) > new Date(seenStudents.get(key).timestamp)) {
        seenStudents.set(key, {
          name: fullName,
          id: lastName, // Show last name as "ID" for display
          studentId: studentId, // Real student ID if available
          timestamp: row[0]
        });
      }
    }

    // Now merge with Attendance Records data to get updated student IDs
    try {
      const attendanceSheet = getAttendanceSheet();
      if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
        const attendanceData = attendanceSheet.getDataRange().getValues();

        // Skip header row and process each student in attendance records
        for (let i = 1; i < attendanceData.length; i++) {
          const row = attendanceData[i];
          if (row.length < 2) continue;

          const attendanceName = (row[0] || '').toString().trim();
          const attendanceId = (row[1] || '').toString().trim();

          if (!attendanceName) continue;

          // Find matching student from registration data
          let foundStudent = null;
          for (const [key, student] of seenStudents.entries()) {
            if (student.name === attendanceName) {
              foundStudent = student;
              break;
            }
          }

          // If found, update with attendance record student ID if it's more complete
          if (foundStudent) {
            // Use attendance ID if it's a numeric student ID and we don't have one, or if it's different
            if (attendanceId && /^\d+$/.test(attendanceId)) {
              foundStudent.studentId = attendanceId;
              foundStudent.id = attendanceId; // Use student ID as display ID too
            } else if (attendanceId && !foundStudent.studentId) {
              // If we don't have a student ID and attendance has some ID, use it
              foundStudent.id = attendanceId;
            }
          }
        }
      }
    } catch (attendanceError) {
      console.log('Could not read attendance records (this is okay if sheet is new):', attendanceError.message);
    }

    // Get attendance counts for all students
    const attendanceCounts = getStudentAttendanceCounts();

    // Convert to array and add attendance counts
    const studentArray = Array.from(seenStudents.values());
    studentArray.forEach(student => {
      student.attendanceCount = attendanceCounts[student.name] || 0;
    });

    // Sort by first name
    studentArray.sort((a, b) => {
      const firstNameA = a.name.split(' ')[0].toLowerCase();
      const firstNameB = b.name.split(' ')[0].toLowerCase();
      return firstNameA.localeCompare(firstNameB);
    });

    // IMPORTANT: make sure output is serializable
    return JSON.parse(JSON.stringify(studentArray));
  } catch (error) {
    console.error('Error getting students:', error);
    throw new Error('Failed to retrieve student data: ' + error.message);
  }
}

function checkInStudent(studentName, studentId, meetingDate, meetingType, realStudentId) {
  try {
    const sheet = getAttendanceSheet();

    // Use real student ID if provided, otherwise use display ID (last name)
    const idToSave = realStudentId || studentId;

    // Find or create the column for this meeting date
    const dateColumnIndex = findOrCreateDateColumn(sheet, meetingDate);

    // Check if student already exists in the sheet
    const data = sheet.getDataRange().getValues();
    let studentRowIndex = -1;

    // Look for existing student by name
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === studentName) {
        studentRowIndex = i + 1; // Convert to 1-based indexing
        break;
      }
    }

    // If student doesn't exist, add them
    if (studentRowIndex === -1) {
      const newRowData = [studentName, idToSave];
      sheet.appendRow(newRowData);
      studentRowIndex = sheet.getLastRow();
    }

    // Check if already checked in for this date
    const currentValue = sheet.getRange(studentRowIndex, dateColumnIndex).getValue();
    if (currentValue && currentValue !== '') {
      const dateParts = meetingDate.split('-');
      const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();
      return { success: false, message: `${studentName} is already checked in for ${targetDate}!` };
    }

    // Record check-in with timestamp and meeting type
    const checkInValue = `${new Date().toLocaleTimeString()} - ${meetingType || 'Club Meeting'}`;
    sheet.getRange(studentRowIndex, dateColumnIndex).setValue(checkInValue);

    const dateParts = meetingDate.split('-');
    const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();

    console.log(`Student checked in: ${studentName} (${idToSave}) for ${targetDate}`);

    return {
      success: true,
      message: `Welcome ${studentName}! You're checked in for ${meetingType || 'Club Meeting'}.`
    };
  } catch (error) {
    console.error('Error checking in student:', error);
    throw new Error('Failed to check in student: ' + error.message);
  }
}

function getAttendanceSummary(date) {
  try {
    const sheet = getAttendanceSheet();

    if (sheet.getLastRow() <= 1) {
      // Parse date more carefully to avoid timezone issues
      const dateParts = date.split('-'); // ['2025', '09', '25']
      const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();
      return { total: 0, date: targetDate, students: [] };
    }

    // Parse the target date
    const dateParts = date.split('-');
    const targetDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();

    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find the column index for this date
    let dateColumnIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === targetDate) {
        dateColumnIndex = i;
        break;
      }
    }

    // If no column exists for this date, return empty results
    if (dateColumnIndex === -1) {
      return { total: 0, date: targetDate, students: [] };
    }

    const students = [];

    // Check each student row (starting from row 1, skipping headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const checkInValue = row[dateColumnIndex];

      if (checkInValue && checkInValue !== '') {
        // Parse the check-in value (format: "time - meeting type")
        const valueParts = checkInValue.toString().split(' - ');
        const checkInTime = valueParts[0] || '';
        const meetingType = valueParts[1] || 'Club Meeting';

        students.push({
          name: row[0], // Student Name
          id: row[1],   // Student ID
          checkInTime: checkInTime,
          meetingType: meetingType
        });
      }
    }

    console.log('getAttendanceSummary returning:', {
      total: students.length,
      date: targetDate,
      students: students
    });

    return {
      total: students.length,
      date: targetDate,
      students: students
    };
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    throw new Error('Failed to get attendance summary: ' + error.message);
  }
}

function getStudentAttendanceCounts() {
  try {
    const sheet = getAttendanceSheet();
    const attendanceCounts = {};

    if (sheet.getLastRow() <= 1) {
      return attendanceCounts; // Return empty object if no data
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Process each student row (starting from row 1, skipping headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentName = row[0];

      if (!studentName) continue;

      let attendanceCount = 0;

      // Check each date column (starting from column 2, skipping Name and ID columns)
      for (let j = 2; j < row.length && j < headers.length; j++) {
        const cellValue = row[j];
        // Count non-empty cells as attendance
        if (cellValue && cellValue.toString().trim() !== '') {
          attendanceCount++;
        }
      }

      attendanceCounts[studentName] = attendanceCount;
    }

    return attendanceCounts;
  } catch (error) {
    console.error('Error getting attendance counts:', error);
    return {};
  }
}

function updateStudentId(studentName, currentId, newStudentId) {
  try {
    const sheet = getAttendanceSheet();

    // Check if student already exists in the sheet
    const data = sheet.getDataRange().getValues();
    let studentRowIndex = -1;

    // Look for existing student by name
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === studentName) {
        studentRowIndex = i + 1; // Convert to 1-based indexing
        break;
      }
    }

    // If student doesn't exist, add them with the new ID
    if (studentRowIndex === -1) {
      const newRowData = [studentName, newStudentId];
      sheet.appendRow(newRowData);
    } else {
      // Update existing student's ID
      sheet.getRange(studentRowIndex, 2).setValue(newStudentId);
    }

    console.log(`Student ID updated: ${studentName} -> ${newStudentId}`);

    return {
      success: true,
      message: `${studentName}'s student ID updated to ${newStudentId}`
    };
  } catch (error) {
    console.error('Error updating student ID:', error);
    throw new Error('Failed to update student ID: ' + error.message);
  }
}

function setupSystem() {
  try {
    // Just ensure attendance sheet exists
    getAttendanceSheet();
    return 'Setup complete! Attendance system is ready.';
  } catch (error) {
    console.error('Setup error:', error);
    throw new Error('Setup failed: ' + error.message);
  }
}

function getCompetitionSignupSheet() {
  return getSpreadsheet().getSheetByName(COMPETITION_SIGNUP_SHEET_NAME);
}

function getSchoolListSheet() {
  return getSpreadsheet().getSheetByName(SCHOOL_LIST_SHEET_NAME);
}

function getMathLeagueSheet() {
  return getSpreadsheet().getSheetByName('Math League');
}

function getMathcountsSheet() {
  return getSpreadsheet().getSheetByName('MATHCOUNTS');
}

function getMathLeagueTeam(mcpsId) {
  try {
    const sheet = getMathLeagueSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Columns: A=Team, B=Name, C=ID, D=Grade, E-H=Scores, I=Total
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[2] || '').toString().trim();

      if (studentId === mcpsId.toString().trim()) {
        return (row[0] || '').toString().trim(); // Return team assignment
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting Math League team: ' + error.toString());
    return null;
  }
}

function getMathcountsResults(mcpsId) {
  try {
    const sheet = getMathcountsSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Look for student by MCPS ID in column B
    // Columns: A=Name, B=ID, G=Sprint Round, H=Target Round, I=Individual Score, J=Rank
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        // Columns: G=Sprint Round, H=Target Round, I=Individual Score, J=Rank, K=Chapter Advancement
        const sprintScore = row[6] !== undefined && row[6] !== '' ? parseFloat(row[6]) : null;
        const targetScore = row[7] !== undefined && row[7] !== '' ? parseFloat(row[7]) : null;
        const individualScore = row[8] !== undefined && row[8] !== '' ? parseFloat(row[8]) : null;
        const rank = row[9] !== undefined && row[9] !== '' ? parseInt(row[9]) : null;
        const chapterStatus = row[10] !== undefined && row[10] !== '' ? row[10].toString().trim() : null;

        return {
          sprintScore: sprintScore,
          targetScore: targetScore,
          individualScore: individualScore,
          rank: rank,
          chapterStatus: chapterStatus,
          maxSprint: 30,
          maxTarget: 16,
          maxIndividual: 46
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting MATHCOUNTS results: ' + error.toString());
    return null;
  }
}

function checkFormCompletion(mcpsId, studentName) {
  try {
    const forms = {
      clubRegistration: {
        completed: false,
        name: 'Club Registration Form',
        url: 'https://forms.gle/PMdmzV79ZZd5jBso6'
      },
      extracurricularActivities: {
        completed: false,
        name: 'Extracurricular Activities Form',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSfublOE3YoXop_RTQn0IykEI1EOZZgPlx_Fn2Or0xD-ucSYZw/viewform'
      }
    };

    const cleanStudentName = (studentName || '').toString().trim().toLowerCase();

    // Check Club Registration Form (Form Responses 1)
    // Look for student by name (columns B=First Name, C=Last Name)
    const registrationSheet = getRegistrationSheet();
    if (registrationSheet && registrationSheet.getLastRow() > 1) {
      const registrationData = registrationSheet.getDataRange().getValues();

      for (let i = 1; i < registrationData.length; i++) {
        const row = registrationData[i];
        const firstName = (row[1] || '').toString().trim();
        const lastName = (row[2] || '').toString().trim();
        const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

        if (fullName === cleanStudentName) {
          forms.clubRegistration.completed = true;
          break;
        }
      }
    }

    // Check Extracurricular Activities Form (School List)
    // Look for student by name (columns C=Last Name, D=First Name) or ID (column B)
    const schoolListSheet = getSchoolListSheet();
    if (schoolListSheet && schoolListSheet.getLastRow() > 1) {
      const schoolListData = schoolListSheet.getDataRange().getValues();

      for (let i = 1; i < schoolListData.length; i++) {
        const row = schoolListData[i];
        const studentId = (row[1] || '').toString().trim();
        const lastName = (row[2] || '').toString().trim();
        const firstName = (row[3] || '').toString().trim();
        const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

        // Match by either name or student ID
        if (fullName === cleanStudentName || studentId === mcpsId.toString().trim()) {
          forms.extracurricularActivities.completed = true;
          break;
        }
      }
    }

    return forms;

  } catch (error) {
    Logger.log('Error checking form completion: ' + error.toString());
    return {
      clubRegistration: {
        completed: false,
        name: 'Club Registration Form',
        url: 'https://forms.gle/PMdmzV79ZZd5jBso6'
      },
      extracurricularActivities: {
        completed: false,
        name: 'Extracurricular Activities Form',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSfublOE3YoXop_RTQn0IykEI1EOZZgPlx_Fn2Or0xD-ucSYZw/viewform'
      }
    };
  }
}

// TEST FUNCTION - Run this directly in Apps Script editor
function testLookup190949() {
  Logger.log('=== Starting test for MCPS ID 190949 ===');
  const result = lookupStudentByMcpsId('190949');
  Logger.log('=== Test complete ===');
  Logger.log('Result: ' + JSON.stringify(result, null, 2));
  return result;
}

function lookupStudentByMcpsId(mcpsId) {
  try {
    const mcpsIdStr = mcpsId.toString().trim();
    Logger.log('Looking up MCPS ID: ' + mcpsIdStr);

    if (!mcpsIdStr) {
      return { success: false, message: 'Please enter a valid MCPS ID' };
    }

    // Get student basic info from registration
    const registrationSheet = getRegistrationSheet();
    if (!registrationSheet) {
      return { success: false, message: 'Registration data not found' };
    }

    const registrationData = registrationSheet.getDataRange().getValues();
    let studentInfo = null;

    // Look for student in registration data by email (mcpsid@mcpsmd.net)
    for (let i = 1; i < registrationData.length; i++) {
      const row = registrationData[i];
      const email = (row[4] || '').toString().trim();
      const emailMatch = email.match(/(\d+)@mcpsmd\.net/);

      if (emailMatch && emailMatch[1] === mcpsIdStr) {
        const firstName = (row[1] || '').toString().trim();
        const lastName = (row[2] || '').toString().trim();
        studentInfo = {
          name: `${firstName} ${lastName}`.trim(),
          mcpsId: mcpsIdStr,
          email: email
        };
        Logger.log('Found in Form Responses 1: ' + studentInfo.name);
        break;
      }
    }

    // Also check attendance records for student with this ID
    if (!studentInfo) {
      Logger.log('Checking Attendance Records...');
      const attendanceSheet = getAttendanceSheet();
      if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
        const attendanceData = attendanceSheet.getDataRange().getValues();

        for (let i = 1; i < attendanceData.length; i++) {
          const row = attendanceData[i];
          // Handle both string and number formats
          const studentId = row[1] ? row[1].toString().trim() : '';

          if (studentId === mcpsIdStr) {
            studentInfo = {
              name: (row[0] || '').toString().trim(),
              mcpsId: mcpsIdStr,
              email: `${mcpsIdStr}@mcpsmd.net`
            };
            Logger.log('Found in Attendance Records: ' + studentInfo.name);
            break;
          }
        }
      }
    }

    // If still not found, try School List
    if (!studentInfo) {
      Logger.log('Checking School List...');
      const schoolListSheet = getSchoolListSheet();
      if (schoolListSheet && schoolListSheet.getLastRow() > 1) {
        const schoolListData = schoolListSheet.getDataRange().getValues();

        for (let i = 1; i < schoolListData.length; i++) {
          const row = schoolListData[i];
          // Column B is Student ID
          const studentId = row[1] ? row[1].toString().trim() : '';

          if (studentId === mcpsIdStr) {
            const firstName = (row[2] || '').toString().trim();
            const lastName = (row[3] || '').toString().trim();
            studentInfo = {
              name: `${firstName} ${lastName}`.trim(),
              mcpsId: mcpsIdStr,
              email: `${mcpsIdStr}@mcpsmd.net`
            };
            Logger.log('Found in School List: ' + studentInfo.name);
            break;
          }
        }
      }
    }

    // If still not found, try competition signup
    if (!studentInfo) {
      Logger.log('Checking Form Responses 2...');
      const competitionSheet = getCompetitionSignupSheet();
      if (competitionSheet && competitionSheet.getLastRow() > 1) {
        const competitionData = competitionSheet.getDataRange().getValues();

        for (let i = 1; i < competitionData.length; i++) {
          const row = competitionData[i];
          // Handle both string and number formats
          const studentId = row[2] ? row[2].toString().trim() : '';

          if (studentId === mcpsIdStr) {
            studentInfo = {
              name: (row[1] || '').toString().trim(),
              mcpsId: mcpsIdStr,
              gradeLevel: (row[3] || '').toString().trim(),
              parentName: (row[4] || '').toString().trim(),
              parentPhone: (row[5] || '').toString().trim()
            };
            Logger.log('Found in Form Responses 2: ' + studentInfo.name);
            break;
          }
        }
      }
    }

    if (!studentInfo) {
      Logger.log('Student not found in any sheet');
      return { success: false, message: 'Student not found with MCPS ID: ' + mcpsIdStr };
    }

    Logger.log('Student found: ' + JSON.stringify(studentInfo));

    // Get attendance history
    let attendanceHistory = { totalMeetings: 0, dates: [] };
    try {
      Logger.log('Getting attendance history for: ' + studentInfo.name);
      attendanceHistory = getStudentAttendanceHistory(studentInfo.name);
      Logger.log('Attendance history retrieved: ' + attendanceHistory.totalMeetings + ' meetings');
    } catch (err) {
      Logger.log('Error getting attendance history: ' + err.toString());
    }

    // Get competition sign-ups
    let competitionSignups = [];
    try {
      Logger.log('Getting competition signups for: ' + mcpsIdStr);
      competitionSignups = getStudentCompetitionSignups(mcpsIdStr);
      Logger.log('Competition signups retrieved: ' + competitionSignups.length + ' competitions');
    } catch (err) {
      Logger.log('Error getting competition signups: ' + err.toString());
    }

    // Check form completion status
    let formCompletion = null;
    try {
      Logger.log('Checking form completion for: ' + mcpsIdStr);
      formCompletion = checkFormCompletion(mcpsIdStr, studentInfo.name);
      Logger.log('Form completion status retrieved');
    } catch (err) {
      Logger.log('Error checking form completion: ' + err.toString());
    }

    // Get MATHCOUNTS results
    let mathcountsResults = null;
    try {
      Logger.log('Getting MATHCOUNTS results for: ' + mcpsIdStr);
      mathcountsResults = getMathcountsResults(mcpsIdStr);
      if (mathcountsResults) {
        Logger.log('MATHCOUNTS results retrieved: Sprint=' + mathcountsResults.sprintScore + ', Target=' + mathcountsResults.targetScore + ', Individual=' + mathcountsResults.individualScore + ', Rank=' + mathcountsResults.rank);
      } else {
        Logger.log('No MATHCOUNTS results found for this student');
      }
    } catch (err) {
      Logger.log('Error getting MATHCOUNTS results: ' + err.toString());
    }

    const result = {
      success: true,
      student: studentInfo,
      attendance: attendanceHistory,
      competitions: competitionSignups,
      forms: formCompletion,
      mathcounts: mathcountsResults
    };

    Logger.log('Returning result: ' + JSON.stringify(result));
    return result;

  } catch (error) {
    Logger.log('Fatal error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return {
      success: false,
      message: 'Error looking up student: ' + (error.message || 'Unknown error'),
      error: error.toString()
    };
  }
}

function getStudentAttendanceHistory(studentName) {
  try {
    const sheet = getAttendanceSheet();

    if (!sheet || sheet.getLastRow() <= 1) {
      return { totalMeetings: 0, dates: [] };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find the student's row
    let studentRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === studentName) {
        studentRowIndex = i;
        break;
      }
    }

    if (studentRowIndex === -1) {
      return { totalMeetings: 0, dates: [] };
    }

    const studentRow = data[studentRowIndex];
    const attendedDates = [];

    // Check each date column (starting from column 2, skipping Name and ID)
    for (let j = 2; j < headers.length; j++) {
      const cellValue = studentRow[j];
      if (cellValue && cellValue.toString().trim() !== '' && cellValue.toString().trim().toLowerCase() !== 'false') {
        // Handle different cell formats
        let checkInTime = '';
        let meetingType = 'Club Meeting';

        const cellStr = cellValue.toString();

        // If it contains " - ", parse as "time - meeting type"
        if (cellStr.includes(' - ')) {
          const valueParts = cellStr.split(' - ');
          checkInTime = valueParts[0] || '';
          meetingType = valueParts[1] || 'Club Meeting';
        } else if (cellStr.toLowerCase() === 'true' || cellStr === '1') {
          // Just a checkmark/true value - attended
          checkInTime = '';
          meetingType = 'Club Meeting';
        } else {
          // Some other text value
          checkInTime = cellStr;
          meetingType = 'Club Meeting';
        }

        // Format date properly
        let dateStr = headers[j];
        if (headers[j] instanceof Date) {
          dateStr = headers[j].toLocaleDateString();
        } else if (typeof headers[j] === 'string') {
          dateStr = headers[j];
        }

        attendedDates.push({
          date: dateStr,
          time: checkInTime,
          type: meetingType
        });
      }
    }

    return {
      totalMeetings: attendedDates.length,
      dates: attendedDates
    };

  } catch (error) {
    console.error('Error getting attendance history:', error);
    return { totalMeetings: 0, dates: [] };
  }
}

function getStudentCompetitionSignups(mcpsId) {
  try {
    const sheet = getCompetitionSignupSheet();

    // Initialize all competitions as not signed up
    const competitions = [
      { name: 'MATHCOUNTS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MCPS Math League', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MOEMS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'AMC 8', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false }
    ];

    if (!sheet || sheet.getLastRow() <= 1) {
      return competitions;
    }

    const data = sheet.getDataRange().getValues();

    // Find the most recent signup for this student
    // Columns: A=Timestamp, B=Name, C=MCPS ID, D=Grade, E=Parent Name, F=Parent Phone,
    //          G=MATHCOUNTS, H=Lunch, I=MOEMS, J=AMC 8, K=Math League
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[2] || '').toString().trim();

      if (studentId === mcpsId.toString().trim()) {
        // Helper function to check if value indicates waitlist status
        // Checks for "(Waitlisted)" or "waitlist" anywhere in the string
        function isOnWaitlist(value) {
          if (!value) return false;
          const lowerValue = value.toString().toLowerCase();
          return lowerValue.includes('waitlist') || /\(waitlist(ed)?\)/i.test(value.toString());
        }

        // Parse MATHCOUNTS
        const mathcounts = (row[6] || '').toString();
        const mathcountsLower = mathcounts.toLowerCase();
        if (mathcounts && !mathcountsLower.includes('no') && !mathcountsLower.includes('will not attend')) {
          const isWaitlisted = isOnWaitlist(mathcounts);
          Logger.log('MATHCOUNTS value: "' + mathcounts + '", isWaitlisted: ' + isWaitlisted);
          competitions[0] = {
            name: 'MATHCOUNTS',
            details: 'Yes - I will attend the School Competition on November 8th and if selected, pay the $40 fee to attend the Chapter Competition',
            status: isWaitlisted ? 'Waitlisted' : 'Signed Up',
            signedUp: true,
            waitlisted: isWaitlisted
          };
        }

        // Parse Math League
        const mathLeague = (row[10] || '').toString();
        if (mathLeague && !mathLeague.toLowerCase().includes('will not attend')) {
          const isWaitlisted = isOnWaitlist(mathLeague);
          const team = getMathLeagueTeam(mcpsId);
          Logger.log('Math League value: "' + mathLeague + '", isWaitlisted: ' + isWaitlisted + ', team: ' + team);
          competitions[1] = {
            name: 'MCPS Math League',
            details: mathLeague,
            status: isWaitlisted ? 'Waitlisted' : 'Signed Up',
            signedUp: true,
            waitlisted: isWaitlisted,
            team: team
          };
        }

        // Parse MOEMS
        const moems = (row[8] || '').toString();
        if (moems && !moems.toLowerCase().includes('will not attend')) {
          const isWaitlisted = isOnWaitlist(moems);
          Logger.log('MOEMS value: "' + moems + '", isWaitlisted: ' + isWaitlisted);
          competitions[2] = {
            name: 'MOEMS',
            details: moems,
            status: isWaitlisted ? 'Waitlisted' : 'Signed Up',
            signedUp: true,
            waitlisted: isWaitlisted
          };
        }

        // Parse AMC 8
        const amc8 = (row[9] || '').toString();
        if (amc8 && amc8.toLowerCase().includes('yes')) {
          const isWaitlisted = isOnWaitlist(amc8);
          Logger.log('AMC 8 value: "' + amc8 + '", isWaitlisted: ' + isWaitlisted);
          competitions[3] = {
            name: 'AMC 8',
            details: 'January 23, 2026',
            status: isWaitlisted ? 'Waitlisted' : 'Signed Up',
            signedUp: true,
            waitlisted: isWaitlisted
          };
        }

        // Only use the most recent signup
        break;
      }
    }

    return competitions;

  } catch (error) {
    console.error('Error getting competition signups:', error);
    return [
      { name: 'MATHCOUNTS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MCPS Math League', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MOEMS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'AMC 8', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false }
    ];
  }
}