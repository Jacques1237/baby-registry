/* ═══════════════════════════════════════════════════════════════════════════
   BABY GIRL REGISTRY — app.js  (next-level 3D edition)
═══════════════════════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = 'baby2026';
const LS_KEY         = 'registry_items_v3';

/* Declared up here so IIFEs below can reference them safely */
const HERO_GLYPHS = {
  girl: ['♡','✿','✦','💕','·','✾'],
  boy:  ['🚗','🏎️','🚙','⭐','✦','🚕'],
};

const BURST_GLYPHS = {
  girl: ['💕','✨','🎀','⭐','💗','✦','🌸','💖','🩷','✿'],
  boy:  ['💙','✨','⭐','🌟','💫','✦','🚗','🏎️','🚀','❄️'],
};

/* ═══════════════════════════════════════════════════════════════════════════
   3D PERSPECTIVE CANVAS — particles flying toward viewer
═══════════════════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  const FOV     = 500;   // perspective focal length
  const N_DEEP  = 18;    // slow distant bokeh blobs
  const N_STARS = 55;    // fast flying particles

  /* ── Bokeh blobs (background layer) ────────────────────────────────────── */
  const THEME_PALETTES = {
    girl: ['rgba(242,167,187,','rgba(247,197,208,','rgba(232,213,183,','rgba(212,184,150,','rgba(201,126,138,','rgba(252,236,224,','rgba(249,230,248,'],
    boy:  ['rgba(136,196,238,','rgba(170,217,247,','rgba(168,196,216,','rgba(138,174,196,','rgba(58,134,204,', 'rgba(223,240,251,','rgba(204,228,245,'],
  };

  let blobs, stars;

  function randColor() {
    const palette = THEME_PALETTES[document.documentElement.dataset.theme] || THEME_PALETTES.girl;
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function makeBlob() {
    return {
      x: (Math.random() - .5) * 2,   // -1..1 normalized
      y: (Math.random() - .5) * 2,
      z: 200 + Math.random() * 900,  // world depth
      r: 60 + Math.random() * 150,
      a: .03 + Math.random() * .055,
      color: randColor(),
      phase: Math.random() * Math.PI * 2,
      dz: .12 + Math.random() * .3,  // drift toward viewer
    };
  }

  function makeStar() {
    return {
      x: (Math.random() - .5) * 2,
      y: (Math.random() - .5) * 2,
      z: Math.random() * 1400,       // spawn anywhere in depth
      r: .8 + Math.random() * 2.2,
      a: .12 + Math.random() * .2,
      color: randColor(),
      dz: .5 + Math.random() * 1.8,  // faster — flying-through effect
    };
  }

  function resetZ(p) { p.z = 1200 + Math.random() * 300; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    blobs  = Array.from({ length: N_DEEP  }, makeBlob);
    stars  = Array.from({ length: N_STARS }, makeStar);
  }

  function project(p) {
    const scale = FOV / (FOV + p.z);
    return {
      sx: p.x * W * .5 * scale + W * .5,
      sy: p.y * H * .5 * scale + H * .5,
      scale,
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    /* — deep blobs — */
    blobs.forEach(b => {
      b.z -= b.dz;
      if (b.z < 10) {
        b.x = (Math.random() - .5) * 2;
        b.y = (Math.random() - .5) * 2;
        resetZ(b);
      }
      const { sx, sy, scale } = project(b);
      const R     = b.r * scale;
      const pulse = 1 + .07 * Math.sin(t * .002 + b.phase);
      const g     = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * pulse);
      g.addColorStop(0,   b.color + b.a + ')');
      g.addColorStop(.5,  b.color + (b.a * .4) + ')');
      g.addColorStop(1,   b.color + '0)');
      ctx.beginPath();
      ctx.arc(sx, sy, R * pulse, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* — flying star particles — */
    stars.forEach(s => {
      s.z -= s.dz;
      if (s.z < 1) {
        s.x = (Math.random() - .5) * 2;
        s.y = (Math.random() - .5) * 2;
        resetZ(s);
      }
      const { sx, sy, scale } = project(s);
      const R    = s.r * scale * 1.6;
      const fade = Math.min(1, (1200 - s.z) / 300); // fade in as they approach

      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(.3, R), 0, Math.PI * 2);
      ctx.fillStyle = s.color + (s.a * fade) + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   HERO MOUSE PARALLAX — multi-layer depth
═══════════════════════════════════════════════════════════════════════════ */
(function initHeroParallax() {
  const hero     = document.querySelector('.hero');
  const content  = document.querySelector('.hero-content');
  const title    = document.querySelector('.hero-title');
  const subtitle = document.querySelector('.hero-subtitle');
  const eyebrow  = document.querySelector('.hero-eyebrow');
  const divider  = document.querySelector('.hero-divider');
  const counter  = document.querySelector('.counter-bar');
  const decL     = document.querySelector('.hero-dec-left');
  const decR     = document.querySelector('.hero-dec-right');

  if (!hero || !content) return;

  let mx = 0, my = 0;
  let cx = window.innerWidth  / 2;
  let cy = window.innerHeight / 2;
  // smoothed values
  let smx = 0, smy = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX - cx; my = e.clientY - cy; });
  window.addEventListener('resize',    () => { cx = window.innerWidth / 2; cy = window.innerHeight / 2; });

  function tick() {
    // lerp toward target
    smx += (mx - smx) * .06;
    smy += (my - smy) * .06;

    const nx = smx / cx; // -1..1
    const ny = smy / cy;

    /* Each layer at a different depth rate */
    if (eyebrow) eyebrow.style.transform = `translate(${nx * -18}px, ${ny * -12}px)`;
    if (title)   title.style.transform   = `translate(${nx * -12}px, ${ny * -8}px)`;
    if (subtitle)subtitle.style.transform= `translate(${nx * -7}px,  ${ny * -5}px)`;
    if (divider) divider.style.transform = `translate(${nx * -20}px, ${ny * -14}px)`;
    if (counter) counter.style.transform = `translate(${nx * -5}px,  ${ny * -3}px)`;
    if (decL) decL.style.transform = `rotate(-18deg) translate(${nx * 30}px, ${ny * 20}px)`;
    if (decR) decR.style.transform = `rotate(18deg)  translate(${nx * 30}px, ${ny * 20}px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   DATA LAYER
═══════════════════════════════════════════════════════════════════════════ */
function uid() { return Math.random().toString(36).slice(2,9) + Date.now().toString(36); }

const DEFAULT_ITEMS = [
  { id: "pmxddb8mnm9jd2m", name: "Epi-max Baby/junior Lotion 450ml", price: "R 94.49", image: "https://www.dischem.co.za/api/catalog/product/6/0/6006340003804_56f50a52945dc2a21ae39e2a8faa915b.jpg?store=default&image-type=image", url: "https://www.dischem.co.za/epi-max-baby-junior-lotion-450ml-205", purchased: false },
  { id: "e2r76otmnm9orjf", name: "Epi-max Baby & Junior Body Wash 450ml", price: "R 98.99", image: "https://www.dischem.co.za/api/catalog/product/6/0/6009695589313_98016322fc7cde34559a0907d2a8d1fe.jpg?store=default&image-type=image", url: "https://www.dischem.co.za/epi-max-baby-junior-body-wash-450ml-182", purchased: false },
  { id: "cj4eo4mmnma5x38", name: "Epi-max Junior 400g", price: "R 89.99", image: "https://www.dischem.co.za/api/catalog/product/6/0/6006340001589_3f3e86cd5ccffbb0e3a21a1e36d9dea5.jpg?store=default&image-type=image", url: "https://www.dischem.co.za/epi-max-junior-400g-219", purchased: false },
  { id: "ts3pglgmnma7vgr", name: "Baby Nail Trimmer Electric File Set with Light Replacement Heads - Pink", price: "R74", image: "https://media.takealot.com/covers_images/f6ff6c6317074796bbd6313f4520113c/s-zoom.file", url: "https://www.takealot.com/baby-nail-trimmer-electric-file-set-with-light-replacement-heads/PLID90280698?colour_variant=Pink", purchased: false },
  { id: "bx1mixsmnmaand9", name: "NUK Silicone Star Soother (0-6 Months) - 2 Pack", price: "R 279.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009544204831_imageoutofpack.png?store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/nuk-silicone-genius-2-pack-soother-girl-size-1-1175848", purchased: false },
  { id: "a9wshpcmnmac4nf", name: "Milton Sterilising Unit", price: "R 149.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6001341018154_imageoutofpack.jpg?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/milton-sterilizing-unit-1011415", purchased: false },
  { id: "z8zf9tgmnmaezmi", name: "NUK Microwave Sterilizer", price: "R 729.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009631454866_imageview1front_099f387d87f0c504b3393288f49a6b3c.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/nuk-microwave-sterilizer-1019017", purchased: false },
  { id: "ew0ku1lmnmago0m", name: "NUK Temperature Control Starter Pack Pink", price: "R 849.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009544206132_imageinpack_5e2dc3ddcd641f41524da4082204afe5.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/nuk-4-bottle-starter-pack-girl-1175786", purchased: false },
  { id: "mscgn1hmnmahxpf", name: "NUK 2 Pack Temperature Control Bottle Silicone Teat", price: "R 499.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009544207658_imageoutofpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/temperature-control-bottle-silicone-teat-6-18months-300ml-2-pack-pink", purchased: false },
  { id: "11r86pjmnmamfd9", name: "Tommee Tippee Natural Start Baby Bottle with Anti-Colic Teat", price: "R 299.90", image: "https://www.babiesrus.co.za/api/catalog/product/5/0/5010415228369_imageoutofpack_5124e8621f6f803129bf0d0aca537579.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/tommee-tippee-natural-start-baby-bottle-with-anti-colic-teat-decorated-pink-260ml-2-pack-with-slow-flow-teats-for-an-easy-latch-anti-colic-valve-self-sterilizing-3003345", purchased: false },
  { id: "miy36tsmnmaoedh", name: "Tommee Tippee Natural Start Baby Bottles - 260ml - 3 Pack", price: "R 359.90", image: "https://www.babiesrus.co.za/api/catalog/product/5/0/5010415225306_imageinpack_0806ec6672e42e0da388e017180eb3e8.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/tommee-tippee-natural-start-bottles-260ml-3-pack-3004352", purchased: false },
  { id: "0wesn2hmnmarwjx", name: "Milky Way Wearable Electric Breast Pump", price: "R 1,899.00", image: "https://www.makro.co.za/asset/rukmini/fccp/416/416/ng-fkpublic-ui-user-fbbe/breast-pump/y/a/k/wearable-electric-breast-pump-variable-frequency-box-2-wearable-original-imahkbhszdyjythy.jpeg?q=70", url: "https://www.makro.co.za/milky-way-wearable-electric-breast-pump-variable-frequency/p/itm148f2f9843e7f", purchased: false },
  { id: "0m63ceqmnmax9qg", name: "Double Electric Breast Pump & Double Electric Bottle Warmer Sterilizer Combo", price: "R 998.00", image: "https://www.mymomandme.co.za/cdn/shop/files/8_af9c4354-773f-4bdf-b796-56e13c9e5aa5_1_1024x1024@2x.jpg?v=1737970342", url: "https://www.mymomandme.co.za/products/double-pump-double-bottle-warmer-bundle", purchased: false },
  { id: "g10en8umnmayo5q", name: "Medicine Dropper & Spoon Set", price: "R 74.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6001911006901_imageinpack.jpg?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/snookums-medicine-dropper-spoon-1165752", purchased: false },
  { id: "4kcybn4mnmazvae", name: "Large Capacity Baby Bottle Dry Rack", price: "R 139.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6001911007595_imageoutofpack.jpg?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/snookums-bottle-drying-rack-1159799", purchased: false },
  { id: "fz5g819mnmb18zc", name: "Bepanthen Nappy Care Ointment 100g", price: "R 229.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009697612378_imageoutofpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/bepanthen-ointment-1g-1170073", purchased: false },
  { id: "tx11qkpmnmb2lec", name: "Sudocrem Skin and Baby Care Cream", price: "R 199.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009679832534_imageoutofpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/sudocrem-25g-1101176", purchased: false },
  { id: "v4qf88rmnmb41sp", name: "Oh-Lief Natural Olive Shampoo & Baby Wash", price: "R 179.90", image: "https://www.babiesrus.co.za/api/catalog/product/3/6/36009880165378_imageoutofpack_d5df136b021bc457697662bd71ec586e.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/oh-lief-natural-olive-shampoo-baby-wash-400ml-3006008", purchased: false },
  { id: "ds8f09tmnmb5wd7", name: "Oh-Lief Natural Olive Bum Balm", price: "R 99.90", image: "https://www.babiesrus.co.za/api/catalog/product/3/6/36009880165170_imageoutofpack_eb65a867d8265165d7569636dd4494ce.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/oh-lief-natural-olive-bum-balm-100ml-3006418", purchased: false },
  { id: "8c6rj3wmnmb7d4t", name: "Avent - Steam Steriliser - Microwave", price: "R 699", image: "https://media.takealot.com/covers_tsins/17292731/17292731-3-pdpxl.jpg", url: "https://www.takealot.com/avent-steam-steriliser-microwave/PLID17227413", purchased: false },
  { id: "9y0ocmsmnmb8le4", name: "Munchkin Bristle Bottle and Nipple Brush", price: "R 139.90", image: "https://www.babiesrus.co.za/api/catalog/product/5/0/5019090518895_imageinpack_c0fdffbebe01195b0ad55bb088bb8055.png?store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/munchkin-bristle-bottle-and-nipple-brush-grey-3000849", purchased: false },
  { id: "wsj74lvmnmbbfth", name: "Snuggletime Super Soft 8pk Washcloths", price: "R 99.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6006759005673_imageinpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/washcloth-pink-shells-8-pack", purchased: false },
  { id: "qp1adv6mnmbehk2", name: "Square Day Bed", price: "R 399.90", image: "https://www.babiesrus.co.za/api/catalog/product/0/7/0781718425162_imageoutofpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/square-day-bed-grey-cloud", purchased: false },
  { id: "6vtik2nmnmbfleu", name: "Baby Aqueous Cream Fragrance Free", price: "R 44.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6007218000086_imageoutofpack.jpg?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/baby-aqueous-cream-fragrance-free-1074856", purchased: false },
  { id: "88gf5vtmnmbh3r8", name: "Maternity Hospital Panty", price: "R 79.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009625950022_imageoutofpack_3a8718c39351fd4164ecf6d3129b1653.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/carriwell-disposable-panties-small-xl-1078877", purchased: false },
  { id: "utjmojkmnmbi7wo", name: "Travel Change Mat", price: "R 89.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6006759005932_imageinpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/travel-change-mat-1094906", purchased: false },
  { id: "i0o92c3mnmbj65f", name: "Angelcare Baby Bath Support Fit", price: "R 499.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/6/666594203199_imageoutofpack_142ddfff33d9d1745321327203c90cbb.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/gifts-under-r400/baby-bath-support-grey", purchased: false },
  { id: "b3esw24mnmbk6ne", name: "Milk Storage Bags 25pc Animal Design", price: "R 129.90", image: "https://www.babiesrus.co.za/api/catalog/product/4/9/4902508793216_imageview1front.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/milk-storage-bags-25pc-animal-design", purchased: false },
  { id: "xxry1p2mnmbl6ky", name: "MILK SAVER PUMP 110ML", price: "R 169.90", image: "https://www.babiesrus.co.za/api/catalog/product/4/9/4902508269148_imageoutofpack.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/milk-saver-pump-110ml", purchased: false },
  { id: "c4x14qsmnmbmwd1", name: "Snuggletime Hooded Towel and 3 Washcloths", price: "R 149.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009711553397_imageoutofpack_53616f792109bf6256223590a9f0cb90.png?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/snuggletime-hooded-towel-and-3-washcloths-princess-3001997", purchased: false },
  { id: "qhieg14mnmbotrc", name: "Tatum 3 in 1 Baby Carrier", price: "R 449.90", image: "https://www.babiesrus.co.za/api/catalog/product/6/0/6009900315331_imageoutofpack.jpg?width=630&height=630&store=babiesrus&image-type=image", url: "https://www.babiesrus.co.za/tatum-3-in-1-baby-carrier-1176018", purchased: false },
];

function loadItems() {
  try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch (_) {}
  return DEFAULT_ITEMS;
}
function saveItems() { localStorage.setItem(LS_KEY, JSON.stringify(items)); }

let items = loadItems();
saveItems();

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER REGISTRY
═══════════════════════════════════════════════════════════════════════════ */
function renderRegistry() {
  const grid      = document.getElementById('registry-grid');
  const emptyMsg  = document.getElementById('empty-state');
  const available = items.filter(i => !i.purchased);
  const purchased = items.filter(i =>  i.purchased);

  document.getElementById('counter-available').textContent = available.length;
  document.getElementById('counter-purchased').textContent = purchased.length;

  grid.innerHTML = '';

  if (available.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    available.forEach(item => grid.appendChild(buildCard(item)));
  }
}

/* ── Build card DOM ──────────────────────────────────────────────────────── */
function buildCard(item) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card-wrapper';

  const imgHTML = item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"
         onerror="this.parentElement.innerHTML='<div class=\\'card-image-placeholder\\'>🎀</div>'" />`
    : `<div class="card-image-placeholder">🎀</div>`;

  wrapper.innerHTML = `
    <div class="card-scene" data-id="${item.id}">

      <!-- backing glow plate, translateZ(-22px) via CSS -->
      <div class="card-back"></div>

      <!-- card surface at translateZ(0) -->
      <div class="card">
        <div class="card-image-clip">${imgHTML}</div>
        <div class="card-body">
          <div class="card-title">${esc(item.name)}</div>
          <div class="card-actions">
            <button class="btn btn-primary"   onclick="visitItem('${item.id}')">Purchase</button>
            <button class="btn btn-secondary" onclick="markPurchased('${item.id}')">Purchased ✓</button>
          </div>
        </div>
        <!-- inner mouse-tracking spotlight -->
        <div class="card-light"></div>
        <!-- shimmer sweep -->
        <div class="card-shimmer"></div>
      </div>

      <!-- price ribbon floating at translateZ(38px) via CSS -->
      <div class="card-ribbon">${esc(item.price)}</div>

    </div>`;

  const scene = wrapper.querySelector('.card-scene');
  const card  = wrapper.querySelector('.card');
  const light = wrapper.querySelector('.card-light');

  attach3DTilt(scene, card, light);
  return wrapper;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3D TILT — smooth lerp physics
   Tilt applied to .card-scene (preserve-3d) so ribbon, card, and
   backing plate all move as one coherent 3D unit.
═══════════════════════════════════════════════════════════════════════════ */
function attach3DTilt(scene, card, light) {
  let rafId = null;
  let tx = 0, ty = 0;    // target rotation
  let cx = 0, cy = 0;    // current rotation (lerped)
  let isOver = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    const lerpFactor = isOver ? .10 : .07;
    cx = lerp(cx, tx, lerpFactor);
    cy = lerp(cy, ty, lerpFactor);

    scene.style.transform = `rotateX(${cx}deg) rotateY(${cy}deg)`;

    /* Dynamic shadow direction based on tilt */
    const shadowX = -cy * 2.5;
    const shadowY = cx * 2.5;
    card.style.boxShadow = isOver
      ? `${shadowX}px ${shadowY + 20}px 60px rgba(74,55,40,.18),
         ${shadowX * .5}px ${shadowY * .5 + 8}px 24px rgba(74,55,40,.14),
         inset 0 1px 0 rgba(255,255,255,.95)`
      : '';

    const stillMoving = Math.abs(cx - tx) > .01 || Math.abs(cy - ty) > .01;
    if (stillMoving || isOver) {
      rafId = requestAnimationFrame(animate);
    } else {
      cx = tx; cy = ty;
      scene.style.transform = tx === 0 ? '' : `rotateX(${cx}deg) rotateY(${cy}deg)`;
      card.style.boxShadow  = '';
    }
  }

  scene.addEventListener('mouseenter', () => {
    isOver = true;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  });

  scene.addEventListener('mousemove', e => {
    const r  = scene.getBoundingClientRect();
    const nx = ((e.clientX - r.left)  / r.width  - .5) * 2;
    const ny = ((e.clientY - r.top)   / r.height - .5) * 2;
    tx = -ny * 11;
    ty =  nx * 11;

    /* inner spotlight follows mouse */
    const px = ((e.clientX - r.left)  / r.width)  * 100;
    const py = ((e.clientY - r.top)   / r.height) * 100;
    light.style.background = `radial-gradient(circle at ${px}% ${py}%,
      rgba(255,255,255,.22) 0%,
      rgba(255,255,255,.08) 35%,
      transparent 65%)`;
  });

  scene.addEventListener('mouseleave', () => {
    isOver = false;
    tx = 0; ty = 0;
    light.style.background = '';
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   PURCHASE BURST — emoji particles explode from card
═══════════════════════════════════════════════════════════════════════════ */
function burstParticles(originEl) {
  const rect   = originEl.getBoundingClientRect();
  const ox     = rect.left + rect.width  / 2;
  const oy     = rect.top  + rect.height / 2;
  const theme  = document.documentElement.dataset.theme || 'girl';
  const glyphs = BURST_GLYPHS[theme] || BURST_GLYPHS.girl;

  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.className = 'burst-particle';
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - .5) * .8;
    const dist  = 90  + Math.random() * 130;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist - 40;
    const rot   = (Math.random() - .5) * 540;
    const dur   = (.7 + Math.random() * .5).toFixed(2);
    const size  = 14 + Math.random() * 16;

    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.cssText = `
      left: ${ox}px; top: ${oy}px;
      font-size: ${size}px;
      --tx: ${tx}px; --ty: ${ty}px;
      --rot: ${rot}deg; --dur: ${dur}s;
      margin-left: -${size / 2}px;
      margin-top:  -${size / 2}px;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERIODIC FLOATING HEARTS in hero
═══════════════════════════════════════════════════════════════════════════ */
(function spawnHeroHearts() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  function spawn() {
    // read theme live so switching is instant without reloading
    const theme  = document.documentElement.dataset.theme || 'girl';
    const glyphs = HERO_GLYPHS[theme] || HERO_GLYPHS.girl;

    const el   = document.createElement('div');
    const size = 10 + Math.random() * 22;
    const x    = 5 + Math.random() * 90;
    const dur  = 4 + Math.random() * 5;
    const delay= Math.random() * .5;

    el.textContent  = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.cssText = `
      position: absolute;
      left: ${x}%;
      bottom: 80px;
      font-size: ${size}px;
      color: rgba(201,126,138,${.12 + Math.random() * .15});
      pointer-events: none;
      user-select: none;
      z-index: 1;
      animation: heroHeartFloat ${dur}s ${delay}s ease-in forwards;
    `;
    hero.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  /* inject the keyframe once */
  if (!document.getElementById('hero-heart-kf')) {
    const s = document.createElement('style');
    s.id = 'hero-heart-kf';
    s.textContent = `
      @keyframes heroHeartFloat {
        0%   { transform: translateY(0) rotate(0deg) scale(1);    opacity: 0; }
        10%  { opacity: 1; }
        80%  { opacity: .7; }
        100% { transform: translateY(-320px) rotate(25deg) scale(.6); opacity: 0; }
      }`;
    document.head.appendChild(s);
  }

  spawn();
  setInterval(spawn, 1200);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIONS
═══════════════════════════════════════════════════════════════════════════ */
function visitItem(id) {
  const item = items.find(i => i.id === id);
  if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer');
}

function markPurchased(id) {
  const item = items.find(i => i.id === id);
  showConfirm(
    '🎀',
    'Mark as Purchased?',
    `"${item?.name || 'This item'}" will be removed from the registry. You can restore it from the admin panel.`,
    'Mark Purchased',
    () => {
      const scene = document.querySelector(`.card-scene[data-id="${id}"]`);
      if (!scene) return;

      /* burst from card center before it flips away */
      burstParticles(scene);

      scene.classList.add('purchased-anim');
      scene.addEventListener('animationend', () => {
        const t = items.find(i => i.id === id);
        if (t) t.purchased = true;
        saveItems();
        renderRegistry();
        renderAdminList();
        showToast('🎀', 'Gift marked as purchased — thank you!', 'success');
      }, { once: true });
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════════════════════════════════════ */
let adminUnlocked = false;

function toggleAdminPanel() {
  const panel = document.getElementById('admin-panel');
  const btn   = document.getElementById('admin-toggle-btn');
  const open  = panel.classList.contains('visible');

  if (open) {
    panel.classList.remove('visible');
    btn.innerHTML = '<span class="btn-icon-text">⚙</span> Admin Panel';
  } else {
    panel.classList.add('visible');
    btn.innerHTML = '<span class="btn-icon-text">✕</span> Hide Admin';
    document.getElementById('admin-anchor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (adminUnlocked) showAdminDashboard();
  }
}

function adminLogin() {
  const pw = document.getElementById('admin-password-input').value;
  if (pw === ADMIN_PASSWORD) {
    adminUnlocked = true;
    showAdminDashboard();
    showToast('🔓', 'Admin access granted', 'success');
  } else {
    showToast('🔒', 'Incorrect password', 'error');
    const inp = document.getElementById('admin-password-input');
    inp.style.borderColor = '#e07070';
    inp.style.boxShadow   = '0 0 0 4px rgba(224,112,112,.18)';
    setTimeout(() => { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 1400);
  }
}

function showAdminDashboard() {
  document.getElementById('admin-login-view').style.display     = 'none';
  document.getElementById('admin-dashboard-view').style.display = 'block';
  renderAdminList();
}

function adminLogout() {
  adminUnlocked = false;
  document.getElementById('admin-login-view').style.display     = 'block';
  document.getElementById('admin-dashboard-view').style.display = 'none';
  document.getElementById('admin-password-input').value         = '';
}

function adminAddItem() {
  const name  = document.getElementById('new-item-name').value.trim();
  const price = document.getElementById('new-item-price').value.trim();
  const image = document.getElementById('new-item-image').value.trim();
  const url   = document.getElementById('new-item-url').value.trim();

  if (!name)  { showToast('⚠️', 'Please enter an item name', 'error');  return; }
  if (!price) { showToast('⚠️', 'Please enter a price',     'error'); return; }

  items.push({ id: uid(), name, price, image, url, purchased: false });
  saveItems();
  renderRegistry();
  renderAdminList();

  ['new-item-name','new-item-price','new-item-image','new-item-url']
    .forEach(id => { document.getElementById(id).value = ''; });

  showToast('✦', 'Item added to registry!', 'success');
}

function adminDeleteItem(id) {
  const item = items.find(i => i.id === id);
  showConfirm('🗑️', 'Remove Item?',
    `"${item?.name || 'This item'}" will be permanently removed from the registry.`,
    'Remove',
    () => {
      items = items.filter(i => i.id !== id);
      saveItems(); renderRegistry(); renderAdminList();
      showToast('✓', 'Item removed', 'success');
    }
  );
}

function adminResetItem(id) {
  const item = items.find(i => i.id === id);
  if (item) {
    item.purchased = false;
    saveItems(); renderRegistry(); renderAdminList();
    showToast('✦', 'Item reset to available', 'success');
  }
}

function renderAdminList() {
  const list  = document.getElementById('admin-items-list');
  const empty = document.getElementById('admin-empty');
  list.innerHTML = '';

  if (items.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  items.forEach(item => {
    const row   = document.createElement('div');
    row.className = 'admin-item-row';
    const thumb = item.image
      ? `<img src="${esc(item.image)}" alt="" onerror="this.parentElement.textContent='🎀'" />`
      : '🎀';

    row.innerHTML = `
      <div class="admin-item-thumb">${thumb}</div>
      <div class="admin-item-info">
        <div class="admin-item-name">${esc(item.name)}</div>
        <div class="admin-item-price">${esc(item.price)}</div>
      </div>
      <span class="status-badge ${item.purchased ? 'status-purchased' : 'status-available'}">
        ${item.purchased ? 'Purchased' : 'Available'}
      </span>
      <div class="admin-item-actions">
        ${item.purchased
          ? `<button class="btn-icon btn-icon-reset" title="Reset" onclick="adminResetItem('${item.id}')">↩</button>`
          : ''}
        <button class="btn-icon btn-icon-delete" title="Remove" onclick="adminDeleteItem('${item.id}')">✕</button>
      </div>`;

    list.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════════════════════════════════ */
let _cb = null;

function showConfirm(icon, title, body, label, cb) {
  document.getElementById('modal-icon').textContent        = icon;
  document.getElementById('modal-title').textContent       = title;
  document.getElementById('modal-body').textContent        = body;
  document.getElementById('modal-confirm-btn').textContent = label;
  _cb = cb;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  _cb = null;
}

document.getElementById('modal-confirm-btn').addEventListener('click', () => { if (_cb) _cb(); closeModal(); });
document.getElementById('confirm-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════════════ */
function showToast(emoji, message, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-emoji">${emoji}</span><span class="toast-msg">${esc(message)}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('toast-out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, 3200);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTIL
═══════════════════════════════════════════════════════════════════════════ */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════════════════ */
const THEME_LS_KEY = 'registry_theme';

/* ── All copy that changes per theme ──────────────────────────────────────── */
const THEME_COPY = {
  girl: {
    heroTitle:       'Welcome to Our<br /><em>Baby Girl</em> Registry',
    eyebrow:         'Baby Shower Registry',
    navLogo:         '💕 Baby Registry',
    registrySubtitle:'Browse our curated collection of items we\'d love for our little girl.',
    footerHeart:     '♡',
    footerTagline:   'Made with love for our baby girl',
  },
  boy: {
    heroTitle:       'Welcome to Our<br /><em>Baby Boy</em> Registry',
    eyebrow:         'Baby Shower Registry',
    navLogo:         '💙 Baby Registry',
    registrySubtitle:'Browse our curated collection of items we\'d love for our little boy.',
    footerHeart:     '💙',
    footerTagline:   'Made with love for our baby boy',
  },
};


function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const copy = THEME_COPY[theme] || THEME_COPY.girl;

  // hero title
  const titleEl = document.querySelector('.hero-title');
  if (titleEl) titleEl.innerHTML = copy.heroTitle;

  // all other text nodes
  const set = (id, val, prop = 'textContent') => {
    const el = document.getElementById(id);
    if (!el) return;
    if (prop === 'innerHTML') el.innerHTML = val; else el.textContent = val;
  };

  set('hero-eyebrow-text',  copy.eyebrow);
  set('nav-logo',           copy.navLogo);
  set('registry-subtitle',  copy.registrySubtitle);
  set('footer-heart',       copy.footerHeart);
  set('footer-tagline',     copy.footerTagline);

  // active button indicator
  ['girl','boy'].forEach(t => {
    document.getElementById(`theme-btn-${t}`)?.classList.toggle('active', t === theme);
  });
}

function switchTheme(theme) {
  localStorage.setItem(THEME_LS_KEY, theme);
  applyTheme(theme);
  const label = theme === 'boy' ? 'Baby Boy' : 'Baby Girl';
  const emoji = theme === 'boy' ? '💙' : '💕';
  showToast(emoji, `${label} theme applied!`, 'success');
}

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
applyTheme(localStorage.getItem(THEME_LS_KEY) || 'girl');
renderRegistry();
