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

// ── Claude vision analysis ──────────────────────────────────────────────────
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = 'claude-opus-4-7';

// Abuse protection limits
const DAILY_SESSION_CAP        = 30;   // hard cap on doPost calls per UTC day
const PER_STUDENT_MONTHLY_CAP  = 50;   // soft cap: above this, AI analysis disables but drill still works

/**
 * One-time setup. Run from the Apps Script editor:
 *   Functions dropdown → setupApiCredentials → Run → paste values when prompted.
 * Secrets live in Script Properties (NOT in code, NOT committed to git).
 */
function setupApiCredentials() {
  const props = PropertiesService.getScriptProperties();
  const ui = SpreadsheetApp.getUi ? null : null;  // Apps Script editor has no UI; check Logs

  Logger.log('Current ANTHROPIC_API_KEY: ' + (props.getProperty('ANTHROPIC_API_KEY') ? '(set)' : '(missing)'));
  Logger.log('Current WEBHOOK_SECRET:    ' + (props.getProperty('WEBHOOK_SECRET')    ? '(set)' : '(missing)'));
  Logger.log('');
  Logger.log('To set them, go to: Project Settings (gear icon) → Script Properties → Add property:');
  Logger.log('  ANTHROPIC_API_KEY = sk-ant-... (from console.anthropic.com)');
  Logger.log('  WEBHOOK_SECRET    = (any random string, also pasted into the HTML as WEBHOOK_SECRET)');
  Logger.log('');
  Logger.log('Run testAnalyze() afterwards to verify the API key works.');
}

/**
 * Smoke-test the Claude integration. Run from the editor after setting ANTHROPIC_API_KEY.
 * Sends a tiny POST with a 5×5 PNG and the analysis rubric. Logs the response.
 */
function testAnalyze() {
  const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  const result = analyzeWork({
    qNum: 1,
    concept: 'Like Radicals',
    question: '3\\sqrt{8}+\\sqrt{50}-\\sqrt{18}',
    answer: '8\\sqrt{2}',
    chosen: '4\\sqrt{2}',
    correct: false
  }, tinyPng);
  Logger.log(JSON.stringify(result, null, 2));
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Layer 1: shared secret (raises bar against URL crawlers) ──
    if (!verifySecret(data)) {
      return json({ ok: false, error: 'unauthorized' });
    }

    // ── Layer 2: hard daily cap on doPost calls (anti-runaway) ──
    const dayCap = checkDailyCap();
    if (!dayCap.ok) {
      return json({ ok: false, error: 'daily_limit_reached', limit: dayCap.limit });
    }

    // ── Layer 3: per-student monthly soft cap on AI ANALYSIS ──
    // Drill data still saves; analysis is what gets disabled.
    const studentCap = checkStudentMonthlyCap(data.student);
    const analysisEnabled = studentCap.ok;

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

    // ── Run AI analysis on wrong answers (when enabled) ──
    let analyses = new Array((data.work || []).length).fill(null);
    let analysisCostTokens = { input: 0, cache_read: 0, cache_create: 0, output: 0 };
    if (analysisEnabled) {
      try {
        analyses = analyzeAllWrong(data.work || []);
        analyses.forEach(a => {
          if (a && a._usage) {
            analysisCostTokens.input        += a._usage.input_tokens || 0;
            analysisCostTokens.cache_read   += a._usage.cache_read_input_tokens || 0;
            analysisCostTokens.cache_create += a._usage.cache_creation_input_tokens || 0;
            analysisCostTokens.output       += a._usage.output_tokens || 0;
          }
        });
      } catch (analysisErr) {
        // Don't block the upload if analysis fails — log and continue
        Logger.log('Analysis batch threw: ' + analysisErr);
      }
    }

    const summary = (data.work || []).map((item, i) => {
      const url = imageUrls[i];
      const mark = item.correct ? '✓' : '✗';
      const link = url ? url : '(no work shown)';
      const detail = item.correct
        ? ''
        : ` (picked ${item.chosen || '?'}, correct ${item.answer})`;
      let line = `Q${item.qNum} ${mark} ${item.concept}${detail} — ${link}`;
      if (analyses[i] && !analyses[i].error) {
        line += `\n   ↳ ${analyses[i].coaching_note}`;
      }
      return line;
    }).join('\n\n');

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
      analysisEnabled: analysisEnabled,
      analysisCostTokens: analysisCostTokens,
      work: (data.work || []).map((w, i) => ({
        qNum: w.qNum, concept: w.concept,
        question: w.question, answer: w.answer,
        chosen: w.chosen, correct: w.correct,
        secondsBeforeReveal: w.secondsBeforeReveal,
        analysis: analyses[i] && !analyses[i].error ? {
          error_type:    analyses[i].error_type,
          what_happened: analyses[i].what_happened,
          coaching_note: analyses[i].coaching_note,
          next_step:     analyses[i].next_step
        } : (analyses[i] && analyses[i].error ? { error: analyses[i].error } : null)
      }))
    };
    folder.createFile(
      Utilities.newBlob(JSON.stringify(metaJson, null, 2), 'application/json', 'session.json')
    );

    // Build human-readable analysis block for the email
    let analysisBlock = '';
    if (analysisEnabled) {
      const wrongWithAnalysis = (data.work || [])
        .map((w, i) => ({ w: w, a: analyses[i] }))
        .filter(x => !x.w.correct && x.a && !x.a.error);
      if (wrongWithAnalysis.length > 0) {
        analysisBlock = wrongWithAnalysis.map(x =>
          `Q${x.w.qNum} (${x.w.concept}) — ${x.a.error_type}\n` +
          `   What happened: ${x.a.what_happened}\n` +
          `   Coaching: ${x.a.coaching_note}\n` +
          `   Next step: ${x.a.next_step}`
        ).join('\n\n');
      } else {
        analysisBlock = '(no wrong answers to analyze)';
      }
    } else {
      analysisBlock = `(analysis paused — monthly limit of ${PER_STUDENT_MONTHLY_CAP} sessions reached for ${data.student})`;
    }

    // Bump counters AFTER successful save (don't penalize failed sessions)
    bumpDailyCounter();
    bumpStudentCounter(data.student);

    return json({
      ok: true,
      folderUrl: folder.getUrl(),
      imageUrls: imageUrls,
      pdfUrl: pdfUrl,
      summary: summary,
      analysisBlock: analysisBlock,
      analysisEnabled: analysisEnabled
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

// ════════════════════════════════════════════════════════════════════════════
//  CLAUDE VISION ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Analysis rubric used as the cached system prompt for every analyzeWork() call.
 * Designed to be ≥4096 tokens so prompt caching activates on Opus 4.7.
 * For each concept in the bank, names the typical mistakes and how they look
 * in handwriting. The model returns structured JSON via output_config.format.
 */
const ANALYSIS_RUBRIC =
'You are an expert Algebra 1 tutor reviewing a middle-school student\'s handwritten work on a multiple-choice problem. Your job is to identify the SPECIFIC misconception or error type that produced the student\'s incorrect answer, in language a tutor and parent can act on.\n\n' +
'You will receive: the LaTeX of the question, the correct answer, what the student picked, whether they got it right or wrong, and an image of their handwritten scratch work. The image may be blank, partial, or messy. Read the image carefully — what steps did the student write? Where did the work diverge from the correct path?\n\n' +
'Output STRICTLY one JSON object matching the provided schema. Do not include any prose outside the JSON. Use the kid-friendly framing principle: name the TYPE of error (a sequencing slip, a sign error, a forgotten simplification step), not the failure ("got it wrong"). The student is a middle-schooler; assume curiosity, not laziness.\n\n' +
'═══════════════════════════════════════════════════════════════════════════\n' +
'CONCEPT-BY-CONCEPT ANALYSIS GUIDE\n' +
'═══════════════════════════════════════════════════════════════════════════\n\n' +
'### 1. Like Radicals (e.g., 3√8 + √50 - √18 = ?)\n\n' +
'The CORRECT method: simplify each radical so the radicand matches (e.g., √8 = 2√2, √50 = 5√2, √18 = 3√2), then add/subtract the coefficients in front. The radicand stays the same; only the coefficients change.\n\n' +
'Common mistakes to look for in handwriting:\n' +
'  • Adding the radicands instead of simplifying (√8 + √50 + √18 → √76 — fundamental misconception)\n' +
'  • Forgetting to simplify ONE of the radicals before combining (e.g., simplifies √8 and √50 but not √18 → off by a coefficient)\n' +
'  • Arithmetic slip after correct simplification (got 6 + 5 - 3 = 7 instead of 8 — pure arithmetic, not concept)\n' +
'  • Trying to factor differently (e.g., √8 = 4·√2 instead of 2√2 — extracted the wrong factor pair)\n' +
'  • Sign error on subtraction (added when should subtract, or vice versa)\n' +
'  • Distributing the coefficient incorrectly (3√8 → 3·2 = 6 inside the radical, becoming √(6·2) = √12 — confusion between coefficient and radicand)\n\n' +
'Diagnostic phrasing for your output:\n' +
'  - "Forgot to simplify [specific radical] before adding"\n' +
'  - "Added radicands instead of simplifying first — classic novice error, hasn\'t internalized that √a + √b ≠ √(a+b)"\n' +
'  - "Arithmetic slip on the coefficient sum — concept solid"\n\n' +
'### 2. Variable Fractions (e.g., 8x⁵ / 12x², or with negative exponents)\n\n' +
'The CORRECT method: simplify the numerical fraction (8/12 = 2/3), then SUBTRACT exponents (x⁵⁻² = x³). Negative resulting exponents move to the denominator (x⁻³ = 1/x³). For multi-variable, do each variable independently.\n\n' +
'Common mistakes:\n' +
'  • DIVIDED exponents instead of subtracting (x⁵/x² → x^2.5 or x^2 — most common error, conflates with the rule for like bases\n' +
'  • Added exponents instead of subtracting (treats division like multiplication)\n' +
'  • Sign error on negative exponents (x⁻³ stays in numerator instead of moving to denominator)\n' +
'  • Forgot to simplify the numerical coefficient (left as 8/12 or simplified wrong, e.g., 8/12 = 1/2)\n' +
'  • Mishandled the negative-of-a-negative case (e.g., x³/x⁻⁴ should be x³⁻⁽⁻⁴⁾ = x⁷, often wrongly given as x⁻¹ — forgot to flip the second sign)\n' +
'  • Mixed up which variable goes where in multi-variable expressions\n\n' +
'### 3. Add Exponents (e.g., x³ · x⁵, or with fractions)\n\n' +
'The CORRECT method: same base, MULTIPLICATION → ADD the exponents. x³ · x⁵ = x⁸. Works for fractional exponents too: 2^(1/2) · 2^3 = 2^(7/2).\n\n' +
'Common mistakes:\n' +
'  • MULTIPLIED exponents instead of adding (gives x¹⁵ for x³·x⁵ — confused with the power-of-a-power rule)\n' +
'  • SUBTRACTED exponents (gives x² — confused with the division rule)\n' +
'  • Multiplied the bases (gives 2x⁸ — forgot bases combine via the exponent rule, not via multiplication of coefficients)\n' +
'  • For fractional exponents: added the fraction wrong (e.g., 1/2 + 3 = 4/2 instead of 7/2)\n' +
'  • Computed the result as a number when it should stay symbolic (e.g., 5^(3/4) · 5^(1/4) = 5 — student writes a different numerical value)\n\n' +
'### 4. Negative Exponents (e.g., 3⁻³ = ?)\n\n' +
'The CORRECT method: a negative exponent means RECIPROCAL, not negative number. 3⁻³ = 1/3³ = 1/27. The base stays positive; only the position changes.\n\n' +
'Common mistakes:\n' +
'  • Treated negative exponent as negative NUMBER (3⁻³ → -27 — fundamental misconception, this is the textbook trap)\n' +
'  • Negated the base (3⁻³ → -1/27 — added a sign that shouldn\'t be there)\n' +
'  • Computed positive exponent then negated (got 27 then put a minus sign)\n' +
'  • For fractional bases: didn\'t flip correctly ((1/2)⁻³ should be 8, often given as 1/8)\n' +
'  • Confused with subtraction (3⁻³ → 3-3 = 0)\n\n' +
'### 5. Multiply Radicals (e.g., √2 · √8 = ?)\n\n' +
'The CORRECT method: combine under one radical (√(2·8) = √16 = 4) OR simplify each then multiply (√2 · 2√2 = 2·2 = 4). Coefficients multiply; radicands multiply.\n\n' +
'Common mistakes:\n' +
'  • Added radicands instead of multiplying (√2 · √8 → √10)\n' +
'  • Got the product of radicands but forgot to simplify (left as √16 instead of 4)\n' +
'  • Coefficients × radicands confusion in mixed expressions (3√2 · 2√5: did 3·2 = 6 correctly but then 2·5 = 7 instead of 10, or vice versa)\n' +
'  • Distributed wrong with binomial radicals\n\n' +
'### 6. Subtract Exponents (e.g., x⁷ / x³)\n\n' +
'Mirrors §3, but inverted. CORRECT: same base, DIVISION → SUBTRACT exponents.\n\n' +
'Common mistakes:\n' +
'  • Added instead of subtracting (got x¹⁰)\n' +
'  • Divided exponents (got x^(7/3) — same root error as in §2)\n' +
'  • Subtracted in wrong order (3-7 = -4, got x⁻⁴ instead of x⁴)\n' +
'  • Forgot the result equals 1 when exponents are equal (x⁵/x⁵ = 1, students often write x⁰ and stop without resolving)\n\n' +
'═══════════════════════════════════════════════════════════════════════════\n' +
'OUTPUT SCHEMA AND TONE\n' +
'═══════════════════════════════════════════════════════════════════════════\n\n' +
'Return JSON with these fields:\n\n' +
'  error_type: ONE of\n' +
'    - "arithmetic"      → concept understood; arithmetic slip in computation\n' +
'    - "conceptual"      → wrong rule applied (e.g., divided exponents instead of subtracted)\n' +
'    - "transcription"   → work shows correct answer but picked the wrong choice (or vice versa)\n' +
'    - "incomplete"      → started right but stopped before finishing (forgot a step)\n' +
'    - "guessed"         → no work shown OR work is unrelated scribbling, and answer is wrong\n' +
'    - "no_work"         → blank canvas (whether right or wrong — distinguish from "guessed" by not implying intent)\n' +
'    - "correct"         → student got it right; describe their method briefly\n\n' +
'  what_happened: A 1–2 sentence neutral description of what the student\'s work shows. Reference specific steps you can see ("simplified √8 to 2√2 correctly, then..."). If the canvas is blank or unclear, say so plainly.\n\n' +
'  coaching_note: A 1-sentence note for the tutor/parent in their voice. Names the misconception, doesn\'t catastrophize. Example: "Classic divided-instead-of-subtracted error on exponents — drill 5 of these tomorrow and it\'ll click." or "Concept is solid; this was a sign error on the second term — easy fix with one-page review."\n\n' +
'  next_step: ONE concrete remediation suggestion. Specific to the error type. Example: "Practice 3 problems where each radical needs simplifying before combining" or "Review what a negative exponent MEANS — flash card: 2⁻³ = 1/8, not -8."\n\n' +
'STYLE: Direct, specific, kid-friendly. Names the type of error, not the failure. Avoid praise inflation ("great job") and avoid catastrophizing ("doesn\'t understand fractions"). Assume the student will read this — frame mistakes as fixable, named patterns.';

/**
 * Sends a single problem (image + metadata) to Claude for analysis.
 * Returns the structured analysis object, or {error: "..."} on failure.
 */
function analyzeWork(item, pngBase64) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { error: 'ANTHROPIC_API_KEY not set' };

  const userText =
    'Concept: ' + item.concept + '\n' +
    'Question (LaTeX): ' + item.question + '\n' +
    'Correct answer: ' + item.answer + '\n' +
    'Student picked: ' + (item.chosen || '(none)') + '\n' +
    'Verdict: ' + (item.correct ? 'CORRECT' : 'WRONG') + '\n\n' +
    'Analyze the handwritten work shown in the image. Return JSON only.';

  const payload = {
    model: ANTHROPIC_MODEL,
    max_tokens: 600,
    system: [{
      type: 'text',
      text: ANALYSIS_RUBRIC,
      cache_control: { type: 'ephemeral' }
    }],
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: pngBase64 } },
        { type: 'text', text: userText }
      ]
    }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            error_type:    { type: 'string', enum: ['arithmetic','conceptual','transcription','incomplete','guessed','no_work','correct'] },
            what_happened: { type: 'string' },
            coaching_note: { type: 'string' },
            next_step:     { type: 'string' }
          },
          required: ['error_type','what_happened','coaching_note','next_step'],
          additionalProperties: false
        }
      }
    }
  };

  try {
    const resp = UrlFetchApp.fetch(ANTHROPIC_API_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const code = resp.getResponseCode();
    if (code !== 200) {
      return { error: 'Anthropic ' + code + ': ' + resp.getContentText().slice(0, 200) };
    }
    const data = JSON.parse(resp.getContentText());
    const textBlock = (data.content || []).find(function (b) { return b.type === 'text'; });
    if (!textBlock) return { error: 'no text block in response' };
    const parsed = JSON.parse(textBlock.text);
    parsed._usage = data.usage || null;
    return parsed;
  } catch (e) {
    return { error: 'analyzeWork threw: ' + String(e) };
  }
}

/**
 * Analyze all WRONG questions that have handwriting. Returns an array
 * aligned to the input order: each entry is the analysis object (or null
 * if not analyzed — correct, no work, or analysis failed).
 *
 * Strategy: send Q1 sequentially to warm the prompt cache, then fanout
 * the rest via UrlFetchApp.fetchAll for parallelism (~3s instead of ~30s).
 * Note: parallel calls all miss the cache; the warm-up earns ~50% savings
 * on the rest within the 5-minute TTL.
 */
function analyzeAllWrong(workItems) {
  const targets = [];  // {originalIdx, item, png}
  workItems.forEach(function (item, i) {
    if (item.correct) return;                                // skip correct answers
    if (!item.pngDataUrl) return;                            // skip no-work
    const m = item.pngDataUrl.match(/^data:image\/png;base64,(.+)$/);
    if (!m) return;
    targets.push({ originalIdx: i, item: item, png: m[1] });
  });

  const results = new Array(workItems.length).fill(null);
  if (targets.length === 0) return results;

  // 1. Warm cache with the first target
  const first = targets[0];
  results[first.originalIdx] = analyzeWork(first.item, first.png);

  // 2. Parallel fanout for the rest (skip if only 1 target)
  if (targets.length === 1) return results;

  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    targets.slice(1).forEach(function (t) {
      results[t.originalIdx] = { error: 'ANTHROPIC_API_KEY not set' };
    });
    return results;
  }

  const requests = targets.slice(1).map(function (t) {
    const userText =
      'Concept: ' + t.item.concept + '\n' +
      'Question (LaTeX): ' + t.item.question + '\n' +
      'Correct answer: ' + t.item.answer + '\n' +
      'Student picked: ' + (t.item.chosen || '(none)') + '\n' +
      'Verdict: WRONG\n\n' +
      'Analyze the handwritten work shown in the image. Return JSON only.';
    const payload = {
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: [{ type: 'text', text: ANALYSIS_RUBRIC, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: t.png } },
          { type: 'text', text: userText }
        ]
      }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              error_type:    { type: 'string', enum: ['arithmetic','conceptual','transcription','incomplete','guessed','no_work','correct'] },
              what_happened: { type: 'string' },
              coaching_note: { type: 'string' },
              next_step:     { type: 'string' }
            },
            required: ['error_type','what_happened','coaching_note','next_step'],
            additionalProperties: false
          }
        }
      }
    };
    return {
      url: ANTHROPIC_API_URL,
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
  });

  const responses = UrlFetchApp.fetchAll(requests);
  responses.forEach(function (resp, i) {
    const targetIdx = targets[i + 1].originalIdx;
    try {
      if (resp.getResponseCode() !== 200) {
        results[targetIdx] = { error: 'Anthropic ' + resp.getResponseCode() };
        return;
      }
      const data = JSON.parse(resp.getContentText());
      const textBlock = (data.content || []).find(function (b) { return b.type === 'text'; });
      if (!textBlock) { results[targetIdx] = { error: 'no text block' }; return; }
      const parsed = JSON.parse(textBlock.text);
      parsed._usage = data.usage || null;
      results[targetIdx] = parsed;
    } catch (e) {
      results[targetIdx] = { error: String(e) };
    }
  });
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
//  ABUSE PROTECTION (counters in PropertiesService, no DB needed)
// ════════════════════════════════════════════════════════════════════════════

function _todayKey() {
  return 'count_day_' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyyMMdd');
}
function _studentMonthKey(student) {
  const safe = String(student || 'unknown').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  return 'count_student_' + safe + '_' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyyMM');
}

function checkDailyCap() {
  const props = PropertiesService.getScriptProperties();
  const used = Number(props.getProperty(_todayKey())) || 0;
  return { used: used, limit: DAILY_SESSION_CAP, ok: used < DAILY_SESSION_CAP };
}
function bumpDailyCounter() {
  const props = PropertiesService.getScriptProperties();
  const k = _todayKey();
  const used = Number(props.getProperty(k)) || 0;
  props.setProperty(k, String(used + 1));
}

function checkStudentMonthlyCap(student) {
  const props = PropertiesService.getScriptProperties();
  const used = Number(props.getProperty(_studentMonthKey(student))) || 0;
  return { used: used, limit: PER_STUDENT_MONTHLY_CAP, ok: used < PER_STUDENT_MONTHLY_CAP };
}
function bumpStudentCounter(student) {
  const props = PropertiesService.getScriptProperties();
  const k = _studentMonthKey(student);
  const used = Number(props.getProperty(k)) || 0;
  props.setProperty(k, String(used + 1));
}

function verifySecret(data) {
  const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expected) return true;  // not configured → don't enforce
  return data && data.secret === expected;
}
