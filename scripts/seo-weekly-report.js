const fs = require('fs')
const path = require('path')

function read(p) { return fs.readFileSync(p, 'utf8') }
function write(p, c) { fs.writeFileSync(p, c) }
function arg(k, def) { const a = process.argv.slice(2); for (const x of a) { const [key, val] = x.split('='); if (key === `--${k}`) return val } return def }

function parseCsvLine(line) { const out = []; let cur = ''; let inQ = false; for (let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"'){inQ=!inQ;continue} if(ch===','&&!inQ){out.push(cur.trim()); cur=''; continue } cur+=ch } out.push(cur.trim()); return out }
function parseGaCsv(p) { const src = read(p).split(/\r?\n/).filter(Boolean); const header = parseCsvLine(src[0]); const pathIdx = header.findIndex(h=>/path|page/i.test(h)); const ctrIdx = header.findIndex(h=>/ctr/i.test(h)); const rows = src.slice(1).map(parseCsvLine); const map = new Map(); rows.forEach(cols=>{ const url = cols[pathIdx]||''; const ctr = (cols[ctrIdx]||'').replace('%','').trim(); const m = url.match(/\/blog\/([^/?#]+)/); if(m) map.set(m[1], parseFloat(ctr||'0')) }); return map }

function parsePosts() { const file = path.join(process.cwd(),'lib','blog-data.ts'); const src = read(file); const blocks = src.split(/\},\s*\{/g); const posts=[]; const regex={id:/id:\s*'([^']+)'/, title:/title:\s*'([^']+)'/, publishedAt:/publishedAt:\s*'([^']+)'/}; blocks.forEach(b=>{ const id=(b.match(regex.id)||[])[1]; if(!id) return; const title=(b.match(regex.title)||[])[1]||''; const publishedAt=(b.match(regex.publishedAt)||[])[1]||''; posts.push({id,title,publishedAt}) }); return posts }

function weekOfYear(d){ const date=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dayNum=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-dayNum); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); const week=Math.ceil((((date-yearStart)/86400000)+1)/7); return `${date.getUTCFullYear()}-${String(week).padStart(2,'0')}` }

function listAppliedSummaries(){ const dir=path.join(process.cwd(),'docs','seo','analytics'); if(!fs.existsSync(dir)) return []; const files=fs.readdirSync(dir).filter(f=>/^ctr-auto-summary-\d{4}-\d{2}-\d{2}\.md$/.test(f)); const now=new Date(); const recent=files.filter(f=>{ const m=f.match(/(\d{4})-(\d{2})-(\d{2})/); if(!m) return false; const d=new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`); const diffDays=Math.floor((now-d)/86400000); return diffDays<=7 }); return recent.map(f=>path.join(dir,f)) }

function run(){ const gaCsv=path.join(process.cwd(),'docs','seo','analytics','ga-pages.csv'); if(!fs.existsSync(gaCsv)){ console.log('Falta docs/seo/analytics/ga-pages.csv'); process.exit(1) } const minAgeDays=parseInt(arg('minAgeDays','14'),10); const limit=parseInt(arg('limit','10'),10); const ctrMap=parseGaCsv(gaCsv); const posts=parsePosts(); const items=[]; const now=new Date(); posts.forEach(p=>{ const ctr=ctrMap.get(p.id); if(ctr===undefined) return; const pub=p.publishedAt? new Date(p.publishedAt) : null; const ageDays= pub? Math.floor((now-pub)/86400000) : 9999; if(ageDays<minAgeDays) return; items.push({ id:p.id, title:p.title, ctr }) }); items.sort((a,b)=>a.ctr-b.ctr); const top=items.slice(0, limit); const week=weekOfYear(now); const lines=[]; lines.push(`# Reporte semanal CTR (${week})`); lines.push(''); lines.push('## Páginas con CTR más bajo'); top.forEach(t=>{ lines.push(`- ${t.id} — CTR ${t.ctr}% — ${t.title}`) }); lines.push(''); lines.push('## Recomendaciones'); top.forEach(t=>{ lines.push(`- Aplicar sugerencia: npm run seo:apply:suggest -- --id=${t.id} --titleIndex=1 --metaIndex=1 --apply=true`) }); lines.push(''); const applied=listAppliedSummaries(); if(applied.length){ lines.push('## Cambios aplicados (últimos 7 días)'); applied.forEach(f=>{ lines.push(`- ${path.basename(f)}`) }) } const out=path.join(process.cwd(),'docs','seo','analytics',`weekly-report-${week}.md`); write(out, lines.join('\n')); console.log('Generado:', out) }

run()

