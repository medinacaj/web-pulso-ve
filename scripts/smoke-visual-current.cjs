const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
async function main() {
  const baseline = process.argv.includes('--baseline');
  const root = path.resolve('pages-global-demo');
  const prefix = '/web-pulso-ve';
  const folder = `.runtime/current-${baseline ? 'before' : 'after'}`;
  fs.mkdirSync(folder, { recursive: true });
  const missing = [], writes = [], remote = [], errors = [];
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (!pathname.startsWith(prefix + '/')) { res.writeHead(404).end(); return; }
    let file = path.resolve(root, '.' + decodeURIComponent(pathname.slice(prefix.length)));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { missing.push(pathname); res.writeHead(404).end(); return; }
    const types = { '.html':'text/html', '.svg':'image/svg+xml', '.png':'image/png' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width:1365, height:1000 } });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const base = origin + prefix;
    page.on('request', req => { if (!['GET','HEAD'].includes(req.method())) writes.push(req.url()); if(!req.url().startsWith(origin)) remote.push(req.url()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/');
    assert.equal(await page.locator('main .card[data-slug]').count(),60);
    await page.screenshot({ path:`${folder}/inicio-claro.png` });
    await page.getByRole('button',{name:'Cambiar a modo oscuro'}).click();
    await page.screenshot({ path:`${folder}/inicio-oscuro.png` });
    await page.goto(base + '/servicios/');
    assert.equal(await page.locator('#directory-cards .card').count(),579);
    await page.screenshot({ path:`${folder}/directorio-oscuro.png` });
    await page.getByRole('button',{name:'Cambiar a modo claro'}).click();
    await page.goto(base + '/');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:`${folder}/movil-claro.png`});
    if(baseline){console.log('Baseline actual: 579 servicios, 60 destacados.');return;}
    const menu=page.locator('#mobile-menu');
    assert.equal(await menu.count(),1,'Falta el menú móvil');
    await page.getByRole('button',{name:'Abrir menú'}).click();
    assert.equal(await menu.evaluate(el=>el.open),true);
    await page.getByRole('navigation',{name:'Navegación móvil'}).getByRole('link',{name:'Metodología',exact:true}).focus();
    await page.keyboard.press('Tab');
    assert.equal(await menu.evaluate(el=>el.open),false,'Tab debe cerrar el desplegable al salir');
    await page.getByRole('button',{name:'Abrir menú'}).click();await page.keyboard.press('Escape');
    assert.equal(await menu.evaluate(el=>el.open),false);
    await page.getByRole('button',{name:'Abrir menú'}).click();
    await page.getByRole('navigation',{name:'Navegación móvil'}).getByRole('link',{name:'Servicios',exact:true}).click();
    await page.waitForURL(base+'/servicios/');
    await page.locator('#directory-search').fill('Cloudflare');
    assert.equal(await page.locator('#directory-cards .card[data-slug="cloudflare"]:visible').count(),1);
    const names=await page.locator('#directory-cards .card:visible').evaluateAll(nodes=>nodes.map(el=>el.dataset.name));
    assert.ok(names.length>0&&names.every(name=>name.includes('cloudflare')),'La búsqueda debe filtrar todas las coincidencias, incluido Cloudflare DNS');
    assert.deepEqual(errors,[],'Errores antes de favoritos');
    await page.locator('[data-fav="cloudflare"]').scrollIntoViewIfNeeded();
    const hit=await page.locator('[data-fav="cloudflare"]').evaluate(el=>{const r=el.getBoundingClientRect();const target=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {target:target?.outerHTML.slice(0,160),button:el.outerHTML.slice(0,180),cardHeight:el.closest('.card').getBoundingClientRect().height}});
    assert.ok(hit.target.includes('data-fav="cloudflare"'),'La estrella debe recibir el clic');
    await page.locator('[data-fav="cloudflare"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-fav="cloudflare"]')?.getAttribute('aria-pressed')==='true',{},{timeout:3000});
    await page.getByRole('link',{name:'Ver ficha de Cloudflare',exact:true}).click();
    await page.getByRole('heading',{name:'Cloudflare',exact:true}).waitFor();await page.reload();
    await page.locator('#demo-range').selectOption('7d');await page.locator('#demo-mode').selectOption('barras');
    assert.ok(await page.locator('#detail-chart rect').count()>1);
    await page.screenshot({path:`${folder}/ficha-claro.png`});
    await page.goto(base+'/servicios/');await page.locator('#directory-search').fill('Cloudflare');
    await page.locator('[data-report="cloudflare"]').click();
    await page.locator('#demo-state').selectOption('VE-D');await page.locator('#demo-consent').check();
    await page.getByRole('button',{name:'Probar formulario',exact:true}).click();
    await page.getByRole('status').filter({hasText:'No se envió ni guardó'}).waitFor();
    await page.getByRole('button',{name:'Cancelar',exact:true}).click();
    await page.locator('#directory-search').fill('sin-coincidencias-12345');
    assert.equal(await page.locator('#directory-cards .card:visible').count(),0);
    for(const width of [320,390,768,1365]){await page.setViewportSize({width,height:900});for(const route of ['','servicios/','servicios/cloudflare/','metodologia/']){
      await page.goto(base+'/'+route);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Desbordamiento ${width}px ${route}`);
    }}
    await page.setViewportSize({width:390,height:844});await page.goto(base+'/');
    const box=await page.locator('#quicksearch').boundingBox();assert.ok(box&&box.y+box.height<844);
    const contrast={};
    for(const mode of ['light','dark']){
      await page.evaluate(mode=>document.body.dataset.theme=mode,mode);
      contrast[mode]=await page.evaluate(()=>{
        const lum=rgb=>{const a=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{const n=x/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};
        return ['.hero .intro-lead','.search-label','.group .hint','.card .name','.card .category'].map(selector=>{
          const el=document.querySelector(selector);let parent=el,bg='rgba(0, 0, 0, 0)';
          while(parent&&(bg==='rgba(0, 0, 0, 0)'||bg==='transparent')){bg=getComputedStyle(parent).backgroundColor;parent=parent.parentElement;}
          const a=lum(getComputedStyle(el).color),b=lum(bg);return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
        });
      });
      assert.ok(contrast[mode].every(x=>x.ratio>=4.5),JSON.stringify(contrast[mode]));
    }
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
    assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);assert.deepEqual(remote,[]);assert.deepEqual(missing,[]);
    const result={catalogue:579,featured:60,mobileMenu:true,keyboard:true,widths:[320,390,768,1365],favorites:true,search:true,detailsAndCharts:true,noTransmissions:true,contrast,reducedMotion:true};
    fs.writeFileSync(`${folder}/result.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1});
