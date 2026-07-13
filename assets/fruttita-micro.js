/* =============================================
   Fruttita Micro-Interactions & Design Details
   Global JS — scroll progress, cursor, surprises
   ============================================= */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------
     1. Scroll Progress Bar
  ------------------------------------------ */
  (function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'fruttita-scroll-progress';
    document.body.appendChild(bar);

    var ticking = false;
    function updateBar() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateBar);
        ticking = true;
      }
    }, { passive: true });

    updateBar();
  })();

  /* ------------------------------------------
     3. Cursor Follow Dot (desktop only)
  ------------------------------------------ */
  (function initCursorDot() {
    if (reducedMotion) return;
    var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktop) return;

    var dot = document.createElement('div');
    dot.className = 'fruttita-cursor-dot';
    document.body.appendChild(dot);

    var mouseX = 0, mouseY = 0;
    var dotX = 0, dotY = 0;
    var lerp = 0.15;
    var active = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        dot.classList.add('is-active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      active = false;
      dot.classList.remove('is-active');
    });

    // Hover detection for interactive elements
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        dot.classList.add('is-hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        dot.classList.remove('is-hover');
      }
    }, { passive: true });

    function tick() {
      dotX += (mouseX - dotX) * lerp;
      dotY += (mouseY - dotY) * lerp;
      dot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px)';
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ------------------------------------------
     10. Bottom Surprise
  ------------------------------------------ */
  (function initBottomSurprise() {
    var shown = false;
    var toast = document.createElement('div');
    toast.className = 'fruttita-bottom-surprise';
    var lang = document.documentElement.lang || 'en';
    if (lang.indexOf('pt') === 0) {
      toast.textContent = '\uD83C\uDF3F Chegaste ao fundo. Isso mostra que te importas. N\u00f3s tamb\u00e9m.';
    } else if (lang.indexOf('zh') === 0) {
      toast.textContent = '\uD83C\uDF3F \u4f60\u770b\u5230\u4e86\u8fd9\u91cc\uff0c\u8bf4\u660e\u4f60\u662f\u8ba4\u771f\u7684\u3002\u6211\u4eec\u4e5f\u662f\u3002';
    } else {
      toast.textContent = '\uD83C\uDF3F You scrolled all the way down. That means you care. So do we.';
    }
    document.body.appendChild(toast);

    window.addEventListener('scroll', function () {
      if (shown) return;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight - scrollTop <= 50) {
        shown = true;
        toast.classList.add('is-visible');
        setTimeout(function () {
          toast.classList.remove('is-visible');
        }, 5000);
      }
    }, { passive: true });
  })();

  /* ------------------------------------------
     5. Hand-drawn Section Dividers
  ------------------------------------------ */
  (function initSectionDividers() {
    var sections = document.querySelectorAll('main .shopify-section');
    if (sections.length < 2) return;

    var wavePath = 'M0,18 C60,14 120,24 200,16 C280,8 340,22 440,17 C540,12 600,24 720,16 C840,8 920,22 1040,17 C1160,12 1240,24 1340,18 C1400,14 1430,18 1440,17 L1440,30 L0,30 Z';

    for (var i = 0; i < sections.length - 1; i++) {
      var currentEl = sections[i].querySelector('div[class*="fruttita-"]');
      var nextEl = sections[i + 1].querySelector('div[class*="fruttita-"]');
      if (!currentEl || !nextEl) continue;

      var currentBg = getComputedStyle(currentEl).backgroundColor;
      var nextBg = getComputedStyle(nextEl).backgroundColor;
      if (currentBg === nextBg) continue;

      var divider = document.createElement('div');
      divider.className = 'fruttita-section-divider';
      divider.innerHTML = '<svg viewBox="0 0 1440 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="' + wavePath + '" fill="' + nextBg + '"/></svg>';
      currentEl.appendChild(divider);
    }
  })();

  /* ------------------------------------------
     Shared: Golden Dust Particle Canvas
  ------------------------------------------ */
  function initDustCanvas(container, count) {
    if (reducedMotion) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-dust-canvas';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var particles = [];
    var animId = null;
    var isVisible = true;

    function resize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 1.5,
        opacity: 0.15 + Math.random() * 0.25,
        speed: 0.2 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.3
      };
    }
    for (var i = 0; i < count; i++) { particles.push(createParticle()); }

    function draw() {
      if (!isVisible) { animId = null; return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(198, 129, 43, ' + p.opacity + ')';
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animId) draw();
      }, { threshold: 0.1 });
      obs.observe(container);
    }
    draw();
  }

  /* ------------------------------------------
     Homepage Hero Savanna Enhancement
  ------------------------------------------ */
  (function initHeroSavanna() {
    var hero = document.querySelector('.fruttita-origin-section');
    if (!hero) return;

    // --- 1. Grass Silhouettes (organic rounded tufts, matching baobab tree style) ---
    var farGrassSVG = '<svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0,60 L0,46 ' +
      'C60,44 100,38 160,40 C220,42 260,34 340,36 C420,38 480,30 560,33 ' +
      'C640,36 720,28 800,31 C880,34 960,26 1040,29 C1120,32 1200,25 1280,28 ' +
      'C1360,31 1400,35 1440,37 L1440,60 Z" fill="#E8C4A0"/></svg>';

    var nearGrassSVG = '<svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0,90 L0,62 ' +
      'C25,58 50,48 75,40 C95,34 110,32 125,36 C140,40 150,52 155,58 ' +
      'C168,50 185,32 205,18 C220,8 235,6 252,10 C268,18 278,38 285,50 ' +
      'C295,46 305,38 318,32 C328,26 338,24 348,28 C358,34 365,44 370,52 ' +
      'C385,46 405,30 430,20 C450,12 468,10 488,14 C505,20 518,38 525,48 ' +
      'C535,44 548,36 562,30 C575,24 585,22 598,26 C608,32 615,42 620,50 ' +
      'C632,44 650,26 672,12 C690,4 705,2 722,6 C738,12 750,30 758,44 ' +
      'C770,38 785,26 802,18 C818,10 832,8 848,12 C862,18 872,34 878,46 ' +
      'C890,40 905,32 920,26 C935,20 948,18 962,22 C975,28 982,40 988,50 ' +
      'C1000,42 1018,24 1040,12 C1058,4 1072,2 1090,6 C1105,12 1118,30 1125,44 ' +
      'C1138,38 1155,26 1175,18 C1192,10 1205,8 1222,12 C1238,18 1248,34 1255,46 ' +
      'C1268,40 1288,24 1312,14 C1332,6 1348,4 1368,10 C1385,18 1398,34 1408,46 ' +
      'C1418,42 1428,36 1436,32 L1440,30 L1440,90 Z" fill="#D4A87C"/>' +
      '<path d="M0,90 L0,68 ' +
      'C30,64 55,52 80,44 C100,36 118,34 135,38 C152,42 162,54 168,60 ' +
      'C180,54 198,38 220,26 C238,16 255,14 272,18 C290,24 302,42 308,52 ' +
      'C318,48 332,38 350,30 C368,22 382,20 398,24 C412,30 420,44 426,52 ' +
      'C440,46 458,30 482,20 C502,10 518,8 538,12 C556,18 568,36 575,48 ' +
      'C588,42 605,30 625,22 C642,14 656,12 672,16 C688,22 698,38 705,48 ' +
      'C718,42 738,26 762,14 C782,4 798,2 818,8 C835,14 845,32 852,44 ' +
      'C865,38 882,26 905,18 C925,10 940,8 958,14 C972,20 982,36 988,48 ' +
      'C1002,42 1020,28 1045,18 C1065,8 1080,6 1098,12 C1115,18 1125,34 1132,46 ' +
      'C1145,40 1165,26 1188,16 C1208,6 1225,4 1245,10 C1262,16 1272,34 1280,46 ' +
      'C1295,40 1315,26 1338,16 C1358,8 1375,12 1392,20 C1408,28 1425,40 1440,48 ' +
      'L1440,90 Z" fill="#E8C4A0"/></svg>';

    var farGrass = document.createElement('div');
    farGrass.className = 'hero-grass hero-grass--far';
    farGrass.innerHTML = farGrassSVG;

    var nearGrass = document.createElement('div');
    nearGrass.className = 'hero-grass hero-grass--near';
    nearGrass.innerHTML = nearGrassSVG;

    hero.appendChild(farGrass);
    hero.appendChild(nearGrass);

    // --- 2. Flying Birds ---
    var birdSVG = '<svg viewBox="0 0 28 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0,8 Q4,2 8,6 Q10,4 14,6 Q18,4 20,6 Q24,2 28,8" ' +
      'stroke="#F4E3C9" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>';

    var birdCount = window.innerWidth <= 768 ? 1 : 3;
    for (var i = 0; i < birdCount; i++) {
      var bird = document.createElement('div');
      bird.className = 'hero-bird hero-bird--' + (i + 1);
      bird.innerHTML = birdSVG;
      hero.appendChild(bird);
    }

    // --- 3. Subtitle Gold Shimmer ---
    var subtitle = hero.querySelector('.origin-subtitle');
    if (subtitle && !reducedMotion) {
      subtitle.classList.add('hero-shimmer');
    }

    // --- 4. Golden Dust Particles (Canvas) ---
    initDustCanvas(hero, window.innerWidth <= 768 ? 12 : 25);

    // --- 5. Mouse Parallax (desktop only) ---
    (function initParallax() {
      if (reducedMotion) return;
      var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!isDesktop) return;

      var tree = hero.querySelector('.origin-tree');
      var content = hero.querySelector('.origin-content');
      // nearGrass is captured from outer scope

      var targetX = 0, targetY = 0;
      var currentX = 0, currentY = 0;
      var lerpFactor = 0.08;
      var ticking = false;

      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      }, { passive: true });

      hero.addEventListener('mouseleave', function () {
        targetX = 0;
        targetY = 0;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      });

      function updateParallax() {
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;

        if (tree) {
          tree.style.transform = 'translate(' + (currentX * -8) + 'px, ' + (currentY * -4) + 'px)';
        }
        if (content) {
          content.style.transform = 'translate(' + (currentX * -4) + 'px, ' + (currentY * -2) + 'px)';
        }
        if (nearGrass) {
          nearGrass.style.transform = 'translate(' + (currentX * 15) + 'px, 0px)';
        }

        // Keep ticking if not settled
        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
          requestAnimationFrame(updateParallax);
        } else {
          ticking = false;
        }
      }
    })();
  })();

  /* ------------------------------------------
     Hero Banner Atmosphere (About & Baobab pages)
  ------------------------------------------ */
  (function initHeroBannerAtmosphere() {
    var banners = document.querySelectorAll('[class*="fruttita-hero-banner-"]');
    if (!banners.length) return;

    // Rounded grass SVG matching baobab tree illustration style
    var bannerGrassSVG = '<svg viewBox="0 0 1440 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0,50 L0,38 C60,36 120,30 200,32 C280,34 340,28 440,30 ' +
      'C540,32 600,26 700,28 C800,30 860,24 960,26 C1060,28 1120,22 1220,25 ' +
      'C1320,28 1380,32 1440,34 L1440,50 Z" fill="#E8C4A0"/>' +
      '<path d="M0,50 L0,35 C40,33 70,26 110,22 C140,18 160,17 185,20 ' +
      'C210,24 225,34 235,38 C250,34 270,24 300,18 C325,12 345,11 370,14 ' +
      'C392,18 405,30 415,36 C430,30 450,20 480,14 C505,8 525,7 548,12 ' +
      'C568,18 580,30 590,38 C605,32 625,22 652,14 C675,8 695,6 718,10 ' +
      'C738,15 750,28 758,36 C772,30 792,20 818,14 C840,8 858,6 880,10 ' +
      'C900,16 912,28 920,36 C935,30 955,20 982,14 C1005,8 1022,6 1045,10 ' +
      'C1065,16 1078,28 1085,36 C1100,30 1120,20 1148,14 C1172,8 1190,6 1212,10 ' +
      'C1232,16 1245,28 1252,36 C1268,30 1290,22 1315,16 C1338,10 1358,12 1378,18 ' +
      'C1398,24 1418,34 1440,38 L1440,50 Z" fill="#D4A87C"/></svg>';

    // Doodle templates
    var doodleCross = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
      '<path d="M7 2L7 12M2 7L12 7" stroke="rgba(244,227,201,0.12)" stroke-width="1" stroke-linecap="round"/></svg>';
    var doodleDot = '<svg width="5" height="5">' +
      '<circle cx="2.5" cy="2.5" r="2" fill="rgba(211,130,53,0.12)"/></svg>';
    var doodleEllipse = '<svg width="18" height="12" viewBox="0 0 18 12" fill="none">' +
      '<ellipse cx="9" cy="6" rx="7" ry="4" transform="rotate(-25 9 6)" fill="rgba(120,170,0,0.08)"/></svg>';

    var doodleConfigs = [
      { svg: doodleCross,   top: '12%', left: '8%',   delay: '0.5s' },
      { svg: doodleDot,     top: '22%', left: '15%',  delay: '0.9s' },
      { svg: doodleCross,   top: '16%', right: '26%', delay: '0.6s' },
      { svg: doodleDot,     bottom: '32%', right: '10%', delay: '1.1s' },
      { svg: doodleEllipse, bottom: '38%', left: '11%',  delay: '1.3s' }
    ];

    for (var b = 0; b < banners.length; b++) {
      var banner = banners[b];

      // 1. Grass at bottom
      var grass = document.createElement('div');
      grass.className = 'hero-banner-grass';
      grass.innerHTML = bannerGrassSVG;
      banner.appendChild(grass);

      // 2. Subtitle shimmer
      var subtitle = banner.querySelector('[class*="hero-subtitle-"]');
      if (subtitle && !reducedMotion) {
        subtitle.classList.add('hero-shimmer');
      }

      // 3. Doodle accents
      if (!reducedMotion) {
        for (var d = 0; d < doodleConfigs.length; d++) {
          var cfg = doodleConfigs[d];
          var el = document.createElement('div');
          el.className = 'hero-banner-doodle';
          el.innerHTML = cfg.svg;
          if (cfg.top) el.style.top = cfg.top;
          if (cfg.bottom) el.style.bottom = cfg.bottom;
          if (cfg.left) el.style.left = cfg.left;
          if (cfg.right) el.style.right = cfg.right;
          el.style.animationDelay = cfg.delay;
          banner.appendChild(el);
        }
      }

      // 4. Dust particles (fewer than homepage)
      initDustCanvas(banner, window.innerWidth <= 768 ? 8 : 15);
    }
  })();

  /* ------------------------------------------
     11. Custom Language Switcher
  ------------------------------------------ */
  (function initLangSwitch() {
    var iconsContainer = document.querySelector('.header__icons');
    if (!iconsContainer) return;

    var langs = [
      { code: 'en', path: '', label: 'English' },
      { code: 'zh', path: 'zh', label: '简体中文' },
      { code: 'pt', path: 'pt', label: 'Português' }
    ];

    // Detect current language from URL path
    var urlPath = window.location.pathname;
    var currentCode = 'en';
    langs.forEach(function (l) {
      if (l.path && (urlPath.indexOf('/' + l.path + '/') === 0 || urlPath === '/' + l.path)) {
        currentCode = l.code;
      }
    });
    var currentLang = langs.filter(function (l) { return l.code === currentCode; })[0];

    var el = document.createElement('div');
    el.className = 'fruttita-lang-switch';
    el.innerHTML =
      '<div class="fruttita-lang-switch__toggle">' +
        '<span>' + currentLang.label + '</span>' +
        '<svg class="fruttita-lang-switch__arrow" viewBox="0 0 10 6" fill="none">' +
          '<path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</div>' +
      '<div class="fruttita-lang-switch__menu">' +
        langs.map(function (l) {
          var href = l.path ? '/' + l.path + '/' : '/';
          return '<a href="' + href + '" class="fruttita-lang-switch__option' +
            (l.code === currentCode ? ' is-active' : '') + '">' +
            '<span>' + l.label + '</span>' +
            '<span class="fruttita-lang-switch__option-code">' + l.code.toUpperCase() + '</span>' +
          '</a>';
        }).join('') +
      '</div>';

    iconsContainer.appendChild(el);

    el.querySelector('.fruttita-lang-switch__toggle').addEventListener('click', function (e) {
      e.stopPropagation();
      el.classList.toggle('is-open');
    });

    document.addEventListener('click', function (e) {
      if (!el.contains(e.target)) el.classList.remove('is-open');
    });
  })();

  /* ------------------------------------------
     12. Logo Easter Egg (5 clicks in 3 seconds)
  ------------------------------------------ */
  (function initLogoEgg() {
    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'fruttita-logo-egg';
    var lang = document.documentElement.lang || 'en';
    var eggText, eggBtn;
    if (lang.indexOf('pt') === 0) {
      eggText = 'Fruttita \u2014 do italiano \u201cpequena fruta\u201d.<br><br>' +
        'Acreditamos que boa comida n\u00e3o precisa de uma lista complicada de ingredientes.<br>' +
        'Uma \u00e1rvore de m\u00facua, pura e simples, entregue at\u00e9 ti.';
      eggBtn = 'Entendido';
    } else if (lang.indexOf('zh') === 0) {
      eggText = 'Fruttita\uff0c\u6765\u81ea\u610f\u5927\u5229\u8bed\u201c\u5c0f\u6c34\u679c\u201d\u3002<br><br>' +
        '\u6211\u4eec\u76f8\u4fe1\uff0c\u597d\u7684\u98df\u7269\u4e0d\u9700\u8981\u590d\u6742\u7684\u914d\u6599\u8868\u3002<br>' +
        '\u4e00\u68f5\u732e\u5305\u6811\uff0c\u4e00\u4efd\u7eaf\u7cb9\uff0c\u9001\u5230\u4f60\u624b\u4e0a\u3002';
      eggBtn = '\u6211\u77e5\u9053\u4e86';
    } else {
      eggText = 'Fruttita \u2014 Italian for \u201clittle fruit.\u201d<br><br>' +
        'We believe good food doesn\u2019t need a complicated ingredient list.<br>' +
        'One baobab tree, pure and simple, delivered to you.';
      eggBtn = 'Got it';
    }
    overlay.innerHTML =
      '<div class="fruttita-logo-egg__icon">\uD83C\uDF33 \uD83E\uDD9C</div>' +
      '<div class="fruttita-logo-egg__text">' + eggText + '</div>' +
      '<button class="fruttita-logo-egg__close">' + eggBtn + '</button>';
    document.body.appendChild(overlay);

    overlay.querySelector('.fruttita-logo-egg__close').addEventListener('click', function () {
      overlay.classList.remove('is-visible');
    });

    // Find logo link in header
    var clicks = [];
    var logoSelector = '.header__heading-link, .header__heading a, a[href="/"]';

    document.addEventListener('click', function (e) {
      var logo = e.target.closest(logoSelector);
      if (!logo) return;

      var now = Date.now();
      clicks.push(now);
      // Keep only clicks within last 3 seconds
      clicks = clicks.filter(function (t) { return now - t < 3000; });

      if (clicks.length >= 5) {
        clicks = [];
        overlay.classList.add('is-visible');
      }
    });
  })();
})();
