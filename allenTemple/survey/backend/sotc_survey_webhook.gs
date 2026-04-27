/**
 * SOTC Allen Temple "What's Next" Survey Webhook
 * -----------------------------------------------------------------------
 * Google Apps Script bound to the "SOTC Allen Temple Survey" Google Sheet.
 * Accepts POST requests from the public survey form and appends a row
 * per submission. Used to gather parent input on summer programming.
 *
 * Setup:
 *   1. Create a Google Sheet named "SOTC Allen Temple Survey" with a tab
 *      called "Responses". Add this header row (A1:N1):
 *
 *      Timestamp | Program | Parent Name | Parent Email | Student Names |
 *      Preference | Preference Label | Weeks (raw) | Weeks (readable) |
 *      Hours | Other Idea | Suggestions | Form Version | Source URL
 *
 *   2. Extensions > Apps Script > paste this file's contents, Save.
 *   3. Deploy > New deployment > type: Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy. Copy the Web App URL.
 *   4. Paste the Web App URL into the survey form as SHEETS_WEBHOOK_URL.
 *
 * Schema contract with the form (data.field on the POST body):
 *   program, parent_name, parent_email, student_names, preference,
 *   preference_label, weeks, weeks_label, hours, other_idea, suggestions,
 *   form_version, source_url
 * -----------------------------------------------------------------------
 */

const SHEET_NAME = 'Responses';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return _json({ ok: false, error: 'Sheet tab "' + SHEET_NAME + '" not found' });
    }

    sheet.appendRow([
      new Date(),                           // Timestamp
      payload.program          || 'Allen Temple',
      payload.parent_name      || '',
      payload.parent_email     || '',
      payload.student_names    || '',
      payload.preference       || '',
      payload.preference_label || '',
      payload.weeks            || '',
      payload.weeks_label      || '',
      payload.hours            || '',
      payload.other_idea       || '',
      payload.suggestions      || '',
      payload.form_version     || 'v1',
      payload.source_url       || '',
    ]);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json({ ok: true, service: 'SOTC Allen Temple survey webhook', sheet: SHEET_NAME });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
