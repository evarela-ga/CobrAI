// Screens part 1: Login, Dashboard Operador, Carga de Cartera
const { useState: useState1, useEffect: useEffect1, useMemo: useMemo1, useRef: useRef1 } = React;

// ============ LOGIN + WORKSPACE ============
function LoginScreen({ onAuthed, onPickTenant }) {
  const [step, setStep] = useState1('login');
  const [email, setEmail] = useState1('mariana.rios@cobrai.app');
  const [pw, setPw] = useState1('••••••••');
  const submit = (e) => { e.preventDefault(); setStep('workspace'); };
  return (
    <div className="min-h-screen flex" data-screen-label="Login">
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm fade-in">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-violet2-500 flex items-center justify-center shadow-glow">
              <Icon name="message-square-text" size={20} className="text-white" />
            </div>
            <div className="text-xl font-bold tracking-tight">CobrAI</div>
          </div>
          {step === 'login' ? (
            <>
              <h1 className="text-2xl font-semibold mb-1">Iniciá sesión</h1>
              <p className="text-sm text-muted mb-6">Cobrás más, conversando mejor.</p>
              <form onSubmit={submit} className="space-y-3">
                <label className="block">
                  <span className="text-xs text-muted">Email corporativo</span>
                  <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="input mt-1 w-full px-3 py-2.5 rounded-md border text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Contraseña</span>
                  <input value={pw} onChange={e=>setPw(e.target.value)} type="password" className="input mt-1 w-full px-3 py-2.5 rounded-md border text-sm" />
                </label>
                <div className="flex items-center justify-between text-xs text-muted">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-brand-500" /> Recordarme</label>
                  <a className="text-brand-300 hover:underline cursor-pointer">¿Olvidaste tu contraseña?</a>
                </div>
                <Btn type="submit" className="w-full justify-center" size="lg">Entrar</Btn>
                <Btn variant="secondary" icon="key-round" className="w-full justify-center" size="lg" onClick={submit}>Single Sign-On (SAML)</Btn>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-1">Elegí tu workspace</h1>
              <p className="text-sm text-muted mb-6">Estás autenticada como <b className="text-default">{email}</b>. Tenés acceso a {window.CobrData.TENANTS.length} tenants.</p>
              <div className="space-y-2">
                {window.CobrData.TENANTS.map(t => (
                  <button key={t.id} onClick={() => onPickTenant(t.id)} className="w-full panel border rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors text-left">
                    <Avatar initials={t.initials} color={t.color} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted">{t.tag} · {window.fmtInt(t.stats.cuentas)} cuentas · {window.fmtMoneyShort(t.stats.cartera)} en cartera</div>
                    </div>
                    <Icon name="chevron-right" size={18} className="text-muted" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('login')} className="mt-4 text-xs text-muted hover:text-default inline-flex items-center gap-1">
                <Icon name="arrow-left" size={12} /> Volver
              </button>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(6,182,212,0.25), transparent 50%), radial-gradient(circle at 70% 80%, rgba(139,92,246,0.18), transparent 50%), #0a0d16' }} />
        <div className="relative m-auto max-w-md p-10">
          <div className="text-xs uppercase tracking-widest text-brand-300 mb-3">Caso de uso</div>
          <h2 className="text-3xl font-bold leading-tight mb-3">Cobrar tarde es caro.<br/>Cobrar bien es conversar mejor.</h2>
          <p className="text-sm text-muted">CobrAI orquesta agentes de IA sobre WhatsApp, supervisión humana, y datos de buró crediticio para recuperar tu cartera morosa con un trato decente y resultados medibles.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: '37%', v: 'recupero medio en mora 30-90d' },
              { k: '4.2x', v: 'productividad por operador' },
              { k: '< 90s', v: 'tiempo medio de respuesta' },
            ].map((s, i) => (
              <div key={i} className="panel-muted border rounded-lg p-3">
                <div className="text-xl font-bold tabular text-brand-300">{s.k}</div>
                <div className="text-[10px] text-muted leading-snug mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD OPERADOR ============
function DashboardOp({ goto, openConv }) {
  const state = window.CobrStore.get();
  const deudores = state.deudores;
  const tenant = window.CobrData.TENANTS.find(t => t.id === state.tenantId);

  const kpis = useMemo1(() => {
    const cartera = deudores.reduce((a, d) => a + d.monto, 0);
    const promesas = deudores.filter(d => d.estado === 'Promesa de pago').length;
    const cobradoHoy = deudores.filter(d => d.estado === 'Pago parcial' || d.estado === 'Cancelada').reduce((a,d) => a + d.monto * 0.4, 0);
    const gestionadoHoy = deudores.filter(d => d.ultimoContactoHs < 24).length;
    const tasaRespuesta = 64;
    const voluntadAvg = Math.round(deudores.reduce((a,d) => a + d.voluntad, 0) / deudores.length);
    return [
      { k: 'Cartera asignada', v: cartera, fmt: window.fmtMoneyShort, delta: '+12%', icon: 'wallet', color: 'text-brand-300' },
      { k: 'Gestionado hoy', v: gestionadoHoy, fmt: window.fmtInt, delta: '+8%', icon: 'message-circle-more', color: 'text-violet2-400' },
      { k: 'Cobrado hoy', v: cobradoHoy, fmt: window.fmtMoneyShort, delta: '+24%', icon: 'banknote', color: 'text-emerald-400' },
      { k: 'Tasa de respuesta', v: tasaRespuesta, fmt: v => Math.round(v) + '%', delta: '+3pp', icon: 'send', color: 'text-amber-400' },
      { k: 'Promesas de pago', v: promesas, fmt: window.fmtInt, delta: '+5', icon: 'handshake', color: 'text-emerald-400' },
      { k: 'Voluntad promedio', v: voluntadAvg, fmt: v => Math.round(v), delta: '+2', icon: 'gauge-circle', color: 'text-brand-300' },
    ];
  }, [deudores]);

  // Prioritarios: ranked by voluntad * (1/log(mora+2)) * monto-tier
  const prioritarios = useMemo1(() => {
    return [...deudores].sort((a, b) => (b.voluntad * Math.log(b.monto + 2)) - (a.voluntad * Math.log(a.monto + 2))).slice(0, 12);
  }, [deudores]);

  // Heatmap mock
  const heat = useMemo1(() => {
    const data = [];
    for (let d = 0; d < 7; d++) {
      const row = [];
      for (let h = 0; h < 24; h++) {
        let v = 1;
        if (h >= 9 && h <= 20) v = 4 + Math.round(Math.sin((h - 9) / 11 * Math.PI) * 8);
        if (h >= 12 && h <= 14) v += 4;
        if (h >= 18 && h <= 21) v += 6;
        if (d === 0 || d === 6) v = Math.max(1, v - 4);
        v += Math.round(((d * 17 + h * 7) % 5));
        row.push(v);
      }
      data.push(row);
    }
    return data;
  }, []);

  // Live feed simulation
  const [feed, setFeed] = useState1(state.liveFeed);
  useEffect1(() => {
    const phrases = [
      'Hola, recibí el link pero no me abre',
      'Si no me llaman más yo lo pago el viernes',
      'Necesito que me manden el detalle por favor',
      'Listo, ya transferí. Mando comprobante',
      '¿Puede ser en 6 cuotas?',
      'No tengo plata este mes, hablemos en julio',
    ];
    const names = ['Agustina Vega','Tomás Bianchi','Lautaro Méndez','Bruno Coronel','Belén Acosta','Pablo Sandoval','Camila Ortiz'];
    const id = setInterval(() => {
      const n = names[Math.floor(Math.random() * names.length)];
      const p = phrases[Math.floor(Math.random() * phrases.length)];
      setFeed(f => [{ name: n, preview: p, mins: 0 }, ...f.map(x => ({ ...x, mins: x.mins + 1 }))].slice(0, 10));
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Dashboard Operador">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">{tenant.name} · Operadora {state.user.name.split(' ')[0]}</div>
          <h1 className="text-2xl font-bold tracking-tight">Hola {state.user.name.split(' ')[0]} 👋</h1>
          <div className="text-sm text-muted mt-0.5">Tenés <b className="text-default">14 casos calientes</b> y <b className="text-default">3 promesas</b> con vencimiento hoy.</div>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" icon="calendar">Hoy · 15 May 2026</Btn>
          <Btn icon="plus" onClick={() => { goto('inbox'); }}>Abrir bandeja</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${k.color}`}><Icon name={k.icon} size={16} /></div>
              <Badge tone={k.delta.startsWith('+') ? 'success' : 'danger'}>{k.delta}</Badge>
            </div>
            <div className="text-2xl font-bold tracking-tight tabular">
              <CountUp value={k.v} format={k.fmt} />
            </div>
            <div className="text-[11px] text-muted mt-1 truncate">{k.k}</div>
            <Sparkline className="mt-3" data={[3,4,3,5,6,5,7,8,7,9]} color={k.color.includes('brand') ? '#22d3ee' : k.color.includes('violet') ? '#a78bfa' : k.color.includes('emerald') ? '#10b981' : '#f59e0b'} />
          </Card>
        ))}
      </div>

      {/* Row 2: Priorities + Live feed */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2">
          <div className="flex items-center justify-between p-4 pb-3 border-b subtle-border">
            <div>
              <div className="font-semibold">Casos prioritarios hoy</div>
              <div className="text-xs text-muted">Ranking IA por probabilidad de cobro</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
                <input placeholder="Buscar deudor…" className="input pl-7 pr-2 py-1.5 rounded-md border text-xs w-44" />
              </div>
              <IconBtn icon="sliders-horizontal" title="Filtros" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="font-medium px-4 py-2">Deudor</th>
                <th className="font-medium px-2 py-2 text-right">Monto</th>
                <th className="font-medium px-2 py-2 text-right">Mora</th>
                <th className="font-medium px-2 py-2">Voluntad</th>
                <th className="font-medium px-2 py-2">Último contacto</th>
                <th className="font-medium px-2 py-2">Estado</th>
                <th className="font-medium px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {prioritarios.map((d, i) => (
                <tr key={d.id} className="border-t subtle-border hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => openConv(d.id)}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={d.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')} size={28} color={i < 3 ? '#06b6d4' : '#525a6f'} />
                      <div>
                        <div className="font-medium text-default">{d.nombre}</div>
                        <div className="text-[11px] text-muted">DNI {d.dni}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular">{window.fmtMoney(d.monto)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-muted">{d.mora}d</td>
                  <td className="px-2 py-2.5"><VolBadge voluntad={d.voluntad} /></td>
                  <td className="px-2 py-2.5 text-[12px] text-muted">hace {d.ultimoContactoHs}h</td>
                  <td className="px-2 py-2.5"><EstadoBadge estado={d.estado} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <Btn size="sm" variant="secondary" icon="message-square">Abrir</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Live feed */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-3 border-b subtle-border">
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                </span>
                En vivo
              </div>
              <div className="text-xs text-muted">Conversaciones entrantes</div>
            </div>
            <Badge tone="success">{feed.filter(f => f.mins < 5).length} nuevas</Badge>
          </div>
          <div className="divide-y subtle-border max-h-[420px] overflow-y-auto scrollbar-thin">
            {feed.map((f, i) => (
              <button key={i} onClick={() => { const d = state.deudores.find(x => x.nombre === f.name); if (d) openConv(d.id); else goto('inbox'); }} className="w-full text-left p-3 hover:bg-white/[0.03] transition-colors slide-in">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={f.name.split(' ').map(n=>n[0]).slice(0,2).join('')} size={32} color={`hsl(${(f.name.charCodeAt(0) * 13) % 360}, 50%, 50%)`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm text-default truncate">{f.name}</div>
                      <div className="text-[10px] text-muted shrink-0">hace {f.mins}m</div>
                    </div>
                    <div className="text-xs text-muted truncate">{f.preview}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: heatmap + funnel */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Heatmap de respuesta</div>
              <div className="text-xs text-muted">Probabilidad de respuesta por día y hora (últimas 4 semanas)</div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted">
              <span>baja</span>
              <div className="flex gap-px">
                {[0.1,0.3,0.5,0.7,0.9].map((a,i) => <div key={i} className="w-4 h-3 rounded-sm" style={{ background: `rgba(34,211,238,${a})` }} />)}
              </div>
              <span>alta</span>
            </div>
          </div>
          <Heatmap data={heat} />
          <div className="mt-3 text-xs text-muted">Mejores ventanas: <b className="text-default">Mar-Jue 19-21hs</b>, <b className="text-default">sábado 12-14hs</b>. Ajustar timeline de estrategias para apuntar a esos slots.</div>
        </Card>
        <Card className="p-4">
          <div className="mb-4">
            <div className="font-semibold">Embudo de conversión</div>
            <div className="text-xs text-muted">Últimos 7 días — todas las estrategias</div>
          </div>
          <Funnel steps={[
            { label: 'Enviados', value: 4820, color: '#06b6d4' },
            { label: 'Entregados', value: 4612, color: '#22d3ee' },
            { label: 'Leídos', value: 3104, color: '#67e8f9' },
            { label: 'Respondidos', value: 1846, color: '#a78bfa' },
            { label: 'Con promesa', value: 612, color: '#8b5cf6' },
            { label: 'Pagados', value: 284, color: '#10b981' },
          ]} />
        </Card>
      </div>
    </div>
  );
}

// ============ CARGA DE CARTERA ============
function PortfolioScreen({ goto }) {
  const [tab, setTab] = useState1('upload');
  return (
    <div className="p-6 space-y-5 fade-in" data-screen-label="Carga de Cartera">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carga de cartera</h1>
        <div className="text-sm text-muted">Importá deudores por archivo o conectá tu sistema vía API.</div>
      </div>
      <Tabs tabs={[
        { id: 'upload', label: 'Subir archivo', icon: 'upload-cloud' },
        { id: 'api', label: 'Conectar API', icon: 'plug' },
        { id: 'history', label: 'Histórico de cargas', icon: 'history', count: 7 },
      ]} active={tab} onChange={setTab} />
      {tab === 'upload' && <UploadFlow />}
      {tab === 'api' && <ApiWizard />}
      {tab === 'history' && <UploadHistory />}
    </div>
  );
}

function UploadFlow() {
  const [file, setFile] = useState1(null);
  const [progress, setProgress] = useState1(0);
  const [imported, setImported] = useState1(false);

  const SAMPLE = useMemo1(() => {
    const out = [];
    for (let i = 0; i < 50; i++) {
      out.push({
        dni: 20_000_000 + i * 313_117,
        nombre: window.CobrData.NOMBRES[i % window.CobrData.NOMBRES.length],
        monto: Math.round((20000 + (i * 73 % 90) * 10000) * 100) / 100,
        vencimiento: `${(i % 28) + 1}/${(i % 12) + 1}/2025`,
        telefono: `+54 9 11 ${String(1000 + i*7)}-${String(2000 + i*11)}`,
        error: i === 22 ? 'dni' : (i === 38 ? 'telefono' : null),
      });
    }
    return out;
  }, []);

  const MAP = ['dni','nombre','monto','vencimiento','telefono'];
  const FIELDS = [
    { id: 'dni', label: 'DNI', sys: 'documento.dni' },
    { id: 'nombre', label: 'Nombre y apellido', sys: 'persona.nombre' },
    { id: 'monto', label: 'Monto adeudado', sys: 'deuda.monto' },
    { id: 'vencimiento', label: 'Fecha de vencimiento', sys: 'deuda.vencimiento' },
    { id: 'telefono', label: 'Teléfono', sys: 'persona.telefono' },
  ];
  const errors = SAMPLE.filter(r => r.error);

  const startImport = () => {
    setProgress(1);
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 14;
        if (next >= 100) {
          clearInterval(t);
          setImported(true);
          window.toast({ kind: 'success', title: '482 deudores importados', message: `${errors.length} filas con errores se enviaron a la cola de revisión.` });
          return 100;
        }
        return next;
      });
    }, 200);
  };

  return (
    <div className="space-y-5">
      {!file && <FileDrop onDrop={(f) => setFile(f)} />}
      {file && !imported && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/15 text-brand-300 flex items-center justify-center"><Icon name="file-spreadsheet" size={20} /></div>
              <div className="flex-1">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-muted">{file.size} · {file.rows} filas detectadas · {errors.length} errores</div>
              </div>
              <Btn variant="ghost" icon="x" onClick={() => setFile(null)}>Quitar</Btn>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Mapeo de columnas</div>
                <div className="text-xs text-muted">Asociá cada columna del archivo con el campo del sistema</div>
              </div>
              <Badge tone="brand">Detección automática: 5 de 5</Badge>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {FIELDS.map((f, i) => (
                <div key={f.id}>
                  <div className="text-[11px] uppercase tracking-wide text-muted mb-1">Columna {i+1}</div>
                  <div className="text-xs font-mono text-default mb-2">{['dni','full_name','amount_due','due_date','phone'][i]}</div>
                  <select className="input w-full px-2 py-1.5 rounded-md border text-xs" defaultValue={f.id}>
                    {FIELDS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    <option value="__ignore">— Ignorar columna —</option>
                  </select>
                  <div className="text-[10px] text-muted mt-1 font-mono">→ {f.sys}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-4 pb-3 border-b subtle-border">
              <div>
                <div className="font-semibold">Vista previa (50 de {file.rows})</div>
                <div className="text-xs text-muted">Las filas en rojo no se importarán hasta corregir el error.</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="danger">{errors.length} errores</Badge>
                <Badge tone="success">{SAMPLE.length - errors.length} válidas</Badge>
              </div>
            </div>
            <div className="max-h-72 overflow-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="sticky top-0 panel z-10">
                  <tr className="text-left text-muted uppercase tracking-wider text-[10px]">
                    <th className="px-3 py-2 font-medium">#</th>
                    {MAP.map(m => <th key={m} className="px-3 py-2 font-medium">{m}</th>)}
                    <th className="px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE.map((r, i) => (
                    <tr key={i} className={`border-t subtle-border ${r.error ? 'bg-coral-500/[0.06]' : ''}`}>
                      <td className="px-3 py-1.5 text-muted tabular">{i+1}</td>
                      <td className={`px-3 py-1.5 tabular ${r.error === 'dni' ? 'text-coral-400 font-medium' : ''}`}>{r.error === 'dni' ? '999X-INV' : r.dni}</td>
                      <td className="px-3 py-1.5">{r.nombre}</td>
                      <td className="px-3 py-1.5 tabular">{window.fmtMoney(r.monto)}</td>
                      <td className="px-3 py-1.5 tabular text-muted">{r.vencimiento}</td>
                      <td className={`px-3 py-1.5 tabular ${r.error === 'telefono' ? 'text-coral-400 font-medium' : ''}`}>{r.error === 'telefono' ? '—' : r.telefono}</td>
                      <td className="px-3 py-1.5">
                        {r.error
                          ? <span className="text-coral-400 inline-flex items-center gap-1"><Icon name="alert-circle" size={12}/> {r.error === 'dni' ? 'DNI inválido' : 'Teléfono faltante'}</span>
                          : <span className="text-emerald-400 inline-flex items-center gap-1"><Icon name="check" size={12}/> OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {progress > 0 ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2 text-sm"><span>Importando registros…</span><span className="tabular text-muted">{Math.round(progress)}%</span></div>
              <ProgressBar value={progress} />
              <div className="text-xs text-muted mt-2">Validando DNIs, normalizando montos y consultando buró crediticio para enriquecer perfiles.</div>
            </Card>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Btn variant="secondary" icon="download">Descargar errores (CSV)</Btn>
              <Btn icon="check" onClick={startImport}>Importar 480 deudores válidos</Btn>
            </div>
          )}
        </>
      )}
      {imported && (
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3"><Icon name="check-circle-2" size={26} /></div>
          <div className="font-semibold text-lg">Importación completa</div>
          <div className="text-sm text-muted mt-1">480 deudores nuevos. 2 con errores enviados a revisión. Buró crediticio enriqueció 478 perfiles.</div>
          <div className="flex justify-center gap-2 mt-4">
            <Btn variant="secondary" onClick={() => { setFile(null); setProgress(0); setImported(false); }}>Subir otro archivo</Btn>
            <Btn icon="arrow-right">Ver cartera importada</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

function ApiWizard() {
  const [step, setStep] = useState1(0);
  const [tested, setTested] = useState1(null);
  const steps = ['Endpoint', 'Autenticación', 'Mapeo', 'Frecuencia'];
  const test = () => { setTested('loading'); setTimeout(() => setTested('ok'), 2000); };
  return (
    <div className="grid grid-cols-3 gap-5">
      <Card className="col-span-2 p-5">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i <= step ? 'bg-brand-500 text-white' : 'bg-white/5 text-muted'}`}>{i+1}</div>
              <div className={`ml-2 text-sm ${i === step ? 'text-default font-medium' : 'text-muted'}`}>{s}</div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-brand-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {step === 0 && (
            <>
              <label className="block">
                <span className="text-xs text-muted">URL del endpoint</span>
                <input defaultValue="https://api.bancodelsur.com.ar/v2/morosos" className="input mt-1 w-full px-3 py-2 rounded-md border text-sm font-mono" />
              </label>
              <label className="block">
                <span className="text-xs text-muted">Método</span>
                <select defaultValue="GET" className="input mt-1 w-full px-3 py-2 rounded-md border text-sm">
                  <option>GET</option><option>POST</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Formato de respuesta</span>
                <select className="input mt-1 w-full px-3 py-2 rounded-md border text-sm"><option>JSON</option><option>XML</option><option>CSV</option></select>
              </label>
            </>
          )}
          {step === 1 && (
            <>
              <label className="block">
                <span className="text-xs text-muted">Tipo de autenticación</span>
                <select defaultValue="Bearer" className="input mt-1 w-full px-3 py-2 rounded-md border text-sm"><option>Bearer Token</option><option>API Key (header)</option><option>OAuth 2.0</option><option>Basic Auth</option></select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">Token / API Key</span>
                <input type="password" defaultValue="sk-live-bds-9X2KqLp83•••" className="input mt-1 w-full px-3 py-2 rounded-md border text-sm font-mono" />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-xs text-muted">Mapeá los campos que devuelve tu API a los del sistema CobrAI:</div>
              <div className="grid grid-cols-2 gap-2">
                {[['customer_id','documento.dni'],['name','persona.nombre'],['outstanding','deuda.monto'],['due_at','deuda.vencimiento'],['mobile','persona.telefono'],['risk_score','externos.score']].map(([from, to], i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <code className="flex-1 px-2 py-1.5 rounded panel-muted border subtle-border font-mono">{from}</code>
                    <Icon name="arrow-right" size={12} className="text-muted" />
                    <code className="flex-1 px-2 py-1.5 rounded panel-muted border subtle-border font-mono text-brand-300">{to}</code>
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <label className="block">
                <span className="text-xs text-muted">Frecuencia de sincronización</span>
                <select defaultValue="6h" className="input mt-1 w-full px-3 py-2 rounded-md border text-sm">
                  <option value="15m">Cada 15 minutos</option>
                  <option value="1h">Cada hora</option>
                  <option value="6h">Cada 6 horas</option>
                  <option value="24h">Diaria — 03:00 hs</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="accent-brand-500" />
                Enriquecer automáticamente con scoring de buró crediticio
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="accent-brand-500" />
                Notificar al supervisor si fallan más del 5% de los registros
              </label>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Atrás</Btn>
          <div className="flex items-center gap-2">
            {step === 0 && (
              <Btn variant="secondary" onClick={test} icon={tested === 'loading' ? 'loader' : tested === 'ok' ? 'check' : 'play'}>
                {tested === 'loading' ? 'Probando…' : tested === 'ok' ? '✓ Conexión OK · 482 registros' : 'Probar conexión'}
              </Btn>
            )}
            {step < 3 ? <Btn onClick={() => setStep(s => s + 1)}>Siguiente →</Btn>
              : <Btn icon="check" onClick={() => window.toast({ kind: 'success', title: 'Integración activada', message: 'Primera sincronización iniciada' })}>Activar integración</Btn>}
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="font-semibold mb-3 text-sm">Log de sincronizaciones</div>
        <div className="space-y-2 text-xs">
          {[
            { hora: 'Hoy 14:32', estado: 'ok', txt: '482 registros sincronizados · 12 nuevos · 3 errores' },
            { hora: 'Hoy 08:32', estado: 'ok', txt: '479 registros sincronizados · 8 nuevos' },
            { hora: 'Ayer 20:32', estado: 'warn', txt: 'Reintento exitoso luego de 502 inicial' },
            { hora: 'Ayer 14:32', estado: 'ok', txt: '471 registros sincronizados' },
            { hora: 'Ayer 08:32', estado: 'err', txt: 'Timeout — endpoint no respondió' },
          ].map((l, i) => (
            <div key={i} className="flex items-start gap-2 panel-muted border subtle-border rounded-md p-2">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${l.estado === 'ok' ? 'bg-emerald-400' : l.estado === 'warn' ? 'bg-amber-400' : 'bg-coral-400'}`} />
              <div className="flex-1">
                <div className="text-default">{l.hora}</div>
                <div className="text-muted">{l.txt}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UploadHistory() {
  const rows = [
    { fecha: '15/05/2026 14:32', archivo: 'cartera_mayo_2026.csv', registros: 482, errores: 2, estado: 'Completo', tipo: 'archivo' },
    { fecha: '08/05/2026 09:14', archivo: 'API: api.bancodelsur.com.ar/v2/morosos', registros: 471, errores: 0, estado: 'Completo', tipo: 'api' },
    { fecha: '01/05/2026 11:02', archivo: 'cartera_abril_2026.xlsx', registros: 458, errores: 17, estado: 'Parcial', tipo: 'archivo' },
    { fecha: '24/04/2026 16:48', archivo: 'API: api.bancodelsur.com.ar/v2/morosos', registros: 462, errores: 0, estado: 'Completo', tipo: 'api' },
    { fecha: '17/04/2026 10:21', archivo: 'cartera_abril_q2.csv', registros: 312, errores: 0, estado: 'Completo', tipo: 'archivo' },
    { fecha: '10/04/2026 08:00', archivo: 'cartera_abril_q1.csv', registros: 287, errores: 4, estado: 'Completo', tipo: 'archivo' },
    { fecha: '03/04/2026 18:30', archivo: 'API: api.bancodelsur.com.ar/v2/morosos', registros: 451, errores: 0, estado: 'Completo', tipo: 'api' },
  ];
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted">
          <th className="font-medium px-4 py-2.5">Fecha</th>
          <th className="font-medium px-2 py-2.5">Fuente</th>
          <th className="font-medium px-2 py-2.5 text-right">Registros</th>
          <th className="font-medium px-2 py-2.5 text-right">Errores</th>
          <th className="font-medium px-2 py-2.5">Estado</th>
          <th className="font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t subtle-border hover:bg-white/[0.02]">
              <td className="px-4 py-2.5 tabular text-muted">{r.fecha}</td>
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-2"><Icon name={r.tipo === 'api' ? 'plug' : 'file-spreadsheet'} size={14} className="text-muted" />{r.archivo}</div>
              </td>
              <td className="px-2 py-2.5 text-right tabular">{r.registros}</td>
              <td className={`px-2 py-2.5 text-right tabular ${r.errores ? 'text-coral-400' : 'text-muted'}`}>{r.errores}</td>
              <td className="px-2 py-2.5"><Badge tone={r.estado === 'Completo' ? 'success' : 'warning'}>{r.estado}</Badge></td>
              <td className="px-4 py-2.5 text-right"><Btn size="sm" variant="ghost" icon="external-link">Ver detalle</Btn></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

Object.assign(window, { LoginScreen, DashboardOp, PortfolioScreen });
