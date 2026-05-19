// Screens part 3: Ficha de Deudor, Dashboard Gerencial, Settings
const { useState: useState3, useEffect: useEffect3, useMemo: useMemo3, useRef: useRef3 } = React;

// ============ FICHA DE DEUDOR ============
function DebtorScreen({ id, goto, openConv }) {
  const state = window.CobrStore.get();
  const deudor = state.deudores.find(d => d.id === id) || state.deudores[0];
  const [tab, setTab] = useState3('resumen');
  const [estadoModal, setEstadoModal] = useState3(null);
  const [estado, setEstado] = useState3(deudor.estado);

  const changeEstado = (nuevo) => {
    // Modals contextual to estado
    if (['Pago parcial','Promesa de pago','Incobrable','Judicial','Refinanciada'].includes(nuevo)) {
      setEstadoModal(nuevo);
    } else {
      applyEstado(nuevo);
    }
  };
  const applyEstado = (nuevo, payload = {}) => {
    setEstado(nuevo);
    window.CobrStore.set(s => ({ ...s, deudores: s.deudores.map(d => d.id === deudor.id ? { ...d, estado: nuevo, ...payload } : d) }));
    window.toast({ kind: 'success', title: `Estado actualizado a "${nuevo}"`, message: `Los dashboards se actualizan automáticamente.` });
    setEstadoModal(null);
  };

  return (
    <div className="p-6 fade-in" data-screen-label="Ficha de Deudor">
      <button onClick={() => goto('debtors')} className="text-xs text-muted hover:text-default inline-flex items-center gap-1 mb-3">
        <Icon name="arrow-left" size={12} /> Volver a deudores
      </button>

      {/* Header card */}
      <Card className="p-5 mb-4">
        <div className="flex items-start gap-4">
          <Avatar initials={deudor.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')} size={64} color={`hsl(${(deudor.nombre.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{deudor.nombre}</h1>
              <EstadoBadge estado={estado} />
              <VolBadge voluntad={deudor.voluntad} />
            </div>
            <div className="text-xs text-muted mt-1 flex items-center gap-3 flex-wrap">
              <span><Icon name="user" size={11} className="inline mr-1" />DNI {deudor.dni}</span>
              <span><Icon name="phone" size={11} className="inline mr-1" />{deudor.phone}</span>
              <span><Icon name="mail" size={11} className="inline mr-1" />{deudor.email}</span>
              <span><Icon name="map-pin" size={11} className="inline mr-1" />{deudor.direccion}, {deudor.provincia}</span>
            </div>
            <div className="grid grid-cols-5 gap-3 mt-4">
              <Metric label="Deuda total" value={window.fmtMoney(deudor.monto)} />
              <Metric label="Días de mora" value={`${deudor.mora}d`} />
              <Metric label="Score Veraz" value={deudor.score} />
              <Metric label="Ingresos est." value={window.fmtMoneyShort(deudor.ingresos)} />
              <Metric label="Asignado a" value={deudor.asignado} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Cambiar estado:</span>
              <select value={estado} onChange={e => changeEstado(e.target.value)} className="input px-2.5 py-1.5 rounded-md border text-xs font-medium">
                {window.CobrData.ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="secondary" icon="message-square" onClick={() => { openConv(deudor.id); }}>Conversación</Btn>
              <Btn variant="secondary" icon="phone">Llamar</Btn>
              <Btn icon="zap">Aplicar estrategia</Btn>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={[
        { id: 'resumen', label: 'Resumen', icon: 'user' },
        { id: 'deudas', label: 'Deudas', icon: 'wallet', count: 3 },
        { id: 'inter', label: 'Interacciones', icon: 'activity', count: 24 },
        { id: 'pagos', label: 'Pagos', icon: 'banknote', count: 2 },
      ]} active={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'resumen' && <ResumenTab deudor={deudor} />}
        {tab === 'deudas' && <DeudasTab deudor={deudor} />}
        {tab === 'inter' && <InteraccionesTab deudor={deudor} />}
        {tab === 'pagos' && <PagosTab deudor={deudor} />}
      </div>

      {/* Contextual modals */}
      <EstadoModal kind={estadoModal} deudor={deudor} onClose={() => setEstadoModal(null)} onConfirm={applyEstado} />
    </div>
  );
}

function ResumenTab({ deudor }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2 p-4">
        <div className="font-semibold mb-3">Datos personales</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ['Nombre completo', deudor.nombre],
            ['DNI', deudor.dni],
            ['Fecha de nacimiento', '14/03/1985'],
            ['Email', deudor.email],
            ['Teléfono móvil', deudor.phone],
            ['Teléfono alternativo', '+54 11 4892-3340'],
            ['Domicilio', `${deudor.direccion}, ${deudor.provincia}`],
            ['Ocupación', 'Empleado en relación de dependencia'],
            ['Empleador', 'Logística del Sur S.A.'],
            ['Antigüedad laboral', '4 años, 3 meses'],
          ].map(([k, v], i) => (
            <div key={i} className="flex justify-between py-1.5 border-b subtle-border last:border-0">
              <span className="text-muted">{k}</span><span className="text-default font-medium text-right">{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 border border-violet2-500/30 bg-violet2-500/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded bg-violet2-500/15 text-violet2-400 flex items-center justify-center"><Icon name="database" size={14} /></div>
          <div className="font-semibold">Buró crediticio</div>
          <Badge tone="violet" className="ml-auto">externo</Badge>
        </div>
        <div className="text-[10px] text-muted mb-3">Fuente: Veraz Equifax · Actualizado hace 14h</div>
        <div className="grid grid-cols-2 gap-2">
          <KV label="Score Veraz" value={<span className={deudor.score >= 700 ? 'text-emerald-400' : deudor.score >= 500 ? 'text-amber-400' : 'text-coral-400'}>{deudor.score}/900</span>} />
          <KV label="Situación BCRA" value={deudor.situacionBCRA.match(/Situación \d/)[0]} />
          <KV label="Deudas otras ent." value={deudor.deudasOtras} />
          <KV label="Monto otras ent." value={window.fmtMoneyShort(deudor.deudaTotalOtras)} />
          <KV label="Ingresos est." value={window.fmtMoneyShort(deudor.ingresos)} />
          <KV label="Capacidad pago" value={<span className="text-amber-400">Media</span>} />
        </div>
        <div className="mt-3 panel-muted border subtle-border rounded p-2 text-[11px]">
          <div className="font-medium text-default mb-1">Historial 12 meses</div>
          <div className="flex gap-0.5">
            {Array.from({length: 12}).map((_, i) => {
              const v = (deudor.score + i*23) % 5;
              const colors = ['bg-emerald-500/70','bg-emerald-500/40','bg-amber-500/60','bg-amber-500/80','bg-coral-500/70'];
              return <div key={i} className={`flex-1 h-5 rounded-sm ${colors[v]}`} title={`Mes ${i+1}: Situación ${v+1}`} />;
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DeudasTab({ deudor }) {
  const deudas = [
    { id: 'D1', tipo: 'Préstamo personal', monto: deudor.monto * 0.62, antiguedad: deudor.mora, estado: deudor.estado },
    { id: 'D2', tipo: 'Tarjeta de crédito', monto: deudor.monto * 0.28, antiguedad: deudor.mora - 12, estado: 'Vigente' },
    { id: 'D3', tipo: 'Cuota de plan refinanciado', monto: deudor.monto * 0.10, antiguedad: 5, estado: 'En gestión' },
  ];
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted">
          <th className="font-medium px-4 py-2.5">#</th>
          <th className="font-medium px-2 py-2.5">Tipo</th>
          <th className="font-medium px-2 py-2.5 text-right">Monto</th>
          <th className="font-medium px-2 py-2.5 text-right">Antigüedad</th>
          <th className="font-medium px-2 py-2.5">Estado</th>
          <th className="font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody>
          {deudas.map(d => (
            <tr key={d.id} className="border-t subtle-border">
              <td className="px-4 py-2.5 font-mono text-xs text-muted">{d.id}</td>
              <td className="px-2 py-2.5">{d.tipo}</td>
              <td className="px-2 py-2.5 text-right tabular">{window.fmtMoney(d.monto)}</td>
              <td className="px-2 py-2.5 text-right tabular text-muted">{d.antiguedad}d</td>
              <td className="px-2 py-2.5"><EstadoBadge estado={d.estado} /></td>
              <td className="px-4 py-2.5 text-right"><Btn size="sm" variant="ghost" icon="external-link">Detalle</Btn></td>
            </tr>
          ))}
          <tr className="border-t subtle-border panel-muted">
            <td colSpan="2" className="px-4 py-2.5 font-semibold">Total</td>
            <td className="px-2 py-2.5 text-right font-bold tabular">{window.fmtMoney(deudor.monto)}</td>
            <td colSpan="3"></td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function InteraccionesTab({ deudor }) {
  const events = [
    { hora: 'Hoy 14:18', tipo: 'wa', txt: 'Mensaje enviado: "Te paso el link para que dejes la cuota agendada"', actor: 'Mariana R.' },
    { hora: 'Hoy 14:15', tipo: 'wa-in', txt: 'Mensaje recibido: "dale, pero la primera la pago el 2/6"', actor: deudor.nombre },
    { hora: 'Hoy 14:10', tipo: 'ai', txt: 'IA ofreció plan en 4 cuotas sin interés', actor: 'CobrAI' },
    { hora: 'Ayer 19:42', tipo: 'estado', txt: 'Estado cambiado: Vigente → En gestión', actor: 'Mariana R.' },
    { hora: 'Hace 2 días', tipo: 'call', txt: 'Llamada saliente — 02:14 — sin respuesta', actor: 'Diego P.' },
    { hora: 'Hace 4 días', tipo: 'wa', txt: 'Mensaje enviado: "Recordatorio amable"', actor: 'CobrAI' },
    { hora: 'Hace 6 días', tipo: 'estado', txt: 'Importado desde API · Score 643 enriquecido', actor: 'system' },
  ];
  const ico = { wa: 'send', 'wa-in': 'message-circle', call: 'phone', estado: 'circle-dot', ai: 'sparkles' };
  return (
    <Card className="p-5">
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border subtle-border flex items-center justify-center ${e.tipo === 'ai' ? 'bg-violet2-500/15 text-violet2-400' : e.tipo === 'wa-in' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-muted'}`}>
                <Icon name={ico[e.tipo]} size={14} />
              </div>
              {i < events.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
            </div>
            <div className="flex-1 pb-2">
              <div className="text-sm text-default">{e.txt}</div>
              <div className="text-[11px] text-muted mt-0.5">{e.hora} · {e.actor}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PagosTab({ deudor }) {
  const pagos = [
    { fecha: '02/06/2026', monto: deudor.monto / 4, metodo: 'Transferencia', estado: 'Pendiente', comprob: '—' },
    { fecha: '14/03/2026', monto: 84_500, metodo: 'Mercado Pago', estado: 'Acreditado', comprob: 'MP-8429183' },
    { fecha: '03/01/2026', monto: 120_000, metodo: 'Débito CBU', estado: 'Acreditado', comprob: 'DB-3398002' },
  ];
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted">
          <th className="font-medium px-4 py-2.5">Fecha</th>
          <th className="font-medium px-2 py-2.5 text-right">Monto</th>
          <th className="font-medium px-2 py-2.5">Método</th>
          <th className="font-medium px-2 py-2.5">Estado</th>
          <th className="font-medium px-2 py-2.5">Comprobante</th>
        </tr></thead>
        <tbody>
          {pagos.map((p, i) => (
            <tr key={i} className="border-t subtle-border">
              <td className="px-4 py-2.5 tabular">{p.fecha}</td>
              <td className="px-2 py-2.5 text-right tabular">{window.fmtMoney(p.monto)}</td>
              <td className="px-2 py-2.5">{p.metodo}</td>
              <td className="px-2 py-2.5"><Badge tone={p.estado === 'Acreditado' ? 'success' : 'warning'}>{p.estado}</Badge></td>
              <td className="px-2 py-2.5 font-mono text-xs text-muted">{p.comprob}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function EstadoModal({ kind, deudor, onClose, onConfirm }) {
  if (!kind) return null;
  const titles = {
    'Pago parcial': 'Registrar pago parcial',
    'Promesa de pago': 'Registrar promesa de pago',
    'Incobrable': 'Marcar como incobrable',
    'Judicial': 'Enviar a etapa judicial',
    'Refinanciada': 'Refinanciar deuda',
  };
  const icons = { 'Pago parcial': 'banknote', 'Promesa de pago': 'handshake', 'Incobrable': 'x-octagon', 'Judicial': 'gavel', 'Refinanciada': 'rotate-ccw' };
  return (
    <Modal open onClose={onClose} icon={icons[kind]} title={titles[kind]} subtitle={`Aplica a ${deudor.nombre} — ${window.fmtMoney(deudor.monto)}`}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon="check" onClick={() => onConfirm(kind)}>Confirmar</Btn></>}>
      <div className="space-y-3 text-sm">
        {kind === 'Pago parcial' && <>
          <label className="block"><span className="text-xs text-muted">Monto pagado</span><input defaultValue={window.fmtMoney(deudor.monto * 0.4)} className="input w-full px-3 py-2 mt-1 rounded-md border tabular" /></label>
          <label className="block"><span className="text-xs text-muted">Fecha</span><input defaultValue="15/05/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          <label className="block"><span className="text-xs text-muted">Método</span><select className="input w-full px-3 py-2 mt-1 rounded-md border"><option>Transferencia bancaria</option><option>Mercado Pago</option><option>Efectivo</option><option>Débito CBU</option></select></label>
          <div><span className="text-xs text-muted">Comprobante</span><FileDrop hint="Soltá el comprobante (PNG/PDF)" onDrop={() => {}} /></div>
        </>}
        {kind === 'Promesa de pago' && <>
          <label className="block"><span className="text-xs text-muted">Monto comprometido</span><input defaultValue={window.fmtMoney(deudor.monto)} className="input w-full px-3 py-2 mt-1 rounded-md border tabular" /></label>
          <label className="block"><span className="text-xs text-muted">Fecha comprometida</span><input defaultValue="02/06/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          <label className="block"><span className="text-xs text-muted">Canal de confirmación</span><select className="input w-full px-3 py-2 mt-1 rounded-md border"><option>WhatsApp</option><option>Llamada</option><option>Email</option></select></label>
        </>}
        {kind === 'Incobrable' && <>
          <label className="block"><span className="text-xs text-muted">Motivo</span><select className="input w-full px-3 py-2 mt-1 rounded-md border"><option>Fallecimiento</option><option>Imposibilidad estructural de pago</option><option>Ubicabilidad nula > 180d</option><option>Negativa explícita</option><option>Otro</option></select></label>
          <label className="block"><span className="text-xs text-muted">Observaciones</span><textarea rows="3" className="input w-full px-3 py-2 mt-1 rounded-md border" placeholder="Detallar contexto y evidencia…" /></label>
          <div className="rounded border border-coral-500/30 bg-coral-500/5 p-2 text-xs text-coral-300"><Icon name="alert-triangle" size={12} className="inline mr-1" />Acción irreversible. Requiere revisión de supervisor en 24h.</div>
        </>}
        {kind === 'Judicial' && <>
          <label className="block"><span className="text-xs text-muted">Fecha de envío</span><input defaultValue="20/05/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          <label className="block"><span className="text-xs text-muted">Estudio jurídico</span><select className="input w-full px-3 py-2 mt-1 rounded-md border"><option>Maldonado & Asociados</option><option>Estudio Pereyra</option><option>Lex Recupero S.R.L.</option></select></label>
          <label className="block"><span className="text-xs text-muted">Honorarios estimados</span><input defaultValue={window.fmtMoney(deudor.monto * 0.15)} className="input w-full px-3 py-2 mt-1 rounded-md border tabular" /></label>
        </>}
        {kind === 'Refinanciada' && <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs text-muted">Cuotas</span><input defaultValue="12" type="number" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
            <label className="block"><span className="text-xs text-muted">Interés mensual</span><input defaultValue="2.5%" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
            <label className="block"><span className="text-xs text-muted">Primer venc.</span><input defaultValue="02/06/2026" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
            <label className="block"><span className="text-xs text-muted">Día de cobro</span><input defaultValue="2 cada mes" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          </div>
          <div className="panel-muted border subtle-border rounded p-3 mt-2 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted">Cuota mensual estimada</span><b className="tabular">{window.fmtMoney(deudor.monto * 1.32 / 12)}</b></div>
            <div className="flex justify-between"><span className="text-muted">Total a pagar</span><b className="tabular">{window.fmtMoney(deudor.monto * 1.32)}</b></div>
          </div>
        </>}
      </div>
    </Modal>
  );
}

// ============ DASHBOARD GERENCIAL ============
function DashboardMgmt() {
  const state = window.CobrStore.get();
  const tenant = window.CobrData.TENANTS.find(t => t.id === state.tenantId);
  const [periodo, setPeriodo] = useState3('mes');

  const kpis = useMemo3(() => {
    const cartera = state.deudores.reduce((a, d) => a + d.monto, 0);
    const recuperado = cartera * 0.184;
    const activos = state.deudores.filter(d => !['Cancelada','Incobrable'].includes(d.estado)).length;
    const cerrados = state.deudores.length - activos;
    const ticket = cartera / state.deudores.length;
    return [
      { k: 'Cartera total', v: cartera, fmt: window.fmtMoneyShort, delta: '+8%', icon: 'wallet', color: '#22d3ee' },
      { k: 'Recuperado (mes)', v: recuperado, fmt: window.fmtMoneyShort, delta: '+24%', icon: 'banknote', color: '#10b981' },
      { k: 'Recupero %', v: 18.4, fmt: v => v.toFixed(1) + '%', delta: '+2.1pp', icon: 'trending-up', color: '#10b981' },
      { k: 'Ticket promedio', v: ticket, fmt: window.fmtMoneyShort, delta: '-3%', icon: 'receipt', color: '#a78bfa' },
      { k: 'DSO', v: 47, fmt: v => Math.round(v) + 'd', delta: '-4d', icon: 'clock', color: '#a78bfa' },
      { k: 'Casos activos', v: activos, fmt: window.fmtInt, delta: '+12', icon: 'users', color: '#22d3ee' },
      { k: 'Casos cerrados', v: cerrados, fmt: window.fmtInt, delta: '+24', icon: 'check-check', color: '#10b981' },
      { k: 'Tasa incobrabilidad', v: 4.8, fmt: v => v.toFixed(1) + '%', delta: '-0.3pp', icon: 'x-circle', color: '#f43f5e' },
    ];
  }, [state.deudores]);

  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Dashboard Gerencial">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">{tenant.name} · Vista ejecutiva</div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard gerencial</h1>
        </div>
        <div className="flex items-center gap-1 panel-muted border subtle-border rounded-lg p-1">
          {['Hoy','Semana','Mes','Trim.','Año','Custom'].map(p => (
            <button key={p} onClick={() => setPeriodo(p.toLowerCase())} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${periodo === p.toLowerCase() ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:text-default'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* AI module for management */}
      <MgmtAIModule kpis={kpis} tenant={tenant} state={state} />

      {/* KPIs */}
      <div className="grid grid-cols-8 gap-3">
        {kpis.map((k, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center" style={{ color: k.color }}><Icon name={k.icon} size={13} /></div>
              <span className={`text-[10px] tabular font-medium ${k.delta.startsWith('-') && !k.k.includes('DSO') && !k.k.includes('incob') ? 'text-coral-400' : 'text-emerald-400'}`}>{k.delta}</span>
            </div>
            <div className="text-lg font-bold tracking-tight tabular leading-tight">
              <CountUp value={k.v} format={k.fmt} />
            </div>
            <div className="text-[10px] text-muted mt-0.5 truncate">{k.k}</div>
          </Card>
        ))}
      </div>

      {/* Row 2: Line chart + Stacked bars + Donut */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-7 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Evolución de recupero</div>
              <div className="text-xs text-muted">Mensual · últimos 12 meses</div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-400" />Recuperado</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet2-400" />Objetivo</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />Pagado</div>
            </div>
          </div>
          <LineChart
            labels={['Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr','May']}
            yMax={60_000_000}
            series={[
              { color: '#22d3ee', data: [22_400_000, 24_800_000, 26_100_000, 27_500_000, 29_800_000, 32_400_000, 33_900_000, 35_200_000, 37_800_000, 41_200_000, 44_900_000, 48_700_000] },
              { color: '#a78bfa', data: [25_000_000, 26_500_000, 28_000_000, 29_500_000, 31_000_000, 32_500_000, 34_000_000, 35_500_000, 37_000_000, 38_500_000, 40_000_000, 41_500_000] },
              { color: '#10b981', data: [18_200_000, 19_800_000, 21_100_000, 22_500_000, 24_800_000, 26_400_000, 27_900_000, 29_200_000, 32_800_000, 35_200_000, 38_900_000, 42_700_000] },
            ]}
          />
        </Card>

        <Card className="col-span-3 p-4">
          <div className="font-semibold mb-1">Recupero por tramo de mora</div>
          <div className="text-xs text-muted mb-4">Distribución del mes</div>
          <StackedBars data={[
            { label: '0-30', segments: [42, 12] },
            { label: '31-60', segments: [38, 16] },
            { label: '61-90', segments: [29, 19] },
            { label: '91-180', segments: [18, 21] },
            { label: '180+', segments: [8, 24] },
          ]} colors={['#10b981','#22d3ee']} height={170} />
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-500" />Recuperado %</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-brand-400" />Pendiente %</div>
          </div>
        </Card>

        <Card className="col-span-2 p-4">
          <div className="font-semibold mb-1">Distribución por estado</div>
          <div className="text-xs text-muted mb-3">Cartera activa</div>
          <Donut data={[
            { value: 28, color: '#22d3ee' },
            { value: 24, color: '#a78bfa' },
            { value: 18, color: '#10b981' },
            { value: 12, color: '#f59e0b' },
            { value: 10, color: '#f43f5e' },
            { value: 8, color: '#525a6f' },
          ]} centerValue="58" centerLabel="estados" size={130} thickness={18} />
          <div className="space-y-1 mt-2 text-[10px]">
            {[
              ['#22d3ee','En gestión','28%'], ['#a78bfa','Promesa de pago','24%'],
              ['#10b981','Pago parcial','18%'], ['#f59e0b','Refinanciada','12%'],
              ['#f43f5e','Judicial','10%'], ['#525a6f','Otros','8%'],
            ].map(([c,l,p],i) => (
              <div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm" style={{background:c}} /><span className="flex-1 text-muted">{l}</span><span className="tabular text-default">{p}</span></div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Map + Operadores ranking */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-5 p-4">
          <div className="font-semibold mb-1">Mapa de morosidad</div>
          <div className="text-xs text-muted mb-3">Monto pendiente por provincia</div>
          <ArgentinaMap data={{
            'Buenos Aires': 78_400_000, 'CABA': 64_200_000, 'Córdoba': 38_900_000, 'Santa Fe': 29_800_000,
            'Mendoza': 18_400_000, 'Tucumán': 12_200_000, 'Salta': 9_800_000, 'Entre Ríos': 14_700_000,
            'Chaco': 8_900_000, 'Misiones': 7_200_000, 'Corrientes': 6_800_000, 'Neuquén': 11_400_000,
            'San Juan': 7_400_000, 'Jujuy': 5_200_000, 'Río Negro': 8_100_000, 'La Pampa': 4_900_000,
            'Catamarca': 3_800_000, 'La Rioja': 3_200_000, 'San Luis': 4_600_000, 'Santiago del Estero': 5_800_000,
            'Formosa': 3_400_000, 'Chubut': 6_700_000, 'Santa Cruz': 4_200_000, 'Tierra del Fuego': 2_800_000,
          }} />
        </Card>

        <Card className="col-span-7 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Ranking de operadores</div>
              <div className="text-xs text-muted">Top 10 — período actual</div>
            </div>
            <Btn size="sm" variant="ghost" icon="download">Exportar</Btn>
          </div>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 0, 2].map((idx, pos) => {
              const o = window.CobrData.OPERADORES[idx];
              const places = ['2°','1°','3°'];
              const heights = ['h-20','h-28','h-16'];
              const bgs = ['from-ink-600 to-ink-700','from-amber-400 to-amber-600','from-orange-700 to-orange-900'];
              return (
                <div key={idx} className="flex flex-col items-center">
                  <Avatar initials={o.avatar} size={48} color={pos === 1 ? '#f59e0b' : pos === 0 ? '#7c8499' : '#c2410c'} />
                  <div className="text-xs font-medium mt-2">{o.nombre}</div>
                  <div className="text-[10px] text-muted tabular">{window.fmtMoneyShort(o.cobrado)}</div>
                  <div className={`w-full rounded-t-md mt-2 bg-gradient-to-b ${bgs[pos]} ${heights[pos]} flex items-start justify-center pt-1 text-white text-xs font-bold`}>
                    {places[pos]}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Rest */}
          <div className="space-y-1">
            {window.CobrData.OPERADORES.slice(3, 10).map((o, i) => (
              <div key={o.nombre} className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 hover:bg-white/[0.03] rounded">
                <div className="col-span-1 text-xs text-muted tabular">#{i + 4}</div>
                <div className="col-span-4 flex items-center gap-2"><Avatar initials={o.avatar} size={26} color="#525a6f" /><span className="text-sm">{o.nombre}</span></div>
                <div className="col-span-2 text-right tabular text-sm">{window.fmtMoneyShort(o.cobrado)}</div>
                <div className="col-span-1 text-right tabular text-xs text-muted">{o.casos}</div>
                <div className="col-span-2 text-right tabular text-xs">{o.exito.toFixed(1)}%</div>
                <div className="col-span-1 text-right tabular text-xs text-muted">{o.tiempoMedio}</div>
                <div className="col-span-1 text-right"><Badge tone={o.score >= 80 ? 'success' : o.score >= 70 ? 'brand' : 'neutral'}>{o.score}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: Clusters + Strategies comparison + Forecast */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="brain-circuit" size={16} className="text-violet2-400" />
            <div className="font-semibold">Clusters detectados por IA</div>
          </div>
          <div className="space-y-2">
            {window.CobrData.CLUSTERS.map((c, i) => (
              <div key={i} className="flex items-center gap-3 panel-muted border subtle-border rounded-lg p-2.5">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${c.color}25`, color: c.color }}><Icon name="users-round" size={14} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.nombre}</div>
                  <div className="text-[11px] text-muted truncate">{c.estrategia}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular">{c.cantidad}</div>
                  <div className="text-[10px] text-muted tabular">{window.fmtMoneyShort(c.monto)}</div>
                </div>
                <Badge tone={c.delta.startsWith('+') ? 'success' : 'danger'} className="!text-[10px]">{c.delta}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-4 p-4">
          <div className="font-semibold mb-1">Comparativa de estrategias</div>
          <div className="text-xs text-muted mb-3">Tasa de cobro por playbook</div>
          <div className="space-y-3 mt-4">
            {window.CobrData.ESTRATEGIAS.map((s, i) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-default truncate">{s.nombre}</span>
                  <span className="tabular font-semibold">{s.cobro}%</span>
                </div>
                <ProgressBar value={s.cobro} max={50} color={['#22d3ee','#a78bfa','#10b981','#f59e0b'][i]} />
              </div>
            ))}
          </div>
          <div className="mt-4 panel-muted border subtle-border rounded p-2 text-[11px] text-muted">
            <Icon name="lightbulb" size={12} className="inline mr-1 text-amber-400" /><b className="text-default">Mora temprana</b> convierte 1.6× mejor que las demás. Considerar mover presupuesto.
          </div>
        </Card>

        <Card className="col-span-3 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="trending-up" size={14} className="text-emerald-400" />
            <div className="font-semibold">Forecast IA</div>
          </div>
          <div className="text-xs text-muted mb-4">Recupero proyectado próximos 90d</div>
          <ForecastChart />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Metric label="30d" value={window.fmtMoneyShort(48_900_000)} />
            <Metric label="60d" value={window.fmtMoneyShort(96_400_000)} />
            <Metric label="90d" value={window.fmtMoneyShort(141_800_000)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ForecastChart() {
  const w = 240, h = 110;
  const pad = { l: 4, r: 4, t: 8, b: 8 };
  const past = [42, 45, 48, 51, 49, 53, 56, 58];
  const future = [56, 60, 65, 71, 78, 85, 93];
  const all = [...past, ...future];
  const max = Math.max(...all) * 1.15;
  const xStep = (w - pad.l - pad.r) / (all.length - 1);
  const pts = all.map((v, i) => [pad.l + i * xStep, pad.t + (1 - v / max) * (h - pad.t - pad.b)]);
  const upper = future.map((v, i) => [pad.l + (past.length - 1 + i) * xStep, pad.t + (1 - (v * 1.15) / max) * (h - pad.t - pad.b)]);
  const lower = future.map((v, i) => [pad.l + (past.length - 1 + i) * xStep, pad.t + (1 - (v * 0.85) / max) * (h - pad.t - pad.b)]);
  const bandPath = `M ${upper[0][0]} ${upper[0][1]} ` + upper.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') +
    ` L ${lower[lower.length-1][0]} ${lower[lower.length-1][1]} ` + [...lower].reverse().slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') + ' Z';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <path d={bandPath} fill="#10b981" opacity="0.15" />
      <path d={pts.slice(0, past.length).map((p,i)=>i===0?`M ${p[0]} ${p[1]}`:`L ${p[0]} ${p[1]}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2" />
      <path d={pts.slice(past.length - 1).map((p,i)=>i===0?`M ${p[0]} ${p[1]}`:`L ${p[0]} ${p[1]}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4,3" />
      <line x1={pts[past.length-1][0]} y1={pad.t} x2={pts[past.length-1][0]} y2={h-pad.b} stroke="rgba(255,255,255,0.1)" strokeDasharray="2,2" />
      <text x={pts[past.length-1][0] - 4} y={pad.t + 8} textAnchor="end" className="fill-current text-muted" style={{fontSize:8}}>hoy</text>
    </svg>
  );
}

// ============ SETTINGS ============
function SettingsScreen() {
  const [tab, setTab] = useState3('marca');
  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Configuración">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del tenant</h1>
        <div className="text-sm text-muted">Ajustes específicos del workspace activo.</div>
      </div>
      <Tabs tabs={[
        { id: 'marca', label: 'Marca y branding', icon: 'palette' },
        { id: 'users', label: 'Usuarios y roles', icon: 'users', count: 14 },
        { id: 'integrations', label: 'Integraciones', icon: 'plug', count: 6 },
        { id: 'billing', label: 'Facturación', icon: 'credit-card' },
        { id: 'audit', label: 'Logs de auditoría', icon: 'scroll' },
      ]} active={tab} onChange={setTab} />
      {tab === 'marca' && <BrandTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'integrations' && <IntegrationsTab />}
      {tab === 'billing' && <BillingTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
}

function BrandTab() {
  const tenant = window.CobrData.TENANTS.find(t => t.id === window.CobrStore.get().tenantId);
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2 p-5 space-y-3">
        <div className="font-semibold mb-2">Identidad</div>
        <label className="block"><span className="text-xs text-muted">Nombre comercial</span><input defaultValue={tenant.name} className="input w-full px-3 py-2 mt-1 rounded-md border text-sm" /></label>
        <label className="block"><span className="text-xs text-muted">CUIT</span><input defaultValue="30-71245678-9" className="input w-full px-3 py-2 mt-1 rounded-md border text-sm" /></label>
        <label className="block"><span className="text-xs text-muted">Color primario (mensajes salientes)</span>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" defaultValue={tenant.color} className="w-12 h-9 rounded border subtle-border bg-transparent" />
            <input defaultValue={tenant.color} className="input flex-1 px-3 py-2 rounded-md border text-sm font-mono" />
          </div>
        </label>
        <label className="block"><span className="text-xs text-muted">Firma del operador</span><textarea defaultValue={`— Equipo de gestión de ${tenant.name}`} rows="2" className="input w-full px-3 py-2 mt-1 rounded-md border text-sm" /></label>
        <div className="flex justify-end pt-2"><Btn icon="save" onClick={() => window.toast({ kind: 'success', title: 'Cambios guardados' })}>Guardar</Btn></div>
      </Card>
      <Card className="p-4">
        <div className="font-semibold mb-2 text-sm">Logo y assets</div>
        <FileDrop hint="Soltá tu logo (PNG transparente)" onDrop={() => window.toast({ kind: 'success', title: 'Logo cargado' })} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-muted">
          {['Avatar','Favicon','Login bg'].map(x => <div key={x} className="aspect-square panel-muted border subtle-border rounded flex items-center justify-center text-center">{x}<br/>placeholder</div>)}
        </div>
      </Card>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState3([
    { nombre: 'Mariana Ríos', email: 'mariana.rios@bancodelsur.com', rol: 'Operadora Senior', activo: true, last: 'Hace 2m' },
    { nombre: 'Diego Pereyra', email: 'diego.pereyra@bancodelsur.com', rol: 'Operador', activo: true, last: 'Hace 14m' },
    { nombre: 'Carolina Sosa', email: 'carolina.sosa@bancodelsur.com', rol: 'Supervisora', activo: true, last: 'Hace 1h' },
    { nombre: 'Federico Álvarez', email: 'federico.alvarez@bancodelsur.com', rol: 'Operador', activo: true, last: 'Ayer' },
    { nombre: 'Lucía Fernández', email: 'lucia.fernandez@bancodelsur.com', rol: 'Operadora Senior', activo: true, last: 'Hace 4h' },
    { nombre: 'Sebastián Iglesias', email: 'sebastian.iglesias@bancodelsur.com', rol: 'Operador', activo: true, last: 'Hace 22m' },
    { nombre: 'Romina Acuña', email: 'romina.acuna@bancodelsur.com', rol: 'Operadora', activo: false, last: 'Hace 3 días' },
    { nombre: 'Tomás Bianchi', email: 'tomas.bianchi@bancodelsur.com', rol: 'Operador', activo: true, last: 'Hace 18m' },
    { nombre: 'Camila Ortiz', email: 'camila.ortiz@bancodelsur.com', rol: 'Operadora', activo: true, last: 'Hace 7m' },
    { nombre: 'Nicolás Cabrera', email: 'nicolas.cabrera@bancodelsur.com', rol: 'Operador', activo: true, last: 'Hace 31m' },
    { nombre: 'Agustina Vega', email: 'agustina.vega@bancodelsur.com', rol: 'Operadora', activo: true, last: 'Hace 12m' },
    { nombre: 'Hernán Maldonado', email: 'hernan.maldonado@bancodelsur.com', rol: 'Gerente', activo: true, last: 'Hace 2h' },
    { nombre: 'Valeria Domínguez', email: 'valeria.dominguez@bancodelsur.com', rol: 'Operadora', activo: true, last: 'Hace 9m' },
    { nombre: 'Bruno Coronel', email: 'bruno.coronel@bancodelsur.com', rol: 'Operador', activo: false, last: 'Hace 1 semana' },
  ]);
  const [modal, setModal] = useState3(null);
  const remove = (email) => setUsers(u => u.filter(x => x.email !== email));
  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-3 border-b subtle-border">
          <div>
            <div className="font-semibold">{users.length} usuarios</div>
            <div className="text-xs text-muted">Roles, permisos y accesos.</div>
          </div>
          <Btn icon="user-plus" onClick={() => setModal('invite')}>Invitar usuario</Btn>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="font-medium px-4 py-2">Usuario</th>
            <th className="font-medium px-2 py-2">Rol</th>
            <th className="font-medium px-2 py-2">Último acceso</th>
            <th className="font-medium px-2 py-2">Estado</th>
            <th className="font-medium px-4 py-2"></th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} className="border-t subtle-border">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={u.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')} size={28} color="#525a6f" />
                    <div><div className="font-medium">{u.nombre}</div><div className="text-[11px] text-muted">{u.email}</div></div>
                  </div>
                </td>
                <td className="px-2 py-2"><Badge tone={u.rol.includes('Gerente') ? 'violet' : u.rol.includes('Super') ? 'brand' : 'neutral'}>{u.rol}</Badge></td>
                <td className="px-2 py-2 text-muted text-xs">{u.last}</td>
                <td className="px-2 py-2">{u.activo ? <Badge tone="success">Activo</Badge> : <Badge tone="neutral">Inactivo</Badge>}</td>
                <td className="px-4 py-2 text-right">
                  <IconBtn icon="edit-2" title="Editar" />
                  <IconBtn icon="trash-2" title="Eliminar" onClick={() => setModal({ kind: 'remove', email: u.email })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={modal === 'invite'} onClose={() => setModal(null)} icon="user-plus" title="Invitar nuevo usuario"
        footer={<><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn><Btn icon="send" onClick={() => { setModal(null); window.toast({ kind: 'success', title: 'Invitación enviada' }); }}>Enviar invitación</Btn></>}>
        <div className="space-y-3">
          <label className="block"><span className="text-xs text-muted">Email</span><input placeholder="nombre@empresa.com" className="input w-full px-3 py-2 mt-1 rounded-md border" /></label>
          <label className="block"><span className="text-xs text-muted">Rol</span><select className="input w-full px-3 py-2 mt-1 rounded-md border"><option>Operador</option><option>Operadora Senior</option><option>Supervisora</option><option>Gerente</option><option>Admin</option></select></label>
        </div>
      </Modal>
      <Modal open={modal?.kind === 'remove'} onClose={() => setModal(null)} icon="trash-2" title="Eliminar usuario" subtitle="Esta acción es irreversible."
        footer={<><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn><Btn variant="danger" icon="trash-2" onClick={() => { remove(modal.email); setModal(null); window.toast({ kind: 'success', title: 'Usuario eliminado' }); }}>Eliminar</Btn></>}>
        <div className="text-sm text-muted">¿Confirmás eliminar a <b className="text-default">{modal?.email}</b>?</div>
      </Modal>
    </>
  );
}

function IntegrationsTab() {
  const ints = [
    { name: 'WhatsApp Business API', desc: 'Canal principal de mensajería', icon: 'message-circle', color: '#10b981', connected: true, meta: '2 números activos · 12 plantillas aprobadas' },
    { name: 'Buró crediticio Veraz', desc: 'Score y situación BCRA', icon: 'database', color: '#a78bfa', connected: true, meta: '482 consultas / mes' },
    { name: 'Mercado Pago', desc: 'Pasarela de pago', icon: 'credit-card', color: '#22d3ee', connected: true, meta: 'CBU verificada · webhook activo' },
    { name: 'Modo / Banelco', desc: 'Pasarela de pago', icon: 'credit-card', color: '#22d3ee', connected: false, meta: 'No conectada' },
    { name: 'Salesforce CRM', desc: 'Sincronización bidireccional', icon: 'building-2', color: '#f59e0b', connected: false, meta: 'No conectada' },
    { name: 'HubSpot CRM', desc: 'Sincronización bidireccional', icon: 'building-2', color: '#f59e0b', connected: true, meta: 'Última sync hace 12m' },
  ];
  const [list, setList] = useState3(ints);
  return (
    <div className="grid grid-cols-3 gap-4">
      {list.map((it, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${it.color}25`, color: it.color }}><Icon name={it.icon} size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{it.name}</div>
              <div className="text-xs text-muted">{it.desc}</div>
            </div>
            <label className="cursor-pointer">
              <input type="checkbox" checked={it.connected} onChange={e => {
                setList(L => L.map((x, j) => j === i ? { ...x, connected: e.target.checked } : x));
                window.toast({ kind: e.target.checked ? 'success' : 'warning', title: `${it.name} ${e.target.checked ? 'conectado' : 'desconectado'}` });
              }} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-emerald-500 relative transition-colors">
                <div className={`absolute top-0.5 ${it.connected ? 'left-4' : 'left-0.5'} w-4 h-4 rounded-full bg-white transition-all`} />
              </div>
            </label>
          </div>
          <div className={`mt-3 text-[11px] flex items-center gap-1.5 ${it.connected ? 'text-emerald-400' : 'text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${it.connected ? 'bg-emerald-400 pulse-dot' : 'bg-white/30'}`} />
            {it.meta}
          </div>
          <div className="flex justify-end mt-3">
            <Btn size="sm" variant="ghost" icon="settings">Configurar</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BillingTab() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2 p-5">
        <div className="font-semibold mb-3">Plan actual</div>
        <div className="flex items-center gap-4 panel-muted border subtle-border rounded-lg p-4">
          <div className="w-12 h-12 rounded-xl bg-violet2-500/15 text-violet2-400 flex items-center justify-center"><Icon name="crown" size={24} /></div>
          <div className="flex-1">
            <div className="text-lg font-bold">Enterprise</div>
            <div className="text-xs text-muted">Hasta 25.000 conversaciones / mes · 50 operadores · SLA 99.9%</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold tabular">$ 1.890.000</div>
            <div className="text-[11px] text-muted">/ mes + IVA</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Metric label="Conversaciones (mes)" value="18.420 / 25.000" />
          <Metric label="Mensajes enviados" value="48.293" />
          <Metric label="Operadores activos" value="14 / 50" />
        </div>
        <div className="mt-4">
          <ProgressBar value={73.7} color="#a78bfa" />
          <div className="text-[11px] text-muted mt-1">73.7% de tu uso mensual</div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="font-semibold text-sm mb-3">Próximas facturas</div>
        {[
          { mes: 'Jun 2026', monto: '$ 1.890.000', estado: 'Estimada' },
          { mes: 'May 2026', monto: '$ 1.890.000', estado: 'Pagada' },
          { mes: 'Abr 2026', monto: '$ 1.890.000', estado: 'Pagada' },
          { mes: 'Mar 2026', monto: '$ 1.690.000', estado: 'Pagada' },
        ].map(f => (
          <div key={f.mes} className="flex items-center justify-between py-2 border-b subtle-border last:border-0 text-sm">
            <span>{f.mes}</span>
            <span className="tabular">{f.monto}</span>
            <Badge tone={f.estado === 'Pagada' ? 'success' : 'neutral'}>{f.estado}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AuditTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted">
          <th className="font-medium px-4 py-2.5">Hora</th>
          <th className="font-medium px-2 py-2.5">Usuario</th>
          <th className="font-medium px-2 py-2.5">Acción</th>
          <th className="font-medium px-2 py-2.5">Objetivo</th>
        </tr></thead>
        <tbody>
          {window.CobrData.AUDITORIA.map((a, i) => (
            <tr key={i} className="border-t subtle-border">
              <td className="px-4 py-2 text-muted">{a.hora}</td>
              <td className="px-2 py-2 font-mono text-xs">{a.usuario}</td>
              <td className="px-2 py-2">{a.accion}</td>
              <td className="px-2 py-2 text-muted">{a.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

Object.assign(window, { DebtorScreen, DashboardMgmt, SettingsScreen, DebtorsListScreen });

// ============ MGMT AI MODULE ============
const MGMT_PROMPTS = [
  { icon: 'trending-up', cat: 'Performance', label: '¿Cómo está rindiendo la cartera vs el mes pasado?' },
  { icon: 'trending-up', cat: 'Performance', label: '¿Qué cluster de deudores está pagando peor este trimestre?' },
  { icon: 'trending-up', cat: 'Performance', label: 'Mostrame los 3 problemas más urgentes que ve la IA hoy' },
  { icon: 'target', cat: 'Estrategia', label: '¿Qué estrategia conviene escalar y cuál pausar?' },
  { icon: 'target', cat: 'Estrategia', label: '¿En qué tramo de mora tengo el mayor recupero por minuto invertido?' },
  { icon: 'target', cat: 'Estrategia', label: 'Recomendame una reasignación de cartera entre operadores' },
  { icon: 'users-round', cat: 'Equipo', label: '¿Quiénes son mis 3 mejores operadores y por qué?' },
  { icon: 'users-round', cat: 'Equipo', label: '¿Hay operadores con baja conversión que necesiten coaching?' },
  { icon: 'users-round', cat: 'Equipo', label: '¿Cómo distribuyo la carga si entra una nueva tanda de 500 casos?' },
  { icon: 'trending-up', cat: 'Forecast', label: '¿Qué recupero proyectás para los próximos 90 días?' },
  { icon: 'trending-up', cat: 'Forecast', label: 'Si subo 10% el headcount, ¿cuánto recupero adicional consigo?' },
  { icon: 'alert-triangle', cat: 'Riesgo', label: '¿Qué % de mi cartera está en riesgo de pasar a incobrable?' },
  { icon: 'alert-triangle', cat: 'Riesgo', label: '¿Qué casos debería derivar a estudio jurídico esta semana?' },
  { icon: 'file-text', cat: 'Reportes', label: 'Armame el resumen ejecutivo para el comité del viernes' },
  { icon: 'file-text', cat: 'Reportes', label: 'Generá los 3 KPIs que más mejoraron y los 3 que empeoraron' },
];

const MGMT_AI_FALLBACKS = {
  'pasado|cartera vs': `La cartera viene mejor que el mes pasado, pero el avance no está parejo:\n\n- **Recupero del mes** subió 24% vs abril, impulsado por la estrategia "Mora temprana 1-30d" que está convirtiendo 42%.\n- **Ticket promedio bajó 3%**, señal de que estás cerrando más casos chicos. Eso es bueno para velocidad pero comprime el margen.\n- **DSO mejoró 4 días** — esto le importa al CFO más de lo que parece, porque libera capital de trabajo.\n- **Atención**: la tasa de incobrabilidad bajó 0.3pp pero el cluster "Esquivos crónicos" creció 12%. Si no lo atacás, en 60 días eso va a empujar la incobrabilidad para arriba.`,
  'cluster|peor': `Mirando los 5 clusters que detectó la IA, el que más se deterioró este trimestre fue **"Esquivos crónicos"** — 287 casos, $41.2M en juego, y el delta de respuesta cayó 3%. Son deudores con mora >120d, ubicabilidad baja y sin patrón claro de pago. Lo que está fallando: las plantillas estándar no les llegan, y los operadores les dedican tiempo desproporcionado para el resultado. **Sugerencia**: pasar el 70% a una estrategia de automatización masiva con horarios atípicos (sábados 12-14hs muestra mejor respuesta para este perfil), y reservar tu mejor operador para los top 30 por monto. El resto, a recordatorios programados sin intervención humana.`,
  'urgentes|problemas más': `Los 3 focos rojos del dashboard hoy:\n\n1. **9.8% de la cartera concentrada en Buenos Aires + CABA con mora >90d** ($142.6M). Un solo evento macro puede mover esta cifra fuerte; necesitás diversificar gestión por provincia.\n2. **Brecha entre operadores top y bottom es 3.4x** (Mariana cobra $14.2M, el operador #10 cobra $5.3M). O tenés un problema de asignación o un problema de coaching — los datos sugieren lo primero.\n3. **La estrategia "Recupero alto valor" convierte solo 19%** pero consume 28% del tiempo de operadores senior. Estás dejando recupero sobre la mesa en el tramo 30-90d, que convierte 42%.`,
  'escalar|pausar': `**Escalar**: la estrategia "Mora temprana 1-30d" convierte 42% con ticket promedio de $184k. Cada peso de inversión en escalarla rinde 1.6x más que las otras. Sugiero duplicar el volumen de mensajes en esta franja y mover 2 operadores junior de "Alto valor" a "Mora temprana".\n\n**Pausar/revisar**: "Reactivación silenciosos" — 11% de cobro, ticket bajo, mucho overhead operativo. Antes de pausarla, probá una variante con plantillas más cortas y horarios atípicos (sábados 12-14hs). Si en 21 días no levanta 5pp, pausala y derivá la cartera a un canal de automatización pura.\n\n**Mantener**: "Mora media — Plan a medida" y "Recupero alto valor" — son las más estables y cubren tramos críticos.`,
  'mejores operadores': `Tus 3 mejores este período:\n\n1. **Mariana Ríos** — $14.28M cobrado, 187 casos, 38.4% éxito, 2.4d tiempo medio. Score 92. Lo que la distingue: usa plantilla "Quita por pago contado" 3x más que el promedio y cierra el doble de casos en los primeros 5 mensajes.\n2. **Diego Pereyra** — $12.84M, 164 casos, 34.1%. Score 87. Especialista en negociación de planes — su tasa de cumplimiento de promesa es 84% vs 67% del equipo.\n3. **Lucía Fernández** — $11.50M, 152 casos, 31.6%. Score 84. Manejo excelente de casos difíciles (deudores de >180d). \n\n**Insight**: los 3 comparten un patrón — responden a mensajes entrantes en menos de 12 minutos. Operadores con respuesta >30 min cierran 40% menos. Considerá un SLA interno de respuesta.`,
  'distribuyo|carga|reasignaci': `Con 14 operadores activos y una nueva tanda de 500 casos, sugerencia de reparto basada en mix de perfiles:\n\n- **Top 3 (Mariana, Diego, Lucía)**: 60 casos cada uno de alto valor + voluntad alta. Total 180.\n- **Senior intermedios (Sebastián, Carolina, Federico)**: 50 casos mixtos cada uno. Total 150.\n- **Junior con buena rampa**: 25 casos cada uno solo de mora temprana — su zona de mejor rendimiento. Total 200 entre 8 operadores.\n- **Reservar**: 30 casos sin asignar para reasignación dinámica según primer contacto.\n\nNo le des casos de >120d a operadores junior — quema rampa y los desmoraliza.`,
  '90 días|proyectás|forecast': `El modelo de forecast proyecta:\n\n- **30 días**: $48.9M recuperado (banda 80-90% confianza: $44.5M — $53.3M).\n- **60 días**: $96.4M acumulado.\n- **90 días**: $141.8M acumulado.\n\nSupuestos clave: headcount estable, mix de estrategias actual, sin shocks macroeconómicos. **Sensibilidades**: si subís 10% el budget en plantillas Meta aprobadas, el modelo proyecta +$4.8M extras. Si bajás el SLA de respuesta a <15 minutos, +$3.2M. Si pasás un 10% del cluster "Esquivos" a judicial directo, +$1.9M pero con costo legal del 15%.`,
  'headcount|10%': `Subir 10% el headcount significa pasar de 14 a 15-16 operadores. El modelo proyecta:\n\n- **Recupero adicional**: +$9.4M a $11.2M por trimestre (asumiendo rendimiento del operador #8-10 del ranking).\n- **Payback**: ~2.3 meses considerando costo laboral pleno en Argentina ($1.8M/mes total cargado).\n- **Riesgo**: la rampa de un nuevo operador es 60 días en cobranzas; el ROI pleno aparece en mes 3.\n- **Alternativa más rápida**: en lugar de contratar, automatizar el 30% más bajo de la cartera (mora <30d y >$50k) liberaría 25% del tiempo de Mariana y Diego, equivalente a un operador adicional sin costo fijo nuevo.`,
  'incobrable|riesgo': `Del análisis de la cartera, el **4.8% está clasificado como incobrable** y otro **6.2% en zona de transición** (mora >150d, voluntad <30, sin respuesta en 45+ días). Total en riesgo: 11%, equivalente a $42M.\n\n**Acciones recomendadas**:\n- Pasar los 287 casos del cluster "Esquivos crónicos" a un último intento con plantilla "Aviso pre-judicial" en los próximos 14 días.\n- Los que no respondan: 60% al cluster jurídico (recupero esperado neto 18% post-honorarios), 40% baja contable.\n- El cluster "Sin capacidad de pago" (178 casos, $8.9M) ofrecele una refinanciación larga al 70% del valor original; si no aceptan, baja.`,
  'jurídico|judicial': `Esta semana, basado en el análisis de mora + voluntad + buró crediticio, son **23 casos** los que justifican derivación a estudio jurídico:\n\n- **8 casos top**: monto >$1M, mora >180d, sin respuesta 60+d. Total $14.8M, recupero esperado neto 32%.\n- **15 casos medianos**: monto $300k-$1M, mora >150d. Total $9.2M, recupero esperado neto 22%.\n\nVan en bloque al estudio Maldonado & Asociados que tiene la mejor tasa histórica. Costo estimado: $4.1M en honorarios. ROI esperado del bloque: 2.7x en 6-9 meses. \n\nIgnorá derivar a judicial casos con monto <$200k — los honorarios y el tiempo absorben todo el recupero.`,
  'comité|resumen ejecutivo|viernes': `**Resumen ejecutivo — Comité del viernes**\n\n- **Recuperado mes**: $48.7M (+24% vs abril). Récord trimestral.\n- **Recupero %**: 18.4% (+2.1pp). Tendencia sostenida a 4 meses.\n- **Casos cerrados**: 24 nuevos vs período anterior.\n- **DSO**: 47 días (-4d). Libera ~$6M de capital de trabajo.\n- **Win del mes**: estrategia "Mora temprana" superó target de 35% de cobro.\n- **Alerta**: cluster "Esquivos crónicos" +12% en volumen — requiere intervención.\n- **Pedido al comité**: aprobar presupuesto para 1 operador adicional o expandir automatización (ROI proyectado equivalente).`,
  'mejoraron|empeoraron': `**Top 3 KPIs que mejoraron este mes**:\n\n1. **Recuperado total**: +24% vs mes anterior. Driver: estrategia "Mora temprana" + 2 plantillas nuevas aprobadas.\n2. **DSO**: -4 días. Driver: mejor priorización del top 20% de cartera.\n3. **Tasa de respuesta**: +3pp. Driver: ajuste de horarios al heatmap.\n\n**Top 3 KPIs que empeoraron**:\n\n1. **Ticket promedio**: -3%. Estás cerrando más casos chicos. Neutralizable si subís foco en alto valor.\n2. **Tiempo medio en cluster "Esquivos"**: +18%. Operadores invierten más tiempo con peor resultado.\n3. **% de promesas cumplidas en tramo +90d**: -6pp. Necesita revisión de follow-up automático.`,
};

function mgmtAIAnswer(prompt) {
  const p = prompt.toLowerCase();
  for (const [k, v] of Object.entries(MGMT_AI_FALLBACKS)) {
    const keys = k.split('|');
    if (keys.some(kk => p.includes(kk))) return v;
  }
  return `Buena pregunta gerencial. Para responder con precisión necesito que me especifiques un poco más el ángulo — ¿estás pensando en performance del equipo, mix de cartera, forecast, riesgo, o ROI de alguna iniciativa puntual?\n\nMientras tanto, dato del dashboard que conviene tener a mano: el **42% del recupero del mes vino del cluster "Negociadores cooperativos"** (524 casos, $56.7M), que solo consume el 28% del tiempo del equipo. Es tu mejor relación rendimiento/esfuerzo y donde tiene sentido seguir invirtiendo si dudás.`;
}

function MgmtAIModule({ kpis, tenant, state }) {
  const [prompt, setPrompt] = useState3('');
  const [loading, setLoading] = useState3(false);
  const [answer, setAnswer] = useState3(null);
  const [history, setHistory] = useState3([]);
  const [activeCat, setActiveCat] = useState3('Todas');
  const [expanded, setExpanded] = useState3(false);
  const inputRef = useRef3 ? useRef3(null) : React.useRef(null);

  const categories = ['Todas', ...Array.from(new Set(MGMT_PROMPTS.map(f => f.cat)))];
  const filtered = activeCat === 'Todas' ? MGMT_PROMPTS : MGMT_PROMPTS.filter(f => f.cat === activeCat);

  const buildContext = () => {
    const carteraTotal = state.deudores.reduce((a, d) => a + d.monto, 0);
    const promesas = state.deudores.filter(d => d.estado === 'Promesa de pago').length;
    return `CONTEXTO (datos en vivo del dashboard de ${tenant.name}):\n- Cartera total: ${window.fmtMoneyShort(carteraTotal)}\n- Recuperado mes: 18.4% ($${(carteraTotal * 0.184 / 1_000_000).toFixed(1)}M)\n- Casos activos: ${state.deudores.length}\n- Promesas de pago: ${promesas}\n- DSO: 47 días\n- Tasa de incobrabilidad: 4.8%\n- Top operadora: Mariana Ríos ($14.28M cobrado)\n- Cluster crítico: "Esquivos crónicos" creció 12%`;
  };

  const send = async (text) => {
    const q = (text || prompt).trim();
    if (!q || loading) return;
    setPrompt('');
    setLoading(true);
    setExpanded(true);
    setAnswer({ q, a: null });
    let result;
    try {
      const sysPrompt = `Sos el asistente ejecutivo de IA de CobrAI, una plataforma de cobranzas multitenant. Le estás hablando a un gerente de cobranzas en Argentina que está mirando el dashboard gerencial. Respondé en español rioplatense, tono ejecutivo (datos, decisiones, trade-offs, no consejos vagos), en menos de 220 palabras, con bullets o números concretos cuando aplique. Mencioná drivers y riesgos. Cuando recomendes acciones, dale ROI estimado o impacto cuantitativo. No inventes cifras imposibles — usá las del contexto.\n\n${buildContext()}\n\nPregunta del gerente:\n${q}`;
      result = await Promise.race([
        window.claude.complete(sysPrompt),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 12000)),
      ]);
    } catch (e) {
      result = mgmtAIAnswer(q);
    }
    setAnswer({ q, a: result });
    setHistory(h => [{ q, a: result, ts: Date.now() }, ...h].slice(0, 8));
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden border-violet2-500/30" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(6,182,212,0.04) 60%, transparent)' }}>
      <div className="flex items-stretch">
        {/* Left: prompt + answer */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet2-500 to-brand-400 flex items-center justify-center shadow-glow">
              <Icon name="brain-circuit" size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">
                Análisis gerencial con IA
                <Badge tone="violet" className="!text-[9px]">contexto en vivo</Badge>
              </div>
              <div className="text-[11px] text-muted">Preguntá sobre performance, equipo, forecast, riesgo o reportes. La IA ve los datos actuales del workspace.</div>
            </div>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); setAnswer(null); setExpanded(false); }} className="text-[11px] text-muted hover:text-default inline-flex items-center gap-1">
                <Icon name="rotate-ccw" size={11} /> Reiniciar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 panel-muted border subtle-border rounded-lg pl-3 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-violet2-500/40 transition-all">
            <Icon name="sparkles" size={14} className="text-violet2-400 shrink-0" />
            <input
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ej: ¿qué estrategia debería escalar este trimestre?"
              className="flex-1 bg-transparent border-0 outline-0 text-sm placeholder:text-muted min-w-0"
              disabled={loading}
            />
            <kbd className="hidden md:inline font-mono text-[10px] panel border subtle-border rounded px-1.5 py-0.5 text-muted">↵</kbd>
            <Btn size="sm" icon={loading ? 'loader' : 'send'} onClick={() => send()} disabled={loading || !prompt.trim()} className="!bg-violet2-500 hover:!bg-violet2-400">
              {loading ? 'Analizando…' : 'Preguntar'}
            </Btn>
          </div>

          {/* Predefined prompts */}
          {!answer && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted mr-1">Prompts predefinidos</span>
                {categories.map(c => (
                  <button key={c} onClick={() => setActiveCat(c)} className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${activeCat === c ? 'bg-violet2-500/15 text-violet2-400' : 'text-muted hover:bg-white/5 hover:text-default'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filtered.slice(0, 9).map((f, i) => (
                  <button
                    key={i}
                    onClick={() => send(f.label)}
                    className="chip-anim inline-flex items-center gap-1.5 panel-muted border subtle-border rounded-full px-2.5 py-1 text-[11px] hover:bg-violet2-500/10 hover:border-violet2-500/40 hover:text-violet2-400 transition-all text-left"
                  >
                    <Icon name={f.icon} size={11} className="text-muted shrink-0" />
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Answer */}
          {answer && (
            <div className="mt-3 space-y-2 slide-in">
              <div className="flex items-start gap-2">
                <Avatar initials="HM" size={22} color="#8b5cf6" />
                <div className="flex-1 panel-muted border subtle-border rounded-lg rounded-tl-sm px-3 py-2 text-sm">{answer.q}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-violet2-500 to-brand-400 flex items-center justify-center shrink-0">
                  <Icon name="brain-circuit" size={11} className="text-white" />
                </div>
                <div className="flex-1 panel border border-violet2-500/20 rounded-lg rounded-tl-sm px-3 py-2.5 text-sm leading-relaxed">
                  {answer.a == null ? (
                    <div className="flex items-center gap-2 text-muted">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      <span className="text-xs ml-2">Analizando datos del workspace…</span>
                    </div>
                  ) : (
                    <AnswerBody text={answer.a} />
                  )}
                  {answer.a != null && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t subtle-border">
                      <div className="flex items-center gap-1 text-[10px] text-muted">
                        <Icon name="database" size={10} /> Análisis basado en {state.deudores.length} cuentas del workspace activo.
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBtn icon="copy" title="Copiar" size={12} onClick={() => { navigator.clipboard?.writeText(answer.a); window.toast({ kind: 'success', title: 'Copiado al portapapeles' }); }} />
                        <IconBtn icon="file-text" title="Agregar al reporte ejecutivo" size={12} onClick={() => window.toast({ kind: 'success', title: 'Agregado al reporte', message: 'Vas a poder exportarlo desde la sección Reportes.' })} />
                        <IconBtn icon="thumbs-up" title="Útil" size={12} onClick={() => window.toast({ kind: 'success', title: 'Anotado' })} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => { setAnswer(null); setExpanded(false); inputRef.current?.focus(); }} className="text-[11px] text-violet2-400 hover:underline inline-flex items-center gap-1">
                <Icon name="plus" size={11} /> Nueva pregunta
              </button>
            </div>
          )}
        </div>

        {/* Right: Insights pinned */}
        <div className="hidden xl:flex w-80 shrink-0 flex-col border-l subtle-border">
          <div className="p-3 border-b subtle-border">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-default">
              <Icon name="zap" size={12} className="text-amber-400" /> Insights destacados
            </div>
            <div className="text-[10px] text-muted mt-0.5">Detectados por la IA hoy</div>
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin max-h-[300px]">
            {[
              { tone: 'border-emerald-500/30 bg-emerald-500/5', icon: 'trending-up', iconColor: 'text-emerald-400', tag: 'OPORTUNIDAD', headline: 'Mora temprana convierte 1.6× mejor', txt: 'Considerar mover 2 operadores junior de "Alto valor" a este tramo. Impacto estimado: +$2.4M/mes.', q: '¿Qué estrategia conviene escalar y cuál pausar?' },
              { tone: 'border-coral-500/30 bg-coral-500/5', icon: 'alert-triangle', iconColor: 'text-coral-400', tag: 'RIESGO', headline: 'Cluster "Esquivos" creció 12%', txt: '287 casos, $41.2M, sin respuesta efectiva con plantillas actuales. Decisión recomendada: re-priorizar en 14 días.', q: '¿Qué cluster de deudores está pagando peor este trimestre?' },
              { tone: 'border-brand-500/30 bg-brand-500/5', icon: 'users-round', iconColor: 'text-brand-300', tag: 'EQUIPO', headline: 'Brecha 3.4× entre top y bottom', txt: 'Indicador de asignación, no de talento. Una reasignación inteligente podría liberar +$3.1M/mes.', q: 'Recomendame una reasignación de cartera entre operadores' },
              { tone: 'border-violet2-500/30 bg-violet2-500/5', icon: 'trending-up', iconColor: 'text-violet2-400', tag: 'FORECAST', headline: 'Recupero proyectado 90d: $141.8M', txt: 'Banda 80-90% confianza. Si subís headcount 10%, +$9.4M extra. Payback: 2.3 meses.', q: '¿Qué recupero proyectás para los próximos 90 días?' },
            ].map((s, i) => (
              <button key={i} onClick={() => send(s.q)} className={`w-full text-left p-2.5 rounded-lg border ${s.tone} transition-all hover:shadow-card group`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={s.icon} size={11} className={s.iconColor} />
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${s.iconColor}`}>{s.tag}</span>
                </div>
                <div className="text-[11px] font-semibold text-default leading-snug">{s.headline}</div>
                <div className="text-[10px] text-muted mt-1 leading-snug">{s.txt}</div>
                <div className="text-[9px] text-violet2-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  Profundizar con IA <Icon name="arrow-right" size={9} />
                </div>
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="border-t subtle-border p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted px-1 mb-1">Consultas recientes</div>
              <div className="space-y-0.5 max-h-24 overflow-y-auto scrollbar-thin">
                {history.map((h, i) => (
                  <button key={i} onClick={() => setAnswer({ q: h.q, a: h.a })} className="w-full text-left p-1.5 rounded hover:bg-white/5 text-[11px] text-muted hover:text-default truncate flex items-center gap-1.5">
                    <Icon name="history" size={10} className="shrink-0" />
                    <span className="truncate">{h.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============ LISTADO DE DEUDORES ============
function DebtorsListScreen({ goto }) {
  const state = window.CobrStore.get();
  const [search, setSearch] = useState3('');
  const [estadoFilter, setEstadoFilter] = useState3('todos');
  const [provFilter, setProvFilter] = useState3('todas');
  const [prioFilter, setPrioFilter] = useState3('todas');
  const [sortBy, setSortBy] = useState3('voluntad');
  const [sortDir, setSortDir] = useState3('desc');
  const [view, setView] = useState3('table'); // 'table' | 'cards'
  const [page, setPage] = useState3(1);
  const pageSize = 20;
  const tenant = window.CobrData.TENANTS.find(t => t.id === state.tenantId);

  const provincias = useMemo3(() => ['todas', ...Array.from(new Set(state.deudores.map(d => d.provincia))).sort()], [state.deudores]);

  const filtered = useMemo3(() => {
    let list = state.deudores;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.nombre.toLowerCase().includes(q) || d.dni.includes(q) || d.phone.includes(q));
    }
    if (estadoFilter !== 'todos') list = list.filter(d => d.estado === estadoFilter);
    if (provFilter !== 'todas') list = list.filter(d => d.provincia === provFilter);
    if (prioFilter !== 'todas') list = list.filter(d => d.prioridad === prioFilter);
    list = [...list].sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [state.deudores, search, estadoFilter, provFilter, prioFilter, sortBy, sortDir]);

  useEffect3(() => setPage(1), [search, estadoFilter, provFilter, prioFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Aggregates over filtered set
  const agg = useMemo3(() => ({
    total: filtered.length,
    monto: filtered.reduce((a, d) => a + d.monto, 0),
    promesas: filtered.filter(d => d.estado === 'Promesa de pago').length,
    enGestion: filtered.filter(d => d.estado === 'En gestión').length,
    altaVol: filtered.filter(d => d.voluntad >= 70).length,
    moraProm: filtered.length ? Math.round(filtered.reduce((a, d) => a + d.mora, 0) / filtered.length) : 0,
  }), [filtered]);

  const headerSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };
  const SortIcon = ({ col }) => sortBy === col
    ? <Icon name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} className="text-brand-300 ml-0.5 inline" />
    : <Icon name="chevrons-up-down" size={10} className="text-muted/50 ml-0.5 inline" />;

  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Deudores">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">{tenant.name} · Cartera completa</div>
          <h1 className="text-2xl font-bold tracking-tight">Deudores</h1>
          <div className="text-sm text-muted mt-0.5">{state.deudores.length} cuentas en gestión · clic en cualquier fila para abrir la ficha completa.</div>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" icon="download" onClick={() => window.toast({ kind: 'success', title: 'Exportando…', message: `${filtered.length} registros en CSV` })}>Exportar</Btn>
          <Btn icon="zap" onClick={() => goto('strategies')}>Aplicar estrategia a {filtered.length}</Btn>
        </div>
      </div>

      {/* Aggregate strip */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { k: 'Resultados', v: agg.total, fmt: window.fmtInt, icon: 'users', color: 'text-brand-300' },
          { k: 'Monto filtrado', v: agg.monto, fmt: window.fmtMoneyShort, icon: 'wallet', color: 'text-brand-300' },
          { k: 'Voluntad alta', v: agg.altaVol, fmt: window.fmtInt, icon: 'flame', color: 'text-emerald-400' },
          { k: 'En gestión', v: agg.enGestion, fmt: window.fmtInt, icon: 'message-circle-more', color: 'text-violet2-400' },
          { k: 'Promesas', v: agg.promesas, fmt: window.fmtInt, icon: 'handshake', color: 'text-amber-400' },
          { k: 'Mora promedio', v: agg.moraProm, fmt: v => Math.round(v) + 'd', icon: 'clock', color: 'text-coral-400' },
        ].map((k, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className={`w-6 h-6 rounded bg-white/5 flex items-center justify-center ${k.color}`}><Icon name={k.icon} size={12} /></div>
            </div>
            <div className="text-lg font-bold tabular leading-tight"><CountUp value={k.v} format={k.fmt} /></div>
            <div className="text-[10px] text-muted mt-0.5 truncate">{k.k}</div>
          </Card>
        ))}
      </div>

      {/* Filters bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono…"
              className="input pl-8 pr-2 py-2 rounded-md border text-sm w-full"
            />
          </div>
          <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="input px-2 py-2 rounded-md border text-xs">
            <option value="todos">Todos los estados</option>
            {window.CobrData.ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={provFilter} onChange={e => setProvFilter(e.target.value)} className="input px-2 py-2 rounded-md border text-xs">
            {provincias.map(p => <option key={p} value={p}>{p === 'todas' ? 'Todas las provincias' : p}</option>)}
          </select>
          <select value={prioFilter} onChange={e => setPrioFilter(e.target.value)} className="input px-2 py-2 rounded-md border text-xs">
            <option value="todas">Toda prioridad</option>
            <option value="Alta">Prioridad alta</option>
            <option value="Media">Prioridad media</option>
            <option value="Baja">Prioridad baja</option>
          </select>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-1 panel-muted border subtle-border rounded-md p-0.5">
            <button onClick={() => setView('table')} title="Tabla" className={`p-1.5 rounded transition-colors ${view === 'table' ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:text-default'}`}><Icon name="list" size={14} /></button>
            <button onClick={() => setView('cards')} title="Tarjetas" className={`p-1.5 rounded transition-colors ${view === 'cards' ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:text-default'}`}><Icon name="layout-grid" size={14} /></button>
          </div>
          {(search || estadoFilter !== 'todos' || provFilter !== 'todas' || prioFilter !== 'todas') && (
            <Btn variant="ghost" size="sm" icon="x" onClick={() => { setSearch(''); setEstadoFilter('todos'); setProvFilter('todas'); setPrioFilter('todas'); }}>Limpiar</Btn>
          )}
        </div>
      </Card>

      {/* Results */}
      {view === 'table' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted bg-white/[0.02]">
                  <th onClick={() => headerSort('nombre')} className="font-medium px-4 py-2.5 cursor-pointer select-none hover:text-default">Deudor <SortIcon col="nombre" /></th>
                  <th onClick={() => headerSort('monto')} className="font-medium px-2 py-2.5 text-right cursor-pointer select-none hover:text-default">Monto <SortIcon col="monto" /></th>
                  <th onClick={() => headerSort('mora')} className="font-medium px-2 py-2.5 text-right cursor-pointer select-none hover:text-default">Mora <SortIcon col="mora" /></th>
                  <th onClick={() => headerSort('voluntad')} className="font-medium px-2 py-2.5 cursor-pointer select-none hover:text-default">Voluntad <SortIcon col="voluntad" /></th>
                  <th onClick={() => headerSort('score')} className="font-medium px-2 py-2.5 text-right cursor-pointer select-none hover:text-default">Score <SortIcon col="score" /></th>
                  <th onClick={() => headerSort('provincia')} className="font-medium px-2 py-2.5 cursor-pointer select-none hover:text-default">Provincia <SortIcon col="provincia" /></th>
                  <th onClick={() => headerSort('estado')} className="font-medium px-2 py-2.5 cursor-pointer select-none hover:text-default">Estado <SortIcon col="estado" /></th>
                  <th className="font-medium px-2 py-2.5">Asignado</th>
                  <th onClick={() => headerSort('ultimoContactoHs')} className="font-medium px-2 py-2.5 cursor-pointer select-none hover:text-default">Últ. contacto <SortIcon col="ultimoContactoHs" /></th>
                  <th className="font-medium px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((d) => (
                  <tr key={d.id} className="border-t subtle-border hover:bg-white/[0.03] cursor-pointer transition-colors group" onClick={() => goto('debtor', { id: d.id })}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={d.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')} size={28} color={`hsl(${(d.nombre.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
                        <div className="min-w-0">
                          <div className="font-medium text-default truncate">{d.nombre}</div>
                          <div className="text-[11px] text-muted tabular">DNI {d.dni}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular">{window.fmtMoney(d.monto)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-muted">{d.mora}d</td>
                    <td className="px-2 py-2.5"><VolBadge voluntad={d.voluntad} /></td>
                    <td className={`px-2 py-2.5 text-right tabular font-medium ${d.score >= 700 ? 'text-emerald-400' : d.score >= 500 ? 'text-amber-400' : 'text-coral-400'}`}>{d.score}</td>
                    <td className="px-2 py-2.5 text-muted text-xs">{d.provincia}</td>
                    <td className="px-2 py-2.5"><EstadoBadge estado={d.estado} /></td>
                    <td className="px-2 py-2.5 text-xs">
                      {d.asignado === '—'
                        ? <span className="text-muted">—</span>
                        : <span className="inline-flex items-center gap-1.5"><Avatar initials={d.asignado.split(' ').map(n => n[0]).join('')} size={18} color="#525a6f" />{d.asignado}</span>}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted">hace {d.ultimoContactoHs < 60 ? d.ultimoContactoHs + 'm' : Math.floor(d.ultimoContactoHs / 24) + 'd'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn icon="message-square" title="Abrir conversación" onClick={(e) => { e.stopPropagation(); window.CobrStore.set({ route: 'inbox', activeConversationId: d.id, routeParams: { id: d.id } }); }} />
                        <IconBtn icon="arrow-right" title="Ver ficha" />
                      </div>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan="10"><EmptyState icon="user-round-search" title="Sin deudores que coincidan" hint="Probá ajustar o limpiar los filtros." action={<Btn size="sm" variant="secondary" onClick={() => { setSearch(''); setEstadoFilter('todos'); setProvFilter('todas'); setPrioFilter('todas'); }}>Limpiar filtros</Btn>} /></td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between p-3 border-t subtle-border text-xs">
              <span className="text-muted tabular">Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}</span>
              <div className="flex items-center gap-1">
                <IconBtn icon="chevrons-left" title="Primera" onClick={() => setPage(1)} />
                <IconBtn icon="chevron-left" title="Anterior" onClick={() => setPage(p => Math.max(1, p - 1))} />
                <span className="text-muted px-2 tabular">página <b className="text-default">{page}</b> de {totalPages}</span>
                <IconBtn icon="chevron-right" title="Siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                <IconBtn icon="chevrons-right" title="Última" onClick={() => setPage(totalPages)} />
              </div>
            </div>
          )}
        </Card>
      )}

      {view === 'cards' && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {pageRows.map(d => (
              <Card key={d.id} className="p-4 hover:border-brand-500/40 hover:shadow-glow transition-all cursor-pointer" onClick={() => goto('debtor', { id: d.id })}>
                <div className="flex items-start gap-2.5 mb-3">
                  <Avatar initials={d.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')} size={40} color={`hsl(${(d.nombre.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{d.nombre}</div>
                    <div className="text-[11px] text-muted tabular">DNI {d.dni}</div>
                  </div>
                  <EstadoBadge estado={d.estado} />
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <div className="rounded panel-muted border subtle-border px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-muted">Deuda</div>
                    <div className="text-sm font-semibold tabular">{window.fmtMoneyShort(d.monto)}</div>
                  </div>
                  <div className="rounded panel-muted border subtle-border px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-muted">Mora</div>
                    <div className="text-sm font-semibold tabular">{d.mora}d</div>
                  </div>
                  <div className="rounded panel-muted border subtle-border px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-muted">Voluntad</div>
                    <div className="text-sm font-semibold tabular">{d.voluntad}</div>
                  </div>
                  <div className="rounded panel-muted border subtle-border px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-muted">Score</div>
                    <div className={`text-sm font-semibold tabular ${d.score >= 700 ? 'text-emerald-400' : d.score >= 500 ? 'text-amber-400' : 'text-coral-400'}`}>{d.score}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1"><Icon name="map-pin" size={10} />{d.provincia}</span>
                  <span>hace {d.ultimoContactoHs < 60 ? d.ultimoContactoHs + 'm' : Math.floor(d.ultimoContactoHs / 24) + 'd'}</span>
                </div>
              </Card>
            ))}
          </div>
          {filtered.length > pageSize && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <IconBtn icon="chevron-left" title="Anterior" onClick={() => setPage(p => Math.max(1, p - 1))} />
              <span className="text-muted px-2 tabular">página <b className="text-default">{page}</b> de {totalPages}</span>
              <IconBtn icon="chevron-right" title="Siguiente" onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
