"""Validate and package current staged files without overwriting their sources."""
from pathlib import Path
import runpy, sys
ROOT = Path(__file__).resolve().parents[2] / '交付/PRD-V1.2'
sys.path.insert(0, str(Path(__file__).resolve().parent / '.pdf-runtime'))
sys.argv = [str(ROOT / 'scripts/check_prd.py'), str(ROOT)]
runpy.run_path(sys.argv[0], run_name='__main__')
runpy.run_path(str(ROOT / 'scripts/package_prd.py'), run_name='__main__')
