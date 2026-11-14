// Focused rendering check using compiled production CSS and the actual Home search markup.
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const css=fs.readFileSync('.runtime/next-ui.css','utf8');
 const source=fs.readFileSync('src/app/page.tsx','utf8');
 const form=source.match(/<form action="\/servicios"[\s\S]*?<\/form>/)[0].replaceAll('className=','class=').replaceAll('htmlFor=','for=');
 const {chromium}=require('playwright-core');
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent(`<html><head><style>${css}</style></head><body><section class="home-hero"><div class="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div>${form}</div><div class="home-summary min-w-0"><dl class="grid grid-cols-2 gap-4 bg-surface"><dt>Reportes</dt><dd>0</dd></dl><div><span class="text-ink-muted">Sin datos suficientes</span><p class="text-ink-muted">Cero incidentes no confirma disponibilidad normal.</p></div></div></div></section></body></html>`);
  const input=await page.locator('#hero-search').boundingBox(),button=await page.getByRole('button',{name:'Buscar',exact:true}).boundingBox(),label=await page.locator('label').boundingBox();
  assert.ok(Math.abs(input.y-button.y)<1,'Buscador y botón deben compartir fila en móvil');
  assert.ok(label.y+label.height<=input.y,'Etiqueta encima del buscador');
  const result=await page.locator('.home-summary').evaluate(el=>({background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius,color:getComputedStyle(el.querySelector('span')).color}));
  assert.equal(result.background,'rgb(255, 255, 255)');assert.equal(result.radius,'16px');assert.equal(result.color,'rgb(83, 100, 104)');
  console.log(JSON.stringify({productionCss:true,mobileSearchRow:true,lightSummary:result}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
