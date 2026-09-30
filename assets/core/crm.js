(function(){
'use strict';
/* =================== helpers =================== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EUR = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0,useGrouping:'always'});
const EUR2 = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2,useGrouping:'always'});
const eur = n => EUR.format(Math.round(n||0));
const eur2 = n => EUR2.format(n||0);
const pct = n => (Math.round(n*10)/10).toLocaleString('es-ES') + ' %';
const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const addDays = n => { const d = new Date(TODAY); d.setDate(d.getDate()+n); return d; };
const fmtD = d => d.toLocaleDateString('es-ES',{day:'2-digit',month:'short'});
const fmtDL = d => d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
const iso = d => d.toISOString().slice(0,10);
const hms = () => new Date().toLocaleTimeString('es-ES',{hour12:false});
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,2600); }
const I = {
  hoy:'<svg viewBox="0 0 24 24"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
  embudo:'<svg viewBox="0 0 24 24"><path d="M3 4h18l-7 8v6l-4 2v-8z"/></svg>',
  pres:'<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  obras:'<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>',
  fact:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  fin:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  ajustes:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  wa:'<svg viewBox="0 0 24 24"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.7z"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};

/* =================== configuración, tarifa y datos =================== */
const EMPRESA = window.CRM_EMPRESA;
const TARIFA = window.CRM_TARIFA;
const PHASES = [
  {id:'nuevo',n:'Nuevo',p:.05},{id:'contactado',n:'Contactado',p:.10},{id:'visita_ag',n:'Visita agendada',p:.20},
  {id:'visita_ok',n:'Visita hecha',p:.30},{id:'pres_prep',n:'Presupuesto en preparación',p:.35},{id:'pres_env',n:'Presupuesto enviado',p:.45},
  {id:'negoc',n:'Negociación',p:.60},{id:'aceptado',n:'Aceptado',p:1}
];
const EXITS = [{id:'aplazado',n:'Aplazado'},{id:'perdido',n:'Perdido'}];
const PH = Object.fromEntries([...PHASES,...EXITS].map(p=>[p.id,p]));
const TIPOS = {bano:'Baño',cocina:'Cocina',pintura:'Pintura',integral:'Reforma integral'};
const ORIGENES = ['Web','Google Ads','Habitissimo','Instagram','Referido','Llamada'];

let seq = 100;
const S = window.CRM_DEMO;

/* ---- plantillas de obra ----
   id = clave estable de la partida; su precio [básica, media, alta] €/ud sale de CRM_TARIFA.partidas[id]
   q(p) = cantidad a partir de los parámetros; mat = lleva material */
const CAT = {
  bano:{params:[{k:'m2',n:'m² de suelo',v:5,step:.5},{k:'alto',n:'Altura de techo (m)',v:2.5,step:.05},{k:'sanit',n:'Nº de sanitarios',v:3,step:1},{k:'ducha',n:'Ducha o bañera',v:'ducha',opts:{ducha:'Plato de ducha',banera:'Bañera'}}],
    items:[
      {id:'bano.demolicion',cap:'Demolición',n:'Retirada de alicatado, solado y sanitarios',u:'m²',q:p=>p.m2+pared(p)},
      {id:'bano.residuos',cap:'Demolición',n:'Gestión de residuos y contenedor',u:'pa',q:()=>1},
      {id:'bano.fontaneria',cap:'Instalaciones',n:'Fontanería completa de baño',u:'pa',q:()=>1,mat:1},
      {id:'bano.electricidad',cap:'Instalaciones',n:'Electricidad: puntos de luz y enchufes',u:'pa',q:()=>1,mat:1},
      {id:'bano.solado',cap:'Revestimientos',n:'Solado con material incluido',u:'m²',q:p=>p.m2,mat:1},
      {id:'bano.alicatado',cap:'Revestimientos',n:'Alicatado de paredes con material',u:'m²',q:p=>pared(p),mat:1},
      {id:'bano.ducha',cap:'Equipamiento',n:p=>p.ducha==='banera'?'Bañera y grifería':'Plato de ducha y mampara',u:'ud',q:()=>1,mat:1},
      {id:'bano.sanitarios',cap:'Equipamiento',n:'Sanitarios y grifería',u:'ud',q:p=>Math.max(0,p.sanit-1),mat:1},
      {id:'bano.pintura_techo',cap:'Acabados',n:'Pintura de techo',u:'m²',q:p=>p.m2,mat:1},
      {id:'bano.limpieza',cap:'Acabados',n:'Limpieza final de obra',u:'pa',q:()=>1,opt:1}
    ]},
  cocina:{params:[{k:'ml',n:'Metros lineales de muebles',v:4,step:.1},{k:'m2',n:'m² de suelo',v:9,step:.5},{k:'electro',n:'Electrodomésticos',v:'si',opts:{si:'Incluidos',no:'No incluidos'}}],
    items:[
      {id:'cocina.desmontaje',cap:'Demolición',n:'Desmontaje de cocina existente',u:'pa',q:()=>1},
      {id:'cocina.residuos',cap:'Demolición',n:'Gestión de residuos y contenedor',u:'pa',q:()=>1},
      {id:'cocina.fontaneria',cap:'Instalaciones',n:'Fontanería de cocina',u:'pa',q:()=>1,mat:1},
      {id:'cocina.electricidad',cap:'Instalaciones',n:'Electricidad de cocina',u:'pa',q:()=>1,mat:1},
      {id:'cocina.solado',cap:'Revestimientos',n:'Solado con material incluido',u:'m²',q:p=>p.m2,mat:1},
      {id:'cocina.muebles',cap:'Mobiliario',n:'Muebles de cocina montados',u:'ml',q:p=>p.ml,mat:1},
      {id:'cocina.encimera',cap:'Mobiliario',n:'Encimera',u:'ml',q:p=>p.ml,mat:1},
      {id:'cocina.electrodomesticos',cap:'Mobiliario',n:'Electrodomésticos (placa, horno, campana, fregadero)',u:'pa',q:p=>p.electro==='si'?1:0,mat:1,opt:1},
      {id:'cocina.pintura',cap:'Acabados',n:'Pintura de paredes y techo',u:'m²',q:p=>Math.round(p.m2*3.8),mat:1},
      {id:'cocina.limpieza',cap:'Acabados',n:'Limpieza final de obra',u:'pa',q:()=>1,opt:1}
    ]},
  pintura:{params:[{k:'m2',n:'m² de vivienda',v:80,step:1},{k:'techos',n:'Techos',v:'si',opts:{si:'Incluidos',no:'No'}},{k:'alisado',n:'Alisado de gotelé',v:'no',opts:{si:'Sí',no:'No'}}],
    items:[
      {id:'pintura.proteccion',cap:'Preparación',n:'Protección de suelos y muebles',u:'pa',q:()=>1},
      {id:'pintura.alisado',cap:'Preparación',n:'Alisado de paredes (gotelé)',u:'m²',q:p=>p.alisado==='si'?Math.round(p.m2*2.8):0,mat:1},
      {id:'pintura.paredes',cap:'Pintura',n:'Pintura plástica de paredes, dos manos',u:'m²',q:p=>Math.round(p.m2*2.8),mat:1},
      {id:'pintura.techos',cap:'Pintura',n:'Pintura de techos',u:'m²',q:p=>p.techos==='si'?p.m2:0,mat:1},
      {id:'pintura.limpieza',cap:'Acabados',n:'Limpieza final',u:'pa',q:()=>1,opt:1}
    ]},
  integral:{params:[{k:'m2',n:'m² de vivienda',v:85,step:1},{k:'banos',n:'Nº de baños',v:1,step:1},{k:'cocina',n:'Cocina',v:'si',opts:{si:'Incluida',no:'No'}}],
    items:[
      {id:'integral.demolicion',cap:'Demolición',n:'Demolición general y retirada',u:'m²',q:p=>p.m2},
      {id:'integral.residuos',cap:'Demolición',n:'Gestión de residuos y contenedores',u:'pa',q:()=>1},
      {id:'integral.albanileria',cap:'Albañilería',n:'Tabiquería y albañilería',u:'m²',q:p=>p.m2,mat:1},
      {id:'integral.fontaneria',cap:'Instalaciones',n:'Fontanería general',u:'m²',q:p=>p.m2,mat:1},
      {id:'integral.electricidad',cap:'Instalaciones',n:'Instalación eléctrica nueva',u:'m²',q:p=>p.m2,mat:1},
      {id:'integral.solado',cap:'Revestimientos',n:'Solado con material incluido',u:'m²',q:p=>p.m2,mat:1},
      {id:'integral.bano',cap:'Estancias',n:'Baño completo',u:'ud',q:p=>p.banos,mat:1},
      {id:'integral.cocina',cap:'Estancias',n:'Cocina completa',u:'ud',q:p=>p.cocina==='si'?1:0,mat:1},
      {id:'integral.puertas',cap:'Carpintería',n:'Puertas de paso',u:'ud',q:p=>Math.max(1,Math.round(p.m2/12)),mat:1},
      {id:'integral.pintura',cap:'Acabados',n:'Pintura de paredes y techos',u:'m²',q:p=>Math.round(p.m2*3.8),mat:1},
      {id:'integral.limpieza',cap:'Acabados',n:'Limpieza final de obra',u:'pa',q:()=>1,opt:1}
    ]}
};
function pared(p){ return Math.round(4*Math.sqrt(p.m2)*p.alto*10)/10; }
const COSTE = TARIFA.coste;

/* ---- plantillas WhatsApp ---- */
const TPL = [
  {k:'nocontesta',n:'No contesta a la llamada',fases:['nuevo','contactado'],t:'Hola {nombre}, soy {comercial} de {empresa}. Te he llamado por tu consulta sobre la reforma de {tipo_obra}. ¿Cuándo te viene bien que hablemos?'},
  {k:'fotos',n:'Pedir fotos',fases:['contactado','visita_ag'],t:'Hola {nombre}, para llegar a la visita con una idea previa, ¿nos puedes mandar por aquí unas fotos de la zona a reformar? Gracias.'},
  {k:'confvisita',n:'Confirmar visita',fases:['visita_ag'],t:'Hola {nombre}, te confirmo la visita el {fecha_visita} a las {hora_visita} en {direccion}. Irá {tecnico}. Si necesitas cambiarla, respóndeme por aquí.'},
  {k:'recvisita',n:'Recordatorio de visita (24 h)',fases:['visita_ag'],t:'Hola {nombre}, te recuerdo que mañana a las {hora_visita} pasamos a ver tu reforma en {direccion}. ¡Hasta mañana!'},
  {k:'presenv',n:'Presupuesto enviado',fases:['pres_prep','pres_env'],t:'Hola {nombre}, aquí tienes el presupuesto de tu reforma: {enlace_presupuesto}. Si tienes cualquier duda, me dices y lo vemos.'},
  {k:'seg2',n:'Seguimiento día 2',fases:['pres_env'],t:'Hola {nombre}, ¿has podido ver el presupuesto? Si quieres, lo repasamos juntos en una llamada corta.'},
  {k:'seg10',n:'Seguimiento día 10',fases:['pres_env','negoc'],t:'Hola {nombre}, ¿cómo lo ves? Si hay algo que ajustar del presupuesto (calidades, plazos o forma de pago), lo revisamos sin problema.'},
  {k:'seg20',n:'Último seguimiento (día 20)',fases:['pres_env','negoc'],t:'Hola {nombre}, no quiero ser pesado: si ahora no es buen momento, dime y te escribo más adelante. El presupuesto sigue a tu disposición.'},
  {k:'bienvenida',n:'Aceptado (bienvenida)',fases:['aceptado'],t:'Gracias por confiar en {empresa}, {nombre}. En breve te pasamos la fecha de inicio y los siguientes pasos.'},
  {k:'hito',n:'Solicitud de pago (hito)',fases:['aceptado'],t:'Hola {nombre}, según lo firmado, corresponde el pago de {importe_hito} ({concepto_pago}). Te paso los datos por aquí.'},
  {k:'factura',n:'Factura emitida',fases:[],t:'Hola {nombre}, te paso la factura {num_factura}: {enlace_factura}. Cualquier duda, me dices.'},
  {k:'cobro',n:'Recordatorio de cobro',fases:[],t:'Hola {nombre}, te recuerdo que la factura {num_factura} vencía el {vencimiento}. Si ya la has pagado, ignora este mensaje. ¡Gracias!'},
  {k:'resena',n:'Reseña en Google',fases:[],t:'Hola {nombre}, ha sido un placer hacer tu reforma. Si estás contento con el resultado, nos ayudaría mucho una reseña: {enlace_resena}. ¡Gracias!'},
  {k:'aplazado',n:'Recontacto de aplazado',fases:['aplazado'],t:'Hola {nombre}, me comentaste que retomaríamos lo de la reforma por estas fechas. ¿Sigue en pie?'},
  {k:'recontacto',n:'Recontacto 12-24 meses',fases:['perdido'],t:'Hola {nombre}, soy {comercial} de {empresa}. Si tienes en mente algún proyecto en casa, aquí estamos para ayudarte.'}
];
const tplBy = k => TPL.find(t=>t.k===k);
function fill(t, v){
  const missing = [];
  const out = t.replace(/\{(\w+)\}/g,(m,k)=>{ if(v[k]===undefined||v[k]===null||v[k]===''){ missing.push(k); return m; } return v[k]; });
  return {text:out, missing:[...new Set(missing)]};
}
const waHref = text => 'https://wa.me/?text=' + encodeURIComponent(text);
function leadVars(l, extra={}){
  const v = {nombre:l.nombre.split(' ')[0], comercial:EMPRESA.comercial, empresa:EMPRESA.nombre, tipo_obra:(TIPOS[l.tipo]||'').toLowerCase(), direccion:l.dir, enlace_resena:EMPRESA.resena};
  if(l.visita){ v.fecha_visita = fmtDL(addDays(l.visita.d)); v.hora_visita = l.visita.h; v.tecnico = l.visita.tec; }
  if(l.prLink) v.enlace_presupuesto = l.prLink;
  return Object.assign(v, extra);
}

/* =================== navegación =================== */
const VIEWS = [
  {id:'hoy',n:'Hoy',ic:I.hoy,title:'Hoy',sub:()=>fmtDL(TODAY)},
  {id:'embudo',n:'Embudo',ic:I.embudo,title:'Embudo de ventas',sub:()=>'Arrastra las tarjetas entre fases. Toca una para abrir la ficha.'},
  {id:'presupuestos',n:'Presupuestos',ic:I.pres,title:'Presupuestador',sub:()=>'Pon los datos del cliente y de la obra: el resto se rellena solo.'},
  {id:'obras',n:'Obras',ic:I.obras,title:'Obras en curso',sub:()=>'Avance, cobros por hitos y coste real frente a lo presupuestado.'},
  {id:'facturas',n:'Facturas',ic:I.fact,title:'Facturas',sub:()=>'Archivo de facturas y control de cobro.'},
  {id:'finanzas',n:'Finanzas',ic:I.fin,title:'Finanzas',sub:()=>'Margen, coste de material, ROI por canal, MRR y previsión.'},
  {id:'ajustes',n:'Ajustes',ic:I.ajustes,title:'Ajustes',sub:()=>'Tarifa de partidas y plantillas de WhatsApp.'}
];
let current = 'hoy';
function renderNav(){
  const nuevos = S.leads.filter(l=>l.fase==='nuevo').length;
  $('#nav').innerHTML = VIEWS.map(v=>`<button type="button" data-view="${v.id}" ${v.id===current?'aria-current="page"':''}>${v.ic}<span>${v.n}</span>${v.id==='embudo'&&nuevos?`<span class="badge r">${nuevos}</span>`:''}</button>`).join('');
}
function go(id, opts){
  current = id; renderNav();
  const v = VIEWS.find(x=>x.id===id);
  const m = $('#main');
  m.innerHTML = `<div class="top"><div><h1>${v.title}</h1><p>${esc(v.sub())}</p></div><span class="live"><i></i>flujo activo · ${EMPRESA.nombre}</span></div><div id="view"></div>`;
  ({hoy:vHoy,embudo:vEmbudo,presupuestos:vPres,obras:vObras,facturas:vFacturas,finanzas:vFinanzas,ajustes:vAjustes})[id](opts||{});
  try{ history.replaceState(null,'', id==='hoy' ? location.pathname+location.search : '#'+id); }catch(e){}
  window.scrollTo(0,0);
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-view]'); if(b){ go(b.dataset.view); }
});

/* =================== HOY =================== */
function tasksHoy(){
  const T = [];
  S.leads.forEach(l=>{
    if(l.fase==='nuevo') T.push({id:'call'+l.id,lead:l,dot:l.minSin>30?'r':'a',t:`Llamar a ${l.nombre}`,s:`${TIPOS[l.tipo]} · ${l.pob} · sin contactar hace ${l.minSin} min${l.minSin>30?' (fuera de SLA)':''}`,tpl:'nocontesta',act:'Llamada hecha'});
    if(l.fase==='visita_ag' && l.visita && l.visita.d===1) T.push({id:'rec'+l.id,lead:l,dot:'p',t:`Recordatorio de visita a ${l.nombre}`,s:`Mañana ${l.visita.h} · ${l.dir}`,tpl:'recvisita'});
    if(l.fase==='pres_prep') T.push({id:'pp'+l.id,lead:l,dot:'a',t:`Terminar presupuesto de ${l.nombre}`,s:`Comprometido para ${l.entregaEn===1?'mañana':'hoy'} · ${TIPOS[l.tipo]}`,goPres:true});
    if(l.fase==='pres_env' && l.enviadoHace===2) T.push({id:'s2'+l.id,lead:l,dot:'p',t:`Seguimiento día 2 · ${l.nombre}`,s:'Ha abierto el presupuesto 3 veces',tpl:'seg2'});
    if(l.fase==='pres_env' && l.enviadoHace===10) T.push({id:'s10'+l.id,lead:l,dot:'p',t:`Seguimiento día 10 · ${l.nombre}`,s:'Está comparando con otra empresa',tpl:'seg10'});
  });
  S.facturas.filter(f=>f.estado==='pendiente'&&f.vence<0).forEach(f=>T.push({id:'cob'+f.num,fact:f,dot:'r',t:`Cobro vencido · ${f.num}`,s:`${f.cliente} · ${eur(f.imp)} · venció hace ${-f.vence} días`,tpl:'cobro'}));
  (S.extraTasks||[]).forEach(x=>T.push(x));
  return T.filter(t=>!S.done.has(t.id));
}
function vHoy(){
  const T = tasksHoy();
  const nuevos = S.leads.filter(l=>l.fase==='nuevo');
  const sla = nuevos.filter(l=>l.minSin>30).length;
  const visitas = S.leads.filter(l=>l.visita && l.visita.d===0 && l.fase==='visita_ag');
  const porEnviar = S.leads.filter(l=>l.fase==='pres_prep').length;
  const waPend = T.filter(t=>t.tpl).length;
  const vencidas = S.facturas.filter(f=>f.estado==='pendiente'&&f.vence<0);
  $('#view').innerHTML = `
  <div class="kpis">
    <div class="card kpi"><b>${nuevos.length}</b><span>Leads sin contactar</span></div>
    <div class="card kpi ${sla?'alert':''}"><b>${sla}</b><span>Fuera de SLA (30 min)</span></div>
    <div class="card kpi"><b>${visitas.length}</b><span>Visitas hoy</span></div>
    <div class="card kpi ${porEnviar?'warn':''}"><b>${porEnviar}</b><span>Presupuestos por enviar</span></div>
    <div class="card kpi"><b>${waPend}</b><span>WhatsApp preparados</span></div>
    <div class="card kpi ${vencidas.length?'alert':''}"><b>${eur(vencidas.reduce((a,f)=>a+f.imp,0))}</b><span>Cobros vencidos</span></div>
  </div>
  <div class="hoy-grid">
    <section class="card pad"><h2 class="h2">Tareas de hoy <small>${T.length} pendientes</small></h2>
      <div id="tasks">${T.length?T.map(taskRow).join(''):'<p class="muted">Todo al día.</p>'}</div>
    </section>
    <div class="grid">
      <section class="card pad"><h2 class="h2">Agenda <small>visitas</small></h2>
        ${S.leads.filter(l=>l.visita&&l.fase==='visita_ag').sort((a,b)=>a.visita.d-b.visita.d).map(l=>`<div class="agenda-item"><time>${l.visita.d===0?'Hoy':'Mañ.'}<br>${l.visita.h}</time><div><b>${esc(l.nombre)}</b><br><small class="muted">${esc(l.dir)} · ${TIPOS[l.tipo]} · ${esc(l.visita.tec)}</small></div></div>`).join('')}
      </section>
      <section class="card pad"><h2 class="h2">Resumen Telegram 8:00 <small>lo que recibe el gerente</small></h2>
        <div class="wa-preview" style="background:#0d1320;border-color:rgba(124,77,255,.3);color:#dcd6ff">Buenos días. Hoy: ${nuevos.length} leads nuevos (${sla} fuera de SLA), ${visitas.length} visita, ${porEnviar} presupuesto por enviar. Pipeline abierto: ${eur(pipelineAbierto())}. Cobros vencidos: ${eur(vencidas.reduce((a,f)=>a+f.imp,0))}.</div>
      </section>
    </div>
  </div>`;
  bindTasks();
}
function taskRow(t){
  return `<div class="task" data-task="${t.id}"><span class="dot ${t.dot}"></span><div class="t"><b>${esc(t.t)}</b><small>${esc(t.s)}</small></div><div class="acts">
    ${t.tpl?`<button class="btn wa sm" data-wa="${t.id}">${I.wa}WhatsApp</button>`:''}
    ${t.goPres?`<button class="btn sm primary" data-gopres="${t.lead.id}">Abrir presupuestador</button>`:''}
    ${t.lead?`<button class="btn sm" data-open="${t.lead.id}">Ficha</button>`:''}
    <button class="btn sm ghost" data-done="${t.id}" aria-label="Marcar hecha">✓</button></div></div>`;
}
function bindTasks(){
  const T = tasksHoy();
  $$('[data-wa]').forEach(b=>b.onclick=()=>{ const t=T.find(x=>x.id===b.dataset.wa); if(t.fact) openWA({fact:t.fact, tpl:t.tpl, taskId:t.id}); else openWA({lead:t.lead, tpl:t.tpl, taskId:t.id}); });
  $$('[data-done]').forEach(b=>b.onclick=()=>{ S.done.add(b.dataset.done); vHoy(); toast('Tarea completada'); });
  $$('[data-open]').forEach(b=>b.onclick=()=>openLead(+b.dataset.open));
  $$('[data-gopres]').forEach(b=>b.onclick=()=>go('presupuestos',{leadId:+b.dataset.gopres}));
}
function pipelineAbierto(){ return S.leads.filter(l=>PHASES.some(p=>p.id===l.fase)&&l.fase!=='aceptado').reduce((a,l)=>a+l.importe,0); }

/* =================== EMBUDO =================== */
let filtro = {origen:'',tipo:''};
function vEmbudo(){
  const f = l => (!filtro.origen||l.origen===filtro.origen)&&(!filtro.tipo||l.tipo===filtro.tipo);
  const cols = [...PHASES,...EXITS];
  $('#view').innerHTML = `
  <div class="filters">
    <select class="in" id="fo" aria-label="Filtrar por origen"><option value="">Todos los orígenes</option>${ORIGENES.map(o=>`<option ${filtro.origen===o?'selected':''}>${o}</option>`).join('')}</select>
    <select class="in" id="ft" aria-label="Filtrar por tipo de obra"><option value="">Todos los tipos</option>${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}" ${filtro.tipo===k?'selected':''}>${v}</option>`).join('')}</select>
    <button class="btn" id="nuevoLead">${I.plus}Nuevo lead</button>
    <span class="muted" style="margin-left:auto;font-size:12.5px">Pipeline abierto <b class="num" style="color:var(--text)">${eur(pipelineAbierto())}</b> · ponderado <b class="num" style="color:var(--text)">${eur(ponderado())}</b></span>
  </div>
  <div class="board-wrap"><div class="board" id="board">
    ${cols.map(c=>{ const ls=S.leads.filter(l=>l.fase===c.id&&f(l)); return `<section class="col ${EXITS.some(e=>e.id===c.id)?'exit':''}" data-col="${c.id}" aria-label="${c.n}"><header><b>${c.n}</b><small>${ls.length} · ${eur(ls.reduce((a,l)=>a+l.importe,0))}</small></header>${ls.map(leadCard).join('')}</section>`; }).join('')}
  </div></div>`;
  $('#fo').onchange=e=>{filtro.origen=e.target.value;vEmbudo();};
  $('#ft').onchange=e=>{filtro.tipo=e.target.value;vEmbudo();};
  $('#nuevoLead').onclick=nuevoLead;
  $$('.lead').forEach(el=>{
    el.addEventListener('dragstart',e=>{el.classList.add('dragging');e.dataTransfer.setData('text/plain',el.dataset.id);e.dataTransfer.effectAllowed='move';});
    el.addEventListener('dragend',()=>el.classList.remove('dragging'));
    el.addEventListener('click',()=>openLead(+el.dataset.id));
    el.addEventListener('keydown',e=>{if(e.key==='Enter')openLead(+el.dataset.id);});
  });
  $$('.col').forEach(col=>{
    col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('over');});
    col.addEventListener('dragleave',()=>col.classList.remove('over'));
    col.addEventListener('drop',e=>{e.preventDefault();col.classList.remove('over');moveLead(+e.dataTransfer.getData('text/plain'),col.dataset.col);});
  });
}
function leadCard(l){
  return `<article class="lead" draggable="true" tabindex="0" data-id="${l.id}"><b>${esc(l.nombre)}</b>
  <div class="meta"><span>${TIPOS[l.tipo]} · ${esc(l.pob)}</span><span class="num">${eur(l.importe)}</span></div>
  <div class="foot"><span class="badge n">${esc(l.origen)}</span>${l.fase==='nuevo'&&l.minSin>30?`<span class="sla">SLA ${l.minSin} min</span>`:''}${l.visto&&l.fase==='pres_env'?'<span class="badge g">visto</span>':''}${l.fase==='aplazado'?`<span class="badge a">${fmtD(addDays(l.recontacto))}</span>`:''}${l.fase==='perdido'?`<span class="badge r">${esc(l.motivo)}</span>`:''}<span class="score ${l.score>=75?'hi':''}" title="Puntuación del lead">${l.score}</span></div></article>`;
}
function ponderado(){ return S.leads.filter(l=>PHASES.some(p=>p.id===l.fase)&&l.fase!=='aceptado').reduce((a,l)=>a+l.importe*PH[l.fase].p,0); }
function moveLead(id,fase,motivo){
  const l = S.leads.find(x=>x.id===id); if(!l||l.fase===fase) return;
  if(fase==='perdido'&&!motivo){ return askMotivo(l); }
  if(fase==='aplazado'&&!l.recontacto){ l.recontacto=30; }
  const from = PH[l.fase].n; l.fase = fase; if(fase!=='nuevo') l.minSin=0;
  log(l.id,`Fase: ${from} → ${PH[fase].n}`,'ok');
  if(fase==='aceptado'){ toast('Venta cerrada · aviso Telegram enviado'); }
  else toast(`${l.nombre} → ${PH[fase].n}`);
  if(current==='embudo') vEmbudo();
}
function log(id,x,k){ (S.timeline[id]=S.timeline[id]||[]).push({t:'Ahora '+hms().slice(0,5),x,k}); }
function nuevoLead(){
  modal(`<header><h2>Nuevo lead</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body grid">
    <div class="two"><label class="f">Nombre<input class="in" id="nl-n" placeholder="Nombre y apellidos"></label><label class="f">Población<input class="in" id="nl-p" placeholder="Majadahonda"></label></div>
    <div class="two"><label class="f">Tipo de obra<select class="in" id="nl-t">${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="f">Origen<select class="in" id="nl-o">${ORIGENES.map(o=>`<option>${o}</option>`).join('')}</select></label></div>
    <label class="f">Dirección de la obra<input class="in" id="nl-d"></label>
    <label class="f">Qué necesita<textarea class="in" id="nl-x" style="min-height:70px"></textarea></label>
    <p class="faint" style="margin:0;font-size:12px">En el producto real: se comprueba si el teléfono ya existe, se calcula la puntuación y llega el aviso por Telegram.</p>
  </div><footer><button class="btn" data-close>Cancelar</button><button class="btn primary" id="nl-ok">Crear lead</button></footer>`);
  $('#nl-ok').onclick=()=>{ const n=$('#nl-n').value.trim(); if(!n){$('#nl-n').focus();return;}
    const l={id:++seq,nombre:n,tel:'',pob:$('#nl-p').value.trim()||'—',dir:$('#nl-d').value.trim()||'—',tipo:$('#nl-t').value,origen:$('#nl-o').value,fase:'nuevo',score:60,importe:{bano:9500,cocina:14000,pintura:3000,integral:55000}[$('#nl-t').value],minSin:0,desc:$('#nl-x').value.trim()};
    S.leads.unshift(l); log(l.id,'Lead creado a mano'); closeModal(); vEmbudo(); renderNav(); toast('Lead creado'); };
}
function askMotivo(l){
  modal(`<header><h2>Marcar como perdido</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body grid"><p class="muted" style="margin:0">El motivo es obligatorio: alimenta el informe de pérdidas.</p>
  <label class="f">Motivo<select class="in" id="mv">${['Precio','Plazo','Eligió otra empresa','No hace la obra','No responde'].map(m=>`<option>${m}</option>`).join('')}</select></label>
  <p class="faint" style="margin:0;font-size:12px">"No hace la obra" y "No responde" entran en seguimiento a 3 y 6 meses.</p></div>
  <footer><button class="btn" data-close>Cancelar</button><button class="btn primary" id="mv-ok">Guardar</button></footer>`);
  $('#mv-ok').onclick=()=>{ l.motivo=$('#mv').value; closeModal(); moveLead(l.id,'perdido',l.motivo); };
}

/* =================== FICHA =================== */
function openLead(id){
  const l = S.leads.find(x=>x.id===id); if(!l) return;
  const tl = (S.timeline[id]||[{t:'Hace 2 días',x:'Lead creado · origen '+l.origen}]);
  const prs = S.pres.filter(p=>p.leadId===l.id);
  modal(`<header><h2>${esc(l.nombre)} <span class="badge">${PH[l.fase].n}</span></h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body"><div class="fic-grid">
    <div>
      <dl class="kv">
        <dt>Obra</dt><dd>${TIPOS[l.tipo]} · <span class="num">${eur(l.importe)}</span> estimado</dd>
        <dt>Dirección</dt><dd>${esc(l.dir)}, ${esc(l.pob)}</dd>
        <dt>Origen</dt><dd>${esc(l.origen)}</dd>
        <dt>Puntuación</dt><dd><span class="score ${l.score>=75?'hi':''}">${l.score}/100</span></dd>
        <dt>Teléfono</dt><dd class="faint">oculto en la demo</dd>
        ${l.visita?`<dt>Visita</dt><dd>${fmtDL(addDays(l.visita.d))}, ${l.visita.h} · ${esc(l.visita.tec)}</dd>`:''}
        ${l.fase==='aplazado'?`<dt>Recontacto</dt><dd>${fmtDL(addDays(l.recontacto))}</dd>`:''}
        ${l.motivo?`<dt>Motivo pérdida</dt><dd>${esc(l.motivo)}</dd>`:''}
      </dl>
      <p class="muted" style="margin:14px 0 0">${esc(l.desc||'')}</p>
      <h3 class="h2" style="font-size:13px;margin-top:16px">Presupuestos</h3>
      ${prs.length?`<div class="fic-pres">${prs.map((p,i)=>`<div class="fic-pr"><div><b class="num">${esc(p.num)}</b> <span class="badge ${p.estado==='aceptado'?'g':'a'}">${esc(p.estado)}</span><br><small class="muted">${fmtD(addDays(p.doc.fecha))} · <span class="num">${eur2(p.total)}</span></small></div><div class="row" style="gap:6px"><button class="btn sm" data-pver="${i}">${I.eye}Ver</button><button class="btn sm" data-ppdf="${i}">${I.pres}Descargar PDF</button></div></div>`).join('')}</div>`:'<p class="faint" style="margin:0;font-size:12.5px">Aún no hay presupuestos</p>'}
      <label class="f" style="margin-top:16px">Mover a fase<select class="in" id="fx-fase">${[...PHASES,...EXITS].map(p=>`<option value="${p.id}" ${p.id===l.fase?'selected':''}>${p.n}</option>`).join('')}</select></label>
    </div>
    <div><h3 class="h2" style="font-size:13px">Línea de tiempo</h3><ul class="timeline">${tl.slice().reverse().map(e=>`<li class="${e.k||''}"><time>${esc(e.t)}</time>${esc(e.x)}</li>`).join('')}</ul></div>
  </div></div>
  <footer>
    <button class="btn" data-close>Cerrar</button>
    <button class="btn" id="fx-pres">${I.pres}Crear presupuesto</button>
    <button class="btn wa" id="fx-wa">${I.wa}WhatsApp</button>
  </footer>`);
  $('#fx-fase').onchange=e=>{ const v=e.target.value; closeModal(); moveLead(l.id,v); if(current!=='embudo'&&current==='hoy') vHoy(); };
  $('#fx-wa').onclick=()=>openWA({lead:l});
  $$('[data-pver]').forEach(b=>b.onclick=()=>verDoc(prs[+b.dataset.pver].doc, false));
  $$('[data-ppdf]').forEach(b=>b.onclick=()=>printDoc(prs[+b.dataset.ppdf].doc));
  $('#fx-pres').onclick=()=>{ closeModal(); go('presupuestos',{leadId:l.id}); };
}

/* =================== WhatsApp de un clic =================== */
function openWA({lead, fact, tpl, taskId, extra}){
  const opts = lead ? TPL.filter(t=>t.fases.includes(lead.fase)).concat(TPL.filter(t=>!t.fases.includes(lead.fase)&&t.fases.length)) : TPL.filter(t=>['factura','cobro'].includes(t.k));
  let sel = tpl || (opts[0]&&opts[0].k) || 'nocontesta';
  const vars = () => {
    if(fact) return {nombre:fact.cliente.split(' ')[0], num_factura:fact.num, vencimiento:fmtD(addDays(fact.vence)), enlace_factura:`https://${EMPRESA.web}/f/${fact.num.toLowerCase()}-demo`};
    return leadVars(lead, extra||{});
  };
  const draw = (keepText) => {
    const f = fill(tplBy(sel).t, vars());
    const ta = $('#wa-text'); if(!keepText) ta.value = f.text;
    const txt = ta.value; const miss = (txt.match(/\{(\w+)\}/g)||[]).map(s=>s.slice(1,-1));
    $('#wa-prev').textContent = txt;
    const a = $('#wa-open'); const bad = miss.length>0;
    a.href = bad ? '#' : waHref(txt); a.setAttribute('aria-disabled', bad?'true':'false');
    $('#wa-miss').innerHTML = bad ? `Falta: <b>${miss.map(esc).join(', ')}</b>. El botón se bloquea para no enviar un mensaje con huecos.` : '';
  };
  const who = fact ? fact.cliente : lead.nombre;
  modal(`<header><h2>WhatsApp a ${esc(who)}</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body grid">
    <label class="f">Plantilla<select class="in" id="wa-tpl">${(fact?opts:TPL).map(t=>`<option value="${t.k}" ${t.k===sel?'selected':''}>${esc(t.n)}${lead&&t.fases.includes(lead.fase)?' · recomendada':''}</option>`).join('')}</select></label>
    <label class="f">Texto (puedes retocarlo)<textarea class="in" id="wa-text"></textarea></label>
    <div><div class="faint" style="font-size:11.5px;margin-bottom:6px">Así lo verá el cliente</div><div class="wa-preview" id="wa-prev"></div><div class="missing" id="wa-miss"></div></div>
    <p class="faint" style="margin:0;font-size:12px">En la demo el enlace se abre <b>sin teléfono</b>: WhatsApp te deja elegir el contacto. En el producto irá directo al número del cliente.</p>
  </div>
  <footer><button class="btn" id="wa-copy">${I.copy}Copiar texto</button><a class="btn wa" id="wa-open" href="#" target="_blank" rel="noopener">${I.wa}Abrir WhatsApp</a></footer>`);
  $('#wa-tpl').onchange=e=>{sel=e.target.value;draw(false);};
  $('#wa-text').oninput=()=>draw(true);
  $('#wa-copy').onclick=async()=>{ const t=$('#wa-text'); try{ await navigator.clipboard.writeText(t.value); toast('Texto copiado'); }catch(e){ t.select(); toast('Selecciona y copia con Ctrl+C'); } };
  $('#wa-open').addEventListener('click',e=>{
    if($('#wa-open').getAttribute('aria-disabled')==='true'){e.preventDefault();return;}
    setTimeout(()=>askSent(lead,fact,sel,taskId),300);
  });
  draw(false);
}
function askSent(lead,fact,sel,taskId){
  modal(`<header><h2>¿Lo has enviado?</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body"><p class="muted" style="margin:0">El CRM no puede saber si el mensaje llegó: lo apunta quien lo envía.</p></div>
  <footer><button class="btn" data-close>No</button><button class="btn primary" id="sent-ok">Sí, enviado</button></footer>`);
  $('#sent-ok').onclick=()=>{ if(lead) log(lead.id,`WhatsApp enviado · ${tplBy(sel).n}`,'wa'); if(taskId) S.done.add(taskId); closeModal(); toast('Registrado en la línea de tiempo'); if(current==='hoy') vHoy(); };
}

/* =================== PRESUPUESTADOR =================== */
let P = null;
function newP(leadId){
  const l = leadId ? S.leads.find(x=>x.id===leadId) : null;
  const tipo = l ? l.tipo : 'bano';
  P = {leadId: l?l.id:null, cli:{nombre:l?l.nombre:'',tel:'',email:'',dir:l?`${l.dir}, ${l.pob}`:'',nif:''}, tipo, cal:1, modo:'definitivo', params:defParams(tipo), over:{}, off:{}, iva:EMPRESA.iva, num:`PR-2026-0${S.nextPR}`};
}
function defParams(tipo){ return Object.fromEntries(CAT[tipo].params.map(p=>[p.k,p.v])); }
function lines(){
  const c = CAT[P.tipo]; const out=[];
  c.items.forEach((it,i)=>{
    const q0 = +it.q(P.params) || 0; if(q0<=0 && !P.over[i]) return;
    const pr0 = (TARIFA.partidas[it.id]||[])[P.cal];
    const o = P.over[i]||{};
    const q = o.q!==undefined ? o.q : Math.round(q0*10)/10;
    const pr = o.pr!==undefined ? o.pr : pr0;
    const on = !P.off[i];
    out.push({i,cap:it.cap,n:typeof it.n==='function'?it.n(P.params):it.n,u:it.u,q,pr,imp:q*pr,on,opt:!!it.opt,mat:!!it.mat});
  });
  return out;
}
function totals(L){ const base=L.filter(x=>x.on).reduce((a,x)=>a+x.imp,0); const iva=base*P.iva/100; return {base,iva,total:base+iva}; }
function vPres(opts){
  if(!P || opts.leadId) newP(opts.leadId);
  const leadsSel = S.leads.filter(l=>!['aceptado','perdido'].includes(l.fase));
  $('#view').innerHTML = `<div class="pres-grid">
    <section class="card" aria-label="Datos del presupuesto">
      <div class="form-sec"><h3>1 · Cliente</h3>
        <label class="f">Cargar desde un lead<select class="in" id="p-lead"><option value="">— Cliente nuevo —</option>${leadsSel.map(l=>`<option value="${l.id}" ${P.leadId===l.id?'selected':''}>${esc(l.nombre)} · ${TIPOS[l.tipo]}</option>`).join('')}</select></label>
        <div class="grid" style="gap:10px;margin-top:10px">
          <label class="f">Nombre<input class="in" data-cli="nombre" value="${esc(P.cli.nombre)}" placeholder="Nombre y apellidos"></label>
          <div class="two"><label class="f">Teléfono<input class="in" data-cli="tel" value="${esc(P.cli.tel)}" inputmode="tel" placeholder="600 000 000"></label><label class="f">Email<input class="in" data-cli="email" value="${esc(P.cli.email)}" placeholder="opcional"></label></div>
          <label class="f">Dirección de la obra<input class="in" data-cli="dir" value="${esc(P.cli.dir)}"></label>
          <label class="f">NIF/DNI<input class="in" data-cli="nif" value="${esc(P.cli.nif)}" placeholder="opcional"></label>
        </div>
      </div>
      <div class="form-sec"><h3>2 · Obra</h3>
        <label class="f">Tipo de obra<select class="in" id="p-tipo">${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}" ${P.tipo===k?'selected':''}>${v}</option>`).join('')}</select></label>
        <div class="two" style="margin-top:10px" id="p-params">${CAT[P.tipo].params.map(p=>p.opts?`<label class="f">${p.n}<select class="in" data-par="${p.k}">${Object.entries(p.opts).map(([k,v])=>`<option value="${k}" ${P.params[p.k]===k?'selected':''}>${v}</option>`).join('')}</select></label>`:`<label class="f">${p.n}<input class="in num" type="number" min="0" step="${p.step}" data-par="${p.k}" value="${P.params[p.k]}"></label>`).join('')}</div>
        <div style="margin-top:12px" class="f"><span style="font-size:12px;color:var(--muted)">Calidad</span><div class="seg" role="group" aria-label="Calidad">${['Básica','Media','Alta'].map((c,i)=>`<button type="button" data-cal="${i}" aria-pressed="${P.cal===i}">${c}</button>`).join('')}</div></div>
        <div style="margin-top:12px" class="f"><span style="font-size:12px;color:var(--muted)">Tipo de documento</span><div class="seg" role="group" aria-label="Modo">${[['estimacion','Estimación previa'],['definitivo','Definitivo']].map(([k,n])=>`<button type="button" data-modo="${k}" aria-pressed="${P.modo===k}">${n}</button>`).join('')}</div></div>
      </div>
      <div class="form-sec"><h3>3 · Condiciones</h3>
        <div class="two"><label class="f">IVA aplicado<select class="in" id="p-iva">${[21,10].map(v=>`<option value="${v}" ${P.iva===v?'selected':''}>${v} %</option>`).join('')}</select></label><label class="f">Validez<input class="in" value="${EMPRESA.validez} días" disabled></label></div>
        <p class="faint" style="font-size:11.5px;margin:8px 0 0">El tipo de IVA lo decide la empresa con su gestoría; el CRM solo lo aplica.</p>
      </div>
    </section>
    <section class="card doc" id="doc" aria-live="polite"></section>
  </div>`;
  $('#p-lead').onchange=e=>{ newP(e.target.value?+e.target.value:null); vPres({}); };
  $$('[data-cli]').forEach(i=>i.oninput=()=>{P.cli[i.dataset.cli]=i.value;});
  $('#p-tipo').onchange=e=>{ P.tipo=e.target.value; P.params=defParams(P.tipo); P.over={}; P.off={}; vPres({}); };
  $$('[data-par]').forEach(i=>i.oninput=()=>{ P.params[i.dataset.par]= i.type==='number' ? (parseFloat(i.value)||0) : i.value; P.over={}; drawDoc(); });
  $$('[data-cal]').forEach(b=>b.onclick=()=>{ P.cal=+b.dataset.cal; P.over={}; $$('[data-cal]').forEach(x=>x.setAttribute('aria-pressed',x===b)); drawDoc(); });
  $$('[data-modo]').forEach(b=>b.onclick=()=>{ P.modo=b.dataset.modo; $$('[data-modo]').forEach(x=>x.setAttribute('aria-pressed',x===b)); drawDoc(); });
  $('#p-iva').onchange=e=>{P.iva=+e.target.value;drawDoc();};
  drawDoc();
}
function drawDoc(){
  const L = lines(); const T = totals(L); let cap='';
  const est = P.modo==='estimacion';
  const rows = L.map(x=>{ let h=''; if(x.cap!==cap){cap=x.cap;h+=`<tr class="cap"><td colspan="5">${esc(cap)}</td></tr>`;}
    return h+`<tr class="${x.on?'':'li-off'}"><td>${x.opt?`<input type="checkbox" aria-label="Incluir partida" data-on="${x.i}" ${x.on?'checked':''}> `:''}${esc(x.n)}</td><td>${x.u}</td>
      <td class="n"><input class="in li-in num" type="number" step="0.1" min="0" data-q="${x.i}" value="${x.q}" aria-label="Cantidad"></td>
      <td class="n"><input class="in li-in num" type="number" step="1" min="0" data-pr="${x.i}" value="${x.pr}" aria-label="Precio unitario"></td>
      <td class="n num" data-imp="${x.i}">${eur2(x.imp)}</td></tr>`; }).join('');
  $('#doc').innerHTML = `
    <div class="doc-head"><div><span class="ref">${P.num} · ${est?'ESTIMACIÓN PREVIA':'PRESUPUESTO'}</span><h2>${TIPOS[P.tipo]} · ${esc(P.cli.nombre||'Cliente sin nombre')}</h2><small class="muted">${esc(P.cli.dir||'Sin dirección')} · ${fmtD(TODAY)} · válido ${EMPRESA.validez} días · plazo estimado ${TARIFA.plazos[P.tipo]}</small></div>
    <div class="row"><button class="btn" id="d-view">${I.eye}Vista del cliente</button><button class="btn" id="d-pdf">${I.pres}Descargar PDF</button><button class="btn wa" id="d-wa">${I.wa}Enviar por WhatsApp</button></div></div>
    <p class="faint" style="font-size:12px;margin:0 0 10px">Todo se ha rellenado solo con la tarifa. Puedes cambiar cualquier cantidad o precio antes de enviarlo.</p>
    <div class="tbl-wrap"><table><thead><tr><th>Partida</th><th>Ud.</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="totals" id="d-tot"></div>
    <div class="hitos" id="d-hitos"></div>
    ${est?'<p class="warn-line">Estimación previa: se enseña al cliente como horquilla orientativa (−10 % / +15 %) hasta hacer la visita.</p>':''}`;
  drawTotals();
  $$('[data-q]').forEach(i=>i.oninput=()=>{ (P.over[i.dataset.q]=P.over[i.dataset.q]||{}).q=parseFloat(i.value)||0; refreshLine(i.dataset.q); });
  $$('[data-pr]').forEach(i=>i.oninput=()=>{ (P.over[i.dataset.pr]=P.over[i.dataset.pr]||{}).pr=parseFloat(i.value)||0; refreshLine(i.dataset.pr); });
  $$('[data-on]').forEach(i=>i.onchange=()=>{ P.off[i.dataset.on]=!i.checked; i.closest('tr').classList.toggle('li-off',!i.checked); drawTotals(); });
  $('#d-view').onclick=clientView;
  $('#d-pdf').onclick=()=>printDoc(snapP());
  $('#d-wa').onclick=sendPres;
}
function refreshLine(i){ const x=lines().find(l=>String(l.i)===String(i)); if(x) $(`[data-imp="${i}"]`).textContent=eur2(x.imp); drawTotals(); }
function drawTotals(){
  const L=lines(), T=totals(L), est=P.modo==='estimacion';
  $('#d-tot').innerHTML = `<span class="muted">Base imponible</span><span class="num">${eur2(T.base)}</span><span class="muted">IVA ${P.iva} %</span><span class="num">${eur2(T.iva)}</span><span>Total</span><span class="big num">${est?`${eur(T.total*.9)} – ${eur(T.total*1.15)}`:eur2(T.total)}</span>`;
  $('#d-hitos').innerHTML = EMPRESA.hitos.map(h=>`<div class="hito"><small>${h.n} · ${h.p} %</small><b>${est?'—':eur2(T.total*h.p/100)}</b></div>`).join('');
}
/* ---- copia fija del presupuesto: se guarda al enviar o aceptar y no cambia aunque cambie la tarifa ----
   fecha = días respecto a hoy, como el resto de datos de ejemplo */
function snapP(){
  const L=lines(), T=totals(L);
  return {num:P.num, cliente:{...P.cli}, tipo:P.tipo, modo:P.modo, cal:P.cal, iva:P.iva, params:{...P.params}, fecha:0, validez:EMPRESA.validez, plazo:TARIFA.plazos[P.tipo], hitos:EMPRESA.hitos.map(h=>({...h})),
    lineas:L.map(x=>({cap:x.cap,n:x.n,q:x.q,u:x.u,pr:x.pr,imp:x.imp,on:x.on})), base:T.base, cuota:T.iva, total:T.total};
}
function docCliente(d, conAceptar){
  const L=d.lineas.filter(x=>x.on); let cap='';
  const est=d.modo==='estimacion';
  return `<div class="client-doc">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px"><div><h3>${EMPRESA.nombre}</h3><span class="cd-muted">${d.num} · ${fmtD(addDays(d.fecha))} · válido ${d.validez} días</span></div><div style="text-align:right"><b>${esc(d.cliente.nombre||'Cliente')}</b><br><span class="cd-muted">${esc(d.cliente.dir||'')}</span></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">Importe</th></tr></thead><tbody>${L.map(x=>{let h='';if(x.cap!==cap){cap=x.cap;h+=`<tr class="cd-cap"><td colspan="3">${esc(cap)}</td></tr>`;}return h+`<tr><td>${esc(x.n)}</td><td class="n num">${x.q} ${x.u}</td><td class="n num">${eur2(x.imp)}</td></tr>`;}).join('')}</tbody></table></div>
    <div class="cd-total"><span>Total (IVA ${d.iva} % incl.)</span><span class="num">${est?`${eur(d.total*.9)} – ${eur(d.total*1.15)}`:eur2(d.total)}</span></div>
    <p class="cd-muted" style="font-size:12.5px">Forma de pago: ${d.hitos.map(h=>`${h.n.toLowerCase()} (${h.p} %)`).join(', ')}. Plazo estimado: ${d.plazo}.</p>
    ${est?'<p class="cd-muted" style="font-size:12.5px"><b>Estimación orientativa.</b> El importe final se cierra después de la visita técnica.</p>':conAceptar?`
    <div class="accept"><b>Aceptar presupuesto</b>
      <input type="text" id="acc-n" placeholder="Escribe tu nombre completo" value="${esc(d.cliente.nombre)}" aria-label="Nombre completo">
      <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px"><input type="checkbox" id="acc-c"> He leído y acepto el presupuesto y las condiciones.</label>
      <button class="btn primary" id="acc-ok">Aceptar presupuesto</button>
      <small class="cd-muted">Se guardan fecha, hora y versión aceptada como justificante.</small></div>`:''}
  </div>`;
}
function verDoc(d, conAceptar){
  modal(`<header><h2>Lo que ve el cliente al abrir el enlace</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body">${docCliente(d, conAceptar)}</div>
  <footer><button class="btn" id="cv-pdf">${I.pres}Descargar PDF</button></footer>`,'wide');
  $('#cv-pdf').onclick=()=>printDoc(d);
}
function clientView(){
  const d=snapP();
  verDoc(d, true);
  if(d.modo!=='estimacion') $('#acc-ok').onclick=()=>{ if(!$('#acc-c').checked||!$('#acc-n').value.trim()){ toast('Falta el nombre o marcar la casilla'); return; } aceptar(); };
}
function printDoc(d){
  let root=$('#print-root'); if(!root){ root=document.createElement('div'); root.id='print-root'; document.body.appendChild(root); }
  root.innerHTML=docCliente(d, false);
  const prev=document.title; document.title=`${d.num} - ${d.cliente.nombre||'Cliente'}`;
  window.addEventListener('afterprint',()=>{ document.title=prev; root.innerHTML=''; },{once:true});
  window.print();
}
function sendPres(){
  const T=totals(lines());
  if(!P.cli.nombre.trim()){ toast('Pon al menos el nombre del cliente'); $('[data-cli="nombre"]').focus(); return; }
  const link = `https://${EMPRESA.web}/p/${P.num.toLowerCase()}-demo`;
  let l = P.leadId ? S.leads.find(x=>x.id===P.leadId) : null;
  if(!l){ l={id:++seq,nombre:P.cli.nombre,tel:P.cli.tel,pob:'',dir:P.cli.dir,tipo:P.tipo,origen:'Llamada',fase:'pres_prep',score:65,importe:0,desc:''}; S.leads.unshift(l); P.leadId=l.id; }
  l.prLink=link; l.importe=Math.round(T.total);
  S.pres=S.pres.filter(p=>p.num!==P.num); S.pres.unshift({num:P.num,cliente:P.cli.nombre,tipo:P.tipo,total:T.total,estado:'enviado',leadId:l.id,doc:snapP()});
  openWA({lead:l,tpl:'presenv'});
  if(['nuevo','contactado','visita_ag','visita_ok','pres_prep'].includes(l.fase)){ const from=PH[l.fase].n; l.fase='pres_env'; l.enviadoHace=0; log(l.id,`Fase: ${from} → Presupuesto enviado`,'ok'); }
  log(l.id,`Presupuesto ${P.num} generado (${eur(T.total)})`,'ok');
}

/* ---- aceptación → flujo automático (mini-ERP) ---- */
function aceptar(){
  const L=lines().filter(x=>x.on), T=totals(L), doc=snapP();
  let l = P.leadId ? S.leads.find(x=>x.id===P.leadId) : null;
  if(!l){ l={id:++seq,nombre:P.cli.nombre||'Cliente',tel:'',pob:'',dir:P.cli.dir,tipo:P.tipo,origen:'Llamada',fase:'pres_env',score:70,importe:Math.round(T.total),desc:''}; S.leads.unshift(l); P.leadId=l.id; }
  const obraId = `O-0${S.nextObra++}`; const prNum=P.num; S.nextPR++;
  const mats = L.filter(x=>x.mat); const matPres = mats.reduce((a,x)=>a+x.imp*COSTE*.55,0);
  const senal = T.total*EMPRESA.hitos[0].p/100;
  const inicio = addDays(14);
  modal(`<header><h2>Presupuesto aceptado · flujo automático</h2><button class="x" data-close aria-label="Cerrar">×</button></header>
  <div class="body">
    <div class="flow" id="flow">
      <svg class="flow-svg" id="flow-svg" aria-hidden="true"></svg>
      <div class="node on" id="n0"><div class="ic">✓</div><div><b>Presupuesto aceptado</b><small>${esc(l.nombre)} lo firma desde el enlace</small></div><span class="tag">TRIGGER</span></div>
      <div class="node" id="n1"><div class="ic">▤</div><div><b>Obra ${obraId}</b><small>Se crea con las ${L.length} partidas aceptadas</small></div><span class="tag">ERP</span></div>
      <div class="fan">
        <div class="node" id="n2"><div class="ic">▣</div><div><b>Compras</b><small>${mats.length} materiales · ${eur(matPres)} estimado</small></div></div>
        <div class="node" id="n3"><div class="ic">◷</div><div><b>Planificación</b><small>${esc(EMPRESA.tecnicos[0])} · inicio ${fmtD(inicio)}</small></div></div>
        <div class="node" id="n4"><div class="ic">€</div><div><b>Cobro</b><small>Solicitud de señal ${eur(senal)} + WhatsApp listo</small></div></div>
        <div class="node" id="n5"><div class="ic">◉</div><div><b>CRM</b><small>Cliente «en obra» y seguimiento agendado</small></div><span class="tag">CRM</span></div>
      </div>
    </div>
    <div class="log" id="flog" aria-live="polite"></div>
  </div>
  <footer><button class="btn" data-close>Cerrar</button><button class="btn wa" id="fl-wa" disabled>${I.wa}Enviar solicitud de señal</button><button class="btn primary" id="fl-obras" disabled>Ver obra</button></footer>`,'wide');
  drawFlowLines();
  const steps = [
    ['n0',`Firma: presupuesto ${prNum} aceptado`],
    ['n1',`ERP: obra ${obraId} creada`],
    ['n2',`Compras: lista de ${mats.length} materiales preparada`],
    ['n3',`Planificación: ${EMPRESA.tecnicos[0]} propuesto, inicio ${fmtD(inicio)} (pendiente de confirmar)`],
    ['n4',`Cobro: solicitud de señal ${eur(senal)} lista para enviar`],
    ['n5',`CRM: estado «en obra» · seguimiento agendado · aviso Telegram`]
  ];
  let k=0;
  const tick=()=>{ const [id,txt]=steps[k]; const n=$('#'+id); if(!n) return; n.classList.add('on','done'); const f=$('#flog'); const row=document.createElement('div'); row.innerHTML=`<time>${hms()}</time><span></span>`; row.lastChild.textContent=txt; f.prepend(row); k++; if(k<steps.length) setTimeout(tick, reduce?0:650); else done(); };
  const done=()=>{
    const from=PH[l.fase].n; l.fase='aceptado'; l.importe=Math.round(T.total);
    log(l.id,`Presupuesto ${prNum} aceptado online`,'ok'); log(l.id,`Fase: ${from} → Aceptado · obra ${obraId}`,'ok');
    S.obras.unshift({id:obraId,cliente:l.nombre,tipo:P.tipo,pob:l.pob||'—',avance:0,presupuesto:Math.round(T.total),matPres:Math.round(matPres),matReal:0,horas:0,costeHora:24,subc:0,hitos:EMPRESA.hitos.map(h=>({n:h.n,imp:T.total*h.p/100,cob:false})),fin:60,nueva:true});
    S.pres=S.pres.filter(p=>p.num!==prNum); S.pres.unshift({num:prNum,cliente:l.nombre,tipo:P.tipo,total:T.total,estado:'aceptado',leadId:l.id,doc});
    (S.extraTasks=S.extraTasks||[]).push({id:'senal'+obraId,lead:l,dot:'g',t:`Enviar solicitud de señal · ${l.nombre}`,s:`${eur(senal)} · obra ${obraId}`,tpl:'hito'});
    const wa=$('#fl-wa'), ob=$('#fl-obras'); if(wa){ wa.disabled=false; wa.onclick=()=>openWA({lead:l,tpl:'hito',extra:{importe_hito:eur(senal),concepto_pago:EMPRESA.hitos[0].n.toLowerCase()},taskId:'senal'+obraId}); }
    if(ob){ ob.disabled=false; ob.onclick=()=>{closeModal();go('obras');}; }
    P=null; renderNav();
  };
  setTimeout(tick, reduce?0:350);
}
function drawFlowLines(){
  const svg=$('#flow-svg'), fl=$('#flow'); if(!svg||!fl) return;
  const r=fl.getBoundingClientRect(); const box=id=>$('#'+id).getBoundingClientRect();
  const p=(a,b)=>{ const A=box(a),B=box(b); const x1=A.right-r.left, y1=A.top+A.height/2-r.top, x2=B.left-r.left, y2=B.top+B.height/2-r.top, mx=(x1+x2)/2; return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="rgba(124,77,255,.35)" stroke-width="1.5"/>`; };
  svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
  svg.innerHTML = p('n0','n1') + ['n2','n3','n4','n5'].map(n=>p('n1',n)).join('');
}

/* =================== OBRAS =================== */
function obraCalc(o){ const cob=o.hitos.filter(h=>h.cob).reduce((a,h)=>a+h.imp,0); return {cob}; }
function vObras(){
  $('#view').innerHTML = `<section class="card pad"><div class="tbl-wrap"><table>
    <thead><tr><th>Obra</th><th>Cliente</th><th>Tipo</th><th>Avance</th><th class="n">Presupuesto</th><th class="n">Cobrado</th><th class="n">Material pres.</th><th class="n">Material real</th><th class="n">Desviación</th><th>Próximo hito</th><th></th></tr></thead>
    <tbody>${S.obras.map(o=>{ const c=obraCalc(o); const dev=o.matReal?((o.matReal-o.matPres)/o.matPres*100):0; const next=o.hitos.find(h=>!h.cob);
      return `<tr><td class="num"><b>${o.id}</b>${o.nueva?' <span class="badge g">nueva</span>':''}</td><td>${esc(o.cliente)}</td><td>${TIPOS[o.tipo]}</td>
      <td><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="progress"><i style="width:${o.avance}%"></i></span><span class="num muted">${o.avance} %</span></div></td>
      <td class="n num">${eur(o.presupuesto)}</td><td class="n num">${eur(c.cob)}</td><td class="n num">${eur(o.matPres)}</td><td class="n num">${o.matReal?eur(o.matReal):'—'}</td>
      <td class="n">${o.matReal?`<span class="badge ${dev>5?'r':dev>0?'a':'g'}">${dev>0?'+':''}${pct(dev)}</span>`:'—'}</td>
      <td>${next?`${esc(next.n)} · <span class="num">${eur(next.imp)}</span>`:'<span class="badge g">cobrado</span>'}</td>
      <td>${next?`<button class="btn wa sm" data-hito="${o.id}">${I.wa}Pedir pago</button>`:''}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="faint" style="font-size:12px;margin:12px 0 0">Desviación de material: en rojo si supera el 5 %. El coste real sale de las compras y albaranes que se registran en cada obra.</p></section>`;
  $$('[data-hito]').forEach(b=>b.onclick=()=>{ const o=S.obras.find(x=>x.id===b.dataset.hito); const h=o.hitos.find(x=>!x.cob); const l=S.leads.find(x=>x.nombre===o.cliente)||{nombre:o.cliente,tipo:o.tipo,dir:'',fase:'aceptado'}; openWA({lead:l,tpl:'hito',extra:{importe_hito:eur(h.imp),concepto_pago:h.n.toLowerCase()}}); });
}

/* =================== FACTURAS =================== */
function estadoF(f){ if(f.estado==='cobrada') return ['Cobrada','g']; if(f.vence<0) return [`Vencida ${-f.vence} d`,'r']; return ['Pendiente','a']; }
function vFacturas(){
  const pend=S.facturas.filter(f=>f.estado==='pendiente');
  $('#view').innerHTML = `
  <div class="note"><b>Las facturas las emite vuestra gestoría o vuestro programa de facturación.</b> El CRM no las crea ni las envía a Hacienda: aquí se guardan, se asocian a cada obra, se envían por WhatsApp y se controla el cobro.</div>
  <div class="grid" style="grid-template-columns:minmax(0,1fr);gap:16px">
    <section class="card pad"><h2 class="h2">Subir factura <small>PDF o foto</small></h2>
      <div class="drop">
        <div class="two"><label class="f">Archivo<input class="in" type="file" id="fu-file" accept="application/pdf,image/*"></label><label class="f">Nº de factura<input class="in" id="fu-num" placeholder="F-2026-047"></label></div>
        <div class="two"><label class="f">Obra<select class="in" id="fu-obra">${S.obras.map(o=>`<option value="${o.id}">${o.id} · ${esc(o.cliente)}</option>`).join('')}</select></label>
        <div class="two"><label class="f">Importe (€)<input class="in num" type="number" id="fu-imp" min="0" step="0.01"></label><label class="f">Vence en (días)<input class="in num" type="number" id="fu-v" value="15" min="0"></label></div></div>
        <div><button class="btn primary" id="fu-ok">${I.plus}Guardar factura</button></div>
      </div>
    </section>
    <section class="card pad"><h2 class="h2">Facturas <small>${pend.length} pendientes · ${eur(pend.reduce((a,f)=>a+f.imp,0))}</small></h2>
      <div class="tbl-wrap"><table><thead><tr><th>Nº</th><th>Obra</th><th>Cliente</th><th class="n">Importe</th><th>Vence</th><th>Estado</th><th>Archivo</th><th></th></tr></thead>
      <tbody>${S.facturas.map((f,i)=>{ const [e,c]=estadoF(f); return `<tr><td class="num"><b>${esc(f.num)}</b></td><td class="num">${esc(f.obra)}</td><td>${esc(f.cliente)}</td><td class="n num">${eur2(f.imp)}</td><td>${fmtD(addDays(f.vence))}</td><td><span class="badge ${c}">${e}</span></td>
        <td>${f.url?`<button class="btn sm" data-ver="${i}">${I.eye}Ver</button>`:`<span class="faint" style="font-size:12px">${esc(f.archivo)}</span>`}</td>
        <td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn wa sm" data-fwa="${i}">${I.wa}${f.estado==='pendiente'&&f.vence<0?'Recordar':'Enviar'}</button>${f.estado==='pendiente'?`<button class="btn sm" data-cob="${i}">Cobrada</button>`:''}</div></td></tr>`; }).join('')}</tbody></table></div>
    </section>
  </div>`;
  $('#fu-ok').onclick=()=>{
    const file=$('#fu-file').files[0], num=$('#fu-num').value.trim(), imp=parseFloat($('#fu-imp').value);
    if(!num||!imp){ toast('Pon el número y el importe'); return; }
    const o=S.obras.find(x=>x.id===$('#fu-obra').value);
    const f={num,obra:o.id,cliente:o.cliente,imp,emit:0,vence:parseInt($('#fu-v').value,10)||0,estado:'pendiente',archivo:file?file.name:'(sin archivo)'};
    if(file&&file.type.startsWith('image/')){ try{ f.url=URL.createObjectURL(file); }catch(e){} }
    S.facturas.unshift(f); vFacturas(); toast('Factura guardada en la obra '+o.id);
  };
  $$('[data-cob]').forEach(b=>b.onclick=()=>{ S.facturas[+b.dataset.cob].estado='cobrada'; vFacturas(); toast('Cobro registrado'); });
  $$('[data-fwa]').forEach(b=>b.onclick=()=>{ const f=S.facturas[+b.dataset.fwa]; openWA({fact:f,tpl:f.estado==='pendiente'&&f.vence<0?'cobro':'factura'}); });
  $$('[data-ver]').forEach(b=>b.onclick=()=>{ const f=S.facturas[+b.dataset.ver]; modal(`<header><h2>${esc(f.num)}</h2><button class="x" data-close aria-label="Cerrar">×</button></header><div class="body"><img src="${f.url}" alt="Factura ${esc(f.num)}" style="max-width:100%;border-radius:10px"></div>`); });
}

/* =================== FINANZAS =================== */
function vFinanzas(){
  const fact = S.facturas.filter(f=>f.emit>-31);
  const facturado = fact.reduce((a,f)=>a+f.imp,0);
  const cobrado = fact.filter(f=>f.estado==='cobrada').reduce((a,f)=>a+f.imp,0);
  const pend = S.facturas.filter(f=>f.estado==='pendiente'); const venc=pend.filter(f=>f.vence<0);
  const mrr = S.contratos.reduce((a,c)=>a+c.cuota,0);
  const obrasM = S.obras.filter(o=>o.matReal);
  // margen proyectado por obra: base sin IVA − (material real + mano de obra proyectada al 100 % + subcontratas)
  const mR = obrasM.map(o=>{ const base=o.presupuesto/(1+EMPRESA.iva/100); const mo=o.horas*o.costeHora*(100/Math.max(o.avance,1)); const coste=o.matReal+mo+o.subc; return {o,base,coste,m:(base-coste)/base*100}; });
  const margenMedio = mR.reduce((a,x)=>a+x.m,0)/Math.max(mR.length,1);
  const hitosFut = S.obras.flatMap(o=>o.hitos.filter(h=>!h.cob).map((h,i)=>({imp:h.imp,d:Math.min(o.fin+i*20,85)})));
  const buckets=[0,1,2].map(b=>({n:['0-30 días','31-60 días','61-90 días'][b],hitos:hitosFut.filter(h=>Math.floor(h.d/30)===b).reduce((a,h)=>a+h.imp,0),pipe:ponderado()*[.45,.35,.2][b]+mrr*1.21}));
  const prev = buckets.reduce((a,b)=>a+b.hitos+b.pipe,0);
  $('#view').innerHTML = `
  <div class="kpis">
    <div class="card kpi"><b>${eur(facturado)}</b><span>Facturado (30 días)</span></div>
    <div class="card kpi"><b>${eur(cobrado)}</b><span>Cobrado (30 días)</span></div>
    <div class="card kpi ${venc.length?'alert':''}"><b>${eur(pend.reduce((a,f)=>a+f.imp,0))}</b><span>Pendiente · ${eur(venc.reduce((a,f)=>a+f.imp,0))} vencido</span></div>
    <div class="card kpi"><b>${pct(margenMedio)}</b><span>Margen proyectado medio (obras en curso)</span></div>
    <div class="card kpi"><b>${eur(mrr)}</b><span>MRR · ${S.contratos.length} contratos de mantenimiento</span></div>
    <div class="card kpi"><b>${eur(prev)}</b><span>Previsión de ingresos 90 días</span></div>
  </div>
  <div class="fin-grid">
    <section class="card pad"><h2 class="h2">Coste de material por obra <small>presupuestado vs real</small></h2>
      <div class="legend"><span><i style="background:var(--s1)"></i>Presupuestado</span><span><i style="background:var(--s2)"></i>Real</span></div>
      ${chartMaterial(obrasM)}
    </section>
    <section class="card pad"><h2 class="h2">Previsión de ingresos <small>próximos 90 días</small></h2>
      <div class="legend"><span><i style="background:var(--s2)"></i>Hitos de obras en curso</span><span><i style="background:var(--s1)"></i>Pipeline ponderado + MRR</span></div>
      ${chartPrev(buckets)}
    </section>
  </div>
  <section class="card pad" style="margin-top:16px"><h2 class="h2">ROI por canal de captación <small>últimos 90 días · la inversión la apunta la empresa cada mes</small></h2>
    <div class="tbl-wrap"><table><thead><tr><th>Canal</th><th class="n">Inversión</th><th class="n">Leads</th><th class="n">Ventas</th><th class="n">Coste/lead</th><th class="n">Coste/venta</th><th class="n">Margen generado</th><th>ROI</th></tr></thead>
    <tbody>${(()=>{ const max=Math.max(...S.canales.filter(c=>c.inv).map(c=>(c.margen-c.inv)/c.inv)); return S.canales.map(c=>{ const roi=c.inv?(c.margen-c.inv)/c.inv:null; return `<tr><td>${esc(c.c)}</td><td class="n num">${c.inv?eur(c.inv):'—'}</td><td class="n num">${c.leads}</td><td class="n num">${c.ventas}</td><td class="n num">${c.inv?eur(c.inv/c.leads):'—'}</td><td class="n num">${c.inv&&c.ventas?eur(c.inv/c.ventas):'—'}</td><td class="n num">${eur(c.margen)}</td>
      <td style="min-width:170px">${roi===null?'<span class="faint" style="font-size:12px">sin inversión</span>':`<div class="row" style="gap:8px;flex-wrap:nowrap"><span style="flex:1;max-width:110px;background:rgba(255,255,255,.05);border-radius:0 4px 4px 0"><i class="bar-in" style="width:${Math.max(2,roi/max*100)}%" data-tip="${esc(c.c)}: ROI ${Math.round(roi*100).toLocaleString('es-ES')} %"></i></span><span class="num">${Math.round(roi*100).toLocaleString('es-ES')} %</span></div>`}</td></tr>`; }).join(''); })()}</tbody></table></div>
    <p class="faint" style="font-size:12px;margin:10px 0 0">ROI = (margen generado − inversión) / inversión. Los referidos y la web no tienen inversión directa: se muestran sus ventas pero no un ROI.</p>
  </section>
  <section class="card pad" style="margin-top:16px"><h2 class="h2">Contratos de mantenimiento <small>lo único recurrente: de aquí sale el MRR</small></h2>
    <div class="tbl-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th class="n">Cuota/mes</th></tr></thead><tbody>${S.contratos.map(c=>`<tr><td>${esc(c.cliente)}</td><td>${esc(c.servicio)}</td><td class="n num">${eur(c.cuota)}</td></tr>`).join('')}<tr><td colspan="2"><b>MRR</b></td><td class="n num"><b>${eur(mrr)}</b></td></tr></tbody></table></div>
  </section>`;
  bindTips();
}
function chartMaterial(obras){
  const W=520, rowH=46, padL=90, padR=70, H=obras.length*rowH+26;
  const max=Math.max(...obras.flatMap(o=>[o.matPres,o.matReal]))*1.05;
  const x=v=>padL+(W-padL-padR)*v/max;
  const ticks=[0,.5,1].map(t=>Math.round(max*t/1000)*1000);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Coste de material presupuestado frente a real por obra">`;
  ticks.forEach(t=>{ s+=`<line x1="${x(t)}" x2="${x(t)}" y1="0" y2="${H-20}" stroke="rgba(255,255,255,.06)"/><text x="${x(t)}" y="${H-5}" fill="#6c6c86" font-size="10" text-anchor="middle" font-family="Sora, system-ui, sans-serif">${eur(t)}</text>`; });
  obras.forEach((o,i)=>{ const y=i*rowH+6;
    s+=`<text x="0" y="${y+18}" fill="#9a9ab2" font-size="11.5" font-family="Sora, system-ui, sans-serif">${o.id}</text>`;
    [[o.matPres,'var(--s1)','Presupuestado',0],[o.matReal,'var(--s2)','Real',16]].forEach(([v,c,n,dy])=>{ const w=Math.max(2,x(v)-padL);
      s+=`<path d="M${padL},${y+dy} h${w-4} a4,4 0 0 1 4,4 v6 a4,4 0 0 1 -4,4 h-${w-4}z" fill="${c}" data-tip="${o.id} · ${n}: ${eur(v)}"/><text x="${padL+w+6}" y="${y+dy+11}" fill="#f0f0f5" font-size="11" font-family="Sora, system-ui, sans-serif">${eur(v)}</text>`; });
  });
  return s+'</svg>';
}
function chartPrev(b){
  const W=520,H=230,padB=28,padT=10,padL=10;
  const max=Math.max(...b.map(x=>x.hitos+x.pipe))*1.15;
  const bw=90, gap=(W-padL*2-bw*3)/3;
  const y=v=>(H-padB)-(H-padB-padT)*v/max;
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Previsión de ingresos a 90 días">`;
  s+=`<line x1="0" x2="${W}" y1="${H-padB}" y2="${H-padB}" stroke="rgba(255,255,255,.12)"/>`;
  b.forEach((d,i)=>{ const x0=padL+gap/2+i*(bw+gap); const h1=(H-padB)-y(d.hitos), h2=(H-padB)-y(d.pipe);
    s+=`<rect x="${x0}" y="${H-padB-h1}" width="${bw}" height="${Math.max(h1,0)}" fill="var(--s2)" data-tip="${d.n} · hitos: ${eur(d.hitos)}"/>`;
    s+=`<path d="M${x0},${H-padB-h1-2} v-${Math.max(h2-4,0)} a4,4 0 0 1 4,-4 h${bw-8} a4,4 0 0 1 4,4 v${Math.max(h2-4,0)}z" fill="var(--s1)" data-tip="${d.n} · pipeline + MRR: ${eur(d.pipe)}"/>`;
    s+=`<text x="${x0+bw/2}" y="${H-padB-h1-h2-10}" fill="#f0f0f5" font-size="12" text-anchor="middle" font-family="Sora, system-ui, sans-serif">${eur(d.hitos+d.pipe)}</text>`;
    s+=`<text x="${x0+bw/2}" y="${H-8}" fill="#9a9ab2" font-size="11" text-anchor="middle" font-family="Sora, system-ui, sans-serif">${d.n}</text>`; });
  return s+'</svg>';
}
function bindTips(){
  const tip=$('#tip');
  $$('[data-tip]').forEach(el=>{
    el.addEventListener('mousemove',e=>{ tip.textContent=el.dataset.tip; tip.hidden=false; tip.style.left=(e.clientX+14)+'px'; tip.style.top=(e.clientY+14)+'px'; });
    el.addEventListener('mouseleave',()=>tip.hidden=true);
  });
}

/* =================== AJUSTES =================== */
let ajTipo='bano';
function vAjustes(){
  const c=CAT[ajTipo];
  $('#view').innerHTML = `
  <section class="card pad"><h2 class="h2">Tarifa de partidas <small>de aquí sale el presupuesto automático · precios de ejemplo</small></h2>
    <div class="row" style="margin-bottom:12px"><select class="in" id="aj-t" style="width:auto" aria-label="Tipo de obra">${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}" ${ajTipo===k?'selected':''}>${v}</option>`).join('')}</select><span class="faint" style="font-size:12px">Plazo estimado: ${TARIFA.plazos[ajTipo]}</span></div>
    <div class="tbl-wrap"><table><thead><tr><th>Capítulo</th><th>Partida</th><th>Ud.</th><th class="n">Básica</th><th class="n">Media</th><th class="n">Alta</th><th>Material</th></tr></thead>
    <tbody>${c.items.map((it,i)=>`<tr><td class="muted">${esc(it.cap)}</td><td>${esc(typeof it.n==='function'?it.n(defParams(ajTipo)):it.n)}</td><td>${it.u}</td>${[0,1,2].map(q=>`<td class="n"><input class="in li-in num" type="number" min="0" step="1" data-aj="${i}:${q}" value="${(TARIFA.partidas[it.id]||[])[q]??''}" aria-label="Precio"></td>`).join('')}<td>${it.mat?'<span class="badge g">sí</span>':'<span class="badge n">no</span>'}</td></tr>`).join('')}</tbody></table></div>
  </section>
  <section class="card pad" style="margin-top:16px"><h2 class="h2">Plantillas de WhatsApp <small>${TPL.length} plantillas · editables</small></h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${TPL.map((t,i)=>`<label class="f">${esc(t.n)}<textarea class="in" data-tpl="${i}" style="min-height:96px">${esc(t.t)}</textarea></label>`).join('')}</div>
    <p class="faint" style="font-size:12px;margin:12px 0 0">Variables disponibles: {nombre} {empresa} {comercial} {tipo_obra} {fecha_visita} {hora_visita} {direccion} {tecnico} {enlace_presupuesto} {importe_hito} {concepto_pago} {num_factura} {enlace_factura} {vencimiento} {enlace_resena}</p>
  </section>`;
  $('#aj-t').onchange=e=>{ajTipo=e.target.value;vAjustes();};
  $$('[data-aj]').forEach(i=>i.oninput=()=>{ const [a,q]=i.dataset.aj.split(':').map(Number); const id=CAT[ajTipo].items[a].id; (TARIFA.partidas[id]=TARIFA.partidas[id]||[])[q]=parseFloat(i.value)||0; });
  $$('[data-tpl]').forEach(t=>t.oninput=()=>{ TPL[+t.dataset.tpl].t=t.value; });
}

/* =================== modal =================== */
let lastFocus=null;
function modal(html, size){
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="overlay" id="ov"><div class="modal ${size||''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const ov=$('#ov');
  ov.addEventListener('click',e=>{ if(e.target===ov||e.target.closest('[data-close]')) closeModal(); });
  const f = ov.querySelector('select,input,textarea,button:not(.x)'); if(f) f.focus();
}
function closeModal(){ $('#modal-root').innerHTML=''; if(lastFocus&&lastFocus.focus) try{lastFocus.focus();}catch(e){} }
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&$('#ov')) closeModal(); });
window.addEventListener('resize',()=>{ if($('#flow')) drawFlowLines(); });

/* =================== arranque =================== */
const rootStyle = document.documentElement.style;
Object.entries({p:'--p',p2:'--p2',pDark:'--p-dark',g:'--g',gDark:'--g-dark'}).forEach(([k,v])=>{ if(EMPRESA.colores&&EMPRESA.colores[k]) rootStyle.setProperty(v, EMPRESA.colores[k]); });
$('.brand .mark').textContent = EMPRESA.siglas;
$('.brand b').textContent = EMPRESA.nombre;
const faltan = Object.values(CAT).flatMap(c=>c.items).filter(it=>{ const pr=TARIFA.partidas[it.id]; return !Array.isArray(pr)||pr.length<3||pr.some(v=>typeof v!=='number'||!isFinite(v)); }).map(it=>it.id);
if(faltan.length){
  const msgs = faltan.map(id=>`Falta el precio de la partida ${id} en config/tarifa.js`);
  msgs.forEach(m=>console.error(m));
  const av = document.createElement('div'); av.className='note'; av.setAttribute('role','alert'); av.style.margin='16px';
  av.innerHTML = msgs.map(m=>`<b>${esc(m)}</b>`).join('<br>');
  $('.app').before(av);
}
const start = (location.hash||'').slice(1);
go(VIEWS.some(v=>v.id===start)?start:'hoy');
})();
