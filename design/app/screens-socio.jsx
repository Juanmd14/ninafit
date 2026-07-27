// screens-socio.jsx — Carnet digital, Pago de cuota, Promos

/* ── Carnet digital ── */
function CarnetScreen({ go, estado }) {
  const s = CURRENT_SOCIO;
  const alDia = estado === 'al_dia';
  const qrValue = `https://solidarity.org/v/${s.eslabon}`;
  return (
    <div className="screen has-bottomnav">
      <AppBar title="Mi carnet" action={
        <button className="appbar-btn" onClick={() => go('login')} aria-label="Salir"><Icon name="logout" size={20} /></button>
      } />
      <div className="screen-pad">
        <div className={`carnet ${alDia ? 'is-ok' : 'is-bad'}`}>
          <div className="carnet-top">
            <span className="carnet-brand"><span className="brand-mark brand-mark-sm">S</span>Solidarity</span>
            <span className="carnet-chip">Socio vecino</span>
          </div>
          <div className="carnet-id">
            <image-slot id="socio-avatar" class="carnet-avatar" shape="circle"
              placeholder="Foto" src=""></image-slot>
            <div>
              <div className="carnet-name">{s.nombre} {s.apellido}</div>
              <div className="carnet-since">Eslabón desde {s.desde}</div>
            </div>
          </div>
          <div className="carnet-eslabon">
            <span className="carnet-eslabon-lbl">N° de eslabón</span>
            <span className="carnet-eslabon-num mono">{s.eslabon}</span>
          </div>
          <div className="carnet-qr-wrap">
            <QR value={qrValue} size={172} />
            <p className="carnet-qr-hint">Mostrá este QR en el comercio adherido</p>
          </div>
        </div>

        {/* Estado de cuota — legible de un vistazo */}
        <div className={`estado-banner ${alDia ? 'is-ok' : 'is-bad'}`}>
          <div className="estado-ic">
            <Icon name={alDia ? 'check' : 'clock'} size={26} stroke={2.4} />
          </div>
          <div className="estado-tx">
            <span className="estado-lead">{alDia ? 'Estás al día' : 'Tu cuota venció'}</span>
            <span className="estado-sub">
              {alDia ? `Próximo vencimiento · ${s.vence}` : `Cuota de ${money(s.cuota)} pendiente`}
            </span>
          </div>
          <StatusPill estado={estado} />
        </div>

        <Button block lg variant={alDia ? 'ghost' : 'primary'} icon="wallet"
          onClick={() => go('socio-pago')}>
          {alDia ? 'Pagar próxima cuota' : `Pagar cuota · ${money(s.cuota)}`}
        </Button>

        <button className="row-link" onClick={() => go('socio-promos')}>
          <span className="row-link-ic"><Icon name="gift" size={20} /></span>
          <span className="row-link-tx"><b>Ver beneficios</b><small>{PROMOS.length} comercios adheridos</small></span>
          <Icon name="chevR" size={18} />
        </button>
      </div>
    </div>
  );
}

/* ── Pago de cuota ── */
function PagoScreen({ go }) {
  const s = CURRENT_SOCIO;
  const [method, setMethod] = React.useState('tarjeta');
  const [paid, setPaid] = React.useState(false);

  if (paid) {
    return (
      <div className="screen">
        <AppBar title="Pago" onBack={() => go('socio-carnet')} />
        <div className="screen-pad success-wrap">
          <div className="success-ring"><Icon name="check" size={46} stroke={2.6} /></div>
          <h2 className="success-title">¡Cuota pagada!</h2>
          <p className="success-sub">Ya estás al día. Gracias por sostener la cadena.</p>
          <div className="receipt">
            <div className="receipt-row"><span>Período</span><b>Junio 2026</b></div>
            <div className="receipt-row"><span>Monto</span><b>{money(s.cuota)}</b></div>
            <div className="receipt-row"><span>Eslabón</span><b className="mono">{s.eslabon}</b></div>
            <div className="receipt-row"><span>Próximo vencimiento</span><b>31 Jul 2026</b></div>
          </div>
          <Button block lg onClick={() => go('socio-carnet')}>Volver al carnet</Button>
        </div>
      </div>
    );
  }

  const methods = [
    { k: 'tarjeta', label: 'Tarjeta', ic: 'card' },
    { k: 'mp', label: 'Mercado Pago', ic: 'wallet' },
    { k: 'transfer', label: 'Transferencia', ic: 'link' },
  ];

  return (
    <div className="screen">
      <AppBar title="Pagar cuota" onBack={() => go('socio-carnet')} />
      <div className="screen-pad">
        <div className="pay-amount">
          <span className="pay-amount-lbl">Cuota mensual · Junio 2026</span>
          <span className="pay-amount-num">{money(s.cuota)}</span>
          <span className="pay-amount-meta">{s.nombre} {s.apellido} · eslabón <b className="mono">{s.eslabon}</b></span>
        </div>

        <div className="pay-help">
          <Icon name="heart" size={18} />
          <span>Tu cuota financia la ayuda a vecinos que lo necesitan.</span>
        </div>

        <Section>Medio de pago</Section>
        <div className="method-grid">
          {methods.map(m => (
            <button key={m.k} className={`method ${method === m.k ? 'sel' : ''}`}
              onClick={() => setMethod(m.k)}>
              <Icon name={m.ic} size={22} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'tarjeta' && (
          <div className="pay-card-fields">
            <Field label="Número de tarjeta"><Input placeholder="•••• •••• •••• ••••" inputMode="numeric" /></Field>
            <div className="field-2col">
              <Field label="Vencimiento"><Input placeholder="MM/AA" inputMode="numeric" /></Field>
              <Field label="CVV"><Input placeholder="•••" inputMode="numeric" /></Field>
            </div>
            <Field label="Titular"><Input placeholder="Nombre y apellido" /></Field>
          </div>
        )}
        {method === 'mp' && <div className="pay-note">Te vamos a redirigir a Mercado Pago para completar el pago.</div>}
        {method === 'transfer' && (
          <div className="pay-note">
            CBU <b className="mono">000 0000 0000 0000 0000 00</b><br/>Alias <b>solidarity.cuota</b>
          </div>
        )}
      </div>
      <div className="screen-foot">
        <Button block lg onClick={() => setPaid(true)}>Pagar {money(s.cuota)}</Button>
      </div>
    </div>
  );
}

/* ── Listado de promos / comercios ── */
function PromosScreen({ go }) {
  const [rubro, setRubro] = React.useState('Todos');
  const [q, setQ] = React.useState('');
  const list = PROMOS.filter(p =>
    (rubro === 'Todos' || p.rubro === rubro) &&
    (q === '' || (p.comercio + p.promo).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="screen has-bottomnav">
      <AppBar title="Beneficios" />
      <div className="screen-pad">
        <div className="searchbar">
          <Icon name="search" size={19} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar comercio o promo" />
        </div>
        <div className="chips-scroll">
          {RUBROS.map(r => (
            <button key={r} className={`chip ${rubro === r ? 'sel' : ''}`} onClick={() => setRubro(r)}>{r}</button>
          ))}
        </div>

        <div className="promo-list">
          {list.map(p => (
            <button key={p.id} className="promo-card" onClick={() => go('socio-promo', { promo: p })}>
              <Monogram text={p.inicial} tint={RUBRO_TINT[p.rubro]} size={46} />
              <div className="promo-body">
                <div className="promo-shop">{p.comercio}</div>
                <div className="promo-deal">{p.promo}</div>
                <span className="promo-rubro" style={{ color: RUBRO_TINT[p.rubro] }}>{p.rubro}</span>
              </div>
              <Icon name="chevR" size={18} className="promo-arrow" />
            </button>
          ))}
          {list.length === 0 && <div className="empty">No hay promos para ese filtro.</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Detalle de promo ── */
function PromoDetailScreen({ go, promo }) {
  const p = promo || PROMOS[0];
  return (
    <div className="screen">
      <AppBar title={p.rubro} onBack={() => go('socio-promos')} />
      <div className="screen-pad">
        <div className="promo-detail-head" style={{ background: RUBRO_TINT[p.rubro] + '14' }}>
          <Monogram text={p.inicial} tint={RUBRO_TINT[p.rubro]} size={64} />
          <div className="promo-detail-deal" style={{ color: RUBRO_TINT[p.rubro] }}>{p.promo}</div>
          <div className="promo-detail-shop">{p.comercio}</div>
        </div>
        <p className="promo-detail-text">{p.detalle}</p>
        <div className="info-row"><Icon name="store" size={19} /><span>Av. San Martín 1240</span></div>
        <div className="info-row"><Icon name="clock" size={19} /><span>Lun a Sáb · 9 a 20 hs</span></div>
        <div className="promo-cta">
          <Button block lg icon="qr" onClick={() => go('socio-carnet')}>Mostrar mi carnet</Button>
          <p className="promo-cta-hint">Presentá tu QR para acceder al beneficio</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CarnetScreen, PagoScreen, PromosScreen, PromoDetailScreen });
