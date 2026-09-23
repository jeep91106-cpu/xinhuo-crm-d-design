"""Redraw V1.2 changed figures and preserve verified unchanged source PNGs."""
from pathlib import Path
import json,runpy,sys,hashlib
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(Path(__file__).resolve().parent))
runpy.run_path(str(Path(__file__).with_name('draw_current_figures.py')),init_globals={'OUTPUT_ROOT':ROOT})
figs=json.loads((ROOT/'assets/figures.json').read_text(encoding='utf-8'))
new={f['id']:f for f in json.loads((ROOT/'assets/current-figures.json').read_text(encoding='utf-8'))}
for f in figs:
    if f['id'] in new:f.update(new[f['id']])
    f['sha256']=hashlib.sha256((ROOT/'assets'/f['file']).read_bytes()).hexdigest()
(ROOT/'assets/figures.json').write_text(json.dumps(figs,ensure_ascii=False,indent=2),encoding='utf-8')
