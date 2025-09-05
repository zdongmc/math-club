#!/usr/bin/env python3
"""
Generate PDF certificate from HTML template using weasyprint
"""

import os
import sys
from pathlib import Path

try:
    from weasyprint import HTML, CSS
except ImportError:
    print("Installing weasyprint...")
    os.system("pip install weasyprint")
    from weasyprint import HTML, CSS

def generate_certificate_pdf():
    # Get the directory of this script
    script_dir = Path(__file__).parent
    
    # HTML file path
    html_file = script_dir / "detective-certificate.html"
    
    # Output PDF path
    pdf_file = script_dir / "detective-certificate.pdf"
    
    if not html_file.exists():
        print(f"Error: {html_file} not found!")
        return False
    
    try:
        # Convert HTML to PDF
        HTML(filename=str(html_file)).write_pdf(str(pdf_file))
        print(f"Certificate PDF generated successfully: {pdf_file}")
        return True
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return False

if __name__ == "__main__":
    success = generate_certificate_pdf()
    sys.exit(0 if success else 1)