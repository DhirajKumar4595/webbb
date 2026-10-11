"""Optional maintainer helper. Opening index.html requires no build or Python."""
from pathlib import Path
import re,json,datetime
ROOT=Path(__file__).resolve().parent
calendar=json.loads((ROOT/'school-calendar.json').read_text())
ids=set()
for e in calendar['events']:
 assert e['id'] not in ids,'Duplicate record ID'
 ids.add(e['id'])
 assert datetime.date.fromisoformat(e['start'])<=datetime.date.fromisoformat(e['end'])
info=json.loads((ROOT/'school-info.json').read_text())
s=(ROOT/'script.js').read_text()
for name,data in [('SCHOOL_CONTENT',calendar),('SCHOOL_INFO',info)]:
 s,n=re.subn(r'^const '+name+r'=.*;$',lambda m:'const '+name+'='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',s,count=1,flags=re.M)
 assert n==1,'Missing data integration point: '+name
start=s.index('/* Shyamalian:');end=s.index('const WELCOME=',start)
s=s[:start]+(ROOT/'engine.js').read_text()+'\n'+s[end:]
start=s.index('// Chat presentation.');end=s.index('let welcomeDismissed=false;',start)
s=s[:start]+(ROOT/'chat-ui.js').read_text()+'\n'+s[end:]
s=s.replace('Generated from school-calendar.json by sync-source.py','Generated from school-calendar.json by build.py')
(ROOT/'script.js').write_text(s)
h=(ROOT/'template.html').read_text().replace('/* EMBED_STYLE */',(ROOT/'styles.css').read_text()).replace('/* EMBED_SCRIPT */',s)
(ROOT/'index.html').write_text(h)
print('Built standalone index.html:',len(calendar['events']),'calendar records; no runtime dependencies.')
