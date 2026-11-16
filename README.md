# Bloom Study Tracker — Version 2

A responsive browser-based study planner with separate subject pages and a configurable focus timer.

## Run on Windows
1. Download and extract `bloom-study-tracker-v2.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to launch in Chrome, Edge, Firefox, or another modern browser.
4. No Node.js, npm, server, or installation is required.

## Pages
- Overview — subject links, total chapters, task progress and overall completion.
- Physics — its own chapter tracker page.
- Chemistry — its own chapter tracker page.
- Botany — its own chapter tracker page.
- Zoology — its own chapter tracker page.
- Focus timer — 25, 45 and 60 minute presets, custom duration (1–180 minutes), pause/resume/reset, and a 5-minute break timer.

## Tracker columns
Chapter Name (editable), Module, Race Module, NCERT, JEE Mains, NEET PYQs.
Each status dropdown offers Not yet started, In Progress and Done.

## Other features
- Add/delete chapters, search within a subject, automatic local browser saving.
- Print the currently selected subject page or save it as PDF from the print dialog.
- Export/restore a JSON backup.

## Files
- `index.html` — app structure and navigation
- `styles.css` — visual design, responsive layout, print stylesheet
- `app.js` — data handling, subject pages, timer, backup and printing

## Notes
Data is stored locally in the browser. Export a backup before clearing browser data or switching devices. The optional Google Fonts import improves typography when internet access is available; the app still works offline with fallback fonts.
