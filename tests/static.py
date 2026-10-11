from pathlib import Path
from html.parser import HTMLParser
import json,re,base64,hashlib,datetime
ROOT=Path(__file__).resolve().parents[1]
class Scan(HTMLParser):
 def __init__(self):super().__init__();self.nodes=[];self.stack=[]
 def handle_starttag(self,t,a):
  i=len(self.nodes);self.nodes.append({'tag':t,'attrs':dict(a),'ancestors':self.stack.copy()})
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(i)
 def handle_endtag(self,t):
  for n in range(len(self.stack)-1,-1,-1):
   if self.nodes[self.stack[n]]['tag']==t:self.stack=self.stack[:n];break
html=(ROOT/'index.html').read_text();s=Scan();s.feed(html)
ids=[n['attrs']['id'] for n in s.nodes if 'id'in n['attrs']];assert len(ids)==len(set(ids))
for n in s.nodes:
 a=n['attrs'];href=a.get('href','')
 if href.startswith('#'):assert href[1:] in ids,href
 for k in ['aria-controls','aria-labelledby']:
  if k in a:
   for v in a[k].split():assert v in ids
 if n['tag']=='img':
  assert a.get('alt');assert a['src'].startswith('data:image/')
  raw=base64.b64decode(a['src'].split(',')[1],validate=True)
  assert raw.startswith(b'\x89PNG\r\n\x1a\n')
original=(ROOT/'backup/source-original.html').read_text()
oldIds=re.findall(r'\bid="([^\"]+)"',re.sub(r'<script>.*?</script>','',original,flags=re.S))
assert set(oldIds)<=set(ids)
oldData=json.loads(re.search(r'^const SCHOOL_CONTENT=(.*);$',original,re.M)[1]);data=json.loads((ROOT/'school-calendar.json').read_text())
assert oldData==data and len(data['events'])==183
assert re.search('<script>(.*?)</script>',html,re.S)[1]==(ROOT/'script.js').read_text()
assert re.search('<style>(.*?)</style>',html,re.S)[1]==(ROOT/'styles.css').read_text()
assert 'Apex' not in html
assert not re.search(r'(?:src|srcset)=[\"\']https?://|<link[^>]+href=[\"\']https?://|@import|\bfetch\s*\(|XMLHttpRequest|url\([\"\']?https?://',html)
for e in data['events']:assert datetime.date.fromisoformat(e['start'])<=datetime.date.fromisoformat(e['end'])
# Validate embedded source PDF too.
pdf=re.search(r'data:application/pdf;base64,([^\"]+)',html)
assert pdf and base64.b64decode(pdf[1]).startswith(b'%PDF')
(ROOT/'tests/dom-nodes.json').write_text(json.dumps(s.nodes))
(ROOT/'tests/data-integrity.json').write_text(json.dumps({'records':183,'allRecordsUnchanged':True,'allOriginalIdsPreserved':True,'sourceSHA256':hashlib.sha256(original.encode()).hexdigest(),'externalRuntimeDependencies':0,'htmlIds':len(ids)},indent=2))
print('PASS: data preservation, HTML IDs, anchors, ARIA targets, embedded assets/PDF, source synchronization, zero external runtime dependencies.')
