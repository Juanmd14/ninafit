// nina-fit.jsx — NiNa Fit (gimnasio HIIT): home, rutina, nutrición, medidas, pagos, anuncios, alta socia

function FitHeader({ go }) {
  return (
    <div className="nnf-header">
      <img className="logo-img nnf-logo" src="assets/simbolo.jpg" alt="" />
      <span className="nnf-word">NiNa <em>Fit</em></span>
      <button className="appbar-btn nnf-out" onClick={() => go('chooser')} aria-label="Salir"><Icon name="logout" size={20} /></button>
    </div>
  );
}

function FitHomeScreen({ go }) {
  const s = FIT_SOCIA;
  const tiles = [
    { r: 'fit-rutina', t: 'Rutina', st: 'Personalizada', ic: 'dumbbell' },
    { r: 'fit-nutricion', t: 'Plan', st: 'Nutricional', ic: 'plate' },
    { r: 'fit-medidas', t: 'Medidas', st: 'y Peso', ic: 'ruler' },
    { r: 'fit-pagos', t: 'Pagos', st: 'y Cuotas', ic: 'wallet' },
  ];
  return (
    <div className="screen has-bottomnav">
      <FitHeader go={go} />
      <div className="screen-pad">
        <div className="socia-card">
          <image-slot id="socia-foto" class="socia-foto" shape="circle" placeholder="Foto" src=""></image-slot>
          <div className="socia-tx">
            <span className="socia-name">{s.nombre} {s.apellido}</span>
            <span className="socia-meta">N° de socia: <b className="mono">{s.socio}</b></span>
            <span className="socia-plan">{s.plan}</span>
          </div>
          <StatusPill estado={s.estado} />
        </div>

        <div className="tile-grid">
          {tiles.map(t => (
            <button key={t.r} className="tile" onClick={() => go(t.r)}>
              <span className="tile-tx"><b>{t.t}</b><small>{t.st}</small></span>
              <span className="tile-ic"><Icon name={t.ic} size={24} /></span>
            </button>
          ))}
        </div>

        <button className="tile tile-wide" onClick={() => go('fit-anuncios')}>
          <span className="tile-tx"><b>Anuncios</b><small>y Novedades</small></span>
          <span className="tile-ic"><Icon name="mega" size={24} /></span>
        </button>

        <div className="hiit-strip">
          <Icon name="flame" size={20} />
          <span>Próxima clase HIIT · <b>Hoy 19:00</b> · Sala 2</span>
        </div>
      </div>
    </div>
  );
}

function RutinaScreen({ go }) {
  const [dia, setDia] = React.useState('Lun');
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Rutina personalizada" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        <div className="chips-scroll">
          {RUTINA.dias.map(d => (
            <button key={d} className={`chip ${dia === d ? 'sel' : ''}`} onClick={() => setDia(d)}>{d}</button>
          ))}
        </div>
        {RUTINA.bloques.map(b => (
          <div key={b.t} className="rutina-block">
            <div className="rutina-block-h">
              <span className="rutina-block-t">{b.t}</span>
              <span className="rutina-block-dur"><Icon name="clock" size={15} /> {b.dur}</span>
            </div>
            {b.items.map(it => (
              <div key={it.n} className="rutina-row">
                <span className="rutina-ic"><Icon name={b.t.includes('HIIT') ? 'flame' : 'dumbbell'} size={19} /></span>
                <div className="rutina-tx"><b>{it.n}</b><small>{it.d}</small></div>
              </div>
            ))}
          </div>
        ))}
        <p className="screen-note">Rutina asignada por tu entrenadora · actualizada 12 Jul</p>
      </div>
    </div>
  );
}

function NutricionScreen({ go }) {
  const total = NUTRICION.reduce((a, c) => a + c.kcal, 0);
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Plan nutricional" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        <div className="kcal-hero">
          <span className="kcal-num">{total.toLocaleString('es-AR')}</span>
          <span className="kcal-lbl">kcal diarias · objetivo tonificar</span>
        </div>
        {NUTRICION.map(c => (
          <div key={c.comida} className="meal-card">
            <span className="meal-ic"><Icon name="plate" size={21} /></span>
            <div className="meal-tx">
              <div className="meal-h"><b>{c.comida}</b><span className="meal-kcal">{c.kcal} kcal</span></div>
              <small>{c.detalle}</small>
            </div>
          </div>
        ))}
        <p className="screen-note">Plan diseñado junto a la nutricionista del gym.</p>
      </div>
    </div>
  );
}

function MedidasScreen({ go }) {
  const m = MEDIDAS;
  const min = Math.min(...m.serie.map(x => x.v)), max = Math.max(...m.serie.map(x => x.v));
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Medidas y peso" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        <div className="peso-hero">
          <div className="peso-main">
            <span className="peso-num">{m.pesoActual.toLocaleString('es-AR')} <small>kg</small></span>
            <span className="peso-lbl">Peso actual · Julio</span>
          </div>
          <span className="peso-delta">{m.delta} kg <small>en 6 meses</small></span>
        </div>
        <div className="bars">
          {m.serie.map(x => (
            <div key={x.m} className="bar-col">
              <div className="bar-track">
                <div className={`bar-fill ${x.m === 'Jul' ? 'cur' : ''}`}
                  style={{ height: `${20 + (x.v - min) / (max - min) * 80}%` }} />
              </div>
              <span className="bar-lbl">{x.m}</span>
            </div>
          ))}
        </div>
        <Section>Medidas</Section>
        <div className="receipt">
          {m.medidas.map(x => (
            <div key={x.n} className="receipt-row">
              <span>{x.n}</span>
              <span className="medida-vals"><b>{x.v}</b><em className={x.d.startsWith('-') ? 'ok' : 'warn'}>{x.d}</em></span>
            </div>
          ))}
        </div>
        <p className="screen-note">Registrado en el control del 14 Jul.</p>
      </div>
    </div>
  );
}

function FitPagosScreen({ go }) {
  const s = FIT_SOCIA;
  const [paid, setPaid] = React.useState(false);
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Pagos y cuotas" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        <div className={`estado-banner ${paid || s.estado === 'al_dia' ? 'is-ok' : 'is-bad'}`}>
          <div className="estado-ic"><Icon name="check" size={26} stroke={2.4} /></div>
          <div className="estado-tx">
            <span className="estado-lead">Estás al día</span>
            <span className="estado-sub">Próximo vencimiento · {s.vence}</span>
          </div>
          <StatusPill estado="al_dia" />
        </div>
        <div className="pay-amount">
          <span className="pay-amount-lbl">Cuota mensual · plan {s.plan.split(' —')[0]}</span>
          <span className="pay-amount-num">{money(s.cuota)}</span>
        </div>
        <Button block lg icon="wallet" onClick={() => setPaid(true)}>{paid ? 'Cuota de agosto pagada ✓' : 'Pagar próxima cuota'}</Button>
        <Section>Historial</Section>
        <div className="receipt">
          {PAGOS_HIST.map(p => (
            <div key={p.mes} className="receipt-row">
              <span>{p.mes}</span>
              <span className="medida-vals"><b>{money(p.monto)}</b><em className="ok">Pagada</em></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnunciosScreen({ go }) {
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Anuncios" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        {ANUNCIOS.map(a => (
          <div key={a.t} className="anuncio-card">
            <div className="anuncio-h">
              <span className="anuncio-ic"><Icon name="mega" size={19} /></span>
              <div className="anuncio-ht"><b>{a.t}</b><small>{a.f}</small></div>
            </div>
            <p className="anuncio-b">{a.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AltaSociaScreen({ go }) {
  const [f, setF] = React.useState({ nombre: '', apellido: '', dni: '', plan: '' });
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const [done, setDone] = React.useState(false);
  if (done) {
    return (
      <div className="screen">
        <AppBar title="Alta de socia" onBack={() => go('fit-home')} />
        <div className="screen-pad success-wrap">
          <div className="success-ring"><Icon name="check" size={46} stroke={2.6} /></div>
          <h2 className="success-title">¡Socia registrada!</h2>
          <p className="success-sub">Ya puede empezar a entrenar.</p>
          <div className="receipt">
            <div className="receipt-row"><span>Nombre</span><b>{f.nombre || '—'} {f.apellido}</b></div>
            <div className="receipt-row"><span>DNI</span><b>{f.dni || '—'}</b></div>
            <div className="receipt-row"><span>N° de socia</span><b className="mono">1259</b></div>
            <div className="receipt-row"><span>Plan</span><b>{f.plan || 'A definir'}</b></div>
          </div>
          <Button block lg onClick={() => go('fit-home')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen">
      <AppBar title="Alta de socia" onBack={() => go('fit-home')} />
      <div className="screen-pad">
        <p className="form-intro">Registrá una nueva socia con sus datos personales en segundos.</p>
        <div className="field-2col">
          <Field label="Nombre"><Input value={f.nombre} onChange={set('nombre')} placeholder="María" /></Field>
          <Field label="Apellido"><Input value={f.apellido} onChange={set('apellido')} placeholder="López" /></Field>
        </div>
        <Field label="DNI"><Input value={f.dni} onChange={set('dni')} placeholder="34.221.908" inputMode="numeric" /></Field>
        <Field label="Foto (opcional)">
          <image-slot id="alta-foto" class="promo-upload" shape="rounded" radius="14" placeholder="Arrastrá una foto de la socia" src=""></image-slot>
        </Field>
        <Field label="Plan">
          <SelectRow label="Elegí un plan" value={f.plan}
            options={['HIIT Full — 3x semana', 'HIIT Start — 2x semana', 'Libre — todos los días']}
            onChange={(v) => setF(s => ({ ...s, plan: v }))} />
        </Field>
      </div>
      <div className="screen-foot screen-foot-2">
        <Button variant="ghost" onClick={() => go('fit-home')}>Cancelar</Button>
        <Button block onClick={() => setDone(true)}>Dar de alta</Button>
      </div>
    </div>
  );
}

Object.assign(window, { FitHomeScreen, RutinaScreen, NutricionScreen, MedidasScreen, FitPagosScreen, AnunciosScreen, AltaSociaScreen });
