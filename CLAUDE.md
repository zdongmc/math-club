# CLAUDE.md

Static HTML website for the Hallie Wells Middle School Competition Math Club, with a Google Apps Script parent portal for student records. The main site deploys via GitHub Pages; the portal deploys via Google Apps Script.

## Directory Structure

| Directory | Contents |
|-----------|---------|
| `docs/` | Public website (GitHub Pages source) |
| `math-club-attendance/` | Parent portal — Google Apps Script backend + HTML frontend |
| `mathcounts/` | MATHCOUNTS competition tools and materials |
| `math-league/` | Math League meet timer and documentation |
| `moems/` | MOEMS teaching materials and vocabulary activities |
| `games/` | Interactive games: Math Detective, Training Kitchen, Algebra Kitchen, Prime or Not, Would You Rather?, Which Is Bigger, Zebra Tournament |
| Root | Config files, this file, companion docs below |

## Documentation Index

| Topic | File |
|-------|------|
| Website pages, navigation, styling | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Parent portal: functions, UI behavior, Google Sheets schemas, deployment | [PARENT_PORTAL.md](PARENT_PORTAL.md) |
| MATHCOUNTS, Math League, MOEMS materials | [COMPETITIONS.md](COMPETITIONS.md) |
| Math Detective, Training Kitchen, Algebra Kitchen, Would You Rather, Which Is Bigger, Prime or Not, Zebra Tournament | [GAMES.md](GAMES.md) |
| Development workflow, data quality, design patterns, external URLs | [DEVELOPMENT.md](DEVELOPMENT.md) |

## Critical Guidelines

**Commands:** Always prefix shell commands with `rtk` (see `~/CLAUDE.md`).

**MCPS IDs:** Variable-length numeric strings. Validation: `/^\d+$/` — do not assume a fixed length.

**Student lookup order:** Form Responses 1 → Attendance Records → School List → Form Responses 2. Stops at first match. After finding a student by ID, all further lookups (attendance, form completion) use the student's **name**, not ID.

**Student names must match exactly** across all sheets (case-insensitive, but spelling identical). Name mismatches silently break attendance and results display.

**Portal deployment:** Never create a new deployment for production changes. Always edit the **existing** deployment ending in `...Y9udIEskvIMJ` via the Apps Script web UI → Deploy → Manage deployments → Edit. This keeps the URL in `registration.html` stable.

**Web app config:** `appsscript.json` must have `"access": "ANYONE_ANONYMOUS"`. Deployment must be "Execute as: Me" + "Who has access: Anyone" (set via web UI, not clasp).

**Noetic inline assembly:** `lookupStudentByMcpsId` assembles Noetic data inline — it does NOT call `getNoeticResults()`. When adding new Noetic fields, update both places.

## Contact

- Math Coach: Prof. Jojo (zdongmc@gmail.com)
- School: Hallie Wells Middle School, Clarksburg, MD
