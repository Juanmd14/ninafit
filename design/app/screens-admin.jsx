// screens-admin.jsx — Dashboard (padrón), Alta de socio, Recaudación

/* ── Dashboard / Padrón ── */
function AdminDashboardScreen({ go }) {
  const [filtro, setFiltro] = React.useState('Todos');
  const [q, setQ] = React.useState('');
  const r = RECAUDACION;
  const fMap = { 'Todos': null, 'Al día': 'al_dia', 'Vencida': 'vencida', 'Inactivo': 'inactivo' };
  const list = PADRON.filter(p =>
    (fMap[filtro] === null || p.estado === fMap[filtro]) &&
    (q === '' || (p.nombre + p.dni + p.eslabon).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="screen has-bottomnav">
      <AppBar title="Administración" action={
        <button className="appbar-btn" onClick={() => go('login')} aria-label="Salir"><Icon name="logout" size={20} /></button>
      } />
      <div className="screen-pad">
        <button className="recaud-stat" onClick={() => go('admin-recaudacion')}>
          <div className="recaud-stat-main">
            <span className="recaud-stat-lbl">Recaudación · {r.mesActual}</span>
            <span className="recaud-stat-num">{money(r.total)}</span>
          </div>
          <div className="recaud-stat-side">
            <span className="recaud-mini"><b>{r.sociosAlDia}</b><small>al día</small></span>
            <span className="recaud-mini"><b>{r.sociosTotales}</b><small>socios</small></span>
            <Icon name="chevR" size={18} />
          </div>
        </button>

        <Button block lg icon="plus" onClick={() => go('admin-alta')}>Alta de socio</Button>

        <Section action={<span className="section-count">{list.length}</span>}>Padrón de socios</Section>
        <div className="searchbar">
          <Icon name="search" size={19} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, DNI o eslabón" />
        </div>
        <div className="chips-scroll">
          {['Todos', 'Al día', 'Vencida', 'Inactivo'].map(f => (
            <button key={f} className={`chip ${filtro === f ? 'sel' : ''}`} onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>

        <div className="padron">
          {list.map(p => (
            <div key={p.eslabon} className="padron-row">
              <Monogram text={p.nombre.split(' ').map(w => w[0]).slice(0,2).join('')} size={42} />
              <div className="padron-body">
                <div className="padron-name">{p.nombre}</div>
                <div className="padron-meta">
                  <span className="mono">#{p.eslabon}</span> · DNI {p.dni}
                </div>
              </div>
              <StatusPill estado={p.estado} size="sm" />
            </div>
          ))}
          {list.length === 0 && <div className="empty">Sin resultados.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Alta de socio ── */
function AltaSocioScreen({ go }) {
  const [f, setF] = React.useState({ nombre: '', apellido: '', dni: '', eslabon: '00713' });
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const [done, setDone] = React.useState(false);

  if (done) {
    return (
      <div className="screen">
        <AppBar title="Alta de socio" onBack={() => go('admin-dashboard')} />
        <div className="screen-pad success-wrap">
          <div className="success-ring"><Icon name="check" size={46} stroke={2.6} /></div>
          <h2 className="success-title">Socio dado de alta</h2>
          <p className="success-sub">Se sumó un nuevo eslabón a la cadena.</p>
          <div className="receipt">
            <div className="receipt-row"><span>Nombre</span><b>{f.nombre || '—'} {f.apellido}</b></div>
            <div className="receipt-row"><span>DNI</span><b>{f.dni || '—'}</b></div>
            <div className="receipt-row"><span>N° de eslabón</span><b className="mono">{f.eslabon}</b></div>
            <div className="receipt-row"><span>Estado</span><b><StatusPill estado="vencida" size="sm" /></b></div>
          </div>
          <Button block lg onClick={() => go('admin-dashboard')}>Volver al padrón</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <AppBar title="Alta de socio" onBack={() => go('admin-dashboard')} />
      <div className="screen-pad">
        <p className="form-intro">Cargá los datos del nuevo vecino. El número de eslabón es único e identifica al socio.</p>
        <div className="field-2col">
          <Field label="Nombre"><Input value={f.nombre} onChange={set('nombre')} placeholder="Marina" /></Field>
          <Field label="Apellido"><Input value={f.apellido} onChange={set('apellido')} placeholder="Quiroga" /></Field>
        </div>
        <Field label="DNI"><Input value={f.dni} onChange={set('dni')} placeholder="34.221.908" inputMode="numeric" /></Field>
        <Field label="N° de eslabón" hint="Sugerido automáticamente. Debe ser único.">
          <div className="eslabon-input">
            <span className="eslabon-hash">#</span>
            <Input className="input mono" value={f.eslabon} onChange={set('eslabon')} />
          </div>
        </Field>
      </div>
      <div className="screen-foot screen-foot-2">
        <Button variant="ghost" onClick={() => go('admin-dashboard')}>Cancelar</Button>
        <Button block onClick={() => setDone(true)}>Dar de alta</Button>
      </div>
    </div>
  );
}

/* ── Recaudación ── */
function RecaudacionScreen({ go }) {
  const r = RECAUDACION;
  const max = Math.max(...r.meses.map(m => m.v));
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Recaudación" onBack={() => go('admin-dashboard')} />
      <div className="screen-pad">
        <div className="recaud-hero">
          <span className="recaud-hero-lbl">Total recaudado · {r.mesActual}</span>
          <span className="recaud-hero-num">{money(r.total)}</span>
          <div className="recaud-hero-split">
            <span><b>{r.sociosAlDia}</b> socios al día</span>
            <span className="dot-sep">·</span>
            <span>{Math.round(r.sociosAlDia / r.sociosTotales * 100)}% del padrón</span>
          </div>
        </div>

        <div className="ayuda-card">
          <div className="ayuda-ic"><Icon name="heart" size={22} /></div>
          <div className="ayuda-tx">
            <span className="ayuda-num">{money(r.destinadoAyuda)}</span>
            <span className="ayuda-lbl">destinados a ayuda este mes</span>
          </div>
        </div>

        <Section>Últimos 6 meses</Section>
        <div className="bars">
          {r.meses.map(m => (
            <div key={m.m} className="bar-col">
              <div className="bar-track">
                <div className={`bar-fill ${m.m === 'Jun' ? 'cur' : ''}`} style={{ height: `${m.v / max * 100}%` }} />
              </div>
              <span className="bar-lbl">{m.m}</span>
            </div>
          ))}
        </div>
        <p className="bars-cap">En miles de pesos · crecimiento sostenido del padrón activo.</p>
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboardScreen, AltaSocioScreen, RecaudacionScreen });
