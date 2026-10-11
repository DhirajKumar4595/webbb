# Validation and change record

## Executed checks

| Check | Result | Scope |
|---|---|---|
| Chatbot suite | 111 / 111 passed | Pure JavaScript execution, deterministic test clocks; full questions and responses in tests/chatbot-results.json |
| Interface regression suite | 40 / 40 passed | Node VM with a simulated DOM; asynchronous sending, reset, links, menus, calendars and carousels |
| JavaScript syntax | Passed | node --check script.js |
| Calendar preservation | Passed | All 183 records equal the uploaded baseline, including source/status metadata |
| Original HTML IDs | Passed | Every original ID retained; all IDs unique |
| Internal links and ARIA references | Passed | All referenced targets exist |
| Embedded images and PDF | Passed | PNG bytes decoded; image decoding checked during development; PDF header verified |
| Source synchronization | Passed | Embedded CSS/JS match editable sources |
| Offline dependency audit | Passed | No remote scripts/styles/fonts/images, fetch or XHR in active HTML; simulated runtime network calls: 0 |
| Real browser layout and console | NOT RUN | Browser automation unavailable |
| Browser airplane-mode/file:// test | NOT RUN | Must be checked on the exhibition device |
| Actual mobile Safari/Chrome | NOT RUN | Responsive CSS and overflow guards implemented; not visually certified |
| CSS parser | NOT RUN | Dedicated CSS parser unavailable |

The automated suites are meaningful executable checks, but do not substitute for a browser rendering engine. No claim of a completed browser-based offline test is made.

## Representative fixes exercised by tests

- About-school queries now return the same sourced profile shown on the page.
- “Next month” uses a real future month, including December–January rollover.
- Indian midnight boundaries, yesterday/tomorrow and Monday-based weeks are handled correctly.
- Invalid dates and inverted ranges prompt clarification.
- Other academic years are not silently answered from 2026–27.
- School-open questions distinguish recorded vacations, explicit reopenings, national observances and missing evidence.
- Class 9 → Class 10 → next-month follow-ups preserve the intended event.
- Class numbers cannot be mistaken for calendar dates.
- Limited spelling/Hindi-English aliases resolve to recorded events; ambiguous Eid/“kal” queries clarify.
- Results are limited to four records per message with explicit continuation.
- Clear-chat cancels stale pending UI output.
- Chat links without a date no longer dereference a null period.
- An old answer's calendar link retains that answer's records after later questions.
- Questions are rendered as text, not executable HTML.

## Preservation

The original upload was read into a separate working directory. It was not overwritten. A byte-preserved copy is included in backup/source-original.html. The baseline SHA-256 and preservation results are in tests/data-integrity.json.

## Source references

- https://www.jvmshyamali.com/home
- https://www.jvmshyamali.com/History-SchoolProfile-Culture
- https://www.jvmshyamali.com/Admission-Procedure
- https://www.jvmshyamali.com/Laboratory
- https://www.jvmshyamali.com/Library
- User-supplied reference screenshots and nine-page 2026–27 calendar scan.

Source access covered the visible conversation, the latest uploaded HTML, retained project assets/source scan, and the public pages above. Inaccessible historical conversations were not claimed as reviewed.
