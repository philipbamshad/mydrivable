# Why the Google card still shows the old text

The live site is already correct. Fetching https://mydrivable.com right now returns:

- Title: "Drivable, Master Your Permit"
- Description: "Ace Your Permit Test on the First Try. An AI driving coach trained on every official DMV handbook, with full-length mock permit exams and targeted section drills."

The card in your screenshot is Google's cached copy. Search Console shows the homepage was last crawled on 2026-08-17, before the wording changed, so the old title and description are being replayed from that crawl. No code change can force Google to refresh instantly.

Search Console also reports one real issue worth fixing: "Duplicate, Google chose different canonical than user". Google indexes the **www** version (https://www.mydrivable.com/), while the site declares the **non-www** version as canonical and lists non-www in the sitemap. That mismatch weakens indexing and is why the card you see is on the www URL.

## What to change in the project

Align the declared canonical with the version Google actually indexes, so the signals stop conflicting:

1. Point the homepage canonical and `og:url` at `https://www.mydrivable.com/`.
2. Point the privacy page canonical and `og:url` at `https://www.mydrivable.com/privacy`.
3. Update the sitemap route to emit the www URLs.
4. Update the `Sitemap:` line in `robots.txt` to the www sitemap URL.

Nothing else changes: no wording, no layout, no new metadata plumbing, no structured data changes.

## What you do after that (outside the app)

1. Publish so the change is live.
2. In Google Search Console, open URL Inspection, enter `https://www.mydrivable.com/`, and click "Request Indexing". Repeat for the privacy page if you want.
3. Resubmit the sitemap in the Sitemaps section.

Refresh timing is Google's, typically a few days. The title and description in the card will update on the next crawl.

## Technical details

- Files touched: `src/routes/index.tsx` (canonical + `og:url`), `src/routes/privacy.tsx` (canonical + `og:url`), `src/routes/sitemap[.]xml.ts` (base URL), `public/robots.txt` (sitemap line).
- `src/routes/__root.tsx` keeps sitewide defaults only; no canonical is added there, since root and leaf canonicals would both emit.
- The www host currently answers with a 302 rather than a 301, which is handled by the hosting layer and not by app code; declaring www as canonical is the project-side fix available here.
