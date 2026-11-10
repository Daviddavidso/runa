/* ═══════════════════════════════════════════════════════════════════════
   «РУНА» — тексты из панели, список вакансий, меню, появление блоков.

   Каталог объявлен глобальными const в data.js (или data.php на хостинге
   с PHP). const мимо window не переприсвоить, поэтому работаем с копиями:
   на адресе index.html?draft=1 вместо боевого файла подставляется черновик
   из панели управления.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var site   = typeof SITE       !== 'undefined' ? SITE       : {};
  var cats   = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  var offers = typeof OFFERS     !== 'undefined' ? OFFERS     : [];

  if (/[?&]draft/.test(location.search)) {
    try {
      var draftFile = localStorage.getItem('runa_admin_draft:file');
      if (draftFile) {
        var d = new Function(draftFile + '\n;return { SITE: SITE, CATEGORIES: CATEGORIES, OFFERS: OFFERS };')();
        site = d.SITE || site; cats = d.CATEGORIES || cats; offers = d.OFFERS || offers;
      }
    } catch (e) { /* битый черновик — показываем боевой каталог */ }
  }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── мелкие помощники ─────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function initials(name) {
    return String(name || '?').trim().split(/[\s,.-]+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function jobsWord(n) { return plural(n, 'вакансия', 'вакансии', 'вакансий'); }

  /* Ссылка считается настоящей, только если это http(s) с доменом через
     точку: «https://» из пустого поля панели кнопкой не становится. */
  function okLink(u) { return /^https?:\/\/[^\/\s?#]+\.[^\/\s?#]{2,}/i.test(String(u || '').trim()); }

  /* Маркировка: erid печатаем, только если он похож на номер. Заглушки
     вида erid=* или пустые хвосты пропускаем — выдумывать нельзя. */
  function eridOf(u) {
    var m = String(u || '').match(/[?&]erid=([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }

  /* Цвет плашки с инициалами затемняем, пока белый текст на ней не станет
     читаемым (4.5:1) — испортить контраст из панели нельзя. */
  function lum(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }).reduce(function (s, c, i) { return s + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function contrast(a, b) {
    var la = lum(a), lb = lum(b);
    if (la == null || lb == null) return 0;
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  /* Своя пара «фон — подпись» из панели остаётся как есть, если читается;
     иначе — белые инициалы на фоне, затемнённом до 4.5:1. */
  function tilePaint(tone) {
    if (tone && contrast(tone.bg, tone.ink) >= 4.5) return { bg: tone.bg, ink: tone.ink };
    return { bg: safeTone(tone && tone.bg), ink: '#FFFFFF' };
  }
  function safeTone(bg) {
    var h = String(bg || '').replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    if (lum(h) == null) return '#5B21B6';
    var rgb = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    for (var k = 0; k < 20; k++) {
      var hex = '#' + rgb.map(function (c) { return ('0' + Math.round(c).toString(16)).slice(-2); }).join('');
      if ((1.05) / (lum(hex) + 0.05) >= 4.5) return hex;
      rgb = rgb.map(function (c) { return c * 0.88; });
    }
    return '#3B1578';
  }

  /* ── данные ───────────────────────────────────────────────────────── */

  var live = offers.filter(function (o) { return !o.hidden; }).map(function (o, i) {
    return {
      i: i,
      cat: o.cat,
      title: String(o.title || '').trim(),
      partner: String(o.partner || '').trim(),
      tag: String(o.tag || '').trim(),
      headline: String(o.headline || '').trim(),
      note: String(o.note || '').trim(),
      specs: (o.specs || []).filter(function (p) { return p && (p[0] || p[1]); }).slice(0, 3),
      url: okLink(o.url) ? String(o.url).trim() : '',
      logo: String(o.logo || '').trim(),
      tone: o.tone || {}
    };
  });

  var byCat = {};
  live.forEach(function (o) { (byCat[o.cat] = byCat[o.cat] || []).push(o); });
  /* Пустой раздел не показываем вовсе: заголовок без вакансий — тупик. */
  var shownCats = cats.filter(function (c) { return (byCat[c.id] || []).length; });
  var total = shownCats.reduce(function (s, c) { return s + byCat[c.id].length; }, 0);

  /* Одинаковые должности у разных работодателей («Курьер» и «Курьер»):
     таким в заголовок дописываем работодателя — для списка заголовков
     экранного диктора. */
  var titleCount = {};
  live.forEach(function (o) { var k = o.title.toLowerCase(); titleCount[k] = (titleCount[k] || 0) + 1; });

  /* ── тексты сайта из панели ───────────────────────────────────────── */

  var brand = String(site.brand || '').trim();
  if (brand) {
    $all('[data-brand]').forEach(function (n) { n.textContent = brand; });
    $all('[data-brand-alt]').forEach(function (n) { n.setAttribute('alt', brand + ' — на главную'); });
    document.title = brand + ' — вакансии в крупных компаниях';
  }
  function setText(sel, value) {
    var v = String(value || '').trim();
    if (!v) return;
    $all(sel).forEach(function (n) { n.textContent = v; });
  }
  setText('[data-tagline]', site.tagline);
  setText('[data-lead]', site.lead);
  setText('[data-updated]', site.updated);
  /* Заголовок: белая часть обязательна, цветная может быть пустой. */
  if (String(site.title || '').trim()) {
    setText('[data-title]', site.title);
    $all('[data-title-accent]').forEach(function (n) {
      var a = String(site.titleAccent || '').trim();
      n.textContent = a;
      n.hidden = !a;
    });
  }

  /* Telegram в подвале: ник, @ник или ссылка t.me — всё приводим к ссылке. */
  var tg = String(site.telegram || '').trim()
    .replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/[\/?#].*$/, '');
  $all('[data-telegram]').forEach(function (box) {
    if (!/^[A-Za-z0-9_]{4,32}$/.test(tg)) { box.hidden = true; return; }
    var a = box.querySelector('a');
    if (a) { a.href = 'https://t.me/' + tg; a.querySelector('[data-tg-name]').textContent = '@' + tg; }
    box.hidden = false;
  });

  /* ── три факта под заголовком ─────────────────────────────────────── */

  var facts = document.getElementById('facts');
  if (facts) {
    var firms = {};
    live.forEach(function (o) { if (o.partner) firms[o.partner.toLowerCase()] = 1; });
    var nFirms = Object.keys(firms).length;
    var fact = function (num, label) {
      return '<li class="fact"><span class="fact__num">' + num + '</span> <span class="fact__label">' + label + '</span></li>';
    };
    /* Каталог пуст — «0 вакансий, 0 работодателей» только путает. */
    facts.hidden = !total;
    facts.innerHTML =
      fact(total, plural(total, 'открытая вакансия', 'открытые вакансии', 'открытых вакансий')) +
      fact(nFirms, plural(nFirms, 'работодатель', 'работодателя', 'работодателей')) +
      fact('0&nbsp;₽', 'стоит отклик');
  }

  /* ── меню ─────────────────────────────────────────────────────────── */

  /* Раздел один — в меню просто «Вакансии». Разделов несколько (их заводят
     в панели) — каждому свой пункт, чтобы до нужного списка был один шаг. */
  var navList = document.getElementById('nav-list');
  if (navList && shownCats.length > 1) {
    var firstStatic = navList.querySelector('[data-nav-static]');
    $all('[data-nav-cat]', navList).forEach(function (li) { li.remove(); });
    shownCats.forEach(function (c) {
      var li = document.createElement('li');
      li.setAttribute('data-nav-cat', '');
      li.innerHTML = '<a href="#' + esc(c.id) + '">' + esc(c.label) + '</a>';
      navList.insertBefore(li, firstStatic);
    });
  }

  /* ── вакансии ─────────────────────────────────────────────────────── */

  var ctaByCat = {};
  cats.forEach(function (c) { ctaByCat[c.id] = c.cta || 'Откликнуться'; });

  function jobHTML(o) {
    var cta = ctaByCat[o.cat] || 'Откликнуться';
    var id = 'o' + o.i;
    var name = o.title || o.partner;

    var paint = tilePaint(o.tone);
    var logo = o.logo
      ? '<span class="job__logo"><img src="' + esc(o.logo) + '" alt="" width="52" height="52" decoding="async"></span>'
      : '<span class="job__logo job__logo--text" style="background:' + esc(paint.bg) + ';color:' + esc(paint.ink) + '">' +
          esc(initials(o.partner || o.title)) + '</span>';

    var firm = (o.title && o.partner ? esc(o.partner) : '') +
      (o.title && o.partner && o.tag ? '<span class="job__sep" aria-hidden="true">·</span><span class="vh">, </span>' : '') +
      esc(o.tag);

    var gist = esc(o.headline) + (o.headline && o.note ? ' — ' : '') +
      (o.note ? '<span class="job__note">' + esc(o.note) + '</span>' : '');

    var specs = o.specs.map(function (p) {
      return '<li>' + (p[0] ? '<span class="job__k">' + esc(p[0]) + (p[1] ? ':' : '') + '</span> ' : '') + esc(p[1]) + '</li>';
    }).join('');

    /* Без noreferrer: часть партнёрок считает переход по Referer, и
       обрезанный заголовок теряет атрибуцию. noopener отрезает window.opener.

       Видимая надпись на всех кнопках одна, поэтому к ней дописано скрытое
       продолжение с должностью и работодателем: иначе в списке ссылок
       экранного диктора было бы пять одинаковых строк. Видимый текст стоит
       в начале имени дословно — голосовое управление его найдёт. */
    var erid = eridOf(o.url);
    var side = o.url
      ? '<div class="job__side">' +
          '<a class="btn job__btn" href="' + esc(o.url) + '" target="_blank" rel="sponsored nofollow noopener">' +
            '<span>' + esc(cta) + '</span>' +
            '<span class="vh">: ' + esc(name) + (o.partner && o.partner !== name ? ', ' + esc(o.partner) : '') +
              ' (откроется в новой вкладке)</span>' +
            '<svg class="ico btn__arrow" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>' +
          '</a>' +
          '<p class="job__ad">Реклама' + (o.partner ? ' · ' + esc(o.partner) : '') +
            (erid ? ' · <span class="job__erid">erid ' + esc(erid) + '</span>' : '') + '</p>' +
        '</div>'
      : '';

    var dup = o.title && o.partner && titleCount[o.title.toLowerCase()] > 1;

    return '' +
      '<li class="jobs__item"><article class="job' + (o.url ? '' : ' job--nolink') + '" aria-labelledby="' + id + '-name">' +
        logo +
        '<div class="job__main">' +
          '<h3 class="job__title" id="' + id + '-name">' + esc(name) +
            (dup ? '<span class="vh">, ' + esc(o.partner) + '</span>' : '') + '</h3>' +
          (firm ? '<p class="job__firm">' + firm + '</p>' : '') +
          (gist ? '<p class="job__gist">' + gist + '</p>' : '') +
        '</div>' +
        /* В разметке сначала условия, потом кнопка: так читает экранный
           диктор и так же вакансия складывается на телефоне. На широком
           экране кнопка встаёт справа от заголовка (сетка, без order). */
        (specs ? '<ul class="job__specs" role="list">' + specs + '</ul>' : '') +
        side +
      '</article></li>';
  }

  var catalog = document.getElementById('catalog');
  if (catalog) {
    var updated = String(site.updated || '').trim();
    catalog.innerHTML = shownCats.length ? shownCats.map(function (c) {
      var list = byCat[c.id];
      return '' +
        '<section class="board" id="' + esc(c.id) + '" aria-labelledby="' + esc(c.id) + '-title">' +
          '<div class="board__head">' +
            '<h2 class="board__title" id="' + esc(c.id) + '-title">' + esc(c.label) + '</h2>' +
            '<p class="board__meta">' + list.length + ' ' + jobsWord(list.length) +
              (updated ? '<span class="job__sep" aria-hidden="true">·</span><span class="vh">, </span>обновлено ' + esc(updated) : '') + '</p>' +
          '</div>' +
          (c.lead ? '<p class="board__lead">' + esc(c.lead) + '</p>' : '') +
          '<ul class="jobs" role="list">' + list.map(jobHTML).join('') + '</ul>' +
        '</section>';
    }).join('') : '<div class="board board--empty"><h2 class="board__title">Открытых вакансий сейчас нет</h2>' +
      '<p class="board__lead">Список обновляется — загляните немного позже.</p></div>';
  }

  /* ── мобильное меню ───────────────────────────────────────────────── */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var setOpen = function (open, focusBack) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      if (!open && focusBack) burger.focus();
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true', false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && burger.getAttribute('aria-expanded') === 'true') setOpen(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    /* Выросло окно — меню снова строкой в шапке, флаг сбрасываем. */
    var mq = matchMedia('(min-width: 900px)');
    var onMq = function () { if (mq.matches) setOpen(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* Шапка получает фон, когда страница уехала из-под неё. */
  var header = document.querySelector('.hdr');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── появление блоков ниже первого экрана ─────────────────────────── */

  /* Первый экран (заголовок и список вакансий) не анимируется вовсе: он
     должен быть виден сразу. Без наблюдателя или при «меньше движения»
     сразу видно всё. Класс js-reveal на <html> прячет блоки только тогда,
     когда скрипт точно жив и сможет их показать. */
  var revealEls = $all('.reveal');
  if (!reduce && 'IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Подстраховка: если наблюдатель так и не сработал (печать, скрытая
       панель предпросмотра), через 2,5 с показываем всё. */
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  }
})();
