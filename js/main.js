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
  // Se elige una localidad (en la lista o tocando el mapa): se dibuja el viaje desde Buenos Aires.
  // Con el mouse se previsualiza; con un clic queda elegida.
  const mapCol = document.querySelector('.map-col');
  if (mapCol) {
    const locBtns = document.querySelectorAll('.route[data-city], .sede[data-city]');
    let chosen = null;
    let shown = null;
    let touched = false;

    const show = (city) => {
      if (city) mapCol.dataset.active = city; else delete mapCol.dataset.active;
      mapCol.querySelectorAll('.route-svg').forEach((g) => g.classList.toggle('is-active', g.dataset.city === city));
      if (city && city !== shown) {
        const anim = mapCol.querySelector(`.route-svg[data-city="${city}"] animateMotion`);
        if (anim && anim.beginElement) anim.beginElement(); // el punto recorre el viaje
      }
      shown = city;
      mapCol.querySelectorAll('.city, .city-label').forEach((el) => el.classList.toggle('is-active', el.dataset.city === city));
      locBtns.forEach((b) => {
        const on = b.dataset.city === city;
        b.classList.toggle('is-active', on);
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
      });
    };
    const choose = (city) => {
      touched = true;
      chosen = chosen === city ? null : city;
      show(chosen);
    };
    const preview = (city) => (e) => { if (e.pointerType === 'mouse') show(city); };
    const restore = (e) => { if (e.pointerType === 'mouse') show(chosen); };

    // En celular, si el mapa no está a la vista, lo traemos
    const bringMap = () => {
      if (!matchMedia('(max-width: 860px)').matches) return;
      const r = mapCol.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) mapCol.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    };

    locBtns.forEach((b) => {
      const city = b.dataset.city;
      b.addEventListener('pointerenter', preview(city));
      b.addEventListener('pointerleave', restore);
      b.addEventListener('click', () => { choose(city); bringMap(); });
    });
    mapCol.querySelectorAll('.city, .hq').forEach((g) => {
      const city = g.dataset.city;
      g.addEventListener('pointerenter', preview(city));
      g.addEventListener('pointerleave', restore);
      g.addEventListener('click', () => choose(city));
    });

    // Al aparecer el mapa, arranca mostrando el viaje más largo (si todavía nadie tocó nada)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setTimeout(() => { if (!touched) { chosen = 'mendoza'; show(chosen); } }, 1600);
      }, { threshold: 0.4 });
      io.observe(mapCol);
    }

    // La rete / Italia alla stessa scala
    mapCol.querySelectorAll('.map-switch button').forEach((b) => {
      b.addEventListener('click', () => {
        const italia = b.dataset.view === 'italia';
        mapCol.classList.toggle('show-italia', italia);
        mapCol.querySelectorAll('.map-switch button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
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
