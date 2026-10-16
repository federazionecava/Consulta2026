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

  // ---------- Tutte le sedi (celular) ----------
  // Cada provincia es un chip: al tocarlo se estira y muestra sus ciudades (una abierta por vez).
  // En desktop el botón de la provincia queda como texto y fuera del orden de tabulación.
  const provs = document.querySelectorAll('.localita dl > div');
  if (provs.length) {
    const mq = matchMedia('(max-width: 600px)');
    const dl = provs[0].parentElement;
    const items = [...provs].map((row) => {
      const dt = row.querySelector('dt');
      const dd = row.querySelector('dd');
      const sedi = dd.querySelectorAll('.sede');
      sedi.forEach((s, i) => s.style.setProperty('--i', i));
      dd.id = `prov-${dt.textContent.trim().toLowerCase().replace(/\W+/g, '-')}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prov';
      btn.setAttribute('aria-controls', dd.id);
      btn.innerHTML = `<span>${dt.textContent.trim()}</span><span class="prov-n" aria-hidden="true">${sedi.length}</span>`;
      dt.replaceChildren(btn);
      return { row, btn, dd };
    });

    // Ancho final de las ciudades: lo que miden en una línea, sin pasarse del ancho disponible
    const fit = ({ row, btn, dd }) => {
      dd.style.flexWrap = 'nowrap';
      const full = dd.scrollWidth;
      dd.style.flexWrap = '';
      const room = dl.clientWidth - btn.offsetWidth - (row.offsetWidth - row.clientWidth) - 8;
      return Math.max(0, Math.min(full, room));
    };
    const setOpen = (it, open) => {
      it.row.classList.toggle('is-open', open);
      it.btn.setAttribute('aria-expanded', String(open));
      it.dd.style.flexWrap = open ? 'wrap' : '';
      it.dd.style.maxWidth = open ? `${fit(it)}px` : '';
      it.dd.inert = mq.matches && !open;
    };
    const sync = () => items.forEach((it) => {
      it.btn.tabIndex = mq.matches ? 0 : -1;
      if (mq.matches) it.btn.setAttribute('aria-expanded', String(it.row.classList.contains('is-open')));
      else it.btn.removeAttribute('aria-expanded');
      if (it.row.classList.contains('is-open')) setOpen(it, mq.matches);
      else it.dd.inert = mq.matches;
    });

    items.forEach((it) => it.btn.addEventListener('click', () => {
      if (!mq.matches) return;
      const open = !it.row.classList.contains('is-open');
      items.forEach((o) => { if (o !== it && o.row.classList.contains('is-open')) setOpen(o, false); });
      setOpen(it, open);
    }));
    // Si se elige una ciudad desde el mapa o las rutas, se abre su provincia
    document.addEventListener('click', (e) => {
      if (!mq.matches || !e.target.closest('.route, .city, .hq')) return;
      const active = dl.querySelector('.sede.is-active');
      const it = active && items.find((o) => o.row.contains(active));
      if (!it || it.row.classList.contains('is-open')) return;
      items.forEach((o) => { if (o !== it) setOpen(o, false); });
      setOpen(it, true);
    });
    mq.addEventListener('change', sync);
    addEventListener('resize', () => items.forEach((it) => { if (it.row.classList.contains('is-open')) setOpen(it, true); }), { passive: true });
    sync();
  }

  // ---------- Compartir la propuesta ----------
  // En cada propuesta, al final: un botón que copia el link al portapapeles.
  const backWrap = document.querySelector('.hero-proposal') && document.querySelector('.back-wrap');
  if (backWrap) {
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = canonical ? canonical.href : location.href.split('#')[0];
    const icons =
      // Los nodos están corridos 1px a la izquierda: dos de los tres círculos están a la derecha
      // y así se ve centrado dentro del círculo.
      '<svg class="share-ico share-ico-share" viewBox="0 0 24 24" aria-hidden="true"><g transform="translate(-1 0)"><circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/></g></svg>' +
      '<svg class="share-ico share-ico-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const LABEL = 'Condividi la proposta';

    const copy = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) {}
        ta.remove();
        return ok;
      }
    };

    const live = document.createElement('span');
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'share';
    // Los dos textos están superpuestos: el botón no cambia de ancho al confirmar
    b.innerHTML =
      `<span class="share-icon">${icons}</span>` +
      `<span class="share-label"><span class="share-txt">${LABEL}</span><span class="share-txt share-txt-done" aria-hidden="true"></span></span>`;
    backWrap.prepend(b);

    const done = b.querySelector('.share-txt-done');
    let timer;
    b.addEventListener('click', async () => {
      const ok = await copy(url);
      b.classList.remove('is-copied', 'is-error');
      void b.offsetWidth; // reinicia la animación si se vuelve a tocar
      b.classList.add(ok ? 'is-copied' : 'is-error');
      done.textContent = ok ? 'Link copiato!' : 'Copia non riuscita';
      live.textContent = ok ? 'Link della proposta copiato negli appunti' : 'Non è stato possibile copiare il link';
      clearTimeout(timer);
      timer = setTimeout(() => b.classList.remove('is-copied', 'is-error'), 2400);
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
