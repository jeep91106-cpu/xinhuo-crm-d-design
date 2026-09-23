"""Render the current complete PRD to PDF without browser or desktop automation."""
from pathlib import Path
import sys, re, html
HERE=Path(__file__).resolve().parent
for p in [HERE/'.pdf-runtime', HERE.parents[1]/'docs/prd-v12/.pdf-runtime']:
    if p.exists(): sys.path.insert(0,str(p))
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, LongTable, TableStyle, PageBreak
from PIL import Image as PILImage

def render(ROOT,STEM):
    pdfmetrics.registerFont(TTFont('SimHei','C:/Windows/Fonts/simhei.ttf'))
    pdfmetrics.registerFontFamily('SimHei',normal='SimHei',bold='SimHei',italic='SimHei',boldItalic='SimHei')
    styles=getSampleStyleSheet()
    for s in styles.byName.values(): s.fontName='SimHei';s.wordWrap='CJK'
    styles['BodyText'].fontSize=9;styles['BodyText'].leading=14
    styles['Heading1'].fontSize=18;styles['Heading1'].leading=23
    styles['Heading2'].fontSize=14;styles['Heading2'].leading=20
    styles['Heading3'].fontSize=11;styles['Heading3'].leading=16
    cell=ParagraphStyle('CJKCell',parent=styles['BodyText'],fontSize=7.3,leading=11,spaceAfter=0)
    def clean(s):
        s=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',s)
        s=re.sub(r'<[^>]*>','',s)
        s=html.escape(s.replace('`','').replace('−','-'))
        s=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',s)
        return s
    doc=SimpleDocTemplate(str(ROOT/(STEM+'.pdf')),pagesize=A4,rightMargin=52,leftMargin=52,topMargin=46,bottomMargin=46,title='薪火CRM 完整PRD 当前修订V1.5',author='Codex')
    flow=[];lines=(ROOT/(STEM+'.md')).read_text(encoding='utf-8').splitlines();i=0
    while i<len(lines):
        s=lines[i].strip()
        if not s or s=='[TOC]':i+=1;continue
        if s.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                vals=[x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?',x) for x in vals):rows.append([Paragraph(clean(x),cell) for x in vals])
                i+=1
            n=len(rows[0]); widths=[doc.width/n]*n
            if n==4:widths=[doc.width*x for x in [.16,.25,.25,.34]]
            t=LongTable(rows,colWidths=widths,repeatRows=1,hAlign='LEFT')
            t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.35,colors.HexColor('#CCD8E5')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EAF2FC')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
            flow.extend([t,Spacer(1,9)]);continue
        m=re.match(r'!\[[^\]]*\]\(([^)]+)\)',s)
        if m:
            p=ROOT/m.group(1);im=PILImage.open(p);w=min(doc.width,391);h=w*im.height/im.width
            if h>620:w*=620/h;h=620
            flow.extend([Image(str(p),width=w,height=h),Spacer(1,12)])
        elif s.startswith('## '):
            if flow:flow.append(PageBreak())
            flow.append(Paragraph(clean(s[3:]),styles['Heading1']))
        elif s.startswith('### '):flow.append(Paragraph(clean(s[4:]),styles['Heading2']))
        elif s.startswith('# '):flow.append(Paragraph(clean(s[2:]),styles['Title']))
        else:flow.append(Paragraph(clean(s),styles['BodyText']))
        i+=1
    def page(c,d):
        c.setFont('SimHei',8);c.setFillColor(colors.HexColor('#596B7A'))
        c.drawString(52,25,'薪火CRM · 原PRD当前修订 V1.5 · 2026-09-22')
        c.drawRightString(A4[0]-52,25,str(d.page))
    doc.build(flow,onFirstPage=page,onLaterPages=page)
    print('PDF rendered from current Markdown without browser')

if __name__=='__main__':
    root=Path(sys.argv[1]) if len(sys.argv)>1 else HERE.parent
    render(root,'薪火CRM-完整PRD-V1.0')
