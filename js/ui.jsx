// CobrAI UI primitives
// Exposes: Icon, Btn, IconBtn, Badge, EstadoBadge, Card, Modal, Toaster, useToasts, CountUp, Gauge, Sparkline, Bar, Donut, Heatmap, ProgressBar, Avatar, Tabs, EmptyState
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Icon({ name, className = '', size = 16, stroke = 2 }) {
  // Lucide is global window.lucide
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = '';
    const svg = window.lucide.createElement(window.lucide.icons[toPascal(name)] || window.lucide.icons.Circle);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('stroke-width', stroke);
    svg.setAttribute('class', className);
    ref.current.appendChild(svg);
  }, [name, className, size, stroke]);
  return <span ref={ref} className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
}
function toPascal(s) { return s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(''); }

function Btn({ children, icon, variant = 'primary', size = 'md', onClick, className = '', disabled, type = 'button', title }) {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-glow',
    secondary: 'bg-white/5 hover:bg-white/10 text-default border subtle-border',
    ghost: 'hover:bg-white/5 text-muted hover:text-default',
    danger: 'bg-coral-500 hover:bg-coral-400 text-white',
    success: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    outline: 'border subtle-border hover:bg-white/5 text-default',
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 ring-focus ${sizes[size]} ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, title, className = '', size = 16, active }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${active ? 'bg-brand-500/15 text-brand-300' : 'text-muted hover:text-default hover:bg-white/5'} ${className}`}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-white/5 text-muted border subtle-border',
    brand: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    danger: 'bg-coral-500/15 text-coral-400 border border-coral-500/30',
    violet: 'bg-violet2-500/15 text-violet2-400 border border-violet2-500/30',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

function EstadoBadge({ estado }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${window.CobrData.ESTADO_COLOR[estado] || 'bg-white/5 text-muted'}`}>{estado}</span>;
}

function VolBadge({ voluntad }) {
  let tone = 'danger', label = 'Baja';
  if (voluntad >= 70) { tone = 'success'; label = 'Alta'; }
  else if (voluntad >= 40) { tone = 'warning'; label = 'Media'; }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular ${tone === 'success' ? 'bg-emerald-500/15 text-emerald-400' : tone === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-coral-500/15 text-coral-400'}`}>
        {voluntad}
      </span>
      <span className="text-[11px] text-muted">{label}</span>
    </span>
  );
}

function Card({ children, className = '', as: As = 'div', onClick, title, label }) {
  return (
    <As onClick={onClick} className={`panel border rounded-xl shadow-card ${onClick ? 'cursor-pointer hover:bg-white/[0.02] transition-colors' : ''} ${className}`} data-screen-label={label}>
      {children}
    </As>
  );
}

function Avatar({ initials, size = 32, color = '#06b6d4', className = '' }) {
  const fs = Math.max(10, Math.floor(size * 0.4));
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white tabular ${className}`}
      style={{ width: size, height: size, fontSize: fs, background: `linear-gradient(135deg, ${color}, ${shade(color, -20)})` }}
    >
      {initials}
    </span>
  );
}
function shade(hex, percent) {
  const c = hex.replace('#','');
  const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
  const t = percent < 0 ? 0 : 255, p = Math.abs(percent) / 100;
  const R = Math.round((t-r)*p) + r, G = Math.round((t-g)*p) + g, B = Math.round((t-b)*p) + b;
  return `rgb(${R},${G},${B})`;
}

function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', icon }) {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in" onClick={onClose} />
      <div className={`relative panel border rounded-xl shadow-2xl ${widths[size]} w-full slide-in flex flex-col max-h-[88vh]`}>
        <div className="flex items-start gap-3 px-5 py-4 border-b subtle-border">
          {icon && <div className="w-9 h-9 rounded-lg bg-brand-500/15 text-brand-300 flex items-center justify-center"><Icon name={icon} size={18} /></div>}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-default">{title}</div>
            {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-default rounded p-1 -mr-1"><Icon name="x" size={18} /></button>
        </div>
        <div className="px-5 py-4 overflow-auto scrollbar-thin flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t subtle-border flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// --- Toasts ---
let toastSeq = 0;
function pushToast(toast) {
  const id = ++toastSeq;
  const t = { id, kind: 'info', ...toast };
  window.CobrStore.set(s => ({ ...s, toasts: [...s.toasts, t] }));
  setTimeout(() => {
    window.CobrStore.set(s => ({ ...s, toasts: s.toasts.filter(x => x.id !== id) }));
  }, toast.duration || 3800);
}
window.toast = pushToast;

function Toaster() {
  const [toasts, setToasts] = useState(window.CobrStore.get().toasts);
  useEffect(() => window.CobrStore.subscribe(s => setToasts(s.toasts)), []);
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto panel border rounded-lg shadow-card px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-sm slide-in">
          <div className={`mt-0.5 ${t.kind === 'success' ? 'text-emerald-400' : t.kind === 'error' ? 'text-coral-400' : t.kind === 'warning' ? 'text-amber-400' : 'text-brand-300'}`}>
            <Icon name={t.kind === 'success' ? 'check-circle-2' : t.kind === 'error' ? 'x-circle' : t.kind === 'warning' ? 'alert-triangle' : 'info'} size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-default">{t.title}</div>
            {t.message && <div className="text-xs text-muted mt-0.5">{t.message}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Number counter ---
function CountUp({ value, duration = 900, format = (v) => Math.round(v).toString(), className = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(animate);
      else setV(value);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={`count-up tabular ${className}`}>{format(v)}</span>;
}

// --- Charts (handmade SVG) ---
function Sparkline({ data, color = '#22d3ee', height = 36, fill = true, className = '' }) {
  const w = 200;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const area = d + ` L ${w} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={`w-full ${className}`} style={{ height }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Gauge({ value = 50, size = 200, label = 'Voluntad' }) {
  // Semi-circle gauge 0..100
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size * 0.68;
  const start = Math.PI;
  const sweep = Math.PI; // half circle
  const arcPath = (from, to) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy + r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy + r * Math.sin(to);
    const large = to - from > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const stops = [
    { from: start, to: start + sweep * 0.4, color: '#f43f5e' },
    { from: start + sweep * 0.4, to: start + sweep * 0.7, color: '#f59e0b' },
    { from: start + sweep * 0.7, to: start + sweep, color: '#10b981' },
  ];
  const angle = start + (value / 100) * sweep;
  const needleX = cx + (r - 12) * Math.cos(angle);
  const needleY = cy + (r - 12) * Math.sin(angle);
  return (
    <svg viewBox={`0 0 ${size} ${size * 0.82}`} className="w-full">
      {stops.map((s, i) => <path key={i} d={arcPath(s.from, s.to)} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="butt" opacity="0.85" />)}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#eceef2" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#eceef2" />
      <text x={cx} y={cy + 28} textAnchor="middle" className="fill-current text-muted" style={{ fontSize: 11 }}>{label}</text>
      <text x={cx} y={cy + 50} textAnchor="middle" className="fill-current text-default font-bold tabular" style={{ fontSize: 26 }}>{Math.round(value)}</text>
    </svg>
  );
}

function ProgressBar({ value, max = 100, color = '#22d3ee', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 rounded-full bg-white/5 overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b subtle-border ${className}`}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${active === t.id ? 'border-brand-400 text-default' : 'border-transparent text-muted hover:text-default'}`}
        >
          {t.icon && <Icon name={t.icon} size={14} className="mr-1.5" />}
          {t.label}
          {t.count != null && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon = 'inbox', title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/5 text-muted flex items-center justify-center mb-3"><Icon name={icon} size={22} /></div>
      <div className="text-sm font-medium text-default">{title}</div>
      {hint && <div className="text-xs text-muted mt-1 max-w-xs">{hint}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// Donut chart
function Donut({ data, size = 160, thickness = 22, centerLabel, centerValue }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  const arcs = data.map((d, i) => {
    const startA = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const endA = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={d.color} strokeWidth={thickness} strokeLinecap="butt" />;
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size, maxHeight: size }}>
      {arcs}
      {centerValue && (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-current text-default font-bold" style={{ fontSize: 20 }}>{centerValue}</text>
          <text x={cx} y={cy + 18} textAnchor="middle" className="fill-current text-muted" style={{ fontSize: 11 }}>{centerLabel}</text>
        </>
      )}
    </svg>
  );
}

// Stacked bar chart (simple)
function StackedBars({ data, height = 180, colors = ['#22d3ee','#8b5cf6','#f59e0b','#10b981','#f43f5e'] }) {
  // data: [{label, segments:[v1,v2,...]}]
  const max = Math.max(...data.map(d => d.segments.reduce((a,b)=>a+b,0)));
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const total = d.segments.reduce((a,b)=>a+b,0);
        const h = (total / max) * (height - 24);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <div className="w-full flex flex-col justify-end overflow-hidden rounded-md" style={{ height: h }}>
              {d.segments.map((s, j) => (
                <div key={j} style={{ height: `${(s/total)*100}%`, background: colors[j % colors.length] }} className="transition-all duration-700" />
              ))}
            </div>
            <div className="text-[10px] text-muted truncate w-full text-center">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Heatmap 7x24
function Heatmap({ data, max }) {
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const m = max || Math.max(...data.flat());
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 pl-8">
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={h} className="flex-1 text-[9px] text-muted text-center">{h % 4 === 0 ? h : ''}</div>
        ))}
      </div>
      {days.map((d, di) => (
        <div key={di} className="flex items-center gap-1">
          <div className="w-7 text-[10px] text-muted">{d}</div>
          {Array.from({ length: 24 }).map((_, hi) => {
            const v = data[di][hi];
            const a = v / m;
            const bg = `rgba(34, 211, 238, ${0.05 + a * 0.85})`;
            return <div key={hi} title={`${d} ${hi}:00 — ${v} respuestas`} className="flex-1 rounded-sm transition-colors hover:ring-1 hover:ring-brand-300" style={{ height: 14, background: bg }} />;
          })}
        </div>
      ))}
    </div>
  );
}

// Line chart
function LineChart({ series, height = 200, labels = [], yMax }) {
  const w = 600;
  const h = height;
  const pad = { l: 36, r: 8, t: 8, b: 22 };
  const max = yMax || Math.max(...series.flatMap(s => s.data));
  const xStep = (w - pad.l - pad.r) / (labels.length - 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      {[0,0.25,0.5,0.75,1].map((p, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + p * (h - pad.t - pad.b)} y2={pad.t + p * (h - pad.t - pad.b)} stroke="rgba(255,255,255,0.06)" />
          <text x={pad.l - 6} y={pad.t + p * (h - pad.t - pad.b) + 4} textAnchor="end" className="fill-current text-muted" style={{ fontSize: 9 }}>
            {Math.round(max * (1 - p) / 1000)}k
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={pad.l + i * xStep} y={h - 6} textAnchor="middle" className="fill-current text-muted" style={{ fontSize: 9 }}>{l}</text>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => `${pad.l + i * xStep},${pad.t + (1 - v / max) * (h - pad.t - pad.b)}`).join(' ');
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((v, i) => (
              <circle key={i} cx={pad.l + i * xStep} cy={pad.t + (1 - v / max) * (h - pad.t - pad.b)} r="2.5" fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// Funnel
function Funnel({ steps }) {
  const max = steps[0].value;
  return (
    <div className="flex flex-col gap-1.5">
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 text-xs text-muted shrink-0">{s.label}</div>
            <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden relative">
              <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }} />
              <div className="absolute inset-0 flex items-center px-2 text-[11px] text-default font-medium tabular">
                {window.fmtInt(s.value)} <span className="ml-1.5 text-muted">({Math.round(pct)}%)</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Argentina simplified provinces heatmap (grid)
function ArgentinaMap({ data }) {
  // a stylized grid of provinces — pure placeholder geography
  const layout = [
    [null, null, 'Jujuy', 'Salta', null, null],
    [null, null, null, 'Tucumán', 'Formosa', null],
    [null, 'Catamarca', null, 'Santiago del Estero', 'Chaco', null],
    [null, 'La Rioja', 'Córdoba', 'Santa Fe', 'Corrientes', 'Misiones'],
    ['San Juan', 'San Luis', null, null, 'Entre Ríos', null],
    ['Mendoza', null, 'La Pampa', 'Buenos Aires', 'CABA', null],
    [null, 'Neuquén', 'Río Negro', null, null, null],
    [null, 'Chubut', null, null, null, null],
    [null, 'Santa Cruz', null, null, null, null],
    [null, 'Tierra del Fuego', null, null, null, null],
  ];
  const max = Math.max(...Object.values(data));
  return (
    <div className="flex flex-col gap-1">
      {layout.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.map((cell, ci) => {
            if (!cell) return <div key={ci} className="w-14 h-9" />;
            const v = data[cell] || 0;
            const a = v / max;
            return (
              <div
                key={ci}
                title={`${cell} — ${window.fmtMoneyShort(v)}`}
                className="w-14 h-9 rounded text-[8px] flex items-center justify-center text-center px-1 leading-tight text-default font-medium hover:ring-1 hover:ring-brand-300 cursor-default"
                style={{ background: `rgba(244, 63, 94, ${0.1 + a * 0.7})`, color: a > 0.5 ? '#fff' : undefined }}
              >
                {cell}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Drag-drop dummy
function FileDrop({ onDrop, hint = 'Soltá tu archivo CSV o XLSX acá' }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={() => onDrop({ name: 'cartera_mayo_2026.csv', size: '184 KB', rows: 482 })}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onDrop({ name: 'cartera_mayo_2026.csv', size: '184 KB', rows: 482 }); }}
      className={`cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-colors ${over ? 'border-brand-400 bg-brand-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-brand-500/15 text-brand-300 flex items-center justify-center mb-3"><Icon name="upload-cloud" size={24} /></div>
      <div className="text-sm font-medium text-default">{hint}</div>
      <div className="text-xs text-muted mt-1">o hacé clic para examinar — CSV, XLSX hasta 10MB</div>
    </div>
  );
}

// Skeleton row
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-full skeleton" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-36 rounded skeleton" />
        <div className="h-2 w-24 rounded skeleton" />
      </div>
      <div className="h-2.5 w-16 rounded skeleton" />
    </div>
  );
}

// Expose
Object.assign(window, {
  Icon, Btn, IconBtn, Badge, EstadoBadge, VolBadge, Card, Avatar, Modal, Toaster, CountUp,
  Gauge, Sparkline, ProgressBar, Tabs, EmptyState, Donut, StackedBars, Heatmap, LineChart, Funnel, ArgentinaMap, FileDrop, SkeletonRow,
});
