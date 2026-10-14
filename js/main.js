// CAVA · Proposte — interacciones del sitio (sin dependencias).
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  // ---------- Reveal al hacer scroll ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  const markDone = (el) => {
    el.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'opacity') return;
      el.classList.add('is-done');
      el.removeEventListener('transitionend', done);
    });
  };
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in', 'is-done'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          markDone(e.target);
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---------- Nav ----------
  // - se compacta al bajar
  // - se vuelve clara cuando pasa sobre la hoja crema
  // - en la landing marca la sección en la que estás
  // - en las propuestas, después del hero, muestra "03 / 07 · título" con progreso de lectura
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const navProgress = document.querySelector('.nav-progress');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 40);

      // ¿Qué hay detrás de la nav? Si es la hoja crema, modo claro.
      const r = nav.getBoundingClientRect();
      const under = document.elementsFromPoint(innerWidth / 2, r.top + r.height / 2).find((el) => !nav.contains(el));
      nav.classList.toggle('is-light', !!(under && under.closest('.sheet')));

      if (nav.classList.contains('has-ctx') && hero) {
        nav.classList.toggle('is-ctx', y > hero.offsetHeight * 0.6);
      }
    }
    if (navProgress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      navProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Sección activa (solo en la landing, donde existen las secciones)
  const spyLinks = document.querySelectorAll('.nav [data-spy]');
  const spySections = [...spyLinks].map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
  if (spySections.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        spyLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.spy === e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach((s) => sio.observe(s));
    // En el hero no hay ninguna activa
    if (hero) new IntersectionObserver(([e]) => {
      if (e.isIntersecting) spyLinks.forEach((a) => a.classList.remove('is-active'));
    }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }
  // ---------- Menú ----------
  // Hay una hamburguesa en la nav principal y otra en el modo propuesta (celular)
  const burgers = document.querySelectorAll('.burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    burgers.forEach((b) => {
      b.setAttribute('aria-expanded', String(open));
      b.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    });
  };
  if (burgers.length && menu) {
    burgers.forEach((b) => b.addEventListener('click', () => setMenu(b.getAttribute('aria-expanded') !== 'true')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }
  // ---------- Mapa de la rete ----------
  const map = document.querySelector('.map');
  if (map) {
    // Resaltar una ruta al pasar el mouse / tocar su fila
    const routeButtons = document.querySelectorAll('.route[data-route]');
    const setRoute = (id) => {
      if (id) map.dataset.active = id; else delete map.dataset.active;
      map.querySelectorAll('[data-route]').forEach((el) => el.classList.toggle('is-active', el.dataset.route === id));
      routeButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.route === id));
    };
    routeButtons.forEach((b) => {
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setRoute(b.dataset.route); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setRoute(null); });
      b.addEventListener('focus', () => setRoute(b.dataset.route));
      b.addEventListener('blur', () => setRoute(null));
      b.addEventListener('click', () => setRoute(map.dataset.active === b.dataset.route ? null : b.dataset.route));
    });

    // Italia a la misma escala
    const toggle = document.querySelector('[data-italia]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const on = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(on));
        map.classList.toggle('show-italia', on);
        if (on) setRoute(null);
        // En celular el mapa queda arriba del botón: lo traemos a la vista
        if (on && matchMedia('(max-width: 860px)').matches) {
          map.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      });
    }
  }

  // ---------- Videos de fondo ----------
  // <video class="bg-video" data-src="video/xxx.mp4">: se carga solo cuando está en pantalla,
  // se pausa fuera de ella y, si el archivo todavía no existe, queda el gradiente.
  // Solo se omite con "ahorro de datos" activado (no con "reducir animaciones": muchas PCs
  // con Windows lo tienen activado y el video es parte del diseño).
  const videos = document.querySelectorAll('video[data-src]');
  if (!saveData && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (!v.src) {
            v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
            v.addEventListener('error', () => v.remove(), { once: true });
            v.src = v.dataset.src;
          }
          const p = v.play();
          if (p) p.catch(() => {});
        } else if (v.src) {
          v.pause();
        }
      });
    }, { threshold: 0.05 });
    videos.forEach((v) => vio.observe(v));
  }
})();
