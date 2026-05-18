// CobrAI app shell + router
const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp, useCallback: useCallbackApp } = React;

function App() {
  const [state, setState] = useStateApp(window.CobrStore.get());
  useEffectApp(() => window.CobrStore.subscribe(setState), []);

  // Theme effect
  useEffectApp(() => {
    if (state.theme === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
    }
  }, [state.theme]);

  const goto = useCallbackApp((route, params = {}) => {
    window.CobrStore.set({ route, routeParams: params });
  }, []);

  const openConv = useCallbackApp((id) => {
    window.CobrStore.set({ route: 'inbox', activeConversationId: id, routeParams: { id } });
  }, []);

  // Auth gate
  if (!state.authed) {
    return (
      <>
        <LoginScreen
          onAuthed={() => {}}
          onPickTenant={(tenantId) => {
            const deudores = window.CobrData.genDeudores(tenantId, tenantId === 'banco-sur' ? 42 : tenantId === 'credito-ya' ? 91 : 17);
            window.CobrStore.set({
              authed: true,
              tenantId,
              deudores,
              route: 'dashboard-op',
              activeConversationId: deudores[0].id,
              conversations: Object.fromEntries(deudores.slice(0, 22).map(d => [d.id, window.CobrData.genConversation(d)])),
            });
          }}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar route={state.route} goto={goto} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar state={state} goto={goto} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <RouterOutlet state={state} goto={goto} openConv={openConv} />
        </main>
      </div>
      <Toaster />
      <CommandPalette state={state} goto={goto} />
    </div>
  );
}

function RouterOutlet({ state, goto, openConv }) {
  switch (state.route) {
    case 'dashboard-op': return <DashboardOp goto={goto} openConv={openConv} />;
    case 'portfolio': return <PortfolioScreen goto={goto} />;
    case 'strategies': return <StrategiesScreen />;
    case 'templates': return <TemplatesScreen />;
    case 'inbox': return <InboxScreen initialId={state.routeParams.id || state.activeConversationId} />;
    case 'debtor': return <DebtorScreen id={state.routeParams.id} goto={goto} openConv={openConv} />;
    case 'debtors': return <DebtorsListScreen goto={goto} />;
    case 'dashboard-mgmt': return <DashboardMgmt />;
    case 'settings': return <SettingsScreen />;
    default: return <DashboardOp goto={goto} openConv={openConv} />;
  }
}

const NAV = [
  { group: 'Operación', items: [
    { id: 'dashboard-op', icon: 'layout-dashboard', label: 'Dashboard operador' },
    { id: 'inbox', icon: 'inbox', label: 'Bandeja', badge: 22 },
    { id: 'debtors', icon: 'user-round-search', label: 'Deudores' },
  ]},
  { group: 'Cartera', items: [
    { id: 'portfolio', icon: 'upload-cloud', label: 'Carga de cartera' },
    { id: 'strategies', icon: 'route', label: 'Estrategias' },
    { id: 'templates', icon: 'message-square-text', label: 'Plantillas' },
  ]},
  { group: 'Análisis', items: [
    { id: 'dashboard-mgmt', icon: 'bar-chart-3', label: 'Dashboard gerencial' },
  ]},
  { group: 'Sistema', items: [
    { id: 'settings', icon: 'settings', label: 'Configuración' },
  ]},
];

function Sidebar({ route, goto }) {
  return (
    <aside className="w-60 shrink-0 sidebar-bg border-r flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b subtle-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-violet2-500 flex items-center justify-center shadow-glow">
          <Icon name="message-square-text" size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold tracking-tight">CobrAI</div>
          <div className="text-[9px] uppercase tracking-widest text-muted">v0.9 beta</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {NAV.map(g => (
          <div key={g.group} className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-muted px-2.5 mb-1.5">{g.group}</div>
            <div className="space-y-0.5">
              {g.items.map(it => {
                const active = route === it.id || (it.id === 'debtors' && route === 'debtor');
                return (
                  <button
                    key={it.id}
                    onClick={() => goto(it.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${active ? 'nav-item-active font-medium' : 'nav-item-idle text-muted hover:text-default'}`}
                  >
                    <Icon name={it.icon} size={16} />
                    <span className="flex-1 text-left">{it.label}</span>
                    {it.badge && <span className="text-[10px] tabular px-1.5 py-0.5 rounded bg-coral-500/15 text-coral-400 font-medium">{it.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {/* Plan card */}
      <div className="p-3 border-t subtle-border">
        <div className="panel-muted border subtle-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="sparkles" size={12} className="text-violet2-400" />
            <span className="text-xs font-semibold">Uso del plan</span>
          </div>
          <ProgressBar value={73.7} color="#a78bfa" />
          <div className="text-[10px] text-muted mt-1 flex justify-between"><span>18.4k / 25k conv.</span><span>74%</span></div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ state, goto }) {
  const [tenantOpen, setTenantOpen] = useStateApp(false);
  const [userOpen, setUserOpen] = useStateApp(false);
  const [notifOpen, setNotifOpen] = useStateApp(false);
  const tenant = window.CobrData.TENANTS.find(t => t.id === state.tenantId);
  const switchTenant = (tid) => {
    const deudores = window.CobrData.genDeudores(tid, tid === 'banco-sur' ? 42 : tid === 'credito-ya' ? 91 : 17);
    window.CobrStore.set({
      tenantId: tid,
      deudores,
      activeConversationId: deudores[0].id,
      conversations: Object.fromEntries(deudores.slice(0, 22).map(d => [d.id, window.CobrData.genConversation(d)])),
    });
    setTenantOpen(false);
    const t = window.CobrData.TENANTS.find(x => x.id === tid);
    window.toast({ kind: 'success', title: `Cambiaste a ${t.name}`, message: 'Los dashboards se recalcularon con la cartera del workspace.' });
  };
  const breadcrumb = {
    'dashboard-op': ['Operación', 'Dashboard operador'],
    'inbox': ['Operación', 'Bandeja'],
    'debtors': ['Operación', 'Deudores'],
    'debtor': ['Operación', 'Deudores', 'Ficha'],
    'portfolio': ['Cartera', 'Carga'],
    'strategies': ['Cartera', 'Estrategias'],
    'templates': ['Cartera', 'Plantillas'],
    'dashboard-mgmt': ['Análisis', 'Dashboard gerencial'],
    'settings': ['Sistema', 'Configuración'],
  }[state.route] || ['—'];

  return (
    <header className="h-14 shrink-0 topbar-bg border-b sticky top-0 z-30 flex items-center gap-3 px-5">
      {/* Tenant switcher */}
      <div className="relative">
        <button onClick={() => setTenantOpen(v => !v)} className="flex items-center gap-2 panel-muted border subtle-border rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-colors">
          <Avatar initials={tenant.initials} size={22} color={tenant.color} />
          <div className="text-left">
            <div className="text-sm font-medium leading-tight">{tenant.name}</div>
            <div className="text-[10px] text-muted leading-tight">{tenant.tag}</div>
          </div>
          <Icon name="chevrons-up-down" size={12} className="text-muted ml-1" />
        </button>
        {tenantOpen && (
          <div className="absolute top-full mt-2 left-0 panel border subtle-border rounded-lg shadow-card w-72 z-40 p-1 fade-in">
            <div className="text-[10px] uppercase tracking-wide text-muted px-2 py-1.5">Tus workspaces</div>
            {window.CobrData.TENANTS.map(t => (
              <button key={t.id} onClick={() => switchTenant(t.id)} className={`w-full flex items-center gap-2.5 p-2 rounded-md transition-colors text-left ${t.id === state.tenantId ? 'bg-brand-500/10' : 'hover:bg-white/5'}`}>
                <Avatar initials={t.initials} size={28} color={t.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-[11px] text-muted">{t.tag} · {window.fmtMoneyShort(t.stats.cartera)} cartera</div>
                </div>
                {t.id === state.tenantId && <Icon name="check" size={14} className="text-brand-300" />}
              </button>
            ))}
            <div className="border-t subtle-border my-1" />
            <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-white/5 text-sm text-muted">
              <Icon name="plus" size={14} /> Crear nuevo workspace
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted">
        <Icon name="slash" size={12} />
        {breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            <span className={i === breadcrumb.length - 1 ? 'text-default font-medium' : ''}>{b}</span>
            {i < breadcrumb.length - 1 && <Icon name="chevron-right" size={12} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search hint */}
      <button className="hidden lg:flex items-center gap-2 panel-muted border subtle-border rounded-md px-2.5 py-1.5 text-xs text-muted hover:text-default w-56 transition-colors">
        <Icon name="search" size={12} />
        <span className="flex-1 text-left">Buscar deudor, plantilla…</span>
        <kbd className="font-mono text-[10px] panel border subtle-border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Theme */}
      <IconBtn icon={state.theme === 'dark' ? 'sun' : 'moon'} title="Cambiar tema" onClick={() => window.CobrStore.set({ theme: state.theme === 'dark' ? 'light' : 'dark' })} />

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setNotifOpen(v => !v)} className="relative inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-default hover:bg-white/5 transition-colors">
          <Icon name="bell" size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute top-full mt-2 right-0 panel border subtle-border rounded-lg shadow-card w-80 z-40 fade-in">
            <div className="px-3 py-2.5 border-b subtle-border flex items-center justify-between">
              <div className="font-semibold text-sm">Notificaciones</div>
              <button className="text-[11px] text-brand-300 hover:underline">Marcar todas como leídas</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {state.notifications.map(n => (
                <div key={n.id} className="px-3 py-2.5 border-b subtle-border last:border-0 hover:bg-white/[0.03]">
                  <div className="text-sm">{n.txt}</div>
                  <div className="text-[11px] text-muted mt-0.5">hace {n.mins}m</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-white/10" />

      {/* User */}
      <div className="relative">
        <button onClick={() => setUserOpen(v => !v)} className="flex items-center gap-2 rounded-md p-1 hover:bg-white/5">
          <Avatar initials={state.user.avatar} size={28} color="#06b6d4" />
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium leading-tight">{state.user.name}</div>
            <div className="text-[10px] text-muted leading-tight">{state.user.role}</div>
          </div>
        </button>
        {userOpen && (
          <div className="absolute top-full mt-2 right-0 panel border subtle-border rounded-lg shadow-card w-56 z-40 p-1 fade-in">
            <div className="p-3 border-b subtle-border">
              <div className="text-sm font-medium">{state.user.name}</div>
              <div className="text-[11px] text-muted">{state.user.email}</div>
            </div>
            <button className="w-full text-left px-3 py-2 rounded text-sm hover:bg-white/5 flex items-center gap-2"><Icon name="user" size={14} /> Mi perfil</button>
            <button className="w-full text-left px-3 py-2 rounded text-sm hover:bg-white/5 flex items-center gap-2"><Icon name="key-round" size={14} /> Seguridad</button>
            <button onClick={() => goto('settings')} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-white/5 flex items-center gap-2"><Icon name="settings" size={14} /> Configuración</button>
            <div className="border-t subtle-border my-1" />
            <button onClick={() => window.CobrStore.set({ authed: false, route: 'login' })} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-white/5 flex items-center gap-2 text-coral-400"><Icon name="log-out" size={14} /> Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}

function CommandPalette({ state, goto }) {
  const [open, setOpen] = useStateApp(false);
  const [q, setQ] = useStateApp('');
  useEffectApp(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open) return null;
  const items = [
    ...NAV.flatMap(g => g.items).map(it => ({ kind: 'nav', label: it.label, icon: it.icon, action: () => { goto(it.id); setOpen(false); } })),
    ...state.deudores.slice(0, 8).map(d => ({ kind: 'deudor', label: d.nombre + ' — ' + window.fmtMoneyShort(d.monto), icon: 'user', action: () => { window.CobrStore.set({ route: 'inbox', activeConversationId: d.id, routeParams: { id: d.id } }); setOpen(false); } })),
  ].filter(i => !q || i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-[70] p-20 flex items-start justify-center" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative panel border subtle-border rounded-xl shadow-2xl w-full max-w-xl slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b subtle-border">
          <Icon name="search" size={16} className="text-muted" />
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Saltar a… buscar deudor, plantilla, acción" className="flex-1 bg-transparent border-0 outline-0 text-sm" />
          <kbd className="font-mono text-[10px] panel-muted border subtle-border rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin p-1">
          {items.map((it, i) => (
            <button key={i} onClick={it.action} className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-white/5 text-left">
              <Icon name={it.icon} size={14} className="text-muted" />
              <span className="flex-1">{it.label}</span>
              <span className="text-[10px] text-muted uppercase">{it.kind}</span>
            </button>
          ))}
          {items.length === 0 && <div className="text-center text-muted text-sm p-6">Sin resultados</div>}
        </div>
      </div>
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
