const fs = require('fs')
const path = require('path')

function read(p){ return fs.readFileSync(p,'utf8') }
function write(p,c){ fs.writeFileSync(p,c) }
function arg(k,def){ const a=process.argv.slice(2); for(const x of a){ const [key,val]=x.split('='); if(key===`--${k}`) return val } return def }

function parseCsvLine(line){ const out=[]; let cur=''; let inQ=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(ch==='"'){ inQ=!inQ; continue } if(ch===','&&!inQ){ out.push(cur.trim()); cur=''; continue } cur+=ch } out.push(cur.trim()); return out }
function parseGaCsv(p){ const src=read(p).split(/\r?\n/).filter(Boolean); const header=parseCsvLine(src[0]); const pathIdx=header.findIndex(h=>/path|page/i.test(h)); const ctrIdx=header.findIndex(h=>/ctr/i.test(h)); const rows=src.slice(1).map(parseCsvLine); const map=new Map(); rows.forEach(cols=>{ const url=cols[pathIdx]||''; const ctr=(cols[ctrIdx]||'').replace('%','').trim(); const m=url.match(/\/blog\/([^/?#]+)/); if(m) map.set(m[1], parseFloat(ctr||'0')) }); return map }

function parsePosts(){ const file=path.join(process.cwd(),'lib','blog-data.ts'); const src=read(file); const blocks=src.split(/\},\s*\{/g); const posts=[]; const regex={id:/id:\s*'([^']+)'/, title:/title:\s*'([^']+)'/, category:/category:\s*'([^']+)'/, publishedAt:/publishedAt:\s*'([^']+)'/}; blocks.forEach(b=>{ const id=(b.match(regex.id)||[])[1]; if(!id) return; const title=(b.match(regex.title)||[])[1]||''; const category=(b.match(regex.category)||[])[1]||''; const publishedAt=(b.match(regex.publishedAt)||[])[1]||''; posts.push({id,title,category,publishedAt}) }); return posts }

function weekOfYear(d){ const date=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dayNum=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-dayNum); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); const week=Math.ceil((((date-yearStart)/86400000)+1)/7); return `${date.getUTCFullYear()}-${String(week).padStart(2,'0')}` }

function run(){ const gaCsv=path.join(process.cwd(),'docs','seo','analytics','ga-pages.csv'); if(!fs.existsSync(gaCsv)){ console.log('Falta docs/seo/analytics/ga-pages.csv'); process.exit(1) } const minAgeDays=parseInt(arg('minAgeDays','14'),10); const onlyCategory=arg('onlyCategory',''); const excludeCategory=arg('excludeCategory',''); const ctrMap=parseGaCsv(gaCsv); const posts=parsePosts(); const now=new Date(); const items=[]; posts.forEach(p=>{ const ctr=ctrMap.get(p.id); if(ctr===undefined) return; const pub=p.publishedAt? new Date(p.publishedAt) : null; const ageDays= pub? Math.floor((now-pub)/86400000) : 9999; if(ageDays<minAgeDays) return; if(onlyCategory && p.category!==onlyCategory) return; if(excludeCategory && p.category===excludeCategory) return; items.push({ id:p.id, title:p.title, category:p.category, ctr }) }); const byCat={}; items.forEach(t=>{ const cat=t.category||'otros'; if(!byCat[cat]) byCat[cat]=[]; byCat[cat].push(t) }); const week=weekOfYear(now); const lines=[]; lines.push(`# Resumen semanal categorías (${week})`); Object.keys(byCat).forEach(cat=>{ const arr=byCat[cat].slice().sort((a,b)=>a.ctr-b.ctr).slice(0,5); lines.push(`## ${cat}`); arr.forEach(t=> lines.push(`- ${t.id} — CTR ${t.ctr}% — ${t.title}`)); lines.push('') }); const out=path.join(process.cwd(),'docs','seo','analytics',`weekly-summary-${week}.md`); write(out, lines.join('\n')); console.log('Generado:', out) }

run()

