console.log('[brainrot] app.js v159-category-order loaded');
const SECTION_SCRIPT_SRC = {
  upgrader: '/upgrader.js?v=shop3',
  fuse: '/fuse.js?v=a3l1',
  ladder: '/ladder.js?v=a4l2',
  battle: '/battle.js?v=a26',
  caseEditor: '/case-editor.js?v=caseglow4',
  profileEditor: '/profile-editor.js?v=a2',
  dice: '/dice.js?v=a47',
  faq: '/faq.js?v=a2',
  quests: '/quests.js?v=a10rar',
  crash: '/crash.js?v=a17l2',
  event: '/event.js?v=a21',
  raffle: '/raffle.js?v=tagcase7',
  partnerBoard: '/partner-board.js?v=c4'
};
const _loadedSectionScripts = new Set();
const _loadingSectionScripts = new Map();
function loadSectionScript(name) {
  if (_loadedSectionScripts.has(name)) return Promise.resolve();
  if (_loadingSectionScripts.has(name)) return _loadingSectionScripts.get(name);
  const src = SECTION_SCRIPT_SRC[name];
  if (!src) return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => { _loadedSectionScripts.add(name); _loadingSectionScripts.delete(name); resolve(); };
    script.onerror = () => { _loadingSectionScripts.delete(name); reject(new Error(`Не удалось загрузить раздел "${name}". Проверь соединение.`)); };
    document.head.appendChild(script);
  });
  _loadingSectionScripts.set(name, promise);
  return promise;
}
const SECTION_HTML_TARGETS = {
  fuse: [{ container: 'fuseView', src: '/fuse-view.html?v=a1' }],
  upgrader: [{ container: 'upgraderView', src: '/upgrader-view.html?v=shop2' }],
  ladder: [{ container: 'ladderView', src: '/ladder-view.html?v=a1' }],
  battle: [
    { container: 'battleView', src: '/battle-view.html?v=a7' },
    { container: 'battleCreateModal', src: '/battle-modal-view.html?v=a2' }
  ],
  caseEditor: [{ container: 'caseEditorView', src: '/case-editor-view.html?v=caseglow4' }],
  dice: [{ container: 'diceView', src: '/dice-view.html?v=a11' }],
  faq: [{ container: 'faqView', src: '/faq-view.html?v=a3' }],
  quests: [{ container: 'questsView', src: '/quests-view.html?v=a3' }],
  crash: [{ container: 'crashView', src: '/crash-view.html?v=a1' }],
  event: [{ container: 'eventView', src: '/event-view.html?v=a11' }],
  raffle: [{ container: 'raffleView', src: '/raffle-view.html?v=b13' }]
};
const _loadedSectionHtml = new Set();
const _loadingSectionHtml = new Map();
function loadSectionHtml(name) {
  if (_loadedSectionHtml.has(name)) return Promise.resolve();
  if (_loadingSectionHtml.has(name)) return _loadingSectionHtml.get(name);
  const targets = SECTION_HTML_TARGETS[name];
  if (!targets) return Promise.resolve();
  const promise = Promise.all(targets.map(t => fetch(t.src).then(r => {
    if (!r.ok) throw new Error(`HTML "${t.src}" ${r.status}`);
    return r.text();
  }).then(html => {
    const container = document.getElementById(t.container);
    if (container) container.innerHTML = html;
  }))).then(() => { _loadedSectionHtml.add(name); _loadingSectionHtml.delete(name); })
    .catch(err => { _loadingSectionHtml.delete(name); throw err; });
  _loadingSectionHtml.set(name, promise);
  return promise;
}

const SECTION_CSS_SRC = {
  fuse: '/fuse.css?v=a4',
  upgrader: '/upgrader.css?v=shop2',
  ladder: '/ladder.css?v=a2',
  battle: '/battle.css?v=a7',
  dice: '/dice.css?v=a39',
  faq: '/faq.css?v=a2',
  quests: '/quests.css?v=a13rar',
  crash: '/crash.css?v=a2',
  event: '/event.css?v=a30',
  raffle: '/raffle.css?v=tagcase6'
};
const _loadedSectionCss = new Set();
const _loadingSectionCss = new Map();
function loadSectionCss(name) {
  if (_loadedSectionCss.has(name)) return Promise.resolve();
  if (_loadingSectionCss.has(name)) return _loadingSectionCss.get(name);
  const href = SECTION_CSS_SRC[name];
  if (!href) return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => { _loadedSectionCss.add(name); _loadingSectionCss.delete(name); resolve(); };
    link.onerror = () => { _loadingSectionCss.delete(name); reject(new Error(`Не удалось загрузить стили раздела "${name}".`)); };
    document.head.appendChild(link);
  });
  _loadingSectionCss.set(name, promise);
  return promise;
}

function loadSection(name) {
  const показать = markSectionBooting(name);
  const css = loadSectionCss(name);
  const script = loadSectionScript(name);
  const html = css.catch(() => {}).then(() => loadSectionHtml(name));
  return Promise.all([html, script, css]).finally(() => { if (показать) показать(); });
}

function markSectionBooting(view) {
  const el = document.getElementById(`${view}View`);
  if (!el) return null;
  const нужен = (SECTION_HTML_TARGETS[view] || SECTION_CSS_SRC[view]) && !_loadedSectionHtml.has(view);
  if (!нужен) return null;
  el.classList.add('section-booting');
  const страховка = setTimeout(() => el.classList.remove('section-booting'), 3000);
  return () => { clearTimeout(страховка); el.classList.remove('section-booting'); };
}

function escAttr(s) { return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escUrl(u) {
  const raw = String(u || '').trim();
  try {
    const parsed = new URL(raw, window.location.href);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#';
  } catch { return '#'; }
  return escAttr(raw);
}
window.addEventListener('error', function brainrotGlobalErrorGuard(event) {
  try {
    const msg = String(event?.message || '');
    if (msg.includes("Cannot set properties of null") || msg.includes("Cannot read properties of null")) {
      console.warn('[ui-null-guard]', msg);
      event.preventDefault();
      return true;
    }
  } catch {}
});
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#12081f');
  tg.setBackgroundColor('#0b0614');
}

const state = {
  spinSpeed: 'slow',
  currentSpinProfile: null,
  version: 'app', userId: 'demo-user', user: null, brainrots: [],brainrotMap: new Map(),cases: [],promo: null,liveDrops: [],selectedCaseId: null,openCount: 1,selectedFuseInventoryIds: [],selectedTargetId: null,selectedItemId: null,_ldrCfg: null,_fzCfg: null,currentView: 'home',spinning: false,previousView: 'home',authMode: 'unknown',authUser: null,_perm: false,pendingProtectedView: null,tgBotUsername: '', supportViaBot: false, supportBotUsername: '',tgLoginPollTimer: null,ladderSession: null,ladderBusy: false,selectedLadderStakeUid: null, ladderStoneCount: 1, _ldrMode: 'easy', battles: [], currentBattleId: null, currentBattle: null, battlePollTimer: null, battleAutoEnter: false, battleAnimating: false, promoTickTimer: null, liveDropsTimer: null, liveDropsStream: null, uiPerfMode: true, profileTab: 'balance',
  robloxAvatarUrl: null,
  robloxColors: null,
  closedFeatures: {},
  hiddenNav: {},
  honeyEvent: null,
  battleCreateMode: 'sidebar',
  depositCaseRewards: [],
  _mods: [],
  _superPerm: false,
  fontSettings: { numbersFont: 'Syne', fontWeight: '', fontStyle: '', fontSelector: '' },
  fontRules: [],
  textOverrides: [],
  freeCase: { enabled: false, caseId: null, caseName: null, caseEmoji: null, caseImage: null, intervalHours: 24 },
  freeCaseCountdownTimer: null,
  referralCase: { enabled: false, caseId: null, caseName: null, caseEmoji: null, caseImage: null, canClaim: false, hasReferral: false, claimed: false },
  rouletteSkips: [],
  pendingRouletteTimers: [],
  categoryOrder: [],
  liveDropConfig: { intervalMs: 2000, caseIds: [] },
  brainrotPool: { general: { enabled: false, ids: [] }, upgrader: { enabled: false, ids: [] }, cases: { enabled: false, ids: [] }, girsy: { enabled: false, ids: [] }, deposit: { enabled: false, ids: [] }, exchange: { enabled: false, ids: [] } },
  questCurrency: { name: 'Жетоны', icon: '🎫' },
  combCurrency: { name: 'Соты', icon: '🔶' },
  upgraderConfig: {},
  upgraderMutations: { enabled: true, minTargetValue: 5000 },
  outOfStockBrainrots: [],
  petDepositMinQty: {},
  wagerConfig: { enabled: false, multiplier: 5, blockWithdrawal: true },
  withdrawalQueueWindows: { enabled: false, windows: [] },
  withdrawalQueueSelectedWindow: null,
  palette: 'red'
};
window.state = state;

const LANGUAGE_STORAGE_KEY = 'brainrot-language';

const RU_TO_EN = new Map(Object.entries({
  "-й в очереди": "in the queue",
  "-кратном размере, какой бы цвет ты ни выбрал.": "times over, whatever color you picked.",
  "— брейнрот стоимостью": "— a brainrot worth",
  "— выбери кейс —": "— pick a case —",
  "— трать в ивентовых кейсах.": "— spend them in event cases.",
  "— ты": "— you",
  "— ты, пока без места": "— you, no rank yet",
  ", брейнрот": ", brainrot",
  ", затем жди подтверждения.": ", then wait for confirmation.",
  ", исключения бывают: подавайся, даже если сомневаешься.": ", but exceptions happen: apply even if you're not sure.",
  ", кейс": ", case",
  ", можно добавить ещё": ", you can add",
  ", не жди, пока трейд примут за тебя.": ", don't wait for someone else to accept the trade.",
  ", открыть кейс,": ", open a case,",
  ", процент с приведённых игроков и свои промокоды для розыгрышей.": ", a cut of every player you bring, and your own promo codes for giveaways.",
  ", совпадений": ", matches",
  ", сумма": ", total",
  ": ещё": ": another",
  "?\\n\\nВыбор делается один раз и потом не меняется.": "?\\n\\nYou pick once and it doesn't change.",
  ". Выбор сделан — поменять его может только поддержка.": ". Your pick is locked. Only support can change it.",
  ". Заявка отменена — попробуй создать её заново.": ". The request is cancelled. Create it again.",
  ". Новую заявку можно подать раз в сутки.": ". You can send one new request per day.",
  ". Откроется бот. Если счёт не появится автоматически, отправь в боте /deposit.": ". The bot will open. If the invoice doesn't show up on its own, send /deposit in the bot.",
  ". Сейчас можно забрать:": ". Right now you can take:",
  ". Теперь нажми нужный способ оплаты.": ". Now tap the payment method you want.",
  "· бонус ×": "· bonus ×",
  "· досрочно": "· early",
  "· от 2 шт": "· from 2 up",
  "· прокрутка…": "· spinning…",
  "· промокод": "· promo code",
  "· промокод ": "· promo code ",
  "\" укажи реальную ссылку в PAYMENT_LINKS внутри app.js.": "\" put a real link in PAYMENT_LINKS inside app.js.",
  "\". Проверь соединение.": "\". Check your connection.",
  "«Указать мутацию»": "“Set mutation”",
  "» и получи редких брейнротов": "» and pull rare brainrots",
  "» полностью? Это необратимо.": "» for good? There's no undo.",
  "» получен — теперь можно открыть его бесплатно!": "» is yours. Open it free now!",
  "(необязательно)": "(optional)",
  "(применяет шрифт только к 0–9, остальной текст не трогает)": "(applies the font to 0–9 only, leaves the rest alone)",
  "(промокод": "(promo code",
  "(промокод ": "(promo code ",
  "/3 · Итого": "/3 · Total",
  "/с (норма 60)\\n": "/s (60 is normal)\\n",
  "/с\\n": "/s\\n",
  "% бонус — зачислится": "% bonus — lands",
  "% бонус применён": "% bonus applied",
  "% от дохода субпартнёра.": "% of your sub-partner's earnings.",
  "%. Стрелка встала туда, цель твоя": "%. Arrow lands there, the target is yours",
  "%). Осталось сыграть:": "%). Left to play:",
  "%c[мёд]%c пасхалки активны: набери бжж (или bzz), 7 кликов по кнопке ивента, лови пчёл": "%c[honey]%c easter eggs are live: type bzz, 7 clicks on the event button, catch bees",
  "← Назад": "← Back",
  "← Назад к выбору брейнрота": "← Back to picking brainrots",
  "← Назад к кейсам": "← Back to cases",
  "← Назад к кейсу": "← Back to the case",
  "↩️ Отменено": "↩️ Cancelled",
  "+ Добавить": "+ Add",
  "+ Добавить правило": "+ Add a rule",
  "+ Создать батл": "+ New battle",
  " TOK зачислено на баланс": " TOK landed on your balance",
  "% бонус — зачислится ": "% bonus, you'll get ",
  "×1.0 бонус": "×1.0 bonus",
  "×1.8 бонус": "×1.8 bonus",
  "×3.2 бонус": "×3.2 bonus",
  "⏳ Ожидает": "⏳ Pending",
  "⏳ Ты в очереди": "⏳ You're in the queue",
  "⚠️ ПЕРВЫМИ нажмите READY и ACCEPT в трейде — иначе мы не сможем принять ваш депозит!": "⚠️ Hit READY and ACCEPT in the trade FIRST. Otherwise we can't take your deposit!",
  "✅ Депозит принят!": "✅ Deposit accepted!",
  "✅ Одобрено": "✅ Approved",
  "✏ Редактировать": "✏ Edit",
  "✓ Скопирован аккаунт!": "✓ Account copied!",
  "✓ Скопирован ник!": "✓ Nickname copied!",
  "✕ Удалить": "✕ Delete",
  "✨ Указать мутацию": "✨ Set mutation",
  "❌ Отклонено": "❌ Rejected",
  "❌ Трейд не удался": "❌ Trade didn't go through",
  "🌈 Бонус — автовыигрыш": "🌈 Bonus — auto win",
  "🌈 БОНУС! x": "🌈 BONUS! x",
  " — получено ": ", got ",
  "🍯 Пчелиный дайс, автовыигрыш": "🍯 Bee dice, auto win",
  "🎁 подарок": "🎁 gift",
  "🐝 Медовый дайс x": "🐝 Honey dice x",
  "👛 Пополнить": "👛 Top up",
  "📋 Скопировать аккаунт": "📋 Copy account",
  "📋 Скопировать ник": "📋 Copy nickname",
  "📤 Отправьте трейд в Рoблокс": "📤 Send the trade in Roblox",
  "🤝 Заявка уйдёт с пометкой, что тебя пригласил партнёр.": "🤝 We'll mark your application: a partner invited you.",
  "🚦 Депозит временно недоступен": "🚦 Deposits are paused right now",
  " Топ дроп за 24 часа": " Top drop in 24h",
  "Победители прошлого периода": "Last period's winners",
  "Главный приз ": "Top prize ",
  " предм.": " items",
  " раунд(ов) · режим зрителя": " round(s) · spectator mode",
  " раунд(ов)": " round(s)",
  "» и получи редких брейнротов`}. ": "» case and pull rare brainrots`}. ",
  " предметов в пуле.": " items in the pool.",
  " На каждой ступени можно забрать приз или рискнуть дальше.": " On every step you can take the prize or push your luck.",
  ", открыть кейс, ": " case, open case, ",
  " предметов": " items",
  " ДАЙСА": " DICE",
  " предметов · сумма весов: ": " items · total weight: ",
  "` : 'Предметы сгорели'}, сумма ": "` : 'Items burned'}, total ",
  " МСК": " MSK",
  " закрыто": " done",
  " предметов`)}": " items`)}",
  " TOK · убрать": " TOK · remove",
  " мин": " min",
  " — брейнрот стоимостью ": ", a brainrot worth ",
  ", брейнрот ": ", brainrot ",
  " предмет": " item",
  " выбрано": " selected",
  " пчёл. Это уже призвание.": " bees. That's a calling now.",
  " мёда": " honey",
  "%` : 'без бонуса'}": "%` : 'no bonus'}",
  " за мёд из ": " for honey from ",
  " за квест ивента": " per event quest",
  " за каждые ": " per ",
  " TOK ставок": " TOK wagered",
  "` : (getCurrentLanguage() === 'en' ? 'Battle player' : 'Игрок батла')}": "` : (getCurrentLanguage() === 'en' ? 'Battle player' : 'Battle player')}",
  "` : (getCurrentLanguage() === 'en' ? 'Battle participant' : 'Участник батла')}": "` : (getCurrentLanguage() === 'en' ? 'Battle participant' : 'Battle participant')}",
  " камн": " stone",
  " · бонус ×": " · bonus ×",
  " забрано": " claimed",
  " сгорел": " burned",
  " вывести нельзя — запаса мутировавших предметов у нас нет. Зато его можно разменять на обычных брейнротов, которых мы выведем, — по его цене с мутацией.": " can't be withdrawn: we don't stock mutated items. Swap it for regular brainrots we can deliver, at its price with the mutation.",
  " вывести нельзя, а разменять не получится — слишком низкая стоимость для обмена. Продай его за TOK через обычную продажу в инвентаре.": " can't be withdrawn, and it's too cheap to swap. Sell it for TOK from your inventory.",
  "0 предметов выбрано": "0 items selected",
  "0м": "0m",
  "0с": "0s",
  "1 камень": "1 stone",
  "1 раунд": "1 round",
  "1. Откройте Рoблокс и перейдите в игру": "1. Open Roblox and jump into the game",
  "2 камня": "2 stones",
  "2. Найдите пользователя": "2. Find the user",
  "24Ч": "24H",
  "3 камня": "3 stones",
  "3 раунда": "3 rounds",
  "4 ДАЙСА": "4 DICE",
  "4. После принятия трейда токены будут зачислены автоматически": "4. Once the trade goes through, your tokens land on their own",
  "5 брейнротов": "5 brainrots",
  "5 минут": "5 minutes",
  "5 раундов": "5 rounds",
  "5 шагов": "5 steps",
  "августа": "August",
  "Авто-вывод должен быть не меньше 1.01x": "Auto cash-out has to be at least 1.01x",
  "Авто-вывод на": "Auto cash-out at",
  "АВТО-ПРОМОКОД": "AUTO PROMO CODE",
  "Аккаунт освободился!": "Account just freed up!",
  "Активаций": "Redemptions",
  "Активировать": "Redeem",
  "Активность": "Activity",
  "Активные правила (": "Active rules (",
  "Активный": "Active",
  "Активных рефералов": "Active referrals",
  "Акцент-цвет": "Accent color",
  "Анкета": "Application",
  "Аноним": "Anonymous",
  "апгрейдер": "upgrader",
  "Апгрейдер": "Upgrader",
  "Апгрейдер — ставь предмет на колесе | Brainrot Battle": "Upgrader: put an item on the wheel | Brainrot Battle",
  "апгрейдер, upgrader, колесо, ставка предметом,": "upgrader, wheel, stake an item,",
  "Апгрейдов сделано": "Upgrades made",
  "апреля": "April",
  "Арт-деко · Изящный": "Art deco · Elegant",
  "Баланс": "Balance",
  "Баланс к выводу": "Ready to cash out",
  "Баланс обновлён": "Balance updated",
  "баланс пуст": "balance is empty",
  "Баланс пуст — нечего выводить": "Balance is empty — nothing to cash out",
  "Баланс:": "Balance:",
  "Балансы": "Balances",
  "Батл": "Battle",
  "Батл — дуэль на кейсах | Brainrot Battle": "Battle — a case duel | Brainrot Battle",
  "Батл в процессе": "Battle in progress",
  "Батл завершён": "Battle over",
  "Батл идёт": "Battle running",
  "Батл идёт… смотри анимацию по центру экрана.": "Battle's running. Watch the animation in the middle.",
  "Батл отменён": "Battle cancelled",
  "Батл создан": "Battle created",
  "батл, pvp, дуэль,": "battle, pvp, duel,",
  "Батлов сыграно": "Battles played",
  "батлы": "battles",
  "Батлы": "Battles",
  "Баттл": "Battle",
  "без бонуса": "no bonus",
  "без выплат.": "with no payouts.",
  "без мутации": "no mutation",
  "Без мутации": "No mutation",
  "без указания причины": "no reason given",
  "Без цвета": "No color",
  "Бесплатно": "Free",
  "Бесплатные токены за юзернейм": "Free tokens for your username",
  "Бесплатный кейс": "Free case",
  "Бесплатный кейс не настроен": "The free case isn't set up",
  "Близкий апгрейд": "Close upgrade",
  "Бой начинается…": "Fight's starting…",
  "Большой · Жирный": "Big · Bold",
  "Бонус": "Bonus",
  "БОНУС": "BONUS",
  "бонус, реферал, промокод,": "bonus, referral, promo code,",
  "Бонусы": "Rewards",
  "Бонусы — рефералы и промокоды | Brainrot Battle": "Rewards: referrals and promo codes | Brainrot Battle",
  "Бот напомнит за 15 минут кнопками «Забрать» и «Отменить».": "The bot pings you 15 minutes before with “Claim” and “Cancel” buttons.",
  "брейнрот": "brainrot",
  "Брейнрот": "Brainrot",
  "Брейнрот должен стоить от": "Brainrot has to be worth",
  "Брейнрот должен стоить от ": "Brainrot has to be worth ",
  "Брейнрот обновлён": "Brainrot updated",
  "Брейнрот стоимостью": "Brainrot worth",
  "Брейнрот стоимостью ": "Brainrot worth ",
  "брейнрота и желаемую цель.": "brainrots and your target.",
  "брейнрота. Сними один из слотов и попробуй снова.": "brainrots. Clear one of the slots and try again.",
  "брейнротов за один депозит": "brainrots per deposit",
  "Брейнроты": "Brainrots",
  "Брейнроты для обмена": "Brainrots to swap",
  "Бронза": "Bronze",
  "Бронь отменена": "Booking cancelled",
  "Будет убран": "Will be removed",
  "Быстрая": "Fast",
  "Быстрая прокрутка": "Quick spin",
  "Быстрая прокрутка включена": "Fast spin is on",
  "быстрый бой": "quick fight",
  "Быстрый прокрут": "Quick spin",
  "Быстрый фильтр": "Quick filter",
  "в день": "a day",
  "В инвентаре нет брейнротов для ставки.": "No brainrots in your inventory to stake.",
  "в личку от бота": "in a DM from the bot",
  "В настоящее время мы не можем обработать твой депозит": "We can't process your deposit at the moment",
  "В очереди на следующий раунд:": "Queued for the next round:",
  "В очереди на следующий раунд: ": "Queued for the next round: ",
  "В очереди:": "Queued:",
  "В очереди: ": "Queued: ",
  "В полёте": "In flight",
  "в трейде не хватало предметов": "the trade was missing items",
  "в трейде не хватало предметов — отправлено": "the trade was short on items — you sent",
  "в трейде не хватало предметов — отправлено ": "the trade was missing items: ",
  "в трейде оказалось больше предметов, чем нужно": "the trade had more items than it should",
  "в трейде оказалось больше предметов, чем нужно — отправлено": "the trade had more items than needed: you sent",
  "в трейде оказалось больше предметов, чем нужно — отправлено ": "the trade had more items than it should: ",
  " вместо ": " sent instead of ",
  "В этом периоде розыгрышей нет": "No raffles this period",
  "Валюта": "Currency",
  "Ваш инвентарь": "Your inventory",
  "Ваш ник в игре:": "Your in-game name:",
  "Введи код": "Enter a code",
  "ВВЕДИ КОД": "ENTER A CODE",
  "Введи код — получи бонус на баланс или предмет в инвентарь": "Enter a code and grab a balance bonus or an item",
  "Введи название": "Enter a name",
  "Введи название кода": "Name your code",
  "Введи свой ник в игре (минимум 2 символа).": "Enter your in-game name (2 characters minimum).",
  "Введи сумму депозита в токенах, чтобы увидеть эквивалент для выбранной валюты.": "Enter the deposit in tokens to see what it comes to in your currency.",
  "Введи сумму депозита, чтобы увидеть эквивалент для выбранной валюты.": "Enter the deposit to see what it comes to in your currency.",
  "Введи client seed.": "Enter a client seed.",
  "Введи nonce.": "Enter a nonce.",
  "Введите код": "Enter a code",
  "Введите пользователя и сумму.": "Enter a user and an amount.",
  "Введите CSS-селектор": "Enter a CSS selector",
  "Вернуться на главную": "Back home",
  "Вес": "Weight",
  "Весёлый · Неформальный": "Playful · Casual",
  "Виден": "Visible",
  "вместо": "instead of",
  "Внешний вид кейса сохранён": "Case look saved",
  "Внутри периода тебе достанется свой промежуток в 3 минуты. Быть на месте нужно именно в него.": "Inside that window you get your own 3-minute slot. That's when you need to be around.",
  "Военный · Жёсткий": "Military · Hard",
  "Военный терминал": "Military terminal",
  "Возврат с вывода": "Returned from a cash-out",
  "Возвращено": "Returned",
  "Возобновить": "Resume",
  "Войди в аккаунт": "Log in",
  "Войди через Telegram, чтобы начать": "Log in with Telegram to start",
  "Войди через Telegram, чтобы начать.": "Log in with Telegram to get going.",
  "Войди через Telegram, чтобы открыть кейс": "Log in with Telegram to open a case",
  "Войди, чтобы участвовать": "Sign in to join",
  "Впиши свой ник в Roblox": "Put in your Roblox name",
  "Временно недоступно — гирсы сейчас выводятся только через обмен": "Unavailable for now: gears only leave through a swap.",
  "Время забронировано": "Slot booked",
  "Время ожидания:": "Wait time:",
  "Всё время": "All time",
  "Все розыгрыши": "All raffles",
  "всего инвентаря": "of the whole inventory",
  "Всего к выплате": "Total payout",
  "Встаём в очередь...": "Getting in line…",
  "Встать в очередь": "Join the queue",
  "Втягивание брейнротов…": "Pulling brainrots in…",
  "Втягивание в ядро…": "Pulling into the core…",
  "Вход через бота": "Log in via bot",
  "Вы успешно получили кейс:": "You got the case:",
  "Вы успешно получили кейс: ": "Case is yours: ",
  "выберешь 1": "you pick 1",
  "Выбери": "Pick",
  "Выбери ": "Pick ",
  " брейнрота и желаемую цель.": " brainrots and your target.",
  "Выбери 4 брейнрота и желаемую цель.": "Pick 4 brainrots and the target you want.",
  "Выбери 4 брейнрота из инвентаря.": "Pick 4 brainrots from your inventory.",
  "Выбери брейнрот #": "Pick brainrot #",
  "Выбери брейнрота": "Pick a brainrot",
  "Выбери брейнрота для депозита": "Pick a brainrot to deposit",
  "Выбери брейнрота и начни раунд.": "Pick a brainrot and kick off the round.",
  "Выбери брейнрота из инвентаря": "Pick a brainrot from your inventory",
  "Выбери брейнрота из инвентаря, которым хочешь рискнуть.": "Pick a brainrot from your inventory to put on the line.",
  "Выбери брейнрота, введи свой ник в игре и отправь заявку — после проверки мы зачислим TOK на баланс.": "Pick a brainrot, enter your in-game name and send the request. We check it, then TOK lands on your balance.",
  "выбери вклад": "pick your stake",
  "Выбери гирсу, введи свой ник в игре и отправь заявку — после проверки мы зачислим TOK на баланс.": "Pick a gear, enter your in-game name and send the request. We check it, then TOK lands on your balance.",
  "Выбери кейс": "Pick a case",
  "Выбери кейс для батла.": "Pick a case for the battle.",
  "Выбери кейс и количество раундов. Создай батл или присоединись к открытому ниже.": "Pick a case and how many rounds. Start a battle or jump into an open one below.",
  "Выбери кейс и количество раундов. Стоимость спишется у обоих игроков только в момент старта батла.": "Pick a case and how many rounds. We charge both players only when the battle starts.",
  "Выбери кейс, создай батл или присоединись к открытому.": "Pick a case, start a battle or join an open one.",
  "Выбери недоступных для вывода брейнротов — можно сразу несколько. Взамен предложим то, что реально можно вывести.": "Pick the brainrots we can't withdraw, several at once. In return we'll offer ones we can deliver.",
  "Выбери нужное число брейнротов и желаемую награду": "Pick how many brainrots go in and what you want out",
  "Выбери период, точное время внутри него дадим автоматически": "Pick a window. We'll hand you the exact time inside it",
  "Выбери предметы для вывода": "Pick the items to cash out",
  "Выбери предметы из инвентаря. После отправки они сразу убираются и заявка уходит на ручную обработку.": "Pick items from your inventory. We take them out the moment you send and check the request by hand.",
  "Выбери предметы слева, чтобы увидеть предложения.": "Pick items on the left to see what we can offer.",
  "Выбери способ оплаты": "Pick a payment method",
  "Выбери способ оплаты, введи сумму и нажми пополнить счёт.": "Pick a payment method, enter the amount and hit top up.",
  "Выбери ставку": "Pick your stake",
  "Выбери формат игры и поднимайся по ступеням с разными множителями.": "Pick a mode and climb the steps, each with its own multiplier.",
  "Выбери хотя бы один предмет": "Pick at least one item",
  "Выбери хотя бы один предмет.": "Pick at least one item.",
  "Выбери хотя бы одного брейнрота": "Pick at least one brainrot",
  "Выбери хотя бы одного брейнрота выше.": "Pick at least one brainrot above.",
  "Выбери хотя бы одного брейнрота.": "Pick at least one brainrot.",
  "Выбери цель для Fuse.": "Pick what you're fusing into.",
  "Выбери, как тебя подписывать в этом списке. Выбор делается один раз и потом не меняется — пока не выбрал, стоишь как «Аноним».": "Choose how you're labelled in this list. You pick once and it doesn't change. Until then you stand as «Anonymous».",
  "Выбери, когда тебе удобно забрать": "Pick a time that works for you",
  "Выбери, когда тебе удобно забрать.": "Pick a time that works for you.",
  "Выбери:": "Pick:",
  "Выбери: ": "Pick: ",
  "Выберите способ оплаты": "Pick a payment method",
  "Выберите формат открытия кейса": "Pick how you want to open the case",
  "выбор": "pick",
  "Выбор кейса": "Picking a case",
  "Выбор мутации": "Picking a mutation",
  "Выбор ставки": "Picking a stake",
  "Выбор цвета": "Color pick",
  "Выбори ставку": "Pick a stake",
  "Выбран": "Picked",
  "Выбрана валюта:": "Currency picked:",
  "Выбрана валюта: ": "Currency picked: ",
  "выбрано": "selected",
  "Выбрано": "Picked",
  "Выбрано:": "Picked:",
  "Выбрано: ": "Picked: ",
  "Выбрано: 0/3 · Итого 0 TOK": "Picked: 0/3 · 0 TOK total",
  "Выбрать брейнрота...": "Choose a brainrot...",
  "Выбрать из инвентаря": "Pick from inventory",
  "Выбрать лучший дроп": "Pick the best drop",
  "Выбрать мутацию": "Pick a mutation",
  "Выбрать предмет": "Choose an item",
  "Выбрать предмет для ставки": "Choose an item to bet",
  "ВЫБРАТЬ СТАВКУ": "PICK A STAKE",
  "Выбрать цвет": "Pick a color",
  "Выбрать цель": "Pick a target",
  "ВЫБРАТЬ ЦЕЛЬ": "PICK A TARGET",
  "Выведено токенов": "Tokens cashed out",
  "Вывести": "Cash out",
  "вывести нельзя — запаса мутировавших предметов у нас нет. Зато его можно разменять на обычных брейнротов, которых мы выведем, — по его цене с мутацией.": "can't be cashed out. We keep no stock of mutated items. You can swap it for plain brainrots we do cash out, at its mutated price.",
  "вывести нельзя, а разменять не получится — слишком низкая стоимость для обмена. Продай его за TOK через обычную продажу в инвентаре.": "can't be cashed out, and it's too cheap to swap. Sell it for TOK the usual way from your inventory.",
  "Вывод": "Cash out",
  "Вывод доступен только по субботам с 12:00 до 20:00 МСК": "Cash-outs run on Saturdays only, 12:00–20:00 MSK",
  "Вывод доступен только по субботам с 12:00 до 20:00 МСК.": "Cash-outs run on Saturdays only, 12:00–20:00 MSK.",
  "ВЫВОД ПРЕДМЕТОВ": "ITEM CASH-OUT",
  "Выводить можно только брейнротов стоимостью от": "You can only cash out brainrots worth at least",
  "выдаётся, только если досидеть до конца": "only pays out if you sit it out to the end",
  "Выдано администрацией": "Given by the team",
  "Выдано:": "Given:",
  "Выдать": "Give",
  "Выдача баланса": "Giving balance",
  "Выигрыш справа": "Prize on the right",
  "выигрыш x": "pays x",
  "Выйти": "Log out",
  "выключен": "off",
  "выключено": "off",
  "Выключить": "Turn off",
  "Выпала альтернатива:": "Consolation drop:",
  "Выпала альтернатива: ": "Consolation drop: ",
  "Выплаты —": "Payouts —",
  "Выплачено всего": "Paid out in total",
  "Выполнено": "Done",
  "Выполнено ": "Done ",
  "%). Осталось сыграть: ": "%). Left to play: ",
  "Выполни задания": "Finish the tasks",
  "Выполняй задания и получай отдельную валюту, трать её на специальные кейсы.": "Do the tasks, earn a separate currency and spend it on special cases.",
  "Высокая контрастность · Люкс": "High contrast · Luxe",
  "Высокие заглавные": "Tall caps",
  "Высокий риск и самые жирные множители.": "High risk, fattest multipliers.",
  "Высота": "Height",
  "Генерируем ссылку для входа...": "Making you a login link…",
  "Генерируются варианты...": "Working out the options…",
  "Геометрический · Немецкий стиль": "Geometric · German",
  "Геометрический · Стильный": "Geometric · Stylish",
  "Геометрический · Чистый": "Geometric · Clean",
  "Геометрический · Элегантный": "Geometric · Elegant",
  "Геометрический квадратный": "Geometric square",
  "Гирсы": "Gears",
  "Главная": "Home",
  "Гостам батл недоступен.": "Guests can't join battles.",
  "Гостю нельзя открывать кейсы. Войди через Telegram.": "Guests can't open cases. Log in with Telegram.",
  "Гостям батл недоступен.": "Guests can't join battles.",
  "Готово": "Done",
  "Готово — забирай по части каждый день": "All set — claim a piece every day",
  "Гривны": "Hryvnia",
  "Грузим…": "Loading…",
  "д": "d",
  "Даём": "You get",
  "ДАЙСА": "DICE",
  "дайсы": "dice",
  "Дайсы": "Dice",
  "ДАЙСЫ": "DICE",
  "Далее": "Next",
  "Даунгрейд": "Downgrade",
  "Дашборд": "Dashboard",
  "Двадцать пять пчёл. Тебе бы отдохнуть.": "Twenty-five bees. Time for a break.",
  "Действие": "Action",
  "декабря": "December",
  "Денежный приз": "Cash prize",
  "день": "day",
  "День": "Day",
  "день · неделя · месяц": "day · week · month",
  "Депозит": "Deposit",
  "Депозит ": "Deposit ",
  " оплачен — зачислено ": " paid. ",
  "Депозит брейнротами временно недоступен.": "Brainrot deposits are paused right now.",
  "Депозит брейнротом": "Brainrot deposit",
  "Депозит гирсами": "Gear deposit",
  "Депозит засчитан": "Deposit counted",
  "Депозит отменён": "Deposit cancelled",
  "Депозит подтверждён": "Deposit confirmed",
  "Депозит принят!": "Deposit accepted!",
  "Депозит:": "Deposit:",
  "Депозит: ": "Deposit: ",
  "Депозитов пока нет.": "No deposits yet.",
  "Депозиты": "Deposits",
  "Десять. Официально пасечник.": "Ten. Officially a beekeeper.",
  "длинный сет": "long set",
  "Для вывода нужен вход в аккаунт": "You need to log in to cash out",
  "Для метода \"": "For the \"",
  "Для Fuse нужно выбрать 4 брейнрота.": "Fuse needs 4 brainrots.",
  "дн.": "d.",
  "Дневные": "Daily",
  "дней": "days",
  "дня": "days",
  "До": "Until",
  "до +": "up to +",
  " чел.": " more people",
  "до розыгрыша": "until the draw",
  "до TOK": "up to TOK",
  "Добавить": "Add",
  "Добавить брейнрот": "Add a brainrot",
  "Добавить в кейс": "Add to the case",
  "Добавить предмет": "Add an item",
  "добавлено в инвентарь": "added to your inventory",
  "Добавь тег нашего проекта к своему нику в Telegram и получай бесплатные токены каждый день!": "Put our tag in your Telegram name and collect free tokens every day!",
  "Доллары": "Dollars",
  "Доплата: -": "Top-up: -",
  "Доступен только пока идёт медовый ивент": "Available only while the honey event runs",
  "Доступен!": "Ready!",
  "Доступно": "Available",
  "Доступно через": "Available in",
  "Доступно через ": "Ready in ",
  "Доход": "Earnings",
  "Доход:": "Earnings:",
  "дрейф": "drift",
  "Другое": "Other",
  "Дружелюбный · Чёткий": "Friendly · Crisp",
  "дыхание": "breathing",
  "еженедельные": "weekly",
  "Если депозит отменился без понятной причины — просто создай заявку заново.": "If your deposit got cancelled for no clear reason, just send a new request.",
  "если есть": "if any",
  "Если отдал брейнротов, а депозит не зачислился — напиши в техподдержку:": "If you handed over brainrots and nothing landed, message support:",
  "Есть мутация? Нажми": "Got a mutation? Tap",
  "Ещё": "In",
  "Ещё не готово": "Not ready yet",
  "Ещё не открыл ни одного кейса": "Hasn't opened a single case yet",
  "Ещё нет лучшего дропа": "No best drop yet",
  "Ждём второго игрока": "Waiting for a second player",
  "Ждём второго игрока… Как только он присоединится, батл начнётся автоматически.": "Waiting for a second player… the battle starts the moment someone joins.",
  "Ждём свободный аккаунт — очередь ещё идёт": "Waiting for a free account. The queue's still moving",
  "Желаемые предметы": "Items you want",
  "Желаемый брейнрот": "The brainrot you want",
  "ЖЕЛАЕМЫЙ ПРЕДМЕТ": "WHAT YOU WANT",
  "Жёлтый": "Yellow",
  "жетонов": "tokens",
  "Жетоны": "Tokens",
  "Жирность": "Weight",
  "Жирный · Слегка скошенный": "Bold · Slightly slanted",
  "Жирный угловатый": "Bold and angular",
  "за": "for",
  "за день": "in a day",
  "за каждые": "per every",
  "за каждый успешный стейк от ": "for every completed stake of ",
  "за квест ивента": "per event quest",
  "за мёд из": "for honey from",
  "за месяц": "in a month",
  "за неделю": "in a week",
  "За реферала": "Per referral",
  "за успешный стейк": "for a stake that runs its course",
  "За этот период по твоим рефералам ещё ничего не произошло.": "Nothing from your referrals in this period yet.",
  "заберите его в инвентаре": "grab it in your inventory",
  "Забрал": "Cashed out",
  "Забрал ": "Cashed out ",
  "забрано": "claimed",
  "Забрано": "Claimed",
  " TOK — стейк завершён": " TOK claimed. Stake closed.",
  " TOK — стейк завершён. ": " TOK claimed. Stake closed. ",
  "Забрано:": "Claimed:",
  "Забрано: ": "Claimed: ",
  "Забрать": "Claim",
  "Забрать ": "Cash out ",
  "Забрать всё и закрыть досрочно": "Take everything and close early",
  "Забрать приз": "Take the prize",
  "забрать раньше срока нельзя": "you can't take it early",
  "ЗАБРАТЬ РЕФЕРАЛЬНЫЙ КЕЙС": "CLAIM THE REFERRAL CASE",
  "Забрать!": "Claim it!",
  "Завтра": "Tomorrow",
  "Загрузка...": "Loading…",
  "задепано": "deposited",
  "закрыто": "done",
  "Закрыто": "Closed",
  "ЗАКРЫТО": "CLOSED",
  "Закрыть": "Close",
  "Закрыть стейк досрочно? Вернётся уже созревшее плюс остаток вложенного, но надбавка за незавершённые дни не начислится.": "Close the stake early? You get back what's matured plus the rest of what you put in, but no bonus for the days you skipped.",
  "Заметки · Ручной": "Notes · Handwritten",
  "Заморожено": "Locked",
  "Заморожено за всё время": "Locked all time",
  "Заморозить": "Lock",
  "Заморозка": "Freeze",
  "Заморозка ": "Your locked ",
  " TOK придёт последней частью": " TOK comes back in the final piece",
  "Заморозь TOK и забирай их обратно частями — по одной каждые сутки. Чем дольше срок, тем больше сверху.": "Lock up TOK and take it back in pieces, one a day. The longer the term, the more you get on top.",
  "записей": "entries",
  "записи": "entries",
  "запись": "entry",
  "Заполни хотя бы одну площадку: канал, YouTube или TikTok.": "Fill in at least one platform: Telegram, YouTube or TikTok.",
  "Заполни telegram-auth.json: botUsername и botToken.": "Fill in telegram-auth.json: botUsername and botToken.",
  "Заполни telegram-bot-login.json: botUsername и botToken.": "Fill in telegram-bot-login.json: botUsername and botToken.",
  "Заполни userId и текст ответа": "Fill in the userId and the reply text",
  "Заполнить анкету": "Fill in the form",
  "Запустить Fuse": "Run the fuse",
  "Заработано всего": "Earned in total",
  "Заработано с них": "Earned from them",
  "Заработано сверху": "Earned on top",
  "зачислен": "credited",
  "зачислен на баланс.": "landed on your balance.",
  "зачислено на баланс": "landed on your balance",
  "Заявка": "Request",
  "Заявка ": "Request ",
  " создана. Оплати через ": " created. Pay with ",
  " создана, жди трейд в своё время.": " created. Wait for the trade at your slot.",
  "Заявка на вывод создана": "Cash-out request created",
  "Заявка на депозит отменена.": "Deposit request cancelled.",
  "Заявка на депозит создана": "Deposit request created",
  "заявка на рассмотрении": "under review",
  "Заявка на рассмотрении...": "Under review…",
  "Заявка отклонена:": "Request rejected:",
  "Заявка отклонена: ": "Request rejected: ",
  "Заявка отменена, предметы возвращены": "Request cancelled, items are back",
  "Заявка отменена.": "Request cancelled.",
  "Заявка отправлена": "Request sent",
  "Заявка отправлена — ответ придёт в личку от бота": "Request sent. The bot will DM you the answer",
  "Заявка уже подана": "You've already applied",
  "Заявку одобрили — с тобой свяжется менеджер.": "You're approved. A manager will reach out.",
  "Заявок на вывод": "Cash-out requests",
  "Заявок на вывод пока нет.": "No cash-out requests yet.",
  "Заявок пока нет.": "No requests yet.",
  "ЗВЁЗДЫ": "STARS",
  "Звук": "Sound",
  "Звук включён": "Sound on",
  "Звук выключен": "Sound off",
  "Здесь появятся закрытые стейки — сколько заморозил и сколько вернулось.": "Closed stakes show up here: what you locked and what came back.",
  "Зелёный": "Green",
  "Золото": "Gold",
  "и": "and",
  "и ещё": "and",
  "и участвуй в уникальном розыгрыше!": "and you're in a one-of-a-kind draw!",
  "Ивент": "Event",
  "Ивент не идёт": "No event running",
  "Игрок": "Player",
  "Игрок 1": "Player 1",
  "Игрок 2": "Player 2",
  "Игрок батла": "Battle player",
  "Игроки:": "Players:",
  "Извиняемся за предоставленные неудобства.": "Sorry for the hassle.",
  "Иконки предметов сохранены": "Item icons saved",
  "Иконки сохранены": "Icons saved",
  "Инвентарь": "Inventory",
  "ИНВЕНТАРЬ": "INVENTORY",
  "Инвентарь для Fuse": "Fuse inventory",
  "Инвентарь пуст": "Inventory is empty",
  "Инвентарь пуст.": "Your inventory is empty.",
  "Иногда бывают очереди — в такие моменты придётся немного подождать своего места.": "Sometimes there's a queue, and then you wait a bit for your turn.",
  "Исключён из пресетов, нажми чтобы включить": "Excluded from presets — tap to switch on",
  "Истёк": "Expired",
  "истёк — создай новый.": "expired. Create a new one.",
  "истёк. Создай новый счёт.": "expired. Make a new invoice.",
  "истекло время ожидания — трейд не был отправлен вовремя": "timed out — the trade wasn't sent in time",
  "История": "History",
  "История батлов": "Battle history",
  "История заявок": "Request history",
  "История пока пустая.": "Nothing here yet.",
  "История промокодов": "Promo code history",
  "История раундов": "Round history",
  "исчерпан": "used up",
  "Итого за период:": "Total for the period:",
  "Итого: ": "Total: ",
  "Ищем свободное место...": "Looking for a free slot…",
  "июля": "July",
  "июня": "June",
  "К выводу": "For cash-out",
  "К оплате в выбранной валюте:": "To pay in your currency:",
  "кадров ракеты :": "rocket fps :",
  "кадров ракеты : ": "rocket fps : ",
  "кадров экрана :": "screen fps :",
  "кадров экрана : ": "screen fps : ",
  "Каждую неделю": "Every week",
  "каждые": "every",
  "Каждые": "Every",
  "каждые ": "every ",
  "Каждые 2 часа новый бонус к депозиту": "A fresh deposit bonus every 2 hours",
  "каждые сутки": "every 24 hours",
  "Каждый день": "Every day",
  "Каждый месяц": "Every month",
  "как в прошлый раз": "same as last time",
  "Как тебя подписывать": "How you're labelled",
  "Как только освободится место, окно с инструкциями откроется автоматически — ничего нажимать не нужно.": "The moment a slot frees up, the instructions pop up on their own. Nothing to press.",
  "Каллиграфия · Живой": "Calligraphy · Lively",
  "камень": "stone",
  "камней": "stones",
  "камня": "stones",
  "КАРТЫ": "CARDS",
  "Категория": "Category",
  "Квест выполнен! +": "Quest done! +",
  " мёда 🍯": " honey 🍯",
  "Квест выполнен! Получен кейс «": "Quest done! You got the «",
  "Квесты": "Quests",
  "Квесты — выполняй задания за награду | Brainrot Battle": "Quests — finish tasks, get rewards | Brainrot Battle",
  "квесты, задания, награда,": "quests, tasks, rewards,",
  "Квесты, которые живут только пока открыт улей. Закончится ивент, исчезнут вместе с ним.": "Quests that live only while the hive is open. When the event ends, they go with it.",
  "кейс": "case",
  "Кейс": "Case",
  "Кейс «": "Case «",
  "Кейс ": "The ",
  "Кейс возобновлён": "Case resumed",
  "Кейс временно закрыт или временно закончился.": "This case is closed or out of stock right now.",
  "Кейс для батла": "Case for the battle",
  "Кейс доступен через": "Case unlocks in",
  "Кейс доступен через ": "Case unlocks in ",
  "Кейс ещё не готов": "This case isn't ready yet",
  "Кейс на паузе": "Case paused",
  "Кейс не найден": "Case not found",
  "Кейс не найден.": "Case not found.",
  "Кейс помечен «Скоро»": "Case marked «Soon»",
  "Кейс приостановлен": "Case paused",
  "Кейс снова за TOK": "Case is back to TOK",
  "Кейс теперь за жетоны": "Case now costs chips",
  "Кейс теперь за соты": "Case now costs honeycombs",
  "Кейс теперь только на время ивента": "Case is now event-only",
  "Кейс удалён": "Case deleted",
  "Кейс уже получен или недоступен": "You already got this case, or it's unavailable",
  "Кейс:": "Case:",
  "Кейс: ": "Case: ",
  "Кейс: Открытие": "Case: opening",
  "кейсбатл": "case battle",
  "Кейсбатл": "Case battle",
  "кейсов": "cases",
  "Кейсов открыто": "Cases opened",
  "Кейсы": "Cases",
  "Кейсы не загрузились. Проверь db.json или перезапусти сервер.": "Cases failed to load. Check db.json or restart the server.",
  "Кейсы не найдены. Если это ошибка — обнови страницу.": "No cases found. If that looks wrong, refresh the page.",
  "кино": "cinema",
  "Кириллица · Жирный rounded": "Cyrillic · Bold rounded",
  "классика": "classic",
  "Классический сжатый": "Classic condensed",
  "Классический Garamond": "Classic Garamond",
  "Клик по брейнроту откроет его отдельную страницу.": "Tap a brainrot to open its page.",
  "Клики, кейсы, дайсы, краш, апгрейдер — всё разом. Выключается на этом устройстве и запоминается.": "Clicks, cases, dice, crash, upgrader: all of it. Turns off on this device and stays off.",
  "Кнопка видна": "Button visible",
  "Кнопка скрыта": "Button hidden",
  "Когда забирать": "When to claim",
  "Когда положишь брейнрота в трейд —": "Once your brainrot is in the trade —",
  "Код · Читаемый": "Code · Readable",
  "Код активирован!": "Code redeemed!",
  "Код входа истёк. Попробуй ещё раз.": "The login code expired. Try again.",
  "Код спишет всю стоимость (сумма × активации) с твоего баланса сразу. Каждый, кто его введёт, получит TOK и закрепится за тобой рефералом.": "The code charges the full cost (amount × redemptions) to your balance up front. Everyone who enters it gets TOK and becomes your referral.",
  "Код спишет стоимость кейса × активации с твоего баланса сразу. Каждый, кто его введёт, получит кейс в инвентарь и закрепится за тобой рефералом.": "The code charges case price × redemptions to your balance up front. Everyone who enters it gets the case and becomes your referral.",
  "Код уже использован.": "That code is already used.",
  "Кол-во депозитов": "Deposits",
  "Количество шагов": "Number of steps",
  "Комиксный · Мощный": "Comic · Punchy",
  "Комиссия": "Fee",
  "Компактный моноспейс": "Compact monospace",
  "Кому отдать": "Who to hand it to",
  "копировать": "copy",
  "Копится за квесты ивента.": "Builds up from event quests.",
  "Короткая анимация в апгрейдере и дайсах. То же, что кнопка ⚡ в самих разделах.": "Short animation in the upgrader and dice. Same as the ⚡ button inside those sections.",
  "Коротко: кого берём и что даём.": "Short version: who we take and what you get.",
  "Космический · Ретро-терминал": "Space · Retro terminal",
  "КОШЕЛЬКИ": "WALLETS",
  "Коэф. расчёта": "Payout coefficient",
  "Красный": "Red",
  "Крах": "Bust",
  "Краш": "Crash",
  "Краш — забери выигрыш до краша | Brainrot Battle": "Crash — cash out before the bust | Brainrot Battle",
  "краш, crash, aviator, множитель,": "crash, aviator, multiplier,",
  "Крашнулся на": "Busted at",
  "Крашнулся на ": "Busted at ",
  "Крипта": "Crypto",
  "КРИПТА": "CRYPTO",
  "Крипто-эквайринг": "Crypto acquiring",
  "Круг": "Lap",
  "Круг ": "Lap ",
  "Круг 1/1": "Lap 1/1",
  "Кто привёл больше всех. Видно только промокод.": "Who brought the most players. You see only the promo code.",
  "Кто пригласил (если есть)": "Who invited you (if anyone)",
  "легенда": "legend",
  "Легкая": "Easy",
  "лезвие": "blade",
  "лесен": "ladder",
  "Лесенка": "Ladder",
  "Лесенка — рискуй и умножай | Brainrot Battle": "Ladder — push your luck, multiply | Brainrot Battle",
  "Лесенка не настроена.": "The ladder isn't set up.",
  "лесенка, ladder, множитель ставки,": "ladder, bet multiplier,",
  "Лигатуры · Программирование": "Ligatures · Coding",
  "Личный код и ссылка для аудитории": "Your own code and link for your audience",
  "личный код и ссылку": "your own code and link",
  "Лучший день": "Best day",
  "Лучший дроп": "Best drop",
  "Лучший дроп за последние 24 часа": "Best drop of the last 24 hours",
  "Любой кейс": "Any case",
  "любой срок": "any term",
  "м": "m",
  "Магазин обменов": "Exchange shop",
  "Макс. порог": "Max threshold",
  "Максимальный уровень достигнут 👑": "Max level reached 👑",
  "максимум": "max",
  "Максимум": "Max",
  "Максимум ": "Max ",
  " брейнротов за один депозит": " brainrots per deposit",
  "максимум ": "max ",
  " предметов за раз": " items at a time",
  "Максимум 50 предметов": "Max 50 items",
  "марафон": "marathon",
  "Маркер · Граффити": "Marker · Graffiti",
  "марта": "March",
  "мая": "May",
  "МЁД": "HONEY",
  "Мёд копится за активность в ивенте.": "Honey builds up from event activity.",
  "Мёд копится:": "Honey builds up:",
  "Мёд копится: ": "Honey builds up: ",
  "Мёд на шкале": "Honey on the bar",
  "Мёд пошёл. Не поскользнись.": "Honey's flowing. Watch your step.",
  "мёда": "honey",
  "мёда 🍯": "honey 🍯",
  "мёда собрано": "honey collected",
  "Медленная": "Slow",
  "Медовые квесты": "Honey quests",
  "Медовые кейсы пока не завезли. Загляни попозже.": "No honey cases yet. Check back later.",
  "Медовый дайс": "Honey dice",
  "Медовый ивент": "Honey event",
  "Медовый пропуск": "Honey pass",
  "медовых кейсов": "honey cases",
  "меньше минуты": "under a minute",
  "Меню": "Menu",
  "Месяц": "Month",
  "месяца": "of the month",
  "Мета кейса сохранена": "Case meta saved",
  "Метка «Скоро» снята": "«Soon» tag removed",
  "Метка «только ивент» снята": "«Event only» tag removed",
  "Метка на барабане": "Mark on the reel",
  "Метод": "Method",
  "Механики ивента": "Event perks",
  "Механики улья": "Hive perks",
  "мин": "min",
  "Мин. 50 TOK": "Min. 50 TOK",
  "Мин. порог": "Min. threshold",
  "Мин. цена цели": "Min. target price",
  "Минималистичный · Чистый": "Minimalist · Clean",
  "Минимальный депозит —": "Minimum deposit is",
  "Минимальный депозит — ": "Minimum deposit is ",
  " TOK. Набрано ": " TOK. You've got ",
  "минимум": "minimum",
  "минимум ": "minimum ",
  "минут": "minutes",
  "Множитель": "Multiplier",
  "Множитель апгрейда": "Upgrade multiplier",
  "Модалка": "Modal",
  "Можно выбрать максимум 3 предмета": "You can pick 3 items at most",
  "Мои предметы": "My items",
  "Мои промокоды на баланс": "My balance promo codes",
  "Мои промокоды на кейсы": "My case promo codes",
  "Мой реферальный код": "My referral code",
  "Мой стейкинг": "My staking",
  "мс/кадр": "ms/frame",
  "МСК": "MSK",
  "Мультиоткрытие «": "Multi-open «",
  "Мультяшный · Игривый": "Cartoon · Playful",
  "Мутации": "Mutations",
  "МУТАЦИЯ": "MUTATION",
  "Мутация:": "Mutation:",
  "Мутировавший вариант дороже — шанс ниже. Вывести его нельзя, только продать или обменять.": "A mutated one is worth more, so the odds drop. You can't cash it out, only sell or swap it.",
  "Мы не можем вывести этого брейнрота прямо сейчас, так как его нет в наличии. Но можно обменять его на других брейнротов, которых мы сможем вывести.": "This brainrot is out of stock, so we can't cash it out right now. You can swap it for ones we do have ready.",
  "Мы не можем вывести этого брейнрота, а обменять его тоже не получится — слишком низкая стоимость для обмена. Продай его за TOK через обычную продажу в инвентаре.": "We can't cash this brainrot out, and it's too cheap to swap. Sell it for TOK the usual way from your inventory.",
  "Мягкий · Геометрический": "Soft · Geometric",
  "Мягкий · Закруглённый": "Soft · Rounded",
  "Мягкий пиксель": "Soft pixel",
  "На выводе": "Cashing out",
  "На каждой ступени можно забрать приз или рискнуть дальше.": "At every step you can take the prize or push your luck.",
  "На любой депозит распространяется отыгрыш — брейнроты не исключение.": "Every deposit comes with wagering, brainrots included.",
  "На любой депозит распространяется отыгрыш ×": "Every deposit carries a wager of ×",
  " от зачисленной суммы — брейнроты не исключение.": " of the credited amount, brainrots included.",
  "На передачу брейнрота даётся": "You get this long to hand the brainrot over:",
  "На рассмотрении — ответ придёт в личку от бота.": "Under review. The bot will DM you the answer.",
  "На текущей ступени награда будет выдаваться как брейнрот по стоимости или брейнрот + деньги.": "At this step the reward comes as a brainrot of matching value, or a brainrot plus cash.",
  "Наведи на график — покажет разбивку по дню": "Hover the chart for a day-by-day breakdown",
  "Награда": "Reward",
  "Награда выдаётся брейнротом по стоимости или брейнротом + деньгами.": "The reward comes as a brainrot of matching value, or a brainrot plus cash.",
  "Награда за срок": "Term reward",
  "Награда получена": "Reward claimed",
  "Награда удалена": "Reward removed",
  "Награда:": "Reward:",
  "Награды": "Rewards",
  "Нажми": "Hit",
  "Нажми «Забрать» — проверим подписку": "Hit «Claim» — we'll check your subscription",
  "Нажми «Начать игру», чтобы поставить брейнрота и зайти в лесенку.": "Tap «Start game» to stake a brainrot and enter the ladder.",
  "Нажми на следующую ступень, чтобы попытаться пройти дальше, или забери текущую награду.": "Tap the next step to push your luck, or take what you've got.",
  "Нажми чтобы исключить из пресетов": "Tap to exclude from presets",
  "Назад": "Back",
  "Назад к кейсам": "Back to cases",
  "Название (EN)": "Name (EN)",
  "Название (RU)": "Name (RU)",
  "Название кейса": "Case name",
  "Название кода": "Code name",
  "Название шага": "Step name",
  "Накоплено к выводу": "Built up for cash-out",
  "Накрутка и заливы с чужих аккаунтов —": "Botting and deposits from other people's accounts —",
  "Напиши сообщение...": "Type a message…",
  "Например: 625": "For example: 625",
  "напряжение": "tension",
  "Настройки": "Settings",
  "Настройки Fuse сохранены": "Fuse settings saved",
  "Начало шкалы залито мёдом, первые": "The start of the bar is drenched in honey, the first",
  "Начало шкалы залито мёдом, первые ": "The start of the bar is drenched in honey, the first ",
  "%. Стрелка встала туда, цель твоя ": "%. The arrow lands there and the target is yours ",
  " раза.": " times over.",
  "Начать игру": "Start playing",
  "не активен": "not active",
  "не выбран": "none picked",
  "Не выводим мутированных брейнротов": "We don't cash out mutated brainrots",
  "не дороже вклада": "no pricier than your stake",
  "не жёсткие": "not strict",
  "Не загрузилось:": "Didn't load:",
  "Не загрузилось: ": "Didn't load: ",
  "Не задан": "Not set",
  "Не получилось": "Didn't work",
  "Не получилось достать квесты: ": "Couldn't fetch the quests: ",
  "Не получилось забрать": "Couldn't claim it",
  "Не сохранилось": "Didn't save",
  "не считается": "don't count",
  "не считаются": "don't count",
  "Не удалось загрузить квесты:": "Couldn't load quests:",
  "Не удалось загрузить конфиг краша:": "Couldn't load the crash config:",
  "Не удалось загрузить конфиг:": "Couldn't load the config:",
  "Не удалось загрузить профиль.": "Couldn't load the profile.",
  "Не удалось загрузить раздел \"": "Couldn't load the \"",
  "Не удалось загрузить реферальные данные": "Couldn't load referral data",
  "Не удалось загрузить розыгрыши:": "Couldn't load the raffles:",
  "Не удалось загрузить статистику.": "Couldn't load the stats.",
  "Не удалось загрузить стили раздела \"": "Couldn't load styles for the \"",
  "Не удалось загрузить FAQ: ": "Couldn't load the FAQ: ",
  "Не удалось загрузить: ": "Couldn't load: ",
  "Не удалось отменить батл": "Couldn't cancel the battle",
  "Не удалось отменить бронь": "Couldn't cancel the booking",
  "Не удалось отменить заявку": "Couldn't cancel the request",
  "Не удалось отменить очередь": "Couldn't cancel the queue",
  "Не удалось отменить промокод": "Couldn't cancel the promo code",
  "Не удалось отправить заявку.": "Couldn't send the request.",
  "Не удалось отправить сообщение. Попробуй позже.": "Couldn't send the message. Try later.",
  "Не удалось подготовить сообщение": "Couldn't prepare the message",
  "Не удалось получить награду": "Couldn't claim the reward",
  "Не удалось поставить в очередь": "Couldn't join the queue",
  "Не удалось провести обмен": "Couldn't make the swap",
  "Не удалось скопировать": "Couldn't copy",
  "Не удалось создать депозит": "Couldn't create the deposit",
  "Не удалось создать промокод": "Couldn't create the promo code",
  "Не удалось создать счёт": "Couldn't create the invoice",
  "Не удалось сохранить согласие": "Couldn't save your consent",
  "Не успел": "Too late",
  "Не хватает баланса для доплаты — выбери другие предметы.": "Not enough balance for the top-up. Pick different items.",
  "Не хватает баланса: нужно ": "Not enough balance: you need ",
  ", на счету ": ", you have ",
  "недели": "of the week",
  "Недельные": "Weekly",
  "Неделя": "Week",
  "Недостаточно набрано для выгодного обмена — добери ещё предметов.": "Not enough value for a fair swap. Add a few more items.",
  "неизвестная": "unknown",
  "нельзя вывести": "can't be cashed out",
  "нет": "none",
  "Нет данных": "No data",
  "Нет данных.": "No data.",
  "Нет доступа к разделу": "No access to this section",
  "Нет доступных кейсов": "No cases available",
  "Нет настроенных наград за депозит.": "No deposit rewards set up.",
  "Нет подходящих предметов": "No suitable items",
  "Нет подходящих предметов в инвентаре для ставки": "Nothing in your inventory you can bet",
  "Нет предметов для обмена — все твои брейнроты уже доступны для обычного вывода.": "Nothing to swap. Every brainrot you own can already be cashed out.",
  "Нет предметов для продажи": "Nothing to sell",
  "Нет раскрытого server seed. Сначала смени seed.": "No revealed server seed. Change the seed first.",
  "Нет связи с сервером. Проверь интернет и попробуй ещё раз.": "No connection to the server. Check your internet and try again.",
  "Ник в Roblox, на него придёт трейд": "Your Roblox name — the trade goes there",
  "Ник партнёра": "Partner's nickname",
  "Ничего не выбрано": "Nothing selected",
  "Ничего не найдено": "Nothing found",
  "Ничего не нашлось, попробуй другой запрос.": "Nothing found. Try another search.",
  "Ничего страшного — просто создайте новую заявку.": "No big deal, just send a new request.",
  "Новое правило": "New rule",
  "Новых по рефке": "New via referral",
  "Нордический дисплей": "Nordic display",
  "ноября": "November",
  "Ну ты и растревожил улей.": "You really stirred up the hive.",
  "нужен": "need",
  "Нужен вход": "Sign-in required",
  "Нужен вход для активации кода": "Sign in to activate a code",
  "Нужен вход для раздела:": "Sign in to open:",
  "Нужен вход для раздела: ": "Sign in to open: ",
  "Нужен вход.": "You need to log in.",
  "Нужен депозит": "Deposit required",
  "Нужен депозит за 24ч": "A deposit in the last 24h required",
  "Нужен стейк": "Stake required",
  "Нужен стейк от": "Stake required from",
  "Нужен стейк от ": "Stake of ",
  "Нужен client seed.": "Client seed required.",
  "Нужна своя аудитория — стрим, ролики или телеграм-канал. Требования": "You need an audience of your own: streams, videos or a Telegram channel. The requirements are",
  "Нужно предметов": "Items needed",
  "О себе и аудитории": "About you and your audience",
  "Обмен": "Swap",
  "Обмен брейнротов": "Brainrot swap",
  "ОБМЕН УСПЕШНЫЙ!": "SWAP DONE!",
  "Обмен:": "Swap:",
  "Обмен: ": "Swap: ",
  "ОБМЕННИК": "SWAP",
  "Обновите Telegram до последней версии.": "Update Telegram to the latest version.",
  "Обновить": "Refresh",
  "Общая история": "Everyone's history",
  "Общее": "General",
  "общий раунд": "shared round",
  "Один активный стейк на аккаунт": "One active stake per account",
  "одним депозитом.": "in a single deposit.",
  "одноразовый подарок за активацию кода": "a one-off gift for redeeming the code",
  "Одобрено! +": "Approved! +",
  "ожидает": "pending",
  "Ожидает": "Pending",
  "ожидает оплату в Telegram Stars.": "waiting for the Telegram Stars payment.",
  "ожидает оплаты Telegram Stars...": "is waiting for a Telegram Stars payment...",
  "Ожидай своей очереди": "Wait for your turn",
  "Ожидание": "Waiting",
  "Ожидание соперника": "Waiting for an opponent",
  "Окно вывода открыто (суббота 12:00–20:00 МСК).": "The cash-out window is open (Saturday 12:00–20:00 MSK).",
  "Округлый · Дружелюбный": "Rounded · Friendly",
  "Округлый sci-fi": "Rounded sci-fi",
  "октября": "October",
  "Описание": "Description",
  "Описание кейса": "Case description",
  "Описание предмета.": "Item description.",
  "Оплата внутри Telegram": "Pay inside Telegram",
  "Оплата Telegram Stars — зачисляется мгновенно после подтверждения в боте.": "Telegram Stars payments land instantly once you confirm in the bot.",
  "Оплачен": "Paid",
  "оплачен — зачислено": "paid — credited",
  "оплачен. Баланс зачислен.": "paid. Balance credited.",
  "Оплачено": "Paid",
  "Оранжевый": "Orange",
  "орбита": "orbit",
  "Оставайся на странице или обновляй список — тебя автоматически перебросит в батл.": "Stay on the page or refresh the list. We'll drop you into the battle.",
  "Оставайся на странице или обновляй список, тебя автоматически перебросит в батл.": "Stay on the page or refresh the list. We'll drop you into the battle.",
  "Осталось": "Left",
  "Осталось задепать:": "Left to deposit:",
  "Осталось задепать: ": "Left to deposit: ",
  "Осталось получить": "Still to collect",
  "осталось пополнить": "still to deposit",
  "Осталось:": "Left:",
  "Осталось: ": "Left: ",
  "от зачисленной суммы — брейнроты не исключение.": "of the credited amount, brainrots included.",
  "от TOK": "from TOK",
  "Ответ отправлен": "Answer sent",
  "Ответ придёт": "You'll get a reply",
  "Ответить": "Reply",
  "Ответы на популярные вопросы о депозитах, выводах и механиках сайта.": "Answers to the usual questions about deposits, cash-outs and how things work.",
  "Отдаёшь": "You give",
  "отзыв партнёрства": "partnership revoked",
  "Отказаться": "Decline",
  "отклонён": "rejected",
  "Отклонено:": "Rejected:",
  "Отклонено: ": "Rejected: ",
  "Открой бота, отправь команду и вернись на сайт.": "Open the bot, send the command and come back to the site.",
  "Открой кейс «": "Open the «",
  "Открой меню и выбери кейс для батла.": "Open the menu and pick a case for the battle.",
  "Открой!": "Open it!",
  "Открывается (": "Opening (",
  "Открывается...": "Opening...",
  "Открыт кейс": "Case opened",
  "Открытие кейса": "Opening a case",
  "Открытие кейса «": "Opening the «",
  "Открыто": "Opened",
  "Открыто ": "Opened ",
  " кейсов": " cases",
  "Открыть": "Open",
  "ОТКРЫТЬ БЕСПЛАТНО": "OPEN FREE",
  "ОТКРЫТЬ БЕСПЛАТНО (x": "OPEN FREE (x",
  "Открыть канал →": "Open the channel →",
  "Открыть кейс": "Open case",
  "Открыть лесенку": "Open the ladder",
  "Открыть скрытый выбор": "Open the blind pick",
  "Отмена": "Cancel",
  "Отменён": "Cancelled",
  "Отменить": "Cancel",
  "Отменить батл": "Cancel the battle",
  "Отменить бронь": "Cancel booking",
  "Отменить заявку": "Cancel request",
  "Отметь предметы в инвентаре": "Tick the items in your inventory",
  "Отправить": "Send",
  "Отправить заявку": "Send request",
  "Отправка...": "Sending...",
  "Отправляем...": "Sending...",
  "Отправьте трейд на:": "Send the trade to:",
  "отрисовка неба:": "sky draw:",
  "отрисовка неба: ": "sky draw: ",
  " мс/кадр": " ms/frame",
  "отсчёт": "countdown",
  "Отыгрыш": "Wagering",
  "Отыгрыш выполнен — вывод доступен": "Wagering done — cash-out unlocked",
  "Отыгрыш не выполнен": "Wagering not finished",
  "Охваты, тематика, где уже лил трафик": "Reach, topics, where you've sent traffic before",
  "Очень узкий · Афиши": "Ultra narrow · Posters",
  "Очередь на след. раунд отменена.": "Next-round queue cancelled.",
  "Очисти поиск — сохраняется вся таблица целиком": "Clear the search. We save the whole table at once",
  "Очистить": "Clear",
  "Очистить поиск": "Clear search",
  "ошибка": "error",
  "Ошибка": "Error",
  "Ошибка вывода": "Cash-out failed",
  "Ошибка загрузки": "Loading error",
  "Ошибка загрузки логики панели": "Panel logic failed to load",
  "Ошибка загрузки:": "Loading error:",
  "Ошибка кэшаута": "Cash-out failed",
  "Ошибка оплаты по счёту": "Payment failed for invoice",
  "Ошибка оплаты по счёту ": "Payment failed for invoice ",
  "Ошибка панели": "Panel error",
  "Ошибка при отправке": "Sending failed",
  "Ошибка при постановке в очередь": "Couldn't join the queue",
  "Ошибка при создании заявки.": "Couldn't create the request.",
  "Ошибка проверки входа.": "Login check failed.",
  "Ошибка сервера": "Server error",
  "Ошибка ставки": "Bet failed",
  "Ошибка старта": "Couldn't start",
  "Ошибка шага": "Step failed",
  "Ошибка, попробуй ещё раз": "Something broke — try again",
  "Ошибка:": "Error:",
  "Ошибка: ": "Error: ",
  "Падение": "Fall",
  "Панель": "Panel",
  "Параметры кейса": "Case settings",
  "парение": "hover",
  "Партнёрская программа": "Partner program",
  "Партнёрство отозвано. Код больше не действует, новая ревша не начисляется — ниже можно вывести то, что уже накоплено.": "Partnership revoked. The code no longer works and revshare stopped. You can still cash out what you've earned below.",
  "Первые": "First",
  "Первые ": "First ",
  "Первые депозиты": "First deposits",
  "Первый розыгрыш — в конце периода": "First draw lands at the end of the period",
  "первым нажми Ready и Accept": "hit Ready and Accept first",
  "Перейти в бота и подтвердить вход": "Open the bot and confirm login",
  "Переключить валюту цены кейса: TOK → Жетоны → Соты → TOK": "Switch the case price currency: TOK → Chips → Honeycombs → TOK",
  "Переключить тему": "Switch theme",
  "Печатная машинка · Винтаж": "Typewriter · Vintage",
  "Пиксель · Ретро-игры": "Pixel · Retro games",
  "Платина": "Platinum",
  "По умолчанию": "Default",
  "По этому предложению больше не осталось": "Nothing left on this offer",
  "ПОБЕДА": "WIN",
  "ПОБЕДА x": "WIN x",
  "Победитель": "Winner",
  "Победитель:": "Winner:",
  "Победитель: ": "Winner: ",
  "Подать заявку": "Apply",
  "Подать заявку снова": "Apply again",
  "Подбираем задания…": "Picking your tasks…",
  "Подготовка Fuse...": "Warming up Fuse...",
  "Подготовка Fuse…": "Warming up Fuse…",
  "Поддержка": "Support",
  "ПОДДЕРЖКА": "SUPPORT",
  "Поделись кодом — и здесь появится график.": "Share your code and a chart will show up here.",
  "Поделись кодом или ссылкой с другом — он вводит код в поле «Промокод» на своей странице профиля (или просто переходит по ссылке), и вы получаете % с его депозитов": "Share your code or link with a friend. They enter the code in the “Promo code” field on their profile, or just open the link. You take a % of their deposits",
  "Поделитесь сообщением в любом чате": "Share the message in any chat",
  "Подпишитесь на @": "Subscribe to @",
  "Подробнее": "More",
  "Подробности и похожие предметы": "Details and similar items",
  "Подтверди обмен": "Confirm the swap",
  "Подтвердить": "Confirm",
  "Позиция (0 = первый)": "Position (0 = first)",
  "Поиск брейнрота...": "Search brainrots…",
  "Поиск кейса": "Search cases",
  "Поиск по вопросам...": "Search the questions…",
  "Поиск по имени...": "Search by name...",
  "Поиск по кейсам": "Search cases",
  "Поиск по кейсам:": "Search cases:",
  "Поиск по названию...": "Search by name…",
  "Поймал пчелу! Она была не против.": "Caught a bee! It didn't mind.",
  "Поймано пчёл:": "Bees caught:",
  "Поймано пчёл: ": "Bees caught: ",
  "Поймать пчелу": "Catch a bee",
  "Пока нет доступных квестов, загляни позже.": "No quests yet. Check back later.",
  "Пока нет открытых батлов.": "No open battles right now.",
  "Пока нет открытых кейсов.": "No cases opened yet.",
  "Пока нет созданных промокодов.": "No promo codes yet.",
  "Пока нет статей, загляни позже.": "No articles yet. Check back later.",
  "Пока нечего забирать": "Nothing to claim yet",
  "Пока никого. Отправь ссылку выше тому, кого хочешь привести — он заполнит анкету, а после одобрения появится здесь.": "Nobody yet. Send the link above to whoever you want to bring in. They fill out the form, and after we approve it they show up here.",
  "Пока никто не поставил": "Nobody's bet yet",
  "Пока улей гудит, пчёлы работают на тебя: метят предметы в барабане, заливают мёдом начало шкалы в апгрейдере и подкладывают свою грань в дайсы. Кончится ивент, всё вернётся как было.": "While the hive buzzes, the bees work for you: they mark items in the reel, pour honey over the start of the upgrader bar and slip their own face into the dice. When the event ends, everything goes back to normal.",
  "Показать ⌄": "Show ⌄",
  "Показывать в топе партнёров твой промокод": "Show your promo code in the partner top",
  "Показывать в топе партнёров твой промокод ": "Show your promo code ",
  "Покупаются за соты, доступны только пока идёт ивент": "Bought with combs, available only while the event runs",
  "Получаешь": "You get",
  "Получен": "You got",
  "Получен ": "You got ",
  "получено": "received",
  "Получено": "Received",
  "Получено ✓": "Claimed ✓",
  "Получено:": "You got:",
  "Получено: ": "You got: ",
  "Получить": "Claim",
  "Пользователей": "Users",
  "Пометить «Скоро»": "Mark as «Soon»",
  "Пометить «только ивент»": "Mark as «event only»",
  "Понятно": "Got it",
  "Пополнение": "Top-up",
  "ПОПОЛНЕНИЕ БАЛАНСА": "TOP UP",
  "Пополнение временно недоступно": "Top-ups are down for now",
  "Пополни баланс любым брейнротом": "Top up with any brainrot",
  "Пополнить": "Top up",
  "Пополнить баланс": "Top up balance",
  "ПОПОЛНИТЬ СЧЕТ": "TOP UP BALANCE",
  "порог пройден": "threshold cleared",
  "После выбора ставки увидишь, что можно получить на каждой ступени.": "Once you pick a stake you'll see what each step pays.",
  "После отправки предметы сразу уходят из инвентаря, заявку обработают вручную.": "Send it and the items leave your inventory right away. We handle the request by hand.",
  "Последние дропы": "Latest drops",
  "Поставить": "Place bet",
  "Поставить на след. раунд": "Bet on the next round",
  "Поставлен": "Placed",
  ". Сейчас можно забрать: ": " is staked. You can take now: ",
  "Поставлен брейнрот": "Brainrot staked",
  "Поставленный": "The staked",
  "Поставленный ": "The staked ",
  " сгорел.": " burned.",
  "Потенциал": "Potential",
  "Похожие брейнроты": "Similar brainrots",
  "Правил нет — добавьте ниже": "No rules yet — add one below",
  "Правила депозита брейнротами": "Brainrot deposit rules",
  "Правила игры": "How it works",
  "Правило добавлено:": "Rule added:",
  "Правило добавлено: ": "Rule added: ",
  "Правило удалено": "Rule removed",
  "предмет": "item",
  "предмет для ставки": "an item to bet",
  "Предмет добавлен": "Item added",
  "предмет недоступен": "item unavailable",
  "Предмет отправлен на вывод": "Item sent for cash-out",
  "Предмет убран": "Item removed",
  "Предмет:": "Item:",
  "Предмет: ": "Item: ",
  "предмет(ов):": "item(s):",
  "предмета": "items",
  "предметов": "items",
  "Предметов": "Items",
  "предметов · сумма весов:": "items · total weight:",
  "Предметов в дропе": "Items in the drop",
  "предметов в пуле.": "items in the pool.",
  "предметов за раз": "items at a time",
  "Предметы": "Items",
  "Предметы не выбраны": "No items picked",
  "Предметы сгорели": "Items burned",
  "Предыдущие уровни": "Previous levels",
  "Премиум кейсы": "Premium cases",
  "Пресет": "Preset",
  "Пресет ": "Preset ",
  " применён": " applied",
  "Пресет применён": "Preset applied",
  "Пресеты:": "Presets:",
  "Приведи стримера или блогера — и получай": "Bring in a streamer or blogger and take",
  "Приглашай друзей и получай процент с их депозитов": "Invite friends and take a cut of their deposits",
  "Приглашено": "Invited",
  "Приём ставок": "Bets are open",
  "приз недоступен": "prize unavailable",
  "применён": "applied",
  "Применяется только к 0–9 глобально через unicode-range, буквы не затрагиваются": "Applies to 0–9 only, globally via unicode-range; letters stay as they are",
  "Примерное время ожидания": "Rough wait time",
  "Примеры:": "Examples:",
  "Приостановить": "Pause",
  "Присоединиться": "Join",
  "Причина:": "Reason:",
  "Причина: ": "Reason: ",
  "Проверка доступности...": "Checking availability...",
  "Проверяем код...": "Checking the code...",
  "Проверяем статус...": "Checking the status...",
  "Продажа": "Sale",
  "Продано": "Sold",
  "Продано ": "Sold ",
  " шт. за ": " pcs for ",
  "Продано в обменник": "Sold to the exchange",
  "Продано за": "Sold for",
  "Продано за ": "Sold for ",
  "Продано:": "Sold:",
  "Продано: ": "Sold: ",
  "Продать": "Sell",
  "Продать все": "Sell all",
  "Продать всё": "Sell all",
  "Продать сразу": "Sell right away",
  "Продолжить": "Continue",
  "проигрыш": "loss",
  "ПРОИГРЫШ": "LOSS",
  "ПРОИГРЫШ — предмет потерян": "LOSS — item gone",
  "пройден": "cleared",
  "ПРОКАЧАТЬ": "UPGRADE",
  "промокод": "promo code",
  "Промокод": "Promo code",
  "Промокод ": "Promo code ",
  " создан": " created",
  "Промокод добавлен": "Promo code added",
  "Промокод не найден или истёк": "Promo code not found or expired",
  "Промокод обновляется автоматически. Открывай кейсы, продавай брейнротов и собирай Fuse прямо внутри Telegram WebApp.": "The promo code refreshes on its own. Open cases, sell brainrots and build Fuse right inside the Telegram WebApp.",
  "Промокод отменён": "Promo code cancelled",
  "Промокод отменён, возвращено": "Promo code cancelled, refunded",
  "Промокод отменён, возвращено ": "Promo code cancelled, refunded ",
  "Промокод:": "Promo code:",
  "Промокод: ": "Promo code: ",
  "Промокоды": "Promo codes",
  "Пропустить ⏭": "Skip ⏭",
  "Просмотр батла": "Watching the battle",
  "Просмотр: ожидание соперника": "Watching: waiting for an opponent",
  "Профессиональный · Чёткий": "Professional · Crisp",
  "Профиль": "Profile",
  "Профиль | Brainrot Battle": "Profile | Brainrot Battle",
  "Профиль игрока": "Player profile",
  "Профиль не найден.": "Profile not found.",
  "Профиль обновлён": "Profile updated",
  "Процент с каждого приведённого игрока": "A cut of every player you bring",
  "Прочитай перед тем, как отправлять брейнротов — это важно.": "Read this before you send any brainrots.",
  "Прочитал(а) условия и согласен(на) с ними.": "I've read the terms and agree to them.",
  "Прошлую заявку отклонили.": "We rejected your last request.",
  "Прошлую заявку отклонили. Новую можно подать через сутки.": "We rejected your last request. You can send a new one in 24 hours.",
  "Прячет баланс, пополнение и вывод — всё, к чему придирается модерация площадок. Игра и дропы видны как обычно.": "Hides your balance, top-ups and cash-outs: everything platform moderators pick on. The game and drops stay visible.",
  "пульс": "pulse",
  "пчёл. Это уже призвание.": "bees. That's a calling now.",
  "Пчела успевает пометить предмет прямо в прокрутке. Поймал метку, забираешь": "A bee tags an item mid-spin. Catch the tag and you take",
  "Пчела успевает пометить предмет прямо в прокрутке. Поймал метку, забираешь ": "A bee tags an item mid-spin. Catch the tag and you take ",
  " штуки вместо одной.": " of them instead of one.",
  "Пчелиный дайс": "Bee dice",
  "Пчелиный дайс поверх обычной таблицы. Выпал, ставка возвращается в": "A bee die on top of the usual table. Roll it and your bet comes back",
  "Пчелиный дайс поверх обычной таблицы. Выпал, ставка возвращается в ": "A bee die on top of the usual table. Roll it and your bet comes back ",
  "Пчелиный дайс, редкий бонус на время медового ивента": "Bee dice: a rare bonus while the honey event runs",
  "Пять закрытых карт. Нажми на одну — только она раскроется и попадёт в инвентарь.": "Five face-down cards. Tap one. Only that card flips and lands in your inventory.",
  "Пять пчёл. Улей начинает тебя узнавать.": "Five bees. The hive is starting to recognize you.",
  "Р аунд ": "Round ",
  "Р ежим": "Mode",
  "Работает без срока": "Runs with no time limit",
  "Работают сами, пока идёт ивент": "They work on their own while the event runs",
  "Радужный дайс": "Rainbow dice",
  "раза.": "times over.",
  "Раздел временно закрыт": "This section is closed for now",
  "Раздел закрыт": "Section closed",
  "Раздел открыт": "Section open",
  "разделить": "split",
  "Размер иконки (px)": "Icon size (px)",
  "Разработан для читаемости": "Built for readability",
  "Раунд": "Round",
  "Раунд в процессе": "Round in progress",
  "Раунд идёт": "Round in progress",
  "Раунд не начат": "Round hasn't started",
  "раунд(ов)": "round(s)",
  "раунд(ов) · режим зрителя": "round(s) · spectator mode",
  "Раундов пока не было": "No rounds yet",
  "Раундов:": "Rounds:",
  "Раунды": "Rounds",
  "Регистрации": "Sign-ups",
  "Редактировать кейс": "Edit the case",
  "Редактировать статистику профиля": "Edit profile stats",
  "Редкость": "Rarity",
  "Режим": "Mode",
  "Режим «Лесенка»": "Ladder mode",
  "Режим «Ladder»": "«Ladder» mode",
  "режим зрителя": "spectator mode",
  "Режим стримера": "Streamer mode",
  "Режим стримера включён": "Streamer mode on",
  "Режим стримера выключен": "Streamer mode off",
  "Режим фейла": "Fail mode",
  "Режим:": "Mode:",
  "Режим: ": "Mode: ",
  "Режимы": "Modes",
  "Рекламный · Жирный": "Advertising · Bold",
  "Рефералов": "Referrals",
  "Рефералы": "Referrals",
  "Реферальная программа": "Referral program",
  "Реферальный кейс": "Referral case",
  "Реферальный кейс не настроен": "The referral case isn't set up",
  "Реферальный кейс:": "Referral case:",
  "Реферальный кейс: ": "Referral case: ",
  "ритуал": "ritual",
  "Розыгрыш": "Raffle",
  "розыгрыш, приз, депозит, брейнрот, giveaway,": "raffle, prize, deposit, brainrot, giveaway,",
  "розыгрышах": "raffles",
  "розыгрыше": "raffle",
  "Розыгрыши": "Raffles",
  "Розыгрыши за депозит — призы за день, неделю и месяц | Brainrot Battle": "Deposit raffles: daily, weekly and monthly prizes | Brainrot Battle",
  "Розыгрыши сейчас не проводятся. Загляни позже.": "No raffles running right now. Check back later.",
  "Ролики": "Videos",
  "Рост и доходы по моим рефералам": "Growth and earnings from my referrals",
  "РТП изменён": "RTP changed",
  "Рубин": "Ruby",
  "Рукописный serif · Тёплый": "Handwritten serif · Warm",
  "Рулетка готова.": "Roll ready.",
  "Ручное подтверждение TOK/UAH и проверка последних пополнений.": "Manual TOK/UAH confirmation and a look at recent top-ups.",
  "рывок": "dash",
  "С каждого игрока спишется": "Each player is charged",
  "С каждого игрока спишется ": "We charge each player ",
  " только в момент старта батла.": " only when the battle starts.",
  "с мутацией": "with a mutation",
  "С нами с": "With us since",
  "С нами с ": "With us since ",
  "Сайт обновляется, страница перезагрузится через несколько секунд...": "The site is updating, the page will reload in a few seconds...",
  "саспенс": "suspense",
  "Сбалансированная классическая лесенка.": "The balanced, classic ladder.",
  "Сброс через": "Resets in",
  "Сброс через ": "Resets in ",
  "Свадебный · Плавный": "Wedding · Flowing",
  "Свежий · Современный": "Fresh · Modern",
  "Свернуть — ожидание продолжится в фоне": "Minimise: we'll keep waiting in the background",
  "Свернуть, ожидание продолжится": "Minimise, the wait keeps going",
  "Свои задания": "Its own tasks",
  "Свои промокоды и еженедельные выплаты": "Your own promo codes and weekly payouts",
  "сгорание": "burn",
  "Сгорание": "Burn",
  "сгорел": "burned",
  "сгорел.": "burned.",
  "Сдача: +": "Change: +",
  "Сделано апгрейдов": "Upgrades done",
  "Сегодня": "Today",
  "Сейчас все места заняты другими игроками. Можешь встать в очередь — как только освободится место, мы сразу покажем инструкции для трейда.": "Every slot is taken right now. Join the queue: the moment one frees up, we'll show you the trade instructions.",
  "Сейчас выключен.": "Off right now.",
  "сейчас нет в наличии": "out of stock right now",
  "секунд": "seconds",
  "сентября": "September",
  "Серебро": "Silver",
  "Серийные кейсы": "Series cases",
  "Сёрф · 60-е": "Surf · 60s",
  "Серый, некликабельный, без SPA-роута, 'Скоро…' вместо цены": "Grey, unclickable, no SPA route, 'Soon…' instead of a price",
  "Синий": "Blue",
  "Скользящее окно сброшено": "Rolling window reset",
  "Сколько заморозить": "How much to lock",
  "Скопировано!": "Copied!",
  "Скопировать": "Copy",
  "Скопировать ссылку": "Copy link",
  "Скопировать тег": "Copy the tag",
  "Скопируй тег вручную:": "Copy the tag by hand:",
  "Скоро…": "Soon…",
  "Скорость прокрутки": "Spin speed",
  "Скрыт": "Hidden",
  "скрытый выбор 1 из 5": "blind pick, 1 of 5",
  "Скрытый дроп": "Hidden drop",
  "Скрыть ⌄": "Hide ⌄",
  "Следующая часть через": "Next part in",
  "Следующая часть через ": "Next part in ",
  "Следующие уровни": "Next levels",
  "Следующий кейс через": "Next case in",
  "Следующий кейс через ": "Next case in ",
  "Следующий через": "Next in",
  "Следующий через ": "Next in ",
  "Слоты заряжаются…": "Charging the slots…",
  "Слоты Fuse": "Fuse slots",
  "Смелый · Ретро-округлый": "Bold · Retro rounded",
  "Сменить язык": "Switch language",
  "Смотреть кейсы можно без входа. Для Профиля, Fuse, Лесенки и Батла нужен вход через Telegram-бота.": "You can browse cases without logging in. Profile, Fuse, Ladder and Battle need a Telegram login.",
  "Сначала введи сумму депозита": "Enter the deposit amount first",
  "Сначала выбери брейнрота": "Pick a brainrot first",
  "Сначала выбери брейнрота для ставки.": "Pick a brainrot to stake first.",
  "Сначала выбери кейс.": "Pick a case first.",
  "Сначала поднимись хотя бы на один шаг.": "Climb at least one step first.",
  "Собери батл": "Set up a battle",
  "Событий за период": "Events in the period",
  "Современный · Оптический": "Modern · Optical",
  "Современный serif · Крупный": "Modern serif · Large",
  "Современный startup": "Modern startup",
  "Современный tech-sans": "Modern tech-sans",
  "Содержимое кейса": "Case contents",
  "Создавай батлы через список. Без инвайтов: выбрал кейс, настроил раунды, дождался соперника.": "Battles go through the list, no invites. Pick a case, set the rounds, wait for someone to join.",
  "Создаём счёт...": "Creating the invoice...",
  "Создай первый батл и дождись соперника.": "Create the first battle and wait for an opponent.",
  "Создай первый кейсбатл и дождись соперника.": "Start the first case battle and wait for someone to join.",
  "создан": "created",
  "создан — открываем бот. Если счёт не появился сам, отправь /deposit в бот.": "created. Opening the bot. If the invoice doesn't show up on its own, send /deposit to the bot.",
  "Создан счёт": "Invoice created",
  "создана, жди трейд в своё время.": "created. Wait for the trade in your slot.",
  "создана. Администратор свяжется с тобой по контакту.": "created. An admin will reach out to you at your contact.",
  "создана. Оплати через": "created. Pay via",
  "создание батла": "setting up a battle",
  "Создатель:": "Host:",
  "Создать": "Create",
  "Создать батл": "Create a battle",
  "Создать кейс": "Create a case",
  "Сообщений в поддержку пока нет.": "No support messages yet.",
  "Сообщения обновлены": "Messages refreshed",
  "Соты": "Honeycomb",
  "Соты пока пустые, заданий ещё не завезли. Загляни попозже.": "The combs are empty, no tasks yet. Check back later.",
  "Сохранено ✓": "Saved ✓",
  "Сохранить": "Save",
  "Сохранить активный режим": "Save the active mode",
  "Сохранить всё": "Save everything",
  "Сохранить таблицу": "Save the table",
  "Сохранить цифровой шрифт": "Save the numeral font",
  "Сохранить Fuse": "Save Fuse",
  "Списать": "Charge",
  "Список брейнротов для депозита пока пуст — обратитесь к администратору.": "The brainrot deposit list is empty. Ping an admin.",
  "Список гирс для депозита пока пуст — обратитесь к администратору.": "The gear deposit list is empty. Ping an admin.",
  "Спишется:": "You'll be charged:",
  "Спишется: ": "You'll be charged: ",
  "Спишется: 0 TOK": "You'll be charged: 0 TOK",
  "Спокойный режим с мягкими множителями.": "Chill mode, gentle multipliers.",
  "Средне за событие": "Average per event",
  "Средний доход с игрока": "Average earnings per player",
  "Средняя": "Medium",
  "Средняя · Сбалансированная классическая лесенка.": "Medium · A balanced, classic ladder.",
  "Ссылка оплаты ещё не настроена": "The payment link isn't set up yet",
  "Ставка": "Rate",
  "Ставка - брейнрот": "Stake — a brainrot",
  "Ставка не найдена в инвентаре.": "That stake isn't in your inventory.",
  "Ставка принята": "Bet placed",
  "Ставка принята ✓": "Bet placed ✓",
  "Ставка принята:": "Bet placed:",
  "Ставка принята: ": "Bet placed: ",
  "Ставка принята!": "Bet placed!",
  "Ставка сгорит при падении. Награда выдаётся не кэшаутом, а брейнротом или брейнротом + деньгами.": "Fall and your stake burns. You win a brainrot, or a brainrot plus cash. No cash-out.",
  "Ставка:": "Bet:",
  "Ставка: ": "Bet: ",
  "Ставки в этом раунде": "Bets this round",
  "Ставь брейнрота, поднимайся по ступеням и забирай брейнрота или брейнрота + деньги.": "Stake a brainrot, climb the steps and walk away with a brainrot, or a brainrot plus cash.",
  "Старт": "Start",
  "Статистика аккаунта": "Account stats",
  "Статистика по ревшаре": "Revshare stats",
  "Статус": "Status",
  "Статус кейса": "Case status",
  "Стать партнёром": "Become a partner",
  "Стейк": "Stake",
  "Стейк ": "Stake ",
  "Стейкинг": "Staking",
  "Стейкинг баланса": "Balance staking",
  "Стейков завершено": "Stakes finished",
  "Стиль": "Style",
  "Стоимость с игрока:": "Cost per player:",
  "Стоимость спишется у обоих игроков только в момент старта.": "We charge both players only when it starts.",
  "стоит": "worth",
  "Стоять в топе партнёров как «Аноним»?\\n\\nВыбор делается один раз и потом не меняется.": "Stand in the partner top as “Anonymous”?\\n\\nYou pick once and it doesn't change.",
  "Стримишь, снимаешь ролики или ведёшь канал? Забирай процент с игроков, которых приводишь.": "Streaming, making videos or running a channel? Take a cut of the players you bring in.",
  "Стримы": "Streams",
  "Ступени": "Steps",
  "Субпартнёрство": "Sub-partners",
  "Сумма": "Amount",
  "Сумма 4 брейнротов": "4 brainrots total",
  "Сумма депозитов": "Deposits total",
  "Сумма дропа:": "Drop total:",
  "Сумма:": "Amount:",
  "Счёт": "Invoice",
  "Счёт ": "Invoice ",
  " создан — открываем бот. Если счёт не появился сам, отправь /deposit в бот.": " created. Opening the bot. If the invoice doesn't show up on its own, send /deposit to the bot.",
  " истёк — создай новый.": " expired. Create a new one.",
  " ожидает оплаты Telegram Stars...": " is waiting for a Telegram Stars payment…",
  "Считаем по депозитам приглашённых. Ставка не влияет.": "We count deposits from the players you brought in. Your rate doesn't affect it.",
  "Считаем по заработку за период.": "We rank by earnings for the period.",
  "Считаем по числу приведённых.": "We rank by how many people you brought in.",
  "Таблица дропа сохранена": "Drop table saved",
  "Таблица пуста": "The table is empty",
  "Тайский дизайн · Угловатый": "Thai design · Angular",
  "Такой вариант уже есть в кейсе": "That variant is already in the case",
  "твоё имя": "your name",
  "ТВОЙ ВКЛАД": "WHAT YOU PUT IN",
  "Твой ник в игре": "Your in-game name",
  "Твой ник в Roblox": "Your Roblox name",
  "Тебе выпал": "You pulled",
  "Тебе выпал ": "You pulled ",
  "Тебя видно как": "You show up as",
  "Тег скопирован:": "Tag copied:",
  "Текущая награда": "Current reward",
  "Текущие курсы": "Current rates",
  "Текущий баланс": "Current balance",
  "Текущий батл": "Current battle",
  "Текущий шаг": "Current step",
  "Телеграм-канал": "Telegram channel",
  "тело вернётся последней частью, по дням капает только надбавка": "the principal comes back in the last part; only the bonus drips in daily",
  "Теперь виден промокод": "Your promo code is visible now",
  "Теперь ты «Аноним»": "You're «Anonymous» now",
  "Терминал · Зелёный монитор": "Terminal · Green monitor",
  "Технический · Чёткий": "Technical · Crisp",
  "Токены": "Tokens",
  "только в момент старта батла.": "only when the battle starts.",
  "Только цифры": "Numbers only",
  "Тонкий · Воздушный": "Thin · Airy",
  "Тонкий сжатый": "Thin condensed",
  "Тонкий современный": "Thin modern",
  "Тонкий sci-fi": "Thin sci-fi",
  "Топ партнёров": "Top partners",
  "Точный обмен": "Exact swap",
  "Традиционный · Надёжный": "Traditional · Dependable",
  "транс": "trance",
  "трейд был отменён в Рoблоксе": "the trade was cancelled in Roblox",
  "Трейд не удался": "Trade didn't go through",
  "Трейд подтверждён —": "Trade confirmed —",
  "Трейд подтверждён — ": "Trade confirmed. ",
  " зачислен на баланс.": " landed on your balance.",
  "Трейд подтверждён, отмена недоступна": "Trade confirmed, cancellation unavailable",
  "Трейд подтверждён, токены зачислены на баланс.": "Trade confirmed, tokens are on your balance.",
  "триллер": "thriller",
  "Тут пока пусто.": "Nothing here yet.",
  "Ты": "You",
  "ты в": "you're in",
  "Ты внутри": "You're in",
  "Ты забрал на": "You cashed out at",
  "Ты забрал на ": "You cashed out at ",
  "Ты не успел забрать вовремя —": "You didn't cash out in time —",
  "Ты не успел забрать вовремя — ": "You didn't cash out in time. ",
  "Ты смотришь": "You're watching",
  "Ты смотришь батл как зритель. Баланс не списывается.": "You're watching this battle. Nothing comes off your balance.",
  "Ты сорвался": "You fell",
  "Ты сорвался. Поставленный брейнрот окончательно сгорел и не возвращается.": "You slipped. The staked brainrot burned for good. No refund.",
  "Тяжелая": "Heavy",
  "у брейнрота — цена вырастет.": "on the brainrot, the price goes up.",
  "У тебя": "You have",
  "У тебя ": "You have ",
  " — трать в ивентовых кейсах.": ". Spend them in event cases.",
  "Убрать": "Remove",
  "Убрать «Скоро»": "Remove «Soon»",
  "Убрать «только ивент»": "Remove «event only»",
  "Удалить": "Delete",
  "Удалить брейнрота?": "Delete this brainrot?",
  "Удалить кейс": "Delete the case",
  "Удалить кейс «": "Delete the case «",
  "удар": "hit",
  "Уже выбрано": "Already picked",
  "Уже выбрано ": "You've already picked ",
  ").requiredCount || 4)} брейнрота. Сними один из слотов и попробуй снова.": ").requiredCount || 4)} brainrots. Free up a slot and try again.",
  "уже готово": "already done",
  "Уже забрано": "Already claimed",
  "Уже получено": "Already claimed",
  "Укажи кол-во активаций": "Set the number of uses",
  "Укажи контакт (Telegram @username или адрес) для связи.": "Give us a contact (Telegram @username or an address).",
  "Укажи ник в Roblox.": "Give us your Roblox nickname.",
  "Укажи сумму": "Enter an amount",
  "Укажи сумму за активацию": "Enter the amount per use",
  "Укажи хотя бы одну площадку: канал, YouTube или TikTok.": "Give us at least one channel: Telegram, YouTube or TikTok.",
  "Укажи Telegram для связи.": "Give us a Telegram to reach you.",
  "Указать разные мутации": "Set different mutations",
  "Улей закроется через": "The hive closes in",
  "Улей открыт": "The hive is open",
  "Улучшение": "Upgrade",
  "Уникальные": "One-off",
  "Успех": "Win",
  "участник": "player",
  "Участник батла": "In the battle",
  "участника": "players",
  "участников": "players",
  "февраля": "February",
  "Фейл": "Fail",
  "Финал": "Final",
  "Фиолетовый": "Purple",
  "фьюз": "fuse",
  "Фьюз": "Fuse",
  "Хардкор": "Hardcore",
  "хлопок": "clap",
  "цвет": "a color",
  "ЦВЕТ В КЕЙСЕ": "COLOR IN THE CASE",
  "Цвет снят": "Color removed",
  "Цвет:": "Color:",
  "Цвет: ": "Color: ",
  "цветной брейнрот": "a colored brainrot",
  "Цветной вариант добавлен": "Colored variant added",
  "Цель должна быть дороже": "Your target has to cost more than",
  "Цель должна быть дороже ": "Your target has to cost more than ",
  "Цель должна стоить минимум": "Your target has to cost at least",
  "Цель должна стоить минимум ": "Your target has to cost at least ",
  "Цель доступна для Fuse.": "This target is fusable.",
  "Цель поймана:": "Target caught:",
  "Цель поймана: ": "Target caught: ",
  "Цель слишком дорогая. При": "Target's too pricey. With",
  "Цель слишком дорогая. При ": "Target's too pricey. With ",
  " TOK можно целиться максимум в ": " TOK you can aim at no more than ",
  "Цена": "Price",
  "Цена (TOK)": "Price (TOK)",
  "Цена должна быть > 0": "The price has to be > 0",
  "Цена сохранена": "Price saved",
  "церемония": "ceremony",
  "Цифровой шрифт выключен": "Numeral font off",
  "ч": "h",
  "часа новый бонус к депозиту": "hours a fresh deposit bonus",
  "часов": "hours",
  "частей": "parts",
  "части": "part",
  "Частые вопросы": "FAQ",
  "часть": "part",
  "Чат поддержки": "Support chat",
  "чел.": "ppl",
  "Человечный · Тёплый": "Humanist · Warm",
  "Чем занимаешься": "What you do",
  "Чем конкретнее — тем быстрее разберём.": "The more specific you are, the faster we sort it out.",
  "через": "in",
  "Через ": "In ",
  "через ": "in ",
  "Чистый · Индийский дизайн": "Clean · Indian design",
  "Чистый · Минималистичный": "Clean · Minimalist",
  "Читаемый · Базовый": "Readable · Basic",
  "Читаемый · Книжный": "Readable · Bookish",
  "Что выводим": "What we're sending out",
  "Что может выпасть": "What's inside",
  "Чтобы открыть бесплатный кейс, нужно выполнить всё ниже — и так каждый раз перед новым прокрутом.": "To open the free case you need everything below. Every time, before each new spin.",
  "Шаг": "Step",
  "Шаг ": "Step ",
  " пройден": " cleared",
  "Шаг 1": "Step 1",
  "Шаг 2": "Step 2",
  "Шаг 3": "Step 3",
  "Шаг 4": "Step 4",
  "Шаг 5": "Step 5",
  "шанс": "chance",
  "ШАНС": "CHANCE",
  "шанс вне диапазона": "chance out of range",
  "Шанс, %": "Chance, %",
  "Широкий, современный": "Wide, modern",
  "Шрифт для цифр — весь сайт": "Numeral font — whole site",
  "Шрифт для цифр:": "Numeral font:",
  "Шрифт для цифр: ": "Numeral font: ",
  "шт": "pcs",
  "шт. за": "pcs for",
  "шт.)...": "pcs)...",
  "штуки вместо одной.": "of them instead of one.",
  "Элегантная рукопись": "Elegant handwriting",
  "Элегантный · Лёгкий": "Elegant · Light",
  "Элегантный · Редакция": "Elegant · Editorial",
  "Эмодзи": "Emoji",
  "эпоха": "era",
  "Эти брейнроты всегда в наличии — самые ходовые. Если отдаёшь больше, чем берёшь, остаток зачислится на баланс.": "The popular brainrots are always in stock. Give more than you take and the difference lands on your balance.",
  "Это твой собственный код — на себя не действует": "That's your own code. It doesn't work on you",
  "Этот батл ждёт второго игрока.": "This battle is waiting for a second player.",
  "Этот брейнрот": "This brainrot",
  "Этот брейнрот дешевле": "This brainrot is cheaper than",
  "Этот брейнрот дешевле ": "This brainrot is cheaper than ",
  " TOK — его берут только от 2 штук": " TOK. We only take it in pairs or more",
  "Я прочитал(а) правила. Если не прочитаю и возникнут проблемы — ответственность администрация не несёт.": "I've read the rules. If I skip them and something goes wrong, that's on me, not the team.",
  "Ядро разгоняется…": "Core spinning up…",
  "Язык": "Language",
  "января": "January",
  "Adobe · Чёткий": "Adobe · Crisp",
  "Brainrot Battle — открывай кейсы с брейнротами": "Brainrot Battle — open brainrot cases",
  "Brainrot Battle — открывай кейсы, фьюзи брейнротов, сражайся": "Brainrot Battle: open cases, fuse brainrots, go to battle",
  "brainrot, кейсы, открытие кейсов, telegram webapp, brainrot battle, казино, лудка, лудоман, лудомания, азарт, азартные игры, ставки, джекпот, выигрыш, рулетка, слоты, гемблинг": "brainrot, cases, case opening, telegram webapp, brainrot battle, casino, gambling, bets, jackpot, win, roulette, slots",
  "Client seed обновлён. Nonce сброшен до 0.": "Client seed updated. Nonce reset to 0.",
  "CSS-селектор: body, #profileBtn, .case-price…": "CSS selector: body, #profileBtn, .case-price…",
  "Cyberpunk · Угловатый": "Cyberpunk · Angular",
  "data-ribbon-text=\"ПАУЗА\"": "data-ribbon-text=\"PAUSED\"",
  "FAQ — частые вопросы | Brainrot Battle": "FAQ — common questions | Brainrot Battle",
  "faq, вопросы, помощь, поддержка,": "faq, questions, help, support,",
  "Fuse — объединяй брейнротов | Brainrot Battle": "Fuse: merge your brainrots | Brainrot Battle",
  "fuse брейнрот, апгрейд, объединить предметы,": "fuse brainrot, upgrade, merge items,",
  "Fuse запускается…": "Fuse starting…",
  "Fuse работает только в апгрейд. Цель должна быть дороже": "Fuse only upgrades. Your target has to cost more than",
  "Fuse работает только в апгрейд. Цель должна быть дороже ": "Fuse only upgrades. Your target has to cost more than ",
  "Fuse: сгорание": "Fuse: burn",
  "Google · Все языки": "Google · All languages",
  "Google · Нейтральный": "Google · Neutral",
  "Google Material · Универсальный": "Google Material · Universal",
  "Humanist · Дружелюбный": "Humanist · Friendly",
  "IBM дизайн · Корпоративный": "IBM design · Corporate",
  "Impact-style · Широкий": "Impact-style · Wide",
  "LCD-экран · Crispy": "LCD screen · Crispy",
  "Linux · Округлый": "Linux · Rounded",
  "RTP сдвинут": "RTP shifted",
  "Server seed сменён — старый раскрыт для проверки.": "Server seed changed. We published the old one so you can check it.",
  "Tech-стартап · Характерный": "Tech startup · Distinctive",
  "Telegram для связи": "Telegram to reach you",
  "Telegram Stars: введи сумму в токенах, нажми кнопку оплаты. Откроется бот. Если инвойс не пришёл сразу, отправь команду /deposit.": "Telegram Stars: enter the amount in tokens and hit pay. The bot opens. If the invoice doesn't arrive right away, send /deposit.",
  "Telegram WebApp профиль": "Telegram WebApp profile",
  "Telegram WebApp: открывай кейсы, фьюзи брейнротов, сражайся в батлах.": "Telegram WebApp: open cases, fuse brainrots, fight in battles.",
  "TOK — его берут только от 2 штук": "TOK — we only take it in pairs or more",
  "TOK — стейк завершён": "TOK — stake complete",
  "TOK — стейк завершён.": "TOK. Stake complete.",
  "TOK · касса / агрегатор": "TOK · checkout / aggregator",
  "TOK · кошелёк / шлюз": "TOK · wallet / gateway",
  "TOK · шлюз / агрегатор": "TOK · gateway / aggregator",
  "TOK (Garama and Madundung). Более дешёвые — продавай.": "TOK (Garama and Madundung). Sell anything cheaper.",
  "TOK за": "TOK for",
  "TOK за активацию": "TOK per redemption",
  "TOK зачислено на баланс": "TOK added to your balance",
  "TOK можно целиться максимум в": "TOK you can aim at no more than",
  "TOK придёт последней частью": "TOK arrives in the last part",
  "TOK ставок": "TOK wagered",
  "TOK. Набрано": "TOK. You've got",
  "TOK) на": "TOK) on",
  "UAH · карта / ссылка": "UAH · card / link",
  "UAH · карты / Приват": "UAH · cards / Privat",
  "UI-стандарт · Нейтральный": "UI standard · Neutral",
  "URL картинки кейса": "Case image URL",
  "USD · внешняя оплата": "USD · external payment",
  "USD · кошелёк / шлюз": "USD · wallet / gateway",
  "Второй способ входа в этот же аккаунт — без бота и без кода.": "A second way into the same account, without bot or code.",
  "Привязать": "Link",
  "Отвязать": "Unlink",
  "Вход на сайт": "Log in to the site",
  "Войти через Discord": "Log in with Discord",
  "Вошли через Discord.": "Logged in with Discord.",
  "Discord привязан к аккаунту.": "Discord linked to the account.",
  "Этот Discord уже привязан к другому аккаунту.": "That Discord is already linked to another account.",
  "Вход через Discord отменён.": "Discord login cancelled.",
  "Сначала войдите в аккаунт, потом привязывайте Discord.": "Log in first, then link Discord.",
  "Вход через Discord сейчас выключен.": "Discord login is switched off right now.",
  "Вход не подтвердился — начните заново.": "Login didn't go through. Start again.",
  "Discord не ответил. Попробуйте позже.": "Discord didn't answer. Try again later.",
  "Discord отвязан.": "Discord unlinked.",
  "Смотреть кейсы можно без входа. Открыть кейс, сыграть в Апгрейдер, Батл, Дайсы, Краш или Квесты, зайти в Профиль — только после входа.": "You can browse cases without logging in. Log in to open a case, play Upgrader, Battle, Dice, Crash or Quests, or check your Profile.",
  "Звёзды": "Stars",
  "3. Отправьте трейд ровно с теми брейнротами, что в заявке — лишнее не зачисляется": "3. Send a trade with exactly the brainrots from your request. We don't credit extras.",
  "Количество звёзд": "Stars amount",
  "Создать счёт в звёздах": "Create a Stars invoice",
  "Введи количество звёзд выше.": "Enter the Stars amount above.",
  "Сначала введи количество звёзд": "Enter the amount of Stars first",
  "Не удалось создать счёт в звёздах": "Couldn't create the Stars invoice",
  "Магазин": "Shop",
  "МАГАЗИН": "SHOP",
  "Ничего не нашлось": "Nothing found",
  "Купить ": "Buy ",
  "Не вышло купить": "The purchase did not go through",
  "Цена выше стоимости брейнрота на ": "Prices run ",
  "%. Купленное нельзя вывести — только отыграть или продать.": "% above the brainrot value. You cannot withdraw what you buy here: play it or sell it.",
  "Куплено: ": "Bought: ",
  " TOK. Выводу не подлежит.": " TOK. You cannot withdraw it.",
  "куплен — не выводим": "bought — we do not withdraw it",
  "Купленное в магазине не выводится": "We do not cash out shop purchases",
  "Этот брейнрот куплен в магазине — такие не выводятся. Отыграй его в апгрейдере, дайсах или краше либо продай за TOK.": "You bought this brainrot in the shop, and we do not cash those out. Play it in the upgrader, dice or crash, or sell it for TOK.",
  " куплен в магазине — такие брейнроты мы не выводим. Его можно отыграть в апгрейдере, дайсах или краше, а можно продать за TOK в инвентаре.": " came from the shop, and we do not cash those out. Play it in the upgrader, dice or crash, or sell it for TOK from your inventory.",
  "🏷️ Тег в имени": "🏷️ Tag in your name",
  "в своё имя в Telegram — его видят все, с кем ты переписываешься.": "to your Telegram name. Everyone you chat with sees it.",
  "Проверить и получить": "Check and claim",
  "Курс": "Rate",
  "Цену берём с рынка Portals: платим по флору твоей модели подарка. Фоны": "We take the price from the Portals market and pay your gift model floor. The",
  "дороже — за них считаем по цене этой же модели с этим фоном. Остальные фоны и символы на цену не влияют.": "backdrops pay more: for those we use the price of the same model with that backdrop. Every other backdrop and every symbol leaves the price alone.",
  "скоро": "soon",
  " открывается бесплатно — он ждёт в разделе кейсов": " is free to open. Find it in the cases tab",
  "Крипта на кошелёк": "Crypto to a wallet",
  "Крипта через CryptoBot": "Crypto via CryptoBot",
  "Сколько TOK укажешь — столько и придёт. Монету выберешь ниже, адрес покажем здесь же.": "You get exactly the TOK you ask for. Pick a coin below and the address shows up right here.",
  "Добавь": "Add",
  "Введи сумму в TOK выше.": "Enter an amount in TOK above.",
  "комиссия ": "fee ",
  "Сначала укажи сумму выше.": "Enter the amount above first.",
  "Чем платишь": "What you pay with",
  "Бесплатный кейс за юзернейм": "A free case for your username",
  "Добавь тег нашего проекта к своему нику в Telegram и получай бесплатный кейс каждый день!": "Add our tag to your Telegram name and pick up a free case every day!",
  "Забрать кейс": "Claim the case",
  "доплата автоматически": "the top-up is automatic",
  "доплата": "top-up",
  "ещё": "more",
  "с": "s",
  "Пропустить": "Skip",
  "USDT / TON / BTC": "USDT / TON / BTC",
  "Выдано: ": "Granted: ",
  "Поставлен ": "Staked: ",
  "Поиск по кейсам: ": "Search cases: ",
  " оплачен. Баланс зачислен.": " paid. Balance credited.",
  " истёк. Создай новый счёт.": " expired. Create a new invoice.",
  " ожидает оплату в Telegram Stars.": " awaiting Telegram Stars payment.",
  "К оплате в выбранной валюте: ": "To pay in selected currency: ",
  "Создан счёт ": "Invoice ",
  " создана. Администратор свяжется с тобой по контакту.": " created. We will contact you.",
  "и ещё ": "and ",
  " предмет(ов):": " item(s):",
  "выбор ": "choice ",
  "Выбран ": "Selected: ",
  " шт.)...": " pcs.)...",
  " камень": " stone",
  " камня": " stones",
  " камней": " stones",
  "Сумма дропа: ": "Drop total: ",
  " · прокрутка…": " · spinning...",
  "Ошибка загрузки: ": "Loading error: ",
  "Пополнить брейнротом": "Deposit a brainrot",
  "Пополнение брейнротом": "Brainrot deposit",
  "Редактировать": "Edit",
  "Тематические кейсы": "Themed cases",
  "Бесплатные кейсы": "Free cases",
  "Бесплатный": "Free",
  "За стейкинг": "For staking",
  "Партнеры": "Partners",
  "Партнёры": "Partners",
  "ОБНОВЛЁН": "UPDATED",
  "РЕДИЗАЙН": "REDESIGN",
  "Обновлённый дроп": "Updated drops",
  "Новый дизайн": "New design",
  "Новый кейс": "New case",
  "СТАТИСТИКА САЙТА": "SITE STATISTICS",
  "Статистика сайта": "Site statistics",
  "игроков": "players",
  "кейсов открыто": "cases opened",
  "апгрейдов сделано": "upgrades made",
  "предметов продано": "items sold",
  "бросков в дайсах": "dice rolls",
  "раундов краша": "crash rounds",
  "битв сыграно": "battles played",
  "Апгрейдов": "Upgrades",
  "Крашей сыграно": "Crash rounds played",
  "Бросков дайса": "Dice rolls",
  "Фьюзов": "Fuses",
  "Лесенок": "Ladders",
  "Обменов": "Exchanges",
  "за активацию": "per activation",
  "и закрепится за тобой рефералом.": "and becomes your referral.",
  "Показать": "Show",
  "Скрыть": "Hide",
  "Спишется": "Will be charged",
  "Желаемый предмет": "Desired item",
  "Твой вклад": "Your stake",
  "бонус": "bonus",
  "Русский": "Russian",
  "заявка отменена вами": "request cancelled by you",
  "трейд отменён вами": "trade cancelled by you",
  "трейд не был завершён до конца": "the trade was not completed",
  "истёк срок ожидания трейда": "the trade timed out",
  "в трейде оказались не те предметы": "the wrong items were in the trade",
  "в трейд добавлены не все предметы, время вышло": "you did not add all the items in time",
  "предмет не найден в трейде": "item not found in the trade",
  "победа": "win",
  "Победа!": "Win!",
  "Проигрыш.": "Loss.",
  "Шанс": "Chance",
  "Жолтый": "Yellow",
  "Белый": "White",
  "Чёрный": "Black",
  "совпадений": "matches",
  "Выигрыш": "Payout",
  "соты": "combs",
  "сот": "combs",
  "Мёд": "Honey",
  "мёд": "honey",
  "батл": "battle",
  "краш": "crash",
  "обменник": "exchange",
  "брейнрота": "brainrot",
  "брейнротов": "brainrots",
  "брейнроты": "brainrots",
  "предм.": "items",
  "Бафы": "Buffs",
  "срока": "term",
  "Квест": "Quest",
  "Итого": "Total",
  "Итого:": "Total:",
  "Игроки": "Players",
  "Через": "In",
  "готово": "done",
  "откуда": "from where",
  "Редкий": "Rare",
  "Обычный": "Common",
  "Эпический": "Epic",
  "Легендарный": "Legendary",
  "— получено": "— received",
  "лесенка": "ladder",
  "Лесенку": "the Ladder",
  "Причина": "Reason",
  "создать": "create",
  "дешевле": "cheaper",
  "Мутация: ": "Mutation: ",
  "Наблюдение": "Watching",
  "из прошлого": "from the past",
  "Тайна-таймер": "Mystery timer",
  "уже применён": "already applied",
  "Закрыть бафы": "Close buffs",
  "Главный приз": "Main prize",
  "прямо сейчас": "right now",
  "зрительского": "spectator",
  "живой детали": "live detail",
  "TOK · убрать": "TOK · remove",
  "уже на выводе": "already in a withdrawal",
  "нет в наличии": "out of stock",
  "откуда выпало": "where it dropped from",
  "забронировано": "reserved",
  "автоматически": "automatically",
  "кубик с цветом": "a die with a colour",
  "число + иконка": "number + icon",
  "снять скрытость": "unhide",
  "Не загрузилось. Обнови страницу.": "Failed to load. Refresh the page.",
  "Кейс за стейкинг": "Case for staking",
  "Форс-перезагрузка": "Force reload",
  "плавное появление": "smooth fade-in",
  "без своей коробки": "without its own box",
  "Выиграть в дайсах": "Win at dice",
  "Выиграть в апгрейдере": "Win at the upgrader",
  "Выбить предмет дороже": "Drop an item worth more",
  "Фьюз: утешительный": "Fuse: consolation",
  "Вывод не состоялся": "The withdrawal fell through",
  "Выводы не состоялись": "The withdrawals fell through",
  "Награда за стейкинг": "Staking reward",
  "Указать мутацию": "Set the mutation",
  "Топ дроп за 24 часа": "Top drop of the last 24 hours",
  "Потратить на кейсы:": "Spent on cases:",
  "цветной — не выводим": "mutated — we do not withdraw it",
  "Летит... жми Забрать": "Flying... hit Cash out",
  "на каком иксе забрали": "at what multiplier it was cashed out",
  "Выводим брейнротов от": "We withdraw brainrots from",
  "Не удалось загрузить:": "Failed to load:",
  "закреплён за партнёром": "bound to a partner",
  "Успеть забрать в краше": "Cash out in time at Crash",
  "найдите пользователя @X": "find the user @X",
  "Не удалось загрузить FAQ:": "Could not load the FAQ:",
  "авто-вывод сработает на Xx": "auto-cashout fires at Xx",
  "пока не завершена/отменена": "until it is completed or cancelled",
  "за каждый успешный стейк от": "for every successful stake from",
  "Не получилось достать квесты:": "Could not fetch the quests:",
  "&mdash; доплата автоматически": "&mdash; the top-up is automatic",
  "Продать предметы из инвентаря": "Sell items from the inventory",
  "нельзя использовать собственный": "you cannot use your own",
  "Раунд летит дальше для остальных": "The round flies on for everyone else",
  "Этот брейнрот принимаем только от": "We only accept this brainrot from",
  "скрыто, пока не доказано обратное": "hidden until proven otherwise",
  "Этот предмет уже в заявке на вывод.": "This item is already in a withdrawal request.",
  "стало 1.54x, а потом откатилось на 1.46x": "went to 1.54x and then rolled back to 1.46x",
  "медовая зона видна только в момент спина": "you only see the honey zone during the spin",
  "Предметы изъяты и в инвентарь не вернулись": "We took the items; they did not return to your inventory",
  "показывает 31 августа, а брони на 31-е нет": "shows 31 August while there is no booking on the 31st",
  "Выбор делается один раз и потом не меняется.": "You choose once and cannot change it later.",
  "Доплата считается от цены брейнрота и начисляется": "The top-up is based on the brainrot's price and is credited",
  "Подробности ниже — по части заявок предметы изъяты.": "Details below. On some requests we took the items.",
  "TOK. Этот дешевле — его можно продать или обменять.": "TOK. This one is cheaper: sell it or exchange it.",
  "— выбирать ничего не нужно. Несколько бафов складываются.": "— nothing to pick. Several buffs stack.",
  "Предметы вернулись в инвентарь — можно оформить заявку заново.": "The items are back in your inventory. Submit the request again.",
  "Этого брейнрота сейчас нет в наличии. Обменяй его на доступного.": "This brainrot is out of stock. Exchange it for an available one.",
  "Стоять в топе партнёров как «Аноним»? Выбор делается один раз и потом не меняется.": "Show as «Anonymous» in the top partners list? You choose once and cannot change it later.",
  "Короткая анимация в кейсах, апгрейдере и дайсах. То же, что кнопка ⚡ в самих разделах.": "A short animation in cases, the upgrader and dice. Same as the ⚡ button in those sections.",
  "Открывай кейсы с брейнротами, фьюзи редкие предметы и сражайся в батлах в Telegram WebApp.": "Open brainrot cases, fuse rare items and fight battles in a Telegram WebApp.",
  "Цветных брейнротов мы не выводим: запаса цветных предметов у площадки нет. Обменяй на обычного или продай.": "We do not withdraw mutated brainrots: we keep none in stock. Exchange it for a plain one or sell it.",
  "Brainrot Battle — Telegram WebApp для открытия кейсов с брейнротами. Открывай кейсы, фьюзи редкие предметы, побеждай в батлах и поднимайся по лесенке.": "Brainrot Battle is a Telegram WebApp for opening brainrot cases. Open cases, fuse rare items, win battles and climb the ladder.",
  "Реферальная": "Referral",
  "Открой": "Open",
  "Открой кейс": "Open the case",
  "Сыграй в": "Play",
  "Сыграй в апгрейдере": "Play the upgrader",
  "Сделай один спин в апгрейдере.": "Do one spin in the upgrader.",
  "Задепай": "Deposit",
  "один раз.": "once.",
  "два раза": "twice",
  "три раза": "three times",
  "раза": "times",
  "раз в сутки": "once a day",
  "Пополни баланс любым способом на сумму от": "Top up your balance by any means, at least",
  "Большой депозит:": "Big deposit:",
  "в подарок": "as a gift",
  "получи": "get",
  "бесплатно.": "for free.",
  "бесплатно": "for free",
  "Выбери: цвет и предмет для ставки": "Pick: a colour and an item to stake",
  "ДАЙСОВ": "DICE",
  "ждёт": "waiting",
  "не считаются.": "do not count.",
  "Жетоны 🎫": "Tokens 🎫",
  "Каких брейнротов можно вывести а каких нет?": "Which brainrots can you withdraw, and which not?",
  "Мы выводим только таких брейнротов: Garama and Madundung, Cash or Card, Burguro And Fryuro, Capitano Moby, Pop Pop Petalini, Cerberus, La Fuse Machine, Sammyni Trackini, Dragon Cannelloni, Orchidox. Список меняется по наличию — если предмета в нём нет, его можно обменять в разделе «Обмен» или продать.": "We only withdraw these brainrots: Garama and Madundung, Cash or Card, Burguro And Fryuro, Capitano Moby, Pop Pop Petalini, Cerberus, La Fuse Machine, Sammyni Trackini, Dragon Cannelloni, Orchidox. The list changes with stock. If an item is not on it, exchange it in the «Exchange» section or sell it.",
  "Почему не работают реферальные промокоды?": "Why doesn't my referral promo code work?",
  "Возможно вы вводили уже другой реферальный промокод. Если же это не так обратитесь в поддержку.": "You probably already entered a different referral code. If not, contact support.",
  "Как пополнить баланс?": "How do I top up my balance?",
  "Пополнить баланс можно двумя способами:\n\n1. Telegram Stars — прямо в приложении, кнопка «Пополнить».\n2. Депозит брейнрота из Roblox — бот выдаст трейд-аккаунт, отправьте предмет туда, после подтверждения баланс зачислится с небольшой скидкой от полной стоимости предмета.\n\nЕсли есть промокод на бонус к депозиту — введите его перед оплатой.": "Two ways to top up your balance:\n\n1. Telegram Stars, right in the app: the «Deposit» button.\n2. A brainrot deposit from Roblox: the bot hands you a trade account, you send the item there, and after we confirm it we credit your balance at a small discount off the item's full value.\n\nIf you have a deposit-bonus promo code, enter it before paying.",
  "Пополнить баланс можно двумя способами:": "There are two ways to top up your balance:",
  "1. Telegram Stars — прямо в приложении, кнопка «Пополнить».\n2. Депозит брейнрота из Roblox — бот выдаст трейд-аккаунт, отправьте предмет туда, после подтверждения баланс зачислится с небольшой скидкой от полной стоимости предмета.": "1. Telegram Stars, right in the app: the «Deposit» button.\n2. A brainrot deposit from Roblox: the bot hands you a trade account, you send the item there, and after we confirm it we credit your balance at a small discount off the item's full value.",
  "Если есть промокод на бонус к депозиту — введите его перед оплатой.": "If you have a deposit-bonus promo code, enter it before paying.",
  "Как вывести брейнрота?": "How do I withdraw a brainrot?",
  "Вывод идёт через живой трейд с нашим Roblox-аккаунтом, поэтому привязан к расписанию — окна вывода видно в профиле. Забронируйте окно и примите трейд от указанного аккаунта строго в своё время, иначе бронь сгорит и придётся вставать в очередь заново.": "Withdrawals go through a live trade with our Roblox account, so they run on a schedule: your profile shows the withdrawal windows. Book a window and accept the trade from the account we name, strictly inside your slot. Miss it and the booking burns, and you queue again.",
  "Какая минимальная сумма для вывода?": "What is the minimum withdrawal amount?",
  "Минимум — 41 TOK (столько сейчас стоит самый дешёвый выводимый брейнрот). Более дешёвые предметы напрямую не выводятся — их можно продать за баланс или обменять в разделе «Обмен».": "The minimum is 41 TOK: that is what the cheapest withdrawable brainrot costs right now. Cheaper items do not go out directly. Sell them for balance or exchange them in the «Exchange» section.",
  "Что такое обмен?": "What is the exchange?",
  "Некоторые брейнроты и гирси-предметы временно нет в наличии на нашем аккаунте, поэтому вывести их напрямую нельзя — они помечены «нет в наличии». Такие предметы можно обменять в разделе «Обмен» на другие доступные, примерно той же ценности, иногда с небольшой доплатой или сдачей.": "Some brainrots and gear items are temporarily out of stock on our account, so they do not go out directly. We mark them «out of stock». Swap such an item in the «Exchange» section for another available one of roughly the same value, sometimes with a small top-up or change.",
  "Как работает реферальная программа?": "How does the referral programme work?",
  "У каждого игрока в профиле есть свой реферальный код. Если по нему зайдёт новый игрок и введёт код, он получит доступ к реферальному кейсу, а вы попадёте в его статистику рефералов. Один аккаунт можно привязать только к одному рефереру и только один раз.": "Your profile has your own referral code. A new player who comes in through it and enters the code unlocks the referral case and lands in your referral stats. One account binds to one referrer, once.",
  "Что такое квесты и жетоны?": "What are quests and tokens?",
  "В разделе «Квесты» есть задания — открыть кейс, сыграть в определённый режим, задепать конкретный предмет, подписаться на канал. За выполнение начисляются Жетоны 🎫 — отдельная валюта, на которую в разделе кейсов можно открывать специальные кейсы за жетоны.": "The «Quests» section has tasks: open a case, play a certain mode, deposit a specific item, subscribe to the channel. Each one pays out Tokens 🎫, a separate currency for opening special token cases in the cases section.",
  "Депозит долго висит в ожидании, что делать?": "My deposit has been pending for a long time, what should I do?",
  "Пополнение через Telegram Stars обычно зачисляется мгновенно. Если депозит брейнротом висит в ожидании дольше положенного времени или платёж Stars не зачислился — не создавайте новую заявку, а сразу напишите в поддержку, указав время оплаты.": "Telegram Stars usually lands instantly. If a brainrot deposit stays pending longer than it should, or a Stars payment never arrived, do not create a second request. Write to support right away and give the time of payment.",
  "Как ввести реферальный код и открыть реферальный кейс": "How do I enter a referral code and open the referral case",
  "Нужен код ДРУГОГО игрока — свой собственный код ввести нельзя, система его не примет. Откройте профиль, пролистайте вниз до блока «Промокод», введите код друга и нажмите «Активировать». Код применяется один раз на аккаунт: после этого поменять его на другой уже не получится. За введённый код открывается доступ к реферальному кейсу, а пригласивший начинает получать процент с ваших депозитов.": "You need ANOTHER player's code: the system rejects your own. Open your profile, scroll down to the «Promo code» block, enter your friend's code and press «Activate». One code per account, and you cannot swap it later. The code unlocks the referral case, and whoever invited you starts earning a cut of your deposits.",
  "Куда вводить промокод": "Where do I enter a promo code",
  "Промокоды на баланс и на предметы вводятся в профиле: пролистайте вниз до блока «Промокод», введите код и нажмите «Активировать». Быстро попасть туда можно кнопкой «Промокод» на главном экране. Отдельно есть поле «Промокод» в самой форме пополнения — оно только для кодов, которые дают бонусный процент к депозиту, и заполнять его необязательно.": "Enter balance and item promo codes in your profile: scroll down to the «Promo code» block, type the code and press «Activate». The «Promo code» button on the home screen jumps you there. The deposit form has its own «Promo code» field. That one takes only codes that add a bonus percentage to a deposit, and you can leave it empty.",
  "Что такое отыгрыш и зачем он нужен": "What is the wager and why is it needed",
  "Отыгрыш — это сумма, на которую нужно сыграть, прежде чем выводить брейнрота. Пока он не выполнен, при попытке оформить вывод придёт сообщение с точным остатком: «Отыгрыш не выполнен. Осталось сыграть: N TOK». Отыгрыш засчитывается по мере игры, отдельно «забирать» или активировать его не нужно — просто играйте, остаток уменьшается сам.": "The wager is how much you have to play through before you can withdraw a brainrot. Until it is done, a withdrawal attempt shows the exact remainder: «Wager not completed. Left to play: N TOK». It counts as you play. Nothing to «claim» or activate: just play, and the remainder drops on its own.",
  "Как отменить батл": "How do I cancel a battle",
  "Отменить батл может его создатель — кнопка отмены находится в самом батле, а не в истории заявок на вывод. Ставка при отмене возвращается на баланс полностью. Если в батле уже есть второй игрок, отменить его может только создатель; уже завершённый батл отменить нельзя.": "Only the creator can cancel a battle, and the cancel button sits inside the battle itself, not in the withdrawal history. Cancelling returns the whole stake to the balance. If a second player already joined, still only the creator can cancel. A finished battle cannot be cancelled.",
  "Почему не открывается бесплатный кейс": "Why does the free case not open",
  "Бесплатный кейс открывается раз в 24 часа. Если вы уже забирали его за последние сутки, кнопка будет недоступна до конца отсчёта — на самом кейсе видно, сколько осталось ждать. Иногда для открытия нужно сначала поделиться кейсом, если такое условие включено.": "The free case opens once every 24 hours. If you claimed it in the last day, the button stays locked until the countdown ends; the case shows how long is left. Sometimes you have to share the case first, when that requirement is on.",
  "Как работает апгрейдер": "How does the upgrader work",
  "В апгрейдере вы ставите один или несколько своих брейнротов и выбираете предмет, который хотите получить. Шанс зависит от того, насколько ваш предмет дешевле цели: чем больше разрыв в стоимости, тем ниже шанс. Шанс всегда показан до прокрутки. Докидывать TOK к предметам в апгрейдере нельзя.": "In the upgrader you stake one or more of your brainrots and pick the item you want. The chance depends on how much cheaper your item is than the target: the bigger the gap, the lower the chance. You always see the chance before the spin. You cannot top up the items with TOK.",
  "Как работают дайсы": "How does dice work",
  "Ставка в дайсах — брейнрот из инвентаря, а не токены: выбираете предмет и один из шести цветов, после чего бросаются четыре кубика. Выплата зависит от того, сколько кубиков совпало с вашим цветом — таблица выплат показана в самом разделе перед броском. Предмет списывается в любом случае, а выигрыш приходит токенами на баланс, исходя из стоимости поставленного предмета.": "You stake a brainrot from your inventory in dice, not tokens: pick an item and one of six colours, then four dice roll. The payout depends on how many dice match your colour, and the section shows the payout table before the roll. The item is gone either way. Winnings land on your balance as tokens, based on the value of the item you staked.",
  "Как работает краш": "How does crash work",
  "Краш — общий раунд для всех игроков сразу, а не личный. Ставка делается токенами до старта, дальше коэффициент растёт, и забрать выигрыш можно в любой момент, пока раунд не оборвался. Не успели — ставка сгорает. У коэффициента есть потолок, после которого раунд закрывается автоматически, а между раундами идёт короткая пауза на приём ставок.": "Crash runs one round for everyone at once. You bet tokens before the start, then the multiplier climbs, and you can cash out any moment until the round breaks off. Miss it and your bet burns. The multiplier has a ceiling: the round closes there by itself. Between rounds there is a short pause for bets.",
  "Что дают цвета (мутации) на брейнротах": "What do colours (mutations) on brainrots do",
  "Цветной вариант брейнрота стоит дороже обычного и участвует в апгрейдере, обмене и продаже по своей цене. Но вывести цветного нельзя: у площадки нет запаса цветных предметов для выдачи — такой предмет можно продать за баланс или обменять на обычного в разделе «Обмен». При пополнении баланса брейнротом цвет тоже не учитывается: боты приёма депозитов распознают только базовый предмет.": "A mutated brainrot costs more than the plain one and counts at its own price in the upgrader, the exchange and sales. But you cannot withdraw it: we keep no mutated items in stock to hand out. Sell it for balance, or exchange it for a plain one in the «Exchange» section. A brainrot deposit ignores the colour too, because the deposit bots recognise only the base item.",
  "Почему раздел временно закрыт": "Why is a section temporarily closed",
  "Любой раздел — кейсы, краш, батлы, стейкинг, приём депозитов — владелец может временно закрыть: на время правок, проверок или технических работ. Это не бан и не поломка вашего аккаунта: раздел просто не открывается ни у кого, пока его не включат обратно. Сроки заранее не называются.": "The owner can close any section for a while: cases, crash, battles, staking, deposits. It happens during edits, checks or technical work. Your account is fine and nobody is banned; the section just does not open for anyone until it goes back on. We do not announce dates in advance.",
  "Как работают батлы": "How do battles work",
  "Батл — это соревнование по открытию одного и того же кейса. Создатель выбирает кейс и число раундов, ставка списывается с баланса и равна цене кейса, умноженной на число раундов. Пока не присоединился соперник, битву можно отменить и вернуть ставку полностью. Одновременно открытая битва у игрока может быть только одна: чтобы создать новую, отмените предыдущую. Отменить уже начавшуюся или завершённую битву нельзя.": "A battle is a contest over the same case. The creator picks a case and the number of rounds; the stake comes off the balance and equals the case price times the rounds. Until an opponent joins, you can cancel and take the whole stake back. One open battle per player: cancel the old one to create a new one. Once a battle starts, you cannot cancel it.",
  "Предмет пропал из инвентаря": "An item is missing from my inventory",
  "Если предмет исчез из доступных, посмотрите на его карточку: у предметов, поставленных в заявку на вывод, стоит пометка «На выводе», а кнопки продажи и вывода заблокированы — предмет закреплён за заявкой, пока она не выполнена или не отменена. Предметы также списываются безвозвратно, когда идут в ставку: в апгрейдер, в дайсы или в обмен. Если ничего из этого не подходит, напишите, что именно пропало и когда — проверим.": "If an item vanished from the available ones, look at its card: anything in a withdrawal request carries the «In withdrawal» mark, with the sell and withdraw buttons locked until the request goes through or gets cancelled. Items also go for good when you stake them in the upgrader, in dice or in an exchange. If none of that fits, tell us what went missing and when. We will check.",
  "Мультиоткрытие": "Multi-opening",
  "предмета не оказалось в наличии — оформите заявку заново или обменяйте предмет": "the item was out of stock. Submit the request again, or exchange it",
  "вы отклонили трейд в игре": "you declined the trade in the game",
  "вы не подтвердили трейд вовремя": "you did not confirm the trade in time",
  "вас не было в игре в выбранное окно очереди": "you were not in the game during your queue window",
  "ник в Roblox не совпал с указанным в заявке": "your Roblox nickname did not match the request",
  "в вашем инвентаре в игре не было места под предметы": "your in-game inventory had no room for the items",
  "ваш аккаунт в Roblox не может принимать трейды — проверьте настройки приватности": "your Roblox account cannot accept trades. Check your privacy settings",
  "сбой на стороне Roblox — оформите заявку заново": "something broke on Roblox's side. Submit the request again",
  "сбой на нашей стороне — оформите заявку заново, предметы уже вернулись": "we broke something on our side. Submit the request again, the items are back",
  "заявка отклонена, обратитесь в поддержку": "the request was rejected, contact support",
  "вывод не состоялся — обратитесь в поддержку": "the withdrawal fell through. Contact support",
  "Нет в наличии": "Out of stock",
  "Отклонил трейд": "Declined the trade",
  "Не принял трейд": "Did not accept the trade",
  "Не было в игре": "Was not in the game",
  "Ник не совпал": "Nickname did not match",
  "Инвентарь полон": "Inventory full",
  "Трейды закрыты": "Trades closed",
  "Сбой Roblox": "Roblox failure",
  "Сбой у нас": "Our failure",
  "Подозрительно": "Suspicious",
  "Нарушил правила": "Broke the rules",
  "трейд остался незавершённым — не нажата кнопка подтверждения": "you never pressed confirm, so the trade stayed unfinished",
  "вы не нажали «Ready» в трейде": "you did not press «Ready» in the trade",
  "предмет не был добавлен в трейд вовремя": "the item was not added to the trade in time",
  "заявка снята администратором": "an administrator pulled the request",
  "заявка потеряла связь с трейдом — оформите новую": "the request lost its link to the trade. Create a new one",
  "в трейд добавлено слишком много предметов за раз": "you added too many items to the trade at once",
  "в заявке слишком много предметов": "there are too many items in the request",
  "трейд не завершён за отведённые 3 минуты": "the trade did not finish inside the 3 minutes allowed",
  "бот приёма отключился во время трейда — попробуйте ещё раз": "the receiving bot dropped out during the trade. Try again",
  "ник в трейде не совпал с указанным в заявке": "the nickname in the trade did not match the request",
  "сбой на стороне приёма — оформите заявку заново": "something broke on the receiving side. Submit the request again",
  "шт.": "pcs",
  "Предмет": "Item",
  "Минимум": "Minimum",
  "Добавь «": "Add «",
  "Нет прав.": "No rights.",
  "Не найдена": "Not found",
  "не найден.": "not found.",
  "Подожди ещё": "Wait another",
  "Нет доступа.": "No access.",
  "Токен истёк.": "Token expired.",
  "Недостаточно": "Not enough",
  "Пул не найден": "Pool not found",
  "Нужен itemId.": "itemId is required.",
  "Текст длиннее": "The text is longer than",
  "Нужен userId.": "userId is required.",
  "Неверный ключ.": "Wrong key.",
  "Ты не партнёр.": "You are not a partner.",
  "Нечего менять.": "Nothing to change.",
  "Не авторизован.": "Not authorised.",
  "Доступ запрещен": "Access denied",
  "Введи промокод.": "Enter a promo code.",
  "Промокод истёк.": "Promo code expired.",
  "Вы уже партнёр.": "You are already a partner.",
  "Вы уже в битве.": "You are already in a battle.",
  "Нет Telegram id.": "No Telegram id.",
  "Токен не найден.": "Token not found.",
  "Доступ запрещён.": "Access denied.",
  "Нечего выводить.": "Nothing to withdraw.",
  "Квест не найден.": "Quest not found.",
  "символов (сейчас": "characters (currently",
  "Учётка отключена.": "Account disabled.",
  "Аккаунт не найден": "Account not found",
  "Нужен массив uid.": "Send an array of uids.",
  "Неверная позиция.": "Wrong position.",
  "Битва не найдена.": "Battle not found.",
  "Депозит не найден.": "Deposit not found.",
  "Заявка не найдена.": "Request not found.",
  "Запись не найдена.": "Record not found.",
  "Система недоступна": "The system is unavailable",
  "Предмет не найден.": "Item not found.",
  "Некорректный цвет.": "Wrong colour.",
  "Нет такого уровня.": "No such level.",
  "Брейнрот не найден.": "Brainrot not found.",
  "Некорректная сумма.": "Wrong amount.",
  "Нужен withdrawalId.": "withdrawalId is required.",
  "Это не твоя запись.": "This is not your record.",
  "TOK. Сейчас набрано": "TOK. Collected so far:",
  "для мультиоткрытия.": "for a multi-opening.",
  "Это не кейс-ваучер.": "This is not a case voucher.",
  "Нужен uid предмета.": "Send an item uid.",
  "Промокод не найден.": "Promo code not found.",
  "Лестница завершена.": "Ladder finished.",
  "Нужен список заявок.": "Send a list of requests.",
  "Такой код уже занят.": "That code is already taken.",
  "Награда уже забрана.": "Reward already claimed.",
  "предметов для фьюза.": "items for a fuse.",
  "Некорректная ставка.": "Wrong stake.",
  "Битва уже завершена.": "Battle already finished.",
  "Аккаунт заблокирован.": "Account blocked.",
  "Нужны логин и пароль.": "Enter a login and a password.",
  "» принимаем только от": "» is only accepted from",
  "Недостаточно баланса.": "Not enough balance.",
  "Реферал уже применён.": "Referral already applied.",
  "Награда уже получена.": "Reward already claimed.",
  "Лестница уже активна.": "A ladder is already running.",
  "Неверный индекс шага.": "Wrong step index.",
  "В битве уже 2 игрока.": "The battle already has 2 players.",
  "не найден в инвентаре.": "not in your inventory.",
  "Запись уже обработана.": "Record already handled.",
  "Заявка уже обработана.": "Request already handled.",
  "Предмет уже на выводе.": "The item is already in a withdrawal.",
  "Нужен текст сообщения.": "Enter the message text.",
  "Промокод уже исчерпан.": "Promo code used up.",
  "Уровень ещё не открыт.": "Level not open yet.",
  "Пустой текст рассылки.": "Empty broadcast text.",
  "Нет активной лестницы.": "No ladder is running.",
  "Предмет не существует.": "No such item.",
  "Раунд сейчас не летит.": "No round in flight right now.",
  "Сессия недействительна.": "Session not valid.",
  "Пользователь не найден.": "User not found.",
  "Нет доступа к депозиту.": "No access to this deposit.",
  "Нет валидных предметов.": "No valid items.",
  "Квест ещё не выполнен (": "The quest is not done yet (",
  "Кейс-награда не найден.": "Case reward not found.",
  "Лестница уже завершена.": "Ladder already finished.",
  "Брейнрот не существует.": "No such brainrot.",
  "Для депозита нужен вход.": "Sign in to make a deposit.",
  "» на обычных или продай.": "» for plain ones or sell it.",
  "Обмен сейчас недоступен.": "Exchange unavailable right now.",
  "Акция сейчас недоступна.": "Promo unavailable right now.",
  "Кейс-награда не найдена.": "Case reward not found.",
  "Нужны userId и userText.": "userId and userText are required.",
  "Кейс временно недоступен.": "Case unavailable right now.",
  "Нужен предмет для ставки.": "Pick an item to stake.",
  "Кейс промокода не найден.": "Promo code case not found.",
  "Досрочный выход отключён.": "Closing early is switched off.",
  "Нужен userId или topicId.": "userId or topicId is required.",
  "Нужно минимум 2 предмета.": "Pick at least 2 items.",
  "Неверный логин или пароль.": "Wrong login or password.",
  "Ошибка при открытии кейса.": "Something broke while opening the case.",
  "Доступно только партнёрам.": "Partners only.",
  "Реферальный код не найден.": "Referral code not found.",
  "Пропуск сейчас недоступен.": "Pass unavailable right now.",
  "Предмет-награда не найден.": "Reward item not found.",
  "Ни один брейнрот не принят.": "We accepted no brainrots.",
  "Доступно только x1, x3, x5.": "Only x1, x3 and x5.",
  "Максимум 3 предмета за раз.": "3 items at a time, max.",
  "Исходный предмет не найден.": "Source item not found.",
  "Целевой брейнрот не найден.": "Target brainrot not found.",
  "Стейкинг сейчас недоступен.": "Staking unavailable right now.",
  "Сначала подпишись на канал.": "Subscribe to the channel first.",
  "Укажите Telegram для связи.": "Give a Telegram contact.",
  "Нет доступа к этому разделу.": "No access to this section.",
  "Недостаточно баланса — нужно": "Not enough balance — you need",
  "Предмет промокода не найден.": "Promo code item not found.",
  "Недостаточно TOK на балансе.": "Not enough TOK on your balance.",
  "У тебя нет активного стейка.": "You have no active stake.",
  "Некорректный telegramUserId.": "Wrong telegramUserId.",
  "Выбери брейнрота для ставки.": "Pick a brainrot to stake.",
  "Максимум 50 предметов за раз.": "50 items at a time, max.",
  "Предмет не найден в каталоге.": "Item not in the catalog.",
  "Реферальный кейс уже получен.": "Referral case already claimed.",
  "TELEGRAM_BOT_TOKEN не настроен": "TELEGRAM_BOT_TOKEN is not set",
  "Для этого действия нужен вход.": "Sign in for this.",
  "Недопустимый источник запроса.": "Request source not allowed.",
  "OWNER_TELEGRAM_ID не настроен.": "OWNER_TELEGRAM_ID is not set.",
  "Выбери время очереди на вывод.": "Pick a withdrawal queue slot.",
  "Предмет не найден в инвентаре.": "Item not in your inventory.",
  "Этим предметом нельзя ставить.": "You cannot stake this item.",
  "Некорректный callerTelegramId.": "Wrong callerTelegramId.",
  "Вы не участвуете в этой битве.": "You are not in this battle.",
  "Ты уже поставил в этом раунде.": "You already bet in this round.",
  "Не хватает баланса для доплаты.": "Not enough balance for the top-up.",
  "Нет доступных сроков стейкинга.": "No staking terms available.",
  "Недостаточно баланса для входа.": "Not enough balance to enter.",
  "Брейнрот не найден в инвентаре.": "Brainrot not in your inventory.",
  "Этот кейс нужно сначала забрать.": "Claim this case first.",
  "Сначала примени реферальный код.": "Apply a referral code first.",
  "Ваша заявка уже на рассмотрении.": "Your application is already under review.",
  "Время очереди на вывод уже вышло.": "Your withdrawal queue slot has passed.",
  "Функция шаринга сейчас отключена.": "Sharing is switched off right now.",
  "Ты уже использовал этот промокод.": "You have already used this promo code.",
  "Этот промокод только для тех, кто": "This promo code is only for those who",
  "Битва уже началась или завершена.": "The battle has started or is finished.",
  "OPS_SECRET не настроен на сервере.": "OPS_SECRET is not set on the server.",
  "Нельзя выводить брейнротов дешевле": "You cannot withdraw brainrots cheaper than",
  "Недостаточно баланса для апгрейда.": "Not enough balance for the upgrade.",
  "Нужен исходный предмет и targetId.": "Send a source item and a targetId.",
  "Неверный формат реферального кода.": "Wrong referral code format.",
  "Нет активной лестницы для кэшаута.": "No ladder to cash out.",
  "Слишком часто — подожди полсекунды.": "Too often. Wait half a second.",
  "Система недоступна. Попробуй позже.": "System unavailable. Try later.",
  "Нет валидных предметов для продажи.": "No valid items to sell.",
  "Кейс не выбран в настройках админа.": "No case picked in the admin settings.",
  "У кнопки есть текст, но нет ссылки.": "The button has text but no link.",
  "Нужно минимум 2 предмета для фьюза.": "A fuse needs at least 2 items.",
  "У брейнрота некорректная стоимость.": "The brainrot's value is wrong.",
  "Недостаточно прав для этого раздела.": "Not enough rights for this section.",
  "Для пополнения нужен вход в аккаунт.": "Sign in to your account to top up.",
  "сек. перед новой заявкой на депозит.": "sec. before a new deposit request.",
  "BOT_USERNAME не настроен на сервере.": "BOT_USERNAME is not set on the server.",
  "Нельзя использовать собственный код.": "You cannot use your own code.",
  "Слишком часто — подожди пару секунд.": "Too often. Wait a couple of seconds.",
  "Квест недоступен для этого аккаунта.": "This quest is not available for your account.",
  "У кнопки есть ссылка, но нет текста.": "The button has a link but no text.",
  "Награда уже получена, попробуй позже.": "Reward already claimed, try later.",
  "Для обращения в поддержку нужен вход.": "Sign in to contact support.",
  "Промокод не найден или уже неактивен.": "Promo code not found, or no longer active.",
  "Докидывание TOK в апгрейдер отключено.": "Adding TOK in the upgrader is switched off.",
  "Нужен хотя бы один предмет и targetId.": "Send at least one item and a targetId.",
  "Ставка предметом допустима в диапазоне": "An item stake is allowed in the range",
  "Выбери подпись: промокод или «Аноним».": "Pick a label: your promo code or «Anonymous».",
  "Подать новую заявку можно раз в сутки.": "You can send one application a day.",
  "Не хватает обменного баланса: нужно ещё": "Not enough exchange balance: you still need",
  "Доступно только для Telegram-аккаунтов.": "Telegram accounts only.",
  "Недостаточно баланса для мультиоткрытия.": "Not enough balance for a multi-opening.",
  "Доступно только при входе через Telegram.": "Works only with Telegram sign-in.",
  "Сначала подготовь сообщение для отправки.": "Prepare the message first.",
  "У тебя нет активной ставки в этом раунде.": "You have no active bet in this round.",
  "Ник в Roblox не может содержать кириллицу.": "Your Roblox nickname cannot contain Cyrillic.",
  "» стоит меньше — продай его вместо вывода.": "» is worth less. Sell it instead of withdrawing.",
  "Условия обмена изменились — выбери заново.": "The exchange terms changed. Pick again.",
  "Этот брейнрот не входит в разрешённый пул.": "This brainrot is not in the allowed pool.",
  "Пополнение брейнротами временно недоступно.": "Brainrot deposits are off for now.",
  "» доступен для вывода, обменивать не нужно.": "» is available for withdrawal, no need to exchange it.",
  "Бот не настроен. Вход через бота недоступен.": "The bot is not set up, so you cannot sign in through it.",
  "Этот брейнрот сейчас недоступен в обменнике.": "This brainrot is not in the exchange right now.",
  "Цель должна быть дороже вложенных предметов.": "The target must be pricier than the items you staked.",
  "Не выводим мутированных брейнротов. Обменяй «": "We do not withdraw mutated brainrots. Exchange «",
  "Предмет уже на выводе и не может быть продан.": "This item is in a withdrawal, so you cannot sell it.",
  "Ссылка на кнопке должна начинаться с https://": "A button link must start with https://",
  "Следующая часть ещё не готова — приходи позже.": "The next part is not ready yet. Come back later.",
  "Для очереди на вывод нужен вход через Telegram.": "Sign in via Telegram for the withdrawal queue.",
  "Отменить можно только заявки в статусе ожидания.": "You can only cancel requests that are still pending.",
  "Заявку уже нельзя отменить — она уже обработана.": "Too late to cancel: the request is already handled.",
  "Нельзя использовать собственный реферальный код.": "You cannot use your own referral code.",
  "Приём ставок закрыт — дождись следующего раунда.": "Bets are closed. Wait for the next round.",
  "Не удалось назначить время очереди. Попробуй позже.": "Could not assign a queue slot. Try later.",
  "Не удалось подготовить сообщение. Попробуй ещё раз.": "Could not prepare the message. Try again.",
  "Выполни условия ниже, чтобы открыть бесплатный кейс.": "Do everything below to open the free case.",
  "» — это кейс, его нужно сначала забрать, а не выводить.": "» is a case. Claim it first, do not withdraw it.",
  "Шанс для этой пары предметов вне допустимого диапазона.": "The chance for this pair of items is out of range.",
  "Только создатель может отменить битву с двумя игроками.": "Only the creator can cancel a battle with two players.",
  "Этот кейс не продаётся — его выдают за успешный стейкинг.": "You cannot buy this case. We hand it out for a completed stake.",
  "Подпись уже выбрана — поменять её может только поддержка.": "The label is already picked. Only support can change it.",
  "Укажите хотя бы одну площадку: канал, YouTube или TikTok.": "Give at least one platform: a channel, YouTube or TikTok.",
  "Код: 3-20 символов, латиница/кириллица/цифры/подчёркивание.": "Code: 3-20 characters, Latin/Cyrillic/digits/underscore.",
  "Кейс, к которому привязан этот ваучер, больше не существует.": "The case behind this voucher is gone.",
  "» в своё имя в Telegram. Уже добавил? Напиши что-нибудь боту — Telegram показывает нам профиль не сразу — и нажми снова.": "» to your Telegram name. Already added it? Send the bot any message (Telegram shows us your profile with a delay), then tap again.",
  "Ты уже подтвердил, что примешь трейд — отменить теперь нельзя.": "You already confirmed you will accept the trade. Too late to cancel.",
  "Этот брейнрот доступен для вывода, продавать в обменник не нужно.": "This brainrot is available for withdrawal, no need to sell it to the exchange.",
  "У вас уже есть открытая битва. Отмените её прежде чем создать новую.": "You already have an open battle. Cancel it before creating a new one.",
  "» сейчас нет в наличии для вывода. Обменяй его на доступный брейнрот.": "» is out of stock for withdrawal right now. Exchange it for an available brainrot.",
  "У тебя уже есть активный стейк. Забери его до конца, чтобы начать новый.": "You already have an active stake. Take it to the end before starting a new one.",
  "Вывод партнёрского баланса доступен только по субботам с 12:00 до 20:00 МСК.": "Partner balance goes out on Saturdays only, 12:00 to 20:00 MSK.",
  "Кейс за депозит открывается только по одному разу — используй обычное открытие.": "The deposit case opens once each. Use the normal opening.",
  "Кейс этой битвы больше недоступен — битва отменена, ставка создателя возвращена.": "This battle's case is gone, so we cancelled the battle and returned the creator's stake.",
  "У тебя уже есть активная заявка на депозит. Дождись её обработки, прежде чем создавать новую.": "You already have an active deposit request. Wait until we handle it before you create a new one.",
  "Апгрейд": "Upgrade",
  "%). Код:": "%). Code:",
  "TOK (шаг": "TOK (step",
  "📢 Админ:": "📢 Admin:",
  ". Шанс был": ". The chance was",
  ". Потеряно": ". Lost",
  "со ставкой": "with a stake of",
  "к пропуску.": "to the pass.",
  "💸 Выведено": "💸 Withdrawn",
  ") — списано": ") — charged",
  "🎉 Победа в": "🎉 Win in",
  "предметов на": "items worth",
  "Краш: ставка": "Crash: bet",
  "% от депозита": "% of the deposit",
  "» выполнен: +": "» done: +",
  "Фьюз успешен:": "Fuse succeeded:",
  "Лестница: шаг": "Ladder: step",
  "выигран (шанс": "won (chance",
  "): кэшаут шаг": "): cash-out at step",
  "Создана битва": "Battle created",
  "Сброс админом.": "An admin reset it.",
  "Создан депозит": "Deposit created",
  ": получен кейс": ": got the case",
  "TOK). Шанс был": "TOK). The chance was",
  "камн.): старт с": "stones): started with",
  "TOK возвращена.": "TOK returned.",
  "Массовая продажа": "Bulk sale",
  "Лестница: кэшаут": "Ladder: cash-out",
  "🎉 Вы победили в": "🎉 You won in",
  "Админ выдал кейс:": "An admin granted a case:",
  "👥 Новый реферал:": "👥 New referral:",
  ": получен предмет": ": got the item",
  "🍯 Квест ивента «": "🍯 Event quest «",
  "Ничья в кейсбатле": "Draw in the case battle",
  "Награда за стейк «": "Stake reward «",
  "Админ выдал мёд: +": "An admin granted honey: +",
  "🏷️ Тег в имени: +": "🏷️ Tag in the name: +",
  "🏷️ Тег в имени: кейс «": "🏷️ Tag in the name: case «",
  " — открывается бесплатно": " is free to open",
  "Кейс сейчас закрыт, забери награду позже.": "The case is closed right now. Come back for the reward later.",
  "🎟 Создан промокод": "🎟 Promo code created",
  "Победа в кейсбатле": "Win in the case battle",
  "обменного баланса).": "of the exchange balance).",
  "📨 Ответ поддержки:": "📨 Support reply:",
  ". Ожидает обработки.": ". Waiting to be handled.",
  "Админ выдал предмет:": "An admin granted an item:",
  "Стейкинг: заморожено": "Staking: locked up",
  "Админ удалил предмет:": "An admin removed an item:",
  "Поражение в кейсбатле": "Loss in the case battle",
  "Присоединился к битве": "Joined the battle",
  "Баланс изменён админом:": "Balance changed by an admin:",
  "💱 Куплено в обменнике:": "💱 Bought in the exchange:",
  "TOK подтверждён админом.": "TOK confirmed by an admin.",
  "Отыгрыш изменён админом:": "Wager changed by an admin:",
  "Кейс за успешный стейк от": "A case for a completed stake from",
  "Заявка на вывод отменена,": "The withdrawal request was cancelled,",
  "предметов разблокировано.": "items unlocked.",
  "🍯 В кейсе нашёлся мёд: +": "🍯 Honey found in the case: +",
  "Фьюз не удался: возвращён": "Fuse failed: returned",
  "Лесенка: проигрыш на шаге": "Ladder: lost at step",
  "Заявка на вывод предметов:": "Item withdrawal request:",
  "» выполнен: получен кейс «": "» done: got the case «",
  "Лестница: старт со ставкой": "Ladder: started with a stake of",
  "Лестница: проигрыш на шаге": "Ladder: lost at step",
  "TOK, ожидает подтверждения.": "TOK, waiting for confirmation.",
  "TOK с реферального баланса.": "TOK from the referral balance.",
  "TOK с партнёрского баланса.": "TOK from the partner balance.",
  "🍯 Медовый пропуск, уровень": "🍯 Honey pass, level",
  "🤝 Партнёрство возобновлено.": "🤝 The partnership is back on.",
  "🎁 Реферальный код применён.": "🎁 Referral code applied.",
  ": каждый получил свой дроп (": ": everyone got their own drop (",
  "Депозит брейнротом одобрен: +": "Brainrot deposit approved: +",
  "🤝 Ставка партнёра изменена на": "🤝 The partner rate changed to",
  "🎉 Уровень реферала повышен до": "🎉 Referral level raised to",
  "присоединился по вашей ссылке.": "joined through your link.",
  "💰 Начислен реферальный бонус +": "💰 Referral bonus credited +",
  "🎬 Авто-пополнение для стрима: +": "🎬 Auto top-up for the stream: +",
  "Отправлено сообщение в поддержку.": "Message sent to support.",
  "Админ изменил реферальный код на «": "An admin changed the referral code to «",
  "Стейкинг завершён досрочно: возвращено": "Staking closed early: returned",
  "! Комиссия с депозитов рефералов теперь": "! The cut from referral deposits is now",
  "TOK. Токены уже зачислены на ваш баланс.": "TOK. The tokens are already on your balance.",
  ") — доступен к выводу в разделе «Бонусы».": ") — available to withdraw in the «Rewards» section.",
  "🤝 Назначен партнёром по программе ревшары (": "🤝 Appointed a revenue-share partner (",
  "» получен — теперь его можно открыть бесплатно.": "» received. Open it for free now.",
  "Краш: раунд прерван перезапуском сервера, ставка": "Crash: a server restart killed the round, the bet",
  "⌛ Выдача не подтверждена вовремя — заявка отменена,": "⌛ The handover was not confirmed in time, so we cancelled the request,",
  "🤝 Бонус к депозиту по партнёрскому коду изменён на": "🤝 The deposit bonus for the partner code changed to",
  "». Брейнрот уже в вашем инвентаре, его можно вывести.": "». The brainrot is already in your inventory, you can withdraw it.",
  "Статистика публичного профиля изменена администратором.": "An administrator changed the public profile stats.",
  "предметов вернулось в инвентарь. Можно оформить вывод заново.": "items are back in your inventory. Submit the withdrawal again.",
  "🤝 Партнёрство отозвано. Накопленный баланс сохранён и доступен к выводу.": "🤝 The partnership is revoked. You keep the accrued balance and can withdraw it.",
  "Баффы:": "Buffs:",
  "Баффы": "Buffs",
  "в общем раунде.": "in the shared round.",
  "Краш: не успел забрать до краша. Потерян": "Crash: you did not cash out before the crash. Lost",
  "Краш: кэшаут на": "Crash: cashed out at",
  "Краш: авто-кэшаут на": "Crash: auto cash-out at",
  "Очередь:": "Queue:",
  "Заявка на вывод отклонена:": "The withdrawal request was rejected:",
  "предмет(ов) разблокировано.": "item(s) unlocked.",
  "предмет(ов) изъято, в инвентарь они не вернулись.": "item(s) taken, they did not return to your inventory.",
  "Заявка на вывод отменена (массово, окно до": "We cancelled the withdrawal request (bulk, window until",
  "Битва отменена (никто не зашёл): возвращено": "Battle cancelled (nobody joined): returned",
  "Бонусный кейс за депозит:": "Deposit bonus case:",
  "Кейс от администрации:": "Case from the admins:",
  "🎁 Партнёрский код применён — вы привязаны к": "🎁 Partner code applied — you are bound to",
  "🎟 Промокод": "🎟 Promo code",
  ": получено": ": received",
  "отменён — возвращено": "cancelled — refunded",
  "Дайсы:": "Dice:",
  "🌈 СКАТТЕР! Автовыигрыш": "🌈 SCATTER! Automatic win",
  "🔧 Служебная корректировка: изъят предмет, полученный из-за бага в тестовом кейсе": "🔧 Maintenance: we removed an item won through a bug in a test case",
  "⌛ Время очереди на вывод вышло — заявка отменена,": "⌛ Your withdrawal queue slot ran out, so we cancelled the request,",
  "предметов разблокировано. Можно оформить вывод заново.": "items unlocked. Submit the withdrawal again.",
  "-е место в месячном рейтинге депозитов:": "-th place in the monthly deposit ranking:",
  "-е место в недельном рейтинге депозитов:": "-th place in the weekly deposit ranking:",
  "-е место в дневном рейтинге депозитов:": "-th place in the daily deposit ranking:",
  "код применён — вы привязаны к": "code applied — you are bound to",
  "Магазин выключен.": "The shop is off.",
  "Магазин временно закрыт.": "The shop is closed for now.",
  "Этого брейнрота в магазине нет.": "The shop does not carry this brainrot.",
  "У этого брейнрота нет цены.": "This brainrot has no price.",
  "Наценка — число от 0 до 100.": "The markup is a number from 0 to 100.",
  "Купленный в магазине брейнрот можно только отыграть в апгрейдере, дайсах и краше или продать.": "A brainrot bought in the shop can only be played in the upgrader, dice and crash, or sold.",
  "Выбери брейнрота.": "Pick a brainrot.",
  "Не хватает ${всего - баланс} TOK.": "You are ${всего - баланс} TOK short.",
  "Новогодний": "New Year",
  "Летний": "Summer",
  "Клубничный": "Strawberry",
  "Пасхальный": "Easter",
  "Реферальный": "Referral",
  "Юбилейный": "Anniversary",
  "Кристальный": "Crystal",
  "Базовый": "Basic",
  "Фантомный": "Phantom",
  "Медовый": "Honey",
  "Императорский": "Imperial",
  "Хэллоуинский": "Halloween",
  "За депозит": "For a deposit",
  "За юзернейм": "For a username",
  "Морская Братва": "Sea Gang",
  "Слон Алл-Ин": "Elephant All-In",
  "Лаки-Блок": "Lucky Block",
  "Визард": "Wizard",
  "Цербер": "Cerberus",
  "Фалкон": "Falcon",
  "Блек Кет": "Black Cat",
  "ДЛС": "DLC",
  "Драгон": "Dragon",
  "Тако": "Taco",
  "Нубини": "Noobini",
  "Сикс Севен": "Six Seven",
  "Скибиди Алл-Ин": "Skibidi All-In",
  "Меовл Алл-Ин": "Meowl All-In",
  "Порк Алл-Ин": "Pork All-In",
  "Полароидини Алл-Ин": "Pollaroidini All-In",
  "Лос Трейдеры": "Los Traders",
  "Лосы": "Los Crew",
  "Никил": "Nikil",
  "Лишарти": "Lisharti",
  "Сморти": "Smorty",
  "Гарама": "Garama",
  "Ракану": "Rakanu",
  "Дима Крис": "Dima Kris",
  "Хиро": "Hiro",
  "Калимба": "Kalimba",
  "ОГ": "OG",
  "Убери чужие ники из имени — ": "Take the other handles out of your name: ",
  ". Награда за наш тег, а не за рекламу других.": ". The reward is for our tag, not for advertising somebody else.",
}));

function englishAllowed() {
  return Boolean(state && state.languageSwitch !== false);
}
function getCurrentLanguage() {
  if (!englishAllowed()) return 'ru';
  try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'ru'; } catch { return 'ru'; }
}
function getCaseName(c) {
  if (!c) return '';
  if (getCurrentLanguage() === 'en' && c.nameEn) return c.nameEn;
  return c.name || '';
}
function setCurrentLanguage(language) {
  const next = (englishAllowed() && language === 'en') ? 'en' : 'ru';
  const prev = getCurrentLanguage();
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch {}
  document.documentElement.lang = next;
  if (next !== prev) {
    if (next === 'en') { ensureEnglishFonts(); localizeTree(document.body); startI18nObserver(); }
    else restoreRussianTree();
  }
  updateClosedRibbons();
  renderSettingsLanguages();
}

const CLOSEABLE_NAV = { cases: 'home', fuse: 'fuse', ladder: 'ladder', battle: 'battle' };
function updateClosedRibbons() {
  const text = getCurrentLanguage() === 'en' ? 'CLOSED' : 'ЗАКРЫТО';
  Object.entries(CLOSEABLE_NAV).forEach(([key, nav]) => {
    const btn = document.querySelector(`.nav-btn[data-nav="${nav}"]`);
    if (!btn) return;
    const closed = Boolean(state.closedFeatures[key]);
    btn.setAttribute('data-ribbon-text', text);
    btn.classList.toggle('is-closed', closed);
    btn.classList.toggle('ops-can-open', closed && Boolean(state._perm));
  });
  const depositClosed = Boolean(state.closedFeatures.deposit);
  document.querySelectorAll('[data-lobby-action="deposit"]').forEach(el => {
    el.setAttribute('data-ribbon-text', text);
    el.classList.toggle('is-closed', depositClosed);
    el.classList.toggle('ops-can-open', depositClosed && Boolean(state._perm));
    el.style.opacity = '';
    el.style.pointerEvents = '';
  });
  const petDepositClosed = Boolean(state.closedFeatures.petDeposit) && !state._perm;
  const closedMark = getCurrentLanguage() === 'en' ? 'closed' : 'закрыто';
  const markTab = (tab, closed) => {
    if (!tab) return;
    let mark = tab.querySelector('.deposit-cat-tab-closed');
    if (closed && !mark) {
      mark = document.createElement('span');
      mark.className = 'deposit-cat-tab-closed';
      tab.appendChild(mark);
    }
    if (mark) mark.textContent = closed ? closedMark : '';
    if (mark && !closed) mark.remove();
    tab.classList.toggle('is-closed-tab', closed);
  };
  const petsTab = document.querySelector('#depositCategoryTabs .deposit-cat-tab[data-deposit-cat="pets"]');
  if (petsTab) {
    petsTab.disabled = petDepositClosed;
    petsTab.title = petDepositClosed ? 'Депозит брейнротами временно недоступен.' : '';
    markTab(petsTab, petDepositClosed);
  }
  const girsyTab = document.querySelector('#depositCategoryTabs .deposit-cat-tab[data-deposit-cat="girsy"]');
  if (girsyTab) {
    const girsyOnlyClosed = Boolean(state.closedFeatures.girsyDeposit) && !state._perm;
    const girsyDepositClosed = petDepositClosed || girsyOnlyClosed;
    girsyTab.disabled = girsyDepositClosed;
    girsyTab.title = petDepositClosed ? 'Депозит брейнротами временно недоступен.' : (girsyOnlyClosed ? 'Временно недоступно — гирсы сейчас выводятся только через обмен' : '');
    markTab(girsyTab, girsyDepositClosed);
    if (girsyDepositClosed && _petDepositActiveCategory === 'girsy') switchDepositCategory(petDepositClosed ? 'stars' : 'pets');
  }
  if (petDepositClosed && _petDepositActiveCategory === 'pets') switchDepositCategory('stars');
  syncClosedToggles();
  syncHiddenNav();
}
function syncClosedToggles() {
  ['cases','fuse','ladder','battle','deposit','girsyDeposit','petDeposit'].forEach(key => {
    const cb = document.getElementById(`closureToggle_${key}`);
    const st = document.getElementById(`closureStatus_${key}`);
    const closed = Boolean(state.closedFeatures[key]);
    if (cb) cb.checked = closed;
    if (st) {
      st.textContent = closed ? (getCurrentLanguage() === 'en' ? 'Closed' : 'Закрыто') : (getCurrentLanguage() === 'en' ? 'Open' : 'Открыто');
      st.className = `ops-closure-status ${closed ? 'is-closed-label' : 'is-open'}`;
    }
  });
}
function applyHoneyEventNav() {
  const btn = document.getElementById('navEventBtn');
  if (!btn) return;
  btn.classList.toggle('is-hidden', !state.honeyEvent?.active);
  applyHoneyEggs();
}

function applyRaffleNav() {
  const btn = document.getElementById('navRaffleBtn');
  if (!btn) return;
  btn.classList.toggle('hidden', !state.depositContest?.enabled);
}

function applyPartnerBoardNav() {
  const card = document.getElementById('partnerBoardCard');
  if (!card) return;
  card.classList.toggle('hidden', !state.partnerBoard?.enabled);
}

function applyStakingNav() {
  const zone = document.querySelector('.bonus-zone-staking');
  if (!zone) return;
  zone.classList.toggle('hidden', !state.staking?.enabled);
}

function applyHoneyEggs() {
  const active = Boolean(state.honeyEvent?.active);
  if (!active) {
    if (window.__honeyEggs) window.__honeyEggs.stop();
    return;
  }
  if (window.__honeyEggs || document.getElementById('honeyEggsScript')) return;
  const s = document.createElement('script');
  s.id = 'honeyEggsScript';
  s.src = '/honey-eggs.js?v=a12';
  s.defer = true;
  document.head.appendChild(s);
}

let _mysteryTimerInterval = null;
function _mtPad(n) { return String(n).padStart(2, '0'); }
function renderMysteryTimer() {
  const block = document.getElementById('mysteryTimerBlock');
  if (!block) return;
  const cfg = state.mysteryTimer || {};
  const endsAt = Number(cfg.endsAt) || 0;
  const show = Boolean(cfg.enabled) && endsAt > Date.now();
  block.classList.toggle('hidden', !show);
  if (!show) {
    if (_mysteryTimerInterval) { clearInterval(_mysteryTimerInterval); _mysteryTimerInterval = null; }
    return;
  }
  const tick = () => {
    const left = endsAt - Date.now();
    if (left <= 0) {
      block.classList.add('hidden');
      if (_mysteryTimerInterval) { clearInterval(_mysteryTimerInterval); _mysteryTimerInterval = null; }
      return;
    }
    const secs = Math.floor(left / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('mysteryTimerDays',  Math.floor(secs / 86400));
    set('mysteryTimerHours', _mtPad(Math.floor(secs % 86400 / 3600)));
    set('mysteryTimerMins',  _mtPad(Math.floor(secs % 3600 / 60)));
    set('mysteryTimerSecs',  _mtPad(secs % 60));
  };
  tick();
  if (_mysteryTimerInterval) clearInterval(_mysteryTimerInterval);
  _mysteryTimerInterval = setInterval(tick, 1000);
}

function syncHiddenNav() {
  ['fuse','ladder','battle'].forEach(nav => {
    const btn = document.querySelector(`.nav-btn[data-nav="${nav}"]`);
    if (!btn) return;
    const hidden = Boolean(state.hiddenNav[nav]);
    btn.classList.toggle('hidden', hidden);
    btn.style.display = hidden ? 'none' : '';
  });
  ['fuse','ladder','battle'].forEach(nav => {
    const cb = document.getElementById(`navHiddenToggle_${nav}`);
    const st = document.getElementById(`navHiddenStatus_${nav}`);
    const hidden = Boolean(state.hiddenNav[nav]);
    if (cb) cb.checked = hidden;
    if (st) {
      const isEn = getCurrentLanguage() === 'en';
      st.textContent = hidden ? (isEn ? 'Hidden' : 'Скрыт') : (isEn ? 'Visible' : 'Виден');
      st.className = `ops-closure-status ${hidden ? 'is-closed-label' : 'is-open'}`;
    }
  });
}

for (const [key, value] of [...RU_TO_EN]) {
  const ki = key.indexOf('TOK');
  const vi = value.indexOf('TOK');
  if (ki < 0 || vi < 0) continue;
  if (key.indexOf('TOK', ki + 3) >= 0 || value.indexOf('TOK', vi + 3) >= 0) continue;
  const left = key.slice(0, ki);
  const right = key.slice(ki + 3);
  if (left.trim() && !RU_TO_EN.has(left)) RU_TO_EN.set(left, value.slice(0, vi));
  if (right.trim() && !RU_TO_EN.has(right)) RU_TO_EN.set(right, value.slice(vi + 3));
}

for (const [key, value] of [...RU_TO_EN]) {
  const bareKey = key.replace(/^[^А-Яа-яЁёA-Za-z0-9]+/, '');
  const bareValue = value.replace(/^[^А-Яа-яЁёA-Za-z0-9]+/, '');
  if (bareKey === key || !bareKey || !bareValue) continue;
  if (!/[А-Яа-яЁё]/.test(bareKey) || RU_TO_EN.has(bareKey)) continue;
  RU_TO_EN.set(bareKey, bareValue);
}

for (const [k, v] of [...RU_TO_EN]) {
  const upper = k.toUpperCase();
  if (upper !== k && !RU_TO_EN.has(upper)) RU_TO_EN.set(upper, v.toUpperCase());
}

const I18N_EXACT_ONLY = new Set(['нет', 'д', 'ч', 'м', 'с', 'дня', 'часов', 'минут', 'секунд', 'К выводу']);
for (const key of [...I18N_EXACT_ONLY]) I18N_EXACT_ONLY.add(key.toUpperCase());

const RU_TO_EN_BY_LENGTH = [...RU_TO_EN.keys()].filter((k) => k.length > 2 && !I18N_EXACT_ONLY.has(k)).sort((a, b) => b.length - a.length);

const _i18nKeyRegexCache = new Map();
function i18nKeyRegex(key) {
  let rx = _i18nKeyRegexCache.get(key);
  if (!rx) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const head = /^[А-Яа-яЁё]/.test(key) ? '(^|[^А-Яа-яЁё])' : '()';
    const tail = /[А-Яа-яЁё]$/.test(key) ? '(?![А-Яа-яЁё])' : '';
    rx = new RegExp(head + escaped + tail, 'g');
    _i18nKeyRegexCache.set(key, rx);
  }
  return rx;
}

function translateTextRuToEn(text) {
  const source = String(text || '');
  if (!source) return source;
  if (!/[А-Яа-яЁё]/.test(source)) return source;
  if (RU_TO_EN.has(source)) return RU_TO_EN.get(source);
  let next = source;
  for (const key of RU_TO_EN_BY_LENGTH) {
    if (!next.includes(key)) continue;
    const value = RU_TO_EN.get(key);
    next = next.replace(i18nKeyRegex(key), (m, before) => before + value);
  }

  next = next
    .replace(/Продажа\s(.+)\sза\s(\d+)\sTOK\.?/g, 'Sale of $1 for $2 TOK.')
    .replace(/Открыт кейс\s(.+)\sза\s(\d+)\sTOK\s→\s(.+)\s\((\d+)\sTOK\)\.?/g, 'Opened case $1 for $2 TOK -> $3 ($4 TOK).')
    .replace(/Продано:\s*(.+)\sза\s(\d+)\sTOK/g, 'Sold: $1 for $2 TOK')
    .replace(/Продано\s(\d+)\sшт\.\sза\s(\d+)\sTOK/g, 'Sold $1 pcs for $2 TOK')
    .replace(/Получено:\s*(.+)/g, 'Received: $1')
    .replace(/Шаг\s(\d+)\sпройден/g, 'Step $1 completed')
    .replace(/Р аундов:\s*(\d+)/g, 'Rounds: $1')
    .replace(/Игроки:\s*(\d+)\/2/g, 'Players: $1/2')
    .replace(/Выбери брейнрот #(\d+)/g, 'Choose brainrot #$1')
    .replace(/(\d+)%\sшанс/g, '$1% chance')
    .replace(/Награда:\s*x([\d.]+)/g, 'Reward: x$1')
    .replace(/Круг\s(\d+)\/(\d+)/g, 'Round $1/$2')
    .replace(/Победитель:\s*(.+)/g, 'Winner: $1');

  next = next
    .replace(/(\d+)\s*д\s+(\d+)\s*ч/g, '$1d $2h')
    .replace(/(\d+)\s*ч\s+(\d+)\s*м/g, '$1h $2m')
    .replace(/(\d+)\s*м\s+(\d+)\s*с/g, '$1m $2s')
    .replace(/(\d+)\s*(?:день|дня|дней)(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' day' : ' days'))
    .replace(/(\d+)\s*(?:час|часа|часов)(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' hour' : ' hours'))
    .replace(/(\d+)\s*(?:минута|минуты|минут)(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' minute' : ' minutes'))
    .replace(/(\d+)\s*(?:секунда|секунды|секунд)(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' second' : ' seconds'))
    .replace(/(\d+)\s*мин(?![А-Яа-яЁё])/g, '$1 min')
    .replace(/(\d+)\s*д(?![А-Яа-яЁё])/g, '$1d')
    .replace(/(\d+)\s*ч(?![А-Яа-яЁё])/g, '$1h')
    .replace(/(\d+)\s*м(?![А-Яа-яЁё])/g, '$1m')
    .replace(/(\d+)\s*с(?![А-Яа-яЁё])/g, '$1s')
    .replace(/(\d+)\s*монет(?:а|ы)?(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' coin' : ' coins'))
    .replace(/(\d+)\s*предмет(?:а|ов)?(?![А-Яа-яЁё])/g, (m, n) => n + (n === '1' ? ' item' : ' items'))
    .replace(/К выводу\s+(\d+\s*items?)/g, '$1 for cash-out')
    .replace(/(\d+)\s*шт\.?/g, '$1 pcs')
    .replace(/([^А-Яа-яЁё\s])\s+и\s+(?=[^А-Яа-яЁё\s])/g, '$1 and ')
    .replace(/(^|[^А-Яа-яЁё])за\s+(\d+)/g, '$1for $2')
    .replace(/(^|[^А-Яа-яЁё])из\s+(\d+)/g, '$1of $2')
    .replace(/:\s*ещё\s+(\d+)/g, ': $1 more')
    .replace(/(^|[^А-Яа-яЁё])До\s+(?=[A-Za-z0-9+])/g, '$1To ')
    .replace(/(^|[^А-Яа-яЁё])до\s+(?=[A-Za-z0-9+])/g, '$1to ')
    .replace(/(^|[^А-Яа-яЁё])на\s+(Yellow|Green|Blue|Orange|Red|Purple|White|Black)/g, '$1on $2');

  if (source.length >= 50 && next !== source) {
    const хвост = next.match(/(?:^|[^А-Яа-яЁё])[а-яё]{3,}/g);
    if (хвост && хвост.length >= 3) return source;
  }
  return next;
}
const _i18nTouchedText = [];
const _i18nTouchedAttr = [];
let _i18nApplying = false;

function restoreRussianTree() {
  _i18nApplying = true;
  try {
    for (let i = _i18nTouchedText.length - 1; i >= 0; i--) {
      const rec = _i18nTouchedText[i];
      if (rec.node && rec.node.nodeValue !== rec.original) rec.node.nodeValue = rec.original;
    }
    for (let i = _i18nTouchedAttr.length - 1; i >= 0; i--) {
      const rec = _i18nTouchedAttr[i];
      if (rec.el && rec.el.getAttribute && rec.el.getAttribute(rec.attr) !== rec.original) rec.el.setAttribute(rec.attr, rec.original);
    }
    _i18nTouchedText.length = 0;
    _i18nTouchedAttr.length = 0;
  } finally {
    _i18nApplying = false;
  }
}

function _localizeTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return;
  const tag = parent.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
  const value = node.nodeValue;
  if (!value || !/[А-Яа-яЁё]/.test(value)) return;
  if (node._i18nOut === value) return;
  const next = translateTextRuToEn(value);
  if (next !== value) {
    _i18nTouchedText.push({ node, original: value });
    node.nodeValue = next;
    node._i18nOut = next;
  }
}

const I18N_ATTRS = ['placeholder', 'title', 'aria-label'];
const _i18nAttrOut = new WeakMap();
function _localizeAttrs(el) {
  for (const attr of I18N_ATTRS) {
    const value = el.getAttribute && el.getAttribute(attr);
    if (!value || !/[А-Яа-яЁё]/.test(value)) continue;
    const written = _i18nAttrOut.get(el);
    if (written && written[attr] === value) continue;
    const next = translateTextRuToEn(value);
    if (next !== value) {
      _i18nTouchedAttr.push({ el, attr, original: value });
      el.setAttribute(attr, next);
      if (written) written[attr] = next;
      else _i18nAttrOut.set(el, { [attr]: next });
    }
  }
}

function localizeTree(root = document.body) {
  if (getCurrentLanguage() !== 'en' || !root) return;
  _i18nApplying = true;
  try {
    if (root.nodeType === 3) { _localizeTextNode(root); return; }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(_localizeTextNode);
    if (root.nodeType === 1) _localizeAttrs(root);
    if (root.querySelectorAll) root.querySelectorAll('*').forEach(_localizeAttrs);
  } finally {
    _i18nApplying = false;
  }
}

let _i18nObserver = null;
function startI18nObserver() {
  if (_i18nObserver || typeof MutationObserver === 'undefined' || !document.body) return;
  _i18nObserver = new MutationObserver((records) => {
    if (_i18nApplying || getCurrentLanguage() !== 'en') return;
    for (const rec of records) {
      if (rec.type === 'characterData') { localizeTree(rec.target); continue; }
      if (rec.type === 'attributes') { _i18nApplying = true; try { _localizeAttrs(rec.target); } finally { _i18nApplying = false; } continue; }
      rec.addedNodes.forEach((node) => {
        if (node.nodeType === 3 || node.nodeType === 1) localizeTree(node);
      });
    }
  });
  _i18nObserver.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

const EN_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@62..125,400..800&family=JetBrains+Mono:wght@400..700&display=swap';
function ensureEnglishFonts() {
  if (document.getElementById('en-fonts-link')) return;
  const link = document.createElement('link');
  link.id = 'en-fonts-link';
  link.rel = 'stylesheet';
  link.href = EN_FONTS_HREF;
  document.head.appendChild(link);
}

function installLanguageTools() {
  const lang = getCurrentLanguage();
  document.documentElement.lang = lang;
  if (lang === 'en') { ensureEnglishFonts(); localizeTree(document.body); startI18nObserver(); }
}

function localizeCurrentView() {
  if (getCurrentLanguage() !== 'en') return;
  requestAnimationFrame(() => localizeTree(document.body));
}

const TOKEN_LABEL = 'TOK';
const TOKEN_ICON_DARK_SRC = '/token-icon-v2.webp?v=1';
const TOKEN_ICON_LIGHT_SRC = '/token-icon-light-v2.webp?v=1';

function getTokenIconSrcForTheme() {
  return document.body?.classList.contains('theme-light-red') ? TOKEN_ICON_LIGHT_SRC : TOKEN_ICON_DARK_SRC;
}

function makeTokenIconNode() {
  const img = document.createElement('img');
  img.src = getTokenIconSrcForTheme();
  img.alt = 'Token';
  img.className = 'token-inline-icon';
  img.dataset.tokenIcon = '1';
  img.decoding = 'async';
  img.loading = 'lazy';
  return img;
}

function questTicketIconHtml(extraClass = '') {
  return `<img src="/ticket-icon.webp" class="solar-icon quest-ticket-icon${extraClass ? ' ' + extraClass : ''}" alt="" loading="lazy" decoding="async">`;
}

function combIconHtml(extraClass = '') {
  return `<img src="/comb-icon-v2.webp" class="solar-icon quest-ticket-icon${extraClass ? ' ' + extraClass : ''}" alt="" loading="lazy" decoding="async">`;
}

function refreshTokenIconsForTheme() {
  const src = getTokenIconSrcForTheme();
  document.querySelectorAll('img.token-inline-icon').forEach((img) => {
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  });
}

function replaceTokenTextNodes(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA' || tag === 'OPTION') return NodeFilter.FILTER_REJECT;
      return node.nodeValue && node.nodeValue.includes(TOKEN_LABEL) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  targets.forEach(node => {
    const text = node.nodeValue || '';
    if (!text.includes(TOKEN_LABEL)) return;
    const parts = text.split(TOKEN_LABEL);
    const frag = document.createDocumentFragment();
    parts.forEach((part, idx) => {
      if (part) frag.appendChild(document.createTextNode(part));
      if (idx < parts.length - 1) frag.appendChild(makeTokenIconNode());
    });
    node.parentNode?.replaceChild(frag, node);
  });
}

function installTokenIconReplacer() {
  replaceTokenTextNodes(document.body);
  refreshTokenIconsForTheme();
  const pending = new Set();
  let scheduled = false;
  const flush = () => {
    scheduled = false;
    const roots = [...pending]; pending.clear();
    for (const root of roots) { if (root.isConnected) replaceTokenTextNodes(root); }
  };
  const queue = (root) => {
    if (!root) return;
    pending.add(root);
    if (!scheduled) { scheduled = true; setTimeout(flush, 50); }
  };
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'characterData') {
        if (m.target.nodeValue && m.target.nodeValue.includes(TOKEN_LABEL)) queue(m.target.parentElement || document.body);
        continue;
      }
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) { if (node.textContent && node.textContent.includes(TOKEN_LABEL)) queue(node); }
        else if (node.nodeType === 3 && node.nodeValue && node.nodeValue.includes(TOKEN_LABEL)) queue(node.parentElement || document.body);
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
}

const FAST_SPIN_STORAGE_KEY = 'brainrot-fast-spin';
function getFastSpinEnabled() {
  try { return localStorage.getItem(FAST_SPIN_STORAGE_KEY) === '1'; } catch { return false; }
}
function setFastSpinEnabled(value) {
  try { localStorage.setItem(FAST_SPIN_STORAGE_KEY, value ? '1' : '0'); } catch {}
}

const STREAMER_MODE_STORAGE_KEY = 'brainrot-streamer-mode';
const STREAMER_CFG_STORAGE_KEY = 'brainrot-streamer-cfg';

const STREAMER_PARTS = [
  { key: 'balance', cls: 'sm-balance', name: 'Баланс и история',
    note: 'Сам баланс, отыгрыш, сводка профиля, лента операций, партнёрские выплаты — всё, по чему баланс восстанавливается за пару кадров паузы.' },
  { key: 'cashout', cls: 'sm-cashout', name: 'Пополнение и вывод',
    note: 'Кнопки и окна пополнения и вывода. Они ещё и не нажимаются, пока режим включён: размытую кнопку легко задеть вслепую прямо в эфире.' },
  { key: 'stakes', cls: 'sm-stakes', name: 'Свои ставки',
    note: 'Размер ставки в краше, дайсах и лестнице. Чужие ставки раунда остаются видны — это часть зрелища.' },
  { key: 'prices', cls: 'sm-prices', name: 'Цены и суммы',
    note: 'Цена кейса, стоимость дропа, суммы в лентах и историях — везде, где на экране есть число в токенах.' },
  { key: 'reel', cls: 'sm-reel', name: 'Прокрут кейса',
    note: 'Рулетка открытия: и лента прокрута, и окно с результатом. Именно этот кадр площадки узнают быстрее всего.' },
  { key: 'art', cls: 'sm-art', name: 'Картинки кейсов и предметов',
    note: 'Лёгкое размытие обложек: предмет узнаётся, но кадр перестаёт выглядеть витриной.' },
  { key: 'words', cls: 'sm-words', name: 'Слова-триггеры',
    note: 'Кейс, ставка, вывод, депозит, апгрейд, джекпот и прочая лексика — прямо в тексте страницы, где бы она ни встретилась.' },
];

const STREAMER_BLUR_PRESETS = [
  { key: 'soft', px: 5, name: 'Слабо' },
  { key: 'mid', px: 9, name: 'Средне' },
  { key: 'hard', px: 15, name: 'Сильно' },
];

const STREAMER_DEFAULT_CFG = Object.freeze({
  balance: true, cashout: true, stakes: true, prices: true,
  reel: true, art: true, words: true,
  hover: true, blur: 'mid',
});

function getStreamerCfg() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STREAMER_CFG_STORAGE_KEY) || 'null'); } catch {}
  const cfg = { ...STREAMER_DEFAULT_CFG };
  if (saved && typeof saved === 'object') {
    for (const part of STREAMER_PARTS) if (typeof saved[part.key] === 'boolean') cfg[part.key] = saved[part.key];
    if (typeof saved.hover === 'boolean') cfg.hover = saved.hover;
    if (STREAMER_BLUR_PRESETS.some(p => p.key === saved.blur)) cfg.blur = saved.blur;
  }
  return cfg;
}

function saveStreamerCfg(cfg) {
  try { localStorage.setItem(STREAMER_CFG_STORAGE_KEY, JSON.stringify(cfg)); } catch {}
}

function applyStreamerCfg() {
  const root = document.documentElement;
  const on = getStreamerMode();
  const cfg = getStreamerCfg();
  for (const part of STREAMER_PARTS) root.classList.toggle(part.cls, on && cfg[part.key] !== false);
  root.classList.toggle('sm-hover', on && cfg.hover !== false);
  const preset = STREAMER_BLUR_PRESETS.find(p => p.key === cfg.blur) || STREAMER_BLUR_PRESETS[1];
  root.style.setProperty('--sm-blur', preset.px + 'px');
  root.style.setProperty('--sm-blur-soft', Math.max(2, Math.round(preset.px / 2)) + 'px');
  syncSharpWordMasking(on && cfg.words !== false);
}

const SOUND_OFF_STORAGE_KEY = 'brainrot-sound-off';
let _soundOff = (() => {
  try { return localStorage.getItem(SOUND_OFF_STORAGE_KEY) === '1'; } catch { return false; }
})();

function isSoundOn() { return !_soundOff; }

function setSoundOff(value) {
  _soundOff = Boolean(value);
  try { localStorage.setItem(SOUND_OFF_STORAGE_KEY, _soundOff ? '1' : '0'); } catch {}
  if (_soundOff) {
    for (const name of [..._gameSfxLoops.keys()]) stopGameSfxLoop(name);
  }
}

function getStreamerMode() {
  try { return localStorage.getItem(STREAMER_MODE_STORAGE_KEY) === '1'; } catch { return false; }
}

const SHARP_WORD_STEMS = [
  'кейс', 'дайс', 'рулетк', 'прокрут', 'апгрейд', 'прокач', 'улучш',
  'ставк', 'ставок', 'ставит', 'поставит', 'проигр', 'выигр', 'выигрыш',
  'джекпот', 'краш', 'лестниц', 'слот', 'спин', 'крутит', 'скрут',
  'депозит', 'пополн', 'вывод', 'вывест', 'выведен', 'баланс', 'токен',
  'продат', 'продаж', 'продай', 'купит', 'покуп', 'бонус', 'фрибет',
  'казино', 'азарт', 'бет', 'банк', 'приз',
  'case', 'bet', 'stake', 'deposit', 'withdraw', 'balance', 'jackpot',
  'upgrade', 'spin', 'token', 'sell', 'buy', 'win',
];
const SHARP_WORD_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${SHARP_WORD_STEMS.join('|')})[\\p{L}]*`, 'giu');

const SHARP_WORD_SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'SVG']);
const SHARP_WORD_SKIP_SELECTOR = '#settingsPanel, [data-sm-skip], .sm-word';

let _sharpWordObserver = null;
let _sharpWordPass = false;
let _sharpWordTimer = null;
const _sharpWordQueue = new Set();

function markSharpWordsIn(root) {
  if (!root || _sharpWordPass) return;
  const host = root.nodeType === 1 ? root : root.parentElement;
  if (!host || !host.isConnected) return;
  if (host.closest && host.closest(SHARP_WORD_SKIP_SELECTOR)) return;
  _sharpWordPass = true;
  try {
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || node.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || SHARP_WORD_SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(SHARP_WORD_SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        SHARP_WORD_RE.lastIndex = 0;
        return SHARP_WORD_RE.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const targets = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) targets.push(n);
    for (const node of targets) {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let last = 0;
      SHARP_WORD_RE.lastIndex = 0;
      for (let m = SHARP_WORD_RE.exec(text); m; m = SHARP_WORD_RE.exec(text)) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement('span');
        span.className = 'sm-word';
        span.textContent = m[0];
        frag.appendChild(span);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode?.replaceChild(frag, node);
    }
  } catch {} finally {
    _sharpWordPass = false;
  }
}

function scheduleSharpWordPass() {
  if (_sharpWordTimer) return;
  _sharpWordTimer = setTimeout(() => {
    _sharpWordTimer = null;
    const roots = [..._sharpWordQueue];
    _sharpWordQueue.clear();
    for (const root of roots) markSharpWordsIn(root);
  }, 180);
}

function syncSharpWordMasking(enabled) {
  if (enabled) {
    markSharpWordsIn(document.body);
    if (_sharpWordObserver) return;
    _sharpWordObserver = new MutationObserver((records) => {
      for (const rec of records) {
        if (rec.type === 'characterData') {
          const host = rec.target.parentElement;
          if (host && !host.closest('.sm-word')) _sharpWordQueue.add(host);
          continue;
        }
        for (const node of rec.addedNodes) {
          if (node.nodeType !== 1 && node.nodeType !== 3) continue;
          if (node.nodeType === 1 && node.classList?.contains('sm-word')) continue;
          if (node.parentElement?.closest('.sm-word')) continue;
          _sharpWordQueue.add(node);
        }
      }
      if (_sharpWordQueue.size) scheduleSharpWordPass();
    });
    _sharpWordObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  } else if (_sharpWordObserver) {
    _sharpWordObserver.disconnect();
    _sharpWordObserver = null;
    clearTimeout(_sharpWordTimer);
    _sharpWordTimer = null;
    _sharpWordQueue.clear();
  }
}

function setStreamerMode(value) {
  const on = Boolean(value);
  try { localStorage.setItem(STREAMER_MODE_STORAGE_KEY, on ? '1' : '0'); } catch {}
  const root = document.documentElement;
  root.classList.add('streamer-switching');
  root.classList.toggle('streamer-mode', on);
  applyStreamerCfg();
  void root.offsetWidth;
  setTimeout(() => root.classList.remove('streamer-switching'), 0);
  renderStreamerParts();
}

function renderStreamerParts() {
  const host = document.getElementById('streamerParts');
  const wrap = document.getElementById('streamerPanel');
  if (!host || !wrap) return;
  const on = getStreamerMode();
  wrap.hidden = !on;
  if (!on) return;
  const cfg = getStreamerCfg();

  if (!host.dataset.built) {
    host.dataset.built = '1';
    host.innerHTML = STREAMER_PARTS.map(p => `
      <label class="settings-subrow" for="smPart_${escAttr(p.key)}">
        <span class="settings-row-text">
          <span class="settings-row-name">${escHtml(p.name)}</span>
          <span class="settings-row-note">${escHtml(p.note)}</span>
        </span>
        <input type="checkbox" id="smPart_${escAttr(p.key)}" class="settings-switch" data-sm-part="${escAttr(p.key)}">
      </label>`).join('') + `
      <div class="settings-subrow settings-subrow-plain">
        <span class="settings-row-text">
          <span class="settings-row-name">Сила размытия</span>
          <span class="settings-row-note">Насколько сильно замыливать. Картинки всегда размываются вдвое слабее — иначе от кейса остаётся пятно.</span>
        </span>
        <span class="settings-lang" id="smBlurPresets">${STREAMER_BLUR_PRESETS.map(b => `
          <button type="button" class="settings-lang-btn" data-sm-blur="${escAttr(b.key)}">${escHtml(b.name)}</button>`).join('')}
        </span>
      </div>
      <label class="settings-subrow" for="smHover">
        <span class="settings-row-text">
          <span class="settings-row-name">Показывать под курсором</span>
          <span class="settings-row-note">Наводишь на размытое — оно плавно проявляется, пока курсор на нём. Себе видно, в записи нет: курсор в кадре один, и он у тебя.</span>
        </span>
        <input type="checkbox" id="smHover" class="settings-switch">
      </label>`;

    host.addEventListener('change', (e) => {
      const key = e.target?.dataset?.smPart;
      const next = getStreamerCfg();
      if (key) next[key] = e.target.checked;
      else if (e.target?.id === 'smHover') next.hover = e.target.checked;
      else return;
      saveStreamerCfg(next);
      applyStreamerCfg();
    });
    host.addEventListener('click', (e) => {
      const blur = e.target?.dataset?.smBlur;
      if (!blur) return;
      const next = getStreamerCfg();
      next.blur = blur;
      saveStreamerCfg(next);
      applyStreamerCfg();
      renderStreamerParts();
    });
  }

  for (const p of STREAMER_PARTS) {
    const el = document.getElementById(`smPart_${p.key}`);
    if (el) el.checked = cfg[p.key] !== false;
  }
  const hover = document.getElementById('smHover');
  if (hover) hover.checked = cfg.hover !== false;
  for (const btn of host.querySelectorAll('[data-sm-blur]')) {
    btn.classList.toggle('is-active', btn.dataset.smBlur === cfg.blur);
  }
}

function setSettingsPanel(open) {
  const panel = document.getElementById('settingsPanel');
  const scrim = document.getElementById('settingsScrim');
  const btn = document.getElementById('settingsBtn');
  if (!panel) return;

  if (open) renderSettingsLanguages();
  panel.classList.toggle('is-open', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  btn?.classList.toggle('is-open', open);
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');

  if (!scrim) return;
  clearTimeout(scrim._hideTimer);
  if (open) {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('is-open'));
  } else {
    scrim.classList.remove('is-open');
    scrim._hideTimer = setTimeout(() => { scrim.hidden = true; }, 300);
  }
}

function closeSettingsPanel() { setSettingsPanel(false); }

function renderSettingsLanguages() {
  const row = document.getElementById('settingsLangRow');
  const box = document.getElementById('settingsLangChoices');
  if (!row || !box) return;
  const langs = Array.isArray(state.languages) ? state.languages : [];
  if (langs.length < 2) { row.classList.add('hidden'); return; }
  row.classList.remove('hidden');
  const cur = getCurrentLanguage();
  box.innerHTML = langs.map(l => `<button type="button" class="settings-lang-btn${l.code === cur ? ' is-active' : ''}" data-lang="${escAttr(l.code)}">${escHtml(l.flag || '')} ${escHtml(l.name || l.code)}</button>`).join('');
  box.querySelectorAll('[data-lang]').forEach(el => {
    bindSafe(el, 'click', () => { setCurrentLanguage(el.dataset.lang); renderSettingsLanguages(); });
  });
}

function initSettingsPanel() {
  applyStreamerCfg();
  const streamerToggle = document.getElementById('streamerModeToggle');
  const fastToggle = document.getElementById('fastSpinToggle');
  const soundToggle = document.getElementById('soundToggle');

  if (streamerToggle) {
    streamerToggle.checked = getStreamerMode();
    renderStreamerParts();
    bindSafe(streamerToggle, 'change', () => {
      setStreamerMode(streamerToggle.checked);
      showToast(streamerToggle.checked ? 'Режим стримера включён' : 'Режим стримера выключен');
    });
  }
  if (soundToggle) {
    soundToggle.checked = isSoundOn();
    bindSafe(soundToggle, 'change', () => {
      setSoundOff(!soundToggle.checked);
      showToast(soundToggle.checked ? 'Звук включён' : 'Звук выключен');
    });
  }
  if (fastToggle) {
    fastToggle.checked = typeof getFastSpinEnabled === 'function' && getFastSpinEnabled();
    bindSafe(fastToggle, 'change', () => {
      setFastSpinEnabled(fastToggle.checked);
      if (typeof _upgRenderFastSpinBtn === 'function') _upgRenderFastSpinBtn();
      if (typeof _diceRenderFastSpinBtn === 'function') _diceRenderFastSpinBtn();
      if (typeof updateSpeedToggle === 'function') updateSpeedToggle();
    });
  }

  bindSafe(document.getElementById('settingsBtn'), 'click', () => {
    const open = !document.getElementById('settingsPanel')?.classList.contains('is-open');
    if (open && typeof closeNavDrawer === 'function') closeNavDrawer();
    if (open && streamerToggle) { streamerToggle.checked = getStreamerMode(); renderStreamerParts(); }
    if (open && soundToggle) soundToggle.checked = isSoundOn();
    if (open && fastToggle && typeof getFastSpinEnabled === 'function') fastToggle.checked = getFastSpinEnabled();
    setSettingsPanel(open);
  });
  bindSafe(document.getElementById('settingsCloseBtn'), 'click', closeSettingsPanel);
  bindSafe(document.getElementById('settingsScrim'), 'click', closeSettingsPanel);
  bindSafe(document, 'keydown', (e) => { if (e.key === 'Escape') closeSettingsPanel(); });

  renderSettingsLanguages();
}

const THEME_STORAGE_KEY = 'brainrot-theme';
const THEME_DARK = 'theme-dark-blue';
const THEME_LIGHT = 'theme-light-red';

function getStoredTheme() {
  try { return localStorage.getItem(THEME_STORAGE_KEY); } catch { return null; }
}
function setStoredTheme(value) {
  try { localStorage.setItem(THEME_STORAGE_KEY, value); } catch {}
}
function resolveTheme() {
  const stored = getStoredTheme();
  if (stored === THEME_DARK || stored === THEME_LIGHT) return stored;
  return THEME_DARK;
}
function getThemeToggleIcon(theme) {
  const color = encodeURIComponent(theme === THEME_LIGHT ? '#58A6FF' : '#eef6ff');
  return theme === THEME_LIGHT
    ? `/icon/solar/sun-2-bold.svg?color=${color}`
    : `/icon/solar/moon-stars-bold.svg?color=${color}`;
}
function applyTheme(theme, withAnimation = false) {
  const nextTheme = theme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
  const currentIcon = document.getElementById('themeToggleIconCurrent');
  const nextIcon = document.getElementById('themeToggleIconNext');
  const toggle = document.getElementById('themeToggle');
  if (withAnimation && currentIcon && nextIcon && toggle) {
    nextIcon.src = getThemeToggleIcon(nextTheme);
    toggle.classList.remove('is-animating');
    void toggle.offsetWidth;
    toggle.classList.add('is-animating');
  }
  document.body.classList.remove(THEME_DARK, THEME_LIGHT);
  document.body.classList.add(nextTheme);
  refreshTokenIconsForTheme();
  if (withAnimation) {
    document.body.classList.add('theme-switching');
    clearTimeout(applyTheme._timer);
    applyTheme._timer = setTimeout(() => {
      document.body.classList.remove('theme-switching');
      const c = document.getElementById('themeToggleIconCurrent');
      const n = document.getElementById('themeToggleIconNext');
      const t = document.getElementById('themeToggle');
      if (c) c.src = getThemeToggleIcon(nextTheme);
      if (n) n.src = getThemeToggleIcon(nextTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
      if (t) {
        t.classList.remove('is-animating');
        t.dataset.theme = nextTheme;
      }
    }, 560);
  } else {
    if (currentIcon) currentIcon.src = getThemeToggleIcon(nextTheme);
    if (nextIcon) nextIcon.src = getThemeToggleIcon(nextTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
    if (toggle) toggle.dataset.theme = nextTheme;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', nextTheme === THEME_LIGHT ? '#f4f6fb' : '#08111b');
  if (tg) {
    try {
      tg.setHeaderColor(nextTheme === THEME_LIGHT ? '#f4f6fb' : '#0d1726');
      tg.setBackgroundColor(nextTheme === THEME_LIGHT ? '#eef2f7' : '#08111b');
    } catch {}
  }
  return nextTheme;
}
const PALETTES = ['red', 'blue', 'grey'];
function applyPalette(palette) {
  const p = PALETTES.includes(palette) ? palette : 'blue';
  PALETTES.forEach(x => document.body.classList.remove('palette-' + x));
  if (p !== 'red') document.body.classList.add('palette-' + p);
  document.querySelectorAll('.palette-swatch-btn').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.palette === p);
  });
  state.palette = p;
}

function initOpsPalette() {}

function initThemeToggle() {
  applyTheme(resolveTheme(), false);
  const toggle = document.getElementById('themeToggle');
  if (!toggle || toggle.dataset.boundTheme === '1') return;
  toggle.dataset.boundTheme = '1';
  bindSafe(toggle, 'click', () => {
    const current = document.body.classList.contains(THEME_LIGHT) ? THEME_LIGHT : THEME_DARK;
    const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setStoredTheme(next);
    applyTheme(next, true);
  });
}

const FALLBACK_VISIBLE_CASES = [];

function stripPickCases(cases = []) {
  return (Array.isArray(cases) ? cases : []).filter(c => c && c.mode !== 'pick' && !String(c.id || '').startsWith('pick-'));
}

const LEGACY_SOURCE_LABELS = new Set(['обменник', 'батл', 'промокод', 'фьюз', 'дайсы', 'апгрейдер', 'лесенка', 'краш']);
function safeSourceText(raw) {
  const t = String(raw || '').trim();
  if (!t) return '';
  return /^[А-Яа-яЁёA-Za-z0-9 .-]{1,28}$/.test(t) && !/[_:]/.test(t) && !/d{6,}/.test(t) ? t : 'Получено';
}

function formatEntrySource(entry) {
  const raw = String(entry?.source || '').trim();
  if (!raw) return 'Получено';
  const lower = raw.toLowerCase();
  if (LEGACY_SOURCE_LABELS.has(lower)) return raw;
  if (lower === 'withdrawal_return') return 'Возврат с вывода';
  if (lower === 'battle' || lower.includes('кейсбатл') || lower.includes('battle')) return 'Батл';
  if (lower.includes('лесен')) return 'Лесенка';
  if (lower === 'upgrader') return getCurrentLanguage() === 'en' ? 'Upgrader' : 'Апгрейдер';
  if (lower === 'upgrade') return 'Улучшение';
  if (lower === 'dice') return 'Дайсы';
  if (lower === 'fuse_fail') return 'Фьюз: утешительный';
  if (lower.includes('fuse')) return 'Фьюз';
  if (lower === 'краш' || lower === 'crash') return 'Краш';
  if (lower === 'staking-success-case') return 'Кейс за стейкинг';
  if (lower.startsWith('staking-reward:')) return 'Награда за стейкинг';
  if (lower.startsWith('quest:')) return 'Квест';
  if (lower.startsWith('honeypass:')) return 'Медовый пропуск';
  if (lower === 'raffle') return 'Розыгрыш';
  if (lower === 'deposit_contest') return 'Розыгрыш';
  if (lower === 'staff_give') return 'Выдано администрацией';
  if (lower.startsWith('case-voucher:')) return 'Выдано администрацией';
  if (lower.startsWith('promo:')) return `Промокод: ${raw.slice('promo:'.length)}`;
  if (lower === 'promo') return 'Промокод';
  if (lower.startsWith('free-case:')) {
    const caseId = raw.slice('free-case:'.length);
    const c = state.cases.find(x => x.id === caseId);
    const label = getCurrentLanguage() === 'en' ? 'Free' : 'Бесплатно';
    return c ? `${label}: ${c.name}` : label;
  }
  if (lower.startsWith('referral-case:')) {
    const caseId = raw.slice('referral-case:'.length);
    const c = state.cases.find(x => x.id === caseId);
    return c ? `Реферальный кейс: ${c.name}` : 'Реферальный кейс';
  }
  if (lower.startsWith('pick:')) {
    const caseId = raw.slice('pick:'.length);
    const c = state.cases.find(x => x.id === caseId);
    return c ? `Кейс: ${c.name}` : 'Кейс: Открытие';
  }
  if (lower.startsWith('exchange:')) {
    const origId = raw.slice('exchange:'.length);
    const origItem = (state.brainrotMap || new Map()).get(origId) || (state.brainrots || []).find(b => b.id === origId);
    return origItem ? `Обмен: ${origItem.name}` : 'Обмен';
  }
  if (lower === 'exchange_buy') return 'Магазин обменов';
  if (lower === 'exchange_sell') return 'Продано в обменник';
  if (lower === 'exchange_trade') return 'Обмен';
  const byId = state.cases.find(c => c.id === raw || raw === `case:${c.id}` || raw === `case_${c.id}`);
  if (byId) return `Кейс: ${byId.name}`;
  if (lower.startsWith('case')) {
    const cleaned = raw.replace(/^case[:_ -]*/i, '').trim();
    const found = state.cases.find(c => {
      const name = String(c.name || '').trim().toLowerCase();
      const id = String(c.id || '').trim().toLowerCase();
      return cleaned.toLowerCase() === name || cleaned.toLowerCase() === id;
    });
    return found ? `Кейс: ${found.name}` : 'Кейс: Открытие';
  }
  const exact = state.cases.find(c => lower === String(c.name || '').trim().toLowerCase());
  if (exact) return `Кейс: ${exact.name}`;
  if (/^[А-Яа-яЁёA-Za-z ]{2,24}$/.test(raw)) return raw;
  return 'Получено';
}

const refs = new Proxy({}, {
  get(target, prop) {
    if (typeof prop !== 'string') return target[prop];
    if (prop === 'ladderVariantTabs') return [...document.querySelectorAll('[data-ladder-variant]')];
    if (prop === 'opsLadderTabs') return [...document.querySelectorAll('[data-ops-ladder-mode]')];
    const existing = target[prop];
    if (existing && typeof Node !== 'undefined' && existing instanceof Node && document.contains(existing)) return existing;
    const el = document.getElementById(prop);
    target[prop] = el || null;
    return target[prop];
  },
  set(target, prop, value) { target[prop] = value; return true; }
});
window.refs  = refs;

function getTelegramProfile() {
  try { tg?.ready?.(); } catch {}
  const user = tg?.initDataUnsafe?.user;
  if (user?.id) {
    const profile = {
      userId: `tg_${user.id}`,
      username: user?.username ? `@${user.username}` : '',
      firstName: user?.first_name || '',
      displayName: user?.first_name || user?.username || `tg_${user.id}`,
      avatarUrl: user?.photo_url || ''
    };
    try { localStorage.setItem('brainrot_last_tg_profile', JSON.stringify(profile)); } catch {}
    return profile;
  }
  if (state.authUser?.gameUserId) {
    return {
      userId: state.authUser.gameUserId,
      username: `@${state.authUser.login}`,
      firstName: state.authUser.login,
      displayName: state.authUser.login,
      avatarUrl: ''
    };
  }
  if (state.user?.id && state.user.id !== 'guest-user') {
    return {
      userId: state.user.id,
      username: state.user.username || state.user.displayName || '@player',
      firstName: state.user.firstName || state.user.displayName || 'Player',
      displayName: state.user.displayName || state.user.firstName || state.user.username || 'Player',
      avatarUrl: state.user.avatarUrl || ''
    };
  }
  try {
    const cached = JSON.parse(localStorage.getItem('brainrot_last_tg_profile') || 'null');
    if (cached?.userId && cached.userId !== 'guest-user') return cached;
  } catch {}
  return { userId: 'guest-user', username: '@guest', firstName: 'Guest', displayName: 'Guest', avatarUrl: '' };
}
const PAYMENT_LINKS = {
  freekassa: '#set-freekassa-link',
  payeer: '#set-payeer-link',
  enot: '#set-enot-link',
  liqpay: '#set-liqpay-link',
  mono: '#set-mono-link',
  crypto_bot: '#set-crypto-bot-link',
  nowpayments: '#set-nowpayments-link',
  telegram_stars: '#set-telegram-stars-link',
  payeer_usd: '#set-payeer-usd-link',
  card_usd: '#set-card-usd-link'
};

const PAYMENT_RATES_RUB = {
  rub: 1,
  uah: 1.5,
  tgstars: 1.35,
  usd: 70,
  crypto: 70
};

function getDepositAmountValue() {
  const inputAmount = Number(document.getElementById('depositInput').value || 0);
  const inputPromo = String(document.getElementById('depositPromoMirror').value || '').trim().toUpperCase();
  const promo = (inputPromo && state.promo && String(state.promo.code || '').toUpperCase() === inputPromo) ? state.promo : null;
  const bonusPercent = Number(promo?.bonus || 0);
  const amount = inputAmount * (1 + Math.max(0, bonusPercent) / 100);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatPaymentCurrencyAmount(currency, amountRub) {
  if (!amountRub) return '—';
  switch (currency) {
    case 'rub':
      return `${Math.round(amountRub)}  TOK`;
    case 'uah':
      return `${(amountRub / PAYMENT_RATES_RUB.uah).toFixed(2)} ₴`;
    case 'tgstars':
      return `${Math.ceil(amountRub / PAYMENT_RATES_RUB.tgstars)} XTR`;
    case 'usd':
      return `${(amountRub / PAYMENT_RATES_RUB.usd).toFixed(2)} $`;
    case 'crypto':
      return `${(amountRub / PAYMENT_RATES_RUB.crypto).toFixed(2)} USDT`;
    default:
      return `${Math.round(amountRub)}  TOK`;
  }
}
function updatePaymentAmountSummary(currency = 'rub') {
  const mount = document.getElementById('paymentAmountSummary');
  if (!mount) return;
  const amountRub = getDepositAmountValue();
  if (!amountRub) {
    mount.textContent = 'Введи сумму депозита в токенах, чтобы увидеть эквивалент для выбранной валюты.';
    return;
  }
  const converted = formatPaymentCurrencyAmount(currency, amountRub);
  if (mount) mount.innerHTML = `<strong>${Math.round(amountRub)} TOK</strong><span>${getCurrentLanguage() === 'en' ? 'To pay in selected currency: ' : 'К оплате в выбранной валюте: '}<b>${converted}</b></span>`;
}

function getCurrentUserLogMeta() {
  return {
    id: state.user?.id || state.userId || 'unknown',
    username: state.user?.username || state.authUser?.login || 'unknown'
  };
}
function logUserAction(action, extra = {}) {
  if (window.__LOW_CPU_LOGS__ !== true) return;
  try { console.log('[brainrot-action]', { action, ...extra }); } catch {}
}

function normalizeHistoryTime(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  const short = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (short) {
    const d = new Date();
    d.setHours(Number(short[1]), Number(short[2]), 0, 0);
    return d.getTime();
  }
  return 0;
}
function safeTimeText(value) {
  const ts = normalizeHistoryTime(value);
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
  if (sameDay) return time;

  return d.toLocaleDateString('ru-RU', {
    day:'2-digit',
    month:'2-digit',
    year:'2-digit'
  }) + ' ' + time;
}
function renderCombinedHistory() {
  const mount = document.getElementById('combinedHistoryList');
  if (!mount) return;

  const deposits = Array.isArray(state.depositHistory) ? state.depositHistory : [];
  const petDeposits = Array.isArray(state.petDepositHistory) ? state.petDepositHistory : [];
  const actions = Array.isArray(state.user?.activity) ? state.user.activity : [];
  const battles = Array.isArray(state.battleHistory) ? state.battleHistory : [];
  const rows = [];

  deposits.forEach(d => {
    const time = d.paidAt || d.createdAt || d.time || '';
    rows.push({
      type:'deposit',
      timestamp: normalizeHistoryTime(time),
      time,
      title:`Депозит${Number(d.creditedAmount ?? d.amountRub) ? ` · ${Math.round(Number(d.creditedAmount ?? d.amountRub) || 0)} TOK` : ''}`,
      text:`${d.method || 'payment'} · ${d.status || 'pending'}${d.amountStars ? ` · ${d.amountStars}★` : ''}${d.amountCrypto ? ` · ${d.amountCrypto} ${d.currency || ''}`.trimEnd() : ''}${d.promoCode ? ` · промокод ${d.promoCode} (+${d.promoBonus}%)` : ''}`
    });
  });

  petDeposits.forEach(p => {
    const time = p.processedAt || p.createdAt || '';
    const statusLabel = p.status === 'approved' ? 'зачислен' : p.status === 'rejected' ? 'отклонён' : 'ожидает';
    rows.push({
      type:'pet_deposit',
      timestamp: normalizeHistoryTime(time),
      time,
      title:`Депозит брейнротом${p.status === 'approved' && p.creditedValue ? ` · ${Math.round(Number(p.creditedValue) || 0)} TOK` : ''}`,
      text:`${p.itemsSummary || '?'} · ${statusLabel}${p.reasonText ? ` (${p.reasonText})` : ''}${p.promoCode ? ` · промокод ${p.promoCode} (+${p.promoBonus}%)` : ''}${p.traits?.length ? ` · баффы: ${p.traits.join(', ')} (${p.traitsPct > 0 ? '+' : ''}${String(p.traitsPct).replace('.', ',')}%)` : ''}`
    });
  });

  actions.forEach(a => {
    const time = a.createdAt || a.time || '';
    rows.push({
      type:'item',
      timestamp: normalizeHistoryTime(time),
      time,
      title:'Действие',
      text:a.text || String(a.message || '')
    });
  });

  battles.forEach(b => {
    const time = b.finishedAt || b.updatedAt || b.createdAt || '';
    rows.push({
      type:'battle',
      timestamp: normalizeHistoryTime(time),
      time,
      title:`Батл${b.caseName ? ` · ${b.caseName}` : ''}`,
      text:b.winner?.username ? `Победитель: ${b.winner.username}` : (b.status || 'history')
    });
  });

  rows.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

  if (!rows.length) {
    mount.innerHTML = '<div class="empty-history">История пока пустая.</div>';
    return;
  }

  mount.innerHTML = rows.slice(0, 60).map(row => `
    <div class="combined-history-row combined-history-${row.type}">
      <div class="combined-history-icon">${row.type === 'deposit' ? '💳' : row.type === 'pet_deposit' ? '🐾' : row.type === 'battle' ? '⚔️' : '🎁'}</div>
      <div>
        <strong>${escHtml(row.title)}</strong>
        <span>${escHtml(row.text || '')}</span>
      </div>
      <small>${safeTimeText(row.time)}</small>
    </div>
  `).join('');
}

function renderPaymentHistory(deposits = []) {
  state.depositHistory = Array.isArray(deposits) ? deposits : [];
  if (refs.paymentHistoryList) if (refs.paymentHistoryList) refs.paymentHistoryList.innerHTML = '';
  renderCombinedHistory();
}
function formatDepositStatus(status) {
  const isEn = getCurrentLanguage() === 'en';
  const map = isEn
    ? { pending:'Pending', paid:'Paid', failed:'Error', expired:'Expired', cancelled:'Cancelled' }
    : { pending:'Ожидает', paid:'Оплачен', failed:'Ошибка', expired:'Истёк', cancelled:'Отменён' };
  return map[status] || status || '—';
}
async function loadPaymentHistory() {
  try {
    const data = await api('/api/payments/history');
    state.depositHistory = Array.isArray(data.deposits) ? data.deposits : [];
    state.petDepositHistory = Array.isArray(data.petDeposits) ? data.petDeposits : [];
  } catch (err) {
    state.depositHistory = [];
    state.petDepositHistory = [];
  }
  renderCombinedHistory();
}
async function createManualDeposit(method, currency) {
  const amountRub = getDepositAmountValue();
  if (!amountRub) {
    showToast('Сначала введи сумму депозита');
    return;
  }
  const converted = formatPaymentCurrencyAmount(currency, amountRub);
  const data = await api('/api/payments/manual/create', {
    method:'POST',
    body: JSON.stringify({ amountRub, method, currency, payAmount: converted })
  });
  state.user = data.user || state.user;
  renderAllUserData();
  if (!state.closedFeatures.battle || state._perm) loadSection('battle').then(() => loadBattleHistorySafe()).catch(() => {});
  loadPaymentHistory();
  const hint = document.getElementById('paymentMethodHint');
  if (hint) hint.textContent = getCurrentLanguage() === 'en'
    ? `Request ${data.deposit.id} created. Pay via ${method}, then wait for confirmation.`
    : `Заявка ${data.deposit.id} создана. Оплати через ${method}, затем жди подтверждения.`;
  showToast('Заявка на депозит создана');
}

let _depositPromoCheckTimer = null;
let _depositPromoCheckToken = 0;
let _depositPromoCheckCache = { code: null, result: null };

function resolveDepositPromoBonus(code) {
  if (!code) return 0;
  if (state.promo && String(state.promo.code || '').toUpperCase() === code) {
    return Math.max(0, Number(state.promo.bonus || 0));
  }
  if (_depositPromoCheckCache.code === code && _depositPromoCheckCache.result?.valid) {
    return Math.max(0, Number(_depositPromoCheckCache.result.bonus || 0));
  }
  return 0;
}

function checkDepositPromoCodeLive(code, onResult) {
  if (_depositPromoCheckCache.code === code) {
    onResult(_depositPromoCheckCache.result);
    return;
  }
  clearTimeout(_depositPromoCheckTimer);
  const myToken = ++_depositPromoCheckToken;
  _depositPromoCheckTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/deposit-promo-check?code=${encodeURIComponent(code)}`);
      if (myToken !== _depositPromoCheckToken) return;
      const result = { valid: Boolean(data.valid), bonus: Number(data.bonus || 0), isSelf: Boolean(data.isSelf) };
      _depositPromoCheckCache = { code, result };
      onResult(result);
    } catch {
      if (myToken !== _depositPromoCheckToken) return;
      onResult(null);
    }
  }, 400);
}

let _cryptoDepositPollTimer = null;
let _cryptoProvider = 'cryptobot';

function cryptoProviders() {
  return {
    cryptobot: { cfg: state.cryptoBot || {}, путь: '/api/payments/crypto', монеты: (state.cryptoBot || {}).assets },
    plisio: { cfg: state.plisio || {}, путь: '/api/payments/plisio', монеты: (state.plisio || {}).coins },
  };
}
function cryptoActive() {
  const все = cryptoProviders();
  if (!все[_cryptoProvider]?.cfg?.enabled) {
    _cryptoProvider = все.cryptobot.cfg.enabled ? 'cryptobot' : (все.plisio.cfg.enabled ? 'plisio' : _cryptoProvider);
  }
  return все[_cryptoProvider] || все.cryptobot;
}
function cryptoCfg() { return cryptoActive().cfg || {}; }

let _plisioCoins = null;
let _plisioPayTimer = null;
async function loadPlisioCoins() {
  if (_plisioCoins) return _plisioCoins;
  try {
    const r = await api('/api/payments/plisio/coins');
    _plisioCoins = Array.isArray(r.coins) ? r.coins : [];
  } catch (e) {
    _plisioCoins = [];
  }
  return _plisioCoins;
}

function renderPlisioCoins() {
  const блок = document.getElementById('plisioCoinPick');
  const список = document.getElementById('plisioCoinList');
  const hint = document.getElementById('plisioCoinHint');
  if (!блок || !список) return;
  const наОплате = !document.getElementById('plisioPay')?.classList.contains('hidden');
  const показывать = _cryptoProvider === 'plisio' && !!cryptoCfg().enabled && !наОплате;
  блок.classList.toggle('hidden', !показывать);
  if (!показывать) return;
  const tok = cryptoDepositTokens();
  const монеты = _plisioCoins || [];
  if (!монеты.length) {
    список.innerHTML = '';
    if (hint) hint.textContent = 'Список монет не загрузился — обнови страницу.';
    return;
  }
  список.innerHTML = монеты.map(c => {
    const мало = tok > 0 && tok < c.minTokens;
    const сеть = c.network || c.name || '';
    return `<button type="button" class="plisio-coin" data-plisio-coin="${c.cid}"${(мало || !tok) ? ' disabled' : ''}>`
      + `<img class="plisio-coin-icon" src="/coin-icon/${c.cid}.svg" alt="" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">`
      + `<span class="plisio-coin-name">${c.ticker || c.currency}</span>`
      + `<span class="plisio-coin-net">${сеть}</span>`
      + `<span class="plisio-coin-min">от ${fmt(c.minTokens)} TOK</span>`
      + (c.feePct > 1 ? `<span class="plisio-coin-fee">комиссия ${c.feePct}%</span>` : '')
      + '</button>';
  }).join('');
  if (hint) {
    hint.textContent = !tok
      ? 'Сначала укажи сумму выше.'
      : (монеты.every(c => tok < c.minTokens)
        ? `Для этой суммы монет нет — минимальная ${fmt(Math.min(...монеты.map(c => c.minTokens)))} TOK.`
        : 'Выбери монету — дальше покажем адрес и сумму.');
  }
}

function showPlisioPay(data) {
  const форма = document.querySelector('#depositCryptoPanel .deposit-stars-form');
  const выбор = document.getElementById('plisioCoinPick');
  const экран = document.getElementById('plisioPay');
  if (!экран) return;
  форма?.classList.add('hidden');
  выбор?.classList.add('hidden');
  document.getElementById('depositCryptoSub')?.classList.add('hidden');
  document.getElementById('cryptoProviderTabs')?.classList.add('hidden');
  экран.classList.remove('hidden');
  const qr = document.getElementById('plisioPayQr');
  if (qr) {
    qr.src = data.qr || '';
    qr.classList.toggle('hidden', !data.qr);
  }
  const монета = (_plisioCoins || []).find(c => c.cid === data.coin);
  const сумма = document.getElementById('plisioPayAmount');
  if (сумма) сумма.textContent = `${data.coinAmount || ''} ${монета?.ticker || data.coin || ''}`.trim();
  const иконка = document.getElementById('plisioPayIcon');
  if (иконка) {
    иконка.src = data.coin ? `/coin-icon/${data.coin}.svg` : '';
    иконка.onerror = () => { иконка.style.visibility = 'hidden'; };
    иконка.style.visibility = data.coin ? 'visible' : 'hidden';
  }
  const имя = document.getElementById('plisioPayCoinName');
  if (имя) имя.textContent = монета?.ticker || data.coin || '';
  const сеть = document.getElementById('plisioPayNet');
  if (сеть) сеть.textContent = монета?.network ? `сеть ${монета.network}` : '';
  const адрес = document.getElementById('plisioPayAddress');
  if (адрес) адрес.textContent = data.wallet || '';
  const note = document.getElementById('plisioPayNote');
  if (note) {
    note.textContent = `Отправь ровно эту сумму одним переводом. Начислим ${fmt(data.credited)} TOK`
      + (data.confirmations ? `, как только сеть даст ${data.confirmations} ${склонение(data.confirmations, 'подтверждение', 'подтверждения', 'подтверждений')}.` : '.');
  }
  _plisioSetState('Ждём перевод', '');
  _plisioStartTimer(data.expiresAt);
}

function склонение(n, один, два, много) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return много;
  if (b > 1 && b < 5) return два;
  if (b === 1) return один;
  return много;
}

function _plisioSetState(текст, вид) {
  const блок = document.getElementById('plisioPayState');
  const узел = document.getElementById('plisioPayStateText');
  if (узел) узел.textContent = текст;
  if (блок) блок.className = `plisio-pay-state${вид ? ' ' + вид : ''}`;
}

function _plisioStartTimer(expiresAt) {
  if (_plisioPayTimer) clearInterval(_plisioPayTimer);
  const el = document.getElementById('plisioPayTimer');
  const до = Date.parse(expiresAt || 0);
  if (!el || !до) { if (el) el.textContent = ''; return; }
  const тик = () => {
    const сек = Math.max(0, Math.round((до - Date.now()) / 1000));
    el.textContent = `${String(Math.floor(сек / 60)).padStart(2, '0')}:${String(сек % 60).padStart(2, '0')}`;
    el.classList.toggle('is-soon', сек > 0 && сек < 300);
    if (сек <= 0) {
      clearInterval(_plisioPayTimer);
      _plisioPayTimer = null;
      _plisioSetState('Время счёта вышло — выстави новый', 'is-dead');
    }
  };
  тик();
  _plisioPayTimer = setInterval(тик, 1000);
}

function hidePlisioPay() {
  if (_plisioPayTimer) { clearInterval(_plisioPayTimer); _plisioPayTimer = null; }
  document.getElementById('plisioPay')?.classList.add('hidden');
  document.getElementById('depositCryptoSub')?.classList.remove('hidden');
  document.querySelector('#depositCryptoPanel .deposit-stars-form')?.classList.remove('hidden');
  renderCryptoDepositForm();
}

function cryptoDepositTokens() {
  const tok = Number(document.getElementById('cryptoDepositAmount')?.value || 0);
  return Number.isFinite(tok) && tok > 0 ? tok : 0;
}

function cryptoDepositFiatAmount() {
  const cfg = cryptoCfg();
  const курс = Number(cfg.tokPerFiat || 0);
  const tok = cryptoDepositTokens();
  if (!tok || !курс) return 0;
  return Number((tok / курс).toFixed(2));
}

function cryptoDepositCredited() {
  const cfg = cryptoCfg();
  const счёт = cryptoDepositFiatAmount();
  if (!счёт) return 0;
  const code = String(document.getElementById('cryptoDepositPromo')?.value || '').trim().toUpperCase();
  const bonus = resolveDepositPromoBonus(code);
  return Math.round(счёт * Number(cfg.tokPerFiat || 0) * (1 + bonus / 100));
}

let _nftState = null;
async function renderNftDepositPanel() {
  const tab = document.getElementById('depositNftTab');
  try {
    const data = await api('/api/nft-deposit/state');
    _nftState = data && data.enabled ? data : null;
  } catch (e) { _nftState = null; }
  if (tab) tab.classList.toggle('hidden', !_nftState);
  if (!_nftState) return;
  const получатель = '@' + String(_nftState.receiver || '').replace(/^@/, '');
  const знач = document.getElementById('nftReceiverValue');
  if (знач) знач.textContent = получатель;
  const рынок = Boolean(_nftState.market);
  document.getElementById('nftFixedPrices')?.classList.toggle('hidden', рынок);
  document.getElementById('nftMarketPrices')?.classList.toggle('hidden', !рынок);
  const об = document.getElementById('nftPriceNormal');
  const чёр = document.getElementById('nftPriceBlack');
  if (об) об.textContent = fmt(_nftState.priceNormal) + ' TOK';
  if (чёр) чёр.textContent = fmt(_nftState.priceBlack) + ' TOK';
  const курс = document.getElementById('nftRateValue');
  if (курс) курс.textContent = '1 TON = ' + fmt(_nftState.tokensPerTon) + ' TOK';
  const комиссия = document.getElementById('nftFeeValue');
  if (комиссия) комиссия.textContent = fmt(_nftState.feePercent) + '%';
  const фоны = document.getElementById('nftBlackList');
  const названия = (_nftState.blackBackdrops || []).map(ф => String(ф).replace(/\b\w/g, б => б.toUpperCase()));
  if (фоны && названия.length) фоны.textContent = названия.length > 1
    ? названия.slice(0, -1).join(', ') + ' и ' + названия[названия.length - 1]
    : названия[0];
  const row = document.getElementById('nftReceiverRow');
  if (row && !row.dataset.bound) {
    row.dataset.bound = '1';
    row.addEventListener('click', () => {
      const копия = document.getElementById('nftReceiverCopy');
      try {
        navigator.clipboard.writeText(получатель);
        if (копия) { копия.textContent = 'скопировано'; setTimeout(() => { копия.textContent = 'копировать'; }, 1500); }
      } catch (e) {}
    });
  }
}

function renderCryptoDepositForm() {
  const все = cryptoProviders();
  const естьХотьОдин = Boolean(все.cryptobot.cfg.enabled || все.plisio.cfg.enabled);
  const tab = document.getElementById('depositCryptoTab');
  if (tab) tab.classList.toggle('hidden', !естьХотьОдин);
  if (!естьХотьОдин) return;
  const активный = cryptoActive();
  const cfg = активный.cfg;
  const ряд = document.getElementById('cryptoProviderTabs');
  if (ряд) {
    ряд.classList.toggle('hidden', !(все.cryptobot.cfg.enabled && все.plisio.cfg.enabled));
    ряд.querySelectorAll('[data-crypto-provider]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.cryptoProvider === _cryptoProvider);
    });
  }
  const assetEl = document.getElementById('cryptoDepositAsset');
  if (assetEl) assetEl.textContent = 'TOK';
  const input = document.getElementById('cryptoDepositAmount');
  if (input) { input.min = String(cryptoDepositMinTokens()); input.max = String(cryptoDepositMaxTokens()); }
  const sub = document.getElementById('depositCryptoSub');
  if (sub) {
    const список = Array.isArray(активный.монеты) && активный.монеты.length ? активный.монеты : ['USDT', 'TON', 'BTC'];
    const видно = [...new Set(список.map(c => String(c).split('_')[0]))];
    const монеты = видно.length > 4 ? `${видно.slice(0, 3).join(', ')} и ещё ${видно.length - 3}` : видно.join(', ');
    sub.textContent = _cryptoProvider === 'plisio'
      ? `Сколько TOK укажешь — столько и придёт. Монету выберешь ниже, адрес покажем здесь же.`
      : `Любой монетой в @CryptoBot: ${монеты}. Сколько TOK укажешь — столько и придёт.`;
  }
  updateCryptoDepositUi();
  if (_cryptoProvider === 'plisio' && !_plisioCoins) loadPlisioCoins().then(renderPlisioCoins);
}

function cryptoDepositMinTokens() {
  const cfg = cryptoCfg();
  return Math.ceil(Number(cfg.minAmount || 0) * Number(cfg.tokPerFiat || 0));
}
function cryptoDepositMaxTokens() {
  const cfg = cryptoCfg();
  return Math.floor(Number(cfg.maxAmount || 0) * Number(cfg.tokPerFiat || 0));
}

function updateCryptoDepositUi() {
  const cfg = cryptoCfg();
  const tok = cryptoDepositTokens();
  const conv = document.getElementById('cryptoConversion');
  const convVal = document.getElementById('cryptoConversionValue');
  const btn = document.getElementById('cryptoDepositPayBtn');
  const hint = document.getElementById('cryptoDepositPayHint');
  const credited = cryptoDepositCredited();
  if (conv) conv.classList.toggle('hidden', !credited || credited === tok);
  if (convVal) convVal.textContent = fmt(credited);
  const мин = cryptoDepositMinTokens();
  const макс = cryptoDepositMaxTokens();
  const мало = tok > 0 && tok < мин;
  const много = tok > макс;
  const своиПлитки = _cryptoProvider === 'plisio';
  if (btn) btn.classList.toggle('hidden', своиПлитки);
  if (btn) btn.disabled = !credited || мало || много;
  if (своиПлитки) renderPlisioCoins();
  if (hint) {
    const счёт = cryptoDepositFiatAmount();
    const вЧём = (счёт && Number(cfg.tokPerFiat) !== 1) ? ` Счёт будет на ${fmt(счёт)} ${cfg.fiat}.` : '';
    hint.textContent = !tok ? 'Введи сумму в TOK выше.'
      : мало ? `Минимум ${fmt(мин)} TOK.`
        : много ? `Максимум ${fmt(макс)} TOK.`
          : своиПлитки ? ''
            : `Счёт откроется в @CryptoBot — выбери монету и оплати.${вЧём}`;
  }
}

async function createCryptoDeposit(монета) {
  const btn = document.getElementById('cryptoDepositPayBtn');
  const statusEl = document.getElementById('cryptoDepositStatus');
  const amount = cryptoDepositFiatAmount();
  const promoCode = String(document.getElementById('cryptoDepositPromo')?.value || '').trim().toUpperCase();
  if (btn) btn.disabled = true;
  const провайдер = cryptoActive();
  try {
    const data = await api(`${провайдер.путь}/create`, { method: 'POST', body: JSON.stringify({ amount, promoCode, ...(монета ? { coin: монета } : {}) }) });
    if (data.wallet) {
      showPlisioPay(data);
      watchCryptoDeposit(data.depositId, провайдер.путь);
      return;
    }
    if (statusEl) {
      statusEl.classList.remove('hidden');
      const где = провайдер.путь.includes('plisio') ? 'на странице оплаты' : 'в боте';
      statusEl.textContent = `Счёт ждёт ${где} — оплатишь, и придёт ${fmt(data.credited)} TOK.`;
    }
    if (data.payUrl) {
      const tg = window.Telegram?.WebApp;
      if (провайдер.путь.includes('plisio')) {
        if (tg?.openLink) tg.openLink(data.payUrl);
        else window.open(data.payUrl, '_blank', 'noopener');
      } else if (tg?.openTelegramLink) tg.openTelegramLink(data.payUrl);
      else window.open(data.payUrl, '_blank', 'noopener');
    }
    watchCryptoDeposit(data.depositId, провайдер.путь);
  } catch (err) {
    showToast(err.message || 'Не удалось выставить счёт');
    if (statusEl) { statusEl.classList.remove('hidden'); statusEl.textContent = err.message || 'Не удалось выставить счёт.'; }
  } finally {
    updateCryptoDepositUi();
  }
}

function watchCryptoDeposit(depositId, путь = '/api/payments/crypto') {
  if (!depositId) return;
  if (_cryptoDepositPollTimer) clearInterval(_cryptoDepositPollTimer);
  const до = Date.now() + 20 * 60 * 1000;
  const statusEl = document.getElementById('cryptoDepositStatus');
  let мой = null;
  const стоп = () => { clearInterval(мой); if (_cryptoDepositPollTimer === мой) _cryptoDepositPollTimer = null; };
  мой = setInterval(async () => {
    if (_cryptoDepositPollTimer !== мой) { clearInterval(мой); return; }
    if (Date.now() > до) { стоп(); return; }
    try {
      const r = await api(`${путь}/${encodeURIComponent(depositId)}/status`);
      if (_cryptoDepositPollTimer !== мой) { clearInterval(мой); return; }
      const наЭкране = !document.getElementById('plisioPay')?.classList.contains('hidden');
      if (наЭкране && r.received && Number(r.received) > 0 && r.status === 'pending') {
        _plisioSetState(`Перевод виден — ждём подтверждений сети`, '');
      }
      if (r.status === 'paid') {
        стоп();
        if (наЭкране) _plisioSetState(`Оплачено — начислено ${fmt(r.credited)} TOK`, 'is-done');
        if (statusEl) statusEl.textContent = `Оплачено — начислено ${fmt(r.credited)} TOK.`;
        showToast('Баланс пополнен');
        try { const fresh = await api('/api/bootstrap'); if (fresh.user) applyUserUpdate(fresh.user); } catch (e) {}
      } else if (r.status === 'expired' || r.status === 'failed') {
        стоп();
        if (наЭкране) _plisioSetState('Счёт больше не действителен — выстави новый', 'is-dead');
        if (statusEl) statusEl.textContent = 'Счёт больше не действителен — выстави новый.';
      }
    } catch (e) {   }
  }, 9000);
  _cryptoDepositPollTimer = мой;
}
function getStarsDepositRawAmount() {
  const raw = Number(document.getElementById('starsDepositAmount')?.value || 0);
  return (raw > 0 && Number.isFinite(raw)) ? Math.round(raw) : 0;
}

function getStarsDepositCreditedAmount() {
  const stars = getStarsDepositRawAmount();
  if (!stars) return 0;
  const tok = stars * PAYMENT_RATES_RUB.tgstars;
  const code = String(document.getElementById('starsDepositPromo')?.value || '').trim().toUpperCase();
  const bonus = resolveDepositPromoBonus(code);
  const credited = tok * (1 + bonus / 100);
  return Number.isFinite(credited) && credited > 0 ? credited : 0;
}

function updateStarsConversion() {
  const stars = getStarsDepositRawAmount();
  const conversionEl = document.getElementById('starsConversion');
  const valueEl = document.getElementById('starsConversionValue');
  if (!conversionEl || !valueEl) return;
  if (!stars) {
    conversionEl.classList.add('hidden');
    return;
  }
  const tok = Math.round(stars * PAYMENT_RATES_RUB.tgstars);
  valueEl.textContent = tok.toLocaleString('ru-RU');
  conversionEl.classList.remove('hidden');
}

function updateStarsDepositPromoHint() {
  const hintEl = document.getElementById('starsDepositPromoHint');
  if (!hintEl) return;
  const code = String(document.getElementById('starsDepositPromo')?.value || '').trim().toUpperCase();
  if (!code) {
    hintEl.className = 'pet-deposit-promo-hint hidden';
    hintEl.textContent = '';
    return;
  }
  const rotatingPromo = state.promo && String(state.promo.code || '').toUpperCase() === code ? state.promo : null;
  if (rotatingPromo) {
    const raw = getStarsDepositRawAmount();
    const credited = getStarsDepositCreditedAmount();
    hintEl.className = 'pet-deposit-promo-hint is-valid';
    hintEl.textContent = raw
      ? `+${rotatingPromo.bonus}% бонус — зачислится ${fmt(Math.round(credited))} TOK`
      : `+${rotatingPromo.bonus}% бонус применён`;
    hintEl.classList.remove('hidden');
    return;
  }
  hintEl.className = 'pet-deposit-promo-hint';
  hintEl.textContent = 'Проверяем код...';
  hintEl.classList.remove('hidden');
  checkDepositPromoCodeLive(code, (result) => {
    const currentCode = String(document.getElementById('starsDepositPromo')?.value || '').trim().toUpperCase();
    if (currentCode !== code) return;
    if (!result) return;
    if (result.valid) {
      const raw = getStarsDepositRawAmount();
      const credited = getStarsDepositCreditedAmount();
      hintEl.className = 'pet-deposit-promo-hint is-valid';
      hintEl.textContent = raw
        ? `+${result.bonus}% бонус — зачислится ${fmt(Math.round(credited))} TOK`
        : `+${result.bonus}% бонус применён`;
    } else {
      hintEl.className = 'pet-deposit-promo-hint is-invalid';
      hintEl.textContent = result.isSelf ? 'Это твой собственный код — на себя не действует' : 'Промокод не найден или истёк';
    }
  });
}

function setStarsDepositStatus(text, type) {
  const el = document.getElementById('starsDepositStatus');
  if (!el) return;
  if (!text) { el.className = 'deposit-stars-status hidden'; el.textContent = ''; return; }
  el.className = `deposit-stars-status is-${type}`;
  el.textContent = text;
}

function updateStarsDepositPayBtnState() {
  const payBtn = document.getElementById('starsDepositPayBtn');
  const amount = getStarsDepositRawAmount();
  if (payBtn) payBtn.disabled = amount <= 0;
  const hint = document.getElementById('starsDepositPayHint');
  if (hint) hint.textContent = amount <= 0 ? 'Введи количество звёзд выше.' : '';
  updateStarsConversion();
  updateStarsDepositPromoHint();
}
function updateCryptoDepositPromoHint() {
  const hintEl = document.getElementById('cryptoDepositPromoHint');
  if (!hintEl) return;
  const code = String(document.getElementById('cryptoDepositPromo')?.value || '').trim().toUpperCase();
  if (!code) {
    hintEl.className = 'pet-deposit-promo-hint hidden';
    hintEl.textContent = '';
    return;
  }
  const показать = (bonus) => {
    const credited = cryptoDepositCredited();
    hintEl.className = 'pet-deposit-promo-hint is-valid';
    hintEl.textContent = credited
      ? `+${bonus}% бонус — зачислится ${fmt(credited)} TOK`
      : `+${bonus}% бонус применён`;
    hintEl.classList.remove('hidden');
  };
  const rotating = state.promo && String(state.promo.code || '').toUpperCase() === code ? state.promo : null;
  if (rotating) { показать(rotating.bonus); return; }
  hintEl.className = 'pet-deposit-promo-hint';
  hintEl.textContent = 'Проверяем код...';
  hintEl.classList.remove('hidden');
  checkDepositPromoCodeLive(code, (result) => {
    const сейчас = String(document.getElementById('cryptoDepositPromo')?.value || '').trim().toUpperCase();
    if (сейчас !== code) return;
    if (!result) return;
    if (result.valid) { показать(result.bonus); updateCryptoDepositUi(); }
    else {
      hintEl.className = 'pet-deposit-promo-hint is-invalid';
      hintEl.textContent = result.isSelf ? 'Это твой собственный код — на себя не действует' : 'Промокод не найден или истёк';
    }
  });
}

function bindCryptoDepositForm() {
  renderCryptoDepositForm();
  if (window.__cryptoFormBound) return;
  window.__cryptoFormBound = true;
  const ряд = document.getElementById('cryptoProviderTabs');
  bindSafe(ряд, 'click', (e) => {
    const b = e.target.closest('[data-crypto-provider]');
    if (!b) return;
    _cryptoProvider = b.dataset.cryptoProvider;
    hidePlisioPay();
    if (_cryptoProvider === 'plisio') loadPlisioCoins().then(renderPlisioCoins);
    renderCryptoDepositForm();
    const заголовок = document.getElementById('depositModalTitle');
    if (заголовок) заголовок.textContent = depositCryptoTitle();
  });
  const amountInput = document.getElementById('cryptoDepositAmount');
  const promoInput  = document.getElementById('cryptoDepositPromo');
  const payBtn      = document.getElementById('cryptoDepositPayBtn');
  blockCyrillicInInput(promoInput);
  bindSafe(amountInput, 'input', updateCryptoDepositUi);
  bindSafe(promoInput,  'input', () => { updateCryptoDepositUi(); updateCryptoDepositPromoHint(); });
  bindSafe(payBtn, 'click', () => createCryptoDeposit());
  bindSafe(document.getElementById('plisioCoinList'), 'click', (e) => {
    const b = e.target.closest('[data-plisio-coin]');
    if (!b || b.disabled) return;
    createCryptoDeposit(b.dataset.plisioCoin);
  });
  bindSafe(document.getElementById('plisioPayBack'), 'click', hidePlisioPay);
  bindSafe(document.getElementById('plisioPay'), 'click', async (e) => {
    const b = e.target.closest('[data-plisio-copy]');
    if (!b) return;
    const узел = document.getElementById(b.dataset.plisioCopy);
    const текст = узел?.textContent?.trim() || '';
    const подпись = b.querySelector('.plisio-field-copy');
    const отметить = (сообщение) => {
      b.classList.add('is-copied');
      if (подпись) подпись.textContent = сообщение;
      setTimeout(() => {
        b.classList.remove('is-copied');
        if (подпись) подпись.textContent = 'Нажми, чтобы скопировать';
      }, 1600);
    };
    try {
      await navigator.clipboard.writeText(текст);
      отметить('Скопировано ✓');
    } catch (err) {
      if (узел) {
        const r = document.createRange();
        r.selectNodeContents(узел);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
      отметить('Выделено — скопируй вручную');
    }
  });
}

function bindStarsDepositForm() {
  updateStarsDepositPayBtnState();
  if (window.__starsFormBound) return;
  window.__starsFormBound = true;
  const amountInput = document.getElementById('starsDepositAmount');
  const promoInput  = document.getElementById('starsDepositPromo');
  const payBtn      = document.getElementById('starsDepositPayBtn');
  blockCyrillicInInput(promoInput);
  bindSafe(amountInput, 'input', updateStarsDepositPayBtnState);
  bindSafe(promoInput,  'input', updateStarsDepositPayBtnState);
  bindSafe(payBtn, 'click', () => {
    createTelegramStarsDeposit().catch(err => {
      setStarsDepositStatus(err.message || 'Не удалось создать счёт', 'error');
    });
  });
}

function resetStarsDepositForm() {
  const amountInput = document.getElementById('starsDepositAmount');
  const promoInput  = document.getElementById('starsDepositPromo');
  const payBtn      = document.getElementById('starsDepositPayBtn');
  if (amountInput) amountInput.value = '';
  if (promoInput)  promoInput.value  = '';
  if (payBtn)      payBtn.disabled   = true;
  setStarsDepositStatus('', '');
  const conversionEl = document.getElementById('starsConversion');
  if (conversionEl) conversionEl.classList.add('hidden');
  const promoHintEl = document.getElementById('starsDepositPromoHint');
  if (promoHintEl) { promoHintEl.className = 'pet-deposit-promo-hint hidden'; promoHintEl.textContent = ''; }
  if (activeDepositStatusPoll) { clearInterval(activeDepositStatusPoll); activeDepositStatusPoll = null; }
  window.__starsFormBound = false;
}

async function createTelegramStarsDeposit() {
  const amountStars = getStarsDepositRawAmount();
  if (!amountStars) {
    showToast('Сначала введи количество звёзд');
    return;
  }
  const promoCode = String(document.getElementById('starsDepositPromo')?.value || '').trim().toUpperCase();
  const payBtn = document.getElementById('starsDepositPayBtn');
  if (payBtn) { payBtn.disabled = true; payBtn.textContent = 'Создаём счёт...'; }
  try {
    const data = await api('/api/payments/stars/create', {
      method: 'POST',
      body: JSON.stringify({ amountStars, promoCode: promoCode || undefined })
    });
    logUserAction('telegram_stars_deposit_created', {
      depositId: data.deposit?.id,
      amountStars,
      amountStarsCharged: data.deposit?.amountStars,
      promoCode: data.deposit?.promoCode,
      creditedAmount: data.deposit?.creditedAmount
    });
    if (data.deposit) {
      setStarsDepositStatus(
        `Счёт ${data.deposit.id} создан — открываем бот. Если счёт не появился сам, отправь /deposit в бот.`,
        'pending'
      );
    }
    if (data.botLink) {
      try {
        if (typeof tg?.openTelegramLink === 'function') tg.openTelegramLink(data.botLink);
        else window.open(data.botLink, '_blank', 'noopener,noreferrer');
      } catch {
        window.open(data.botLink, '_blank', 'noopener,noreferrer');
      }
    }
    if (data.deposit?.id) pollDepositStatus(data.deposit.id);
  } finally {
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = 'Создать счёт в звёздах'; }
  }
}

let activeDepositStatusPoll = null;
async function pollDepositStatus(depositId) {
  if (!depositId) return;
  if (activeDepositStatusPoll) clearInterval(activeDepositStatusPoll);
  const run = async () => {
    try {
      const data = await api(`/api/payments/${depositId}/status`);
      const deposit = data.deposit;
      if (!deposit) return;
      if (deposit.status === 'paid') {
        const creditedAmount = Math.round(Number(deposit.creditedAmount ?? deposit.amountRub) || 0);
        const bonusNote = deposit.promoCode ? ` (промокод ${deposit.promoCode}, +${deposit.promoBonus}%)` : '';
        setStarsDepositStatus(`Депозит ${deposit.id} оплачен — зачислено ${fmt(creditedAmount)} TOK${bonusNote}`, 'success');
        clearInterval(activeDepositStatusPoll);
        activeDepositStatusPoll = null;
        await syncUserState(true);
        await loadPaymentHistory();
      } else if (deposit.status === 'expired') {
        setStarsDepositStatus(`Счёт ${deposit.id} истёк — создай новый.`, 'error');
        clearInterval(activeDepositStatusPoll);
        activeDepositStatusPoll = null;
      } else if (deposit.status === 'failed') {
        setStarsDepositStatus(`Ошибка оплаты по счёту ${deposit.id}.`, 'error');
        clearInterval(activeDepositStatusPoll);
        activeDepositStatusPoll = null;
      } else {
        setStarsDepositStatus(`Счёт ${deposit.id} ожидает оплаты Telegram Stars...`, 'pending');
      }
    } catch {}
  };
  run();
  activeDepositStatusPoll = setInterval(run, 5000);
}

let activePetDepositStatusPoll = null;
async function pollPetDepositStatus(depositId) {
  if (!depositId) return;
  if (activePetDepositStatusPoll) clearInterval(activePetDepositStatusPoll);
  const statusEl = document.getElementById('petDepositStatus');
  const run = async () => {
    try {
      const data = await api(`/api/pet-deposit/${depositId}/status`);
      const deposit = data.deposit;
      if (!deposit) return;
      if (deposit.status === 'approved') {
        if (statusEl) {
          statusEl.className = 'pet-deposit-status is-success';
          statusEl.textContent = `Одобрено! +${deposit.creditedValue} TOK за ${deposit.petName}`;
        }
        stopPetDepositQueueWait();
        const waitModalOnApprove = document.getElementById('petDepositQueueWaitModal');
        if (waitModalOnApprove) waitModalOnApprove.classList.add('hidden');
        showPetDepositApprovedState(deposit);
        clearInterval(activePetDepositStatusPoll);
        activePetDepositStatusPoll = null;
        await syncUserState(true);
      } else if (deposit.status === 'rejected') {
        if (statusEl) {
          statusEl.className = 'pet-deposit-status is-error';
          statusEl.textContent = `Отклонено: ${deposit.petName}`;
        }
        stopPetDepositQueueWait();
        const waitModal = document.getElementById('petDepositQueueWaitModal');
        if (waitModal) waitModal.classList.add('hidden');
        showPetDepositDeclinedState(deposit.note);
        clearInterval(activePetDepositStatusPoll);
        activePetDepositStatusPoll = null;
      } else {
        if (statusEl) {
          statusEl.className = 'pet-deposit-status is-pending';
          statusEl.textContent = 'Заявка на рассмотрении...';
        }
      }
    } catch {}
  };
  run();
  activePetDepositStatusPoll = setInterval(run, 3000);
}

function openPaymentMethod(method) {
  if (method === 'pet_deposit') {
    openPetDepositPanel();
    return;
  }
  const amountRub = getDepositAmountValue();
  if (!amountRub) {
    showToast('Сначала введи сумму депозита');
    updatePaymentAmountSummary(document.querySelector('#paymentCurrencySwitch .is-active')?.dataset.paymentCurrency || 'rub');
    return;
  }
  const currency = document.querySelector('#paymentCurrencySwitch .is-active')?.dataset.paymentCurrency || 'rub';
  const converted = formatPaymentCurrencyAmount(currency, amountRub);

  if (method === 'pet_deposit') {
    openPetDepositPanel();
    return;
  }

  if (method === 'telegram_stars') {
    createTelegramStarsDeposit().catch((err) => showToast(err.message || 'Не удалось создать счёт в звёздах'));
    return;
  }
  if (['freekassa','payeer','enot','liqpay','mono'].includes(method)) {
    createManualDeposit(method, currency).catch((err) => showToast(err.message || 'Не удалось создать депозит'));
    return;
  }

  const rawUrl = PAYMENT_LINKS[method];
  const hint = document.getElementById('paymentMethodHint');
  logUserAction('open_payment_method', { method, currency, amountRub, converted, url: rawUrl });
  if (!rawUrl || String(rawUrl).startsWith('#set-')) {
    if (hint) hint.textContent = getCurrentLanguage() === 'en'
      ? `For payment method "${method}" set a real URL in PAYMENT_LINKS inside app.js.`
      : `Для метода "${method}" укажи реальную ссылку в PAYMENT_LINKS внутри app.js.`;
    showToast('Ссылка оплаты ещё не настроена');
    return;
  }
  const separator = rawUrl.includes('?') ? '&' : '?';
  const url = `${rawUrl}${separator}amount_rub=${encodeURIComponent(amountRub)}&currency=${encodeURIComponent(currency)}&pay_amount=${encodeURIComponent(converted)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function getDepositCategoryForMethod(method) {
  if (['freekassa','liqpay','mono','card_usd'].includes(method)) return 'cards';
  if (['payeer','enot','payeer_usd'].includes(method)) return 'wallets';
  if (['crypto_bot','nowpayments'].includes(method)) return 'crypto';
  if (['telegram_stars'].includes(method)) return 'tgstars';
  if (['pet_deposit'].includes(method)) return 'pets';
  return 'cards';
}
function activateDepositCategory(category) {
  document.querySelectorAll('[data-deposit-category]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.depositCategory === category);
  });
  document.querySelectorAll('[data-payment-method]').forEach(btn => {
    const method = btn.dataset.paymentMethod;
    btn.classList.toggle('is-hidden-by-category', getDepositCategoryForMethod(method) !== category);
  });
}
function syncDepositTerminalAmountFromMain() {
  if (!refs.depositTerminalAmountMirror || !refs.depositInput) return;
  refs.depositTerminalAmountMirror.value = refs.depositInput.value || '';
}
function syncMainDepositAmountFromTerminal() {
  if (!refs.depositTerminalAmountMirror || !refs.depositInput) return;
  refs.depositInput.value = refs.depositTerminalAmountMirror.value || '';
  updatePaymentAmountSummary(document.querySelector('#paymentCurrencySwitch .is-active')?.dataset.paymentCurrency || 'rub');
}

let _traitsCatalog = null;
let _traitsLoading = null;

function traitsPctText(pct) {
  const n = Number(pct) || 0;
  const num = Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
  return (n > 0 ? '+' : '') + num + '%';
}

async function loadTraitsCatalog() {
  if (_traitsCatalog) return _traitsCatalog;
  if (_traitsLoading) return _traitsLoading;
  _traitsLoading = fetch('/traits.json?v=t1')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
    .then(data => { _traitsCatalog = data; return data; })
    .finally(() => { _traitsLoading = null; });
  return _traitsLoading;
}

const _traitsOpenTiers = new Set(['minus']);

function _traitsTierOrder(tiers) {
  const minus = tiers.filter(t => t.id === 'minus');
  return [...minus, ...tiers.filter(t => t.id !== 'minus')];
}

function hideTraitsWithoutIcon(mount) {
  if (!mount) return;
  for (const img of mount.querySelectorAll('img[src^="/trait-img/"]')) {
    img.addEventListener('error', () => {
      const cell = img.closest('.traits-item');
      if (!cell) { img.remove(); return; }
      const tier = cell.closest('.traits-tier');
      cell.remove();
      if (!tier) return;
      const осталось = tier.querySelectorAll('.traits-item').length;
      if (!осталось) { tier.remove(); return; }
      const счётчик = tier.querySelector('.traits-tier-count');
      if (счётчик) счётчик.textContent = String(осталось);
    }, { once: true });
  }
}

function renderTraitsPanel(data) {
  const mount = document.getElementById('traitsPanelBody');
  if (!mount) return;
  const tiers = Array.isArray(data?.tiers) ? data.tiers : [];
  const traits = Array.isArray(data?.traits) ? data.traits : [];
  mount.innerHTML = _traitsTierOrder(tiers).map(tier => {
    const list = traits.filter(t => t.tier === tier.id);
    if (!list.length) return '';
    const open = _traitsOpenTiers.has(tier.id);
    const cells = list.map(t => {
      const cls = tier.id === 'top' ? ' is-top' : (t.pct < 0 ? ' is-minus' : '');
      return '<div class="traits-item' + cls + '" title="' + escAttr(t.name + ' · ' + traitsPctText(t.pct)) + '">'
        + '<img src="/trait-img/' + escAttr(t.id) + '.webp" alt="" loading="lazy" decoding="async">'
        + '<span class="traits-item-name">' + escHtml(t.name) + '</span>'
        + '<span class="traits-item-pct">' + escHtml(traitsPctText(t.pct)) + '</span>'
        + '</div>';
    }).join('');
    return '<div class="traits-tier' + (open ? ' is-open' : '') + '" data-tier="' + escAttr(tier.id) + '">'
      + '<button type="button" class="traits-tier-head" data-traits-tier="' + escAttr(tier.id) + '" aria-expanded="' + (open ? 'true' : 'false') + '">'
      + '<span class="traits-tier-label">' + escHtml(tier.label) + '</span>'
      + '<span class="traits-tier-note">' + escHtml(tier.note) + '</span>'
      + '<span class="traits-tier-count">' + list.length + '</span>'
      + '<span class="traits-tier-chevron" aria-hidden="true">&#9662;</span>'
      + '</button>'
      + '<div class="traits-grid">' + cells + '</div>'
      + '</div>';
  }).join('');
  hideTraitsWithoutIcon(mount);
}

function toggleTraitsTier(tierId) {
  const tier = document.querySelector('#traitsPanelBody .traits-tier[data-tier="' + CSS.escape(tierId) + '"]');
  if (!tier) return;
  const open = !tier.classList.contains('is-open');
  tier.classList.toggle('is-open', open);
  tier.querySelector('.traits-tier-head')?.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) _traitsOpenTiers.add(tierId); else _traitsOpenTiers.delete(tierId);
}

function renderTraitsToggleIcons(data) {
  const mount = document.getElementById('traitsToggleIcons');
  if (!mount) return;
  const up = (data?.traits || []).filter(t => t.pct > 0).slice().sort((a, b) => a.pct - b.pct);
  if (!up.length) return;
  const pick = [];
  const step = (up.length - 1) / 5;
  for (let i = 0; i < 6; i++) pick.push(up[Math.round(i * step)]);
  mount.innerHTML = pick.filter(Boolean)
    .map(t => '<img src="/trait-img/' + escAttr(t.id) + '.webp" alt="" loading="lazy" decoding="async">')
    .join('');
  hideTraitsWithoutIcon(mount);
}

function setTraitsOpen(open) {
  const panel = document.getElementById('traitsPanel');
  const btn = document.getElementById('traitsToggleBtn');
  const shell = document.querySelector('#depositFullscreenModal .deposit-fullscreen-shell');
  if (!panel || !btn) return;
  panel.classList.toggle('hidden', !open);
  btn.classList.toggle('is-open', open);
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (shell) shell.classList.toggle('has-traits', open);
}

async function toggleTraitsPanel() {
  const panel = document.getElementById('traitsPanel');
  if (!panel) return;
  const willOpen = panel.classList.contains('hidden');
  if (!willOpen) { setTraitsOpen(false); return; }
  setTraitsOpen(true);
  const side = window.matchMedia('(min-width: 1381px)').matches;
  if (!side) requestAnimationFrame(() => panel.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  const body = document.getElementById('traitsPanelBody');
  if (body && !body.childElementCount) body.innerHTML = '<div class="muted" style="font-size:12px">Загрузка...</div>';
  try {
    const data = await loadTraitsCatalog();
    renderTraitsPanel(data);
    renderTraitsToggleIcons(data);
  } catch (e) {
    if (body) body.innerHTML = '<div class="muted" style="font-size:12px">Не загрузилось. Обнови страницу.</div>';
  }
}

function primeTraitsToggle() {
  if (!document.getElementById('traitsToggleIcons')) return;
  loadTraitsCatalog().then(renderTraitsToggleIcons).catch(() => {});
}

bindSafe(document, 'click', (e) => {
  if (e.target.closest('#traitsToggleBtn')) { toggleTraitsPanel(); return; }
  if (e.target.closest('#traitsCloseBtn')) { setTraitsOpen(false); return; }
  const tierHead = e.target.closest('[data-traits-tier]');
  if (tierHead) toggleTraitsTier(tierHead.dataset.traitsTier);
});

function openDepositModal() {
  primeTraitsToggle();
  if (state.closedFeatures?.deposit && !state._perm) { showToast('Пополнение временно недоступно'); return; }
  const modal = document.getElementById('depositFullscreenModal');
  if (!modal) return;
  initDepositCategoryTabs();
  bindStarsDepositForm();
  openPetDepositPanel();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('deposit-modal-open');
}
function closeDepositModal() {
  const modal = document.getElementById('depositFullscreenModal');
  if (!modal) return;
  if (_cryptoDepositPollTimer) { clearInterval(_cryptoDepositPollTimer); _cryptoDepositPollTimer = null; }
  _paKindClosePicker?.();
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('deposit-modal-open');
  closePetDepositPanel();
  closeDepositRulesModal();
  resetStarsDepositForm();
}

function initDepositCategoryTabs() {
  const tabs = document.querySelectorAll('#depositCategoryTabs .deposit-cat-tab');
  if (!tabs.length || tabs[0].dataset.depositCatBound) return;
  tabs.forEach(tab => {
    tab.dataset.depositCatBound = '1';
    tab.addEventListener('click', () => switchDepositCategory(tab.dataset.depositCat));
  });
}

const DEPOSIT_CAT_TITLES = { stars: 'Telegram Stars', pets: 'Депозит брейнротом', girsy: 'Депозит гирсами', crypto: 'Крипта', nft: 'Подарки' };
function depositCryptoTitle() {
  return _cryptoProvider === 'plisio' ? 'Крипта на кошелёк' : 'Крипта через CryptoBot';
}
const DEPOSIT_CAT_SUBS = {
  pets:  'Выбери брейнрота, введи свой ник в игре и отправь заявку — после проверки мы зачислим TOK на баланс.',
  girsy: 'Выбери гирсу, введи свой ник в игре и отправь заявку — после проверки мы зачислим TOK на баланс.'
};
let _petDepositActiveCategory = 'pets'; 
function switchDepositCategory(cat) {
  document.querySelectorAll('#depositCategoryTabs .deposit-cat-tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.depositCat === cat);
  });
  const starsPanel = document.getElementById('depositStarsPanel');
  const petsPanel  = document.getElementById('petDepositPanel');
  const titleEl    = document.getElementById('depositModalTitle');
  const isPetLike  = cat === 'pets' || cat === 'girsy';
  const cryptoPanel = document.getElementById('depositCryptoPanel');
  if (starsPanel) starsPanel.classList.toggle('hidden', cat !== 'stars');
  if (cryptoPanel) cryptoPanel.classList.toggle('hidden', cat !== 'crypto');
  if (cat === 'crypto') bindCryptoDepositForm();
  const nftPanel = document.getElementById('depositNftPanel');
  if (nftPanel) nftPanel.classList.toggle('hidden', cat !== 'nft');
  if (cat === 'nft') renderNftDepositPanel();
  if (petsPanel)  petsPanel.classList.toggle('hidden',  !isPetLike);
  if (titleEl)    titleEl.textContent = cat === 'crypto' ? depositCryptoTitle() : (DEPOSIT_CAT_TITLES[cat] || 'Пополнение');
  if (isPetLike) {
    _petDepositActiveCategory = cat;
    const subEl = document.getElementById('petDepositPanelSub');
    if (subEl) subEl.textContent = DEPOSIT_CAT_SUBS[cat] || DEPOSIT_CAT_SUBS.pets;
    renderPetDepositGrid();
    renderPetDepositSelectedInfo();
    updatePetDepositSubmitState();
    showPetDepositStep(1);
  }
}

function isEntryWithdrawable(entry, item) {
  if (!entry || entry.withdrawalPending) return false;
  if (entry.noWithdraw) return false;
  if (entry.mutationId) return false;
  return !(state.outOfStockBrainrots || []).includes(item?.id || entry.itemId);
}

function withdrawBlockReason(entry, item) {
  if (!entry) return null;
  if (entry.withdrawalPending) return { code: 'pending', short: 'уже на выводе', full: 'Этот предмет уже в заявке на вывод.' };
  if (entry.noWithdraw) return { code: 'shop', short: 'куплен — не выводим', full: 'Этот брейнрот куплен в магазине — такие не выводятся. Отыграй его в апгрейдере, дайсах или краше либо продай за TOK.' };
  const minValue = state.minWithdrawValue || 65;
  if ((Number(item?.value) || 0) < minValue) {
    return { code: 'below_min', short: `дешевле ${Math.round(minValue)} TOK`, full: `Выводим брейнротов от ${Math.round(minValue)} TOK. Этот дешевле — его можно продать или обменять.` };
  }
  if (entry.mutationId) return { code: 'mutation', short: 'цветной — не выводим', full: 'Цветных брейнротов мы не выводим: запаса цветных предметов у площадки нет. Обменяй на обычного или продай.' };
  if ((state.outOfStockBrainrots || []).includes(item?.id || entry.itemId)) return { code: 'out_of_stock', short: 'нет в наличии', full: 'Этого брейнрота сейчас нет в наличии. Обменяй его на доступного.' };
  return null;
}

function getSellableInventoryItems() {
  const inv = state.user?.inventory || [];
  const brainrotMap = state.brainrotMap || new Map((state.brainrots || []).map(b => [b.id, b]));
  const pool = getExchangePool();
  return inv
    .filter(entry => !entry.withdrawalPending)
    .map(entry => ({ entry, item: entry.item || brainrotMap.get(entry.itemId) }))
    .filter(({ entry }) => !entry.noWithdraw)
    .filter(({ entry, item }) => item && !isEntryWithdrawable(entry, item))
    .filter(({ item }) => {
      const value = Math.round(Number(item.value)) || 0;
      return computeExchangeOffers(value, pool, Infinity).offers.length > 0;
    });
}

function getExchangePool() {
  if (!state.brainrotPool?.exchange?.enabled) return [];
  const outOfStockIds = new Set(state.outOfStockBrainrots || []);
  const brainrotMap = state.brainrotMap || new Map((state.brainrots || []).map(b => [b.id, b]));
  const poolIds = (state.brainrotPool?.exchange?.ids || []).filter(id => !outOfStockIds.has(id));
  return poolIds.map(id => brainrotMap.get(id)).filter(Boolean);
}

function computeExchangeOffers(selectedTotal, pool, userBalance) {
  const TOPUP_CAP_RATIO = 2;
  const MAX_QTY = 4;

  if (!(selectedTotal > 0) || !Array.isArray(pool) || !pool.length) {
    return { offers: [], emptyReason: 'no_match' };
  }

  const capPassing = [];
  const pushCandidate = (it, V, N, offerValue) => {
    const rawDiff = offerValue - selectedTotal;
    capPassing.push({
      itemId: it.id, name: it.name, image: it.image, emoji: it.emoji,
      value: V, qty: N, offerValue,
      diff: Math.abs(rawDiff),
      topup: rawDiff > 0 ? rawDiff : 0,
      change: rawDiff < 0 ? -rawDiff : 0
    });
  };
  for (const it of pool) {
    const V = Math.round(Number(it.value) || 0);
    if (!(V > 0)) continue;
    const N = Math.max(1, Math.round(selectedTotal / V));
    if (N <= MAX_QTY) {
      const вниз = Math.floor(selectedTotal / V);
      const вверх = Math.ceil(selectedTotal / V);
      if (вниз >= 1) {
        const qty = Math.min(вниз, MAX_QTY);
        pushCandidate(it, V, qty, qty * V);
      }
      if (вверх !== вниз && вверх <= MAX_QTY) {
        const offerValue = вверх * V;
        if (offerValue <= selectedTotal * TOPUP_CAP_RATIO) pushCandidate(it, V, вверх, offerValue);
      }
    } else {
      pushCandidate(it, V, MAX_QTY, MAX_QTY * V);
    }
  }

  if (!capPassing.length) return { offers: [], emptyReason: 'no_match' };

  const affordable = capPassing.filter(o => o.topup <= userBalance);
  if (!affordable.length) return { offers: [], emptyReason: 'unaffordable' };

  const byOffer = new Map();
  for (const o of affordable) {
    const key = `${o.itemId}:${o.qty}`;
    if (!byOffer.has(key)) byOffer.set(key, o);
  }
  const deduped = [...byOffer.values()];

  deduped.sort((a, b) => (a.diff - b.diff) || (a.value - b.value));
  return { offers: deduped, emptyReason: null };
}

let _exchangeGiveSelection = new Set();
let _exchangeChosenOffer = null;

function openExchangeShopModal(opts = {}) {
  const modal = document.getElementById('exchangeShopModal');
  if (!modal) return;
  _exchangeGiveSelection = opts.preselectUid ? new Set([opts.preselectUid]) : new Set();
  _exchangeChosenOffer = null;
  renderExchangeShop();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('deposit-modal-open');
}

function closeExchangeShopModal() {
  const modal = document.getElementById('exchangeShopModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('deposit-modal-open');
}

function renderExchangeShop() {
  renderExchangeGiveGrid();
}

function updateExchangeSummary() {
  const el = document.getElementById('exchangeSummary');
  if (!el) return;
  const sellable = getSellableInventoryItems();
  const total = sellable
    .filter(({ entry }) => _exchangeGiveSelection.has(entry.uid))
    .reduce((s, { item }) => s + (Math.round(Number(item.value)) || 0), 0);
  el.textContent = `Выбрано: ${_exchangeGiveSelection.size}/3 · Итого ${total} TOK`;
}

function renderExchangeGiveGrid() {
  const grid = document.getElementById('exchangeGiveGrid');
  const emptyEl = document.getElementById('exchangeGiveEmpty');
  if (!grid) return;
  const sellable = getSellableInventoryItems();
  if (!sellable.length) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    _exchangeGiveSelection.clear();
    renderExchangeOffers();
    updateExchangeSummary();
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  for (const uid of [..._exchangeGiveSelection]) {
    if (!sellable.some(({ entry }) => entry.uid === uid)) _exchangeGiveSelection.delete(uid);
  }
  grid.innerHTML = sellable.map(({ entry, item }) => {
    const isSel = _exchangeGiveSelection.has(entry.uid);
    const mediaHtml = item.image
      ? `<img class="oos-card-img" src="${escAttr(item.image)}" alt="">`
      : `<span class="oos-card-emoji">${escHtml(item.emoji || '📦')}</span>`;
    return `<div class="oos-card${isSel ? ' oos-card-on' : ''}" data-give-uid="${escAttr(entry.uid)}">
      ${mediaHtml}
      <div class="oos-card-name">${escHtml(item.name)}</div>
      <div class="oos-card-delta">${Math.round(Number(item.value) || 0)} TOK</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-give-uid]').forEach(card => {
    bindSafe(card, 'click', () => {
      const uid = card.dataset.giveUid;
      if (_exchangeGiveSelection.has(uid)) {
        _exchangeGiveSelection.delete(uid);
      } else {
        if (_exchangeGiveSelection.size >= 3) { showToast('Можно выбрать максимум 3 предмета'); return; }
        _exchangeGiveSelection.add(uid);
      }
      _exchangeChosenOffer = null;
      renderExchangeGiveGrid();
    });
  });
  renderExchangeOffers();
  updateExchangeSummary();
}

function renderExchangeOffers() {
  const grid = document.getElementById('exchangeOffersGrid');
  const emptyEl = document.getElementById('exchangeOffersEmpty');
  const nextBtn = document.getElementById('exchangeNextBtn');
  if (!grid) return;

  const sellable = getSellableInventoryItems();
  const selectedItems = sellable.filter(({ entry }) => _exchangeGiveSelection.has(entry.uid));
  const selectedTotal = selectedItems.reduce((s, { item }) => s + (Math.round(Number(item.value)) || 0), 0);

  if (!selectedItems.length) {
    grid.innerHTML = '';
    if (emptyEl) { emptyEl.classList.remove('hidden'); emptyEl.textContent = 'Выбери предметы слева, чтобы увидеть предложения.'; }
    _exchangeChosenOffer = null;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  const pool = getExchangePool();
  const balance = Math.round(Number(state.user?.balance) || 0);
  const { offers, emptyReason } = computeExchangeOffers(selectedTotal, pool, balance);

  if (!offers.length) {
    grid.innerHTML = '';
    if (emptyEl) {
      emptyEl.classList.remove('hidden');
      emptyEl.textContent = emptyReason === 'unaffordable'
        ? 'Не хватает баланса для доплаты — выбери другие предметы.'
        : 'Недостаточно набрано для выгодного обмена — добери ещё предметов.';
    }
    _exchangeChosenOffer = null;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  if (_exchangeChosenOffer && !offers.some(o => o.itemId === _exchangeChosenOffer.itemId && o.qty === _exchangeChosenOffer.qty)) {
    _exchangeChosenOffer = null;
  }

  grid.innerHTML = offers.map(o => {
    const isSel = _exchangeChosenOffer && _exchangeChosenOffer.itemId === o.itemId && _exchangeChosenOffer.qty === o.qty;
    const mediaHtml = o.image
      ? `<img class="oos-card-img" src="${escAttr(o.image)}" alt="">`
      : `<span class="oos-card-emoji">${escHtml(o.emoji || '📦')}</span>`;
    const deltaHtml = o.topup > 0
      ? `<div class="oos-card-delta exchange-offer-topup">-${o.topup} TOK</div>`
      : o.change > 0
        ? `<div class="oos-card-delta exchange-offer-change">+${o.change} TOK</div>`
        : `<div class="oos-card-delta">Точный обмен</div>`;
    return `<div class="oos-card exchange-offer-card${isSel ? ' oos-card-on' : ''}" data-offer-item="${escAttr(o.itemId)}" data-offer-qty="${o.qty}">
      ${mediaHtml}
      ${o.qty > 1 ? `<span class="exchange-offer-qty-badge">x${o.qty}</span>` : ''}
      <div class="oos-card-name">${escHtml(o.name)}</div>
      ${deltaHtml}
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-offer-item]').forEach(card => {
    bindSafe(card, 'click', () => {
      _exchangeChosenOffer = { itemId: card.dataset.offerItem, qty: Number(card.dataset.offerQty) };
      renderExchangeOffers();
    });
  });

  if (nextBtn) nextBtn.disabled = !_exchangeChosenOffer;
}

function openExchangeConfirmModal() {
  if (!_exchangeChosenOffer) return;
  const modal = document.getElementById('exchangeConfirmModal');
  if (!modal) return;

  const sellable = getSellableInventoryItems();
  const selectedItems = sellable.filter(({ entry }) => _exchangeGiveSelection.has(entry.uid));
  const pool = getExchangePool();
  const offerItem = pool.find(it => it.id === _exchangeChosenOffer.itemId);
  if (!offerItem) return;

  const givenGroups = [];
  const byItemId = new Map();
  for (const { item } of selectedItems) {
    if (!byItemId.has(item.id)) { const g = { item, qty: 0 }; byItemId.set(item.id, g); givenGroups.push(g); }
    byItemId.get(item.id).qty++;
  }

  const givenRow = document.getElementById('exchangeConfirmGivenRow');
  if (givenRow) {
    givenRow.innerHTML = givenGroups.map(g => {
      const mediaHtml = g.item.image
        ? `<img class="oos-card-img" src="${escAttr(g.item.image)}" alt="">`
        : `<span class="oos-card-emoji">${escHtml(g.item.emoji || '📦')}</span>`;
      return `<div class="exchange-confirm-item">
        <div class="exchange-confirm-chip">
          ${mediaHtml}
          ${g.qty > 1 ? `<span class="exchange-offer-qty-badge">x${g.qty}</span>` : ''}
        </div>
        <div class="exchange-confirm-item-name">${escHtml(g.item.name || '')}</div>
      </div>`;
    }).join('');
  }

  const receiveEl = document.getElementById('exchangeConfirmReceive');
  if (receiveEl) {
    const mediaHtml = offerItem.image
      ? `<img class="oos-card-img" src="${escAttr(offerItem.image)}" alt="">`
      : `<span class="oos-card-emoji">${escHtml(offerItem.emoji || '📦')}</span>`;
    receiveEl.innerHTML = mediaHtml;
  }
  const receiveNameEl = document.getElementById('exchangeConfirmReceiveName');
  if (receiveNameEl) {
    receiveNameEl.innerHTML = _exchangeChosenOffer.qty > 1
      ? `${escHtml(offerItem.name || '')} <span class="exchange-success-qty">×${_exchangeChosenOffer.qty}</span>`
      : escHtml(offerItem.name || '');
  }

  const selectedTotal = selectedItems.reduce((s, { item }) => s + (Math.round(Number(item.value)) || 0), 0);
  const offerValue = offerItem.value * _exchangeChosenOffer.qty;
  const rawDiff = offerValue - selectedTotal;
  const deltaEl = document.getElementById('exchangeConfirmDelta');
  if (deltaEl) {
    if (rawDiff > 0) {
      deltaEl.textContent = `Доплата: -${rawDiff} TOK`;
      deltaEl.className = 'exchange-confirm-delta exchange-confirm-delta-negative';
    } else if (rawDiff < 0) {
      deltaEl.textContent = `Сдача: +${-rawDiff} TOK`;
      deltaEl.className = 'exchange-confirm-delta exchange-confirm-delta-positive';
    } else {
      deltaEl.className = 'exchange-confirm-delta hidden';
    }
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeExchangeConfirmModal() {
  const modal = document.getElementById('exchangeConfirmModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

async function submitExchangeTrade() {
  if (!_exchangeChosenOffer) return;
  const giveUids = [..._exchangeGiveSelection];
  try {
    const data = await api('/api/inventory/exchange-trade', {
      method: 'POST',
      body: JSON.stringify({ giveUids, receiveItemId: _exchangeChosenOffer.itemId, receiveQty: _exchangeChosenOffer.qty })
    });
    if (data.user) applyUserUpdate(data.user);
    closeExchangeConfirmModal();
    openExchangeSuccessModal(data);
    _exchangeGiveSelection.clear();
    _exchangeChosenOffer = null;
  } catch (e) {
    closeExchangeConfirmModal();
    renderExchangeGiveGrid();
    showToast(e.message || 'Не удалось провести обмен');
  }
}

let _exchangeSuccessReceivedItemId = null;
let _exchangeSuccessReceivedQty = 0;

function openExchangeSuccessModal(data) {
  const modal = document.getElementById('exchangeSuccessModal');
  if (!modal) return;

  const received = data.received || {};
  _exchangeSuccessReceivedItemId = received.itemId || null;
  _exchangeSuccessReceivedQty = received.qty || 1;
  const brainrotMap = state.brainrotMap || new Map((state.brainrots || []).map(b => [b.id, b]));
  const receivedItem = brainrotMap.get(received.itemId);
  const receiveEl = document.getElementById('exchangeSuccessReceive');
  if (receiveEl) {
    const mediaHtml = receivedItem?.image
      ? `<img class="oos-card-img" src="${escAttr(receivedItem.image)}" alt="">`
      : `<span class="oos-card-emoji">${escHtml(receivedItem?.emoji || '📦')}</span>`;
    receiveEl.innerHTML = mediaHtml;
  }
  const nameEl = document.getElementById('exchangeSuccessName');
  if (nameEl) {
    nameEl.innerHTML = received.qty > 1
      ? `${escHtml(received.name || '')} <span class="exchange-success-qty">×${received.qty}</span>`
      : escHtml(received.name || '');
  }

  const deltaEl = document.getElementById('exchangeSuccessDelta');
  if (deltaEl) {
    if (data.topup > 0) { deltaEl.textContent = `Доплата: -${data.topup} TOK`; deltaEl.classList.remove('hidden'); }
    else if (data.change > 0) { deltaEl.textContent = `Сдача: +${data.change} TOK`; deltaEl.classList.remove('hidden'); }
    else deltaEl.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeExchangeSuccessModal() {
  const modal = document.getElementById('exchangeSuccessModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  closeExchangeShopModal();
}

function withdrawFromExchangeSuccess() {
  closeExchangeSuccessModal();
  if (!_exchangeSuccessReceivedItemId) { openWithdrawalModal(); return; }
  const uids = (state.user?.inventory || [])
    .filter(entry => entry.itemId === _exchangeSuccessReceivedItemId && !entry.withdrawalPending)
    .slice(0, _exchangeSuccessReceivedQty)
    .map(entry => entry.uid);
  openWithdrawalModal(uids[0] || null);
  if (uids.length > 1) {
    for (let i = 1; i < uids.length; i++) _wdrSelected.add(uids[i]);
    _wdrUpdateGrid();
    _wdrUpdateBar();
  }
}

function openExchangeBlockedModal(uid, itemName) {
  const modal = document.getElementById('exchangeBlockedModal');
  if (!modal) return;
  const nameEl = document.getElementById('exchangeBlockedModalName');
  if (nameEl) nameEl.textContent = itemName ? `«${itemName}»` : 'Этот брейнрот';

  const entry = (state.user?.inventory || []).find(e => e.uid === uid);
  const item = entry ? (entry.item || state.brainrotMap?.get(entry.itemId)) : null;
  const value = Math.round(Number(item?.value)) || 0;
  const exchangeEligible = value > 0 && computeExchangeOffers(value, getExchangePool(), Infinity).offers.length > 0;
  const isMutated = Boolean(entry?.mutationId);
  const isShop = Boolean(entry?.noWithdraw);

  const reasonEl = document.getElementById('exchangeBlockedModalReason');
  if (reasonEl) reasonEl.textContent = isShop ? 'Купленное в магазине не выводится' : isMutated ? 'Не выводим мутированных брейнротов' : 'сейчас нет в наличии';
  if (nameEl) { nameEl.hidden = isMutated || isShop; if (isMutated || isShop) nameEl.textContent = ''; }

  const descEl = modal.querySelector('.oos-modal-desc');
  if (descEl) {
    const who = itemName ? `«${itemName}»` : 'Этот брейнрот';
    descEl.textContent = isShop
      ? `${who} куплен в магазине — такие брейнроты мы не выводим. Его можно отыграть в апгрейдере, дайсах или краше, а можно продать за TOK в инвентаре.`
      : exchangeEligible
      ? (isMutated
        ? `${who} вывести нельзя — запаса мутировавших предметов у нас нет. Зато его можно разменять на обычных брейнротов, которых мы выведем, — по его цене с мутацией.`
        : 'Мы не можем вывести этого брейнрота прямо сейчас, так как его нет в наличии. Но можно обменять его на других брейнротов, которых мы сможем вывести.')
      : (isMutated
        ? `${who} вывести нельзя, а разменять не получится — слишком низкая стоимость для обмена. Продай его за TOK через обычную продажу в инвентаре.`
        : 'Мы не можем вывести этого брейнрота, а обменять его тоже не получится — слишком низкая стоимость для обмена. Продай его за TOK через обычную продажу в инвентаре.');
  }
  const continueBtn = document.getElementById('exchangeBlockedContinueBtn');
  const мочьОбменять = exchangeEligible && !isShop;
  if (continueBtn) continueBtn.textContent = мочьОбменять ? 'Продолжить' : 'Понятно';

  modal.dataset.uid = uid || '';
  modal.dataset.exchangeEligible = мочьОбменять ? '1' : '0';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeExchangeBlockedModal() {
  const modal = document.getElementById('exchangeBlockedModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function bindExchangeShopModal() {
  if (window.__exchangeShopModalBound) return;
  window.__exchangeShopModalBound = true;
  document.querySelectorAll('[data-close-exchange-shop]').forEach(btn => {
    bindSafe(btn, 'click', closeExchangeShopModal);
  });
  bindSafe(document.getElementById('exchangeNextBtn'), 'click', openExchangeConfirmModal);
  document.querySelectorAll('[data-close-exchange-confirm]').forEach(btn => {
    bindSafe(btn, 'click', closeExchangeConfirmModal);
  });
  bindSafe(document.getElementById('exchangeConfirmBtn'), 'click', submitExchangeTrade);
  document.querySelectorAll('[data-close-exchange-success]').forEach(btn => {
    bindSafe(btn, 'click', closeExchangeSuccessModal);
  });
  bindSafe(document.getElementById('exchangeSuccessInventoryBtn'), 'click', withdrawFromExchangeSuccess);
  bindSafe(document.getElementById('exchangeBlockedContinueBtn'), 'click', () => {
    const modal = document.getElementById('exchangeBlockedModal');
    const uid = modal?.dataset.uid || null;
    const eligible = modal?.dataset.exchangeEligible === '1';
    closeExchangeBlockedModal();
    if (eligible) openExchangeShopModal({ preselectUid: uid });
  });
}

let _wdrNoticeShown = false;
const UPDATE_NOTICE_SEEN_KEY = 'brainrot-update-seen';
let _updateNoticeShown = false;
const UPD_CONFETTI_COLORS = ['#FFD98A', '#FFB33C', '#FFE8B0', '#58A6FF', '#3868C0', '#FFFFFF'];

function _updNoticeConfetti(x, y, count = 60, сторона = 1) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'upd-confetti-layer';
  const низ = window.innerHeight || 800;
  let maxLife = 0;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'upd-confetti';
    const ось = document.createElement('span');
    ось.className = 'upd-confetti-y';
    const качалка = document.createElement('span');
    качалка.className = 'upd-confetti-s';
    const бумажка = document.createElement('span');
    бумажка.className = 'upd-confetti-p';

    const dx = Math.round(сторона * (20 + Math.random() * 190) - сторона * Math.random() * 55);
    const подъём = 130 + Math.random() * 200;
    const тяжесть = 0.78 + Math.random() * 0.5;
    const dur = (1500 + подъём * 2.4) * тяжесть + Math.random() * 300;
    const delay = Math.random() * 180;
    piece.style.setProperty('--x', Math.round(x) + 'px');
    piece.style.setProperty('--y', Math.round(y) + 'px');
    piece.style.setProperty('--dx', dx + 'px');
    piece.style.setProperty('--rise', '-' + Math.round(подъём) + 'px');
    piece.style.setProperty('--fall', Math.round(низ - y + 60) + 'px');
    piece.style.setProperty('--dur', Math.round(dur) + 'ms');
    piece.style.setProperty('--delay', Math.round(delay) + 'ms');
    ось.style.setProperty('--dur', Math.round(dur) + 'ms');
    ось.style.setProperty('--delay', Math.round(delay) + 'ms');
    качалка.style.setProperty('--sway', Math.round(420 + Math.random() * 480) + 'ms');
    качалка.style.setProperty('--swayAmp', Math.round(10 + Math.random() * 17) + 'px');
    качалка.style.setProperty('--swayDir', Math.random() < .5 ? 'alternate' : 'alternate-reverse');
    качалка.style.setProperty('--delay', Math.round(delay) + 'ms');
    бумажка.style.setProperty('--dur', Math.round(dur) + 'ms');
    бумажка.style.setProperty('--delay', Math.round(delay) + 'ms');
    бумажка.style.setProperty('--spin', Math.round(520 + Math.random() * 620) + 'ms');
    бумажка.style.setProperty('--ax', (Math.random() * 1.4 - .7).toFixed(2));
    бумажка.style.setProperty('--ay', (Math.random() < .5 ? -1 : 1).toString());
    бумажка.style.setProperty('--w', (6 + Math.round(Math.random() * 4)) + 'px');
    бумажка.style.setProperty('--h', (10 + Math.round(Math.random() * 6)) + 'px');
    бумажка.style.setProperty('--c', UPD_CONFETTI_COLORS[i % UPD_CONFETTI_COLORS.length]);

    качалка.appendChild(бумажка);
    ось.appendChild(качалка);
    piece.appendChild(ось);
    maxLife = Math.max(maxLife, dur + delay);
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), maxLife + 250);
}

function renderUpdateNotice(notice) {
  if (_updateNoticeShown) return;
  if (!notice || !notice.enabled || !notice.version || !(notice.items || []).length) return;
  let seen = '';
  try { seen = localStorage.getItem(UPDATE_NOTICE_SEEN_KEY) || ''; } catch {}
  if (seen === notice.version) return;
  const modal = document.getElementById('updateNoticeModal');
  if (!modal) return;
  _updateNoticeShown = true;

  const titleEl = document.getElementById('updateNoticeTitle');
  const leadEl = document.getElementById('updateNoticeLead');
  const listEl = document.getElementById('updateNoticeList');
  const okBtn = document.getElementById('updateNoticeOkBtn');
  if (titleEl) titleEl.textContent = notice.title || 'Мы обновились';
  if (leadEl) {
    leadEl.textContent = notice.lead || '';
    leadEl.classList.toggle('hidden', !notice.lead);
  }
  if (listEl) {
    listEl.innerHTML = notice.items
      .map((t, i) => `<div class="upd-notice-row" style="--i:${i}"><span class="upd-notice-dot"></span><span>${escHtml(t)}</span></div>`)
      .join('');
  }
  if (okBtn) okBtn.textContent = notice.buttonText || 'Понятно';

  const закрыть = () => {
    try { localStorage.setItem(UPDATE_NOTICE_SEEN_KEY, notice.version); } catch {}
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };
  bindSafe(okBtn, 'click', закрыть);
  bindSafe(modal, 'click', (e) => { if (e.target === modal) закрыть(); });

  modal.classList.remove('hidden');
  modal.removeAttribute('aria-hidden');
  if (typeof localizeTree === 'function') localizeTree(modal);

  const card = modal.querySelector('.oos-modal-card');
  if (card) {
    const пыхнуть = (доля, сторона) => {
      if (modal.classList.contains('hidden')) return;
      const r = card.getBoundingClientRect();
      if (!r.width) return;
      _updNoticeConfetti(r.left + r.width * доля, r.top + 14, 30, сторона);
    };
    setTimeout(() => пыхнуть(0.16, -1), 260);
    setTimeout(() => пыхнуть(0.84, 1), 430);
  }
}

function renderWithdrawalNotices(list) {
  const modal = document.getElementById('wdrNoticeModal');
  if (!modal || !Array.isArray(list) || !list.length) return;
  if (_wdrNoticeShown) return;
  _wdrNoticeShown = true;
  const en = getCurrentLanguage() === 'en';
  const titleEl = document.getElementById('wdrNoticeTitle');
  const leadEl = document.getElementById('wdrNoticeLead');
  const anyDropped = list.some(n => n.itemsDropped);
  if (titleEl) titleEl.textContent = list.length > 1
    ? (en ? 'Withdrawals were not completed' : 'Выводы не состоялись')
    : (en ? 'Withdrawal was not completed' : 'Вывод не состоялся');
  if (leadEl) leadEl.textContent = anyDropped
    ? (en ? 'Check the details below.' : 'Подробности ниже — по части заявок предметы изъяты.')
    : (en ? 'Items are back in your inventory — you can submit a new request.' : 'Предметы вернулись в инвентарь — можно оформить заявку заново.');
  const listEl = document.getElementById('wdrNoticeList');
  if (listEl) {
    listEl.innerHTML = list.map(n => {
      const names = (n.itemNames || []).join(', ') || (en ? 'item(s)' : 'предмет(ы)');
      const more = n.itemsCount > (n.itemNames || []).length ? ' …' : '';
      const when = n.processedAt ? new Date(n.processedAt).toLocaleString(en ? 'en-GB' : 'ru-RU') : '';
      return `<div class="wdr-notice-row">
        <div class="wdr-notice-items">${escHtml(names)}${more}${n.totalValue ? ' — ' + Math.round(n.totalValue) + ' TOK' : ''}</div>
        <div class="wdr-notice-reason">${en ? 'Reason' : 'Причина'}: ${escHtml(n.reasonText || '')}</div>
        ${n.itemsDropped ? `<div class="wdr-notice-dropped">${en ? 'Items were not returned to your inventory' : 'Предметы изъяты и в инвентарь не вернулись'}</div>` : ''}
        ${when ? `<div class="wdr-notice-date">${escHtml(when)}</div>` : ''}
      </div>`;
    }).join('');
  }
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

async function closeWithdrawalNotices() {
  const modal = document.getElementById('wdrNoticeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  const ids = (state.withdrawalNotices || []).map(n => n.id).filter(Boolean);
  state.withdrawalNotices = [];
  if (!ids.length) return;
  try { await api('/api/withdrawals/notices/ack', { method: 'POST', body: JSON.stringify({ ids }) }); } catch {}
}

function showMinWithdrawModal(itemName) {
  const modal = document.getElementById('minWithdrawModal');
  if (!modal) return;
  const nameEl = document.getElementById('minWithdrawModalName');
  const valueEl = document.getElementById('minWithdrawModalValue');
  if (nameEl) nameEl.textContent = itemName ? `«${itemName}»` : 'Этот брейнрот';
  if (valueEl) valueEl.textContent = Math.round(state.minWithdrawValue || 65);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeMinWithdrawModal() {
  const modal = document.getElementById('minWithdrawModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

const PET_DEPOSIT_MAX_ITEMS = 5;
let _petDepositQtys = {};

let _petDepositMutations = {};

const PET_DEPOSIT_LAST_MUTATION_KEY = 'petDepositLastMutation';
function rememberLastMutation(mutationId) {
  try { localStorage.setItem(PET_DEPOSIT_LAST_MUTATION_KEY, String(mutationId || '')); } catch {}
}
function lastUsedMutationId() {
  try { return localStorage.getItem(PET_DEPOSIT_LAST_MUTATION_KEY) || ''; } catch { return ''; }
}

function availableMutations() {
  return Array.isArray(state.mutations) ? state.mutations : [];
}
function findMutation(id) {
  return availableMutations().find(m => m.id === id) || null;
}

function mutationOverrideFor(petId, mutationId) {
  if (!petId || !mutationId) return null;
  return (state.mutationOverrides || {})[`${petId}:${mutationId}`] || null;
}

function mutationsForPet(petId) {
  return availableMutations().filter(m => mutationOverrideFor(petId, m.id)?.off !== true);
}

function depositMutationsForPet(petId) {
  return availableMutations().filter(m => {
    const ov = mutationOverrideFor(petId, m.id);
    if (!ov || ov.off === true) return false;
    const hasOwnPrice = Number(ov.price) > 0 || Number(ov.multiplier) >= 1;
    return Boolean(hasOwnPrice && ov.image);
  });
}

function mutatedItemValue(petId, baseValue, mutationId) {
  const base = Math.round(Number(baseValue) || 0);
  if (!mutationId) return base;
  const m = findMutation(mutationId);
  if (!m) return base;
  const ov = mutationOverrideFor(petId, mutationId);
  if (ov && ov.price) return Math.max(1, Math.round(ov.price));
  const mult = (ov && ov.multiplier) ? Number(ov.multiplier) : (Number(m.multiplier) || 1);
  return Math.max(1, Math.round(base * mult));
}

function applyMutationToItem(base, mutationId) {
  if (!base || !mutationId) return base || null;
  const m = findMutation(mutationId);
  if (!m) return base;
  return {
    ...base,
    value: mutatedItemValue(base.id, base.value, mutationId),
    name: `${base.name} [${m.name}]`,
    baseName: base.name,
    image: mutationVariantImage(base.id, mutationId) || base.image || '',
    mutationId, mutationName: m.name, mutationGlow: m.glow || '',
    mutationIcon: m.image || '',
  };
}

function lootRowItem(entry) {
  if (!entry) return null;
  const base = state.brainrotMap.get(entry.id);
  return base ? applyMutationToItem(base, entry.mutationId) : null;
}

function lootRowKey(entry) {
  if (!entry) return '';
  const mut = String((entry && entry.mutationId) || '').trim();
  return mut ? `${entry.id}:${mut}` : String(entry.id || '');
}

function mutationIconImage(mutationId) {
  return findMutation(mutationId)?.image || '';
}

function mutationVariantImage(petId, mutationId) {
  const ov = mutationOverrideFor(petId, mutationId);
  if (ov && ov.image) return ov.image;
  return findMutation(mutationId)?.image || '';
}

function petVariantArt(petId, mutationId) {
  const ov = mutationOverrideFor(petId, mutationId);
  return (ov && ov.image) ? ov.image : '';
}

function itemCardName(item) {
  return String(item?.baseName || item?.name || '');
}

function mutationBadgeHtml(item, extraClass = '') {
  const mutationId = item?.mutationId;
  if (!mutationId) return '';
  const icon = item.mutationIcon || findMutation(mutationId)?.image || '';
  const title = item.mutationName || findMutation(mutationId)?.name || '';
  if (!icon) return '';
  return `<span class="mut-badge${extraClass ? ' ' + extraClass : ''}" title="${escAttr(title)}"><img src="${escAttr(icon)}" alt="${escAttr(title)}" loading="lazy"></span>`;
}

function petDepositRows(petId) {
  const total = _petDepositQtys[petId] || 0;
  let rows = Array.isArray(_petDepositMutations[petId]) ? _petDepositMutations[petId] : [];
  rows = rows.filter(r => r && r.qty > 0);
  let sum = rows.reduce((acc, r) => acc + r.qty, 0);

  if (!rows.length && total > 0) rows = [{ mutationId: null, qty: total }];
  else if (sum < total) {
    const plain = rows.find(r => !r.mutationId);
    if (plain) plain.qty += total - sum;
    else rows.push({ mutationId: null, qty: total - sum });
  } else if (sum > total) {
    let excess = sum - total;
    for (let i = rows.length - 1; i >= 0 && excess > 0; i--) {
      const take = Math.min(rows[i].qty, excess);
      rows[i].qty -= take;
      excess -= take;
    }
    rows = rows.filter(r => r.qty > 0);
  }

  if (total <= 0) { delete _petDepositMutations[petId]; return []; }
  _petDepositMutations[petId] = rows;
  return rows;
}

function petDepositUnitWithMutation(br, mutationId) {
  const base = petDepositDisplayUnitValue(br.id, br.value);
  if (!mutationId) return base;
  const ov = mutationOverrideFor(br.id, mutationId);
  if (!depositMutationsForPet(br.id).some(m => m.id === mutationId)) return base;
  if (ov && ov.price) return Math.round(ov.price);
  const m = findMutation(mutationId);
  const mult = (ov && ov.multiplier) ? Number(ov.multiplier) : (m ? Number(m.multiplier) || 1 : 1);
  return Math.round(base * mult);
}
let _petDepositBrainrots = [];
let _petDepositFilterSearch = '';
let _petDepositFilterMin = '';
let _petDepositFilterMax = '';
let _petDepositFilterSort = 'asc';
let _petDepositSpecialOffers = new Map();

async function fetchPetDepositSpecialOffers() {
  try {
    const data = await api('/api/deposit/special-offers');
    _petDepositSpecialOffers = new Map((data.offers || []).map(o => [o.itemId, o]));
  } catch {
    _petDepositSpecialOffers = new Map();
  }
}

function closeDepositRulesModal() {
  const modal = document.getElementById('depositRulesModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function updateDepositRulesWagerLine() {
  const el = document.getElementById('depositRulesWagerLine');
  if (!el) return;
  const cfg = state.wagerConfig || {};
  if (!cfg.enabled) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const mult = Math.max(1, Number(cfg.multiplier) || 5);
  el.textContent = `На любой депозит распространяется отыгрыш ×${mult} от зачисленной суммы — брейнроты не исключение.`;
}

function checkDepositRulesAck() {
  const modal = document.getElementById('depositRulesModal');
  if (!modal || state.user?.depositRulesAckedAt) return true;
  updateDepositRulesWagerLine();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  return false;
}

function bindDepositRulesModal() {
  if (window.__depositRulesModalBound) return;
  window.__depositRulesModalBound = true;
  const checkbox = document.getElementById('depositRulesAgreeCheckbox');
  const continueBtn = document.getElementById('depositRulesContinueBtn');
  if (checkbox && continueBtn) {
    checkbox.addEventListener('change', () => { continueBtn.disabled = !checkbox.checked; });
  }
  bindSafe(document.getElementById('depositRulesCloseBtn'), 'click', () => {
    closeDepositModal();
  });
  bindSafe(continueBtn, 'click', async () => {
    if (!checkbox?.checked) return;
    continueBtn.disabled = true;
    try {
      const data = await api('/api/deposit-rules/ack', { method: 'POST' });
      if (data.user) applyUserUpdate(data.user);
    } catch (e) {
      showToast(e.message || 'Не удалось сохранить согласие');
      continueBtn.disabled = false;
      return;
    }
    closeDepositRulesModal();
    openPetDepositPanel();
  });
}

async function openPetDepositPanel() {
  bindDepositRulesModal();
  if (!checkDepositRulesAck()) return;
  await fetchPetDepositSpecialOffers();
  _petDepositQtys = {};
  _petDepositMutations = {};
  _petDepositFilterSearch = '';
  _petDepositFilterMin = '';
  _petDepositFilterMax = '';
  _petDepositFilterSort = 'asc';
  const searchEl = document.getElementById('petDepositSearch');
  const minEl    = document.getElementById('petDepositMinPrice');
  const maxEl    = document.getElementById('petDepositMaxPrice');
  const sortToggle = document.getElementById('petDepositSortToggle');
  if (searchEl) { searchEl.value = ''; searchEl.oninput = () => { _petDepositFilterSearch = searchEl.value; _renderPetDepositCards(); }; }
  if (minEl)    { minEl.value = '';    minEl.oninput    = () => { _petDepositFilterMin = minEl.value;    _renderPetDepositCards(); }; }
  if (maxEl)    { maxEl.value = '';    maxEl.oninput    = () => { _petDepositFilterMax = maxEl.value;    _renderPetDepositCards(); }; }
  if (sortToggle) {
    sortToggle.querySelectorAll('.pet-sort-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.sort === _petDepositFilterSort);
      btn.onclick = () => {
        sortToggle.querySelectorAll('.pet-sort-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        _petDepositFilterSort = btn.dataset.sort;
        _renderPetDepositCards();
      };
    });
  }
  renderPetDepositGrid();
  bindPetDepositForm();
  showPetDepositStep(1);
  updatePetDepositNextState();
  resumeActivePetDeposit();
}

function closePetDepositPanel() {
  _petDepositQtys = {};
  _petDepositMutations = {};
  _petDepositFilterSearch = '';
  _petDepositFilterMin = '';
  _petDepositFilterMax = '';
  _petDepositFilterSort = 'asc';
  const statusEl = document.getElementById('petDepositStatus');
  if (statusEl) { statusEl.className = 'pet-deposit-status hidden'; statusEl.textContent = ''; }
  const infoBox = document.getElementById('petDepositSelectedInfo');
  if (infoBox) { infoBox.classList.add('hidden'); infoBox.innerHTML = ''; }
  const submitBtn = document.getElementById('petDepositSubmitBtn');
  if (submitBtn) submitBtn.disabled = true;
  const nicknameInput = document.getElementById('petDepositNickname');
  if (nicknameInput) nicknameInput.value = '';
  const promoInput = document.getElementById('petDepositPromo');
  if (promoInput) promoInput.value = '';
  const promoHint = document.getElementById('petDepositPromoHint');
  if (promoHint) { promoHint.className = 'pet-deposit-promo-hint hidden'; promoHint.textContent = ''; }
  window.__petDepositFormBound = false;
}

function _getFilteredPetBrainrots() {
  const q = _petDepositFilterSearch.toLowerCase().trim();
  const minV = _petDepositFilterMin !== '' ? Number(_petDepositFilterMin) : -Infinity;
  const maxV = _petDepositFilterMax !== '' ? Number(_petDepositFilterMax) : Infinity;
  let list = _petDepositBrainrots.filter(br => {
    if (q && !br.name.toLowerCase().includes(q)) return false;
    const v = petDepositDisplayUnitValue(br.id, br.value);
    if (v < minV || v > maxV) return false;
    return true;
  });
  if (_petDepositFilterSort === 'asc') list = [...list].sort((a, b) => petDepositDisplayUnitValue(a.id, a.value) - petDepositDisplayUnitValue(b.id, b.value));
  else if (_petDepositFilterSort === 'desc') list = [...list].sort((a, b) => petDepositDisplayUnitValue(b.id, b.value) - petDepositDisplayUnitValue(a.id, a.value));
  list = [...list].sort((a, b) => (_petDepositSpecialOffers.has(b.id) ? 1 : 0) - (_petDepositSpecialOffers.has(a.id) ? 1 : 0));
  return list;
}

function _buildPetDepositCategoryPool(cat) {
  const isGirsy = cat === 'girsy';
  const allBrainrots = (Array.isArray(state.brainrots) ? state.brainrots : [])
    .filter(b => isGirsy ? b.category === 'girsy' : (b.category || 'brainrot') !== 'girsy');
  const poolIds = new Set((isGirsy ? state.brainrotPool?.girsy?.ids : state.brainrotPool?.deposit?.ids) || []);
  const pooled = allBrainrots.filter(b =>
    (Number(b.value) > 0)
    && String(b.image || '').trim()
    && (poolIds.has(b.id) || _petDepositSpecialOffers.has(b.id)));
  return pooled;
}

function _findPetDepositItemById(id) {
  const inActive = _petDepositBrainrots.find(b => b.id === id);
  if (inActive) return inActive;
  const otherCat = _petDepositActiveCategory === 'girsy' ? 'pets' : 'girsy';
  return _buildPetDepositCategoryPool(otherCat).find(b => b.id === id) || null;
}

function renderPetDepositGrid() {
  const grid = document.getElementById('petDepositGrid');
  if (!grid) return;
  const isGirsy = _petDepositActiveCategory === 'girsy';
  const allBrainrots = (Array.isArray(state.brainrots) ? state.brainrots : [])
    .filter(b => isGirsy ? b.category === 'girsy' : (b.category || 'brainrot') !== 'girsy');
  if (!allBrainrots.length) {
    grid.innerHTML = '<div class="muted" style="padding:8px">Загрузка...</div>';
    return;
  }
  _petDepositBrainrots = _buildPetDepositCategoryPool(_petDepositActiveCategory);
  if (!_petDepositBrainrots.length) {
    grid.innerHTML = isGirsy
      ? '<div class="muted" style="padding:8px 0">Список гирс для депозита пока пуст — обратитесь к администратору.</div>'
      : '<div class="muted" style="padding:8px 0">Список брейнротов для депозита пока пуст — обратитесь к администратору.</div>';
    return;
  }
  _renderPetDepositCards();
}

const PET_DEPOSIT_RATE = 1;

const PET_DEPOSIT_MIN_TOTAL = 40;
const PET_DEPOSIT_PAIR_BELOW = 50;
function _petDepositMinQty(brainrotId) {
  const item = _findPetDepositItemById(brainrotId);
  if (!item) return 1;
  const manual = Number((state.petDepositMinQty || {})[item.id]);
  if (Number.isFinite(manual) && manual >= 1) return Math.max(1, manual);
  if (String(item.category || '') === 'girsy') return 1;
  return (Number(item.value) || 0) < PET_DEPOSIT_PAIR_BELOW ? 2 : 1;
}
function _petDepositNeedsPair(brainrotId) {
  return _petDepositMinQty(brainrotId) > 1;
}
function _petDepositSelectedBase() {
  return Object.entries(_petDepositQtys).reduce((sum, [id, qty]) => {
    if (!(qty > 0)) return sum;
    const item = _findPetDepositItemById(id);
    if (!item) return sum;
    return sum + petDepositDisplayUnitValue(id, item.value) * qty;
  }, 0);
}

function petDepositUnitValue(value) {
  return Math.round((Number(value) || 0) * PET_DEPOSIT_RATE);
}

function petDepositDisplayUnitValue(brainrotId, value) {
  const specialOffer = _petDepositSpecialOffers.get(brainrotId);
  return specialOffer && specialOffer.overridePrice != null
    ? Math.round(specialOffer.overridePrice)
    : petDepositUnitValue(value);
}

function _renderPetDepositCards() {
  const grid = document.getElementById('petDepositGrid');
  if (!grid) return;
  const filtered = _getFilteredPetBrainrots();
  grid.innerHTML = '';
  if (!filtered.length) {
    grid.innerHTML = '<div class="pet-deposit-no-results">Ничего не найдено</div>';
    return;
  }
  filtered.forEach(br => {
    const card = document.createElement('div');
    const specialOffer = _petDepositSpecialOffers.get(br.id);
    card.className = 'pet-deposit-card'
      + (specialOffer ? ' is-lux' : luxClass({ value: petDepositDisplayUnitValue(br.id, br.value) }));
    card.dataset.petId = br.id;
    if (_petDepositQtys[br.id] > 0) card.classList.add('is-selected');
    const iconHtml = br.image
      ? `<img class="pet-deposit-card-img" src="${escAttr(br.image)}" alt="" loading="lazy" decoding="async">`
      : `<div class="pet-deposit-card-emoji">${escHtml(br.emoji || '🐾')}</div>`;
    const badgeHtml = specialOffer
      ? `<div class="pet-deposit-special-badge">🔥 Осталось ${specialOffer.remaining}</div>`
      : '';
    card.innerHTML = `
      ${badgeHtml}
      ${iconHtml}
      <div class="pet-deposit-card-name">${escHtml(br.name)}</div>
      <div class="pet-deposit-card-value">${escHtml(String(petDepositDisplayUnitValue(br.id, br.value)))} TOK${_petDepositMinQty(br.id) > 1 ? ` <span class="muted" style="font-size:11px">· от ${_petDepositMinQty(br.id)} шт</span>` : ''}</div>
      <div class="pet-deposit-qty-row">
        <button type="button" class="pet-qty-btn pet-qty-minus" data-pet-id="${escAttr(br.id)}">−</button>
        <span class="pet-qty-num" data-pet-id="${escAttr(br.id)}">${_petDepositQtys[br.id] || 0}</span>
        <button type="button" class="pet-qty-btn pet-qty-plus" data-pet-id="${escAttr(br.id)}">+</button>
      </div>`;
    if (specialOffer) card.classList.add('is-special-offer');
    const minusBtn = card.querySelector('.pet-qty-minus');
    const plusBtn  = card.querySelector('.pet-qty-plus');
    bindSafe(minusBtn, 'click', (e) => { e.stopPropagation(); changePetDepositQty(br.id, -1); });
    bindSafe(plusBtn,  'click', (e) => { e.stopPropagation(); changePetDepositQty(br.id, +1); });
    grid.appendChild(card);
  });
}

function changePetDepositQty(brainrotId, delta) {
  const current = _petDepositQtys[brainrotId] || 0;
  let next = Math.max(0, Math.min(99, current + delta));
  if (_petDepositNeedsPair(brainrotId)) {
    if (delta > 0 && current === 0) next = 2;
    else if (delta < 0 && current === 2) next = 0;
  }
  if (delta > 0) {
    const otherTotal = Object.entries(_petDepositQtys).reduce((s, [id, q]) => id === brainrotId ? s : s + q, 0);
    const maxForThis = Math.max(0, PET_DEPOSIT_MAX_ITEMS - otherTotal);
    if (next > maxForThis) {
      if (maxForThis <= current) { showToast(`Максимум ${PET_DEPOSIT_MAX_ITEMS} брейнротов за один депозит`); return; }
      next = maxForThis;
    }
    const specialOffer = _petDepositSpecialOffers.get(brainrotId);
    if (specialOffer && next > specialOffer.remaining) {
      if (specialOffer.remaining <= current) { showToast('По этому предложению больше не осталось'); return; }
      next = specialOffer.remaining;
    }
  }
  const minQty = _petDepositMinQty(brainrotId);
  if (next > 0 && next < minQty) {
    if (next > current) next = minQty;
    else next = 0;
  }
  if (next > 0 && next < minQty) {
    showToast(`Этот брейнрот принимаем только от ${minQty} шт`);
    return;
  }
  if (next === 0) {
    delete _petDepositQtys[brainrotId];
  } else {
    _petDepositQtys[brainrotId] = next;
  }
  const numEl = document.querySelector(`.pet-qty-num[data-pet-id="${CSS.escape(brainrotId)}"]`);
  if (numEl) numEl.textContent = String(next);
  const card = document.querySelector(`#petDepositGrid .pet-deposit-card[data-pet-id="${CSS.escape(brainrotId)}"]`);
  if (card) card.classList.toggle('is-selected', next > 0);
  renderPetDepositSelectedInfo();
  updatePetDepositSubmitState();
}

function renderPetDepositSelectedInfo() {
  const infoBox = document.getElementById('petDepositSelectedInfo');
  if (!infoBox) return;
  const selected = Object.entries(_petDepositQtys).filter(([, q]) => q > 0);
  if (!selected.length) {
    infoBox.classList.add('hidden');
    infoBox.innerHTML = '';
    return;
  }
  const code = String(document.getElementById('petDepositPromo')?.value || '').trim().toUpperCase();
  const bonus = resolveDepositPromoBonus(code);
  let totalBase = 0;
  let totalCredited = 0;
  const muts = selected.some(([id]) => depositMutationsForPet(id).length) ? availableMutations() : [];
  const rows = selected.map(([id, qty]) => {
    const br = _findPetDepositItemById(id);
    if (!br) return '';
    const rowIcon = (mutationId) => {
      const src = (mutationId ? petVariantArt(br.id, mutationId) : '') || br.image;
      return src
        ? `<img class="pet-sel-img" src="${escAttr(src)}" alt="" loading="lazy" decoding="async">`
        : `<span class="pet-sel-emoji">${escHtml(br.emoji || '🐾')}</span>`;
    };
    const rowName = (mutationId) => {
      const m = mutationId ? findMutation(mutationId) : null;
      return m ? `${br.name} [${m.name}]` : br.name;
    };
    const icon = rowIcon(null);

    if (!depositMutationsForPet(br.id).length) {
      const unitBase     = petDepositDisplayUnitValue(br.id, br.value);
      const unitCredited = bonus > 0 ? Math.round(unitBase * (1 + bonus / 100)) : unitBase;
      totalBase     += unitBase * qty;
      totalCredited += unitCredited * qty;
      return `<div class="pet-sel-row">${icon}<span class="pet-sel-name">${escHtml(br.name)}</span><span class="pet-sel-qty">×${qty}</span><span class="pet-sel-val">${unitCredited} TOK</span></div>`;
    }

    return petDepositRows(br.id).map((row, rowIndex) => {
      const unitBase     = petDepositUnitWithMutation(br, row.mutationId);
      const unitCredited = bonus > 0 ? Math.round(unitBase * (1 + bonus / 100)) : unitBase;
      totalBase     += unitBase * row.qty;
      totalCredited += unitCredited * row.qty;

      const m = findMutation(row.mutationId);
      const chip = m
        ? `<button type="button" class="pet-sel-mut is-set" data-mut-pet="${escAttr(br.id)}" data-mut-row="${rowIndex}" style="--mut-glow:${escAttr(m.glow || '#8b96a6')}">${m.image ? `<img class="pet-sel-mut-img" src="${escAttr(m.image)}" alt="">` : ''}${escHtml(m.name)} ×${(() => { const b = petDepositDisplayUnitValue(br.id, br.value); return b ? Math.round((unitBase / b) * 100) / 100 : m.multiplier; })()}</button>`
        : `<button type="button" class="pet-sel-mut" data-mut-pet="${escAttr(br.id)}" data-mut-row="${rowIndex}">✨ Указать мутацию</button>`;

      const splitBtn = row.qty > 1
        ? `<button type="button" class="pet-sel-split" data-split-pet="${escAttr(br.id)}" data-split-row="${rowIndex}" title="Указать разные мутации">разделить</button>`
        : '';

      return `<div class="pet-sel-row" data-pet-row="${escAttr(br.id)}:${rowIndex}">
        <div class="pet-sel-main">
          ${rowIcon(row.mutationId)}<span class="pet-sel-name">${escHtml(rowName(row.mutationId))}</span>
          <span class="pet-sel-qty">×${row.qty}</span>
          <span class="pet-sel-val">${unitCredited * row.qty} TOK</span>
        </div>
        <div class="pet-sel-actions">${chip}${splitBtn}</div>
      </div>`;
    }).join('');
  }).join('');
  const totalLine = bonus > 0
    ? `<div class="pet-sel-total">Итого: ${totalCredited} TOK <span class="pet-sel-bonus">(+${bonus}%)</span></div>`
    : `<div class="pet-sel-total">Итого: ${totalBase} TOK</div>`;
  const hintHtml = (muts.length && !hasEverPickedMutation())
    ? `<div class="pet-sel-hint">Есть мутация? Нажми <b>«Указать мутацию»</b> у брейнрота — цена вырастет.</div>`
    : '';

  infoBox.innerHTML = `<div class="pet-sel-header">Выбрано:</div>${hintHtml}${rows}${totalLine}`;
  infoBox.classList.remove('hidden');
  bindPetDepositMutationControls(infoBox);
}

let _openMutationPicker = null;

const PET_DEPOSIT_MUT_SEEN_KEY = 'petDepositMutationUsed';
function hasEverPickedMutation() {
  try { return localStorage.getItem(PET_DEPOSIT_MUT_SEEN_KEY) === '1'; } catch { return false; }
}
function markMutationPicked() {
  try { localStorage.setItem(PET_DEPOSIT_MUT_SEEN_KEY, '1'); } catch {}
}

function bindPetDepositMutationControls(infoBox) {
  infoBox.querySelectorAll('.pet-sel-mut').forEach((btn) => {
    bindSafe(btn, 'click', (e) => {
      e.stopPropagation();
      const petId = btn.dataset.mutPet;
      const rowIndex = Number(btn.dataset.mutRow);
      const key = `${petId}:${rowIndex}`;
      if (_openMutationPicker === key) { _openMutationPicker = null; renderPetDepositSelectedInfo(); return; }
      _openMutationPicker = key;
      openMutationPicker(btn, petId, rowIndex);
    });
  });

  infoBox.querySelectorAll('.pet-sel-split').forEach((btn) => {
    bindSafe(btn, 'click', (e) => {
      e.stopPropagation();
      splitPetDepositRow(btn.dataset.splitPet, Number(btn.dataset.splitRow));
    });
  });
}

function openMutationPicker(anchorBtn, petId, rowIndex) {
  document.querySelectorAll('.pet-mut-picker').forEach(el => el.remove());
  const row = anchorBtn.closest('.pet-sel-row');
  if (!row) return;

  const rows = petDepositRows(petId);
  const current = rows[rowIndex]?.mutationId || null;
  const last = lastUsedMutationId();
  const muts = depositMutationsForPet(petId);
  if (!muts.length) return;

  const ordered = [...muts].sort((a, b) => (b.id === last ? 1 : 0) - (a.id === last ? 1 : 0));

  const br = _findPetDepositItemById(petId);
  const baseUnit = br ? petDepositDisplayUnitValue(br.id, br.value) : 0;
  const shownMult = (m) => {
    if (!br) return m.multiplier;
    const unit = petDepositUnitWithMutation(br, m.id);
    if (!baseUnit) return m.multiplier;
    const k = unit / baseUnit;
    return Math.round(k * 100) / 100;
  };

  const picker = document.createElement('div');
  picker.className = 'pet-mut-picker';
  picker.innerHTML = `
    <button type="button" class="pet-mut-opt${!current ? ' is-current' : ''}" data-mut="">
      <span class="pet-mut-none">без мутации</span>
    </button>
    ${ordered.map(m => {
      const variant = petVariantArt(petId, m.id);
      const cube = (!variant && m.image) ? `<img class="pet-mut-opt-cube" src="${escAttr(m.image)}" alt="" loading="lazy">` : '';
      const shownArt = variant || (br && br.image) || '';
      const preview = shownArt ? `<img class="pet-mut-opt-img" src="${escAttr(shownArt)}" alt="" loading="lazy">` : '';
      return `
      <button type="button" class="pet-mut-opt${current === m.id ? ' is-current' : ''}${m.id === last ? ' is-last' : ''}"
              data-mut="${escAttr(m.id)}" style="--mut-glow:${escAttr(m.glow || '#8b96a6')}">
        ${cube}${preview}
        <span class="pet-mut-opt-name">${escHtml(m.name)}</span>
        <span class="pet-mut-opt-x">×${shownMult(m)}</span>
        ${m.id === last ? '<span class="pet-mut-opt-last">как в прошлый раз</span>' : ''}
      </button>`;
    }).join('')}`;

  row.insertAdjacentElement('afterend', picker);

  picker.querySelectorAll('.pet-mut-opt').forEach((opt) => {
    bindSafe(opt, 'click', (e) => {
      e.stopPropagation();
      applyMutationToRow(petId, rowIndex, opt.dataset.mut || null);
    });
  });
}

function applyMutationToRow(petId, rowIndex, mutationId) {
  const rows = petDepositRows(petId);
  if (!rows[rowIndex]) return;
  rows[rowIndex].mutationId = mutationId;

  const merged = [];
  for (const r of rows) {
    const same = merged.find(x => (x.mutationId || null) === (r.mutationId || null));
    if (same) same.qty += r.qty;
    else merged.push({ ...r });
  }
  _petDepositMutations[petId] = merged;

  if (mutationId) { rememberLastMutation(mutationId); markMutationPicked(); }
  _openMutationPicker = null;
  renderPetDepositSelectedInfo();
}

function splitPetDepositRow(petId, rowIndex) {
  const rows = petDepositRows(petId);
  const row = rows[rowIndex];
  if (!row || row.qty < 2) return;
  row.qty -= 1;
  rows.splice(rowIndex + 1, 0, { mutationId: null, qty: 1 });
  _petDepositMutations[petId] = rows;
  _openMutationPicker = null;
  renderPetDepositSelectedInfo();
}

function showPetDepositStep(step) {
  const step1 = document.getElementById('petDepositStep1');
  const step2 = document.getElementById('petDepositStep2');
  if (step1) step1.classList.toggle('hidden', step !== 1);
  if (step2) step2.classList.toggle('hidden', step !== 2);
}

function updatePetDepositNextState() {
  const btn    = document.getElementById('petDepositNextBtn');
  const hint   = document.getElementById('petDepositNextHint');
  const hasAny = Object.values(_petDepositQtys).some(q => q > 0);
  if (btn) btn.disabled = !hasAny;
  if (hint) hint.textContent = hasAny ? '' : 'Выбери хотя бы одного брейнрота выше.';
}

function updatePetDepositSubmitState() {
  const btn      = document.getElementById('petDepositSubmitBtn');
  const hint     = document.getElementById('petDepositSubmitHint');
  const nickname = (document.getElementById('petDepositNickname')?.value || '').trim();
  const hasAny   = Object.values(_petDepositQtys).some(q => q > 0);
  const base     = _petDepositSelectedBase();
  const enough   = base >= PET_DEPOSIT_MIN_TOTAL;
  if (btn) btn.disabled = !(hasAny && enough && nickname.length >= 2);
  if (hint) {
    hint.textContent = !hasAny
      ? 'Выбери хотя бы одного брейнрота.'
      : (!enough
        ? `Минимальный депозит — ${PET_DEPOSIT_MIN_TOTAL} TOK. Набрано ${base} TOK.`
        : (nickname.length < 2 ? 'Введи свой ник в игре (минимум 2 символа).' : ''));
  }
  updatePetDepositNextState();
  updatePetDepositPromoHint();
}

function updatePetDepositPromoHint() {
  const hintEl = document.getElementById('petDepositPromoHint');
  if (!hintEl) return;
  const code = String(document.getElementById('petDepositPromo')?.value || '').trim().toUpperCase();
  if (!code) {
    hintEl.className = 'pet-deposit-promo-hint hidden';
    hintEl.textContent = '';
    renderPetDepositSelectedInfo();
    return;
  }
  const rotatingPromo = state.promo && String(state.promo.code || '').toUpperCase() === code ? state.promo : null;
  if (rotatingPromo) {
    hintEl.className = 'pet-deposit-promo-hint is-valid';
    hintEl.textContent = `+${rotatingPromo.bonus}% бонус применён`;
    hintEl.classList.remove('hidden');
    renderPetDepositSelectedInfo();
    return;
  }
  hintEl.className = 'pet-deposit-promo-hint';
  hintEl.textContent = 'Проверяем код...';
  hintEl.classList.remove('hidden');
  renderPetDepositSelectedInfo();
  checkDepositPromoCodeLive(code, (result) => {
    const currentCode = String(document.getElementById('petDepositPromo')?.value || '').trim().toUpperCase();
    if (currentCode !== code) return;
    if (!result) return;
    if (result.valid) {
      hintEl.className = 'pet-deposit-promo-hint is-valid';
      hintEl.textContent = `+${result.bonus}% бонус применён`;
    } else {
      hintEl.className = 'pet-deposit-promo-hint is-invalid';
      hintEl.textContent = result.isSelf ? 'Это твой собственный код — на себя не действует' : 'Промокод не найден или истёк';
    }
    renderPetDepositSelectedInfo();
  });
}

function blockCyrillicInInput(el) {
  if (!el || el.dataset.noCyrillicBound) return;
  el.dataset.noCyrillicBound = '1';
  el.addEventListener('input', () => {
    const cleaned = el.value.replace(/[Ѐ-ӿԀ-ԯ]/g, '');
    if (cleaned !== el.value) el.value = cleaned;
  });
}

function bindPetDepositForm() {
  if (window.__petDepositFormBound) return;
  window.__petDepositFormBound = true;

  ['petDepositTradeModal', 'petDepositQueueNoticeModal', 'petDepositQueueWaitModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentElement !== document.body) document.body.appendChild(el);
  });

  const promoInput     = document.getElementById('petDepositPromo');
  const submitBtn      = document.getElementById('petDepositSubmitBtn');
  const nicknameInputEl = document.getElementById('petDepositNickname');
  const nextBtn        = document.getElementById('petDepositNextBtn');
  const backBtn        = document.getElementById('petDepositBackBtn');

  blockCyrillicInInput(nicknameInputEl);
  blockCyrillicInInput(promoInput);
  bindSafe(promoInput, 'input', updatePetDepositPromoHint);
  bindSafe(nicknameInputEl, 'input', updatePetDepositSubmitState);

  bindSafe(nextBtn, 'click', () => {
    const hasAny = Object.values(_petDepositQtys).some(q => q > 0);
    if (!hasAny) { showToast('Выбери хотя бы одного брейнрота'); return; }
    showPetDepositStep(2);
    nicknameInputEl?.focus();
  });

  bindSafe(backBtn, 'click', () => {
    showPetDepositStep(1);
  });

  bindSafe(submitBtn, 'click', async () => {
    const promoCode = String(promoInput?.value || '').trim().toUpperCase();
    const items = Object.entries(_petDepositQtys)
      .filter(([, q]) => q > 0)
      .flatMap(([petId, qty]) => {
        const rows = petDepositRows(petId);
        if (!rows.length) return [{ petId, qty }];
        return rows.map(r => ({ petId, qty: r.qty, mutationId: r.mutationId || undefined }));
      });
    if (!items.length) { showToast('Выбери хотя бы одного брейнрота'); return; }

    const nicknameInput = document.getElementById('petDepositNickname');
    const gameNickname = nicknameInput?.value?.trim() || 'Player';
    const payload = { items, gameNickname, promoCode: promoCode || undefined };

    submitBtn.disabled = true;
    const statusEl = document.getElementById('petDepositStatus');
    if (statusEl) { statusEl.textContent = 'Проверка доступности...'; statusEl.className = 'pet-deposit-status'; statusEl.classList.remove('hidden'); }

    try {
      const avail = await api('/api/pet-deposit/get-account');
      if (avail.ok && avail.isFree === false) {
        if (statusEl) statusEl.classList.add('hidden');
        submitBtn.disabled = false;
        showPetDepositQueueNotice(avail.estimatedWaitMs || 0, payload);
        return;
      }

      if (statusEl) statusEl.textContent = 'Отправка...';
      const data = await api('/api/pet-deposit/request', { method: 'POST', body: JSON.stringify(payload) });
      if (data.request?.id) pollPetDepositStatus(data.request.id);

      resetPetDepositForm();

      if (data.inQueue) {
        showPetDepositQueueWaitModal(data.request.id, data.estimatedWaitMs || 0);
      } else {
        showPetDepositTradeModal(data.request);
      }
    } catch (err) {
      if (statusEl) {
        statusEl.className   = 'pet-deposit-status is-error';
        statusEl.textContent = err.message || 'Ошибка при отправке';
      }
      submitBtn.disabled = false;
    }
  });
}

function resetPetDepositForm() {
  const promoInput = document.getElementById('petDepositPromo');
  if (promoInput) promoInput.value = '';
  _petDepositQtys = {};
  _petDepositMutations = {};
  document.querySelectorAll('#petDepositGrid .pet-deposit-card').forEach(c => c.classList.remove('is-selected'));
  document.querySelectorAll('#petDepositGrid .pet-qty-num').forEach(el => el.textContent = '0');
  const infoBox = document.getElementById('petDepositSelectedInfo');
  if (infoBox) { infoBox.classList.add('hidden'); infoBox.innerHTML = ''; }
  const promoHint = document.getElementById('petDepositPromoHint');
  if (promoHint) { promoHint.className = 'pet-deposit-promo-hint hidden'; promoHint.textContent = ''; }
  const submitBtn = document.getElementById('petDepositSubmitBtn');
  if (submitBtn) submitBtn.disabled = false;
  const statusEl = document.getElementById('petDepositStatus');
  if (statusEl) statusEl.classList.add('hidden');
  showPetDepositStep(1);
  updatePetDepositNextState();
}

function formatQueueEta(ms) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function showPetDepositQueueNotice(estimatedWaitMs, payload) {
  const modal = document.getElementById('petDepositQueueNoticeModal');
  const etaEl = document.getElementById('petDepositQueueNoticeEta');
  const closeBtn = document.getElementById('petDepositQueueNoticeClose');
  const closeBtnFooter = document.getElementById('petDepositQueueNoticeCloseBtn');
  const joinBtn = document.getElementById('petDepositQueueJoinBtn');
  if (!modal) return;

  if (etaEl) etaEl.textContent = estimatedWaitMs > 0 ? `~${formatQueueEta(estimatedWaitMs)}` : 'меньше минуты';

  const closeModal = () => modal.classList.add('hidden');
  if (closeBtn) closeBtn.onclick = closeModal;
  if (closeBtnFooter) closeBtnFooter.onclick = closeModal;

  if (joinBtn) {
    joinBtn.onclick = async () => {
      joinBtn.disabled = true;
      const origText = joinBtn.textContent;
      joinBtn.textContent = 'Встаём в очередь...';
      try {
        const data = await api('/api/pet-deposit/request', { method: 'POST', body: JSON.stringify(payload) });
        if (data.request?.id) pollPetDepositStatus(data.request.id);
        closeModal();
        resetPetDepositForm();
        if (data.inQueue) {
          showPetDepositQueueWaitModal(data.request.id, data.estimatedWaitMs || 0);
        } else {
          showPetDepositTradeModal(data.request);
        }
      } catch (err) {
        showToast(err.message || 'Ошибка при постановке в очередь');
      } finally {
        joinBtn.disabled = false;
        joinBtn.textContent = origText;
      }
    };
  }

  modal.classList.remove('hidden');
}

let _petDepositQueueWaitState = null; 

function ensurePetDepositModalOnTop(modal) {
  if (!modal || modal.parentElement === document.body) return modal;
  document.body.appendChild(modal);
  return modal;
}

function stopPetDepositQueueWait() {
  if (_petDepositQueueWaitState) {
    clearInterval(_petDepositQueueWaitState.pollTimer);
    clearInterval(_petDepositQueueWaitState.tickTimer);
    _petDepositQueueWaitState = null;
  }
}

function showPetDepositQueueWaitModal(depositId, estimatedWaitMs) {
  const modal = ensurePetDepositModalOnTop(document.getElementById('petDepositQueueWaitModal'));
  const timerEl = document.getElementById('petDepositQueueWaitTimer');
  const ringFill = document.getElementById('petDepositQueueWaitRingFill');
  const statusEl = document.getElementById('petDepositQueueWaitStatus');
  let posEl = document.getElementById('petDepositQueuePosition');
  if (!posEl && statusEl) {
    posEl = document.createElement('div');
    posEl.id = 'petDepositQueuePosition';
    posEl.className = 'pet-queue-position';
    statusEl.insertAdjacentElement('afterend', posEl);
  }
  const minimizeBtn = document.getElementById('petDepositQueueWaitMinimizeBtn');
  const minimizeFooterBtn = document.getElementById('petDepositQueueWaitMinimizeFooterBtn');
  if (!modal) return;

  stopPetDepositQueueWait();

  const totalMs = Math.max(10000, estimatedWaitMs || 0); 
  const startedAt = Date.now();
  const RING_CIRCUMFERENCE = 326.7;

  const hide = () => modal.classList.add('hidden');
  if (minimizeBtn) minimizeBtn.onclick = hide;
  if (minimizeFooterBtn) minimizeFooterBtn.onclick = hide;

  const cancelBtn = document.getElementById('petDepositQueueWaitCancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = async () => {
      cancelBtn.disabled = true;
      try {
        await api(`/api/pet-deposit/${depositId}/cancel`, { method: 'POST' });
        stopPetDepositQueueWait();
        hide();
        showToast('Заявка отменена.');
      } catch (e) {
        showToast(e.message || 'Не удалось отменить заявку');
      } finally {
        cancelBtn.disabled = false;
      }
    };
  }

  const eta = { totalMs, startedAt };

  const tick = () => {
    const elapsed = Date.now() - eta.startedAt;
    const remaining = Math.max(0, eta.totalMs - elapsed);
    if (timerEl) timerEl.textContent = formatQueueEta(remaining);
    if (ringFill) {
      const frac = eta.totalMs > 0 ? Math.min(1, elapsed / eta.totalMs) : 1;
      ringFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * frac);
    }
    if (remaining <= 0 && statusEl && !statusEl.classList.contains('is-ready')) {
      statusEl.textContent = 'Ждём свободный аккаунт — очередь ещё идёт';
    }
  };
  tick();
  const tickTimer = setInterval(tick, 1000);

  const poll = async () => {
    try {
      const data = await api(`/api/pet-deposit/${depositId}/status`);
      const deposit = data.deposit;
      if (!deposit) return;
      if (deposit.tradeUsername) {
        if (statusEl) { statusEl.textContent = 'Аккаунт освободился!'; statusEl.classList.add('is-ready'); }
        stopPetDepositQueueWait();
        hide();
        showPetDepositTradeModal({ gameNickname: deposit.gameNickname, tradeUsername: deposit.tradeUsername });
      } else if (deposit.inQueue) {
        if (Number.isFinite(deposit.estimatedWaitMs)) {
          eta.totalMs = Math.max(1000, deposit.estimatedWaitMs);
          eta.startedAt = Date.now();
          tick();
        }
        if (posEl) {
          posEl.textContent = deposit.queuePosition
            ? `Ты ${deposit.queuePosition}-й в очереди${deposit.queueTotal ? ` из ${deposit.queueTotal}` : ''}`
            : '';
        }
      } else if (deposit.status === 'rejected') {
        stopPetDepositQueueWait();
        hide();
        showToast(`Заявка отклонена: ${deposit.petName || ''}`);
      }
    } catch {}
  };
  poll();
  const pollTimer = setInterval(poll, 3000);

  _petDepositQueueWaitState = { depositId, pollTimer, tickTimer, totalMs, startedAt };

  modal.classList.remove('hidden');
}

function friendlyPetDepositDeclineReason(reason) {
  const raw = String(reason || '').trim();
  if (!raw) return 'без указания причины';
  if (/^timeout_no_result$/i.test(raw)) return 'время на трейд вышло';
  if (raw === 'timeout' || /^timeout(_\d+min)?$/i.test(raw)) return 'истекло время ожидания — трейд не был отправлен вовремя';
  if (/^player[\s_]*cancell?ed$/i.test(raw)) return 'трейд был отменён в Рoблоксе';
  let m = raw.match(/^missing_items\s*\((\d+)\s*\/\s*(\d+)\)$/i);
  if (m) return `в трейде не хватало предметов — отправлено ${m[1]} из ${m[2]}`;
  if (/^missing_items$/i.test(raw)) return 'в трейде не хватало предметов';
  m = raw.match(/^too_many_items\s*\((\d+)\s*\/\s*(\d+)\)$/i);
  if (m) return `в трейде оказалось больше предметов, чем нужно — отправлено ${m[1]} вместо ${m[2]}`;
  if (/^too_many_items$/i.test(raw)) return 'в трейде оказалось больше предметов, чем нужно';
  return raw;
}

let _petDepositTradeTimerInterval = null;

function stopPetDepositTradeTimer() {
  if (_petDepositTradeTimerInterval) {
    clearInterval(_petDepositTradeTimerInterval);
    _petDepositTradeTimerInterval = null;
  }
}

function showPetDepositTradeModal(request) {
  if (!request) return;

  const modal = ensurePetDepositModalOnTop(document.getElementById('petDepositTradeModal'));
  const titleEl = document.getElementById('petDepositTradeModalTitle');
  const mainContent = document.getElementById('petDepositTradeMainContent');
  const timeoutContent = document.getElementById('petDepositTradeTimeoutContent');
  const successContent = document.getElementById('petDepositTradeSuccessContent');
  const botNickInput = document.getElementById('petDepositBotNickInput');
  const accountSpan = document.getElementById('petDepositTradeAccountSpan');
  const userNickInput = document.getElementById('petDepositUserNickInput');
  const copyBotBtn = document.getElementById('petDepositCopyBotBtn');
  const copyNickBtn = document.getElementById('petDepositCopyNickBtn');
  const closeBtn = document.getElementById('petDepositTradeModalClose');
  const closeBtnFooter = document.getElementById('petDepositTradeModalCloseBtn');
  const timerEl = document.getElementById('petDepositTradeTimer');

  if (!modal) {
    console.error('[showPetDepositTradeModal] Modal element not found');
    return;
  }

  const gameNickname = request.gameNickname || 'Player';

  const tradeUsername = request.tradeUsername || '@deposit_account_1';
  if (botNickInput) botNickInput.value = tradeUsername.replace(/^@/, '');
  if (accountSpan) accountSpan.textContent = tradeUsername;
  if (userNickInput) userNickInput.value = gameNickname;

  if (titleEl) titleEl.textContent = '📤 Отправьте трейд в Рoблокс';
  if (mainContent) mainContent.classList.remove('hidden');
  if (timeoutContent) timeoutContent.classList.add('hidden');
  if (successContent) successContent.classList.add('hidden');

  stopPetDepositTradeTimer();
  let timeLeft = 300; 

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
    stopPetDepositTradeTimer();
  };

  if (copyBotBtn) {
    copyBotBtn.onclick = () => {
      if (botNickInput) {
        botNickInput.select();
        document.execCommand('copy');
        const origText = copyBotBtn.textContent;
        copyBotBtn.textContent = '✓ Скопирован аккаунт!';
        setTimeout(() => {
          copyBotBtn.textContent = origText;
        }, 2000);
      }
    };
  }

  if (copyNickBtn) {
    copyNickBtn.onclick = () => {
      if (userNickInput) {
        userNickInput.select();
        document.execCommand('copy');
        const origText = copyNickBtn.textContent;
        copyNickBtn.textContent = '✓ Скопирован ник!';
        setTimeout(() => {
          copyNickBtn.textContent = origText;
        }, 2000);
      }
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (closeBtnFooter) closeBtnFooter.onclick = closeModal;

  const cancelBtn = document.getElementById('petDepositTradeCancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = async () => {
      if (!request.id) { closeModal(); return; }
      cancelBtn.disabled = true;
      try {
        await api(`/api/pet-deposit/${request.id}/cancel`, { method: 'POST' });
        if (activePetDepositStatusPoll) { clearInterval(activePetDepositStatusPoll); activePetDepositStatusPoll = null; }
        closeModal();
        showToast('Заявка отменена.');
      } catch (e) {
        showToast(e.message || 'Не удалось отменить заявку');
      } finally {
        cancelBtn.disabled = false;
      }
    };
  }

  modal.classList.remove('hidden');
  console.log('[showPetDepositTradeModal] Modal shown, tradeUsername:', tradeUsername);

  _petDepositTradeTimerInterval = setInterval(() => {
    const minutes = Math.max(0, Math.floor(timeLeft / 60));
    const seconds = Math.max(0, timeLeft % 60);
    if (timerEl) {
      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    timeLeft--;
    if (timeLeft < 0) {
      stopPetDepositTradeTimer();
      if (timerEl) timerEl.textContent = 'Проверяем статус...';
    }
  }, 1000);
}

function showPetDepositDeclinedState(reason) {
  const modal = ensurePetDepositModalOnTop(document.getElementById('petDepositTradeModal'));
  const titleEl = document.getElementById('petDepositTradeModalTitle');
  const mainContent = document.getElementById('petDepositTradeMainContent');
  const timeoutContent = document.getElementById('petDepositTradeTimeoutContent');
  const textEl = document.getElementById('petDepositTradeTimeoutText');
  if (!modal) return;

  stopPetDepositTradeTimer();
  if (titleEl) titleEl.textContent = '❌ Трейд не удался';
  if (mainContent) mainContent.classList.add('hidden');
  if (timeoutContent) timeoutContent.classList.remove('hidden');
  if (textEl) textEl.textContent = `Причина: ${friendlyPetDepositDeclineReason(reason)}. Заявка отменена — попробуй создать её заново.`;
  modal.classList.remove('hidden');
}

function showPetDepositApprovedState(deposit) {
  const modal = ensurePetDepositModalOnTop(document.getElementById('petDepositTradeModal'));
  const titleEl = document.getElementById('petDepositTradeModalTitle');
  const mainContent = document.getElementById('petDepositTradeMainContent');
  const timeoutContent = document.getElementById('petDepositTradeTimeoutContent');
  const successContent = document.getElementById('petDepositTradeSuccessContent');
  const textEl = document.getElementById('petDepositTradeSuccessText');
  const amountEl = document.getElementById('petDepositTradeSuccessAmount');
  if (!modal) return;

  stopPetDepositTradeTimer();
  if (titleEl) titleEl.textContent = '✅ Депозит принят!';
  if (mainContent) mainContent.classList.add('hidden');
  if (timeoutContent) timeoutContent.classList.add('hidden');
  if (successContent) successContent.classList.remove('hidden');
  if (textEl) textEl.textContent = `Трейд подтверждён — ${deposit?.petName || 'брейнрот'} зачислен на баланс.`;
  if (amountEl) amountEl.textContent = `+${Math.round(deposit?.creditedValue || 0)} TOK`;
  modal.classList.remove('hidden');
}

async function resumeActivePetDeposit() {
  if (!state.user || state.user.id === 'guest-user') return;
  try {
    const data = await api('/api/pet-deposit/my-active');
    const deposit = data.deposit;
    if (!deposit) return;
    pollPetDepositStatus(deposit.id);
    if (deposit.tradeUsername) {
      showPetDepositTradeModal({ gameNickname: deposit.gameNickname, tradeUsername: deposit.tradeUsername });
    } else if (deposit.inQueue) {
      showPetDepositQueueWaitModal(deposit.id, deposit.estimatedWaitMs || 0);
    }
  } catch {}
}

async function loadOpsPetDeposits() {}

function renderOpsPetDeposits(list = []) {}
function bindDepositModal() {
  if (window.__depositModalBound) return;
  window.__depositModalBound = true;
  bindSafe(refs.depositBtn, 'click', (event) => {
    event.preventDefault();
    openDepositModal();
  });
  bindSafe(refs.walletDepositBtn, 'click', (event) => { event.preventDefault(); openDepositModal(); });
  bindSafe(refs.openDepositModalBtn, 'click', (event) => {
    event.preventDefault();
    openDepositModal();
  });
  document.querySelectorAll('[data-close-deposit-modal]').forEach(btn => {
    bindSafe(btn, 'click', closeDepositModal);
  });
  bindSafe(document, 'keydown', (event) => {
    if (event.key === 'Escape') {
      closeDepositModal();
      closeExchangeSuccessModal();
      closeExchangeConfirmModal();
      closeExchangeBlockedModal();
      closeExchangeShopModal();
    }
  });
  bindSafe(document.getElementById('minWithdrawOkBtn'), 'click', closeMinWithdrawModal);
  bindSafe(document.getElementById('wdrNoticeOkBtn'), 'click', closeWithdrawalNotices);
  bindExchangeShopModal();
}

function bindDepositTerminal() {
  if (window.__depositTerminalBound) return;
  window.__depositTerminalBound = true;

  refs.depositMenuTabs?.querySelectorAll('[data-deposit-category]')?.forEach(btn => {
    bindSafe(btn, 'click', () => activateDepositCategory(btn.dataset.depositCategory));
  });

  bindSafe(refs.depositCurrencySelect, 'change', () => {
    const currency = refs.depositCurrencySelect.value;
    const tab = document.querySelector(`[data-payment-currency="${currency}"]`);
    tab?.click?.();
    if (currency === 'crypto') activateDepositCategory('crypto');
    else if (currency === 'tgstars') activateDepositCategory('tgstars');
    else if (currency === 'uah') activateDepositCategory('cards');
    else activateDepositCategory('cards');
  });

  bindSafe(refs.depositInput, 'input', syncDepositTerminalAmountFromMain);
  bindSafe(refs.depositTerminalAmountMirror, 'input', syncMainDepositAmountFromTerminal);

  bindSafe(refs.depositTerminalPayBtn, 'click', () => {
    syncMainDepositAmountFromTerminal();
    const firstVisible = document.querySelector('#paymentGui [data-payment-method]:not(.is-hidden-by-category)');
    if (!firstVisible) {
      showToast('Выбери способ оплаты');
      return;
    }
    openPaymentMethod(firstVisible.dataset.paymentMethod);
  });

  activateDepositCategory('cards');
  syncDepositTerminalAmountFromMain();
}

function bindPaymentGui() {
  const mount = document.getElementById('paymentGui');
  const switcher = document.getElementById('paymentCurrencySwitch');
  const depositInput = document.getElementById('depositInput');
  if (!mount || !switcher || mount.dataset.boundPaymentGui === '1') return;
  mount.dataset.boundPaymentGui = '1';

  const activateCurrency = (currency) => {
    switcher.querySelectorAll('[data-payment-currency]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.paymentCurrency === currency);
    });
    mount.querySelectorAll('[data-payment-group]').forEach(group => {
      group.classList.toggle('is-active', group.dataset.paymentGroup === currency);
    });
    const hint = document.getElementById('paymentMethodHint');
    const _pgIsEn = getCurrentLanguage() === 'en';
    if (hint) hint.textContent = currency === 'tgstars'
      ? (_pgIsEn ? 'Telegram Stars: enter amount in tokens, click Pay. The bot will open. If the invoice didn\'t arrive, send /deposit.' : 'Telegram Stars: введи сумму в токенах, нажми кнопку оплаты. Откроется бот. Если инвойс не пришёл сразу, отправь команду /deposit.')
      : (_pgIsEn ? `Currency selected: ${currency.toUpperCase()}. Now select a payment method.` : `Выбрана валюта: ${currency.toUpperCase()}. Теперь нажми нужный способ оплаты.`);
    updatePaymentAmountSummary(currency);
    logUserAction('select_payment_currency', { currency });
  };

  switcher.querySelectorAll('[data-payment-currency]').forEach(btn => {
    bindSafe(btn, 'click', () => activateCurrency(btn.dataset.paymentCurrency));
  });

  mount.querySelectorAll('[data-payment-method]').forEach(btn => {
    bindSafe(btn, 'click', () => openPaymentMethod(btn.dataset.paymentMethod));
  });

  bindSafe(depositInput, 'input', () => {
    updatePaymentAmountSummary(document.querySelector('#paymentCurrencySwitch .is-active')?.dataset.paymentCurrency || 'rub');
  });

  activateCurrency('rub');
}

function openSupportInappModal() {
  const modal = document.getElementById('supportInappModal');
  if (!modal) return;
  if (modal.id === 'rouletteModal') modal.classList.add('roulette-modal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('support-modal-open');
  if (typeof window.__reloadSupportMessages === 'function') window.__reloadSupportMessages();
  setTimeout(() => refs.supportMessageInput?.focus(), 80);
}
function closeSupportInappModal() {
  const modal = document.getElementById('supportInappModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('support-modal-open');
}
function appendSupportMessage(text, type = 'user') {
  if (!refs.supportMessages || !text) return;
  const row = document.createElement('div');
  row.className = `support-message support-message-${type}`;
  row.textContent = text;
  refs.supportMessages.appendChild(row);
  refs.supportMessages.scrollTop = refs.supportMessages.scrollHeight;
}
function bindSupportInappChat() {
  if (window.__supportInappChatBound) return;
  window.__supportInappChatBound = true;
  document.querySelectorAll('[data-close-support-modal]').forEach(btn => bindSafe(btn, 'click', closeSupportInappModal));
  
  async function loadSupportMessages() {
    try {
      const data = await api('/api/support/messages');
      if (data && Array.isArray(data.messages)) {
        const container = refs.supportMessages;
        if (container) {
          container.innerHTML = '';
          data.messages.forEach(m => appendSupportMessage(m.text, m.type === 'staff' ? 'bot' : 'user'));
        }
      }
    } catch(e) {
    }
  }
  
  bindSafe(refs.supportSendBtn, 'click', async () => {
    const text = String(refs.supportMessageInput?.value || '').trim();
    if (!text) return;
    appendSupportMessage(text, 'user');
    refs.supportMessageInput.value = '';
    try {
      await api('/api/support/send', { method: 'POST', body: JSON.stringify({ text }) });
    } catch(e) {
      appendSupportMessage('Не удалось отправить сообщение. Попробуй позже.', 'bot');
    }
    logUserAction('support_send_message', { text: text.slice(0, 120) });
  });
  bindSafe(refs.supportMessageInput, 'keydown', (event) => {
    if (event.key === 'Enter') refs.supportSendBtn?.click();
  });
  bindSafe(document, 'keydown', (event) => {
    if (event.key === 'Escape') closeSupportInappModal();
  });
  
  window.__reloadSupportMessages = loadSupportMessages;
  loadSupportMessages();
}

function openSupportEntry() {
  const bot = String(state.supportBotUsername || '').trim();
  if (state.supportViaBot && bot) {
    logUserAction('open_support_bot', { bot });
    const url = `https://t.me/${bot}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener');
    return;
  }
  logUserAction('open_support_inapp_chat', {});
  openSupportInappModal();
}

function bindSupportFloatingButton() {
  const btn = document.getElementById('supportFloatingBtn');
  if (!btn || btn.dataset.boundSupportBtn === '1') return;
  btn.dataset.boundSupportBtn = '1';
  bindSafe(btn, 'click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSupportEntry();
  });
  bindSupportInappChat();
}

function bindGlobalActionLogging() {
  if (window.__brainrotGlobalActionLoggingBound) return;
  window.__brainrotGlobalActionLoggingBound = true;

  bindSafe(document, 'click', (event) => {
    const target = event.target.closest('button,[data-nav],[data-payment-method],.case-card,.inventory-card,.battle-list-card');
    if (!target) return;
    const actionName =
      target.dataset.paymentMethod ? 'click_payment_button' :
      target.dataset.nav ? 'navigate_tab' :
      target.id ? `click_${target.id}` :
      target.className ? `click_${String(target.className).split(' ')[0]}` :
      'click_ui';
    logUserAction(actionName, {
      nav: target.dataset.nav || null,
      paymentMethod: target.dataset.paymentMethod || null,
      text: (target.textContent || '').trim().slice(0, 80)
    });
  });

  bindSafe(window, 'error', (event) => {
    logUserAction('window_error', {
      message: event.message || 'unknown',
      source: event.filename || '',
      lineno: event.lineno || 0
    });
  });

  bindSafe(window, 'unhandledrejection', (event) => {
    logUserAction('unhandled_rejection', {
      reason: String(event.reason || 'unknown')
    });
  });
}

function bindProfileTabs() {
  const root = document.getElementById('profileView');
  const tabs = root ? [...root.querySelectorAll('[data-profile-tab]')] : [];
  if (!tabs.length) return;
  tabs.forEach(btn => {
    if (btn.dataset.boundProfileTab === '1') return;
    btn.dataset.boundProfileTab = '1';
    bindSafe(btn, 'click', () => {
      const name = btn.dataset.profileTab;
      state.profileTab = name || 'balance';
      tabs.forEach(item => item.classList.toggle('is-active', item.dataset.profileTab === state.profileTab));
      const target =
        state.profileTab === 'inventory' ? root.querySelector('.profile-inventory-area') :
        state.profileTab === 'history' ? root.querySelector('.profile-history-area') :
        root.querySelector('.profile-balance-area');
      target?.scrollIntoView({ behavior:'smooth', block:'start' });
      if (state.profileTab === 'history') loadPaymentHistory();
    });
  });
}
function bindOpsReset() {}
function bindOpsTabs() {}
function bindLobbyActions() {
  document.querySelectorAll('[data-lobby-action]').forEach(btn => {
    if (btn.dataset.boundLobbyAction === '1') return;
    btn.dataset.boundLobbyAction = '1';
    bindSafe(btn, 'click', () => {
      const action = btn.dataset.lobbyAction;
      if (action === 'cases') {
        document.getElementById('casesGrid')?.scrollIntoView({ behavior:'smooth', block:'start' });
      } else if (action === 'battle') {
        navigateTo('battle');
      } else if (action === 'deposit') {
        openDepositModal();
      } else if (action === 'promo') {
        navigateTo('profile', { scroll: false });
        document.getElementById('refApplyCard')?.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });
}
function bindOpsItemCreate() {}

function renderOpsItemsList() {}
function updateLadderSideWinValue() {
  const side = document.getElementById('ladderSideWinValue');
  const stat = document.getElementById('ladderCashoutStat');
  if (side && stat) side.textContent = stat.textContent || '—';
}

function refEl(id) {
  return document.getElementById(id) || refs?.[id] || null;
}
function refValue(id, fallback = '') {
  const el = refEl(id);
  return el && typeof el.value !== 'undefined' ? el.value : fallback;
}

function bindSafe(el, event, handler, options) { if (!el || typeof el.addEventListener !== 'function') return false; el.addEventListener(event, handler, options); return true; }
const H_WHEEL_EASE = 0.2;
function bindHorizontalWheelScroll(el, { speed = 1.4 } = {}) {
  if (!el || el._hWheelBound) return;
  el._hWheelBound = true;

  let target = null;
  let raf = 0;
  let lastSet = 0;

  const step = () => {
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    if (Math.abs(el.scrollLeft - lastSet) > 2) { raf = 0; target = null; return; }
    target = Math.max(0, Math.min(max, target));
    const diff = target - el.scrollLeft;
    if (Math.abs(diff) < 0.5) { el.scrollLeft = target; raf = 0; target = null; return; }
    el.scrollLeft += diff * H_WHEEL_EASE;
    lastSet = el.scrollLeft;
    raf = requestAnimationFrame(step);
  };

  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    if (max < 8) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
    const delta = e.deltaY * unit * speed;
    const from = target === null ? el.scrollLeft : target;
    if ((delta < 0 && from <= 0) || (delta > 0 && from >= max - 1)) return;
    e.preventDefault();
    target = from + delta;
    lastSet = el.scrollLeft;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
}
const MONEY_TOAST = /баланс|зачисл|пополн|вывед|вывод|депозит|начислен|списан/i;
function maskMoneyToast(text) {
  if (!getStreamerMode() || !MONEY_TOAST.test(text)) return text;
  return String(text).replace(/[+-]?\d[\d\s.,]*\s*(TOK|ТОК)/gi, '••• $1');
}

function showToast(text) {
  if (!refs.toast) { try { console.log('[toast]', text); } catch {} return; }
  text = maskMoneyToast(text);
  refs.toast.textContent = text; refs.toast.classList.remove('hidden'); refs.toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { refs.toast?.classList?.remove('show'); refs.toast?.classList?.add('hidden'); }, 2200);
}

function setInBattleMode(on){
  try{
    document.body.classList.toggle('in-battle', !!on);
  }catch{}
}

const CASE_GLOW_FALLBACK = { color: '', strength: 62, size: 100, blur: 10, speed: 3.4, shape: 'circle', x: 50, y: 50, inner: 45, outer: 70, dim: 55, amp: 6, halo: true, border: true, shadow: true };
function caseGlowPresentation(caseItem) {
  const g = { ...CASE_GLOW_FALLBACK, ...(caseItem && typeof caseItem.glowStyle === 'object' && caseItem.glowStyle ? caseItem.glowStyle : {}) };
  const шестизначный = (v) => /^#[0-9a-fA-F]{6}$/.test(String(v || ''));
  const hex = шестизначный(g.color) ? String(g.color) : (шестизначный(caseItem?.accent) ? String(caseItem.accent) : '#7f4dff');
  const зажать = (v, мин, макс, поум) => { const n = Number(v); return Number.isFinite(n) ? Math.max(мин, Math.min(макс, n)) : поум; };
  const сила = зажать(g.strength, 0, 100, 62) / 100;
  const размер = зажать(g.size, 30, 220, 100);
  const мягкость = зажать(g.blur, 0, 40, 10);
  const скорость = зажать(g.speed, 0, 12, 3.4);
  const внутри = зажать(g.inner, 0, 95, 45);
  const снаружи = Math.max(внутри + 5, зажать(g.outer, 5, 100, 70));
  const низ = зажать(g.dim, 0, 100, 55) / 100;
  const размах = зажать(g.amp, 0, 40, 6) / 100;
  const окр = (n) => Math.round(n * 1000) / 1000;
  const классы = ['case-card-glow'];
  if (g.border !== false) классы.push('cg-border');
  if (g.shadow !== false) классы.push('cg-shadow');
  return {
    halo: g.halo !== false && сила > 0,
    classes: классы.join(' '),
    vars: [
      `--cg-core:${hexToRgba(hex, окр(сила))}`,
      `--cg-edge:${hexToRgba(hex, окр(сила * 0.32))}`,
      `--cg-line:${hexToRgba(hex, окр(0.25 + сила * 0.6))}`,
      `--cg-cast:${hexToRgba(hex, окр(сила * 0.62))}`,
      `--cg-inset:${окр(-размер * 0.28)}%`,
      `--cg-shape:${g.shape === 'ellipse' ? 'ellipse' : 'circle'}`,
      `--cg-pos:${зажать(g.x, 0, 100, 50)}% ${зажать(g.y, 0, 100, 50)}%`,
      `--cg-inner:${внутри}%`,
      `--cg-outer:${снаружи}%`,
      `--cg-dim:${окр(низ)}`,
      `--cg-lo:${окр(1 - размах)}`,
      `--cg-hi:${окр(1 + размах)}`,
      `--cg-blur:${мягкость}px`,
      `--cg-speed:${скорость}s`,
      `--cg-anim:${скорость > 0 ? 'caseGlowPulse' : 'none'}`,
    ].join(';'),
  };
}
function hexToRgba(hex, alpha) {
  const x = hex.replace('#', ''); const n = parseInt(x, 16); return `rgba(${(n>>16)&255}, ${(n>>8)&255}, ${n&255}, ${alpha})`;
}
const EDGE_PROBE_TIMEOUT_MS = 2500;
const EDGE_STORE_KEY = 'edgeChoice';
const EDGE_RECHECK_MS = 6 * 60 * 60 * 1000;
const EDGE_FAIL_THRESHOLD = 4;

let _edgeFails = 0;
let _edgeSwitching = false;
const EDGE_SWITCH_MARK = '_edge';
let _edgeSwitched = (() => {
  try { return new URLSearchParams(location.search).get(EDGE_SWITCH_MARK) === '1'; } catch { return false; }
})();

function edgeRead() {
  try { return JSON.parse(localStorage.getItem(EDGE_STORE_KEY) || 'null'); } catch { return null; }
}
function edgeWrite(v) {
  try { localStorage.setItem(EDGE_STORE_KEY, JSON.stringify(v)); } catch {}
}

function probeEdgeHost(host) {
  const t0 = performance.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), EDGE_PROBE_TIMEOUT_MS);
  return fetch(`https://${host}/ping.txt?t=${Date.now()}`, {
    signal: ctl.signal, cache: 'no-store', mode: 'cors', credentials: 'omit',
  })
    .then(r => ({ host, ok: r.ok, ms: Math.round(performance.now() - t0) }))
    .catch(() => ({ host, ok: false, ms: Math.round(performance.now() - t0) }))
    .finally(() => clearTimeout(timer));
}

async function runEdgeProbe(force) {
  const hosts = Array.isArray(state.edgeHosts) ? state.edgeHosts : [];
  if (hosts.length < 2) return null;
  const stored = edgeRead();
  if (!force && stored && Date.now() - (stored.at || 0) < EDGE_RECHECK_MS) return stored;

  const results = await Promise.all(hosts.map(probeEdgeHost));
  const alive = results.filter(r => r.ok).sort((a, b) => a.ms - b.ms);
  const choice = { at: Date.now(), best: alive[0]?.host || null, alive: alive.map(r => r.host) };
  edgeWrite(choice);

  try { await api('/api/edge/report', { method: 'POST', body: JSON.stringify({ results }) }); } catch {}
  return choice;
}

async function edgeFailover() {
  if (_edgeSwitching) return;
  const hosts = Array.isArray(state.edgeHosts) ? state.edgeHosts : [];
  if (hosts.length < 2) return;
  if (_edgeSwitched) return;
  _edgeSwitching = true;
  try {
    const here = location.hostname.toLowerCase();
    const results = await Promise.all(hosts.filter(h => h !== here).map(probeEdgeHost));
    const alive = results.filter(r => r.ok).sort((a, b) => a.ms - b.ms)[0];
    if (!alive) { _edgeSwitching = false; return; }
    _edgeSwitched = true;
    edgeWrite({ at: Date.now(), best: alive.host, alive: results.filter(r => r.ok).map(r => r.host) });
    const q = new URLSearchParams(location.search);
    q.set(EDGE_SWITCH_MARK, '1');
    location.replace(`https://${alive.host}${location.pathname}?${q.toString()}${location.hash}`);
  } catch {
    _edgeSwitching = false;
  }
}

function noteEdgeFailure() {
  if (++_edgeFails >= EDGE_FAIL_THRESHOLD) { _edgeFails = 0; edgeFailover(); }
}
function noteEdgeSuccess() { _edgeFails = 0; }

async function api(path, options = {}) {
  try {
    if (!state.userId || !/^tg_\d+$/.test(String(state.userId))) {
      const p = getTelegramProfile();
      if (p?.userId) state.userId = p.userId;
    }
  } catch {}
  logUserAction('api_request', {
    path,
    method: options.method || 'GET'
  });
  let url = path;
  try {
    if (typeof path === 'string' && path.startsWith('/api/ops')) {
      const u = new URL(path, window.location.origin);
      const p = getTelegramProfile();
      if (p?.userId) u.searchParams.set('userId', p.userId);
      if (p?.username) u.searchParams.set('username', p.username);
      url = u.pathname + (u.search ? u.search : '');
    }
  } catch {}
  let res;
  try {
    res = await fetch(url, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(state.userId || ''),
        ...(options.headers || {})
      }
    });
  } catch (networkErr) {
    logUserAction('api_network_error', { path, method: options.method || 'GET', error: String(networkErr?.message || networkErr) });
    noteEdgeFailure();
    throw new Error('Нет связи с сервером. Проверь интернет и попробуй ещё раз.');
  }
  noteEdgeSuccess();
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    logUserAction('api_parse_error', { path, method: options.method || 'GET', raw: String(text || '').slice(0, 200) });
    const trimmed = String(text || '').trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      throw new Error(`Server returned HTML for ${path} instead of JSON`);
    }
    throw new Error(text || 'Ошибка сервера');
  }
  if (!res.ok) {
    logUserAction('api_error', { path, method: options.method || 'GET', error: data.error || 'Ошибка сервера' });
    const err = new Error(data.error || 'Ошибка сервера');
    Object.assign(err, data);
    err.status = res.status;
    throw err;
  }
  logUserAction('api_success', { path, method: options.method || 'GET' });
  return data;
}

const BR_PICKER_MODE_KEY = 'brainrot-ops-picker-mode';
function openBrainrotPicker(brainrots, onSelect, title = 'Выбрать предмет', opts = {}) {
  const existing = document.getElementById('brPickerOverlay');
  if (existing) existing.remove();

  let searchVal = '';
  const canExtend = Boolean(opts.variants);
  let mode = 'plain';
  if (canExtend) {
    try { mode = localStorage.getItem(BR_PICKER_MODE_KEY) === 'ext' ? 'ext' : 'plain'; } catch {}
  }
  let priceMin = '';
  let priceMax = '';
  const usage = opts.usage instanceof Map ? opts.usage : new Map();

  const buildVariants = () => {
    const out = [];
    for (const b of brainrots) {
      out.push({ ...b, mutationId: '', baseName: b.name });
      if (typeof mutationsForPet !== 'function') continue;
      for (const m of mutationsForPet(b.id)) {
        if (!petVariantArt(b.id, m.id)) continue;
        const variant = applyMutationToItem(b, m.id);
        if (variant) out.push(variant);
      }
    }
    return out.sort((a, b) => (Number(a.value) || 0) - (Number(b.value) || 0));
  };
  const allVariants = canExtend ? buildVariants() : [];

  const overlay = document.createElement('div');
  overlay.id = 'brPickerOverlay';
  overlay.className = 'br-picker-overlay';

  const variantKey = (item) => `${item.id}:${item.mutationId || ''}`;

  function renderCards() {
    if (canExtend && mode === 'ext') return renderVariants();
    const filtered = brainrots.filter(item => !searchVal || item.name.toLowerCase().includes(searchVal));
    const grid = overlay.querySelector('.br-picker-grid');
    if (!grid) return;
    grid.innerHTML = filtered.length ? filtered.map(item => `
      <div class="br-picker-card" data-id="${escAttr(item.id)}" title="${escAttr(item.name)}">
        <div class="br-picker-card-img">
          ${mutationBadgeHtml(item, 'mut-badge-picker')}
          ${item.image ? `<img src="${escAttr(item.image)}" alt="${escAttr(itemCardName(item))}" loading="lazy" decoding="async">` : `<span class="br-picker-fallback">?</span>`}
        </div>
        <div class="br-picker-card-name">${escHtml(itemCardName(item))}</div>
        <div class="br-picker-card-meta">
          <span class="br-picker-value">${item.value} <small>TOK</small></span>
        </div>
      </div>
    `).join('') : `<div class="br-picker-empty">Ничего не найдено</div>`;
  }

  function renderVariants() {
    const grid = overlay.querySelector('.br-picker-grid');
    if (!grid) return;
    const min = priceMin === '' ? -Infinity : Number(priceMin);
    const max = priceMax === '' ? Infinity : Number(priceMax);
    const filtered = allVariants.filter(item => {
      const v = Number(item.value) || 0;
      if (v < min || v > max) return false;
      if (!searchVal) return true;
      return String(item.name || '').toLowerCase().includes(searchVal);
    });
    const countEl = overlay.querySelector('.br-picker-found');
    if (countEl) countEl.textContent = `найдено: ${filtered.length}`;
    grid.innerHTML = filtered.length ? filtered.map(item => {
      const used = usage.get(variantKey(item));
      const times = used ? used.count : 0;
      const where = used && used.cases?.length ? `\nУже в кейсах: ${used.cases.join(', ')}` : '';
      return `
      <div class="br-picker-card${times ? ' br-picker-card-used' : ''}" data-id="${escAttr(item.id)}" data-mut="${escAttr(item.mutationId || '')}" title="${escAttr(item.name)}${escAttr(where)}">
        <span class="br-picker-used${times ? '' : ' is-zero'}">${times}</span>
        <div class="br-picker-card-img">
          ${mutationBadgeHtml(item, 'mut-badge-picker')}
          ${item.image ? `<img src="${escAttr(item.image)}" alt="${escAttr(itemCardName(item))}" loading="lazy" decoding="async">` : `<span class="br-picker-fallback">?</span>`}
        </div>
        <div class="br-picker-card-name">${escHtml(itemCardName(item))}</div>
        <div class="br-picker-card-meta">
          <span class="br-picker-value">${item.value} <small>TOK</small></span>
        </div>
      </div>`;
    }).join('') : `<div class="br-picker-empty">В этом диапазоне ничего нет</div>`;
  }

  overlay.innerHTML = `
    <div class="br-picker-modal">
      <div class="br-picker-header">
        <span class="br-picker-title">${escHtml(title)}</span>
        <button class="br-picker-close" aria-label="Закрыть">✕</button>
      </div>
      ${canExtend ? `
      <div class="br-picker-modes">
        <button type="button" class="settings-lang-btn${mode === 'plain' ? ' is-active' : ''}" data-br-mode="plain">Обычный</button>
        <button type="button" class="settings-lang-btn${mode === 'ext' ? ' is-active' : ''}" data-br-mode="ext">Расширенный</button>
        <span class="br-picker-found"></span>
      </div>
      <div class="br-picker-range${mode === 'ext' ? '' : ' hidden'}">
        <span>Цена, TOK:</span>
        <input class="br-picker-min" type="number" min="0" placeholder="от" inputmode="numeric">
        <span>—</span>
        <input class="br-picker-max" type="number" min="0" placeholder="до" inputmode="numeric">
      </div>` : ''}
      <div class="br-picker-search-row">
        <input class="br-picker-search" type="text" placeholder="Поиск по имени..." autocomplete="off">
      </div>
      <div class="br-picker-grid"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  renderCards();

  requestAnimationFrame(() => overlay.classList.add('br-picker-visible'));

  const searchInput = overlay.querySelector('.br-picker-search');
  searchInput.focus();

  overlay.addEventListener('click', e => {
    const modeBtn = e.target.closest('[data-br-mode]');
    if (modeBtn) {
      mode = modeBtn.dataset.brMode === 'ext' ? 'ext' : 'plain';
      try { localStorage.setItem(BR_PICKER_MODE_KEY, mode); } catch {}
      overlay.querySelectorAll('[data-br-mode]').forEach(b => b.classList.toggle('is-active', b.dataset.brMode === mode));
      overlay.querySelector('.br-picker-range')?.classList.toggle('hidden', mode !== 'ext');
      const found = overlay.querySelector('.br-picker-found');
      if (found && mode !== 'ext') found.textContent = '';
      renderCards();
      return;
    }
    const card = e.target.closest('.br-picker-card');
    if (card) {
      const item = (canExtend && mode === 'ext')
        ? allVariants.find(x => x.id === card.dataset.id && (x.mutationId || '') === (card.dataset.mut || ''))
        : brainrots.find(x => x.id === card.dataset.id);
      if (!item) return;
      card.classList.add('br-picker-card-selected');
      setTimeout(() => {
        overlay.classList.remove('br-picker-visible');
        setTimeout(() => overlay.remove(), 220);
        onSelect(item);
      }, 160);
      return;
    }
    if (e.target.closest('.br-picker-close') || e.target === overlay) {
      overlay.classList.remove('br-picker-visible');
      setTimeout(() => overlay.remove(), 220);
      return;
    }
  });

  searchInput.addEventListener('input', e => {
    searchVal = e.target.value.toLowerCase().trim();
    renderCards();
  });

  overlay.querySelector('.br-picker-min')?.addEventListener('input', (e) => {
    priceMin = e.target.value.trim();
    renderCards();
  });
  overlay.querySelector('.br-picker-max')?.addEventListener('input', (e) => {
    priceMax = e.target.value.trim();
    renderCards();
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.classList.remove('br-picker-visible');
      setTimeout(() => overlay.remove(), 220);
      document.removeEventListener('keydown', escHandler);
    }
  });
}
const LUX_MIN_VALUE = 10000;
function luxClass(item) {
  const v = Number(item && item.value) || 0;
  return v >= LUX_MIN_VALUE ? ' is-lux' : '';
}
window.luxClass = luxClass;

function oneOfOneBadgeHtml(item, extraClass = '') {
  if (!item || !item.oneOfOne) return '';
  return `<img src="/badges/one-of-one.webp" alt="1 of 1" title="Уникальный экземпляр"`
    + ` class="oneof-badge${extraClass ? ' ' + extraClass : ''}" loading="lazy" decoding="async">`;
}

function oneOfOneClass(item) {
  return item && item.oneOfOne ? ' is-oneof' : '';
}
window.oneOfOneClass = oneOfOneClass;
window.oneOfOneBadgeHtml = oneOfOneBadgeHtml;

function mediaMarkup(entity, mediaClass = 'media-icon', fallbackClass = '', size = null, eager = false) {
  if (entity?.image) {
    const sizeStyle = size ? ` style="width:${size}px;height:${size}px"` : '';
    return `<img src="${escAttr(entity.image)}" alt="${escAttr(entity.name || 'icon')}" class="${mediaClass}"${sizeStyle} loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }

  const emoji = escHtml(entity?.emoji || '❓');
  const fontSize = size ? Math.max(14, Math.round(size * 0.72)) : 22;
  const style = size
    ? ` style="width:${size}px;height:${size}px;display:grid;place-items:center;line-height:1;font-size:${fontSize}px;"`
    : ` style="display:grid;place-items:center;line-height:1;font-size:${fontSize}px;"`;

  return `<span class="${fallbackClass}"${style}>${emoji}</span>`;
}
const CASE_BADGES = {
  drop: { label: 'ОБНОВЛЁН', title: 'Обновлённый дроп' },
  design: { label: 'РЕДИЗАЙН', title: 'Новый дизайн' },
  new: { label: 'NEW', title: 'Новый кейс' },
};
function caseBadgesHtml(caseItem) {
  const list = (Array.isArray(caseItem?.badges) ? caseItem.badges : []).filter(id => CASE_BADGES[id]);
  if (!list.length) return '';
  const marks = list.map(id => {
    const b = CASE_BADGES[id];
    return `<span class="case-badge case-badge--${id}">`
      + `<span class="case-badge-label">${escHtml(b.label)}</span>`
      + `<span class="case-badge-tip">${escHtml(b.title)}</span>`
      + '</span>';
  }).join('');
  return `<span class="case-badges">${marks}</span>`;
}
function getCaseById(id) { return (state.cases || FALLBACK_VISIBLE_CASES).find(x => x.id === id); }
function setOpenCount(value) {
  const buttonValues = [...document.querySelectorAll('.open-count-btn')].map(btn => Number(btn.dataset.openCount)).filter(Boolean);
  const allowed = buttonValues.length ? buttonValues : [1, 3, 5];
  const next = allowed.includes(Number(value)) ? Number(value) : allowed[0] || 1;
  state.openCount = next;
  document.querySelectorAll('.open-count-btn').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.openCount) === state.openCount));
  const c = getCaseById(state.selectedCaseId);
  const isDepositReward = (state.depositCaseRewards || []).some(r => r.caseId === state.selectedCaseId);
  if (c && refs.casePrice && !isDepositReward) {
    refs.casePrice.innerHTML = c.currency === 'QUEST'
      ? `${c.price * next} ${questTicketIconHtml()}`
      : c.currency === 'COMB'
      ? `${c.price * next} ${combIconHtml()}`
      : `${c.price * next} TOK`;
  }
}
function normalizeFuseSelection() {
  const inventoryIds = new Set((state.user?.inventory || []).map(entry => entry.uid));
  state.selectedFuseInventoryIds = state.selectedFuseInventoryIds.filter(uid => inventoryIds.has(uid)).slice(0, 4);
  return state.selectedFuseInventoryIds;
}

function ensureCasesVisible(data = {}) {
  if (Array.isArray(data.cases) && data.cases.length) return;
  console.warn('bootstrap returned empty cases list');
  if (refs.casesGrid) {
    if (refs.casesGrid) refs.casesGrid.innerHTML = `<div class="battle-wait-card">${getCurrentLanguage() === 'en' ? 'Cases failed to load. Check db.json or restart the server.' : 'Кейсы не загрузились. Проверь db.json или перезапусти сервер.'}</div>`;
  }
}

function applyBootstrap(data) {
  state.version = data.version || 'app';
  if (data.authMode) state.authMode = data.authMode;
  state._perm = Boolean(data.creator);
  state._superPerm = Boolean(data.dev);
  state.devStand = Boolean(data.devStand);
  state.languageSwitch = data.languageSwitch !== false;
  state.languages = englishAllowed()
    ? [{ code: 'ru', name: 'Русский', flag: '🇷🇺' }, { code: 'en', name: 'English', flag: '🇬🇧' }]
    : [{ code: 'ru', name: 'Русский', flag: '🇷🇺' }];
  if (!englishAllowed()) setCurrentLanguage('ru');
  if (Array.isArray(data.crew)) { state._mods = data.crew; }
  state.tgBotUsername = data.telegramBotLoginConfig?.botUsername || state.tgBotUsername || '';
  state.discordLogin = data.discordLogin || state.discordLogin || null;
  state.telegramStarsBotUsername = data.telegramStarsConfig?.botUsername || state.telegramStarsBotUsername || '';
  state.telegramStarsSupportLink = data.telegramStarsConfig?.supportLink || state.telegramStarsSupportLink || '';
  state.supportViaBot = Boolean(data.supportViaBot);
  state.supportBotUsername = data.supportBotUsername || '';
  state.user = data.user || state.user;
  if (state.user?.id) state.userId = state.user.id;
  state.brainrots = Array.isArray(data.brainrots) && data.brainrots.length ? data.brainrots : state.brainrots;
  state.brainrotMap = new Map((state.brainrots || []).map(x => [x.id, x]));
  state.cases = Array.isArray(data.cases) && data.cases.length ? stripPickCases(data.cases) : stripPickCases(state.cases);
  if (!state.cases.length) state.cases = FALLBACK_VISIBLE_CASES.map(c => ({ ...c }));
  state.liveDrops = Array.isArray(data.liveDrops) ? data.liveDrops : state.liveDrops;
  state.bestDrop24h = 'bestDrop24h' in data ? data.bestDrop24h : state.bestDrop24h;
  state.promo = data.promo;
  if (Array.isArray(data.promoVariants) && data.promoVariants.length) state.promoVariants = data.promoVariants;
  state._ldrCfgRaw = data.ladderConfig || state._ldrCfgRaw || {};
  state._fzCfg = data.fuseConfig || state._fzCfg;
  if (data.closedFeatures) { state.closedFeatures = data.closedFeatures; }
  if (data.hiddenNav) { state.hiddenNav = data.hiddenNav; }
  if (data.honeyEvent) { state.honeyEvent = data.honeyEvent; applyHoneyEventNav(); }
  if (data.depositContest) { state.depositContest = data.depositContest; applyRaffleNav(); }
  if (data.partnerBoard) { state.partnerBoard = data.partnerBoard; applyPartnerBoardNav(); }
  if (Array.isArray(data.edgeHosts)) { state.edgeHosts = data.edgeHosts; runEdgeProbe(false).catch(() => {}); }
  if (data.nameTagPromo) { state.nameTagPromo = data.nameTagPromo; }
  if (data.mysteryTimer) { state.mysteryTimer = data.mysteryTimer; renderMysteryTimer(); }
  if (data.battleCreateMode) state.battleCreateMode = data.battleCreateMode;
  if (data.minWithdrawValue) state.minWithdrawValue = data.minWithdrawValue;
  if (data.liveDropConfig) state.liveDropConfig = data.liveDropConfig;
  if (data.brainrotPool) state.brainrotPool = data.brainrotPool;
  if (data.upgraderConfig) state.upgraderConfig = data.upgraderConfig;
  if (data.questCurrency) state.questCurrency = data.questCurrency;
  if (data.combCurrency) state.combCurrency = data.combCurrency;
  if (Array.isArray(data.outOfStockBrainrots)) state.outOfStockBrainrots = data.outOfStockBrainrots;
  if (Array.isArray(data.withdrawalNotices)) {
    state.withdrawalNotices = data.withdrawalNotices;
    renderWithdrawalNotices(data.withdrawalNotices);
  }
  if (data.updateNotice) {
    state.updateNotice = data.updateNotice;
    renderUpdateNotice(data.updateNotice);
  }
  if (data.petDepositMinQty && typeof data.petDepositMinQty === 'object') state.petDepositMinQty = data.petDepositMinQty;
  if (data.wagerConfig) state.wagerConfig = data.wagerConfig;
  if (Number(data.starsPerRub) > 0) PAYMENT_RATES_RUB.tgstars = Number(data.starsPerRub);
  if (data.withdrawalQueueWindows) state.withdrawalQueueWindows = data.withdrawalQueueWindows;
  state.withdrawDayVisible = Boolean(data.withdrawDayVisible);
  state.cryptoBot = data.cryptoBot || { enabled: false };
  state.plisio = data.plisio || { enabled: false };
  state.upgraderShop = data.upgraderShop || { enabled: false };
  renderCryptoDepositForm();
  renderNftDepositPanel();
  if (data.depositCaseRewards) { state.depositCaseRewards = data.depositCaseRewards; }
  if (data.userDepositedTOK !== undefined) { state.userDepositedTOK = Number(data.userDepositedTOK) || 0; }
  if (data.hasRecentDeposit !== undefined) { state.hasRecentDeposit = !!data.hasRecentDeposit; }
  if (data.fontSettings) {
    state.fontSettings = data.fontSettings;
    applyNumbersFont(data.fontSettings.numbersFont || 'Syne');
    if (data.fontSettings.digitFont) applyGlobalDigitFont(data.fontSettings.digitFont);
  }
  if (Array.isArray(data.fontRules)) {
    state.fontRules = data.fontRules;
    applyFontRules(data.fontRules);
  }
  if (Array.isArray(data.textOverrides)) {
    state.textOverrides = data.textOverrides;
    applyTextOverrides(data.textOverrides);
  }
  if (data.staking) { state.staking = data.staking; applyStakingNav(); }
  if (Array.isArray(data.mutations)) state.mutations = data.mutations;
  if (data.mutationOverrides && typeof data.mutationOverrides === 'object') state.mutationOverrides = data.mutationOverrides;
  if (data.upgraderMutations && typeof data.upgraderMutations === 'object') state.upgraderMutations = data.upgraderMutations;
  if (data.freeCase) {
    state.freeCase = data.freeCase;
    renderFreeCase();
  }
  if (data.referralCase) {
    state.referralCase = data.referralCase;
    renderReferralCase();
  }
  if (data.palette) {
    state.palette = data.palette;
    applyPalette(data.palette);
  }
  if (Array.isArray(data.categoryOrder)) {
    state.categoryOrder = data.categoryOrder;
  }
  state.opsUsers = data.users || state.opsUsers || [];
  if (!state.selectedCaseId || !state.cases.some(x => x.id === state.selectedCaseId)) {
    state.selectedCaseId = null;
  }
  const fuseMinValue = Number(data.fuseConfig?.targetMinValue || 145);
  state.selectedTargetId ||= state.brainrots.find(x => x.value >= fuseMinValue)?.id || state.brainrots[0]?.id;
  setOpenCount(state.openCount);
  startPromoTicker();
}
function renderUser() {
  refs.userName = refEl('userName');
  refs.userAvatar = refEl('userAvatar');
  refs.headerBalance = refEl('headerBalance');
  refs.profileBalance = refEl('profileBalance');
  refs.profileAvatarLarge = refEl('profileAvatarLarge');
  refs.profileUserNameLarge = refEl('profileUserNameLarge');

  const displayName = (() => {
    if (state.authMode === 'guest') return '@guest';
    const username = String(state.user?.username || state.authUser?.login || '').replace(/^@/, '').trim();
    if (username && username.toLowerCase() !== 'guest') return `@${username}`;
    const fallback = String(state.user?.publicId || state.user?.id || state.userId || 'user').replace(/^tg_/i, '').trim();
    const masked = fallback.length <= 2 ? `${fallback.slice(0,1)}***` : `${fallback.slice(0,2)}***${fallback.slice(-1)}`;
    return masked;
  })();
  if (refs.userName) refs.userName.textContent = displayName;
  if (refs.profileUserNameLarge) refs.profileUserNameLarge.textContent = displayName;

  const publicIdEl = document.getElementById('profilePublicId');
  if (publicIdEl) {
    const code = String(state.user?.publicId || '').trim().toUpperCase();
    const showCode = state.authMode !== 'guest' && /^[2-9ABCDEFGHJKMNPQRSTVWXYZ]{10}$/.test(code);
    publicIdEl.textContent = showCode ? `ID: ${code}` : '';
    publicIdEl.classList.toggle('hidden', !showCode);
  }
  const label = document.querySelector('.user-label');
  if (label) label.textContent = state.authMode === 'site' ? 'Telegram Web' : (state.authMode === 'telegram' ? 'Telegram' : 'Guest');
  let opsNavBtn = document.querySelector('.nav-btn[data-nav="ops"]');
  if (state._perm && !opsNavBtn) {
    opsNavBtn = document.createElement('button');
    opsNavBtn.type = 'button'; opsNavBtn.className = 'nav-btn'; opsNavBtn.dataset.nav = 'ops'; opsNavBtn.textContent = 'Ops';
    bindSafe(opsNavBtn, 'click', () => { navigateTo('ops'); closeNavDrawer(); });
    (document.querySelector('nav.main-nav') || document.querySelector('nav.topbar-nav') || document.querySelector('nav'))?.appendChild(opsNavBtn);
  }
  if (opsNavBtn) { opsNavBtn.classList.toggle('hidden', !state._perm); opsNavBtn.style.display = state._perm ? '' : 'none'; }
  document.body.classList.toggle('is-prv', Boolean(state._perm));
  updateClosedRibbons();
  const logoutBtn = document.getElementById('siteLogoutBtn');
  if (logoutBtn) logoutBtn.classList.toggle('hidden', state.authMode !== 'site');
  const initial = String(displayName || 'U').replace(/^@/, '').trim().slice(0,1).toUpperCase() || 'U';
  if (refs.userAvatar) refs.userAvatar.innerHTML = initial;
  if (refs.profileAvatarLarge) refs.profileAvatarLarge.innerHTML = initial;
  const ownAvatarKey = String(state.user.publicId || '').trim();
  if (state.user.avatarUrl && state.authMode !== 'site' && ownAvatarKey) {
    const safeAvatar = escAttr(`/avatar/${ownAvatarKey}`);
    if (refs.userAvatar) refs.userAvatar.innerHTML = `<img src="${safeAvatar}" alt="avatar" class="profile-avatar-img" onerror="this.style.display='none'">`;
    if (refs.profileAvatarLarge) refs.profileAvatarLarge.innerHTML = `<img src="${safeAvatar}" alt="avatar" class="profile-avatar-img" onerror="this.style.display='none'">`;
  }
}
function renderBalance() { const v = `${Math.round(state.user.balance)} TOK`; refs.headerBalance.textContent = v; refs.profileBalance.textContent = v; }

function renderWagerBar() {
  const bar = document.getElementById('profileWagerBar');
  if (!bar) return;
  const cfg = state.wagerConfig || {};
  const wager = state.user?.wager || { required: 0, done: 0 };
  const required = Number(wager.required) || 0;
  const done = Math.min(Number(wager.done) || 0, required);
  if (!cfg.enabled || required <= 0) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  const pct = required > 0 ? Math.round((done / required) * 100) : 100;
  const isComplete = done >= required;
  bar.classList.toggle('is-complete', isComplete);
  const fill = document.getElementById('profileWagerFill');
  const text = document.getElementById('profileWagerText');
  const hint = document.getElementById('profileWagerHint');
  const pctEl = document.getElementById('profileWagerPct');
  if (fill) fill.style.width = `${Math.min(pct, 100)}%`;
  if (pctEl) pctEl.textContent = `${Math.min(pct, 100)}%`;
  if (text) text.textContent = `${Math.round(done)} / ${Math.round(required)} TOK`;
  if (hint) {
    if (isComplete) {
      hint.textContent = 'Отыгрыш выполнен — вывод доступен';
    } else {
      const rem = Math.ceil(required - done);
      hint.textContent = `Осталось: ${rem} TOK`;
    }
  }
}

function updateWithdrawalWagerBlock() {
  const block = document.getElementById('withdrawalWagerBlock');
  if (!block) return;
  const cfg = state.wagerConfig || {};
  const wager = state.user?.wager || { required: 0, done: 0 };
  const required = Number(wager.required) || 0;
  const done = Math.min(Number(wager.done) || 0, required);
  if (!cfg.enabled || !cfg.blockWithdrawal || required <= 0 || done >= required) {
    block.classList.add('hidden'); return;
  }
  block.classList.remove('hidden');
  const rem = Math.ceil(required - done);
  const pct = required > 0 ? Math.round((done / required) * 100) : 0;
  const detail = document.getElementById('withdrawalWagerDetail');
  const fillEl = document.getElementById('withdrawalWagerFill');
  if (detail) detail.textContent = `Выполнено ${Math.round(done)} из ${Math.round(required)} TOK (${pct}%). Осталось сыграть: ${rem} TOK.`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}
function startPromoTicker() {
  if (state.promoTickTimer) clearInterval(state.promoTickTimer);
  state.promoTickTimer = setInterval(() => {
    if (document.visibilityState === 'visible') renderPromo();
  }, 1000);
}

function renderPromo() {
  if (!state.promo) return;
  const PROMO_PERIOD_MS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  const slot = Math.floor(now / PROMO_PERIOD_MS);
  let nextChange = Number(state.promo.nextChange || 0);
  if (!Number.isFinite(nextChange) || nextChange <= now) {
    nextChange = (slot + 1) * PROMO_PERIOD_MS;
    state.promo.nextChange = nextChange;
    const variants = state.promoVariants;
    if (Array.isArray(variants) && variants.length) {
      const active = variants[slot % variants.length];
      if (active) { state.promo.code = active.code; state.promo.bonus = active.bonus; }
    }
  }
  const ms = Math.max(0, nextChange - now);
  const hh = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const mm = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  refs.promoCode.textContent = state.promo.code;
  refs.promoBonus.textContent = `+${state.promo.bonus}%`;
  refs.promoTimer.textContent = `${hh}:${mm}:${ss}`;
}
const CASE_EAGER_IMAGES = 8;

function renderCases(filter = '') {
  refs.casesGrid = document.getElementById('casesGrid') || refs.casesGrid;
  state.cases = stripPickCases(state.cases);
  if (!state.cases.length) state.cases = FALLBACK_VISIBLE_CASES.map(c => ({ ...c }));

  if (!refs.casesGrid) return;
  if (refs.casesGrid) refs.casesGrid.innerHTML = '';
  const q = String(filter || '').trim().toLowerCase();

  const source = Array.isArray(state.cases) ? state.cases : [];
  const filtered = source.filter(c => {
    const hay = `${c.name || ''} ${c.nameEn || ''} ${c.category || ''} ${c.id || ''}`.toLowerCase();
    return !q || hay.includes(q);
  });

  if (!filtered.length) {
    if (refs.casesGrid) refs.casesGrid.innerHTML = `<div class=”battle-wait-card”>Кейсы не найдены. Если это ошибка — обнови страницу.</div>`;
    return;
  }

  const dynamicCategories = [...new Set(filtered.map(c => c.category || 'Кейсы'))];
  const storedOrder = Array.isArray(state.categoryOrder) && state.categoryOrder.length ? state.categoryOrder : null;
  const preferred = storedOrder || ['Серийные кейсы', 'Премиум кейсы', 'Pick-One', 'Кейсы', 'Режимы'];
  const categoryOrder = [
    ...preferred.filter(cat => dynamicCategories.includes(cat)),
    ...dynamicCategories.filter(cat => !preferred.includes(cat))
  ];

  let _eagerImagesLeft = CASE_EAGER_IMAGES;
  function buildCard(caseItem) {
    const _isFree = state.freeCase?.enabled && caseItem.id === state.freeCase?.caseId;
    const _depositReward = (state.depositCaseRewards || []).find(r => r.caseId === caseItem.id);
    const _isRefCase = Boolean(state.referralCase?.enabled && caseItem.id === state.referralCase?.caseId);
    const _voucherCount = Number(state.user?.freeCaseVouchers?.[caseItem.id]) || 0;
    const _isComingSoon = Boolean(caseItem.comingSoon);
    const _badgesHtml = caseBadgesHtml(caseItem);
    const _eagerImage = _eagerImagesLeft > 0;
    if (_eagerImage) _eagerImagesLeft--;
    const _isEventLocked = Boolean(caseItem.eventOnly) && !state.honeyEvent?.active;
    const _isVoucherOnly = Boolean(caseItem.voucherOnly) && _voucherCount === 0;
    const _stakeMin = Math.round(Number(state.staking?.successCase?.minAmount) || 0);
    const _voucherNote = String(caseItem.voucherNote || '').trim();
    const _voucherOnlyLabel = _voucherNote
      ? _voucherNote.charAt(0).toUpperCase() + _voucherNote.slice(1)
      : (_stakeMin > 0 ? `Стейк ${fmt(_stakeMin)} TOK` : 'Нужен стейк');
    let priceHtml;
    if (_isComingSoon) {
      priceHtml = `<span class="case-price case-coming-soon-label">Скоро…</span>`;
    } else if (_isEventLocked) {
      priceHtml = `<span class="case-price case-coming-soon-label">Ивент не идёт</span>`;
    } else if (_voucherCount > 0) {
      priceHtml = `<span class="case-price deposit-case-label deposit-case-ready">Забрать!${_voucherCount > 1 ? ` x${_voucherCount}` : ''}</span>`;
    } else if (_isVoucherOnly) {
      priceHtml = `<span class="case-price deposit-case-label case-stake-label">${escHtml(_voucherOnlyLabel)}</span>`;
    } else if (_depositReward) {
      const _min = Number(_depositReward.depositMin) || 0;
      const _deposited = Number(state.userDepositedTOK) || 0;
      const _left = Math.max(0, _min - _deposited);
      const _lastClaimed = Number(state.user?.depositCaseLastClaimedAt) || 0;
      const _nextAvailable = _lastClaimed + 24 * 60 * 60 * 1000;
      const _msUntilAvailable = Math.max(0, _nextAvailable - Date.now());

      if (_left > 0) {
        priceHtml = `<span class="case-price deposit-case-label">Осталось ${_left} TOK</span>`;
      } else if (_msUntilAvailable > 0) {
        const _hours = Math.ceil(_msUntilAvailable / (60 * 60 * 1000));
        priceHtml = `<span class="case-price deposit-case-label">Через ${_hours}ч</span>`;
      } else if (!state.hasRecentDeposit) {
        priceHtml = `<span class="case-price deposit-case-label">Нужен депозит</span>`;
      } else {
        priceHtml = `<span class="case-price deposit-case-label deposit-case-ready">Забрать!</span>`;
      }
    } else if (_isFree) {
      if (getFreeCaseCanClaim()) {
        priceHtml = `<span class="case-price free-case-card-label free-case-card-ready">Открой!</span>`;
      } else {
        const _nextAt = getFreeCaseNextAt();
        const _ms = _nextAt ? _nextAt - Date.now() : 0;
        const _txt = _ms > 0 ? `через ${formatFreeCaseCountdown(_ms)}` : 'Открой!';
        priceHtml = `<span class="case-price free-case-card-label">${_txt}</span>`;
      }
    } else if (_isRefCase) {
      const _ref = state.referralCase || {};
      if (_ref.canClaim) {
        priceHtml = `<span class="case-price case-card-ref free-case-card-ready">Открой!</span>`;
      } else if (_ref.claimed) {
        priceHtml = `<span class="case-price case-card-ref">Уже забрано</span>`;
      } else {
        priceHtml = `<span class="case-price case-card-ref">Введите код</span>`;
      }
    } else if (caseItem.currency === 'QUEST') {
      priceHtml = `<span class="case-price case-price-quest">${caseItem.price} ${questTicketIconHtml()}</span>`;
    } else if (caseItem.currency === 'COMB') {
      priceHtml = `<span class="case-price case-price-quest">${caseItem.price} ${combIconHtml()}</span>`;
    } else {
      priceHtml = `<span class="case-price">${caseItem.price} TOK</span>`;
    }
    const _isInert = _isComingSoon || _isEventLocked;
    const _glow = (caseItem.glow && !_isInert) ? caseGlowPresentation(caseItem) : null;
    const _glowClass = _glow ? ` ${_glow.classes}` : '';
    const _glowStyle = _glow ? ` style="${_glow.vars}"` : '';
    return `
      <article class="case-card${_isFree ? ' case-card-free' : ''}${(_depositReward || _voucherCount > 0) ? ' case-card-deposit' : ''}${_isRefCase ? ' case-card-ref' : ''}${caseItem.paused ? ' case-card-paused' : ''}${_isInert ? ' case-card-coming-soon' : ''}${caseItem.currency === 'QUEST' || caseItem.currency === 'COMB' ? ' case-card-quest' : ''}${_glowClass}" data-case-id="${caseItem.id}"${_glowStyle}${caseItem.paused ? ' data-ribbon-text="ПАУЗА"' : ''}${_isInert ? ' data-coming-soon="1"' : ''}>
        ${_badgesHtml}
        <div class="case-visual">
          ${_glow?.halo ? '<div class="case-glow"></div>' : ''}
          ${mediaMarkup({...caseItem, image: _isComingSoon ? '/case-img/coming-soon-case.webp' : (caseItem.image || '/case-img/default-case.webp')}, "case-image", "case-emoji", caseItem.iconSize || 68, _eagerImage)}
        </div>
        <div class="case-title">${getCaseName(caseItem)}</div>
        <div class="case-footer">
          <span class="case-subtitle">${(caseItem.lootTable?.length || 0)} предм.</span>
          ${priceHtml}
        </div>
      </article>
    `;
  }

  if (refs.casesGrid) refs.casesGrid.innerHTML = categoryOrder.map(category => {
    const items = filtered
      .filter(c => (c.category || 'Кейсы') === category)
      .sort((a, b) => (a.sortOrder != null ? Number(a.sortOrder) : 9999) - (b.sortOrder != null ? Number(b.sortOrder) : 9999));
    if (!items.length) return '';
    return `
      <section class="case-section ${category === 'Pick-One' ? 'pick-one-section' : ''}">
        <div class="case-section-title-wrap">
          <h3 class="case-section-title">${category}</h3>
        </div>
        <div class="case-row">
          ${items.map(buildCard).join('')}
        </div>
      </section>
    `;
  }).join('');

  refs.casesGrid.querySelectorAll('.case-card').forEach(card => {
    const caseId = card.dataset.caseId;
    const caseItem = state.cases.find(x => x.id === caseId);
    if (!caseItem) return;
    if (card.dataset.comingSoon) return;

    bindSafe(card, 'click', () => openCasePage(caseItem.id));
  });
}
function expandMiniAppViewport() {
  try {
    tg?.ready?.();
    tg?.expand?.();
    if (typeof tg?.requestFullscreen === 'function') tg.requestFullscreen();
  } catch {}
}
function enterFullscreenModal() {
  document.body.classList.add('modal-fullscreen-open');
  expandMiniAppViewport();
}
function exitFullscreenModal() {
  document.body.classList.remove('modal-fullscreen-open');
}
const LIVE_DROP_MODE_ICON = {
  caseFallback: '/icon/solar/box-minimalistic-bold.svg?color=%2358A6FF',
  fuse: '/icon/solar/test-tube-bold.svg?color=%2358A6FF',
  crash: '/icon/solar/rocket-bold.svg?color=%2358A6FF',
  dice: '/icon/solar/widget-5-bold.svg?color=%2358A6FF',
  raffle: '/icon/solar/cup-star-bold.svg?color=%2358A6FF',
};
function _liveDropModeIconHtml(key) {
  return `<img src="${LIVE_DROP_MODE_ICON[key]}" class="live-card-preview-image" alt="" loading="lazy" decoding="async">`;
}
function _liveDropUpgraderIconHtml() {
  return `<svg class="nav-icon-upg live-drop-upg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path class="nav-upg-track" d="M4 12a8 8 0 1 1 16 0"/>
    <path class="nav-upg-fill" d="M4 12a8 8 0 0 1 12.9-6.32"/>
    <line class="nav-upg-needle" x1="12" y1="12" x2="12" y2="5.4"/>
    <circle class="nav-upg-hub" cx="12" cy="12" r="1.7"/>
  </svg>`;
}

function _liveCardPreviewHtml(entry) {
  if (entry.mode === 'case' || entry.mode === 'battle') {
    const c = entry.caseId ? getCaseById(entry.caseId) : null;
    const label = entry.mode === 'battle' ? 'Battle' : (c?.name || safeSourceText(entry.source));
    const media = c
      ? mediaMarkup(c, 'live-card-preview-image', 'live-card-preview-emoji', 30)
      : _liveDropModeIconHtml('caseFallback');
    return `<div class="live-card-preview"><div class="live-card-preview-media">${media}</div><span class="live-card-preview-label">${escHtml(label)}</span></div>`;
  }
  if (entry.mode === 'dice') {
    return `<div class="live-card-preview"><div class="live-card-preview-media">${_liveDropModeIconHtml('dice')}</div><span class="live-card-preview-label">Дайсы</span></div>`;
  }
  if (entry.mode === 'upgrader') {
    return `<div class="live-card-preview"><div class="live-card-preview-media">${_liveDropUpgraderIconHtml()}</div><span class="live-card-preview-label">Апгрейдер</span></div>`;
  }
  if (entry.mode === 'fuse') {
    return `<div class="live-card-preview"><div class="live-card-preview-media">${_liveDropModeIconHtml('fuse')}</div><span class="live-card-preview-label">Фьюз</span></div>`;
  }
  if (entry.mode === 'crash') {
    return `<div class="live-card-preview"><div class="live-card-preview-media">${_liveDropModeIconHtml('crash')}</div><span class="live-card-preview-label">Краш</span></div>`;
  }
  if (entry.mode === 'raffle') {
    return `<div class="live-card-preview"><div class="live-card-preview-media">${_liveDropModeIconHtml('raffle')}</div><span class="live-card-preview-label">Розыгрыш</span></div>`;
  }
  const fallbackCase = state.cases.find(c => String(c.name || '').trim().toLowerCase() === String(entry.source || '').trim().toLowerCase());
  const fallbackLabel = fallbackCase?.name || safeSourceText(entry.source);
  const fallbackMedia = fallbackCase
    ? mediaMarkup(fallbackCase, 'live-card-preview-image', 'live-card-preview-emoji', 30)
    : _liveDropModeIconHtml('caseFallback');
  return `<div class="live-card-preview"><div class="live-card-preview-media">${fallbackMedia}</div><span class="live-card-preview-label">${escHtml(fallbackLabel)}</span></div>`;
}

function _liveCardHtml(entry) {
  const avatarHtml = entry.publicId
    ? `<span class="live-card-avatar"><img src="/avatar/${escAttr(entry.publicId)}" alt="" loading="lazy" onerror="this.style.display='none'"></span>`
    : '';
  const specialBadge = (entry.scatter || entry.honey)
    ? `<span class="live-card-special-badge" title="${entry.honey ? 'Медовый дайс' : 'Радужный дайс'}">${entry.honey ? '🍯' : '🌈'}</span>`
    : '';
  const mutBadge = mutationBadgeHtml(entry.item, 'mut-badge-live');
  const oneOf = oneOfOneBadgeHtml(entry.item, 'oneof-badge-live');
  return `${avatarHtml}<div class="live-item">${mediaMarkup(entry.item, 'live-item-image', '')}<span class="live-item-name">${escHtml(itemCardName(entry.item))}</span></div>${mutBadge}${oneOf}${specialBadge}${_liveCardPreviewHtml(entry)}`;
}

function _liveCardOuterAttrs(entry) {
  const lux = luxClass(entry.item) + oneOfOneClass(entry.item);
  return entry.publicId
    ? ` class="live-card live-card-clickable${lux}" data-public-id="${escAttr(entry.publicId)}"`
    : ` class="live-card${lux}"`;
}

function renderLiveFeed() {
  const cardsHtml = () => (state.liveDrops || []).map(entry =>
    `<div${_liveCardOuterAttrs(entry)}>${_liveCardHtml(entry)}</div>`
  ).join('');
  if (refs.liveFeed) refs.liveFeed.innerHTML = cardsHtml();
  if (refs.homeLiveFeedMobile) refs.homeLiveFeedMobile.innerHTML = cardsHtml();
}

function prependLiveDrop(entry) {
  if (refs.homeLiveFeedMobile) {
    const mExisting = [...refs.homeLiveFeedMobile.children];

    const mCard = document.createElement('div');
    mCard.className = entry.publicId ? 'live-card live-card-clickable' : 'live-card';
    if (entry.publicId) mCard.dataset.publicId = entry.publicId;
    mCard.innerHTML = _liveCardHtml(entry);
    refs.homeLiveFeedMobile.insertBefore(mCard, refs.homeLiveFeedMobile.firstChild);

    const mShift = mCard.offsetWidth + 8;

    mExisting.forEach(c => {
      c.style.setProperty('--live-shift-from', `-${mShift}px`);
      c.classList.remove('live-card-shifting-x');
      void c.offsetWidth;
      c.classList.add('live-card-shifting-x');
      c.addEventListener('animationend', () => {
        c.classList.remove('live-card-shifting-x');
        c.style.removeProperty('--live-shift-from');
      }, { once: true });
    });

    mCard.getBoundingClientRect();
    mCard.classList.add('live-card-incoming');
    mCard.addEventListener('animationend', () => mCard.classList.remove('live-card-incoming'), { once: true });

    while (refs.homeLiveFeedMobile.children.length > 24) refs.homeLiveFeedMobile.removeChild(refs.homeLiveFeedMobile.lastChild);
  }

  if (!refs.liveFeed) return;

  const existing = [...refs.liveFeed.children];

  const card = document.createElement('div');
  card.className = entry.publicId ? 'live-card live-card-clickable' : 'live-card';
  if (entry.publicId) card.dataset.publicId = entry.publicId;
  card.innerHTML = _liveCardHtml(entry);
  refs.liveFeed.insertBefore(card, refs.liveFeed.firstChild);

  const shift = card.offsetHeight + 10;

  existing.forEach(c => {
    c.style.setProperty('--live-fall-from', `-${shift}px`);
    c.classList.remove('live-card-falling');
    void c.offsetWidth;
    c.classList.add('live-card-falling');
    c.addEventListener('animationend', () => {
      c.classList.remove('live-card-falling');
      c.style.removeProperty('--live-fall-from');
    }, { once: true });
  });

  card.getBoundingClientRect();
  card.classList.add('live-card-incoming');
  card.addEventListener('animationend', () => card.classList.remove('live-card-incoming'), { once: true });

  while (refs.liveFeed.children.length > 24) refs.liveFeed.removeChild(refs.liveFeed.lastChild);
}

function _goldTrophyIconHtml(color) {
  return `<img src="/icon/solar/cup-star-bold.svg?color=${encodeURIComponent(color)}" class="solar-icon" alt="🏆">`;
}
function _bestDropCardHtml(entry) {
  return `<span class="live-card-best-badge"><span class="live-card-best-badge-icon">${_goldTrophyIconHtml('#2A1600')}</span><span class="live-card-best-badge-text">24Ч</span></span>${_liveCardHtml(entry)}`;
}
function _bestDropCardOuterClass(entry) {
  return entry.publicId ? 'live-card live-card-best live-card-clickable' : 'live-card live-card-best';
}
function _bestDropBannerMobileHtml(entry) {
  const value = Math.round(Number(entry.value) || 0);
  return `<div class="live-best-banner-mobile-media">${mediaMarkup(entry.item, 'live-best-banner-mobile-image', '', 44)}</div>` +
    `<div class="live-best-banner-mobile-info">` +
      `<div class="live-best-banner-mobile-label">${_goldTrophyIconHtml('#FFC94A')} Топ дроп за 24 часа</div>` +
      `<div class="live-best-banner-mobile-name">${escHtml(itemCardName(entry.item))}</div>` +
    `</div>` +
    `<div class="live-best-banner-mobile-value">${value} TOK</div>`;
}
function renderBestDropCard(entry) {
  const desktopHtml = entry ? `<div class="${_bestDropCardOuterClass(entry)}" title="Лучший дроп за последние 24 часа"${entry.publicId ? ` data-public-id="${escAttr(entry.publicId)}"` : ''}>${_bestDropCardHtml(entry)}</div>` : '';
  if (refs.liveFeedBest) refs.liveFeedBest.innerHTML = desktopHtml;
  if (refs.homeLiveFeedBestMobile) {
    if (!entry) { refs.homeLiveFeedBestMobile.innerHTML = ''; refs.homeLiveFeedBestMobile.removeAttribute('data-public-id'); refs.homeLiveFeedBestMobile.className = 'live-best-banner-mobile'; }
    else {
      refs.homeLiveFeedBestMobile.className = entry.publicId ? 'live-best-banner-mobile live-best-banner-clickable' : 'live-best-banner-mobile';
      if (entry.publicId) refs.homeLiveFeedBestMobile.dataset.publicId = entry.publicId; else delete refs.homeLiveFeedBestMobile.dataset.publicId;
      refs.homeLiveFeedBestMobile.title = 'Лучший дроп за последние 24 часа';
      refs.homeLiveFeedBestMobile.innerHTML = _bestDropBannerMobileHtml(entry);
    }
  }
}

function renderPublicProfile(user) {
  const nameEl = document.getElementById('publicProfileName');
  const sinceEl = document.getElementById('publicProfileSince');
  const avatarEl = document.getElementById('publicProfileAvatar');
  const statsEl = document.getElementById('publicProfileStats');
  const bestEl = document.getElementById('publicProfileBest');
  const invCountEl = document.getElementById('publicProfileInvCount');
  const gridEl = document.getElementById('publicProfileInventoryGrid');
  const emptyEl = document.getElementById('publicProfileInventoryEmpty');

  if (nameEl) nameEl.textContent = user.displayName || 'Игрок';
  if (sinceEl) {
    sinceEl.textContent = user.memberSince
      ? `С нами с ${new Date(user.memberSince).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}`
      : '';
  }
  if (avatarEl) {
    avatarEl.textContent = (user.displayName || '?').trim().slice(0, 1).toUpperCase() || '?';
    if (user.avatarUrl) {
      avatarEl.innerHTML = `<img src="${escAttr(user.avatarUrl)}" alt="" onerror="this.style.display='none'">`;
    }
  }

  const stats = user.stats || {};
  if (statsEl) {
    const items = [
      { label: 'Кейсов открыто', val: stats.openings || 0 },
      { label: 'Сделано апгрейдов', val: stats.upgradesCount || 0 },
      { label: 'Батлов сыграно', val: stats.battlesCount || 0 },
      { label: 'Выведено токенов', val: stats.withdrawnTokensTotal || 0, suffix: ' TOK' },
    ];
    statsEl.innerHTML = items.map(s => `
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${escHtml(s.label)}</div>
        <div style="font-size:22px;font-weight:800;line-height:1">${fmt(s.val)}${escHtml(s.suffix || '')}</div>
      </div>`).join('');
  }

  if (bestEl) {
    const bd = user.bestDrop;
    if (bd && bd.name) {
      const img = bd.image
        ? `<img src="${escAttr(bd.image)}" class="profile-bestdrop-item-image" style="object-fit:contain;border-radius:8px;flex-shrink:0" onerror="this.style.display='none'" loading="lazy" decoding="async">`
        : bd.emoji
          ? `<span class="profile-bestdrop-item-emoji" style="line-height:1;flex-shrink:0">${escHtml(bd.emoji)}</span>`
          : '';
      bestEl.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          ${img}
          <div style="min-width:0">
            <div class="profile-bestdrop-item-name" style="font-weight:700;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(bd.name)}</div>
            <div style="font-size:25px;font-weight:800;color:var(--accent);line-height:1.2;margin-top:3px">${fmt(bd.value)} TOK</div>
          </div>
        </div>`;
    } else {
      bestEl.innerHTML = `<span class="muted" style="font-size:13px">Ещё нет лучшего дропа</span>`;
    }
  }

  const dropsListEl = document.getElementById('publicProfileDropsList');
  const dropsEmptyEl = document.getElementById('publicProfileDropsEmpty');
  const recentDrops = Array.isArray(user.recentDrops) ? user.recentDrops : [];
  if (dropsListEl) {
    dropsListEl.innerHTML = recentDrops.map(d => {
      const mediaHtml = d.image
        ? `<img src="${escAttr(d.image)}" alt="" style="width:28px;height:28px;object-fit:contain;flex-shrink:0">`
        : `<span style="font-size:20px;line-height:1;flex-shrink:0">${escHtml(d.emoji || '📦')}</span>`;
      return `
        <div class="combined-history-row">
          <div class="combined-history-icon">${mediaHtml}</div>
          <div>
            <strong>${escHtml(d.itemName)}</strong>
            <span>${escHtml(d.source ? formatEntrySource({ source: d.source }) : '—')}</span>
          </div>
          <small>${fmt(d.itemValue)} TOK</small>
        </div>`;
    }).join('');
  }
  if (dropsEmptyEl) dropsEmptyEl.classList.toggle('hidden', recentDrops.length > 0);
  bindPublicProfileDropsAccordion();

  const inventory = Array.isArray(user.inventory) ? user.inventory : [];
  if (invCountEl) invCountEl.textContent = user.inventoryCount ? `(${fmt(user.inventoryCount)})` : '';
  if (gridEl) {
    gridEl.innerHTML = inventory.map(item => {
      const mediaHtml = item.image
        ? `<img class="oos-card-img" src="${escAttr(item.image)}" alt="">`
        : `<span class="oos-card-emoji">${escHtml(item.emoji || '📦')}</span>`;
      return `<div class="oos-card">${mediaHtml}<div class="oos-card-name">${escHtml(item.name)}</div><div class="oos-card-delta">${fmt(item.value)} TOK</div></div>`;
    }).join('');
  }
  if (emptyEl) emptyEl.classList.toggle('hidden', inventory.length > 0);
}

async function openPublicProfilePage(publicId, options = {}) {
  if (!publicId) return;
  state._viewingProfilePublicId = publicId;
  navigateTo('publicProfile', { push: options.push !== false, scroll: options.scroll !== false, params: { publicId } });

  const nameEl = document.getElementById('publicProfileName');
  const sinceEl = document.getElementById('publicProfileSince');
  const loadingEl = document.getElementById('publicProfileLoading');
  const contentEl = document.getElementById('publicProfileContent');
  const errorEl = document.getElementById('publicProfileError');
  if (nameEl) nameEl.textContent = 'Профиль игрока';
  if (sinceEl) sinceEl.textContent = '';
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (contentEl) contentEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  try {
    const data = await api(`/api/users/${encodeURIComponent(publicId)}/profile`);
    if (!data?.user) throw new Error('Профиль не найден.');
    state._viewingProfileData = data.user;
    renderPublicProfile(data.user);
    syncPublicProfileEditBtn();
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
  } catch (e) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) { errorEl.textContent = e.message || 'Не удалось загрузить профиль.'; errorEl.classList.remove('hidden'); }
  }
}

function syncPublicProfileEditBtn() {
  const headStack = document.getElementById('publicProfileHeadStack');
  let editBtn = document.getElementById('publicProfileEditBtn');
  if (state._perm) {
    if (!editBtn && headStack) {
      editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.id = 'publicProfileEditBtn';
      editBtn.className = 'ghost-btn';
      editBtn.textContent = '✏ Редактировать';
      bindSafe(editBtn, 'click', () => {
        const publicId = state._viewingProfilePublicId;
        loadSection('profileEditor').then(() => openProfileStatsEditModal({
          userId: publicId,
          profile: state._viewingProfileData,
          onSaved: () => openPublicProfilePage(publicId, { push: false, scroll: false }),
        })).catch(e => showToast(e.message));
      });
      headStack.appendChild(editBtn);
    }
  } else if (editBtn) {
    editBtn.remove();
  }
}

function bindLiveFeedProfileClick() {
  if (window.__liveFeedProfileBound) return;
  window.__liveFeedProfileBound = true;
  const openFromCard = (event) => {
    const card = event.target.closest('.live-card[data-public-id], .live-best-banner-mobile[data-public-id]');
    if (!card) return;
    openPublicProfilePage(card.dataset.publicId);
  };
  bindSafe(refs.liveFeed, 'click', openFromCard);
  bindSafe(refs.homeLiveFeedMobile, 'click', openFromCard);
  bindSafe(refs.liveFeedBest, 'click', openFromCard);
  bindSafe(refs.homeLiveFeedBestMobile, 'click', openFromCard);
}

function startLiveDropsPolling() {
  if (state.liveDropsStream && state.liveDropsStream.readyState !== EventSource.CLOSED) return;
  stopLiveDropsPolling();
  try {
    const es = new EventSource('/api/live-drops/stream');
    state.liveDropsStream = es;
    state.liveDropsLastSeen = Date.now();
    const fallBackToPolling = () => {
      es.close();
      if (state.liveDropsStream === es) state.liveDropsStream = null;
      if (state.liveDropsWatchdog) { clearInterval(state.liveDropsWatchdog); state.liveDropsWatchdog = null; }
      if (!state.liveDropsTimer) {
        state.liveDropsTimer = setInterval(_pollLiveDrops, 8000);
      }
    };
    es.onmessage = (e) => {
      state.liveDropsLastSeen = Date.now();
      try {
        const drop = JSON.parse(e.data);
        state.liveDrops = [drop, ...(state.liveDrops || [])].slice(0, 24);
        if (_isLiveDropsSuppressed()) {
          (state.liveDropsQueue = state.liveDropsQueue || []).push(drop);
        } else if (document.visibilityState === 'visible') {
          prependLiveDrop(drop);
        }
      } catch {}
    };
    es.addEventListener('ping', () => { state.liveDropsLastSeen = Date.now(); });
    es.addEventListener('reload', () => {
      showToast('Сайт обновляется, страница перезагрузится через несколько секунд...');
      setTimeout(() => location.reload(), 4000);
    });
    state.liveDropsWatchdog = setInterval(() => {
      if (Date.now() - state.liveDropsLastSeen > 65000) fallBackToPolling();
    }, 15000);
    es.onerror = () => { fallBackToPolling(); };
  } catch {
    state.liveDropsTimer = setInterval(_pollLiveDrops, 8000);
  }
}

async function _pollLiveDrops() {
  if (document.visibilityState !== 'visible') return;
  try {
    const data = await api('/api/live-drops');
    state.liveDrops = data.liveDrops;
    state.bestDrop24h = data.bestDrop24h || null;
    if (!_isLiveDropsSuppressed()) {
      renderLiveFeed();
      renderBestDropCard(state.bestDrop24h);
    }
  } catch {}
}

async function _refreshBestDrop() {
  if (document.visibilityState !== 'visible') return;
  if (state.liveDropsTimer) return;
  try {
    const data = await api('/api/live-drops');
    state.bestDrop24h = data.bestDrop24h || null;
    if (!_isLiveDropsSuppressed()) renderBestDropCard(state.bestDrop24h);
  } catch {}
}

function stopLiveDropsPolling() {
  if (state.liveDropsStream) { state.liveDropsStream.close(); state.liveDropsStream = null; }
  if (state.liveDropsTimer)  { clearInterval(state.liveDropsTimer); state.liveDropsTimer = null; }
  if (state.liveDropsWatchdog) { clearInterval(state.liveDropsWatchdog); state.liveDropsWatchdog = null; }
}

function _flushLiveDropsQueue() {
  if (document.visibilityState !== 'visible') return;
  const queuedDrops = (state.liveDropsQueue || []).slice();
  state.liveDropsQueue = [];
  if (queuedDrops.length) queuedDrops.forEach(drop => prependLiveDrop(drop));
  renderBestDropCard(state.bestDrop24h);
}

function _isLiveDropsSuppressed() {
  return Boolean(state.liveDropsSuppressedUntil) && Date.now() < state.liveDropsSuppressedUntil;
}

function suppressLiveDrops(ms) {
  const until = Math.max(state.liveDropsSuppressedUntil || 0, Date.now() + ms);
  state.liveDropsSuppressedUntil = until;
  clearTimeout(state._liveDropsSuppressTimer);
  if (!Number.isFinite(until)) { state._liveDropsSuppressTimer = null; return; }
  state._liveDropsSuppressTimer = setTimeout(() => {
    state.liveDropsSuppressedUntil = 0;
    _flushLiveDropsQueue();
  }, Math.max(0, until - Date.now()));
}

let _liveFeedHoverLeaveTimer = null;

function _liveFeedHoverEnter() {
  clearTimeout(_liveFeedHoverLeaveTimer);
  _liveFeedHoverLeaveTimer = null;
  if (state._liveDropsHoverActive) return;
  state._liveDropsHoverActive = true;
  state._liveDropsHoverPausedAt = Date.now();
  state.liveDropsSuppressedUntil = Infinity;
  clearTimeout(state._liveDropsSuppressTimer);
  state._liveDropsSuppressTimer = null;
}

function _liveFeedHoverLeave() {
  clearTimeout(_liveFeedHoverLeaveTimer);
  _liveFeedHoverLeaveTimer = setTimeout(() => {
    if (!state._liveDropsHoverActive) return;
    state._liveDropsHoverActive = false;
    const pausedMs = Date.now() - (state._liveDropsHoverPausedAt || Date.now());
    state.liveDropsSuppressedUntil = 0;
    if (pausedMs > 10000) {
      state.liveDropsQueue = [];
      _pollLiveDrops();
    } else {
      _flushLiveDropsQueue();
    }
  }, 80);
}

function bindLiveFeedHoverPause() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.__liveFeedHoverBound) return;
  window.__liveFeedHoverBound = true;
  [refs.liveFeed, refs.liveFeedBest].filter(Boolean).forEach(container => {
    bindSafe(container, 'mouseover', (e) => {
      const card = e.target.closest('.live-card');
      if (!card || !container.contains(card)) return;
      if (card.contains(e.relatedTarget)) return;
      _liveFeedHoverEnter();
    });
    bindSafe(container, 'mouseout', (e) => {
      const card = e.target.closest('.live-card');
      if (!card || !container.contains(card)) return;
      if (card.contains(e.relatedTarget)) return;
      _liveFeedHoverLeave();
    });
  });
}

function bindInstantSellActions(container = document) {
  container.querySelectorAll('[data-sell-win-uid]').forEach(btn => {
    if (btn.dataset.boundSellWin === '1') return;
    btn.dataset.boundSellWin = '1';
    bindSafe(btn, 'click', async (e) => {
      e.stopPropagation();
      const uid = btn.dataset.sellWinUid;
      if (!uid) return;
      btn.disabled = true;
      try {
        const data = await api('/api/inventory/sell', {
          method: 'POST',
          body: JSON.stringify({ uid })
        });
        state.user = data.user;
        renderAllUserData();
        playSellSound();
        showToast(`Продано: ${data.sold.name} за ${data.price} TOK`);
        const wrap = btn.closest('.result-line-wrap, .pick-win-actions, .roulette-result-under, .roulette-lane-actions');
        if (wrap) {
          wrap.innerHTML = `<div class="sold-inline-note">Продано за ${data.price} TOK</div>`;
        }
      } catch (err) {
        btn.disabled = false;
        showToast(err.message);
      }
    });
  });
}
function bindSellAllWinActions(container = document) {
  container.querySelectorAll('[data-sell-all-win-uids]').forEach(btn => {
    if (btn.dataset.boundSellAllWin === '1') return;
    btn.dataset.boundSellAllWin = '1';
    bindSafe(btn, 'click', async (e) => {
      e.stopPropagation();
      const uids = String(btn.dataset.sellAllWinUids || '').split(',').map(x => x.trim()).filter(Boolean);
      if (!uids.length) return;
      btn.disabled = true;
      try {
        const data = await api('/api/inventory/sell-multi', {
          method: 'POST',
          body: JSON.stringify({ uids })
        });
        state.user = data.user;
        renderAllUserData();
        playSellSound();
        const isEn = getCurrentLanguage() === 'en';
        showToast(isEn ? `Sold ${data.count} pcs for ${data.total} TOK` : `Продано ${data.count} шт. за ${data.total} TOK`);
        const rouletteWindows = refs.rouletteWindows || document.getElementById('rouletteWindows');
        if (rouletteWindows) {
          rouletteWindows.querySelectorAll('[data-sell-win-uid]').forEach(node => {
            node.disabled = true;
            const wrap = node.closest('.roulette-lane-actions');
            if (wrap) wrap.innerHTML = `<div class="sold-inline-note">${isEn ? 'Sold' : 'Продано'}</div>`;
          });
        }
        const note = document.createElement('div');
        note.className = 'sold-inline-note';
        note.textContent = isEn ? `Sold for ${data.total} TOK` : `Продано за ${data.total} TOK`;
        btn.replaceWith(note);
      } catch (err) {
        btn.disabled = false;
        showToast(err.message);
      }
    });
  });
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

const BASE_KEYWORDS = 'brainrot, кейсы, открытие кейсов, telegram webapp, brainrot battle, казино, лудка, лудоман, лудомания, азарт, азартные игры, ставки, джекпот, выигрыш, рулетка, слоты, гемблинг';
function updatePageMeta(title, description, url, keywords) {
  const t = title || 'Brainrot Battle — открывай кейсы с брейнротами';
  const d = description || 'Telegram WebApp: открывай кейсы, фьюзи брейнротов, сражайся в батлах.';
  const u = url || window.location.href;
  document.title = t;
  const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  const setLink = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('href', val); };
  setMeta('meta[name="description"]', d);
  setLink('link[rel="canonical"]', u);
  setMeta('meta[property="og:title"]', t);
  setMeta('meta[property="og:description"]', d);
  setMeta('meta[property="og:url"]', u);
  setMeta('meta[name="twitter:title"]', t);
  setMeta('meta[name="twitter:description"]', d);
  if (keywords) setMeta('meta[name="keywords"]', keywords);
}

function getRoutePath(view, params = {}) {
  if (view === 'home') return '/';
  if (view === 'profile') return '/profile';
  if (view === 'fuse') return '/fuse';
  if (view === 'ladder') return '/ladder';
  if (view === 'battle') return '/battle';
  if (view === 'upgrader') return '/upgrader';
  if (view === 'dice') return '/dice';
  if (view === 'crash') return '/crash';
  if (view === 'event') return '/event';
  if (view === 'quests') return '/quests';
  if (view === 'raffle') return '/raffle';
  if (view === 'faq') return '/faq';
  if (view === 'bonus') return '/bonus';
  if (view === 'ops') return '/ops';
  if (view === 'case') {
    const c = getCaseById(params.caseId || state.selectedCaseId);
    return c ? `/case/${encodeURIComponent(slugify(c.name))}` : '/';
  }
  if (view === 'item') {
    const i = state.brainrotMap.get(params.itemId || state.selectedItemId);
    return i ? `/item/${encodeURIComponent(slugify(i.name))}` : '/';
  }
  if (view === 'publicProfile') {
    const id = params.publicId || state._viewingProfilePublicId;
    return id ? `/player/${encodeURIComponent(id)}` : '/';
  }
  return '/';
}

function applyRouteFromLocation() {
  const path = window.location.pathname || '/';

  if (path === '/' || path === '/home') {
    navigateTo('home', { push: false, scroll: false });
    return;
  }
  if (path === '/profile') {
    navigateTo('profile', { push: false, scroll: false });
    return;
  }
  if (path === '/fuse') {
    navigateTo('fuse', { push: false, scroll: false });
    return;
  }
  if (path === '/ladder') {
    navigateTo('ladder', { push: false, scroll: false });
    return;
  }
  if (path === '/battle') {
    navigateTo('battle', { push: false, scroll: false });
    return;
  }
  if (path === '/upgrader') {
    navigateTo('upgrader', { push: false, scroll: false });
    return;
  }
  if (path === '/dice') {
    navigateTo('dice', { push: false, scroll: false });
    return;
  }
  if (path === '/crash') {
    navigateTo('crash', { push: false, scroll: false });
    return;
  }
  if (path === '/event') {
    navigateTo('event', { push: false, scroll: false });
    return;
  }
  if (path === '/quests') {
    navigateTo('quests', { push: false, scroll: false });
    return;
  }
  if (path === '/raffle') {
    navigateTo('raffle', { push: false, scroll: false });
    return;
  }
  if (path === '/partners') {
    navigateTo('bonus', { push: true, scroll: false });
    return;
  }
  if (path === '/staking') {
    navigateTo('bonus', { push: true, scroll: false });
    return;
  }
  if (path === '/faq') {
    navigateTo('faq', { push: false, scroll: false });
    return;
  }
  if (path === '/bonus') {
    navigateTo('bonus', { push: false, scroll: false });
    return;
  }
  if (path === '/ops' || path === '/admin') {
    if (state._perm) navigateTo('ops', { push: false, scroll: false });
    else navigateTo('home', { push: false, scroll: false });
    return;
  }
  if (path.startsWith('/case/')) {
    const slug = decodeURIComponent(path.slice('/case/'.length));
    const found = state.cases.find(c => slugify(c.name) === slug);
    if (found) openCasePage(found.id, { push: false, scroll: false });
    else navigateTo('home', { push: false, scroll: false });
    return;
  }
  if (path.startsWith('/item/')) {
    const slug = decodeURIComponent(path.slice('/item/'.length));
    const found = state.brainrots.find(i => slugify(i.name) === slug);
    if (found) openItemPage(found.id, { push: false, scroll: false });
    else navigateTo('home', { push: false, scroll: false });
    return;
  }
  if (path.startsWith('/player/')) {
    const id = decodeURIComponent(path.slice('/player/'.length));
    if (id) openPublicProfilePage(id, { push: false, scroll: false });
    else navigateTo('home', { push: false, scroll: false });
    return;
  }

  navigateTo('home', { push: false, scroll: false });
}

bindSafe(window, 'popstate', () => {
  applyRouteFromLocation();
});

const _analyticsQueue = { pageviews: [] };
let _analyticsFlushTimer = null;

function scheduleAnalyticsFlush() {
  if (_analyticsFlushTimer) return;
  _analyticsFlushTimer = setTimeout(flushAnalyticsQueue, 20000);
}

async function flushAnalyticsQueue() {
  _analyticsFlushTimer = null;
  if (!_analyticsQueue.pageviews.length) return;
  const payload = {
    pageviews: _analyticsQueue.pageviews.splice(0, 50),
  };
  try {
    await api('/api/analytics/track', { method: 'POST', body: JSON.stringify(payload) });
  } catch {}
  if (_analyticsQueue.pageviews.length) scheduleAnalyticsFlush();
}

function trackAnalyticsPageview(view) {
  try {
    _analyticsQueue.pageviews.push({ view: view || 'unknown', ts: Date.now() });
    scheduleAnalyticsFlush();
  } catch {}
}

let _uiClickAudioCtx = null;
let _uiClickGainNode = null;
let _uiClickAudioBuffer = null;
let _uiClickAudioBufferLoading = null;
let _uiLastClickSoundMs = 0;

function _ensureUiClickAudioCtx() {
  if (_uiClickAudioCtx) return _uiClickAudioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    _uiClickAudioCtx = new Ctx();
    _uiClickGainNode = _uiClickAudioCtx.createGain();
    _uiClickGainNode.gain.value = 0.04375;
    _uiClickGainNode.connect(_uiClickAudioCtx.destination);
  } catch (e) { return null; }
  return _uiClickAudioCtx;
}

function _loadUiClickBuffer() {
  if (_uiClickAudioBuffer) return Promise.resolve(_uiClickAudioBuffer);
  if (_uiClickAudioBufferLoading) return _uiClickAudioBufferLoading;
  const ctx = _ensureUiClickAudioCtx();
  if (!ctx) return Promise.resolve(null);
  _uiClickAudioBufferLoading = fetch('/click.mp3?v=2')
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .then(decoded => { _uiClickAudioBuffer = decoded; return decoded; })
    .catch(() => null);
  return _uiClickAudioBufferLoading;
}

function _playUiClickBuffer(buffer) {
  try {
    const src = _uiClickAudioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(_uiClickGainNode);
    src.start(0);
  } catch (e) {}
}

function playUiClickSound() {
  if (!isSoundOn()) return;
  const now = Date.now();
  if (now - _uiLastClickSoundMs < 30) return;
  _uiLastClickSoundMs = now;
  if (_uiClickAudioBuffer && _uiClickAudioCtx) {
    if (_uiClickAudioCtx.state !== 'running') _uiClickAudioCtx.resume().catch(() => {});
    _playUiClickBuffer(_uiClickAudioBuffer);
    return;
  }
  _loadUiClickBuffer();
}

function initUiClickSound() {
  if (window.__uiClickSoundBound) return;
  window.__uiClickSoundBound = true;
  _loadUiClickBuffer();
  document.addEventListener('click', (e) => {
    if (e.target.closest('button,[role="button"],[data-nav],[data-payment-method],.case-card')) playUiClickSound();
  }, true);
}

let _sellAudioCtx = null;
let _sellGainNode = null;
let _sellAudioBuffer = null;
let _sellAudioBufferLoading = null;
let _uiLastSellSoundMs = 0;

function _ensureSellAudioCtx() {
  if (_sellAudioCtx) return _sellAudioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    _sellAudioCtx = new Ctx();
    _sellGainNode = _sellAudioCtx.createGain();
    _sellGainNode.gain.value = 0.04375;
    _sellGainNode.connect(_sellAudioCtx.destination);
  } catch (e) { return null; }
  return _sellAudioCtx;
}

function _loadSellAudioBuffer() {
  if (_sellAudioBuffer) return Promise.resolve(_sellAudioBuffer);
  if (_sellAudioBufferLoading) return _sellAudioBufferLoading;
  const ctx = _ensureSellAudioCtx();
  if (!ctx) return Promise.resolve(null);
  _sellAudioBufferLoading = fetch('/sell-coins.wav?v=1')
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .then(decoded => { _sellAudioBuffer = decoded; return decoded; })
    .catch(() => null);
  return _sellAudioBufferLoading;
}

function playSellSound() {
  if (!isSoundOn()) return;
  const now = Date.now();
  if (now - _uiLastSellSoundMs < 150) return;
  _uiLastSellSoundMs = now;
  if (_sellAudioBuffer && _sellAudioCtx) {
    if (_sellAudioCtx.state !== 'running') _sellAudioCtx.resume().catch(() => {});
    try {
      const src = _sellAudioCtx.createBufferSource();
      src.buffer = _sellAudioBuffer;
      src.connect(_sellGainNode);
      src.start(0);
    } catch (e) {}
    return;
  }
  _loadSellAudioBuffer();
}

let _caseOpenAudioCtx = null;
let _caseOpenGainNode = null;
let _caseOpenAudioBuffer = null;
let _caseOpenAudioBufferLoading = null;
let _uiLastCaseOpenSoundMs = 0;

function _ensureCaseOpenAudioCtx() {
  if (_caseOpenAudioCtx) return _caseOpenAudioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    _caseOpenAudioCtx = new Ctx();
    _caseOpenGainNode = _caseOpenAudioCtx.createGain();
    _caseOpenGainNode.gain.value = 0.0188;
    _caseOpenGainNode.connect(_caseOpenAudioCtx.destination);
  } catch (e) { return null; }
  return _caseOpenAudioCtx;
}

function _loadCaseOpenAudioBuffer() {
  if (_caseOpenAudioBuffer) return Promise.resolve(_caseOpenAudioBuffer);
  if (_caseOpenAudioBufferLoading) return _caseOpenAudioBufferLoading;
  const ctx = _ensureCaseOpenAudioCtx();
  if (!ctx) return Promise.resolve(null);
  _caseOpenAudioBufferLoading = fetch('/case-open.wav?v=11')
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .then(decoded => { _caseOpenAudioBuffer = decoded; return decoded; })
    .catch(() => null);
  return _caseOpenAudioBufferLoading;
}

function playCaseOpenSound() {
  if (!isSoundOn()) return;
  const now = Date.now();
  if (now - _uiLastCaseOpenSoundMs < 400) return;
  _uiLastCaseOpenSoundMs = now;
  if (_caseOpenAudioBuffer && _caseOpenAudioCtx) {
    if (_caseOpenAudioCtx.state !== 'running') _caseOpenAudioCtx.resume().catch(() => {});
    try {
      const src = _caseOpenAudioCtx.createBufferSource();
      src.buffer = _caseOpenAudioBuffer;
      src.connect(_caseOpenGainNode);
      src.start(0);
    } catch (e) {}
    return;
  }
  _loadCaseOpenAudioBuffer();
}

const GAME_SFX = {
  'crash-launch': { url: '/sfx/crash-launch.wav?v=7', gain: 0.0308 },
  'crash-cashout': { url: '/sfx/crash-cashout.wav?v=6', gain: 0.026 },
  'crash-burst': { url: '/sfx/crash-burst.wav?v=6', gain: 0.0517 },
  'crash-fly': { url: '/sfx/crash-fly.wav?v=2', gain: 0.014, loop: true },
  'crash-tick': { url: '/sfx/crash-tick.wav?v=1', gain: 0.0187 },
  'dice-roll': { url: '/sfx/dice-roll.wav?v=2', gain: 0.0255 },
  'dice-land': { url: '/sfx/dice-land.wav?v=1', gain: 0.0254 },
  'dice-spin': { url: '/sfx/dice-spin.wav?v=4', gain: 0.028, loop: true },
  'dice-bonus': { url: '/sfx/dice-bonus.wav?v=1', gain: 0.0163 },
};
let _gameSfxCtx = null;
const _gameSfxBuffers = new Map();
const _gameSfxLoading = new Map();

function _ensureGameSfxCtx() {
  if (_gameSfxCtx) return _gameSfxCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try { _gameSfxCtx = new Ctx(); } catch (e) { return null; }
  return _gameSfxCtx;
}

function preloadGameSfx(names) {
  const ctx = _ensureGameSfxCtx();
  if (!ctx) return;
  for (const name of names) {
    const cfg = GAME_SFX[name];
    if (!cfg || _gameSfxBuffers.has(name) || _gameSfxLoading.has(name)) continue;
    _gameSfxLoading.set(name, fetch(cfg.url)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => { _gameSfxBuffers.set(name, decoded); return decoded; })
      .catch(() => null));
  }
}

function playGameSfx(name) {
  if (!isSoundOn()) return;
  const cfg = GAME_SFX[name];
  if (!cfg) return;
  const buffer = _gameSfxBuffers.get(name);
  if (!buffer) { preloadGameSfx([name]); return; }
  const ctx = _ensureGameSfxCtx();
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  try {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = cfg.gain;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
  } catch (e) {}
}

const _gameSfxLoops = new Map();

function startGameSfxLoop(name) {
  if (!isSoundOn()) return;
  const cfg = GAME_SFX[name];
  if (!cfg || !cfg.loop || _gameSfxLoops.has(name)) return;
  const buffer = _gameSfxBuffers.get(name);
  const ctx = _ensureGameSfxCtx();
  if (!buffer || !ctx) { preloadGameSfx([name]); return; }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  try {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(cfg.gain, t + 0.06);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
    _gameSfxLoops.set(name, { src, gain });
  } catch (e) {}
}

function stopGameSfxLoop(name) {
  const node = _gameSfxLoops.get(name);
  if (!node) return;
  _gameSfxLoops.delete(name);
  try {
    const t = _gameSfxCtx.currentTime;
    node.gain.gain.cancelScheduledValues(t);
    node.gain.gain.setValueAtTime(node.gain.gain.value, t);
    node.gain.gain.linearRampToValueAtTime(0, t + 0.08);
    node.src.stop(t + 0.12);
  } catch (e) {
    try { node.src.stop(0); } catch (e2) {}
  }
}

function rampGameSfxLoop(name, rate, seconds) {
  const node = _gameSfxLoops.get(name);
  if (!node) return;
  try {
    const t = _gameSfxCtx.currentTime;
    const p = node.src.playbackRate;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    p.linearRampToValueAtTime(Math.max(0.05, rate), t + Math.max(0.05, seconds));
  } catch (e) {}
}

function initAnalyticsTracking() {
  return;
  if (window.__analyticsTrackingBound) return;
  window.__analyticsTrackingBound = true;
  const flushBeacon = () => {
    if (!_analyticsQueue.pageviews.length) return;
    try {
      const blob = new Blob(
        [JSON.stringify({ pageviews: _analyticsQueue.pageviews.splice(0) })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/analytics/track', blob);
    } catch {}
  };
  window.addEventListener('beforeunload', flushBeacon);
  window.addEventListener('pagehide', flushBeacon);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushBeacon(); });
}

function navigateTo(view, options = {}) {
  const { push = true, scroll = true, params = {} } = options;
  if (!state._perm) {
    const featureKey = view === 'home' ? 'cases' : view;
    if (state.closedFeatures[featureKey]) { showToast('Раздел временно закрыт'); return; }
  }
  if ((view === 'profile' || view === 'fuse' || view === 'battle' || view === 'ladder' || view === 'upgrader' || view === 'dice' || view === 'crash' || view === 'quests') && requireSiteAuth(view)) return;
  if (view === 'ops' || view === 'caseEditor') {
    if (state.authMode === 'telegram') {
      if (!state._perm) return;
    } else {
      if (requireSiteAuth(view)) return;
      if (!state._perm) return;
    }
  }
  if (view !== 'case') {
    const multiRow = document.querySelector('.multi-open-row');
    if (multiRow) multiRow.classList.remove('hidden');
  }
  if (state.currentView !== view) {
    if (state.currentView === 'raffle' && typeof _rfStopTicker === 'function') _rfStopTicker();
    if (state.currentView === 'ops' && typeof stopOpsAccountPoolTicker === 'function') stopOpsAccountPoolTicker();
    if (state.currentView === 'crash' && typeof stopGameSfxLoop === 'function') stopGameSfxLoop('crash-fly');
    if (state.currentView === 'crash' && typeof teardownCrashView === 'function') teardownCrashView();
  }
  state.previousView = state.currentView;
  state.currentView = view;
  trackAnalyticsPageview(view);
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  const targetView = document.getElementById(`${view}View`);
  if (targetView) targetView.classList.add('active-view');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.nav === view));
  document.body.classList.toggle('dice-fullbleed-active', view === 'dice');
  document.body.classList.toggle('crash-fullbleed-active', view === 'crash');
  document.body.classList.toggle('event-fullbleed-active', view === 'event');
  if (view === 'fuse') loadSection('fuse').then(() => renderFuseSection()).catch(e => showToast(e.message));
  if (view === 'upgrader') loadSection('upgrader').then(() => renderUpgraderSection()).catch(e => showToast(e.message));
  if (view === 'dice') loadSection('dice').then(() => initDiceView()).catch(e => showToast(e.message));
  if (view === 'quests') loadSection('quests').then(() => initQuestsView()).catch(e => showToast(e.message));
  if (view === 'faq') loadSection('faq').then(() => initFaqView()).catch(e => showToast(e.message));
  if (view === 'profile') { renderProfile(); renderBonusView(); }
  if (view === 'ops') _initOpsView().then(() => renderOpsView().catch(e => showToast(e.message))).catch(e => showToast(e.message || 'Нет доступа к разделу'));
  if (view === 'ladder') loadSection('ladder').then(() => renderLadderMode()).catch(e => showToast(e.message));
  if (view === 'battle') loadSection('battle').then(() => { renderBattleHub().catch(e => showToast(e.message)); startBattlePolling(); }).catch(e => showToast(e.message));
  if (view === 'bonus') {
    renderBonusView();
    applyPartnerBoardNav();
    if (state.partnerBoard?.enabled) {
      loadSection('partnerBoard').then(() => initPartnerBoardView()).catch(e => showToast(e.message));
    }
    bindStakingControls();
    loadStaking();
  }
  if (view === 'dice') loadSection('dice').then(() => initDiceView()).catch(e => showToast(e.message));
  if (view === 'crash') loadSection('crash').then(() => { initCrashView(); if (typeof resumeCrashView === 'function') resumeCrashView(); }).catch(e => showToast(e.message));
  if (view === 'event') loadSection('event').then(() => initEventView()).catch(e => showToast(e.message));
  if (view === 'raffle') loadSection('raffle').then(() => initRaffleView()).catch(e => showToast(e.message));
  if (typeof getRoutePath === 'function' && push) {
    const path = getRoutePath(view, params);
    if (window.location.pathname !== path) history.pushState({}, '', path);
  }
  const pageSeo = {
    home:    { t: 'Brainrot Battle — открывай кейсы с брейнротами', k: BASE_KEYWORDS + ', sigma, skibidi, ohio, rizz' },
    fuse:     { t: 'Fuse — объединяй брейнротов | Brainrot Battle',  k: 'fuse брейнрот, апгрейд, объединить предметы, ' + BASE_KEYWORDS },
    upgrader: { t: 'Апгрейдер — ставь предмет на колесе | Brainrot Battle', k: 'апгрейдер, upgrader, колесо, ставка предметом, ' + BASE_KEYWORDS },
    ladder:  { t: 'Лесенка — рискуй и умножай | Brainrot Battle',   k: 'лесенка, ladder, множитель ставки, ' + BASE_KEYWORDS },
    battle:  { t: 'Батл — дуэль на кейсах | Brainrot Battle',  k: 'батл, pvp, дуэль, ' + BASE_KEYWORDS },
    profile: { t: 'Профиль | Brainrot Battle' },
    bonus:   { t: 'Бонусы — рефералы и промокоды | Brainrot Battle', k: 'бонус, реферал, промокод, ' + BASE_KEYWORDS },
    quests:  { t: 'Квесты — выполняй задания за награду | Brainrot Battle', k: 'квесты, задания, награда, ' + BASE_KEYWORDS },
    crash:   { t: 'Краш — забери выигрыш до краша | Brainrot Battle', k: 'краш, crash, aviator, множитель, ' + BASE_KEYWORDS },
    faq:     { t: 'FAQ — частые вопросы | Brainrot Battle', k: 'faq, вопросы, помощь, поддержка, ' + BASE_KEYWORDS },
    raffle: { t: 'Розыгрыши за депозит — призы за день, неделю и месяц | Brainrot Battle', k: 'розыгрыш, приз, депозит, брейнрот, giveaway, ' + BASE_KEYWORDS },
    ops:   { t: 'Ops | Brainrot Battle' },
  };
  if (pageSeo[view]) updatePageMeta(pageSeo[view].t, null, null, pageSeo[view].k || null);
  if (view === 'home' && state._returnToCaseId) {
    const caseId = state._returnToCaseId;
    state._returnToCaseId = null;
    scrollHomeToCase(caseId);
  } else if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  localizeCurrentView();
}

function scrollHomeToCase(caseId, попыток = 24) {
  const карточка = document.querySelector(`[data-case-id="${CSS.escape(String(caseId))}"]`);
  if (!карточка) {
    if (попыток > 0) requestAnimationFrame(() => scrollHomeToCase(caseId, попыток - 1));
    return;
  }
  карточка.scrollIntoView({ block: 'center', behavior: 'auto' });
  карточка.classList.add('case-card--returned');
  setTimeout(() => карточка.classList.remove('case-card--returned'), 1600);
}

function renderCaseIdleReel(caseItem) {
  const track = document.getElementById('caseReelIdleTrack');
  if (!track) return;
  const items = (caseItem?.lootTable || []).map(e => lootRowItem(e)).filter(Boolean);
  if (!items.length) { track.innerHTML = ''; return; }
  const half = [];
  const MIN = 14;
  for (let i = 0; i < Math.max(MIN, items.length); i++) half.push(items[i % items.length]);
  const cardHtml = (item) => {
    const cardName = itemCardName(item);
    const nameLen = cardName.length;
    const nameCls = nameLen > 20 ? ' name-xlong' : nameLen > 14 ? ' name-long' : '';
    return '<div class="roulette-item' + luxClass(item) + oneOfOneClass(item) + '">'
      + mutationBadgeHtml(item, 'mut-badge-roulette')
      + '<div class="roulette-emoji">' + mediaMarkup(item, 'roulette-image', '') + oneOfOneBadgeHtml(item, 'oneof-badge-roulette') + '</div>'
      + '<div class="roulette-name' + nameCls + '">' + escHtml(cardName) + '</div>'
      + '<div class="roulette-value">' + escHtml(String(item.value)) + ' TOK</div>'
      + '</div>';
  };
  track.innerHTML = half.map(cardHtml).join('') + half.map(cardHtml).join('');
}

function showCaseReelIdle(force) {
  const idle = document.getElementById('caseReelIdle');
  const lanes = document.getElementById('caseRouletteWindows');
  if (!idle || !lanes) return;
  if (!force && (state.spinning || lanes.dataset.hasResult === '1')) return;
  try { (state.rouletteCleanups || []).splice(0).forEach(fn => { try { fn(); } catch {} }); } catch {}
  delete lanes.dataset.hasResult;
  lanes.innerHTML = '';
  lanes.classList.add('hidden');
  document.getElementById('caseReelBulkActions')?.remove();
  document.getElementById('caseReelSkipBtn')?.classList.add('hidden');
  idle.classList.remove('hidden');
}

function openCasePage(caseId, options = {}) {
  const c = getCaseById(caseId);
  if (!c) return;
  if (c.paused && !state._perm) { showCasePausedModal(); return; }

  const _isDepositRewardPage = (state.depositCaseRewards || []).some(r => r.caseId === caseId);
  if (_isDepositRewardPage && state._depositCaseSyncInFlight !== caseId) {
    state._depositCaseSyncInFlight = caseId;
    syncUserState(true).finally(() => {
      if (state._depositCaseSyncInFlight === caseId) state._depositCaseSyncInFlight = null;
    });
  }

  state.selectedCaseId = caseId;
  state._returnToCaseId = caseId;
  if (refs.caseLootPreview) refs.caseLootPreview.innerHTML = '';

  if (c.mode === 'ladder') {
    refs.casePageSubtitle.textContent = `${c.description} На каждой ступени можно забрать приз или рискнуть дальше.`;
  }

  refs.casePageSubtitle.textContent = c.description;
  if (refs.caseShowcaseEmoji) refs.caseShowcaseEmoji.innerHTML = mediaMarkup({...c, image: c.image || '/case-img/default-case.webp'}, 'case-showcase-image', '', c.iconSize || 96);
  refs.caseShowcaseName.textContent = getCaseName(c);
  if (refs.casePrice) refs.casePrice.innerHTML = c.currency === 'QUEST' ? `${c.price} ${questTicketIconHtml()}` : c.currency === 'COMB' ? `${c.price} ${combIconHtml()}` : `${c.price} TOK`;
  if (refs.casePriceRow) refs.casePriceRow.classList.remove('hidden');
  const _isEnCase = getCurrentLanguage() === 'en';
  if (refs.caseItemsCount) refs.caseItemsCount.textContent = c.mode === 'ladder' ? (_isEnCase ? '5 steps' : '5 шагов') : `${(c.lootTable?.length || 0)}`;
  refs.openSelectedCaseBtn.textContent = false ? (_isEnCase ? 'Open hidden choice' : 'Открыть скрытый выбор') : (c.mode === 'ladder' ? (_isEnCase ? 'Open ladder' : 'Открыть лесенку') : (_isEnCase ? 'Open case' : 'Открыть кейс'));
  refs.caseShowcase.style.background = ``;
  refs.caseShowcaseGlow.style.background = `radial-gradient(circle, ${hexToRgba(c.accent, .45)}, transparent 60%)`;

  if (c.mode === 'ladder') {
    refs.casePageSubtitle.textContent = `${c.description} На каждой ступени можно забрать приз или рискнуть дальше.`;
  }
  if (false) {
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.className = 'loot-chip hidden-drop';
      if (el) el.innerHTML = `<span>❓</span><strong>Скрытый дроп</strong><em>выберешь 1</em>`;
      refs.caseLootPreview.appendChild(el);
    }
  } else {
    const previewTable = Array.isArray(c.lootTable) ? c.lootTable : [];
    [...previewTable]
      .map(e => lootRowItem(e))
      .filter(Boolean)
      .sort((a, b) => b.value - a.value)
      .forEach(item => {
        const el = document.createElement('div');
        el.className = `loot-chip loot-chip-static${luxClass(item)}${oneOfOneClass(item)}`;
        el.innerHTML = `<span class="loot-chip-art">${mediaMarkup(item, "loot-chip-image", "")}${mutationBadgeHtml(item, "mut-badge-loot")}${oneOfOneBadgeHtml(item, "oneof-badge-loot")}<em class="loot-chip-price">${escHtml(String(item.value))} TOK</em></span><strong>${escHtml(itemCardName(item))}</strong>`;
        refs.caseLootPreview.appendChild(el);
      });
  }

  if (c.mode === 'ladder') {
    refs.casePageSubtitle.textContent = `${c.description} На каждой ступени можно забрать приз или рискнуть дальше.`;
  }
  if (false) {
    state.openCount = 1;
  }
  setOpenCount(state.openCount);
  document.querySelectorAll('.open-count-btn').forEach(btn => {
    const value = Number(btn.dataset.openCount);
    const disabled = false && value !== 1;
    btn.disabled = disabled;
    btn.classList.toggle('disabled', disabled);
  });
  const isGuest = state.authMode === 'guest';
  refs.openSelectedCaseBtn.disabled = isGuest;
  refs.openSelectedCaseBtn.textContent = isGuest
    ? 'Войди через Telegram, чтобы открыть кейс'
    : (false ? 'Открыть скрытый выбор' : 'Открыть кейс');
  const _multiRow = document.querySelector('.multi-open-row');
  const _isFreeCasePage = Boolean(state.freeCase?.enabled && state.selectedCaseId === state.freeCase?.caseId);
  const _isReferralCasePage = Boolean(state.referralCase?.enabled && state.selectedCaseId === state.referralCase?.caseId);
  const _depositRewardCfg = (state.depositCaseRewards || []).find(r => r.caseId === caseId);
  const _voucherCount = Number(state.user?.freeCaseVouchers?.[caseId]) || 0;
  const _selectedCase = (state.cases || []).find(c => c.id === caseId);
  const _isVoucherOnlyPage = Boolean(_selectedCase && _selectedCase.voucherOnly) && _voucherCount === 0;
  const _stakeMinPage = Math.round(Number(state.staking?.successCase?.minAmount) || 0);
  if (_depositRewardCfg) {
    const _min = Number(_depositRewardCfg.depositMin) || 0;
    if (refs.casePrice) refs.casePrice.textContent = `Депозит ${_min} TOK`;
  }
  if (_isFreeCasePage && refs.casePriceRow) refs.casePriceRow.classList.add('hidden');
  if (_isReferralCasePage && refs.casePriceRow) refs.casePriceRow.classList.add('hidden');
  if (_voucherCount > 0 && refs.casePriceRow) refs.casePriceRow.classList.add('hidden');
  if (_isVoucherOnlyPage && refs.casePriceRow) refs.casePriceRow.classList.add('hidden');
  if (_voucherCount > 0 && !isGuest) {
    if (_multiRow) _multiRow.classList.add('hidden');
    refs.openSelectedCaseBtn.disabled = false;
    refs.openSelectedCaseBtn.textContent = _voucherCount > 1 ? `ОТКРЫТЬ БЕСПЛАТНО (x${_voucherCount})` : 'ОТКРЫТЬ БЕСПЛАТНО';
  } else if (_isVoucherOnlyPage && !isGuest) {
    if (_multiRow) _multiRow.classList.add('hidden');
    refs.openSelectedCaseBtn.disabled = true;
    const _voucherNotePage = String(_selectedCase?.voucherNote || '').trim();
    refs.openSelectedCaseBtn.textContent = _voucherNotePage
      ? `Кейс не продаётся — ${_voucherNotePage}`
      : (_stakeMinPage > 0 ? `Нужен стейк от ${fmt(_stakeMinPage)} TOK` : 'Нужен стейк');
  } else if (_depositRewardCfg && !isGuest) {
    if (_multiRow) _multiRow.classList.add('hidden');
    const _deposited = Number(state.userDepositedTOK) || 0;
    const _min = Number(_depositRewardCfg.depositMin) || 0;
    const _left = Math.max(0, _min - _deposited);
    const _lastClaimed = Number(state.user?.depositCaseLastClaimedAt) || 0;
    const _nextAvailable = _lastClaimed + 24 * 60 * 60 * 1000;
    const _msUntilAvailable = Math.max(0, _nextAvailable - Date.now());

    if (_left > 0) {
      refs.openSelectedCaseBtn.disabled = true;
      refs.openSelectedCaseBtn.textContent = `Осталось задепать: ${_left} TOK`;
    } else if (_msUntilAvailable > 0) {
      refs.openSelectedCaseBtn.disabled = true;
      const _hours = Math.ceil(_msUntilAvailable / (60 * 60 * 1000));
      refs.openSelectedCaseBtn.textContent = `Кейс доступен через ${_hours}ч`;
    } else if (!state.hasRecentDeposit) {
      refs.openSelectedCaseBtn.disabled = false;
      refs.openSelectedCaseBtn.textContent = 'Нужен депозит за 24ч';
    } else {
      refs.openSelectedCaseBtn.disabled = false;
      refs.openSelectedCaseBtn.textContent = 'Забрать!';
    }
  } else if (_isFreeCasePage && !isGuest) {
    if (_multiRow) _multiRow.classList.add('hidden');
    const _canClaim = getFreeCaseCanClaim();
    if (_canClaim) {
      refs.openSelectedCaseBtn.textContent = 'ОТКРЫТЬ БЕСПЛАТНО';
      refs.openSelectedCaseBtn.disabled = false;
    } else {
      const _nextAt = getFreeCaseNextAt();
      const _ms = _nextAt ? _nextAt - Date.now() : 0;
      refs.openSelectedCaseBtn.textContent = _ms > 0 ? `Следующий через ${formatFreeCaseCountdown(_ms)}` : 'ОТКРЫТЬ БЕСПЛАТНО';
      refs.openSelectedCaseBtn.disabled = _ms > 0;
    }
  } else if (_isReferralCasePage && !isGuest) {
    if (_multiRow) _multiRow.classList.add('hidden');
    if (state.referralCase.canClaim) {
      refs.openSelectedCaseBtn.textContent = 'ЗАБРАТЬ РЕФЕРАЛЬНЫЙ КЕЙС';
      refs.openSelectedCaseBtn.disabled = false;
    } else if (state.referralCase.claimed) {
      refs.openSelectedCaseBtn.textContent = 'Уже получено';
      refs.openSelectedCaseBtn.disabled = true;
    } else {
      refs.openSelectedCaseBtn.textContent = 'Введите код';
      refs.openSelectedCaseBtn.disabled = true;
    }
  } else {
    if (_multiRow) _multiRow.classList.remove('hidden');
  }
  renderCaseIdleReel(c);
  const _reelLanes = document.getElementById('caseRouletteWindows');
  if (_reelLanes && _reelLanes.dataset.caseId !== String(caseId)) {
    _reelLanes.dataset.caseId = String(caseId);
    showCaseReelIdle(true);
  } else {
    showCaseReelIdle(false);
  }
  const dropNames = (c.lootTable || []).map(e => lootRowItem(e)?.name).filter(Boolean).slice(0, 6).join(', ');
  updatePageMeta(
    `Кейс ${c.name} — ${c.price} TOK | Brainrot Battle`,
    `${c.description || `Открой кейс «${c.name}» и получи редких брейнротов`}. ${(c.lootTable || []).length} предметов в пуле.`,
    window.location.origin + `/case/${encodeURIComponent(slugify(c.name))}`,
    `${c.name}, кейс ${c.name}, открыть кейс, ${dropNames}, ${BASE_KEYWORDS}`
  );
  navigateTo('case', { push: options.push !== false, scroll: options.scroll !== false, params: { caseId } });
  syncCaseEditBtn();
}

function syncCaseEditBtn() {
  const headStack = document.getElementById('casePageHeadStack');
  let editBtn = document.getElementById('caseEditBtn');
  if (state._perm) {
    if (!editBtn && headStack) {
      editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.id = 'caseEditBtn';
      editBtn.className = 'ghost-btn';
      editBtn.textContent = '✏ Редактировать';
      bindSafe(editBtn, 'click', () => {
        loadSection('caseEditor').then(() => openCaseEditor(state.selectedCaseId)).catch(e => showToast(e.message));
      });
      headStack.appendChild(editBtn);
    }
  } else if (editBtn) {
    editBtn.remove();
  }
}

function openItemPage(itemId, options = {}) {
  const item = state.brainrotMap.get(itemId);
  if (!item) return;
  state.selectedItemId = itemId;
  refs.itemPageTitle.textContent = item.name;
  refs.itemPageSubtitle.textContent = `${item.value} TOK`;
  refs.itemHero.className = 'item-hero';
  if (refs.itemHeroEmoji) refs.itemHeroEmoji.innerHTML = mediaMarkup(item, 'item-hero-image', '');
  refs.itemHeroName.textContent = item.name;
  if (refs.itemHeroRarity) refs.itemHeroRarity.textContent = '';
  refs.itemHeroValue.textContent = `${item.value} TOK`;
  refs.itemHeroDesc.textContent = item.desc;
  if (refs.itemRelated) refs.itemRelated.innerHTML = '';
  state.brainrots.filter(x => x.id !== item.id).slice(0, 4).forEach(rel => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'related-card';
    c.innerHTML = `<div class="item-emoji">${mediaMarkup(rel, "related-image", "")}</div><div class="item-name">${escHtml(rel.name)}</div><div class="item-value">${escHtml(String(rel.value))} TOK</div>`;
    bindSafe(c, 'click', () => openItemPage(rel.id));
    refs.itemRelated.appendChild(c);
  });
  updatePageMeta(
    `${item.name} ${item.emoji} — ${item.value} TOK | Brainrot Battle`,
    `${item.name} — брейнрот стоимостью ${item.value} TOK. ${item.desc || ''}`,
    window.location.origin + `/item/${encodeURIComponent(slugify(item.name))}`,
    `${item.name}, брейнрот ${item.value} TOK, ${BASE_KEYWORDS}`
  );
  navigateTo('item', { push: options.push !== false, scroll: options.scroll !== false, params: { itemId } });
}
function renderActivity() { if (refs.activityList) refs.activityList.innerHTML = state.user.activity.map(entry => `<div class="activity-row"><strong>${escHtml(entry.time)}</strong><span>${escHtml(entry.text)}</span></div>`).join(''); }
function renderLadderEditor(config) {
  refs.ladderStepCount.value = Number(config.stepCount || 5);
  refs.ladderRtp.value = Number(config.rtp || 20);
  if (refs.opsLadderRows) refs.opsLadderRows.innerHTML = (config.steps || []).map((step, idx) => `
    <div class="ops-ladder-row">
      <input data-label="${idx}" value="${escAttr(step.label || `Шаг ${idx + 1}`)}" />
      <input data-mult="${idx}" type="number" step="0.01" value="${Number(step.multiplier ?? 1)}" />
      <input data-chance="${idx}" type="number" step="0.01" value="${Number(step.surviveChance || 0.2)}" />
    </div>
  `).join('');
}

function applyUserUpdate(user) { state.user = user; renderAllUserData(); }

async function quickWithdrawItem(uid) {
  if (!state.user || state.user.id === 'guest-user') { showToast('Войди в аккаунт'); return; }
  try {
    const contact = state.user.username || state.user.displayName || state.user.id || '';
    const data = await api('/api/withdrawals/create', { method: 'POST', body: JSON.stringify({ uids: [uid], contact }) });
    if (data.user) applyUserUpdate(data.user);
    showToast('Предмет отправлен на вывод');
  } catch (e) { showToast(e.message || 'Ошибка'); }
}

function renderProfileInventory() {
  if (refs.profileInventoryGrid) refs.profileInventoryGrid.innerHTML = '';
  state.user.inventory.forEach(entry => {
    const item = entry.item;
    const node = document.createElement('div');
    node.className = `inventory-card${luxClass(item)}${oneOfOneClass(item)}`;
    if (item.category === 'case_voucher') {
      node.innerHTML = `
        <div class="inventory-card-top">${mutationBadgeHtml(item, "mut-badge-inv")}<div class="item-emoji big">${mediaMarkup(item, "inventory-image", "")}${oneOfOneBadgeHtml(item, "oneof-badge-inv")}</div><div><div class="item-name">${escHtml(itemCardName(item))}</div><div class="item-value">Кейс</div></div></div>
        <div class="inventory-actions">
          <div class="item-source item-source-badge muted">${escHtml(formatEntrySource(entry))}</div>
          <div class="inv-action-btns"><button type="button" class="primary-btn small case-voucher-claim-btn">Забрать</button></div>
        </div>`;
      bindSafe(node.querySelector('.case-voucher-claim-btn'), 'click', async () => {
        try {
          const data = await api(`/api/inventory/case-voucher/${encodeURIComponent(entry.uid)}/claim`, { method: 'POST', body: JSON.stringify({}) });
          state.user = data.user; renderAllUserData();
          renderCases(refs.caseSearch?.value || '');
          showToast(`Кейс «${data.caseName}» получен — теперь можно открыть его бесплатно!`);
        } catch (e) { showToast(e.message); }
      });
    } else if (entry.withdrawalPending) {
      node.innerHTML = `
        <div class="inventory-card-top">${mutationBadgeHtml(item, "mut-badge-inv")}<div class="item-emoji big">${mediaMarkup(item, "inventory-image", "")}${oneOfOneBadgeHtml(item, "oneof-badge-inv")}</div><div><div class="item-name">${escHtml(itemCardName(item))}</div><div class="item-value">${escHtml(String(item.value))} TOK</div></div></div>
        <div class="inventory-actions">
          <div class="item-source item-source-badge muted">${escHtml(formatEntrySource(entry))}</div>
          <div class="inv-action-btns inv-pending-wrap">
            <button type="button" class="primary-btn small sell-btn" disabled>Продать</button>
            <button type="button" class="inv-withdraw-btn withdraw-item-btn" disabled>Вывод</button>
            <div class="inv-pending-overlay">На выводе</div>
          </div>
        </div>`;
    } else {
      node.innerHTML = `
        <div class="inventory-card-top">${mutationBadgeHtml(item, "mut-badge-inv")}<div class="item-emoji big">${mediaMarkup(item, "inventory-image", "")}${oneOfOneBadgeHtml(item, "oneof-badge-inv")}</div><div><div class="item-name">${escHtml(itemCardName(item))}</div><div class="item-value">${escHtml(String(item.value))} TOK</div></div></div>
        <div class="inventory-actions">
          <div class="item-source item-source-badge muted">${escHtml(formatEntrySource(entry))}</div>
          <div class="inv-action-btns"><button type="button" class="primary-btn small sell-btn">Продать</button><button type="button" class="inv-withdraw-btn withdraw-item-btn">Вывод</button></div>
        </div>`;
      bindSafe(node.querySelector('.sell-btn'), 'click', async () => {
        try {
          const data = await api('/api/inventory/sell', { method: 'POST', body: JSON.stringify({ uid: entry.uid }) });
          state.user = data.user; renderAllUserData(); playSellSound(); showToast(`Продано: ${data.sold.name} за ${data.price} TOK`);
        } catch (e) { showToast(e.message); }
      });
  bindSafe(node.querySelector('.withdraw-item-btn'), 'click', () => {
  if (!isEntryWithdrawable(entry, item)) {
  openExchangeBlockedModal(entry.uid, itemCardName(item));
  return;
  }
  if ((item.value || 0) < (state.minWithdrawValue || 65)) {
  showMinWithdrawModal(item.name);
  return;
  }
  openWithdrawalModal(entry.uid);
  });
    }
    refs.profileInventoryGrid.appendChild(node);
  });
}
function renderProfileStats() {
  const u = state.user;
  if (!u) return;
  const stats = u.houseStats || {};

  const bestDropEl = document.getElementById('profileBestDropBody');
  if (bestDropEl) {
    const bd = u.bestDrop;
    if (bd && bd.name) {
      const img = bd.image
        ? `<img src="${escAttr(bd.image)}" class="profile-bestdrop-item-image" style="object-fit:contain;border-radius:8px;flex-shrink:0" onerror="this.style.display='none'" loading="lazy" decoding="async">`
        : bd.emoji
          ? `<span class="profile-bestdrop-item-emoji" style="line-height:1;flex-shrink:0">${escHtml(bd.emoji)}</span>`
          : '';
      bestDropEl.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          ${img}
          <div style="min-width:0">
            <div class="profile-bestdrop-item-name" style="font-weight:700;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(bd.name)}</div>
            <div class="profile-best-drop-value" style="font-size:25px;font-weight:800;color:var(--accent);line-height:1.2;margin-top:3px">${Number(bd.value).toLocaleString('ru')} TOK</div>
          </div>
        </div>`;
    } else {
      bestDropEl.innerHTML = `<span class="muted" style="font-size:13px">Ещё не открыл ни одного кейса</span>`;
    }
  }

  const statsEl = document.getElementById('profileStatsBody');
  if (statsEl) {
  const modeItems = Array.isArray(state.profileGameStats)
    ? state.profileGameStats.map(m => ({ label: m.label, val: m.count }))
    : [
      { label: 'Кейсов открыто',   val: stats.openings      || 0 },
      { label: 'Апгрейдов',        val: stats.upgradesCount || 0 },
      { label: 'Батлов сыграно',   val: stats.battlesCount  || 0 },
    ];
  const items = [
    ...modeItems,
    { label: 'Выведено токенов', val: stats.withdrawnTokensTotal  || 0, suffix: ' TOK' }
  ];
    statsEl.innerHTML = items.map(s => `
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${escHtml(s.label)}</div>
        <div style="font-size:22px;font-weight:800;line-height:1">${Number(s.val).toLocaleString('ru')}${escHtml(s.suffix || '')}</div>
      </div>`).join('');
  }
}

function bindHistoryAccordion() {
  const btn   = document.getElementById('historyToggleBtn');
  const panel = document.getElementById('historyPanel');
  if (!btn || !panel || btn._accordionBound) return;
  btn._accordionBound = true;
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

function bindPublicProfileDropsAccordion() {
  const btn   = document.getElementById('publicProfileDropsToggleBtn');
  const panel = document.getElementById('publicProfileDropsPanel');
  if (!btn || !panel || btn._accordionBound) return;
  btn._accordionBound = true;
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

let _profileGameStatsPending = false;
async function loadProfileGameStats(force = false) {
  if (_profileGameStatsPending) return;
  if (!force && Array.isArray(state.profileGameStats)) return;
  _profileGameStatsPending = true;
  try {
    const r = await api('/api/profile/game-stats');
    state.profileGameStats = Array.isArray(r.modes) ? r.modes : [];
    renderProfileStats();
  } catch {   }
  finally { _profileGameStatsPending = false; }
}
function renderProfile() { renderBalance(); renderProfileInventory(); renderActivity(); renderProfileStats(); loadProfileGameStats(); bindHistoryAccordion(); }

const REF_LEVEL_META = [
  { level: 1, name: 'Бронза',  icon: '/badges/bronze.png',  pct: 3,  minRefs: 0   },
  { level: 2, name: 'Серебро', icon: '/badges/silver.png',  pct: 5,  minRefs: 10  },
  { level: 3, name: 'Золото',  icon: '/badges/gold.png',    pct: 7,  minRefs: 50  },
  { level: 4, name: 'Платина', icon: '/badges/platina.png', pct: 10, minRefs: 250 },
  { level: 5, name: 'Рубин',   icon: '/badges/rubin.png',   pct: 15, minRefs: 750 },
];

async function renderBonusView() {
  const isGuest = !state.userId || state.userId === 'guest-user';

  const refApplyCard = document.getElementById('refApplyCard');

  if (isGuest) {
    const refCodeDisplay = document.getElementById('refCodeDisplay');
    if (refCodeDisplay) {
      document.getElementById('refCodeValue').textContent = '—';
    }
    document.getElementById('refReferredCount').textContent = '—';
    document.getElementById('refTotalEarned').textContent = '—';
    document.getElementById('refPendingEarnings').textContent = '—';
    const refClaimBtnGuest = document.getElementById('refClaimBtn');
    if (refClaimBtnGuest) refClaimBtnGuest.classList.add('is-inactive');
    document.getElementById('refLevelName').textContent = '—';
    document.getElementById('refLevelIcon').textContent = '?';
    renderRefLevelsGrid(null);
    const growthWrap = document.getElementById('refGrowthChartWrap');
    if (growthWrap) growthWrap.innerHTML = '<div class="muted" style="font-size:12.5px">Нужен вход.</div>';
    if (refApplyCard) refApplyCard.classList.add('hidden');
    document.getElementById('partnerApplyCard')?.classList.add('hidden');
    document.getElementById('subPartnerCard')?.classList.add('hidden');
    _bindBonusEvents(isGuest);
    return;
  }

  if (refApplyCard) refApplyCard.classList.remove('hidden');

  try {
    const data = await api('/api/referral');
    _renderRefData(data);
  } catch (e) {
    showToast('Не удалось загрузить реферальные данные');
  }

  try {
    const pdata = await api('/api/partner');
    renderPartnerPanel(pdata);
    if (pdata?.isPartner && pdata.active) await loadPartnerPromoList();
  } catch (e) {}

  loadRefGrowth(_refGrowthPeriod);
  loadNameTagPromoStatus();
  loadPartnerApplicationState();
  _bindBonusEvents(isGuest);
}

async function loadPartnerApplicationState() {
  const card = document.getElementById('partnerApplyCard');
  if (!card) return;
  let data;
  try { data = await api('/api/partner-application/my'); } catch { return; }
  if (data?.isPartner) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  const btn = document.getElementById('partnerApplyBtn');
  const status = document.getElementById('partnerApplyStatus');
  const app = data?.application || null;
  if (status) status.className = 'pa-status';
  if (!app) {
    if (btn) { btn.classList.remove('is-inactive'); btn.textContent = 'Подать заявку'; }
    if (status) status.textContent = '';
    return;
  }
  if (app.status === 'pending') {
    if (btn) { btn.classList.add('is-inactive'); btn.textContent = 'Заявка отправлена'; }
    if (status) { status.textContent = 'На рассмотрении — ответ придёт в личку от бота.'; status.classList.add('is-pending'); }
    return;
  }
  const readyAt = Number(app.createdAt || 0) + 24 * 60 * 60 * 1000;
  const canRetry = Date.now() >= readyAt;
  if (btn) { btn.classList.toggle('is-inactive', !canRetry); btn.textContent = 'Подать заявку снова'; }
  if (status) {
    if (app.status === 'approved') {
      status.textContent = 'Заявку одобрили — с тобой свяжется менеджер.';
      status.classList.add('is-approved');
    } else {
      status.textContent = canRetry ? 'Прошлую заявку отклонили.' : 'Прошлую заявку отклонили. Новую можно подать через сутки.';
      status.classList.add('is-declined');
    }
  }
}

function _renderNameTagPromoStatus(status) {
  const card = document.getElementById('nameTagPromoCard');
  if (!card) return;
  if (!status || !status.enabled) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  const tagEl = document.getElementById('nameTagPromoTagText');
  if (tagEl && status.tag) tagEl.textContent = status.tag;
  const rewardEl = document.getElementById('nameTagPromoRewardText');
  if (rewardEl) {
    const н = status.reward;
    if (н && н.type === 'case') {
      rewardEl.textContent = н.ready
        ? `${н.caseEmoji || '🎟️'} кейс «${н.caseName}»${н.qty > 1 ? ` ×${н.qty}` : ''}`
        : 'скоро';
    } else if (status.rewardAmount) {
      rewardEl.textContent = `${status.rewardAmount} TOK`;
    }
  }
  const btn = document.getElementById('nameTagPromoClaimBtn');
  const statusText = document.getElementById('nameTagPromoStatusText');
  const canClaim = status.canClaim !== false && (!status.nextClaimAt || Date.now() >= Number(status.nextClaimAt));
  if (btn) btn.classList.toggle('is-inactive', !canClaim);
  if (statusText) statusText.textContent = canClaim || !status.nextClaimAt ? '' : `Доступно через ${formatFreeCaseCountdown(Number(status.nextClaimAt) - Date.now())}`;
}

async function loadNameTagPromoStatus() {
  if (!state.userId || state.userId === 'guest-user') { document.getElementById('nameTagPromoCard')?.classList.add('hidden'); return; }
  try {
    const data = await api('/api/name-tag-promo/status');
    _renderNameTagPromoStatus(data);
  } catch (e) {}
}

async function loadPartnerPromoList() {
  try {
    const data = await api('/api/partner/promo');
    renderPartnerPromoList(data.promos || []);
  } catch (e) {}
}

function renderPartnerPromoList(promos) {
  const list = document.getElementById('partnerPromoList');
  if (!list) return;
  if (!promos.length) { list.innerHTML = '<div class="muted" style="font-size:12px">Пока нет созданных промокодов.</div>'; return; }
  list.innerHTML = promos.map(p => {
    const left = Math.max(0, (p.maxUses || 0) - (p.uses || 0));
    const canCancel = left > 0;
    const isGift = !p.createdByPartnerUserId;
    const giftBadge = isGift ? '<span class="muted" style="font-size:11px">🎁 подарок</span>' : '';
    const rewardLabel = p.type === 'case'
      ? `${escHtml(p.caseEmoji || '🎟️')} ${escHtml(p.caseName || 'кейс')}`
      : `${escHtml(String(p.amount))} TOK`;
    return `<div class="partner-history-row" data-promo-id="${escAttr(p.id)}">
      <span><b>${escHtml(p.code)}</b> — ${rewardLabel} × ${escHtml(String(p.uses || 0))}/${escHtml(String(p.maxUses || 0))} ${giftBadge}</span>
      ${canCancel ? `<button type="button" class="ghost-btn small partner-promo-cancel-btn" data-promo-id="${escAttr(p.id)}">Отменить</button>` : `<span class="muted" style="font-size:11px">исчерпан</span>`}
    </div>`;
  }).join('');
}

function renderPartnerPanel(data) {
  const card = document.getElementById('partnerCard');
  if (!card) return;
  const isActivePartner = Boolean(data && data.isPartner && data.active);
  const hasClaimableLeftover = Boolean(data && data.isPartner && !data.active && (data.balance ?? 0) > 0);
  const showPartnerCard = isActivePartner || hasClaimableLeftover;
  const standardCardsVisible = !isActivePartner;
  ['refCodeCard', 'refStatsCard', 'refGrowthCard'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', !standardCardsVisible);
  });
  document.getElementById('partnerGrowthCard')?.classList.toggle('hidden', !isActivePartner);
  document.getElementById('subPartnerCard')?.classList.toggle('hidden', !isActivePartner);
  if (isActivePartner) loadSubPartners();
  document.getElementById('partnerPromoCard')?.classList.toggle('hidden', !isActivePartner);
  document.getElementById('partnerCasePromoCard')?.classList.toggle('hidden', !isActivePartner);
  if (isActivePartner) loadPartnerGrowth(_partnerGrowthPeriod);
  if (!showPartnerCard) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  document.getElementById('partnerActiveBlock')?.classList.toggle('hidden', !isActivePartner);
  document.getElementById('partnerRevokedNotice')?.classList.toggle('hidden', isActivePartner);
  state.partnerData = data;

  const codeEl = document.getElementById('partnerCodeValue');
  const rateEl = document.getElementById('partnerRateValue');
  const countEl = document.getElementById('partnerReferredCount');
  const earnedEl = document.getElementById('partnerTotalEarned');
  const claimedEl = document.getElementById('partnerTotalClaimed');
  const balanceEl = document.getElementById('partnerBalanceValue');
  const claimBtn = document.getElementById('partnerClaimBtn');
  const hintEl = document.getElementById('partnerClaimHint');
  const linkRow = document.getElementById('partnerDeepLinkRow');
  const linkValueEl = document.getElementById('partnerDeepLinkValue');

  if (codeEl) codeEl.textContent = data.code || '—';
  if (rateEl) rateEl.textContent = `${data.rate || 0}%`;
  if (countEl) countEl.textContent = data.referredCount ?? 0;
  if (earnedEl) { earnedEl.textContent = `${data.totalEarned ?? 0} TOK`; earnedEl.style.color = (data.totalEarned ?? 0) < 0 ? '#3868c0' : ''; }
  if (claimedEl) claimedEl.textContent = `${data.totalClaimed ?? 0} TOK`;
  if (balanceEl) { balanceEl.textContent = `${data.balance ?? 0} TOK`; balanceEl.style.color = (data.balance ?? 0) < 0 ? '#3868c0' : ''; }
  if (claimBtn) claimBtn.classList.toggle('is-inactive', !(data.claimWindowOpen && (data.balance ?? 0) > 0));
  if (hintEl) {
    hintEl.textContent = data.claimWindowOpen
      ? 'Окно вывода открыто (суббота 12:00–20:00 МСК).'
      : 'Вывод доступен только по субботам с 12:00 до 20:00 МСК.';
  }
  if (linkRow && linkValueEl) {
    const botUsername = state.tgBotUsername || state.telegramStarsBotUsername;
    if (botUsername && data.code) {
      linkValueEl.textContent = `https://telegram.me/${botUsername}?start=ref_${data.code}`;
      linkRow.classList.remove('hidden');
    } else {
      linkRow.classList.add('hidden');
    }
  }
}

function _paSetStep(step) {
  document.getElementById('partnerApplyStep1')?.classList.toggle('hidden', step !== 1);
  document.getElementById('partnerApplyStep1Footer')?.classList.toggle('hidden', step !== 1);
  document.getElementById('partnerApplyStep2')?.classList.toggle('hidden', step !== 2);
  document.getElementById('partnerApplyStep2Footer')?.classList.toggle('hidden', step !== 2);
}

function closePartnerApplyModal() {
  const modal = document.getElementById('partnerApplyModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function openPartnerApplyModal() {
  const modal = document.getElementById('partnerApplyModal');
  if (!modal) return;
  _paSetStep(1);
  const agree = document.getElementById('partnerApplyAgree');
  const nextBtn = document.getElementById('partnerApplyNextBtn');
  if (agree) agree.checked = false;
  if (nextBtn) nextBtn.disabled = true;
  document.getElementById('paError')?.classList.add('hidden');

  const invited = Boolean(getStoredSubRef());
  document.getElementById('paInvitedNote')?.classList.toggle('hidden', !invited);
  document.getElementById('paReferredByField')?.classList.toggle('hidden', invited);

  const contact = document.getElementById('paContact');
  if (contact && !contact.value) {
    const tgUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
    if (tgUsername) contact.value = '@' + tgUsername;
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

let _paKindClosePicker = null;

function initPaKindPicker() {
  const root = document.getElementById('paKindPicker');
  const trigger = document.getElementById('paKindTrigger');
  const list = document.getElementById('paKindList');
  const label = document.getElementById('paKindLabel');
  const input = document.getElementById('paKind');
  if (!root || !trigger || !list || !label || !input) return;

  const options = Array.from(list.querySelectorAll('[data-pa-kind]'));
  if (!options.length) return;
  const indexOfValue = () => Math.max(0, options.findIndex((o) => o.dataset.paKind === input.value));
  let activeIdx = indexOfValue();

  const setActive = (idx) => {
    activeIdx = (idx + options.length) % options.length;
    options.forEach((o, i) => o.classList.toggle('is-active', i === activeIdx));
    options[activeIdx].scrollIntoView({ block: 'nearest' });
  };

  const close = () => {
    if (list.hidden) return;
    list.hidden = true;
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    if (!list.hidden) return;
    list.hidden = false;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    setActive(indexOfValue());
  };
  _paKindClosePicker = close;

  const pick = (opt) => {
    input.value = opt.dataset.paKind;
    label.textContent = opt.textContent;
    options.forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
    close();
    trigger.focus();
  };

  bindSafe(trigger, 'click', (e) => { e.stopPropagation(); if (list.hidden) open(); else close(); });
  bindSafe(list, 'click', (e) => {
    const opt = e.target.closest('[data-pa-kind]');
    if (!opt) return;
    e.stopPropagation();
    pick(opt);
  });
  options.forEach((o, i) => bindSafe(o, 'mousemove', () => setActive(i)));
  bindSafe(document, 'click', (e) => { if (!root.contains(e.target)) close(); });

  bindSafe(root, 'keydown', (e) => {
    if (e.key === 'Escape') {
      if (list.hidden) return;
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) { open(); return; }
      setActive(activeIdx + (e.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (list.hidden) return;
      e.preventDefault();
      pick(options[activeIdx]);
    }
  });
}
let _partnerApplyModalBound = false;
function bindPartnerApplyModal(isGuest) {
  if (_partnerApplyModalBound) return;
  _partnerApplyModalBound = true;

  bindSafe(document.getElementById('partnerApplyBtn'), 'click', () => {
    if (isGuest) { showToast('Нужен вход'); return; }
    if (document.getElementById('partnerApplyBtn')?.classList.contains('is-inactive')) {
      showToast(document.getElementById('partnerApplyStatus')?.textContent || 'Заявка уже подана');
      return;
    }
    openPartnerApplyModal();
  });
  bindSafe(document.getElementById('partnerApplyCloseBtn'), 'click', closePartnerApplyModal);
  bindSafe(document.getElementById('partnerApplyBackBtn'), 'click', () => _paSetStep(1));
  bindSafe(document.getElementById('partnerApplyAgree'), 'change', (e) => {
    const btn = document.getElementById('partnerApplyNextBtn');
    if (btn) btn.disabled = !e.target.checked;
  });
  bindSafe(document.getElementById('partnerApplyNextBtn'), 'click', () => {
    if (!document.getElementById('partnerApplyAgree')?.checked) return;
    _paSetStep(2);
    document.getElementById('paContact')?.focus();
  });
  bindSafe(document.getElementById('partnerApplySubmitBtn'), 'click', submitPartnerApplication);
  initPaKindPicker();
}

async function submitPartnerApplication() {
  const btn = document.getElementById('partnerApplySubmitBtn');
  const errEl = document.getElementById('paError');
  const showErr = (text) => {
    if (!errEl) { showToast(text); return; }
    errEl.textContent = text;
    errEl.classList.remove('hidden');
  };
  errEl?.classList.add('hidden');

  const val = (id) => document.getElementById(id)?.value?.trim() || '';
  const payload = {
    contact: val('paContact').replace(/^@/, ''),
    kind: document.getElementById('paKind')?.value || 'other',
    tgChannel: val('paTgChannel'),
    youtube: val('paYoutube'),
    tiktok: val('paTiktok'),
    about: val('paAbout'),
    referredBy: val('paReferredBy'),
    subref: getStoredSubRef(),
  };
  if (!payload.contact) { showErr('Укажи Telegram для связи.'); return; }
  if (!payload.tgChannel && !payload.youtube && !payload.tiktok) {
    showErr('Укажи хотя бы одну площадку: канал, YouTube или TikTok.');
    return;
  }

  if (btn) { btn.classList.add('is-inactive'); btn.textContent = 'Отправляем...'; }
  try {
    await api('/api/partner-application', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    showErr(e.message || 'Не удалось отправить заявку.');
    if (btn) { btn.classList.remove('is-inactive'); btn.textContent = 'Отправить заявку'; }
    return;
  }
  if (btn) { btn.classList.remove('is-inactive'); btn.textContent = 'Отправить заявку'; }
  try { localStorage.removeItem(SUBREF_STORAGE_KEY); } catch {}
  closePartnerApplyModal();
  showToast('Заявка отправлена — ответ придёт в личку от бота');
  loadPartnerApplicationState();
}

async function loadSubPartners() {
  const card = document.getElementById('subPartnerCard');
  if (!card) return;
  let data;
  try { data = await api('/api/partner/subpartners'); } catch { return; }
  if (!data?.isPartner) { card.classList.add('hidden'); return; }

  const rateEl = document.getElementById('subPartnerRateInline');
  if (rateEl) rateEl.textContent = String(data.rate ?? 5);
  const countEl = document.getElementById('subPartnerCount');
  if (countEl) countEl.textContent = String(data.count ?? 0);
  const earnedEl = document.getElementById('subPartnerEarned');
  if (earnedEl) earnedEl.textContent = (data.totalEarned ?? 0) + ' TOK';

  const linkRow = document.getElementById('subPartnerLinkRow');
  const linkValueEl = document.getElementById('subPartnerLinkValue');
  if (linkRow && linkValueEl) {
    const botUsername = state.tgBotUsername || state.telegramStarsBotUsername;
    if (botUsername && data.code) {
      linkValueEl.textContent = 'https://telegram.me/' + botUsername + '?start=subref_' + data.code;
      linkRow.classList.remove('hidden');
    } else {
      linkRow.classList.add('hidden');
    }
  }

  const list = document.getElementById('subPartnerList');
  if (!list) return;
  const rows = [];
  for (const sub of (data.subPartners || [])) {
    const off = sub.active ? '' : '<span class="sp-row-off">не активен</span>';
    rows.push('<div class="sp-row"><span class="sp-row-name">' + escHtml(sub.displayName) + off +
      '</span><span class="sp-row-earned">' + escHtml(String(sub.earned)) + ' TOK</span></div>');
  }
  for (const p of (data.pending || [])) {
    rows.push('<div class="sp-row is-pending"><span class="sp-row-name">' + escHtml(p.displayName) +
      '</span><span class="sp-row-earned">заявка на рассмотрении</span></div>');
  }
  list.innerHTML = rows.length ? rows.join('') :
    '<div class="sp-empty">Пока никого. Отправь ссылку выше тому, кого хочешь привести — он заполнит анкету, а после одобрения появится здесь.</div>';
}

function renderPartnerGrowthChartSvg(seriesList) {
  const W = 600, H = 140, PAD = 6;
  const n = seriesList[0]?.points.length || 0;
  if (!n) return '<div class="muted" style="font-size:12.5px">Нет данных.</div>';
  const allVals = seriesList.flatMap(s => s.points.map(p => Number(p.value) || 0));
  const maxVal = Math.max(0, ...allVals);
  const minVal = Math.min(0, ...allVals);
  const range = Math.max(1, maxVal - minVal);
  const toY = v => H - PAD - ((v - minVal) / range) * (H - PAD * 2);
  const toPoly = (points) => points.map((p, i) => {
    const x = n > 1 ? (i / (n - 1)) * (W - PAD * 2) + PAD : W / 2;
    return `${x.toFixed(1)},${toY(Number(p.value) || 0).toFixed(1)}`;
  }).join(' ');
  const zeroLine = minVal < 0 ? `<line x1="${PAD}" y1="${toY(0).toFixed(1)}" x2="${W - PAD}" y2="${toY(0).toFixed(1)}" stroke="rgba(255,255,255,.15)" stroke-dasharray="4,4" />` : '';
  const lines = seriesList.map(s => `<polyline points="${toPoly(s.points)}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`).join('');
  const labels = seriesList[0].points.map(p => p.label);
  const step = Math.max(1, Math.floor(n / 6));
  const labelsHtml = labels.map((l, i) => (i % step === 0 || i === n - 1) ? `<span>${escHtml(l)}</span>` : '<span></span>').join('');
  const hoverLine = `<line class="ref-growth-hover-line" x1="0" y1="0" x2="0" y2="${H}" stroke="rgba(255,255,255,.25)" stroke-width="1" style="display:none" />`;
  return `<svg class="ref-growth-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${zeroLine}${lines}${hoverLine}</svg><div class="ref-growth-chart-labels">${labelsHtml}</div>`;
}

function bindGrowthChartTooltip(wrap, tooltipData, rowsBuilder) {
  const svg = wrap.querySelector('svg.ref-growth-chart');
  if (!svg || !tooltipData || !tooltipData.length) return;
  const tooltip = document.createElement('div');
  tooltip.className = 'ref-growth-tooltip';
  wrap.appendChild(tooltip);
  const hoverLine = svg.querySelector('.ref-growth-hover-line');
  const W = 600, PAD = 6;
  const n = tooltipData.length;

  function showAt(clientX) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const relX = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const svgX = (relX / rect.width) * W;
    const idx = n > 1 ? Math.round(((svgX - PAD) / (W - PAD * 2)) * (n - 1)) : 0;
    const clamped = Math.min(n - 1, Math.max(0, idx));
    const day = tooltipData[clamped];
    if (!day) return;

    if (hoverLine) {
      const lineX = n > 1 ? (clamped / (n - 1)) * (W - PAD * 2) + PAD : W / 2;
      hoverLine.setAttribute('x1', lineX.toFixed(1));
      hoverLine.setAttribute('x2', lineX.toFixed(1));
      hoverLine.style.display = '';
    }

    tooltip.innerHTML = `<div class="ref-growth-tooltip-date">${escHtml(day.label || '')}</div>${rowsBuilder(day)}`;
    tooltip.style.display = 'block';
    const pct = n > 1 ? (clamped / (n - 1)) * 100 : 50;
    tooltip.style.left = `${Math.min(88, Math.max(12, pct))}%`;
  }
  function hide() {
    tooltip.style.display = 'none';
    if (hoverLine) hoverLine.style.display = 'none';
  }

  bindSafe(wrap, 'mousemove', (e) => showAt(e.clientX));
  bindSafe(wrap, 'mouseleave', hide);
  bindSafe(wrap, 'touchstart', (e) => { if (e.touches[0]) showAt(e.touches[0].clientX); }, { passive: true });
  bindSafe(wrap, 'touchmove', (e) => { if (e.touches[0]) showAt(e.touches[0].clientX); }, { passive: true });
}

const growthNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

function partnerGrowthTooltipRows(day) {
  const rows = [
    { color: '#a78bfa', label: 'Регистрации', value: growthNum(day.registrations) },
    { color: '#58A6FF', label: 'Доход', value: `${growthNum(day.earnings)} TOK` },
    { color: '#FFC94A', label: 'Первые депозиты', value: growthNum(day.firstDeposits) },
    { color: '#6ddc9e', label: 'Сумма депозитов', value: `${growthNum(day.depositSum)} TOK` },
  ];
  return rows.map(r => `
    <div class="ref-growth-tooltip-row">
      <i class="ref-growth-tooltip-dot" style="background:${r.color}"></i>
      <span class="ref-growth-tooltip-label">${r.label}:</span>
      <span class="ref-growth-tooltip-value">${escHtml(String(r.value))}</span>
    </div>`).join('');
}

let _partnerGrowthPeriod = '7d';
async function loadPartnerGrowth(period) {
  const wrap = document.getElementById('partnerGrowthChartWrap');
  if (!wrap) return;
  _partnerGrowthPeriod = period || _partnerGrowthPeriod;
  document.querySelectorAll('.partner-growth-period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.partnerGrowthPeriod === _partnerGrowthPeriod);
  });
  try {
    const data = await api(`/api/partner/growth?period=${encodeURIComponent(_partnerGrowthPeriod)}`);
    if (!data.isPartner) return;
    const hasActivity = [data.series.earnings, data.series.depositSum, data.series.registrations]
      .some(series => (series || []).some(p => Number(p.value) !== 0));
    if (hasActivity) {
      wrap.innerHTML = renderPartnerGrowthChartSvg([
        { points: data.series.earnings, color: '#58A6FF' },
        { points: data.series.depositSum, color: '#6ddc9e' },
      ]);
      const n = data.series.earnings.length;
      const tooltipData = Array.from({ length: n }, (_, i) => ({
        label: data.series.earnings[i]?.label,
        earnings: data.series.earnings[i]?.value ?? 0,
        registrations: data.series.registrations?.[i]?.value ?? 0,
        firstDeposits: data.series.firstDeposits?.[i]?.value ?? 0,
        depositSum: data.series.depositSum?.[i]?.value ?? 0,
      }));
      bindGrowthChartTooltip(wrap, tooltipData, partnerGrowthTooltipRows);
    } else {
      wrap.innerHTML = `<div class="ref-growth-empty">
          <span class="ref-growth-empty-icon">🤝</span>
          <span>За этот период по твоим рефералам ещё ничего не произошло.</span>
        </div>`;
    }
    const eventCountEl = document.getElementById('partnerGrowthEventCount');
    const activeRefsEl = document.getElementById('partnerGrowthActiveRefs');
    const avgEl = document.getElementById('partnerGrowthAvgPerEvent');
    const bestDayEl = document.getElementById('partnerGrowthBestDay');
    const totalEl = document.getElementById('partnerGrowthTotal');
    if (eventCountEl) eventCountEl.textContent = data.stats?.eventCount ?? 0;
    if (activeRefsEl) activeRefsEl.textContent = data.stats?.activeReferrals ?? 0;
    if (avgEl) { const v = data.stats?.avgPerEvent ?? 0; avgEl.textContent = `${v >= 0 ? '+' : ''}${v} TOK`; avgEl.style.color = v < 0 ? '#58A6FF' : ''; }
    if (bestDayEl) bestDayEl.textContent = `${data.stats?.bestDay ?? 0} TOK`;
    if (totalEl) {
      const t = data.totalDelta ?? 0;
      totalEl.textContent = `${t >= 0 ? '+' : ''}${t}`;
      totalEl.style.color = t < 0 ? '#58A6FF' : '';
    }
  } catch (e) {
    wrap.innerHTML = '<div class="muted" style="font-size:12.5px">Не удалось загрузить статистику.</div>';
  }
}

function _renderRefData(data) {
  const codeEl    = document.getElementById('refCodeValue');
  const countEl   = document.getElementById('refReferredCount');
  const earnedEl  = document.getElementById('refTotalEarned');
  const pendingEl = document.getElementById('refPendingEarnings');
  const claimBtn  = document.getElementById('refClaimBtn');
  const iconEl    = document.getElementById('refLevelIcon');
  const nameEl    = document.getElementById('refLevelName');
  const pctEl     = document.getElementById('refLevelPct');
  const fillEl    = document.getElementById('refProgressFill');
  const labelEl   = document.getElementById('refProgressLabel');

  if (codeEl) codeEl.textContent = data.code || '—';
  const refLinkRow = document.getElementById('refLinkRow');
  const refLinkValueEl = document.getElementById('refLinkValue');
  if (refLinkRow && refLinkValueEl) {
    const botUsername = state.tgBotUsername || state.telegramStarsBotUsername;
    if (botUsername && data.code) {
      refLinkValueEl.textContent = `https://telegram.me/${botUsername}?start=ref_${data.code}`;
      refLinkRow.classList.remove('hidden');
    } else {
      refLinkRow.classList.add('hidden');
    }
  }
  if (countEl) countEl.textContent = data.referredCount ?? 0;
  if (earnedEl) earnedEl.textContent = (data.totalEarned ?? 0) + ' TOK';
  if (pendingEl) pendingEl.textContent = (data.pendingEarnings ?? 0) + ' TOK';
  if (claimBtn) claimBtn.classList.toggle('is-inactive', !((data.pendingEarnings ?? 0) > 0));
  state.refData = data;

  const levelMeta = REF_LEVEL_META.find(l => l.level === data.level) || REF_LEVEL_META[0];
  if (iconEl) iconEl.innerHTML = `<img src="${levelMeta.icon}" alt="${escHtml(levelMeta.name)}">`;
  if (nameEl) nameEl.textContent = levelMeta.name;
  if (pctEl) pctEl.textContent = levelMeta.pct + '%';

  if (fillEl) fillEl.style.width = (data.progress ?? 0) + '%';
  if (labelEl) {
    labelEl.textContent = data.nextLevel
      ? `До ${data.nextLevel.name}: ещё ${data.nextLevel.minRefs - data.referredCount} чел.`
      : 'Максимальный уровень достигнут 👑';
  }

  renderRefLevelsGrid(data.level);
}

function renderRefLevelsGrid(currentLevel) {
  const grid = document.getElementById('refLevelsGrid');
  if (!grid) return;
  grid.innerHTML = REF_LEVEL_META.map(l => {
    const isActive = l.level === currentLevel;
    const isPassed = currentLevel !== null && l.level < currentLevel;
    return `<div class="ref-level-item ${isActive ? 'is-active' : ''} ${isPassed ? 'is-passed' : ''}">
        <span class="ref-level-item-icon"><img src="${l.icon}" alt="${escHtml(l.name)}"></span>
        <span class="ref-level-item-name">${l.name}</span>
        <span class="ref-level-item-req">${l.minRefs === 0 ? 'Старт' : `${l.minRefs}+`}</span>
        <span class="ref-level-item-pct">${l.pct}%</span>
      </div>`;
  }).join('');
}

function renderRefGrowthChartSvg(seriesList) {
  const W = 600, H = 140, PAD = 6;
  const n = seriesList[0]?.points.length || 0;
  if (!n) return '<div class="muted" style="font-size:12.5px">Нет данных.</div>';
  const toPoly = (points) => {
    const vals = points.map(p => Number(p.value) || 0);
    const maxVal = Math.max(1, ...vals);
    return points.map((p, i) => {
      const x = n > 1 ? (i / (n - 1)) * (W - PAD * 2) + PAD : W / 2;
      const y = H - PAD - ((Number(p.value) || 0) / maxVal) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };
  const lines = seriesList.map(s => `<polyline points="${toPoly(s.points)}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`).join('');
  const labels = seriesList[0].points.map(p => p.label);
  const step = Math.max(1, Math.floor(n / 6));
  const labelsHtml = labels.map((l, i) => (i % step === 0 || i === n - 1) ? `<span>${escHtml(l)}</span>` : '<span></span>').join('');
  return `<svg class="ref-growth-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${lines}</svg><div class="ref-growth-chart-labels">${labelsHtml}</div>`;
}

let _refGrowthPeriod = '1d';
async function loadRefGrowth(period) {
  const wrap = document.getElementById('refGrowthChartWrap');
  if (!wrap) return;
  _refGrowthPeriod = period || _refGrowthPeriod;
  document.querySelectorAll('.ref-growth-period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.refGrowthPeriod === _refGrowthPeriod);
  });
  try {
    const data = await api(`/api/referral/growth?period=${encodeURIComponent(_refGrowthPeriod)}`);
    const hasActivity = [data.series.newRefUsers, data.series.depositCount, data.series.depositSum]
      .some(series => series.some(p => Number(p.value) > 0));
    wrap.innerHTML = hasActivity
      ? renderRefGrowthChartSvg([
          { points: data.series.newRefUsers, color: '#5aaaff' },
          { points: data.series.depositCount, color: '#a78bfa' },
          { points: data.series.depositSum, color: '#6ddc9e' },
        ])
      : `<div class="ref-growth-empty">
          <span class="ref-growth-empty-icon">📈</span>
          <span>За этот период по твоим рефералам ещё ничего не произошло.<br>Поделись кодом — и здесь появится график.</span>
        </div>`;
    const s = data.stats;
    document.getElementById('refGrowthNewUsers').textContent = s.newUsersCount;
    document.getElementById('refGrowthFirstDeposits').textContent = s.firstDepositsCount;
    document.getElementById('refGrowthDepositCount').textContent = s.totalDepositsCount;
    document.getElementById('refGrowthDepositSum').textContent = s.totalDepositsSum + ' TOK';
    document.getElementById('refGrowthAvgRevenue').textContent = s.avgRevenuePerPlayer + ' TOK';
    document.getElementById('refGrowthRevenue').textContent = data.revenue;
  } catch (e) {
    wrap.innerHTML = `<div class="muted" style="font-size:12.5px">Не удалось загрузить: ${escHtml(e.message)}</div>`;
  }
}

let _bonusEventsBound = false;
function _bindBonusEvents(isGuest) {
  if (_bonusEventsBound) return;
  _bonusEventsBound = true;

  const copyBtn = document.getElementById('refCodeCopyBtn');
  if (copyBtn) {
    bindSafe(copyBtn, 'click', () => {
      const code = document.getElementById('refCodeValue')?.textContent?.trim();
      if (!code || code === '—') return;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Скопировано!';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.textContent = 'Скопировать';
          copyBtn.classList.remove('is-copied');
        }, 2000);
      }).catch(() => showToast('Не удалось скопировать'));
    });
  }

  const refLinkCopyBtn = document.getElementById('refLinkCopyBtn');
  if (refLinkCopyBtn) {
    bindSafe(refLinkCopyBtn, 'click', () => {
      const link = document.getElementById('refLinkValue')?.textContent?.trim();
      if (!link) return;
      navigator.clipboard.writeText(link).then(() => {
        refLinkCopyBtn.textContent = '✅';
        setTimeout(() => { refLinkCopyBtn.textContent = '📋'; }, 2000);
      }).catch(() => showToast('Не удалось скопировать'));
    });
  }

  const refApplyBtn    = document.getElementById('refApplyBtn');
  const refApplyInput  = document.getElementById('refApplyInput');
  const refApplyResult = document.getElementById('refApplyResult');

  if (refApplyBtn && refApplyInput) {
    const doApplyCode = async () => {
      if (isGuest) { showToast('Нужен вход для активации кода'); return; }
      const code = refApplyInput.value.trim().toUpperCase();
      if (!code) { showToast('Введи код'); return; }
      refApplyBtn.disabled = true;
      refApplyBtn.querySelector('.bonus-apply-btn-text').textContent = '...';
      try {
        let data, isReferral = true;
        try {
          data = await api('/api/referral/apply', { method: 'POST', body: JSON.stringify({ code }) });
        } catch (refErr) {
          if (refErr.status !== 404) throw refErr;
          isReferral = false;
          data = await api('/api/promo/redeem', { method: 'POST', body: JSON.stringify({ code }) });
        }
        refApplyInput.value = '';
        if (isReferral) {
          refApplyResult.innerHTML = `
            <div class="ref-apply-success">
              <span class="ref-apply-success-icon">🎁</span>
              <div>
                <strong>Код активирован!</strong>
              </div>
            </div>
          `;
          const refData = await api('/api/referral');
          _renderRefData(refData);
        } else {
          const isBalance = data.type === 'balance';
          const isCase = data.type === 'case';
          const itemEmoji = data.item?.emoji || '🎁';
          const itemName  = data.item?.name  || '';
          const titleText = isBalance ? data.resultText : (isCase ? `Вы успешно получили кейс: ${itemName}` : itemName);
          const subText = isBalance ? 'зачислено на баланс' : (isCase ? 'заберите его в инвентаре' : 'добавлено в инвентарь');
          refApplyResult.innerHTML = `
            <div class="promo-success">
              <span>${isBalance ? '💰' : itemEmoji}</span>
              <div>
                <strong>${escHtml(titleText)}</strong>
                <span class="muted" style="margin-left:6px">${escHtml(subText)}</span>
              </div>
            </div>
          `;
        }
        refApplyResult.classList.remove('hidden');
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
        if (fresh.referralCase) { state.referralCase = fresh.referralCase; renderReferralCase(); }
      } catch (e) {
        refApplyResult.innerHTML = `<div class="ref-apply-error">${escHtml(e.message || 'Ошибка')}</div>`;
        refApplyResult.classList.remove('hidden');
        refApplyResult.classList.add('is-shake');
        setTimeout(() => refApplyResult.classList.remove('is-shake'), 600);
      } finally {
        refApplyBtn.disabled = false;
        refApplyBtn.querySelector('.bonus-apply-btn-text').textContent = 'Активировать';
      }
    };
    bindSafe(refApplyBtn, 'click', doApplyCode);
    bindSafe(refApplyInput, 'keydown', e => { if (e.key === 'Enter') doApplyCode(); });
    bindSafe(refApplyInput, 'input', () => {
      const pos = refApplyInput.selectionStart;
      refApplyInput.value = refApplyInput.value.toUpperCase();
      refApplyInput.setSelectionRange(pos, pos);
    });
  }

  const claimBtn = document.getElementById('refClaimBtn');
  if (claimBtn) {
    bindSafe(claimBtn, 'click', async () => {
      if (isGuest) { showToast('Нужен вход'); return; }
      if (!((state.refData?.pendingEarnings ?? 0) > 0)) { showToast('Баланс пуст — нечего выводить'); return; }
      claimBtn.classList.add('is-inactive');
      try {
        const data = await api('/api/referral/claim', { method: 'POST', body: JSON.stringify({}) });
        showToast(`+${data.claimed} TOK зачислено на баланс`);
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
        const refData = await api('/api/referral');
        _renderRefData(refData);
      } catch (e) {
        showToast(e.message || 'Ошибка вывода');
        claimBtn.classList.remove('is-inactive');
      }
    });
  }

  const nameTagPromoClaimBtn = document.getElementById('nameTagPromoClaimBtn');
  if (nameTagPromoClaimBtn) {
    bindSafe(nameTagPromoClaimBtn, 'click', async () => {
      if (isGuest) { showToast('Нужен вход'); return; }
      if (nameTagPromoClaimBtn.classList.contains('is-inactive')) {
        showToast(document.getElementById('nameTagPromoStatusText')?.textContent || 'Ещё не готово');
        return;
      }
      nameTagPromoClaimBtn.disabled = true;
      const prevText = nameTagPromoClaimBtn.textContent;
      nameTagPromoClaimBtn.textContent = '...';
      try {
        const data = await api('/api/name-tag-promo/claim', { method: 'POST', body: JSON.stringify({}) });
        if (data.rewardInfo?.type === 'case') {
        const хвост = data.rewardInfo.qty > 1 ? ` ×${data.rewardInfo.qty}` : '';
        showToast(`Кейс «${data.rewardInfo.caseName}»${хвост} открывается бесплатно — он ждёт в разделе кейсов`);
        } else {
          showToast(`+${data.reward} TOK зачислено на баланс`);
        }
        if (data.user) { state.user = data.user; renderAllUserData(); }
        _renderNameTagPromoStatus({ enabled: true, tag: state.nameTagPromo?.tag, rewardAmount: state.nameTagPromo?.rewardAmount, reward: state.nameTagPromo?.reward, canClaim: false, nextClaimAt: data.nextClaimAt });
      } catch (e) {
        showToast(e.message || 'Ошибка');
      } finally {
        nameTagPromoClaimBtn.disabled = false;
        nameTagPromoClaimBtn.textContent = prevText;
      }
    });
  }

  const partnerCopyBtn = document.getElementById('partnerCodeCopyBtn');
  if (partnerCopyBtn) {
    bindSafe(partnerCopyBtn, 'click', () => {
      const code = document.getElementById('partnerCodeValue')?.textContent?.trim();
      if (!code || code === '—') return;
      navigator.clipboard.writeText(code).then(() => {
        partnerCopyBtn.textContent = 'Скопировано!';
        setTimeout(() => { partnerCopyBtn.textContent = 'Скопировать'; }, 2000);
      }).catch(() => showToast('Не удалось скопировать'));
    });
  }

  const partnerLinkCopyBtn = document.getElementById('partnerDeepLinkCopyBtn');
  if (partnerLinkCopyBtn) {
    bindSafe(partnerLinkCopyBtn, 'click', () => {
      const link = document.getElementById('partnerDeepLinkValue')?.textContent?.trim();
      if (!link) return;
      navigator.clipboard.writeText(link).then(() => {
        partnerLinkCopyBtn.textContent = '✅';
        setTimeout(() => { partnerLinkCopyBtn.textContent = '📋'; }, 2000);
      }).catch(() => showToast('Не удалось скопировать'));
    });
  }
  const subPartnerLinkCopyBtn = document.getElementById('subPartnerLinkCopyBtn');
  if (subPartnerLinkCopyBtn) {
    bindSafe(subPartnerLinkCopyBtn, 'click', () => {
      const link = document.getElementById('subPartnerLinkValue')?.textContent?.trim();
      if (!link) return;
      navigator.clipboard.writeText(link).then(() => {
        subPartnerLinkCopyBtn.textContent = '✅';
        setTimeout(() => { subPartnerLinkCopyBtn.textContent = '📋'; }, 2000);
      }).catch(() => showToast('Не удалось скопировать'));
    });
  }

  bindPartnerApplyModal(isGuest);

  const partnerClaimBtn = document.getElementById('partnerClaimBtn');
  if (partnerClaimBtn) {
    bindSafe(partnerClaimBtn, 'click', async () => {
      if (isGuest) { showToast('Нужен вход'); return; }
      const pd = state.partnerData;
      if (!pd || (pd.balance ?? 0) <= 0) { showToast('Баланс пуст — нечего выводить'); return; }
      if (!pd.claimWindowOpen) { showToast('Вывод доступен только по субботам с 12:00 до 20:00 МСК'); return; }
      partnerClaimBtn.classList.add('is-inactive');
      try {
        const data = await api('/api/partner/claim', { method: 'POST', body: JSON.stringify({}) });
        showToast(`+${data.claimed} TOK зачислено на баланс`);
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
        const pdata = await api('/api/partner');
        renderPartnerPanel(pdata);
      } catch (e) {
        showToast(e.message || 'Ошибка вывода');
        partnerClaimBtn.classList.remove('is-inactive');
      }
    });
  }

  const partnerPromoAmountInput = document.getElementById('partnerPromoAmountInput');
  const partnerPromoUsesInput   = document.getElementById('partnerPromoUsesInput');
  const partnerPromoCostHint    = document.getElementById('partnerPromoCostHint');
  const updatePartnerPromoCostHint = () => {
    if (!partnerPromoCostHint) return;
    const amount = Math.max(0, Number(partnerPromoAmountInput?.value) || 0);
    const uses   = Math.max(0, Number(partnerPromoUsesInput?.value) || 0);
    partnerPromoCostHint.textContent = `Спишется: ${amount * uses} TOK`;
  };
  bindSafe(partnerPromoAmountInput, 'input', updatePartnerPromoCostHint);
  bindSafe(partnerPromoUsesInput, 'input', updatePartnerPromoCostHint);

  const partnerPromoCreateBtn = document.getElementById('partnerPromoCreateBtn');
  if (partnerPromoCreateBtn) {
    bindSafe(partnerPromoCreateBtn, 'click', async () => {
      if (isGuest) { showToast('Нужен вход'); return; }
      const code   = document.getElementById('partnerPromoCodeInput')?.value.trim().toUpperCase();
      const amount = Number(partnerPromoAmountInput?.value);
      const uses   = Number(partnerPromoUsesInput?.value);
      if (!code) { showToast('Введи название кода'); return; }
      if (!(amount > 0)) { showToast('Укажи сумму за активацию'); return; }
      if (!(uses > 0)) { showToast('Укажи кол-во активаций'); return; }
      partnerPromoCreateBtn.disabled = true;
      try {
        await api('/api/partner/promo', { method: 'POST', body: JSON.stringify({ code, amount, maxUses: uses }) });
        showToast(`Промокод ${code} создан`);
        document.getElementById('partnerPromoCodeInput').value = '';
        partnerPromoAmountInput.value = '';
        partnerPromoUsesInput.value = '';
        updatePartnerPromoCostHint();
        await loadPartnerPromoList();
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
      } catch (e) {
        showToast(e.message || 'Не удалось создать промокод');
      } finally {
        partnerPromoCreateBtn.disabled = false;
      }
    });
  }

  const partnerPromoList = document.getElementById('partnerPromoList');
  if (partnerPromoList) {
    bindSafe(partnerPromoList, 'click', async (e) => {
      const btn = e.target.closest('.partner-promo-cancel-btn');
      if (!btn) return;
      const id = btn.dataset.promoId;
      btn.disabled = true;
      try {
        const data = await api(`/api/partner/promo/${encodeURIComponent(id)}`, { method: 'DELETE' });
        showToast(data.refund > 0 ? `Промокод отменён, возвращено ${data.refund} TOK` : 'Промокод отменён');
        await loadPartnerPromoList();
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
      } catch (e2) {
        showToast(e2.message || 'Не удалось отменить промокод');
        btn.disabled = false;
      }
    });
  }

  const partnerPromoHistoryToggleBtn = document.getElementById('partnerPromoHistoryToggleBtn');
  const partnerPromoHistoryPanel = document.getElementById('partnerPromoHistoryPanel');
  if (partnerPromoHistoryToggleBtn && partnerPromoHistoryPanel && !partnerPromoHistoryToggleBtn._accordionBound) {
    partnerPromoHistoryToggleBtn._accordionBound = true;
    bindSafe(partnerPromoHistoryToggleBtn, 'click', () => {
      const open = partnerPromoHistoryPanel.classList.toggle('is-open');
      partnerPromoHistoryToggleBtn.setAttribute('aria-expanded', String(open));
      partnerPromoHistoryToggleBtn.textContent = open ? 'Скрыть ⌄' : 'Показать ⌄';
    });
  }

  const partnerCasePromoCaseSelect = document.getElementById('partnerCasePromoCaseSelect');
  if (partnerCasePromoCaseSelect) {
    const depositRewardCaseIds = new Set((state.depositCaseRewards || []).map(r => r.caseId));
    const cases = (state.cases || []).filter(c =>
      !c.comingSoon && c.category !== 'All-In' && c.currency !== 'QUEST' && c.currency !== 'COMB' &&
      c.id !== state.freeCase?.caseId && c.id !== state.referralCase?.caseId && !depositRewardCaseIds.has(c.id)
    );
    partnerCasePromoCaseSelect.innerHTML = cases.length
      ? cases.map(c => `<option value="${escAttr(c.id)}">${escHtml(c.name)} — ${fmt(c.price)} TOK</option>`).join('')
      : '<option value="">Нет доступных кейсов</option>';
  }
  const partnerCasePromoUsesInput = document.getElementById('partnerCasePromoUsesInput');
  const partnerCasePromoCostHint  = document.getElementById('partnerCasePromoCostHint');
  const updatePartnerCasePromoCostHint = () => {
    if (!partnerCasePromoCostHint) return;
    const selected = (state.cases || []).find(c => c.id === partnerCasePromoCaseSelect?.value);
    const price = selected ? (Number(selected.price) || 0) : 0;
    const uses  = Math.max(0, Number(partnerCasePromoUsesInput?.value) || 0);
    partnerCasePromoCostHint.textContent = `Спишется: ${price * uses} TOK`;
  };
  bindSafe(partnerCasePromoCaseSelect, 'change', updatePartnerCasePromoCostHint);
  bindSafe(partnerCasePromoUsesInput, 'input', updatePartnerCasePromoCostHint);
  updatePartnerCasePromoCostHint();

  const partnerCasePromoCreateBtn = document.getElementById('partnerCasePromoCreateBtn');
  if (partnerCasePromoCreateBtn) {
    bindSafe(partnerCasePromoCreateBtn, 'click', async () => {
      if (isGuest) { showToast('Нужен вход'); return; }
      const code   = document.getElementById('partnerCasePromoCodeInput')?.value.trim().toUpperCase();
      const caseId = partnerCasePromoCaseSelect?.value;
      const uses   = Number(partnerCasePromoUsesInput?.value);
      if (!code) { showToast('Введи название кода'); return; }
      if (!caseId) { showToast('Выбери кейс'); return; }
      if (!(uses > 0)) { showToast('Укажи кол-во активаций'); return; }
      partnerCasePromoCreateBtn.disabled = true;
      try {
        await api('/api/partner/promo', { method: 'POST', body: JSON.stringify({ code, type: 'case', caseId, maxUses: uses }) });
        showToast(`Промокод ${code} создан`);
        document.getElementById('partnerCasePromoCodeInput').value = '';
        partnerCasePromoUsesInput.value = '';
        updatePartnerCasePromoCostHint();
        await loadPartnerPromoList();
        const fresh = await api('/api/bootstrap');
        if (fresh.user) { state.user = fresh.user; renderBalance(); }
      } catch (e) {
        showToast(e.message || 'Не удалось создать промокод');
      } finally {
        partnerCasePromoCreateBtn.disabled = false;
      }
    });
  }

  const growthPeriodRow = document.getElementById('refGrowthPeriodRow');
  if (growthPeriodRow) {
    growthPeriodRow.querySelectorAll('.ref-growth-period-btn').forEach(btn => {
      bindSafe(btn, 'click', () => {
        if (state.authMode === 'guest') { showToast('Нужен вход'); return; }
        loadRefGrowth(btn.dataset.refGrowthPeriod);
      });
    });
  }

  const partnerGrowthPeriodRow = document.getElementById('partnerGrowthPeriodRow');
  if (partnerGrowthPeriodRow) {
    partnerGrowthPeriodRow.querySelectorAll('.partner-growth-period-btn').forEach(btn => {
      bindSafe(btn, 'click', () => {
        if (state.authMode === 'guest') { showToast('Нужен вход'); return; }
        loadPartnerGrowth(btn.dataset.partnerGrowthPeriod);
      });
    });
  }
}

function renderAllUserData() {
  normalizeFuseSelection(); renderUser(); renderBalance(); renderProfile(); renderCombinedHistory(); renderWagerBar();
  if (state.currentView === 'fuse') loadSection('fuse').then(() => renderFuseSection()).catch(() => {});
  if (state.currentView === 'ladder') loadSection('ladder').then(() => renderLadderMode()).catch(() => {});
  if (state.currentView === 'upgrader') loadSection('upgrader').then(() => _upgRenderGrid(document.getElementById('upgTargetSearch')?.value || '')).catch(() => {});
}
const PENDING_OPEN_KEY = 'brainrot_pending_open';
function markPendingOpen(payload) { try { localStorage.setItem(PENDING_OPEN_KEY, JSON.stringify({ ...payload, at: Date.now() })); } catch {} }
function clearPendingOpen() { try { localStorage.removeItem(PENDING_OPEN_KEY); } catch {} }
function hasPendingOpen() { try { return !!localStorage.getItem(PENDING_OPEN_KEY); } catch { return false; } }
async function syncUserState(silent = true) {
  try {
    const profile = getTelegramProfile();
    const data = await api(`/api/bootstrap?${new URLSearchParams(profile).toString()}`);
    applyBootstrap(data);
    logUserAction('bootstrap_loaded', { authMode: state.authMode, cases: state.cases?.length || 0 });

    refs.casesGrid = document.getElementById('casesGrid');
    refs.caseSearch = document.getElementById('caseSearch');

    renderUser();
    renderPromo();
    startPromoTicker();
    renderCases(refs.caseSearch?.value || '');
    renderLiveFeed();
    renderAllUserData();

    if (state.currentView === 'case' && state.selectedCaseId) openCasePage(state.selectedCaseId);
    return data;
  } catch (e) {
    console.error('[bootstrap failed]', e);
    const grid = document.getElementById('casesGrid');
    const _bsIsEn = getCurrentLanguage() === 'en';
    if (grid) grid.innerHTML = `<div class="battle-wait-card">${_bsIsEn ? 'Loading error: ' : 'Ошибка загрузки: '}${escHtml(String(e.message || e))}</div>`;
    if (!silent) showToast(e.message || (_bsIsEn ? 'Loading error' : 'Ошибка загрузки'));
    return null;
  }
}
const SPIN_PROFILES = {
  fast: [
    { id: 'flash',     label: 'рывок',      overshoot:0, singleDuration:3600,  miniDuration:2400, settle:0, laneLag:100, easing: 'cubic-bezier(0.10,0.90,0.18,1.00)' },
    { id: 'razor',     label: 'лезвие',     overshoot:0, singleDuration:4000,  miniDuration:2650, settle:0, laneLag:108, easing: 'cubic-bezier(0.08,0.92,0.16,1.00)', nearMissPx:8 },
    { id: 'snap',      label: 'хлопок',     overshoot:0, singleDuration:4400,  miniDuration:2900, settle:0, laneLag:115, easing: 'cubic-bezier(0.10,0.90,0.18,1.00)', nearMissPx:10 },
    { id: 'impact',    label: 'удар',       overshoot:0, singleDuration:5200,  miniDuration:3500, settle:0, laneLag:125, easing: 'cubic-bezier(0.06,0.95,0.11,1.00)' },
    { id: 'countdown', label: 'отсчёт',     overshoot:0, singleDuration:5800,  miniDuration:3900, settle:0, laneLag:132, easing: 'cubic-bezier(0.04,0.97,0.08,1.00)', nearMissPx:11 },
    { id: 'pulse',     label: 'пульс',      overshoot:0, singleDuration:6200,  miniDuration:4100, settle:0, laneLag:138, easing: 'cubic-bezier(0.03,0.97,0.06,1.00)', nearMissPx:10 },
    { id: 'thriller',  label: 'триллер',    overshoot:0, singleDuration:7000,  miniDuration:4700, settle:0, laneLag:148, easing: 'cubic-bezier(0.02,0.98,0.05,1.00)' },
    { id: 'breathe',   label: 'дыхание',    overshoot:0, singleDuration:7600,  miniDuration:5000, settle:0, laneLag:155, easing: 'cubic-bezier(0.02,0.98,0.04,1.00)', nearMissPx:13 },
    { id: 'tension',   label: 'напряжение', overshoot:0, singleDuration:8000,  miniDuration:5300, settle:0, laneLag:162, easing: 'cubic-bezier(0.02,0.97,0.04,1.00)' },
    { id: 'suspense',  label: 'саспенс',    overshoot:0, singleDuration:8600,  miniDuration:5700, settle:0, laneLag:170, easing: 'cubic-bezier(0.01,0.99,0.03,1.00)', nearMissPx:15 },
  ],
  slow: [
    { id: 'cinematic', label: 'кино',       overshoot:0, singleDuration:11000, miniDuration:7800, settle:0, laneLag:185, easing: 'cubic-bezier(0.08,0.95,0.13,1.00)' },
    { id: 'glide',     label: 'парение',    overshoot:0, singleDuration:12200, miniDuration:8400, settle:0, laneLag:198, easing: 'cubic-bezier(0.06,0.96,0.10,1.00)' },
    { id: 'orbit',     label: 'орбита',     overshoot:0, singleDuration:11600, miniDuration:8100, settle:0, laneLag:190, easing: 'cubic-bezier(0.07,0.96,0.12,1.00)', nearMissPx:9 },
    { id: 'drift',     label: 'дрейф',      overshoot:0, singleDuration:13000, miniDuration:8900, settle:0, laneLag:208, easing: 'cubic-bezier(0.05,0.97,0.09,1.00)', nearMissPx:11 },
    { id: 'marathon',  label: 'марафон',    overshoot:0, singleDuration:14000, miniDuration:9400, settle:0, laneLag:220, easing: 'cubic-bezier(0.04,0.98,0.07,1.00)' },
    { id: 'ceremony',  label: 'церемония',  overshoot:0, singleDuration:15000, miniDuration:10000,settle:0, laneLag:232, easing: 'cubic-bezier(0.03,0.98,0.06,1.00)', nearMissPx:12 },
    { id: 'epoch',     label: 'эпоха',      overshoot:0, singleDuration:15800, miniDuration:10500,settle:0, laneLag:242, easing: 'cubic-bezier(0.03,0.98,0.05,1.00)' },
    { id: 'trance',    label: 'транс',      overshoot:0, singleDuration:16600, miniDuration:11000,settle:0, laneLag:252, easing: 'cubic-bezier(0.02,0.99,0.04,1.00)', nearMissPx:14 },
    { id: 'legend',    label: 'легенда',    overshoot:0, singleDuration:17400, miniDuration:11500,settle:0, laneLag:262, easing: 'cubic-bezier(0.02,0.99,0.04,1.00)', nearMissPx:14 },
    { id: 'ritual',    label: 'ритуал',     overshoot:0, singleDuration:18200, miniDuration:12000,settle:0, laneLag:272, easing: 'cubic-bezier(0.01,0.99,0.03,1.00)', nearMissPx:16 },
  ]
};

function pickSpinProfile(speed, compact = false, laneIndex = 0) {
  const list = SPIN_PROFILES[speed] || SPIN_PROFILES.fast;
  const profile = list[Math.floor(Math.random() * list.length)] || list[0];
  return {
    ...profile,
    duration: (compact ? profile.miniDuration : profile.singleDuration)
  };
}

function updateSpinStyleHint() {
  const hint = document.getElementById('spinStyleHint');
  if (hint) hint.remove();
}

let _rouletteAudioCtx = null;
let _rouletteTickGainNode = null;
let _rouletteWinGainNode = null;
let _rouletteStopAudioBuffer = null;
let _rouletteTickBufferLoading = null;
let _rouletteTickLastSourceNode = null;
let _uiLastRouletteTickMs = 0;

function _ensureRouletteAudioCtx() {
  if (_rouletteAudioCtx) return _rouletteAudioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    _rouletteAudioCtx = new Ctx();
    _rouletteTickGainNode = _rouletteAudioCtx.createGain();
    _rouletteTickGainNode.gain.value = 0.2831;
    _rouletteTickGainNode.connect(_rouletteAudioCtx.destination);
    _rouletteWinGainNode = _rouletteAudioCtx.createGain();
    _rouletteWinGainNode.gain.value = 0.0165;
    _rouletteWinGainNode.connect(_rouletteAudioCtx.destination);
  } catch (e) { return null; }
  return _rouletteAudioCtx;
}

function _loadRouletteTickBuffer() {
  if (_rouletteTickBufferLoading) return _rouletteTickBufferLoading;
  const ctx = _ensureRouletteAudioCtx();
  if (!ctx) return Promise.resolve(null);
  const decode = (url) => fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))
    .catch(() => null);
  _rouletteTickBufferLoading = decode('/roulette-stop.wav?v=6')
    .then(stop => { _rouletteStopAudioBuffer = stop; return stop; });
  return _rouletteTickBufferLoading;
}

let _rouletteNoiseBuffer = null;
function _rouletteNoise(ctx) {
  if (_rouletteNoiseBuffer && _rouletteNoiseBuffer.sampleRate === ctx.sampleRate) return _rouletteNoiseBuffer;
  const n = Math.round(ctx.sampleRate * 0.5);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    ch[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.25;
  }
  _rouletteNoiseBuffer = buf;
  return buf;
}

function buildRouletteTickVoice(ctx, destination, when) {
  const rnd = Math.random;
  const DUR = 0.030;
  const noise = _rouletteNoise(ctx);

  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.9 + rnd() * 0.2;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400 + rnd() * 800;
  bp.Q.value = 1.6;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(1, when + 0.0012);
  env.gain.exponentialRampToValueAtTime(0.0001, when + DUR);

  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.value = 200 + rnd() * 60;
  const bodyEnv = ctx.createGain();
  bodyEnv.gain.setValueAtTime(0.35, when);
  bodyEnv.gain.exponentialRampToValueAtTime(0.0001, when + 0.018);

  src.connect(bp); bp.connect(env); env.connect(destination);
  body.connect(bodyEnv); bodyEnv.connect(destination);

  src.start(when, rnd() * (noise.duration - DUR - 0.01));
  src.stop(when + DUR);
  body.start(when);
  body.stop(when + DUR);
  return src;
}

let _winHitsRecent = [];
function playRouletteTick(kind) {
  if (!isSoundOn()) return;
  const now = Date.now();
  if (kind !== 'win' && now - _uiLastRouletteTickMs < 20) return;
  _uiLastRouletteTickMs = now;
  let winGain = 1;
  if (kind === 'win') {
    _winHitsRecent = _winHitsRecent.filter((ts) => now - ts < 1000);
    if (_winHitsRecent.length && now - _winHitsRecent[_winHitsRecent.length - 1] < 90) return;
    winGain = _winHitsRecent.length === 0 ? 1 : (_winHitsRecent.length === 1 ? 0.5 : 0.3);
    _winHitsRecent.push(now);
  }
  const ctx = _ensureRouletteAudioCtx();
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});

  if (kind !== 'win') {
    try {
      _rouletteTickLastSourceNode = buildRouletteTickVoice(ctx, _rouletteTickGainNode, ctx.currentTime);
    } catch (e) {}
    return;
  }

  if (_rouletteStopAudioBuffer) {
    try {
      const src = ctx.createBufferSource();
      src.buffer = _rouletteStopAudioBuffer;
      if (winGain < 1) {
        const g = ctx.createGain();
        g.gain.value = winGain;
        src.connect(g);
        g.connect(_rouletteWinGainNode);
      } else {
        src.connect(_rouletteWinGainNode);
      }
      src.start(0);
      _rouletteTickLastSourceNode = src;
    } catch (e) {}
    return;
  }
  _loadRouletteTickBuffer();
}

function stopRouletteTickSound() {
  if (_rouletteTickLastSourceNode) {
    try { _rouletteTickLastSourceNode.stop(0); } catch (e) {}
    _rouletteTickLastSourceNode = null;
  }
}

function scheduleRouletteTimer(fn, delay) {
  const id = setTimeout(() => {
    state.pendingRouletteTimers = (state.pendingRouletteTimers || []).filter(t => t.id !== id);
    fn();
  }, delay);
  if (!Array.isArray(state.pendingRouletteTimers)) state.pendingRouletteTimers = [];
  state.pendingRouletteTimers.push({ id, fn });
  return id;
}
function skipRouletteAnimation() {
  const skips = state.rouletteSkips || [];
  state.rouletteSkips = [];
  skips.forEach(skip => { try { skip(); } catch {} });
  const pending = state.pendingRouletteTimers || [];
  state.pendingRouletteTimers = [];
  pending.forEach(({ id, fn }) => { clearTimeout(id); try { fn(); } catch {} });
}

function spawnRouletteBeeSting(windowNode, targetCard, timerBag, onSting) {
  const wrapRect = windowNode.getBoundingClientRect();
  const cardRect = targetCard.getBoundingClientRect();
  const stingX = Math.round(cardRect.left - wrapRect.left + cardRect.width / 2);
  const stingY = Math.round(cardRect.top - wrapRect.top + cardRect.height * 0.32);

  const bee = document.createElement('div');
  bee.className = 'roulette-sting-bee';
  bee.style.setProperty('--sting-x', `${stingX}px`);
  bee.style.setProperty('--sting-y', `${stingY}px`);
  bee.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <ellipse class="nav-bee-wing" cx="8.6" cy="7.4" rx="3.5" ry="2.2" transform="rotate(-28 8.6 7.4)"/>
    <ellipse class="nav-bee-wing" cx="15.4" cy="7.4" rx="3.5" ry="2.2" transform="rotate(28 15.4 7.4)"/>
    <ellipse class="nav-bee-body" cx="12" cy="14" rx="5.2" ry="6.1"/>
    <path class="nav-bee-stripe" d="M7.1 12.1h9.8"/>
    <path class="nav-bee-stripe" d="M7.4 15.6h9.2"/>
    <circle class="nav-bee-eye" cx="10.1" cy="10.1" r="0.85"/>
    <circle class="nav-bee-eye" cx="13.9" cy="10.1" r="0.85"/>
    <path class="nav-bee-antenna" d="M10.3 8.4 9 6.2M13.7 8.4 15 6.2"/>
  </svg>`;
  windowNode.appendChild(bee);

  const FLY_MS = 1600;
  const stingAtMs = Math.round(FLY_MS * 0.55);
  setTimeout(() => {
    targetCard.classList.add('is-bee-stung');
    if (typeof onSting === 'function') onSting();
  }, stingAtMs);
  setTimeout(() => { bee.remove(); }, FLY_MS + 80);
}

function _cubicBezierEase(spec) {
  const m = String(spec || '').match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return (t) => t;
  const [x1, y1, x2, y2] = m[1].split(',').map((v) => parseFloat(v));
  if (![x1, y1, x2, y2].every(Number.isFinite)) return (t) => t;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const xAt = (u) => ((ax * u + bx) * u + cx) * u;
  const dxAt = (u) => (3 * ax * u + 2 * bx) * u + cx;
  const yAt = (u) => ((ay * u + by) * u + cy) * u;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 10; i++) {
      const dx = xAt(u) - t;
      if (Math.abs(dx) < 1e-5) break;
      const d = dxAt(u);
      if (Math.abs(d) < 1e-6) break;
      u -= dx / d;
    }
    return yAt(Math.min(1, Math.max(0, u)));
  };
}
function createRouletteWindow(winItem, lootItems, compact = false, laneIndex = 0) {
  const profile = pickSpinProfile(state.spinSpeed, compact, laneIndex);
  state.currentSpinProfile = profile;

  const windowNode = document.createElement('div');
  windowNode.className = `roulette-window ${compact ? 'mini' : 'single'} spin-${profile.id} speed-${state.spinSpeed}`;
  windowNode.dataset.spinProfile = profile.id;
  const tones = ['violet','neon','ice','sun','rose','mint','amber'];
  const sheens = ['soft','hard'];
  windowNode.dataset.spinTone = tones[Math.floor(Math.random() * tones.length)];
  windowNode.dataset.spinSheen = sheens[Math.floor(Math.random() * sheens.length)];
  windowNode.innerHTML = '<div class="roulette-velocity-fx"></div><div class="roulette-browser-edge"></div><div class="roulette-pointer"></div><div class="roulette-track"></div>';
  const track = windowNode.querySelector('.roulette-track');
  if (!track) return { node: windowNode, duration: 0, profile };

  const totalCards = compact ? 59 : 75;
  const _winMin = compact ? 35 : 45;
  const _winMax = compact ? 50 : 63;
  const winnerIndex = _winMin + Math.floor(Math.random() * (_winMax - _winMin + 1));
  const startX = compact ? 620 + laneIndex * 34 : 860;
  const duration = profile.duration || ((compact ? 5200 : 6400) + laneIndex * 160);

  const sourceItems = Array.isArray(lootItems) && lootItems.length ? lootItems : [winItem].filter(Boolean);
  const trackItems = [];
  for (let i = 0; i < totalCards; i++) trackItems.push(sourceItems[Math.floor(Math.random() * sourceItems.length)] || winItem);
  trackItems[winnerIndex] = winItem;

  for (let i = 0; i < trackItems.length; i++) {
    const item = trackItems[i];
    const card = document.createElement('div');
    card.className = `roulette-item ${compact ? 'compact' : ''}${item.honey ? ' is-honey-drop' : ''}${luxClass(item)}${oneOfOneClass(item)}`;
    card.dataset.index = String(i);
    card.dataset.itemId = String(item?.id ?? '');
    const cardName = itemCardName(item);
    const nameLen = cardName.length;
    const nameCls = nameLen > 20 ? ' name-xlong' : nameLen > 14 ? ' name-long' : '';
    card.innerHTML = `${mutationBadgeHtml(item, 'mut-badge-roulette')}<div class="roulette-emoji">${mediaMarkup(item, 'roulette-image', '')}${oneOfOneBadgeHtml(item, 'oneof-badge-roulette')}</div><div class="roulette-name${nameCls}">${escHtml(cardName)}</div><div class="roulette-value">${escHtml(String(item.value))} TOK</div>`;
    track.appendChild(card);
  }

  const soundTimers = [];
  const clearSoundTimers = () => soundTimers.splice(0).forEach(id => clearTimeout(id));
  const beeTimers = [];
  const clearBeeTimers = () => beeTimers.splice(0).forEach(id => clearTimeout(id));

  track.style.transition = 'none';
  track.style.transform = `translateX(${compact ? -26 : -40}px) translateZ(0)`;
  track.classList.remove('roulette-track-crisp');
  windowNode.classList.add('is-spinning');

  let _stopWatchingViewport = null;
  let _stopSpinLoop = null;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
    const firstCard = track.querySelector('.roulette-item');
    if (!firstCard) return;

    const modalCard = document.querySelector('#rouletteModal .modal-card');
    const measuredWidth = windowNode.clientWidth || windowNode.parentElement?.clientWidth || windowNode.getBoundingClientRect().width || modalCard?.clientWidth || modalCard?.getBoundingClientRect?.().width || document.querySelector('#rouletteModal')?.clientWidth || 980;
    const center = Math.max(160, measuredWidth / 2);
    const cards = track.querySelectorAll('.roulette-item');
    const _winId = String(winItem?.id ?? '');
    const _pickWinnerCard = () => {
      const byIndex = cards[winnerIndex];
      if (byIndex && byIndex.dataset.itemId === _winId) return byIndex;
      let best = null, bestDist = Infinity;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].dataset.itemId !== _winId) continue;
        const dist = Math.abs(i - winnerIndex);
        if (dist < bestDist) { best = cards[i]; bestDist = dist; }
      }
      return best || byIndex || firstCard;
    };
    const winnerCardEl = _pickWinnerCard();

    const cardWidth = winnerCardEl.getBoundingClientRect().width || (compact ? 122 : 150);
    const jitter = Math.round((Math.random() - 0.5) * cardWidth * 0.16);

    const liveReelWidth = () => windowNode.clientWidth || windowNode.parentElement?.clientWidth
      || windowNode.getBoundingClientRect().width || modalCard?.clientWidth || measuredWidth;
    const computeWinnerOffset = (withJitter = true) => {
      const liveCenter = Math.max(160, liveReelWidth() / 2);
      const liveCardWidth = winnerCardEl.getBoundingClientRect().width || cardWidth;
      return Math.round(-(winnerCardEl.offsetLeft - liveCenter + (liveCardWidth / 2))) + (withJitter ? jitter : 0);
    };
    const cardUnderPointer = (offset) => {
      const pointerInTrack = liveReelWidth() / 2 - offset;
      for (let i = 0; i < cards.length; i++) {
        const left = cards[i].offsetLeft;
        const right = left + (cards[i].getBoundingClientRect().width || cardWidth);
        if (pointerInTrack >= left && pointerInTrack < right) return cards[i];
      }
      return null;
    };
    const pointerIsOnWinner = (offset) => {
      const card = cardUnderPointer(offset);
      return Boolean(card) && card.dataset.itemId === _winId;
    };

    const computeStartOffset = () => {
      const liveWidth = liveReelWidth();
      const liveCenter = Math.max(160, liveWidth / 2);
      const step = cards.length > 1
        ? Math.abs(cards[1].offsetLeft - cards[0].offsetLeft)
        : (winnerCardEl.getBoundingClientRect().width || cardWidth);
      if (!step) return startX;
      const idx = Math.min(cards.length - 1, Math.ceil(liveCenter / step) + 1);
      const el = cards[idx] || cards[0];
      const w = el.getBoundingClientRect().width || cardWidth;
      return Math.round(-(el.offsetLeft - liveCenter + (w / 2)));
    };
    const spinFrom = computeStartOffset();
    track.style.transform = `translateX(${spinFrom}px) translateZ(0)`;
    const pitch = Math.max(1, cards.length > 1 ? Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) : cardWidth);
    let cellsPassed = 0;
    let tickRafId = 0;
    const readShift = () => {
      const t = getComputedStyle(track).transform;
      if (!t || t === 'none') return 0;
      const m = /matrix(?:3d)?\(([^)]+)\)/.exec(t);
      if (!m) return 0;
      const p = m[1].split(',');
      const x = Number(p.length === 16 ? p[12] : p[4]);
      return Number.isFinite(x) ? Math.abs(x - spinFrom) : 0;
    };
    const tickLoop = () => {
      tickRafId = requestAnimationFrame(tickLoop);
      const passed = Math.floor(readShift() / pitch);
      if (passed <= cellsPassed) return;
      cellsPassed = passed;
      if (laneIndex === 0) playRouletteTick('tick');
    };
    tickRafId = requestAnimationFrame(tickLoop);
    const stopTickLoop = () => { if (tickRafId) { cancelAnimationFrame(tickRafId); tickRafId = 0; } };

    let spinSettled = false;
    let spinFinished = false;
    const settleTrack = () => {
      track.style.transition = 'none';
      let offset = computeWinnerOffset();
      if (!pointerIsOnWinner(offset)) offset = computeWinnerOffset(false);
      track.style.transform = `translateX(${offset}px) translateZ(0)`;
    };
    let resizeObs = null;
    const onViewportChange = () => { if (spinSettled) settleTrack(); else refreshTarget(); };
    try {
      resizeObs = new ResizeObserver(onViewportChange);
      resizeObs.observe(windowNode);
      resizeObs.observe(track);
    } catch {}
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    try { window.Telegram?.WebApp?.onEvent?.('viewportChanged', onViewportChange); } catch {}
    const stopWatchingViewport = _stopWatchingViewport = () => {
      try { resizeObs?.disconnect(); } catch {}
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
      try { window.Telegram?.WebApp?.offEvent?.('viewportChanged', onViewportChange); } catch {}
    };

    const ease = _cubicBezierEase(profile.easing || 'cubic-bezier(.08,.72,.05,1)');
    const spinStartedAt = performance.now();
    let spinRafId = 0;
    const stopSpinLoop = _stopSpinLoop = () => { if (spinRafId) { cancelAnimationFrame(spinRafId); spinRafId = 0; } };
    let spinTarget = computeWinnerOffset();
    let targetCheckedAt = 0;
    const refreshTarget = () => { spinTarget = computeWinnerOffset(); };
    const spinFrame = (now) => {
      const t = Math.min(1, (now - spinStartedAt) / Math.max(1, duration));
      if (now - targetCheckedAt >= 250) { targetCheckedAt = now; refreshTarget(); }
      const x = spinFrom + (spinTarget - spinFrom) * ease(t);
      track.style.transform = `translateX(${x}px) translateZ(0)`;
      if (t < 1) { spinRafId = requestAnimationFrame(spinFrame); return; }
      spinRafId = 0;
      finishSpin();
    };
    track.style.transition = 'none';
    spinRafId = requestAnimationFrame(spinFrame);

    let beeReleased = false;
    let releaseBee = null;
    const makeRelease = (fly) => () => {
      if (beeReleased) return;
      beeReleased = true;
      clearBeeTimers();
      fly();
    };

    if (winItem.honey) {
      releaseBee = makeRelease(() => {
        if (winnerCardEl) spawnRouletteBeeSting(windowNode, winnerCardEl, beeTimers, revealWinner);
      });
      beeTimers.push(setTimeout(releaseBee, Math.max(0, duration - 40)));
    }

    let revealed = false;
    function revealWinner() {
      if (revealed) return;
      revealed = true;
      [...track.querySelectorAll('.roulette-item')].forEach(card => card.classList.remove('winner-focus', 'winner-landed'));
      const winnerCard = winnerCardEl;
      if (winnerCard) {
        winnerCard.classList.add('winner-focus', 'winner-landed');
        setTimeout(() => winnerCard.classList.remove('winner-landed'), 600);
      }
      windowNode.classList.add('landing-shake');
      setTimeout(() => windowNode.classList.remove('landing-shake'), 320);
      stopRouletteTickSound();
      playRouletteTick('win');
    }

    const finishSpin = (force) => {
      if (spinFinished) return;
      spinFinished = true;
      stopSpinLoop();
      clearSoundTimers();
      stopTickLoop();
      track.classList.add('roulette-track-crisp');
      windowNode.classList.remove('is-spinning');
      windowNode.classList.add('is-finished');
      spinSettled = true;
      settleTrack();
      if (winItem.honey && !force) return;
      revealWinner();
    };

    const finishSpinTimerId = setTimeout(() => finishSpin(), duration + 120);
    laneSkip = () => {
      clearTimeout(finishSpinTimerId);
      stopSpinLoop();
      settleTrack();
      finishSpin(true);
      if (releaseBee) releaseBee();
    };
    });
  });

  let laneSkip = () => {};
  return { node: windowNode, duration: duration + (winItem.honey ? 900 : 650), profile, cleanup: () => { try { clearSoundTimers(); } catch {} try { clearBeeTimers(); } catch {} try { _stopWatchingViewport?.(); } catch {} try { _stopSpinLoop?.(); } catch {} }, skip: () => laneSkip() };
}
function positionRouletteSkipBtn() {
  const btn = document.getElementById('rouletteSkipBtn');
  if (!btn || window.innerWidth > 760) return;
  const anchor = refs.rouletteWindows;
  const card = refs.rouletteModal?.querySelector('.modal-card');
  if (!anchor || !card) return;
  const rect = anchor.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (!rect.height) return;
  const gap = 10;
  const closeBtn = refs.rouletteModal?.querySelector('.icon-close');
  const closeBottom = closeBtn ? closeBtn.getBoundingClientRect().bottom - cardRect.top + gap : 8;
  const desiredTop = rect.top - cardRect.top - btn.offsetHeight - gap;
  btn.style.top = Math.max(8, closeBottom, desiredTop) + 'px';
}
window.addEventListener('resize', () => { if (!refs.rouletteModal?.classList.contains('hidden')) positionRouletteSkipBtn(); });
function closeRouletteModal(){
  const modal = refs.rouletteModal || document.getElementById('rouletteModal');
  if (!modal) return;

  try {
    (state.rouletteCleanups || []).splice(0).forEach(fn => { try { fn(); } catch {} });
  } catch {}

  state.rouletteCleanups = [];
  state.spinning = false;

  modal.classList.add('hidden');
  modal.classList.remove('roulette-open');
  [...modal.classList].forEach(cls => { if (cls.startsWith('count-')) modal.classList.remove(cls); });
  modal.setAttribute('aria-hidden','true');

  document.body.classList.remove('modal-fullscreen-open');
}

function showRouletteResults(results, caseItem) {
  const _isEnR = getCurrentLanguage() === 'en';
  const pageHost = document.getElementById('caseRouletteWindows');
  const onPage = Boolean(pageHost);
  const host = onPage ? pageHost : refs.rouletteWindows;
  const skipBtn = document.getElementById(onPage ? 'caseReelSkipBtn' : 'rouletteSkipBtn');
  if (!host) return 0;
  if (refs.rouletteTitle) refs.rouletteTitle.textContent = results.length === 1
    ? (_isEnR ? `Opening case «${getCaseName(caseItem)}»` : `Открытие кейса «${getCaseName(caseItem)}»`)
    : (_isEnR ? `Multi-open «${getCaseName(caseItem)}» x${results.length}` : `Мультиоткрытие «${getCaseName(caseItem)}» x${results.length}`);
  if (refs.rouletteResult) refs.rouletteResult.textContent = '';
  try { (state.rouletteCleanups || []).splice(0).forEach(fn => { try { fn(); } catch {} }); } catch {}
  host.innerHTML = '';
  document.getElementById('rouletteBulkActions')?.remove();
  document.getElementById('caseReelBulkActions')?.remove();
  host.className = `roulette-windows ${results.length > 1 ? 'multiple' : 'single'} clean-sell-layout`;

  if (onPage) {
    document.getElementById('caseReelIdle')?.classList.add('hidden');
    host.dataset.hasResult = '1';
    if (skipBtn) { skipBtn.classList.remove('hidden'); skipBtn.classList.remove('is-consumed'); }
  }
  if (!onPage) refs.rouletteModal.classList.add('roulette-modal');
  if (!onPage) refs.rouletteModal.classList.add('roulette-open');
  if (!onPage) [...refs.rouletteModal.classList].forEach(cls => { if (cls.startsWith('count-')) refs.rouletteModal.classList.remove(cls); });
  if (!onPage) refs.rouletteModal.classList.add(`count-${Math.min(5, Math.max(1, Number(results.length) || 1))}`);
  if (!onPage) refs.rouletteModal.classList.remove('hidden');
  if (!onPage) refs.rouletteModal.setAttribute('aria-hidden','false');
  if (!onPage) document.body.classList.remove('modal-fullscreen-open');
  if (!onPage) document.getElementById('rouletteSkipBtn')?.classList.remove('is-consumed');

  const _modalCard = onPage ? null : refs.rouletteModal.querySelector('.modal-card');
  if (_modalCard) {
    _modalCard.style.setProperty('width', 'min(1200px, calc(100vw - 24px))', 'important');
    _modalCard.style.setProperty('max-width', 'calc(100vw - 24px)', 'important');
    _modalCard.style.setProperty('max-height', '95vh', 'important');
    _modalCard.style.setProperty('overflow-y', 'auto', 'important');
    _modalCard.style.setProperty('overflow-x', 'hidden', 'important');
    requestAnimationFrame(() => {
      const _h = _modalCard.getBoundingClientRect().height;
      _modalCard.style.setProperty('min-height', (_h + 30) + 'px', 'important');
    });
  }

  const lootItems = caseItem.lootTable.map(x => lootRowItem(x)).filter(Boolean);
  let maxDuration = 0;

  const rouletteCleanups = [];
  state.rouletteCleanups = rouletteCleanups;
  state.rouletteSkips = [];

  results.forEach((item, index) => {
    const built = createRouletteWindow(item, lootItems, results.length > 1, index);
    if (built && typeof built.cleanup === 'function') rouletteCleanups.push(built.cleanup);
    if (built && typeof built.skip === 'function') state.rouletteSkips.push(built.skip);

    const lane = document.createElement('div');
    lane.className = 'roulette-lane';
    lane.dataset.resultIndex = String(index);

    const actions = document.createElement('div');
    actions.className = 'roulette-lane-actions';

    lane.appendChild(built.node);
    lane.appendChild(actions);
    host.appendChild(lane);

    maxDuration = Math.max(maxDuration, built.duration);
  });
  if (!onPage) requestAnimationFrame(() => requestAnimationFrame(positionRouletteSkipBtn));

  scheduleRouletteTimer(() => {
    const inventory = state.user?.inventory || [];
    const used = new Set();
    const sellUids = [];
    const isEn = getCurrentLanguage() === 'en';
    const sellLabel = isEn ? 'Sell' : 'Продать';

    host.querySelectorAll('.roulette-lane').forEach((lane, i) => {
      const item = results[i];
      if (!item) return;

      let entry = inventory.find(x => x.itemId === item.id && !used.has(x.uid));
      if (entry) {
        used.add(entry.uid);
        sellUids.push(entry.uid);
      }

      const actions = lane.querySelector('.roulette-lane-actions');
      if (!actions) return;

      const compact = results.length > 1;
      actions.innerHTML = entry
        ? (compact
            ? `<button type="button" class="wheel-sell-btn sell-pop-in wheel-sell-btn-compact" data-sell-win-uid="${entry.uid}" title="${sellLabel}" aria-label="${sellLabel}">${sellLabel}</button>`
            : `<button type="button" class="wheel-sell-btn sell-pop-in" data-sell-win-uid="${entry.uid}">${sellLabel}</button>`)
        : `<div class="lane-actions-placeholder"></div>`;
    });

    bindInstantSellActions(host);
    if (results.length > 1 && sellUids.length) {
      const bulk = document.createElement('div');
      bulk.id = onPage ? 'caseReelBulkActions' : 'rouletteBulkActions';
      bulk.className = 'roulette-bulk-actions';
      bulk.innerHTML = `<button type="button" class="wheel-sell-btn sell-pop-in" data-sell-all-win-uids="${sellUids.join(',')}">${isEn ? 'Sell all' : 'Продать все'}</button>`;
      host.insertAdjacentElement('afterend', bulk);
      bindSellAllWinActions(bulk);
    }

    if (refs.rouletteResult) refs.rouletteResult.innerHTML = '';
    skipBtn?.classList.add('is-consumed');
    if (onPage) skipBtn?.classList.add('hidden');
    if (_modalCard) {
      _modalCard.style.removeProperty('min-height');
      requestAnimationFrame(() => {
        const _h2 = _modalCard.getBoundingClientRect().height;
        _modalCard.style.setProperty('min-height', (_h2 + 30) + 'px', 'important');
      });
    }

    clearPendingOpen();
    showToast(results.length === 1
      ? (isEn ? `You got ${results[0].name}` : `Тебе выпал ${results[0].name}`)
      : (isEn ? `Opened ${results.length} cases` : `Открыто ${results.length} кейсов`));
  }, maxDuration + 120);

  return maxDuration + 180;
}

function getOpsLadderStepCount() {}
function updateOpsLadderStepCountInput() {}

function applyLsrRowHeight(v) {
  document.documentElement.style.setProperty('--lsr-row-h', v + 'px');
  localStorage.setItem('lsr_row_h', v);
  const opsSlider = document.getElementById('opsLadderRowHeightRange');
  const opsLabel  = document.getElementById('opsLadderRowHeightVal');
  const liveSlider  = document.getElementById('lsrHeightSlider');
  const liveLabel   = document.getElementById('lsrHeightVal');
  if (opsSlider) { opsSlider.value = v; }
  if (opsLabel)  { opsLabel.textContent = v + 'px'; }
  if (liveSlider)  { liveSlider.value = v; }
  if (liveLabel)   { liveLabel.textContent = v + 'px'; }
}

const LSR_DEFAULT_H = 49;
let _hazardFallStep = -1;

function triggerHazardFall(hitSlot, variant) {
  if (!hitSlot) return;
  const rect = hitSlot.getBoundingClientRect();
  const size = 34;
  const el = document.createElement('div');
  el.innerHTML = _ldrHazardSVG(variant);
  Object.assign(el.style, {
    position: 'fixed',
    zIndex: '9999',
    pointerEvents: 'none',
    left: Math.round(rect.left + rect.width / 2 - size / 2) + 'px',
    top: (-size - 20) + 'px',
    width: size + 'px',
    height: size + 'px',
    transition: 'top 0.38s cubic-bezier(0.6,0,1,1)',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.top = Math.round(rect.top + rect.height / 2 - size / 2) + 'px';
    setTimeout(() => {
      const overlay = hitSlot.querySelector('.lsr-overlay-hazard');
      if (overlay) { overlay.style.transition = 'opacity 0.1s'; overlay.style.opacity = '1'; }
      el.style.transition = 'opacity 0.1s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 120);
    }, 390);
  }));
}

function bindLsrHeightSliders() {
  localStorage.removeItem('lsr_row_h');
  document.documentElement.style.setProperty('--lsr-row-h', LSR_DEFAULT_H + 'px');

  const toggle = document.getElementById('lsrHeightToggle');
  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', toggleLsrSlider);
  }

  const liveSlider = document.getElementById('lsrHeightSlider');
  if (liveSlider && !liveSlider.dataset.bound) {
    liveSlider.dataset.bound = '1';
    liveSlider.addEventListener('input', () => applyLsrRowHeight(liveSlider.value));
  }

  const opsSlider = document.getElementById('opsLadderRowHeightRange');
  if (opsSlider && !opsSlider.dataset.bound) {
    opsSlider.dataset.bound = '1';
    opsSlider.addEventListener('input', () => applyLsrRowHeight(opsSlider.value));
  }
}

function bindOpsLadderRowHeightSlider() {}

function bindOpsLadderStepCountLiveFix() {}

function renderOpsLadderEditor() {}

function buildOpsCaseRow(c) {}

function bindOpsCaseCreate() {}

function renderOpsCaseList(cases) {}

function renderOpsDeposits(deposits = []) {}
function renderDepositCaseRewardsList(rewards) {
  const el = document.getElementById('depositCaseRewardsList');
  if (!el) return;
  const list = Array.isArray(rewards) ? rewards : [];
  if (!list.length) {
    el.innerHTML = '<div class="muted" style="padding:8px 0">Нет настроенных наград за депозит.</div>';
    return;
  }
  el.innerHTML = list.map(r => `
    <div class="ops-closure-row" style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
      <span style="min-width:90px;font-weight:600;color:var(--accent)">≥ ${r.depositMin} TOK</span>
      <span style="flex:1">${escHtml(r.caseEmoji || '')} ${escHtml(r.caseName || r.caseId)}</span>
      <button type="button" class="ghost-btn small dcr-delete-btn" data-dcr-id="${escAttr(r.id)}">✕ Удалить</button>
    </div>`).join('');
  el.querySelectorAll('.dcr-delete-btn').forEach(btn => {
    bindSafe(btn, 'click', async () => {
      const id = btn.dataset.dcId;
      try {
        const data = await api(`/api/ops/deposit-case-rewards/${encodeURIComponent(id)}`, { method: 'DELETE' });
        state.depositCaseRewards = data.rewards || [];
        renderDepositCaseRewardsList(state.depositCaseRewards);
        showToast('Награда удалена');
      } catch (e) { showToast(e.message); }
    });
  });
}

function populateDepositCaseSelect() {
  const sel = document.getElementById('depositCaseSelectInput');
  if (!sel) return;
  sel.innerHTML = '<option value="">— выбери кейс —</option>' +
    (state.cases || []).map(c => `<option value="${escAttr(c.id)}">${escHtml(c.emoji || '')} ${escHtml(c.name)} (${c.price} TOK)</option>`).join('');
}

function bindOpsDepositRewards() {}

function renderOpsModesList(coCrs) {}

function bindOpsModes() {}

const NUMBER_FONT_OPTIONS = [
  { key:'Syne',              name:'Syne',              cat:'По умолчанию', desc:'Широкий, современный',           url:'' },
  { key:'Orbitron',          name:'Orbitron',          cat:'Gaming',       desc:'Sci-fi · Futuristic',            url:'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap' },
  { key:'Chakra Petch',      name:'Chakra Petch',      cat:'Gaming',       desc:'Cyberpunk · Угловатый',          url:'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&display=swap' },
  { key:'Black Ops One',     name:'Black Ops One',     cat:'Gaming',       desc:'Военный · Жёсткий',              url:'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap' },
  { key:'Audiowide',         name:'Audiowide',         cat:'Gaming',       desc:'Округлый sci-fi',                url:'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' },
  { key:'Michroma',          name:'Michroma',          cat:'Gaming',       desc:'Технический · Чёткий',           url:'https://fonts.googleapis.com/css2?family=Michroma&display=swap' },
  { key:'Aldrich',           name:'Aldrich',           cat:'Gaming',       desc:'Тонкий sci-fi',                  url:'https://fonts.googleapis.com/css2?family=Aldrich&display=swap' },
  { key:'Iceland',           name:'Iceland',           cat:'Gaming',       desc:'Нордический дисплей',            url:'https://fonts.googleapis.com/css2?family=Iceland&display=swap' },
  { key:'Exo 2',             name:'Exo 2',             cat:'Gaming',       desc:'Современный tech-sans',          url:'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;900&display=swap' },
  { key:'Titillium Web',     name:'Titillium Web',     cat:'Gaming',       desc:'Геометрический · Чистый',        url:'https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;700;900&display=swap' },
  { key:'Bangers',           name:'Bangers',           cat:'Gaming',       desc:'Комиксный · Мощный',             url:'https://fonts.googleapis.com/css2?family=Bangers&display=swap' },
  { key:'Changa',            name:'Changa',            cat:'Gaming',       desc:'Жирный угловатый',               url:'https://fonts.googleapis.com/css2?family=Changa:wght@400;700;800&display=swap' },
  { key:'Kanit',             name:'Kanit',             cat:'Gaming',       desc:'Тайский дизайн · Угловатый',     url:'https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&display=swap' },
  { key:'Press Start 2P',    name:'Press Start 2P',    cat:'Gaming',       desc:'Пиксель · Ретро-игры',           url:'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap' },
  { key:'Pixelify Sans',     name:'Pixelify Sans',     cat:'Gaming',       desc:'Мягкий пиксель',                 url:'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap' },
  { key:'Silkscreen',        name:'Silkscreen',        cat:'Gaming',       desc:'LCD-экран · Crispy',             url:'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap' },
  { key:'VT323',             name:'VT323',             cat:'Gaming',       desc:'Терминал · Зелёный монитор',     url:'https://fonts.googleapis.com/css2?family=VT323&display=swap' },
  { key:'Bebas Neue',        name:'Bebas Neue',        cat:'Condensed',    desc:'Высокие заглавные',              url:'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' },
  { key:'Teko',              name:'Teko',              cat:'Condensed',    desc:'Impact-style · Широкий',         url:'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;700&display=swap' },
  { key:'Oswald',            name:'Oswald',            cat:'Condensed',    desc:'Классический сжатый',            url:'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap' },
  { key:'Anton',             name:'Anton',             cat:'Condensed',    desc:'Рекламный · Жирный',             url:'https://fonts.googleapis.com/css2?family=Anton&display=swap' },
  { key:'Barlow Condensed',  name:'Barlow Condensed',  cat:'Condensed',    desc:'Тонкий современный',             url:'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&display=swap' },
  { key:'Squada One',        name:'Squada One',        cat:'Condensed',    desc:'Геометрический квадратный',      url:'https://fonts.googleapis.com/css2?family=Squada+One&display=swap' },
  { key:'Rajdhani',          name:'Rajdhani',          cat:'Condensed',    desc:'Чистый · Индийский дизайн',      url:'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap' },
  { key:'Russo One',         name:'Russo One',         cat:'Condensed',    desc:'Кириллица · Жирный rounded',     url:'https://fonts.googleapis.com/css2?family=Russo+One&display=swap' },
  { key:'League Gothic',     name:'League Gothic',     cat:'Condensed',    desc:'Очень узкий · Афиши',            url:'https://fonts.googleapis.com/css2?family=League+Gothic&display=swap' },
  { key:'Saira Condensed',   name:'Saira Condensed',   cat:'Condensed',    desc:'Тонкий сжатый',                  url:'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;700;900&display=swap' },
  { key:'Space Mono',        name:'Space Mono',        cat:'Monospace',    desc:'Космический · Ретро-терминал',   url:'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap' },
  { key:'JetBrains Mono',    name:'JetBrains Mono',    cat:'Monospace',    desc:'Код · Читаемый',                 url:'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap' },
  { key:'Fira Code',         name:'Fira Code',         cat:'Monospace',    desc:'Лигатуры · Программирование',    url:'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap' },
  { key:'Source Code Pro',   name:'Source Code Pro',   cat:'Monospace',    desc:'Adobe · Чёткий',                 url:'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap' },
  { key:'IBM Plex Mono',     name:'IBM Plex Mono',     cat:'Monospace',    desc:'IBM дизайн · Корпоративный',     url:'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap' },
  { key:'Roboto Mono',       name:'Roboto Mono',       cat:'Monospace',    desc:'Google · Нейтральный',           url:'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap' },
  { key:'Inconsolata',       name:'Inconsolata',       cat:'Monospace',    desc:'Компактный моноспейс',           url:'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap' },
  { key:'Share Tech Mono',   name:'Share Tech Mono',   cat:'Monospace',    desc:'Военный терминал',               url:'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
  { key:'Inter',             name:'Inter',             cat:'Sans-serif',   desc:'UI-стандарт · Нейтральный',      url:'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap' },
  { key:'Roboto',            name:'Roboto',            cat:'Sans-serif',   desc:'Google Material · Универсальный',url:'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap' },
  { key:'Montserrat',        name:'Montserrat',        cat:'Sans-serif',   desc:'Геометрический · Элегантный',    url:'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap' },
  { key:'Poppins',           name:'Poppins',           cat:'Sans-serif',   desc:'Округлый · Дружелюбный',         url:'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap' },
  { key:'Raleway',           name:'Raleway',           cat:'Sans-serif',   desc:'Элегантный · Лёгкий',            url:'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700;900&display=swap' },
  { key:'Open Sans',         name:'Open Sans',         cat:'Sans-serif',   desc:'Читаемый · Базовый',             url:'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&display=swap' },
  { key:'Lato',              name:'Lato',              cat:'Sans-serif',   desc:'Человечный · Тёплый',            url:'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap' },
  { key:'Ubuntu',            name:'Ubuntu',            cat:'Sans-serif',   desc:'Linux · Округлый',               url:'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap' },
  { key:'Work Sans',         name:'Work Sans',         cat:'Sans-serif',   desc:'Профессиональный · Чёткий',      url:'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700;900&display=swap' },
  { key:'DM Sans',           name:'DM Sans',           cat:'Sans-serif',   desc:'Современный · Оптический',       url:'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap' },
  { key:'Manrope',           name:'Manrope',           cat:'Sans-serif',   desc:'Геометрический · Стильный',      url:'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap' },
  { key:'Plus Jakarta Sans', name:'Plus Jakarta Sans', cat:'Sans-serif',   desc:'Современный startup',            url:'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap' },
  { key:'Outfit',            name:'Outfit',            cat:'Sans-serif',   desc:'Чистый · Минималистичный',       url:'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap' },
  { key:'Space Grotesk',     name:'Space Grotesk',     cat:'Sans-serif',   desc:'Tech-стартап · Характерный',     url:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' },
  { key:'Josefin Sans',      name:'Josefin Sans',      cat:'Sans-serif',   desc:'Арт-деко · Изящный',             url:'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&display=swap' },
  { key:'Nunito',            name:'Nunito',            cat:'Sans-serif',   desc:'Мягкий · Закруглённый',          url:'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap' },
  { key:'Mulish',            name:'Mulish',            cat:'Sans-serif',   desc:'Минималистичный · Чистый',       url:'https://fonts.googleapis.com/css2?family=Mulish:wght@400;700;900&display=swap' },
  { key:'Cabin',             name:'Cabin',             cat:'Sans-serif',   desc:'Humanist · Дружелюбный',         url:'https://fonts.googleapis.com/css2?family=Cabin:wght@400;700&display=swap' },
  { key:'Rubik',             name:'Rubik',             cat:'Sans-serif',   desc:'Жирный · Слегка скошенный',      url:'https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;900&display=swap' },
  { key:'Jost',              name:'Jost',              cat:'Sans-serif',   desc:'Геометрический · Немецкий стиль',url:'https://fonts.googleapis.com/css2?family=Jost:wght@400;700;900&display=swap' },
  { key:'Lexend',            name:'Lexend',            cat:'Sans-serif',   desc:'Разработан для читаемости',      url:'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700;900&display=swap' },
  { key:'Figtree',           name:'Figtree',           cat:'Sans-serif',   desc:'Свежий · Современный',           url:'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700;900&display=swap' },
  { key:'Noto Sans',         name:'Noto Sans',         cat:'Sans-serif',   desc:'Google · Все языки',             url:'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700;900&display=swap' },
  { key:'Fredoka One',       name:'Fredoka One',       cat:'Rounded',      desc:'Мультяшный · Игривый',           url:'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap' },
  { key:'Righteous',         name:'Righteous',         cat:'Rounded',      desc:'Смелый · Ретро-округлый',        url:'https://fonts.googleapis.com/css2?family=Righteous&display=swap' },
  { key:'Paytone One',       name:'Paytone One',       cat:'Rounded',      desc:'Большой · Жирный',               url:'https://fonts.googleapis.com/css2?family=Paytone+One&display=swap' },
  { key:'Boogaloo',          name:'Boogaloo',          cat:'Rounded',      desc:'Весёлый · Неформальный',         url:'https://fonts.googleapis.com/css2?family=Boogaloo&display=swap' },
  { key:'Quicksand',         name:'Quicksand',         cat:'Rounded',      desc:'Тонкий · Воздушный',             url:'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap' },
  { key:'Comfortaa',         name:'Comfortaa',         cat:'Rounded',      desc:'Мягкий · Геометрический',        url:'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap' },
  { key:'Varela Round',      name:'Varela Round',      cat:'Rounded',      desc:'Дружелюбный · Чёткий',           url:'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap' },
  { key:'Playfair Display',  name:'Playfair Display',  cat:'Serif',        desc:'Элегантный · Редакция',          url:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap' },
  { key:'Merriweather',      name:'Merriweather',      cat:'Serif',        desc:'Читаемый · Книжный',             url:'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap' },
  { key:'Lora',              name:'Lora',              cat:'Serif',        desc:'Рукописный serif · Тёплый',      url:'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap' },
  { key:'Cormorant Garamond',name:'Cormorant Garamond',cat:'Serif',        desc:'Высокая контрастность · Люкс',   url:'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap' },
  { key:'EB Garamond',       name:'EB Garamond',       cat:'Serif',        desc:'Классический Garamond',          url:'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap' },
  { key:'DM Serif Display',  name:'DM Serif Display',  cat:'Serif',        desc:'Современный serif · Крупный',    url:'https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap' },
  { key:'Libre Baskerville', name:'Libre Baskerville', cat:'Serif',        desc:'Традиционный · Надёжный',        url:'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap' },
  { key:'Pacifico',          name:'Pacifico',          cat:'Script',       desc:'Сёрф · 60-е',                   url:'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
  { key:'Dancing Script',    name:'Dancing Script',    cat:'Script',       desc:'Каллиграфия · Живой',            url:'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap' },
  { key:'Satisfy',           name:'Satisfy',           cat:'Script',       desc:'Элегантная рукопись',            url:'https://fonts.googleapis.com/css2?family=Satisfy&display=swap' },
  { key:'Great Vibes',       name:'Great Vibes',       cat:'Script',       desc:'Свадебный · Плавный',            url:'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' },
  { key:'Caveat',            name:'Caveat',            cat:'Script',       desc:'Заметки · Ручной',               url:'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap' },
  { key:'Permanent Marker',  name:'Permanent Marker',  cat:'Script',       desc:'Маркер · Граффити',              url:'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap' },
  { key:'Special Elite',     name:'Special Elite',     cat:'Script',       desc:'Печатная машинка · Винтаж',      url:'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap' },
];

const NUMBERS_FONT_SELECTORS = 'body, body *';
let _fontSelectorDraft = null; 

function applyNumbersFont(fontKey, selectorOverride) {
  const opt = NUMBER_FONT_OPTIONS.find(f => f.key === fontKey) || NUMBER_FONT_OPTIONS[0];
  const selector = selectorOverride !== undefined
    ? selectorOverride
    : (state.fontSettings?.fontSelector || NUMBERS_FONT_SELECTORS);
  const fontWeight = state.fontSettings?.fontWeight || '';
  const fontStyle  = state.fontSettings?.fontStyle  || '';

  const linkEl = document.getElementById('numbers-font-link');
  if (linkEl) linkEl.href = opt.url || '';

  const old = document.getElementById('numbers-font-style');
  if (old) old.remove();
  const styleEl = document.createElement('style');
  styleEl.id = 'numbers-font-style';
  const hasAny = opt.key !== 'Syne' || selector !== NUMBERS_FONT_SELECTORS || fontWeight || fontStyle;
  if (hasAny) {
    let css = `${selector || NUMBERS_FONT_SELECTORS} { font-family: '${opt.key}', sans-serif !important;`;
    if (fontWeight) css += ` font-weight: ${fontWeight} !important;`;
    if (fontStyle)  css += ` font-style: ${fontStyle} !important;`;
    css += ' }';
    styleEl.textContent = css;
  }
  document.head.appendChild(styleEl);
}

function applyTextOverrides(overrides) {
  if (!Array.isArray(overrides)) return;
  overrides.forEach(({ selector, text }) => {
    try {
      document.querySelectorAll(selector).forEach(el => { el.textContent = text; });
    } catch (e) {  }
  });
}

async function applyFontRules(rules) {
  if (!Array.isArray(rules) || !rules.length) {
    const old = document.getElementById('font-rules-style');
    if (old) old.remove();
    return;
  }
  let css = '';
  for (const r of rules) {
    const opt = NUMBER_FONT_OPTIONS.find(f => f.key === r.fontKey) || NUMBER_FONT_OPTIONS[0];
    if (opt.url) {
      const lid = `font-rule-link-${opt.key.replace(/\s+/g,'_')}`;
      if (!document.getElementById(lid)) {
        const l = document.createElement('link');
        l.id = lid; l.rel = 'stylesheet'; l.href = opt.url;
        document.head.appendChild(l);
      }
    }
    if (r.digitsOnly) {
      const digitFamily = `__digits_${opt.key.replace(/\s+/g,'_')}`;
      const src = await getDigitFontSrc(opt);
      if (src) {
        css += `@font-face { font-family: '${digitFamily}'; src: ${src}; unicode-range: U+0030-0039, U+002E, U+002C, U+0025; }\n`;
        css += `${r.selector} { font-family: '${digitFamily}', sans-serif !important; }\n`;
      } else {
        css += `${r.selector} { font-family: '${opt.key}', sans-serif !important; }\n`;
      }
    } else {
      let rule = `${r.selector} { font-family: '${opt.key}', sans-serif !important;`;
      if (r.fontWeight) rule += ` font-weight: ${r.fontWeight} !important;`;
      if (r.fontStyle)  rule += ` font-style: ${r.fontStyle} !important;`;
      rule += ' }';
      css += rule + '\n';
    }
  }
  const styleEl = document.createElement('style');
  styleEl.id = 'font-rules-style';
  styleEl.textContent = css;
  const old = document.getElementById('font-rules-style');
  if (old) old.replaceWith(styleEl);
  else document.head.appendChild(styleEl);
}

async function applyGlobalDigitFont(fontKey) {
  const old = document.getElementById('global-digit-font-style');
  if (!fontKey) { if (old) old.remove(); return; }
  const opt = NUMBER_FONT_OPTIONS.find(f => f.key === fontKey);
  if (!opt) { if (old) old.remove(); return; }
  const src = await getDigitFontSrc(opt);
  const baseFont = state.fontSettings?.numbersFont || 'Syne';
  let css = '';
  if (src) {
    css += `@font-face { font-family: '__gd'; src: ${src}; unicode-range: U+0030-0039, U+002E, U+002C, U+0025; font-display: swap; }\n`;
    css += `body, body * { font-family: '__gd', '${baseFont}', sans-serif !important; }\n`;
  }
  const styleEl = document.createElement('style');
  styleEl.id = 'global-digit-font-style';
  styleEl.textContent = css;
  if (old) old.replaceWith(styleEl);
  else document.head.appendChild(styleEl);
}

async function saveFontSettings(patch = {}) {
  const payload = {
    numbersFont:  state.fontSettings?.numbersFont  || 'Syne',
    fontSelector: (_fontSelectorDraft || '').trim() || NUMBERS_FONT_SELECTORS,
    fontWeight:   state.fontSettings?.fontWeight   || '',
    fontStyle:    state.fontSettings?.fontStyle    || '',
    ...patch
  };
  const result = await api('/api/ops/font-settings', { method: 'POST', body: JSON.stringify(payload) });
  if (result.fontSettings) state.fontSettings = result.fontSettings;
  return result;
}

async function saveFontRules(rules) {
  const result = await api('/api/ops/font-rules', { method: 'PUT', body: JSON.stringify({ rules }) });
  if (Array.isArray(result.fontRules)) {
    state.fontRules = result.fontRules;
    applyFontRules(state.fontRules);
  }
  return result;
}

let _newRuleFontKey = 'Syne';
let _newRuleWeight = '';
let _newRuleStyle = '';
let _newRuleDigitsOnly = false;

const _digitFontSrcCache = new Map();
async function getDigitFontSrc(opt) {
  if (_digitFontSrcCache.has(opt.key)) return _digitFontSrcCache.get(opt.key);
  if (!opt.url) { _digitFontSrcCache.set(opt.key, null); return null; }
  try {
    const r = await fetch(opt.url);
    const txt = await r.text();
    const blocks = [...txt.matchAll(/src:\s*(url\([^)]+\)[^;]*)/g)];
    const src = blocks[0]?.[1]?.trim().replace(/\s+/g, ' ') || null;
    _digitFontSrcCache.set(opt.key, src);
    return src;
  } catch(e) { _digitFontSrcCache.set(opt.key, null); return null; }
}

function renderFontPicker() {
  const grid = document.getElementById('fontPickerGrid');
  if (!grid) return;

  NUMBER_FONT_OPTIONS.forEach(opt => {
    if (!opt.url) return;
    const id = `preview-font-link-${opt.key.replace(/\s+/g,'_')}`;
    if (!document.getElementById(id)) {
      const l = document.createElement('link');
      l.id = id; l.rel = 'stylesheet'; l.href = opt.url;
      document.head.appendChild(l);
    }
  });

  const wrap = grid.parentElement;

  const existingDigitSec = document.getElementById('globalDigitFontSec');
  if (existingDigitSec) existingDigitSec.remove();
  const digitSec = document.createElement('div');
  digitSec.id = 'globalDigitFontSec';
  digitSec.style.cssText = 'margin-bottom:20px;display:flex;flex-direction:column;gap:10px';
  const curDigitFont = state.fontSettings?.digitFont || '';
  digitSec.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Шрифт для цифр — весь сайт</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">Применяется только к 0–9 глобально через unicode-range, буквы не затрагиваются</div>
      </div>
      <button type="button" id="globalDigitFontClear" class="ghost-btn small" style="font-size:11px;color:#58A6FF;border-color:rgba(88,166,255,.3);padding:4px 10px;white-space:nowrap">Выключить</button>
    </div>
    <div id="globalDigitFontCards" style="display:flex;flex-wrap:wrap;gap:8px">
      ${NUMBER_FONT_OPTIONS.map(opt => `
        <div class="gdf-card" data-gdf-key="${escAttr(opt.key)}" style="
          cursor:pointer;padding:8px 14px;border-radius:10px;
          border:2px solid ${opt.key === curDigitFont ? 'var(--accent)' : 'rgba(255,255,255,0.08)'};
          background:${opt.key === curDigitFont ? 'rgba(56,104,192,0.1)' : 'rgba(255,255,255,0.03)'};
          transition:border-color .15s,background .15s;
          display:flex;flex-direction:column;gap:2px;min-width:90px">
          <span style="font-family:'${escHtml(opt.key)}',sans-serif;font-size:20px;font-weight:700;color:${opt.key === curDigitFont ? 'var(--accent)' : 'var(--text)'}">01234</span>
          <span style="font-size:10px;color:var(--muted)">${escHtml(opt.name)}</span>
        </div>`).join('')}
    </div>
    <button type="button" id="globalDigitFontSave" class="primary-btn small" style="align-self:flex-start">Сохранить цифровой шрифт</button>`;
  wrap.insertBefore(digitSec, grid);

  let _gdfSelected = curDigitFont;
  digitSec.querySelectorAll('.gdf-card').forEach(card => {
    bindSafe(card, 'click', () => {
      _gdfSelected = card.dataset.gdfKey;
      digitSec.querySelectorAll('.gdf-card').forEach(c => {
        const active = c.dataset.gdfKey === _gdfSelected;
        c.style.border = `2px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`;
        c.style.background = active ? 'rgba(56,104,192,0.1)' : 'rgba(255,255,255,0.03)';
        c.querySelector('span').style.color = active ? 'var(--accent)' : 'var(--text)';
      });
    });
  });

  bindSafe(document.getElementById('globalDigitFontSave'), 'click', async () => {
    try {
      const r = await saveFontSettings({ digitFont: _gdfSelected });
      if (r.fontSettings) state.fontSettings = r.fontSettings;
      await applyGlobalDigitFont(_gdfSelected);
      renderFontPicker();
      showToast(`Шрифт для цифр: ${_gdfSelected || 'выключен'}`);
    } catch (e) { showToast(e.message); }
  });

  bindSafe(document.getElementById('globalDigitFontClear'), 'click', async () => {
    _gdfSelected = '';
    try {
      const r = await saveFontSettings({ digitFont: '' });
      if (r.fontSettings) state.fontSettings = r.fontSettings;
      await applyGlobalDigitFont('');
      renderFontPicker();
      showToast('Цифровой шрифт выключен');
    } catch (e) { showToast(e.message); }
  });

  const existingRulesEl = document.getElementById('fontRulesList');
  if (existingRulesEl) existingRulesEl.remove();
  const rulesEl = document.createElement('div');
  rulesEl.id = 'fontRulesList';
  rulesEl.style.cssText = 'margin-bottom:20px;display:flex;flex-direction:column;gap:6px';
  const rules = state.fontRules || [];
  rulesEl.innerHTML = `<div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Активные правила (${rules.length})</div>` +
    (rules.length ? rules.map(r => `
      <div class="font-rule-row" data-rule-id="${escAttr(r.id)}" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:8px 12px">
        <code style="flex:1;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(r.selector)}</code>
        <span style="font-family:'${escHtml(r.fontKey)}',sans-serif;font-size:15px;font-weight:700;color:var(--text);white-space:nowrap">${escHtml(r.fontKey)}</span>
        ${r.fontWeight ? `<span style="font-size:10px;color:var(--muted)">${escHtml(r.fontWeight)}</span>` : ''}
        ${r.digitsOnly ? `<span style="font-size:10px;font-weight:700;background:rgba(255,180,50,.15);color:#ffb432;border:1px solid rgba(255,180,50,.3);border-radius:4px;padding:2px 6px;white-space:nowrap">0–9</span>` : ''}
        <button type="button" class="ghost-btn small font-rule-delete-btn" data-rule-id="${escAttr(r.id)}" style="padding:4px 8px;font-size:11px;color:#58A6FF;border-color:rgba(88,166,255,.3)">✕</button>
      </div>`).join('') :
      '<div style="color:var(--muted);font-size:12px">Правил нет — добавьте ниже</div>');

  wrap.insertBefore(rulesEl, grid);

  rulesEl.querySelectorAll('.font-rule-delete-btn').forEach(btn => {
    bindSafe(btn, 'click', async () => {
      const id = btn.dataset.ruleId;
      const updated = (state.fontRules || []).filter(r => r.id !== id);
      try {
        await saveFontRules(updated);
        renderFontPicker();
        showToast('Правило удалено');
      } catch (e) { showToast(e.message); }
    });
  });

  const existingSel = document.getElementById('fontNewRuleSel');
  if (existingSel) existingSel.remove();
  const selWrap = document.createElement('div');
  selWrap.id = 'fontNewRuleSel';
  selWrap.style.cssText = 'margin-bottom:14px;display:flex;flex-direction:column;gap:6px';
  selWrap.innerHTML = `
    <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Новое правило</div>
    <div style="display:flex;gap:8px;align-items:center">
      <input id="fontNewRuleSelectorInput" class="ops-input" type="text" style="flex:1;font-family:monospace;font-size:12px" placeholder="CSS-селектор: body, #profileBtn, .case-price…" value="" />
    </div>
    <div style="font-size:10px;color:var(--muted)">Примеры: <code>body, body *</code> · <code>#profileBtn</code> · <code>.case-price, .case-title</code></div>`;
  wrap.insertBefore(selWrap, grid);

  const cats = [...new Set(NUMBER_FONT_OPTIONS.map(o => o.cat))];
  grid.innerHTML = cats.map(cat => {
    const opts = NUMBER_FONT_OPTIONS.filter(o => o.cat === cat);
    return `
      <div style="grid-column:1/-1;margin-top:14px;margin-bottom:2px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">${escHtml(cat)}</div>
      ${opts.map(opt => `
        <div class="font-picker-card ${opt.key === _newRuleFontKey ? 'is-selected' : ''}" data-font-key="${escAttr(opt.key)}" style="
          cursor:pointer;
          border:2px solid ${opt.key === _newRuleFontKey ? 'var(--accent)' : 'rgba(255,255,255,0.08)'};
          border-radius:0;padding:12px 14px;
          background:${opt.key === _newRuleFontKey ? 'rgba(56,104,192,0.08)' : 'rgba(255,255,255,0.03)'};
          transition:border-color .15s,background .15s;
          display:flex;flex-direction:column;gap:4px;">
          <div style="font-family:'${opt.key}',sans-serif;font-size:24px;font-weight:700;line-height:1;letter-spacing:0.04em;color:${opt.key === _newRuleFontKey ? 'var(--accent)' : 'var(--text)'}">
            Ag 123
          </div>
          <div style="font-size:11px;font-weight:700;color:${opt.key === _newRuleFontKey ? 'var(--accent)' : 'var(--text)'}">
            ${escHtml(opt.name)}
          </div>
          <div style="font-size:10px;color:var(--muted);margin-top:1px">
            ${escHtml(opt.desc)}
          </div>
        </div>`).join('')}`;
  }).join('');

  grid.querySelectorAll('.font-picker-card').forEach(card => {
    bindSafe(card, 'click', () => {
      _newRuleFontKey = card.dataset.fontKey;
      grid.querySelectorAll('.font-picker-card').forEach(c => {
        const active = c.dataset.fontKey === _newRuleFontKey;
        c.style.border = `2px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`;
        c.style.background = active ? 'rgba(56,104,192,0.08)' : 'rgba(255,255,255,0.03)';
        c.querySelector('div').style.color = active ? 'var(--accent)' : 'var(--text)';
      });
    });
  });

  const existingCtrl = document.getElementById('fontNewRuleCtrl');
  if (existingCtrl) existingCtrl.remove();
  const ctrlWrap = document.createElement('div');
  ctrlWrap.id = 'fontNewRuleCtrl';
  ctrlWrap.style.cssText = 'margin-top:14px;display:flex;flex-direction:column;gap:10px';
  const weightBtns = [
    { val: '', label: 'Auto' },
    { val: '400', label: '400' },
    { val: '600', label: '600' },
    { val: '700', label: '700' },
    { val: '800', label: '800' },
    { val: '900', label: '900' }
  ].map(b => `<button type="button" class="new-rule-weight-btn ghost-btn" data-weight="${escAttr(b.val)}" style="font-size:12px;padding:5px 10px;${_newRuleWeight === b.val ? 'border-color:var(--accent);color:var(--accent)' : ''}">${escHtml(b.label)}</button>`).join('');
  const styleBtns = [
    { val: '', label: 'Normal' },
    { val: 'italic', label: 'Italic' }
  ].map(b => `<button type="button" class="new-rule-style-btn ghost-btn" data-style="${escAttr(b.val)}" style="font-size:12px;padding:5px 10px;${_newRuleStyle === b.val ? 'border-color:var(--accent);color:var(--accent)' : ''}${b.val === 'italic' ? ';font-style:italic' : ''}">${escHtml(b.label)}</button>`).join('');
  ctrlWrap.innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap">Жирность</span>
      ${weightBtns}
      <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-left:8px;white-space:nowrap">Стиль</span>
      ${styleBtns}
    </div>
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;width:fit-content">
      <input type="checkbox" id="fontNewRuleDigitsOnly" style="width:16px;height:16px;accent-color:var(--accent);cursor:pointer" ${_newRuleDigitsOnly ? 'checked' : ''}>
      <span style="font-size:13px;font-weight:600">Только цифры <span style="font-size:11px;color:var(--muted);font-weight:400">(применяет шрифт только к 0–9, остальной текст не трогает)</span></span>
    </label>
    <button type="button" id="fontAddRuleBtn" class="primary-btn" style="align-self:flex-start">+ Добавить правило</button>`;
  wrap.appendChild(ctrlWrap);

  ctrlWrap.querySelectorAll('.new-rule-weight-btn').forEach(btn => {
    bindSafe(btn, 'click', () => {
      _newRuleWeight = btn.dataset.weight;
      ctrlWrap.querySelectorAll('.new-rule-weight-btn').forEach(b => {
        const a = b.dataset.weight === _newRuleWeight;
        b.style.borderColor = a ? 'var(--accent)' : '';
        b.style.color = a ? 'var(--accent)' : '';
      });
    });
  });

  ctrlWrap.querySelectorAll('.new-rule-style-btn').forEach(btn => {
    bindSafe(btn, 'click', () => {
      _newRuleStyle = btn.dataset.style;
      ctrlWrap.querySelectorAll('.new-rule-style-btn').forEach(b => {
        const a = b.dataset.style === _newRuleStyle;
        b.style.borderColor = a ? 'var(--accent)' : '';
        b.style.color = a ? 'var(--accent)' : '';
      });
    });
  });

  const digitsCheckbox = document.getElementById('fontNewRuleDigitsOnly');
  if (digitsCheckbox) {
    bindSafe(digitsCheckbox, 'change', () => { _newRuleDigitsOnly = digitsCheckbox.checked; });
  }

  bindSafe(document.getElementById('fontAddRuleBtn'), 'click', async () => {
    const selectorInput = document.getElementById('fontNewRuleSelectorInput');
    const selector = (selectorInput?.value || '').trim();
    if (!selector) { showToast('Введите CSS-селектор'); return; }
    const newRule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,5),
      selector,
      fontKey: _newRuleFontKey || 'Syne',
      fontWeight: _newRuleWeight,
      fontStyle: _newRuleStyle,
      digitsOnly: !!_newRuleDigitsOnly
    };
    const updated = [...(state.fontRules || []), newRule];
    try {
      await saveFontRules(updated);
      if (selectorInput) selectorInput.value = '';
      renderFontPicker();
      showToast(`Правило добавлено: ${selector} → ${newRule.fontKey}`);
    } catch (e) { showToast(e.message); }
  });
}

function renderOpsCategoryOrder() {}

function renderFreeCase() {
  const banner = document.getElementById('freeCaseBanner');
  if (!banner) return;
  const cfg = state.freeCase;
  if (!cfg || !cfg.enabled) { banner.classList.add('hidden'); stopFreeCaseTimer(); return; }
  banner.classList.remove('hidden');

  const mediaEl = document.getElementById('freeCaseBannerMedia');
  if (mediaEl) {
    if (cfg.caseImage) {
      mediaEl.innerHTML = `<img src="${escHtml(cfg.caseImage)}" class="free-case-banner-img" alt="">`;
    } else {
      mediaEl.innerHTML = `<span class="free-case-banner-emoji">${escHtml(cfg.caseEmoji || '🎁')}</span>`;
    }
  }
  const titleEl = document.getElementById('freeCaseBannerTitle');
  if (titleEl) titleEl.textContent = cfg.caseName || 'Бесплатный кейс';

  const subEl = document.getElementById('freeCaseBannerSub');
  if (subEl) {
    const h = cfg.intervalHours;
    const label = h < 1 ? `${Math.round(h * 60)} мин` : h === 24 ? 'каждые сутки' : `каждые ${h} ч`;
    subEl.textContent = label;
  }

  updateFreeCaseBannerState();
  startFreeCaseTimer();
}

let _stakingState = null;
let _stakingPlanId = null;

function stakingDeclension(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  return b === 1 ? one : many;
}

function formatStakingCountdown(ms) {
  if (!(ms > 0)) return 'уже готово';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 1) return `${h} ч ${m} мин`;
  return `${Math.max(1, m)} мин`;
}

let _stakingExtra = { history: [], totals: null, rewards: [] };

async function loadStaking() {
  try {
    const data = await api('/api/staking');
    _stakingState = data.staking || null;
    _stakingExtra = {
      history: Array.isArray(data.history) ? data.history : [],
      totals: data.totals || null,
      rewards: Array.isArray(data.rewards) ? data.rewards : [],
    };
  } catch {
    _stakingState = null;
  }
  renderStaking();
}

function renderStakingSidePanels() {
  const t = _stakingExtra.totals || { staked: 0, earned: 0, completed: 0 };
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('stakingTotalStaked', `${fmt(t.staked)} TOK`);
  set('stakingTotalEarned', t.earned > 0 ? `+${fmt(t.earned)} TOK` : '0 TOK');
  set('stakingTotalDone', fmt(t.completed));
}

function renderStakingRewards() {
  const card = document.getElementById('stakingRewardsCard');
  const box = document.getElementById('stakingRewards');
  if (!card || !box) return;
  const rows = (_stakingExtra.rewards || []).filter(r => r.reward);
  const sc = _stakingState?.successCase || null;
  if (!rows.length && !sc) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');

  const scHtml = sc ? (() => {
    const pic = sc.image
      ? `<img class="staking-reward-img" src="${escAttr(sc.image)}" alt="" loading="lazy">`
      : `<span class="staking-reward-emoji">${escHtml(sc.emoji || '🎁')}</span>`;
    return `<div class="staking-reward is-any-plan">
      <div class="staking-reward-medal">
        ${pic}
        <span class="staking-reward-ribbon">любой срок</span>
      </div>
      <span class="staking-reward-text">
        <span class="staking-reward-name">${escHtml(sc.name)}${sc.qty > 1 ? ` ×${sc.qty}` : ''}</span>
        <span class="staking-reward-caption">за каждый успешный стейк от ${fmt(sc.minAmount)} TOK</span>
      </span>
      <span class="staking-reward-kind">кейс</span>
    </div>`;
  })() : '';

  const activePlan = _stakingState?.active ? _stakingState.planId : null;
  box.innerHTML = scHtml + rows.map((r) => {
    const w = r.reward;
    const pic = w.image
      ? `<img class="staking-reward-img" src="${escAttr(w.image)}" alt="" loading="lazy">`
      : `<span class="staking-reward-emoji">${escHtml(w.emoji || '🎁')}</span>`;
    return `<div class="staking-reward${r.planId === activePlan ? ' is-mine' : ''}">
      <div class="staking-reward-medal">
        ${pic}
        <span class="staking-reward-ribbon">${escHtml(r.planName)}</span>
      </div>
      <span class="staking-reward-text">
        <span class="staking-reward-name">${escHtml(w.name)}${w.qty > 1 ? ` ×${w.qty}` : ''}</span>
        <span class="staking-reward-caption">за успешный стейк</span>
      </span>
      <span class="staking-reward-kind">${w.type === 'case' ? 'кейс' : 'предмет'}</span>
    </div>`;
  }).join('');
}

function renderStakingHistory() {
  const box = document.getElementById('stakingHistory');
  const note = document.getElementById('stakingHistoryNote');
  if (!box) return;
  const rows = _stakingExtra.history || [];
  if (note) note.textContent = rows.length ? `${rows.length} ${stakingDeclension(rows.length, 'запись', 'записи', 'записей')}` : '';
  if (!rows.length) {
    box.innerHTML = '<div class="staking-history-empty muted">Здесь появятся закрытые стейки — сколько заморозил и сколько вернулось.</div>';
    return;
  }
  box.innerHTML = rows.map((r) => {
    const delta = Math.round((Number(r.paidOut) || 0) - (Number(r.amount) || 0));
    const when = r.finishedAt ? new Date(r.finishedAt).toLocaleDateString('ru-RU') : '';
    return `<div class="staking-history-row">
      <span class="staking-history-plan">${escHtml(r.planName || `${r.durationDays} дн.`)}</span>
      <span class="staking-history-amount">${fmt(r.amount)} → ${fmt(r.paidOut)}</span>
      <span class="staking-history-delta${delta >= 0 ? ' is-plus' : ' is-minus'}">${delta >= 0 ? '+' : ''}${fmt(delta)}</span>
      <span class="staking-history-when muted">${escHtml(when)}${r.reason === 'early' ? ' · досрочно' : ''}</span>
    </div>`;
  }).join('');
}

function renderStaking() {
  const card = document.getElementById('stakingCard');
  if (!card) return;
  const cfg = _stakingState?.config || state.staking;
  const zone = document.querySelector('.bonus-zone-staking');
  const closedForMe = Boolean(state.closedFeatures?.staking) && !state._perm;
  if (!cfg || !cfg.enabled || closedForMe) {
    card.classList.add('hidden');
    zone?.classList.add('hidden');
    return;
  }
  zone?.classList.remove('hidden');
  card.classList.remove('hidden');

  renderStakingSidePanels();
  renderStakingRewards();
  renderStakingHistory();

  const plans = (cfg.plans || []).filter(p => p.enabled);

  const intro = document.getElementById('stakingIntro');
  if (intro) {
    intro.textContent = 'Заморозь TOK и забирай их обратно частями — по одной каждые сутки. Чем дольше срок, тем больше сверху.';
  }

  const badge = document.getElementById('stakingHeadBadge');
  if (badge) {
    const best = plans.reduce((a, p) => Math.max(a, p.bonusPercent), 0);
    badge.textContent = best > 0 ? `до +${best}%` : '';
    badge.classList.toggle('hidden', !(best > 0));
  }

  const idle = document.getElementById('stakingIdle');
  const active = document.getElementById('stakingActive');
  const st = _stakingState;

  if (!st || !st.active) {
    idle?.classList.remove('hidden');
    active?.classList.add('hidden');

    if (!plans.some(p => p.id === _stakingPlanId)) _stakingPlanId = plans[0]?.id || null;

    const grid = document.getElementById('stakingPlans');
    if (grid) {
      grid.innerHTML = plans.map((p) => {
        const on = p.id === _stakingPlanId;
        return `<button type="button" class="staking-plan${on ? ' is-on' : ''}" data-plan="${escAttr(p.id)}">
          <span class="staking-plan-name">${escHtml(p.name)}</span>
          <span class="staking-plan-pct">${p.bonusPercent > 0 ? `+${p.bonusPercent}%` : 'без бонуса'}</span>
          <span class="staking-plan-days">${p.durationDays} ${stakingDeclension(p.durationDays, 'день', 'дня', 'дней')}</span>
        </button>`;
      }).join('');
      grid.querySelectorAll('.staking-plan').forEach((b) => {
        bindSafe(b, 'click', () => { _stakingPlanId = b.dataset.plan; renderStaking(); });
      });
    }

    const plan = plans.find(p => p.id === _stakingPlanId) || plans[0] || null;
    const hint = document.getElementById('stakingIdleHint');
    if (hint && plan) {
      const limits = [`минимум ${plan.minAmount} TOK`];
      if (plan.maxAmount) limits.push(`максимум ${plan.maxAmount} TOK`);
      if (!cfg.allowEarlyExit) limits.push('забрать раньше срока нельзя');
      if (plan.durationDays > 1) limits.push('тело вернётся последней частью, по дням капает только надбавка');
      hint.textContent = limits.join(' · ');
    }
    return;
  }

  idle?.classList.add('hidden');
  active?.classList.remove('hidden');

  const head = document.getElementById('stakingActiveHead');
  if (head) {
    const name = st.planName || `${st.durationDays} ${stakingDeclension(st.durationDays, 'день', 'дня', 'дней')}`;
    head.innerHTML = `<span class="staking-active-plan">${escHtml(name)}</span>`
      + (st.bonusPercent > 0 ? `<span class="staking-active-pct">+${st.bonusPercent}%</span>` : '');
  }

  const pct = Math.round((st.claimedParts / st.durationDays) * 100);
  const fill = document.getElementById('stakingProgressFill');
  if (fill) fill.style.width = `${pct}%`;
  const label = document.getElementById('stakingProgressLabel');
  if (label) label.textContent = `${st.claimedParts} из ${st.durationDays} ${stakingDeclension(st.durationDays, 'части', 'частей', 'частей')} забрано`;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stakingAmount', `${fmt(st.amount)} TOK`);
  set('stakingTotal', `${fmt(st.totalPayout)} TOK`);
  set('stakingRemaining', `${fmt(st.remaining)} TOK`);

  const claimBtn = document.getElementById('stakingClaimBtn');
  const nextHint = document.getElementById('stakingNextHint');
  if (claimBtn) {
    const ready = st.claimable > 0;
    claimBtn.disabled = !ready;
    claimBtn.textContent = ready ? `Забрать ${fmt(st.claimable)} TOK` : 'Пока нечего забирать';
  }
  if (nextHint) {
    const base = st.claimable > 0
      ? `Доступно ${st.maturedParts - st.claimedParts} ${stakingDeclension(st.maturedParts - st.claimedParts, 'часть', 'части', 'частей')}`
      : (st.nextPartAt ? `Следующая часть через ${formatStakingCountdown(st.nextPartAt - Date.now())}` : '');
    const bodyNote = st.durationDays > 1 && st.claimedParts < st.durationDays - 1
      ? `Заморозка ${fmt(st.amount)} TOK придёт последней частью`
      : '';
    nextHint.textContent = [base, bodyNote].filter(Boolean).join(' · ');
  }

  const cancelBtn = document.getElementById('stakingCancelBtn');
  if (cancelBtn) cancelBtn.classList.toggle('hidden', !cfg.allowEarlyExit);
}

function bindStakingControls() {
  const startBtn = document.getElementById('stakingStartBtn');
  if (startBtn && !startBtn.dataset.bound) {
    startBtn.dataset.bound = '1';
    bindSafe(startBtn, 'click', async () => {
      const input = document.getElementById('stakingAmountInput');
      const amount = Math.round(Number(input?.value) || 0);
      if (!(amount > 0)) { showToast('Укажи сумму'); return; }
      startBtn.disabled = true;
      try {
        const data = await api('/api/staking/start', { method: 'POST', body: JSON.stringify({ amount, planId: _stakingPlanId }) });
        _stakingState = data.staking;
        if (data.user) applyUserUpdate(data.user);
        if (input) input.value = '';
        renderStaking();
        showToast('Готово — забирай по части каждый день');
      } catch (e) {
        showToast(e.message || 'Не получилось');
      } finally {
        startBtn.disabled = false;
      }
    });
  }

  const claimBtn = document.getElementById('stakingClaimBtn');
  if (claimBtn && !claimBtn.dataset.bound) {
    claimBtn.dataset.bound = '1';
    bindSafe(claimBtn, 'click', async () => {
      claimBtn.disabled = true;
      try {
        const data = await api('/api/staking/claim', { method: 'POST' });
        _stakingState = data.staking;
        if (data.user) applyUserUpdate(data.user);
        renderStaking();
        const prizes = [];
        if (data.reward) prizes.push(`${data.reward.name}${data.reward.qty > 1 ? ` ×${data.reward.qty}` : ''}`);
        if (data.successCase) prizes.push(`${data.successCase.name}${data.successCase.qty > 1 ? ` ×${data.successCase.qty}` : ''}`);
        if (prizes.length) {
          showToast(`Забрано ${fmt(data.claimed)} TOK — стейк завершён. ${prizes.length > 1 ? 'Награды' : 'Награда'}: ${prizes.join(', ')}`);
        } else {
          showToast(data.finished ? `Забрано ${fmt(data.claimed)} TOK — стейк завершён` : `Забрано ${fmt(data.claimed)} TOK`);
        }
      } catch (e) {
        showToast(e.message || 'Не получилось');
        claimBtn.disabled = false;
      }
    });
  }

  const cancelBtn = document.getElementById('stakingCancelBtn');
  if (cancelBtn && !cancelBtn.dataset.bound) {
    cancelBtn.dataset.bound = '1';
    bindSafe(cancelBtn, 'click', async () => {
      if (!confirm('Закрыть стейк досрочно? Вернётся уже созревшее плюс остаток вложенного, но надбавка за незавершённые дни не начислится.')) return;
      cancelBtn.disabled = true;
      try {
        const data = await api('/api/staking/cancel', { method: 'POST' });
        _stakingState = data.staking;
        if (data.user) applyUserUpdate(data.user);
        renderStaking();
        showToast(`Возвращено ${fmt(data.returned)} TOK`);
      } catch (e) {
        showToast(e.message || 'Не получилось');
      } finally {
        cancelBtn.disabled = false;
      }
    });
  }
}

function renderReferralCase() {
  const banner = document.getElementById('referralCaseBanner');
  if (!banner) return;
  const cfg = state.referralCase;
  if (!cfg || !cfg.enabled || !cfg.canClaim) { banner.classList.add('hidden'); return; }
  banner.classList.remove('hidden');

  const mediaEl = document.getElementById('referralCaseBannerMedia');
  if (mediaEl) {
    if (cfg.caseImage) {
      mediaEl.innerHTML = `<img src="${escHtml(cfg.caseImage)}" class="free-case-banner-img" alt="">`;
    } else {
      mediaEl.innerHTML = `<span class="free-case-banner-emoji">${escHtml(cfg.caseEmoji || '🎁')}</span>`;
    }
  }
  const titleEl = document.getElementById('referralCaseBannerTitle');
  if (titleEl) titleEl.textContent = cfg.caseName || 'Реферальный кейс';
}

function getFreeCaseCanClaim() {
  const u = state.user;
  const cfg = state.freeCase;
  if (!u || !cfg.enabled) return false;
  if (!u.lastFreeCase) return true;
  return Date.now() - Number(u.lastFreeCase) >= cfg.intervalHours * 3600000;
}

function getFreeCaseNextAt() {
  const u = state.user;
  const cfg = state.freeCase;
  if (!u || !u.lastFreeCase) return null;
  return Number(u.lastFreeCase) + cfg.intervalHours * 3600000;
}

function formatFreeCaseCountdown(ms) {
  if (ms <= 0) return '0с';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}ч ${m.toString().padStart(2,'0')}м`;
  if (m > 0) return `${m}м ${s.toString().padStart(2,'0')}с`;
  return `${s}с`;
}

function updateFreeCaseBannerState() {
  const claimBtn = document.getElementById('freeCaseClaimBtn');
  const countdownEl = document.getElementById('freeCaseCountdown');
  if (!claimBtn || !countdownEl) return;
  const canClaim = getFreeCaseCanClaim();
  if (canClaim) {
    claimBtn.classList.remove('hidden');
    claimBtn.disabled = false;
    countdownEl.classList.add('hidden');
  } else {
    const nextAt = getFreeCaseNextAt();
    const ms = nextAt ? nextAt - Date.now() : 0;
    claimBtn.classList.add('hidden');
    countdownEl.classList.remove('hidden');
    countdownEl.textContent = ms > 0 ? `Следующий через ${formatFreeCaseCountdown(ms)}` : 'Доступен!';
  }
}

function _updateFreeCaseCardLabel() {
  const el = document.querySelector('.free-case-card-label');
  if (!el) return;
  const canClaim = getFreeCaseCanClaim();
  if (canClaim) {
    el.textContent = 'Открой!';
    el.classList.add('free-case-card-ready');
  } else {
    const nextAt = getFreeCaseNextAt();
    const ms = nextAt ? nextAt - Date.now() : 0;
    el.textContent = ms > 0 ? `через ${formatFreeCaseCountdown(ms)}` : 'Открой!';
    el.classList.remove('free-case-card-ready');
  }
}

function startFreeCaseTimer() {
  stopFreeCaseTimer();
  state.freeCaseCountdownTimer = setInterval(() => {
    if (!state.freeCase?.enabled) { stopFreeCaseTimer(); return; }
    const canClaim = getFreeCaseCanClaim();
    const claimBtn = document.getElementById('freeCaseClaimBtn');
    const countdownEl = document.getElementById('freeCaseCountdown');
    if (claimBtn && countdownEl) {
      if (canClaim) {
        claimBtn.classList.remove('hidden');
        claimBtn.disabled = false;
        countdownEl.classList.add('hidden');
      } else {
        const nextAt = getFreeCaseNextAt();
        const ms = nextAt ? nextAt - Date.now() : 0;
        claimBtn.classList.add('hidden');
        countdownEl.classList.remove('hidden');
        countdownEl.textContent = ms > 0 ? `Следующий через ${formatFreeCaseCountdown(ms)}` : 'Доступен!';
      }
    }
    _updateFreeCaseCardLabel();
  }, 1000);
}

function stopFreeCaseTimer() {
  if (state.freeCaseCountdownTimer) { clearInterval(state.freeCaseCountdownTimer); state.freeCaseCountdownTimer = null; }
}

function showFreeCaseResult(item, nextClaimAt) {
  const existing = document.getElementById('freeCaseResultOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'freeCaseResultOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);padding:16px';

  const media = item.image
    ? `<img src="${escHtml(item.image)}" style="width:80px;height:80px;object-fit:contain;border-radius:16px;margin-bottom:12px" alt="" loading="lazy" decoding="async">`
    : `<div style="font-size:54px;line-height:1;margin-bottom:12px">${escHtml(item.emoji || '🎁')}</div>`;

  const intervalLabel = (() => {
    if (!nextClaimAt) return '';
    const ms = nextClaimAt - Date.now();
    if (ms <= 0) return '';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `Следующий кейс через ${h}ч ${m}м` : `Следующий кейс через ${m}м`;
  })();

  overlay.innerHTML = `
    <div style="background:linear-gradient(160deg,#12223e,#0d1726);border:1px solid rgba(88,166,255,.24);box-shadow:0 32px 80px rgba(0,0,0,.6);padding:32px 28px;max-width:360px;width:100%;text-align:center;position:relative">
      ${media}
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(88,166,255,.9);margin-bottom:6px">Бесплатный кейс</div>
      <div style="font-size:20px;font-weight:800;margin-bottom:4px">${escHtml(item.name || '')}</div>
      <div style="font-size:15px;font-weight:700;color:var(--muted);margin-bottom:20px">${escHtml(String(item.value || 0))} TOK</div>
      ${intervalLabel ? `<div style="font-size:12px;color:var(--muted);margin-bottom:16px">${escHtml(intervalLabel)}</div>` : ''}
      <div style="display:flex;gap:10px;justify-content:center">
        <button type="button" id="freeCaseResultClose" class="ghost-btn">Закрыть</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('freeCaseResultClose').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function showFreeCaseTasksModal(status, onRetry) {
  const existing = document.getElementById('freeCaseTasksOverlay');
  if (existing) existing.remove();

  const channelUrl = status.channelUrl || '';
  const handle = String(channelUrl).split('/').filter(Boolean).pop()?.replace(/^@/, '') || 'channel';
  const channelAvatarSrc = `https://t.me/i/userpic/320/${encodeURIComponent(handle)}.jpg`;

  const rows = [];
  if (status.shareRequired) {
    rows.push({
      id: 'share',
      done: status.shareSatisfied,
      label: 'Поделитесь сообщением в любом чате',
      iconHtml: `<span class="freecase-task-icon-glyph">✈</span>`
    });
  }
  if (status.channelRequired) {
    rows.push({
      id: 'channel',
      done: status.channelSatisfied,
      label: `Подпишитесь на @${escHtml(handle)}`,
      iconHtml: `<img src="${escAttr(channelAvatarSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">`
    });
  }

  const rowsHtml = rows.map(r => `
    <div class="freecase-task-row${r.done ? ' is-done' : ''}" data-task="${r.id}">
      <span class="freecase-task-icon">${r.iconHtml}</span>
      <span class="freecase-task-label">${r.label}</span>
      ${r.done ? '<span class="freecase-task-check">✓</span>' : '<span class="freecase-task-arrow">→</span>'}
    </div>
  `).join('');

  const overlay = document.createElement('div');
  overlay.id = 'freeCaseTasksOverlay';
  overlay.className = 'chsub-overlay';
  overlay.innerHTML = `
    <div class="chsub-card freecase-tasks-card">
      <button type="button" class="chsub-close" id="freeCaseTasksClose" aria-label="Закрыть">✕</button>
      <div class="chsub-ring chsub-ring--gift"><span class="chsub-ring-glyph chsub-ring-glyph--plain">🎁</span></div>
      <div class="chsub-title">Выполни задания</div>
      <div class="chsub-sub">Чтобы открыть бесплатный кейс, нужно выполнить всё ниже — и так каждый раз перед новым прокрутом.</div>
      <div class="freecase-tasks-list">${rowsHtml}</div>
      <button type="button" class="primary-btn freecase-tasks-done-btn" id="freeCaseTasksDoneBtn">Готово</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('freeCaseTasksClose').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('freeCaseTasksDoneBtn').addEventListener('click', () => { close(); onRetry(); });

  const shareRow = overlay.querySelector('.freecase-task-row[data-task="share"]:not(.is-done)');
  if (shareRow) {
    let готовое = null;
    let готовится = null;
    const подготовить = () => {
      if (готовится) return готовится;
      готовится = api('/api/free-case/share/prepare', { method: 'POST' })
        .then((data) => {
          готовое = { msgId: data.msgId, годноДо: data.expirationDate ? Number(data.expirationDate) * 1000 : 0 };
          return готовое;
        })
        .finally(() => { готовится = null; });
      return готовится;
    };
    const свежее = () => готовое && (!готовое.годноДо || готовое.годноДо - Date.now() > 60000) ? готовое : null;
    подготовить().catch(() => {});

    const отправить = (msgId) => {
      tg.shareMessage(msgId, async (sent) => {
        if (!sent) return;
        try { await api('/api/free-case/share/confirm', { method: 'POST', body: JSON.stringify({ msgId }) }); } catch {}
        shareRow.classList.add('is-done');
        shareRow.querySelector('.freecase-task-arrow')?.replaceWith(Object.assign(document.createElement('span'), { className: 'freecase-task-check', textContent: '✓' }));
        готовое = null;
      });
    };

    shareRow.addEventListener('click', async () => {
      if (!tg?.shareMessage) { showToast('Обновите Telegram до последней версии.'); return; }
      const уже = свежее();
      if (уже) { отправить(уже.msgId); return; }
      shareRow.classList.add('is-loading');
      try {
        const data = await подготовить();
        shareRow.classList.remove('is-loading');
        отправить(data.msgId);
      } catch (e) {
        shareRow.classList.remove('is-loading');
        showToast(e.message || 'Не удалось подготовить сообщение');
      }
    });
  }

  const channelRow = overlay.querySelector('.freecase-task-row[data-task="channel"]:not(.is-done)');
  if (channelRow) {
    channelRow.addEventListener('click', () => window.open(channelUrl, '_blank', 'noopener'));
  }
}

function showCasePausedModal() {
  const existing = document.getElementById('casePausedOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'casePausedOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);padding:16px';

  overlay.innerHTML = `
    <div style="background:linear-gradient(160deg,#2b1c10,#1a1108);border:1px solid rgba(240,163,94,.28);box-shadow:0 32px 80px rgba(0,0,0,.6);padding:32px 28px;max-width:360px;width:100%;text-align:center;position:relative">
      <div style="font-size:44px;line-height:1;margin-bottom:14px">🔧</div>
      <div style="font-size:19px;font-weight:800;margin-bottom:8px">Кейс на паузе</div>
      <div style="font-size:14px;color:var(--muted);margin-bottom:22px">Кейс временно закрыт или временно закончился.<br>Извиняемся за предоставленные неудобства.</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button type="button" id="casePausedHomeBtn" class="ghost-btn active">Вернуться на главную</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('casePausedHomeBtn').addEventListener('click', () => { close(); navigateTo('home'); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function claimFreeCase() {
  const cfg = state.freeCase;
  if (!cfg.enabled || !cfg.caseId) { showToast('Бесплатный кейс не настроен'); return; }
  if (!getFreeCaseCanClaim()) { showToast('Кейс ещё не готов'); return; }
  openCasePage(cfg.caseId);
}

async function attemptClaimFreeCase(selectedCase) {
  state.spinning = true;
  refs.openSelectedCaseBtn.disabled = true;
  refs.openSelectedCaseBtn.textContent = 'Открывается...';
  suppressLiveDrops(25000);
  try {
    const data = await api('/api/free-case/claim', { method: 'POST' });
    document.getElementById('freeCaseTasksOverlay')?.remove();
    state.user = data.user;
    renderAllUserData();
    const releaseDelay = showRouletteResults([data.won], selectedCase);
    suppressLiveDrops(releaseDelay + 300);
    scheduleRouletteTimer(async () => {
      state.spinning = false;
      refs.openSelectedCaseBtn.disabled = true;
      const _nextAt = data.nextClaimAt;
      const _ms = _nextAt ? _nextAt - Date.now() : 0;
      refs.openSelectedCaseBtn.textContent = _ms > 0 ? `Следующий через ${formatFreeCaseCountdown(_ms)}` : 'ОТКРЫТЬ БЕСПЛАТНО';
      if (_ms <= 0) refs.openSelectedCaseBtn.disabled = false;
      renderFreeCase();
      await syncUserState(true);
    }, releaseDelay);
  } catch (e) {
    state.spinning = false;
    refs.openSelectedCaseBtn.disabled = false;
    refs.openSelectedCaseBtn.textContent = 'ОТКРЫТЬ БЕСПЛАТНО';
    renderFreeCase();
    if (e.code === 'requirements_not_met') {
      showFreeCaseTasksModal(e, () => attemptClaimFreeCase(selectedCase));
    } else if (e.code === 'case_paused') {
      showCasePausedModal();
    } else {
      showToast(e.message);
    }
  }
}

function claimReferralCase() {
  const cfg = state.referralCase;
  if (!cfg || !cfg.enabled || !cfg.caseId) { showToast('Реферальный кейс не настроен'); return; }
  if (!cfg.canClaim) { showToast('Кейс уже получен или недоступен'); return; }
  openCasePage(cfg.caseId);
}

function renderOpsFreeCase() {}

function renderOpsTextOverrides() {}

function formatWithdrawalStatus(status) {
  const isEn = getCurrentLanguage() === 'en';
  switch (status) {
    case 'pending':   return isEn ? '⏳ Pending'   : '⏳ Ожидает';
    case 'approved':  return isEn ? '✅ Approved'  : '✅ Одобрено';
    case 'rejected':  return isEn ? '❌ Rejected'  : '❌ Отклонено';
    case 'cancelled': return isEn ? '↩️ Cancelled' : '↩️ Отменено';
    default: return escHtml(status || '-');
  }
}

const _wdrSelected = new Set();
window._wdrSelected = _wdrSelected;

function _wdrUpdateBar() {
  const countEl = document.getElementById('withdrawalSelectedCount');
  const valueEl = document.getElementById('withdrawalSelectedValue');
  const clearBtn = document.getElementById('withdrawalClearBtn');
  const selectedItems = document.getElementById('withdrawalSelectedItems');
  const n = _wdrSelected.size;
  if (countEl) countEl.textContent = n === 0
    ? (getCurrentLanguage() === 'en' ? 'No items selected' : 'Предметы не выбраны')
    : (getCurrentLanguage() === 'en' ? `${n} item${n === 1 ? '' : 's'} selected` : `${n} предмет${n === 1 ? '' : n < 5 ? 'а' : 'ов'} выбрано`);
  if (clearBtn) clearBtn.style.display = n > 0 ? '' : 'none';
  if (!selectedItems) return;
  if (n === 0) {
    selectedItems.innerHTML = '';
    const barCount = document.getElementById('wdrBarCount');
    const barValue = document.getElementById('wdrBarValue');
    if (barCount) barCount.textContent = 'Ничего не выбрано';
    if (barValue) barValue.textContent = '';
    updateWithdrawalSteps();
    return;
  }
  const inv = state.user?.inventory || [];
  let totalVal = 0;
  const chips = [];
  for (const uid of _wdrSelected) {
    const entry = inv.find(e => e.uid === uid);
    if (!entry) continue;
    const item = (state.brainrotMap || new Map()).get(entry.itemId) || entry.item;
    const name = item?.name || entry.itemId;
    const val = item?.value || 0;
    totalVal += val;
    chips.push(`<span class="wdr-chip" data-uid="${escAttr(uid)}">${escHtml(name)} <span class="wdr-chip-remove">✕</span></span>`);
  }
  selectedItems.innerHTML = chips.join('');
  if (valueEl) valueEl.textContent = totalVal > 0 ? `· ${Math.round(totalVal)} TOK` : '';
  const barCount = document.getElementById('wdrBarCount');
  const barValue = document.getElementById('wdrBarValue');
  if (barCount) barCount.textContent = n === 0 ? 'Ничего не выбрано' : `К выводу ${n} предмет${n === 1 ? '' : n < 5 ? 'а' : 'ов'}`;
  if (barValue) {
    barValue.textContent = '';
    if (totalVal > 0) {
      barValue.append(String(Math.round(totalVal)));
      barValue.appendChild(makeTokenIconNode());
    }
  }
  selectedItems.querySelectorAll('.wdr-chip').forEach(chip => {
    bindSafe(chip.querySelector('.wdr-chip-remove'), 'click', () => {
      _wdrSelected.delete(chip.dataset.uid);
      _wdrUpdateGrid();
      _wdrUpdateBar();
    });
  });
  updateWithdrawalSteps();
}

function _wdrUpdateGrid() {
  const grid = document.getElementById('withdrawalInventoryGrid');
  if (!grid) return;
  const inv = state.user?.inventory || [];
  if (!inv.length) {
    grid.innerHTML = `<div class="muted" style="padding:12px 0">${getCurrentLanguage() === 'en' ? 'Inventory is empty.' : 'Инвентарь пуст.'}</div>`;
    return;
  }
  const brainrotMap = state.brainrotMap || new Map();
  grid.innerHTML = '';
  const minValue = state.minWithdrawValue || 65;
  inv.filter(entry => (entry.item || brainrotMap.get(entry.itemId))?.category !== 'case_voucher').forEach(entry => {
    const item = entry.item || brainrotMap.get(entry.itemId);
    const selected = _wdrSelected.has(entry.uid);
    const notWithdrawable = !isEntryWithdrawable(entry, item);
    const reason = withdrawBlockReason(entry, item);
    const locked = notWithdrawable || (item?.value || 0) < minValue;
    const card = document.createElement('div');
    card.className = `wdr-item-card${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`;
    card.dataset.uid = entry.uid;
    card.innerHTML = `
      <div class="wdr-item-media">${mutationBadgeHtml(item, 'mut-badge-inv')}${mediaMarkup(item, 'wdr-item-icon', 'wdr-item-emoji', 48)}</div>
      <div class="wdr-item-name">${escHtml(itemCardName(item) || entry.itemId)}</div>
      <div class="wdr-item-value muted">${item?.value ? Math.round(item.value) + ' TOK' : ''}</div>
      ${reason ? `<div class="wdr-item-reason" data-reason="${escAttr(reason.code)}" title="${escAttr(reason.full)}">${escHtml(reason.short)}</div>` : ''}
      <div class="wdr-item-check">${selected ? '✓' : ''}</div>`;
    bindSafe(card, 'click', () => {
      if (entry.noWithdraw) { openExchangeBlockedModal(entry.uid, itemCardName(item) || entry.itemId); return; }
      if ((item?.value || 0) < minValue) { showMinWithdrawModal(item?.name || entry.itemId); return; }
      if (notWithdrawable) { openExchangeBlockedModal(entry.uid, itemCardName(item) || entry.itemId); return; }
      if (_wdrSelected.has(entry.uid)) {
        _wdrSelected.delete(entry.uid);
      } else {
        if (_wdrSelected.size >= 50) { showToast('Максимум 50 предметов'); return; }
        _wdrSelected.add(entry.uid);
      }
      _wdrUpdateGrid();
      _wdrUpdateBar();
    });
    grid.appendChild(card);
  });
  if (typeof renderWithdrawalQueueWindows === 'function') renderWithdrawalQueueWindows();
}

function renderWithdrawalHistory(withdrawals = []) {
  const list = document.getElementById('withdrawalHistoryList');
  if (!list) return;
  if (!Array.isArray(withdrawals) || !withdrawals.length) {
    list.innerHTML = '<div class="muted" style="padding:8px 0">Заявок пока нет.</div>';
    return;
  }
  list.innerHTML = '';
  withdrawals.slice(0, 30).forEach(w => {
    const _whIsEn = getCurrentLanguage() === 'en';
    const itemNames = (w.items || []).slice(0, 3).map(x => escHtml(x.itemName || x.itemId)).join(', ')
      + (w.items?.length > 3 ? ` ${_whIsEn ? 'and' : 'и ещё'} ${w.items.length - 3}` : '');
    const row = document.createElement('div');
    row.className = `wdr-history-row status-${escAttr(w.status)}`;
    row.innerHTML = `
      <div class="wdr-history-main">
        <div class="wdr-history-top">
          <span class="wdr-history-items">${(w.items || []).length} ${_whIsEn ? 'item(s):' : 'предмет(ов):'} ${itemNames}</span>
          <span class="wdr-history-status">${formatWithdrawalStatus(w.status)}</span>
        </div>
        <div class="wdr-history-bottom">
          <span class="wdr-history-value">${w.totalValue ? Math.round(w.totalValue) + ' TOK' : ''}</span>
          <span class="wdr-history-date">${w.createdAt ? new Date(w.createdAt).toLocaleString('ru-RU') : ''}</span>
        </div>
        <!-- Причина отказа — ОТДЕЛЬНОЙ строкой: приклеенная к дате через
             точку, она читалась как часть даты и терялась. -->
        ${w.reasonText ? `<div class="wdr-history-reason">${_whIsEn ? 'Reason' : 'Причина'}: ${escHtml(w.reasonText)}</div>` : ''}
        <!-- Предметы изъяли, а не вернули: без этой строки предмет просто
             исчезает из инвентаря, и игрок идёт искать его в поддержку. -->
        ${w.itemsDropped ? `<div class="wdr-history-dropped">${_whIsEn ? 'Items were not returned to your inventory' : 'Предметы изъяты и в инвентарь не вернулись'}</div>` : ''}
      </div>
      ${w.status === 'pending' && !w.queueBookingClaimed ? `<div class="wdr-history-actions"><button type="button" class="ghost-btn small withdrawal-cancel-btn" data-wdr-id="${escAttr(w.id)}">${_whIsEn ? 'Cancel' : 'Отменить'}</button></div>` : ''}
      ${w.status === 'pending' && w.queueBookingClaimed ? `<div class="muted wdr-history-locked">${_whIsEn ? 'Trade confirmed, cancellation unavailable' : 'Трейд подтверждён, отмена недоступна'}</div>` : ''}`;
    bindSafe(row.querySelector('.withdrawal-cancel-btn'), 'click', async () => {
      try {
        const data = await api(`/api/withdrawals/${encodeURIComponent(w.id)}/cancel`, { method: 'POST', body: JSON.stringify({}) });
        if (data.user) applyUserUpdate(data.user);
        showToast('Заявка отменена, предметы возвращены');
        loadWithdrawalHistory();
        _wdrUpdateGrid();
        loadWithdrawalQueueMyBooking();
      loadWithdrawDayState();
      } catch (err) { showToast(err.message || 'Ошибка'); }
    });
    list.appendChild(row);
  });
}

async function loadWithdrawalHistory() {
  try {
    const data = await api('/api/withdrawals/history');
    renderWithdrawalHistory(data.withdrawals || []);
  } catch { renderWithdrawalHistory([]); }
}

function bindWithdrawalHistoryAccordion() {
  const btn   = document.getElementById('withdrawalHistoryToggleBtn');
  const panel = document.getElementById('withdrawalHistoryPanel');
  if (!btn || !panel || btn._accordionBound) return;
  btn._accordionBound = true;
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

const WQ_RU_MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function wqFormatSlotDateShort(dateKey) {
  const parts = String(dateKey || '').split('-');
  if (parts.length !== 3) return '';
  const day = parseInt(parts[2], 10);
  const monthName = WQ_RU_MONTHS_GENITIVE[parseInt(parts[1], 10) - 1];
  if (!day || !monthName) return '';
  return `${day} ${monthName}`;
}

function wqFormatSlotDayLabel(dateKey) {
  const short = wqFormatSlotDateShort(dateKey);
  if (!short) return '';
  const mskNow = new Date(Date.now() + 3 * 3600e3);
  const todayKey = mskNow.toISOString().slice(0, 10);
  const tomorrowKey = new Date(mskNow.getTime() + 864e5).toISOString().slice(0, 10);
  if (dateKey === todayKey) return 'Сегодня';
  if (dateKey === tomorrowKey) return 'Завтра';
  return short;
}

function _wdrSelectedItemIds() {
  const inv = state.user?.inventory || [];
  const ids = new Set();
  for (const uid of _wdrSelected) {
    const entry = inv.find(e => e.uid === uid);
    if (entry) ids.add(String(entry.itemId));
  }
  return [...ids];
}

function _wqWindowsForSelection() {
  const все = state.withdrawalQueueWindows?.windows || [];
  const выбранные = _wdrSelectedItemIds();
  if (!выбранные.length) return все;
  const особые = new Set();
  for (const w of все) for (const id of (w.itemIds || [])) особые.add(String(id));
  return все.filter(w => {
    const свои = new Set((w.itemIds || []).map(String));
    if (свои.size) return выбранные.every(id => свои.has(id));
    return выбранные.every(id => !особые.has(id));
  });
}

function renderWithdrawalQueueWindows() {
  const container = document.getElementById('withdrawalQueueWindows');
  if (!container) return;
  if (state.withdrawDayVisible) { renderWithdrawDay(); return; }
  const windows = _wqWindowsForSelection();
  if (state.withdrawalQueueSelectedWindow && !windows.some(w => w.id === state.withdrawalQueueSelectedWindow)) {
    state.withdrawalQueueSelectedWindow = null;
  }
  if (!windows.length) {
    const en = getCurrentLanguage() === 'en';
    container.innerHTML = `<div class="muted" style="padding:8px 0">${en
      ? 'These items are handed out in different windows — submit them as separate requests.'
      : 'Эти предметы выдают в разные окна — оформи их отдельными заявками.'}</div>`;
    return;
  }
  container.innerHTML = windows.map(w => {
    const day = w.nextSlotDate ? wqFormatSlotDayLabel(w.nextSlotDate) : '';
    const dayLine = day
      ? `<span class="withdrawal-queue-window-day">${escHtml(day)}${day !== 'Сегодня' && day !== 'Завтра' ? '' : `, ${escHtml(wqFormatSlotDateShort(w.nextSlotDate))}`}</span>`
      : '';
    const свои = (w.itemIds || [])
      .map(id => (state.brainrotMap?.get(String(id))?.name) || '')
      .filter(Boolean);
    const списокLine = свои.length
      ? `<span class="withdrawal-queue-window-only">${escHtml(свои.slice(0, 2).join(', '))}${свои.length > 2 ? ` +${свои.length - 2}` : ''}</span>`
      : '';
    return `
    <button type="button" class="withdrawal-queue-window-btn${state.withdrawalQueueSelectedWindow === w.id ? ' is-selected' : ''}" data-window-id="${escAttr(w.id)}">
      ${dayLine}
      <span class="withdrawal-queue-window-time">${escHtml(w.label)} МСК</span>
      ${списокLine}
    </button>`;
  }).join('');
  container.querySelectorAll('.withdrawal-queue-window-btn').forEach(btn => {
    bindSafe(btn, 'click', () => {
      state.withdrawalQueueSelectedWindow = btn.dataset.windowId;
      renderWithdrawalQueueWindows();
      updateWithdrawalSteps();
    });
  });
}

async function refreshWithdrawalQueueWindows() {
  try {
    const data = await api('/api/withdrawal-queue/windows');
    state.withdrawalQueueWindows = { enabled: data.enabled, windows: data.windows };
    renderWithdrawalQueueWindows();
  } catch (e) {
  }
}

function updateWithdrawalSteps() {
  const nick = (document.getElementById('withdrawalContactInput')?.value || '').trim();
  const hasItems = _wdrSelected.size > 0;
  const queueOn = Boolean(state.withdrawalQueueWindows?.enabled);
  const alreadyBooked = !document.getElementById('withdrawalQueueBooked')?.classList.contains('hidden');
  const hasSlot = state.withdrawDayVisible || !queueOn || alreadyBooked || Boolean(state.withdrawalQueueSelectedWindow);

  const mark = (id, done) => document.getElementById(id)?.classList.toggle('is-done', done);
  mark('wdrStepItems', hasItems);
  mark('wdrStepNick', nick.length >= 3);
  mark('wdrStepTime', hasSlot);

  const sub = document.getElementById('wdrStepItemsSub');
  if (sub) sub.textContent = hasItems
    ? `Выбрано ${_wdrSelected.size}, можно добавить ещё`
    : 'Отметь предметы в инвентаре';

  const hint = document.getElementById('withdrawalFormHint');
  const btn = document.getElementById('withdrawalSubmitBtn');
  const reason = !hasItems ? 'Выбери хотя бы один предмет'
    : nick.length < 3 ? 'Впиши свой ник в Roblox'
      : !hasSlot ? 'Выбери, когда тебе удобно забрать'
        : '';
  if (hint?.dataset.sticky === '1') { if (btn && !alreadyBooked) btn.disabled = Boolean(reason); return; }
  if (hint) {
    hint.textContent = reason || 'После отправки предметы сразу уходят из инвентаря, заявку обработают вручную.';
    hint.classList.toggle('is-blocking', Boolean(reason));
  }
  if (btn && !alreadyBooked) btn.disabled = Boolean(reason);
}

let _wqBookingId = null;

function _wdDayTime(ms) {
  return new Date(ms).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
}

function renderWithdrawDay() {
  const block = document.getElementById('withdrawDayBlock');
  const info = document.getElementById('withdrawDayInfo');
  const list = document.getElementById('withdrawDaySchedule');
  if (!block) return;
  const st = state.withdrawDay;
  if (!state.withdrawDayVisible || !st || !st.enabled) { block.classList.add('hidden'); return; }
  block.classList.remove('hidden');
  document.getElementById('withdrawalQueueBlock')?.classList.add('hidden');
  const шаг = document.getElementById('wdrStepTimeSub');
  if (шаг) шаг.textContent = 'Время назначим сами: по одному предмету на промежуток';
  if (info) {
    info.textContent = st.canBookMore > 0
      ? `Время назначим сами: один предмет — один промежуток по ${st.slotMinutes} мин. Сегодня можно поставить ещё ${st.canBookMore}.`
      : 'На сегодня всё расписано. Приходи завтра или отмени одну из выдач ниже.';
  }
  if (!list) return;
  if (!st.bookings.length) { list.innerHTML = ''; return; }
  list.innerHTML = st.bookings.map(b => `
    <div class="withdrawal-queue-booked" style="margin-top:8px">
      <div class="withdrawal-queue-booked-icon">🕐</div>
      <div class="withdrawal-queue-booked-body">
        <div class="withdrawal-queue-booked-title">${escHtml(_wdDayTime(b.slotStart))} - ${escHtml(_wdDayTime(b.slotEnd))} МСК</div>
        <div class="withdrawal-queue-booked-detail">${escHtml(b.itemName)}${b.tradeUsername ? ` · трейд боту ${escHtml(b.tradeUsername)}` : ''}</div>
        <div class="withdrawal-queue-booked-hint">Приходи в своё время: за ${escHtml(String(st.notifyBeforeMinutes))} мин бот напомнит.</div>
        <button type="button" class="ghost-btn small" data-wd-cancel="${escAttr(b.withdrawalId)}">Отменить эту выдачу</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-wd-cancel]').forEach(btn => {
    bindSafe(btn, 'click', async () => {
      btn.disabled = true;
      try {
        await api(`/api/withdrawals/${btn.dataset.wdCancel}/cancel`, { method: 'POST' });
        showToast('Выдача отменена, предмет вернулся');
        await loadWithdrawDayState();
        loadWithdrawalHistory();
        _wdrUpdateGrid();
      } catch (err) {
        showToast(err.message || 'Не получилось отменить');
        btn.disabled = false;
      }
    });
  });
}

async function loadWithdrawDayState() {
  if (!state.withdrawDayVisible) return;
  try {
    const data = await api('/api/withdraw-day/state');
    state.withdrawDay = data;
    renderWithdrawDay();
    updateWithdrawalSteps();
  } catch (err) {
    console.warn('[withdraw-day] состояние не загрузилось:', err.message);
  }
}
async function loadWithdrawalQueueMyBooking(isResume = false) {
  const block = document.getElementById('withdrawalQueueBlock');
  const bookedBlock = document.getElementById('withdrawalQueueBooked');
  const bookedDetail = document.getElementById('withdrawalQueueBookedDetail');
  const submitBtn = document.getElementById('withdrawalSubmitBtn');
  const cancelBtn = document.getElementById('withdrawalQueueCancelBtn');
  if (state.withdrawDayVisible) {
    loadWithdrawDayState();
    document.getElementById('withdrawalQueueBlock')?.classList.add('hidden');
    document.getElementById('withdrawalQueueBooked')?.classList.add('hidden');
    return;
  }
  if (!state.withdrawalQueueWindows?.enabled) {
    if (block) block.classList.add('hidden');
    if (bookedBlock) bookedBlock.classList.add('hidden');
    return;
  }
  try {
    const data = await api('/api/withdrawal-queue/my');
    if (data.booking) {
      if (block) block.classList.add('hidden');
      if (bookedBlock) bookedBlock.classList.remove('hidden');
      if (bookedDetail) {
        const day = wqFormatSlotDayLabel(data.booking.slotDate);
        const dateShort = wqFormatSlotDateShort(data.booking.slotDate);
        bookedDetail.textContent = `${day}${day === 'Сегодня' || day === 'Завтра' ? `, ${dateShort}` : ''} · ${data.booking.slotStartLabel}–${data.booking.slotEndLabel} МСК`;
      }
      if (submitBtn) submitBtn.disabled = true;
      _wqBookingId = data.booking.id;
      if (cancelBtn) cancelBtn.classList.toggle('hidden', !['scheduled', 'notified'].includes(data.booking.status));
    } else {
      if (bookedBlock) bookedBlock.classList.add('hidden');
      if (block) block.classList.remove('hidden');
      _wqBookingId = null;
      if (!isResume) {
        state.withdrawalQueueSelectedWindow = null;
        renderWithdrawalQueueWindows();
      }
    }
    updateWithdrawalSteps();
  } catch {
    if (block) block.classList.remove('hidden');
    if (bookedBlock) bookedBlock.classList.add('hidden');
  }
}

function fillWithdrawalContact() {
  const input = document.getElementById('withdrawalContactInput');
  if (!input) return;
  input.value = String(state.user?.robloxNickname || '').trim();
  updateWithdrawalSteps();
}

function openWithdrawalModal(preSelectUid = null) {
  if (!state.user || state.user.id === 'guest-user') {
    showToast('Для вывода нужен вход в аккаунт');
    return;
  }
  const modal = document.getElementById('withdrawalModal');
  if (!modal) return;
  _wdrSelected.clear();
  if (preSelectUid) _wdrSelected.add(preSelectUid);
  fillWithdrawalContact();
  modal.classList.remove('hidden');
  modal.removeAttribute('aria-hidden');
  updateWithdrawalWagerBlock();
  _wdrUpdateGrid();
  _wdrUpdateBar();
  loadWithdrawalQueueMyBooking();
  refreshWithdrawalQueueWindows();
  loadWithdrawalHistory();
  bindWithdrawalHistoryAccordion();
  updateWithdrawalSteps();
}

function bindWithdrawalModal() {
  if (window.__withdrawalModalBound) return;
  window.__withdrawalModalBound = true;

  bindSafe(document.getElementById('withdrawalContactInput'), 'input', updateWithdrawalSteps);

  bindSafe(document.getElementById('withdrawalQueueCancelBtn'), 'click', async (e) => {
    if (!_wqBookingId) return;
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      const data = await api(`/api/withdrawal-queue/${encodeURIComponent(_wqBookingId)}/cancel-self`, { method: 'POST' });
      if (data.user) applyUserUpdate(data.user);
      showToast('Бронь отменена, предметы возвращены');
      await loadWithdrawalQueueMyBooking();
      loadWithdrawalHistory();
      _wdrUpdateGrid();
    } catch (err) {
      showToast(err.message || 'Не удалось отменить бронь');
    } finally {
      btn.disabled = false;
    }
  });

  document.body.addEventListener('click', e => {
    if (e.target && e.target.id === 'openWithdrawalModalBtn') openWithdrawalModal();
  });

  document.querySelectorAll('[data-close-withdrawal-modal]').forEach(btn => {
    bindSafe(btn, 'click', () => {
      const modal = document.getElementById('withdrawalModal');
      if (modal) { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }
    });
  });

  bindSafe(document.getElementById('withdrawalClearBtn'), 'click', () => {
    _wdrSelected.clear();
    _wdrUpdateGrid();
    _wdrUpdateBar();
  });

  blockCyrillicInInput(document.getElementById('withdrawalContactInput'));

  bindSafe(document.getElementById('withdrawalSubmitBtn'), 'click', async () => {
    const uids = [..._wdrSelected];
    const contact = (document.getElementById('withdrawalContactInput')?.value || '').trim();
    const formHint = document.getElementById('withdrawalFormHint');
    const _wIsEn = getCurrentLanguage() === 'en';
    if (!uids.length) { if (formHint) formHint.textContent = _wIsEn ? 'Select at least one item.' : 'Выбери хотя бы один предмет.'; return; }
    if (!contact) { if (formHint) formHint.textContent = _wIsEn ? 'Enter your Roblox nickname.' : 'Укажи ник в Roblox.'; return; }
    if (!state.withdrawDayVisible && state.withdrawalQueueWindows?.enabled && !state.withdrawalQueueSelectedWindow) {
      if (formHint) formHint.textContent = _wIsEn ? 'Pick a queue time window.' : 'Выбери, когда тебе удобно забрать.';
      return;
    }
    const submitBtn = document.getElementById('withdrawalSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const data = state.withdrawDayVisible
        ? await api('/api/withdraw-day/create', { method: 'POST', body: JSON.stringify({ uids, contact }) })
        : await api('/api/withdrawals/create', {
          method: 'POST',
          body: JSON.stringify({ uids, contact, windowId: state.withdrawalQueueSelectedWindow || undefined })
        });
      if (data.user) applyUserUpdate(data.user);
      _wdrSelected.clear();
      if (formHint) {
        const _wdНазначено = state.withdrawDayVisible ? (data.bookings || []) : null;
        formHint.textContent = _wdНазначено
          ? `Время назначено: ${_wdНазначено.map(b => _wdDayTime(b.slotStart)).join(', ')} МСК. Приходи к каждому.`
          : (_wIsEn
            ? `Request ${data.withdrawal?.id} created. You'll be contacted.`
            : `Заявка ${data.withdrawal?.id} создана, жди трейд в своё время.`);
        formHint.classList.remove('is-blocking');
        formHint.dataset.sticky = '1';
        setTimeout(() => { formHint.dataset.sticky = '0'; updateWithdrawalSteps(); }, 8000);
      }
      fillWithdrawalContact();
      showToast(_wIsEn ? 'Withdrawal request created' : 'Заявка на вывод создана');
      loadWithdrawalHistory();
      _wdrUpdateGrid();
      _wdrUpdateBar();
      loadWithdrawalQueueMyBooking();
    } catch (err) {
      if (err.code === 'below_min_withdraw_value') {
        if (err.minWithdrawValue) state.minWithdrawValue = err.minWithdrawValue;
        showMinWithdrawModal();
        _wdrUpdateGrid();
      }
      if (err.code === 'out_of_stock' || err.code === 'mutation_not_withdrawable' || err.code === 'shop_item_not_withdrawable') {
        openExchangeBlockedModal(err.uid, err.itemName);
        _wdrUpdateGrid();
      }
      if (formHint) formHint.textContent = err.message || (_wIsEn ? 'Error creating request.' : 'Ошибка при создании заявки.');
      showToast(err.message || 'Ошибка');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

}

function renderOpsWithdrawals(withdrawals = []) {}

async function loadOpsWithdrawals() {}

function renderOpsOutOfStock() {}

async function saveOpsOutOfStock() {}

function renderOpsBattleHistory(history = []) {}

function renderOpsWagerSection() {}

function _poolRenderPane(paneKey) {}

function renderOpsBrainrotPool() {}

async function saveBrainrotPool() {}

function renderOpsLiveDropSection() {}

async function saveLiveDropConfig() {
  const btn = document.getElementById('ldSaveBtn');
  const statusEl = document.getElementById('ldSaveStatus');
  const intervalMs = Math.max(500, Math.min(30000, Number(document.getElementById('ldIntervalMs')?.value || 2000)));
  const caseIds = [...(document.querySelectorAll('#ldCaseList input[type="checkbox"]:checked') || [])]
    .map(cb => cb.dataset.ldCaseId).filter(Boolean);
  const enabled = document.getElementById('ldEnabled')?.checked !== false;
  const minValue = Math.max(0, Math.min(1000000, Math.round(Number(document.getElementById('ldMinValue')?.value ?? 25))));
  if (btn) btn.disabled = true;
  try {
    const r = await api('/api/ops/live-drop-config', { method: 'POST', body: JSON.stringify({ intervalMs, caseIds, enabled, minValue }) });
    if (r.liveDropConfig) state.liveDropConfig = r.liveDropConfig;
    if (statusEl) { statusEl.textContent = 'Сохранено ✓'; statusEl.className = 'case-edit-status is-ok'; }
    setTimeout(() => { if (statusEl) { statusEl.textContent = ''; statusEl.className = 'case-edit-status muted'; } }, 2500);
  } catch (e) {
    if (statusEl) { statusEl.textContent = e.message || 'Ошибка'; statusEl.className = 'case-edit-status is-err'; }
  } finally {
    if (btn) btn.disabled = false;
  }
}

let _opsViewReady = false;
async function _initOpsView() {
  if (_opsViewReady) return;
  const opsSection = document.getElementById('opsView');
  if (!opsSection) return;
  const p = (typeof getTelegramProfile === 'function') ? getTelegramProfile() : null;
  const params = new URLSearchParams();
  if (p?.userId) params.set('userId', p.userId);
  if (p?.username) params.set('username', p.username);
  const headers = { 'x-user-id': String(state.userId || '') };
  if (!opsSection.children.length) {
    const htmlRes = await fetch(`/api/ops/view?${params}`, { credentials: 'include', headers });
    if (!htmlRes.ok) throw new Error('Нет доступа к разделу');
    opsSection.innerHTML = await htmlRes.text();
    syncClosedToggles();
  }
  await Promise.all([loadSection('ladder'), loadSection('battle')]);
  if (!window.__opsCore) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/api/ops/core?${params}`;
      script.onload = () => { window.__opsCore = true; resolve(); };
      script.onerror = () => reject(new Error('Ошибка загрузки логики панели'));
      document.head.appendChild(script);
    });
  }
  _opsViewReady = true;
}

async function renderOpsView() {
  if (typeof window.renderCrashView === 'function') await window.renderCrashView();
}

async function renderOpsDashboard() {}

function fmt(n) {
  return Number(n || 0).toLocaleString('ru-RU');
}

function ensureAuthOverlay() {
  let overlay = document.getElementById('authOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'authOverlay';
  overlay.className = 'auth-overlay hidden';
  const _en = getCurrentLanguage() === 'en';
  overlay.innerHTML = `
    <div class="auth-card">
      <button id="authCloseBtn" type="button" class="auth-close">✕</button>
      <div class="auth-badge">${_en ? 'LOG IN' : 'ВХОД'}</div>
      <h2>${_en ? 'Log in to the site' : 'Вход на сайт'}</h2>
      <!-- Способы входа не перечисляем: их показывают сами кнопки ниже, а
           Discord может быть выключен тумблером — тогда текст врал бы.
           Разделы перечислены те, что реально закрыты для гостя и видны в
           навигации (см. requireSiteAuth): Фьюз и Лесенка туда тоже входят, но
           их кнопки скрыты, поэтому в тексте их нет. -->
      <p>${_en
        ? 'You can browse cases without logging in. Opening a case, playing Upgrader, Battle, Dice, Crash or Quests, and your Profile — only after you log in.'
        : 'Смотреть кейсы можно без входа. Открыть кейс, сыграть в Апгрейдер, Батл, Дайсы, Краш или Квесты, зайти в Профиль — только после входа.'
      }</p>
      <!-- Ради какого раздела окно открылось. Отдельной строкой, а не в
           #authStatus: тот через мгновение затирает startTelegramBotLogin()
           своим «Генерируем ссылку…», и сообщение о разделе не видел никто. -->
      <div id="authTarget" class="auth-status"></div>
      <div id="telegramAuthMount" class="telegram-auth-mount"></div>
      <div id="discordAuthRow" class="discord-auth-row hidden">
        <span class="discord-auth-or">${_en ? 'or' : 'или'}</span>
        <button type="button" id="discordAuthBtn" class="discord-auth-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.32 4.57A19.8 19.8 0 0 0 15.43 3l-.36.75a14.6 14.6 0 0 1 4.14 1.33 13.9 13.9 0 0 0-11.33 0A14.6 14.6 0 0 1 12 3.75L11.65 3a19.8 19.8 0 0 0-4.9 1.57C3.63 9.23 2.8 13.83 3.2 18.37A19.6 19.6 0 0 0 9.2 21.4l.72-1.23a12.9 12.9 0 0 1-2.05-.99l.45-.35a13.8 13.8 0 0 0 11.36 0l.45.35a12.9 12.9 0 0 1-2.06 1l.72 1.22a19.6 19.6 0 0 0 6-3.03c.47-5.26-.86-9.82-3.47-13.8ZM8.9 15.54c-1.13 0-2.06-1.04-2.06-2.31 0-1.28.9-2.32 2.06-2.32 1.16 0 2.09 1.04 2.07 2.32 0 1.27-.91 2.31-2.07 2.31Zm6.2 0c-1.13 0-2.06-1.04-2.06-2.31 0-1.28.91-2.32 2.07-2.32 1.15 0 2.08 1.04 2.06 2.32 0 1.27-.91 2.31-2.06 2.31Z"/></svg>
          ${_en ? 'Log in with Discord' : 'Войти через Discord'}
        </button>
      </div>
      <div id="authStatus" class="auth-status"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  bindSafe(document.getElementById('authCloseBtn'), 'click', () => overlay.classList.add('hidden'));
  bindSafe(document.getElementById('discordAuthBtn'), 'click', () => {
    location.href = '/api/auth/discord/start';
  });
  return overlay;
}

async function startTelegramBotLogin() {
  const mount = document.getElementById('telegramAuthMount');
  const status = document.getElementById('authStatus');
  if (!mount || !status) return;
  const _en2 = getCurrentLanguage() === 'en';
  if (!state.tgBotUsername || state.tgBotUsername === 'YOUR_BOT_USERNAME') {
    if (mount) mount.innerHTML = `<div class="muted">${_en2 ? 'Configure telegram-bot-login.json: botUsername and botToken.' : 'Заполни telegram-bot-login.json: botUsername и botToken.'}</div>`;
    return;
  }
  status.textContent = _en2 ? 'Generating login link…' : 'Генерируем ссылку для входа...';
  try {
    const data = await api('/api/auth/telegram-token', { method: 'POST', headers: { 'x-user-id': 'demo-user' } });
    if (mount) mount.innerHTML = `
      <div class="tg-login-stack">
        <a class="tg-ios-btn" href="${escHtml(data.botLink)}" target="_blank" rel="noopener noreferrer">
          <span class="tg-icon">✈️</span>
          ${_en2 ? 'Open bot and confirm login' : 'Перейти в бота и подтвердить вход'}
        </a>
      </div>
    `;
    status.textContent = _en2
      ? 'In the bot press Start, then "Log in" — and come back here.'
      : 'В боте нажми Start, затем кнопку «Войти» — и возвращайся сюда.';
    pollTelegramToken(data.token);
  } catch (e) {
    status.textContent = e.message;
  }
}

async function finishTelegramLogin(data) {
  state.authMode = 'site';
  state.authUser = data.user;
  state._perm = Boolean(data.creator);
  state._superPerm = Boolean(data.dev);
  if (Array.isArray(data.crew)) { state._mods = data.crew; }
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.add('hidden');
  const target = state.pendingProtectedView;
  state.pendingProtectedView = null;
  await bindOpsFixes();
  bindOpsBalanceTools();
  bootstrap();
  renderUser();
  if (target) navigateTo(target);
}

function pollTelegramToken(token) {
  const status = document.getElementById('authStatus');
  if (state.tgLoginPollTimer) clearInterval(state.tgLoginPollTimer);
  state.tgLoginPollTimer = setInterval(async () => {
    try {
      const data = await api(`/api/auth/telegram-token/${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'x-user-id': 'demo-user' }
      });
      if (data.status === 'confirmed') {
        clearInterval(state.tgLoginPollTimer);
        state.tgLoginPollTimer = null;
        await finishTelegramLogin(data);
      } else if (data.status === 'denied') {
        clearInterval(state.tgLoginPollTimer);
        state.tgLoginPollTimer = null;
        const _enD = getCurrentLanguage() === 'en';
        status.textContent = _enD
          ? 'Login rejected in the bot. Start again if it was you.'
          : 'Вход отклонён в боте. Если это был ты — начни заново.';
      } else if (data.status === 'expired' || data.status === 'used') {
        clearInterval(state.tgLoginPollTimer);
        state.tgLoginPollTimer = null;
        const _en3 = getCurrentLanguage() === 'en';
        status.textContent = data.status === 'expired'
          ? (_en3 ? 'Login link expired. Try again.' : 'Ссылка входа истекла. Попробуй ещё раз.')
          : (_en3 ? 'This login link is already used.' : 'Эта ссылка входа уже использована.');
      }
    } catch (e) {
      clearInterval(state.tgLoginPollTimer);
      state.tgLoginPollTimer = null;
      status.textContent = getCurrentLanguage() === 'en' ? 'Login verification error.' : 'Ошибка проверки входа.';
    }
  }, 2500);
}

function renderTelegramAuthWidget() {
  const mount = document.getElementById('telegramAuthMount');
  if (!mount) return;
  if (mount) mount.innerHTML = '';
  const cfg = window.__TG_AUTH_CONFIG__ || {};
  if (!cfg.botUsername || cfg.botUsername === 'YOUR_BOT_USERNAME') {
    if (mount) mount.innerHTML = `<div class="muted">Заполни telegram-auth.json: botUsername и botToken.</div>`;
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', cfg.botUsername);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-userpic', 'false');
  script.setAttribute('data-radius', '14');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'window.onTelegramAuth(user)');
  mount.appendChild(script);
}

async function resolveAuthMode() {
  const tgUser = tg?.initDataUnsafe?.user;
  if (tgUser?.id) {
    state.authMode = 'telegram';
    state.authUser = { id: `tg_${tgUser.id}`, login: String(tgUser.username || '').replace(/^@/, '').trim().toLowerCase(), telegramId: String(tgUser.id) };
    state._perm = false; 
    return;
  }
  try {
    const data = await api('/api/auth/me', { headers: { 'x-user-id': 'demo-user' } });
    state.authMode = 'site';
    state.authUser = data.user;
    state._perm = Boolean(data.creator);
    state._superPerm = Boolean(data.dev);
  } catch {
    state.authMode = 'guest';
    state.authUser = null;
    state._perm = false;
    state._superPerm = false;
  }
}

const AUTH_VIEW_NAMES = {
  profile: 'Профиль',
  upgrader: 'Апгрейдер',
  battle: 'Батл',
  dice: 'Дайсы',
  crash: 'Краш',
  quests: 'Квесты',
  fuse: 'Фьюз',
  ladder: 'Лесенка',
};

function showAuthOverlay(targetView = null) {
  state.pendingProtectedView = targetView;
  const overlay = ensureAuthOverlay();
  const status = document.getElementById('authStatus');
  if (status) status.textContent = '';
  const targetLine = document.getElementById('authTarget');
  if (targetLine) targetLine.textContent = targetView ? `Нужен вход для раздела: ${AUTH_VIEW_NAMES[targetView] || targetView}.` : '';
  document.getElementById('discordAuthRow')?.classList.toggle('hidden', !state.discordLogin?.enabled);
  overlay.classList.remove('hidden');
  startTelegramBotLogin();
}

function requireSiteAuth(targetView) {
  if (state.authMode === 'site' || state.authMode === 'telegram') return false;
  showAuthOverlay(targetView);
  return true;
}

function resolvePublicUserName(user) {
  const preferred = String(user?.publicDisplayName || user?.displayName || user?.firstName || '').trim();
  const fallback = String(user?.publicId || user?.id || user?.userId || 'user').replace(/^tg_/i, '').trim();
  return preferred || fallback || 'user';
}

async function ensureTelegramWebAppSession() {
  try {
    if (window.__tgWebAppVerified) return;
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    const r = await api('/api/auth/telegram-webapp', { method: 'POST', body: JSON.stringify({ initData }) });
    if (r?.ok) window.__tgWebAppVerified = true;
  } catch {  }
}
const SUBREF_STORAGE_KEY = 'bb_subref';
function _captureDeepLinkSubRef() {
  try {
    const code = new URLSearchParams(location.search).get('subref');
    if (!code) return;
    localStorage.setItem(SUBREF_STORAGE_KEY, code.toUpperCase().slice(0, 24));
    history.replaceState(null, '', location.pathname + location.hash);
  } catch {}
}
function getStoredSubRef() {
  try { return localStorage.getItem(SUBREF_STORAGE_KEY) || ''; } catch { return ''; }
}

const DISCORD_AUTH_MESSAGES = {
  ok: 'Вошли через Discord.',
  linked: 'Discord привязан к аккаунту.',
  taken: 'Этот Discord уже привязан к другому аккаунту.',
  denied: 'Вход через Discord отменён.',
  needauth: 'Сначала войдите в аккаунт, потом привязывайте Discord.',
  off: 'Вход через Discord сейчас выключен.',
  state: 'Вход не подтвердился — начните заново.',
  discord: 'Discord не ответил. Попробуйте позже.',
};
function _showDiscordAuthResult() {
  try {
    const params = new URLSearchParams(location.search);
    const code = params.get('discord');
    if (!code) return;
    params.delete('discord');
    const rest = params.toString();
    history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : '') + location.hash);
    showToast(DISCORD_AUTH_MESSAGES[code] || 'Вход через Discord не удался.');
  } catch {}
}

function renderDiscordSettingsRow() {
  const row = document.getElementById('settingsDiscordRow');
  if (!row) return;
  const cfg = state.discordLogin || null;
  const canShow = Boolean(cfg?.enabled) && state.authMode !== 'guest';
  row.classList.toggle('hidden', !canShow);
  if (!canShow) return;
  const btn = document.getElementById('settingsDiscordBtn');
  const note = document.getElementById('settingsDiscordNote');
  const _en = getCurrentLanguage() === 'en';
  if (note) {
    note.textContent = cfg.linked
      ? (_en
        ? `Linked${cfg.username ? `: @${cfg.username}` : ''}. You can log into this account with that Discord.`
        : `Привязан${cfg.username ? `: @${cfg.username}` : ''}. Этим Discord можно входить в этот аккаунт.`)
      : (_en
        ? 'A second way into this same account — no bot, no code.'
        : 'Второй способ входа в этот же аккаунт — без бота и без кода.');
  }
  if (!btn) return;
  btn.textContent = cfg.linked ? (_en ? 'Unlink' : 'Отвязать') : (_en ? 'Link' : 'Привязать');
  btn.classList.toggle('is-active', !cfg.linked);
  if (btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';
  bindSafe(btn, 'click', async () => {
    const cur = state.discordLogin || {};
    if (!cur.linked) { location.href = '/api/auth/discord/start?link=1'; return; }
    btn.disabled = true;
    try {
      const r = await api('/api/auth/discord/unlink', { method: 'POST' });
      state.discordLogin = r.discord || { ...cur, linked: false, username: '' };
      showToast('Discord отвязан.');
      renderDiscordSettingsRow();
    } catch (e) {
      showToast(e.message);
    } finally {
      btn.disabled = false;
    }
  });
}

function _autoApplyDeepLinkRef() {
  try {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (!ref) return;
    history.replaceState(null, '', location.pathname + location.hash);
    if (state.authMode === 'guest') return;
    if (state.user?.hasReferrer) return;
    api('/api/referral/apply', { method: 'POST', body: JSON.stringify({ code: ref.toUpperCase() }) })
      .then(() => api('/api/bootstrap')).then(fresh => { if (fresh.user) { state.user = fresh.user; renderBalance(); } })
      .catch(() => {}); 
  } catch {}
}

function _telegramStartParam() {
  try {
    const direct = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (direct) return String(direct);
    const fromQuery = new URLSearchParams(location.search).get('tgWebAppStartParam');
    if (fromQuery) return fromQuery;
    return new URLSearchParams(String(location.hash || '').replace(/^#/, '')).get('tgWebAppStartParam') || '';
  } catch { return ''; }
}

function _applyStartParamRoute() {
  try {
    const m = /^player[-_]([A-Za-z0-9]{4,32})$/i.exec(_telegramStartParam());
    if (!m) return false;
    openPublicProfilePage(m[1].toUpperCase(), { scroll: false });
    return true;
  } catch { return false; }
}

async function bootstrap() {
  const profile = getTelegramProfile();
  state.userId = profile.userId || state.userId || 'guest-user';
  await ensureTelegramWebAppSession();
  const data = await api(`/api/bootstrap?${new URLSearchParams(profile).toString()}`);
  applyBootstrap(data);
  _captureDeepLinkSubRef();
  _autoApplyDeepLinkRef();
  _showDiscordAuthResult();
  renderDiscordSettingsRow();
  renderUser(); renderPromo(); renderCases();
  initSiteStats();
  installLanguageTools();
  renderLiveFeed(); renderBestDropCard(state.bestDrop24h); renderAllUserData(); loadPaymentHistory(); bindPaymentGui(); bindDepositTerminal(); bindDepositModal(); bindWithdrawalModal(); bindProfileTabs(); bindOpsTabs(); bindOpsReset(); bindLobbyActions(); bindSupportFloatingButton(); bindGlobalActionLogging(); startLiveDropsPolling(); bindLiveFeedProfileClick(); bindLiveFeedHoverPause(); setInterval(_refreshBestDrop, 60000); initAnalyticsTracking(); initUiClickSound(); _loadSellAudioBuffer(); _loadCaseOpenAudioBuffer(); _loadRouletteTickBuffer(); resumeActivePetDeposit();
  if (!_applyStartParamRoute()) {
    applyRouteFromLocation();
    if (state.selectedCaseId) openCasePage(state.selectedCaseId, { push: false, scroll: false });
  }
}

if (refs.caseSearch) bindSafe(refs.caseSearch, 'input', e => renderCases(e.target.value));
if (refs.opsCaseFilter) bindSafe(refs.opsCaseFilter, 'input', () => renderOpsCaseList(state.cases || []));
document.querySelectorAll('[data-nav]').forEach(btn => bindSafe(btn, 'click', () => {
  navigateTo(btn.dataset.nav);
  closeNavDrawer();
}));
let _navHome = null;
const NAV_DRAWER_MAX_WIDTH = 1299;

function syncNavPlacement() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;
  if (!_navHome) _navHome = { parent: nav.parentElement, next: nav.nextElementSibling };
  const mobile = window.innerWidth <= NAV_DRAWER_MAX_WIDTH;
  if (mobile) {
    if (nav.parentElement !== document.body) document.body.appendChild(nav);
  } else if (_navHome.parent && nav.parentElement !== _navHome.parent) {
    _navHome.parent.insertBefore(nav, _navHome.next);
  }
}

function setNavDrawer(open) {
  const nav   = document.querySelector('.main-nav');
  const btn   = document.getElementById('burgerBtn');
  const scrim = document.getElementById('navScrim');
  if (!nav) return;

  nav.classList.toggle('is-open', open);
  btn?.classList.toggle('is-open', open);
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('nav-drawer-open', open);

  if (!scrim) return;
  clearTimeout(scrim._hideTimer);
  if (open) {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('is-open'));
  } else {
    scrim.classList.remove('is-open');
    scrim._hideTimer = setTimeout(() => { scrim.hidden = true; }, 300);
  }
}

function closeNavDrawer() { setNavDrawer(false); }

const burgerBtn = document.getElementById('burgerBtn');
if (burgerBtn) {
  bindSafe(burgerBtn, 'click', () => {
    setNavDrawer(!document.querySelector('.main-nav')?.classList.contains('is-open'));
  });
}
bindSafe(document.getElementById('navScrim'), 'click', closeNavDrawer);
initSettingsPanel();
bindSafe(document, 'keydown', (e) => { if (e.key === 'Escape') closeNavDrawer(); });
bindSafe(window, 'resize', () => {
  syncNavPlacement();
  if (window.innerWidth > NAV_DRAWER_MAX_WIDTH) closeNavDrawer();
});
syncNavPlacement();

const siteLogoutBtn = document.getElementById('siteLogoutBtn');
if (siteLogoutBtn) {
  bindSafe(siteLogoutBtn, 'click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
      state.authMode = 'guest';
      state.authUser = null;
      siteLogoutBtn.classList.add('hidden');
      navigateTo('home');
    } catch (e) {
      showToast(e.message);
    }
  });
}

bindSafe(document, 'click', (event) => {
  const btn = event.target.closest('#openLadderModeBtn, #ladderAdvanceBtn, #ladderCashoutBtn');
  if (!btn || btn.disabled) return;
  if (btn.id === 'openLadderModeBtn' && typeof startLadderGame === 'function') startLadderGame();
  else if (btn.id === 'ladderAdvanceBtn' && typeof ladderAdvance === 'function') ladderAdvance();
  else if (btn.id === 'ladderCashoutBtn' && typeof ladderCashout === 'function') ladderCashout();
});
if (Array.isArray(refs.opsLadderModeTabs)) refs.opsLadderModeTabs.forEach(btn => bindSafe(btn, 'click', () => {
  const nextVariant = btn.dataset.opsLadderMode;
  if (!['easy','medium','heavy'].includes(nextVariant)) return;
  state._ldrMode = nextVariant;
  renderOpsLadderEditor();
}));
let __ladderStepDebounceTimer = null;
bindSafe(document, 'input', (event) => {
  if (event.target?.id !== 'opsLadderStepInput') return;
  clearTimeout(__ladderStepDebounceTimer);
  __ladderStepDebounceTimer = setTimeout(() => {
    if (typeof getLadderSteps !== 'function') return;
    const oldSteps = getLadderSteps();
    const nextCount = getOpsLadderStepCount();
    const steps = Array.from({ length: nextCount }, (_, idx) => oldSteps[idx] || {
      label: `Шаг ${idx + 1}`,
      multiplier: Number(oldSteps[oldSteps.length - 1]?.multiplier ?? 1),
      ladderCount: Number(oldSteps[oldSteps.length - 1]?.ladderCount || 4)
    });
    if (!state._ldrCfg) state._ldrCfg = {};
    state._ldrCfg.steps = steps;
    renderOpsLadderEditor();
  }, 400);
});
bindSafe(document, 'click', (event) => {
  const btn = event.target.closest('[data-stone-count]');
  if (!btn) return;
  const sc = Number(btn.dataset.stoneCount);
  if (!sc || sc < 1 || sc > 3) return;
  if (state.ladderSession?.status === 'active') return;
  state.ladderStoneCount = sc;
  if (typeof renderLadderMode === 'function') renderLadderMode();
});
if (refs.backFromItem) bindSafe(refs.backFromItem, 'click', () => { if (history.length > 1) history.back(); else navigateTo(state.previousView === 'item' ? 'home' : state.previousView); });
if (refs.backFromPublicProfile) bindSafe(refs.backFromPublicProfile, 'click', () => { if (history.length > 1) history.back(); else navigateTo(state.previousView === 'publicProfile' ? 'home' : state.previousView); });
document.querySelectorAll('.open-count-btn').forEach(btn => bindSafe(btn, 'click', () => {
  setOpenCount(btn.dataset.openCount);
}));
if (refs.openSelectedCaseBtn) bindSafe(refs.openSelectedCaseBtn, 'click', async () => {
  if (state.authMode === 'guest') {
    showToast('Гостю нельзя открывать кейсы. Войди через Telegram.');
    return;
  }
  if (state.spinning) return;
  if (!state.selectedCaseId) return showToast('Сначала выбери кейс.');
  const selectedCase = getCaseById(state.selectedCaseId);
  if (!selectedCase) return showToast('Кейс не найден.');

  const _depositRewardCfg = (state.depositCaseRewards || []).find(r => r.caseId === state.selectedCaseId);
  const _voucherCountPre = Number(state.user?.freeCaseVouchers?.[state.selectedCaseId]) || 0;
  if (_depositRewardCfg && _voucherCountPre <= 0) {
    const _deposited = Number(state.userDepositedTOK) || 0;
    const _min = Number(_depositRewardCfg.depositMin) || 0;
    const _left = Math.max(0, _min - _deposited);
    const _lastClaimed = Number(state.user?.depositCaseLastClaimedAt) || 0;
    const _nextAvailable = _lastClaimed + 24 * 60 * 60 * 1000;
    const _msUntilAvailable = Math.max(0, _nextAvailable - Date.now());
    if (_left > 0) {
      showToast(`Осталось задепать: ${_left} TOK`);
      return;
    }
    if (_msUntilAvailable > 0) {
      const _hours = Math.ceil(_msUntilAvailable / (60 * 60 * 1000));
      showToast(`Кейс доступен через ${_hours}ч`);
      return;
    }
    if (!state.hasRecentDeposit) {
      openDepositModal();
      return;
    }
  }

  const _isFreeCaseOpen = Boolean(state.freeCase?.enabled && state.selectedCaseId === state.freeCase?.caseId);
  if (_isFreeCaseOpen) {
    if (!getFreeCaseCanClaim()) { showToast('Кейс ещё не готов'); return; }
    await attemptClaimFreeCase(selectedCase);
    return;
  }

  const _isReferralCaseOpen = Boolean(state.referralCase?.enabled && state.selectedCaseId === state.referralCase?.caseId);
  if (_isReferralCaseOpen) {
    if (!state.referralCase.canClaim) { showToast('Кейс уже получен или недоступен'); return; }
    state.spinning = true;
    refs.openSelectedCaseBtn.disabled = true;
    refs.openSelectedCaseBtn.textContent = 'Открывается...';
    suppressLiveDrops(25000);
    try {
      const data = await api('/api/referral-case/claim', { method: 'POST' });
      state.user = data.user;
      renderAllUserData();
      const releaseDelay = showRouletteResults([data.won], selectedCase);
      suppressLiveDrops(releaseDelay + 300);
      scheduleRouletteTimer(async () => {
        state.spinning = false;
        refs.openSelectedCaseBtn.disabled = true;
        refs.openSelectedCaseBtn.textContent = 'Уже получено';
        renderReferralCase();
        await syncUserState(true);
      }, releaseDelay);
    } catch (e) {
      state.spinning = false;
      refs.openSelectedCaseBtn.disabled = false;
      refs.openSelectedCaseBtn.textContent = 'ЗАБРАТЬ РЕФЕРАЛЬНЫЙ КЕЙС';
      renderReferralCase();
      if (e.code === 'case_paused') {
        showCasePausedModal();
      } else {
        showToast(e.message);
      }
    }
    return;
  }

  const _voucherCount = Number(state.user?.freeCaseVouchers?.[state.selectedCaseId]) || 0;
  if (_voucherCount > 0) state.openCount = 1;

  try {
    state.spinning = true;
    refs.openSelectedCaseBtn.disabled = true;
    const _isEnBtn = getCurrentLanguage() === 'en';
    refs.openSelectedCaseBtn.textContent = false ? (_isEnBtn ? 'Generating options...' : 'Генерируются варианты...') : (state.openCount === 1 ? (_isEnBtn ? 'Opening...' : 'Открывается...') : (_isEnBtn ? `Opening (${state.openCount} pcs.)...` : `Открывается (${state.openCount} шт.)...`));
    let releaseDelay = 0;
    state.openCount = Number(state.openCount || 1);
    playCaseOpenSound();
    markPendingOpen({ caseId: state.selectedCaseId, count: state.openCount });
    suppressLiveDrops(25000);
    if (state.openCount === 1) {
      const data = await api(`/api/cases/${state.selectedCaseId}/open`, { method: 'POST', body: JSON.stringify({}) });
      state.user = data.user; renderAllUserData();
      releaseDelay = showRouletteResults([data.won], data.case);
    } else {
      const data = await api(`/api/cases/${state.selectedCaseId}/open-multi`, { method: 'POST', body: JSON.stringify({ count: state.openCount }) });
      state.user = data.user; renderAllUserData();
      releaseDelay = showRouletteResults(data.results, data.case);
    }
    suppressLiveDrops(releaseDelay + 300);
    scheduleRouletteTimer(async () => {
      state.spinning = false; refs.openSelectedCaseBtn.disabled = false; refs.openSelectedCaseBtn.textContent = 'Открыть кейс';
      await syncUserState(true);
    }, releaseDelay);
  } catch (e) {
    clearPendingOpen();
    state.spinning = false; refs.openSelectedCaseBtn.disabled = false; refs.openSelectedCaseBtn.textContent = false ? 'Открыть скрытый выбор' : 'Открыть кейс';
    if (e.code === 'case_paused') {
      showCasePausedModal();
    } else {
      showToast(e.message);
    }
  }
});
document.querySelectorAll('[data-close]').forEach(btn => bindSafe(btn, 'click', () => {
  const id = btn.dataset.close;
  if (id === 'rouletteModal') return closeRouletteModal();
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}));

bindSafe(document.getElementById('caseReelSkipBtn'), 'click', () => {
  skipRouletteAnimation();
  document.getElementById('caseReelSkipBtn')?.classList.add('is-consumed');
});

bindSafe(document.getElementById('rouletteSkipBtn'), 'click', () => {
  skipRouletteAnimation();
  document.getElementById('rouletteSkipBtn')?.classList.add('is-consumed');
});

const _freeCaseClaimBtn = document.getElementById('freeCaseClaimBtn');
if (_freeCaseClaimBtn) bindSafe(_freeCaseClaimBtn, 'click', () => claimFreeCase());
const _referralCaseClaimBtn = document.getElementById('referralCaseClaimBtn');
if (_referralCaseClaimBtn) bindSafe(_referralCaseClaimBtn, 'click', () => claimReferralCase());

if (refs.depositBtn) bindSafe(refs.depositBtn, 'click', (event) => { event.preventDefault(); openDepositModal(); });
document.querySelectorAll('.deposit-quick').forEach(btn => bindSafe(btn, 'click', () => { refs.depositInput.value = btn.dataset.amount; refs.depositBtn.click(); }));
if (refs.sellAllBtn) bindSafe(refs.sellAllBtn, 'click', async () => {
  const sellable = (state.user?.inventory || []).filter(e => !e.withdrawalPending);
  if (!sellable.length) { showToast('Нет предметов для продажи'); return; }
  try {
    const data = await api('/api/inventory/sell-all', { method: 'POST', body: JSON.stringify({}) });
    state.user = data.user;
    renderAllUserData();
    playSellSound();
    showToast(`Продано ${data.count} шт. за ${data.total} TOK`);
  } catch (e) { showToast(e.message); }
});
if (refs.opsSaveFuseBtn) bindSafe(refs.opsSaveFuseBtn, 'click', async () => {
  try {
    const body = {
      requiredCount: Number(refs.opsFuseRequiredCount?.value || 4),
      upgradeMultiplier: Number(refs.opsFuseUpgradeMultiplier?.value || 2.2),
      chanceMultiplier: Number(refs.opsFuseChanceMultiplier?.value || 0.78),
      minChance: Number(refs.opsFuseMinChance?.value ?? 1),
      maxChance: Number(refs.opsFuseMaxChance?.value || 85),
      targetMinValue: Number(refs.opsFuseTargetMinValue?.value || 145),
      failMode: refs.opsFuseFailMode?.value || 'fallback',
      houseDriftEnabled: document.getElementById('opsFuseHouseDriftEnabled')?.checked || false,
      houseDriftScale: Number(document.getElementById('opsFuseHouseDriftScale')?.value ?? 0.5),
    };
    const data = await api('/api/ops/fuse-config', { method: 'POST', body: JSON.stringify(body) });
    state._fzCfg = data.fuseConfig;
    loadSection('fuse').then(() => renderFuseSection()).catch(() => {});
    showToast('Настройки Fuse сохранены');
  } catch (e) { showToast(e.message); }
});

if (refs.opsAddPromoBtn) bindSafe(refs.opsAddPromoBtn, 'click', async () => {
  try {
    const code = refs.opsPromoCode.value.trim(); const bonus = Number(refs.opsPromoBonus.value || 0);
    const data = await api('/api/ops/promo', { method: 'POST', body: JSON.stringify({ code, bonus }) });
    refs.opsPromoCode.value = ''; refs.opsPromoBonus.value = '';
    if (refs.opsPromoList) refs.opsPromoList.innerHTML = data.promoVariants.map(p => `<div class="ops-promo-row"><strong>${escHtml(p.code)}</strong><span class="muted">+${p.bonus}%</span></div>`).join('');
    showToast('Промокод добавлен');
  } catch (e) { showToast(e.message); }
});
bindSafe(document, 'visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (state.spinning || hasPendingOpen()) syncUserState(true);
    startLiveDropsPolling();
    if (state.currentView === 'battle' || state.currentBattleId) startBattlePolling();
    if (!document.getElementById('withdrawalModal')?.classList.contains('hidden')) {
      loadWithdrawalQueueMyBooking(true);
    }
  } else {
    stopLiveDropsPolling();
  }
});
bindSafe(window, 'focus', () => {
  if (state.spinning || hasPendingOpen()) syncUserState(true);
  startLiveDropsPolling();
});

setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  if (state.currentView !== 'case' || !state.selectedCaseId) return;
  if (!(state.depositCaseRewards || []).some(r => r.caseId === state.selectedCaseId)) return;
  syncUserState(true);
}, 5000);

setInterval(() => {
  if (document.getElementById('withdrawalModal')?.classList.contains('hidden')) return;
  loadWithdrawalQueueMyBooking(true);
}, 5000);

(function watchForStaleClient() {
  const currentScriptSrc = document.querySelector('script[src^="/app.js"]')?.getAttribute('src') || '';
  if (!currentScriptSrc) return;
  const checkForNewerBuild = async () => {
    try {
      const res = await fetch('/?_cb=' + Date.now(), { cache: 'no-store' });
      const html = await res.text();
      const match = html.match(/<script src="(\/app\.js\?v=[^"]*)"/);
      if (match && match[1] !== currentScriptSrc) location.reload();
    } catch {}
  };
  setInterval(checkForNewerBuild, 60000);
  bindSafe(document, 'visibilitychange', () => { if (document.visibilityState === 'visible') checkForNewerBuild(); });
})();

resolveAuthMode().then(async () => {
  await bootstrap();
  if (hasPendingOpen()) syncUserState(true);
}).catch(e => showToast(e.message));

function updateSpeedToggle() {
  const btn = document.getElementById('caseFastSpinBtn');
  const on = typeof getFastSpinEnabled === 'function' ? getFastSpinEnabled() : false;
  state.spinSpeed = on ? 'fast' : 'slow';
  if (!btn) return;
  btn.classList.toggle('is-active', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.title = on ? 'Быстрая прокрутка включена' : 'Быстрая прокрутка';
}

bindSafe(document, 'click', (e) => {
  const btn = e.target.closest('#caseFastSpinBtn');
  if (!btn) return;
  setFastSpinEnabled(!getFastSpinEnabled());
  updateSpeedToggle();
  updateSpinStyleHint();
  const settingsToggle = document.getElementById('fastSpinToggle');
  if (settingsToggle) settingsToggle.checked = getFastSpinEnabled();
});
updateSpeedToggle();
updateSpinStyleHint();

function mountSpeedSwitchInCaseRow() {
  initThemeToggle();
  installTokenIconReplacer();
  installLanguageTools();
  const switchEl = document.querySelector('.spin-speed-switch');
  const openBtn = document.getElementById('openSelectedCaseBtn');
  if (switchEl && openBtn) {
    const row = openBtn.parentElement;
    row?.classList.add('case-open-row-with-speed');
    let line = row.querySelector('.case-open-line');
    if (!line) {
      line = document.createElement('div');
      line.className = 'case-open-line';
      openBtn.parentElement.insertBefore(line, openBtn);
      line.appendChild(openBtn);
    }
    line.appendChild(switchEl);
  }
  updateSpeedToggle();
  updateSpinStyleHint();
}
if (document.readyState === 'loading') bindSafe(window, 'DOMContentLoaded', mountSpeedSwitchInCaseRow);
else mountSpeedSwitchInCaseRow();

setInterval(updateLadderSideWinValue, 1200);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindLsrHeightSliders);
} else {
  bindLsrHeightSliders();
}

function toggleLsrSlider() {
  const t = document.getElementById('lsrHeightToggle');
  const s = document.getElementById('lsrHeightSlider');
  const v = document.getElementById('lsrHeightVal');
  if (!t || !s || !v) return;
  const on = t.dataset.on === '1';
  if (on) {
    t.dataset.on = '0';
    t.textContent = 'Высота';
    t.style.opacity = '1';
    s.style.display = 'none';
    v.style.display = 'none';
    document.documentElement.style.setProperty('--lsr-row-h', LSR_DEFAULT_H + 'px');
  } else {
    t.dataset.on = '1';
    t.textContent = '✕';
    t.style.opacity = '1';
    s.style.display = '';
    v.style.display = '';
    document.documentElement.style.setProperty('--lsr-row-h', s.value + 'px');
    v.textContent = s.value + 'px';
  }
}

function renderOpsSupportMessages() {}

async function loadOpsSupportMessages() {}

function bindOpsSupport() {}

function renderOpsBattleHistorySafe() {}

function bindOpsFixes() {}

function renderOpsUsersList() {}
function bindOpsBalanceTools() {}

(function bindRouletteEscapeCloseV132(){
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRouletteModal();
  }, true);
})();

(function resetBattleOverlayOnBoot(){
  try {
    document.body.classList.remove('battle-overlay-open'); setInBattleMode(false);
    const overlay = document.getElementById('battleOverlay');
    if (overlay) overlay.classList.add('hidden');
  } catch {}
})();

bindSafe(document, 'change', async (event) => {
  const cb = event.target.closest('[data-closure-key]');
  if (!cb || cb.tagName !== 'INPUT' || cb.type !== 'checkbox') return;
  const feature = cb.dataset.closureKey;
  const closed = cb.checked;
  try {
    const data = await api('/api/ops/feature-closed', { method: 'POST', body: JSON.stringify({ feature, closed }) });
    state.closedFeatures = data.closedFeatures || state.closedFeatures;
    state.closedFeatures[feature] = Boolean(data.closed);
    updateClosedRibbons();
    showToast(data.closed ? `Раздел закрыт` : `Раздел открыт`);
  } catch (e) {
    cb.checked = !closed;
    showToast('Ошибка: ' + (e.message || 'неизвестная'));
  }
});

bindSafe(document, 'change', async (event) => {
  const cb = event.target.closest('[data-nav-hidden-key]');
  if (!cb || cb.tagName !== 'INPUT' || cb.type !== 'checkbox') return;
  const nav = cb.dataset.navHiddenKey;
  const hidden = cb.checked;
  try {
    const data = await api('/api/ops/nav-hidden', { method: 'POST', body: JSON.stringify({ nav, hidden }) });
    state.hiddenNav = data.hiddenNav || state.hiddenNav;
    state.hiddenNav[nav] = Boolean(data.hidden);
    syncHiddenNav();
    const isEn = getCurrentLanguage() === 'en';
    showToast(data.hidden ? (isEn ? 'Button hidden' : 'Кнопка скрыта') : (isEn ? 'Button visible' : 'Кнопка видна'));
  } catch (e) {
    cb.checked = !hidden;
    showToast('Ошибка: ' + (e.message || 'неизвестная'));
  }
});

const SITE_STATS_COUNT_MS = 1100;
let _siteStatsDone = false;

function _formatSiteStat(n) {
  return Math.round(n).toLocaleString('ru-RU');
}

function _countUpSiteStat(el, target, reduced) {
  if (reduced || !target) { el.textContent = _formatSiteStat(target); return; }
  const started = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - started) / SITE_STATS_COUNT_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = _formatSiteStat(target * eased);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = _formatSiteStat(target);
  };
  requestAnimationFrame(step);
}

async function _fillSiteStats() {
  if (_siteStatsDone) return;
  _siteStatsDone = true;
  const root = document.getElementById('siteStats');
  if (!root) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stats = null;
  try {
    const r = await fetch('/api/stats/global', { credentials: 'same-origin' });
    stats = (await r.json())?.stats || null;
  } catch (e) {
    root.classList.add('hidden');
    return;
  }
  if (!stats) { root.classList.add('hidden'); return; }
  root.classList.add('is-visible');
  root.querySelectorAll('.site-stat-value[data-stat]').forEach(el => {
    const value = Number(stats[el.dataset.stat]) || 0;
    if (!value) { el.closest('.site-stat')?.classList.add('hidden'); return; }
    _countUpSiteStat(el, value, reduced);
  });
}

function initSiteStats() {
  if (initSiteStats._done) return;
  const root = document.getElementById('siteStats');
  if (!root) return;
  initSiteStats._done = true;
  if (!('IntersectionObserver' in window)) { _fillSiteStats(); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.disconnect();
      _fillSiteStats();
    }
  }, { rootMargin: '0px 0px -40px 0px' });
  io.observe(root);
}

setTimeout(initSiteStats, 5000);
