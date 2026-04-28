"""
Send "Class On Hold — But We Need Your Input" survey email to the full
Allen Temple parent list, including Phase 2 registered families.

Recipient sources merged into one Brevo list:
  1. Squarespace Phase 1 export   -> ATBC_parentemails.csv
  2. Phase 2 Stripe customers     -> Stripe API (Customers, filtered by
     creation date >= PHASE2_START to capture only Phase 2 buyers)

Steps:
  1. Create (or reuse) Brevo list "Allen Temple - Class On Hold Survey"
  2. Upload merged contacts (de-duped by email)
  3. Create the email campaign
  4. Send a test to Dorian
  5. Wait for review, then --send-now to fire to all

Usage:
    python send_class_on_hold_email.py              # Build list + send test
    python send_class_on_hold_email.py --send-now   # Send to all (after test review)
"""

import urllib.request
import urllib.error
import urllib.parse
import json
import csv
import os
import sys
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Credentials
# ---------------------------------------------------------------------------

def load_credentials():
    """Load API keys from ~/.credentials.env into environment variables."""
    path = os.path.expanduser('~/.credentials.env')
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()

load_credentials()
BREVO_KEY  = os.environ['BREVO_API_KEY']
STRIPE_KEY = os.environ.get('STRIPE_API_KEY', '')

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SENDER_NAME  = "Science on the Court"
SENDER_EMAIL = "info@scienceonthecourt.com"
REPLY_TO     = "dbohler@scienceonthecourt.com"
TEST_EMAIL   = "bohler.physics@gmail.com"

ROSTER_CSV = os.path.join(os.path.dirname(__file__), '..', 'ATBC_parentemails.csv')
EMAIL_HTML = os.path.join(os.path.dirname(__file__), 'class_on_hold_email.html')

LIST_NAME     = "Allen Temple - Class On Hold Survey"
CAMPAIGN_NAME = "Allen Temple - Class On Hold Survey (June 5 vs Summer Camp)"
SUBJECT       = "Class On Hold — But We Need Your Input"

# Earliest date a Stripe customer is considered a Phase 2 buyer.
# Phase 2 registration / payment links went live in mid-March 2026.
PHASE2_START_UNIX = int(datetime(2026, 3, 1, tzinfo=timezone.utc).timestamp())

# ---------------------------------------------------------------------------
# Brevo helpers
# ---------------------------------------------------------------------------

def brevo(endpoint, data=None, method=None):
    url = f'https://api.brevo.com/v3/{endpoint}'
    headers = {
        'api-key': BREVO_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        raw = resp.read()
        return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        return {'error': True, 'status': e.code, 'body': json.loads(e.read().decode())}

# ---------------------------------------------------------------------------
# Stripe helpers
# ---------------------------------------------------------------------------

def stripe_get(endpoint, params=None):
    if not STRIPE_KEY:
        return {'error': True, 'body': 'STRIPE_API_KEY not set'}
    qs = ('?' + urllib.parse.urlencode(params)) if params else ''
    url = f'https://api.stripe.com/v1/{endpoint}{qs}'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {STRIPE_KEY}'})
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {'error': True, 'status': e.code, 'body': e.read().decode()}

def fetch_phase2_stripe_contacts():
    """
    Pull Phase 2 buyers from Stripe Charges. Payment Links don't create
    Customer records — the buyer email lives on the Charge's billing_details.
    Filter to succeeded $25 charges (the Phase 2 program fee) since
    PHASE2_START. De-dupe by email; one parent may have multiple kids
    (and thus multiple charges).
    """
    if not STRIPE_KEY:
        print("  WARNING: STRIPE_API_KEY not set — skipping Stripe pull.")
        return []

    by_email = {}
    starting_after = None
    while True:
        params = {
            'limit': 100,
            'created[gte]': PHASE2_START_UNIX,
        }
        if starting_after:
            params['starting_after'] = starting_after
        result = stripe_get('charges', params)
        if 'error' in result:
            print(f"  Stripe error: {result.get('body')}")
            break
        for ch in result.get('data', []):
            if ch.get('status') != 'succeeded' or ch.get('amount') != 2500:
                continue
            bd = ch.get('billing_details') or {}
            email = (bd.get('email') or ch.get('receipt_email') or '').strip().lower()
            if not email:
                continue
            name = (bd.get('name') or '').strip()
            parts = name.split()
            first = parts[0] if parts else ''
            last  = ' '.join(parts[1:]) if len(parts) > 1 else ''
            # Keep first-seen entry; ignore duplicate charges for same parent.
            by_email.setdefault(email, {'email': email, 'first': first, 'last': last})
        if not result.get('has_more'):
            break
        starting_after = result['data'][-1]['id']
    return list(by_email.values())

# ---------------------------------------------------------------------------
# Roster reader (Squarespace export)
# ---------------------------------------------------------------------------

def fetch_squarespace_contacts():
    """Read the Squarespace export. Returns list of {email, first, last}."""
    contacts = []
    with open(ROSTER_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = (row.get('Email') or '').strip().lower()
            if not email or '@' not in email:
                continue
            parent_name = (
                row.get('Product Form: Parent/ Guardian Full Name')
                or row.get('Billing Name')
                or ''
            ).strip()
            parts = parent_name.split()
            first = parts[0] if parts else ''
            last  = ' '.join(parts[1:]) if len(parts) > 1 else ''
            contacts.append({'email': email, 'first': first, 'last': last})
    return contacts

# ---------------------------------------------------------------------------
# Step 1: list
# ---------------------------------------------------------------------------

def get_or_create_list():
    print("--- Step 1: Brevo contact list ---")
    result = brevo('contacts/lists', {'name': LIST_NAME, 'folderId': 1}, 'POST')
    if 'error' in result:
        if 'already exist' in str(result['body']).lower():
            print(f"  List '{LIST_NAME}' exists — looking it up...")
            lists = brevo('contacts/lists?limit=50')
            for lst in lists.get('lists', []):
                if lst['name'] == LIST_NAME:
                    print(f"  Found list ID: {lst['id']}")
                    return lst['id']
            print("  ERROR: could not find existing list.")
            sys.exit(1)
        print(f"  ERROR: {result['body']}")
        sys.exit(1)
    print(f"  Created list ID: {result['id']}")
    return result['id']

# ---------------------------------------------------------------------------
# Step 2: upload merged contacts
# ---------------------------------------------------------------------------

def upload_contacts(list_id):
    print("\n--- Step 2: Merging + uploading contacts ---")
    sq = fetch_squarespace_contacts()
    print(f"  Squarespace (Phase 1): {len(sq)} rows")
    sp = fetch_phase2_stripe_contacts()
    print(f"  Stripe (Phase 2):      {len(sp)} rows")

    # Merge, de-dupe by email (Squarespace wins on name conflicts)
    merged = {}
    for c in sp:                       # add Stripe first
        merged[c['email']] = c
    for c in sq:                       # Squarespace overrides
        merged[c['email']] = c
    print(f"  Merged unique:         {len(merged)} contacts")

    added = 0
    for email, c in merged.items():
        contact = {
            'email': email,
            'attributes': {'FIRSTNAME': c['first'], 'LASTNAME': c['last']},
            'listIds': [list_id],
            'updateEnabled': True,
        }
        result = brevo('contacts', contact, 'POST')
        if 'error' in result:
            print(f"  Warning {email}: {result['body']}")
        else:
            added += 1
    print(f"\n  Uploaded: {added}")
    info = brevo(f'contacts/lists/{list_id}')
    print(f"  List '{info.get('name')}' total subscribers: {info.get('totalSubscribers', '?')}")

# ---------------------------------------------------------------------------
# Step 3: campaign
# ---------------------------------------------------------------------------

def create_campaign(list_id):
    print("\n--- Step 3: Creating campaign ---")
    with open(EMAIL_HTML, 'r') as f:
        html = f.read()
    campaign = {
        'name': CAMPAIGN_NAME,
        'subject': SUBJECT,
        'sender': {'name': SENDER_NAME, 'email': SENDER_EMAIL},
        'replyTo': REPLY_TO,
        'recipients': {'listIds': [list_id]},
        'htmlContent': html,
    }
    result = brevo('emailCampaigns', campaign, 'POST')
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
        sys.exit(1)
    print(f"  Campaign ID: {result['id']}")
    return result['id']

# ---------------------------------------------------------------------------
# Step 4: test
# ---------------------------------------------------------------------------

def send_test(campaign_id):
    print(f"\n--- Step 4: Sending test to {TEST_EMAIL} ---")
    result = brevo(f'emailCampaigns/{campaign_id}/sendTest', {'emailTo': [TEST_EMAIL]}, 'POST')
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
    else:
        print(f"  Test sent. Check {TEST_EMAIL}.")

# ---------------------------------------------------------------------------
# Step 5: real send
# ---------------------------------------------------------------------------

def send_now(campaign_id):
    print(f"\n--- Step 5: Sending campaign {campaign_id} to all ---")
    result = brevo(f'emailCampaigns/{campaign_id}/sendNow', {}, 'POST')
    if 'error' in result:
        print(f"  ERROR: {result['body']}")
    else:
        print("  Campaign sent.")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    if '--send-now' in sys.argv:
        cid = input("Enter campaign ID from test run: ").strip()
        send_now(int(cid))
    else:
        list_id = get_or_create_list()
        upload_contacts(list_id)
        cid = create_campaign(list_id)
        send_test(cid)
        print(f"\n{'='*60}")
        print(f"Campaign ID: {cid}")
        print(f"Test sent to {TEST_EMAIL}.")
        print(f"When ready:  python {os.path.basename(__file__)} --send-now")
        print(f"{'='*60}")
