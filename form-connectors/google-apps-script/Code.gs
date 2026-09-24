/**
 * ANWE Form Connector v0.1 — Google Apps Script Web App.
 *
 * Deploy this script as a Web App. The first row of the configured sheet is
 * the payload mapping: each header receives the identically named field.
 */
const CONFIG = {
  sheetName: 'leads',
  saveToSheet: true,
  sendEmail: false,
  emailTo: '',
  emailSubject: 'Новая заявка'
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);

    // Deliberately return success to bots without persisting or notifying.
    if (cleanValue_(payload._honeypot)) {
      return createJsonResponse_({ status: 'success', message: 'Accepted' });
    }

    if (!CONFIG.saveToSheet && !CONFIG.sendEmail) {
      throw new Error('Enable saveToSheet and/or sendEmail in CONFIG.');
    }

    if (CONFIG.saveToSheet) saveToSheet_(payload);
    if (CONFIG.sendEmail) sendEmail_(payload);

    return createJsonResponse_({ status: 'success', message: 'Lead accepted' });
  } catch (error) {
    console.error(error);
    return createJsonResponse_({ status: 'error', message: error.message });
  }
}

function saveToSheet_(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error(`Sheet "${CONFIG.sheetName}" not found`);

  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) throw new Error('The sheet must have headers in row 1.');
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  if (!headers.some((header) => cleanValue_(header))) throw new Error('The sheet must have at least one header.');

  const row = headers.map((header) => {
    const key = cleanValue_(header);
    return key === 'timestamp' ? new Date() : safeSheetValue_(payload[key]);
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function sendEmail_(payload) {
  const recipient = cleanValue_(CONFIG.emailTo);
  if (!recipient) throw new Error('CONFIG.emailTo is required when sendEmail is true.');

  const lines = Object.keys(payload)
    .filter((key) => key !== '_honeypot')
    .sort()
    .map((key) => `${key}: ${cleanValue_(payload[key])}`);
  const body = ['Новая заявка', '', ...lines].join('\n');
  MailApp.sendEmail(recipient, CONFIG.emailSubject, body);
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return e && e.parameter ? e.parameter : {};
  try {
    const value = JSON.parse(e.postData.contents);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    return e.parameter || {};
  }
}

function cleanValue_(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

// Prevent Sheets from treating user input as a formula.
function safeSheetValue_(value) {
  const text = cleanValue_(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function createJsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
