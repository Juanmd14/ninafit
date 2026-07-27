// app.jsx — Router, stage, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C0603A",
  "headingFont": "Bricolage Grotesque",
  "rounding": "medio",
  "cuota": "al día"
}/*EDITMODE-END*/;

const ROUND_SCALE = { 'suave': 0.55, 'medio': 1, 'marcado': 1.5 };

/* Bottom-nav config per role */
function navFor(route, go) {
  if (route === 'socio-carnet' || route === 'socio-promos') {
    return { active: route, items: [
      { key: 'socio-carnet', label: 'Carnet', icon: 'card' },
      { key: 'socio-promos', label: 'Beneficios', icon: 'gift' },
    ] };
  }
  if (route === 'admin-dashboard' || route === 'admin-recaudacion') {
    return { active: route, items: [
      { key: 'admin-dashboard', label: 'Padrón', icon: 'users' },
      { key: 'admin-recaudacion', label: 'Recaudación', icon: 'chart' },
    ] };
  }
  return null;
}

/* Screen index (story map) shown beside the phone */
const INDEX = [
  { group: 'Inicio', items: [{ r: 'login', label: 'Login' }] },
  { group: 'Vecino', items: [
    { r: 'socio-carnet', label: 'Carnet digital' },
    { r: 'socio-pago', label: 'Pagar cuota' },
    { r: 'socio-promos', label: 'Beneficios' },
    { r: 'socio-promo', label: 'Detalle de promo', payload: { promo: PROMOS[2] } },
  ] },
  { group: 'Comercio', items: [
    { r: 'comercio-panel', label: 'Panel del comercio' },
    { r: 'comercio-promo', label: 'Nueva promo' },
    { r: 'comercio-scan', label: 'Escanear QR' },
    { r: 'comercio-result', label: 'Verificación · al día', payload: { result: 'al_dia', socio: { nombre: 'Marina Quiroga', eslabon: '00428' } } },
    { r: 'comercio-result', label: 'Verificación · vencida', payload: { result: 'vencida', socio: { nombre: 'Lucía Fernández', eslabon: '00501' } } },
  ] },
  { group: 'Admin', items: [
    { r: 'admin-dashboard', label: 'Dashboard / Padrón' },
    { r: 'admin-alta', label: 'Alta de socio' },
    { r: 'admin-recaudacion', label: 'Recaudación' },
  ] },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [nav, setNav] = React.useState(() => {
    const saved = localStorage.getItem('solidarity-route');
    return saved ? JSON.parse(saved) : { route: 'login', payload: {} };
  });
  const go = (route, payload = {}) => {
    const n = { route, payload };
    setNav(n);
    localStorage.setItem('solidarity-route', JSON.stringify(n));
  };
  const { route, payload } = nav;

  const estado = t.cuota === 'vencida' ? 'vencida' : 'al_dia';

  const screen = (() => {
    switch (route) {
      case 'login': return <LoginScreen go={go} />;
      case 'socio-carnet': return <CarnetScreen go={go} estado={estado} />;
      case 'socio-pago': return <PagoScreen go={go} />;
      case 'socio-promos': return <PromosScreen go={go} />;
      case 'socio-promo': return <PromoDetailScreen go={go} promo={payload.promo} />;
      case 'comercio-panel': return <ComercioPanelScreen go={go} />;
      case 'comercio-promo': return <NuevaPromoScreen go={go} />;
      case 'comercio-scan': return <ScanScreen go={go} />;
      case 'comercio-result': return <VerificacionScreen go={go} result={payload.result} socio={payload.socio} />;
      case 'admin-dashboard': return <AdminDashboardScreen go={go} />;
      case 'admin-alta': return <AltaSocioScreen go={go} />;
      case 'admin-recaudacion': return <RecaudacionScreen go={go} />;
      default: return <LoginScreen go={go} />;
    }
  })();

  const bn = navFor(route, go);

  const rootStyle = {
    '--accent': t.accent,
    '--font-head': `'${t.headingFont}'`,
    '--r-scale': ROUND_SCALE[t.rounding] || 1,
  };

  const activeIndex = (it) => it.r === route &&
    (it.payload === undefined || JSON.stringify(it.payload) === JSON.stringify(payload) ||
     (it.r === 'comercio-result' && it.payload.result === payload.result));

  return (
    <div className="app-root" style={rootStyle}>
      <aside className="story">
        <div className="story-brand"><span className="brand-mark brand-mark-sm">S</span> Solidarity</div>
        <p className="story-note">Red solidaria de beneficios · prototipo</p>
        {INDEX.map(g => (
          <div key={g.group} className="story-group">
            <div className="story-group-t">{g.group}</div>
            {g.items.map((it, i) => (
              <button key={i} className={`story-item ${activeIndex(it) ? 'on' : ''}`}
                onClick={() => go(it.r, it.payload || {})}>{it.label}</button>
            ))}
          </div>
        ))}
      </aside>

      <div className="stage">
        <PhoneShell>
          {screen}
          {bn && <BottomNav items={bn.items} active={bn.active} onNav={(k) => go(k)} />}
        </PhoneShell>
      </div>

      <TweaksPanel>
        <TweakSection label="Color" />
        <TweakColor label="Acento" value={t.accent}
          options={['#C0603A', '#9C5A44', '#B07A3C', '#2F7D74']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Tipografía" />
        <TweakSelect label="Títulos" value={t.headingFont}
          options={['Bricolage Grotesque', 'Hanken Grotesque', 'Space Grotesk']}
          onChange={(v) => setTweak('headingFont', v)} />
        <TweakSection label="Forma" />
        <TweakRadio label="Esquinas" value={t.rounding}
          options={['suave', 'medio', 'marcado']}
          onChange={(v) => setTweak('rounding', v)} />
        <TweakSection label="Estado de cuota (vecino)" />
        <TweakRadio label="Cuota" value={t.cuota}
          options={['al día', 'vencida']}
          onChange={(v) => setTweak('cuota', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
