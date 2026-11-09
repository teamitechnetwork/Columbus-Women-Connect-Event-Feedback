
/*******************************************************
 * B4P CODEFOUND – CONFERENCE FEEDBACK API
 * Google Apps Script Web App
 *******************************************************/

// CONFIGURATION
const RESPONSE_TAB_NAME = "Responses";

// These are Script Property NAMES, not their values.
const SPREADSHEET_ID_PROPERTY = "SPREADSHEET_ID";
const WEBHOOK_SECRET_PROPERTY = "WEBHOOK_SECRET";

// GOOGLE SHEET HEADERS
const HEADERS = [
  "Timestamp",
  "Full name",
  "Email address",
  "Phone number",
  "Organization",
  "How would you rate the event overall? (1-5)",
  "What did you enjoy most?",
  "What could be better next time?",
  "What would you like at future events?",
  "Would you like us to follow up with you?",
  "Would you like updates about future events?"
];


/*******************************************************
 * GET REQUEST
 * Opens a status message when the web app URL is visited.
 *******************************************************/
function doGet() {
  return jsonResponse({
    ok: true,
    message: "B4P CODEFOUND Feedback API is running.",
    service: "Conference Feedback",
    status: "active"
  });
}


/*******************************************************
 * POST REQUEST
 * Receives feedback from your website or form.
 *******************************************************/
function doPost(event) {
  let lock = null;

  try {

    // Check request body
    if (!event || !event.postData || !event.postData.contents) {
      return jsonResponse({
        ok: false,
        errorCode: "empty_request"
      });
    }

    // Parse incoming JSON
    let request;

    try {
      request = JSON.parse(event.postData.contents);
    } catch (error) {
      return jsonResponse({
        ok: false,
        errorCode: "invalid_json"
      });
    }

    // Retrieve Script Properties
    const properties = PropertiesService.getScriptProperties();

    const expectedSecret = properties.getProperty(
      WEBHOOK_SECRET_PROPERTY
    );

    const spreadsheetId = properties.getProperty(
      SPREADSHEET_ID_PROPERTY
    );

    // Check configuration
    if (!expectedSecret || !spreadsheetId) {
      return jsonResponse({
        ok: false,
        errorCode: "missing_script_properties"
      });
    }

    // Verify webhook secret
    if (
      typeof request.secret !== "string" ||
      request.secret !== expectedSecret
    ) {
      return jsonResponse({
        ok: false,
        errorCode: "secret_mismatch"
      });
    }

    // Validate feedback
    if (!isValidFeedback(request.feedback)) {
      return jsonResponse({
        ok: false,
        errorCode: "invalid_feedback"
      });
    }

    // Prevent simultaneous writes
    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    // Open Google Spreadsheet
    const spreadsheet = SpreadsheetApp.openById(
      spreadsheetId
    );

    // Find or create Responses worksheet
    let sheet = spreadsheet.getSheetByName(
      RESPONSE_TAB_NAME
    );

    if (!sheet) {
      sheet = spreadsheet.insertSheet(
        RESPONSE_TAB_NAME
      );
    }

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    // Feedback data
    const feedback = request.feedback;

    const submittedAt = new Date().toISOString();

    // Save feedback
    sheet.appendRow([
      submittedAt,
      safeCellText(feedback.fullName),
      safeCellText(feedback.email).toLowerCase(),
      safeCellText(feedback.phone),
      safeCellText(feedback.organization),
      feedback.overallRating,
      safeCellText(feedback.mostValuable),
      safeCellText(feedback.improvements),
      safeCellText(feedback.futureTopics),
      feedback.contactRequested,
      feedback.futureUpdates
    ]);

    // Get saved row number
    const rowNumber = sheet.getLastRow();

    return jsonResponse({
      ok: true,
      message: "Feedback submitted successfully.",
      id: rowNumber,
      submittedAt: submittedAt
    });

  } catch (error) {

    // Log technical error for administrator
    console.error(error);

    return jsonResponse({
      ok: false,
      errorCode: "sheet_write_failed",
      message: "Unable to save feedback to Google Sheets."
    });

  } finally {

    // Release lock
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }

  }
}


/*******************************************************
 * VALIDATE FEEDBACK
 *******************************************************/
function isValidFeedback(feedback) {

  return (
    feedback &&
    typeof feedback.fullName === "string" &&
    feedback.fullName.trim().length > 0 &&

    typeof feedback.email === "string" &&
    feedback.email.trim().length > 0 &&

    Number.isInteger(feedback.overallRating) &&
    feedback.overallRating >= 1 &&
    feedback.overallRating <= 5 &&

    typeof feedback.contactRequested === "boolean" &&
    typeof feedback.futureUpdates === "boolean"
  );

}


/*******************************************************
 * PREVENT SPREADSHEET FORMULA INJECTION
 *******************************************************/
function safeCellText(value) {

  const text = typeof value === "string"
    ? value.trim()
    : "";

  return /^[=+\-@]/.test(text)
    ? "'" + text
    : text;

}


/*******************************************************
 * JSON RESPONSE
 *******************************************************/
function jsonResponse(body) {

  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);

}
