// Math Club Parent Portal System
const REGISTRATION_SHEET_NAME = 'Form Responses 1';
const COMPETITION_SIGNUP_SHEET_NAME = 'Form Responses 2';
const ATTENDANCE_SHEET_NAME = 'Attendance Records';
const SCHOOL_LIST_SHEET_NAME = 'School List';

function doGet(e) {
  // Handle sign-up action
  if (e && e.parameter && e.parameter.action === 'signUpNoetic') {
    const mcpsId = e.parameter.mcpsId;
    const studentName = e.parameter.studentName;
    const grade = e.parameter.grade;
    const gradePreference = e.parameter.gradePreference || '';

    const result = signUpForNoetic(mcpsId, studentName, grade, gradePreference);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle grade preference update action
  if (e && e.parameter && e.parameter.action === 'updateNoeticGradePreference') {
    const mcpsId = e.parameter.mcpsId;
    const gradePreference = e.parameter.gradePreference || '';

    const result = updateNoeticGradePreference(mcpsId, gradePreference);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle Carderock sign-up action
  if (e && e.parameter && e.parameter.action === 'signUpCarderock') {
    const mcpsId = e.parameter.mcpsId;
    const studentName = e.parameter.studentName;
    const grade = e.parameter.grade;
    const result = signUpForCarderock(mcpsId, studentName, grade);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle Carderock drop action
  if (e && e.parameter && e.parameter.action === 'dropCarderock') {
    const mcpsId = e.parameter.mcpsId;
    const result = dropCarderockSignUp(mcpsId);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Default: Return HTML page
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

function testNoeticSheet() {
  const spreadsheet = getSpreadsheet();
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  Logger.log('Spreadsheet name: ' + spreadsheet.getName());

  const sheets = spreadsheet.getSheets();
  Logger.log('All sheets in spreadsheet:');
  for (let i = 0; i < sheets.length; i++) {
    Logger.log('  ' + (i + 1) + '. ' + sheets[i].getName());
  }

  const noeticSheet = getNoeticSheet();
  if (noeticSheet) {
    Logger.log('✓ Noetic sheet found!');
    Logger.log('Noetic sheet last row: ' + noeticSheet.getLastRow());
  } else {
    Logger.log('✗ Noetic sheet NOT found!');
  }
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

function getMoemsSheet() {
  return getSpreadsheet().getSheetByName('MOEMS');
}

function getMathKangarooSheet() {
  return getSpreadsheet().getSheetByName('Math Kangaroo');
}

function getAmc8Sheet() {
  return getSpreadsheet().getSheetByName('AMC 8');
}

function getNoeticSheet() {
  return getSpreadsheet().getSheetByName('Noetic');
}

function getMathLeagueTeam(mcpsId) {
  try {
    const sheet = getMathLeagueSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Columns: A=Name, B=ID, C=Grade, D=ARML Tracking, E=Meet 1 Team, G=Meet 2 Team, I=Meet 3 Team, K=Meet 4 Team
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        // Return most recent non-empty team assignment (check Meet 4, 3, 2, 1 in order)
        const meet4Team = (row[10] || '').toString().trim(); // Column K (index 10)
        const meet3Team = (row[8] || '').toString().trim();  // Column I (index 8)
        const meet2Team = (row[6] || '').toString().trim();  // Column G (index 6)
        const meet1Team = (row[4] || '').toString().trim();  // Column E (index 4)

        return meet4Team || meet3Team || meet2Team || meet1Team || null;
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting Math League team: ' + error.toString());
    return null;
  }
}

function getMathLeagueResults(mcpsId) {
  try {
    const sheet = getMathLeagueSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Columns: A=Name, B=ID, C=Grade, D=ARML Tracking
    // E=Meet 1 Team, F=Meet 1 score, G=Meet 2 Team, H=Meet 2 score
    // I=Meet 3 Team, J=Meet 3 score, K=Meet 4 Team, L=Meet 4 score, M=Total score
    // Team scores start at Column O (index 14): O=Team, P-T=Meet 1 scores, U-Y=Meet 2, Z-AD=Meet 3, AE-AI=Meet 4
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        const armlTracking = (row[3] || '').toString().trim(); // Column D (index 3)

        // Parse ARML tracking - check for "Yes", "Y", "TRUE", or true
        // Also check if it's a number (ARML Qualifier score)
        let isArmlTracked = false;
        let armlQualifierScore = null;

        if (armlTracking) {
          const numValue = parseFloat(armlTracking);
          if (!isNaN(numValue) && armlTracking !== '') {
            // It's a number - treat as qualifier score and set tracked to true
            armlQualifierScore = numValue;
            isArmlTracked = true;
          } else if (armlTracking.toLowerCase() === 'yes' ||
                     armlTracking.toLowerCase() === 'y' ||
                     armlTracking.toLowerCase() === 'true' ||
                     armlTracking === true) {
            // It's an explicit "yes" - set tracked to true
            isArmlTracked = true;
          }
        }

        // Helper function to parse meet score
        function parseMeetScore(val) {
          if (val === undefined || val === '') {
            return null; // Score not entered yet
          }
          const valStr = val.toString().toUpperCase().trim();
          if (valStr === 'NA') {
            return 'NA'; // Student did not attend
          }
          const score = parseFloat(valStr);
          if (!isNaN(score)) {
            return score;
          }
          return null;
        }

        // Parse team assignments and individual scores per meet
        const meet1Team = (row[4] || '').toString().trim();  // Column E (index 4)
        const meet1Individual = parseMeetScore(row[5]);      // Column F (index 5)
        const meet2Team = (row[6] || '').toString().trim();  // Column G (index 6)
        const meet2Individual = parseMeetScore(row[7]);      // Column H (index 7)
        const meet3Team = (row[8] || '').toString().trim();  // Column I (index 8)
        const meet3Individual = parseMeetScore(row[9]);      // Column J (index 9)
        const meet4Team = (row[10] || '').toString().trim(); // Column K (index 10)
        const meet4Individual = parseMeetScore(row[11]);     // Column L (index 11)
        const cumulativeIndividualScore = parseMeetScore(row[12]); // Column M (index 12)

        const meetTeams = [meet1Team, meet2Team, meet3Team, meet4Team];
        const meetScores = [meet1Individual, meet2Individual, meet3Individual, meet4Individual];

        // Get team scores for each meet
        // Team A=row 2, Team B=row 3, Team C=row 4, JV A=row 5, JV B=row 6, JV C=row 7, JV Mixed=row 8
        const teamRowMap = {
          'A': 1,
          'B': 2,
          'C': 3,
          'JV A': 4,
          'JV B': 5,
          'JV C': 6,
          'JV Mixed': 7
        };

        // Build team results for each meet
        const teamResults = [];
        for (let meetIndex = 0; meetIndex < 4; meetIndex++) {
          const meetTeam = meetTeams[meetIndex];

          if (meetTeam) {
            const teamRowIndex = teamRowMap[meetTeam];
            if (teamRowIndex !== undefined && data.length > teamRowIndex) {
              const teamRow = data[teamRowIndex];

              // Team results columns:
              // Meet 1: P-T (indices 15-19)
              // Meet 2: U-Y (indices 20-24)
              // Meet 3: Z-AD (indices 25-29)
              // Meet 4: AE-AI (indices 30-34)
              const baseCol = 15 + (meetIndex * 5); // P=15, U=20, Z=25, AE=30
              teamResults.push({
                team: meetTeam,
                teamScore: teamRow[baseCol] !== undefined && teamRow[baseCol] !== '' ? parseFloat(teamRow[baseCol]) : null,
                relay1Score: teamRow[baseCol + 1] !== undefined && teamRow[baseCol + 1] !== '' ? parseFloat(teamRow[baseCol + 1]) : null,
                relay2Score: teamRow[baseCol + 2] !== undefined && teamRow[baseCol + 2] !== '' ? parseFloat(teamRow[baseCol + 2]) : null,
                teamIndividualScore: teamRow[baseCol + 3] !== undefined && teamRow[baseCol + 3] !== '' ? parseFloat(teamRow[baseCol + 3]) : null,
                teamTotalScore: teamRow[baseCol + 4] !== undefined && teamRow[baseCol + 4] !== '' ? parseFloat(teamRow[baseCol + 4]) : null,
                maxTeamScore: 12,
                maxRelayScore: 8,
                maxTeamTotal: 64
              });
            } else {
              // Team assignment exists but not in teamRowMap (e.g., "Individual")
              // Still include the team name so the UI can detect it
              teamResults.push({
                team: meetTeam,
                teamScore: null,
                relay1Score: null,
                relay2Score: null,
                teamIndividualScore: null,
                teamTotalScore: null,
                maxTeamScore: 12,
                maxRelayScore: 8,
                maxTeamTotal: 64
              });
            }
          } else {
            // Student not assigned to a team for this meet
            teamResults.push(null);
          }
        }

        // Get the most recent team assignment for backward compatibility
        const currentTeam = meet4Team || meet3Team || meet2Team || meet1Team || null;

        return {
          team: currentTeam, // Most recent team for backward compatibility
          armlTracked: isArmlTracked,
          armlQualifierScore: armlQualifierScore,
          cumulativeIndividualScore: cumulativeIndividualScore,
          meetScores: meetScores,
          teamResults: teamResults
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting Math League results: ' + error.toString());
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
    // School Competition: A=Name, B=ID, G=Sprint Round, H=Target Round, I=Individual Score, J=Rank, K=Chapter Advancement
    // Chapter Competition: O=Chapter Sprint Round, P=Chapter Target Round, Q=Chapter Individual Score, S=Chapter Team Score, T=State advancement
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        // School Competition Results
        const sprintScore = row[6] !== undefined && row[6] !== '' ? parseFloat(row[6]) : null;
        const targetScore = row[7] !== undefined && row[7] !== '' ? parseFloat(row[7]) : null;
        const individualScore = row[8] !== undefined && row[8] !== '' ? parseFloat(row[8]) : null;
        const rank = row[9] !== undefined && row[9] !== '' ? parseInt(row[9]) : null;
        const chapterStatus = row[10] !== undefined && row[10] !== '' ? row[10].toString().trim() : null;

        // Check if student can attend chapter competition
        const canAttendChapter = chapterStatus && chapterStatus !== 'Not able to attend';

        // Chapter Competition Results (only if advancing and able to attend)
        let chapterResults = null;
        if (canAttendChapter) {
          const chapterSprint = row[14] !== undefined && row[14] !== '' ? parseFloat(row[14]) : null; // Column O (index 14)
          const chapterTarget = row[15] !== undefined && row[15] !== '' ? parseFloat(row[15]) : null;  // Column P (index 15)
          const chapterIndividual = row[16] !== undefined && row[16] !== '' ? parseFloat(row[16]) : null; // Column Q (index 16)

          // Team scores (from row 2 - index 1, columns R and S)
          // Only include if student is on the team (chapterStatus contains "Team")
          let chapterTeamRound = null;
          let chapterTeamScore = null;
          const isOnTeam = chapterStatus && chapterStatus.toLowerCase().includes('team');
          if (isOnTeam && data.length > 1) {
            const row2 = data[1];
            chapterTeamRound = row2[17] !== undefined && row2[17] !== '' ? parseFloat(row2[17]) : null; // Column R (index 17)
            chapterTeamScore = row2[18] !== undefined && row2[18] !== '' ? parseFloat(row2[18]) : null;  // Column S (index 18)
          }

          chapterResults = {
            sprintScore: chapterSprint,
            targetScore: chapterTarget,
            individualScore: chapterIndividual,
            teamRound: chapterTeamRound,
            teamScore: chapterTeamScore,
            maxSprint: 30,
            maxTarget: 16,
            maxIndividual: 46,
            maxTeamRound: 20,
            maxTeamScore: 64
          };
        }

        // State competition advancement
        const stateAdvancement = row[19] !== undefined && row[19] !== '' ? row[19].toString().trim() : null; // Column T (index 19)

        // State Level Results (columns U, V, W = indices 20, 21, 22)
        let stateResults = null;
        if (stateAdvancement) {
          const stateSprint = row[20] !== undefined && row[20] !== '' ? parseFloat(row[20]) : null; // Column U (index 20)
          const stateTarget = row[21] !== undefined && row[21] !== '' ? parseFloat(row[21]) : null; // Column V (index 21)
          const stateIndividual = row[22] !== undefined && row[22] !== '' ? parseFloat(row[22]) : null; // Column W (index 22)
          if (stateSprint !== null || stateTarget !== null || stateIndividual !== null) {
            stateResults = {
              sprintScore: stateSprint,
              targetScore: stateTarget,
              individualScore: stateIndividual,
              maxSprint: 30,
              maxTarget: 16,
              maxIndividual: 46
            };
          }
        }

        // Column M (index 12) = Fee Required, Column N (index 13) = Fee Paid
        const feeRequired = row[12] !== undefined && row[12] !== '' ? row[12].toString().trim().toUpperCase() : null;
        const feePaid = row[13] !== undefined && row[13] !== '' ? row[13].toString().trim() : null;

        // Only include fee info if it's not "NA"
        let feeInfo = null;
        if (feeRequired && feeRequired !== 'NA') {
          // Parse fee paid status - check for "Yes", "Y", "Paid", or TRUE
          const isPaid = feePaid &&
            (feePaid.toLowerCase() === 'yes' ||
             feePaid.toLowerCase() === 'y' ||
             feePaid.toLowerCase() === 'paid' ||
             feePaid.toLowerCase() === 'true' ||
             feePaid === true);

          feeInfo = {
            required: true,
            paid: isPaid
          };
        }

        return {
          sprintScore: sprintScore,
          targetScore: targetScore,
          individualScore: individualScore,
          rank: rank,
          chapterStatus: chapterStatus,
          chapterResults: chapterResults,
          stateAdvancement: stateAdvancement,
          stateResults: stateResults,
          feeInfo: feeInfo,
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

function getMoemsResults(mcpsId) {
  try {
    const sheet = getMoemsSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Look for student by MCPS ID in column B
    // Columns: A=Name, B=ID, C=Grade, D-H=Contest 1-5 scores, I=Total, J=Fee, K=Paid
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        // Parse contest scores
        const contest1 = row[3]; // Column D (index 3)
        const contest2 = row[4]; // Column E (index 4)
        const contest3 = row[5]; // Column F (index 5)
        const contest4 = row[6]; // Column G (index 6)
        const contest5 = row[7]; // Column H (index 7)
        const total = row[8]; // Column I (index 8)
        const fee = row[9]; // Column J (index 9)
        const feePaid = row[10]; // Column K (index 10)
        const team = row[11] ? row[11].toString().trim() : null; // Column L (index 11)
        const usedInTeamScore = row[12] ? row[12].toString().trim() : null; // Column M (index 12)

        // Helper function to parse contest value
        // Returns: { attended: boolean, score: number|null }
        function parseContestValue(val) {
          if (val === undefined || val === '') {
            return { attended: true, score: null }; // Blank = will attend, score not entered yet
          }
          const valStr = val.toString().toUpperCase().trim();
          if (valStr === 'NA') {
            return { attended: false, score: null }; // NA = will not attend
          }
          // Try to parse as number
          const score = parseFloat(valStr);
          if (!isNaN(score)) {
            return { attended: true, score: score };
          }
          // Unknown value, treat as attending with no score
          return { attended: true, score: null };
        }

        const contests = [
          parseContestValue(contest1),
          parseContestValue(contest2),
          parseContestValue(contest3),
          parseContestValue(contest4),
          parseContestValue(contest5)
        ];

        // Parse total score
        let totalScore = null;
        if (total !== undefined && total !== '') {
          const parsedTotal = parseFloat(total.toString());
          if (!isNaN(parsedTotal)) {
            totalScore = parsedTotal;
          }
        }

        // Parse fee amount
        let feeAmount = null;
        if (fee !== undefined && fee !== '') {
          const feeStr = fee.toString().trim();
          // Extract number from string like "$5" or "5" or "$25" or "25"
          const feeMatch = feeStr.match(/\d+/);
          if (feeMatch) {
            feeAmount = parseFloat(feeMatch[0]);
          }
        }

        // Parse fee paid status - check for TRUE, "true", "Yes", "Y", etc.
        Logger.log('MOEMS Fee Paid raw value: ' + feePaid + ' (type: ' + typeof feePaid + ')');

        let isPaid = false;
        if (feePaid !== undefined && feePaid !== null && feePaid !== '') {
          if (feePaid === true || feePaid === 'TRUE') {
            isPaid = true;
          } else if (typeof feePaid === 'string') {
            const feeStr = feePaid.toString().toLowerCase().trim();
            isPaid = feeStr === 'true' || feeStr === 'yes' || feeStr === 'y' || feeStr === 'paid';
          }
        }

        Logger.log('MOEMS Fee Paid parsed value: ' + isPaid);

        return {
          contests: contests,
          totalScore: totalScore,
          maxContestScore: 5,
          maxTotalScore: 25,
          fee: feeAmount,
          feePaid: isPaid,
          team: team,
          usedInTeamScore: usedInTeamScore
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting MOEMS results: ' + error.toString());
    return null;
  }
}

function getMathKangarooResults(studentName) {
  try {
    const sheet = getMathKangarooSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();
    const cleanStudentName = (studentName || '').toString().trim().toLowerCase();

    // Look for student by name in column A
    // Columns: A=Name, B=MK ID, C=(unused), D=Username, E=Password
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = (row[0] || '').toString().trim().toLowerCase();

      if (name === cleanStudentName) {
        const mkId = row[1] !== undefined && row[1] !== '' ? row[1].toString().trim() : null;
        const username = row[3] !== undefined && row[3] !== '' ? row[3].toString().trim() : null;
        const password = row[4] !== undefined && row[4] !== '' ? row[4].toString().trim() : null;

        return {
          registered: true,
          mkId: mkId,
          username: username,
          password: password
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting Math Kangaroo results: ' + error.toString());
    return null;
  }
}

function getAmc8Results(mcpsId) {
  try {
    const sheet = getAmc8Sheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Look for student by MCPS ID in column B
    // Columns: A=Name, B=ID, C=Grade, D=Score (out of 25), E=?, F=PDF Link
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim(); // Column B (index 1)

      if (studentId === mcpsId.toString().trim()) {
        const score = row[3] ? parseInt(row[3]) : null; // Column D (index 3) - the score
        const pdfLink = (row[5] || '').toString().trim(); // Column F (index 5) - the PDF link

        return {
          score: score,
          pdfLink: pdfLink || null
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting AMC 8 results: ' + error.toString());
    return null;
  }
}

function getNoeticSignUpCounts() {
  try {
    const sheet = getNoeticSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return {
        total: 0,
        by6th: 0,
        by7th: 0,
        byMixed: 0,
        costPerStudent: 0
      };
    }

    const data = sheet.getDataRange().getValues();
    let count6th = 0;
    let count7th = 0;
    let countMixed = 0;

    // Count sign-ups by grade preference (column H, index 7)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const gradePreference = (row[7] || '').toString().trim().toLowerCase();
      const grade = (row[2] || '').toString().trim();

      if (gradePreference === 'own' && grade === '6') {
        count6th++;
      } else if (gradePreference === 'own' && grade === '7') {
        count7th++;
      } else if (gradePreference === 'mixed') {
        countMixed++;
      }
    }

    const totalSignUps = count6th + count7th + countMixed;
    const costPerStudent = totalSignUps > 0 ? Math.round((99 / totalSignUps) * 100) / 100 : 0;

    Logger.log('Noetic sign-up counts - 6th: ' + count6th + ', 7th: ' + count7th + ', mixed: ' + countMixed + ', total: ' + totalSignUps);

    return {
      total: totalSignUps,
      by6th: count6th,
      by7th: count7th,
      byMixed: countMixed,
      costPerStudent: costPerStudent
    };
  } catch (error) {
    Logger.log('Error getting Noetic sign-up counts: ' + error.toString());
    return {
      total: 0,
      by6th: 0,
      by7th: 0,
      byMixed: 0,
      costPerStudent: 0
    };
  }
}

function getNoeticResults(mcpsId) {
  try {
    const sheet = getNoeticSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    // Columns: A=Name, B=MCPS ID, C=Grade, D=Timestamp, E=Grade Preference, F=Contest Grade Level, G=Publish Permission, H=Username, I=Password, J=Score, K=PDF Link
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim();

      if (studentId === mcpsId.toString().trim()) {
        const signUpDate = row[3] || null;
        const gradePreference = (row[4] || '').toString().trim().toLowerCase();
        const contestGrade = (row[5] || '').toString().trim();
        const publishPermission = (row[6] || '').toString().trim().toLowerCase() || null;
        const username = (row[7] || '').toString().trim() || null;
        const password = (row[8] || '').toString().trim() || null;
        const score = row[9] !== undefined && row[9] !== '' ? parseInt(row[9]) : null;
        const pdfLink = (row[10] || '').toString().trim() || null;

        // Get current sign-up counts for display
        const counts = getNoeticSignUpCounts();

        return {
          signedUp: true,
          signUpDate: signUpDate,
          gradePreference: gradePreference,
          contestGrade: contestGrade,
          publishPermission: publishPermission,
          username: username,
          password: password,
          score: score,
          pdfLink: pdfLink,
          maxScore: 20,
          signUpCounts: counts
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error getting Noetic results: ' + error.toString());
    return null;
  }
}

function signUpForNoetic(mcpsId, studentName, grade, gradePreference) {
  Logger.log('=== signUpForNoetic called ===');
  Logger.log('Parameters - mcpsId: ' + mcpsId + ', studentName: ' + studentName + ', grade: ' + grade + ', gradePreference: ' + gradePreference);

  try {
    const sheet = getNoeticSheet();
    Logger.log('Sheet retrieved: ' + (sheet ? 'YES' : 'NO'));

    if (!sheet) {
      Logger.log('Sheet is null/undefined!');
      return {
        success: false,
        message: 'Noetic sheet not found. Please contact the math coach.'
      };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    Logger.log('MCPS ID string: ' + mcpsIdStr);

    // Check if student already signed up
    const data = sheet.getDataRange().getValues();
    Logger.log('Data retrieved, rows: ' + data.length);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingId = (row[1] || '').toString().trim();

      if (existingId === mcpsIdStr) {
        Logger.log('Duplicate found at row ' + (i + 1));
        return {
          success: false,
          message: 'You are already signed up for Noetic Learning Math Contest!'
        };
      }
    }

    // Add new sign-up row
    const timestamp = new Date();
    const newRow = [
      studentName,        // A: Name
      mcpsIdStr,          // B: MCPS ID
      grade || '',        // C: Grade
      timestamp,          // D: Sign-up Timestamp
      '',                 // E: Score (empty)
      '',                 // F: PDF Link (empty)
      '',                 // G: Fee Paid (empty)
      gradePreference     // H: Grade Preference (own or mixed)
    ];

    Logger.log('About to append row: ' + JSON.stringify(newRow));
    sheet.appendRow(newRow);
    Logger.log('Row appended successfully');

    Logger.log('Noetic sign-up successful: ' + studentName + ' (' + mcpsIdStr + ') - Grade Preference: ' + gradePreference);

    return {
      success: true,
      message: 'Successfully signed up for Noetic Learning Math Contest!'
    };

  } catch (error) {
    Logger.log('ERROR in signUpForNoetic: ' + error.toString());
    Logger.log('Error name: ' + error.name);
    Logger.log('Error message: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      message: 'An error occurred during sign-up. Please try again or contact the math coach. Error: ' + error.toString()
    };
  }
}

function updateNoeticGradePreference(mcpsId, gradePreference) {
  try {
    const sheet = getNoeticSheet();

    if (!sheet) {
      return {
        success: false,
        message: 'Noetic sheet not found. Please contact the math coach.'
      };
    }

    const mcpsIdStr = mcpsId.toString().trim();

    // Check registration deadline
    const today = new Date();
    const deadline = new Date('2026-03-01T23:59:59');
    if (today > deadline) {
      return {
        success: false,
        message: 'Registration deadline has passed. You can no longer change your grade preference.'
      };
    }

    // Find and update the student's row
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim();

      if (studentId === mcpsIdStr) {
        // Update grade preference in column H (index 7)
        sheet.getRange(i + 1, 8).setValue(gradePreference);

        Logger.log('Noetic grade preference updated: ' + mcpsIdStr + ' -> ' + gradePreference);

        return {
          success: true,
          message: 'Grade preference updated successfully!'
        };
      }
    }

    return {
      success: false,
      message: 'Student not found in sign-up list.'
    };

  } catch (error) {
    Logger.log('Error updating Noetic grade preference: ' + error.toString());
    return {
      success: false,
      message: 'An error occurred updating your preference. Please try again or contact the math coach.'
    };
  }
}

function dropNoeticSignUp(mcpsId) {
  try {
    const sheet = getNoeticSheet();

    if (!sheet) {
      return {
        success: false,
        message: 'Noetic sheet not found. Please contact the math coach.'
      };
    }

    const mcpsIdStr = mcpsId.toString().trim();

    // Check registration deadline
    const today = new Date();
    const deadline = new Date('2026-03-01T23:59:59');
    if (today > deadline) {
      return {
        success: false,
        message: 'Registration deadline has passed. You can no longer drop your sign-up.'
      };
    }

    // Find and delete the student's row
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = (row[1] || '').toString().trim();

      if (studentId === mcpsIdStr) {
        // Delete this row
        sheet.deleteRow(i + 1);
        Logger.log('Noetic sign-up dropped for: ' + studentId);
        return {
          success: true,
          message: 'Successfully dropped Noetic Learning Math Contest sign-up.'
        };
      }
    }

    return {
      success: false,
      message: 'Sign-up not found. Please contact the math coach.'
    };

  } catch (error) {
    Logger.log('Error dropping Noetic sign-up: ' + error.toString());
    return {
      success: false,
      message: 'An error occurred dropping your sign-up. Please try again or contact the math coach.'
    };
  }
}

function submitNoeticPermission(mcpsId, permission) {
  try {
    const sheet = getNoeticSheet();
    if (!sheet) {
      return { success: false, message: 'Noetic sheet not found. Please contact the math coach.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    const permissionValue = permission === 'yes' ? 'yes' : (permission === 'no' ? 'no' : '');

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const studentId = (data[i][1] || '').toString().trim();
      if (studentId === mcpsIdStr) {
        sheet.getRange(i + 1, 7).setValue(permissionValue); // Column G
        Logger.log('Noetic permission recorded: ' + mcpsIdStr + ' -> ' + permissionValue);
        return { success: true, permission: permissionValue };
      }
    }

    return { success: false, message: 'Student not found in Noetic roster.' };
  } catch (error) {
    Logger.log('Error submitting Noetic permission: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

// ==================== Carderock Math Contest ====================

function getCarderockSheet() {
  return getSpreadsheet().getSheetByName('Carderock');
}

function isCarderockDeadlinePassed() {
  return new Date() > new Date('2026-04-13T23:59:59');
}

function getCarderockResults(mcpsId) {
  try {
    const sheet = getCarderockSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { signedUp: false, totalSignUps: 0 };
    }

    const data = sheet.getDataRange().getValues();
    const mcpsIdStr = mcpsId.toString().trim();

    let totalSignUps = 0;
    let studentRow = null;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const id = (row[1] || '').toString().trim();
      if (id) totalSignUps++;
      if (id === mcpsIdStr) studentRow = row;
    }

    if (!studentRow) {
      return { signedUp: false, totalSignUps: totalSignUps };
    }

    const rawDate = studentRow[3];
    const signUpDate = rawDate ? (rawDate instanceof Date ? rawDate.toLocaleDateString() : rawDate.toString()) : null;

    return {
      signedUp: true,
      signUpDate: signUpDate,
      status: (studentRow[4] || '').toString().trim() || null,
      team: (studentRow[5] || '').toString().trim() || null,
      permissionSlipLink: (studentRow[6] || '').toString().trim() || null,
      totalSignUps: totalSignUps
    };
  } catch (error) {
    Logger.log('Error getting Carderock results: ' + error.toString());
    return null;
  }
}

function signUpForCarderock(mcpsId, studentName, grade) {
  try {
    const sheet = getCarderockSheet();
    if (!sheet) {
      return { success: false, message: 'Carderock sheet not found. Please contact the math coach.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();

    if (isCarderockDeadlinePassed()) {
      return { success: false, message: 'The interest deadline (April 13, 2026) has passed.' };
    }

    // Check if already signed up, and count total sign-ups
    let totalSignUps = 0;
    if (sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if ((data[i][1] || '').toString().trim()) totalSignUps++;
        const id = (data[i][1] || '').toString().trim();
        if (id === mcpsIdStr) {
          return { success: false, message: 'You are already on the interest list.' };
        }
      }
    }

    if (totalSignUps >= 8) {
      return { success: false, message: 'All 8 spots are filled. Interest is now closed.' };
    }

    sheet.appendRow([studentName, mcpsIdStr, grade, new Date(), '', '']);
    Logger.log('Carderock sign-up added: ' + mcpsIdStr);
    return { success: true, message: 'Successfully added to the Carderock interest list!' };

  } catch (error) {
    Logger.log('Error signing up for Carderock: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again or contact the math coach.' };
  }
}

function dropCarderockSignUp(mcpsId) {
  try {
    const sheet = getCarderockSheet();
    if (!sheet) {
      return { success: false, message: 'Carderock sheet not found. Please contact the math coach.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();

    if (isCarderockDeadlinePassed()) {
      return { success: false, message: 'The interest deadline (April 13, 2026) has passed. Please contact the math coach to make changes.' };
    }

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const id = (data[i][1] || '').toString().trim();
      if (id === mcpsIdStr) {
        sheet.deleteRow(i + 1);
        Logger.log('Carderock sign-up dropped: ' + mcpsIdStr);
        return { success: true, message: 'Removed from the Carderock interest list.' };
      }
    }

    return { success: false, message: 'Sign-up not found. Please contact the math coach.' };

  } catch (error) {
    Logger.log('Error dropping Carderock sign-up: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again or contact the math coach.' };
  }
}

// ==================== Purple Comet Math Meet ====================

function getPurpleCometSheet() {
  return getSpreadsheet().getSheetByName('Purple Comet');
}

function isPurpleCometDeadlinePassed() {
  const now = new Date();
  const deadline = new Date('2026-04-17T23:59:59');
  return now > deadline;
}

function getPurpleCometResults(mcpsId) {
  try {
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return {
        myTeam: null,
        pendingInvites: [],
        allTeams: []
      };
    }

    const data = sheet.getDataRange().getValues();
    const mcpsIdStr = mcpsId.toString().trim();

    // Build team map: teamName -> { teamType, rows: [{ mcpsId, name, grade, role, timestamp }] }
    const teamMap = {};
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const teamName = (row[0] || '').toString().trim();
      const rowMcpsId = (row[1] || '').toString().trim();
      const studentName = (row[2] || '').toString().trim();
      const grade = (row[3] || '').toString().trim();
      const role = (row[4] || '').toString().trim().toLowerCase();
      const teamType = (row[5] || '').toString().trim().toLowerCase();
      const timestamp = row[6] || '';
      const loginName = (row[7] || '').toString().trim();
      const password = (row[8] || '').toString().trim();
      const submissionLink = (row[9] || '').toString().trim();
      const scoreReportLink = (row[10] || '').toString().trim();
      const certificateLink = (row[11] || '').toString().trim();
      const teamScore = (row[12] !== undefined && row[12] !== '') ? row[12].toString().trim() : '';
      const overallRank = (row[13] !== undefined && row[13] !== '') ? row[13].toString().trim() : '';
      const countryRank = (row[14] !== undefined && row[14] !== '') ? row[14].toString().trim() : '';
      const stateRank = (row[15] !== undefined && row[15] !== '') ? row[15].toString().trim() : '';

      if (!teamName) continue;

      if (!teamMap[teamName]) {
        teamMap[teamName] = { teamType: teamType, loginName: loginName, password: password, submissionLink: submissionLink, scoreReportLink: scoreReportLink, certificateLink: certificateLink, teamScore: teamScore, overallRank: overallRank, countryRank: countryRank, stateRank: stateRank, rows: [] };
      } else {
        if (submissionLink && !teamMap[teamName].submissionLink) teamMap[teamName].submissionLink = submissionLink;
        if (scoreReportLink && !teamMap[teamName].scoreReportLink) teamMap[teamName].scoreReportLink = scoreReportLink;
        if (certificateLink && !teamMap[teamName].certificateLink) teamMap[teamName].certificateLink = certificateLink;
        if (teamScore && !teamMap[teamName].teamScore) teamMap[teamName].teamScore = teamScore;
        if (overallRank && !teamMap[teamName].overallRank) teamMap[teamName].overallRank = overallRank;
        if (countryRank && !teamMap[teamName].countryRank) teamMap[teamName].countryRank = countryRank;
        if (stateRank && !teamMap[teamName].stateRank) teamMap[teamName].stateRank = stateRank;
      }
      teamMap[teamName].rows.push({
        mcpsId: rowMcpsId,
        name: studentName,
        grade: grade,
        role: role,
        timestamp: timestamp
      });
    }

    let myTeam = null;
    const pendingInvites = [];

    // Find student's team (creator or member) and pending invites
    for (const [teamName, teamData] of Object.entries(teamMap)) {
      for (const row of teamData.rows) {
        if (row.mcpsId === mcpsIdStr) {
          if (row.role === 'creator' || row.role === 'member') {
            // Build members list for this team
            const members = teamData.rows.map(r => ({
              mcpsId: r.mcpsId,
              name: r.name,
              grade: r.grade,
              role: r.role
            }));
            myTeam = {
              teamName: teamName,
              teamType: teamData.teamType,
              role: row.role,
              members: members,
              loginName: teamData.loginName,
              password: teamData.password,
              submissionLink: teamData.submissionLink,
              scoreReportLink: teamData.scoreReportLink,
              certificateLink: teamData.certificateLink,
              teamScore: teamData.teamScore,
              overallRank: teamData.overallRank,
              countryRank: teamData.countryRank,
              stateRank: teamData.stateRank
            };
          } else if (row.role === 'invited') {
            pendingInvites.push({
              teamName: teamName,
              teamType: teamData.teamType
            });
          }
        }
      }
    }

    // Build allTeams list
    const allTeams = [];
    for (const [teamName, teamData] of Object.entries(teamMap)) {
      const activeMembers = teamData.rows.filter(r => r.role === 'creator' || r.role === 'member');
      allTeams.push({
        teamName: teamName,
        teamType: teamData.teamType,
        memberCount: activeMembers.length,
        isFull: activeMembers.length >= 6,
        members: activeMembers.map(r => ({ name: r.name, grade: r.grade }))
      });
    }

    return {
      myTeam: myTeam,
      pendingInvites: pendingInvites,
      allTeams: allTeams
    };
  } catch (error) {
    Logger.log('Error getting Purple Comet results: ' + error.toString());
    return {
      myTeam: null,
      pendingInvites: [],
      allTeams: []
    };
  }
}

function getAvailableStudents() {
  try {
    const attendanceSheet = getAttendanceSheet();
    if (!attendanceSheet || attendanceSheet.getLastRow() < 3) {
      return [];
    }

    // Row 1 is header, row 2 is attendance count — student data starts at row 3
    const data = attendanceSheet.getRange(3, 1, attendanceSheet.getLastRow() - 2, 2).getValues();

    // Build roster from Attendance Records (col A = name, col B = student ID)
    const studentMap = {};
    for (let i = 0; i < data.length; i++) {
      const name = (data[i][0] || '').toString().trim();
      const mcpsId = (data[i][1] || '').toString().trim();

      if (!mcpsId || !name) continue;
      studentMap[mcpsId] = { mcpsId: mcpsId, name: name };
    }

    // Get Purple Comet data to exclude students already on a team
    const pcSheet = getPurpleCometSheet();
    const onTeamIds = new Set();
    if (pcSheet && pcSheet.getLastRow() > 1) {
      const pcData = pcSheet.getDataRange().getValues();
      for (let i = 1; i < pcData.length; i++) {
        const role = (pcData[i][4] || '').toString().trim().toLowerCase();
        const id = (pcData[i][1] || '').toString().trim();
        if (role === 'creator' || role === 'member') {
          onTeamIds.add(id);
        }
      }
    }

    // Filter out students on a team, sort alphabetically
    const available = Object.values(studentMap)
      .filter(s => !onTeamIds.has(s.mcpsId))
      .map(s => ({ mcpsId: s.mcpsId, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return available;
  } catch (error) {
    Logger.log('Error getting available students: ' + error.toString());
    return [];
  }
}

function createPurpleCometTeam(mcpsId, studentName, grade, teamName, teamType) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    teamName = (teamName || '').trim();
    teamType = (teamType || '').trim().toLowerCase();

    // Validate team name
    if (!teamName || teamName.length < 1 || teamName.length > 30) {
      return { success: false, message: 'Team name must be 1-30 characters.' };
    }
    if (!/^[a-zA-Z0-9 \-_]+$/.test(teamName)) {
      return { success: false, message: 'Team name can only contain letters, numbers, spaces, hyphens, and underscores.' };
    }

    // Validate team type
    if (teamType !== 'open' && teamType !== 'invite') {
      return { success: false, message: 'Team type must be "open" or "invite".' };
    }

    let sheet = getPurpleCometSheet();
    if (!sheet) {
      // Create the sheet with headers
      sheet = getSpreadsheet().insertSheet('Purple Comet');
      const headers = ['Team Name', 'MCPS ID', 'Student Name', 'Grade', 'Role', 'Team Type', 'Timestamp'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // Check if student is already on a team
    if (sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const rowId = (data[i][1] || '').toString().trim();
        const role = (data[i][4] || '').toString().trim().toLowerCase();
        if (rowId === mcpsIdStr && (role === 'creator' || role === 'member')) {
          return { success: false, message: 'You are already on a team. Leave your current team first.' };
        }
      }

      // Check team name uniqueness (case-insensitive)
      const teamNameLower = teamName.toLowerCase();
      for (let i = 1; i < data.length; i++) {
        const existingName = (data[i][0] || '').toString().trim().toLowerCase();
        if (existingName === teamNameLower) {
          return { success: false, message: 'A team with this name already exists. Please choose a different name.' };
        }
      }
    }

    // Delete any pending invites for this student (bottom-to-top)
    if (sheet.getLastRow() > 1) {
      const freshData = sheet.getDataRange().getValues();
      const inviteRowsToDelete = [];
      for (let i = 1; i < freshData.length; i++) {
        const rowId = (freshData[i][1] || '').toString().trim();
        const role = (freshData[i][4] || '').toString().trim().toLowerCase();
        if (rowId === mcpsIdStr && role === 'invited') {
          inviteRowsToDelete.push(i + 1);
        }
      }
      inviteRowsToDelete.sort((a, b) => b - a);
      for (const rowNum of inviteRowsToDelete) {
        sheet.deleteRow(rowNum);
      }
    }

    // Create the team
    sheet.appendRow([teamName, mcpsIdStr, studentName, grade, 'creator', teamType, new Date()]);
    Logger.log('Purple Comet team created: ' + teamName + ' by ' + studentName + ' (' + mcpsIdStr + ')');

    return { success: true, message: 'Team "' + teamName + '" created successfully!' };
  } catch (error) {
    Logger.log('Error creating Purple Comet team: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function joinPurpleCometTeam(mcpsId, studentName, grade, teamName) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'Team not found.' };
    }

    const data = sheet.getDataRange().getValues();

    // Check student not already on a team
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === mcpsIdStr && (role === 'creator' || role === 'member')) {
        return { success: false, message: 'You are already on a team.' };
      }
    }

    // Find the team and validate
    let teamFound = false;
    let teamType = '';
    let activeCount = 0;
    let inviteRowToDelete = -1;

    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      if (rowTeam.toLowerCase() === teamName.toLowerCase()) {
        teamFound = true;
        teamType = (data[i][5] || '').toString().trim().toLowerCase();
        const role = (data[i][4] || '').toString().trim().toLowerCase();
        if (role === 'creator' || role === 'member') {
          activeCount++;
        }
        // Check if student has a pending invite for this team
        const rowId = (data[i][1] || '').toString().trim();
        if (rowId === mcpsIdStr && role === 'invited') {
          inviteRowToDelete = i + 1; // 1-based row number
        }
      }
    }

    if (!teamFound) {
      return { success: false, message: 'Team not found.' };
    }
    if (teamType !== 'open') {
      return { success: false, message: 'This team is invite-only. You must be invited to join.' };
    }
    if (activeCount >= 6) {
      return { success: false, message: 'This team is full (6/6 members).' };
    }

    // Collect all rows to delete: invite for this team + all student's other invites
    const rowsToDelete = [];
    if (inviteRowToDelete > 0) {
      rowsToDelete.push(inviteRowToDelete);
    }
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === mcpsIdStr && role === 'invited' && (i + 1) !== inviteRowToDelete) {
        rowsToDelete.push(i + 1);
      }
    }

    // If team will be full after joining, also delete all team's remaining invites
    if (activeCount + 1 >= 6) {
      for (let i = 1; i < data.length; i++) {
        const rowTeam = (data[i][0] || '').toString().trim();
        const rowId = (data[i][1] || '').toString().trim();
        const role = (data[i][4] || '').toString().trim().toLowerCase();
        if (rowTeam.toLowerCase() === teamName.toLowerCase() && role === 'invited' && rowId !== mcpsIdStr) {
          const rowNum = i + 1;
          if (rowsToDelete.indexOf(rowNum) === -1) {
            rowsToDelete.push(rowNum);
          }
        }
      }
    }

    // Delete rows bottom-to-top
    rowsToDelete.sort((a, b) => b - a);
    for (const rowNum of rowsToDelete) {
      sheet.deleteRow(rowNum);
    }

    // Add member row
    sheet.appendRow([teamName, mcpsIdStr, studentName, grade, 'member', teamType, new Date()]);
    Logger.log('Purple Comet team joined: ' + teamName + ' by ' + studentName);

    return { success: true, message: 'Successfully joined team "' + teamName + '"!' };
  } catch (error) {
    Logger.log('Error joining Purple Comet team: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function inviteToPurpleCometTeam(creatorMcpsId, invitees) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const creatorIdStr = creatorMcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'You are not on a team.' };
    }

    const data = sheet.getDataRange().getValues();

    // Find creator's team
    let creatorTeam = null;
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === creatorIdStr && role === 'creator') {
        creatorTeam = (data[i][0] || '').toString().trim();
        break;
      }
    }

    if (!creatorTeam) {
      return { success: false, message: 'Only the team creator can send invitations.' };
    }

    // Check if team is already full
    let teamActiveCount = 0;
    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowTeam.toLowerCase() === creatorTeam.toLowerCase() && (role === 'creator' || role === 'member')) {
        teamActiveCount++;
      }
    }
    if (teamActiveCount >= 6) {
      return { success: false, message: 'Your team is full (6/6 members). No more invitations can be sent.' };
    }

    // Build set of existing invitees and members for this team
    const existingInviteIds = new Set();
    const existingMemberIds = new Set();
    const onAnyTeamIds = new Set();

    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();

      if (role === 'creator' || role === 'member') {
        onAnyTeamIds.add(rowId);
      }

      if (rowTeam.toLowerCase() === creatorTeam.toLowerCase()) {
        if (role === 'invited') {
          existingInviteIds.add(rowId);
        }
        if (role === 'creator' || role === 'member') {
          existingMemberIds.add(rowId);
        }
      }
    }

    // Validate each invitee
    const errors = [];
    const validInvitees = [];
    for (const invitee of invitees) {
      const invId = invitee.mcpsId.toString().trim();
      if (onAnyTeamIds.has(invId)) {
        errors.push(invitee.name + ' is already on a team.');
      } else if (existingInviteIds.has(invId)) {
        errors.push(invitee.name + ' has already been invited to this team.');
      } else {
        validInvitees.push(invitee);
        existingInviteIds.add(invId); // Prevent duplicate invites in same batch
      }
    }

    if (validInvitees.length === 0 && errors.length > 0) {
      return { success: false, message: errors.join(' ') };
    }

    // Get team type from existing data
    let teamType = 'invite';
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim().toLowerCase() === creatorTeam.toLowerCase()) {
        teamType = (data[i][5] || '').toString().trim().toLowerCase();
        break;
      }
    }

    // Append invite rows
    const timestamp = new Date();
    for (const invitee of validInvitees) {
      sheet.appendRow([creatorTeam, invitee.mcpsId.toString().trim(), invitee.name, invitee.grade || '', 'invited', teamType, timestamp]);
    }

    let message = validInvitees.length + ' invitation' + (validInvitees.length !== 1 ? 's' : '') + ' sent!';
    if (errors.length > 0) {
      message += ' Note: ' + errors.join(' ');
    }

    Logger.log('Purple Comet invitations sent for team: ' + creatorTeam + ' - ' + validInvitees.length + ' invitees');
    return { success: true, message: message };
  } catch (error) {
    Logger.log('Error inviting to Purple Comet team: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function acceptPurpleCometInvite(mcpsId, studentName, grade, teamName) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'Invitation not found.' };
    }

    const data = sheet.getDataRange().getValues();

    // Check student not already on a team
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === mcpsIdStr && (role === 'creator' || role === 'member')) {
        return { success: false, message: 'You are already on a team.' };
      }
    }

    // Find the invite and check team capacity
    let inviteRowIndex = -1;
    let activeCount = 0;
    let teamType = '';
    const otherInviteRows = []; // Other pending invites for this student

    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();

      if (rowTeam.toLowerCase() === teamName.toLowerCase()) {
        if (role === 'creator' || role === 'member') {
          activeCount++;
        }
        if (rowId === mcpsIdStr && role === 'invited') {
          inviteRowIndex = i + 1;
          teamType = (data[i][5] || '').toString().trim().toLowerCase();
        }
      }

      // Track other pending invites for this student (on different teams)
      if (rowId === mcpsIdStr && role === 'invited' && rowTeam.toLowerCase() !== teamName.toLowerCase()) {
        otherInviteRows.push(i + 1);
      }
    }

    if (inviteRowIndex === -1) {
      return { success: false, message: 'Invitation not found.' };
    }

    if (activeCount >= 6) {
      return { success: false, message: 'This team is now full (6/6 members). You cannot join.' };
    }

    // Collect rows to delete: this invite + student's other invites
    const allRowsToDelete = [inviteRowIndex, ...otherInviteRows];

    // If team will be full after accepting, also delete all team's remaining invites
    if (activeCount + 1 >= 6) {
      for (let i = 1; i < data.length; i++) {
        const rowTeam = (data[i][0] || '').toString().trim();
        const rowId = (data[i][1] || '').toString().trim();
        const role = (data[i][4] || '').toString().trim().toLowerCase();
        if (rowTeam.toLowerCase() === teamName.toLowerCase() && role === 'invited' && rowId !== mcpsIdStr) {
          const rowNum = i + 1;
          if (allRowsToDelete.indexOf(rowNum) === -1) {
            allRowsToDelete.push(rowNum);
          }
        }
      }
    }

    // Delete bottom-to-top
    allRowsToDelete.sort((a, b) => b - a);
    for (const rowNum of allRowsToDelete) {
      sheet.deleteRow(rowNum);
    }

    // Append as member
    sheet.appendRow([teamName, mcpsIdStr, studentName, grade, 'member', teamType, new Date()]);

    Logger.log('Purple Comet invite accepted: ' + studentName + ' joined ' + teamName);
    return { success: true, message: 'You have joined team "' + teamName + '"!' };
  } catch (error) {
    Logger.log('Error accepting Purple Comet invite: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function rejectPurpleCometInvite(mcpsId, teamName) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'Invitation not found.' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();

      if (rowTeam.toLowerCase() === teamName.toLowerCase() && rowId === mcpsIdStr && role === 'invited') {
        sheet.deleteRow(i + 1);
        Logger.log('Purple Comet invite rejected: ' + mcpsIdStr + ' declined ' + teamName);
        return { success: true, message: 'Invitation declined.' };
      }
    }

    return { success: false, message: 'Invitation not found.' };
  } catch (error) {
    Logger.log('Error rejecting Purple Comet invite: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function revokePurpleCometInvite(creatorMcpsId, inviteeMcpsId) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const creatorIdStr = creatorMcpsId.toString().trim();
    const inviteeIdStr = inviteeMcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'Team not found.' };
    }

    const data = sheet.getDataRange().getValues();

    // Find creator's team
    let creatorTeam = null;
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === creatorIdStr && role === 'creator') {
        creatorTeam = (data[i][0] || '').toString().trim();
        break;
      }
    }

    if (!creatorTeam) {
      return { success: false, message: 'Only the team creator can revoke invitations.' };
    }

    // Find and delete the invite row
    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();

      if (rowTeam.toLowerCase() === creatorTeam.toLowerCase() && rowId === inviteeIdStr && role === 'invited') {
        sheet.deleteRow(i + 1);
        Logger.log('Purple Comet invite revoked: ' + creatorIdStr + ' revoked invite for ' + inviteeIdStr + ' from ' + creatorTeam);
        return { success: true, message: 'Invitation revoked.' };
      }
    }

    return { success: false, message: 'Invitation not found.' };
  } catch (error) {
    Logger.log('Error revoking Purple Comet invite: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function leavePurpleCometTeam(mcpsId, newCreatorMcpsId) {
  try {
    if (isPurpleCometDeadlinePassed()) {
      return { success: false, message: 'The team formation deadline (April 1, 2026) has passed.' };
    }

    const mcpsIdStr = mcpsId.toString().trim();
    const sheet = getPurpleCometSheet();
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, message: 'You are not on a team.' };
    }

    const data = sheet.getDataRange().getValues();

    // Find student's row and team info
    let studentRowIndex = -1;
    let studentRole = '';
    let teamName = '';

    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();
      if (rowId === mcpsIdStr && (role === 'creator' || role === 'member')) {
        studentRowIndex = i + 1;
        studentRole = role;
        teamName = (data[i][0] || '').toString().trim();
        break;
      }
    }

    if (studentRowIndex === -1) {
      return { success: false, message: 'You are not on a team.' };
    }

    // Find other active members and invite rows for this team
    const otherActiveMembers = [];
    const teamInviteRows = [];

    for (let i = 1; i < data.length; i++) {
      const rowTeam = (data[i][0] || '').toString().trim();
      const rowId = (data[i][1] || '').toString().trim();
      const role = (data[i][4] || '').toString().trim().toLowerCase();

      if (rowTeam.toLowerCase() === teamName.toLowerCase() && rowId !== mcpsIdStr) {
        if (role === 'creator' || role === 'member') {
          otherActiveMembers.push({ rowIndex: i + 1, mcpsId: rowId, name: (data[i][2] || '').toString().trim() });
        } else if (role === 'invited') {
          teamInviteRows.push(i + 1);
        }
      }
    }

    if (studentRole === 'creator') {
      if (otherActiveMembers.length > 0) {
        // Creator must choose a new owner
        if (!newCreatorMcpsId) {
          // Return the list of members so the frontend can ask the creator to pick
          return {
            success: false,
            needsNewCreator: true,
            members: otherActiveMembers.map(function(m) { return { mcpsId: m.mcpsId, name: m.name }; }),
            message: 'Please choose a new team owner before leaving.'
          };
        }

        // Validate the chosen new creator is an active member of this team
        const newCreatorIdStr = newCreatorMcpsId.toString().trim();
        const chosenMember = otherActiveMembers.find(function(m) { return m.mcpsId === newCreatorIdStr; });
        if (!chosenMember) {
          return { success: false, message: 'Selected student is not an active member of this team.' };
        }

        // Promote chosen member to creator
        sheet.getRange(chosenMember.rowIndex, 5).setValue('creator');
      } else {
        // No other active members - dissolve team (delete invites too)
        const allRowsToDelete = [studentRowIndex, ...teamInviteRows].sort((a, b) => b - a);
        for (const rowNum of allRowsToDelete) {
          sheet.deleteRow(rowNum);
        }
        Logger.log('Purple Comet team dissolved: ' + teamName);
        return { success: true, message: 'You have left and team "' + teamName + '" has been dissolved.' };
      }
    }

    // Delete the student's row
    sheet.deleteRow(studentRowIndex);
    Logger.log('Purple Comet team left: ' + mcpsIdStr + ' left ' + teamName);
    return { success: true, message: 'You have left team "' + teamName + '".' };
  } catch (error) {
    Logger.log('Error leaving Purple Comet team: ' + error.toString());
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

function testPurpleComet() {
  Logger.log('=== Testing Purple Comet Functions ===');

  // Test sheet access
  const sheet = getPurpleCometSheet();
  Logger.log('Sheet exists: ' + (sheet !== null));

  // Test deadline check
  Logger.log('Deadline passed: ' + isPurpleCometDeadlinePassed());

  // Test get results (with a test ID)
  const results = getPurpleCometResults('999999');
  Logger.log('Results for 999999: ' + JSON.stringify(results));

  // Test available students
  const available = getAvailableStudents();
  Logger.log('Available students count: ' + available.length);

  Logger.log('=== Purple Comet Tests Complete ===');
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
        const gradeLevel = (row[3] || '').toString().trim();
        studentInfo = {
          name: `${firstName} ${lastName}`.trim(),
          mcpsId: mcpsIdStr,
          email: email,
          gradeLevel: gradeLevel
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

    // If grade not found yet, try to get it from Form Responses 2
    if (!studentInfo.gradeLevel) {
      Logger.log('Grade not found yet, checking Form Responses 2 for grade...');
      const competitionSheet = getCompetitionSignupSheet();
      if (competitionSheet && competitionSheet.getLastRow() > 1) {
        const competitionData = competitionSheet.getDataRange().getValues();
        for (let i = 1; i < competitionData.length; i++) {
          const row = competitionData[i];
          const studentId = row[2] ? row[2].toString().trim() : '';
          if (studentId === mcpsIdStr) {
            const gradeLevel = (row[3] || '').toString().trim();
            if (gradeLevel) {
              studentInfo.gradeLevel = gradeLevel;
              Logger.log('Grade found in Form Responses 2: ' + gradeLevel);
            }
            break;
          }
        }
      }
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

    // Get MOEMS results
    let moemsResults = null;
    try {
      Logger.log('Getting MOEMS results for: ' + mcpsIdStr);
      moemsResults = getMoemsResults(mcpsIdStr);
      if (moemsResults) {
        Logger.log('MOEMS results retrieved: Total=' + moemsResults.totalScore);
      } else {
        Logger.log('No MOEMS results found for this student');
      }
    } catch (err) {
      Logger.log('Error getting MOEMS results: ' + err.toString());
    }

    // Get Math League results
    let mathLeagueResults = null;
    try {
      Logger.log('Getting Math League results for: ' + mcpsIdStr);
      mathLeagueResults = getMathLeagueResults(mcpsIdStr);
      if (mathLeagueResults) {
        Logger.log('Math League results retrieved: Team=' + mathLeagueResults.team + ', ARML Tracked=' + mathLeagueResults.armlTracked);
      } else {
        Logger.log('No Math League results found for this student');
      }
    } catch (err) {
      Logger.log('Error getting Math League results: ' + err.toString());
    }

    // Get Math Kangaroo results (lookup by name)
    let mathKangarooResults = null;
    try {
      Logger.log('Getting Math Kangaroo results for: ' + studentInfo.name);
      mathKangarooResults = getMathKangarooResults(studentInfo.name);
      if (mathKangarooResults) {
        Logger.log('Math Kangaroo results retrieved: MK ID=' + mathKangarooResults.mkId);
      } else {
        Logger.log('No Math Kangaroo results found for this student');
      }
    } catch (err) {
      Logger.log('Error getting Math Kangaroo results: ' + err.toString());
    }

    // Get AMC 8 results
    let amc8Results = null;
    try {
      Logger.log('Getting AMC 8 results for: ' + mcpsIdStr);
      amc8Results = getAmc8Results(mcpsIdStr);
      if (amc8Results) {
        Logger.log('AMC 8 results retrieved: score=' + amc8Results.score + ', pdfLink=' + amc8Results.pdfLink);
      } else {
        Logger.log('No AMC 8 results found for this student');
      }
    } catch (err) {
      Logger.log('Error getting AMC 8 results: ' + err.toString());
      // Don't fail the whole lookup if AMC 8 fails
      amc8Results = null;
    }

    // Get Noetic Learning results
    let noeticResults = null;
    try {
      Logger.log('Getting Noetic Learning results for: ' + mcpsIdStr);
      const signUpCounts = getNoeticSignUpCounts();

      // Check if student is signed up
      const sheet = getNoeticSheet();
      let isSignedUp = false;
      let gradePreference = null;
      let contestGrade = null;
      let publishPermission = null;
      let noeticUsername = null;
      let noeticPassword = null;
      let noeticScore = null;

      if (sheet && sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const studentId = (row[1] || '').toString().trim();

          if (studentId === mcpsIdStr) {
            isSignedUp = true;
            gradePreference = (row[4] || '').toString().trim().toLowerCase();
            contestGrade = (row[5] || '').toString().trim();
            publishPermission = (row[6] || '').toString().trim().toLowerCase() || null;
            noeticUsername = (row[7] || '').toString().trim() || null;
            noeticPassword = (row[8] || '').toString().trim() || null;
            noeticScore = (row[9] !== undefined && row[9] !== '') ? parseInt(row[9]) : null;
            break;
          }
        }
      }

      noeticResults = {
        signUpCounts: signUpCounts,
        signedUp: isSignedUp,
        gradePreference: gradePreference,
        contestGrade: contestGrade,
        publishPermission: publishPermission,
        username: noeticUsername,
        password: noeticPassword,
        score: noeticScore
      };
      Logger.log('Noetic results: signedUp=' + isSignedUp + ', preference=' + gradePreference + ', contestGrade=' + contestGrade);
    } catch (err) {
      Logger.log('Error getting Noetic results: ' + err.toString());
      noeticResults = null;
    }

    // Get Purple Comet results
    let purpleComet = null;
    try {
      Logger.log('Getting Purple Comet results for: ' + mcpsIdStr);
      purpleComet = getPurpleCometResults(mcpsIdStr);
      if (purpleComet) {
        Logger.log('Purple Comet results retrieved: myTeam=' + (purpleComet.myTeam ? purpleComet.myTeam.teamName : 'none') + ', pendingInvites=' + purpleComet.pendingInvites.length + ', allTeams=' + purpleComet.allTeams.length);
      }
    } catch (err) {
      Logger.log('Error getting Purple Comet results: ' + err.toString());
    }

    // Get Carderock results
    let carderockResults = null;
    try {
      Logger.log('Getting Carderock results for: ' + mcpsIdStr);
      carderockResults = getCarderockResults(mcpsIdStr);
    } catch (err) {
      Logger.log('Error getting Carderock results: ' + err.toString());
    }

    const result = {
      success: true,
      student: studentInfo,
      attendance: attendanceHistory,
      competitions: competitionSignups,
      forms: formCompletion,
      mathcounts: mathcountsResults,
      moems: moemsResults,
      mathLeague: mathLeagueResults,
      mathKangaroo: mathKangarooResults,
      amc8: amc8Results,
      noetic: noeticResults,
      purpleComet: purpleComet,
      carderock: carderockResults
    };

    try {
      const resultJson = JSON.stringify(result);
      Logger.log('Result size: ' + resultJson.length + ' bytes');
      Logger.log('Returning result: ' + resultJson);
    } catch (serializeError) {
      Logger.log('Error serializing result: ' + serializeError.toString());
      Logger.log('Result object keys: ' + Object.keys(result).join(', '));
    }
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

    // Initialize competitions as not signed up
    // Note: AMC 8 is past, so we only track MATHCOUNTS, Math League, and MOEMS
    const competitions = [
      { name: 'MATHCOUNTS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MCPS Math League', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false },
      { name: 'MOEMS', details: '', status: 'Not Signed Up', signedUp: false, waitlisted: false }
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