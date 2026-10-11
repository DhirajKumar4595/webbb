# JVM Shyamali — School Exhibition Website

Independent exhibition edition for 14 October 2026. This is not the school's officially authorized website.

## Open and demonstrate

1. Open `index.html` in a modern desktop browser (double-click, or right-click → Open with → Edge/Chrome/Firefox). No installation, account, server, API key or build is required.
2. The standalone HTML contains its CSS, JavaScript, photographs, logo and downloadable source calendar. Keep a copy on the exhibition laptop and a USB drive.
3. Choose a class and month in the calendar. Switch among Upcoming, Holidays & Reopening, and Activities & Exams. Select a date for details.
4. Open **Shyamalian** using the floating robot or welcome card. Try:
   - “About the school”
   - “When is the Class 9 science exhibition?”
   - “What about Class 10?”
   - “And next month?”
   - “Winter holidays kab hain?”
   - “When will school reopen?”
   - “Is school open on 14 October?”
5. Click the link in an answer to view its matching calendar records. It preserves the original answer’s results even after later questions.
6. Use the ↻ button to clear the conversation and context. The minus button minimizes; the floating robot reopens it. Escape closes the chat/menu. Calendar tabs support left/right arrows, Home and End.

## Offline preparation — complete on the actual laptop

The active page has zero external runtime dependencies and makes no network requests. The assistant uses deterministic JavaScript retrieval, not ChatGPT or a live language model. Official source links require internet; embedded school information and calendar lookup do not require a connection by design.

Actual browser offline testing was unavailable in the development environment. Before submission, disconnect Wi-Fi, close and reopen the downloaded HTML, and check:

- Logo and both hero photographs appear.
- Hamburger navigation opens, closes and reaches the requested section.
- Calendar class/month filters and holiday/activity tabs work.
- Welcome, launcher, send, clear, minimize and close work.
- The five example questions above return readable answers.
- Chat answer links display the corresponding records.
- Original calendar PDF downloads/opens.
- The page fits the laptop and a narrow mobile window without horizontal overflow.
- Browser console shows no errors.

On a phone, download the file and open it with an HTML-capable browser/file viewer. Some messaging-app preview panes disable JavaScript; use the actual browser. For online sharing, upload this same index.html to a static host. No deployment was performed in this task.

## What changed

- Premium navy, teal and warm-neutral styling, updated typography, responsive panels, manual photo carousel and clear source labels.
- Genuine JVM branding from the supplied reference assets. Fictional school records were not imported.
- Preserved every existing calendar record, original HTML ID, calendar filter, schedule tab, leadership control and source download.
- Added school introduction and facilities descriptions verified against published school pages, with dated provenance. Unknown fees, contacts, staff identities and policies are explicitly unavailable.
- Replaced the limited keyword responder with a structured offline interpreter: class parsing (including Roman numerals and class ranges), intent recognition, controlled fuzzy matching, aliases, limited Hindi-English phrasing, date/range parsing, India-time relative dates, session context and bounded four-record responses.
- Added context display, clickable follow-ups, processing feedback, timestamps, clear-chat, safe text rendering and exact chat-to-calendar links.
- No automatic live updates, application submission, payment collection or API service.

## Accurate interpretation

The date clock is the device's current date in Asia/Kolkata. Weeks run Monday–Sunday. Named dates without a year use the supplied academic session (Apr–Dec 2026, Jan–Mar 2027). A standalone “next month” uses the current month. A follow-up “and next month” advances the previously selected period, or the current month if no period was selected.

Holiday ranges are inclusive calendar dates. Printed school holiday counts are separate and may exclude other days. A national festival or activity does not establish attendance or closure. “Kal” is ambiguous and triggers clarification. This is a bounded school assistant, not general-purpose natural-language AI; unsupported questions receive a fallback rather than invented answers.

## Data and limitations

- All **183** calendar records are unchanged from the uploaded `index(1).html`: 30 holiday/reopening records and 153 activity records. The full original file is preserved at `backup/source-original.html`.
- The source scan is `School_Calendar_Source_2026-27.pdf` (also embedded in the page).
- Missing activity spread: Classes III–V January–March 2027; Classes VI–X April–June 2026.
- Some scan footnotes are obscured. The original status flags, zero printed holiday counts, uncertain examination entries and Birsa footnote conflict remain recorded.
- The prior pasted extraction conflicts with readable scan entries. The existing scan-based dataset is preserved; no calendar dates were changed in this update.
- School profile, laboratory/library descriptions and general admission references were checked against the official website on 10 October 2026. They are stored descriptions, not real-time updates.
- No verified current fee amounts, contact numbers, staff appointments, admissions vacancies/deadlines, detailed class curricula, alumni profiles or urgent notices were supplied. No fictional values were substituted.
- Source photographs are retained from the supplied reference screenshots; they are not newly photographed or higher-resolution originals.

## Files and optional maintenance

`index.html` is the only file needed to operate the site. Other files are editable source and test materials:

- `school-calendar.json`: authoritative calendar records.
- `school-info.json`: sourced school facts and explicit unknowns; shared by sections and chat.
- `engine.js`: pure offline parser and retrieval engine.
- `chat-ui.js`: chat presentation and integration.
- `script.js`: assembled website logic.
- `styles.css`: existing styles plus the exhibition refinements.
- `template.html`: page structure with embedding placeholders.
- `assets/`: copies of the supplied image crops, for maintenance.
- `build.py`: optional standard-library maintainer helper to rebuild index.html after editing these source files. Python is not needed by visitors.
- `tests/`: executable chatbot and interface tests plus recorded results.

For source maintenance only, `python build.py` embeds the sources. `node tests/chatbot.cjs` runs the question suite. `python tests/static.py` then `node tests/interface.cjs` runs static and simulated-DOM checks. Node and Python are test/maintenance tools only, never website requirements.

## Optional future AI

No credentials or configuration are needed for the offline assistant. `getAssistantReply` remains an integration boundary for a future secure server-side service. Any such service must keep provider secrets off the page and retain local retrieval when unavailable. No live AI backend was added or tested.
