import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", name:"Mahfud Sidik", email:"mahfud@email.com", password:"123456", initials:"MS", online:true,  role:"user",  rating:4.8 },
  { id:"u2", name:"Sari Dewi",    email:"sari@email.com",   password:"123456", initials:"SD", online:false, role:"user",  rating:4.5 },
  { id:"u3", name:"Admin",        email:"admin@finder.com", password:"admin123",initials:"AD",online:true,  role:"admin", rating:5.0 },
];

const BANDUNG_LOCS = [
  { label:"Gedung Sate / Gasibu", lat:-6.9025, lng:107.6187 },
  { label:"Alun-alun Bandung",    lat:-6.9211, lng:107.6070 },
  { label:"Jl. Braga",            lat:-6.9189, lng:107.6075 },
  { label:"Dago / Ir. H. Juanda", lat:-6.8929, lng:107.6126 },
  { label:"Cihampelas Walk",      lat:-6.8954, lng:107.6031 },
  { label:"BTC / Pasteur",        lat:-6.9041, lng:107.5981 },
  { label:"Buah Batu",            lat:-6.9440, lng:107.6355 },
  { label:"Terminal Leuwipanjang",lat:-6.9648, lng:107.5994 },
];

const SEED_POSTS = [
 
];

const SEED_PUBLIC = [
  {id:"pc1",userId:"u1",text:"Ada yang temukan dompet di sekitar Braga kemarin?",time:"2026-06-06T10:00"},
  {id:"pc2",userId:"u2",text:"Saya lapor HP di Alun-alun, cek postingan saya.",time:"2026-06-06T11:30"},
];

const CATEGORIES = ["Semua","Dompet","HP/Gadget","Kunci","Tas","Dokumen","Perhiasan","Kendaraan","Lainnya"];
const CAT_ICON = {Dompet:"💼","HP/Gadget":"📱",Kunci:"🔑",Tas:"🎒",Dokumen:"📄",Perhiasan:"💍",Kendaraan:"🏍️",Lainnya:"📦"};

function timeAgo(d){
  const s=(Date.now()-new Date(d))/1000;
  if(s<60)return"baru saja";
  if(s<3600)return`${Math.floor(s/60)} menit lalu`;
  if(s<86400)return`${Math.floor(s/3600)} jam lalu`;
  return`${Math.floor(s/86400)} hari lalu`;
}
function fmtDate(d){
  return new Date(d).toLocaleString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function getDist(la1,ln1,la2,ln2){
  const R=6371,dLa=(la2-la1)*Math.PI/180,dLn=(ln2-ln1)*Math.PI/180;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLn/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#E8F0F4;
  --surface:#fff;
  --surface2:#F2F7FA;
  --teal:#1DB8A0;
  --teal-dark:#17A08B;
  --orange:#F07B2F;
  --orange-dark:#D96A22;
  --navy:#0D1B2A;
  --navy2:#1C2E40;
  --text:#1A2B3C;
  --muted:#6B8299;
  --border:#DDE8EF;
  --radius:14px;
  --radius-sm:10px;
  --radius-lg:20px;
}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
h1,h2,h3{font-family:'Nunito',sans-serif}

/* NAV */
.nav{background:var(--surface);border-bottom:1px solid var(--border);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.nav-logo{display:flex;align-items:center;gap:8px;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:900;font-size:1.15rem;color:var(--navy)}
.nav-logo span{color:var(--teal)}
.logo-icon{width:32px;height:32px;background:var(--teal);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:900}
.nav-right{display:flex;align-items:center;gap:12px}
.nav-link{background:none;border:none;font-family:inherit;font-size:14px;font-weight:600;color:var(--muted);cursor:pointer;padding:6px 12px;border-radius:8px;transition:.2s}
.nav-link:hover{color:var(--text);background:var(--surface2)}
.nav-link.active{color:var(--teal)}
.nav-chip{display:flex;align-items:center;gap:8px;background:var(--navy);color:#fff;font-family:inherit;font-size:13px;font-weight:700;padding:8px 16px;border-radius:10px;border:none;cursor:pointer}
.nav-avatar{width:32px;height:32px;border-radius:8px;background:var(--teal);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}

/* LAYOUT */
.wrap{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}
.two-col{display:grid;grid-template-columns:1fr 380px;gap:2rem;align-items:start}
.page{min-height:calc(100vh - 60px)}

/* HERO */
.hero{padding:3rem 0 2rem}
.community-chip{display:inline-flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;color:var(--teal);margin-bottom:1.5rem}
.community-chip::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--teal);display:inline-block}
.hero h1{font-family:'Nunito',sans-serif;font-size:2.8rem;font-weight:900;line-height:1.15;color:var(--navy);margin-bottom:.5rem}
.hero h1 .accent{color:var(--teal);display:block}
.hero p{color:var(--muted);font-size:14px;line-height:1.7;max-width:420px;margin-bottom:2rem}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-hero-lost{display:flex;align-items:center;gap:10px;background:var(--teal);color:#fff;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;padding:14px 22px;border-radius:var(--radius);cursor:pointer;transition:.2s}
.btn-hero-lost:hover{background:var(--teal-dark);transform:translateY(-1px)}
.btn-hero-found{display:flex;align-items:center;gap:10px;background:var(--orange);color:#fff;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;padding:14px 22px;border-radius:var(--radius);cursor:pointer;transition:.2s}
.btn-hero-found:hover{background:var(--orange-dark);transform:translateY(-1px)}
.btn-icon{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:16px}

/* STATS */
.stats-card{background:var(--surface);border-radius:var(--radius-lg);padding:1.2rem 1.5rem;display:flex;gap:2rem;margin-bottom:2rem;border:1px solid var(--border)}
.stat{text-align:center;flex:1}
.stat .num{font-family:'Nunito',sans-serif;font-size:1.8rem;font-weight:900;color:var(--navy)}
.stat .lbl{font-size:11px;color:var(--muted);margin-top:2px;display:flex;align-items:center;justify-content:center;gap:4px}
.stat .lbl-icon{font-size:12px}

/* ACTIVITY CARD */
.activity-card{background:var(--surface);border-radius:var(--radius-lg);padding:1.25rem;border:1px solid var(--border)}
.activity-title{font-family:'Nunito',sans-serif;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem}
.activity-item{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border)}
.activity-item:last-child{border-bottom:none;padding-bottom:0}
.act-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
.act-dot.lost{background:var(--orange)}
.act-dot.found{background:var(--teal)}
.act-dot.done{background:#8B5CF6}
.act-text{font-size:12px;color:var(--text);line-height:1.5}
.act-time{font-size:11px;color:var(--muted);margin-top:2px}

/* SECTION */
.section-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.25rem}
.section-title{font-family:'Nunito',sans-serif;font-size:1.4rem;font-weight:900;color:var(--navy)}
.section-sub{font-size:12px;color:var(--muted);margin-top:2px}

/* FILTER TABS */
.filter-tabs{display:flex;gap:6px;background:var(--surface);border:1px solid var(--border);padding:4px;border-radius:12px}
.ftab{border:none;background:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--muted);padding:6px 16px;border-radius:9px;cursor:pointer;transition:.2s;white-space:nowrap}
.ftab.active{background:var(--navy);color:#fff}

/* POST CARDS GRID */
.posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.post-card{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden;cursor:pointer;transition:.2s}
.post-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(13,27,42,.1)}
.pc-img{width:100%;height:160px;object-fit:cover;display:block}
.pc-img-ph{width:100%;height:160px;background:linear-gradient(135deg,#E8F4F0,#D1EAE4);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2.8rem;gap:6px}
.pc-img-ph span{font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}
.pc-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin:12px 12px 0}
.pc-badge.lost{background:var(--orange);color:#fff}
.pc-badge.found{background:var(--teal);color:#fff}
.pc-badge.done{background:#EDE9FE;color:#5B21B6}
.pc-body{padding:10px 12px 14px}
.pc-title{font-family:'Nunito',sans-serif;font-weight:800;font-size:1rem;color:var(--navy);margin-bottom:4px}
.pc-desc{font-size:12px;color:var(--muted);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px}
.pc-meta{font-size:11px;color:var(--muted);display:flex;flex-direction:column;gap:3px}
.pc-meta span{display:flex;align-items:center;gap:5px}

/* SEARCH BAR */
.search-bar{display:flex;gap:10px;margin-bottom:1.25rem}
.search-wrap{flex:1;position:relative}
.search-wrap input{width:100%;padding:10px 16px 10px 40px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);font-family:inherit;font-size:14px;color:var(--text);outline:none;transition:.2s}
.search-wrap input:focus{border-color:var(--teal)}
.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:14px}
.filter-sel{padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);font-family:inherit;font-size:13px;color:var(--text);outline:none;cursor:pointer}

/* CAT PILLS */
.cat-pills{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:1.25rem}
.cat-pill{border:1px solid var(--border);background:var(--surface);border-radius:20px;font-family:inherit;font-size:12px;font-weight:700;color:var(--muted);padding:5px 14px;cursor:pointer;white-space:nowrap;transition:.2s}
.cat-pill.active{background:var(--teal);color:#fff;border-color:var(--teal)}

/* BUTTONS generic */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--radius-sm);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:.2s}
.btn-teal{background:var(--teal);color:#fff}
.btn-teal:hover{background:var(--teal-dark)}
.btn-orange{background:var(--orange);color:#fff}
.btn-orange:hover{background:var(--orange-dark)}
.btn-navy{background:var(--navy);color:#fff}
.btn-navy:hover{background:var(--navy2)}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--surface2)}
.btn-danger{background:#FEE2E2;color:#991B1B}
.btn-danger:hover{background:#FECACA}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-full{width:100%;justify-content:center}

/* DETAIL PAGE */
.detail-wrap{display:grid;grid-template-columns:1fr 360px;gap:2rem;align-items:start}
.detail-img{width:100%;border-radius:var(--radius-lg);margin-bottom:1rem;max-height:320px;object-fit:cover}
.detail-title{font-family:'Nunito',sans-serif;font-size:1.6rem;font-weight:900;color:var(--navy);margin-bottom:8px}
.status-pill{display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;padding:5px 14px;border-radius:20px}
.status-pill.active{background:#FEF3C7;color:#B45309}
.status-pill.found{background:#D1FAE5;color:#065F46}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:1rem 0}
.info-box{background:var(--surface2);border-radius:var(--radius-sm);padding:12px 14px}
.info-box-label{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;display:flex;align-items:center;gap:5px}
.info-box-val{font-size:13px;font-weight:700;color:var(--navy)}
.section-divider{border:none;border-top:2px solid var(--border);margin:1.25rem 0}
.spec-label{font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.spec-label::before{content:"";width:3px;height:14px;background:var(--teal);border-radius:2px;display:inline-block}

/* DISCUSSION PANEL */
.disc-panel{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden}
.disc-head{padding:1rem 1.25rem;border-bottom:1px solid var(--border)}
.disc-head-title{font-family:'Nunito',sans-serif;font-weight:800;font-size:.95rem;color:var(--navy);margin-bottom:2px}
.disc-head-sub{font-size:11px;color:var(--muted)}
.disc-range-chip{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--teal);padding:3px 8px;background:#E6FAF7;border-radius:20px}
.disc-range-chip::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--teal)}
.disc-msgs{min-height:180px;max-height:280px;overflow-y:auto;padding:1rem 1.25rem;display:flex;flex-direction:column;gap:10px}
.disc-empty{display:flex;align-items:center;justify-content:center;min-height:160px;color:var(--muted);font-size:13px;text-align:center;padding:1rem}
.disc-msg{display:flex;gap:8px}
.disc-msg.mine{flex-direction:row-reverse}
.disc-bubble{padding:8px 12px;border-radius:12px;max-width:75%}
.disc-bubble.other{background:var(--surface2)}
.disc-bubble.mine{background:var(--teal);color:#fff}
.disc-bubble p{font-size:13px;line-height:1.5}
.disc-bubble .t{font-size:10px;opacity:.6;margin-top:3px}
.disc-inp{display:flex;gap:8px;padding:1rem 1.25rem;border-top:1px solid var(--border)}
.disc-inp input{flex:1;padding:9px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:13px;outline:none}
.disc-inp input:focus{border-color:var(--teal)}

/* MAP */
.map-container{height:240px;border-radius:var(--radius);overflow:hidden;position:relative;border:1px solid var(--border)}
.map-search-wrap{position:absolute;top:10px;left:10px;right:10px;z-index:1000;background:#fff;border-radius:var(--radius-sm);box-shadow:0 2px 8px rgba(0,0,0,.15)}
.map-search-input{width:100%;padding:10px 14px;border:none;border-radius:var(--radius-sm);font-family:inherit;font-size:13px;outline:none}
.map-search-results{position:absolute;top:44px;left:10px;right:10px;background:#fff;border-radius:var(--radius-sm);max-height:200px;overflow-y:auto;box-shadow:0 2px 8px rgba(0,0,0,.15);z-index:999}
.map-result-item{padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer;font-size:12px;color:var(--text);transition:.2s}
.map-result-item:hover{background:var(--surface2)}
.map-result-item:last-child{border-bottom:none}
.map-loc-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.loc-btn{border:1px solid var(--border);background:var(--surface);border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;color:var(--text);padding:7px 10px;cursor:pointer;text-align:left;transition:.2s;display:flex;align-items:center;gap:5px}
.loc-btn:hover{border-color:var(--teal);background:#E6FAF7}
.loc-btn.active{border-color:var(--teal);background:#E6FAF7;color:var(--teal-dark)}

/* FORM */
.form-page{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden}
.form-page-head{padding:1.5rem 2rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.form-page-title{font-family:'Nunito',sans-serif;font-size:1.3rem;font-weight:900;color:var(--navy)}
.form-body{padding:1.5rem 2rem}
.form-2col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.form-col{}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg{margin-bottom:1rem}
.fg label{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.fg label span{color:#EF4444}
.fi{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:14px;color:var(--text);outline:none;background:var(--surface);transition:.2s}
.fi:focus{border-color:var(--teal)}
.fi.err{border-color:#EF4444}
.fi-err{font-size:11px;color:#EF4444;margin-top:4px}
.fi-ta{resize:vertical;min-height:90px}
.fi-sel{appearance:none;cursor:pointer}
.type-switch{display:flex;gap:8px;margin-bottom:1.5rem}
.type-btn{flex:1;border:2px solid var(--border);background:var(--surface);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:var(--muted);padding:12px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
.type-btn.l.on{border-color:var(--orange);background:#FFF7F2;color:var(--orange-dark)}
.type-btn.f.on{border-color:var(--teal);background:#F0FDFB;color:var(--teal-dark)}
.photo-drop{border:2px dashed var(--border);border-radius:var(--radius);padding:1.5rem;text-align:center;cursor:pointer;transition:.2s;background:var(--surface2)}
.photo-drop:hover{border-color:var(--teal)}
.photo-drop.err{border-color:#EF4444}
.photo-preview{width:100%;max-height:200px;object-fit:cover;border-radius:var(--radius-sm)}

/* AUTH */
.auth-page{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
.auth-left{background:var(--navy);padding:3rem;display:flex;flex-direction:column;justify-content:center}
.auth-left h1{font-family:'Nunito',sans-serif;font-size:2.8rem;font-weight:900;color:#fff;line-height:1.25;margin-bottom:1.5rem}
.auth-left h1 span{color:var(--teal)}
.auth-left p{color:rgba(255,255,255,.5);font-size:14px;line-height:1.7}
.auth-right{background:#fff;padding:3rem;display:flex;flex-direction:column;justify-content:center}
.auth-tabs-bar{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:2rem}
.atab{flex:1;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:var(--muted);padding:12px;cursor:pointer;position:relative;transition:.2s}
.atab.on{color:var(--teal)}
.atab.on::after{content:"";position:absolute;bottom:-2px;left:0;right:0;height:2px;background:var(--teal)}
.auth-heading{font-family:'Nunito',sans-serif;font-size:1.6rem;font-weight:900;color:var(--navy);margin-bottom:4px}
.auth-sub{font-size:13px;color:var(--muted);margin-bottom:1.5rem}
.auth-logo{display:flex;align-items:center;gap:8px;margin-bottom:2rem}
.auth-logo .icon{width:36px;height:36px;background:var(--teal);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px}
.auth-logo span{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.1rem;color:var(--navy)}
.auth-logo span em{color:var(--teal);font-style:normal}
.err-box{background:#FEE2E2;color:#991B1B;padding:10px 14px;border-radius:var(--radius-sm);font-size:13px;margin-bottom:1rem}
.demo-hint{margin-top:1rem;padding:10px 14px;background:var(--surface2);border-radius:var(--radius-sm);font-size:12px;color:var(--muted)}

/* CHAT PAGE */
.chat-layout{display:grid;grid-template-columns:260px 1fr;gap:16px;height:calc(100vh - 160px)}
.chat-sidebar-panel{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.chat-panel{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.cpanel-head{padding:1rem 1.25rem;border-bottom:1px solid var(--border);font-family:'Nunito',sans-serif;font-weight:800;font-size:.95rem;color:var(--navy)}
.user-item{display:flex;align-items:center;gap:10px;padding:10px 1.25rem;cursor:pointer;transition:.2s;border-bottom:1px solid var(--border)}
.user-item:hover,.user-item.on{background:var(--surface2)}
.user-item:last-child{border-bottom:none}
.u-av{width:36px;height:36px;border-radius:9px;background:var(--teal);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
.u-dot{position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;border:2px solid var(--surface)}
.u-dot.on{background:#22C55E}
.u-dot.off{background:#D1D5DB}
.u-name{font-size:13px;font-weight:700;color:var(--navy)}
.u-last{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px}
.chat-msgs{flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:10px}
.chat-inp{display:flex;gap:8px;padding:1rem 1.25rem;border-top:1px solid var(--border)}
.chat-inp input{flex:1;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:13px;outline:none}
.chat-inp input:focus{border-color:var(--teal)}
.pub-tag{display:inline-flex;align-items:center;gap:6px;background:#E6FAF7;color:var(--teal-dark);font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;margin-bottom:12px}
.pub-tag::before{content:"📡"}

/* FOUND PAGE */
.rating-card{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);padding:1.25rem;margin-bottom:16px}
.rating-avg-big{font-family:'Nunito',sans-serif;font-size:2.5rem;font-weight:900;color:var(--navy)}
.stars{display:flex;gap:3px}
.star{font-size:18px;color:#F59E0B}
.star.empty{color:#E5E7EB}
.r-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.r-item:last-child{border-bottom:none}

/* MODAL */
.ov{position:fixed;inset:0;background:rgba(13,27,42,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:#fff;border-radius:var(--radius-lg);max-width:480px;width:100%;max-height:90vh;overflow-y:auto}
.modal-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1}
.modal-title{font-family:'Nunito',sans-serif;font-weight:800;font-size:1rem;color:var(--navy)}
.modal-x{background:var(--surface2);border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:16px;color:var(--muted);display:flex;align-items:center;justify-content:center}
.modal-body{padding:1.5rem}

/* NOTIFY */
.notif{position:fixed;bottom:24px;right:24px;z-index:999;padding:12px 20px;border-radius:var(--radius-sm);font-size:14px;font-weight:700;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:slideUp .3s ease}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.notif.ok{background:var(--teal);color:#fff}
.notif.err{background:#EF4444;color:#fff}
.notif.info{background:var(--navy);color:#fff}

/* EMPTY */
.empty{text-align:center;padding:3rem 1rem;color:var(--muted)}
.empty .ei{font-size:3rem;margin-bottom:.5rem}

/* ADMIN BADGE */
.admin-tag{background:#FEF3C7;color:#B45309;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px}

/* FOUND ITEMS PAGE */
.found-badge{display:inline-flex;align-items:center;gap:6px;background:#D1FAE5;color:#065F46;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:16px}

/* ━━ MOBILE RESPONSIVE ━━ */
@media (max-width: 768px) {
  /* NAV */
  .nav{padding:0 1rem;height:56px}
  .nav-logo{font-size:1rem}
  .nav-right{gap:8px}
  .nav-link{font-size:12px;padding:4px 8px}
  
  /* LAYOUT */
  .wrap{padding:1rem 1rem}
  .two-col{grid-template-columns:1fr;gap:1rem}
  .page{min-height:auto}
  
  /* HERO */
  .hero{padding:2rem 0 1.5rem}
  .hero h1{font-size:2rem}
  .hero p{font-size:13px;max-width:100%}
  .hero-btns{gap:8px}
  .btn-hero-lost,.btn-hero-found{font-size:13px;padding:12px 18px}
  
  /* STATS */
  .stats-card{gap:1rem;padding:1rem}
  .stat .num{font-size:1.4rem}
  
  /* SECTION */
  .section-title{font-size:1.1rem}
  .section-sub{font-size:11px}
  
  /* POSTS GRID */
  .posts-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
  .pc-img,.pc-img-ph{height:120px}
  .pc-body{padding:8px 10px}
  .pc-title{font-size:.9rem}
  .pc-desc{font-size:11px}
  .pc-meta{font-size:10px}
  
  /* SEARCH & FILTER */
  .search-bar{flex-direction:column;gap:8px}
  .filter-sel{width:100%}
  .cat-pills{gap:6px}
  .cat-pill{font-size:11px;padding:4px 12px}
  
  /* FILTER TABS */
  .filter-tabs{gap:4px;padding:3px}
  .ftab{font-size:12px;padding:5px 12px}
  
  /* BUTTONS */
  .btn{padding:8px 16px;font-size:12px}
  .btn-sm{padding:6px 10px;font-size:11px}
  
  /* DETAIL PAGE */
  .detail-wrap{grid-template-columns:1fr;gap:1rem}
  .detail-img{max-height:240px}
  .detail-title{font-size:1.3rem}
  .info-grid{grid-template-columns:1fr}
  
  /* FORM */
  .form-page-head{padding:1rem 1.5rem}
  .form-page-title{font-size:1.1rem}
  .form-body{padding:1.5rem 1rem}
  .form-2col{grid-template-columns:1fr;gap:1rem}
  .form-row{grid-template-columns:1fr}
  .fi{padding:10px 12px;font-size:13px}
  .type-switch{gap:6px}
  .type-btn{font-size:12px;padding:10px}
  
  /* AUTH PAGE */
  .auth-page{grid-template-columns:1fr;min-height:auto}
  .auth-left{padding:2rem 1.5rem;padding-bottom:0}
  .auth-right{padding:2rem 1.5rem}
  .auth-left h1{font-size:1.8rem;margin-bottom:1rem}
  .auth-left p{font-size:13px}
  .auth-heading{font-size:1.3rem}
  .auth-logo{margin-bottom:1.5rem}
  
  /* CHAT LAYOUT */
  .chat-layout{grid-template-columns:1fr;gap:12px;height:auto}
  .chat-sidebar-panel{max-height:200px}
  
  /* MAP */
  .map-container{height:150px}
  .map-loc-grid{grid-template-columns:1fr}
  
  /* DISCUSSION */
  .disc-msgs{min-height:150px;max-height:220px}
  .disc-bubble{max-width:85%}
  
  /* MODAL */
  .ov{padding:.5rem}
  .modal{border-radius:20px}
  .modal-head{padding:1rem 1.25rem}
  .modal-title{font-size:.95rem}
  .modal-body{padding:1.25rem}
  
  /* NOTIFICATION */
  .notif{bottom:16px;right:16px;font-size:13px;padding:10px 16px}
}

@media (max-width: 480px) {
  /* NAV */
  .nav{padding:0 0.75rem}
  .nav-logo{font-size:.9rem;gap:6px}
  .logo-icon{width:28px;height:28px;font-size:12px}
  
  /* LAYOUT */
  .wrap{padding:0.75rem}
  
  /* HERO */
  .hero{padding:1.5rem 0 1rem}
  .hero h1{font-size:1.5rem;margin-bottom:.3rem}
  .hero p{font-size:12px;margin-bottom:1.5rem}
  .hero-btns{gap:6px}
  .btn-hero-lost,.btn-hero-found{font-size:12px;padding:10px 16px}
  .btn-icon{width:32px;height:32px;font-size:14px}
  
  /* STATS */
  .stats-card{flex-direction:column;gap:.8rem;padding:.8rem;margin-bottom:1.5rem}
  .stat .num{font-size:1.2rem}
  .stat .lbl{font-size:10px}
  
  /* SECTION */
  .section-head{flex-direction:column;gap:.5rem}
  .section-title{font-size:1rem}
  .section-sub{font-size:10px;margin-top:0}
  
  /* POSTS GRID */
  .posts-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .pc-img,.pc-img-ph{height:100px;font-size:2rem}
  .pc-body{padding:6px 8px}
  .pc-title{font-size:.8rem;margin-bottom:2px}
  .pc-desc{font-size:10px;margin-bottom:6px}
  .pc-meta{font-size:9px}
  .pc-badge{font-size:9px;padding:2px 8px;margin:8px 8px 0}
  
  /* SEARCH & FILTER */
  .search-bar{gap:6px}
  .filter-sel{padding:9px 12px;font-size:12px}
  .cat-pills{gap:4px;padding-bottom:2px;margin-bottom:1rem}
  .cat-pill{font-size:10px;padding:3px 10px}
  
  /* FILTER TABS */
  .filter-tabs{gap:2px;padding:2px}
  .ftab{font-size:11px;padding:4px 10px}
  
  /* BUTTONS */
  .btn{padding:8px 14px;font-size:11px;gap:5px}
  .btn-sm{padding:5px 10px;font-size:10px}
  .btn-full{width:100%}
  
  /* DETAIL PAGE */
  .detail-title{font-size:1.1rem}
  .info-box{padding:10px 12px}
  .info-box-label{font-size:9px;margin-bottom:2px}
  .info-box-val{font-size:12px}
  .spec-label{font-size:10px}
  
  /* FORM */
  .form-page-head{padding:.8rem 1rem;gap:8px}
  .form-page-title{font-size:1rem}
  .form-body{padding:1rem}
  .fg{margin-bottom:.8rem}
  .fg label{font-size:10px;margin-bottom:4px}
  .fi{padding:8px 12px;font-size:12px;border-radius:8px}
  .fi-err{font-size:10px}
  .fi-ta{min-height:70px}
  .type-switch{gap:4px;margin-bottom:1rem}
  .type-btn{font-size:11px;padding:8px}
  .photo-drop{padding:1rem;border-radius:10px}
  .photo-preview{max-height:150px;border-radius:8px}
  
  /* AUTH PAGE */
  .auth-left{padding:2rem 1rem;padding-bottom:0}
  .auth-right{padding:1.5rem}
  .auth-left h1{font-size:1.4rem;line-height:1.3}
  .auth-left p{font-size:12px}
  .auth-logo{margin-bottom:1.25rem}
  .auth-logo .icon{width:32px;height:32px;font-size:14px}
  .auth-logo span{font-size:1rem}
  .auth-heading{font-size:1.1rem;margin-bottom:2px}
  .auth-sub{font-size:12px;margin-bottom:1rem}
  .auth-tabs-bar{margin-bottom:1.5rem}
  .atab{font-size:13px;padding:10px}
  .err-box{padding:8px 12px;font-size:12px}
  .demo-hint{margin-top:.8rem;padding:8px 12px;font-size:11px}
  
  /* CHAT */
  .chat-layout{gap:8px}
  .chat-sidebar-panel{max-height:180px}
  .cpanel-head{padding:.8rem 1rem;font-size:.85rem}
  .user-item{padding:8px 1rem;gap:8px}
  .u-av{width:32px;height:32px;font-size:12px}
  .u-name{font-size:12px}
  .u-last{font-size:10px}
  .chat-msgs{padding:1rem;gap:8px}
  .chat-inp{padding:.8rem;gap:6px}
  .chat-inp input{padding:8px 12px;font-size:12px}
  
  /* MAP */
  .map-container{height:120px;border-radius:10px}
  .map-pin-anim{font-size:1.4rem}
  .map-addr-pill{padding:4px 12px;font-size:10px}
  .map-loc-grid{gap:4px;margin-top:6px}
  .loc-btn{padding:6px 8px;font-size:10px}
  
  /* DISCUSSION */
  .disc-panel{border-radius:10px}
  .disc-head{padding:.8rem 1rem}
  .disc-head-title{font-size:.85rem}
  .disc-head-sub{font-size:10px}
  .disc-msgs{min-height:120px;max-height:180px;padding:.8rem;gap:8px}
  .disc-msg{gap:6px}
  .disc-bubble{padding:6px 10px;max-width:90%}
  .disc-bubble p{font-size:12px}
  .disc-inp{padding:.8rem}
  .disc-inp input{padding:8px 12px;font-size:12px}
  
  /* MODAL */
  .ov{padding:.3rem}
  .modal{border-radius:16px}
  .modal-head{padding:.8rem 1rem}
  .modal-title{font-size:.9rem}
  .modal-body{padding:1rem}
  
  /* RATING */
  .rating-card{padding:1rem;margin-bottom:12px}
  .rating-avg-big{font-size:2rem}
  .stars{gap:2px}
  .star{font-size:16px}
  
  /* NOTIFICATION */
  .notif{bottom:12px;right:12px;font-size:12px;padding:8px 14px}
}
`;

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function App() {
  const [users,    setUsers]    = useState(SEED_USERS);
  const [posts,    setPosts]    = useState(SEED_POSTS);
  const [pubChat,  setPubChat]  = useState(SEED_PUBLIC);
  const [dms,      setDms]      = useState({});
  const [me,       setMe]       = useState(null);
  const [view,     setView]     = useState("home");   // home | auth | form | detail | chat | found
  const [selPost,  setSelPost]  = useState(null);
  const [selDmUid, setSelDmUid] = useState(null);
  const [chatTab,  setChatTab]  = useState("public");
  const [newType,  setNewType]  = useState("lost");
  const [filt,     setFilt]     = useState("Semua");
  const [ftab,     setFtab]     = useState("all");    // all|lost|found|done
  const [search,   setSearch]   = useState("");
  const [mapLoc,   setMapLoc]   = useState(BANDUNG_LOCS[0]);
  const [notif,    setNotif]    = useState(null);
  const [ratingMod,setRatingMod]= useState(null);
  const [rForm,    setRForm]    = useState({score:5,comment:""});
  const [pForm,    setPForm]    = useState({title:"",desc:"",cat:"Dompet",time:"",photoUrl:""});
  const [pErrs,    setPErrs]    = useState({});
  const [authMode, setAuthMode] = useState("login");
  const [aForm,    setAForm]    = useState({name:"",email:"",password:""});
  const [aErr,     setAErr]     = useState("");
  const [cInputs,  setCInputs]  = useState({});
  const [dmInput,  setDmInput]  = useState("");
  const [pubInput, setPubInput] = useState("");

  const toast = (msg,type="ok") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); };

  const mapDbPostToAppPost = dbPost => ({
    ...dbPost,
    userId: dbPost.userid || dbPost.userId,
    lastSeen: dbPost.lastseen || dbPost.lastSeen,
    createdAt: dbPost.createdat || dbPost.createdAt,
    location: dbPost.location || BANDUNG_LOCS[0],
  });

  const mapAppPostToDbPost = post => {
    const { userId, lastSeen, createdAt, ...rest } = post;
    return {
      ...rest,
      userid: userId,
      lastseen: lastSeen,
      createdat: createdAt,
    };
  };

  useEffect(() => {
    // restore user session from localStorage on mount
    const savedUser = localStorage.getItem('finder_nekat_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setMe({...user, online: true});
      } catch (e) {
        console.warn('Failed to restore user session', e);
      }
    }
  }, []);

  useEffect(() => {
    console.log('hasSupabase', hasSupabase);
    if (!hasSupabase) return;
    const loadData = async () => {
      const { data: usersData, error: usersError } = await supabase.from("users").select("*");
      const { data: postsData, error: postsError } = await supabase.from("posts").select("*");
      console.log('Supabase load', { usersCount: usersData?.length, postsCount: postsData?.length, usersError, postsError });
      if (usersError) console.warn("Supabase users load error", usersError);
      if (postsError) console.warn("Supabase posts load error", postsError);
      if (usersData?.length) setUsers(usersData.map(u=>({
        ...u,
        online:!!u.online,
      })));
      if (postsData?.length) setPosts(postsData.map(p => mapDbPostToAppPost(p)));
    };
    loadData();
  }, []);

  const syncPostToDb = async (pid, updates) => {
    if (!hasSupabase) return;
    const dbUpdates = { ...updates };
    if (dbUpdates.userId) { dbUpdates.userid = dbUpdates.userId; delete dbUpdates.userId; }
    if (dbUpdates.lastSeen) { dbUpdates.lastseen = dbUpdates.lastSeen; delete dbUpdates.lastSeen; }
    if (dbUpdates.createdAt) { dbUpdates.createdat = dbUpdates.createdAt; delete dbUpdates.createdAt; }
    const { error } = await supabase.from("posts").update(dbUpdates).eq("id", pid);
    if (error) console.warn("Supabase update post failed", error.message);
  };

  const deletePostFromDb = async pid => {
    if (!hasSupabase) return;
    const { error } = await supabase.from("posts").delete().eq("id", pid);
    if (error) console.warn("Supabase delete post failed", error.message);
  };

  const insertPostToDb = async post => {
    if (!hasSupabase) return;
    const dbPost = mapAppPostToDbPost(post);
    const { data, error } = await supabase.from("posts").insert([dbPost]);
    console.log('Supabase insert post result', { data, error });
    if (error) console.warn("Supabase insert post failed", error.message);
  };

  const activePosts = posts.filter(p=>p.status==="active");
  const foundPosts  = posts.filter(p=>p.status==="found");
  const lostCount   = activePosts.filter(p=>p.type==="lost").length;
  const foundCount  = foundPosts.length;
  const onlineCount = users.filter(u=>u.online).length;

  const byId = id => users.find(u=>u.id===id);

  // filtered for home
  const visiblePosts = activePosts.filter(p=>{
    const mS = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const mT = ftab==="all" || (ftab==="lost"&&p.type==="lost") || (ftab==="found"&&p.type==="found") || (ftab==="done"&&p.status==="found");
    const mC = filt==="Semua" || p.category===filt;
    return mS&&mT&&mC;
  });

  // activity feed for hero panel
  const recentActs = [...posts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  // ── auth
  const doAuth = async () => {
    setAErr("");
    let u;
    if(authMode==="login"){
      if (hasSupabase) {
        const { data, error } = await supabase.from("users").select("*").eq("email", aForm.email).eq("password", aForm.password).limit(1).single();
        if (error || !data) return setAErr("Email atau password salah.");
        u = data;
      } else {
        u = users.find(u=>u.email===aForm.email&&u.password===aForm.password);
        if(!u) return setAErr("Email atau password salah.");
      }
      setUsers(us=>us.map(x=>x.id===u.id?{...x,online:true}:x));
      setMe({...u,online:true});
      localStorage.setItem('finder_nekat_user', JSON.stringify(u));
      setView("home");
      toast(`Selamat datang, ${u.name}!`);
    } else {
      if(!aForm.name||!aForm.email||!aForm.password)return setAErr("Semua field wajib diisi.");
      if (hasSupabase) {
        const { data: existingUser, error: findError } = await supabase.from("users")
          .select("id").eq("email", aForm.email).maybeSingle();
        if (findError) return setAErr(`Gagal memeriksa email: ${findError.message}`);
        if (existingUser) return setAErr("Email sudah terdaftar.");
      } else {
        if(users.find(u=>u.email===aForm.email))return setAErr("Email sudah terdaftar.");
      }
      const nu={id:`u${Date.now()}`,name:aForm.name,email:aForm.email,password:aForm.password,
        initials:aForm.name.slice(0,2).toUpperCase(),online:true,role:"user",rating:0};
      if (hasSupabase) {
        const { data: insertedUser, error } = await supabase.from("users").insert(nu).select().single();
        if (error || !insertedUser) {
          console.warn("Supabase insert user failed", error);
          return setAErr(`Gagal membuat akun: ${error?.message || "Tidak bisa menyimpan data"}`);
        }
        setUsers(us=>[...us, insertedUser]); setMe(insertedUser);
        localStorage.setItem('finder_nekat_user', JSON.stringify(insertedUser));
        setView("home");
      } else {
        setUsers(us=>[...us,nu]); setMe(nu);
        localStorage.setItem('finder_nekat_user', JSON.stringify(nu));
        setView("home");
      }
      toast(`Akun berhasil dibuat!`);
    }
    setAForm({name:"",email:"",password:""});
  };

  const doLogout = () => {
    setUsers(us=>us.map(u=>u.id===me.id?{...u,online:false}:u));
    setMe(null);
    localStorage.removeItem('finder_nekat_user');
    setView("home"); toast("Berhasil logout.","info");
  };

  // ── photo upload
  const handlePhoto = e => {
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>setPForm(p=>({...p,photoUrl:ev.target.result}));
    r.readAsDataURL(f);
  };

  // ── submit post
  const submitPost = async () => {
    const e={};
    if(!pForm.title.trim())e.title="Wajib diisi";
    if(!pForm.desc.trim())e.desc="Wajib diisi";
    if(!pForm.photoUrl)e.photo="Foto wajib diunggah";
    if(!pForm.time)e.time="Wajib diisi";
    setPErrs(e); if(Object.keys(e).length)return;
    const post={id:`p${Date.now()}`,userId:me.id,type:newType,title:pForm.title,
      description:pForm.desc,category:pForm.cat,photo:pForm.photoUrl,location:mapLoc,
      lastSeen:pForm.time,status:"active",createdAt:new Date().toISOString(),comments:[],ratings:[]};
    setPosts(ps=>[post,...ps]);
    if (hasSupabase) await insertPostToDb(post);
    setPForm({title:"",desc:"",cat:"Dompet",time:"",photoUrl:""});
    setMapLoc(BANDUNG_LOCS[0]); setPErrs({}); setView("home");
    toast("Laporan berhasil dibuat!");
  };

  const markFound = pid => {
    setPosts(ps=>ps.map(p=>p.id===pid?{...p,status:"found"}:p));
    if(selPost?.id===pid)setSelPost(sp=>({...sp,status:"found"}));
    if (hasSupabase) syncPostToDb(pid,{status:"found"});
    setRatingMod(pid);
  };

  const submitRating = pid => {
    const newRatings = [...posts.find(p=>p.id===pid).ratings,{userId:me.id,...rForm}];
    setPosts(ps=>ps.map(p=>p.id===pid?{...p,ratings:newRatings}:p));
    if (hasSupabase) syncPostToDb(pid,{ratings:newRatings});
    setRatingMod(null); setRForm({score:5,comment:""}); toast("Rating diberikan!");
  };

  const deletePost = async pid => {
    setPosts(ps=>ps.filter(p=>p.id!==pid));
    if (hasSupabase) await deletePostFromDb(pid);
    if(selPost?.id===pid){setSelPost(null);setView("home");}
    toast("Postingan dihapus.","info");
  };

  const addComment = pid => {
    const t=cInputs[pid]; if(!t?.trim())return;
    const c={id:`c${Date.now()}`,userId:me.id,text:t,time:new Date().toISOString()};
    const newComments = [...posts.find(p=>p.id===pid).comments,c];
    setPosts(ps=>ps.map(p=>p.id===pid?{...p,comments:newComments}:p));
    if(selPost?.id===pid)setSelPost(sp=>({...sp,comments:newComments}));
    if (hasSupabase) syncPostToDb(pid,{comments:newComments});
    setCInputs(ci=>({...ci,[pid]:""}));
  };

  const sendDM = uid => {
    if(!dmInput.trim())return;
    const key=[me.id,uid].sort().join("_");
    const msg={id:`m${Date.now()}`,from:me.id,text:dmInput,time:new Date().toISOString()};
    setDms(d=>({...d,[key]:[...(d[key]||[]),msg]}));
    setDmInput("");
  };

  const sendPub = () => {
    if(!pubInput.trim())return;
    setPubChat(c=>[...c,{id:`pc${Date.now()}`,userId:me.id,text:pubInput,time:new Date().toISOString()}]);
    setPubInput("");
  };

  // ── helpers
  const Stars = ({n,size=16})=>(
    <div className="stars" style={{fontSize:size}}>
      {[1,2,3,4,5].map(i=><span key={i} className={i<=n?"star":"star empty"}>★</span>)}
    </div>
  );

  const Avatar = ({u,size=36,style:st={}}) => (
    <div style={{width:size,height:size,borderRadius:8,background:"var(--teal)",color:"#fff",
      fontWeight:800,fontSize:size*0.35,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...st}}>
      {u?.initials||"?"}
    </div>
  );

  const MapComponent = ({location, onLocationChange}) => {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [radiusCircle, setRadiusCircle] = useState(null);

    useEffect(() => {
      if (!mapRef.current) return;
      
      // Initialize map
      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView([location.lat, location.lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);
      }
      
      // Clear previous markers
      leafletMapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          leafletMapRef.current.removeLayer(layer);
        }
      });
      
      // Add marker for current location
      L.marker([location.lat, location.lng]).addTo(leafletMapRef.current)
        .bindPopup(`<b>${location.label}</b>`);
      
      // Add 3km radius circle
      L.circle([location.lat, location.lng], {
        color: '#1DB8A0',
        fillColor: '#E6FAF7',
        fillOpacity: 0.2,
        weight: 2,
        radius: 3000
      }).addTo(leafletMapRef.current)
        .bindPopup('Jangkauan 3km (Area publik chat)');
      
      leafletMapRef.current.setView([location.lat, location.lng], 14);
    }, [location]);

    const handleSearch = (query) => {
      setSearchQuery(query);
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      // Filter locations based on search
      const results = BANDUNG_LOCS.filter(loc => 
        loc.label.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    };

    return (
      <div style={{position:"relative",width:"100%"}}>
        <div ref={mapRef} className="map-container" />
        <div className="map-search-wrap">
          <input 
            className="map-search-input"
            placeholder="🔍 Cari lokasi..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map(loc => (
                <div 
                  key={loc.label}
                  className="map-result-item"
                  onClick={() => {
                    onLocationChange(loc);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  📍 {loc.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── PAGES ──────────────────────────────────────────────────────────────

  // AUTH
  if(view==="auth") return (
    <div style={{minHeight:"100vh"}}>
      <style>{CSS}</style>
      <div className="auth-page">
        <div className="auth-left">
          <div style={{marginBottom:"2rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1.5rem"}}>
              <div className="logo-icon">Fa</div>
              <span style={{fontFamily:"Nunito,sans-serif",fontWeight:900,color:"#fff",fontSize:"1.1rem"}}>
                Finder.<span style={{color:"var(--teal)"}}>Nekat</span>
              </span>
            </div>
          </div>
          <h1 style={{marginBottom:"1.2rem"}}>Bantu Sesama<br/>Temukan Barang<br/>Yang Hilang</h1>
          <p style={{fontSize:"14px",lineHeight:"1.8"}}>Platform pelaporan barang hilang & temuan berbasis komunitas. Gratis, cepat, dan mudah digunakan semua kalangan.</p>
          <div style={{marginTop:"2rem",fontSize:12,color:"rgba(255,255,255,.3)"}}>— Design By Students Of Nekat</div>
        </div>
        <div className="auth-right">
          <div className="auth-logo">
            <div className="icon">Fa</div>
            <span>Finder.<em>Nekat</em></span>
          </div>
          <div className="auth-tabs-bar">
            <button className={`atab ${authMode==="login"?"on":""}`} onClick={()=>{setAuthMode("login");setAErr("");}}>Sign In</button>
            <button className={`atab ${authMode==="register"?"on":""}`} onClick={()=>{setAuthMode("register");setAErr("");}}>Sign Up</button>
          </div>
          <div className="auth-heading">{authMode==="login"?"Sign In":"Create Account"}</div>
          <div className="auth-sub">{authMode==="login"?"Use Your Email or Google":"Join the community"}</div>
          {aErr && <div className="err-box">⚠ {aErr}</div>}
          {authMode==="register" && (
            <div className="fg">
              <label>Full Name</label>
              <input className="fi" placeholder="Nama Lengkap" value={aForm.name} onChange={e=>setAForm(f=>({...f,name:e.target.value}))} />
            </div>
          )}
          <div className="fg">
            <label>EMAIL</label>
            <input className="fi" type="email" placeholder="@gmail.com" value={aForm.email} onChange={e=>setAForm(f=>({...f,email:e.target.value}))} />
          </div>
          <div className="fg">
            <label>PASSWORD</label>
            <input className="fi" type="password" placeholder="••••••••" value={aForm.password} onChange={e=>setAForm(f=>({...f,password:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&doAuth()} />
          </div>
          <button className="btn btn-teal btn-full" style={{marginBottom:12,padding:"13px",fontSize:14}} onClick={doAuth}>
            {authMode==="login"?"Continue →":"Create Account →"}
          </button>
          {authMode==="login" && (
            <>
              <div style={{textAlign:"center",fontSize:12,color:"var(--muted)",margin:"8px 0"}}>OR USE ANOTHER METHOD</div>
              <button className="btn btn-ghost btn-full" style={{padding:"11px"}}>
                <span style={{fontWeight:700,color:"#4285F4"}}>G</span> Sign in with Google
              </button>
              <div className="demo-hint">
                <b>Demo:</b> mahfud@email.com / 123456<br/>
                <b>Admin:</b> admin@finder.com / admin123
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // FORM
  if(view==="form") return (
    <div className="page">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setView("home")}><div className="logo-icon">Fa</div>Finder.<span>Nekat</span></div>
        <div className="nav-right">
          <button className="nav-link" onClick={()=>setView("home")}>Beranda</button>
          {me && <div className="nav-chip"><div className="nav-avatar">{me.initials}</div>{me.name.split(" ")[0]}</div>}
        </div>
      </nav>
      <div className="wrap">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setView("home")}>← Kembali ke Beranda</button>
          <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.3rem",color:"var(--navy)"}}>Buat Laporan Baru</h2>
        </div>
        <div className="form-2col">
          {/* LEFT */}
          <div>
            <div className="type-switch">
              <button className={`type-btn l ${newType==="lost"?"on":""}`} onClick={()=>setNewType("lost")}>🔍 Barang Hilang</button>
              <button className={`type-btn f ${newType==="found"?"on":""}`} onClick={()=>setNewType("found")}>✅ Barang Temuan</button>
            </div>
            <div className="fg">
              <label>NAMA BARANG <span>*</span></label>
              <input className={`fi ${pErrs.title?"err":""}`} placeholder="Contoh: Kunci Motor Honda, Dompet Kulit Coklat"
                value={pForm.title} onChange={e=>setPForm(f=>({...f,title:e.target.value}))} />
              {pErrs.title && <div className="fi-err">{pErrs.title}</div>}
            </div>
            <div className="fg">
              <label>KATEGORI</label>
              <select className="fi fi-sel" value={pForm.cat} onChange={e=>setPForm(f=>({...f,cat:e.target.value}))}>
                {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>CIRI-CIRI SPESIFIK / DESKRIPSI <span>*</span></label>
              <textarea className={`fi fi-ta ${pErrs.desc?"err":""}`}
                placeholder="Contoh: Gantungan kunci boneka beruang, ada goresan di casing belakang, isi dompet KTP an. Budi"
                value={pForm.desc} onChange={e=>setPForm(f=>({...f,desc:e.target.value}))} />
              {pErrs.desc && <div className="fi-err">{pErrs.desc}</div>}
            </div>
            <div className="fg">
              <label>TERAKHIR {newType==="lost"?"TERLIHAT":"DITEMUKAN"} (WAKTU) <span>*</span></label>
              <input type="datetime-local" className={`fi ${pErrs.time?"err":""}`}
                value={pForm.time} onChange={e=>setPForm(f=>({...f,time:e.target.value}))} />
              {pErrs.time && <div className="fi-err">{pErrs.time}</div>}
            </div>
            <div className="fg">
              <label>FOTO BARANG <span>*</span></label>
              <label className={`photo-drop ${pErrs.photo?"err":""}`}>
                {pForm.photoUrl
                  ? <img src={pForm.photoUrl} alt="preview" className="photo-preview" />
                  : <div>
                      <div style={{fontSize:"2rem",marginBottom:8}}>🖼️</div>
                      <div style={{fontSize:14,color:"var(--muted)"}}>Tarik foto ke sini atau <span style={{color:"var(--teal)",fontWeight:700}}>pilih file</span></div>
                      <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Format JPG, PNG, WEBP</div>
                    </div>}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
              </label>
              {pErrs.photo && <div className="fi-err">{pErrs.photo}</div>}
            </div>
          </div>
          {/* RIGHT */}
          <div>
            <div className="fg">
              <label>LOKASI TERAKHIR {newType==="lost"?"TERLIHAT":"DITEMUKAN"} (KLIK PADA PETA)</label>
              <MapComponent location={mapLoc} onLocationChange={setMapLoc} />
              <div className="map-loc-grid" style={{marginTop:10}}>
                {BANDUNG_LOCS.map(l=>(
                  <button key={l.label} className={`loc-btn ${mapLoc.label===l.label?"active":""}`}
                    onClick={()=>setMapLoc(l)}>📍 {l.label}</button>
                ))}
              </div>
              <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12,color:"var(--muted)"}}>
                <div>Nama Wilayah: <b style={{color:"var(--navy)"}}>{mapLoc.label}</b></div>
                <div>Koordinat: <b style={{color:"var(--navy)"}}>{mapLoc.lat.toFixed(4)}, {mapLoc.lng.toFixed(4)}</b></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setView("home")}>Batal</button>
              <button className="btn btn-teal" style={{flex:2}} onClick={submitPost}>
                {newType==="lost"?"🔍 Laporkan Kehilangan":"✅ Laporkan Temuan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // DETAIL
  if(view==="detail" && selPost) {
    const post = posts.find(p=>p.id===selPost.id)||selPost;
    const author = byId(post.userId);
    const isOwner = me?.id===post.userId;
    const isAdmin = me?.role==="admin";
    const avg = post.ratings.length ? post.ratings.reduce((s,r)=>s+r.score,0)/post.ratings.length : 0;
    const dmKey = me ? [me.id,post.userId].sort().join("_") : "";
    const postDMs = dms[dmKey]||[];

    return (
      <div className="page">
        <style>{CSS}</style>
        <nav className="nav">
          <div className="nav-logo" onClick={()=>setView("home")}><div className="logo-icon">Fa</div>Finder.<span>Nekat</span></div>
          <div className="nav-right">
            <button className="nav-link active" onClick={()=>setView("home")}>Beranda</button>
            {me && <button className="nav-link" onClick={()=>setView("chat")}>Inbox</button>}
            {me ? <div className="nav-chip"><div className="nav-avatar">{me.initials}</div>{me.name.split(" ")[0]}</div>
              : <button className="btn btn-teal btn-sm" onClick={()=>setView("auth")}>Masuk</button>}
          </div>
        </nav>
        <div className="wrap">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:"1.5rem"}} onClick={()=>setView("home")}>← Kembali ke Beranda</button>
          <div className="detail-wrap">
            {/* LEFT */}
            <div>
              {post.photo && <img src={post.photo} alt={post.title} className="detail-img"/>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span className={`pc-badge ${post.type}`} style={{margin:0}}>{post.type==="lost"?"HILANG":"TEMUAN"}</span>
                <span className={`status-pill ${post.status}`}>{post.status==="active"?"MASIH DICARI":"SUDAH DITEMUKAN"}</span>
                {isAdmin && <button className="btn btn-danger btn-sm" onClick={()=>deletePost(post.id)}>🗑 Hapus</button>}
              </div>
              <div className="detail-title">{post.title}</div>
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-box-label">📅 WAKTU KEJADIAN</div>
                  <div className="info-box-val">{fmtDate(post.lastSeen)}</div>
                </div>
                <div className="info-box">
                  <div className="info-box-label">📍 LOKASI TERAKHIR</div>
                  <div className="info-box-val">{post.location.label}</div>
                </div>
              </div>
              <hr className="section-divider"/>
              <div className="spec-label">CIRI-CIRI SPESIFIK</div>
              <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:"1rem"}}>{post.description}</p>
              <div className="spec-label">PETA LOKASI</div>
              <MapComponent location={post.location} onLocationChange={() => {}} />
              {post.status==="found" && post.ratings.length>0 && (
                <div className="rating-card">
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <span className="rating-avg-big">{avg.toFixed(1)}</span>
                    <div><Stars n={Math.round(avg)}/><div style={{fontSize:12,color:"var(--muted)"}}>{post.ratings.length} ulasan</div></div>
                  </div>
                  {post.ratings.map((r,i)=>(
                    <div key={i} className="r-item">
                      <Avatar u={byId(r.userId)} size={32}/>
                      <div><Stars n={r.score} size={14}/><p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{r.comment}</p></div>
                    </div>
                  ))}
                </div>
              )}
              {/* Comments */}
              <hr className="section-divider"/>
              <div className="spec-label">KOMENTAR ({post.comments.length})</div>
              {post.comments.map(c=>(
                <div key={c.id} className="disc-msg" style={{marginBottom:10}}>
                  <Avatar u={byId(c.userId)} size={30}/>
                  <div className="disc-bubble other">
                    <div style={{fontSize:11,fontWeight:700,color:"var(--navy)",marginBottom:2}}>{byId(c.userId)?.name}</div>
                    <p>{c.text}</p>
                    <div className="t">{timeAgo(c.time)}</div>
                  </div>
                </div>
              ))}
              {me && (
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <input className="fi" style={{flex:1,padding:"9px 14px"}} placeholder="Tulis komentar..."
                    value={cInputs[post.id]||""} onChange={e=>setCInputs(ci=>({...ci,[post.id]:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&addComment(post.id)} />
                  <button className="btn btn-teal btn-sm" onClick={()=>addComment(post.id)}>Kirim</button>
                </div>
              )}
            </div>
            {/* RIGHT - Discussion */}
            <div>
              <div className="disc-panel">
                <div className="disc-head">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <div className="disc-head-title">Diskusi Posting</div>
                    <div className="disc-range-chip">Jangkauan &lt; 3km (Aktif)</div>
                  </div>
                  <div className="disc-head-sub">Diskusi publik untuk koordinasi penemu di lokasi sekitar.</div>
                </div>
                <div className="disc-msgs">
                  {post.comments.length===0
                    ? <div className="disc-empty">Belum ada obrolan. Tulis informasi untuk membantu pelapor.</div>
                    : post.comments.map(c=>{
                        const isMe=c.userId===me?.id;
                        const u=byId(c.userId);
                        return (
                          <div key={c.id} className={`disc-msg ${isMe?"mine":""}`}>
                            {!isMe && <Avatar u={u} size={28}/>}
                            <div className={`disc-bubble ${isMe?"mine":"other"}`}>
                              {!isMe && <div style={{fontSize:10,fontWeight:700,marginBottom:2}}>{u?.name}</div>}
                              <p>{c.text}</p>
                              <div className="t">{timeAgo(c.time)}</div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
                {me ? (
                  <div className="disc-inp">
                    <input placeholder="Tulis pesan..." value={cInputs[post.id]||""}
                      onChange={e=>setCInputs(ci=>({...ci,[post.id]:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&addComment(post.id)} />
                    <button className="btn btn-teal btn-sm" onClick={()=>addComment(post.id)}>Kirim</button>
                  </div>
                ) : (
                  <div style={{padding:"1rem",textAlign:"center",fontSize:13,color:"var(--muted)"}}>
                    <button className="btn btn-teal btn-sm" onClick={()=>setView("auth")}>Masuk untuk berkomentar</button>
                  </div>
                )}
              </div>
              {me && !isOwner && post.status==="active" && (
                <div style={{marginTop:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--muted)",marginBottom:8}}>Ingin menghubungi pelapor secara privat?</div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Gunakan jalur chat pribadi untuk informasi sensitif seperti detail pengembalian barang atau imbalan.</div>
                  <button className="btn btn-navy btn-full" onClick={()=>{setSelDmUid(post.userId);setChatTab("dm");setView("chat");}}>
                    💬 Chat Pribadi Dengan Pelapor
                  </button>
                </div>
              )}
              {isOwner && post.status==="active" && (
                <div style={{marginTop:16}}>
                  <button className="btn btn-teal btn-full" onClick={()=>markFound(post.id)}>✅ Tandai Barang Ditemukan</button>
                </div>
              )}
              <div style={{marginTop:12,background:"var(--surface2)",borderRadius:"var(--radius-sm)",padding:"10px 14px",fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:8}}>
                <Avatar u={author} size={28}/>
                <div><div style={{fontWeight:700,color:"var(--navy)"}}>{author?.name}</div><div>Pelapor · {timeAgo(post.createdAt)}</div></div>
              </div>
            </div>
          </div>
        </div>
        {/* Rating Modal */}
        {ratingMod && (
          <div className="ov">
            <div className="modal">
              <div className="modal-head"><span className="modal-title">⭐ Beri Rating & Ulasan</span><button className="modal-x" onClick={()=>setRatingMod(null)}>✕</button></div>
              <div className="modal-body">
                <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>Barang berhasil ditemukan! Bagaimana pengalaman Anda?</p>
                <div className="fg">
                  <label>RATING</label>
                  <div style={{display:"flex",gap:8}}>
                    {[1,2,3,4,5].map(s=>(
                      <span key={s} style={{fontSize:28,cursor:"pointer",color:s<=rForm.score?"#F59E0B":"#E5E7EB"}}
                        onClick={()=>setRForm(r=>({...r,score:s}))}>★</span>
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <label>KOMENTAR</label>
                  <textarea className="fi fi-ta" placeholder="Ceritakan pengalamanmu..."
                    value={rForm.comment} onChange={e=>setRForm(r=>({...r,comment:e.target.value}))} />
                </div>
                <button className="btn btn-teal btn-full" onClick={()=>submitRating(ratingMod)}>Kirim Ulasan</button>
              </div>
            </div>
          </div>
        )}
        {notif && <div className={`notif ${notif.type}`}>✓ {notif.msg}</div>}
      </div>
    );
  }

  // CHAT
  if(view==="chat" && me) return (
    <div className="page">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setView("home")}><div className="logo-icon">Fa</div>Finder.<span>Nekat</span></div>
        <div className="nav-right">
          <button className="nav-link" onClick={()=>setView("home")}>Beranda</button>
          <button className="nav-link active">Inbox</button>
          <div className="nav-chip"><div className="nav-avatar">{me.initials}</div>{me.name.split(" ")[0]}</div>
        </div>
      </nav>
      <div className="wrap">
        <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,marginBottom:"1rem",color:"var(--navy)"}}>💬 Inbox</h2>
        <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
          <button className={`ftab ${chatTab==="public"?"active":""}`} onClick={()=>setChatTab("public")}>🌐 Chat Publik</button>
          <button className={`ftab ${chatTab==="dm"?"active":""}`} onClick={()=>setChatTab("dm")}>✉ Pesan Pribadi</button>
        </div>
        {chatTab==="public" && (
          <div style={{maxWidth:680}}>
            <div className="pub-tag">Chat publik · komunitas sekitar Bandung</div>
            <div className="chat-panel" style={{height:"55vh"}}>
              <div className="chat-msgs">
                {pubChat.map(msg=>{
                  const u=byId(msg.userId); const isMe=msg.userId===me.id;
                  return (
                    <div key={msg.id} className={`disc-msg ${isMe?"mine":""}`}>
                      {!isMe && <Avatar u={u} size={30}/>}
                      <div className={`disc-bubble ${isMe?"mine":"other"}`}>
                        {!isMe && <div style={{fontSize:10,fontWeight:700,marginBottom:2}}>{u?.name}</div>}
                        <p>{msg.text}</p>
                        <div className="t">{timeAgo(msg.time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chat-inp">
                <input placeholder="Tulis pesan publik..." value={pubInput}
                  onChange={e=>setPubInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendPub()} />
                <button className="btn btn-teal btn-sm" onClick={sendPub}>Kirim</button>
              </div>
            </div>
          </div>
        )}
        {chatTab==="dm" && (
          <div className="chat-layout">
            <div className="chat-sidebar-panel">
              <div className="cpanel-head">👥 Pengguna</div>
              <div style={{overflowY:"auto",flex:1}}>
                {users.filter(u=>u.id!==me.id).map(u=>{
                  const key=[me.id,u.id].sort().join("_");
                  const msgs=dms[key]||[];
                  const last=msgs[msgs.length-1];
                  return (
                    <div key={u.id} className={`user-item ${selDmUid===u.id?"on":""}`} onClick={()=>setSelDmUid(u.id)}>
                      <div style={{position:"relative"}}>
                        <div className="u-av" style={{background:u.role==="admin"?"var(--orange)":"var(--teal)"}}>{u.initials}</div>
                        <div className={`u-dot ${u.online?"on":"off"}`}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="u-name">{u.name}</div>
                        {last ? <div className="u-last">{last.text}</div>
                          : <div style={{fontSize:11,color:"var(--muted)"}}>Belum ada pesan</div>}
                      </div>
                      {u.role==="admin" && <span className="admin-tag">ADM</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="chat-panel">
              {selDmUid ? (() => {
                const partner=byId(selDmUid);
                const key=[me.id,selDmUid].sort().join("_");
                const msgs=dms[key]||[];
                return (
                  <>
                    <div className="cpanel-head" style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{position:"relative"}}>
                        <div className="u-av" size={32}>{partner?.initials}</div>
                        <div className={`u-dot ${partner?.online?"on":"off"}`}/>
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{partner?.name}</div>
                        <div style={{fontSize:11,color:partner?.online?"var(--teal)":"var(--muted)"}}>{partner?.online?"● Online":"● Offline"}</div>
                      </div>
                    </div>
                    <div className="chat-msgs">
                      {msgs.length===0 && <div className="empty"><div className="ei">💬</div><p>Mulai percakapan dengan {partner?.name}</p></div>}
                      {msgs.map(msg=>{
                        const isMe=msg.from===me.id;
                        return (
                          <div key={msg.id} className={`disc-msg ${isMe?"mine":""}`}>
                            <div className={`disc-bubble ${isMe?"mine":"other"}`}>
                              <p>{msg.text}</p>
                              <div className="t">{timeAgo(msg.time)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chat-inp">
                      <input placeholder={`Pesan ke ${partner?.name}...`} value={dmInput}
                        onChange={e=>setDmInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDM(selDmUid)} />
                      <button className="btn btn-teal btn-sm" onClick={()=>sendDM(selDmUid)}>Kirim</button>
                    </div>
                  </>
                );
              })()
              : <div className="empty" style={{justifyContent:"center",display:"flex",flexDirection:"column",height:"100%",alignItems:"center"}}>
                  <div className="ei">💬</div><p>Pilih pengguna untuk memulai chat</p>
                </div>
              }
            </div>
          </div>
        )}
      </div>
      {notif && <div className={`notif ${notif.type}`}>✓ {notif.msg}</div>}
    </div>
  );

  // FOUND ITEMS PAGE
  if(view==="found") return (
    <div className="page">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setView("home")}><div className="logo-icon">Fa</div>Finder.<span>Nekat</span></div>
        <div className="nav-right">
          <button className="nav-link" onClick={()=>setView("home")}>Beranda</button>
          {me && <button className="nav-link" onClick={()=>setView("chat")}>Inbox</button>}
          {me ? <div className="nav-chip" style={{cursor:"pointer"}} onClick={doLogout}><div className="nav-avatar">{me.initials}</div>{me.name.split(" ")[0]}</div>
            : <button className="btn btn-teal btn-sm" onClick={()=>setView("auth")}>Masuk</button>}
        </div>
      </nav>
      <div className="wrap">
        <button className="btn btn-ghost btn-sm" style={{marginBottom:"1rem"}} onClick={()=>setView("home")}>← Beranda</button>
        <h2 style={{fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:"1.4rem",color:"var(--navy)",marginBottom:8}}>✅ Barang Ditemukan</h2>
        <div className="found-badge">🎉 {foundPosts.length} barang berhasil kembali ke pemiliknya</div>
        {foundPosts.length===0
          ? <div className="empty"><div className="ei">🎁</div><p>Belum ada barang yang ditemukan</p></div>
          : <div className="posts-grid">
              {foundPosts.map(p=>(
                <div key={p.id} className="post-card" onClick={()=>{setSelPost(p);setView("detail");}}>
                  {p.photo ? <img src={p.photo} alt={p.title} className="pc-img"/> : <div className="pc-img-ph">{CAT_ICON[p.category]||"📦"}<span>{p.category}</span></div>}
                  <span className="pc-badge done" style={{margin:"12px 12px 0"}}>✅ SELESAI</span>
                  <div className="pc-body">
                    <div className="pc-title">{p.title}</div>
                    <div className="pc-desc">{p.description}</div>
                    {p.ratings.length>0 && (
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <Stars n={Math.round(p.ratings.reduce((s,r)=>s+r.score,0)/p.ratings.length)} size={13}/>
                        <span style={{fontSize:11,color:"var(--muted)"}}>{p.ratings.length} ulasan</span>
                      </div>
                    )}
                    <div className="pc-meta">
                      <span>📍 {p.location.label}</span>
                      <span>📅 {timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      {notif && <div className={`notif ${notif.type}`}>✓ {notif.msg}</div>}
    </div>
  );

  // HOME
  return (
    <div className="page">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-logo"><div className="logo-icon">Fa</div>Finder.<span>Nekat</span></div>
        <div className="nav-right">
          <button className="nav-link active">Beranda</button>
          {me && <button className="nav-link" onClick={()=>setView("chat")}>Inbox</button>}
          {me
            ? <div className="nav-chip" style={{cursor:"pointer"}} onClick={doLogout}><div className="nav-avatar">{me.initials}</div>{me.name.split(" ")[0]}{me.role==="admin"&&<span style={{fontSize:9,background:"var(--orange)",padding:"1px 5px",borderRadius:4}}>ADMIN</span>}</div>
            : <button className="btn btn-teal btn-sm" onClick={()=>setView("auth")}>Masuk / Daftar</button>
          }
        </div>
      </nav>

      <div className="wrap">
        {/* HERO */}
        <div className="hero">
          <div className="two-col" style={{alignItems:"start"}}>
            <div>
              <div className="community-chip">Komunitas aktif • Bandung & sekitarnya</div>
              <h1>Bantu sesama<br/>temukan barang<br/><span className="accent">yang hilang</span></h1>
              <p>Platform pelaporan barang hilang & temuan berbasis komunitas. Gratis, cepat, dan mudah digunakan semua kalangan.</p>
              <div className="hero-btns">
                <button className="btn-hero-lost" onClick={()=>{ if(!me)return setView("auth"); setNewType("lost"); setView("form"); }}>
                  <div className="btn-icon">🔍</div>
                  <div style={{textAlign:"left"}}><div>Laporkan Kehilangan</div><div style={{fontSize:11,fontWeight:400,opacity:.8}}>barang saya hilang</div></div>
                </button>
                <button className="btn-hero-found" onClick={()=>{ if(!me)return setView("auth"); setNewType("found"); setView("form"); }}>
                  <div className="btn-icon">🛡️</div>
                  <div style={{textAlign:"left"}}><div>Laporkan Temuan</div><div style={{fontSize:11,fontWeight:400,opacity:.8}}>saya menemukan barang</div></div>
                </button>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-title">Aktivitas Terbaru</div>
              {recentActs.length===0
                ? <div style={{color:"var(--muted)",fontSize:13}}>Belum ada aktivitas.</div>
                : recentActs.map(p=>(
                    <div key={p.id} className="activity-item">
                      <div className={`act-dot ${p.status==="found"?"done":p.type}`}/>
                      <div>
                        <div className="act-text"><b>{p.title}</b> {p.status==="found"?"sudah kembali":p.type==="lost"?"dilaporkan hilang":"ditemukan"}</div>
                        <div className="act-time">{timeAgo(p.createdAt)} · {p.location.label}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-card">
          <div className="stat"><div className="num">{posts.length}</div><div className="lbl"><span className="lbl-icon">🟡</span>Total laporan</div></div>
          <div className="stat"><div className="num">{lostCount}</div><div className="lbl"><span className="lbl-icon">🔍</span>Masih dicari</div></div>
          <div className="stat"><div className="num">{foundCount}</div><div className="lbl"><span className="lbl-icon">🌟</span>Berhasil ditemukan</div></div>
          <div className="stat"><div className="num">{onlineCount}</div><div className="lbl"><span className="lbl-icon">👥</span>Anggota aktif</div></div>
        </div>

        {/* LAPORAN TERBARU */}
        <div className="section-head">
          <div>
            <div className="section-title">Laporan Terbaru</div>
            <div className="section-sub">Diperbarui otomatis dari database</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>setView("found")}>✅ Lihat yang Ditemukan →</button>
        </div>

        {/* FILTER TABS */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",flexWrap:"wrap"}}>
          <div className="filter-tabs">
            {[["all","Semua"],["lost","Hilang"],["found","Temuan"],["done","Selesai"]].map(([v,l])=>(
              <button key={v} className={`ftab ${ftab===v?"active":""}`} onClick={()=>setFtab(v)}>{l}</button>
            ))}
          </div>
          <div className="search-wrap" style={{maxWidth:280}}>
            <span className="search-icon">🔍</span>
            <input placeholder="Cari laporan..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="filter-sel" value={filt} onChange={e=>setFilt(e.target.value)}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {visiblePosts.length===0
          ? <div className="empty"><div className="ei">🔍</div><p>Tidak ada laporan yang cocok</p></div>
          : <div className="posts-grid">
              {visiblePosts.map(p=>(
                <div key={p.id} className="post-card" onClick={()=>{setSelPost(p);setView("detail");}}>
                  {p.photo ? <img src={p.photo} alt={p.title} className="pc-img" onError={e=>{e.target.onerror=null;e.target.style.display="none";}}/>
                    : <div className="pc-img-ph">{CAT_ICON[p.category]||"📦"}<span>{p.category}</span></div>}
                  <span className={`pc-badge ${p.type}`}>{p.type==="lost"?"HILANG":"TEMUAN"}</span>
                  <div className="pc-body">
                    <div className="pc-title">{p.title}</div>
                    <div className="pc-desc">{p.description}</div>
                    <div className="pc-meta">
                      <span>📍 {p.location.label}</span>
                      <span>📅 {new Date(p.lastSeen).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      {notif && <div className={`notif ${notif.type}`}>✓ {notif.msg}</div>}
    </div>
  );
}
