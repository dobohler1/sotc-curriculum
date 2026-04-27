# Allen Temple "What's Next" Survey — Backend Setup

End-state: every survey submission lands as a row in a Google Sheet. The
sheet is the canonical place to read responses and tally a decision.

## One-time setup (~5 minutes)

### 1. Create the Sheet
- Go to https://sheets.new
- Name it **"SOTC Allen Temple Survey"**
- Rename the default tab from "Sheet1" to **"Responses"**
- Paste this header row into **A1:N1** (14 columns):

```
Timestamp	Program	Parent Name	Parent Email	Student Names	Preference	Preference Label	Weeks (raw)	Weeks (readable)	Hours	Other Idea	Suggestions	Form Version	Source URL
```

(Copy-paste the whole row — tabs separate the columns automatically.)

### 2. Paste the Apps Script
- In the Sheet, open **Extensions → Apps Script**
- Delete the default `Code.gs` content
- Paste the contents of `sotc_survey_webhook.gs` (in this folder)
- Click the floppy-disk Save icon (or ⌘S)

### 3. Deploy as Web App
- Click **Deploy → New deployment**
- Click the gear icon next to "Select type" → pick **Web app**
- Configure:
  - **Description:** SOTC Allen Temple survey webhook
  - **Execute as:** Me (your@email.com)
  - **Who has access:** Anyone
- Click **Deploy**
- Google will prompt for permissions — approve them
- Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AK.../exec`)

### 4. Smoke test
Paste the URL in a browser. You should see:

```json
{"ok":true,"service":"SOTC Allen Temple survey webhook","sheet":"Responses"}
```

If you see a Google login page instead, access is set wrong — go back to
Deploy → Manage deployments and change "Who has access" to **Anyone**.

### 5. Hand the URL back
Send me the Web App URL. I'll paste it into the form's
`SHEETS_WEBHOOK_URL` constant and push to GitHub Pages. After that, every
new submission writes a row.

## Files
- Form source: `allenTemple/survey/index.html`
- Apps Script: `allenTemple/survey/backend/sotc_survey_webhook.gs`
- Deploy target: same GitHub Pages repo as the registration page (the
  email links to the deployed URL).
