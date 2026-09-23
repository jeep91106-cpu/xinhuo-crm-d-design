from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math,json,heapq
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'assets'  # caller supplies output root; no writes on import
FONT='C:/Windows/Fonts/simhei.ttf'
F=lambda s:ImageFont.truetype(FONT,s)
BLUE='#1a5fb4';INK='#16304a';MUTED='#596b7a'
manifest=[];checks=[]
def wrap(s,n=13):
 return '\n'.join('\n'.join(t[i:i+n] for i in range(0,len(t),n)) for t in s.split('\n'))
def overlap(a,b):return a[0]<b[2] and a[2]>b[0] and a[1]<b[3] and a[3]>b[1]
def line_hit(a,b,r):
 # routes orthogonal
 if a[0]==b[0]:return r[0]<a[0]<r[2] and max(min(a[1],b[1]),r[1])<min(max(a[1],b[1]),r[3])
 if a[1]==b[1]:return r[1]<a[1]<r[3] and max(min(a[0],b[0]),r[0])<min(max(a[0],b[0]),r[2])
 return False
def route(start,end,rects,w,h):
 step=20
 def snap(p):return (round(p[0]/step)*step,round(p[1]/step)*step)
 start,end=snap(start),snap(end)
 def blocked(p):return any(r[0]-8<p[0]<r[2]+8 and r[1]-8<p[1]<r[3]+8 for r in rects)
 Q=[(0,start)];cost={start:0};prev={}
 while Q:
  _,p=heapq.heappop(Q)
  if p==end:break
  for dx,dy in [(step,0),(-step,0),(0,step),(0,-step)]:
   n=(p[0]+dx,p[1]+dy)
   if not(20<=n[0]<=w-20 and 100<=n[1]<=h-40) or (n!=end and blocked(n)):continue
   c=cost[p]+1
   if c<cost.get(n,10**9):cost[n]=c;prev[n]=p;heapq.heappush(Q,(c+(abs(n[0]-end[0])+abs(n[1]-end[1]))/step,n))
 else:raise RuntimeError(('no route',start,end))
 pts=[end]
 while pts[-1]!=start:pts.append(prev[pts[-1]])
 pts=pts[::-1];simple=[pts[0]]
 for i in range(1,len(pts)-1):
  if (pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])!=(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]):simple.append(pts[i])
 simple.append(pts[-1]);return simple
def graph(num,title,nodes,edges,h=1320,lanes=None,subtitle='产品设计示意 · 状态与约束以正文为准',manual_paths=None):
 w=1680; footer=160+max(0,len(edges)-9)*25
 im=Image.new('RGB',(w,h+footer),'#ffffff');d=ImageDraw.Draw(im)
 d.text((45,25),f'图 {num}  {title}',font=F(42),fill=INK)
 d.text((45,80),subtitle,font=F(27),fill=MUTED)
 if lanes:
  for i,label in enumerate(lanes):
   x=40+i*400;d.rounded_rectangle((x,125,x+380,h-30),radius=14,fill=['#f2f6fc','#f5f8fb'][i%2])
   d.text((x+20,135),label,font=F(30),fill=BLUE)
 boxes={k:tuple(v[:4]) for k,v in nodes.items()};labels=[]
 for k,v in nodes.items():
  b=boxes[k];txt=wrap(v[4],int((b[2]-b[0]-28)/33));bbox=d.multiline_textbbox((0,0),txt,font=F(33),spacing=8)
  assert bbox[2]<=b[2]-b[0]-20 and bbox[3]<=b[3]-b[1]-18,('text overflow',num,k,txt,bbox,b)
  color=v[5] if len(v)>5 else '#eaf2fc'
  d.rounded_rectangle(b,radius=16,fill=color,outline=BLUE,width=3)
  if len(k)==1 and k.isascii():d.text((b[0]+10,b[1]+8),k,font=F(18),fill=BLUE)
  d.multiline_text((b[0]+(b[2]-b[0]-bbox[2])/2,b[1]+(b[3]-b[1]-bbox[3])/2-2),txt,font=F(33),spacing=8,fill=INK,align='center')
 rectlist=list(boxes.values())
 for i,a in enumerate(rectlist):
  for b in rectlist[i+1:]:assert not overlap(a,b),('nodes overlap',num,a,b)
 edgecheck=[]
 def anchors(b):
  x1,y1,x2,y2=b;xm=(x1+x2)//2;ym=(y1+y2)//2
  return {'R':((x2,ym),(x2+30,ym)),'L':((x1,ym),(x1-30,ym)),'T':((xm,y1),(xm,y1-30)),'B':((xm,y2),(xm,y2+30))}
 for idx,(u,v,label) in enumerate(edges,1):
  a,b=boxes[u],boxes[v];aa,bb=anchors(a),anchors(b)
  dx=(b[0]+b[2]-a[0]-a[2]);dy=(b[1]+b[3]-a[1]-a[3])
  if abs(dx)>=abs(dy):sa,sb=('R','L') if dx>=0 else ('L','R')
  else:sa,sb=('B','T') if dy>=0 else ('T','B')
  anchor1,out1=aa[sa];anchor2,out2=bb[sb]
  path=route(out1,out2,rectlist,w,h)
  # connect edge anchors orthogonally to grid path
  p0=path[0];pn=path[-1]
  ext1=[anchor1,(p0[0],anchor1[1]),p0] if sa in ['L','R'] else [anchor1,(anchor1[0],p0[1]),p0]
  ext2=[pn,(pn[0],anchor2[1]),anchor2] if sb in ['T','B'] else [pn,(anchor2[0],pn[1]),anchor2]
  pts=ext1+path[1:-1]+ext2;pts=[p for i,p in enumerate(pts) if i==0 or p!=pts[i-1]]
  if manual_paths and (u,v) in manual_paths:pts=manual_paths[(u,v)]
  for x,y in zip(pts,pts[1:]):
   for key,box in boxes.items():
    if key not in [u,v]:assert not line_hit(x,y,box),('arrow through box',num,u,v,key)
  edgecolor=['#2365a1','#97752d','#8970a7','#218364','#a04f4f','#4c7e86'][idx%6] if manual_paths else '#557a9a'
  if manual_paths:d.line(pts,fill='white',width=9)
  d.line(pts,fill=edgecolor,width=3)
  p,q=pts[-2:];angle=math.atan2(q[1]-p[1],q[0]-p[0])
  tri=[q,(q[0]-18*math.cos(angle-.45),q[1]-18*math.sin(angle-.45)),(q[0]-18*math.cos(angle+.45),q[1]-18*math.sin(angle+.45))]
  d.polygon(tri,fill=edgecolor)
  # edge label on long segment, else side legend
  labeltxt=f'{idx} {label}';tb=d.textbbox((0,0),labeltxt,font=F(23));tw=tb[2]+12;th=31;placed=False
  for x,y in sorted(zip(pts,pts[1:]),key=lambda z:abs(z[1][0]-z[0][0])+abs(z[1][1]-z[0][1]),reverse=True):
   mid=((x[0]+y[0])/2,(x[1]+y[1])/2)
   box=(mid[0]-tw/2,mid[1]-th-5,mid[0]+tw/2,mid[1]-5)
   if box[1]>=120 and all(not overlap(box,z) for z in rectlist+labels):
    d.rectangle(box,fill='white');d.text((box[0]+6,box[1]),labeltxt,font=F(23),fill=BLUE);labels.append(box);placed=True;break
  edgecheck.append({'from':u,'to':v,'meaning':label,'path':pts,'anchorSides':[sa,sb],'onEdgeLabel':placed})
 # a compact complete legend makes direction/semantics explicit, including labels lacking space
 for i,(u,v,label) in enumerate(edges):
  x=45+(i%3)*540;y=h+10+(i//3)*32
  d.text((x,y),f'{i+1}. {u}→{v}: {label}'[:30],font=F(23),fill=MUTED)
 p=OUT/f'fig-{num}.png';im.save(p)
 manifest.append({'id':num,'title':title,'file':p.name,'kind':'diagram','width':w,'height':im.height})
 checks.append({'id':num,'nodes':len(nodes),'edges':edgecheck,'nodeOverlap':False,'arrowThroughUnrelatedNode':False,'textOverflow':False})
def N(x,y,t,w=320,h=120,color=None):return [x,y,x+w,y+h,t]+([color] if color else [])
def wire(num,title,blocks,foot):
 im=Image.new('RGB',(1680,1120),'#f1f5fa');d=ImageDraw.Draw(im)
 d.rectangle((0,0,240,1120),fill='#172e47');d.text((25,28),'薪火 CRM',font=F(38),fill='white')
 for i,t in enumerate(['工作台','公共资料','广告账户','开户办理','充值续费','资金结算','经营分析','人事行政','配置中心']):
  d.text((28,130+i*83),t,font=F(29),fill='#d6e5f3')
 d.rectangle((240,0,1680,75),fill='white');d.text((280,20),'全局搜索：客户 / 主体 / 店铺 / 账户     通知     当前角色',font=F(28),fill=MUTED)
 d.text((280,105),f'图 {num}  {title}',font=F(38),fill=INK)
 rects=[]
 for x,y,w,h,head,lines in blocks:
  b=(x,y,x+w,y+h)
  for other in rects:assert not overlap(b,other),('wire overlap',num)
  rects.append(b);d.rounded_rectangle(b,radius=13,fill='white',outline='#c6d5e5',width=2)
  headsize=32
  while F(headsize).getlength(head)>w-40 and headsize>22:headsize-=1
  assert F(headsize).getlength(head)<=w-40,('wire heading overflow',num,head)
  d.text((x+20,y+17),head,font=F(headsize),fill=BLUE)
  yy=y+70
  for line in lines:
   rows=[];part=''
   for char in line:
    if F(27).getlength(part+char)>w-40:rows.append(part);part=char
    else:part+=char
   if part:rows.append(part)
   t='\n'.join(rows)
   bbox=d.multiline_textbbox((x+20,yy),t,font=F(27),spacing=7)
   assert bbox[3]<y+h-12,('wire text overflow',num,head,line)
   d.multiline_text((x+20,yy),t,font=F(27),spacing=7,fill=INK);yy=bbox[3]+24
 d.text((280,1045),wrap(foot,46),font=F(25),fill=MUTED)
 p=OUT/f'fig-{num}.png';im.save(p);manifest.append({'id':num,'title':title,'file':p.name,'kind':'page_schematic','width':1680,'height':1120})
