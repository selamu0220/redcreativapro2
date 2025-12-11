const fs = require('fs')
const path = require('path')

function read(p){ return fs.readFileSync(p,'utf8') }
function write(p,c){ fs.writeFileSync(p,c) }
function arg(k,def){ const a=process.argv.slice(2); for(const x of a){ const [key,val]=x.split('='); if(key===`--${k}`) return val } return def }

function parseWeeklySummary(p){ const src=read(p); const blocks=src.split(/\n##\s+/).slice(1); const cats={}; blocks.forEach(b=>{ const lines=b.split('\n'); const cat=lines[0].trim(); const items=[]; for(let i=1;i<lines.length;i++){ const line=lines[i].trim(); if(!line) continue; const m=line.match(/-\s+([^\s]+)\s+—\s+CTR\s+([0-9.]+)%\s+—\s+(.*)/); if(m){ items.push({ id:m[1], ctr:parseFloat(m[2]), title:m[3] }) } } cats[cat]=items }); return cats }

function run(){ const summaryPath=path.join(process.cwd(),'docs','seo','analytics'); const files=fs.readdirSync(summaryPath).filter(f=>/^weekly-summary-\d{4}-\d{2}\.md$/.test(f)); if(!files.length){ console.log('No hay weekly-summary para generar acciones'); process.exit(1) } const latest=files.sort().pop(); const cats=parseWeeklySummary(path.join(summaryPath, latest)); const lines=[]; lines.push(`# Acciones sugeridas desde ${latest}`); Object.keys(cats).forEach(cat=>{ lines.push(`## ${cat}`); cats[cat].forEach(it=>{ lines.push(`npm run seo:apply:suggest -- --id=${it.id} --titleIndex=1 --metaIndex=1 --apply=true`) }); lines.push('') }); const out=path.join(summaryPath, latest.replace('weekly-summary','weekly-actions')); write(out, lines.join('\n')); console.log('Generado:', out) }

run()

