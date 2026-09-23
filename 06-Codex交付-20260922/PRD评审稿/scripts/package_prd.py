"""Package the 54 current PRD deliverables; never discover files recursively."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parent.parent
# The original directory can also contain obsolete QA images, browser profiles,
# caches and historical backups. Only these current deliverables belong here.
CURRENT_PATHS = (
    '.gitattributes',
    '.gitignore',
    'build-info.json',
    'modules.json',
    'pg-prd.config.yaml',
    'PRD修订补充-V1.2-20260922.md',
    'README.md',
    'sources.json',
    '方法论检查与执行说明.md',
    '最新修订阅读指引-20260922.md',
    '未变业务核对.json',
    '薪火CRM-完整PRD-V1.0.docx',
    '薪火CRM-完整PRD-V1.0.html',
    '薪火CRM-完整PRD-V1.0.md',
    '薪火CRM-完整PRD-V1.0.pdf',
    '质量检查记录.json',
    '质量检查记录.md',
    'assets/current-figures.json',
    'assets/diagram-checks-v12.json',
    'assets/fig-12-1.png',
    'assets/fig-4-1.png',
    'assets/fig-4-10.png',
    'assets/fig-4-2.png',
    'assets/fig-4-3.png',
    'assets/fig-4-4.png',
    'assets/fig-4-5.png',
    'assets/fig-4-6.png',
    'assets/fig-4-7.png',
    'assets/fig-4-8.png',
    'assets/fig-4-9.png',
    'assets/fig-5-1.png',
    'assets/fig-5-10.png',
    'assets/fig-5-2.png',
    'assets/fig-5-3.png',
    'assets/fig-5-4.png',
    'assets/fig-5-5.png',
    'assets/fig-5-6.png',
    'assets/fig-5-7.png',
    'assets/fig-5-8.png',
    'assets/fig-5-9.png',
    'assets/fig-6-1.png',
    'assets/fig-7-1.png',
    'assets/fig-7-2.png',
    'assets/figures.json',
    'scripts/build_prd.py',
    'scripts/check_prd.py',
    'scripts/diagram_helpers.py',
    'scripts/draw_current_figures.py',
    'scripts/draw_figures.py',
    'scripts/package_prd.py',
    'scripts/render_pdf.py',
    'scripts/render_prd.py',
    'scripts/render_review.py',
    'scripts/requirements.txt',
)


def package(root=ROOT):
    root = Path(root).resolve()
    if len(CURRENT_PATHS) != 54 or len(set(CURRENT_PATHS)) != 54:
        raise ValueError('Current delivery allowlist must contain 54 unique paths')
    files = []
    for relative in CURRENT_PATHS:
        parts = PurePosixPath(relative).parts
        if PurePosixPath(relative).is_absolute() or '..' in parts:
            raise ValueError(f'Invalid delivery path: {relative}')
        if any(any(word in part.lower() for word in ('qa', 'cache', 'profile')) for part in parts):
            raise ValueError(f'QA/cache/profile must not be packaged: {relative}')
        path = root / relative
        if not path.resolve().is_relative_to(root) or not path.is_file():
            raise ValueError(f'Missing or out-of-root delivery file: {relative}')
        files.append(path)

    # Hash actual bytes after copying/checking out: LF/CRLF conversion must not
    # leave R17 pointing at an obsolete hash. Other source records are untouched.
    source_path = root / 'sources.json'
    sources = json.loads(source_path.read_text(encoding='utf-8'))
    r17 = [source for source in sources if source.get('id') == 'R17']
    if len(r17) != 1 or r17[0].get('path') != 'PRD修订补充-V1.2-20260922.md':
        raise ValueError('Expected one local R17 revision source')
    r17[0]['sha256'] = hashlib.sha256((root / r17[0]['path']).read_bytes()).hexdigest()
    source_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')

    manifest = [
        {'path': relative, 'bytes': path.stat().st_size,
         'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        for relative, path in zip(CURRENT_PATHS, files)
    ]
    manifest_path = root / '交付清单.json'
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8', newline='\n')
    archive_path = root / '薪火CRM-PRD交付包-V1.0.zip'
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as archive:
        for relative, path in zip(CURRENT_PATHS, files):
            archive.write(path, relative)
        archive.write(manifest_path, manifest_path.name)
    # Verify the delivered archive, rather than reporting only a write result.
    with zipfile.ZipFile(archive_path) as archive:
        if set(archive.namelist()) != set(CURRENT_PATHS) | {manifest_path.name}:
            raise ValueError('Archive entries differ from the current allowlist')
        for entry in manifest:
            payload = archive.read(entry['path'])
            if len(payload) != entry['bytes'] or hashlib.sha256(payload).hexdigest() != entry['sha256']:
                raise ValueError(f"Archive hash mismatch: {entry['path']}")
        if archive.read(manifest_path.name) != manifest_path.read_bytes():
            raise ValueError('Archived manifest does not match the current manifest')
    print('Current original-entry package verified: 54 files + manifest; R17 refreshed; QA/cache/profile excluded')


if __name__ == '__main__':
    package()
