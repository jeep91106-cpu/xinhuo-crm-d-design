"""Rebuild from the current complete PRD and module sources; no baseline replay."""
from pathlib import Path
import json, runpy, sys
WORK = Path(__file__).resolve().parents[2]
ROOT = WORK / '交付/PRD-V1.2'
sys.path.insert(0, str(Path(__file__).resolve().parent / '.pdf-runtime'))
sys.path.insert(0, str(ROOT / 'scripts'))
mods = json.loads((ROOT / 'modules.json').read_text(encoding='utf-8'))
ui = [{'id':m[0], 'title':m[1], 'priority':m[2], 'entry':m[4], 'roles':m[5],
       'fields':[dict(zip(['label','type','required','constraint'],f.split('~'))) for f in m[6].split(';')],
       'rules':m[7].split('|'), 'states':m[8], 'positive':m[9], 'negative':m[10]} for m in mods]
(WORK / 'docs/moduleDefs-v12.json').write_text(json.dumps(ui, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')
runpy.run_path(str(ROOT / 'scripts/draw_figures.py'), run_name='__main__')
sys.argv = [str(ROOT / 'scripts/build_prd.py'), '--pdf']
runpy.run_path(sys.argv[0], run_name='__main__')
sys.argv = [str(ROOT / 'scripts/check_prd.py'), str(ROOT)]
runpy.run_path(sys.argv[0], run_name='__main__')
runpy.run_path(str(ROOT / 'scripts/package_prd.py'), run_name='__main__')
