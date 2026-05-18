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

      {/* AI Prompt — Asistente del operador */}
      <OperatorAIPrompt />

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

// ============ OPERATOR AI PROMPT ============
const OPERATOR_FAQS = [
  { icon: 'message-square-quote', label: '¿Cómo respondo a alguien que dice "no tengo plata"?', cat: 'Objeciones' },
  { icon: 'message-square-quote', label: '¿Qué digo si me piden quita mayor al 30%?', cat: 'Objeciones' },
  { icon: 'message-square-quote', label: '¿Cómo manejo a un deudor agresivo o insultante?', cat: 'Objeciones' },
  { icon: 'message-square-quote', label: '¿Qué hacer cuando dicen "no soy yo, debe ser un error"?', cat: 'Objeciones' },
  { icon: 'handshake', label: 'Armame un plan de cuotas para el caso prioritario #1', cat: 'Negociación' },
  { icon: 'handshake', label: '¿Cuándo conviene ofrecer quita por pago contado?', cat: 'Negociación' },
  { icon: 'handshake', label: '¿Hasta qué porcentaje de quita puedo autorizar sin supervisor?', cat: 'Negociación' },
  { icon: 'scale', label: '¿Qué dice la Ley de Defensa del Consumidor sobre el horario de contacto?', cat: 'Legal' },
  { icon: 'scale', label: '¿Cuándo paso un caso a etapa pre-judicial?', cat: 'Legal' },
  { icon: 'scale', label: '¿Qué información NO puedo pedirle a un deudor por WhatsApp?', cat: 'Legal' },
  { icon: 'target', label: '¿A qué casos debería priorizar ahora mismo?', cat: 'Estrategia' },
  { icon: 'target', label: '¿Qué horario es mejor para mandar el segundo recordatorio?', cat: 'Estrategia' },
  { icon: 'target', label: 'Sugerime una plantilla para reactivar silenciosos de +90d', cat: 'Estrategia' },
  { icon: 'sparkles', label: 'Resumime mi día: pendientes, alertas, próximos pasos', cat: 'Productividad' },
  { icon: 'sparkles', label: '¿Qué cambios de estado hice esta semana?', cat: 'Productividad' },
];

const OPERATOR_AI_FALLBACKS = {
  'no tengo plata': `Esta es una de las objeciones más frecuentes. Tres caminos que funcionan bien:\n\n1. **Validar primero** ("entiendo, este mes está difícil para todos"). Sin esto, todo lo que digas suena a presión.\n2. **Explorar la situación real** — preguntar cuándo cobra, si tiene ingresos parciales, si puede algo simbólico ahora. La mayoría puede algo, solo no todo.\n3. **Proponer 2 caminos concretos**: pago parcial inmediato + saldo a 30d, o plan en 3-4 cuotas arrancando en su fecha de cobro.\n\nEvitá: amenazas, "vas a entrar a BCRA", y seguir insistiendo con el monto total. El objetivo de esa conversación es conseguir un compromiso pequeño, no cobrar todo.`,
  'quita': `Como referencia general en cobranzas argentinas: quitas de 10-15% son habituales para cierre rápido (pago en 48-72h), 20-25% para casos con mora >90d, y 30%+ requiere autorización de supervisor. Antes de ofrecer cualquier quita, asegurate de que es la última jugada: si la ofrecés temprano, perdés margen para escalar después. Siempre condicioná la quita a un pago contado y con fecha concreta — "si pagás hoy, te hago X%". Una quita ofrecida "abierta" termina siendo una expectativa permanente.`,
  'agresivo': `Tres reglas para deudores hostiles:\n\n1. **Nunca respondas en el mismo tono.** Lo único que buscan es que vos pierdas la compostura para terminar la conversación.\n2. **Bajá la temperatura por escrito**: "entiendo tu malestar, mi intención es ayudarte a resolver esto, no generarte más problemas".\n3. **Tres opciones**: si insulta, dejá registro y derivá a supervisor; si solo está enojado pero negocia, seguí; si la conversación no avanza después de 2 mensajes, cerrá amablemente y pasá a recordatorio automatizado en 7 días.\n\nGuardá siempre los mensajes ofensivos — son evidencia ante reclamos en Defensa del Consumidor.`,
  'horario': `En Argentina, las **mejores ventanas de respuesta** según el heatmap del dashboard son martes-jueves 19-21hs y sábados 12-14hs. La Ley 25.326 y disposiciones de Defensa del Consumidor no fijan horarios exactos para WhatsApp pero la jurisprudencia tomó como aceptable de **8 a 21hs días hábiles y 9 a 20hs los sábados**. Domingos y feriados, mejor evitar. Fuera de esos horarios, podés programar el mensaje desde la plantilla — el agente lo dispara automáticamente en la mejor ventana.`,
  'plan': `Para un plan de cuotas estándar te recomiendo seguir esta estructura: primera cuota dentro de los 5-7 días (compromiso inmediato), cuotas mensuales en su fecha habitual de cobro (no genérica), sin interés si la mora es < 60d, con interés del 2-3% mensual si es mayor. **3-4 cuotas es el sweet spot** — más corto y rechazan, más largo y la tasa de incumplimiento sube fuerte. Importante: documentá el plan por escrito en el chat, mandale el detalle completo (cuotas, montos, fechas, link), y registrá la promesa de pago en la ficha del deudor para que el sistema haga el seguimiento automático.`,
  'priorizar': `Mirá el dashboard ahora mismo: la tabla "Casos prioritarios hoy" ya está rankeada por probabilidad de cobro. Mi consejo es atacar primero los casos con **voluntad ≥70 y mora 30-90d** — son los que te dan mejor recupero por minuto invertido. Después, los que tienen promesa de pago vencida hoy o mañana (3 casos). Por último, los de alto monto con voluntad media — esos son negociaciones largas pero el ticket justifica el tiempo. **Evitá hoy**: silenciosos con +120d sin respuesta. Esos van mejor con automatización masiva, no con tu tiempo.`,
};

function localAIAnswer(prompt) {
  const p = prompt.toLowerCase();
  for (const [k, v] of Object.entries(OPERATOR_AI_FALLBACKS)) {
    if (p.includes(k)) return v;
  }
  return `Buena pregunta. Sin acceso al modelo en este momento te dejo el marco general: en cobranzas por WhatsApp, lo que mejor funciona es **escuchar primero, proponer después**. Para casi cualquier situación con un deudor, la secuencia es: validar emocionalmente → preguntar para entender → proponer 2 caminos concretos → cerrar con un compromiso pequeño y con fecha.\n\nProbá ser más específica con tu consulta — por ejemplo, contame qué dijo el deudor, qué mora tiene, y qué intentaste hasta ahora. Con eso te puedo dar una respuesta accionable.`;
}

function OperatorAIPrompt() {
  const [prompt, setPrompt] = useState1('');
  const [loading, setLoading] = useState1(false);
  const [answer, setAnswer] = useState1(null);
  const [history, setHistory] = useState1([]);
  const [activeCat, setActiveCat] = useState1('Todas');
  const inputRef = useRef1(null);

  const categories = ['Todas', ...Array.from(new Set(OPERATOR_FAQS.map(f => f.cat)))];
  const filtered = activeCat === 'Todas' ? OPERATOR_FAQS : OPERATOR_FAQS.filter(f => f.cat === activeCat);

  const send = async (text) => {
    const q = (text || prompt).trim();
    if (!q || loading) return;
    setPrompt('');
    setLoading(true);
    setAnswer({ q, a: null });
    let result;
    try {
      const sysPrompt = `Sos el asistente de IA de CobrAI, una plataforma de cobranzas por WhatsApp en Argentina. Le hablás a una operadora humana llamada Mariana que está gestionando una cartera morosa. Respondé en español rioplatense, tono profesional pero cercano, en menos de 180 palabras, con bullets o pasos numerados cuando aplique. Cuando la pregunta sea sobre objeciones, dale frases concretas que pueda copiar y mandar. Si menciona temas legales argentinos, sé prudente y aclará que conviene confirmar con el equipo legal del tenant. Pregunta de la operadora:\n\n${q}`;
      result = await Promise.race([
        window.claude.complete(sysPrompt),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 12000)),
      ]);
    } catch (e) {
      result = localAIAnswer(q);
    }
    setAnswer({ q, a: result });
    setHistory(h => [{ q, a: result, ts: Date.now() }, ...h].slice(0, 5));
    setLoading(false);
  };

  return (
    <Card className="p-0 overflow-hidden border-brand-500/30" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.04) 60%, transparent)' }}>
      <div className="flex items-stretch">
        {/* Left: prompt area */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-violet2-500 flex items-center justify-center shadow-glow">
              <Icon name="sparkles" size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">
                Asistente CobrAI
                <Badge tone="brand" className="!text-[9px]">beta</Badge>
              </div>
              <div className="text-[11px] text-muted">Preguntale lo que necesites: objeciones, plantillas, normativa, estrategia.</div>
            </div>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); setAnswer(null); }} className="text-[11px] text-muted hover:text-default inline-flex items-center gap-1">
                <Icon name="rotate-ccw" size={11} /> Reiniciar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 panel-muted border subtle-border rounded-lg pl-3 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-brand-500/40 transition-all">
            <Icon name="message-square-text" size={14} className="text-brand-300 shrink-0" />
            <input
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ej: ¿cómo negociar con un deudor que dice que no tiene plata?"
              className="flex-1 bg-transparent border-0 outline-0 text-sm placeholder:text-muted min-w-0"
              disabled={loading}
            />
            <kbd className="hidden md:inline font-mono text-[10px] panel border subtle-border rounded px-1.5 py-0.5 text-muted">↵</kbd>
            <Btn size="sm" icon={loading ? 'loader' : 'send'} onClick={() => send()} disabled={loading || !prompt.trim()}>
              {loading ? 'Pensando…' : 'Preguntar'}
            </Btn>
          </div>

          {/* FAQ chips */}
          {!answer && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted mr-1">Preguntas frecuentes</span>
                {categories.map(c => (
                  <button key={c} onClick={() => setActiveCat(c)} className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${activeCat === c ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:bg-white/5 hover:text-default'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filtered.slice(0, 8).map((f, i) => (
                  <button
                    key={i}
                    onClick={() => send(f.label)}
                    className="chip-anim inline-flex items-center gap-1.5 panel-muted border subtle-border rounded-full px-2.5 py-1 text-[11px] hover:bg-brand-500/10 hover:border-brand-500/40 hover:text-brand-300 transition-all text-left"
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
                <Avatar initials="MR" size={22} color="#06b6d4" />
                <div className="flex-1 panel-muted border subtle-border rounded-lg rounded-tl-sm px-3 py-2 text-sm">{answer.q}</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-brand-400 to-violet2-500 flex items-center justify-center shrink-0">
                  <Icon name="sparkles" size={11} className="text-white" />
                </div>
                <div className="flex-1 panel border border-brand-500/20 rounded-lg rounded-tl-sm px-3 py-2.5 text-sm leading-relaxed">
                  {answer.a == null ? (
                    <div className="flex items-center gap-2 text-muted">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      <span className="text-xs ml-2">El asistente está pensando…</span>
                    </div>
                  ) : (
                    <AnswerBody text={answer.a} />
                  )}
                  {answer.a != null && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t subtle-border">
                      <div className="flex items-center gap-1 text-[10px] text-muted">
                        <Icon name="info" size={10} /> Las recomendaciones son sugerencias; usá tu criterio profesional.
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBtn icon="copy" title="Copiar" size={12} onClick={() => { navigator.clipboard?.writeText(answer.a); window.toast({ kind: 'success', title: 'Copiado al portapapeles' }); }} />
                        <IconBtn icon="thumbs-up" title="Útil" size={12} onClick={() => window.toast({ kind: 'success', title: '¡Gracias por el feedback!' })} />
                        <IconBtn icon="thumbs-down" title="Mejorable" size={12} onClick={() => window.toast({ kind: 'info', title: 'Anotado, vamos a mejorar' })} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => { setAnswer(null); inputRef.current?.focus(); }} className="text-[11px] text-brand-300 hover:underline inline-flex items-center gap-1">
                <Icon name="plus" size={11} /> Nueva pregunta
              </button>
            </div>
          )}
        </div>

        {/* Right: suggestions */}
        <div className="hidden xl:flex w-72 shrink-0 flex-col border-l subtle-border panel-muted/50">
          <div className="p-3 border-b subtle-border">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-default">
              <Icon name="zap" size={12} className="text-amber-400" /> Sugerencias para vos
            </div>
            <div className="text-[10px] text-muted mt-0.5">Basadas en tu actividad</div>
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin max-h-[260px]">
            {[
              { icon: 'flame', tone: 'text-coral-400', txt: 'Tenés 3 promesas que vencen hoy sin confirmar.', q: '¿Cómo hago seguimiento a 3 promesas que vencen hoy?' },
              { icon: 'alert-triangle', tone: 'text-amber-400', txt: 'Brenda Salinas no respondió hace 36hs — alta voluntad.', q: '¿Cómo reactivo a Brenda Salinas que era voluntad alta y no responde hace 36hs?' },
              { icon: 'trending-up', tone: 'text-emerald-400', txt: 'La plantilla "Quita por pago contado" convierte 41%.', q: '¿Vale la pena usar la plantilla "Quita por pago contado" en mora 30-60d?' },
              { icon: 'sparkles', tone: 'text-violet2-400', txt: 'Generá un resumen de tu turno para pasar a Diego.', q: 'Armame un resumen de mi turno para entregarle a Diego' },
            ].map((s, i) => (
              <button key={i} onClick={() => send(s.q)} className="w-full text-left p-2 rounded-md hover:bg-white/[0.04] transition-colors flex items-start gap-2 group">
                <Icon name={s.icon} size={12} className={`${s.tone} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-default leading-snug">{s.txt}</div>
                  <div className="text-[10px] text-brand-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                    Preguntarle al asistente <Icon name="arrow-right" size={9} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="border-t subtle-border p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted px-1 mb-1">Historial reciente</div>
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

function AnswerBody({ text }) {
  // Lightweight markdown: paragraphs, **bold**, numbered + bullet lists
  const parseInline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith('**') ? <b key={i} className="text-default">{seg.slice(2, -2)}</b> : <span key={i}>{seg}</span>
  );
  const blocks = text.split(/\n\n+/);
  return (
    <div className="space-y-2 text-default">
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        const isNumList = lines.every(l => /^\d+\.\s/.test(l));
        const isBulList = lines.every(l => /^[-•]\s/.test(l));
        if (isNumList) {
          return (
            <ol key={i} className="space-y-1 ml-1">
              {lines.map((l, j) => <li key={j} className="flex gap-2"><span className="text-brand-300 font-semibold tabular shrink-0">{l.match(/^\d+/)[0]}.</span><span>{parseInline(l.replace(/^\d+\.\s/, ''))}</span></li>)}
            </ol>
          );
        }
        if (isBulList) {
          return (
            <ul key={i} className="space-y-1 ml-1">
              {lines.map((l, j) => <li key={j} className="flex gap-2"><span className="text-brand-300 mt-0.5 shrink-0">•</span><span>{parseInline(l.replace(/^[-•]\s/, ''))}</span></li>)}
            </ul>
          );
        }
        return <p key={i}>{parseInline(b)}</p>;
      })}
    </div>
  );
}

Object.assign(window, { LoginScreen, DashboardOp, PortfolioScreen });
