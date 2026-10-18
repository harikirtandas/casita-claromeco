/* Mi Casita en Claromecó — interacciones */
(() => {
  'use strict';

  const C = window.CASITA || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0. Siempre arrancar arriba ─────────────────────────
     Los navegadores recuerdan dónde quedaste y al recargar te devuelven ahí.
     Si no hay un #ancla en la dirección, la página empieza desde el principio. */

  const alPrincipio = () => {
    if (location.hash) return;
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, 0); }
  };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  alPrincipio();
  window.addEventListener('load', alPrincipio);
  window.addEventListener('pageshow', alPrincipio);

  /* ── 1. Datos editables → página ────────────────────── */

  const tel = String(C.telefono || '').replace(/\D/g, '');
  const wsp = `https://wa.me/${tel}?text=${encodeURIComponent(C.mensajeWsp || '')}`;

  $$('[data-wsp]').forEach(a => {
    a.href = wsp;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  const telLink = $('#telLink');
  if (telLink) {
    telLink.href = `tel:+${tel}`;
    telLink.textContent = C.telefonoVisible || `+${tel}`;
  }

  const setText = (sel, txt) => { const n = $(sel); if (n && txt) n.textContent = txt; };
  setText('#precio', C.precio);
  setText('#precioDetalle', C.precioDetalle);
  setText('#direccion', C.direccion);

  const notas = $('#precioNotas');
  if (notas && Array.isArray(C.precioNotas)) {
    notas.innerHTML = '';
    C.precioNotas.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      notas.appendChild(li);
    });
  }

  /* ── 2. Mapa (OpenStreetMap, sin API key) ───────────── */

  const lat = Number(C.lat), lon = Number(C.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const d = 0.012;
    const bbox = [lon - d, lat - d * 0.72, lon + d, lat + d * 0.72].join('%2C');
    const mapa = $('#mapa');
    if (mapa) mapa.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

    const g = $('#mapsLink');
    if (g) g.href = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`;
  }

  /* ── 3. Aparición al scrollear ──────────────────────── */

  const aparecer = $$('.reveal');
  if (quieto || !('IntersectionObserver' in window)) {
    aparecer.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        const hermanos = Array.from(e.target.parentElement.children).filter(n => n.classList.contains('reveal'));
        const i = hermanos.indexOf(e.target);
        e.target.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`);
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    aparecer.forEach(el => io.observe(el));
  }

  /* ── 4. Nav que aparece + parallax del hero ─────────── */

  const nav = $('#nav');
  const fab = $('.fab');
  const heroImg = $('[data-parallax]');
  let ticking = false;

  const alScrollear = () => {
    const y = window.scrollY;
    const pasado = y > window.innerHeight * 0.55;
    nav && nav.classList.toggle('is-on', pasado);
    fab && fab.classList.toggle('is-on', pasado);

    if (heroImg && !quieto) {
      const r = heroImg.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        const avance = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0 → 1
        const desvio = (avance - 0.5) * r.height * 0.14;
        heroImg.style.transform = `scale(1.07) translate3d(0, ${desvio.toFixed(2)}px, 0)`;
      }
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(alScrollear);
  }, { passive: true });
  alScrollear();

  /* ── 5. Ver más fotos ───────────────────────────────── */

  const gal = $('#gal');
  const verMas = $('#verMas');
  if (gal && verMas) {
    // recién acá se recorta, así que sin JS se ven todas
    gal.classList.add('esta-recortada');
    verMas.parentElement.classList.add('esta-activa');

    verMas.addEventListener('click', () => {
      const nuevas = $$('.gal__i--mas', gal);
      gal.classList.remove('esta-recortada');
      verMas.setAttribute('aria-expanded', 'true');
      verMas.parentElement.classList.remove('esta-activa');

      nuevas.forEach((el, i) => {
        el.style.setProperty('--d', `${Math.min(i, 8) * 55}ms`);
      });
      requestAnimationFrame(() => nuevas.forEach(el => el.classList.add('is-in')));
      nuevas[0] && nuevas[0].focus({ preventScroll: true });
    });
  }

  /* ── 6. Lightbox de la galería ──────────────────────── */

  const lb     = $('#lb');
  const lbImg  = $('#lbImg');
  const lbCap  = $('#lbCap');
  const figs   = $$('#gal .gal__i');
  let actual   = 0;

  // currentSrc = el archivo que el navegador realmente eligió (avif o jpg)
  const fuente = (fig) => {
    const img = fig.querySelector('img');
    return img.currentSrc || img.src;
  };

  const mostrar = (i) => {
    actual = (i + figs.length) % figs.length;
    const fig = figs[actual];
    lbImg.src = fuente(fig);
    lbImg.alt = fig.querySelector('img').alt;
    lbCap.textContent = fig.querySelector('figcaption')?.textContent || '';
  };

  const abrir = (i) => {
    mostrar(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lb.classList.add('is-on'));
    $('#lbX').focus();
  };

  const cerrar = () => {
    lb.classList.remove('is-on');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 350);
  };

  figs.forEach((fig, i) => {
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.addEventListener('click', () => abrir(i));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); }
    });
  });

  $('#lbX').addEventListener('click', cerrar);
  $('#lbPrev').addEventListener('click', (e) => { e.stopPropagation(); mostrar(actual - 1); });
  $('#lbNext').addEventListener('click', (e) => { e.stopPropagation(); mostrar(actual + 1); });
  lb.addEventListener('click', (e) => {
    if (!e.target.closest('.lb__fig, .lb__nav, .lb__x')) cerrar();
  });

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     cerrar();
    if (e.key === 'ArrowLeft')  mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });

  // deslizar en el celular
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) mostrar(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
