"""Rebuild the original current PRD entry from its updated Markdown source.

The original V1.0 filename is intentionally retained. Current content is V1.5.
This builder never regenerates requirements from an older baseline.
"""
from pathlib import Path
import runpy,sys
ROOT=Path(__file__).resolve().parent.parent
STEM='薪火CRM-完整PRD-V1.0'
sys.path.insert(0,str(Path(__file__).resolve().parent))
md=(ROOT/(STEM+'.md')).read_text(encoding='utf-8')
assert 'V1.5' in md and '同主体多行共享主体直客' in md
runpy.run_path(str(Path(__file__).with_name('render_prd.py')),init_globals={'ROOT':ROOT,'STEM':STEM,'md':md})
if '--pdf' in sys.argv:
    from render_pdf import render
    render(ROOT,STEM)
print('Current Markdown rebuilt to HTML/DOCX; no old business source replayed')
