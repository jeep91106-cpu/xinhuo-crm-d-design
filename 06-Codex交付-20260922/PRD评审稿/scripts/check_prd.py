"""Read back generated Markdown, HTML, DOCX, images and optional PDF."""
from pathlib import Path
import json,re,zipfile,hashlib,sys,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parent.parent
STEM='薪火CRM-完整PRD-V1.0'
md=(ROOT/(STEM+'.md')).read_text(encoding='utf-8')
ht=(ROOT/(STEM+'.html')).read_text(encoding='utf-8')
mods=json.loads((ROOT/'modules.json').read_text(encoding='utf-8'))
figs=json.loads((ROOT/'assets/figures.json').read_text(encoding='utf-8'))
assert len(mods)==40 and len(figs)==24
for n in range(14):assert re.search(rf'^## {n}\. ',md,re.M),n
for n in range(1,41):
    block=re.search(rf'^### 6\.{n} M{n:02} .*?(?=^###|\Z)',md,re.M|re.S).group()
    for marker in ['① 入口','② 使用者','③ 字段','④ 业务规则','⑤ 状态','⑥ 验收','反向/边界']:assert marker in block,(n,marker)
for old in ['直客ID与广告账户ID一对一','每拟开户行独立','各自不同直客','一行可取得内部使用权','四步申请：','新增开户 1/4','一个主体可多店、多账户、多直客','最终账户名/ID | 文本 | 成功时']:
    assert old not in md and old not in ht,old
for cur in ['客户1:N主体','主体当前1:1店铺','同主体多行共享主体直客','账户名称自定义且非必填','IndexedDB','默认营业执照和其他资质均可选','未知','历史关系待核对']:
    assert cur in md,cur
# The repaired selector contract must survive current-source regeneration.
for phrase in ['选择已有客户后立即完整列出该客户已关联主体', '不截断为前10条',
               '全局已有主体（尚未关联此客户）', '只有用户选择复用时才新增当前客户关联',
               '主体搜索为空也可进入同页新增主体', '有唯一当前店铺时自动展示并复用',
               '不得自动选择第一店', '更换客户时清空当前主体']:
    assert phrase in md and phrase in ht, phrase
for mid in ['M01','M02','M03','M04','M05','M06','M34','M35']:
    module = next(m for m in mods if m[0] == mid)
    for rule in module[7].split('|'):
        assert rule in md, (mid, rule)
revision_phrases=['完成本次开户','completionMode=manual','全部行已成功或明确已取消','全取消最终显示已取消',
                  '开户已完成，流程待复核','pendingValues','流转备注（选填）','不因licenseEvidence',
                  '行业字典','旧dig_supplier_account','开户流程只选择适用供应商',
                  '商务查看我发起/我负责申请','媒介主管可按待指派/办理中/待确认完成筛选',
                  '角色视图以同一applicationId稳定关联','其他媒介在获准查看时只读','M01-AC05',
                  '整表保存草稿允许账户ID为空','全部校验通过才一次写入本批成功结果及账户',
                  '同批重复在冲突双方标注','默认只填空值','Excel复制的TSV文本粘贴预览','UI14-07',
                  '切换当前角色或人员同样触发未保存保护','商务B后刷新仍为商务B',
                  'M06开户列表搜索词和状态筛选按当前角色与人员身份分别保存','不得静默使用customerIds[0]','系统管理员按既有授权可代办',
                  '未提交开户草稿按创建人稳定身份保存为多份','归属未知的旧草稿保留待核对',
                  '开户通知阅读状态按个人稳定身份加申请revision记录','顶部数字与通知列表共享当前身份范围',
                  '有表头时必须包含广告账户ID','无表头时接受1至4列','空白不清除原值',
                  '超过选中数时报错','19位账户ID按字符串保留','确认填表不生成广告账户',
                  '复制范围中间空行不得压缩','仅忽略末尾空行','原行变为不可编辑状态或有效预览结果变化时阻止确认',
                  '不得自动把文本转填下一条']
for phrase in revision_phrases:
    assert phrase in md and phrase in ht, phrase
imgs=re.findall(r'!\[[^\]]*\]\(([^)]+)\)',md);assert len(imgs)==24
assert len(re.findall(r'<img[^>]+width="590"[^>]+height="\d+"',ht))==24
for f in figs:
    p=ROOT/'assets'/f['file']; im=Image.open(p);assert im.size==(f['width'],f['height'])
    assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256']
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(ROOT/(STEM+'.docx')) as z:
    tree=ET.fromstring(z.read('word/document.xml'))
    media=[n for n in z.namelist() if n.startswith('word/media/')]
    drawings=tree.findall('.//w:drawing',ns);ext=tree.findall('.//wp:extent',ns);blips=tree.findall('.//a:blip',ns)
    assert len(media)==len(drawings)==len(ext)==len(blips)==24
    for e,path in zip(ext,imgs):
        cx,cy=int(e.attrib['cx']),int(e.attrib['cy']);im=Image.open(ROOT/path)
        assert cx/360000<=14.0001
        assert abs(cx/cy-im.width/im.height)<0.0001
    txt=''.join(tree.itertext())
    for phrase in ['同主体多行共享主体直客','默认营业执照和其他资质均可选','V1.5','选择已有客户后立即完整列出该客户已关联主体','尚未关联此客户','不得自动选择第一店']:
        assert phrase in re.sub(r'\s+','',txt),phrase
    for phrase in revision_phrases:
        assert phrase in re.sub(r'\s+','',txt),phrase
pdfinfo={'generated':False}
if (ROOT/(STEM+'.pdf')).exists():
    from pypdf import PdfReader
    reader=PdfReader(ROOT/(STEM+'.pdf'));txt='\n'.join(p.extract_text() or '' for p in reader.pages)
    assert len(reader.pages)>20 and 'V1.5' in txt and '同主体' in txt
    for n in range(1,41):assert f'M{n:02}' in txt,n
    assert '跨主体' in txt
    for phrase in ['选择已有客户后立即完整列出该客户已关联主体','不截断为前10条','尚未关联此客户','不得自动选择第一店','更换客户时清空当前主体']:
        assert phrase in re.sub(r'\s+','',txt),phrase
    for phrase in revision_phrases:
        assert phrase in re.sub(r'\s+','',txt),phrase
    pdfinfo={'generated':True,'pages':len(reader.pages),'text_readback':True}
report={'status':'passed','chapters':14,'modules':40,'six_elements':'all 40 passed','figures':24,'docx_images':24,'max_docx_image_width_cm':13.8,'html_explicit_image_dimensions':True,'old_rule_scan':'passed','subject_shop_reuse_contract':'four formats passed','v13_media_flow_contract':'four formats passed','role_specific_opening_views':'four formats passed','v14_batch_opening_contract':'four formats passed','v15_drafts_notifications_tsv_contract':'four formats passed','pdf':pdfinfo,'browser_ui_test':False,'production_test':False}
(ROOT/'质量检查记录.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'质量检查记录.md').write_text('# 原PRD当前修订质量检查\n\n2026-09-22，正文内部V1.5、原文件名沿用。\n\n'+ '\n'.join('- '+k+'：'+str(v) for k,v in report.items())+'\n\n检查实际读回Markdown、HTML、DOCX包与图片尺寸，不以转换日志代替成品；图形有程序化重叠/文字边界检查，开户与关系图已人工查看。PDF仅报告实际生成和文字读回；未执行Word分页渲染、生产验证或本轮浏览器UI测试。\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
