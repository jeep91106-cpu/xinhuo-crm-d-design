"""PDF rendering uses files only. Browser screenshot QA is performed separately."""
from pathlib import Path
from render_pdf import render
render(Path(__file__).resolve().parent.parent,'薪火CRM-完整PRD-V1.0')
