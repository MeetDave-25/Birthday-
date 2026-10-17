/**
 * Notes backend for the birthday site.
 * Paste this into Extensions → Apps Script of a Google Sheet, then
 * set a Script Property named ADMIN_KEY (your admin password) and deploy as a Web app.
 * Full steps are in the README.
 */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("notes") || ss.insertSheet("notes");
  if (sh.getLastRow() === 0) sh.appendRow(["time", "name", "message"]);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// The birthday page saves a note.
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const message = String(data.message || "").slice(0, 2000).trim();
    if (!message) return json_({ ok: false });
    sheet_().appendRow([new Date(), String(data.name || "").slice(0, 60), message]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  }
}

// admin.html reads the notes, only with the right password.
function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key || e.parameter.key !== key) return json_({ ok: false, error: "wrong password" });
  const rows = sheet_().getDataRange().getValues().slice(1);
  const notes = rows.map(([time, name, message]) => ({ time: new Date(time).toISOString(), name, message }));
  return json_({ ok: true, notes: notes.reverse() });
}
