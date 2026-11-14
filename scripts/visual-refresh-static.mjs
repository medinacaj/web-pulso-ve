/** Visual layer for the existing 579-service preview. No catalogue or data changes. */
export const visualRefreshCss = `
body,body[data-theme="light"]{--view-bg:#f3f6f7;--view-surface:#fff;--view-ink:#18313b;--view-muted:#52656d;--view-border:#d7e2e5;--view-accent:#116d70;background:var(--view-bg);color:var(--view-ink)}
body[data-theme="dark"]{--view-bg:#101c20;--view-surface:#1e3034;--view-ink:#edf6f4;--view-muted:#b1cbc4;--view-border:#3b5151;--view-accent:#9ee5d5;background:var(--view-bg);color:var(--view-ink)}
.top,body[data-theme="light"] .top,body[data-theme="dark"] .top{background:var(--view-surface);border-color:var(--view-border)}
.top .brand{color:var(--view-ink)}.top .brand span{color:var(--view-accent)}
.mobile-menu{display:none}.mobile-menu summary{display:flex;align-items:center;justify-content:center;list-style:none;width:44px;height:44px;cursor:pointer;border:1px solid var(--view-border);border-radius:11px;color:var(--view-ink)}
.mobile-menu summary::-webkit-details-marker{display:none}.mobile-menu summary:focus-visible{outline:3px solid var(--view-accent);outline-offset:2px}
.mobile-nav{position:absolute;inset:54px 0 auto;background:var(--view-surface);border-bottom:1px solid var(--view-border);box-shadow:0 10px 25px #0002;padding:12px 18px}
.mobile-nav a{display:flex;align-items:center;justify-content:space-between;min-height:46px;padding:10px 12px;border-radius:10px;font-weight:650;color:var(--view-ink)}.mobile-nav a:hover{background:var(--view-bg)}
.wrap.hero,body[data-theme="light"] .wrap.hero,body[data-theme="dark"] .wrap.hero{padding:26px;margin-top:18px;border-radius:18px;background:#173b42;color:#fff;box-shadow:0 5px 20px #18313b12}
body .hero .hero-copy h1{font-size:clamp(25px,3.1vw,36px);line-height:1.18;letter-spacing:-.025em;max-width:850px;margin-bottom:10px}
.hero .intro-lead{color:#dceef0!important;line-height:1.6!important}
.hero .hero-tools{padding-top:4px}.hero .hero-tools>.filters:first-child{gap:10px;align-items:center}
.search-label{flex-basis:100%;font-size:13px;font-weight:700;color:#e9f7f6}
.hero #quicksearch{min-width:0;flex:1;min-height:48px;max-width:650px;border:1px solid #d0e4e5;border-radius:12px;background:#fff;color:#18313b;padding:12px 15px;box-shadow:none}
.hero #quicksearch::placeholder{color:#52656d}.hero #quicksearch:focus-visible{outline-color:#9de9dc}
body .hero .hero-tools .chip{min-height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:11px;padding:9px 13px;font-size:13px;background:#224b52;border-color:#52757b;color:#effbf9}
body .hero .hero-tools button.chip[aria-pressed="true"]{background:#9ee5d5;color:#153c39;border-color:#9ee5d5;font-weight:750}
.hero .home-search-status{color:#dceef0;font-size:12px;margin:12px 0 0}
.group{padding-top:26px;padding-bottom:12px;scroll-margin-top:80px}.section-title{gap:16px;align-items:baseline}
.section-title h2{font-size:clamp(20px,2.1vw,26px);line-height:1.3;letter-spacing:-.02em}.group .hint{color:var(--view-muted);font-size:14px;line-height:1.6;margin-top:8px;margin-bottom:18px;max-width:780px}
.cards{gap:16px}.card,body[data-theme="light"] .card,body[data-theme="dark"] .card{background:var(--view-surface);color:var(--view-ink);border-radius:16px;transition:box-shadow .18s ease}
.card>a.card-link::after{border-radius:16px}.card .card-header{height:80px;min-height:80px;flex:none;padding:0;gap:4px}.card .name{font-size:15px;line-height:1.35;overflow-wrap:anywhere;color:var(--view-ink)}
.card .category,body[data-theme="light"] .card .category,body[data-theme="dark"] .card .category{color:var(--view-muted);font-size:12px;font-weight:600;line-height:1.4;white-space:normal}
.card .logo-area{border-radius:12px;margin:5px 10px 3px;width:calc(100% - 20px)}
.card .card-actions{min-height:52px;gap:9px;padding:4px 12px 9px}.card .report-quick,.card .star{width:44px;height:44px;min-width:44px;min-height:44px;border-radius:10px}
.card .signal{color:var(--view-accent)}
.directory-tools{padding:18px;background:var(--view-surface);border:1px solid var(--view-border);border-radius:16px;gap:14px}
.directory-tools .input,.directory-tools select{background:var(--view-surface);color:var(--view-ink);border:1px solid var(--view-border);min-height:46px;border-radius:11px;max-width:100%}
.directory-tools label{color:var(--view-muted)}
.service-detail{padding-top:26px}.breadcrumbs{color:var(--view-muted);line-height:1.7;overflow-wrap:anywhere}
.profile-hero,.profile-panel,body[data-theme="light"] .profile-hero,body[data-theme="dark"] .profile-hero,body[data-theme="light"] .profile-panel,body[data-theme="dark"] .profile-panel{background:var(--view-surface);color:var(--view-ink);border-color:var(--view-border);border-radius:18px}
.profile-hero h1,.profile-panel h2,.profile-value{color:var(--view-ink)}
.profile-hero p,.profile-panel p,.profile-about,.profile-list,.profile-note,.profile-panel h3,.chart-summary{color:var(--view-muted)}
.profile-source,.profile-panel a{color:var(--view-accent)}
.status-neutral{display:inline-block;border:1px solid var(--view-border);border-radius:999px;background:var(--view-bg);padding:5px 11px;font-size:13px;font-weight:650;color:var(--view-muted)}
.profile-tags span{background:var(--view-bg);border-color:var(--view-border);color:var(--view-muted)}
.chart-controls label{color:var(--view-muted)}.chart-controls select{min-height:46px;background:var(--view-surface);border-color:var(--view-border);color:var(--view-ink);border-radius:11px}
.profile-chart,.chart-observation{background:var(--view-bg);border-color:var(--view-border);color:var(--view-ink)}.chart-observation p{color:var(--view-muted)}
@media(max-width:700px){.top .navlinks{display:none!important}.top .theme-toggle{margin-left:auto}.mobile-menu{display:block;flex:none}.wrap.hero,body[data-theme="light"] .wrap.hero,body[data-theme="dark"] .wrap.hero{margin-top:12px;padding:20px 16px}.hero .hero-tools>.filters:first-child{gap:10px}.hero #quicksearch{flex-basis:100%;max-width:none}body .hero .hero-tools .chip{font-size:12px;padding:8px 11px}.cards{gap:12px}.group .section-title h2{font-size:21px}.profile-hero{padding:20px}.directory-tools{padding:14px}}
@media(max-width:359px){.cards{grid-template-columns:minmax(0,1fr)!important}.card .name{font-size:16px}.card .logo-area{height:92px}.wrap{padding-left:14px;padding-right:14px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;

/** Native details remains usable without JavaScript; enhancement manages keyboard focus. */
export function enhanceMobileMenu() {
  const menu = document.querySelector('#mobile-menu');
  const summary = menu?.querySelector('summary');
  if (!menu || !summary) return;
  menu.addEventListener('toggle', () => summary.setAttribute('aria-label', menu.open ? 'Cerrar menú' : 'Abrir menú'));
  menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget)) menu.open = false; });
  menu.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.open = false; summary.focus(); } });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
}
