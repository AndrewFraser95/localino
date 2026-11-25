(function(){
'use strict';

/* ---------- Menu data (prices in pence) ---------- */
// Built-in starting menu. When the menu is saved to Firebase, the cloud copy takes over.
var MENU_ROWS=[ // [category, id, name, price, vegetarian]
 ['pizza','margherita','Margherita',800,1],['pizza','funghi','Al Funghi',900,1],['pizza','vegetariana','Vegetariana',1125,1],
 ['pizza','piccante','La Piccante Siciliana',1125,0],['pizza','calabrese','Calabrese',1125,0],['pizza','affumicata','Affumicata',1125,0],
 ['pizza','romana','Romana',1125,0],['pizza','napoletana','Napoletana',1125,0],['pizza','itria',"La Valle d'Itria",1125,0],
 ['pizza','rustica','La Rustica',1200,0],['pizza','capricciosissima','Capricciosissima',1225,0],
 ['calz','panz','Classic Panzerotto',700,1],['calz','panzspicy','Spicy Panzerotto',800,0],['calz','calzmarg','Baked Calzone Margherita',825,1],['calz','calz','Baked Calzone',1000,0],
 ['spec','focaccia','Focaccia',700,1],['spec','marinara','Marinara',700,0],
 ['dessert','nutella','Nutella Pizza',550,1],['dessert','tiramisu','Tiramisù',550,1],['dessert','cannoli','Cannoli Siciliani',550,1],
 ['drink','limonata','Limonata',200,0],['drink','aranciata','Aranciata',200,0],['drink','chinotto','Chinotto',200,0],['drink','rossa','Aranciata Rossa',250,0]
];
var DEFAULT_MENU={
 categories:[
  {id:'pizza',tab:'Pizzas',name:'Pizzas',kitchen:true,extras:true,quick:true},
  {id:'calz',tab:'Calzones',name:'Calzones & panzerotti',kitchen:true,extras:true,quick:true},
  {id:'spec',tab:'Specialities',name:'Italian specialities',kitchen:true,extras:true,quick:true},
  {id:'dessert',tab:'Desserts',name:'Desserts',kitchen:true,extras:false,quick:false},
  {id:'drink',tab:'Drinks',name:'Italian soft drinks',kitchen:false,extras:false,quick:false}
 ],
 items:MENU_ROWS.map(function(r){return {id:r[1],cat:r[0],name:r[2],price:r[3],veg:!!r[4],avail:true}}),
 extras:[
  ['x-mozz','Extra mozzarella',150],['x-mush','Mushrooms',100],['x-olives','Olives',100],
  ['x-sdt','Sun-dried tomatoes',100],['x-art','Artichokes',100],['x-pep','Roasted peppers',100],
  ['x-onion','Red onion',100],['x-pepperoni','Spicy pepperoni',150],['x-sausage','Sicilian sausage',150],
  ['x-nduja',"'Nduja",150],['x-ham','Roast ham',150],['x-pancetta','Pancetta',150]
 ].map(function(r){return {id:r[0],name:r[1],price:r[2]}})
};
var QUICK=['Well done','Lightly baked','Cut in 8',"Don't cut"];
var KEY='till.v1';

var ITEM={}, EX={}, CATOF={}, CATS=[], EXTRAS=[];
var IDRE=/^[\w-]{1,40}$/;   // ids are written into HTML attributes, so only plain tokens are accepted
function validMenu(m){
  if(!m||!Array.isArray(m.categories)||!Array.isArray(m.items)||!Array.isArray(m.extras)||!m.categories.length) return false;
  var cats={}, ids={}, xs={}, i;
  for(i=0;i<m.categories.length;i++){var c=m.categories[i]; if(!c||typeof c.id!=='string'||!IDRE.test(c.id)||typeof c.tab!=='string'||cats[c.id]) return false; cats[c.id]=1;}
  for(i=0;i<m.items.length;i++){var it=m.items[i]; if(!it||typeof it.id!=='string'||!IDRE.test(it.id)||!cats[it.cat]||typeof it.name!=='string'||!it.name.trim()||typeof it.price!=='number'||!isFinite(it.price)||it.price<0||ids[it.id]) return false; ids[it.id]=1;}
  for(i=0;i<m.extras.length;i++){var e=m.extras[i]; if(!e||typeof e.id!=='string'||!IDRE.test(e.id)||typeof e.name!=='string'||!e.name.trim()||typeof e.price!=='number'||!isFinite(e.price)||e.price<0||xs[e.id]) return false; xs[e.id]=1;}
  return true;
}
function buildMenu(m){
  ITEM={};EX={};CATOF={};
  CATS=m.categories.map(function(c){
    var cat={id:c.id,tab:String(c.tab),name:String(c.name||c.tab),kitchen:c.kitchen!==false,extras:!!c.extras,quick:!!c.quick,items:[]};
    CATOF[c.id]=cat; return cat;
  });
  m.items.forEach(function(i){
    var cat=CATOF[i.cat]; if(!cat) return;
    var it={id:i.id,name:String(i.name).slice(0,60),price:Math.round(i.price),veg:!!i.veg,avail:i.avail!==false,cat:i.cat};
    ITEM[it.id]=it; cat.items.push(it);
  });
  EXTRAS=m.extras.map(function(e){var x={id:e.id,name:String(e.name).slice(0,60),price:Math.round(e.price)}; EX[x.id]=x; return x;});
  if(typeof S==='object'&&S&&!CATOF[S.tab]&&CATS.length) S.tab=CATS[0].id;
}
function menuObj(){
  var items=[]; CATS.forEach(function(c){c.items.forEach(function(it){items.push({id:it.id,cat:c.id,name:it.name,price:it.price,veg:it.veg,avail:it.avail})})});
  return {
    categories:CATS.map(function(c){return {id:c.id,tab:c.tab,name:c.name,kitchen:c.kitchen,extras:c.extras,quick:c.quick}}),
    items:items,
    extras:EXTRAS.map(function(e){return {id:e.id,name:e.name,price:e.price}})
  };
}
buildMenu(DEFAULT_MENU);

/* ---------- Helpers ---------- */
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var money=function(p){return (p<0?'-':'')+'£'+(Math.abs(p)/100).toFixed(2)};
var cap=function(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s};
var todayStr=function(){return new Date().toLocaleDateString('en-CA')};
var desc=function(){return ''}; // ingredients are not shown; staff know the menu

/* ---------- State ---------- */
var S={tab:'pizza',n:1,label:'',lines:[],sheet:null,log:[],day:todayStr(),print:{auto:false,width:80,name:''},lastExport:0,lastBackup:0,menuVersion:0,menuDirty:false,awake:true,dev:'',tabName:'',pushed:{},delQ:[],editQ:[]};

var DBN='localino-till', IDB=null, ORDKEYS={}, LSHAD=false, RESYNC=false, saveTimer=null, ST={idb:false,persisted:null,err:''};
function ensureDev(){
  if(S.dev) return;
  var a='abcdefghijkmnpqrstuvwxyz23456789', r='';
  for(var i=0;i<10;i++) r+=a.charAt(Math.floor(Math.random()*a.length));
  S.dev=r;
}
function oid(o){return o.t+'-'+(o.dev||S.dev)}
function fin(v){return typeof v==='number'&&isFinite(v)}
// Orders read from storage, a backup file or the cloud are rebuilt field by field, so a damaged or
// hostile record (any tablet-level client can add cloud orders) cannot break the screens or inject HTML.
function cleanOrder(o){
  if(!o||typeof o!=='object'||!fin(o.t)||!fin(o.total)||!Array.isArray(o.lines)) return null;
  var c={t:o.t,total:Math.round(o.total),how:o.how==='cash'?'cash':'card',given:fin(o.given)?Math.round(o.given):null,
    lines:o.lines.filter(function(l){return l&&typeof l==='object'}).map(function(l){
      return {q:fin(l.q)?Math.max(0,Math.floor(l.q)):0,name:String(l.name==null?'':l.name).slice(0,80),
        mods:(Array.isArray(l.mods)?l.mods:[]).map(function(m){return String(m).slice(0,80)}),amt:fin(l.amt)?Math.round(l.amt):0};
    })};
  if(fin(o.n)) c.n=Math.floor(o.n);
  if(typeof o.dev==='string'&&/^[A-Za-z0-9]{1,40}$/.test(o.dev)) c.dev=o.dev;
  if(typeof o.tab==='string'&&o.tab) c.tab=o.tab.slice(0,40);
  if(typeof o.label==='string'&&o.label) c.label=o.label.slice(0,60);
  return c;
}
function cleanOrders(a){return a.map(cleanOrder).filter(Boolean)}
function ono(o){return o.n==null?'?':o.n}
function applyLegacyMenu(d){
  if(d.items) Object.keys(d.items).forEach(function(id){
    var it=ITEM[id], v=d.items[id]; if(!it||!v) return;
    if(typeof v.name==='string'&&v.name.trim()) it.name=v.name;
    if(typeof v.price==='number'&&isFinite(v.price)&&v.price>=0) it.price=Math.round(v.price);
    if(typeof v.avail==='boolean') it.avail=v.avail;
  });
  if(d.extras) Object.keys(d.extras).forEach(function(id){
    var e=EX[id], v=d.extras[id]; if(!e||!v) return;
    if(typeof v.name==='string'&&v.name.trim()) e.name=v.name;
    if(typeof v.price==='number'&&isFinite(v.price)&&v.price>=0) e.price=Math.round(v.price);
  });
}
function restoreMenu(d){
  if(d.menu&&validMenu(d.menu)) buildMenu(d.menu);
  else if(d.items||d.extras){ buildMenu(DEFAULT_MENU); applyLegacyMenu(d); }   // older saves kept only price and name edits
}
function pruneLines(){
  S.lines=S.lines.filter(function(l){return ITEM[l.id]});
  S.lines.forEach(function(l){l.add=l.add.filter(function(x){return EX[x]})});
}
function applyState(d){
  restoreMenu(d);
  if(typeof d.menuVersion==='number') S.menuVersion=d.menuVersion;
  if(typeof d.menuDirty==='boolean') S.menuDirty=d.menuDirty;
  if(typeof d.awake==='boolean') S.awake=d.awake;
  if(typeof d.dev==='string'&&/^[A-Za-z0-9]{4,40}$/.test(d.dev)) S.dev=d.dev;
  if(typeof d.tabName==='string') S.tabName=d.tabName.slice(0,40);
  if(d.pushed&&typeof d.pushed==='object'&&!Array.isArray(d.pushed)) Object.keys(d.pushed).forEach(function(k){ if(d.pushed[k]) S.pushed[k]=1; });
  if(Array.isArray(d.delQ)) d.delQ.forEach(function(k){ if(typeof k==='string'&&S.delQ.indexOf(k)<0) S.delQ.push(k); });
  if(Array.isArray(d.editQ)) d.editQ.forEach(function(k){ if(typeof k==='string'&&S.editQ.indexOf(k)<0) S.editQ.push(k); });
  if(typeof d.n==='number'&&d.n>=1) S.n=Math.floor(d.n);
  if(typeof d.label==='string') S.label=d.label.slice(0,40);
  if(Array.isArray(d.lines)) S.lines=d.lines.filter(function(l){return l&&ITEM[l.id]&&l.qty>=1}).map(function(l){
    return {id:l.id,qty:Math.floor(l.qty),off:Array.isArray(l.off)?l.off:[],add:(Array.isArray(l.add)?l.add:[]).filter(function(x){return EX[x]}),notes:Array.isArray(l.notes)?l.notes:[],text:typeof l.text==='string'?l.text:''};
  });
  if(typeof d.day==='string') S.day=d.day;
  if(typeof d.lastExport==='number') S.lastExport=d.lastExport;
  if(typeof d.lastBackup==='number') S.lastBackup=d.lastBackup;
  if(d.print&&typeof d.print==='object') S.print={auto:!!d.print.auto,width:d.print.width===58?58:80,name:String(d.print.name||'')};
}
function stateObj(){
  var items={}; Object.keys(ITEM).forEach(function(id){var it=ITEM[id]; items[id]={name:it.name,price:it.price,avail:it.avail}});
  var extras={}; Object.keys(EX).forEach(function(id){var e=EX[id]; extras[id]={name:e.name,price:e.price}});
  return {items:items,extras:extras,n:S.n,label:S.label,lines:S.lines,day:S.day,print:S.print,lastExport:S.lastExport,lastBackup:S.lastBackup,menu:menuObj(),menuVersion:S.menuVersion,menuDirty:S.menuDirty,awake:S.awake,dev:S.dev,tabName:S.tabName,pushed:S.pushed,delQ:S.delQ,editQ:S.editQ,savedAt:Date.now()};
}
// Every order is stored twice: IndexedDB (primary) and a localStorage copy. On start they are merged, so losing one does not lose orders.
function load(){
  var d=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  LSHAD=!!d;
  if(d){
    try{applyState(d)}catch(e){}
    if(Array.isArray(d.log)) S.log=cleanOrders(d.log);
  }
  ensureDev();
  ensureTakings();
}
function persistNow(){
  clearTimeout(saveTimer); saveTimer=null;
  var st=stateObj();
  try{ localStorage.setItem(KEY,JSON.stringify(Object.assign({},st,{log:S.log}))); }
  catch(e){
    try{ var cut=daysAgoStart(6); localStorage.setItem(KEY,JSON.stringify(Object.assign({},st,{log:S.log.filter(function(o){return o.t>=cut})}))); }catch(e2){}
  }
  if(IDB){
    try{ var tx=IDB.transaction('meta','readwrite'); tx.objectStore('meta').put(st,'state'); tx.onerror=function(){ST.err='settings write failed'}; }
    catch(e3){ST.err=String((e3&&e3.message)||e3)}
  }
}
function save(){ if(!saveTimer) saveTimer=setTimeout(persistNow,250); }
function syncOrders(){
  if(!IDB) return;
  try{
    var keys={}, tx=IDB.transaction('orders','readwrite'), os=tx.objectStore('orders');
    if(RESYNC){ os.clear(); ORDKEYS={}; RESYNC=false; }   // an earlier write failed, so rewrite the lot
    S.log.forEach(function(o){keys[o.t]=1; if(!ORDKEYS[o.t]) os.put(o);});
    Object.keys(ORDKEYS).forEach(function(k){ if(!keys[k]) os.delete(+k); });
    ORDKEYS=keys;   // set straight away, so a void right after a sale still removes the stored copy
    tx.onerror=tx.onabort=function(){ST.err='order write failed'; RESYNC=true};
  }catch(e){ST.err=String((e&&e.message)||e)}
}
function idbOpen(){
  return new Promise(function(res,rej){
    try{
      var r=indexedDB.open(DBN,1);
      r.onupgradeneeded=function(){var db=r.result; db.createObjectStore('meta'); db.createObjectStore('orders',{keyPath:'t'});};
      r.onsuccess=function(){res(r.result)};
      r.onerror=function(){rej(r.error)};
      r.onblocked=function(){rej(new Error('database blocked'))};
    }catch(e){rej(e)}
  });
}
function idbRead(store,fn){
  return new Promise(function(res,rej){
    var tx=IDB.transaction(store,'readonly'), r=fn(tx.objectStore(store));
    tx.oncomplete=function(){res(r.result)};
    tx.onerror=function(){rej(tx.error)};
  });
}
async function loadIDB(){
  try{
    IDB=await idbOpen(); ST.idb=true;
    IDB.onversionchange=function(){try{IDB.close()}catch(e){} IDB=null; ST.idb=false;};
    var ids=await idbRead('meta',function(s){return s.get('state')});
    var ords=cleanOrders((await idbRead('orders',function(s){return s.getAll()}))||[]);
    ORDKEYS={}; ords.forEach(function(o){ORDKEYS[o.t]=1});
    var restored=false;
    if(!LSHAD&&ids){ applyState(ids); restored=true; }      // browser copy was wiped, database survived
    ensureDev();
    var have={}; S.log.forEach(function(o){have[o.t]=1});
    var added=0;
    ords.forEach(function(o){ if(!have[o.t]){S.log.push(o); added++;} });
    S.log.sort(function(a,b){return a.t-b.t});
    ensureTakings();
    syncOrders(); persistNow();
    $('#label').value=S.label;
    renderAll(); if(S.sheet==='history') renderHistory();
    if(added>0||restored) toast('Recovered saved data'+(S.log.length?' ('+S.log.length+' orders)':''));
  }catch(e){ IDB=null; ST.idb=false; ST.err=String((e&&e.message)||e); }
  requestPersist(); updateBanner();
}
function requestPersist(){
  try{
    if(!(navigator.storage&&navigator.storage.persist&&navigator.storage.persisted)) return;
    navigator.storage.persisted().then(function(p){
      if(p){ST.persisted=true; return;}
      return navigator.storage.persist().then(function(g){ST.persisted=!!g});
    }).catch(function(){});
  }catch(e){}
}
function prunePushed(){
  var keep={}; S.log.forEach(function(o){keep[oid(o)]=1});
  Object.keys(S.pushed).forEach(function(k){ if(!keep[k]) delete S.pushed[k]; });
}
function ensureTakings(){
  // a new day restarts ticket numbering; orders are kept for 30 days
  var t=todayStr();
  if(S.day!==t){S.day=t;S.n=1;}
  var cut=daysAgoStart(RETAIN_DAYS-1), before=S.log.length;
  S.log=S.log.filter(function(o){return o.t>=cut});
  if(S.log.length!==before){syncOrders(); save();}
  prunePushed();
}

/* ---------- Order maths ---------- */
function sig(l){
  return [l.id,l.off.slice().sort().join('|'),l.add.slice().sort().join('|'),l.notes.slice().sort().join('|'),(l.text||'').trim().toLowerCase()].join('~');
}
function lineUnit(l){
  var it=ITEM[l.id];
  return it.price+l.add.reduce(function(s,x){return s+(EX[x]?EX[x].price:0)},0);
}
function total(){return S.lines.reduce(function(s,l){return s+lineUnit(l)*l.qty},0)}
function count(){return S.lines.reduce(function(s,l){return s+l.qty},0)}
function qtyOf(id){return S.lines.reduce(function(s,l){return s+(l.id===id?l.qty:0)},0)}
function catQty(cid){return S.lines.reduce(function(s,l){return s+(ITEM[l.id].cat===cid?l.qty:0)},0)}
function mods(l){
  var out=[];
  l.off.forEach(function(v){out.push({k:'off',t:'No '+v})});
  l.add.forEach(function(x){var e=EX[x]; if(e) out.push({k:'add',t:'+ '+e.name,p:e.price})});
  l.notes.forEach(function(n){out.push({k:'note',t:n})});
  if(l.text) out.push({k:'note',t:l.text});
  return out;
}
function mergeLines(){
  var seen={}, out=[];
  S.lines.forEach(function(l){
    var k=sig(l);
    if(seen[k]) seen[k].qty+=l.qty; else {seen[k]=l; out.push(l);}
  });
  S.lines=out;
}
function addItem(id){
  var it=ITEM[id]; if(!it||!it.avail) return;
  var plain={id:id,qty:1,off:[],add:[],notes:[],text:''}, k=sig(plain), found=null;
  S.lines.forEach(function(l){if(!found&&sig(l)===k) found=l});
  var isNew=!found;
  if(found) found.qty++; else S.lines.push(plain);
  renderItems(); renderTabs(); renderLines(); renderTotals(); save();
  if(isNew){var ul=$('#lines'); ul.scrollTop=ul.scrollHeight;}
}

function decItem(id){
  var k=sig({id:id,off:[],add:[],notes:[],text:''}), plain=-1, last=-1;
  S.lines.forEach(function(l,i){ if(l.id===id){ last=i; if(sig(l)===k) plain=i; } });
  var j=plain>=0?plain:last; if(j<0) return;
  S.lines[j].qty--; if(S.lines[j].qty<1) S.lines.splice(j,1);
  renderItems(); renderTabs(); renderLines(); renderTotals(); save();
}

/* ---------- Rendering ---------- */
function renderTabs(){
  $('#tabs').innerHTML=CATS.map(function(c){
    var n=catQty(c.id);
    return '<button class="tab" type="button" role="tab" data-cat="'+c.id+'" aria-selected="'+(c.id===S.tab)+'" data-act="tab" data-id="'+c.id+'">'+esc(c.tab)+(n?'<span class="tcount">'+n+'</span>':'')+'</button>';
  }).join('');
}
function renderItems(){
  var c=CATOF[S.tab]||CATS[0];
  $('#items').innerHTML=c.items.map(function(it){
    var q=qtyOf(it.id);
    var tight=Math.max.apply(null,it.name.split(' ').map(function(w){return w.length}))>11;
    return '<div class="cardwrap'+(q?' has':'')+'" data-cat="'+c.id+'">'+
      '<button class="item" type="button" data-act="add" data-id="'+it.id+'"'+(it.avail?'':' disabled')+'>'+
        '<span class="iname'+(tight?' tight':'')+'">'+esc(it.name)+(it.veg?'<span class="veg" title="Vegetarian">V</span>':'')+'</span>'+
        '<span class="iprice">'+(it.avail?money(it.price):'Sold out')+'</span>'+
      '</button>'+
      (q?'<div class="qstep"><button type="button" data-act="idec" data-id="'+it.id+'" aria-label="Remove one '+esc(it.name)+'">−</button><span>'+q+'</span><button type="button" data-act="add" data-id="'+it.id+'" aria-label="Add one '+esc(it.name)+'"'+(it.avail?'':' disabled')+'>+</button></div>':'')+
    '</div>';
  }).join('');
}
function renderLines(){
  var ul=$('#lines');
  if(!S.lines.length){
    ul.innerHTML='<li class="empty"><b>No items yet</b><span>Tap a menu button to add it. Use Customise on a line to add extras or a note.</span></li>';
    return;
  }
  ul.innerHTML=S.lines.map(function(l,i){
    var it=ITEM[l.id];
    var m=mods(l).map(function(x){
      return '<li class="m '+x.k+'">'+esc(x.t)+(x.p?' <span class="mp">+'+money(x.p)+'</span>':'')+'</li>';
    }).join('');
    return '<li class="line" data-i="'+i+'">'+
      '<div class="lhead"><span class="lq">'+l.qty+'×</span><span class="lname">'+esc(it.name)+'</span><span class="lprice">'+money(lineUnit(l)*l.qty)+'</span></div>'+
      (m?'<ul class="mods">'+m+'</ul>':'')+
      '<div class="lact">'+
        '<div class="step"><button type="button" data-act="dec" aria-label="Remove one">−</button><span>'+l.qty+'</span><button type="button" data-act="inc" aria-label="Add one">+</button></div>'+
        '<button class="btn sm" type="button" data-act="cust">Customise</button>'+
        '<button class="btn sm ghost danger grow" type="button" data-act="del">Remove</button>'+
      '</div></li>';
  }).join('');
}
function renderTotals(){
  var t=total(), n=count();
  $('#total').textContent=money(t);
  $('#mtotal').textContent=money(t);
  $('#onum').textContent=S.n;
  $('#hcount').textContent=todays().length;
  $('#mcount').textContent=n?('View order · '+n+(n===1?' item':' items')):'Order is empty';
  $('#btn-pay').disabled=!n;
  $('#btn-ticket').disabled=!n;
}
function renderAll(){renderTabs();renderItems();renderLines();renderTotals();updateBanner();updateMenuBar()}

/* ---------- Sheets ---------- */
function paintSheet(html,cls){
  var sh=$('#sheet'), sb=sh.querySelector('.sbody'), top=sb?sb.scrollTop:0;
  sh.className='sheet '+(cls||'');
  sh.innerHTML=html;
  var nb=sh.querySelector('.sbody'); if(nb) nb.scrollTop=top;
}
function openSheet(kind){
  S.sheet=kind; $('#scrim').hidden=false;
  try{$('#sheet').focus({preventScroll:true})}catch(e){}
}
function closeSheet(){
  S.sheet=null; $('#scrim').hidden=true; $('#sheet').innerHTML='';
}
function toast(msg){
  var el=$('#toast'); el.textContent=msg; el.hidden=false;
  clearTimeout(toast.t); toast.t=setTimeout(function(){el.hidden=true},3400);
}
function arm(btn,label,fn){
  if(btn.dataset.tm){
    clearTimeout(+btn.dataset.tm); btn.textContent=btn.dataset.orig; btn.classList.remove('armed'); delete btn.dataset.tm;
    fn(); return;
  }
  btn.dataset.orig=btn.textContent; btn.textContent=label; btn.classList.add('armed');
  btn.dataset.tm=String(setTimeout(function(){
    btn.textContent=btn.dataset.orig; btn.classList.remove('armed'); delete btn.dataset.tm;
  },3000));
}

/* ---- Customise ---- */
var C=null;
function toggle(arr,v){var k=arr.indexOf(v); if(k>=0) arr.splice(k,1); else arr.push(v)}
function openCust(i){
  var l=S.lines[i]; if(!l) return;
  C={i:i,off:l.off.slice(),add:l.add.slice(),notes:l.notes.slice(),text:l.text||''};
  renderCust(); openSheet('cust');
}
function renderCust(){
  var l=S.lines[C.i], it=ITEM[l.id], cat=CATOF[it.cat], h='';
  var unit=it.price+C.add.reduce(function(s,x){return s+(EX[x]?EX[x].price:0)},0);
  if(cat.extras){
    h+='<div><h3>Add extra</h3><div class="chips">'+EXTRAS.map(function(e){
      var on=C.add.indexOf(e.id)>=0;
      return '<button class="chip" type="button" data-act="cadd" data-v="'+e.id+'" aria-pressed="'+on+'">'+esc(e.name)+' <i>+'+money(e.price)+'</i></button>';
    }).join('')+'</div></div>';
  }
  if(cat.quick){
    h+='<div><h3>Cooking</h3><div class="chips">'+QUICK.map(function(q){
      var on=C.notes.indexOf(q)>=0;
      return '<button class="chip" type="button" data-act="cnote" data-v="'+esc(q)+'" aria-pressed="'+on+'">'+esc(q)+'</button>';
    }).join('')+'</div></div>';
  }
  h+='<div><h3>Note for the chef</h3><input class="in" id="ctext" placeholder="e.g. no olives, no onion" maxlength="60" autocomplete="off" value="'+esc(C.text)+'"></div>';
  paintSheet(
    '<div class="shead"><h2>'+esc(it.name)+'</h2>'+(l.qty>1?'<p>Changing 1 of '+l.qty+'</p>':'')+'</div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot"><span class="num grow">'+money(unit)+'</span>'+
      '<button class="btn" type="button" data-act="close">Cancel</button>'+
      '<button class="btn primary" type="button" data-act="cdone">Done</button></div>'
  );
}
function applyCust(){
  var l=S.lines[C.i]; if(!l) return;
  var m={off:C.off,add:C.add,notes:C.notes,text:(C.text||'').trim()};
  if(l.qty>1){ l.qty--; S.lines.splice(C.i+1,0,{id:l.id,qty:1,off:m.off,add:m.add,notes:m.notes,text:m.text}); }
  else { l.off=m.off; l.add=m.add; l.notes=m.notes; l.text=m.text; }
  mergeLines();
}

/* ---- Chef ticket ---- */
function ticketText(){
  var rows=['ORDER '+S.n+(S.label?'   '+S.label.toUpperCase():''),''];
  var drinks=[];
  S.lines.forEach(function(l){
    var it=ITEM[l.id];
    if(!CATOF[it.cat].kitchen){drinks.push(l.qty+'× '+it.name); return;}
    rows.push(l.qty+'× '+it.name.toUpperCase());
    mods(l).forEach(function(x){rows.push('     '+x.t.toUpperCase())});
  });
  return {text:rows.join('\n'),drinks:drinks};
}
var TKT='', TKOBJ=null;
function openTicket(t,warn,obj){
  t=t||ticketText(); TKT=t.text; TKOBJ=obj||ticketObj();
  paintSheet(
    '<div class="shead"><h2>Chef ticket</h2><p>Copy this onto the post-it.</p></div>'+
    '<div class="sbody">'+(warn?'<p class="warn">'+esc(warn)+'</p>':'')+'<pre class="tk" id="tk">'+esc(t.text)+'</pre>'+
      (t.drinks.length?'<p class="tkdrinks">Drinks, not for the kitchen: '+esc(t.drinks.join(', '))+'</p>':'')+'</div>'+
    '<div class="sfoot"><button class="btn" type="button" data-act="copy">Copy text</button>'+
      (hasBT?'<button class="btn" type="button" data-act="printnow">Print</button>':'')+
      '<button class="btn primary" type="button" data-act="close">Close</button></div>'
  );
  openSheet('ticket');
}
function copyTicket(){
  var t=TKT;
  function fallback(){
    var pre=$('#tk'); if(!pre) return;
    var r=document.createRange(); r.selectNodeContents(pre);
    var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
    toast('Selected. Press copy on your keyboard.');
  }
  try{
    navigator.clipboard.writeText(t).then(function(){toast('Ticket copied')},fallback);
  }catch(e){fallback()}
}

/* ---- Payment ---- */
var P='', fresh=false;
function given(){
  if(P===''||P==='.') return null;
  var v=parseFloat(P); return isFinite(v)?Math.round(v*100):null;
}
function openPay(){
  if(!count()) return;
  P=''; fresh=false; renderPay(); openSheet('pay');
}
function renderPay(){
  var tot=total(), g=given(), ok=g!==null&&g>=tot, cls='', msg;
  if(g===null){msg='Enter the amount given';}
  else if(ok){cls='ok'; msg='Change <span class="num">'+money(g-tot)+'</span>';}
  else {cls='owe'; msg='<span class="num">'+money(tot-g)+'</span> still to pay';}
  var keys=['7','8','9','4','5','6','1','2','3','.','0','del'];
  var amounts=[500,1000,2000,5000]; // notes add up when tapped more than once
  paintSheet(
    '<div class="shead"><h2>Payment</h2><p>Order '+S.n+(S.label?' · '+esc(S.label):'')+'</p></div>'+
    '<div class="sbody">'+
      '<div class="prow"><span>Total</span><b class="num">'+money(tot)+'</b></div>'+
      '<div class="prow"><span>Given</span><b class="num">'+(P===''?'£0.00':'£'+esc(P))+'</b></div>'+
      '<div class="change '+cls+'">'+msg+'</div>'+
      '<div class="quick"><button class="btn" type="button" data-act="quick" data-v="exact">Exact</button>'+
        amounts.map(function(a){return '<button class="btn" type="button" data-act="quick" data-v="'+a+'">+£'+(a/100)+'</button>'}).join('')+'</div>'+
      '<div class="pad">'+keys.map(function(k){
        return '<button type="button" data-act="key" data-v="'+k+'"'+(k==='del'?' class="del" aria-label="Delete"':'')+'>'+(k==='del'?'Del':k)+'</button>';
      }).join('')+'</div>'+
    '</div>'+
    '<div class="sfoot"><button class="btn grow" type="button" data-act="close">Back</button>'+
      '<button class="btn" type="button" data-act="card">Paid by card</button>'+
      '<button class="btn primary" type="button" data-act="complete"'+(ok?'':' disabled')+'>Complete order</button></div>',
    'narrow'
  );
}
function payKey(k){
  if(k==='del'){ if(fresh){P='';fresh=false;} else P=P.slice(0,-1); }
  else {
    if(fresh){P='';fresh=false;}
    if(k==='.'){ if(P.indexOf('.')>=0) return; if(P==='') P='0'; P+='.'; }
    else {
      if(P.indexOf('.')>=0&&P.split('.')[1].length>=2) return;
      if(P==='0') P=k; else P+=k;
    }
    if(P.length>7) P=P.slice(0,7);
  }
  renderPay();
}
function payQuick(v){
  // Exact sets the amount; note buttons add up, so two £20s = £40
  if(v==='exact') P=(total()/100).toFixed(2);
  else P=(((given()||0)+(+v))/100).toFixed(2);
  fresh=true; renderPay();
}
function complete(how){
  if(S.sheet!=='pay') return;
  var tot=total(), g=given();
  if(how==='cash'&&(g===null||g<tot)) return;
  ensureTakings();   // a new day restarts numbering, so do this before the number is quoted
  var msg='Order '+S.n+' done'+(how==='cash'?(g>tot?' · change '+money(g-tot):' · exact'):' · card');
  S.log.push({n:S.n,t:Date.now(),dev:S.dev,tab:S.tabName,label:S.label,total:tot,how:how==='cash'?'cash':'card',given:how==='cash'?g:null,
    lines:S.lines.map(function(l){var it=ITEM[l.id];return {q:l.qty,name:it.name,mods:mods(l).map(function(x){return x.t}),amt:lineUnit(l)*l.qty}})});
  var tk=ticketObj(), ttx=ticketText();
  S.n++; S.lines=[]; S.label=''; $('#label').value='';
  closeSheet(); $('#order').classList.remove('open');
  renderAll(); persistNow(); syncOrders(); pushOrders(); toast(msg);
  // chef ticket prints by itself; if it can't, show it on screen to write out by hand
  if(S.print.auto&&tk.items.length) printTicket(tk).then(function(ok){
    if(ok) toast(msg+' · ticket printed');
    else openTicket(ttx,'Could not print ('+PR.err+'). Copy this onto a post-it instead.',tk);
  });
}

/* ---- Orders (kept 30 days) and CSV export ---- */
var RETAIN_DAYS=30, HD='';
function hhmm(ms){return new Date(ms).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function dayOf(ms){return new Date(ms).toLocaleDateString('en-CA')}
function daysAgoStart(n){var d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-n); return d.getTime()}
function todays(){var t=todayStr(); return S.log.filter(function(o){return dayOf(o.t)===t})}
function viewLog(){
  var ids=Object.keys(CLOUDORD); if(!ids.length) return S.log;
  var m={}; S.log.forEach(function(o){m[oid(o)]=o});
  ids.forEach(function(k){ if(!m[k]) m[k]=CLOUDORD[k]; });
  return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return a.t-b.t});
}
function daysWithOrders(){
  var m={}, t=todayStr();
  viewLog().forEach(function(o){var d=dayOf(o.t); if(!m[d]) m[d]={n:0,total:0}; m[d].n++; m[d].total+=o.total;});
  if(!m[t]) m[t]={n:0,total:0};
  return Object.keys(m).sort().reverse().map(function(d){return {d:d,n:m[d].n,total:m[d].total}});
}
function dayName(d){
  if(d===todayStr()) return 'Today';
  if(d===dayOf(daysAgoStart(1))) return 'Yesterday';
  return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
}
function rangeOrders(kind){
  var V=viewLog();
  if(kind==='today') return V.filter(function(o){return o.t>=daysAgoStart(0)});
  if(kind==='week') return V.filter(function(o){return o.t>=daysAgoStart(6)});
  if(kind==='last') return S.lastExport?V.filter(function(o){return o.t>S.lastExport}):[];
  return V.slice();
}
function csvCell(v){
  var s=String(v==null?'':v);
  if(/^[=+\-@\t\r]/.test(s)) s="'"+s;               // stop Excel treating typed text as a formula
  return /[",\r\n]/.test(s)||s!==s.trim()?'"'+s.replace(/"/g,'""')+'"':s;
}
function buildCsv(L){
  var rows=[['Date','Time','Order no','Name / table','Items','Item count','Total (£)','Payment','Cash given (£)','Change (£)','Tablet']];
  L.forEach(function(o){
    var items=o.lines.map(function(l){return l.q+'x '+l.name+(l.mods&&l.mods.length?' ('+l.mods.join(', ')+')':'')}).join('; ');
    var cnt=o.lines.reduce(function(s,l){return s+l.q},0);
    var cash=o.how==='cash'&&o.given!=null;
    rows.push([dayOf(o.t),hhmm(o.t),o.n==null?'':o.n,o.label||'',items,cnt,(o.total/100).toFixed(2),o.how==='cash'?'Cash':'Card',cash?(o.given/100).toFixed(2):'',cash?((o.given-o.total)/100).toFixed(2):'',o.tab||'']);
  });
  return rows.map(function(r){return r.map(csvCell).join(',')}).join('\r\n')+'\r\n';
}
function downloadCsv(name,text){
  var blob=new Blob(['﻿'+text],{type:'text/csv;charset=utf-8'});   // BOM so Excel shows £ correctly
  var url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(function(){document.body.removeChild(a); URL.revokeObjectURL(url)},1500);
}
function exportOrders(kind){
  var L=rangeOrders(kind).sort(function(a,b){return a.t-b.t});
  if(!L.length){toast('No orders in that range'); return;}
  downloadCsv('localino-orders_'+dayOf(L[0].t)+'_to_'+dayOf(L[L.length-1].t)+'.csv',buildCsv(L));
  S.lastExport=Date.now(); save();
  toast('Exported '+L.length+(L.length===1?' order':' orders'));
  if(S.sheet==='history') renderHistory();
}
var BANNER_OFF=false, RB=null;
function unbacked(){var b=S.lastBackup||0; return S.log.filter(function(o){return o.t>b&&!S.pushed[oid(o)]}).length}   // orders already in the cloud count as backed up
function updateBanner(){
  var el=$('#banner'); if(!el) return;
  var n=unbacked(), show=false;
  if(n>0&&!BANNER_OFF){
    if(S.lastBackup) show=(Date.now()-S.lastBackup)>=7*86400000;
    else show=S.log.some(function(o){return o.t<daysAgoStart(2)});
  }
  el.hidden=!show;
  if(show) el.innerHTML='<span><b>Back up your orders.</b> '+n+(n===1?' order is':' orders are')+' only saved on this device'+
    (S.lastBackup?' (last backup '+esc(new Date(S.lastBackup).toLocaleDateString('en-GB',{day:'numeric',month:'short'}))+').':', and there is no backup yet.')+'</span>'+
    '<button class="btn sm" type="button" data-act="backup">Back up now</button><button class="btn sm ghost" type="button" data-act="bannerOff">Later</button>';
}
function backupObj(){return {app:'localino-till',version:1,exportedAt:new Date().toISOString(),state:stateObj(),orders:S.log.slice()}}
function markBackedUp(){S.lastBackup=Date.now(); persistNow(); updateBanner(); if(S.sheet==='history') renderHistory();}
function downloadBackup(){
  var blob=new Blob([JSON.stringify(backupObj())],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download='localino-backup_'+todayStr()+'.json'; document.body.appendChild(a); a.click();
  setTimeout(function(){document.body.removeChild(a); URL.revokeObjectURL(url)},1500);
  markBackedUp(); toast('Backup saved · '+S.log.length+' orders');
}
function shareBackup(){
  var f; try{ f=new File([JSON.stringify(backupObj())],'localino-backup_'+todayStr()+'.json',{type:'application/json'}); }catch(e){ downloadBackup(); return; }
  if(navigator.canShare&&navigator.canShare({files:[f]})){
    navigator.share({files:[f],title:'Till backup '+todayStr()}).then(function(){markBackedUp(); toast('Backup shared')}).catch(function(e){ if(!e||e.name!=='AbortError') downloadBackup(); });
  } else downloadBackup();
}
function restoreFile(el){
  var f=el.files&&el.files[0]; el.value=''; if(!f) return;
  var rd=new FileReader();
  rd.onload=function(){
    try{
      var b=JSON.parse(rd.result);
      if(!b||b.app!=='localino-till'||!Array.isArray(b.orders)) throw new Error('not a till backup');
      var have={}, cut=daysAgoStart(RETAIN_DAYS-1); S.log.forEach(function(o){have[o.t]=1});
      var incoming=cleanOrders(b.orders);
      RB={b:b,incoming:incoming,fresh:incoming.filter(function(o){return !have[o.t]&&o.t>=cut})};
      renderRestore(); openSheet('restore');
    }catch(e){ toast('That file is not a till backup'); }
  };
  rd.onerror=function(){toast('Could not read that file')};
  rd.readAsText(f);
}
function renderRestore(){
  var when=RB.b.exportedAt?new Date(RB.b.exportedAt).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'unknown date';
  paintSheet(
    '<div class="shead"><h2>Restore backup</h2><p>Backup from '+esc(when)+'</p></div>'+
    '<div class="sbody"><p style="margin:0">This backup holds <b>'+RB.incoming.length+'</b> orders. <b>'+RB.fresh.length+'</b> are not on this device yet and will be added. Nothing on this device is deleted. Orders older than 30 days are skipped.</p></div>'+
    '<div class="sfoot"><button class="btn grow" type="button" data-act="close">Cancel</button>'+
      '<button class="btn" type="button" data-act="restoreOrders">Add orders</button>'+
      (RB.b.state?'<button class="btn primary" type="button" data-act="restoreAll">Add orders and menu</button>':'')+'</div>',
    'narrow'
  );
}
function doRestore(withMenu){
  if(!RB) return;
  RB.fresh.forEach(function(o){S.log.push(o)});
  S.log.sort(function(a,b){return a.t-b.t});
  if(withMenu&&RB.b.state){ restoreMenu(RB.b.state); pruneLines(); if(CLOUD.configured) S.menuDirty=true; }
  var n=RB.fresh.length; RB=null;
  ensureTakings(); persistNow(); syncOrders(); closeSheet(); renderAll(); toast('Restored '+n+(n===1?' order':' orders'));
}
function dataBlock(){
  var nb=unbacked();
  var txt='Orders are saved twice on this device (a database and a second copy)'+(ST.idb?'':'. The database is unavailable here, so only the second copy is in use')+
    '. Protected from the browser clearing it: '+(ST.persisted===true?'yes':ST.persisted===false?'not granted':'unknown')+
    '. '+(S.lastBackup?'Last backup '+esc(new Date(S.lastBackup).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+', ':'No backup yet, ')+nb+(nb===1?' order':' orders')+' not backed up.';
  return '<div><h3>Data &amp; backup</h3><p class="hnote" style="margin:0 0 8px">'+txt+'</p><div class="chips">'+
    '<button class="chip" type="button" data-act="backup">Download backup</button>'+
    (navigator.share?'<button class="chip" type="button" data-act="shareBackup">Share backup</button>':'')+
    '<label class="chip" for="restorefile">Restore from backup</label>'+
    '<input type="file" id="restorefile" data-k="restore" accept=".json,application/json" hidden></div></div>';
}
function openHistory(){HD=todayStr(); renderHistory(); openSheet('history')}
function renderHistory(){
  ensureTakings();
  var days=daysWithOrders();
  if(!HD||!days.some(function(x){return x.d===HD})) HD=todayStr();
  var V=viewLog(), L=V.filter(function(o){return dayOf(o.t)===HD}), tot=0, cash=0, card=0;
  L.forEach(function(o){tot+=o.total; if(o.how==='cash') cash+=o.total; else card+=o.total;});
  var cnt={today:rangeOrders('today').length,last:rangeOrders('last').length,week:rangeOrders('week').length,all:V.length};
  var ex=[['today','Today'],['last','Since last export'],['week','Last 7 days'],['all','All kept (30 days)']];
  var h='<select class="in" id="hday" data-k="hday" aria-label="Choose a day">'+days.map(function(x){
    return '<option value="'+x.d+'"'+(x.d===HD?' selected':'')+'>'+esc(dayName(x.d))+' · '+x.n+(x.n===1?' order':' orders')+' · '+money(x.total)+'</option>';
  }).join('')+'</select>';
  h+='<div class="hsum"><div><span>Orders</span><b>'+L.length+'</b></div>'+
    '<div><span>Takings</span><b>'+money(tot)+'</b></div>'+
    '<div><span>Cash / card</span><b class="sm">'+money(cash)+' / '+money(card)+'</b></div></div>';
  h+='<div><h3>Export to Excel (CSV)</h3><div class="chips">'+ex.map(function(e){
    var n=cnt[e[0]];
    return '<button class="chip" type="button" data-act="export" data-v="'+e[0]+'"'+(n?'':' disabled')+'>'+e[1]+' <i>'+n+'</i></button>';
  }).join('')+'</div><p class="hnote">'+(S.lastExport?'Last export: '+esc(new Date(S.lastExport).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})):'No export yet.')+
    ' Orders are kept for 30 days.</p></div>';
  h+=dataBlock();
  if(!L.length){
    h+='<div class="empty"><b>No orders on this day</b><span>Each completed order is listed here with the time it went through.</span></div>';
  } else {
    var mine={}; S.log.forEach(function(o){mine[oid(o)]=1});
    h+='<div class="hist">'+L.slice().reverse().map(function(o){
      var tx=['ORDER '+ono(o)+(o.label?'   '+o.label.toUpperCase():'')+(o.tab?'   ['+String(o.tab).toUpperCase()+']':'')];
      o.lines.forEach(function(l){
        tx.push(l.q+'× '+l.name.toUpperCase()+'   '+money(l.amt));
        l.mods.forEach(function(m){tx.push('     '+m.toUpperCase())});
      });
      tx.push('','TOTAL '+money(o.total)+'   '+(o.how==='cash'?'CASH'+(o.given!=null?' (GIVEN '+money(o.given)+', CHANGE '+money(o.given-o.total)+')':''):'CARD'));
      var what=o.label||o.lines.map(function(l){return l.q+'× '+l.name}).join(', ');
      return '<details><summary><span class="hn">#'+esc(ono(o))+'</span><span class="ht">'+hhmm(o.t)+'</span><span class="hl">'+esc(what)+'</span><span class="hp">'+money(o.total)+'</span></summary>'+
        '<pre class="tk">'+esc(tx.join('\n'))+'</pre>'+
        (mine[oid(o)]||CLOUD.user?'<div class="hact"><button class="btn sm" type="button" data-act="edit" data-id="'+esc(oid(o))+'">Edit order</button><button class="btn sm ghost danger" type="button" data-act="void" data-id="'+esc(oid(o))+'">Void this order</button></div>':'')+'</details>';
    }).join('')+'</div>';
  }
  paintSheet(
    '<div class="shead"><h2>Orders</h2><p>'+(Object.keys(CLOUDORD).length?'Orders from all tablets. ':'')+'Pick a day, tap an order to see its ticket, edit it or void it.</p></div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot"><button class="btn primary" type="button" data-act="close">Close</button></div>'
  );
}

/* ---- Edit a completed order (quantities, removals, name, payment) ---- */
var EO=null;
function openEdit(id){
  var o=null; viewLog().forEach(function(x){ if(oid(x)===id) o=x; });
  if(!o) return;
  EO={id:id,o:o,label:o.label||'',how:o.how,given:o.given!=null?(o.given/100).toFixed(2):'',
    lines:o.lines.filter(function(l){return l.q>0}).map(function(l){return {q:l.q,name:l.name,mods:l.mods||[],unit:Math.round(l.amt/l.q)}})};
  renderEdit(); openSheet('edit');
}
function eTotal(){return EO.lines.reduce(function(s,l){return s+l.q*l.unit},0)}
function eGiven(){var v=parseFloat(String(EO.given).replace(',','.')); return isFinite(v)&&v>=0?Math.round(v*100):null}
function eOk(){ if(!EO.lines.length) return false; if(EO.how==='cash'){var g=eGiven(); return g!==null&&g>=eTotal();} return true; }
function eMsg(){
  var t=eTotal(), g=eGiven();
  if(!EO.lines.length) return 'No items left. Use Void instead.';
  if(EO.how!=='cash') return 'Paid by card';
  if(g===null) return 'Enter the cash given';
  return g>=t?'Change '+money(g-t):money(t-g)+' still to pay';
}
function eRefresh(){
  var m=$('#emsg'), t=$('#etot'), b=$('#esave');
  if(m) m.textContent=eMsg(); if(t) t.textContent=money(eTotal()); if(b) b.disabled=!eOk();
}
function renderEdit(){
  var h='<div><h3>Name or table</h3><input class="in" id="elabel" data-k="elabel" maxlength="60" autocomplete="off" value="'+esc(EO.label)+'"></div>';
  h+='<div><h3>Items</h3>'+(EO.lines.length?EO.lines.map(function(l,i){
    return '<div class="erow"><div class="en">'+esc(l.name)+(l.mods.length?'<small>'+esc(l.mods.join(', '))+'</small>':'')+'</div>'+
      '<span class="ep">'+money(l.q*l.unit)+'</span>'+
      '<div class="ea"><div class="step"><button type="button" data-act="eq" data-i="'+i+'" data-v="-1" aria-label="Remove one '+esc(l.name)+'">−</button><span>'+l.q+'</span><button type="button" data-act="eq" data-i="'+i+'" data-v="1" aria-label="Add one '+esc(l.name)+'">+</button></div>'+
      '<button class="btn sm ghost danger" type="button" data-act="edel" data-i="'+i+'">Remove</button></div></div>';
  }).join(''):'<p class="hnote" style="margin:0">No items left on this order.</p>')+'</div>';
  h+='<div><h3>Payment</h3><div class="chips">'+[['cash','Cash'],['card','Card']].map(function(p){
    return '<button class="chip" type="button" data-act="ehow" data-v="'+p[0]+'" aria-pressed="'+(EO.how===p[0])+'">'+p[1]+'</button>';
  }).join('')+'</div>'+(EO.how==='cash'?'<label class="money-in" style="margin-top:10px"><span>£</span><input class="in" id="egiven" data-k="egiven" inputmode="decimal" value="'+esc(EO.given)+'" aria-label="Cash given" placeholder="Cash given"></label>':'')+
    '<p class="hnote" id="emsg">'+esc(eMsg())+'</p></div>';
  paintSheet(
    '<div class="shead"><h2>Edit order '+esc(ono(EO.o))+'</h2><p>Changes the takings, the export and the dashboard. The kitchen ticket is not reprinted.</p></div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot"><span class="num grow" id="etot">'+money(eTotal())+'</span><button class="btn" type="button" data-act="ecancel">Cancel</button>'+
      '<button class="btn primary" id="esave" type="button" data-act="esave"'+(eOk()?'':' disabled')+'>Save changes</button></div>'
  );
}
function editBack(){ EO=null; S.sheet='history'; renderHistory(); }
function saveEdit(){
  if(!EO||!eOk()) return;
  var o=EO.o, id=EO.id, local=S.log.indexOf(o)>=0;
  o.lines=EO.lines.map(function(l){return {q:l.q,name:l.name,mods:l.mods,amt:l.q*l.unit}});
  o.total=eTotal(); o.how=EO.how; o.given=EO.how==='cash'?eGiven():null;
  var lab=EO.label.trim(); if(lab) o.label=lab; else delete o.label;
  if(local){
    delete ORDKEYS[o.t];   // forces the stored copy to be rewritten
    if(CLOUD.configured&&S.pushed[id]&&S.editQ.indexOf(id)<0) S.editQ.push(id);
    persistNow(); syncOrders(); flushEdits();
  } else if(CLOUD.user&&CLOUD.db){   // another tablet's order, edited by a signed-in owner
    CLOUD.db.collection('orders').doc(id).set(orderPayload(o)).catch(function(){toast('Could not update that order in the cloud')});
  }
  editBack(); renderTotals(); updateBanner();
  toast('Order '+ono(o)+' updated');
}

// Void one order (a mis-tap, a walk-out). It leaves the takings, the export and the dashboard.
// The cloud copy goes the same way as Reset today: at once for an owner, otherwise when an owner next signs in here.
function voidOrder(id){
  var o=null; S.log.forEach(function(x){ if(oid(x)===id) o=x; });
  if(o){
    queueCloudDeletes([o]); S.log=S.log.filter(function(x){return x!==o});
    prunePushed(); persistNow(); syncOrders(); flushDeletes();
  } else if(CLOUD.user&&CLOUD.db&&CLOUDORD[id]){   // another tablet's order, seen by a signed-in owner
    o=CLOUDORD[id]; delete CLOUDORD[id];
    CLOUD.db.collection('orders').doc(id).delete().catch(function(){toast('Could not remove that order from the cloud')});
  } else return;
  renderHistory(); renderTotals(); updateBanner();
  toast('Order '+ono(o)+' voided · '+money(o.total)+' taken off the takings');
}

/* ---- Dashboard ---- */
var DR='week';
var money0=function(p){return '£'+Math.round(p/100)};
function dashOrders(){return rangeOrders(DR==='today'?'today':DR==='week'?'week':'all')}
// The period to compare against: yesterday up to the same time of day, or the 7 days before this week. Nothing for 30 days (no older data kept).
function prevOrders(){
  var V=viewLog();
  if(DR==='today') return V.filter(function(o){return o.t>=daysAgoStart(1)&&o.t<Date.now()-86400000});
  if(DR==='week') return V.filter(function(o){return o.t>=daysAgoStart(13)&&o.t<daysAgoStart(6)});
  return null;
}
function sumOf(L){
  var r={tot:0,n:L.length,items:0};
  L.forEach(function(o){r.tot+=o.total; o.lines.forEach(function(l){r.items+=l.q})});
  return r;
}
function delta(cur,prev,lbl){
  if(!prev) return '';
  var p=Math.round((cur-prev)/prev*100), cls=p>0?'up':p<0?'down':'flat';
  return '<small class="dl '+cls+'">'+(p>0?'▲ +':p<0?'▼ ':'● ')+p+'% vs '+lbl+'</small>';
}
function rankRows(list,key,fmt){
  var mx=Math.max.apply(null,list.map(function(t){return t[key]}).concat([1]));
  return '<div class="rank">'+list.map(function(t){
    return '<div class="rrow"><span class="rname" title="'+esc(t.name)+'">'+esc(t.name)+'</span><span class="rbar"><i style="width:'+Math.max(2,Math.round(t[key]/mx*100))+'%"></i></span><span class="rnum">'+fmt(t)+'</span></div>';
  }).join('')+'</div>';
}
function openDash(){DR='week'; renderDash(); openSheet('dash')}
function colChart(cols,allVals){
  var max=Math.max.apply(null,cols.map(function(c){return c.val}).concat([1]));
  var peak=0; cols.forEach(function(c,i){if(c.val>cols[peak].val) peak=i});
  return '<div class="cols">'+cols.map(function(c,i){
    var px=c.val>0?Math.max(3,Math.round(c.val/max*112)):0;
    var showV=c.val>0&&(allVals||i===peak);
    return '<div class="col" title="'+esc(c.tip)+'" aria-label="'+esc(c.tip)+'">'+(showV?'<span class="v">'+money0(c.val)+'</span>':'')+'<i style="height:'+px+'px"></i></div>';
  }).join('')+'</div><div class="clabels">'+cols.map(function(c){return '<span>'+esc(c.label)+'</span>'}).join('')+'</div>';
}
function renderDash(){
  ensureTakings();
  var L=dashOrders(), tot=0, cash=0, card=0, items=0, byItem={}, byHour={}, byDay={};
  L.forEach(function(o){
    tot+=o.total; if(o.how==='cash') cash+=o.total; else card+=o.total;
    var hr=new Date(o.t).getHours(), d=dayOf(o.t);
    var bh=byHour[hr]||(byHour[hr]={amt:0,n:0}); bh.amt+=o.total; bh.n++;
    var bd=byDay[d]||(byDay[d]={amt:0,n:0}); bd.amt+=o.total; bd.n++;
    o.lines.forEach(function(l){items+=l.q; var b=byItem[l.name]||(byItem[l.name]={q:0,amt:0}); b.q+=l.q; b.amt+=l.amt;});
  });
  var n=L.length, h='';
  h+='<div class="chips">'+[['today','Today'],['week','Last 7 days'],['all','Last 30 days']].map(function(r){
    return '<button class="chip" type="button" data-act="dashrange" data-v="'+r[0]+'" aria-pressed="'+(DR===r[0])+'">'+r[1]+'</button>';
  }).join('')+'</div>';
  if(!n){
    h+='<div class="empty"><b>No orders in this range yet</b><span>Figures appear here as orders are completed.</span></div>';
  } else {
    var PL=prevOrders(), pv=PL&&PL.length?sumOf(PL):null, plbl=DR==='today'?'yesterday so far':'previous 7 days';
    h+='<div class="kpis"><div class="kpi"><span>Takings</span><b>'+money(tot)+'</b>'+delta(tot,pv&&pv.tot,plbl)+'</div>'+
      '<div class="kpi"><span>Orders</span><b>'+n+'</b>'+delta(n,pv&&pv.n,plbl)+'</div>'+
      '<div class="kpi"><span>Average order</span><b>'+money(Math.round(tot/n))+'</b>'+delta(tot/n,pv&&pv.tot/pv.n,plbl)+'</div>'+
      '<div class="kpi"><span>Items sold</span><b>'+items+'</b>'+delta(items,pv&&pv.items,plbl)+'</div></div>';
    var pc=tot?Math.round(cash/tot*100):0, pk=tot?100-pc:0;
    h+='<div><h3>Cash and card</h3><div class="split" role="img" aria-label="Cash '+pc+' percent, card '+pk+' percent">'+
      (cash?'<i style="flex:'+cash+';background:var(--ch1)"></i>':'')+(card?'<i style="flex:'+card+';background:var(--ch2)"></i>':'')+'</div>'+
      '<div class="legend"><span><u style="background:var(--ch1)"></u>Cash '+money(cash)+' · '+pc+'%</span><span><u style="background:var(--ch2)"></u>Card '+money(card)+' · '+pk+'%</span></div></div>';
    var top=Object.keys(byItem).map(function(k){return {name:k,q:byItem[k].q,amt:byItem[k].amt}}).sort(function(a,b){return b.q-a.q||b.amt-a.amt}).slice(0,8);
    h+='<div><h3>Best sellers</h3>'+rankRows(top,'q',function(t){return t.q+' · '+money(t.amt)})+'</div>';
    // Which part of the menu earns the money. Items are matched to the current menu by name; anything renamed or removed falls under Other.
    var catOfName={}; CATS.forEach(function(c){c.items.forEach(function(it){catOfName[it.name.toLowerCase()]=c.name})});
    var byCat={}; L.forEach(function(o){o.lines.forEach(function(l){var cn=catOfName[l.name.toLowerCase()]||'Other'; byCat[cn]=(byCat[cn]||0)+l.amt;})});
    var catList=Object.keys(byCat).map(function(k){return {name:k,amt:byCat[k]}}).sort(function(a,b){return b.amt-a.amt}), catTot=catList.reduce(function(s,c){return s+c.amt},0)||1;
    h+='<div><h3>Takings by menu section</h3>'+rankRows(catList,'amt',function(t){return money(t.amt)+' · '+Math.round(t.amt/catTot*100)+'%'})+'</div>';
    var byTab={}; L.forEach(function(o){var k=o.tab||'Unnamed'; var b=byTab[k]||(byTab[k]={name:k,amt:0,n:0}); b.amt+=o.total; b.n++;});
    var tabList=Object.keys(byTab).map(function(k){return byTab[k]}).sort(function(a,b){return b.amt-a.amt});
    if(tabList.length>1) h+='<div><h3>By tablet</h3>'+rankRows(tabList,'amt',function(t){return t.n+(t.n===1?' order':' orders')+' · '+money(t.amt)})+'</div>';
    var hrs=Object.keys(byHour).map(Number), hmin=Math.min.apply(null,hrs), hmax=Math.max.apply(null,hrs), cols=[], busy=hmin;
    for(var x=hmin;x<=hmax;x++){
      var bh=byHour[x]||{amt:0,n:0}; if(bh.n>(byHour[busy]||{n:0}).n) busy=x;
      cols.push({label:String(x),val:bh.amt,tip:x+':00 to '+(x+1)+':00 · '+bh.n+(bh.n===1?' order':' orders')+' · '+money(bh.amt)});
    }
    h+='<div><h3>Takings by hour</h3>'+colChart(cols,cols.length<=12)+'</div>';
    var note='Busiest hour: '+busy+':00 to '+(busy+1)+':00 ('+byHour[busy].n+(byHour[busy].n===1?' order':' orders')+').';
    if(DR!=='today'){
      var days=DR==='week'?7:RETAIN_DAYS, dcols=[], best=null;
      for(var i=days-1;i>=0;i--){
        var key=dayOf(daysAgoStart(i)), bd2=byDay[key]||{amt:0,n:0}, idx=days-1-i;
        if(!best||bd2.amt>byDay[best].amt) best=bd2.amt>0?key:best;
        var dt=new Date(key+'T12:00:00');
        dcols.push({label:DR==='week'?dt.toLocaleDateString('en-GB',{weekday:'short'}):((i%5===0)?String(dt.getDate()):''),val:bd2.amt,tip:dayName(key)+' · '+bd2.n+(bd2.n===1?' order':' orders')+' · '+money(bd2.amt)});
      }
      h+='<div><h3>Takings by day</h3>'+colChart(dcols,DR==='week')+'</div>';
      if(best) note+=' Best day: '+dayName(best)+' ('+money(byDay[best].amt)+').';
    }
    h+='<p class="hnote" style="margin:0">'+esc(note)+'</p>';
  }
  paintSheet(
    '<div class="shead"><h2>Dashboard</h2><p>'+(Object.keys(CLOUDORD).length?'Orders from all tablets':'From the orders saved on this device')+' (last 30 days).</p></div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot"><button class="btn primary" type="button" data-act="close">Close</button></div>',
    'wide'
  );
}

/* ---- Settings and menu editor ---- */
function openSettings(){renderSettings(); openSheet('settings')}
function menuLocked(){return CLOUD.configured&&CLOUD.state!=='error'&&!CLOUD.user}
function canPublish(){return CLOUD.configured&&CLOUD.state==='ready'&&!!CLOUD.user}
function menuStatusHtml(){
  var line, btns='';
  if(!CLOUD.configured){ line='This menu is stored on this device only. Cloud sync is not set up yet.'; }
  else if(CLOUD.state==='loading'){ line='Connecting to the cloud…'; }
  else if(CLOUD.state==='error'){ line='Could not reach the cloud ('+esc(CLOUD.err)+'). Using the menu saved on this tablet; changes here stay on this tablet.'; }
  else {
    line=(CLOUD.user?'Signed in as '+esc(CLOUD.user.email):'Not signed in.')+' · '+
      (CLOUD.fromCache?'offline, using the menu saved on this tablet':(CLOUD.synced?'in sync, updated '+hhmm(CLOUD.synced):'connected'));
    if(CLOUD.empty) line+=' · No menu in the cloud yet. Save to upload this one.';
    if(S.menuDirty) line+=' · You have unsaved changes.';
    if(CLOUD.held) line+=' · A newer menu is waiting in the cloud. Saving will replace it.';
    btns=CLOUD.user?'<button class="btn sm ghost" data-act="mSignOut" type="button">Sign out</button>':'<button class="btn primary" data-act="mSignIn" type="button">Sign in with Google</button>';
    if(CLOUD.held) btns+='<button class="btn sm" data-act="mDiscard" type="button">Discard my changes, load the cloud menu</button>';
  }
  return '<p class="hnote" style="margin:0 0 8px">'+line+'</p>'+ordersStatusHtml()+(btns?'<div class="chips">'+btns+'</div>':'');
}
function ordersStatusHtml(){
  if(!CLOUD.configured) return '';
  var pend=S.log.filter(function(o){return !S.pushed[oid(o)]}).length, t;
  if(CLOUD.state==='error') t='Orders are saved on this tablet and will back up to the cloud when it can connect.';
  else if(CLOUD.ordErr) t='Order backup problem: '+esc(CLOUD.ordErr)+'. Orders are safe on this tablet.';
  else if(pend) t=pend+(pend===1?' order is':' orders are')+' waiting to back up to the cloud.';
  else t='All orders are backed up to the cloud.';
  if(CLOUD.user) t+=CLOUD.ordOk?' Order history shows all tablets.':' Order history shows this tablet only.';
  return '<p class="hnote" style="margin:0 0 8px">'+t+'</p>';
}
function itemRow(it,i,n){
  return '<div class="mrow"><div class="srow x">'+
    '<input class="in" id="mn-'+it.id+'" data-k="name" data-id="'+it.id+'" value="'+esc(it.name)+'" aria-label="Item name" maxlength="60">'+
    '<label class="money-in"><span>£</span><input class="in" id="mp-'+it.id+'" data-k="price" data-id="'+it.id+'" inputmode="decimal" value="'+(it.price/100).toFixed(2)+'" aria-label="Price for '+esc(it.name)+'"></label></div>'+
    '<div class="sact"><label class="sw"><input type="checkbox" data-k="avail" data-id="'+it.id+'"'+(it.avail?' checked':'')+'>On sale</label>'+
    '<label class="sw"><input type="checkbox" data-k="veg" data-id="'+it.id+'"'+(it.veg?' checked':'')+'>Veg</label><span class="grow"></span>'+
    '<button class="btn sm" type="button" data-act="mUp" data-id="'+it.id+'" aria-label="Move up"'+(i===0?' disabled':'')+'>↑</button>'+
    '<button class="btn sm" type="button" data-act="mDown" data-id="'+it.id+'" aria-label="Move down"'+(i===n-1?' disabled':'')+'>↓</button>'+
    '<button class="btn sm ghost danger" type="button" data-act="mDel" data-id="'+it.id+'">Delete</button></div></div>';
}
function renderSettings(){
  ensureTakings();
  var tl=todays(), t={orders:tl.length,total:tl.reduce(function(s,o){return s+o.total},0)}, h='';
  h+='<section class="set"><h3>Today</h3><div class="takings"><b>'+money(t.total)+'</b><span class="grow">'+t.orders+(t.orders===1?' order':' orders')+'</span>'+
     '<button class="btn sm ghost danger" type="button" data-act="resetToday">Reset today</button></div></section>';
  h+='<section class="set"><h3>This tablet</h3><div class="srow x"><input class="in" id="tabname" data-k="tabname" value="'+esc(S.tabName)+'" placeholder="Name, e.g. Counter" aria-label="Tablet name" maxlength="40"></div>'+
     '<p class="hnote" style="margin:0">Shown on orders and in the export, so you can tell tablets apart.</p>'+
     '<label class="sw" style="margin-top:6px"><input type="checkbox" data-k="awake"'+(S.awake?' checked':'')+'>Keep the screen on while the till is open</label>'+
     (PWA.installEv?'<div><button class="btn sm" type="button" data-act="install">Install as an app on this device</button></div>':'')+'</section>';
  h+='<section class="set"><h3>Cloud sync</h3>'+menuStatusHtml()+'</section>';
  if(menuLocked()){
    h+='<section class="set"><p class="hnote" style="margin:0">The menu is shared between tablets. Sign in with the owner Google account to change items or prices.</p></section>';
  } else {
    CATS.forEach(function(c){
      h+='<section class="set"><h3>'+esc(c.name)+'</h3>'+c.items.map(function(it,i){return itemRow(it,i,c.items.length)}).join('')+
        '<div><button class="btn sm" type="button" data-act="mAdd" data-v="'+c.id+'">+ Add item</button></div></section>';
    });
    h+='<section class="set"><h3>Extras (price per topping)</h3>'+EXTRAS.map(function(e){
      return '<div class="srow x3">'+
        '<input class="in" id="xn-'+e.id+'" data-k="xname" data-id="'+e.id+'" value="'+esc(e.name)+'" aria-label="Extra name" maxlength="60">'+
        '<label class="money-in"><span>£</span><input class="in" id="xp-'+e.id+'" data-k="xprice" data-id="'+e.id+'" inputmode="decimal" value="'+(e.price/100).toFixed(2)+'" aria-label="Price for '+esc(e.name)+'"></label>'+
        '<button class="btn sm ghost danger" type="button" data-act="xDel" data-id="'+e.id+'">Delete</button></div>';
    }).join('')+'<div><button class="btn sm" type="button" data-act="xAdd">+ Add extra</button></div></section>';
  }
  paintSheet(
    '<div class="shead"><h2>Menu &amp; prices</h2><p>'+(CLOUD.configured?'Changes reach the other tablets when you tap Save to all tablets.':'Changes save on this device straight away.')+'</p></div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot">'+(menuLocked()?'':'<button class="btn ghost danger grow" type="button" data-act="resetMenu">Reset menu to start</button>')+
      (canPublish()?'<button class="btn'+(S.menuDirty?' primary':'')+'" type="button" data-act="mSave">Save to all tablets</button>':'')+
      '<button class="btn'+(canPublish()&&S.menuDirty?'':' primary')+'" type="button" data-act="close">Done</button></div>'
  );
}
function newId(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function menuChanged(){ if(CLOUD.configured) S.menuDirty=true; pruneLines(); save(); renderAll(); }
function menuAdd(catId){
  var c=CATOF[catId]; if(!c) return;
  var it={id:newId('i'),name:'New item',price:0,veg:false,avail:true,cat:catId};
  ITEM[it.id]=it; c.items.push(it); menuChanged(); renderSettings();
  var el=document.getElementById('mn-'+it.id); if(el&&el.focus){el.focus(); if(el.select) el.select();}
}
function menuMove(id,dir){
  var it=ITEM[id]; if(!it) return; var arr=CATOF[it.cat].items, i=arr.indexOf(it), j=i+dir;
  if(j<0||j>=arr.length) return; arr[i]=arr[j]; arr[j]=it; menuChanged(); renderSettings();
}
function menuDelete(id){
  var it=ITEM[id]; if(!it) return; var arr=CATOF[it.cat].items; arr.splice(arr.indexOf(it),1); delete ITEM[id];
  menuChanged(); renderSettings();
}
function extraAdd(){
  var e={id:newId('x'),name:'New extra',price:100}; EX[e.id]=e; EXTRAS.push(e); menuChanged(); renderSettings();
  var el=document.getElementById('xn-'+e.id); if(el&&el.focus){el.focus(); if(el.select) el.select();}
}
function extraDelete(id){
  var e=EX[id]; if(!e) return; EXTRAS.splice(EXTRAS.indexOf(e),1); delete EX[id]; menuChanged(); renderSettings();
}
function updateMenuBar(){
  var b=$('#menubtn'); if(!b) return;
  var f=$('#menuflag'); if(f) f.hidden=!(CLOUD.configured&&S.menuDirty);
}
function onFormInput(e){
  var el=e.target;
  if(el.id==='label'){S.label=el.value; save(); return;}
  if(el.id==='ctext'&&C){C.text=el.value; return;}
  var k=el.dataset&&el.dataset.k; if(!k) return;
  if(k==='prauto'){S.print.auto=el.checked; save(); return;}
  if(k==='hday'){HD=el.value; renderHistory(); return;}
  if(k==='elabel'&&EO){EO.label=el.value.slice(0,60); return;}
  if(k==='egiven'&&EO){EO.given=el.value; eRefresh(); return;}
  if(k==='restore'){restoreFile(el); return;}
  if(k==='tabname'){S.tabName=el.value.slice(0,40); save(); return;}
  if(k==='awake'){S.awake=el.checked; save(); wakeSync(); return;}
  var id=el.dataset.id, it=ITEM[id], ex=EX[id], v;
  if(k==='name'&&it){ if(el.value.trim()) it.name=el.value.slice(0,60); }
  else if(k==='price'&&it){ v=parseFloat(el.value.replace(',','.')); if(isFinite(v)&&v>=0) it.price=Math.round(v*100); if(e.type==='change') el.value=(it.price/100).toFixed(2); }
  else if(k==='avail'&&it){ it.avail=el.checked; }
  else if(k==='veg'&&it){ it.veg=el.checked; }
  else if(k==='xname'&&ex){ if(el.value.trim()) ex.name=el.value.slice(0,60); }
  else if(k==='xprice'&&ex){ v=parseFloat(el.value.replace(',','.')); if(isFinite(v)&&v>=0) ex.price=Math.round(v*100); if(e.type==='change') el.value=(ex.price/100).toFixed(2); }
  else return;
  menuChanged();
}

/* ---------- Bluetooth printer (ESC/POS over Web Bluetooth, chef ticket only) ---------- */
var hasBT=!!(navigator&&navigator.bluetooth);
var PR={dev:null,chr:null,err:'',q:Promise.resolve()};
var BT_SERVICES=[0x18f0,0xffe0,0xff00,0xfff0,0xfee7,'49535343-fe7d-4ae5-8fa9-9fafd205e455','e7810a71-73ae-499d-8c15-faa9aef0c3f2'];
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
function prConnected(){return !!(PR.dev&&PR.dev.gatt&&PR.dev.gatt.connected&&PR.chr)}
function prDot(){var d=$('#pdot'); if(d) d.className='pdot'+(prConnected()?' on':'')}
async function prFindChar(server){
  var svcs=await server.getPrimaryServices();
  for(var i=0;i<svcs.length;i++){
    var cs=await svcs[i].getCharacteristics();
    for(var j=0;j<cs.length;j++){var p=cs[j].properties; if(p.write||p.writeWithoutResponse) return cs[j];}
  }
  return null;
}
function prDrop(){PR.chr=null; prDot(); if(S.sheet==='printer') renderPrinter();}
async function prAttach(dev){
  PR.dev=dev;
  var server=await dev.gatt.connect();
  var c=await prFindChar(server);
  if(!c) throw new Error('Connected, but no Bluetooth Low Energy print service was found. This printer may only support Classic Bluetooth.');
  PR.chr=c;
  dev.removeEventListener('gattserverdisconnected',prDrop);
  dev.addEventListener('gattserverdisconnected',prDrop);
  prDot();
}
async function prPair(){
  PR.err='';
  var dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:BT_SERVICES});
  await prAttach(dev);
}
async function prEnsure(){
  if(prConnected()) return;
  if(!PR.dev) throw new Error('printer not connected');
  await prAttach(PR.dev);
}
async function prWrite(bytes){
  var pos=0,size=100;
  var nr=PR.chr.properties.writeWithoutResponse&&typeof PR.chr.writeValueWithoutResponse==='function';
  while(pos<bytes.length){
    var chunk=bytes.slice(pos,pos+size);
    try{
      if(nr) await PR.chr.writeValueWithoutResponse(chunk); else await PR.chr.writeValue(chunk);
      pos+=size;
    }catch(e){
      if(size>20){size=20; continue;}
      throw e;
    }
    await sleep(25);
  }
}
function ascii(s){return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/×/g,'x').replace(/[^\x20-\x7e]/g,'?')}
function wrap(s,n){
  var out=[],line='';
  s.split(' ').forEach(function(w){
    while(w.length>n){ if(line){out.push(line);line='';} out.push(w.slice(0,n)); w=w.slice(n); }
    if(!line) line=w; else if((line+' '+w).length<=n) line+=' '+w; else {out.push(line);line=w;}
  });
  if(line) out.push(line);
  return out;
}
function ticketObj(){
  return {n:S.n,label:S.label,time:hhmm(Date.now()),
    items:S.lines.filter(function(l){return CATOF[ITEM[l.id].cat].kitchen}).map(function(l){
      return {q:l.qty,name:ITEM[l.id].name,mods:mods(l).map(function(x){return x.t})};
    })};
}
function escpos(t){
  var W=S.print.width===58?32:48, b=[];
  function raw(){for(var i=0;i<arguments.length;i++) b.push(arguments[i]);}
  function line(s){s=ascii(s); for(var i=0;i<s.length;i++) b.push(s.charCodeAt(i)); b.push(10);}
  raw(0x1b,0x40);                                   // initialise
  raw(0x1b,0x61,1); raw(0x1d,0x21,0x11); line('ORDER '+t.n); raw(0x1d,0x21,0x00); // centred, double size
  if(t.label){ raw(0x1b,0x21,0x18); wrap(t.label.toUpperCase(),W).forEach(line); raw(0x1b,0x21,0x00); }
  line(t.time);
  raw(0x1b,0x61,0);                                 // left aligned
  line('-'.repeat(W));
  t.items.forEach(function(it){
    raw(0x1b,0x21,0x18);                            // bold, double height
    wrap(it.q+'x '+it.name.toUpperCase(),W).forEach(line);
    raw(0x1b,0x21,0x08);                            // bold
    it.mods.forEach(function(m){wrap(m.toUpperCase(),W-3).forEach(function(l){line('   '+l)})});
    raw(0x1b,0x21,0x00);
    line('');
  });
  line('-'.repeat(W));
  raw(10,10,10);
  raw(0x1d,0x56,0x42,0x00);                         // feed and cut (ignored if no cutter)
  return new Uint8Array(b);
}
function printTicket(t){
  var run=async function(){
    try{ await prEnsure(); await prWrite(escpos(t)); PR.err=''; return true; }
    catch(e){ PR.err=String((e&&e.message)||e); prDot(); return false; }
  };
  PR.q=PR.q.then(run,run);
  return PR.q;
}
function openPrinter(){renderPrinter(); openSheet('printer')}
function renderPrinter(){
  var h='';
  if(!hasBT){
    h='<p class="warn">This browser cannot use Bluetooth printers. Use Chrome or Edge on Android or Windows. iPhone and iPad cannot.</p>';
  } else {
    var on=prConnected();
    h='<div class="pstat"><span class="pdot'+(on?' on':'')+'"></span><b>'+(on?'Connected to '+esc(PR.dev.name||'printer'):(PR.dev?'Paired, not connected right now':'No printer connected'))+'</b></div>'+
      (PR.err?'<p class="warn">'+esc(PR.err)+'</p>':'')+
      '<div class="chips"><button class="btn primary" data-act="prpair" type="button">'+(PR.dev?'Choose another printer':'Connect printer')+'</button>'+
      '<button class="btn" data-act="prtest" type="button"'+(PR.dev?'':' disabled')+'>Test print</button>'+
      (PR.dev?'<button class="btn ghost" data-act="prdisc" type="button">Disconnect</button>':'')+'</div>'+
      '<div><h3>Paper width</h3><div class="chips">'+[58,80].map(function(w){
        return '<button class="chip" type="button" data-act="prwidth" data-v="'+w+'" aria-pressed="'+(S.print.width===w)+'">'+w+' mm</button>';
      }).join('')+'</div></div>'+
      '<label class="sw"><input type="checkbox" id="prauto" data-k="prauto"'+(S.print.auto?' checked':'')+'>Print the chef ticket automatically when an order is completed</label>';
  }
  paintSheet(
    '<div class="shead"><h2>Receipt printer</h2><p>Bluetooth. Prints chef tickets only, no customer receipt.</p></div>'+
    '<div class="sbody">'+h+'</div>'+
    '<div class="sfoot"><button class="btn primary" type="button" data-act="close">Done</button></div>'
  );
}
function prInit(){
  prDot();
  if(!hasBT||!navigator.bluetooth.getDevices||!S.print.name) return;
  navigator.bluetooth.getDevices().then(function(ds){
    var d=ds.filter(function(x){return x.name===S.print.name})[0]; if(!d) return;
    PR.dev=d; prAttach(d).then(prDot,prDot);
  }).catch(function(){});
}

/* ---------- Cloud menu (Firebase) ---------- */
// The Firebase settings live in firebase-config.js (window.FIREBASE_CONFIG). Without it the menu stays on this device.
var FIREBASE_CONFIG=(typeof window==='object'&&window&&window.FIREBASE_CONFIG)||null;
var CLOUD={configured:!!(FIREBASE_CONFIG&&FIREBASE_CONFIG.projectId),state:'off',db:null,auth:null,user:null,fromCache:true,synced:0,err:'',held:false,empty:false,latest:null,booted:false,ordErr:'',ordOk:false,ordUnsub:null,anonTried:false};
var CLOUDORD={}, INFLIGHT={};
function loadScript(src){
  return new Promise(function(res,rej){
    var el=document.createElement('script'); el.src=src; el.async=false;
    el.onload=res; el.onerror=function(){rej(new Error('could not load the Firebase library'))};
    document.head.appendChild(el);
  });
}
function refreshSettings(){ if(S.sheet==='settings') renderSettings(); }
function applyRemoteMenu(d,notify){
  var wasUpdate=S.menuVersion>0;
  buildMenu(d); S.menuVersion=typeof d.version==='number'?d.version:0; S.menuDirty=false; CLOUD.held=false;
  pruneLines(); persistNow(); renderAll(); refreshSettings();
  if(notify&&wasUpdate) toast('Menu updated');
}
async function cloudInit(){
  if(!CLOUD.configured||CLOUD.state==='loading'||CLOUD.state==='ready') return;
  CLOUD.state='loading';
  try{
    var base='vendor/';
    if(typeof firebase==='undefined'){
      await loadScript(base+'firebase-app-compat.js');
      await Promise.all([loadScript(base+'firebase-auth-compat.js'),loadScript(base+'firebase-firestore-compat.js')]);
    }
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    CLOUD.db=firebase.firestore();
    try{ await CLOUD.db.enablePersistence({synchronizeTabs:true}); }catch(e){}   // keeps the menu and unsent orders safe offline
    CLOUD.auth=firebase.auth();
    CLOUD.auth.onAuthStateChanged(onAuth);
    CLOUD.db.collection('menu').doc('current').onSnapshot({includeMetadataChanges:true},function(snap){
      CLOUD.fromCache=!!snap.metadata.fromCache;
      if(!CLOUD.fromCache) CLOUD.synced=Date.now();
      if(!snap.exists){ CLOUD.empty=true; refreshSettings(); return; }
      CLOUD.empty=false;
      var d=snap.data();
      if(!validMenu(d)){ CLOUD.err='the menu in the cloud is not valid'; refreshSettings(); return; }
      CLOUD.latest=d;
      var ver=typeof d.version==='number'?d.version:0;
      if(ver>S.menuVersion){
        if(S.menuDirty){ CLOUD.held=true; refreshSettings(); }
        else applyRemoteMenu(d,true);
      } else refreshSettings();
    },function(err){ CLOUD.err=(err&&(err.code||err.message))||'error'; refreshSettings(); });
    CLOUD.state='ready'; CLOUD.booted=true;
  }catch(e){
    CLOUD.state='error'; CLOUD.err=String((e&&e.message)||e);
  }
  refreshSettings(); updateMenuBar();
  if(CLOUD.state==='ready') pushOrders();
}
function onAuth(u){
  CLOUD.user=(u&&!u.isAnonymous)?u:null;
  if(!u&&!CLOUD.anonTried){
    CLOUD.anonTried=true;   // tablets sign in anonymously so they can send orders; only the owner's Google account can read or edit
    CLOUD.auth.signInAnonymously().catch(function(e){ CLOUD.ordErr='anonymous sign-in failed ('+((e&&e.code)||'error')+')'; refreshSettings(); });
  }
  if(u){ CLOUD.anonTried=false; CLOUD.ordErr=''; }
  ordersWatch(!!CLOUD.user);
  flushDeletes(); pushOrders(); refreshSettings();
}
function ordersWatch(on){
  if(CLOUD.ordUnsub){ try{CLOUD.ordUnsub()}catch(e){} CLOUD.ordUnsub=null; }
  if(!on||!CLOUD.db){ var had=Object.keys(CLOUDORD).length; CLOUDORD={}; CLOUD.ordOk=false; if(had) repaintOrders(); return; }
  var cut=daysAgoStart(RETAIN_DAYS-1);
  CLOUD.ordUnsub=CLOUD.db.collection('orders').where('t','>=',cut).orderBy('t').onSnapshot(function(snap){
    var m={}, same=true, n=0;
    snap.forEach(function(d){ var o=cleanOrder(d.data()); if(o){ m[d.id]=o; n++; if(!CLOUDORD[d.id]) same=false; } });
    if(n!==Object.keys(CLOUDORD).length) same=false;
    CLOUDORD=m; CLOUD.ordOk=true;
    if(!same) repaintOrders();
    refreshSettings();
  },function(err){
    CLOUDORD={}; CLOUD.ordOk=false;
    if(err&&err.code!=='permission-denied') CLOUD.ordErr=err.code||'error';
    refreshSettings();
  });
}
function repaintOrders(){
  if(S.sheet==='history') renderHistory();
  else if(S.sheet==='dash') renderDash();
}
function orderPayload(o){
  var p={t:o.t,total:o.total,how:o.how==='cash'?'cash':'card',dev:o.dev||S.dev,
    lines:o.lines.map(function(l){return {q:l.q,name:String(l.name),mods:(l.mods||[]).map(String),amt:l.amt}})};
  if(typeof o.n==='number') p.n=o.n;
  if(o.label) p.label=String(o.label).slice(0,60);
  if(o.tab) p.tab=String(o.tab).slice(0,40);
  if(typeof o.given==='number') p.given=o.given;
  return p;
}
function pushOrders(){
  if(CLOUD.state!=='ready'||!CLOUD.auth||!CLOUD.auth.currentUser) return;
  S.log.forEach(function(o){
    var id=oid(o);
    if(S.pushed[id]||INFLIGHT[id]) return;
    INFLIGHT[id]=1;
    CLOUD.db.collection('orders').doc(id).set(orderPayload(o)).then(function(){
      delete INFLIGHT[id]; S.pushed[id]=1; CLOUD.ordErr=''; save(); updateBanner(); refreshSettings();
    },function(e){
      delete INFLIGHT[id];
      CLOUD.ordErr=(e&&e.code==='permission-denied')?'the cloud refused the order (check the rules and that anonymous sign-in is on)':((e&&(e.code||e.message))||'error');
      refreshSettings();
    });
  });
}
function queueCloudDeletes(list){
  if(!CLOUD.configured) return;
  list.forEach(function(o){ var id=oid(o); if(S.delQ.indexOf(id)<0) S.delQ.push(id); delete S.pushed[id]; });
}
function flushEdits(){
  if(CLOUD.state!=='ready'||!CLOUD.user||!S.editQ.length) return;
  S.editQ.slice().forEach(function(id){
    var o=null; S.log.forEach(function(x){ if(oid(x)===id) o=x; });
    var done=function(){ var i=S.editQ.indexOf(id); if(i>=0) S.editQ.splice(i,1); save(); };
    if(!o){ done(); return; }
    CLOUD.db.collection('orders').doc(id).set(orderPayload(o)).then(done,function(e){ if(e&&e.code==='permission-denied') done(); });
  });
}
function flushDeletes(){
  flushEdits();
  if(CLOUD.state!=='ready'||!CLOUD.user||!S.delQ.length) return;
  var ids=S.delQ.slice();
  ids.forEach(function(id){
    CLOUD.db.collection('orders').doc(id).delete().then(function(){
      var i=S.delQ.indexOf(id); if(i>=0) S.delQ.splice(i,1); save();
    },function(e){ if(e&&e.code==='permission-denied'){ var i=S.delQ.indexOf(id); if(i>=0) S.delQ.splice(i,1); save(); } });
  });
}
setInterval(function(){
  var day=S.day; ensureTakings(); if(S.day!==day){ renderTotals(); save(); }   // midnight passed with the till open
  if(!CLOUD.configured) return;
  if(CLOUD.state==='error'&&(typeof navigator==='undefined'||navigator.onLine!==false)) cloudInit();
  else { pushOrders(); flushDeletes(); }
},60000);
if(typeof window==='object'&&window&&window.addEventListener) window.addEventListener('online',function(){ if(CLOUD.state==='error') cloudInit(); else { pushOrders(); flushDeletes(); } });
function cloudSignIn(){
  if(CLOUD.state!=='ready') return;
  var p=new firebase.auth.GoogleAuthProvider();
  return CLOUD.auth.signInWithPopup(p).then(function(){},function(e){
    if(e&&e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request') toast('Sign-in failed ('+((e&&e.code)||'error')+')');
  });
}
function cloudSignOut(){ if(CLOUD.auth) CLOUD.auth.signOut(); }
async function publishMenu(){
  if(CLOUD.state!=='ready'){toast('The cloud is not connected yet'); return;}
  if(!CLOUD.user){toast('Sign in first'); return;}
  var m=menuObj();
  if(!validMenu(m)){toast('The menu has a problem. Check every name and price.'); return;}
  var ver=Date.now();
  var payload={categories:m.categories,items:m.items,extras:m.extras,version:ver,updatedBy:CLOUD.user.email||''};
  try{
    var ts=firebase.firestore.FieldValue.serverTimestamp();
    var batch=CLOUD.db.batch();
    batch.set(CLOUD.db.collection('menu').doc('current'),Object.assign({updatedAt:ts},payload));
    batch.set(CLOUD.db.collection('menuHistory').doc(String(ver)),Object.assign({updatedAt:ts},payload));   // every save is kept, so an old menu can be recovered
    var done=batch.commit().then(function(){return 'saved'});
    done.catch(function(){});
    var res=await Promise.race([done,sleep(6000).then(function(){return 'queued'})]);
    S.menuVersion=ver; S.menuDirty=false; CLOUD.held=false; persistNow(); updateMenuBar(); refreshSettings();
    toast(res==='saved'?'Menu saved to all tablets':'Saved on this tablet. It will reach the others when the internet is back.');
  }catch(e){
    toast(e&&e.code==='permission-denied'?"This Google account isn't allowed to change the menu":'Could not save ('+((e&&(e.code||e.message))||'error')+')');
  }
}

/* ---------- Events ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-act]');
  if(!t){ if(e.target===$('#scrim')) closeSheet(); return; }
  var a=t.dataset.act, id=t.dataset.id, li=t.closest('.line'), i=li?+li.dataset.i:-1, l=i>=0?S.lines[i]:null;
  switch(a){
    case 'tab': S.tab=id; renderTabs(); renderItems(); break;
    case 'add': addItem(id); break;
    case 'idec': decItem(id); break;
    case 'inc': if(l){l.qty++; renderItems(); renderTabs(); renderLines(); renderTotals(); save();} break;
    case 'dec': if(l){ l.qty--; if(l.qty<1) S.lines.splice(i,1); renderItems(); renderTabs(); renderLines(); renderTotals(); save(); } break;
    case 'del': if(l){ S.lines.splice(i,1); renderItems(); renderTabs(); renderLines(); renderTotals(); save(); } break;
    case 'cust': openCust(i); break;
    case 'clear':
      var wipe=function(){S.lines=[];S.label='';$('#label').value='';renderAll();save();};
      if(S.lines.length) arm(t,'Tap again to clear',wipe); else wipe();
      break;
    case 'ticket': openTicket(); break;
    case 'pay': openPay(); break;
    case 'openOrder': $('#order').classList.add('open'); break;
    case 'closeOrder': $('#order').classList.remove('open'); break;
    case 'settings': openSettings(); break;
    case 'history': openHistory(); break;
    case 'export': exportOrders(t.dataset.v); break;
    case 'edit': openEdit(id); break;
    case 'eq':
      var el=EO&&EO.lines[+t.dataset.i]; if(el){ el.q+=+t.dataset.v; if(el.q<1) EO.lines.splice(+t.dataset.i,1); renderEdit(); }
      break;
    case 'edel': if(EO){ EO.lines.splice(+t.dataset.i,1); renderEdit(); } break;
    case 'ehow': if(EO){ EO.how=t.dataset.v; renderEdit(); } break;
    case 'esave': saveEdit(); break;
    case 'ecancel': editBack(); break;
    case 'void': arm(t,'Tap again to void',function(){voidOrder(id)}); break;
    case 'dash': openDash(); break;
    case 'dashrange': DR=t.dataset.v; renderDash(); break;
    case 'backup': downloadBackup(); break;
    case 'shareBackup': shareBackup(); break;
    case 'bannerOff': BANNER_OFF=true; updateBanner(); break;
    case 'restoreOrders': doRestore(false); break;
    case 'restoreAll': doRestore(true); break;
    case 'printer': openPrinter(); break;
    case 'prpair':
      prPair().then(function(){
        S.print.auto=true; S.print.name=PR.dev.name||''; save(); prDot(); toast('Printer connected');
        if(S.sheet==='printer') renderPrinter();
      }).catch(function(e){
        if(!(e&&e.name==='NotFoundError')) PR.err=String((e&&e.message)||e);
        prDot(); if(S.sheet==='printer') renderPrinter();
      });
      break;
    case 'prtest':
      printTicket({n:'TEST',label:'',time:hhmm(Date.now()),items:[{q:1,name:'Test print',mods:['Printer is working']}]}).then(function(ok){
        toast(ok?'Test ticket sent':'Could not print: '+PR.err); if(S.sheet==='printer') renderPrinter();
      });
      break;
    case 'prdisc':
      try{PR.dev.gatt.disconnect()}catch(x){}
      PR.dev=null; PR.chr=null; PR.err=''; S.print.auto=false; S.print.name=''; save(); prDot(); renderPrinter();
      break;
    case 'prwidth': S.print.width=+t.dataset.v===58?58:80; save(); renderPrinter(); break;
    case 'printnow':
      printTicket(TKOBJ).then(function(ok){toast(ok?'Sent to printer':'Could not print: '+PR.err)});
      break;
    case 'close': closeSheet(); break;
    case 'coff': toggle(C.off,t.dataset.v); renderCust(); break;
    case 'cadd': toggle(C.add,t.dataset.v); renderCust(); break;
    case 'cnote': toggle(C.notes,t.dataset.v); renderCust(); break;
    case 'cdone': applyCust(); closeSheet(); renderAll(); save(); break;
    case 'copy': copyTicket(); break;
    case 'key': payKey(t.dataset.v); break;
    case 'quick': payQuick(t.dataset.v); break;
    case 'complete': complete('cash'); break;
    case 'card': complete('card'); break;
    case 'resetToday': arm(t,'Tap again to reset',function(){var td=todayStr();queueCloudDeletes(S.log.filter(function(o){return dayOf(o.t)===td}));S.log=S.log.filter(function(o){return dayOf(o.t)!==td});prunePushed();persistNow();syncOrders();flushDeletes();renderSettings();renderTotals();}); break;
    case 'resetMenu': arm(t,'Tap again to reset',function(){
      buildMenu(DEFAULT_MENU); menuChanged(); renderSettings(); toast('Menu reset to the built-in menu');
    }); break;
    case 'mAdd': menuAdd(t.dataset.v); break;
    case 'mUp': menuMove(id,-1); break;
    case 'mDown': menuMove(id,1); break;
    case 'mDel': arm(t,'Tap again to delete',function(){menuDelete(id)}); break;
    case 'xAdd': extraAdd(); break;
    case 'xDel': arm(t,'Tap again to delete',function(){extraDelete(id)}); break;
    case 'mSave': publishMenu(); break;
    case 'update': applyUpdate(); break;
    case 'install': installApp(); break;
    case 'mSignIn': cloudSignIn(); break;
    case 'mSignOut': cloudSignOut(); break;
    case 'mDiscard': if(CLOUD.latest) applyRemoteMenu(CLOUD.latest,false); break;
  }
});
document.addEventListener('input',onFormInput);
document.addEventListener('change',onFormInput);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&S.sheet){closeSheet();return;}
  if(S.sheet==='pay'&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
    if(/^[0-9.]$/.test(e.key)){payKey(e.key);e.preventDefault();}
    else if(e.key==='Backspace'){payKey('del');e.preventDefault();}
    else if(e.key==='Enter'){
      var b=document.querySelector('[data-act="complete"]');
      if(b&&!b.disabled){e.preventDefault();complete('cash');}
    }
  }
});

/* ---------- Installable app: offline, updates, screen on ---------- */
var PWA={reg:null,installEv:null,wake:null,wantReload:false};
function showUpdate(){ var el=$('#upd'); if(el) el.hidden=false; }
function applyUpdate(){
  persistNow(); PWA.wantReload=true;
  if(PWA.reg&&PWA.reg.waiting) PWA.reg.waiting.postMessage('skipWaiting'); else location.reload();
}
function pwaInit(){
  if(!('serviceWorker' in navigator)) return;
  var reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){ if(reloading||!PWA.wantReload) return; reloading=true; location.reload(); });
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      PWA.reg=reg;
      if(reg.waiting&&navigator.serviceWorker.controller) showUpdate();
      reg.addEventListener('updatefound',function(){
        var nw=reg.installing; if(!nw) return;
        nw.addEventListener('statechange',function(){ if(nw.state==='installed'&&navigator.serviceWorker.controller) showUpdate(); });
      });
      setInterval(function(){ reg.update().catch(function(){}); },3600000);
    }).catch(function(){});
  });
}
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); PWA.installEv=e; refreshSettings(); });
window.addEventListener('appinstalled',function(){ PWA.installEv=null; refreshSettings(); });
function installApp(){
  var ev=PWA.installEv; if(!ev) return;
  ev.prompt(); ev.userChoice.then(function(){ PWA.installEv=null; refreshSettings(); },function(){});
}
function wakeSync(){
  try{
    if(!S.awake){ if(PWA.wake){ PWA.wake.release(); PWA.wake=null; } return; }
    if(PWA.wake||!navigator.wakeLock||document.visibilityState!=='visible') return;
    navigator.wakeLock.request('screen').then(function(l){ PWA.wake=l; l.addEventListener('release',function(){ PWA.wake=null; }); },function(){});
  }catch(e){}
}
function netSync(){ var el=$('#net'); if(el) el.hidden=navigator.onLine!==false; }
window.addEventListener('online',netSync); window.addEventListener('offline',netSync);

/* ---------- Start ---------- */
load();
$('#label').value=S.label;
renderAll();
prInit();
loadIDB();
cloudInit();
pwaInit(); wakeSync(); netSync();
// write anything pending when the page is hidden or closed
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden') persistNow(); else wakeSync();});
if(window.addEventListener) window.addEventListener('pagehide',persistNow);
})();
