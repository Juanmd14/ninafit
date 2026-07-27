// screens-auth.jsx — Login
const { useState: useStateAuth } = React;

function LoginScreen({ go }) {
  const [email, setEmail] = useStateAuth('');
  const [pass, setPass] = useStateAuth('');

  return (
    <div className="screen login-screen">
      <div className="login-hero">
        <image-slot id="login-hero" class="login-hero-img" shape="rounded" radius="0"
          placeholder="Foto de comunidad (arrastrá una imagen)"
          src="">
        </image-slot>
        <div className="login-hero-veil" />
        <div className="login-brand">
          <span className="brand-mark brand-mark-lg">S</span>
          <span className="brand-word">Solidarity</span>
        </div>
        <p className="login-tag">Una cadena de vecinos que se cuidan.</p>
      </div>

      <div className="login-body">
        <h1 className="login-title">Ingresá a tu red</h1>
        <p className="login-sub">Cada socio es un eslabón. Bienvenido de nuevo.</p>

        <Field label="Email o DNI">
          <Input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vos@mail.com" inputMode="email" />
        </Field>
        <Field label="Contraseña">
          <Input value={pass} onChange={e => setPass(e.target.value)}
            type="password" placeholder="••••••••" />
        </Field>

        <Button block lg onClick={() => go('socio-carnet')}>Ingresar</Button>
        <button className="login-link" onClick={() => {}}>¿Olvidaste tu contraseña?</button>

        <div className="login-divider"><span>o explorá la demo por rol</span></div>

        <div className="role-cards">
          <button className="role-card" onClick={() => go('socio-carnet')}>
            <span className="role-ic"><Icon name="card" size={22} /></span>
            <span className="role-tx"><b>Vecino</b><small>Carnet, pago y promos</small></span>
            <Icon name="chevR" size={18} className="role-arrow" />
          </button>
          <button className="role-card" onClick={() => go('comercio-panel')}>
            <span className="role-ic"><Icon name="store" size={22} /></span>
            <span className="role-tx"><b>Comercio</b><small>Promos y verificar socios</small></span>
            <Icon name="chevR" size={18} className="role-arrow" />
          </button>
          <button className="role-card" onClick={() => go('admin-dashboard')}>
            <span className="role-ic"><Icon name="users" size={22} /></span>
            <span className="role-tx"><b>Administración</b><small>Padrón y recaudación</small></span>
            <Icon name="chevR" size={18} className="role-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
