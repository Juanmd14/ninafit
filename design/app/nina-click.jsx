// nina-click.jsx — NiNa's Click: home, comercio/oferta, publicar oferta, checkout

function ClickHomeScreen({ go }) {
  const [q, setQ] = React.useState('');
  return (
    <div className="screen has-bottomnav">
      <div className="nnf-header">
        <img className="logo-img nnf-logo" src="assets/simbolo.jpg" alt="" />
        <span className="nnf-word">NiNa's <em className="click-em">Click</em></span>
        <button className="appbar-btn nnf-out" onClick={() => go('chooser')} aria-label="Salir"><Icon name="logout" size={20} /></button>
      </div>
      <div className="screen-pad">
        <div className="searchbar">
          <Icon name="search" size={19} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="¿Qué estás buscando?" />
        </div>

        <div className="ofertas-banner">
          <div className="ofertas-tx">
            <b>OFERTAS EXCLUSIVAS</b>
            <small>TODOS LOS DÍAS</small>
          </div>
          <span className="ofertas-ic"><Icon name="tag" size={30} /></span>
        </div>

        <Section>Categorías</Section>
        <div className="cat-grid">
          {CATEGORIAS.map(c => (
            <button key={c.n} className="cat" onClick={() => {}}>
              <span className="cat-ic"><Icon name={c.ic} size={22} /></span>
              <span className="cat-n">{c.n}</span>
            </button>
          ))}
        </div>

        <Section action={<span className="section-count">Ver más</span>}>Comercios destacados</Section>
        <div className="shops-row">
          {COMERCIOS.map(c => (
            <button key={c.id} className="shop-card" onClick={() => go('click-shop', { shop: c })}>
              <image-slot id={c.img} class="shop-img" shape="rounded" radius="12" placeholder={c.n} src=""></image-slot>
              <span className="shop-n">{c.n}</span>
              <span className="shop-o">{c.oferta}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClickShopScreen({ go, shop }) {
  const c = shop || COMERCIOS[0];
  return (
    <div className="screen has-bottomnav">
      <AppBar title={c.rubro} onBack={() => go('click-home')} />
      <div className="screen-pad">
        <div className="shop-head">
          <image-slot id={c.img + '-hero'} class="shop-hero" shape="rounded" radius="16" placeholder={'Foto de ' + c.n} src=""></image-slot>
          <div className="shop-head-tx">
            <b>{c.n}</b>
            <span className="shop-oferta-pill"><Icon name="tag" size={14} /> {c.oferta}</span>
          </div>
        </div>
        <Section>Productos</Section>
        <div className="prod-grid">
          {c.productos.map(p => (
            <div key={p.n} className="prod-card">
              <image-slot id={p.img} class="prod-img" shape="rounded" radius="12" placeholder={p.n} src=""></image-slot>
              <span className="prod-n">{p.n}</span>
              <span className="prod-p">{money(p.p)}</span>
              <Button block onClick={() => go('click-checkout', { prod: p, shop: c })}>Comprar</Button>
            </div>
          ))}
        </div>
        <div className="info-row"><Icon name="store" size={19} /><span>Retiro en local o envío a domicilio</span></div>
      </div>
    </div>
  );
}

function ClickCheckoutScreen({ go, prod, shop }) {
  const p = prod || COMERCIOS[0].productos[0];
  const c = shop || COMERCIOS[0];
  const [step, setStep] = React.useState(0); // 0 pagar, 1 listo
  const envio = 1800;
  const pasos = ['Buscá', 'Comprá', 'Pagá', 'Recibí'];
  const cur = step === 0 ? 2 : 3;
  return (
    <div className="screen">
      <AppBar title="Tu compra" onBack={() => go('click-shop', { shop: c })} />
      <div className="screen-pad">
        <div className="stepper">
          {pasos.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className={`step-line ${i <= cur ? 'on' : ''}`} />}
              <span className={`step ${i < cur ? 'done' : i === cur ? 'cur' : ''}`}>
                <span className="step-dot">{i < cur ? <Icon name="check" size={13} stroke={2.6} /> : i + 1}</span>
                {s}
              </span>
            </React.Fragment>
          ))}
        </div>

        {step === 0 ? (
          <React.Fragment>
            <div className="buy-row">
              <image-slot id={p.img + '-mini'} class="buy-img" shape="rounded" radius="10" placeholder="Foto" src=""></image-slot>
              <div className="buy-tx"><b>{p.n}</b><small>{c.n}</small></div>
              <b className="buy-p">{money(p.p)}</b>
            </div>
            <div className="receipt">
              <div className="receipt-row"><span>Producto</span><b>{money(p.p)}</b></div>
              <div className="receipt-row"><span>Envío a domicilio</span><b>{money(envio)}</b></div>
              <div className="receipt-row"><span>Total</span><b className="total-p">{money(p.p + envio)}</b></div>
            </div>
            <Section>Pagá seguro</Section>
            <div className="method-grid">
              <button className="method sel"><Icon name="card" size={22} /><span>Tarjeta</span></button>
              <button className="method"><Icon name="wallet" size={22} /><span>Billetera</span></button>
              <button className="method"><Icon name="link" size={22} /><span>Transferencia</span></button>
            </div>
          </React.Fragment>
        ) : (
          <div className="success-wrap">
            <div className="success-ring"><Icon name="check" size={46} stroke={2.6} /></div>
            <h2 className="success-title">¡Pedido confirmado!</h2>
            <p className="success-sub">{c.n} prepara tu pedido. Lo recibís en tu casa.</p>
            <div className="receipt">
              <div className="receipt-row"><span>Pedido</span><b className="mono">#NC-2214</b></div>
              <div className="receipt-row"><span>Total pagado</span><b>{money(p.p + envio)}</b></div>
              <div className="receipt-row"><span>Entrega estimada</span><b>Mañana · 14 a 18 hs</b></div>
            </div>
            <Button block lg onClick={() => go('click-home')}>Seguir comprando</Button>
          </div>
        )}
      </div>
      {step === 0 && (
        <div className="screen-foot">
          <Button block lg onClick={() => setStep(1)}>Pagar {money(p.p + envio)}</Button>
        </div>
      )}
    </div>
  );
}

function ClickPublicarScreen({ go }) {
  const [f, setF] = React.useState({ t: '', d: '', p: '', cat: '', vig: '' });
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  return (
    <div className="screen">
      <AppBar title="Publicá tu oferta" onBack={() => go('click-home')} />
      <div className="screen-pad">
        <div className="pay-help"><Icon name="store" size={18} /><span>Sumá tu comercio a NiNa's Click y llegá a más clientes.</span></div>
        <Field label="Título de la oferta"><Input value={f.t} onChange={set('t')} placeholder="Ej: 2x1 en tops deportivos" /></Field>
        <Field label="Descripción"><Textarea value={f.d} onChange={set('d')} rows={3} placeholder="Condiciones, stock, horarios…" /></Field>
        <Field label="Precio"><Input value={f.p} onChange={set('p')} placeholder="$ 0" inputMode="numeric" /></Field>
        <Field label="Fotos">
          <image-slot id="oferta-foto" class="promo-upload" shape="rounded" radius="14" placeholder="Arrastrá fotos del producto" src=""></image-slot>
        </Field>
        <Field label="Categoría">
          <SelectRow label="Elegí una categoría" value={f.cat}
            options={CATEGORIAS.filter(c => c.n !== 'Más').map(c => c.n)}
            onChange={(v) => setF(s => ({ ...s, cat: v }))} />
        </Field>
        <Field label="Vigencia">
          <SelectRow label="¿Hasta cuándo?" value={f.vig}
            options={['Sin vencimiento', 'Fin de mes', '30 días']}
            onChange={(v) => setF(s => ({ ...s, vig: v }))} />
        </Field>
      </div>
      <div className="screen-foot screen-foot-2">
        <Button variant="ghost" onClick={() => go('click-home')}>Cancelar</Button>
        <Button block onClick={() => go('click-home')}>Publicar</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ClickHomeScreen, ClickShopScreen, ClickCheckoutScreen, ClickPublicarScreen });
