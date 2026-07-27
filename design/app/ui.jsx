// ui.jsx — Shared UI for Solidarity (window-exported)
const { useRef, useEffect, useState } = React;

/* ───────────────── Icons (stroke, rounded, humanist) ───────────────── */
const PATHS = {
  back:   '<polyline points="15 5 8 12 15 19"/>',
  chevR:  '<polyline points="9 5 16 12 9 19"/>',
  chevD:  '<polyline points="5 9 12 16 19 9"/>',
  chevU:  '<polyline points="5 15 12 8 19 15"/>',
  plus:   '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  close:  '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  check:  '<polyline points="4 12 10 18 20 6"/>',
  card:   '<rect x="3" y="6" width="18" height="13" rx="2.5"/><line x1="3" y1="10.5" x2="21" y2="10.5"/>',
  qr:     '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><line x1="14" y1="14" x2="14" y2="20"/><line x1="17.5" y1="14" x2="17.5" y2="17.5"/><line x1="20" y1="14" x2="20" y2="20"/><line x1="14" y1="20" x2="20" y2="20"/>',
  scan:   '<path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><line x1="4" y1="12" x2="20" y2="12"/>',
  gift:   '<rect x="4" y="9" width="16" height="11" rx="1.5"/><line x1="4" y1="13" x2="20" y2="13"/><line x1="12" y1="9" x2="12" y2="20"/><path d="M12 9C12 6.5 10.5 5 9 5a2 2 0 0 0 0 4z"/><path d="M12 9c0-2.5 1.5-4 3-4a2 2 0 0 1 0 4z"/>',
  store:  '<path d="M4 9.5 5.2 5h13.6L20 9.5"/><path d="M4 9.5a2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0"/><path d="M5.2 11v8.5h13.6V11"/><line x1="5.2" y1="19.5" x2="18.8" y2="19.5"/>',
  users:  '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M17 14.2a5.5 5.5 0 0 1 3.5 4.8"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><path d="M16 12.5h1.5"/><path d="M3.5 9h13a1.5 1.5 0 0 1 0 0"/>',
  chart:  '<line x1="5" y1="20" x2="19" y2="20"/><rect x="6" y="12" width="3" height="6" rx="1"/><rect x="11" y="8" width="3" height="10" rx="1"/><rect x="16" y="5" width="3" height="13" rx="1"/>',
  gear:   '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18"/>',
  menu:   '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  search: '<circle cx="11" cy="11" r="6"/><line x1="15.5" y1="15.5" x2="20" y2="20"/>',
  user:   '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  logout: '<path d="M14 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8"/><polyline points="16 8 20 12 16 16"/><line x1="20" y1="12" x2="9" y2="12"/>',
  heart:  '<path d="M12 20s-7-4.3-9.2-8.6C1.3 8.5 2.8 5 6 5c2 0 3.2 1.4 4 2.6C10.8 6.4 12 5 14 5c3.2 0 4.7 3.5 3.2 6.4C19 15.7 12 20 12 20z"/>',
  link:   '<path d="M10 13.5 14 9.5"/><path d="M8.5 11 7 12.5a3 3 0 0 0 4.2 4.2L13 15"/><path d="M15.5 13 17 11.5a3 3 0 0 0-4.2-4.2L11 9"/>',
  clock:  '<circle cx="12" cy="12" r="8"/><polyline points="12 8 12 12 15 14"/>',
  shield: '<path d="M12 3.5 5 6v5c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/>',
  camera: '<rect x="3.5" y="7" width="17" height="12.5" rx="2.5"/><circle cx="12" cy="13.2" r="3.2"/><path d="M8.5 7l1.2-2h4.6l1.2 2"/>',
  trash:  '<polyline points="4 7 20 7"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/>',
};
function Icon({ name, size = 22, stroke = 1.8, className = '', style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}
      dangerouslySetInnerHTML={{ __html: PATHS[name] || '' }} />
  );
}

/* ───────────────── Status / cuota pill ───────────────── */
function StatusPill({ estado, size = 'md' }) {
  const map = {
    al_dia:   { cls: 'pill-ok',   label: 'Al día', dot: true },
    vencida:  { cls: 'pill-bad',  label: 'Cuota vencida', dot: true },
    inactivo: { cls: 'pill-idle', label: 'Inactivo', dot: true },
  };
  const m = map[estado] || map.inactivo;
  return (
    <span className={`pill ${m.cls} ${size === 'lg' ? 'pill-lg' : ''}`}>
      {m.dot && <span className="pill-dot" />}{m.label}
    </span>
  );
}

/* ───────────────── QR (real, via qrcodejs) ───────────────── */
function QR({ value, size = 180 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    if (typeof QRCode === 'undefined') {
      ref.current.textContent = 'QR';
      return;
    }
    /* eslint-disable no-new */
    try {
      new QRCode(ref.current, {
        text: value,
        width: size, height: size,
        colorDark: '#231b16',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L,
      });
    } catch (e) {
      ref.current.textContent = 'QR';
    }
  }, [value, size]);
  return <div className="qr" ref={ref} style={{ width: size, height: size }} />;
}

/* ───────────────── Monogram / avatar ───────────────── */
function Monogram({ text, tint, size = 44 }) {
  return (
    <div className="monogram" style={{
      width: size, height: size, background: (tint || 'var(--accent)') + '1a',
      color: tint || 'var(--accent)', fontSize: size * 0.36,
    }}>{text}</div>
  );
}

/* ───────────────── Buttons ───────────────── */
function Button({ children, variant = 'primary', block, lg, icon, onClick, type = 'button' }) {
  return (
    <button type={type} onClick={onClick}
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${lg ? 'btn-lg' : ''}`}>
      {icon && <Icon name={icon} size={lg ? 21 : 19} />}
      {children}
    </button>
  );
}

/* ───────────────── Form field ───────────────── */
function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
function Input(props) { return <input className="input" {...props} />; }
function Textarea(props) { return <textarea className="textarea" {...props} />; }

/* Collapsible select-style row (Grupo Muscular / Categoría pattern) */
function SelectRow({ label, value, options = [], onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`selrow ${open ? 'open' : ''}`}>
      <button type="button" className="selrow-head" onClick={() => setOpen(o => !o)}>
        <span className={value ? 'selrow-val' : 'selrow-ph'}>{value || label}</span>
        <Icon name={open ? 'chevU' : 'chevD'} size={20} />
      </button>
      {open && (
        <div className="selrow-opts">
          {options.map(o => (
            <button type="button" key={o} className={`selrow-opt ${o === value ? 'sel' : ''}`}
              onClick={() => { onChange && onChange(o); setOpen(false); }}>
              {o}{o === value && <Icon name="check" size={18} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Phone shell ───────────────── */
function StatusBar() {
  return (
    <div className="statusbar">
      <span className="sb-time">17:54</span>
      <span className="sb-icons">
        <svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor"><rect x="0" y="9" width="3" height="4" rx="1"/><rect x="4.5" y="6" width="3" height="7" rx="1"/><rect x="9" y="3" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="13" rx="1"/></svg>
        <svg width="17" height="13" viewBox="0 0 17 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.5 11.5 1 4a10.5 10.5 0 0 1 15 0z"/></svg>
        <svg width="24" height="13" viewBox="0 0 24 13" fill="none"><rect x="1" y="1.5" width="19" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.2"/><rect x="3" y="3.5" width="12" height="6" rx="1" fill="currentColor"/><rect x="21" y="4.5" width="2" height="4" rx="1" fill="currentColor"/></svg>
      </span>
    </div>
  );
}
function PhoneShell({ children }) {
  return (
    <div className="phone">
      <div className="phone-inner">
        <StatusBar />
        <div className="phone-body">{children}</div>
        <div className="gesturebar"><span /></div>
      </div>
    </div>
  );
}

/* ───────────────── App bar (custom top bar) ───────────────── */
function AppBar({ title, onBack, action, accentBg }) {
  return (
    <div className={`appbar ${accentBg ? 'appbar-accent' : ''}`}>
      {onBack
        ? <button className="appbar-btn" onClick={onBack} aria-label="Volver"><Icon name="back" /></button>
        : <span className="appbar-brand"><span className="brand-mark">S</span></span>}
      <span className="appbar-title">{title}</span>
      <span className="appbar-action">{action}</span>
    </div>
  );
}

/* ───────────────── Bottom nav ───────────────── */
function BottomNav({ items, active, onNav }) {
  return (
    <nav className="bottomnav">
      {items.map(it => (
        <button key={it.key} className={`bn-item ${active === it.key ? 'active' : ''}`}
          onClick={() => onNav(it.key)}>
          <Icon name={it.icon} size={23} stroke={active === it.key ? 2.1 : 1.8} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ───────────────── Section title ───────────────── */
function Section({ children, action }) {
  return (
    <div className="section">
      <h3 className="section-title">{children}</h3>
      {action}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusPill, QR, Monogram, Button, Field, Input, Textarea, SelectRow,
  PhoneShell, AppBar, BottomNav, Section, ICON_PATHS: PATHS,
});
