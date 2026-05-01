/**
 * Algebra 1 Skills Drill — handwriting capture webhook
 *
 * DEPLOYMENT
 *  1. Open https://script.google.com → New project, paste this file.
 *  2. Set PARENT_FOLDER_ID below to the Drive folder where session folders should land.
 *     (Open the folder in Drive, copy the long ID from the URL.)
 *  3. Deploy → New deployment → Web app
 *       Execute as: Me
 *       Who has access: Anyone
 *  4. Copy the /exec URL and paste it into radicals/index.html as WEBHOOK_URL.
 *
 * REQUEST (POST, body sent as text/plain to avoid CORS preflight)
 *  {
 *    student: "Ethan",
 *    sessionNumber: 7,
 *    date: "2026-05-01",
 *    work: [
 *      { qNum: 1, concept: "Like Radicals", correct: true,
 *        question: "3\\sqrt{8}+...", answer: "8\\sqrt{2}",
 *        pngDataUrl: "data:image/png;base64,..." },
 *      ...
 *    ]
 *  }
 *
 * RESPONSE
 *  { ok: true, folderUrl: "...", imageUrls: ["...", null, "...", ...] }
 *  Entries are null where no work was drawn (pngDataUrl omitted).
 */

const PARENT_FOLDER_ID = '1Euxd2BeJgSGF7ZnX1NbdBWp656rflOJI';  // "Ethan Drill Sessions" in SOTC Drive

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const folderName = `${data.student} — Session ${data.sessionNumber} — ${data.date}`;
    const folder = parent.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const imageUrls = (data.work || []).map(item => {
      if (!item || !item.pngDataUrl) return null;
      const m = item.pngDataUrl.match(/^data:image\/png;base64,(.+)$/);
      if (!m) return null;
      const safeConcept = String(item.concept || 'concept').replace(/[^a-z0-9]+/gi, '_');
      const tag = item.correct ? 'OK' : 'X';
      const name = `Q${String(item.qNum).padStart(2, '0')}_${safeConcept}_${tag}.png`;
      const blob = Utilities.newBlob(Utilities.base64Decode(m[1]), 'image/png', name);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return file.getUrl();
    });

    const summary = (data.work || []).map((item, i) => {
      const url = imageUrls[i];
      const mark = item.correct ? '✓' : '✗';
      const link = url ? url : '(no work shown)';
      const detail = item.correct
        ? ''
        : ` (picked ${item.chosen || '?'}, correct ${item.answer})`;
      return `Q${item.qNum} ${mark} ${item.concept}${detail} — ${link}`;
    }).join('\n');

    // Save full PDF report (if provided)
    let pdfUrl = '';
    if (data.pdfDataUrl) {
      const pm = data.pdfDataUrl.match(/^data:application\/pdf;[^,]*base64,(.+)$/);
      if (pm) {
        const pdfName = `${data.student}_Session_${data.sessionNumber}_Report.pdf`;
        const pdfBlob = Utilities.newBlob(Utilities.base64Decode(pm[1]), 'application/pdf', pdfName);
        const pdfFile = folder.createFile(pdfBlob);
        pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        pdfUrl = pdfFile.getUrl();
      }
    }

    // Save metadata WITHOUT the dataURL bloat (PNGs and PDF are already saved as files)
    const metaJson = {
      student: data.student,
      sessionNumber: data.sessionNumber,
      date: data.date,
      work: (data.work || []).map(w => ({
        qNum: w.qNum, concept: w.concept,
        question: w.question, answer: w.answer,
        chosen: w.chosen, correct: w.correct
      }))
    };
    folder.createFile(
      Utilities.newBlob(JSON.stringify(metaJson, null, 2), 'application/json', 'session.json')
    );

    return json({
      ok: true,
      folderUrl: folder.getUrl(),
      imageUrls: imageUrls,
      pdfUrl: pdfUrl,
      summary: summary
    });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, message: 'Algebra drill webhook is live. POST session data to this URL.' });
}

/**
 * Run this once from the Apps Script editor to trigger the OAuth consent flow
 * and confirm the parent folder ID is correct. After grants are accepted,
 * doPost will work for anonymous web-app callers.
 *
 * Editor: select `testAuth` from the function dropdown, click Run.
 * On first run Google will prompt for Drive authorization → Allow.
 * Then check View → Logs.
 */
function testAuth() {
  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  Logger.log('Parent folder OK: ' + parent.getName());

  const test = parent.createFolder('AUTH_TEST_' + new Date().toISOString());
  Logger.log('Created subfolder: ' + test.getName() + ' → ' + test.getUrl());

  test.setTrashed(true);
  Logger.log('Cleanup: subfolder moved to trash. Auth + write access confirmed.');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
