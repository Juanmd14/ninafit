// screens-comercio.jsx — Panel, Nueva promo, Escaneo, Verificación

/* ── Panel del comercio (mis promos) ── */
function ComercioPanelScreen({ go }) {
  const c = CURRENT_COMERCIO;
  const mias = PROMOS.filter(p => p.comercio === c.nombre);
  return (
    <div className="screen has-bottomnav">
      <AppBar title={c.nombre} action={
        <button className="appbar-btn" onClick={() => go('login')} aria-label="Salir"><Icon name="logout" size={20} /></button>
      } />
      <div className="screen-pad">
        <button className="verify-cta" onClick={() => go('comercio-scan')}>
          <span className="verify-cta-ic"><Icon name="scan" size={30} stroke={2} /></span>
          <span className="verify-cta-tx">
            <b>Verificar socio</b>
            <small>Escaneá el QR para confirmar si está al día</small>
          </span>
          <Icon name="chevR" size={20} />
        </button>

        <Section action={
          <button className="section-add" onClick={() => go('comercio-promo')}><Icon name="plus" size={18} />Nueva</button>
        }>Mis promociones</Section>

        <div className="promo-list">
          {mias.map(p => (
            <div key={p.id} className="promo-card promo-card-own">
              <Monogram text={c.inicial} tint={RUBRO_TINT[p.rubro]} size={46} />
              <div className="promo-body">
                <div className="promo-shop">{p.promo}</div>
                <div className="promo-deal-sm">{p.detalle}</div>
                <span className="promo-rubro" style={{ color: RUBRO_TINT[p.rubro] }}>{p.rubro} · Activa</span>
              </div>
            </div>
          ))}
          <button className="promo-add-card" onClick={() => go('comercio-promo')}>
            <Icon name="plus" size={20} /> Subir una nueva promo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Subir / editar promo ── */
function NuevaPromoScreen({ go }) {
  const [titulo, setTitulo] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [rubro, setRubro] = React.useState('');
  const [vig, setVig] = React.useState('');
  return (
    <div className="screen">
      <AppBar title="Nueva promo" onBack={() => go('comercio-panel')} />
      <div className="screen-pad">
        <Field label="Título de la promo">
          <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: 15% en la compra total" />
        </Field>
        <Field label="Descripción" hint="Condiciones, horarios y restricciones.">
          <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
            placeholder="Contale al vecino cómo aprovechar el beneficio…" />
        </Field>
        <Field label="Imagen (opcional)">
          <image-slot id="promo-img" class="promo-upload" shape="rounded" radius="14"
            placeholder="Arrastrá una foto del producto o local" src=""></image-slot>
        </Field>
        <Field label="Rubro">
          <SelectRow label="Elegí un rubro" value={rubro} options={RUBROS.filter(r => r !== 'Todos')} onChange={setRubro} />
        </Field>
        <Field label="Vigencia">
          <SelectRow label="¿Hasta cuándo?" value={vig} options={['Sin vencimiento', 'Fin de mes', '30 días', '90 días']} onChange={setVig} />
        </Field>
      </div>
      <div className="screen-foot screen-foot-2">
        <Button variant="ghost" onClick={() => go('comercio-panel')}>Cancelar</Button>
        <Button block onClick={() => go('comercio-panel')}>Guardar promo</Button>
      </div>
    </div>
  );
}

/* ── Escaneo de QR (cámara simulada) ── */
function ScanScreen({ go }) {
  const alDiaSocio = { nombre: 'Marina Quiroga', eslabon: '00428' };
  const vencSocio = { nombre: 'Lucía Fernández', eslabon: '00501' };
  return (
    <div className="screen scan-screen has-bottomnav">
      <div className="scan-cam">
        <button className="scan-back" onClick={() => go('comercio-panel')} aria-label="Volver"><Icon name="back" size={22} /></button>
        <div className="scan-reticle">
          <span className="r-c r-tl" /><span className="r-c r-tr" /><span className="r-c r-bl" /><span className="r-c r-br" />
          <div className="scan-line" />
        </div>
        <p className="scan-help">Apuntá la cámara al QR del carnet del socio</p>
        <div className="scan-demo">
          <span className="scan-demo-lbl">Demo · simular lectura</span>
          <div className="scan-demo-btns">
            <button className="scan-demo-ok" onClick={() => go('comercio-result', { result: 'al_dia', socio: alDiaSocio })}>
              <Icon name="check" size={18} /> Socio al día
            </button>
            <button className="scan-demo-bad" onClick={() => go('comercio-result', { result: 'vencida', socio: vencSocio })}>
              <Icon name="close" size={18} /> Socio vencido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Resultado de verificación (al día / vencida) ── */
function VerificacionScreen({ go, result, socio }) {
  const alDia = result === 'al_dia';
  const s = socio || { nombre: 'Marina Quiroga', eslabon: '00428' };
  return (
    <div className={`screen verif-screen ${alDia ? 'is-ok' : 'is-bad'}`}>
      <div className="verif-inner">
        <div className="verif-ic">
          <Icon name={alDia ? 'check' : 'close'} size={88} stroke={2.8} />
        </div>
        <div className="verif-head">{alDia ? 'SOCIO AL DÍA' : 'CUOTA VENCIDA'}</div>
        <div className="verif-sub">{alDia ? 'Beneficio habilitado' : 'No corresponde el beneficio'}</div>

        <div className="verif-card">
          <div className="verif-name">{s.nombre}</div>
          <div className="verif-eslabon">Eslabón <b className="mono">{s.eslabon}</b></div>
        </div>

        <p className="verif-note"><Icon name="shield" size={16} /> Verificación de identidad — no es un cobro</p>
      </div>
      <div className="verif-foot">
        <Button block lg variant="oncolor" icon="scan" onClick={() => go('comercio-scan')}>Verificar otro socio</Button>
        <button className="verif-link" onClick={() => go('comercio-panel')}>Volver al panel</button>
      </div>
    </div>
  );
}

Object.assign(window, { ComercioPanelScreen, NuevaPromoScreen, ScanScreen, VerificacionScreen });
