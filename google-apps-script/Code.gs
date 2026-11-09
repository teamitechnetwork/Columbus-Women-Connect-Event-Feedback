const RESPONSE_TAB_NAME = "Feedback";
const SPREADSHEET_ID_PROPERTY = "GOOGLE_SHEETS_SPREADSHEET_ID";
const WEBHOOK_SECRET_PROPERTY = "GOOGLE_SHEETS_WEBHOOK_SECRET";

const HEADERS = [
  "Submitted at",
  "Full name",
  "Email",
  "Phone",
  "Organization",
  "Overall rating",
  "Most valuable",
  "Improvements",
  "Future topics",
  "Contact requested",
  "Future updates",
];

function doPost(event) {
  let lock;

  try {
    const request = JSON.parse(event?.postData?.contents || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty(WEBHOOK_SECRET_PROPERTY);
    const spreadsheetId = properties.getProperty(SPREADSHEET_ID_PROPERTY);

    if (
      !expectedSecret ||
      !spreadsheetId ||
      request.secret !== expectedSecret ||
      !isValidFeedback(request.feedback)
    ) {
      return jsonResponse({ ok: false });
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet =
      spreadsheet.getSheetByName(RESPONSE_TAB_NAME) ||
      spreadsheet.insertSheet(RESPONSE_TAB_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    const feedback = request.feedback;
    const submittedAt = new Date().toISOString();
    const rowNumber = sheet.getLastRow() + 1;

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
      feedback.futureUpdates,
    ]);

    return jsonResponse({
      ok: true,
      id: rowNumber,
      submittedAt: submittedAt,
    });
  } catch (_error) {
    return jsonResponse({ ok: false });
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function isValidFeedback(feedback) {
  return (
    feedback &&
    typeof feedback.fullName === "string" &&
    feedback.fullName.trim().length > 0 &&
    typeof feedback.email === "string" &&
    Number.isInteger(feedback.overallRating) &&
    feedback.overallRating >= 1 &&
    feedback.overallRating <= 5 &&
    typeof feedback.contactRequested === "boolean" &&
    typeof feedback.futureUpdates === "boolean"
  );
}

function safeCellText(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
