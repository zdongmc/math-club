# Architecture: Main Website

The public website lives in `docs/` and is served via GitHub Pages from the `main` branch.

## Page Index (`docs/`)

| File | Purpose |
|------|---------|
| `index.html` | Redirects to `announcements.html` |
| `announcements.html` | Announcements page |
| `club.html` | Club info with collapsible resources section (MOEMS, MATHCOUNTS, AMC 8, Math Kangaroo, Math League) |
| `materials.html` | Full competition materials library (collapsible sections for every competition + MBMT, Purple Comet, Noetic) |
| `competitions.html` | Competition details, schedules, external resource links, and calendar view |
| `competition-reference-2025-26.html` | Quick-reference competition guide |
| `registration.html` | Registration & Records page — links to Google Form and Parent Portal |
| `header-template.js` | Shared navigation component loaded by all pages |
| `header.html` | Header component template |
| `HWMS.jpeg` | School logo |

## Navigation System

`docs/header-template.js` provides a shared nav for all pages:
- Nav items: Announcements, Club Info, Competition Info, Registration & Records
- Active page highlighted based on current URL
- Responsive/mobile-friendly layout
- Red gradient theme with white navigation pills

To update navigation (add page, rename link, etc.), edit `docs/header-template.js` — it applies to all pages at once.

## Styling Conventions

- **Theme**: Red gradient `#dc2626 → #991b1b` with gold accents `#ffd700`
- **Layout**: Responsive grids using `auto-fit` and `minmax()`
- **Interactions**: Hover effects and smooth CSS transitions throughout
- **Structure**: Full HTML documents (not fragments); embedded CSS and JS per file; no external frameworks

Each content page follows the same pattern:
- Full `<!DOCTYPE html>` structure with embedded styles
- Shared color scheme via consistent CSS values
- Responsive grid layouts
- Interactive elements with hover states and animations
- Loading states and error handling for dynamic content

## Deployment

Changes pushed to `main` branch in the `/docs` folder deploy automatically via GitHub Pages. No build step required — all files are static HTML/CSS/JS.
