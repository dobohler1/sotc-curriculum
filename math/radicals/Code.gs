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
const REPORT_RECIPIENT = 'dbohler@scienceonthecourt.com';
const STUDENT_DISPLAY_NAME = 'Ethan';
const WEEKLY_GOAL_MINUTES = 210;  // shown as goal in the weekly report (30 min × 7 days)

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
      activeSeconds: data.activeSeconds || 0,
      work: (data.work || []).map(w => ({
        qNum: w.qNum, concept: w.concept,
        question: w.question, answer: w.answer,
        chosen: w.chosen, correct: w.correct,
        secondsBeforeReveal: w.secondsBeforeReveal
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

// ════════════════════════════════════════════════════════════════════════════
//  WEEKLY ACTIVE-MINUTES REPORT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Aggregates active minutes from all session.json files created in the past 7
 * days, sends an HTML email summary to REPORT_RECIPIENT.
 *
 * To install as a Sunday-morning trigger, run `setupWeeklyTrigger` once from
 * the editor. To preview without scheduling, run `sendWeeklyReport` directly.
 */
function sendWeeklyReport() {
  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const now = new Date();
  // Window: previous Mon 00:00 through previous Sun 23:59:59 (the "last week" the email is about)
  const dow = now.getDay();                            // Sun=0..Sat=6
  const lastSunEnd = new Date(now);
  lastSunEnd.setDate(now.getDate() - (dow === 0 ? 0 : dow));
  lastSunEnd.setHours(23, 59, 59, 999);
  const lastMonStart = new Date(lastSunEnd);
  lastMonStart.setDate(lastSunEnd.getDate() - 6);
  lastMonStart.setHours(0, 0, 0, 0);

  // Walk session subfolders, read session.json, filter by created date
  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const byDay = {Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0};
  let totalSec = 0, sessionCount = 0;

  const subFolders = parent.getFolders();
  while (subFolders.hasNext()) {
    const f = subFolders.next();
    const created = f.getDateCreated();
    if (created < lastMonStart || created > lastSunEnd) continue;
    const files = f.getFilesByName('session.json');
    if (!files.hasNext()) continue;
    try {
      const data = JSON.parse(files.next().getBlob().getDataAsString());
      const sec = Number(data.activeSeconds) || 0;
      const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][created.getDay()];
      byDay[day] += sec;
      totalSec += sec;
      sessionCount++;
    } catch (e) { /* skip malformed */ }
  }

  const totalMin = Math.round(totalSec / 60);
  const goal = WEEKLY_GOAL_MINUTES;
  const pctOfGoal = Math.min(100, Math.round((totalMin / goal) * 100));
  const fmtRange = `${Utilities.formatDate(lastMonStart, 'America/Los_Angeles', 'MMM d')} – ${Utilities.formatDate(lastSunEnd, 'America/Los_Angeles', 'MMM d')}`;

  const dayRows = dayLabels.map(d => {
    const min = Math.round(byDay[d] / 60);
    const barW = Math.max(2, Math.round((min / Math.max(60, goal/7 * 1.5)) * 240));
    return `
      <tr>
        <td style="padding:6px 0;color:#666;">${d}</td>
        <td style="padding:6px 0;width:100%;">
          <div style="background:#EEF2FF;height:8px;border-radius:4px;width:${barW}px;max-width:100%;
                      ${min === 0 ? 'background:#f5f5f5;' : ''}"></div>
        </td>
        <td style="padding:6px 0;text-align:right;font-weight:500;color:${min === 0 ? '#bbb' : '#1a1a1a'};">
          ${min} min
        </td>
      </tr>`;
  }).join('');

  const goalBarW = Math.round(pctOfGoal * 4);  // 4px per percent → 400px max

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;color:#1a1a1a;">
    <p style="text-align:center;color:#888;font-size:11px;letter-spacing:0.1em;margin:0;">
      ${fmtRange.toUpperCase()}
    </p>
    <h1 style="text-align:center;font-size:22px;font-weight:600;margin:6px 0 28px;">
      Weekly Progress Report
    </h1>

    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">

    <h2 style="font-size:13px;font-weight:600;letter-spacing:0.05em;color:#888;margin:0 0 16px;">
      LAST WEEK
    </h2>
    <p style="font-size:14px;margin:0 0 12px;">
      ${STUDENT_DISPLAY_NAME} earned <strong>${totalMin} active minutes</strong>
      towards a goal of <strong>${goal} min</strong>.
    </p>
    <div style="background:#f5f5f5;height:10px;border-radius:5px;margin:0 0 28px;width:100%;max-width:480px;">
      <div style="background:#F4B400;height:10px;border-radius:5px;width:${goalBarW}px;max-width:100%;"></div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px;">
      ${dayRows}
    </table>

    <p style="font-size:12px;color:#888;line-height:1.5;border-top:1px solid #eee;padding-top:14px;">
      <strong>Active minutes</strong> measure productive engagement — time on a
      session counts only when ${STUDENT_DISPLAY_NAME} is actively working
      (no idle time over 60 seconds, no time with the tab in the background).
      ${sessionCount} session${sessionCount === 1 ? '' : 's'} this week.
    </p>
  </div>`;

  MailApp.sendEmail({
    to: REPORT_RECIPIENT,
    subject: `${STUDENT_DISPLAY_NAME} weekly report — ${totalMin} active min`,
    htmlBody: html
  });
  Logger.log(`Sent weekly report: ${totalMin} active min across ${sessionCount} sessions`);
}

/**
 * Run once from the Apps Script editor to install the weekly trigger
 * (Sundays, 8 AM local). Re-running replaces the existing trigger.
 */
function setupWeeklyTrigger() {
  // Remove existing triggers for this function so we don't pile up duplicates
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendWeeklyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(8)
    .create();
  Logger.log('Weekly trigger installed: Sundays at 8 AM local time.');
}
