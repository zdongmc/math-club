# Development Guide

## Making Changes

### Main Website (`docs/`)
1. **Navigation**: Edit `docs/header-template.js` — shared by all pages
2. **Content**: Edit individual HTML files in `docs/`
3. **New page**: Create HTML file in `docs/` + add nav item to `header-template.js`
4. **Deploy**: Push to `main` branch — GitHub Pages deploys automatically from `/docs`

All HTML files are self-contained (embedded CSS + JS). No build step, no external dependencies.

### Parent Portal (`math-club-attendance/`)
See full deployment steps in [PARENT_PORTAL.md](PARENT_PORTAL.md).  
Short version: `clasp push --force` → update the **existing** deployment in the Apps Script web UI.

### Competition Materials
- **MATHCOUNTS**: `mathcounts/` — `countdown-round-questions.html` is local-only (in `.gitignore`), never push
- **Math League**: `math-league/math-league-meet-slides.html` — fully standalone
- **MOEMS**: `moems/` — teaching materials, no deployment needed

### Games
- **Training Kitchen / Algebra Kitchen / Prime or Not**: Each has a separate `-backend/` Apps Script project
- Deploy backends separately: `clasp push --force` in the backend folder, then `clasp deploy`

## Data Quality

Before deploying portal changes, verify data consistency across sheets:

```python
import csv
from difflib import SequenceMatcher

# Checks for:
# 1. Name spelling mismatches between sheets
# 2. Same ID assigned to different students
# 3. Same student with different IDs
# 4. Names with extra spaces
# 5. Similar IDs (possible typos)

# Run: python3 check_data_quality.py
```

**Common issues:**
- Name spelled differently across sheets (e.g., "Devaguptapu" vs "Devaguptapo")
- Parent name entered instead of student name in School List
- Duplicate MCPS IDs for different students
- Missing leading digits in IDs (e.g., "1013986" vs "10113986")
- Extra spaces in names

## Design Patterns

- **Theme**: Red gradient `#dc2626 → #991b1b`, gold accents `#ffd700`
- **Layout**: Responsive grids with `auto-fit` and `minmax()`
- **Interactions**: Hover effects, smooth transitions, loading states
- **Structure**: Semantic HTML, proper heading hierarchy
- **Games**: Warm amber/cream color scheme (Training Kitchen, Algebra Kitchen)

## External Dependencies

| Resource | URL |
|----------|-----|
| Club Registration Form | https://forms.gle/PMdmzV79ZZd5jBso6 |
| Extracurricular Activities Form (school) | https://docs.google.com/forms/d/e/1FAIpQLSfublOE3YoXop_RTQn0IykEI1EOZZgPlx_Fn2Or0xD-ucSYZw/viewform |
| Competition Sign-up Form | https://docs.google.com/forms/d/e/1FAIpQLScYpMKiwcsPvePzsacLdJKKxqjIrxVMEGHEfl5AJO0ilwqBgA/viewform |
| Parent Portal | https://script.google.com/macros/s/AKfycbye0EfX9YL0Gg4Ih4OeN6sLcGAN57nPzVtk88rQYMrA8gyEE9Zlu-aLY9udIEskvIMJ/exec |

No JavaScript frameworks used on the main website.

## Contact

- Math Coach: Prof. Jojo (zdongmc@gmail.com)
- School: Hallie Wells Middle School, Clarksburg, MD
