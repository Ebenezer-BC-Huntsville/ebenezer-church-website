# Ebenezer Baptist Church — website

A single-page Flask site: hero, welcome, pastor's note, service times,
location + map, and a contact form that emails you directly.

```
app.py                 Flask app (routes: GET /, POST /contact)
templates/index.html   the page
static/style.css       styles
static/script.js       mobile nav, scroll fade-ins, form submission
requirements.txt       Python deps (just Flask)
.env.example            documents the required environment variables
```

## 1. Fill in the real content

Search the HTML for `[REPLACE:` and `[` — those are placeholders:

- `templates/index.html` — hero welcome line, about paragraph, the
  pastor's note, the three Faith/Community/Growth lines, service times
- `templates/index.html` (location section) + `app.py` — the real street
  address, phone number, and the map embed URL
- `.env.example` → copy to `.env` and fill in real values (see step 2)

For the map, swap the placeholder query in the `<iframe>` `src` for the
real address, e.g.:
`https://www.google.com/maps?q=123+Main+St+Euless+TX&output=embed`
No API key needed for this basic embed.

## 2. Set up email sending (Gmail App Password)

The contact form sends mail through Gmail's SMTP server using an **App
Password** — a 16-character code separate from the real Gmail password,
scoped to just this use.

1. The Gmail account needs 2-Step Verification turned on first
   (myaccount.google.com/security).
2. Go to myaccount.google.com/apppasswords, create one named something
   like "Church website", and copy the 16-character code.
3. Put it in `.env` (local) or Vercel's environment variables
   (production) as `GMAIL_APP_PASSWORD` — see `.env.example` for the
   other two variables it needs alongside it.

## 3. Run it locally

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in real values
export $(cat .env | xargs)      # Windows: set each var manually, or use python-dotenv
python app.py
```

Visit `http://localhost:5000`.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In the Vercel dashboard: **Add New → Project**, import that repo.
   Vercel detects Flask from `requirements.txt` automatically — no
   `vercel.json` needed.
3. Before the first deploy (or right after, then redeploy), go to
   **Settings → Environment Variables** and add the same three
   variables from `.env.example` with real values.
4. Deploy. You'll get a `*.vercel.app` URL to confirm it works before
   pointing the real domain at it.

## 5. Point visiteb.church at Vercel (keep the domain at GoDaddy)

You don't need to move the domain anywhere — GoDaddy stays the
registrar, you're just telling it where to send traffic. In the Vercel
project: **Settings → Domains → Add**, enter `visiteb.church`. Vercel
will show the exact records to add; as of now they're:

| Type  | Name | Value                  |
|-------|------|-------------------------|
| A     | @    | `76.76.21.21`           |
| CNAME | www  | `cname.vercel-dns.com`  |

In GoDaddy: **My Products → DNS → Manage DNS** for the domain, then add
those two records. GoDaddy auto-creates a placeholder "Parked" A record
on `@` — **delete that first**, or the new one won't take effect.

DNS changes usually take a few minutes to propagate (occasionally up to
a few hours). Vercel's domain page will show "Valid Configuration" once
it sees it, and it issues an SSL certificate automatically at that
point — no separate cert step.

*(This only touches the A and CNAME records, so if the church has email
through GoDaddy or anywhere else, those MX records are untouched.)*

## Spam protection

The form has a honeypot field (a hidden input real visitors never fill
in, but simple bots do) — no extra setup needed. If spam still gets
through once it's live, adding Google reCAPTCHA is the natural next
step; it needs a site key + secret key from
google.com/recaptcha and a small JS/HTML addition — happy to wire that
up if it becomes a problem.

## If the pastor wants to update his own note without touching code

Right now the note lives directly in `templates/index.html`, so any
edit means a code change and redeploy. That's fine for something that
changes rarely. If it turns out to change often and you'd rather he
edit it himself through a simple form instead, that's a separate
small feature to add later — just flag it.
