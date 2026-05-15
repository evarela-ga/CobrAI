// CobrAI mock data store
// Globals: window.CobrData, window.CobrStore

const TENANTS = [
  { id: 'banco-sur', name: 'Banco del Sur', tag: 'Banca', color: '#06b6d4', initials: 'BS', stats: { cartera: 248_500_000, cuentas: 4823, recuperoMes: 18.4 } },
  { id: 'credito-ya', name: 'Fintech Crédito Ya', tag: 'Fintech', color: '#8b5cf6', initials: 'CY', stats: { cartera: 87_200_000, cuentas: 2110, recuperoMes: 22.7 } },
  { id: 'coop-union', name: 'Cooperativa Unión', tag: 'Cooperativa', color: '#f43f5e', initials: 'CU', stats: { cartera: 41_700_000, cuentas: 1284, recuperoMes: 14.9 } },
];

const NOMBRES = [
  'Martín Gómez','Lucía Fernández','Diego Pereyra','Carolina Sosa','Federico Álvarez','Mariana Ríos','Sebastián Iglesias',
  'Valeria Domínguez','Nicolás Cabrera','Romina Acuña','Joaquín Bustos','Camila Ortiz','Tomás Bianchi','Florencia Quiroga',
  'Lautaro Méndez','Agustina Vega','Matías Paredes','Sofía Lorenzo','Gonzalo Maidana','Julieta Cáceres','Ezequiel Ferraro',
  'Brenda Salinas','Iván Carrizo','Antonella Pizarro','Bruno Coronel','Micaela Aguirre','Hernán Maldonado','Daiana Roldán',
  'Cristian Olivera','Yamila Frías','Pablo Sandoval','Magalí Heredia','Leandro Villalba','Noelia Benítez','Alejo Funes',
  'Tatiana Soria','Maximiliano Britos','Belén Acosta','Rodrigo Páez','Solange Medina','Franco Astudillo','Paula Cardozo',
  'Emiliano Toledo','Ailín Navarro','Cristóbal Espinoza','Estefanía Luna','Gastón Cisneros','Daniela Albornoz','Ariel Galván',
  'Luz Peralta','Ramiro Suárez','Verónica Ledesma','Maxi Godoy','Constanza Reyes','Pedro Villarreal'
];

const PROVINCIAS = ['Buenos Aires','CABA','Córdoba','Santa Fe','Mendoza','Tucumán','Salta','Entre Ríos','Chaco','Misiones','Corrientes','Neuquén','San Juan','Jujuy','Río Negro'];
const ESTADOS = ['Vigente','En gestión','Promesa de pago','Pago parcial','Cancelada','Refinanciada','Incobrable','Judicial','Prejudicial','En disputa'];
const ESTADO_COLOR = {
  'Vigente': 'bg-ink-700 text-ink-200',
  'En gestión': 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
  'Promesa de pago': 'bg-violet2-500/15 text-violet2-400 border border-violet2-500/30',
  'Pago parcial': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'Cancelada': 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40',
  'Refinanciada': 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'Incobrable': 'bg-coral-500/15 text-coral-400 border border-coral-500/30',
  'Judicial': 'bg-rose-600/20 text-rose-400 border border-rose-600/40',
  'Prejudicial': 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  'En disputa': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
};

const SITUACION_BCRA = ['Situación 1 — Normal','Situación 2 — Riesgo bajo','Situación 3 — Con problemas','Situación 4 — Alto riesgo','Situación 5 — Irrecuperable'];

// Seeded RNG so dataset is stable across renders
function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function genDeudores(tenantId, seed) {
  const rnd = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const out = [];
  const total = 58;
  for (let i = 0; i < total; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const monto = Math.round((20000 + rnd() * 1_980_000) * 100) / 100;
    const mora = Math.floor(rnd() * 320) + 1;
    const voluntad = Math.max(5, Math.min(98, Math.round(35 + rnd() * 60 - mora * 0.05)));
    const estado = mora > 180 && rnd() > 0.6 ? pick(['Judicial','Prejudicial','Incobrable']) : (rnd() > 0.7 ? 'Promesa de pago' : (rnd() > 0.5 ? 'En gestión' : 'Vigente'));
    const provincia = pick(PROVINCIAS);
    const dni = String(20_000_000 + Math.floor(rnd() * 30_000_000));
    const phone = `+54 9 11 ${String(Math.floor(1000 + rnd() * 8999))}-${String(Math.floor(1000 + rnd() * 8999))}`;
    const score = Math.round(300 + rnd() * 600);
    const ingresos = Math.round((180_000 + rnd() * 2_200_000) / 1000) * 1000;
    const deudasOtras = Math.floor(rnd() * 5);
    const ultimoContacto = Math.floor(rnd() * 240);
    out.push({
      id: `${tenantId}-${i + 1}`,
      nombre,
      dni,
      phone,
      email: nombre.toLowerCase().replace(/[^a-z]/g,'.').replace(/\.+/g,'.') + '@mail.com',
      provincia,
      direccion: `Av. ${pick(['San Martín','Belgrano','Rivadavia','Mitre','Sarmiento','Alvear','Pueyrredón'])} ${Math.floor(100 + rnd() * 4500)}`,
      monto,
      mora,
      voluntad,
      estado,
      score,
      ingresos,
      deudasOtras,
      deudaTotalOtras: deudasOtras ? Math.round(monto * (0.4 + rnd() * 2.5)) : 0,
      situacionBCRA: SITUACION_BCRA[Math.min(4, Math.floor(mora / 60))],
      ultimoContactoHs: ultimoContacto,
      asignado: pick(['Mariana R.','Diego P.','Lucía F.','Sebastián I.','Carolina S.','Federico A.','—']),
      prioridad: voluntad > 70 ? 'Alta' : voluntad > 40 ? 'Media' : 'Baja',
      promesaMonto: estado === 'Promesa de pago' ? Math.round(monto * (0.3 + rnd() * 0.6)) : 0,
      promesaFecha: estado === 'Promesa de pago' ? `${10 + Math.floor(rnd()*15)}/06/2026` : null,
      ticket: monto,
    });
  }
  return out;
}

const PLANTILLAS = [
  { id: 't1', nombre: 'Primer contacto cordial', estado: 'Approved', categoria: 'Apertura', respuesta: 68, conversion: 18, vars: ['nombre','monto'],
    cuerpo: 'Hola {{nombre}}, soy del equipo de {{empresa}}. Vimos que tenés un saldo pendiente por $ {{monto}}. ¿Podemos coordinar una solución que te sirva? 💬' },
  { id: 't2', nombre: 'Recordatorio amable', estado: 'Approved', categoria: 'Recordatorio', respuesta: 54, conversion: 12, vars: ['nombre','vencimiento'],
    cuerpo: '{{nombre}}, te recordamos que el {{vencimiento}} venció tu pago. Estamos para ayudarte a regularizar la situación cuando puedas.' },
  { id: 't3', nombre: 'Oferta plan 3 cuotas', estado: 'Approved', categoria: 'Negociación', respuesta: 71, conversion: 34, vars: ['nombre','monto','link_pago'],
    cuerpo: 'Hola {{nombre}}, te podemos ofrecer dividir tus $ {{monto}} en 3 cuotas sin interés. Acceso al plan: {{link_pago}}' },
  { id: 't4', nombre: 'Quita por pago contado', estado: 'Approved', categoria: 'Negociación', respuesta: 64, conversion: 41, vars: ['nombre','monto','link_pago'],
    cuerpo: '{{nombre}}, solo por hoy: pagás $ {{monto}} y cancelás toda tu deuda con un 25% off. Link: {{link_pago}}' },
  { id: 't5', nombre: 'Confirmación de promesa', estado: 'Approved', categoria: 'Cierre', respuesta: 82, conversion: 67, vars: ['nombre','vencimiento','monto'],
    cuerpo: '¡Genial {{nombre}}! Te esperamos el {{vencimiento}} con el pago de $ {{monto}}. Cualquier cosa, escribinos.' },
  { id: 't6', nombre: 'Aviso pre-judicial', estado: 'Pending', categoria: 'Escalamiento', respuesta: 38, conversion: 8, vars: ['nombre','monto'],
    cuerpo: '{{nombre}}, tu deuda de $ {{monto}} pasaría a etapa pre-judicial en 72hs. Evitemos llegar a eso. Respondé este mensaje.' },
  { id: 't7', nombre: 'Reactivación silenciosos', estado: 'Approved', categoria: 'Reenganche', respuesta: 29, conversion: 6, vars: ['nombre'],
    cuerpo: 'Hola {{nombre}}, hace unos días no sabemos de vos. ¿Pasó algo? Contanos y vemos cómo destrabar esto juntos.' },
  { id: 't8', nombre: 'Link de pago directo', estado: 'Approved', categoria: 'Conversión', respuesta: 47, conversion: 38, vars: ['nombre','monto','link_pago'],
    cuerpo: '{{nombre}}, dejamos preparado tu link para abonar $ {{monto}}: {{link_pago}}' },
  { id: 't9', nombre: 'Refinanciación 6 cuotas', estado: 'Approved', categoria: 'Negociación', respuesta: 58, conversion: 22, vars: ['nombre','monto'],
    cuerpo: '{{nombre}}, te armamos un plan de 6 cuotas para los $ {{monto}}. ¿Te lo paso?' },
  { id: 't10', nombre: 'Tono empático difícil', estado: 'Approved', categoria: 'Apertura', respuesta: 49, conversion: 14, vars: ['nombre'],
    cuerpo: 'Hola {{nombre}}, sé que estos temas no son cómodos. ¿Podemos hablar cinco minutos por acá para ver opciones?' },
  { id: 't11', nombre: 'Aviso situación BCRA', estado: 'Rejected', categoria: 'Informativo', respuesta: 22, conversion: 3, vars: ['nombre'],
    cuerpo: '{{nombre}}, tu situación crediticia BCRA está siendo afectada. Regularicemos esto cuanto antes.' },
  { id: 't12', nombre: 'Feliz cumpleaños + oferta', estado: 'Pending', categoria: 'Reenganche', respuesta: 61, conversion: 19, vars: ['nombre'],
    cuerpo: '¡Feliz cumple {{nombre}}! 🎉 Por hoy te dejamos una quita especial para cancelar tu deuda. Te interesa?' },
];

// Mock conversation generator (returns an array of message objects)
function genConversation(deudor) {
  const m = (sender, text, mins) => ({ sender, text, ts: mins });
  const monto = `$ ${deudor.monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return [
    m('ai', `Hola ${deudor.nombre.split(' ')[0]} 👋 Soy del equipo de gestión de tu cuenta. Tenemos un saldo pendiente de ${monto}. ¿Podemos hablar un minuto?`, 120),
    m('user', '¿quién es?', 118),
    m('ai', `Soy Cintia, te escribo de parte de la entidad donde tenés tu crédito. ¿Querés que te ayude a regularizar la situación?`, 117),
    m('user', 'la verdad no tengo plata ahora', 95),
    m('ai', `Entiendo perfectamente. Estamos justamente para encontrar opciones que se ajusten a tu situación. ¿Podrías contarme un poco cómo estás financieramente este mes?`, 94),
    m('user', 'cobro a fin de mes, antes no puedo nada', 70),
    m('ai', `Genial, gracias por contarme. Te puedo ofrecer dos caminos: 1) Pagar el total con 25% de descuento el día 30. 2) Dividirlo en 4 cuotas sin interés desde el 30. ¿Cuál te sirve más?`, 68),
    m('user', 'cuanto saldría la cuota?', 45),
    m('ai', `En 4 cuotas serían $ ${(deudor.monto / 4).toLocaleString('es-AR', { minimumFractionDigits: 2 })} cada una. La primera el 30/05, después 30/06, 30/07 y 30/08. ¿Te lo armo?`, 42),
    m('user', 'dale, pero la primera la pago el 2/6 que es cuando me depositan', 18),
    m('ai', `Perfecto, anoto: primera cuota el 02/06. ¿Te paso el link para que la dejes agendada ahora?`, 15),
    m('user', 'si pasame', 3),
  ];
}

const RECENT_LIVE = [
  { name: 'Brenda Salinas', preview: 'Si si, me llega el viernes y pago...', mins: 1 },
  { name: 'Cristian Olivera', preview: 'No insistan más por favor', mins: 3 },
  { name: 'Joaquín Bustos', preview: '¿Me podés mandar el link otra vez?', mins: 5 },
  { name: 'Valeria Domínguez', preview: 'Acabo de transferir, te paso comprobante', mins: 7 },
];

// Operators leaderboard
const OPERADORES = [
  { nombre: 'Mariana Ríos', avatar: 'MR', cobrado: 14_280_500, casos: 187, exito: 38.4, tiempoMedio: '2.4d', score: 92 },
  { nombre: 'Diego Pereyra', avatar: 'DP', cobrado: 12_840_220, casos: 164, exito: 34.1, tiempoMedio: '2.8d', score: 87 },
  { nombre: 'Lucía Fernández', avatar: 'LF', cobrado: 11_502_910, casos: 152, exito: 31.6, tiempoMedio: '3.0d', score: 84 },
  { nombre: 'Sebastián Iglesias', avatar: 'SI', cobrado: 9_120_440, casos: 141, exito: 28.9, tiempoMedio: '3.2d', score: 78 },
  { nombre: 'Carolina Sosa', avatar: 'CS', cobrado: 8_445_700, casos: 133, exito: 27.5, tiempoMedio: '3.4d', score: 75 },
  { nombre: 'Federico Álvarez', avatar: 'FA', cobrado: 7_290_180, casos: 119, exito: 25.1, tiempoMedio: '3.6d', score: 71 },
  { nombre: 'Romina Acuña', avatar: 'RA', cobrado: 6_834_910, casos: 108, exito: 24.0, tiempoMedio: '3.9d', score: 68 },
  { nombre: 'Nicolás Cabrera', avatar: 'NC', cobrado: 6_120_700, casos: 99, exito: 22.5, tiempoMedio: '4.1d', score: 65 },
  { nombre: 'Camila Ortiz', avatar: 'CO', cobrado: 5_890_410, casos: 94, exito: 21.7, tiempoMedio: '4.3d', score: 62 },
  { nombre: 'Tomás Bianchi', avatar: 'TB', cobrado: 5_340_220, casos: 88, exito: 20.4, tiempoMedio: '4.5d', score: 59 },
];

const CLUSTERS = [
  { nombre: 'Pagadores tardíos predecibles', cantidad: 412, monto: 28_400_000, estrategia: 'Recordatorios + descuento por pago a tiempo', color: '#22d3ee', delta: '+12%' },
  { nombre: 'Esquivos crónicos', cantidad: 287, monto: 41_200_000, estrategia: 'Escalamiento + canal alternativo', color: '#f43f5e', delta: '-3%' },
  { nombre: 'Disputadores', cantidad: 96, monto: 12_800_000, estrategia: 'Derivación a equipo legal/disputas', color: '#a78bfa', delta: '+2%' },
  { nombre: 'Sin capacidad de pago', cantidad: 178, monto: 8_900_000, estrategia: 'Refinanciación a largo plazo', color: '#fb923c', delta: '+8%' },
  { nombre: 'Negociadores cooperativos', cantidad: 524, monto: 56_700_000, estrategia: 'Oferta plan en cuotas personalizado', color: '#34d399', delta: '+24%' },
];

const ESTRATEGIAS = [
  { id: 's1', nombre: 'Mora temprana (1-30 días)', segmento: 'Mora < 30d, monto < $500K', respuesta: 68, cobro: 42, ticket: 184_200, pasos: [
    { dia: 1, plantilla: 'Primer contacto cordial' },
    { dia: 3, plantilla: 'Recordatorio amable' },
    { dia: 7, plantilla: 'Link de pago directo' },
    { dia: 14, plantilla: 'Oferta plan 3 cuotas' },
  ]},
  { id: 's2', nombre: 'Mora media — Plan a medida', segmento: '30-90 días, score 400-600', respuesta: 54, cobro: 27, ticket: 312_400, pasos: [
    { dia: 1, plantilla: 'Tono empático difícil' },
    { dia: 4, plantilla: 'Oferta plan 3 cuotas' },
    { dia: 10, plantilla: 'Refinanciación 6 cuotas' },
    { dia: 20, plantilla: 'Quita por pago contado' },
  ]},
  { id: 's3', nombre: 'Recupero alto valor', segmento: 'Monto > $1M, BCRA ≤ 3', respuesta: 47, cobro: 19, ticket: 1_240_800, pasos: [
    { dia: 1, plantilla: 'Primer contacto cordial' },
    { dia: 5, plantilla: 'Quita por pago contado' },
    { dia: 12, plantilla: 'Refinanciación 6 cuotas' },
    { dia: 25, plantilla: 'Aviso pre-judicial' },
  ]},
  { id: 's4', nombre: 'Reactivación silenciosos', segmento: 'Sin respuesta 30d+', respuesta: 31, cobro: 11, ticket: 198_700, pasos: [
    { dia: 1, plantilla: 'Reactivación silenciosos' },
    { dia: 6, plantilla: 'Feliz cumpleaños + oferta' },
    { dia: 15, plantilla: 'Quita por pago contado' },
  ]},
];

const AUDITORIA = [
  { hora: 'hace 2m', usuario: 'mariana.rios', accion: 'Cambió estado de deuda', target: 'Joaquín Bustos → Promesa de pago' },
  { hora: 'hace 18m', usuario: 'diego.pereyra', accion: 'Aplicó estrategia', target: 'Mora media — Plan a medida (12 deudores)' },
  { hora: 'hace 45m', usuario: 'system', accion: 'Sincronizó cartera', target: '482 registros desde API CRM' },
  { hora: 'hace 1h', usuario: 'lucia.fernandez', accion: 'Editó plantilla', target: 'Oferta plan 3 cuotas' },
  { hora: 'hace 3h', usuario: 'admin', accion: 'Invitó usuario', target: 'agustina.vega@bancodelsur.com' },
];

window.CobrData = {
  TENANTS, NOMBRES, PROVINCIAS, ESTADOS, ESTADO_COLOR, SITUACION_BCRA,
  PLANTILLAS, RECENT_LIVE, OPERADORES, CLUSTERS, ESTRATEGIAS, AUDITORIA,
  genDeudores, genConversation,
};

// Reactive store using a tiny pub/sub
function createStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set: (updater) => {
      state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
      subs.forEach((fn) => fn(state));
    },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
}

const initialTenantId = 'banco-sur';
const initialDeudores = genDeudores(initialTenantId, 42);

window.CobrStore = createStore({
  user: { name: 'Mariana Ríos', email: 'mariana.rios@cobrai.app', role: 'Operadora Senior', avatar: 'MR' },
  authed: false,
  tenantId: initialTenantId,
  route: 'login', // login | dashboard-op | portfolio | strategies | templates | inbox | debtor | dashboard-mgmt | settings
  routeParams: {},
  theme: 'dark',
  deudores: initialDeudores,
  activeConversationId: initialDeudores[0].id,
  conversations: Object.fromEntries(initialDeudores.slice(0, 22).map(d => [d.id, window.CobrData.genConversation(d)])),
  toasts: [],
  liveFeed: window.CobrData.RECENT_LIVE.slice(),
  // KPI rollups (recomputed when deudores change)
  notifications: [
    { id: 1, txt: 'Brenda Salinas confirmó promesa para mañana', mins: 2 },
    { id: 2, txt: 'API de scoring crediticio sincronizada (482 registros)', mins: 18 },
    { id: 3, txt: 'Estrategia "Mora media" superó 30% de cobro', mins: 64 },
    { id: 4, txt: '3 mensajes nuevos sin asignar', mins: 90 },
  ],
});

// Helpers
window.fmtMoney = (n) => '$ ' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
window.fmtMoneyShort = (n) => {
  if (n >= 1_000_000) return '$ ' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$ ' + (n / 1_000).toFixed(1) + 'k';
  return '$ ' + Math.round(n);
};
window.fmtInt = (n) => (n || 0).toLocaleString('es-AR');
