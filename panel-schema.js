/* ==========================================================================
   СХЕМА ПРОЕКТА «РУНА» ДЛЯ ЯДРА ПАНЕЛИ (panel-core.js).

   Ядро одинаковое во всех сайтах и про формат data.js ничего не знает.
   Здесь сказано только: какие у вакансии поля и как разложить общий вид
   обратно в файл, который читает сайт: SITE / CATEGORIES / OFFERS.

   Порядок полей карточки = порядок полей в форме панели. Первые два поля
   (должность и работодатель) — подпись вакансии в списке панели.
   ========================================================================== */

window.ADMIN = {
  brand: 'РУНА',
  dataFile: 'data.js',
  draftKey: 'runa_admin_draft',
  preview: 'index.html?draft=1',

  /* erid печатаем, только если он реально есть в ссылке: у коротких ссылок
     clickplatform.ru его в адресе нет, и запрещать сохранение из-за этого нельзя. */
  requireErid: false,

  /* Вакансию без ссылки сайт показывает без кнопки — панель отмечает такие
     карточки в списке. */
  flagNoUrl: true,

  /* Блок «Логотип»: либо готовый файл, либо цветная плашка с инициалами.
     Цвет плашки сайт при необходимости затемняет сам. */
  logo: true,

  /* Строка вакансии на сайте тёмная — от неё ядро считает контраст плашки. */
  surface: '#100C1A',
  defaultTone: { bg: '#5B21B6', ink: '#FFFFFF' },

  /* Готовые логотипы из img/logos. Своя картинка грузится кнопкой
     «Выбрать файл…» в карточке. */
  presets: [
    { label: 'Работодатели на сайте', items: [
      { name: 'Альфа-Банк', value: 'img/logos/alfabank.png' },
      { name: 'Бургер Кинг', value: 'img/logos/burgerking.png' },
      { name: 'Купер', value: 'img/logos/kuper.png' },
      { name: 'МТС', value: 'img/logos/mts.png' },
      { name: 'Efin', value: 'img/logos/efin.png' }
    ] },
    { label: 'Другие работодатели', items: [
      { name: 'ВкусВилл', value: 'img/logos/vkusvill.png' },
      { name: 'Додо Пицца', value: 'img/logos/dodo.png' },
      { name: 'Магнит', value: 'img/logos/magnit.png' },
      { name: 'Пятёрочка', value: 'img/logos/pyaterochka.png' },
      { name: 'Самокат', value: 'img/logos/samokat.png' },
      { name: 'Яндекс Еда', value: 'img/logos/yandexeda.png' }
    ] }
  ],

  /* Только то, что сайт действительно показывает. */
  site: [
    { key: 'brand',   label: 'Название', required: true,
      hint: 'Стоит в заголовке вкладки браузера, в вопросах и в подвале. Логотип в шапке — картинка, она от этого поля не меняется.' },
    { key: 'tagline', label: 'Строка над заголовком',
      hint: 'Мелкая строка заглавными: «Агентство по подбору персонала».' },
    { key: 'title',   label: 'Заголовок, белая часть', required: true,
      hint: 'Первая строка главного заголовка: «Подберём работу».' },
    { key: 'titleAccent', label: 'Заголовок, фиолетовая часть',
      hint: 'Вторая строка заголовка фиолетовым: «в крупной компании». Можно оставить пустой.' },
    { key: 'lead',    label: 'Абзац под заголовком', type: 'textarea',
      hint: 'Два-три предложения о том, что человек найдёт на сайте.' },
    { key: 'telegram', label: 'Telegram для связи',
      hint: 'Ник без @ или ссылка t.me/… Пусто — ссылки в подвале нет.' },
    { key: 'updated', label: 'Дата проверки вакансий',
      hint: 'Печатается над списком и в подвале: «обновлено 10.11.2026».' }
  ],

  groups: [
    { key: 'title',  label: 'Название списка', required: true,
      hint: 'Заголовок над вакансиями: «Открытые вакансии». Если списков несколько — ещё и пункт меню.' },
    { key: 'lead',   label: 'Подпись под названием', type: 'textarea',
      hint: 'Одно предложение о списке. Можно оставить пустым.' },
    { key: 'cta',    label: 'Надпись на кнопках', required: true,
      hint: 'Одна на все вакансии списка: «Откликнуться».' }
  ],

  card: [
    { key: 'title',    label: 'Должность', required: true,
      hint: 'Крупная надпись в строке вакансии: «Оператор колл-центра».' },
    { key: 'partner',  label: 'Работодатель', required: true,
      hint: 'Компания: «МТС», «Купер». Печатается под должностью и в пометке «Реклама».' },
    { key: 'tag',      label: 'Формат работы',
      hint: 'Короткая подпись рядом с работодателем: «удалённая работа», «доставка заказов».' },
    { key: 'headline', label: 'Главное преимущество', required: true,
      hint: 'Фиолетовая строка: «Выплаты каждую неделю», «Работа из дома». Зарплату ставьте только ту, что называет работодатель в партнёрке.' },
    { key: 'note',     label: 'Пояснение к преимуществу',
      hint: 'Продолжение той же строки после тире: «помогать клиентам по телефону».' },
    { key: 'specs',    label: 'Условия', type: 'pairs',
      hint: 'По строке на условие, через двоеточие: «График: сменный». Сайт показывает первые три.' },
    { key: 'url',      label: 'Партнёрская ссылка', type: 'url',
      hint: 'Вставьте ссылку из партнёрки целиком, вместе с erid и метками. Пока пусто — вакансия на сайте без кнопки, а в списке панели пометка.' }
  ],

  /* ---------------------------------------------- чтение --------------- */

  load: function () {
    var groups = CATEGORIES.map(function (c) {
      return { key: c.id, title: c.label, lead: c.lead || '', cta: c.cta };
    });

    var seen = {};
    var cards = OFFERS.map(function (o, i) {
      /* Устойчивый ключ: в файле его нет, а ядру он нужен, чтобы не путать
         карточки при перестановке. Считаем от работодателя и должности. */
      var base = ((o.partner || '') + '-' + (o.title || '')).toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || ('c' + i);
      var uid = base, n = 2;
      while (seen[uid]) uid = base + '-' + (n++);
      seen[uid] = true;

      return {
        uid: uid,
        group: o.cat,
        hidden: !!o.hidden,
        title: o.title || '',
        partner: o.partner || '',
        tag: o.tag || '',
        headline: o.headline || '',
        note: o.note || '',
        specs: (o.specs || []).map(function (p) { return [p[0], p[1]]; }),
        url: o.url || '',
        logo: o.logo || '',
        /* Цвета плашки читаем всегда: даже у карточки с логотипом они
           переживают круговорот, иначе следующее сохранение затрёт выбор. */
        tone: { bg: (o.tone && o.tone.bg) || '#5B21B6', ink: (o.tone && o.tone.ink) || '#FFFFFF' }
      };
    });

    return {
      SITE: JSON.parse(JSON.stringify(SITE)),
      GROUPS: groups,
      CARDS: cards
    };
  },

  /* ---------------------------------------------- сборка файла --------- */

  build: function (m) {
    function js(v) { return JSON.stringify(v, null, 2); }
    function t(v) { return String(v == null ? '' : v).trim(); }

    var categories = m.GROUPS.map(function (g) {
      return { id: g.key, label: t(g.title), lead: t(g.lead), cta: t(g.cta) || 'Откликнуться' };
    });

    var offers = m.CARDS.map(function (c) {
      var o = {
        cat: c.group,
        title: t(c.title),
        partner: t(c.partner),
        tag: t(c.tag),
        logo: t(c.logo),
        tone: { bg: t(c.tone && c.tone.bg) || '#5B21B6', ink: t(c.tone && c.tone.ink) || '#FFFFFF' },
        headline: t(c.headline),
        note: t(c.note),
        specs: (c.specs || []).map(function (p) { return [t(p[0]), t(p[1])]; })
          .filter(function (p) { return p[0] || p[1]; }),
        url: t(c.url)
      };
      if (c.hidden) o.hidden = true;
      return o;
    });

    return [
      '/* ═════════════════════════════════════════════════════════════════════════',
      '   КАТАЛОГ «' + (t(m.SITE.brand) || 'РУНА').toUpperCase() + '» — единственный файл с вакансиями.',
      '   Собран панелью ' + new Date().toLocaleString('ru-RU') + '.',
      '',
      '   Правится через panel.html. Руками тоже можно, но при следующем',
      '   сохранении из панели правки будут перезаписаны.',
      '',
      '   cat      — раздел: jobs (или новый, заведённый в панели).',
      '   title    — должность, partner — работодатель, tag — формат работы.',
      '   url      — партнёрская ссылка. Пусто — вакансия без кнопки.',
      '   logo     — файл логотипа. Пусто — плашка с инициалами цвета tone.bg.',
      '   headline — главное преимущество, note — подпись рядом с ним.',
      '   specs    — пары «условие: значение», сайт показывает первые три.',
      '',
      '   ВАЖНО ПРО ЦИФРЫ: зарплату и доход ставьте только те, что называет сам',
      '   работодатель в вашей партнёрке, и с оговоркой про город. Цифра «на глаз» —',
      '   недостоверная реклама: партнёрка может снять оффер, а ФАС — оштрафовать.',
      '   ═════════════════════════════════════════════════════════════════════════ */',
      '',
      'const SITE = ' + js(m.SITE) + ';',
      '',
      '/* label — заголовок списка; lead — подпись под ним; cta — надпись на кнопках. */',
      'const CATEGORIES = ' + js(categories) + ';',
      '',
      'const OFFERS = ' + js(offers) + ';',
      ''
    ].join('\n');
  }
};
