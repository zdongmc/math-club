#!/usr/bin/env python3
"""Generate AMC 8 Question Analysis PDF."""

from fpdf import FPDF

data = [
    (1,  46, 49, 93.9, "Easy"),
    (2,  40, 49, 81.6, "Easy"),
    (3,  39, 49, 79.6, "Easy"),
    (4,  37, 49, 75.5, "Easy"),
    (5,  41, 49, 83.7, "Easy"),
    (6,  32, 49, 65.3, "Easy"),
    (7,  32, 49, 65.3, "Easy"),
    (8,  33, 49, 67.3, "Easy"),
    (9,  22, 49, 44.9, "Medium"),
    (10, 29, 49, 59.2, "Medium"),
    (11, 26, 49, 53.1, "Medium"),
    (12, 27, 49, 55.1, "Medium"),
    (13, 20, 49, 40.8, "Medium"),
    (14, 27, 49, 55.1, "Medium"),
    (15, 27, 49, 55.1, "Medium"),
    (16,  6, 49, 12.2, "Hard"),
    (17, 25, 49, 51.0, "Medium"),
    (18, 12, 49, 24.5, "Hard"),
    (19, 16, 49, 32.7, "Medium"),
    (20, 16, 49, 32.7, "Medium"),
    (21, 10, 49, 20.4, "Hard"),
    (22, 10, 49, 20.4, "Hard"),
    (23, 15, 49, 30.6, "Medium"),
    (24,  9, 49, 18.4, "Hard"),
    (25,  6, 49, 12.2, "Hard"),
]

DIFF_COLORS = {
    "Easy":   (220, 252, 231),  # green
    "Medium": (254, 249, 195),  # yellow
    "Hard":   (254, 226, 226),  # red
}

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()

# Title
pdf.set_font("Helvetica", "B", 18)
pdf.cell(0, 12, "AMC 8 Question Analysis", new_x="LMARGIN", new_y="NEXT", align="C")

# Subtitle
pdf.set_font("Helvetica", "", 11)
pdf.cell(0, 8, "Hallie Wells Middle School  |  49 Students  |  2025-2026", new_x="LMARGIN", new_y="NEXT", align="C")
pdf.ln(6)

# Table setup
col_widths = [25, 25, 30, 30, 30, 30]
headers = ["Question", "Correct", "Out of", "% Correct", "Difficulty", ""]
row_h = 8

# Header row
pdf.set_font("Helvetica", "B", 10)
pdf.set_fill_color(153, 27, 27)  # dark red
pdf.set_text_color(255, 255, 255)
for i, (header, w) in enumerate(zip(["Question", "Correct", "Out of", "% Correct", "Bar", "Difficulty"], col_widths)):
    pdf.cell(w, row_h, header, border=1, fill=True, align="C")
pdf.ln()

# Data rows
pdf.set_font("Helvetica", "", 10)
for q, correct, total, pct, diff in data:
    r, g, b = DIFF_COLORS[diff]
    pdf.set_fill_color(r, g, b)
    pdf.set_text_color(0, 0, 0)

    pdf.cell(col_widths[0], row_h, str(q), border=1, fill=True, align="C")
    pdf.cell(col_widths[1], row_h, str(correct), border=1, fill=True, align="C")
    pdf.cell(col_widths[2], row_h, str(total), border=1, fill=True, align="C")
    pdf.cell(col_widths[3], row_h, f"{pct:.1f}%", border=1, fill=True, align="C")

    # Bar chart cell
    x_bar = pdf.get_x()
    y_bar = pdf.get_y()
    pdf.cell(col_widths[4], row_h, "", border=1, fill=True)
    # Draw filled bar
    bar_max = col_widths[4] - 2
    bar_w = bar_max * pct / 100
    if diff == "Easy":
        pdf.set_fill_color(34, 197, 94)
    elif diff == "Medium":
        pdf.set_fill_color(234, 179, 8)
    else:
        pdf.set_fill_color(239, 68, 68)
    pdf.rect(x_bar + 1, y_bar + 1.5, bar_w, row_h - 3, "F")

    # Reset fill for difficulty label
    r, g, b = DIFF_COLORS[diff]
    pdf.set_fill_color(r, g, b)
    pdf.cell(col_widths[5], row_h, diff, border=1, fill=True, align="C")
    pdf.ln()

pdf.ln(6)

# Summary section
pdf.set_font("Helvetica", "B", 12)
pdf.cell(0, 8, "Summary", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Helvetica", "", 10)

summaries = [
    "Difficulty distribution: 8 Easy, 11 Medium, 6 Hard",
    "Questions 1-8 were all Easy (>= 60% correct), with Q1 easiest at 93.9%.",
    "Q16 and Q25 tied as hardest (12.2% correct, only 6/49 students).",
    "Q16 is a notable difficulty spike - harder than Q17-Q20 around it.",
    "The six hardest questions: Q16, Q18, Q21, Q22, Q24, Q25 (all below 25%).",
]
for line in summaries:
    pdf.cell(0, 6, f"  -  {line}", new_x="LMARGIN", new_y="NEXT")

# Legend
pdf.ln(4)
pdf.set_font("Helvetica", "B", 10)
pdf.cell(0, 7, "Legend", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Helvetica", "", 9)
for label, threshold, color in [("Easy", ">= 60%", (220, 252, 231)), ("Medium", "30-59%", (254, 249, 195)), ("Hard", "< 30%", (254, 226, 226))]:
    pdf.set_fill_color(*color)
    pdf.cell(12, 6, "", border=1, fill=True)
    pdf.cell(60, 6, f"  {label} ({threshold})", new_x="LMARGIN", new_y="NEXT")

output_path = "/Users/goldie/workspace/math-club/AMC8/AMC8_Question_Analysis.pdf"
pdf.output(output_path)
print(f"PDF saved to {output_path}")
