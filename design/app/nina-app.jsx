// nina-app.jsx — chooser, router, story index, tweaks

const NINA_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#FF2D6C",
  "headingFont": "Playfair Display",
  "rounding": "medio"
}/*EDITMODE-END*/;

const NINA_ROUND = { 'suave': 0.55, 'medio': 1, 'marcado': 1.5 };

function ChooserScreen({ go }) {
  return (
    <div className="screen chooser">
      <img className="logo-img chooser-dragon" src="assets/simbolo.jpg" alt="Dragón NiNa" />
      <p className="chooser-tag">Elegí tu app</p>
      <div className="chooser-cards">
        <button className="chooser-card" onClick={() => go('fit-home')}>
          <img className="logo-img chooser-logo" src="assets/logo-hiit.jpg" alt="NiNa's HIIT" />
          <span className="chooser-sub">Tu gimnasio, en una sola app.</span>
        </button>
        <button className="chooser-card" onClick={() => go('click-home')}>
          <img className="logo-img chooser-logo" src="assets/logo-click.jpg" alt="NiNa's Click" />
          <span className="chooser-sub">Comprá fácil, pagá seguro, recibí donde quieras.</span>
        </button>
      </div>
    </div>
  );
}

function ninaNavFor(route) {
  const fitTabs = ['fit-home', 'fit-rutina', 'fit-medidas', 'fit-anuncios'];
  if (route.startsWith('fit-') && fitTabs.includes(route)) {
    return { active: route, items: [
      { key: 'fit-home', label: 'Inicio', icon: 'home' },
      { key: 'fit-rutina', label: 'Rutina', icon: 'dumbbell' },
      { key: 'fit-medidas', label: 'Progreso', icon: 'chart' },
      { key: 'fit-anuncios', label: 'Anuncios', icon: 'mega' },
    ] };
  }
  if (['fit-nutricion', 'fit-pagos'].includes(route)) {
    return { active: '', items: [
      { key: 'fit-home', label: 'Inicio', icon: 'home' },
      { key: 'fit-rutina', label: 'Rutina', icon: 'dumbbell' },
      { key: 'fit-medidas', label: 'Progreso', icon: 'chart' },
      { key: 'fit-anuncios', label: 'Anuncios', icon: 'mega' },
    ] };
  }
  if (['click-home', 'click-shop'].includes(route)) {
    return { active: route === 'click-home' ? 'click-home' : '', items: [
      { key: 'click-home', label: 'Inicio', icon: 'home' },
      { key: 'click-buscar', label: 'Buscar', icon: 'search' },
      { key: 'click-carrito', label: 'Carrito', icon: 'cart' },
      { key: 'click-perfil', label: 'Perfil', icon: 'user' },
    ] };
  }
  return null;
}

const NINA_INDEX = [
  { group: 'Inicio', items: [{ r: 'chooser', label: 'Elegir app' }] },
  { group: 'NiNa Fit · gimnasio', items: [
    { r: 'fit-home', label: 'Inicio de la socia' },
    { r: 'fit-rutina', label: 'Rutina HIIT' },
    { r: 'fit-nutricion', label: 'Plan nutricional' },
    { r: 'fit-medidas', label: 'Medidas y peso' },
    { r: 'fit-pagos', label: 'Pagos y cuotas' },
    { r: 'fit-anuncios', label: 'Anuncios' },
    { r: 'fit-alta', label: 'Alta de socia (admin)' },
  ] },
  { group: "NiNa's Click · compras", items: [
    { r: 'click-home', label: 'Inicio / ofertas' },
    { r: 'click-shop', label: 'Comercio y productos' },
    { r: 'click-checkout', label: 'Compra y pago' },
    { r: 'click-publicar', label: 'Publicar oferta (comercio)' },
  ] },
];

function NinaApp() {
  const [t, setTweak] = useTweaks(NINA_TWEAKS);
  const [nav, setNav] = React.useState(() => {
    const saved = localStorage.getItem('nina-route');
    return saved ? JSON.parse(saved) : { route: 'chooser', payload: {} };
  });
  const go = (route, payload = {}) => {
    const n = { route, payload };
    setNav(n);
    localStorage.setItem('nina-route', JSON.stringify(n));
  };
  const { route, payload } = nav;

  const screen = (() => {
    switch (route) {
      case 'chooser': return <ChooserScreen go={go} />;
      case 'fit-home': return <FitHomeScreen go={go} />;
      case 'fit-rutina': return <RutinaScreen go={go} />;
      case 'fit-nutricion': return <NutricionScreen go={go} />;
      case 'fit-medidas': return <MedidasScreen go={go} />;
      case 'fit-pagos': return <FitPagosScreen go={go} />;
      case 'fit-anuncios': return <AnunciosScreen go={go} />;
      case 'fit-alta': return <AltaSociaScreen go={go} />;
      case 'click-home': return <ClickHomeScreen go={go} />;
      case 'click-shop': return <ClickShopScreen go={go} shop={payload.shop} />;
      case 'click-checkout': return <ClickCheckoutScreen go={go} prod={payload.prod} shop={payload.shop} />;
      case 'click-publicar': return <ClickPublicarScreen go={go} />;
      default: return <ChooserScreen go={go} />;
    }
  })();

  const bn = ninaNavFor(route);
  const rootStyle = {
    '--accent': t.accent,
    '--font-head': `'${t.headingFont}'`,
    '--r-scale': NINA_ROUND[t.rounding] || 1,
  };

  return (
    <div className="app-root" style={rootStyle}>
      <aside className="story">
        <img className="logo-img story-dragon" src="assets/simbolo.jpg" alt="" />
        <div className="story-brand">NiNa <em>Apps</em></div>
        <p className="story-note">NiNa Fit + NiNa's Click · prototipo</p>
        {NINA_INDEX.map(g => (
          <div key={g.group} className="story-group">
            <div className="story-group-t">{g.group}</div>
            {g.items.map((it) => (
              <button key={it.r} className={`story-item ${it.r === route ? 'on' : ''}`}
                onClick={() => go(it.r, {})}>{it.label}</button>
            ))}
          </div>
        ))}
      </aside>

      <div className="stage">
        <PhoneShell>
          {screen}
          {bn && <BottomNav items={bn.items} active={bn.active}
            onNav={(k) => ['click-buscar','click-carrito','click-perfil'].includes(k) ? go('click-home') : go(k)} />}
        </PhoneShell>
      </div>

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakColor label="Rosa NiNa" value={t.accent}
          options={['#FF2D6C', '#FF1F57', '#E9337F', '#FF4D8D']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Tipografía" />
        <TweakSelect label="Títulos" value={t.headingFont}
          options={['Playfair Display', 'Cormorant Garamond', 'Cinzel']}
          onChange={(v) => setTweak('headingFont', v)} />
        <TweakSection label="Forma" />
        <TweakRadio label="Esquinas" value={t.rounding}
          options={['suave', 'medio', 'marcado']}
          onChange={(v) => setTweak('rounding', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NinaApp />);
