const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function read(p){ return fs.readFileSync(p,'utf8') }
function arg(k,def){ const a=process.argv.slice(2); for(const x of a){ const [key,val]=x.split('='); if(key===`--${k}`) return val } return def }

function findLatestActions(){ const dir=path.join(process.cwd(),'docs','seo','analytics'); if(!fs.existsSync(dir)) return null; const files=fs.readdirSync(dir).filter(f=>/^weekly-actions-\d{4}-\d{2}\.md$/.test(f)); if(!files.length) return null; files.sort(); return path.join(dir, files.pop()) }

function parseCommands(file){
  const lines=read(file).split(/\r?\n/)
  let currentCat=''
  const out=[]
  for(const raw of lines){
    const l=raw.trim()
    if(!l) continue
    if(l.startsWith('## ')){ currentCat=l.replace(/^##\s+/,'').trim(); continue }
    if(l.startsWith('npm run seo:apply:suggest')) out.push({ cmd:l, cat: currentCat || 'otros' })
  }
  return out
}

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}) }

function sleep(ms){ Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) }

function run(){
  const limit=parseInt(arg('limit','5'),10)
  const dry=arg('dry','false')==='true'
  const onlyCategory=arg('onlyCategory','')
  const excludeCategory=arg('excludeCategory','')
  const pauseMs=parseInt(arg('pauseMs','500'),10)
  const retries=parseInt(arg('retries','1'),10)
  const maxDaily=parseInt(arg('maxDaily','0'),10)
  const counterPath=path.join(process.cwd(),'docs','seo','analytics','logs','daily-run-counter.json')
  let dailyCount=0
  if(maxDaily>0 && fs.existsSync(counterPath)){
    try{
      const j=JSON.parse(read(counterPath))
      const today=new Date().toISOString().slice(0,10)
      if(j && j.date===today) dailyCount=j.count||0
    }catch(e){}
  }
  const actionsFile=findLatestActions()
  if(!actionsFile){ console.log('No hay archivo weekly-actions para ejecutar'); process.exit(1) }
  let commands=parseCommands(actionsFile)
  if(onlyCategory) commands=commands.filter(c=>c.cat===onlyCategory)
  if(excludeCategory) commands=commands.filter(c=>c.cat!==excludeCategory)
  const allowed=maxDaily>0 ? Math.max(0, maxDaily - dailyCount) : limit
  commands=commands.slice(0, Math.min(limit, allowed))
  const now=new Date(); const y=now.getFullYear(); const m=String(now.getMonth()+1).padStart(2,'0'); const d=String(now.getDate()).padStart(2,'0'); const weekFile=path.basename(actionsFile).replace('weekly-actions-','').replace('.md','')
  const logsDir=path.join(process.cwd(),'docs','seo','analytics','logs'); ensureDir(logsDir)
  const logPath=path.join(logsDir, `weekly-actions-run-${y}-${m}-${weekFile}.log`)
  if(dry){ const plan=[`Archivo: ${actionsFile}`, `Comandos: ${commands.length}`, `Filtro only=${onlyCategory} exclude=${excludeCategory}`].concat(commands.map(c=>`${c.cat}: ${c.cmd}`)).join('\n'); fs.writeFileSync(logPath+'.plan', plan); console.log('Generado plan:', logPath+'.plan'); process.exit(0) }
  const outputs=[]
  let processed=0
  for(const {cmd,cat} of commands){
    let attempt=0; let ok=false; let lastErr=''
    while(attempt<=retries && !ok){
      try{ const out=execSync(cmd, { encoding:'utf8', stdio:['pipe','pipe','pipe'] }); outputs.push(`OK [${cat}]: ${cmd}\n${out}`); ok=true } catch(e){ lastErr=(e.stdout||'')+(e.stderr||e.message||''); attempt++; if(attempt>retries){ outputs.push(`ERR [${cat}]: ${cmd}\n${lastErr}`) } else { sleep(pauseMs) } }
    }
    sleep(pauseMs)
    processed++
  }
  fs.writeFileSync(logPath, outputs.join('\n\n'))
  console.log('Log:', logPath)
  if(maxDaily>0){
    const today=`${y}-${m}-${d}`
    const nextCount=dailyCount+processed
    ensureDir(path.dirname(counterPath))
    fs.writeFileSync(counterPath, JSON.stringify({ date: today, count: nextCount }, null, 2))
  }
}

run()
