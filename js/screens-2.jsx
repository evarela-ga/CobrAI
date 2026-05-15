// Screens part 2: Estrategias, Plantillas, Bandeja (Inbox)
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2, useCallback: useCallback2 } = React;

// ============ ESTRATEGIAS ============
function StrategiesScreen() {
  const [filters, setFilters] = useState2([
    { id: 1, campo: 'mora', op: 'entre', valor: '30 — 90', resultado: 312 },
    { id: 2, campo: 'monto', op: '<', valor: '$ 1.500.000', resultado: 184 },
  ]);
  const [active, setActive] = useState2(window.CobrData.ESTRATEGIAS[0].id);
  const activeStrat = window.CobrData.ESTRATEGIAS.find(s => s.id === active);
  const [pasos, setPasos] = useState2(activeStrat.pasos);
  useEffect2(() => { setPasos(window.CobrData.ESTRATEGIAS.find(s => s.id === active).pasos); }, [active]);

  const addFilter = () => setFilters(f => [...f, { id: Date.now(), campo: 'score', op: '>', valor: '500', resultado: 96 }]);
  const removeFilter = (id) => setFilters(f => f.filter(x => x.id !== id));
  const segmentSize = filters.reduce((acc, f) => Math.min(acc, f.resultado), 482);

  const move = (i, dir) => {
    setPasos(p => {
      const next = [...p];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const apply = () => {
    window.toast({ kind: 'success', title: 'Estrategia aplicada', message: `${segmentSize} deudores fueron asignados a "${activeStrat.nombre}". Primer mensaje sale en 2 minutos.` });
    // Update some debtors' estado for demo
    window.CobrStore.set(s => ({
      ...s,
      deudores: s.deudores.map((d, idx) => idx < 8 ? { ...d, estado: 'En gestión', ultimoContactoHs: 0 } : d),
    }));
  };

  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Estrategias">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estrategias y segmentación</h1>
          <div className="text-sm text-muted">Construí segmentos con filtros encadenables y asigná un playbook a cada uno.</div>
        </div>
        <Btn icon="plus">Nueva estrategia</Btn>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Segment builder */}
        <Card className="col-span-7 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Builder de segmento</div>
              <div className="text-xs text-muted">Encadená condiciones; el contador se actualiza en vivo.</div>
            </div>
            <Badge tone="brand"><Icon name="users" size={12} className="mr-1" /><b className="text-default mr-1"><CountUp value={segmentSize} /></b> deudores en este segmento</Badge>
          </div>
          <div className="space-y-2">
            {filters.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2 panel-muted border subtle-border rounded-lg p-2.5">
                <span className="text-[10px] uppercase text-muted w-10">{i === 0 ? 'SI' : 'Y'}</span>
                <select className="input px-2 py-1.5 rounded border text-xs" defaultValue={f.campo}>
                  <option value="mora">Días de mora</option>
                  <option value="monto">Monto adeudado</option>
                  <option value="score">Score Veraz / buró</option>
                  <option value="provincia">Provincia</option>
                  <option value="contacto">Último contacto</option>
                  <option value="estado">Estado</option>
                  <option value="bcra">Situación BCRA</option>
                  <option value="ingresos">Ingresos estimados</option>
                </select>
                <select className="input px-2 py-1.5 rounded border text-xs" defaultValue={f.op}>
                  <option>{`>`}</option><option>{`<`}</option><option>=</option><option>≠</option><option>entre</option><option>en</option>
                </select>
                <input defaultValue={f.valor} className="input flex-1 px-2 py-1.5 rounded border text-xs" />
                <span className="text-[11px] text-muted tabular w-24 text-right">{f.resultado} matchean</span>
                <IconBtn icon="trash-2" title="Eliminar" onClick={() => removeFilter(f.id)} />
              </div>
            ))}
          </div>
          <button onClick={addFilter} className="mt-2 text-xs text-brand-300 hover:underline inline-flex items-center gap-1">
            <Icon name="plus" size={12} /> Agregar condición
          </button>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-muted">Segmento guardado: <b className="text-default">Mora 30-90d · ticket bajo</b></div>
            <div className="flex items-center gap-2">
              <Btn variant="secondary" icon="save">Guardar segmento</Btn>
              <Btn icon="zap" onClick={apply}>Aplicar estrategia</Btn>
            </div>
          </div>
        </Card>

        {/* Strategy picker */}
        <Card className="col-span-5 p-4">
          <div className="font-semibold mb-1">Estrategias activas</div>
          <div className="text-xs text-muted mb-3">Elegí cuál asignar al segmento.</div>
          <div className="space-y-2">
            {window.CobrData.ESTRATEGIAS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)} className={`w-full text-left rounded-lg border p-3 transition-colors ${active === s.id ? 'border-brand-500/60 bg-brand-500/[0.06]' : 'subtle-border hover:bg-white/[0.03]'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{s.nombre}</div>
                  <Icon name={active === s.id ? 'check-circle-2' : 'circle'} size={16} className={active === s.id ? 'text-brand-300' : 'text-muted'} />
                </div>
                <div className="text-[11px] text-muted mt-0.5">{s.segmento}</div>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  <Metric label="Respuesta" value={`${s.respuesta}%`} />
                  <Metric label="Cobro" value={`${s.cobro}%`} />
                  <Metric label="Ticket" value={window.fmtMoneyShort(s.ticket)} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Timeline editor */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Timeline · {activeStrat.nombre}</div>
            <div className="text-xs text-muted">Reordená los pasos con las flechas. Cada paso ejecuta una plantilla aprobada.</div>
          </div>
          <Btn variant="secondary" icon="plus" size="sm">Agregar paso</Btn>
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-9 h-px bg-gradient-to-r from-brand-500/40 via-violet2-500/40 to-coral-500/40" />
          <div className="grid grid-flow-col auto-cols-fr gap-3">
            {pasos.map((p, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">{i+1}</div>
                  <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Día {p.dia}</div>
                </div>
                <Card className="panel-muted p-3">
                  <div className="text-xs text-muted mb-1">Plantilla</div>
                  <div className="text-sm font-medium">{p.plantilla}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone="brand">WhatsApp</Badge>
                    <div className="flex items-center gap-1">
                      <IconBtn icon="chevron-left" title="Subir" onClick={() => move(i, -1)} />
                      <IconBtn icon="chevron-right" title="Bajar" onClick={() => move(i, +1)} />
                      <IconBtn icon="edit-2" title="Editar" />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded panel-muted border subtle-border px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-sm font-semibold tabular text-default">{value}</div>
    </div>
  );
}

// ============ PLANTILLAS ============
function TemplatesScreen() {
  const [editing, setEditing] = useState2(null);
  const [search, setSearch] = useState2('');
  const list = window.CobrData.PLANTILLAS.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Plantillas">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de plantillas</h1>
          <div className="text-sm text-muted">Mensajes pre-aprobados por Meta para cada momento del journey de cobranza.</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)} className="input pl-7 pr-2 py-1.5 rounded-md border text-xs w-56" />
          </div>
          <Btn icon="plus">Nueva plantilla</Btn>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {list.map(p => <TemplateCard key={p.id} t={p} onEdit={() => setEditing(p)} />)}
      </div>
      <TemplateEditor template={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function highlightVars(text) {
  return text.split(/(\{\{[a-z_]+\}\})/g).map((s, i) =>
    s.startsWith('{{') ? <span key={i} className="bg-brand-500/20 text-brand-300 rounded px-1 py-0.5 font-mono text-[10px]">{s}</span> : <span key={i}>{s}</span>
  );
}

function TemplateCard({ t, onEdit }) {
  const toneByEstado = t.estado === 'Approved' ? 'success' : t.estado === 'Pending' ? 'warning' : 'danger';
  return (
    <Card className="p-4 hover:shadow-glow transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-sm">{t.nombre}</div>
          <Badge tone="neutral" className="mt-1">{t.categoria}</Badge>
        </div>
        <Badge tone={toneByEstado}>{t.estado === 'Approved' ? '✓ Approved' : t.estado === 'Pending' ? '⏳ Pending' : '✕ Rejected'}</Badge>
      </div>
      {/* Phone mock */}
      <div className="panel-muted border subtle-border rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 pb-2 border-b subtle-border mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">CA</div>
          <div className="text-[11px] font-medium text-default">CobrAI · +54 9 11 5555-CBR1</div>
          <div className="ml-auto text-[9px] text-muted">12:34</div>
        </div>
        <div className="bubble-in inline-block max-w-full rounded-lg rounded-tl-sm px-3 py-2 text-xs leading-snug">
          {highlightVars(t.cuerpo)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Metric label="Respuesta" value={`${t.respuesta}%`} />
        <Metric label="Conversión" value={`${t.conversion}%`} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {t.vars.map(v => <code key={v} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300">{`{{${v}}}`}</code>)}
        </div>
        <Btn size="sm" variant="ghost" icon="edit-2" onClick={onEdit}>Editar</Btn>
      </div>
    </Card>
  );
}

function TemplateEditor({ template, onClose }) {
  const [body, setBody] = useState2('');
  useEffect2(() => { if (template) setBody(template.cuerpo); }, [template]);
  if (!template) return null;
  return (
    <Modal open={!!template} onClose={onClose} size="lg" icon="edit-2"
      title={`Editar — ${template.nombre}`}
      subtitle="Cambios requieren reenvío a Meta para re-aprobación"
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn icon="send" onClick={() => { window.toast({ kind: 'success', title: 'Plantilla enviada a Meta', message: 'Aprobación estimada: 2-6h' }); onClose(); }}>Guardar y enviar a aprobación</Btn>
      </>}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1">Nombre</label>
          <input defaultValue={template.nombre} className="input w-full px-3 py-2 rounded-md border text-sm mb-3" />
          <label className="block text-xs text-muted mb-1">Categoría Meta</label>
          <select defaultValue="UTILITY" className="input w-full px-3 py-2 rounded-md border text-sm mb-3">
            <option>UTILITY</option><option>MARKETING</option><option>AUTHENTICATION</option>
          </select>
          <label className="block text-xs text-muted mb-1">Cuerpo del mensaje</label>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows="6" className="input w-full px-3 py-2 rounded-md border text-sm font-mono" />
          <div className="text-[10px] text-muted mt-2">Usá {`{{nombre}}`}, {`{{monto}}`}, {`{{vencimiento}}`}, {`{{link_pago}}`}, {`{{empresa}}`}</div>
        </div>
        <div>
          <div className="text-xs text-muted mb-2">Vista previa en vivo</div>
          <div className="panel-muted border rounded-xl p-3 chat-bg-dark">
            <div className="bubble-in inline-block max-w-full rounded-lg rounded-tl-sm px-3 py-2 text-sm leading-snug shadow">
              {highlightVars(body || ' ')}
              <div className="text-[9px] text-muted mt-1 text-right">12:34 ✓✓</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============ INBOX (Bandeja de Conversaciones) ============
function InboxScreen({ initialId }) {
  const state = window.CobrStore.get();
  const [activeId, setActiveId] = useState2(initialId || state.activeConversationId);
  const [filter, setFilter] = useState2('todas');
  const [search, setSearch] = useState2('');
  const list = state.deudores
    .filter(d => Object.keys(state.conversations).includes(d.id))
    .filter(d => filter === 'todas' || (filter === 'mias' && d.asignado === 'Mariana R.') || (filter === 'sin' && d.asignado === '—') || (filter === 'promesas' && d.estado === 'Promesa de pago'))
    .filter(d => !search || d.nombre.toLowerCase().includes(search.toLowerCase()));

  const active = state.deudores.find(d => d.id === activeId) || state.deudores[0];

  return (
    <div className="h-[calc(100vh-56px)] flex" data-screen-label="Bandeja">
      {/* Left: list */}
      <div className="w-[340px] shrink-0 border-r subtle-border panel-muted flex flex-col">
        <div className="p-3 border-b subtle-border">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Bandeja</div>
            <div className="flex items-center gap-1">
              <IconBtn icon="filter" title="Filtros" />
              <IconBtn icon="more-horizontal" title="Más" />
            </div>
          </div>
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar conversación…" className="input pl-7 pr-2 py-2 rounded-md border text-xs w-full" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[
              { id: 'todas', label: 'Todas', count: 22 },
              { id: 'mias', label: 'Mías', count: 6 },
              { id: 'sin', label: 'Sin asignar', count: 4 },
              { id: 'promesas', label: 'Promesas', count: 3 },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`text-[11px] px-2 py-1 rounded font-medium transition-colors ${filter === f.id ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:bg-white/5'}`}>
                {f.label} <span className="opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y subtle-border">
          {list.map(d => (
            <ConversationListItem key={d.id} d={d} active={d.id === activeId} onClick={() => setActiveId(d.id)} />
          ))}
          {list.length === 0 && <EmptyState icon="inbox" title="Sin conversaciones" hint="Probá con otros filtros." />}
        </div>
      </div>

      {/* Center: chat */}
      <ChatPanel deudor={active} />

      {/* Right: AI panel */}
      <AIPanel deudor={active} />
    </div>
  );
}

function ConversationListItem({ d, active, onClick }) {
  const conv = window.CobrStore.get().conversations[d.id];
  const last = conv ? conv[conv.length - 1] : null;
  const initials = d.nombre.split(' ').map(n=>n[0]).slice(0,2).join('');
  return (
    <button onClick={onClick} className={`w-full text-left p-3 transition-colors ${active ? 'bg-brand-500/10' : 'hover:bg-white/[0.03]'}`}>
      <div className="flex items-start gap-2.5">
        <Avatar initials={initials} size={36} color={`hsl(${(d.nombre.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-sm text-default truncate">{d.nombre}</div>
            <div className="text-[10px] text-muted shrink-0">hace {d.ultimoContactoHs < 60 ? d.ultimoContactoHs + 'm' : Math.floor(d.ultimoContactoHs/24)+'d'}</div>
          </div>
          <div className="text-xs text-muted truncate">{last ? last.text : '—'}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <VolBadge voluntad={d.voluntad} />
            <Badge tone="neutral" className="!text-[9px]">{window.fmtMoneyShort(d.monto)}</Badge>
            {d.estado === 'Promesa de pago' && <Badge tone="violet" className="!text-[9px]">Promesa</Badge>}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatPanel({ deudor }) {
  const [messages, setMessages] = useState2(() => window.CobrStore.get().conversations[deudor.id] || window.CobrData.genConversation(deudor));
  const [input, setInput] = useState2('');
  const [typing, setTyping] = useState2(false);
  const scrollRef = useRef2(null);

  useEffect2(() => {
    setMessages(window.CobrStore.get().conversations[deudor.id] || window.CobrData.genConversation(deudor));
  }, [deudor.id]);

  useEffect2(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    const next = [...messages, { sender: 'ai', text, ts: 0 }];
    setMessages(next);
    window.CobrStore.set(s => ({ ...s, conversations: { ...s.conversations, [deudor.id]: next } }));
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const responses = [
        'ok, lo veo y te aviso',
        'me podés mandar el detalle?',
        'dale, te pago el 30 sin falta',
        'no puedo ahora, pero la semana que viene si',
        'mmm, y si lo hacemos en 6 cuotas?',
        '¿el link es seguro? me da cosita',
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const final = [...next, { sender: 'user', text: reply, ts: 0 }];
      setMessages(final);
      window.CobrStore.set(s => ({ ...s, conversations: { ...s.conversations, [deudor.id]: final } }));
      setTyping(false);
    }, 2800);
  };

  const initials = deudor.nombre.split(' ').map(n=>n[0]).slice(0,2).join('');

  return (
    <div className="flex-1 flex flex-col min-w-0 chat-bg-dark">
      {/* Chat header */}
      <div className="px-4 py-2.5 border-b subtle-border flex items-center gap-3 panel">
        <Avatar initials={initials} size={36} color={`hsl(${(deudor.nombre.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{deudor.nombre}</div>
          <div className="text-[11px] text-muted">DNI {deudor.dni} · {deudor.phone} · Deuda total {window.fmtMoney(deudor.monto)} · {deudor.mora}d de mora</div>
        </div>
        <div className="flex items-center gap-1">
          <Badge tone={deudor.estado === 'Promesa de pago' ? 'violet' : 'brand'}>{deudor.estado}</Badge>
          <IconBtn icon="phone" title="Llamar" />
          <IconBtn icon="user-round" title="Ficha de deudor" onClick={() => window.CobrStore.set({ route: 'debtor', routeParams: { id: deudor.id } })} />
          <IconBtn icon="more-vertical" title="Más" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-2">
        <div className="text-center"><span className="inline-block px-2 py-0.5 bg-black/30 text-muted rounded text-[10px]">— hace 5 días —</span></div>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'ai' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[68%] rounded-lg px-3 py-2 text-sm leading-snug shadow-sm ${m.sender === 'ai' ? 'bubble-out text-emerald-50' : 'bubble-in text-default'}`}>
              {m.text}
              <div className={`text-[9px] mt-1 text-right ${m.sender === 'ai' ? 'text-emerald-200/70' : 'text-muted'}`}>
                {`${10 + (i % 12)}:${String((i*7) % 60).padStart(2,'0')}`}
                {m.sender === 'ai' && <span className="ml-1">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bubble-in rounded-lg px-3 py-2 text-sm text-muted inline-flex items-center"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t subtle-border panel">
        <div className="flex items-center gap-1.5 mb-2 text-[11px] text-muted">
          <span>Plantilla rápida:</span>
          {['Oferta plan 3 cuotas','Quita por pago contado','Link de pago directo'].map(t => (
            <button key={t} onClick={() => send(window.CobrData.PLANTILLAS.find(p => p.nombre === t).cuerpo.replace('{{nombre}}', deudor.nombre.split(' ')[0]).replace('{{monto}}', deudor.monto.toLocaleString('es-AR')).replace('{{link_pago}}', 'pago.cobrai/'+deudor.id.slice(-4)))} className="chip-anim px-2 py-1 rounded-md bg-white/5 hover:bg-brand-500/15 hover:text-brand-300 transition-colors">
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 panel-muted rounded-lg border subtle-border px-3 py-2">
          <IconBtn icon="smile" title="Emoji" />
          <IconBtn icon="paperclip" title="Adjuntar" />
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Escribí un mensaje…"
            className="flex-1 bg-transparent border-0 outline-0 text-sm placeholder:text-muted"
          />
          <Btn size="sm" icon="send" onClick={() => send(input)} disabled={!input.trim()}>Enviar</Btn>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ deudor }) {
  const messages = window.CobrStore.get().conversations[deudor.id] || [];
  const [vol, setVol] = useState2(deudor.voluntad);
  useEffect2(() => {
    // Slowly drift up as conversation has more messages
    const target = Math.min(98, deudor.voluntad + messages.length * 1.2);
    setVol(target);
  }, [deudor.id, messages.length]);

  const [confirming, setConfirming] = useState2(false);
  const [actionModal, setActionModal] = useState2(null);

  return (
    <div className="w-[360px] shrink-0 border-l subtle-border panel-muted overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b subtle-border">
        <div className="font-semibold text-sm mb-1">Voluntad de pago</div>
        <Gauge value={vol} size={180} label="probabilidad" />
        <div className="flex items-center gap-2 text-[11px] mt-1">
          <div className="w-2 h-2 rounded-full bg-coral-500" /><span className="text-muted">Baja 0-39</span>
          <div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-muted">Media 40-69</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-muted">Alta 70-100</span>
        </div>
      </div>

      {/* External credit data */}
      <div className="p-4 border-b subtle-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-violet2-500/15 text-violet2-400 flex items-center justify-center"><Icon name="database" size={11} /></div>
          <div className="font-semibold text-sm">Buró crediticio</div>
          <Badge tone="violet" className="ml-auto">fuente externa</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <KV label="Score Veraz" value={<span className={deudor.score >= 700 ? 'text-emerald-400' : deudor.score >= 500 ? 'text-amber-400' : 'text-coral-400'}>{deudor.score}</span>} />
          <KV label="Deudas otras ent." value={deudor.deudasOtras} />
          <KV label="Ingresos est." value={window.fmtMoneyShort(deudor.ingresos)} />
          <KV label="Deuda total fuera" value={window.fmtMoneyShort(deudor.deudaTotalOtras)} />
        </div>
        <div className="mt-2 text-[11px] text-muted">
          <Icon name="alert-circle" size={11} className="inline mr-1" />{deudor.situacionBCRA}
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 border-b subtle-border">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2"><Icon name="sparkles" size={14} className="text-brand-300" />Resumen IA</div>
        <ul className="space-y-1.5 text-xs">
          {[
            'Tono cooperativo, reconoce la deuda y propone alternativas.',
            'Cobra a fin de mes — preferencia clara por fechas posteriores al día 30.',
            'Solicita información clara sobre el plan, no es un caso de evasión.',
          ].map((b, i) => (
            <li key={i} className="flex gap-2"><span className="text-brand-300 mt-0.5">•</span><span className="text-muted">{b}</span></li>
          ))}
        </ul>
      </div>

      {/* Signals */}
      <div className="p-4 border-b subtle-border">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2"><Icon name="radio" size={14} className="text-violet2-400" />Señales detectadas</div>
        <div className="flex flex-wrap gap-1.5">
          {['propone fecha concreta','tono cooperativo','menciona dificultad económica','consulta detalles del plan','no menciona otros acreedores'].map((s, i) => (
            <Badge key={i} tone="violet" className="!text-[10px]">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="p-4 border-b subtle-border">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2"><Icon name="zap" size={14} className="text-emerald-400" />Estrategia recomendada</div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
          <div className="font-medium text-sm text-emerald-300">Ofrecer plan en 4 cuotas sin interés</div>
          <div className="text-xs text-muted mt-1">Primera cuota el 02/06 (compatible con su fecha de cobro). Sin recargos.</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Metric label="Prob. aceptación" value="82%" />
            <Metric label="Recupero esperado" value={window.fmtMoneyShort(deudor.monto * 0.94)} />
          </div>
          <Btn size="sm" className="w-full justify-center mt-3" icon="check" onClick={() => setConfirming(true)}>Aplicar estrategia</Btn>
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-4">
        <div className="font-semibold text-sm mb-2">Acciones rápidas</div>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="secondary" size="sm" icon="link" onClick={() => { window.toast({ kind: 'success', title: 'Link enviado', message: 'pago.cobrai/'+deudor.id.slice(-4) }); }}>Link de pago</Btn>
          <Btn variant="secondary" size="sm" icon="layers" onClick={() => setActionModal('plan')}>Proponer plan</Btn>
          <Btn variant="secondary" size="sm" icon="arrow-up-circle" onClick={() => { window.toast({ kind: 'warning', title: 'Caso escalado a supervisor', message: 'Carolina Sosa recibirá la asignación.' }); }}>Escalar</Btn>
          <Btn variant="secondary" size="sm" icon="handshake" onClick={() => setActionModal('promesa')}>Promesa de pago</Btn>
        </div>
      </div>

      <Modal open={confirming} onClose={() => setConfirming(false)} icon="zap"
        title="Aplicar estrategia recomendada"
        subtitle="Plan en 4 cuotas sin interés"
        footer={<>
          <Btn variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Btn>
          <Btn icon="send" onClick={() => {
            setConfirming(false);
            window.toast({ kind: 'success', title: 'Plan ofrecido', message: 'Se envió la propuesta y queda pendiente confirmación del deudor.' });
            window.CobrStore.set(s => ({ ...s, deudores: s.deudores.map(d => d.id === deudor.id ? { ...d, estado: 'En gestión' } : d) }));
          }}>Confirmar y enviar</Btn>
        </>}>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span className="text-muted">Deudor</span><b>{deudor.nombre}</b></div>
          <div className="flex justify-between"><span className="text-muted">Monto total</span><b className="tabular">{window.fmtMoney(deudor.monto)}</b></div>
          <div className="flex justify-between"><span className="text-muted">Cuotas</span><b>4 sin interés</b></div>
          <div className="flex justify-between"><span className="text-muted">Cuota mensual</span><b className="tabular">{window.fmtMoney(deudor.monto / 4)}</b></div>
          <div className="flex justify-between"><span className="text-muted">Primera cuota</span><b>02/06/2026</b></div>
          <div className="flex justify-between"><span className="text-muted">Probabilidad de aceptación IA</span><b className="text-emerald-400">82%</b></div>
        </div>
      </Modal>

      <Modal open={actionModal === 'plan'} onClose={() => setActionModal(null)} icon="layers" title="Proponer plan de cuotas"
        footer={<><Btn variant="ghost" onClick={() => setActionModal(null)}>Cancelar</Btn><Btn icon="send" onClick={() => { setActionModal(null); window.toast({ kind: 'success', title: 'Plan enviado' }); }}>Enviar propuesta</Btn></>}>
        <div className="space-y-3 text-sm">
          <label><span className="text-xs text-muted">Cuotas</span><select defaultValue="4" className="input w-full px-3 py-2 mt-1 rounded-md border"><option>3</option><option>4</option><option>6</option><option>12</option></select></label>
          <label><span className="text-xs text-muted">Interés mensual</span><input defaultValue="0%" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          <label><span className="text-xs text-muted">Primer vencimiento</span><input defaultValue="02/06/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
        </div>
      </Modal>

      <Modal open={actionModal === 'promesa'} onClose={() => setActionModal(null)} icon="handshake" title="Registrar promesa de pago"
        footer={<><Btn variant="ghost" onClick={() => setActionModal(null)}>Cancelar</Btn><Btn icon="check" onClick={() => { setActionModal(null); window.toast({ kind: 'success', title: 'Promesa registrada' }); window.CobrStore.set(s => ({ ...s, deudores: s.deudores.map(d => d.id === deudor.id ? { ...d, estado: 'Promesa de pago' } : d) })); }}>Registrar</Btn></>}>
        <div className="space-y-3 text-sm">
          <label><span className="text-xs text-muted">Monto comprometido</span><input defaultValue={window.fmtMoney(deudor.monto * 0.5)} className="input w-full px-3 py-2 mt-1 rounded-md border tabular" /></label>
          <label><span className="text-xs text-muted">Fecha comprometida</span><input defaultValue="02/06/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
        </div>
      </Modal>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="rounded panel border subtle-border p-2">
      <div className="text-[9px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-sm font-semibold tabular text-default mt-0.5">{value}</div>
    </div>
  );
}

Object.assign(window, { StrategiesScreen, TemplatesScreen, InboxScreen });
