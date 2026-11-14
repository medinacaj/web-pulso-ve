const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const before=process.argv.includes('--before');
 const root=path.resolve(process.env.CARD_OUTPUT_DIR||'pages-global-demo'),prefix='/web-pulso-ve';
 const folder=path.resolve('docs/evidencias/tarjetas-2026-11-14');fs.mkdirSync(folder,{recursive:true});
 const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith(prefix+'/')){res.writeHead(404).end();return;}let file=path.resolve(root,'.'+decodeURIComponent(pathname.slice(prefix.length)));if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const {chromium}=require('playwright-core');const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1365,height:1000}});await page.goto(`http://127.0.0.1:${server.address().port}${prefix}/`);
  const group=page.locator('#nube');await group.scrollIntoViewIfNeeded();await group.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await group.screenshot({path:path.join(folder,`${before?'antes':'despues'}-nube.png`)});
  if(before){const heights=await group.locator('.card').evaluateAll(cards=>cards.map(card=>({slug:card.dataset.slug,height:card.getBoundingClientRect().height})));fs.writeFileSync(path.join(folder,'mediciones-antes.json'),JSON.stringify(heights,null,2));console.log(JSON.stringify(heights));return;}
  assert.equal(await group.locator('.card-identity').count(),6,'Falta la nueva composición de identidad horizontal');
  const results=[];
  for(const width of [1365,768,390,320]){
   await page.setViewportSize({width,height:1000});await group.scrollIntoViewIfNeeded();
   const boxes=await group.locator('.card').evaluateAll(cards=>cards.map(card=>{const rect=selector=>{const r=card.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};return {slug:card.dataset.slug,cardHeight:card.getBoundingClientRect().height,logo:rect('.logo-area'),image:rect('img.logo'),name:rect('.name'),category:rect('.category'),header:rect('.card-header'),identity:rect('.card-identity'),chart:rect('.demo-chart'),fit:getComputedStyle(card.querySelector('img.logo')).objectFit}}));
   for(const b of boxes){
    assert.equal(Math.round(b.logo.width),56,`Marco uniforme ${width}: ${b.slug}`);assert.equal(Math.round(b.logo.height),56);
    assert.equal(Math.round(b.image.width),40);assert.equal(Math.round(b.image.height),40);assert.equal(b.fit,'contain');
    assert.ok(b.category.y-b.name.bottom>=0&&b.category.y-b.name.bottom<=6,`Espacio nombre/categoría ${width}: ${JSON.stringify(b)}`);
    assert.ok(b.header.x>=b.logo.right+10,`Logo junto al encabezado ${width}: ${b.slug}`);
    assert.ok(b.chart.y-b.identity.bottom>=0&&b.chart.y-b.identity.bottom<=18,`Espacio gráfica ${width}: ${b.slug}`);
    assert.ok(b.cardHeight<=235,`Tarjeta compacta ${width}: ${b.slug} ${b.cardHeight}`);
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Desbordamiento ${width}`);
   if(width===390)await group.screenshot({path:path.join(folder,'despues-movil.png')});
   results.push({width,cardHeight:boxes[0].cardHeight,logoBox:56,imageBox:40,maxNameCategoryGap:Math.max(...boxes.map(b=>b.category.y-b.name.bottom))});
  }
  await page.setViewportSize({width:1365,height:1000});await page.getByRole('button',{name:'Cambiar a modo oscuro'}).click();await group.screenshot({path:path.join(folder,'despues-oscuro.png')});
  fs.writeFileSync(path.join(folder,'mediciones.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
