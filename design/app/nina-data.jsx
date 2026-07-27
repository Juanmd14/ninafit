// nina-data.jsx — Datos + íconos extra para NiNa Fit y NiNa's Click

Object.assign(ICON_PATHS, {
  home:    '<path d="M4.5 11 12 4.5 19.5 11"/><path d="M6.5 9.5V19.5h11V9.5"/>',
  dumbbell:'<rect x="4.5" y="8.5" width="3" height="7" rx="1"/><rect x="16.5" y="8.5" width="3" height="7" rx="1"/><line x1="7.5" y1="12" x2="16.5" y2="12"/><line x1="2.5" y1="10" x2="2.5" y2="14"/><line x1="21.5" y1="10" x2="21.5" y2="14"/>',
  plate:   '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/>',
  ruler:   '<rect x="3" y="9" width="18" height="6.5" rx="1.5"/><line x1="7" y1="9" x2="7" y2="12"/><line x1="11" y1="9" x2="11" y2="12"/><line x1="15" y1="9" x2="15" y2="12"/>',
  mega:    '<path d="M4 10.5v3.5h3l7 4v-15l-7 4z"/><path d="M17.5 9.5a4 4 0 0 1 0 5.5"/>',
  cart:    '<circle cx="9.7" cy="19" r="1.5"/><circle cx="16.8" cy="19" r="1.5"/><path d="M3.5 4.5H6l2.2 10.5h9.3l2-7.5H7.1"/>',
  tag:     '<path d="M12.6 3.5h7.9v7.9L11.9 20a2 2 0 0 1-2.8 0l-5.1-5.1a2 2 0 0 1 0-2.8z"/><circle cx="16" cy="8" r="1.4"/>',
  apple:   '<path d="M12 7.5C9 5 5 7.5 5.8 11.8S9.6 20 12 20s5.4-3.9 6.2-8.2S15 5 12 7.5z"/><path d="M12 7.5c0-2 1-3.2 2.6-3.8"/>',
  shirt:   '<path d="M8 4.5 4.5 7.2l1.8 2.8L8 9v10.5h8V9l1.7 1 1.8-2.8L16 4.5a4 4 0 0 1-8 0z"/>',
  sparkle: '<path d="M12 4.5 13.7 9.8 19 11.5l-5.3 1.7L12 18.5l-1.7-5.3L5 11.5l5.3-1.7z"/>',
  phoneIc: '<rect x="7" y="3.5" width="10" height="17" rx="2.5"/><line x1="10.5" y1="17.5" x2="13.5" y2="17.5"/>',
  flame:   '<path d="M12 3.5c1.2 3.2-4 5-4 9.3a4 4 0 0 0 8 0c0-1.6-.6-2.9-1.5-4.1-.3 1-.8 1.7-1.6 2.2.5-2.6-.1-5.3-.9-7.4z"/>',
  dots:    '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  bag:     '<path d="M5.5 8h13l-1 12h-11z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
});

const FIT_SOCIA = { nombre: 'María', apellido: 'López', socio: '1258', plan: 'HIIT Full — 3x semana', cuota: 25000, estado: 'al_dia', vence: '10 Ago 2026' };

const RUTINA = {
  dias: ['Lun', 'Mié', 'Vie'],
  bloques: [
    { t: 'Calentamiento', dur: "5'", items: [
      { n: 'Movilidad articular', d: "2'" },
      { n: 'Soga liviana', d: "3'" },
    ]},
    { t: 'Circuito HIIT · 4 rondas', dur: "24'", items: [
      { n: 'Burpees', d: '40" trabajo · 20" pausa' },
      { n: 'Sentadillas con salto', d: '40" trabajo · 20" pausa' },
      { n: 'Mountain climbers', d: '40" trabajo · 20" pausa' },
      { n: 'Plancha con toque de hombro', d: '40" trabajo · 20" pausa' },
    ]},
    { t: 'Vuelta a la calma', dur: "6'", items: [
      { n: 'Estiramiento de cadena posterior', d: "3'" },
      { n: 'Respiración guiada', d: "3'" },
    ]},
  ],
};

const NUTRICION = [
  { comida: 'Desayuno', kcal: 380, detalle: 'Yogur natural + avena + banana + semillas' },
  { comida: 'Almuerzo', kcal: 620, detalle: 'Pollo grillado, quinoa y vegetales asados' },
  { comida: 'Merienda', kcal: 290, detalle: 'Tostadas integrales con palta y huevo' },
  { comida: 'Cena', kcal: 540, detalle: 'Pescado al horno con puré de calabaza' },
];

const MEDIDAS = {
  pesoActual: 64.2, delta: -3.6,
  serie: [
    { m: 'Feb', v: 67.8 }, { m: 'Mar', v: 67.1 }, { m: 'Abr', v: 66.2 },
    { m: 'May', v: 65.4 }, { m: 'Jun', v: 64.8 }, { m: 'Jul', v: 64.2 },
  ],
  medidas: [
    { n: 'Cintura', v: '72 cm', d: '-4 cm' },
    { n: 'Cadera', v: '98 cm', d: '-2 cm' },
    { n: 'Brazo', v: '27 cm', d: '+1 cm' },
  ],
};

const PAGOS_HIST = [
  { mes: 'Julio 2026', monto: 25000, estado: 'al_dia' },
  { mes: 'Junio 2026', monto: 25000, estado: 'al_dia' },
  { mes: 'Mayo 2026', monto: 22000, estado: 'al_dia' },
];

const ANUNCIOS = [
  { f: 'Hoy · 9:40', t: 'Nueva clase de HIIT 19 hs', b: 'Sumamos un turno noche los martes y jueves. Cupos limitados, reservá en recepción.' },
  { f: 'Ayer', t: 'Feriado 20 de julio', b: 'El gimnasio permanecerá cerrado. Las clases se recuperan durante la semana.' },
  { f: '14 Jul', t: 'Control de medidas', b: 'Esta semana tomamos medidas y peso a todas las socias del plan HIIT Full.' },
];

const CATEGORIAS = [
  { n: 'Alimentos', ic: 'apple' }, { n: 'Indumentaria', ic: 'shirt' },
  { n: 'Belleza', ic: 'sparkle' }, { n: 'Hogar', ic: 'home' },
  { n: 'Tecnología', ic: 'phoneIc' }, { n: 'Deportes', ic: 'dumbbell' },
  { n: 'Salud', ic: 'heart' }, { n: 'Más', ic: 'dots' },
];

const COMERCIOS = [
  { id: 'c1', n: 'Dulce Tentación', rubro: 'Alimentos', img: 'shop-dulce', oferta: '20% en tortas por encargo', productos: [
    { n: 'Torta red velvet', p: 18500, img: 'prod-torta' },
    { n: 'Box de brownies x6', p: 9800, img: 'prod-brownies' },
  ]},
  { id: 'c2', n: 'Fit Store', rubro: 'Deportes', img: 'shop-fit', oferta: '2x1 en tops deportivos', productos: [
    { n: 'Top deportivo seamless', p: 24900, img: 'prod-top' },
    { n: 'Calza tiro alto', p: 32000, img: 'prod-calza' },
  ]},
  { id: 'c3', n: 'Glow Belleza', rubro: 'Belleza', img: 'shop-glow', oferta: 'Envío gratis en skincare', productos: [
    { n: 'Sérum de vitamina C', p: 15600, img: 'prod-serum' },
    { n: 'Kit limpieza facial', p: 21300, img: 'prod-kit' },
  ]},
  { id: 'c4', n: 'Bazar Norte', rubro: 'Hogar', img: 'shop-bazar', oferta: '15% pagando en efectivo', productos: [
    { n: 'Set de bowls cerámica', p: 12400, img: 'prod-bowls' },
    { n: 'Difusor aromático', p: 8900, img: 'prod-difusor' },
  ]},
];

function money(n) { return '$' + n.toLocaleString('es-AR'); }

Object.assign(window, { FIT_SOCIA, RUTINA, NUTRICION, MEDIDAS, PAGOS_HIST, ANUNCIOS, CATEGORIAS, COMERCIOS, money });
