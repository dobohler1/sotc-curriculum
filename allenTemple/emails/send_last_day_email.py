"""
Send Last Day Celebration email to Allen Temple parents via Brevo.

Steps:
1. Creates a contact list "Allen Temple - Last Day March 2026"
2. Uploads parent contacts from the attendance roster CSV
3. Creates the email campaign
4. Sends a test email to Dorian first
5. Waits for confirmation before sending to everyone

Usage:
    python send_last_day_email.py              # Run full workflow (stops at test send)
    python send_last_day_email.py --send-now   # Send to all after reviewing test
"""

import urllib.request
import urllib.error
import json
import csv
import os
import sys

# ---------------------------------------------------------------------------
# Credentials
# ---------------------------------------------------------------------------

def load_credentials():
    """Load API keys from ~/.credentials.env into environment variables."""
    creds = {}
    path = os.path.expanduser('~/.credentials.env')
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                creds[key.strip()] = val.strip()
                os.environ[key.strip()] = val.strip()
    return creds

load_credentials()
API_KEY = os.environ['BREVO_API_KEY']

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SENDER_NAME = "Science on the Court"
SENDER_EMAIL = "info@scienceonthecourt.com"      # Authenticated sender in Brevo
REPLY_TO = "dbohler@scienceonthecourt.com"
TEST_EMAIL = "bohler.physics@gmail.com"

ROSTER_CSV = os.path.join(os.path.dirname(__file__), '..', 'ATBC_parentemails.csv')
EMAIL_HTML = os.path.join(os.path.dirname(__file__), 'last_day_email.html')

LIST_NAME = "Allen Temple - Last Day March 2026"
CAMPAIGN_NAME = "Allen Temple Last Day Celebration - March 17"
SUBJECT = "You're Invited: Last Day Celebration — This Tuesday, March 17"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def brevo_request(endpoint, data=None, method=None):
    """Make a Brevo API request."""
    url = f'https://api.brevo.com/v3/{endpoint}'
    headers = {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        raw = resp.read()
        return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode())
        return {'error': True, 'status': e.code, 'body': error_body}

# ---------------------------------------------------------------------------
# Step 1: Create contact list
# ---------------------------------------------------------------------------

def create_list():
    print("--- Step 1: Creating contact list ---")
    result = brevo_request('contacts/lists', {'name': LIST_NAME, 'folderId': 1}, 'POST')
    if 'error' in result:
        if 'already exist' in str(result['body']).lower():
            print(f"  List '{LIST_NAME}' already exists. Looking it up...")
            # Fetch all lists and find ours
            lists = brevo_request('contacts/lists?limit=50')
            for lst in lists.get('lists', []):
                if lst['name'] == LIST_NAME:
                    print(f"  Found existing list ID: {lst['id']}")
                    return lst['id']
            print("  ERROR: Could not find existing list.")
            sys.exit(1)
        else:
            print(f"  ERROR: {result['body']}")
            sys.exit(1)
    list_id = result['id']
    print(f"  List created. ID: {list_id}")
    return list_id

# ---------------------------------------------------------------------------
# Step 2: Upload contacts from roster
# ---------------------------------------------------------------------------

def upload_contacts(list_id):
    print("\n--- Step 2: Uploading contacts ---")
    seen_emails = set()
    count = 0

    with open(ROSTER_CSV, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            email = (row.get('Email') or '').strip().lower()
            if not email or '@' not in email or email in seen_emails:
                continue
            seen_emails.add(email)

            # Squarespace export: use parent name field, fall back to billing name
            parent_name = (
                row.get('Product Form: Parent/ Guardian Full Name')
                or row.get('Billing Name')
                or ''
            ).strip()
            parts = parent_name.split()
            first_name = parts[0] if parts else ''
            last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

            contact = {
                'email': email,
                'attributes': {
                    'FIRSTNAME': first_name,
                    'LASTNAME': last_name
                },
                'listIds': [list_id],
                'updateEnabled': True
            }
            result = brevo_request('contacts', contact, 'POST')
            if 'error' in result:
                print(f"  Warning for {email}: {result['body']}")
            else:
                print(f"  Added: {email} ({first_name})")
                count += 1

    print(f"\n  Total unique contacts uploaded: {count}")

    # Verify
    info = brevo_request(f'contacts/lists/{list_id}')
    print(f"  List '{info.get('name')}' now has {info.get('totalSubscribers', '?')} subscribers")
    return count

# ---------------------------------------------------------------------------
# Step 3: Create campaign
# ---------------------------------------------------------------------------

def create_campaign(list_id):
    print("\n--- Step 3: Creating email campaign ---")
    with open(EMAIL_HTML, 'r') as f:
        html_content = f.read()

    campaign = {
        'name': CAMPAIGN_NAME,
        'subject': SUBJECT,
        'sender': {'name': SENDER_NAME, 'email': SENDER_EMAIL},
        'replyTo': REPLY_TO,
        'recipients': {'listIds': [list_id]},
        'htmlContent': html_content
    }
    result = brevo_request('emailCampaigns', campaign, 'POST')
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
        sys.exit(1)

    campaign_id = result['id']
    print(f"  Campaign created. ID: {campaign_id}")
    return campaign_id

# ---------------------------------------------------------------------------
# Step 4: Send test email
# ---------------------------------------------------------------------------

def send_test(campaign_id):
    print(f"\n--- Step 4: Sending test email to {TEST_EMAIL} ---")
    result = brevo_request(
        f'emailCampaigns/{campaign_id}/sendTest',
        {'emailTo': [TEST_EMAIL]},
        'POST'
    )
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
    else:
        print(f"  Test email sent! Check {TEST_EMAIL}")

# ---------------------------------------------------------------------------
# Step 5: Send for real
# ---------------------------------------------------------------------------

def send_now(campaign_id):
    print(f"\n--- Step 5: Sending campaign {campaign_id} to all contacts ---")
    result = brevo_request(f'emailCampaigns/{campaign_id}/sendNow', {}, 'POST')
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
    else:
        print("  Campaign sent!")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    if '--send-now' in sys.argv:
        # Just send — assumes campaign was already created
        campaign_id = input("Enter campaign ID from test run: ").strip()
        send_now(int(campaign_id))
    else:
        list_id = create_list()
        upload_contacts(list_id)
        campaign_id = create_campaign(list_id)
        send_test(campaign_id)
        print(f"\n{'='*60}")
        print(f"Campaign ID: {campaign_id}")
        print(f"Check your test email at {TEST_EMAIL}")
        print(f"When ready, run:  python {__file__} --send-now")
        print(f"{'='*60}")
