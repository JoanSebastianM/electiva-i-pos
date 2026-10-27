import pptxgen from 'pptxgenjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs', 'presentacion', 'Arquitectura-Embriagados.pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Joan Sebastian Mosquera Solis';
pptx.company = 'Proyecto universitario';
pptx.subject = 'Arquitectura por capas - EMBRIAGADOS CRUD';
pptx.title = 'Arquitectura por capas - EMBRIAGADOS CRUD';
pptx.lang = 'es-ES';
pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'es-ES' };

const C = {
  bg: 'F8FAFC',
  dark: '0F172A',
  ink: '0F172A',
  body: '334155',
  muted: '64748B',
  slate: '94A3B8',
  line: 'E2E8F0',
  white: 'FFFFFF',
  blue: '2563EB',
  purple: '7C3AED',
  cyan: '0891B2',
  green: '059669',
  amber: 'D97706',
  codeBg: '0F172A',
  codeLine: '1E293B',
  codeText: 'E2E8F0'
};

let slideNumber = 0;

function newSlide({ dark = false } = {}) {
  const slide = pptx.addSlide();
  slide.background = { color: dark ? C.dark : C.bg };
  return slide;
}

function footer(slide, dark = false) {
  slideNumber += 1;
  slide.addText('EMBRIAGADOS CRUD · Arquitectura por capas', {
    x: 0.6, y: 7.08, w: 9, h: 0.25,
    fontSize: 9, color: dark ? '64748B' : C.slate, fontFace: 'Arial'
  });
  slide.addText(String(slideNumber).padStart(2, '0'), {
    x: 12.1, y: 7.08, w: 0.6, h: 0.25,
    fontSize: 9, color: dark ? '64748B' : C.slate, fontFace: 'Arial', align: 'right'
  });
}

function header(slide, kicker, title, accent = C.blue, dark = false) {
  slide.addText(kicker.toUpperCase(), {
    x: 0.6, y: 0.4, w: 12.1, h: 0.3,
    fontSize: 11, bold: true, color: accent, charSpacing: 2, fontFace: 'Arial'
  });
  slide.addText(title, {
    x: 0.6, y: 0.72, w: 12.1, h: 0.7,
    fontSize: 30, bold: true, color: dark ? C.white : C.ink, fontFace: 'Arial'
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 1.48, w: 1.2, h: 0.06,
    fill: { color: accent }, line: { color: accent }
  });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill ?? C.white },
    line: { color: opts.line ?? C.line, width: 1 }
  });
  if (opts.accent) {
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.08, h,
      fill: { color: opts.accent }, line: { color: opts.accent }
    });
  }
}

function bullets(slide, items, opts = {}) {
  slide.addText(
    items.map((text) => ({
      text,
      options: { bullet: true, breakLine: true }
    })),
    {
      x: opts.x ?? 0.9,
      y: opts.y ?? 1.9,
      w: opts.w ?? 5.4,
      h: opts.h ?? 4.4,
      fontSize: opts.fontSize ?? 14,
      color: opts.color ?? C.body,
      fontFace: 'Arial',
      paraSpaceAfter: opts.paraSpaceAfter ?? 8,
      valign: 'top'
    }
  );
}

function codeBox(slide, code, opts = {}) {
  const x = opts.x ?? 7.1;
  const y = opts.y ?? 1.8;
  const w = opts.w ?? 5.6;
  const h = opts.h ?? 4.4;
  card(slide, x, y, w, h, { fill: C.codeBg, line: C.codeLine, accent: opts.accent });
  slide.addText(code, {
    x: x + 0.25,
    y: y + 0.18,
    w: w - 0.5,
    h: h - 0.36,
    fontSize: opts.fontSize ?? 11,
    color: C.codeText,
    fontFace: 'Consolas',
    valign: 'top',
    breakLine: false
  });
}

function layerColumn(slide, x, color, capa, name, items) {
  card(slide, x, 1.72, 2.8, 4.5, { accent: color });
  slide.addShape(pptx.ShapeType.rect, {
    x, y: 1.72, w: 2.8, h: 0.74,
    fill: { color }, line: { color }
  });
  slide.addText(`CAPA ${capa}`, {
    x: x + 0.16, y: 1.79, w: 2.5, h: 0.2,
    fontSize: 9.5, bold: true, color: C.white, fontFace: 'Arial'
  });
  slide.addText(name, {
    x: x + 0.16, y: 1.99, w: 2.5, h: 0.38,
    fontSize: 12.5, bold: true, color: C.white, fontFace: 'Arial'
  });
  slide.addText(
    items.map((text) => ({ text, options: { bullet: true, breakLine: true } })),
    {
      x: x + 0.18, y: 2.62, w: 2.44, h: 3.4,
      fontSize: 10, color: C.body, fontFace: 'Arial',
      paraSpaceAfter: 4, valign: 'top'
    }
  );
}

// ---------------------------------------------------------------------------
// 1. Portada
// ---------------------------------------------------------------------------
{
  const s = newSlide({ dark: true });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.blue }, line: { color: C.blue }
  });
  s.addText('PROYECTO UNIVERSITARIO', {
    x: 0.9, y: 1.25, w: 11, h: 0.3,
    fontSize: 13, bold: true, color: '60A5FA', charSpacing: 3, fontFace: 'Arial'
  });
  s.addText('EMBRIAGADOS CRUD', {
    x: 0.85, y: 1.65, w: 11.5, h: 0.9,
    fontSize: 50, bold: true, color: C.white, fontFace: 'Arial'
  });
  s.addText('Arquitectura por capas', {
    x: 0.9, y: 2.55, w: 11, h: 0.6,
    fontSize: 28, color: '93C5FD', fontFace: 'Arial'
  });
  s.addText('Presentación, aplicación, acceso a datos y persistencia en un sistema CRUD completo.', {
    x: 0.9, y: 3.25, w: 10.5, h: 0.6,
    fontSize: 16, color: 'CBD5E1', fontFace: 'Arial'
  });

  const chips = [
    { text: 'React + Vite', color: '2563EB' },
    { text: 'Node.js + Express', color: '7C3AED' },
    { text: 'Patrón Repository', color: '0891B2' },
    { text: 'SQLite', color: '059669' }
  ];
  let cx = 0.9;
  for (const chip of chips) {
    s.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: 4.15, w: 2.55, h: 0.5, rectRadius: 0.1,
      fill: { color: chip.color }, line: { color: chip.color }
    });
    s.addText(chip.text, {
      x: cx, y: 4.15, w: 2.55, h: 0.5,
      fontSize: 12, bold: true, color: C.white, align: 'center', fontFace: 'Arial'
    });
    cx += 2.75;
  }

  s.addText('Joan Sebastian Mosquera Solis', {
    x: 0.9, y: 6.05, w: 8, h: 0.3,
    fontSize: 14, bold: true, color: C.white, fontFace: 'Arial'
  });
  s.addText('Ingeniería de Software · 2026', {
    x: 0.9, y: 6.35, w: 8, h: 0.3,
    fontSize: 12, color: '94A3B8', fontFace: 'Arial'
  });
  s.addNotes('Buenos días. Hoy presento EMBRIAGADOS CRUD, un sistema web universitario con arquitectura por capas. El objetivo es mostrar cómo el código está organizado en presentación, aplicación, acceso a datos y persistencia, y cómo esa organización se refleja en una venta real con control de inventario.');
  footer(s, true);
}

// ---------------------------------------------------------------------------
// 2. Problema y objetivo
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Contexto', 'Qué resolvemos y cómo lo organizamos', C.blue);

  const cards = [
    {
      x: 0.6, color: C.amber, title: 'El punto de partida',
      text: 'Las rutas del backend concentraban validaciones, reglas de negocio y SQL. Eso funciona al inicio, pero dificulta el mantenimiento y las pruebas.'
    },
    {
      x: 4.55, color: C.blue, title: 'La decisión',
      text: 'Separar el sistema en cuatro capas: presentación, aplicación, acceso a datos y persistencia. Cada capa tiene una responsabilidad clara.'
    },
    {
      x: 8.5, color: C.green, title: 'El resultado',
      text: 'Rutas delgadas, servicios con reglas de negocio, repositorios con todo el SQL y una base SQLite consistente y transaccional.'
    }
  ];

  for (const item of cards) {
    card(s, item.x, 1.9, 3.7, 3.2, { accent: item.color });
    s.addText(item.title, {
      x: item.x + 0.3, y: 2.12, w: 3.1, h: 0.4,
      fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
    });
    s.addText(item.text, {
      x: item.x + 0.3, y: 2.65, w: 3.1, h: 2.15,
      fontSize: 13.5, color: C.body, valign: 'top', fontFace: 'Arial'
    });
  }

  s.addText('Requisito del curso: aplicar una arquitectura por capas y demostrar su funcionamiento con un CRUD completo.', {
    x: 0.6, y: 5.55, w: 12.1, h: 0.5,
    fontSize: 14, italic: true, color: C.muted, fontFace: 'Arial'
  });

  s.addNotes('El problema no era la funcionalidad, sino la mezcla de responsabilidades. La ruta sabía de HTTP, de validaciones y de SQL al mismo tiempo. La decisión fue separar esas responsabilidades en capas para que cada cambio tenga un lugar claro.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 3. Arquitectura general
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Vista general', 'Cuatro capas, una responsabilidad por capa', C.blue);

  layerColumn(s, 0.6, C.blue, '1', 'PRESENTACIÓN', [
    'React + Vite',
    'Vistas: Productos, Categorías, Ingredientes, Clientes y Ventas',
    'Componentes: Navbar, Tabla, Formulario y Modal',
    'Cliente HTTP: api.js',
    'Hook useCrud',
    'Muestra la interfaz y captura acciones'
  ]);

  layerColumn(s, 3.7, C.purple, '2', 'APLICACIÓN', [
    'API REST con Node.js + Express',
    'Rutas delgadas por entidad',
    'Servicios por entidad',
    'SaleService e InventoryService',
    'Validaciones y reglas de negocio',
    'Respuesta HTTP / JSON'
  ]);

  layerColumn(s, 6.8, C.cyan, '3', 'ACCESO A DATOS', [
    'Patrón Repository',
    'Contrato: Repository.js',
    'Base: SqliteRepository.js',
    'Repositorios concretos por entidad',
    'Todo el SQL en un solo lugar',
    'Entrega datos a los servicios'
  ]);

  layerColumn(s, 9.9, C.green, '4', 'PERSISTENCIA', [
    'SQLite con better-sqlite3',
    'db.js: tablas, FK y seed',
    'Modo WAL',
    'Transacciones',
    'Tablas: Category, Product, Ingredient, Customer y Sale',
    'Guarda y conserva los datos'
  ]);

  const arrows = [
    { x: 3.4, label: 'HTTP / JSON' },
    { x: 6.5, label: 'servicio' },
    { x: 9.6, label: 'SQL' }
  ];
  for (const arrow of arrows) {
    s.addText('→', {
      x: arrow.x, y: 3.55, w: 0.3, h: 0.4,
      fontSize: 22, bold: true, color: C.muted, align: 'center', fontFace: 'Arial'
    });
    s.addText(arrow.label, {
      x: arrow.x - 0.35, y: 3.98, w: 1.0, h: 0.25,
      fontSize: 7.5, color: C.muted, align: 'center', fontFace: 'Arial'
    });
  }

  card(s, 0.6, 6.35, 12.1, 0.55, { fill: 'E2E8F0', line: 'CBD5E1' });
  s.addText('Flujo: Navegador → api.js → ruta Express → servicio → repositorio → SQLite → respuesta JSON', {
    x: 0.8, y: 6.44, w: 11.7, h: 0.35,
    fontSize: 12, color: C.ink, align: 'center', fontFace: 'Arial'
  });

  s.addNotes('Esta es la vista completa. La capa 1 muestra la interfaz; la capa 2 recibe HTTP y aplica reglas; la capa 3 encapsula el acceso a datos; la capa 4 guarda en SQLite. Cada flecha representa una dependencia controlada: la presentación llama a la API, la aplicación llama a repositorios y los repositorios ejecutan SQL.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 4. Capa 1 - Presentación
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Capa 1', 'Presentación: la interfaz que usa el cliente', C.blue);

  card(s, 0.6, 1.8, 5.8, 4.7, { accent: C.blue });
  s.addText('Responsabilidad', {
    x: 0.95, y: 2.0, w: 5.1, h: 0.35,
    fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
  });
  bullets(s, [
    'React 18 + Vite como aplicación web SPA.',
    'Una vista por entidad: Productos, Categorías, Ingredientes, Clientes y Ventas.',
    'Componentes reutilizables: Navbar, Tabla, Formulario y Modal.',
    'Hook useCrud para listar, crear, editar y eliminar.',
    'Cliente HTTP centralizado en api.js.',
    'No contiene SQL ni reglas de negocio del servidor.'
  ], { x: 0.95, y: 2.5, w: 5.05, h: 3.7, fontSize: 13, paraSpaceAfter: 9 });

  codeBox(s, [
    'frontend/src/',
    '├── api.js',
    '├── hooks/',
    '│   └── useCrud.js',
    '├── components/',
    '│   ├── Navbar.jsx',
    '│   ├── Tabla.jsx',
    '│   ├── Formulario.jsx',
    '│   ├── Modal.jsx',
    '│   └── Layout.jsx',
    '└── pages/',
    '    ├── Productos.jsx',
    '    ├── Categorias.jsx',
    '    ├── Ingredientes.jsx',
    '    ├── Clientes.jsx',
    '    └── Ventas.jsx'
  ].join('\n'), { x: 6.8, y: 1.8, w: 5.9, h: 4.7, accent: C.blue, fontSize: 11 });

  s.addNotes('La capa de presentación es lo que ve el usuario. React organiza la interfaz en vistas y componentes. api.js es el único punto que conoce las rutas HTTP del backend. La capa no sabe cómo se guardan los datos; solo muestra información y envía acciones.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 5. Capa 2 - Aplicación
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Capa 2', 'Aplicación: HTTP, validaciones y reglas de negocio', C.purple);

  card(s, 0.6, 1.8, 5.8, 4.7, { accent: C.purple });
  s.addText('Responsabilidad', {
    x: 0.95, y: 2.0, w: 5.1, h: 0.35,
    fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
  });
  bullets(s, [
    'API REST con Node.js + Express.',
    'Rutas delgadas: solo traducen HTTP ↔ servicio.',
    'Un servicio por entidad y dos servicios clave: SaleService e InventoryService.',
    'Validaciones, cálculo del total y control de stock.',
    'Manejo centralizado de errores 400 y 404.',
    'Devuelve JSON al frontend.'
  ], { x: 0.95, y: 2.5, w: 5.05, h: 3.7, fontSize: 13, paraSpaceAfter: 9 });

  codeBox(s, [
    'backend/routes/sales.js',
    '',
    "router.post('/', (req, res, next) => {",
    '  try {',
    '    const sale = saleService.create(req.body);',
    '    res.status(201).json(sale);',
    '  } catch (error) {',
    '    next(error);',
    '  }',
    '});',
    '',
    'backend/services/',
    '├── ProductService.js',
    '├── CategoryService.js',
    '├── IngredientService.js',
    '├── CustomerService.js',
    '├── SaleService.js',
    '└── InventoryService.js'
  ].join('\n'), { x: 6.8, y: 1.8, w: 5.9, h: 4.7, accent: C.purple, fontSize: 10.5 });

  s.addNotes('La capa de aplicación recibe la petición. La ruta no implementa reglas: delega en un servicio. SaleService valida la venta, calcula el total y coordina la transacción. InventoryService se encarga de verificar, descontar y restaurar el stock.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 6. Capa 3 - Acceso a datos
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Capa 3', 'Acceso a datos: el patrón Repository', C.cyan);

  card(s, 0.6, 1.8, 5.8, 4.7, { accent: C.cyan });
  s.addText('Responsabilidad', {
    x: 0.95, y: 2.0, w: 5.1, h: 0.35,
    fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
  });
  bullets(s, [
    'Contrato abstracto en Repository.js.',
    'Base reutilizable en SqliteRepository.js.',
    'Un repositorio concreto por entidad.',
    'Todo el SQL vive en esta capa.',
    'Los servicios no conocen SQLite.',
    'Facilita pruebas y cambios de motor de base de datos.'
  ], { x: 0.95, y: 2.5, w: 5.05, h: 3.7, fontSize: 13, paraSpaceAfter: 9 });

  codeBox(s, [
    'backend/repositories/',
    '├── Repository.js',
    '├── SqliteRepository.js',
    '├── ProductRepository.js',
    '├── CategoryRepository.js',
    '├── IngredientRepository.js',
    '├── CustomerRepository.js',
    '└── SaleRepository.js',
    '',
    '// Repository.js (contrato)',
    'findAll()',
    'findById(id)',
    'create(data)',
    'update(id, data)',
    'delete(id)'
  ].join('\n'), { x: 6.8, y: 1.8, w: 5.9, h: 4.7, accent: C.cyan, fontSize: 10.5 });

  s.addNotes('El patrón Repository es la pieza que separa la lógica de negocio del SQL. Repository.js define el contrato; SqliteRepository.js implementa el CRUD común; cada repositorio concreto agrega consultas propias, como el JOIN de productos con categorías o el de ventas con productos.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 7. Capa 4 - Persistencia
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Capa 4', 'Persistencia: SQLite y transacciones', C.green);

  card(s, 0.6, 1.8, 5.8, 4.7, { accent: C.green });
  s.addText('Responsabilidad', {
    x: 0.95, y: 2.0, w: 5.1, h: 0.35,
    fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
  });
  bullets(s, [
    'SQLite con better-sqlite3.',
    'db.js crea tablas, claves foráneas y datos de ejemplo.',
    'Modo WAL para lectura y escritura.',
    'Transacciones para venta + descuento de stock.',
    'Integridad referencial con FK.',
    'Los datos sobreviven al reinicio del servidor.'
  ], { x: 0.95, y: 2.5, w: 5.05, h: 3.7, fontSize: 13, paraSpaceAfter: 9 });

  codeBox(s, [
    'Modelo de datos',
    '',
    'Category (id, name)',
    '',
    'Product (id, name, categoryId → Category,',
    '         price, stock)',
    '',
    'Ingredient (id, name, unit, stock)',
    '',
    'Customer (id, name, phone)',
    '',
    'Sale (id, productId → Product, quantity,',
    '      unitPrice, total, createdAt)',
    '',
    'FK: integridad referencial',
    'WAL: lectura y escritura seguras'
  ].join('\n'), { x: 6.8, y: 1.8, w: 5.9, h: 4.7, accent: C.green, fontSize: 11 });

  s.addNotes('La persistencia es SQLite. db.js define las tablas y las relaciones. Las claves foráneas protegen la integridad: una venta siempre apunta a un producto. El modo WAL mejora el comportamiento de lectura y escritura. Y las transacciones garantizan que una venta y su descuento de stock se guarden juntos o no se guarde ninguno.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 8. Flujo de una venta
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Caso real', 'Flujo completo de una venta con control de stock', C.amber);

  const steps = [
    { n: '1', title: 'Usuario', text: 'Selecciona producto y cantidad en Ventas.jsx.' },
    { n: '2', title: 'api.js', text: 'Envía POST /api/sales con productId y quantity.' },
    { n: '3', title: 'Ruta Express', text: 'Recibe la petición y delega en SaleService.' },
    { n: '4', title: 'SaleService', text: 'Valida, calcula el total y abre la transacción.' },
    { n: '5', title: 'Repository', text: 'Inserta la venta y actualiza el stock del producto.' },
    { n: '6', title: 'SQLite', text: 'Confirma todos los cambios o revierte si hay error.' }
  ];

  const startX = 0.6;
  const boxW = 1.85;
  const gap = 0.2;
  steps.forEach((step, index) => {
    const x = startX + index * (boxW + gap);
    card(s, x, 1.8, boxW, 1.75, { accent: C.amber });
    s.addText(step.n, {
      x: x + 0.15, y: 1.92, w: 0.35, h: 0.35,
      fontSize: 18, bold: true, color: C.amber, fontFace: 'Arial'
    });
    s.addText(step.title, {
      x: x + 0.15, y: 2.28, w: boxW - 0.3, h: 0.3,
      fontSize: 12.5, bold: true, color: C.ink, fontFace: 'Arial'
    });
    s.addText(step.text, {
      x: x + 0.15, y: 2.68, w: boxW - 0.3, h: 0.75,
      fontSize: 9.5, color: C.body, valign: 'top', fontFace: 'Arial'
    });
    if (index < steps.length - 1) {
      s.addText('→', {
        x: x + boxW - 0.02, y: 2.5, w: 0.24, h: 0.3,
        fontSize: 15, bold: true, color: C.muted, align: 'center', fontFace: 'Arial'
      });
    }
  });

  codeBox(s, [
    '// SaleService.create()',
    'return transaction(() => {',
    '  const product = inventory.getProduct(productId);',
    '  inventory.assertAvailable(product, qty);',
    '',
    '  const sale = sales.create({',
    '    productId: product.id,',
    '    quantity: qty,',
    '    unitPrice: product.price,',
    '    total: qty * product.price',
    '  });',
    '',
    '  inventory.applySale(product.id, qty);',
    '  return sales.findById(sale.id);',
    '});'
  ].join('\n'), { x: 0.6, y: 3.85, w: 8.15, h: 2.55, accent: C.amber, fontSize: 11 });

  card(s, 9.0, 3.85, 3.7, 2.55, { fill: 'FEF3C7', line: 'FDE68A', accent: C.amber });
  s.addText('Si algo falla', {
    x: 9.3, y: 4.05, w: 3.1, h: 0.3,
    fontSize: 16, bold: true, color: '92400E', fontFace: 'Arial'
  });
  s.addText('La transacción revierte la venta y el descuento de stock. El inventario queda intacto.', {
    x: 9.3, y: 4.45, w: 3.1, h: 1.1,
    fontSize: 12, color: '78350F', valign: 'top', fontFace: 'Arial'
  });
  s.addText('Al eliminar una venta, InventoryService restaura el stock.', {
    x: 9.3, y: 5.6, w: 3.1, h: 0.55,
    fontSize: 11, italic: true, color: '92400E', fontFace: 'Arial'
  });

  s.addNotes('Este es el corazón de la presentación. La venta no es solo un INSERT: también hay que validar stock, calcular el total y descontar inventario. Todo ocurre dentro de una transacción. Si una parte falla, SQLite revierte el conjunto. Al eliminar la venta, el proceso inverso restaura el stock.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 9. Beneficios del patrón Repository
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Diseño', 'Por qué el patrón Repository mejora el proyecto', C.cyan);

  const benefits = [
    {
      x: 0.6, color: C.blue, title: 'Separación',
      text: 'Las rutas y los servicios no escriben SQL. Cada capa se enfoca en una tarea.'
    },
    {
      x: 3.7, color: C.purple, title: 'Testabilidad',
      text: 'La lógica de negocio se puede probar con un repositorio falso, sin depender de SQLite.'
    },
    {
      x: 6.8, color: C.cyan, title: 'Mantenibilidad',
      text: 'Un cambio de consulta afecta un solo repositorio, no a todas las rutas.'
    },
    {
      x: 9.9, color: C.green, title: 'Evolución',
      text: 'Se podría cambiar SQLite por otro motor sin reescribir los servicios.'
    }
  ];

  for (const item of benefits) {
    card(s, item.x, 1.85, 2.8, 2.45, { accent: item.color });
    s.addText(item.title, {
      x: item.x + 0.25, y: 2.08, w: 2.3, h: 0.35,
      fontSize: 17, bold: true, color: C.ink, fontFace: 'Arial'
    });
    s.addText(item.text, {
      x: item.x + 0.25, y: 2.55, w: 2.3, h: 1.5,
      fontSize: 12, color: C.body, valign: 'top', fontFace: 'Arial'
    });
  }

  card(s, 0.6, 4.75, 12.1, 1.15, { fill: 'ECFEFF', line: 'A5F3FC', accent: C.cyan });
  s.addText('“Las rutas no saben SQL; los servicios no saben HTTP.”', {
    x: 0.9, y: 4.95, w: 11.5, h: 0.45,
    fontSize: 22, italic: true, color: '155E75', align: 'center', fontFace: 'Arial'
  });
  s.addText('Esa separación es la que hace que el diagrama y el código hablen el mismo idioma.', {
    x: 0.9, y: 5.42, w: 11.5, h: 0.3,
    fontSize: 11.5, color: '0E7490', align: 'center', fontFace: 'Arial'
  });

  s.addNotes('El patrón Repository no es solo una moda: reduce el acoplamiento. Si mañana cambia una consulta, se modifica un repositorio. Si se quiere probar la lógica, se simula el repositorio. Y si se cambia el motor de base de datos, los servicios permanecen igual.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 10. Pruebas y calidad
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Calidad', 'Pruebas automatizadas: 14 de 14 en verde', C.green);

  card(s, 0.6, 1.8, 3.5, 4.7, { fill: 'ECFDF5', line: 'A7F3D0', accent: C.green });
  s.addText('14/14', {
    x: 0.75, y: 2.35, w: 3.2, h: 1.0,
    fontSize: 58, bold: true, color: C.green, align: 'center', fontFace: 'Arial'
  });
  s.addText('pruebas pasando', {
    x: 0.75, y: 3.4, w: 3.2, h: 0.4,
    fontSize: 16, color: '047857', align: 'center', fontFace: 'Arial'
  });
  s.addText('node:test + supertest\nBase de datos en memoria', {
    x: 0.9, y: 4.25, w: 2.9, h: 0.9,
    fontSize: 11.5, color: '065F46', align: 'center', fontFace: 'Arial'
  });

  card(s, 4.4, 1.8, 8.3, 4.7, { accent: C.green });
  s.addText('Cobertura funcional', {
    x: 4.75, y: 2.0, w: 7.6, h: 0.35,
    fontSize: 18, bold: true, color: C.ink, fontFace: 'Arial'
  });
  bullets(s, [
    'Estado de la API y ruta inexistente (404).',
    'CRUD completo de Productos, Categorías, Ingredientes y Clientes.',
    'Ventas: cálculo del total y validación de cantidad.',
    'Rechazo de ventas sin stock suficiente.',
    'Descuento de stock al registrar una venta.',
    'Restauración de stock al eliminar una venta.',
    'Venta inválida sin cambios en el inventario.',
    'Venta de todo el stock disponible.'
  ], { x: 4.75, y: 2.5, w: 7.55, h: 3.7, fontSize: 12.5, paraSpaceAfter: 7 });

  s.addText('npm test  →  tests 14 · pass 14 · fail 0', {
    x: 0.6, y: 6.72, w: 12.1, h: 0.3,
    fontSize: 12, bold: true, color: C.green, fontFace: 'Consolas'
  });

  s.addNotes('Las pruebas no solo verifican el CRUD. También validan el comportamiento del inventario: que la venta descuente stock, que eliminarla lo restaure y que una venta inválida no altere nada. Las pruebas usan una base en memoria para no tocar la base real.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 11. Demo y ejecución
// ---------------------------------------------------------------------------
{
  const s = newSlide();
  header(s, 'Demostración', 'Cómo ejecutar el proyecto', C.blue);

  card(s, 0.6, 1.8, 3.85, 3.4, { accent: C.purple });
  s.addText('1. Backend', {
    x: 0.9, y: 2.0, w: 3.25, h: 0.35,
    fontSize: 17, bold: true, color: C.ink, fontFace: 'Arial'
  });
  s.addText('cd backend\nnpm install\nnpm start', {
    x: 0.9, y: 2.5, w: 3.25, h: 1.0,
    fontSize: 12.5, color: C.codeText, fontFace: 'Consolas',
    fill: { color: C.codeBg }, line: { color: C.codeLine }, margin: 8
  });
  s.addText('API en http://localhost:3001/api/health', {
    x: 0.9, y: 3.75, w: 3.25, h: 0.55,
    fontSize: 10.5, color: C.body, fontFace: 'Arial'
  });

  card(s, 4.65, 1.8, 3.85, 3.4, { accent: C.blue });
  s.addText('2. Frontend', {
    x: 4.95, y: 2.0, w: 3.25, h: 0.35,
    fontSize: 17, bold: true, color: C.ink, fontFace: 'Arial'
  });
  s.addText('cd frontend\nnpm install\nnpm run dev', {
    x: 4.95, y: 2.5, w: 3.25, h: 1.0,
    fontSize: 12.5, color: C.codeText, fontFace: 'Consolas',
    fill: { color: C.codeBg }, line: { color: C.codeLine }, margin: 8
  });
  s.addText('Interfaz en http://localhost:5173', {
    x: 4.95, y: 3.75, w: 3.25, h: 0.55,
    fontSize: 10.5, color: C.body, fontFace: 'Arial'
  });

  card(s, 8.7, 1.8, 4.0, 3.4, { accent: C.green });
  s.addText('3. Pruebas', {
    x: 9.0, y: 2.0, w: 3.4, h: 0.35,
    fontSize: 17, bold: true, color: C.ink, fontFace: 'Arial'
  });
  s.addText('cd backend\nnpm test', {
    x: 9.0, y: 2.5, w: 3.4, h: 0.75,
    fontSize: 12.5, color: C.codeText, fontFace: 'Consolas',
    fill: { color: C.codeBg }, line: { color: C.codeLine }, margin: 8
  });
  s.addText('Resultado esperado:\ntests 14 · pass 14 · fail 0', {
    x: 9.0, y: 3.55, w: 3.4, h: 0.7,
    fontSize: 10.5, color: C.body, fontFace: 'Arial'
  });

  card(s, 0.6, 5.45, 12.1, 0.95, { fill: 'E2E8F0', line: 'CBD5E1', accent: C.blue });
  s.addText('En Windows también puedes usar iniciar.bat y detener.bat. El frontend usa el proxy de Vite hacia /api.', {
    x: 0.9, y: 5.65, w: 11.5, h: 0.5,
    fontSize: 12.5, color: C.ink, align: 'center', fontFace: 'Arial'
  });

  s.addNotes('Para la demo: primero levantar el backend, luego el frontend. Mostrar el health, un CRUD sencillo y una venta. Después ejecutar npm test para evidenciar las 14 pruebas en verde. En Windows están los scripts iniciar.bat y detener.bat.');
  footer(s);
}

// ---------------------------------------------------------------------------
// 12. Cierre
// ---------------------------------------------------------------------------
{
  const s = newSlide({ dark: true });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.green }, line: { color: C.green }
  });
  s.addText('CONCLUSIONES', {
    x: 0.9, y: 0.9, w: 11, h: 0.3,
    fontSize: 12, bold: true, color: '6EE7B7', charSpacing: 3, fontFace: 'Arial'
  });
  s.addText('Un sistema más claro, mantenible y consistente', {
    x: 0.85, y: 1.25, w: 11.5, h: 0.7,
    fontSize: 32, bold: true, color: C.white, fontFace: 'Arial'
  });

  const points = [
    { n: '01', title: 'Capas con propósito', text: 'Interfaz, negocio, datos y persistencia separados.' },
    { n: '02', title: 'Repository', text: 'El SQL se concentra y la lógica se vuelve testeable.' },
    { n: '03', title: 'Transacciones', text: 'Venta y stock se mantienen consistentes.' }
  ];

  points.forEach((point, index) => {
    const y = 2.35 + index * 1.15;
    s.addText(point.n, {
      x: 0.9, y, w: 0.6, h: 0.4,
      fontSize: 16, bold: true, color: '6EE7B7', fontFace: 'Arial'
    });
    s.addText(point.title, {
      x: 1.55, y, w: 4.2, h: 0.35,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Arial'
    });
    s.addText(point.text, {
      x: 5.8, y, w: 6.5, h: 0.35,
      fontSize: 13, color: 'CBD5E1', fontFace: 'Arial'
    });
  });

  s.addText('GRACIAS', {
    x: 0.9, y: 5.65, w: 11.5, h: 0.8,
    fontSize: 42, bold: true, color: C.white, fontFace: 'Arial'
  });
  s.addText('¿Preguntas?', {
    x: 0.9, y: 6.45, w: 5, h: 0.35,
    fontSize: 15, color: '94A3B8', fontFace: 'Arial'
  });

  s.addNotes('Para cerrar: la arquitectura por capas no es solo un dibujo. Se refleja en archivos concretos, en dependencias controladas y en pruebas que verifican el comportamiento. El patrón Repository y las transacciones son las decisiones que más aportan a la mantenibilidad y a la consistencia de los datos. Gracias.');
  footer(s, true);
}

await pptx.writeFile({ fileName: OUT });
console.log(`Presentación generada: ${OUT}`);
