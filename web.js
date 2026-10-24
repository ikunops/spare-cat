/* 00-core.js */
const A = XianmaoData.assets;
const CATS = XianmaoData.cats;
const POSTS = XianmaoData.posts;
const SERVICES = XianmaoData.services;
const STORE = 'xianmao-web-v1';
const AUTH_STORE = 'xianmao-web-auth';
const GEO_STORE = 'xianmao-geo';
const DISTANCE_MIN = 0.5;
const DISTANCE_DEFAULT = 5;
const DISTANCE_MAX = 20;
const BASE_PATH = (() => {
  const base = document.querySelector('meta[name="xianmao-base"]')?.content?.trim() || '';
  if (!base || base === '/') return '';
  return '/' + base.replace(/^\/+|\/+$/g, '');
})();
const API = {
  enabled: location.protocol === 'http:' || location.protocol === 'https:',
  async request(path, options = {}) {
    const url = BASE_PATH && path.startsWith('/') ? BASE_PATH + path : path;
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json', ...(state.authToken ? { 'x-user-token': state.authToken } : {}) },
      ...options
    });
    const payload = await response.json();
    if (!response.ok) {
      const error = new Error(payload.error || '数据库请求失败');
      error.status = response.status;
      throw error;
    }
    return payload;
  }
};

const state = {
  page: 'home',
  user: null,
  authToken: '',
  geo: null,
  admin: { tab: 'dash', contentType: 'cats', page: {}, q: {}, status: {}, stats: null, list: null },
  location: '翠苑 · 西湖区',
  query: '',
  quick: '全部',
  filters: { breed: '全部', age: '全部', sex: '全部', distance: DISTANCE_DEFAULT, citywide: false },
  favorites: ['doubao'],
  likedPosts: [],
  applications: [],
  published: [],
  posts: [],
  reviews: [],
  places: [],
  adoptions: [
    { catId: 'banli', homeDate: '2026-09-28', revisitDate: '2026-12-28', status: '适应良好' }
  ],
  selectedCat: null,
  selectedService: null,
  profileTab: 'adopted',
  communityFilter: '全部',
  servicesFilter: '全部',
  composeTag: '捉猫实录',
  noticeRead: false,
  lastOverlay: null,
  photoSlot: 0,
  form: { name: '', phone: '', home: '整租 / 自有住房', experience: '养过猫', reason: '', agree: false },
  publish: { name: '', breed: '中华田园猫', age: '1–3 个月', sex: '公', area: '', spot: 'cuiyuan', note: '', photos: [], sterilized: true, friendly: true },
  reviewStars: 5,
  reviewService: null,
  composePhoto: null,
  placePhoto: null,
  placeSpot: 'cuiyuan',
  placeDraft: null,
  activePost: null
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (n, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${n}"></use></svg>`;

function photoSrc(photo) {
  return /^(data:|https?:|blob:)/.test(photo || '') ? photo : A + photo;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (busy) {
    button.dataset.idleHtml = button.innerHTML;
    button.disabled = true;
    button.textContent = label || '正在保存…';
  } else {
    button.disabled = false;
    if (button.dataset.idleHtml) button.innerHTML = button.dataset.idleHtml;
  }
}

function compressImage(file, maxSize = 960, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('请选择图片文件')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('图片格式无法识别'));
      img.onload = () => {
        try {
          const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) { reject(error); }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const allCats = () => {
  const seen = new Set();
  return CATS.concat(state.published).filter((cat) => {
    if (!cat || seen.has(cat.id)) return false;
    seen.add(cat.id);
    return true;
  });
};
const availableCats = () => allCats().filter((cat) => cat.adoptionState !== '已领养');
const isFav = (id) => state.favorites.includes(id);
const catById = (id) => allCats().find((c) => c.id === id);
const isMine = (cat) => Boolean(cat && cat.reportedByMe);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (Array.isArray(saved.favorites)) state.favorites = saved.favorites;
    if (Array.isArray(saved.likedPosts)) state.likedPosts = saved.likedPosts;
    if (Array.isArray(saved.applications)) state.applications = saved.applications;
    if (Array.isArray(saved.published)) state.published = saved.published;
    if (Array.isArray(saved.adoptions)) state.adoptions = saved.adoptions;
    if (Array.isArray(saved.posts)) state.posts = saved.posts;
    if (Array.isArray(saved.reviews)) state.reviews = saved.reviews;
    if (Array.isArray(saved.places)) state.places = saved.places;
    if (typeof saved.location === 'string') state.location = saved.location;
    if (typeof saved.noticeRead === 'boolean') state.noticeRead = saved.noticeRead;
    const auth = JSON.parse(localStorage.getItem(AUTH_STORE) || '{}');
    if (typeof auth.token === 'string') state.authToken = auth.token;
    const geo = JSON.parse(localStorage.getItem(GEO_STORE) || 'null');
    if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) state.geo = geo;
  } catch (error) { /* keep defaults */ }
}
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({
      favorites: state.favorites,
      likedPosts: state.likedPosts,
      applications: state.applications,
      published: state.published,
      adoptions: state.adoptions,
      posts: state.posts,
      reviews: state.reviews,
      places: state.places,
      location: state.location,
      noticeRead: state.noticeRead
    }));
  } catch (error) { /* ignore */ }
}
function toast(text) {
  const root = $('#webToast');
  const el = document.createElement('div');
  el.className = 'toast-web';
  el.innerHTML = icon('check') + esc(text);
  root.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function applyBootstrap(payload) {
  if (!payload) return;
  if (payload.token && !state.authToken) saveAuth(payload.token);
  state.user = payload.user || null;
  if (Array.isArray(payload.cats)) {
    const baseIds = new Set(CATS.map((cat) => cat.id));
    payload.cats.forEach((cat) => {
      const base = CATS.find((item) => item.id === cat.id);
      if (base) Object.assign(base, cat);
    });
    state.published = payload.cats.filter((cat) => !baseIds.has(cat.id));
  }
  if (Array.isArray(payload.favorites)) state.favorites = payload.favorites;
  if (Array.isArray(payload.likedPosts)) state.likedPosts = payload.likedPosts;
  if (Array.isArray(payload.applications)) state.applications = payload.applications;
  if (Array.isArray(payload.adoptions)) state.adoptions = payload.adoptions;
  if (Array.isArray(payload.posts)) {
    payload.posts.forEach((post) => {
      if (!post || !post.id) return;
      const localIndex = state.posts.findIndex((item) => item.id === post.id);
      const base = POSTS.find((item) => item.id === post.id);
      if (localIndex >= 0) {
        state.posts[localIndex] = { ...state.posts[localIndex], ...post };
      } else if (base) {
        Object.assign(base, post);
      } else {
        state.posts.push(post);
      }
    });
  }
  if (Array.isArray(payload.userPosts)) {
    payload.userPosts.forEach((post) => {
      if (!state.posts.some((item) => item.id === post.id) && !POSTS.some((item) => item.id === post.id)) state.posts.push(post);
    });
  }
  if (Array.isArray(payload.places)) {
    payload.places.forEach((place) => {
      if (!place || !place.id) return;
      const localIndex = state.places.findIndex((item) => item.id === place.id);
      const base = SERVICES.find((item) => item.id === place.id);
      if (localIndex >= 0) {
        state.places[localIndex] = { ...state.places[localIndex], ...place };
      } else if (base) {
        Object.assign(base, place);
      } else {
        state.places.push(place);
      }
    });
  }
  applyGeoDistances();
}

function apiWrite(path, options) {
  if (!API.enabled) return Promise.resolve(null);
  return API.request(path, options).then((payload) => {
    applyBootstrap(payload);
    return payload;
  }).catch((error) => {
    if (error.status === 401) {
      authModal('login');
      toast('登录后才能发布内容');
      return null;
    }
    console.warn('[xianmao] database unavailable, keeping local state', error);
    return null;
  });
}

const userName = () => (state.user ? state.user.name : '');

function requireAuth() {
  if (state.user) return true;
  authModal('login');
  toast('登录后才能发布内容');
  return false;
}

function refreshBootstrap() {
  if (!API.enabled) return Promise.resolve();
  return API.request('/api/bootstrap').then((payload) => {
    applyBootstrap(payload);
    renderApp({ preserveScroll: true });
  }).catch((error) => console.warn('[xianmao] bootstrap refresh failed', error));
}

function saveAuth(token) {
  state.authToken = token || '';
  try {
    if (token) localStorage.setItem(AUTH_STORE, JSON.stringify({ token }));
    else localStorage.removeItem(AUTH_STORE);
  } catch (error) { /* ignore */ }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function roundedDistance(km) {
  return km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
}

function applyGeoDistances() {
  const apply = (items) => {
    items.forEach((item) => {
      if (!item || !Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) return;
      if (item.baseDistance === undefined) item.baseDistance = Number(item.distance) || 0;
      item.distance = state.geo
        ? roundedDistance(haversineKm(state.geo.lat, state.geo.lng, Number(item.lat), Number(item.lng)))
        : item.baseDistance;
    });
  };
  apply(allCats());
  apply(allPlaces());
}

function saveGeo(geo) {
  state.geo = geo;
  try {
    if (geo) localStorage.setItem(GEO_STORE, JSON.stringify(geo));
    else localStorage.setItem(GEO_STORE, JSON.stringify({ denied: true }));
  } catch (error) { /* ignore */ }
  applyGeoDistances();
}

function requestGeolocation() {
  if (!navigator.geolocation) { toast('这个浏览器不支持定位，先用演示区吧'); return; }
  navigator.geolocation.getCurrentPosition((position) => {
    saveGeo({ lat: Number(position.coords.latitude.toFixed(5)), lng: Number(position.coords.longitude.toFixed(5)) });
    closeModal();
    renderApp({ preserveScroll: true });
    toast('已按你的位置计算距离，只在本机生效');
  }, () => {
    saveGeo(null);
    toast('没有拿到定位授权，先用演示区吧');
  }, { timeout: 8000, maximumAge: 600000 });
}

function maybeRequestGeo() {
  try {
    const saved = JSON.parse(localStorage.getItem(GEO_STORE) || 'null');
    if (saved && (saved.denied || Number.isFinite(saved.lat))) return;
  } catch (error) { /* ask anyway */ }
  requestGeolocation();
}

function nearestCatDistance() {
  const list = availableCats();
  if (!list.length) return Infinity;
  return Math.min(...list.map((cat) => Number(cat.distance) || 0));
}

function authModal(mode = 'login') {
  const isRegister = mode === 'register';
  modal(`
    <div class="auth-modal">
      <div class="auth-tabs" role="tablist">
        <button type="button" class="${isRegister ? '' : 'is-active'}" data-auth-tab="login">登录</button>
        <button type="button" class="${isRegister ? 'is-active' : ''}" data-auth-tab="register">注册</button>
      </div>
      <form id="webAuthForm" data-mode="${isRegister ? 'register' : 'login'}">
        ${isRegister ? `<div class="form-field"><label for="webAuthNickname">昵称<small>社区里显示的名字，1-12 个字</small></label><input class="input" id="webAuthNickname" name="nickname" placeholder="比如：三栋的阿橘" maxlength="12" /></div>` : ''}
        <div class="form-field"><label for="webAuthUsername">用户名<small>2-20 位中文、字母、数字或 _ - . ·</small></label><input class="input" id="webAuthUsername" name="username" placeholder="your-name 或 中文昵称" autocomplete="username" /></div>
        <div class="form-field"><label for="webAuthPassword">密码<small>${isRegister ? '至少 6 位 · 暂无找回渠道，请牢记' : ''}</small></label><div class="input-wrap"><input class="input" id="webAuthPassword" name="password" type="password" placeholder="${isRegister ? '设置密码' : '你的密码'}" autocomplete="${isRegister ? 'new-password' : 'current-password'}" /><button type="button" class="pw-eye" data-pw-eye="webAuthPassword" aria-label="显示或隐藏密码"><svg class="icon" aria-hidden="true"><use href="#i-eye"></use></svg></button></div></div>
        ${isRegister ? `<div class="form-field"><label for="webAuthPassword2">再输一遍密码</label><div class="input-wrap"><input class="input" id="webAuthPassword2" name="password2" type="password" placeholder="两次输入要一致" autocomplete="new-password" /><button type="button" class="pw-eye" data-pw-eye="webAuthPassword2" aria-label="显示或隐藏密码"><svg class="icon" aria-hidden="true"><use href="#i-eye"></use></svg></button></div></div>
        <div class="info-note">${icon('shield')}注册即表示同意邻里守则：不做交易、位置只到街区、不同体验都会被保留。</div>` : ''}
        <div class="form-error" role="alert"></div>
        <div class="modal-actions"><button class="btn" type="button" data-close-modal>先逛逛</button><button class="btn btn-primary" type="submit">${isRegister ? '创建身份' : '登录'}</button></div>
      </form>
    </div>`);
}

function accountModal() {
  if (!state.user) { authModal('login'); return; }
  modal(`
    <div class="auth-modal">
      <div class="account-head">${contributorAvatar(state.user.name, state.user.avatar)}<div><b>${esc(state.user.name)}</b><small>@${esc(state.user.username || state.user.id)} · 邻里信用 ${Number(state.user.credit || 0)}</small></div></div>
      <form id="webProfileForm">
        <div class="form-field"><label for="webProfileNickname">昵称<small>1-12 个字</small></label><input class="input" id="webProfileNickname" name="nickname" value="${esc(state.user.name)}" maxlength="12" /></div>
        <div class="form-field"><label for="webProfileArea">常在哪儿<small>选填，让邻里知道你在哪一带</small></label><input class="input" id="webProfileArea" name="area" value="${esc(state.user.area || '')}" placeholder="比如：翠苑二区" maxlength="20" /></div>
        <div class="form-error" role="alert"></div>
        <div class="modal-actions"><button class="btn" type="button" data-logout>退出登录</button><button class="btn btn-primary" type="submit">保存资料</button></div>
      </form>
    </div>`);
}

/* 01-header.js */
const NAV = [
  { id: 'home', label: '附近发现' },
  { id: 'map', label: '猫口地图' },
  { id: 'community', label: '邻里广场' },
  { id: 'profile', label: '我的' }
];

function renderHeader() {
  const activePage = state.page === 'service' ? 'services' : state.page;
  const header = $('#webHeader');
  header.innerHTML = `
    <div class="header-inner">
      <a class="web-brand" href="#" data-page="home" aria-label="Spare Cat 闲猫首页">
        <span class="seal">猫</span>
        <span class="web-brand-text"><b>闲猫·手慢无</b><small>SPARE CAT · SPARE A HOME</small></span>
      </a>
      <nav class="web-nav" aria-label="主导航">
        ${NAV.map((item) => `<button type="button" class="${activePage === item.id ? 'is-active' : ''}" data-page="${item.id}" ${activePage === item.id ? 'aria-current="page"' : ''}>${item.label}</button>`).join('')}
      </nav>
      <div class="header-tools">
        ${state.user && state.user.isAdmin ? `<button class="header-admin" type="button" data-page="admin" aria-label="管理后台">${icon('shield')}<span>管理</span></button>` : ''}
        <button class="header-user ${state.user ? '' : 'is-anon'}" type="button" data-action="account" aria-label="${state.user ? '账号与资料' : '登录或注册'}"><span class="header-user-avatar">${state.user ? esc(state.user.avatar) : icon('user')}</span><span>${state.user ? esc(state.user.name) : '登录'}</span></button>
        <button class="location-select" type="button" data-action="location">${icon('pin')}${state.geo ? '我的位置' : esc(state.location)}${icon('chevron-down')}</button>
        <button class="header-store ${activePage === 'services' ? 'is-active' : ''}" type="button" data-page="services" aria-label="查看附近好店" ${activePage === 'services' ? 'aria-current="page"' : ''}>${icon('store')}<span>好店</span></button>
        <button class="header-icon" type="button" data-action="notice" aria-label="查看邻里提醒">${icon('bell')}${state.noticeRead ? '' : '<span class="dot"></span>'}</button>
        <button class="header-cta" type="button" data-page="publish">${icon('plus')}<span>上报一只猫</span></button>
      </div>
    </div>`;
}

/* 01b-community-data.js */
function mergeById(base, local) {
  const merged = new Map();
  base.forEach((item) => { if (item && item.id) merged.set(item.id, item); });
  local.forEach((item) => {
    if (!item || !item.id) return;
    const previous = merged.get(item.id) || {};
    merged.set(item.id, { ...previous, ...item, commentsList: Array.isArray(item.commentsList) ? item.commentsList : previous.commentsList });
  });
  return Array.from(merged.values());
}

function allPosts() {
  return mergeById(POSTS, state.posts);
}

function allPlaces() {
  return mergeById(SERVICES, state.places);
}

function postById(id) {
  return allPosts().find((post) => post.id === id) || null;
}

function allReviews() {
  const seen = new Set();
  return allPlaces().flatMap((service) => (service.reviews || []).map((review) => ({ ...review, service: service.name, serviceId: service.id })))
    .concat(state.reviews)
    .filter((review) => {
      const key = `${review.serviceId || review.service}|${review.name}|${review.text}|${review.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function memberContribution(name) {
  if (!name) return { verified: false, reports: 0, adoptions: 0, posts: 0, comments: 0, reviews: 0, places: 0, total: 0, level: '邻里', frame: '' };
  const verified = name === userName() ? Boolean(state.user && state.user.verified) : ['林小满', '阿桔', '周周', '车库老陈', '长河阿七'].includes(name);
  const reports = allCats().filter((cat) => (name === userName() ? isMine(cat) : cat.reporter === name)).length;
  const adoptions = state.adoptions.filter((adoption) => {
    const cat = catById(adoption.catId);
    return cat && cat.reporter === name;
  }).length;
  const posts = allPosts().filter((post) => post.author === name).length;
  const comments = allPosts().reduce((total, post) => total + (post.commentsList || []).filter((comment) => comment.name === name).length, 0);
  const reviews = allReviews().filter((review) => review.name === name).length;
  const places = allPlaces().filter((place) => place.submittedBy === name).length;
  const total = reports + adoptions + posts + comments + reviews + places;
  const level = total >= 8 || reports >= 3 ? '资深邻里' : reports >= 1 || adoptions >= 1 || posts >= 2 ? '守护邻里' : total >= 1 ? '邻里' : '新邻居';
  const frame = level === '资深邻里' ? 'is-frame-senior' : level === '守护邻里' ? 'is-frame-guard' : level === '邻里' ? 'is-frame-neighbor' : '';
  return { verified, reports, adoptions, posts, comments, reviews, places, total, level, frame };
}

function contributorBadge(name, compact = false) {
  const c = memberContribution(name);
  const detail = compact
    ? [c.verified ? '已实名' : '', c.reports ? `上报 ${c.reports}` : '', c.adoptions ? `领养 ${c.adoptions}` : ''].filter(Boolean).join(' · ')
    : [c.verified ? '已实名' : '未实名', c.reports ? `上报 ${c.reports} 只` : '', c.adoptions ? `领养 ${c.adoptions} 只` : '', c.posts ? `${c.posts} 篇笔记` : '', c.comments ? `${c.comments} 条回应` : '', c.reviews ? `${c.reviews} 条评价` : ''].filter(Boolean).join(' · ');
  return `<span class="contributor-badge ${c.frame}"><b>${esc(c.level)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span>`;
}

function avatarTone(name) {
  let hash = 0;
  const text = String(name || '');
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return ['', 'is-orange', 'is-dark'][hash % 3];
}

function contributorAvatar(name, avatar, tone = '') {
  const c = memberContribution(name);
  const label = String(avatar || name || '邻').slice(0, 1);
  return `<span class="contributor-avatar ${c.frame}"><span class="avatar ${tone || avatarTone(name)}">${esc(label)}</span></span>`;
}

function isMyComment(comment) {
  return comment.name === userName();
}

function myComments() {
  return allPosts().flatMap((post) => (post.commentsList || []).filter(isMyComment).map((comment) => ({ ...comment, post })));
}

function myLikedPosts() {
  return state.likedPosts.map(postById).filter(Boolean);
}

function myPosts() {
  return allPosts().filter((post) => post.author === userName());
}

function postCommentCount(post) {
  return Array.isArray(post.commentsList) && post.commentsList.length ? post.commentsList.length : Number(post.comments || 0);
}

function postingPlaceOptions(current) {
  return ['翠苑二区', '古荡新村', '文三路', '益乐路', '丰潭路', '嘉绿苑', '滨江·长河', '拱墅·小河'].map((place) => `<option ${current === place ? 'selected' : ''}>${place}</option>`).join('');
}

function sharedPlaceCategories() {
  return ['全部', '医院', '商店', '猫咖', '遛猫地点'];
}

function serviceTypeLabel(type) {
  return type === '遛猫的地方' ? '遛猫地点' : type;
}

/* 02-home.js */
function filteredCats() {
  const q = state.query.trim().toLowerCase();
  return availableCats().filter((cat) => {
    if (!breedMatches(cat, state.filters.breed)) return false;
    if (!ageMatches(cat, state.filters.age)) return false;
    if (state.filters.sex !== '全部' && cat.sex !== state.filters.sex) return false;
    if (!distanceMatches(cat, state.filters.distance, state.filters.citywide)) return false;
    if (state.quick === '亲人' && !cat.healthTags.concat(cat.traits).some((t) => /亲人|黏人|蹭手|踩奶/.test(t))) return false;
    if (state.quick === '幼猫' && cat.ageGroup !== '幼年') return false;
    if (state.quick === '已绝育' && cat.sterilization !== '已绝育') return false;
    if (state.quick === '1km内' && cat.distance > 1) return false;
    if (q && !(cat.name + cat.breed + cat.color + cat.area + cat.traits.join('')).toLowerCase().includes(q)) return false;
    return true;
  });
}

function catTile(cat, i) {
  return `<article class="cat-tile" style="--i:${i}" data-open-cat="${cat.id}" tabindex="0" role="button" aria-label="查看 ${esc(cat.name)} 的档案">
    <div class="cat-tile-photo">
      <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}，${esc(cat.breed)}" loading="lazy" />
      <span class="status-pill ${cat.urgent ? '' : 'is-calm'}">${esc(cat.status)}</span>
      <button class="cat-tile-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'} ${esc(cat.name)}">${icon('heart')}</button>
    </div>
    <div class="cat-tile-info">
      <div class="cat-tile-name"><b>${esc(cat.name)}</b><span>${cat.distance} KM</span></div>
      <div class="cat-tile-meta">${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}${cat.color && cat.color !== '待补充' ? ' · ' + esc(cat.color) : ''}</div>
      <div class="cat-tile-tags">${cat.healthTags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
    </div>
  </article>`;
}

/* 03-hero.js */
function heroFeature() {
  const cat = availableCats()[0];
  return `
    <div class="hero-feature">
      <img src="${photoSrc(cat.photo)}" alt="橘白猫 ${esc(cat.name)}" />
      <div class="hero-feature-top">
        <span class="hero-feature-label">TODAY'S NEIGHBOR · 今日邻里</span>
        <button class="hero-feature-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button>
      </div>
      <div class="hero-feature-body">
        <div class="hero-feature-kicker">${esc(cat.areaShort)} · ${cat.distance} KM AWAY</div>
        <div class="hero-feature-name"><h2>${esc(cat.name)}</h2><span>${esc(cat.english)}</span></div>
        <div class="hero-feature-meta">
          <span>${icon('pin')}${esc(cat.area)}</span>
          <span>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}</span>
        </div>
        <div class="hero-feature-bottom">
          <p>${esc(cat.note)}</p>
          <button class="btn" type="button" data-open-cat="${cat.id}">查看档案 ${icon('arrow-up-right')}</button>
        </div>
      </div>
    </div>
    <div class="hero-stamp">先见面<br />再决定</div>`;
}

/* 04-rail.js */
function miniMap() {
  const pins = availableCats().slice(0, 5).map((cat, i) => {
    const left = 20 + (i * 17) + (i % 2) * 5;
    const top = 25 + ((i * 13) % 43);
    return `<button class="mini-map-pin" type="button" style="left:${left}%;top:${top}%" data-open-cat="${cat.id}" aria-label="${esc(cat.name)}"><img src="${photoSrc(cat.photo)}" alt="" /></button>`;
  }).join('');
  return `<div class="map-rail-card">
    <div class="mini-map-head"><div><h3>这一带的猫</h3><p>${esc(distanceScopeLabel())} · ${availableCats().length} PINNED</p></div><button type="button" data-page="map">放大 ${icon('arrow-up-right')}</button></div>
    <div class="mini-map" data-page="map" role="button" tabindex="0" aria-label="打开猫口地图">
      <svg viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
        <rect width="320" height="180" fill="#e9e4d5" />
        <g fill="#f2eee1" stroke="#d8d0bd" stroke-width=".7">
          <rect x="5" y="5" width="63" height="40" /><rect x="75" y="5" width="83" height="40" /><rect x="165" y="5" width="56" height="40" /><rect x="228" y="5" width="86" height="40" />
          <rect x="5" y="52" width="63" height="54" /><rect x="75" y="52" width="83" height="54" /><rect x="165" y="52" width="56" height="54" /><rect x="228" y="52" width="86" height="54" />
          <rect x="5" y="115" width="63" height="57" /><rect x="75" y="115" width="83" height="57" /><rect x="165" y="115" width="56" height="57" /><rect x="228" y="115" width="86" height="57" />
        </g>
        <path d="M0 111 C65 105, 115 124, 187 112 S265 101, 320 109" fill="none" stroke="#c4d6cc" stroke-width="10" />
        <path d="M68 0 C61 42, 84 71, 71 110 S54 153, 68 180" fill="none" stroke="#faf6ea" stroke-width="7" />
        <path d="M0 178 C92 169, 241 183, 320 169" fill="none" stroke="#faf6ea" stroke-width="6" />
        <g fill="#cad6ca" opacity=".9"><rect x="228" y="52" width="35" height="26" /><rect x="75" y="115" width="34" height="25" /><rect x="165" y="115" width="31" height="22" /></g>
        <g fill="#8a927f" font-family="DM Mono, monospace" font-size="5.5" letter-spacing=".8"><text x="8" y="106">WEN ER RD.</text><text x="82" y="148">YILE RD.</text><text x="173" y="47">GUDANG</text></g>
      </svg>
      <div class="you"></div>
      ${pins}
    </div>
    <div class="map-legend"><span><i></i>等待领养</span><span><i class="is-green"></i>你在附近</span><button class="legend-link" type="button" data-page="map">猫口地图 ${icon('chevron')}</button></div>
  </div>`;
}

/* 05-railcontent.js */
function railPosts() {
  return POSTS.slice(0, 3).map((post) => `
    <button class="rail-post" type="button" data-open-post="${post.id}">
      <div class="rail-post-meta"><span>${esc(post.tag)}</span><i></i><span>${esc(post.time)}</span></div>
      <h4>${esc(post.title)}</h4>
      <p>${esc(post.excerpt)}</p>
      <div class="rail-post-foot"><span>${icon('heart')}${postLikes(post)}</span><span>${icon('square')}${post.comments}</span><span>${esc(post.author)}</span></div>
    </button>`).join('');
}

function railServices() {
  return SERVICES.slice(0, 3).map((s) => `
    <button class="service-mini" type="button" data-open-service="${s.id}">
      <span class="service-mini-icon">${icon(s.icon.replace('i-', ''))}</span>
      <div><b>${esc(s.name)}</b><span>${esc(s.type)} · ${s.distance}km · ${esc(s.hours)}</span></div>
      <span class="service-mini-score">${icon('star')}${s.rating}</span>
      ${icon('chevron')}
    </button>`).join('');
}

/* 06-homeview.js */
function renderHome() {
  const list = filteredCats();
  const filtered = Object.entries(state.filters).some(([k, v]) => {
    if (k === 'distance') return Number(v) !== DISTANCE_DEFAULT;
    if (k === 'citywide') return v === true;
    return v !== '全部';
  }) || state.quick !== '全部';
  const geoFar = Boolean(state.geo) && availableCats().length > 0 && nearestCatDistance() > DISTANCE_MAX;
  return `
    ${geoFar ? `
    <section class="geo-note">
      <div class="geo-note-card">
        <b>${icon('locate')}你附近暂时没有猫口上报</b>
        <p>按你的位置计算，最近的猫在约 ${nearestCatDistance()} km 外。当前展示的是杭州西湖区的演示数据，切回去就能继续逛。</p>
        <button class="btn" type="button" data-action="use-geo">${icon('pin')}切回杭州演示区</button>
      </div>
    </section>` : ''}
    <section class="discover">
      <div class="discover-main">
        <div class="section-head"><h2>附近也在等<small>NEARBY, RIGHT NOW</small></h2><span class="result-meta">${list.length} / ${availableCats().length} 只匹配</span></div>
        <div class="filter-bar">
          <label class="search-box">${icon('search')}<input id="webSearch" type="search" placeholder="搜猫名、品种、街区" value="${esc(state.query)}" aria-label="搜索猫名、品种或街区" /></label>
          <div class="filter-pills" aria-label="快捷筛选">
            ${['全部', '亲人', '幼猫', '已绝育', '1km内'].map((x) => `<button class="pill ${state.quick === x ? 'is-active' : ''}" type="button" data-quick="${esc(x)}">${x === '1km内' ? icon('pin') : ''}${esc(x)}</button>`).join('')}
          </div>
          <button class="filter-toggle ${filtered ? 'has-filter' : ''}" type="button" data-action="filters">${icon('sliders')}筛选${filtered ? ' · ' + countActiveFilters() : ''}</button>
        </div>
        <div class="cat-mosaic" id="webCatGrid">
          ${list.length ? list.map((cat, i) => catTile(cat, i)).join('') : emptyCatsWeb()}
        </div>
        <div class="load-more-row"><button class="load-more" type="button" data-action="reset-filters">${icon('sliders')}换个条件再看看</button></div>
      </div>
      <aside class="discover-rail">
        ${miniMap()}
        <div class="rail-section"><div class="rail-section-head"><h3>邻里刚写的</h3><button type="button" data-page="community">去广场 ${icon('arrow-up-right')}</button></div>${railPosts()}</div>
        <div class="rail-section"><div class="rail-section-head"><h3>去过的人说</h3><button type="button" data-page="services">全部好店 ${icon('arrow-up-right')}</button></div>${railServices()}</div>
      </aside>
    </section>`;
}

/* 07-homehelpers.js */
function countActiveFilters() {
  let n = 0;
  Object.entries(state.filters).forEach(([k, v]) => {
    if (k === 'distance') { if (Number(v) !== DISTANCE_DEFAULT) n += 1; return; }
    if (k === 'citywide') { if (v === true) n += 1; return; }
    if (v !== '全部') n += 1;
  });
  return n;
}

function emptyCatsWeb() {
  return `<div class="empty-state-web" style="grid-column:1/-1">${icon('cat')}<h3>这一带暂时没有匹配的猫</h3><p>试试放宽距离或品种。<br />没有结果不代表没有猫，可能只是还没被看见。</p><button type="button" data-action="reset-filters">清空筛选</button></div>`;
}

/* 08-map.js */
function bigMapSvg() {
  return `<svg viewBox="0 0 700 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="700" height="540" fill="#e8e2d1" />
    <g fill="#f4f0e3" stroke="#d6cebb" stroke-width=".8">
      <rect x="12" y="12" width="130" height="102" /><rect x="154" y="12" width="165" height="102" /><rect x="331" y="12" width="126" height="102" /><rect x="469" y="12" width="219" height="102" />
      <rect x="12" y="128" width="130" height="108" /><rect x="154" y="128" width="165" height="108" /><rect x="331" y="128" width="126" height="108" /><rect x="469" y="128" width="219" height="108" />
      <rect x="12" y="250" width="130" height="121" /><rect x="154" y="250" width="165" height="121" /><rect x="331" y="250" width="126" height="121" /><rect x="469" y="250" width="219" height="121" />
      <rect x="12" y="385" width="130" height="143" /><rect x="154" y="385" width="165" height="143" /><rect x="331" y="385" width="126" height="143" /><rect x="469" y="385" width="219" height="143" />
    </g>
    <path d="M0 245 C114 233, 219 259, 320 241 S477 219, 700 234" fill="none" stroke="#c2d7cc" stroke-width="19" />
    <path d="M0 245 C114 233, 219 259, 320 241 S477 219, 700 234" fill="none" stroke="#f7f3e7" stroke-width="1.7" stroke-dasharray="2 8" />
    <path d="M145 0 C134 75, 166 149, 144 245 S123 376, 159 540" fill="none" stroke="#faf6eb" stroke-width="13" />
    <path d="M145 0 C134 75, 166 149, 144 245 S123 376, 159 540" fill="none" stroke="#d0c7b3" stroke-width=".8" />
    <path d="M0 370 C149 348, 298 388, 700 350" fill="none" stroke="#faf6eb" stroke-width="12" />
    <path d="M520 0 C507 144, 548 254, 514 371 S494 468, 526 540" fill="none" stroke="#faf6eb" stroke-width="10" />
    <g fill="#cbd7cc" opacity=".9"><rect x="492" y="386" width="78" height="63" /><rect x="164" y="260" width="75" height="56" /><rect x="348" y="386" width="63" height="46" /><rect x="482" y="132" width="65" height="51" /></g>
    <g fill="#aabaa9" opacity=".55"><circle cx="82" cy="190" r="19" /><circle cx="108" cy="218" r="13" /><circle cx="531" cy="198" r="21" /><circle cx="594" cy="214" r="13" /><circle cx="405" cy="319" r="17" /><circle cx="235" cy="449" r="16" /></g>
    <g fill="#8d947f" opacity=".72" font-family="DM Mono, monospace" font-size="8" letter-spacing="1.2">
      <text x="27" y="238">WEN ER RD.</text><text x="330" y="366">WEN SAN RD.</text><text x="27" y="357">YILE RD.</text><text x="536" y="486" transform="rotate(-86 536 486)">FENGTAN RD.</text><text x="190" y="63">CUIYUAN</text><text x="250" y="210">GUDANG</text>
    </g>
  </svg>`;
}

/* 09-mapview.js */
function renderMap() {
  const layer = mapLayer();
  return `
    <header class="page-head">
      <div><div class="page-head-kicker">CAT MAP · 翠苑街道</div><h1>猫不在列表里，<br />在<em>街角</em>。</h1><p>点位只公开到街区。看上哪只，先读档案，再联系上报人约一次见面。</p></div>
      <div class="page-head-side"><span>${availableCats().length} CATS PINNED</span><span>1 CLINIC · 1 SHOP · 1 CAFE · 1 WALK</span><span>UPDATED TODAY</span></div>
    </header>
    <div class="map-page-grid">
      <div class="big-map is-live">
        <div id="liveCatMap" class="live-map" aria-label="翠苑与古荡一带的猫口地图"></div>
        
        <div class="big-map-top">
          <div class="map-search">
            ${icon('search')}
            <input id="mapSearchInput" type="search" autocomplete="off" placeholder="搜片区、猫名或品种" aria-label="搜索地图上的猫" />
            <div class="map-search-results" id="mapSearchResults" role="listbox" aria-label="搜索结果" hidden></div>
          </div>
          <button class="filter-toggle" type="button" data-action="reset-map">${icon('locate')}<span>回到中心</span></button>
          <button class="filter-toggle map-toggle" type="button" data-action="open-map-full">${icon('map')}<span>打开大地图</span></button>
        </div>
        <button class="map-open-hit" type="button" data-action="open-map-full" aria-label="双击打开大地图">
          <span class="map-open-hint">${icon('map')}双击打开大地图</span>
        </button>
        <div class="map-layer-switch" role="group" aria-label="切换地图底图">
          ${Object.entries(MAP_TILES).map(([key, item]) => `<button type="button" class="${layer === key ? 'is-active' : ''}" data-map-layer="${key}" title="${esc(item.note)}">${esc(item.label)}</button>`).join('')}
        </div>
        <div class="big-map-label"><span class="map-live-dot"></span>LIVE TILE MAP · 点位已打码到街区</div>
        <div class="map-spot-note">${icon('shield')} 位置由上报人选择到街区</div>
      </div>
      <aside class="map-side">
        <h2 id="mapSideTitle">这一带，${availableCats().length} 只猫</h2>
        <p>沿着文二西路和益乐路，邻居们最近记录到的猫口。点一下地图上的猫脸，或从下面选中一只，地图会带你去它附近。</p>
        <div class="map-region-chip" id="mapRegionChip" hidden></div>
        <div class="map-region-chip is-outlier" id="mapOutlierChip" hidden></div>
        <div class="map-cat-list${state.mapShowAll ? ' is-open' : ''}" id="mapCatList">${availableCats().slice(0, state.mapShowAll ? undefined : 5).map((cat) => `<div class="map-cat-row ${state.selectedCat === cat.id ? 'is-selected' : ''}" data-map-row="${cat.id}"><button class="map-cat-item" type="button" data-map-locate="${cat.id}" aria-label="在地图上查看${esc(cat.name)}"><img src="${photoSrc(cat.photo)}" alt="" /><div><b>${esc(cat.name)}</b><p>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}</p></div><span>${cat.distance}km</span></button><button class="map-cat-open" type="button" data-open-cat="${cat.id}" aria-label="打开${esc(cat.name)}的档案">${icon('arrow-up-right')}</button></div>`).join('')}</div>${availableCats().length > 5 ? `<button type="button" class="map-cat-more" data-action="toggle-cat-list">${state.mapShowAll ? '收起猫列表' : `展开全部 ${availableCats().length} 只`}${icon(state.mapShowAll ? 'chevron' : 'chevron-down')}</button>` : ''}
        </div>
        <div class="map-choice"><h3>不确定从哪只开始？</h3><p>先看“亲人、已绝育、适合新手”的档案，或者去广场读一篇邻里笔记。</p><div class="button-row"><button class="btn btn-small btn-primary" type="button" data-page="home">按条件找猫</button><button class="btn btn-small" type="button" data-page="community">去广场</button></div></div>
      </aside>
    </div>`;
}



/* 10-livemap.js */
const MAP_CENTER = [30.2864, 120.1228];
const MAP_ZOOM = 15;
const MAP_BOUNDS = [[29.7000, 119.5000], [30.9000, 120.8000]];
const MAP_OVERVIEW_ZOOM = 12.4;
const MAP_LAYER_KEY = 'xianmao-map-layer-v1';
const MAP_TILES = {
  amap: {
    label: '高德',
    note: '中文街道 · 推荐',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    options: { subdomains: ['1', '2', '3', '4'], attribution: '© 高德地图', maxZoom: 18 }
  },
  sat: {
    label: '卫星',
    note: '高德影像 · 看地形',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    options: { subdomains: ['1', '2', '3', '4'], attribution: '© 高德地图', maxZoom: 18 }
  }
};

const MAP_SPOTS = [
  { id: 'cuiyuan', label: '翠苑二区 · 南门花坛', lat: 30.2886, lng: 120.1283 },
  { id: 'gudang', label: '古荡新村 · 车棚附近', lat: 30.2839, lng: 120.1196 },
  { id: 'wensan', label: '文三路 · 快递柜一带', lat: 30.2801, lng: 120.1341 },
  { id: 'yile', label: '益乐路 · 早餐店后巷', lat: 30.2922, lng: 120.1208 },
  { id: 'fengtan', label: '丰潭路 · 沿河绿道', lat: 30.2971, lng: 120.1132 },
  { id: 'jialv', label: '嘉绿苑 · 小区车库', lat: 30.2872, lng: 120.1164 },
  { id: 'binjiang', label: '滨江·长河老街 · 河埠头', lat: 30.2087, lng: 120.2112 },
  { id: 'xiaohe', label: '拱墅·小河直街 · 巷口', lat: 30.3218, lng: 120.1401 }
];

let liveMap = null;
const mapPinNodes = new Map();

function buildTileLayer(chosen, map, isFull) {
  const layer = L.tileLayer(chosen.url, Object.assign({ className: 'xianmao-tiles' }, chosen.options));
  let errors = 0;
  let warned = false;
  layer.on('tileerror', () => {
    errors += 1;
    if (warned || errors < 4) return;
    warned = true;
    if (typeof toast === 'function') toast('底图加载不畅，可切换另一张底图');
  });
  layer.addTo(map);
  return layer;
}

function mapLayer() {
  try {
    const saved = localStorage.getItem(MAP_LAYER_KEY);
    if (saved === 'sat' || saved === 'amap') return saved;
  } catch (error) { /* ignore */ }
  return 'amap';
}

function catCoordinates(cat) {
  if (Number.isFinite(cat.lat) && Number.isFinite(cat.lng) && Math.abs(cat.lat) <= 90 && Math.abs(cat.lng) <= 180) {
    return [cat.lat, cat.lng];
  }
  const spot = MAP_SPOTS.find((item) => cat.areaShort && cat.area && cat.area.includes(item.label.split(' · ')[0])) || MAP_SPOTS[0];
  return [spot.lat, spot.lng];
}

function catPinMarkup(cat) {
  const fresh = cat.id.startsWith('pub-');
  return `<span class="map-cat-pin${fresh ? ' is-new' : ''}"><span class="map-cat-ear is-left"></span><span class="map-cat-ear is-right"></span><span class="map-cat-face"><img src="${photoSrc(cat.photo)}" alt="" /></span><span class="map-cat-name">${esc(cat.name)}</span></span>`;
}

function mapPopupMarkup(cat) {
  return `<div class="map-popup">
    <div class="map-popup-photo"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}的照片" /></div>
    <div class="map-popup-body">
      <div class="map-popup-kicker">${esc(cat.areaShort || cat.area)} · ${cat.distance}km</div>
      <h3>${esc(cat.name)} <small>${esc(cat.sex)} · ${esc(cat.age)}</small></h3>
      <p>${esc(cat.note).slice(0, 58)}…</p>
      <button type="button" class="map-popup-link" data-open-cat="${cat.id}">看它的档案 ${icon('arrow-right')}</button>
    </div>
  </div>`;
}

function ensureLiveMap() {
  const host = document.getElementById('liveCatMap');
  if (!host) return null;
  if (typeof L === 'undefined') {
    host.classList.add('is-offline');
    host.innerHTML = `<div class="map-offline"><b>底图暂时没有加载出来</b><span>猫口点位和档案仍然可以查看。请检查网络后刷新。</span></div>`;
    return null;
  }

  if (liveMap && liveMap.getContainer() !== host) {
    liveMap.remove();
    liveMap = null;
    mapPinNodes.clear();
  }

  if (!liveMap) {
    const locked = window.matchMedia('(max-width: 900px)').matches;
    liveMap = L.map(host, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 18,
      scrollWheelZoom: !locked,
      dragging: !locked,
      touchZoom: !locked,
      doubleClickZoom: false,
      wheelDebounceTime: 80,
      wheelPxPerZoomLevel: 90,
      attributionControl: true
    });
    if (!locked) L.control.zoom({ position: 'bottomright' }).addTo(liveMap);
    liveMap.on('zoomend', syncMapDensity);
  }

  if (!liveMap._xianmaoCatLayer) {
    liveMap._xianmaoCatLayer = L.layerGroup().addTo(liveMap);
  }

  if (liveMap._xianmaoLayerKey !== mapLayer()) {
    if (liveMap._xianmaoTileLayer) liveMap.removeLayer(liveMap._xianmaoTileLayer);
    const chosen = MAP_TILES[mapLayer()];
    liveMap._xianmaoTileLayer = buildTileLayer(chosen, liveMap, false);
    liveMap._xianmaoLayerKey = mapLayer();
  }

  liveMap._xianmaoCatLayer.clearLayers();
  mapPinNodes.clear();
  const plotted = [];
  const spread = mapPinSpread(availableCats().map(catCoordinates));
  availableCats().forEach((cat, index) => {
    const coordinates = spread[index];
    plotted.push(coordinates);
    const marker = L.marker(coordinates, {
      icon: L.divIcon({ className: 'map-cat-marker', html: catPinMarkup(cat), iconSize: [72, 88], iconAnchor: [36, 78], popupAnchor: [0, -72] }),
      title: `${cat.name} · ${cat.areaShort}`,
      riseOnHover: true
    });
    marker.bindPopup(mapPopupMarkup(cat), { className: 'xianmao-map-popup', maxWidth: 300, closeButton: true, autoPanPadding: [36, 36] });
    marker.addTo(liveMap._xianmaoCatLayer);
    const node = marker.getElement();
    if (node) {
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `查看${cat.name}的猫口档案`);
      mapPinNodes.set(cat.id, node);
    }
    marker.on('click', (event) => {
      if (typeof L !== 'undefined' && L.DomEvent) L.DomEvent.stopPropagation(event);
      state.selectedCat = cat.id;
      highlightMapCat(cat.id);
      const row = document.querySelector(`[data-map-row="${cat.id}"]`);
      if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (window.matchMedia('(max-width: 900px)').matches) {
        const mapHost = document.getElementById('liveCatMap');
        if (mapHost && mapHost.classList.contains('is-unlocked')) marker.openPopup();
        else catModal();
      } else {
        marker.openPopup();
      }
    });
  });
  if (!liveMap._xianmaoFitted) {
    fitMainCluster(liveMap, availableCats(), 34);
    liveMap._xianmaoFitted = true;
  }
  syncMapDensity();
  return liveMap;
}

function mapDensestCluster(cats) {
  const points = cats.map((cat) => ({ cat, p: catCoordinates(cat) }));
  if (points.length < 2) return { main: points, outliers: [] };
  let best = null;
  points.forEach((base) => {
    const near = points.filter((item) => {
      const dLat = (item.p[0] - base.p[0]) * 111;
      const dLng = (item.p[1] - base.p[1]) * 96;
      return Math.sqrt(dLat * dLat + dLng * dLng) <= 6;
    });
    if (!best || near.length > best.length) best = near;
  });
  const mainIds = new Set(best.map((item) => item.cat.id));
  return { main: best, outliers: points.filter((item) => !mainIds.has(item.cat.id)) };
}

function fitMainCluster(map, cats, pad) {
  const { main, outliers } = mapDensestCluster(cats);
  const points = (main.length ? main : cats.map((cat) => ({ cat, p: catCoordinates(cat) }))).map((item) => item.p);
  if (points.length > 1) map.fitBounds(points, { padding: [pad, pad], maxZoom: 15, animate: false });
  else if (points.length === 1) map.setView(points[0], 16, { animate: false });
  syncMapOutlierChip(outliers);
  return outliers;
}

function syncMapOutlierChip(outliers) {
  const chip = document.getElementById('mapOutlierChip');
  if (!chip) return;
  if (!outliers || !outliers.length) { chip.hidden = true; chip.innerHTML = ''; return; }
  chip.hidden = false;
  const names = outliers.map((item) => item.cat.areaShort || item.cat.area).join(' / ');
  chip.innerHTML = `<span>另有 ${outliers.length} 只在 ${esc(names)}</span><button type="button" data-map-outliers>看这几只</button>`;
}

function mapPinSpread(points) {
  const placed = [];
  return points.map((point) => {
    let [lat, lng] = point;
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const clash = placed.some(([otherLat, otherLng]) => Math.abs(otherLat - lat) < 0.0075 && Math.abs(otherLng - lng) < 0.0095);
      if (!clash) break;
      const angle = attempt * 2.399963;
      const radius = 0.0032 + attempt * 0.0016;
      lat = point[0] + Math.sin(angle) * radius;
      lng = point[1] + Math.cos(angle) * radius * 1.25;
    }
    placed.push([lat, lng]);
    return [lat, lng];
  });
}

function syncMapDensity() {
  if (!liveMap) return;
  const zoom = liveMap.getZoom();
  const host = liveMap.getContainer();
  host.classList.toggle('is-zoomed-out', zoom < MAP_ZOOM);
  host.classList.toggle('is-zoomed-far', zoom <= MAP_OVERVIEW_ZOOM);
  // further away than the province: shrink pins into dots so they do not pile up
  host.classList.toggle('is-zoomed-province', zoom <= 9);
  host.classList.toggle('is-zoomed-country', zoom <= 6);
}

function highlightMapCat(id) {
  mapPinNodes.forEach((node, catId) => node.classList.toggle('is-selected', catId === id));
  $$('[data-map-row]').forEach((item) => item.classList.toggle('is-selected', item.dataset.mapRow === id));
}

function setMapLayer(kind) {
  if (!MAP_TILES[kind]) return;
  try { localStorage.setItem(MAP_LAYER_KEY, kind); } catch (error) { /* ignore */ }
  ensureLiveMap();
  $$('[data-map-layer]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.mapLayer === kind));
  toast(`已切换到 ${MAP_TILES[kind].label}底图`);
}

function isMapAttached(map) {
  return Boolean(map && map.getContainer && document.body.contains(map.getContainer()));
}

function resetMapView() {
  if (!liveMap) return;
  const map = liveMap;
  const { main, outliers } = mapDensestCluster(availableCats());
  const points = (main.length ? main : availableCats().map((cat) => ({ cat, p: catCoordinates(cat) }))).map((item) => item.p);
  if (points.length > 1) liveMap.flyToBounds(points, { padding: [34, 34], maxZoom: 15, duration: 0.6 });
  else if (points.length === 1) liveMap.flyTo(points[0], 16, { duration: 0.6 });
  else liveMap.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 0.6 });
  syncMapOutlierChip(outliers);
  setTimeout(() => { if (liveMap === map && isMapAttached(map)) map.invalidateSize(); }, 280);
}

function locateCatOnMap(id) {
  const cat = catById(id);
  if (!liveMap || !cat) return;
  state.selectedCat = id;
  highlightMapCat(id);
  const coordinates = catCoordinates(cat);
  liveMap.flyTo(coordinates, 17, { duration: 0.55 });
  setTimeout(() => {
    if (!isMapAttached(liveMap)) return;
    const layer = liveMap._xianmaoCatLayer;
    if (!layer) return;
    layer.eachLayer((marker) => {
      if (marker.options.title && marker.options.title.startsWith(cat.name + ' ')) marker.openPopup();
    });
    highlightMapCat(cat.id);
  }, 650);
}



/* ---------- Fullscreen map ---------- */
let fullMap = null;

function ensureFullMap() {
  const host = document.getElementById('fullCatMap');
  if (!host || typeof L === 'undefined') return null;
  if (fullMap && fullMap.getContainer() !== host) {
    fullMap.remove();
    fullMap = null;
  }
  if (!fullMap) {
    const layerKey = mapLayer();
    fullMap = L.map(host, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
      worldCopyJump: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: false,
      tap: true,
      attributionControl: true
    });
    L.control.zoom({ position: 'bottomright' }).addTo(fullMap);
    const chosen = MAP_TILES[layerKey];
    fullMap._xianmaoTileLayer = buildTileLayer(chosen, fullMap, true);
    fullMap.on('zoomend', () => {
      const z = fullMap.getZoom();
      fullMap.getContainer().classList.toggle('is-zoomed-out', z < MAP_ZOOM);
      fullMap.getContainer().classList.toggle('is-zoomed-far', z <= MAP_OVERVIEW_ZOOM);
    });
  }
  const catKey = availableCats().map((cat) => cat.id).join(',');
  if (fullMap._xianmaoCatKey === catKey) return fullMap;
  fullMap._xianmaoCatKey = catKey;
  fullMap.eachLayer((layer) => {
    if (layer instanceof L.Marker) fullMap.removeLayer(layer);
  });
  const plotted = [];
  const cats = availableCats();
  const spread = mapPinSpread(cats.map(catCoordinates));
  cats.forEach((cat, index) => {
    const coordinates = spread[index];
    plotted.push(coordinates);
    const marker = L.marker(coordinates, {
      icon: L.divIcon({ className: 'map-cat-marker', html: catPinMarkup(cat), iconSize: [72, 88], iconAnchor: [36, 78], popupAnchor: [0, -72] }),
      title: cat.name + ' · ' + cat.areaShort,
      riseOnHover: true
    });
    marker.bindPopup(mapPopupMarkup(cat), { className: 'xianmao-map-popup', maxWidth: 300, closeButton: true, autoPanPadding: [36, 36] });
    marker.addTo(fullMap);
    marker.on('click', () => {
      state.selectedCat = cat.id;
    });
  });
  if (!fullMap._xianmaoFitted && plotted.length > 1) {
    fullMap.fitBounds(plotted, { padding: [40, 40], maxZoom: MAP_OVERVIEW_ZOOM, animate: false });
    fullMap._xianmaoFitted = true;
  }
  return fullMap;
}

let fullMapLastFocus = null;

function openFullMap() {
  const overlay = document.getElementById('fullMapOverlay');
  if (!overlay) return;
  fullMapLastFocus = document.activeElement;
  overlay.removeAttribute('inert');
  overlay.classList.add('is-open');
  document.body.classList.add('full-map-open');
  const active = mapLayer();
  document.querySelectorAll('#fullMapOverlay [data-full-layer]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.fullLayer === active));
  const map = ensureFullMap();
  if (map) setTimeout(() => { if (fullMap === map) map.invalidateSize(); }, 60);
  const closeBtn = overlay.querySelector('.full-map-close');
  if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 80);
}

function closeFullMap() {
  const overlay = document.getElementById('fullMapOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('inert', '');
  document.body.classList.remove('full-map-open');
  if (fullMapLastFocus && document.contains(fullMapLastFocus) && fullMapLastFocus.focus) {
    fullMapLastFocus.focus({ preventScroll: true });
  }
  fullMapLastFocus = null;
}

function switchFullMapLayer(kind) {
  if (!fullMap || !MAP_TILES[kind]) return;
  try { localStorage.setItem(MAP_LAYER_KEY, kind); } catch (error) { /* ignore */ }
  if (fullMap._xianmaoTileLayer) fullMap.removeLayer(fullMap._xianmaoTileLayer);
  const chosen = MAP_TILES[kind];
  fullMap._xianmaoTileLayer = buildTileLayer(chosen, fullMap, true);
  document.querySelectorAll('#fullMapOverlay [data-full-layer]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.fullLayer === kind));
}

let inlineMapTap = 0;

function bindInlineMapOpen(host) {
  if (!host || host.dataset.dblBound === '1') return;
  host.dataset.dblBound = '1';

  // Double click anywhere on the inline map opens the full map (mobile + desktop).
  host.addEventListener('dblclick', (event) => {
    if (event.target.closest('.map-cat-marker, .leaflet-control, .leaflet-popup')) return;
    event.preventDefault();
    event.stopPropagation();
    openFullMap();
  }, true);

  // Mobile: keep the tap-pair fallback because dblclick is unreliable on touch.
  host.addEventListener('click', (event) => {
    if (!window.matchMedia('(max-width: 900px)').matches) return;
    if (event.target.closest('.map-cat-marker, .leaflet-control, .leaflet-popup')) return;
    const now = Date.now();
    if (now - inlineMapTap < 400) { inlineMapTap = 0; openFullMap(); }
    else inlineMapTap = now;
  });
}

/* ---------- Map search: region first, cat fallback ---------- */
let mapSearchIndex = -1;
let activeMapRegion = null;

function mapRegionKey(cat) {
  return (cat.areaShort || cat.area || '未标注').trim();
}

function mapRegionGroups(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const groups = new Map();
  availableCats().forEach((cat) => {
    const key = mapRegionKey(cat);
    const haystack = [key, cat.area || ''].join(' ').toLowerCase();
    if (!haystack.includes(q)) return;
    if (!groups.has(key)) groups.set(key, { key, cats: [], points: [] });
    const group = groups.get(key);
    group.cats.push(cat);
    group.points.push(mapSearchPoint(cat));
  });
  return [...groups.values()]
    .sort((a, b) => b.cats.length - a.cats.length)
    .slice(0, 6);
}

function mapMergedGroup(regions, query) {
  if (regions.length < 2) return null;
  // keep only regions that cluster together (within ~6km of the densest one)
  const withCentroid = regions.map((g) => ({
    ...g,
    lat: g.points.reduce((sum, p) => sum + p[0], 0) / g.points.length,
    lng: g.points.reduce((sum, p) => sum + p[1], 0) / g.points.length
  }));
  let best = null;
  withCentroid.forEach((base) => {
    const near = withCentroid.filter((g) => {
      const dLat = (g.lat - base.lat) * 111;
      const dLng = (g.lng - base.lng) * 96;
      return Math.sqrt(dLat * dLat + dLng * dLng) <= 6;
    });
    if (!best || near.length > best.length) best = near;
  });
  if (!best || best.length < 2) return null;
  const cats = [];
  const points = [];
  best.forEach((g) => { g.cats.forEach((c) => cats.push(c)); g.points.forEach((p) => points.push(p)); });
  return { key: '__merged__', label: `「${query}」${best.length} 个片区`, cats, points, regions: best };
}

function mapSearchPoint(cat) {
  const coords = catCoordinates(cat);
  return [coords[0], coords[1]];
}

function mapCatMatches(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  return availableCats().filter((cat) => {
    const hay = [cat.name, cat.breed, cat.color, cat.areaShort, cat.area, cat.age, cat.sex]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  }).slice(0, 8);
}

function mapSearchRender(query) {
  const box = document.getElementById('mapSearchResults');
  if (!box) return;
  mapSearchIndex = -1;
  const q = String(query || '').trim();
  if (!q) { box.hidden = true; box.innerHTML = ''; return; }

  const regions = mapRegionGroups(q);
  const merged = mapMergedGroup(regions, q);
  const cats = mapCatMatches(q);
  const rows = [];

  if (merged) {
    rows.push(`<button type="button" class="map-search-item is-region is-merged" role="option" data-map-region="__merged__">
      <span class="map-search-region-badge">${merged.cats.length}</span>
      <span class="map-search-text"><b>「${esc(q)}」这 ${merged.regions.length} 个片区</b><i>${merged.regions.map((r) => esc(r.key)).join('、').slice(0, 30)}</i></span>
      <span class="map-search-area">合并看</span>
    </button>`);
  }

  if (regions.length) {
    rows.push('<div class="map-search-group">片区 · 点击圈出这一带</div>');
    regions.forEach((group) => {
      rows.push(`<button type="button" class="map-search-item is-region" role="option" data-map-region="${esc(group.key)}">
        <span class="map-search-region-badge">${group.cats.length}</span>
        <span class="map-search-text"><b>${esc(group.key)}</b><i>${group.cats.map((c) => esc(c.name)).join('、').slice(0, 26)}</i></span>
        <span class="map-search-area">${group.points.length > 1 ? group.points.length + ' 个点位' : '这一带'}</span>
      </button>`);
    });
  }

  if (cats.length && !regions.length) {
    rows.push('<div class="map-search-group">单只猫</div>');
    cats.forEach((cat) => {
      rows.push(`<button type="button" class="map-search-item" role="option" data-map-search-pick="${cat.id}">
        <img src="${photoSrc(cat.photo)}" alt="" />
        <span class="map-search-text"><b>${esc(cat.name)}</b><i>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}${cat.color ? ' · ' + esc(cat.color) : ''}</i></span>
        <span class="map-search-area">${esc(mapRegionKey(cat))}</span>
      </button>`);
    });
  }

  if (!rows.length) {
    box.hidden = false;
    box.innerHTML = '<div class="map-search-empty">没有匹配的片区或猫，换个关键词试试</div>';
    return;
  }
  box.hidden = false;
  box.innerHTML = rows.join('');
}

function clearMapRegion() {
  activeMapRegion = null;
  const chip = document.getElementById('mapRegionChip');
  if (chip) { chip.hidden = true; chip.innerHTML = ''; }
  if (liveMap && liveMap._xianmaoCatLayer) liveMap._xianmaoCatLayer.clearLayers();
  if (liveMap) {
    mapPinNodes.clear();
    const spread = mapPinSpread(availableCats().map(catCoordinates));
    availableCats().forEach((cat, index) => {
      const marker = mapMarkerFor(cat, spread[index]);
      marker.addTo(liveMap._xianmaoCatLayer);
      mapPinNodes.set(cat.id, marker.getElement());
    });
  }
  const title = document.getElementById('mapSideTitle');
  if (title) title.textContent = `这一带，${availableCats().length} 只猫`;
}

function mapMarkerFor(cat, coordinates) {
  const marker = L.marker(coordinates, {
    icon: L.divIcon({ className: 'map-cat-marker', html: catPinMarkup(cat), iconSize: [72, 88], iconAnchor: [36, 78], popupAnchor: [0, -72] }),
    title: `${cat.name} · ${cat.areaShort}`,
    riseOnHover: true
  });
  marker.bindPopup(mapPopupMarkup(cat), { className: 'xianmao-map-popup', maxWidth: 300, closeButton: true, autoPanPadding: [36, 36] });
  marker.on('click', (event) => {
    if (typeof L !== 'undefined' && L.DomEvent) L.DomEvent.stopPropagation(event);
    state.selectedCat = cat.id;
    highlightMapCat(cat.id);
    const row = document.querySelector(`[data-map-row="${cat.id}"]`);
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    marker.openPopup();
  });
  return marker;
}

function focusMapRegion(key) {
  if (!liveMap) return;
  let group;
  let label;
  if (key === '__merged__') {
    const q = (document.getElementById('mapSearchInput') || {}).value || '';
    const merged = mapMergedGroup(mapRegionGroups(q), q);
    if (!merged) return;
    group = merged.cats;
    label = merged.label;
  } else {
    group = availableCats().filter((cat) => mapRegionKey(cat) === key);
    label = key;
  }
  if (!group.length) return;
  activeMapRegion = key;

  const points = group.map(mapSearchPoint);
  const bounds = L.latLngBounds(points);
  liveMap.flyToBounds(bounds.pad(0.35), { maxZoom: 16, duration: 0.6 });

  liveMap._xianmaoCatLayer.clearLayers();
  mapPinNodes.clear();
  const spread = mapPinSpread(points);
  group.forEach((cat, index) => {
    const marker = mapMarkerFor(cat, spread[index]);
    marker.addTo(liveMap._xianmaoCatLayer);
    mapPinNodes.set(cat.id, marker.getElement());
  });

  const chip = document.getElementById('mapRegionChip');
  if (chip) {
    chip.hidden = false;
    chip.innerHTML = `<span>正在看：${esc(label)} · ${group.length} 只</span><button type="button" data-clear-map-region>显示全部</button>`;
  }
  const title = document.getElementById('mapSideTitle');
  if (title) title.textContent = `${label}，${group.length} 只猫`;

  renderMapSideList(group);

  const input = document.getElementById('mapSearchInput');
  if (input) input.value = label;
  const box = document.getElementById('mapSearchResults');
  if (box) { box.hidden = true; box.innerHTML = ''; }
}

function renderMapSideList(list) {
  const host = document.getElementById('mapCatList');
  if (!host) return;
  host.classList.toggle('is-open', true);
  host.innerHTML = list.map((cat) => `<div class="map-cat-row" data-map-row="${cat.id}"><button class="map-cat-item" type="button" data-map-locate="${cat.id}" aria-label="在地图上查看${esc(cat.name)}"><img src="${photoSrc(cat.photo)}" alt="" /><div><b>${esc(cat.name)}</b><p>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}</p></div><span>${cat.distance}km</span></button><button class="map-cat-open" type="button" data-open-cat="${cat.id}" aria-label="打开${esc(cat.name)}的档案">${icon('arrow-up-right')}</button></div>`).join('');
}

function pickMapSearch(id) {
  const cat = catById(id);
  if (!cat) return;
  const input = document.getElementById('mapSearchInput');
  if (input) input.value = cat.name;
  const box = document.getElementById('mapSearchResults');
  if (box) { box.hidden = true; box.innerHTML = ''; }
  locateCatOnMap(id);
  const row = document.querySelector(`[data-map-row="${id}"]`);
  if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function bindMapSearch() {
  const input = document.getElementById('mapSearchInput');
  const box = document.getElementById('mapSearchResults');
  if (!input || input.dataset.bound === '1') return;
  input.dataset.bound = '1';

  input.addEventListener('input', () => mapSearchRender(input.value));

  input.addEventListener('keydown', (event) => {
    const items = box ? [...box.querySelectorAll('[data-map-region], [data-map-search-pick]')] : [];
    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();
      mapSearchIndex = (mapSearchIndex + 1) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-active', i === mapSearchIndex));
    } else if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault();
      mapSearchIndex = (mapSearchIndex - 1 + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-active', i === mapSearchIndex));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = items[mapSearchIndex] || items[0];
      if (target) {
        if (target.dataset.mapRegion) focusMapRegion(target.dataset.mapRegion);
        else pickMapSearch(target.dataset.mapSearchPick);
      }
    } else if (event.key === 'Escape') {
      if (box) { box.hidden = true; box.innerHTML = ''; }
      input.blur();
    }
  });

  if (box) {
    box.addEventListener('mousedown', (event) => {
      const region = event.target.closest('[data-map-region]');
      const cat = event.target.closest('[data-map-search-pick]');
      if (region) { event.preventDefault(); focusMapRegion(region.dataset.mapRegion); }
      else if (cat) { event.preventDefault(); pickMapSearch(cat.dataset.mapSearchPick); }
    });
  }

  document.addEventListener('click', (event) => {
    const clear = event.target.closest('[data-clear-map-region]');
    if (clear) { clearMapRegion(); renderApp(); return; }
    const outliers = event.target.closest('[data-map-outliers]');
    if (outliers) {
      const { outliers: far } = mapDensestCluster(availableCats());
      if (!far.length || !liveMap) return;
      const points = far.map((item) => item.p);
      liveMap.flyToBounds(L.latLngBounds(points).pad(0.6), { maxZoom: 14, duration: 0.6 });
      return;
    }
    if (!event.target.closest('.map-search')) {
      const b = document.getElementById('mapSearchResults');
      if (b) b.hidden = true;
    }
  });
}

function initLiveMap() {
  if (state.page !== 'map') {
    if (liveMap) { liveMap.remove(); liveMap = null; mapPinNodes.clear(); }
    return;
  }
  const map = ensureLiveMap();
  if (!map) return;
  bindInlineMapOpen(document.getElementById('liveCatMap'));
  bindMapSearch();
  setTimeout(() => { if (liveMap === map && isMapAttached(map)) map.invalidateSize(); }, 80);
}





/* 10-publish.js */
function renderPublish() {
  const p = state.publish;
  const sel = (key, val) => p[key] === val ? 'is-active' : '';
  const slotPhoto = (index) => p.photos[index] || null;
  return `
    <header class="page-head">
      <div><div class="page-head-kicker">REPORT A CAT · 上报一只猫</div><h1>替它留一个<br /><em>名字</em>。</h1><p>不需要很完整。一张照片、一个大致位置，就足够让关心它的人找到它。请勿公开精确门牌号。</p></div>
      <div class="page-head-side"><span>NO ACCOUNT NEEDED</span><span>REVIEW IN 48 HOURS</span><span>NEIGHBOR VERIFIED</span></div>
    </header>
    <div class="publish-layout">
      <div class="publish-form-panel">
        <form id="webPublishForm">
          <div class="form-card">
            <div class="form-card-head"><span class="num">01</span><h2>先给它一张照片</h2><small>最多 3 张</small></div>
            <div class="photo-grid">
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="0">${slotPhoto(0) ? `<img src="${photoSrc(slotPhoto(0))}" alt="已选择的猫照片" /><span class="photo-badge">主图</span><span class="change-photo">更换</span>` : `${icon('camera')}<span>添加照片</span>`}</button>
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="1">${slotPhoto(1) ? `<img src="${photoSrc(slotPhoto(1))}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('plus')}<span>补充</span>`}</button>
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="2">${slotPhoto(2) ? `<img src="${photoSrc(slotPhoto(2))}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('image')}<span>环境</span>`}</button>
            </div>
            <p class="photo-note">尽量拍清楚毛色和体型。不要开闪光灯，不要为了拍照追赶它。</p>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">02</span><h2>它是谁</h2><small>不知道也可以留空</small></div>
            <div class="form-field"><label for="webPubName">你给它的称呼</label><input class="input" id="webPubName" name="name" placeholder="比如：南门小橘" value="${esc(p.name)}" /></div>
            <div class="form-row">
              <div class="form-field"><label for="webPubBreed">品种</label><div class="select-wrap"><select class="select" id="webPubBreed" name="breed">${['中华田园猫', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫', '英短', '美短', '布偶猫', '暹罗猫', '缅因猫', '加菲猫', '折耳猫', '银渐层', '金渐层', '混血 / 不确定'].map((v) => `<option ${p.breed === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
              <div class="form-field"><label for="webPubAge">月龄 / 年龄</label><div class="select-wrap"><select class="select" id="webPubAge" name="age">${['0–1 个月', '1–3 个月', '3–12 个月', '1–3 岁', '3 岁以上', '不确定'].map((v) => `<option ${p.age === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
            </div>
            <p class="field-help">${icon('paw')}按能确认的阶段选就好。幼猫月龄变化快，拿不准时选“不确定”。</p>
            <div class="form-field"><label>性别</label><div class="seg">${['公', '母', '不确定'].map((v) => `<button type="button" class="${sel('sex', v)}" data-pub-seg="sex" data-value="${v}">${v}</button>`).join('')}</div></div>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">03</span><h2>在哪里遇见</h2><small>只公开到街区</small></div>
            <div class="form-field"><label for="webPubArea">大致位置</label><input class="input" id="webPubArea" name="area" placeholder="比如：翠苑二区南门花坛" value="${esc(p.area)}" /></div>
            <div class="form-field"><label>地图上的落点<small>拖动地图，把中央图钉对准位置；或选常用落点</small></label><div id="webPubPickerHost" class="spot-picker"></div><p class="spot-picker-readout" id="webPubPickerHostReadout"></p><div class="spot-chips">${MAP_SPOTS.map((spot) => `<button type="button" class="spot-chip" data-picker-spot="${spot.id}">${esc(spot.label)}</button>`).join('')}</div><p class="field-help">${icon('pin')}只精确到小区或路口，不会公开具体门牌。</p></div>
            <div class="toggle-row"><button class="toggle ${p.sterilized ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="sterilized" aria-label="切换绝育状态"></button><p>看起来已绝育（有耳标或剪耳）</p></div>
            <div class="toggle-row"><button class="toggle ${p.friendly ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="friendly" aria-label="切换亲人状态"></button><p>比较亲人，可以靠近</p></div>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">04</span><h2>想补充的话</h2><small>可选</small></div>
            <div class="form-field"><label for="webPubNote">它的状态、习惯，或你担心的事</label><textarea class="textarea" id="webPubNote" name="note" placeholder="比如：每天都在花坛边，看到人会蹭过来，但不太敢进楼道。">${esc(p.note)}</textarea></div>
          </div>
          <div class="submit-bar"><p class="privacy-note">${icon('shield')} 请勿公开精确门牌号。上报后会经过邻里核验，通过后出现在附近发现与地图中。</p><button class="btn btn-primary" type="submit">${icon('send')}提交上报</button></div>
        </form>
      </div>
      <aside class="publish-aside"><div class="aside-sticky">
        <div class="preview-card" id="webPublishPreview">${publishPreview(p)}</div>
        <div class="aside-tips"><h3>上报前，先确认三件事</h3><ul><li>照片是最近拍的，能看清毛色和体型。</li><li>位置写到小区或街道即可，不要写门牌。</li><li>如果猫受伤、怀孕或带崽，请直接联系群护队。</li></ul></div>
        <div class="stamp-note"><i></i>NO TRADE · NO RESELL · MEET FIRST</div>
      </div></aside>
    </div>`;
}

/* 11-community.js */
function renderCommunity() {
  const filters = ['全部', '捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '猫友同路', '领养回访'];
  const posts = allPosts();
  const list = state.communityFilter === '全部' ? posts : posts.filter((p) => p.tag === state.communityFilter);
  const hot = list.find((p) => p.featured) || list[0];
  return `
    <header class="page-head">
      <div><div class="page-head-kicker">FIELD NOTES · 邻里经验</div><h1>猫的事，<br /><em>大家的事。</em></h1><p>养猫经验、捉猫实录、就医体验、猫咖打卡、遛猫路线和猫友同路。真实经验比广告更有用，也比“我觉得”更可靠。</p></div>
      <div class="community-share-row"><button class="btn is-primary" type="button" data-action="add-walk-place">${icon('pin')}分享遛猫地点</button><button class="btn" type="button" data-action="compose-companion">${icon('paw')}找猫友同路</button><button class="btn" type="button" data-action="compose">${icon('edit')}写一条</button></div>
    </header>
    <div class="community-page-grid">
      <div class="community-page-main">
        <div class="community-top-tabs" aria-label="广场分类"><span class="community-top-label">看哪一类</span>${filters.map((f) => `<button class="pill ${state.communityFilter === f ? 'is-active' : ''}" type="button" data-community-filter="${f}">${f}</button>`).join('')}</div>
        <div class="companion-banner"><div><span class="kicker">WALK TOGETHER · 猫友同路</span><h3>找一只脾气合得来的散步搭子</h3><p>先约在公开、人少的遛猫地点。用推车或背包让两只猫隔着距离观察，不交换住址和私人电话。</p></div><button class="btn btn-small" type="button" data-action="compose-companion">${icon('paw')}发起同路邀请</button></div>
        ${hot ? `<button class="hot-story" type="button" data-open-post="${hot.id}"><div>${hot.image ? `<img src="${photoSrc(hot.image)}" alt="${esc(hot.title)}" />` : ''}</div><div class="hot-story-body"><div class="hot-story-meta"><span>本周邻里热帖 · 01</span><span>1.2K READS</span></div><h2>${esc(hot.title)}</h2><p>${esc(hot.excerpt)}</p><div class="hot-story-footer"><span>${esc(hot.author)} · ${esc(hot.place)}</span>${icon('arrow-up-right')}</div></div></button>` : ''}
        <div class="feed">${list.map((post) => feedPost(post)).join('')}</div>
      </div>
      <aside class="community-aside">
        <div class="aside-editorial"><div class="kicker">EDITOR'S NOTE · 闲猫编辑部</div><h3>经验不必完美，<br />真实就够。</h3><p>你可以写一次失败的捕捉、一次需要提醒的就医经历，或一条人少好走的遛猫路线。请隐去门牌和个人电话，把判断留给后来的人。</p><button type="button" data-action="compose">写下你的邻里笔记 ${icon('arrow-up-right')}</button></div>
        <div class="rail-section" style="margin-top:28px"><div class="rail-section-head"><h3>附近的猫</h3><button type="button" data-page="home">全部 ${icon('arrow-up-right')}</button></div>${availableCats().slice(0,3).map((cat) => `<button class="service-mini" type="button" data-open-cat="${cat.id}"><span class="service-mini-icon" style="padding:0;overflow:hidden"><img src="${photoSrc(cat.photo)}" alt="" style="width:100%;height:100%;object-fit:cover" /></span><div><b>${esc(cat.name)}</b><span>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.areaShort)}</span></div>${icon('chevron')}</button>`).join('')}</div>
        <div class="rail-section"><div class="rail-section-head"><h3>去过的店</h3><button type="button" data-page="services">全部 ${icon('arrow-up-right')}</button></div>${railServices()}</div>
      </aside>
    </div>`;
}

/* 12-feed.js */
function feedPost(post) {
  return `
    <article class="feed-post">
      <div class="feed-post-head">${contributorAvatar(post.author, post.avatar, post.tone)}<div class="feed-post-author"><b>${esc(post.author)}</b><span>${esc(post.time)} · ${esc(post.place)}</span><small class="contributor-line">${contributorBadge(post.author, true)}</small></div><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span></div>
      <div data-open-post="${post.id}" tabindex="0" role="button" aria-label="阅读 ${esc(post.title)}">
        <h3>${esc(post.title)}</h3>
        <p class="feed-excerpt">${esc(post.excerpt)}</p>
      </div>
      <div class="feed-post-foot"><button class="feed-stat ${isLiked(post) ? 'is-liked' : ''}" type="button" data-like-post="${post.id}" aria-label="${isLiked(post) ? '取消点赞' : '点赞'}" aria-pressed="${isLiked(post)}">${icon('heart')}<span>${postLikes(post)}</span></button><button class="feed-stat" type="button" data-open-post="${post.id}">${icon('square')}<span>${postCommentCount(post)}</span></button><span class="place">${icon('pin')}${esc(post.place)}</span></div>
    </article>`;
}

/* 13-services.js */
function serviceTile(s) {
  return `<article class="service-tile">
    <button class="service-tile-open" type="button" data-open-service="${s.id}" aria-label="查看 ${esc(s.name)}">
    <div class="service-tile-top"><span class="service-tile-icon ${s.markClass}">${icon(s.icon.replace('i-', ''))}</span><div style="flex:1"><h2>${esc(s.name)}</h2><div class="service-tile-sub">${esc(s.sub)}</div></div><span class="service-tile-score">${icon('star')}${s.rating}</span></div>
    ${s.photos && s.photos.length ? `<div class="service-tile-photo"><img src="${photoSrc(s.photos[0])}" alt="${esc(s.name)} 的环境照片" /></div>` : ''}
    <div class="service-tile-tags">${s.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="service-tile-bottom"><span class="open">${serviceTypeLabel(s.type)}</span><span>${esc(s.hours)}</span><span>· ${s.distance}km</span><span class="arrow">${icon('arrow-up-right')}</span></div>
    </button>
    ${s.type === '遛猫的地方' ? `<button class="service-tile-companion" type="button" data-action="compose-companion" data-place="${esc(s.name)}">${icon('paw')}在这里找猫友同路</button>` : ''}
  </article>`;
}

function photoSrc(photo) {
  return /^(data:|https?:)/.test(photo || '') ? photo : A + photo;
}

/* 14-servicesview.js */
function renderServices() {
  const filters = sharedPlaceCategories();
  const all = allPlaces();
  const list = state.servicesFilter === '全部' ? all : all.filter((s) => serviceTypeLabel(s.type) === state.servicesFilter || s.type === state.servicesFilter);
  return `
    <header class="services-page-head">
      <div><div class="page-head-kicker">NEIGHBORHOOD PICKS · 邻里亲测</div><h1>街角那些<br /><em>值得说说的地方。</em></h1><p>医院、猫粮、猫咖，还有适合牵绳散步、推车出门的遛猫地点。不是广告位，是邻居们真的去过、愿意再去的地方。收录不收费，不同的真实体验都会保留。</p></div>
      <div class="stats"><div><b>4.7</b><span>平均评分</span></div><div><b>476</b><span>条真实评价</span></div><div><b>${all.length}</b><span>处已收录</span></div></div>
    </header>
    <div class="service-filters"><div class="button-row">${filters.map((f) => `<button class="pill ${state.servicesFilter === f ? 'is-active' : ''}" type="button" data-service-filter="${f}">${f}</button>`).join('')}</div><div class="service-filter-actions"><button class="btn btn-small" type="button" data-action="add-walk-place">${icon('tree')}分享遛猫地点</button><button class="btn btn-small" type="button" data-action="recommend-service">${icon('plus')}推荐一家</button></div></div>
    <div class="service-grid">${list.map(serviceTile).join('')}</div>
    <div class="service-legend">${icon('shield')}收录不收取费用。评分保留不同体验，商家可公开回复，但不能删除评价。遛猫地点建议补充环境、路面、牵绳与错峰时段，方便别人自行判断。</div>`;
}

/* 15-servicedetail.js */
function renderServiceDetail() {
  const s = allPlaces().find((item) => item.id === state.selectedService) || SERVICES[0];
  const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="icon" style="${i < n ? '' : 'opacity:.18'}" aria-hidden="true"><use href="#i-star"></use></svg>`).join('');
  const related = allPlaces().filter((x) => x.id !== s.id).slice(0, 3);
  return `
    <div class="service-detail-head">
      <div>
        <button class="back-link" type="button" data-page="services">${icon('arrow-left')}回到附近好店</button>
        <div class="page-head-kicker" style="margin-top:17px">${esc(serviceTypeLabel(s.type))} · ${s.distance} KM AWAY · ${s.open ? '营业中' : '休息中'}</div>
        <h1>${esc(s.name)}</h1>
        <p>${esc(s.sub)}。收录来自邻里推荐，评价保留真实体验，不收取排名费用。</p>
        <div class="service-meta-line"><span>${icon('clock')}${esc(s.hours)}</span><span>${icon('pin')}${esc(s.address)}</span><span>${icon('send')}${esc(s.phone || '暂无电话')}</span></div>
      </div>
      <div class="stats">
        <div class="big-rating"><b>${s.rating}</b><div class="stars">${stars(5)}</div></div>
        <p>${s.count} 条邻里评价 · 综合推荐</p>
        <div class="score-lines">
          <div class="score-line"><span>专业</span><span class="track"><i class="fill" style="display:block;width:94%"></i></span><b>4.8</b></div>
          <div class="score-line"><span>价格</span><span class="track"><i class="fill" style="display:block;width:82%"></i></span><b>4.2</b></div>
          <div class="score-line"><span>态度</span><span class="track"><i class="fill" style="display:block;width:91%"></i></span><b>4.7</b></div>
          <div class="score-line"><span>环境</span><span class="track"><i class="fill" style="display:block;width:87%"></i></span><b>4.5</b></div>
        </div>
      </div>
    </div>
    <div class="service-detail-grid">
      <div class="service-detail-main">
        <div class="service-intro">
          <div class="info-item"><span>营业时间 / HOURS</span><b>${esc(s.hours)}</b></div>
          <div class="info-item"><span>参考价格 / PRICE</span><b>${esc(s.price)}</b></div>
          <div class="info-item wide"><span>地址 / ADDRESS</span><b>${esc(s.address)}</b></div>
        </div>
        <div class="service-tagline-web">${esc(s.note)}</div>
        ${s.photos && s.photos.length ? `<div class="service-photo-strip">${s.photos.map((photo) => `<img src="${photoSrc(photo)}" alt="${esc(s.name)} 的环境照片" />`).join('')}</div>` : ''}
        ${s.details ? `<div class="service-extra-details"><div><span>环境描述</span><p>${esc(s.details.environment || '暂未补充')}</p></div><div><span>适合与提醒</span><p>${esc(s.details.advice || '暂未补充')}</p></div>${s.details.experience ? `<div><span>遛猫心得</span><p>${esc(s.details.experience)}</p></div>` : ''}</div>` : ''}
        ${s.type === '遛猫的地方' ? `<button class="companion-invite" type="button" data-action="compose-companion" data-place="${esc(s.name)}">${icon('paw')}在这个地点找猫友同路<span>先公开见面，不交换住址和电话</span></button>` : ''}
        <div class="review-block">
          <div class="review-block-head"><h2>邻里怎么说 <span>${s.count} REVIEWS</span></h2><div class="review-block-actions">${s.type === '遛猫的地方' && s.submittedBy === userName() ? `<button type="button" data-action="edit-walk-place" data-id="${s.id}">${icon('edit')}补充地点</button>` : ''}<button type="button" data-action="write-review" data-id="${s.id}">${icon('edit')}写评价</button></div></div>
          ${s.reviews.map((r) => `<div class="review-web"><div class="review-web-head">${contributorAvatar(r.name, r.avatar, r.tone)}<div><b>${esc(r.name)}</b><span>${esc(r.time)}</span><small class="contributor-line">${contributorBadge(r.name, true)}</small></div><span class="review-web-stars">${stars(r.stars)}</span></div><p>${esc(r.text)}</p><div class="review-web-tags">${r.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>`).join('')}
        </div>
      </div>
      <aside class="service-detail-aside">
        <div class="aside-map">${bigMapSvg()}<span class="pin"></span><span class="map-label">${esc(s.address)} · 仅到街区</span></div>
        <div class="aside-contact"><b>${s.type === '遛猫的地方' ? '去之前，先确认' : '去之前，先问一句'}</b><p>${s.type === '医院' ? '是否有夜诊、是否接流浪猫、群护折扣怎么算。' : s.type === '猫咖' ? '今天哪些猫状态好，是否接受领养咨询。' : s.type === '遛猫的地方' ? '哪一段路人少、是否允许牵绳入内、附近有没有遛狗集中时段。' : '营业时间、停车与是否需要预约。'}</p><button type="button" data-action="copy-phone" data-phone="${esc(s.phone)}">${icon('send')}${s.phone ? '复制联系电话' : '查看联系方式'}</button></div>
        ${s.submittedBy ? `<div class="aside-contact place-submitter-web"><b>地点由邻里补充</b><div class="place-submitter-person">${contributorAvatar(s.submittedBy, s.submittedBy.slice(0, 1))}<div><strong>${esc(s.submittedBy)}</strong>${contributorBadge(s.submittedBy, true)}</div></div><p>环境、时段和照片由分享者亲历补充，后续体验欢迎继续留言。</p><button type="button" data-action="compose">${icon('edit')}写一条遛猫心得</button></div>` : ''}
        <div class="aside-related"><h3>顺路再去</h3>${related.map((r) => `<button class="related-service" type="button" data-open-service="${r.id}"><span class="service-tile-icon ${r.markClass}">${icon(r.icon.replace('i-', ''))}</span><div><b>${esc(r.name)}</b><span>${esc(r.type)} · ${r.distance}km · ${r.rating}</span></div>${icon('chevron')}</button>`).join('')}</div>
      </aside>
    </div>`;
}

/* 16-profile.js */
function apiAdmin(path, body) {
  return API.request(path, { method: 'POST', body: JSON.stringify(body || {}) }).then(() => refreshAdmin()).catch((error) => {
    toast(error.message || '操作失败');
    return null;
  });
}

function adminListType() {
  const a = state.admin;
  return a.tab === 'reports' ? 'reports' : a.tab === 'users' ? 'users' : a.tab === 'content' ? a.contentType : null;
}

function fetchAdminStats() {
  return API.request('/api/admin/stats').then((payload) => {
    state.admin.stats = payload;
    if (state.page === 'admin') renderApp({ preserveScroll: true });
  }).catch((error) => toast(error.message || '看板加载失败'));
}

function fetchAdminList(type) {
  if (!type) return Promise.resolve();
  const a = state.admin;
  const params = new URLSearchParams({ type, page: a.page[type] || 1 });
  if (a.q[type]) params.set('q', a.q[type]);
  if (a.status[type] && a.status[type] !== 'all') params.set('status', a.status[type]);
  return API.request('/api/admin/list?' + params.toString()).then((payload) => {
    a.list = { type, ...payload };
    renderApp({ preserveScroll: true });
  }).catch((error) => toast(error.message || '列表加载失败'));
}

function refreshAdmin() {
  fetchAdminStats();
  fetchAdminList(adminListType());
}

function adminTrendChart(trend) {
  const W = 700;
  const H = 170;
  const pad = 26;
  const max = Math.max(1, ...trend.map((d) => Math.max(d.cats, d.posts)));
  const slot = (W - pad * 2) / trend.length;
  const bw = Math.max(6, Math.min(12, slot / 3));
  const bars = trend.map((d, i) => {
    const x = pad + i * slot;
    const hc = (d.cats / max) * (H - pad * 2 - 8);
    const hp = (d.posts / max) * (H - pad * 2 - 8);
    return '<g>' +
      '<rect x="' + (x + slot / 2 - bw - 1).toFixed(1) + '" y="' + (H - pad - hc).toFixed(1) + '" width="' + bw + '" height="' + (d.cats ? Math.max(hc, 2).toFixed(1) : 0) + '" fill="#204236" rx="1"></rect>' +
      '<rect x="' + (x + slot / 2 + 1).toFixed(1) + '" y="' + (H - pad - hp).toFixed(1) + '" width="' + bw + '" height="' + (d.posts ? Math.max(hp, 2).toFixed(1) : 0) + '" fill="#d65b35" rx="1"></rect>' +
      '<text x="' + (x + slot / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="8" fill="var(--muted)">' + d.date.slice(5) + '</text>' +
      '</g>';
  }).join('');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="admin-chart" role="img" aria-label="近 14 天上报与发帖趋势"><line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" stroke="var(--line)"></line>' + bars + '</svg>' +
    '<div class="admin-legend"><span><i class="is-moss"></i>上报猫</span><span><i class="is-orange"></i>发帖</span></div>';
}

function adminPager(list) {
  if (!list || list.pages <= 1) return '';
  return '<div class="admin-pager"><button type="button" ' + (list.page <= 1 ? 'disabled' : '') + ' data-admin-page="' + list.type + ':' + (list.page - 1) + '">上一页</button><span>' + list.page + ' / ' + list.pages + ' 页 · 共 ' + list.total + ' 条</span><button type="button" ' + (list.page >= list.pages ? 'disabled' : '') + ' data-admin-page="' + list.type + ':' + (list.page + 1) + '">下一页</button></div>';
}

function renderAdmin() {
  if (!state.user || !state.user.isAdmin) {
    return '<div class="page-head"><div><div class="page-head-kicker">ADMIN · 管理后台</div><h1>需要管理员权限</h1><p>当前账号没有管理权限。如需开通，请联系现有管理员。</p></div></div>';
  }
  const a = state.admin;
  if (!a.stats) return '<div class="page-head"><div><div class="page-head-kicker">ADMIN · 管理后台</div><h1>运营看板</h1><p>正在加载…</p></div></div>';
  if (a.stats.error) return '<div class="page-head"><div><h1>管理后台</h1><p>' + esc(a.stats.error) + '</p></div></div>';
  const c = a.stats.counts;
  const f = a.stats.funnel;
  const tabs = [
    { id: 'dash', label: '看板' },
    { id: 'reports', label: '举报' + (c.openReports ? ' · ' + c.openReports : '') },
    { id: 'content', label: '内容管理' },
    { id: 'users', label: '用户' }
  ];
  if (!tabs.some((t) => t.id === a.tab)) a.tab = 'dash';
  const searchBox = (type, placeholder) => '<div class="admin-search"><input class="input" data-admin-search="' + type + '" value="' + esc(a.q[type] || '') + '" placeholder="' + esc(placeholder) + '" /><button class="btn btn-small" type="button" data-admin-go="' + type + '">' + icon('search') + '搜索</button></div>';
  const chips = (type, options, activeKey) => {
    const active = a[activeKey][type] !== undefined ? a[activeKey][type] : 'all';
    return '<div class="admin-chips">' + options.map((o) => '<button type="button" class="chip ' + (active === o[0] ? 'is-active' : '') + '" data-admin-status="' + type + ':' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
  };
  return '<div class="admin-page">' +
    '<div class="page-head"><div><div class="page-head-kicker">ADMIN · 管理后台</div><h1>运营看板</h1><p>核验上报、处理举报、管理内容与用户。所有操作立即生效。</p></div></div>' +
    '<div class="admin-cards">' + [['今日上报', c.todayCats], ['待核验', c.pendingVerify], ['已领养', c.adopted], ['领养申请', c.applications], ['注册用户', c.users], ['帖子', c.posts], ['待处理举报', c.openReports]].map((pair) => '<div class="admin-card"><b>' + Number(pair[1]) + '</b><span>' + pair[0] + '</span></div>').join('') + '</div>' +
    '<div class="admin-tabs">' + tabs.map((t) => '<button type="button" class="' + (a.tab === t.id ? 'is-active' : '') + '" data-admin-tab="' + t.id + '">' + t.label + '</button>').join('') + '</div>' +
    '<div class="admin-body">' +
    (a.tab === 'dash' ? (
      '<div class="admin-panel">' +
      '<h3 class="admin-section-title">近 14 天趋势</h3>' + adminTrendChart(a.stats.trend) +
      '<h3 class="admin-section-title">领养转化</h3>' +
      '<div class="admin-funnel"><div class="funnel-step"><b>' + f.reported + '</b><span>上报猫</span></div><span class="funnel-arrow">' + icon('arrow-right') + '</span><div class="funnel-step"><b>' + f.applied + '</b><span>领养申请</span></div><span class="funnel-arrow">' + icon('arrow-right') + '</span><div class="funnel-step"><b>' + f.adopted + '</b><span>已领养</span></div></div>' +
      '<h3 class="admin-section-title">在栏内容</h3>' +
      '<div class="admin-cards">' + [['地点', c.places], ['帖子', c.posts], ['在栏猫', c.cats]].map((pair) => '<div class="admin-card"><b>' + Number(pair[1]) + '</b><span>' + pair[0] + '</span></div>').join('') + '</div>' +
      '</div>'
    ) : '') +
    (a.tab === 'reports' ? (
      '<div class="admin-panel">' +
      chips('reports', [['open', '待处理'], ['resolved', '已处理'], ['all', '全部']], 'status') +
      '<div class="admin-list">' +
      ((a.list && a.list.type === 'reports' ? a.list.items : []).length ? (a.list.items).map((r) => (
        '<div class="admin-row ' + (r.status === 'resolved' ? 'is-removed' : '') + '">' +
        '<div class="admin-row-main"><b>' + esc(r.author_name) + ' 举报了' + esc(r.tag) + (r.tag === 'cat' && r.name ? '「' + esc(r.name) + '」' : '') + '</b><p>' + esc(r.extra || '') + '</p><small>' + esc(r.created_at) + '</small></div>' +
        '<div class="admin-row-actions">' + (r.status === 'open' ? '<button class="btn btn-small btn-primary" type="button" data-admin-resolve="' + r.id + '">标记已处理</button>' : '<span class="admin-self">已处理</span>') + '</div>' +
        '</div>'
      )).join('') : '<p class="admin-empty">加载中…</p>') +
      '</div>' + adminPager(a.list && a.list.type === 'reports' ? a.list : null) +
      '</div>'
    ) : '') +
    (a.tab === 'content' ? (
      '<div class="admin-panel">' +
      '<div class="admin-chips">' + [['cats', '猫档案'], ['posts', '帖子'], ['places', '地点']].map((t) => '<button type="button" class="chip ' + (a.contentType === t[0] ? 'is-active' : '') + '" data-admin-type="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      searchBox(a.contentType, a.contentType === 'cats' ? '搜猫名/上报人' : (a.contentType === 'posts' ? '搜标题/作者' : '搜地点/推荐人')) +
      (a.contentType === 'cats'
        ? chips('cats', [['all', '全部'], ['published', '在栏'], ['pending', '待核验'], ['removed', '已下架']], 'status')
        : chips(a.contentType, [['all', '全部'], ['published', '在栏'], ['removed', '已下架']], 'status')) +
      '<div class="admin-list">' +
      ((a.list && a.list.type === a.contentType ? a.list.items : []).length ? (a.list.items).map((item) => (
        '<div class="admin-row ' + (item.status === 'removed' ? 'is-removed' : '') + '">' +
        '<div class="admin-row-main"><b>' + esc(item.name || '(未命名)') + '</b><p>' + esc(item.author_name || '匿名') + ' · ' + esc(item.created_at || '') + (item.tag ? ' · ' + esc(item.tag) : '') + (item.extra ? ' · ' + esc(item.extra) : '') + '</p></div>' +
        '<div class="admin-row-actions">' + (a.contentType === 'cats' && item.tag === '待核验' ? '<button class="btn btn-small btn-primary" type="button" data-admin-action="cats" data-id="' + esc(item.id) + '" data-action-type="verify">通过核验</button><button class="btn btn-small" type="button" data-admin-action="cats" data-id="' + esc(item.id) + '" data-action-type="reject">退回</button>' : '') +
        '<button class="btn btn-small ' + (item.status === 'removed' ? 'btn-primary' : '') + '" type="button" data-admin-action="' + a.contentType + '" data-id="' + esc(item.id) + '" data-action-type="' + (item.status === 'removed' ? 'restore' : 'remove') + '">' + (item.status === 'removed' ? '恢复' : '下架') + '</button>' +
        '</div></div>'
      )).join('') : '<p class="admin-empty">加载中…</p>') +
      '</div>' + adminPager(a.list && a.list.type === a.contentType ? a.list : null) +
      '</div>'
    ) : '') +
    (a.tab === 'users' ? (
      '<div class="admin-panel">' +
      searchBox('users', '搜昵称/用户名') +
      '<div class="admin-list">' +
      ((a.list && a.list.type === 'users' ? a.list.items : []).length ? (a.list.items).map((u) => (
        '<div class="admin-row ' + (u.status === 'admin' ? 'is-admin-row' : '') + '">' +
        '<div class="admin-row-main"><b>' + esc(u.name) + (u.status === 'admin' ? ' · 管理员' : '') + '</b><p>@' + esc(u.tag || u.id) + ' · 注册于 ' + esc(u.created_at) + '</p></div>' +
        '<div class="admin-row-actions">' + (u.id === state.user.id ? '<span class="admin-self">当前账号</span>' : '<button class="btn btn-small" type="button" data-admin-user="' + esc(u.id) + '" data-is-admin="' + (u.status === 'admin' ? 0 : 1) + '">' + (u.status === 'admin' ? '取消管理员' : '设为管理员') + '</button>') + '</div>' +
        '</div>'
      )).join('') : '<p class="admin-empty">加载中…</p>') +
      '</div>' + adminPager(a.list && a.list.type === 'users' ? a.list : null) +
      '</div>'
    ) : '') +
    '</div>';
}

function reportModal(targetType, targetId) {
  if (!requireAuth()) return;
  modal(`<h2>举报这条内容</h2><p class="modal-sub">举报会进入管理队列，由管理员处理。恶意举报会被记录。</p><form id="webReportForm" data-type="${esc(targetType)}" data-id="${esc(targetId)}"><div class="form-field"><label>举报原因</label><div class="report-reasons">${['违规内容', '虚假信息', '变相交易或收费', '引流广告', '其他'].map((r, i) => `<label class="check-line"><input type="radio" name="reason" value="${r}" ${i === 0 ? 'checked' : ''} /><span>${r}</span></label>`).join('')}</div></div><div class="form-field"><label>补充说明（可选）</label><textarea class="textarea" name="detail" maxlength="200" placeholder="200 字内"></textarea></div><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="submit">提交举报</button></div></form>`);
}

function renderProfile() {
  const favList = allCats().filter((cat) => state.favorites.includes(cat.id));
  const adopted = state.adoptions || [];
  const mine = allCats().filter((cat) => isMine(cat));
  const posts = myPosts();
  const comments = myComments();
  const liked = myLikedPosts();
  const walkPlaces = placeSubmissions();
  const contribution = memberContribution(userName());
  const tabs = [
    { id: 'adopted', label: '已领养', count: adopted.length },
    { id: 'published', label: '我的上报', count: mine.length },
    { id: 'walks', label: '遛猫地点', count: walkPlaces.length },
    { id: 'posts', label: '我的发帖', count: posts.length },
    { id: 'comments', label: '我的评论', count: comments.length },
    { id: 'liked', label: '点赞', count: liked.length },
    { id: 'favorites', label: '收藏', count: favList.length },
    { id: 'applications', label: '领养申请', count: state.applications.length }
  ];
  const activeTab = tabs.some((tab) => tab.id === state.profileTab) ? state.profileTab : 'adopted';
  const content = {
    adopted: () => profileAdoptions(adopted),
    published: () => profilePublished(),
    walks: () => profilePlaces(walkPlaces),
    posts: () => profilePosts(posts),
    comments: () => profileComments(comments),
    liked: () => profileLiked(liked),
    favorites: () => profileFavorites(favList),
    applications: () => profileApplications()
  }[activeTab]();
  return `
    <div class="profile-page">
      <aside class="profile-side">
        <div class="profile-card">
          <div class="profile-card-top"><span>SPARE CAT MEMBER</span></div>
          ${state.user ? `
          <div class="profile-avatar">${esc(state.user.avatar)}</div>
          <h1>${esc(state.user.name)}</h1>
          <div class="profile-badge-row">${contributorBadge(state.user.name, true)}</div>
          <p>${esc(state.user.area || '附近邻里')} · ${contribution.verified ? '已实名' : '未实名'} · 愿意先见面</p>
          <div class="credit-box"><div class="credit-top">${icon('shield')}<b>${Number(state.user.credit || 0)}</b><span>邻里信用</span></div><div class="credit-track"><i></i></div><span class="credit-note">信息准确、按时回访、无纠纷</span></div>
          <button class="btn btn-small" type="button" data-action="account" style="margin-top:12px">${icon('settings')}修改资料 / 退出登录</button>
          ` : `
          <div class="profile-avatar">${icon('user')}</div>
          <h1>还没登录</h1>
          <div class="profile-badge-row">${contributorBadge('', true)}</div>
          <p>登录后这里会显示你的上报、申请、发帖和收藏，内容会跟着账号走。</p>
          <button class="btn btn-primary" type="button" data-action="account" style="margin-top:12px">${icon('user')}登录 / 注册</button>
          `}
        </div>
        <div class="profile-menu">
          <button type="button" data-page="services">${icon('store')}附近好店与遛猫地点${icon('chevron')}</button>
          <button type="button" data-action="add-walk-place">${icon('pin')}分享遛猫地点与心得${icon('chevron')}</button>
          <button type="button" data-action="compose-companion">${icon('paw')}发起猫友同路${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('shield')}领养信用与实名认证${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('notebook')}领养回访记录${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('settings')}隐私与精确位置${icon('chevron')}</button>
        </div>
      </aside>
      <main class="profile-main">
        <div class="profile-main-head"><div><h1>我的猫事</h1><p>已领养、上报的猫、分享过的遛猫地点、发帖、评论、点赞、收藏和领养申请，都在这里。所有领养申请都需要双方见面，不收取费用。</p></div><div class="profile-head-actions"><button class="btn btn-small" type="button" data-action="compose">${icon('edit')}写一条</button><button class="btn btn-small" type="button" data-page="publish">${icon('plus')}再上报一只</button></div></div>
        <div class="profile-contribution">
          <div class="profile-contribution-copy"><span class="contribution-kicker">COMMUNITY CONTRIBUTION · 邻里贡献</span><b>${esc(contribution.level)}</b><p>${contribution.reports} 只上报 · ${contribution.adoptions} 只领养 · ${contribution.posts} 篇发帖 · ${contribution.comments} 条评论 · ${contribution.reviews} 条评价</p></div>
          <span class="contribution-total"><b>${contribution.total}</b><span>次真实贡献</span></span>
        </div>
        <div class="profile-stats-web is-eight">
          <button type="button" data-profile-tab="adopted"><b>${adopted.length}</b><span>已领养</span></button>
          <button type="button" data-profile-tab="published"><b>${mine.length}</b><span>我的上报</span></button>
          <button type="button" data-profile-tab="walks"><b>${walkPlaces.length}</b><span>遛猫地点</span></button>
          <button type="button" data-profile-tab="posts"><b>${posts.length}</b><span>我的发帖</span></button>
          <button type="button" data-profile-tab="comments"><b>${comments.length}</b><span>我的评论</span></button>
          <button type="button" data-profile-tab="liked"><b>${liked.length}</b><span>点赞</span></button>
          <button type="button" data-profile-tab="favorites"><b>${favList.length}</b><span>收藏</span></button>
          <button type="button" data-profile-tab="applications"><b>${state.applications.length}</b><span>领养申请</span></button>
        </div>
        <div class="profile-quick-actions" aria-label="我的分享快捷入口">
          <button type="button" data-action="add-walk-place">${icon('pin')}<b>分享遛猫地点</b><span>填写环境、时段、照片与心得</span></button>
          <button type="button" data-action="compose-companion">${icon('paw')}<b>发起猫友同路</b><span>约在公开地点，不交换住址</span></button>
          <button type="button" data-action="compose">${icon('edit')}<b>写一条邻里笔记</b><span>养猫经验、捉猫实录或就医体验</span></button>
        </div>
        <div class="profile-tabs-web">
          ${tabs.map((tab) => `<button class="${activeTab === tab.id ? 'is-active' : ''}" type="button" data-profile-tab="${tab.id}">${tab.label}<span>${tab.count}</span></button>`).join('')}
        </div>
        <div class="profile-content-web">${content}</div>
      </main>
    </div>`;
}

/* 17-profilecontent.js */
function profileFavorites(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('heart')}<h3>还没有收藏的猫</h3><p>遇到想再想一想的猫，点一下心形。<br />它不会催你，但会在这里等你。</p><button type="button" data-page="home">去附近看看</button></div>`;
  return list.map((cat) => `<div class="favorite-tile"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div class="favorite-tile-info" data-open-cat="${cat.id}" tabindex="0" role="button"><h3>${esc(cat.name)}</h3><p>${esc(cat.breed)} · ${esc(cat.sex)} · ${cat.distance}km · ${esc(cat.areaShort)}</p><span>${esc(cat.status)}</span></div><button class="fav-remove" type="button" data-fav="${cat.id}" aria-label="取消收藏 ${esc(cat.name)}">${icon('heart')}</button></div>`).join('');
}

function profilePosts(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('edit')}<h3>还没有发过笔记</h3><p>养猫技巧、找猫经验、一次失败的捕捉，<br />都可以留给下一位邻居。</p><button type="button" data-action="compose">写一条邻里笔记</button></div>`;
  return list.map((post) => `<button class="profile-post-web" type="button" data-open-post="${post.id}">
    ${post.image ? `<img src="${photoSrc(post.image)}" alt="" />` : `<span class="profile-post-mark">${icon('edit')}</span>`}
    <div><div class="profile-post-top"><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span><small>${esc(post.time)}</small></div><h3>${esc(post.title)}</h3><p>${esc(post.excerpt)}</p><div class="profile-post-foot"><span>${icon('heart')}${postLikes(post)} 赞</span><span>${icon('square')}${postCommentCount(post)} 评论</span><span>${icon('pin')}${esc(post.place)}</span></div></div>
  </button>`).join('');
}

function profileComments(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('square')}<h3>还没有留下评论</h3><p>读到有共鸣的邻里笔记，可以留下一句。<br />评论也会计入你的社区贡献。</p><button type="button" data-page="community">去广场看看</button></div>`;
  return list.map((comment) => `<button class="profile-comment-web" type="button" data-open-post="${comment.post.id}">
    <span class="profile-comment-mark">${icon('square')}</span>
    <div><p>${esc(comment.text)}</p><div class="profile-comment-meta"><b>${esc(comment.post.title)}</b><span>${esc(comment.time || '刚刚')} · ${esc(comment.post.author)}</span></div></div>
    ${icon('chevron')}
  </button>`).join('');
}

function profileLiked(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('heart')}<h3>还没有点赞的笔记</h3><p>点赞表示这条经验对你有用。<br />它会留在这里，方便你之后回看。</p><button type="button" data-page="community">去广场看看</button></div>`;
  return list.map((post) => `<button class="profile-like-web" type="button" data-open-post="${post.id}">
    <span class="profile-like-mark">${icon('heart')}</span>
    <div><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.author)} · ${esc(post.place)} · ${esc(post.time)}</p></div>
    ${icon('chevron')}
  </button>`).join('');
}

function profileApplications() {
  if (!state.applications.length) return `<div class="empty-state-web">${icon('send')}<h3>还没有提交申请</h3><p>看到想认真了解的猫，可以提交领养申请。<br />平台会先安排双方见面，不收取任何费用。</p><button type="button" data-page="home">去看看附近的猫</button></div>`;
  return state.applications.map((app) => { const cat = catById(app.catId); if (!cat) return ''; return `<div class="application-web"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div data-open-cat="${cat.id}" tabindex="0" role="button"><h3>${esc(cat.name)}</h3><p>${esc(app.time)} · ${esc(app.home)} · ${esc(app.experience)}</p></div><span>${esc(app.status)}</span></div>`; }).join('');
}

function profileAdoptions(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('home')}<h3>还没有接猫回家</h3><p>领养完成后，猫咪档案会出现在这里。<br />可以记录接回日期、回访日期和当前状态。</p><button type="button" data-page="home">去看看附近的猫</button></div>`;
  return list.map((adoption) => {
    const cat = catById(adoption.catId) || adoption.cat || {};
    const name = cat.name || adoption.name || '未命名';
    const id = cat.id || '';
    return `<div class="adoption-web">
      <img src="${photoSrc(cat.photo || adoption.photo)}" alt="${esc(name)}" />
      <div class="adoption-main" ${id ? `data-open-cat="${id}" tabindex="0" role="button"` : ''}>
        <div class="adoption-head"><h3>${esc(name)}</h3><span>${esc(adoption.status || '已接回家')}</span></div>
        <p>${esc(cat.breed || adoption.breed || '品种待补充')} · ${esc(cat.sex || adoption.sex || '性别待补充')} · ${esc(cat.age || adoption.age || '月龄待补充')}</p>
        <div class="adoption-dates"><span>${icon('home')}接回 ${esc(adoption.homeDate || '待补充')}</span><span>${icon('notebook')}回访 ${esc(adoption.revisitDate || '待安排')}</span></div>
      </div>
    </div>`;
  }).join('');
}

/* 18-profilepublished.js */
function placeSubmissions() {
  return allPlaces().filter((place) => place.type === '遛猫的地方' && place.submittedBy === userName());
}

function profilePlaces(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('pin')}<h3>还没有分享过遛猫地点</h3><p>把你走过的公共路线、环境细节和错峰时段留给邻居。<br />照片只放公共区域，不拍门牌和陌生人正脸。</p><button type="button" data-action="add-walk-place">分享一个遛猫地点</button></div>`;
  return list.map((place) => {
    const photos = Array.isArray(place.photos) ? place.photos.filter(Boolean) : [];
    return `<div class="published-web place-submission-web">
      ${photos[0] ? `<img src="${photoSrc(photos[0])}" alt="${esc(place.name)} 的环境照片" />` : `<span class="profile-place-mark">${icon('pin')}</span>`}
      <div class="published-main" data-open-service="${place.id}" tabindex="0" role="button">
        <div class="published-head"><h3>${esc(place.name)}</h3><span class="is-ok">已分享</span></div>
        <p>${esc(place.address || '位置待补充')} · ${esc(place.hours || '全天开放')}</p>
        <p class="published-place">${icon('pin')}${esc(place.details && place.details.environment ? place.details.environment : '环境描述待补充')}</p>
        <div class="published-stats"><span>${icon('image')}${photos.length} 张环境照片</span><span>${icon('star')}${Number(place.count || 0)} 条评价</span></div>
      </div>
    </div>`;
  }).join('');
}

function profilePublished() {
  const mine = allCats().filter((cat) => isMine(cat));
  if (!mine.length) return `<div class="empty-state-web">${icon('paw')}<h3>还没有上报记录</h3><p>在附近遇见需要帮助的猫，可以替它留一份档案。<br />通过邻里核验后，会出现在发现和地图里。</p><button type="button" data-page="publish">上报一只猫</button></div>`;
  return mine.map((cat) => {
    const verified = cat.verification === '已核验';
    return `<div class="published-web">
      <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
      <div class="published-main" data-open-cat="${cat.id}" tabindex="0" role="button">
        <div class="published-head"><h3>${esc(cat.name)}</h3><span class="${verified ? 'is-ok' : 'is-pending'}">${verified ? '已核验' : '待核验'}</span></div>
        <p>${esc(cat.breed || '品种待补充')}${cat.color && cat.color !== '待补充' ? ' · ' + esc(cat.color) : ''} · ${esc(cat.age || '月龄待补充')} · ${esc(cat.sex || '')}</p>
        <p class="published-place">${icon('pin')}${esc(cat.area || '位置待补充')} · ${esc(cat.time || '刚刚')}</p>
        <div class="published-stats"><span>${icon('heart')}${Number(cat.views || 0)} 次浏览</span><span>${icon('send')}${Number(cat.applications || 0)} 份申请</span></div>
      </div>
    </div>`;
  }).join('');
}

/* 19-modals.js */
function modal(html, cls = '') {
  const root = $('#webOverlay');
  root.innerHTML = `<div class="modal-layer"><div class="modal-backdrop" data-close-modal></div><div class="modal ${cls}"><button class="modal-close" type="button" data-close-modal aria-label="关闭">${icon('close')}</button>${html}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  closeSpotPicker();
  $('#webOverlay').innerHTML = '';
  document.body.style.overflow = '';
}

let spotPickerMap = null;
let spotPickerSyncTimer = null;

function closeSpotPicker() {
  if (spotPickerMap) {
    try { spotPickerMap.remove(); } catch (error) { /* already torn down */ }
    spotPickerMap = null;
  }
  if (spotPickerSyncTimer) { clearTimeout(spotPickerSyncTimer); spotPickerSyncTimer = null; }
}

function nearestSpot(lat, lng) {
  return MAP_SPOTS.map((spot) => ({ spot, d: haversineKm(lat, lng, spot.lat, spot.lng) })).sort((a, b) => a.d - b.d)[0];
}

function initSpotPicker(hostId, initial, onPick) {
  closeSpotPicker();
  const host = $('#' + hostId);
  if (!host || typeof L === 'undefined') return null;
  const start = initial || MAP_SPOTS[0];
  const readout = $('#' + hostId + 'Readout');
  spotPickerMap = L.map(host, {
    center: [start.lat, start.lng],
    zoom: 15,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false
  });
  spotPickerMap._tileLayer = buildTileLayer(MAP_TILES.amap, spotPickerMap, false);
  const pin = document.createElement('div');
  pin.className = 'spot-picker-pin';
  pin.innerHTML = '<i></i>';
  host.appendChild(pin);
  const sync = () => {
    spotPickerSyncTimer = null;
    if (!spotPickerMap) return;
    const center = spotPickerMap.getCenter();
    state.pickedSpot = { lat: Number(center.lat.toFixed(6)), lng: Number(center.lng.toFixed(6)) };
    const near = nearestSpot(center.lat, center.lng);
    if (readout) {
      readout.textContent = near.d < 0.5
        ? `靠近「${near.spot.label}」· 约 ${Math.max(1, Math.round(near.d * 1000))}m`
        : `自选位置 · 距「${near.spot.label}」约 ${near.d.toFixed(1)}km`;
    }
    syncSpotChips(near.d < 0.08 ? near.spot.id : null);
    if (onPick) onPick(state.pickedSpot);
  };
  spotPickerMap.on('move', () => {
    if (spotPickerSyncTimer) return;
    spotPickerSyncTimer = setTimeout(sync, 120);
  });
  spotPickerMap.whenReady(sync);
  setTimeout(() => { if (spotPickerMap) { spotPickerMap.invalidateSize(); sync(); } }, 80);
  return spotPickerMap;
}

function syncSpotChips(activeId) {
  $$('.spot-chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.pickerSpot === activeId));
}

function pickSpotById(id) {
  const spot = MAP_SPOTS.find((item) => item.id === id);
  if (!spot || !spotPickerMap) return;
  spotPickerMap.setView([spot.lat, spot.lng], Math.max(spotPickerMap.getZoom(), 15));
}

function simplePhotoPicker(title, current, action) {
  const target = action === 'compose' ? 'compose' : 'place';
  modal(`<h2>${esc(title)}</h2><p class="modal-sub">从相册选择，或用相机拍一张。上传前会压缩到长边 960px；只放公共环境，不拍具体门牌与陌生人正脸。</p><label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="${target}" data-slot="${state.photoSlot}" /><span>${icon('camera')}从相册选择 / 拍照</span></label><p class="field-help">想先体验，也可以用下面的示例图；示例图仅用于预览，正式内容请用真实照片。</p><div class="photo-choices">${UPLOAD_SAMPLES.map((p) => `<button type="button" class="photo-choice ${current === p ? 'is-active' : ''}" data-pick-simple-photo="${p}" data-photo-action="${action}"><img src="${photoSrc(p)}" alt="候选照片" /></button>`).join('')}</div><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button>${current ? `<button class="btn" type="button" data-clear-simple-photo="${action}">移除</button>` : ''}</div>`);
}

/* 20-catmodal.js */
function catModal() {
  const cat = state.selectedCat ? catById(state.selectedCat) : null;
  if (!cat) return;
  const applied = state.applications.some((a) => a.catId === cat.id);
  modal(`
    <div class="detail-web">
      <div class="detail-web-photo"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}，${esc(cat.breed)}" /><button class="detail-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button><span class="photo-note">PHOTO BY NEIGHBOR · ${esc(cat.areaShort)}</span></div>
      <div class="detail-web-body">
        <div class="detail-web-kicker"><span>${esc(cat.english)} · ${esc(cat.areaShort)}</span><span>${cat.distance} KM AWAY</span></div>
        <div class="detail-web-name"><h2>${esc(cat.name)}</h2><span>${esc(cat.status)}</span></div>
        <div class="detail-web-meta"><span>${esc(cat.status)}</span>${cat.healthTags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="detail-web-facts"><div><b>${esc(cat.sex)}</b><span>性别 / SEX</span></div><div><b>${esc(cat.age)}</b><span>年龄 / AGE</span></div><div><b>${esc(cat.breed)}</b><span>品种 / BREED</span></div><div><b>${esc(cat.color)}</b><span>毛色 / COLOR</span></div></div>
        <div class="detail-web-section"><h3>关于它</h3><p>${esc(cat.note)}</p></div>
        <div class="detail-web-section"><h3>健康与照护</h3><div class="detail-health"><div><span>绝育 / NEUTERED</span><b>${esc(cat.sterilization)}</b></div><div><span>疫苗 / VACCINE</span><b>${esc(cat.vaccine)}</b></div><div><span>驱虫 / DEWORMED</span><b>${esc(cat.deworm)}</b></div><div><span>寄养 / FOSTER</span><b>${esc(cat.foster)}</b></div></div><p style="font-size:9px;color:var(--muted)">${esc(cat.healthBadge)}。领养前建议再次确认近期状态，并预约一次基础体检。</p></div>
        <div class="detail-web-section"><h3>遇见它的地方</h3><div class="detail-location"><span class="mini-thumb"></span><div><b>${esc(cat.area)}</b><p>仅显示到街区。为保护猫咪安全，精确位置需与上报人确认后提供。</p></div></div></div>
        <div class="detail-web-publisher"><span class="avatar ${cat.urgent ? 'is-orange' : ''}">${esc(cat.reporter.slice(0, 1))}</span><div><b>${esc(cat.reporter)}</b><span>${esc(cat.reporterRole)} · ${esc(cat.time)}</span></div><button class="btn btn-small" type="button" data-action="contact-reporter">${icon('send')}联系</button><button class="report-link" type="button" data-action="report" data-type="cat" data-id="${cat.id}">举报</button></div>
        <div class="detail-web-actions"><button class="secondary-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button><button class="btn btn-primary" type="button" data-action="${applied ? 'view-application' : 'apply'}" data-id="${cat.id}" ${applied ? 'disabled' : ''}>${applied ? '申请已提交 · 等待初审' : '申请领养 · 先见面再决定'}</button></div>
      </div>
    </div>`, 'modal-detail');
}

/* 21-moremodals.js */
function articleModal(post) {
  if (!post) return;
  state.activePost = post.id;
  modal(`
    ${post.image ? `<img class="article-cover" src="${photoSrc(post.image)}" alt="${esc(post.title)}" />` : ''}
    <div class="article-content">
      <span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span>
      <h2 style="margin-top:12px">${esc(post.title)}</h2>
      <div class="article-byline">${contributorAvatar(post.author, post.avatar, post.tone)}<div><b>${esc(post.author)}</b><span>${esc(post.place)} · ${esc(post.time)}</span><small class="contributor-line">${contributorBadge(post.author, true)}</small></div><span class="article-date">FIELD NOTE</span></div>
      <div class="article-body">${post.body}</div>
      <div class="article-actions"><button class="article-stat ${isLiked(post) ? 'is-liked' : ''}" type="button" data-like-post="${post.id}" aria-pressed="${isLiked(post)}">${icon('heart')}<span>${postLikes(post)}</span> 点赞</button><span class="article-stat">${icon('square')}<span>${postCommentCount(post)}</span> 条回应</span><button class="report-link" type="button" data-action="report" data-type="post" data-id="${post.id}">举报</button></div>
      <div class="comments"><h3>邻里回应 · <span data-comment-total>${postCommentCount(post)}</span></h3><div data-comment-list>${(post.commentsList || []).map((c) => `<div class="comment">${contributorAvatar(c.name, c.name.slice(0, 1))}<div class="comment-copy"><div class="comment-byline"><b>${esc(c.name)}</b>${contributorBadge(c.name, true)}${c.time ? `<small>${esc(c.time)}</small>` : ''}</div><p>${esc(c.text)}</p></div></div>`).join('')}</div><form class="comment-form" id="webCommentForm" data-post-id="${post.id}"><label class="sr-only" for="webCommentText">写下你的回应</label><textarea class="textarea" id="webCommentText" name="text" placeholder="说说你的经验，或问一个具体问题。"></textarea><div class="comment-form-foot"><span>${state.user ? contributorBadge(state.user.name, true) : `<button type="button" class="auth-inline-link" data-action="account">登录后回应</button>`}</span><button class="btn btn-primary" type="submit">发出回应</button></div><div class="form-error" role="alert"></div></form></div>
    </div>`, 'article-web');
}

/* 22-applymodal.js */
function applyModal() {
  const cat = state.selectedCat ? catById(state.selectedCat) : null;
  if (!cat) return;
  modal(`
    <h2>先认真回答几个问题</h2><p class="modal-sub">这不是考试，是为了让双方都少一点冲动。提交后，上报人会在 48 小时内联系你。</p>
    <div class="apply-summary-web"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div><b>${esc(cat.name)}</b><span>${esc(cat.breed)} · ${esc(cat.sex)} · ${esc(cat.areaShort)}</span></div></div>
    <form class="apply-form-web" id="webApplyForm">
      <div class="form-field"><label for="webApplyName">怎么称呼你</label><input class="input" id="webApplyName" name="name" placeholder="你的名字或昵称" value="${esc(state.form.name)}" /></div>
      <div class="form-field"><label for="webApplyPhone">联系方式（仅对上报人可见）</label><input class="input" id="webApplyPhone" name="phone" type="tel" placeholder="手机号或微信号" value="${esc(state.form.phone)}" /></div>
      <div class="form-row"><div class="form-field"><label for="webApplyHome">居住情况</label><div class="select-wrap"><select class="select" id="webApplyHome" name="home">${['整租 / 自有住房', '合租（室友同意）', '与家人同住', '其他'].map((v) => `<option ${state.form.home === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div><div class="form-field"><label for="webApplyExp">养猫经验</label><div class="select-wrap"><select class="select" id="webApplyExp" name="experience">${['养过猫', '第一次养猫', '有照顾流浪猫经验', '暂无'].map((v) => `<option ${state.form.experience === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div></div>
      <div class="form-field"><label for="webApplyReason">为什么想了解它</label><textarea class="textarea" id="webApplyReason" name="reason" placeholder="说说你的居住环境、每天在家的时间，以及你理解它可能需要多长的适应期。">${esc(state.form.reason)}</textarea></div>
      <label class="check-line"><input type="checkbox" name="agree" ${state.form.agree ? 'checked' : ''} /><span>我理解领养不是购买。愿意接受双方见面、家访或视频回访，不因搬家、怀孕、掉毛等原因随意转送或遗弃。</span></label>
      <div class="form-error" role="alert"></div>
      <button class="btn btn-primary" style="width:100%;margin-top:13px" type="submit">提交申请 · 等待上报人联系</button>
    </form>`);
}

/* 23-filters.js */
const AGE_FILTERS = [
  { value: '全部', label: '不限年龄', note: 'ALL' },
  { value: '0-1m', label: '0–1 个月', note: '奶猫 / 需人工喂养' },
  { value: '1-3m', label: '1–3 个月', note: '断奶过渡期' },
  { value: '3-12m', label: '3–12 个月', note: '幼猫期' },
  { value: '1-3y', label: '1–3 岁', note: '青年猫' },
  { value: '3y+', label: '3 岁以上', note: '成年猫' }
];

const BREED_FILTERS = [
  '全部', '中华田园猫', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫', '英短', '美短', '布偶猫', '暹罗猫', '缅因猫', '加菲猫', '折耳猫', '银渐层', '金渐层', '混血 / 不确定'
];

function normalizeCoatText(cat) {
  return [cat.breed, cat.color].filter(Boolean).join(' ');
}

function breedMatches(cat, value) {
  if (value === '全部') return true;
  const haystack = normalizeCoatText(cat);
  const aliases = {
    '英短': ['英短', '蓝猫'],
    '美短': ['美短'],
    '狸花猫': ['狸花'],
    '橘猫': ['橘'],
    '奶牛猫': ['奶牛', '黑白'],
    '三花猫': ['三花'],
    '玳瑁猫': ['玳瑁'],
    '白猫': ['白狸', '白猫', '纯白', '白色'],
    '黑猫': ['黑猫', '纯黑', '黑色'],
    '混血 / 不确定': ['混血', '不确定', '未知', '待补充']
  };
  const needles = aliases[value] || [value.replace('猫', '')];
  return needles.some((needle) => haystack.includes(needle));
}

function catAgeMonths(cat) {
  if (Number.isFinite(cat.ageMonths)) return cat.ageMonths;
  const years = /(\d+)\s*岁/.exec(cat.age || '');
  const months = /(\d+)\s*个月/.exec(cat.age || '');
  return (years ? Number(years[1]) * 12 : 0) + (months ? Number(months[1]) : 0);
}

function ageMatches(cat, value) {
  if (value === '全部') return true;
  const months = catAgeMonths(cat);
  if (!Number.isFinite(months)) return false;
  if (value === '0-1m') return months >= 0 && months < 1;
  if (value === '1-3m') return months >= 1 && months < 3;
  if (value === '3-12m') return months >= 3 && months < 12;
  if (value === '1-3y') return months >= 12 && months < 36;
  if (value === '3y+') return months >= 36;
  return true;
}

function ageLabelFor(value) {
  return (AGE_FILTERS.find((item) => item.value === value) || AGE_FILTERS[0]).label;
}

function isCitywide(filters = state.filters) {
  return Boolean(filters && filters.citywide);
}

function distanceMatches(cat, km, citywide = false) {
  return citywide ? true : cat.distance <= Number(km);
}

function distanceLabel(km) {
  const value = Number(km);
  if (value === DISTANCE_DEFAULT) return DISTANCE_DEFAULT + 'km 内都看看';
  return value >= DISTANCE_MAX ? DISTANCE_MAX + 'km 内都看看' : value + 'km 内';
}

function distanceScopeLabel(filters = state.filters) {
  if (isCitywide(filters)) return '全城都看看';
  return distanceLabel(filters.distance);
}

function distanceTicks() {
  const values = [DISTANCE_MIN, 5, 10, DISTANCE_MAX];
  return values.map((value) => {
    const percent = ((value - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)) * 100;
    return `<span style="left:${percent}%">${value}km</span>`;
  }).join('');
}

function previewFilterCount(key, value) {
  return availableCats().filter((cat) => {
    if (key === 'breed' && !breedMatches(cat, value)) return false;
    if (key === 'age') return ageMatches(cat, value);
    if (key === 'sex' && value !== '全部' && cat.sex !== value) return false;
    if (key === 'distance') return distanceMatches(cat, value, state.filters.citywide);
    return true;
  }).length;
}

function filterModal() {
  const f = state.filters;
  const special = ['全部', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫'];
  const common = BREED_FILTERS.filter((item) => special.includes(item));
  const more = BREED_FILTERS.filter((item) => !special.includes(item));
  const breedButton = (value) => `<button class="filter-option ${f.breed === value ? 'is-active' : ''}" type="button" data-filter-key="breed" data-filter-value="${esc(value)}"><span>${esc(value)}</span><small>${previewFilterCount('breed', value)}</small></button>`;

  modal(`
    <div class="filter-panel" data-filter-panel>
      <h2>找一只对得上的猫</h2>
      <p class="modal-sub">条件不用一次填满。月龄只是估计，见面时还可以再确认。</p>

      <section class="filter-group filter-breed-group">
        <div class="filter-label"><b>品种 / 毛色</b><span>BREED &amp; COAT · ${availableCats().length} 只建档</span></div>
        <div class="filter-options">${common.map(breedButton).join('')}</div>
        <details class="filter-more">
          <summary>更多品种与毛色 ${icon('chevron-down')}</summary>
          <div class="filter-options">${more.map(breedButton).join('')}</div>
        </details>
      </section>

      <section class="filter-group">
        <div class="filter-label"><b>月龄 / 年龄</b><span>AGE · 按更容易辨认的阶段</span></div>
        <div class="filter-age-grid">
          ${AGE_FILTERS.map((item) => `<button class="filter-age ${f.age === item.value ? 'is-active' : ''}" type="button" data-filter-key="age" data-filter-value="${item.value}"><b>${item.label}</b><small>${item.note}<i>${previewFilterCount('age', item.value)} 只</i></small></button>`).join('')}
        </div>
        <p class="filter-hint">${icon('paw')}0–1 个月的奶猫需要人工喂养和保温，和 2–3 个月的小猫照护节奏不同；1 岁以后可以按“年”来记。拿不准时选“不限年龄”，见面再确认。</p>
      </section>

      <section class="filter-group">
        <div class="filter-label"><b>距离</b><span>DISTANCE · 从你现在的街区算起</span></div>
        <div class="distance-filter">
          <div class="distance-value"><b data-distance-value>${distanceScopeLabel(f)}</b><span data-distance-count>约 ${previewFilterCount('distance', f.distance)} 只猫</span></div>
          <input type="range" min="${DISTANCE_MIN}" max="${DISTANCE_MAX}" step="0.5" value="${f.distance}" data-distance-range aria-label="按距离筛选猫只" />
          <div class="distance-ticks">${distanceTicks()}</div>
          <button class="distance-citywide ${isCitywide(f) ? 'is-active' : ''}" type="button" data-action="toggle-citywide" aria-pressed="${isCitywide(f) ? 'true' : 'false'}"><span class="distance-citywide-dot"></span><span><b>全城</b><small>不限距离，看看杭州全城待领养的猫</small></span><i data-citywide-count>${availableCats().length} 只</i></button>
        </div>
      </section>

      <section class="filter-group filter-group-last">
        <div class="filter-label"><b>性别</b><span>SEX</span></div>
        <div class="filter-options">${['全部', '公', '母'].map((value) => `<button class="filter-option ${f.sex === value ? 'is-active' : ''}" type="button" data-filter-key="sex" data-filter-value="${value}"><span>${value}</span><small>${previewFilterCount('sex', value)}</small></button>`).join('')}</div>
      </section>

      <div class="filter-result-note"><span>符合条件</span><b data-filter-result>${filteredCats().length}</b><span>只，看看哪只在等你</span></div>
      <div class="modal-actions"><button class="btn" type="button" data-action="reset-filters">重置</button><button class="btn btn-primary" type="button" data-action="apply-filters">看看 ${filteredCats().length} 只猫</button></div>
    </div>`, 'filter-modal');

  bindDistanceRange();
  syncRangeFill();
}

function bindDistanceRange() {
  const range = $('[data-distance-range]');
  if (!range) return;
  range.addEventListener('input', () => {
    state.filters.distance = Number(range.value);
    state.filters.citywide = false;
    const label = $('[data-distance-value]');
    const count = $('[data-distance-count]');
    const result = $('[data-filter-result]');
    const action = $('[data-action="apply-filters"]');
    const citywide = $('[data-action="toggle-citywide"]');
    if (label) label.textContent = distanceScopeLabel(state.filters);
    if (count) count.textContent = '约 ' + previewFilterCount('distance', state.filters.distance) + ' 只猫';
    if (citywide) {
      citywide.classList.remove('is-active');
      citywide.setAttribute('aria-pressed', 'false');
    }
    if (result) result.textContent = filteredCats().length;
    if (action) action.textContent = '看看 ' + filteredCats().length + ' 只猫';
    syncRangeFill();
  });
}

function syncRangeFill() {
  const range = $('[data-distance-range]');
  if (!range) return;
  const min = Number(range.min);
  const max = Number(range.max);
  const percent = ((Number(range.value) - min) / (max - min)) * 100;
  range.style.setProperty('--fill', percent + '%');
}

/* 24-pickers.js */
const UPLOAD_SAMPLES = ['cat-01.jpg', 'cat-03.jpg', 'cat-05.jpg', 'cat-07.jpg', 'cat-10.jpg', 'cat-12.jpg', 'cat-13.jpg', 'cat-15.jpg', 'cat-16.jpg'];

function photoPickerModal() {
  const current = state.publish.photos[state.photoSlot];
  modal(`<h2>添加一张照片</h2><p class="modal-sub">从相册选择，或用相机拍一张。上传前会压缩到长边 1200px，减少流量；尽量拍清楚毛色和体型。</p><div class="photo-upload-box"><button class="btn btn-primary" type="button" data-action="upload-photo" data-target="publish" data-slot="${state.photoSlot}">${icon('camera')}从相册选择 / 拍照</button><span>JPEG / PNG / WebP · 压缩后存入，单张不超过 12MB</span></div><div class="photo-choices">${UPLOAD_SAMPLES.map((p) => `<button type="button" class="photo-choice ${current === p ? 'is-active' : ''}" data-pick-photo="${p}"><img src="${photoSrc(p)}" alt="候选猫照片" /></button>`).join('')}</div>${current ? `<div class="modal-actions"><button class="btn" type="button" data-action="clear-photo">移除当前照片</button><button class="btn btn-primary" type="button" data-close-modal>保留这张</button></div>` : ''}`);
}

function uploadKindModal(target, slot) {
  modal(`<h2>添加照片</h2><p class="modal-sub">选择照片用途。真实产品中这里会打开系统相册或相机。</p><label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="${target}" data-slot="${slot}" /><span>${icon('camera')}从相册选择 / 拍照</span></label><p class="field-help">${icon('shield')}只上传你拍的照片；不要拍到陌生人正脸或具体门牌。</p><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button></div>`); 
}

/* 25-compose.js */
function composeModal() {
  const tags = ['捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '猫友同路', '领养回访'];
  const current = tags.includes(state.composeTag) ? state.composeTag : '捉猫实录';
  modal(`<h2>写一条邻里笔记</h2><p class="modal-sub">经验不必完美，真实就够。请隐去精确门牌与个人电话，把判断留给后来的人。</p><form id="webComposeForm" style="margin-top:16px"><div class="form-field"><label for="webComposeTitle">标题</label><input class="input" id="webComposeTitle" name="title" placeholder="一句话说清楚这条经验" /></div><div class="form-field"><label for="webComposeBody">正文</label><textarea class="textarea" id="webComposeBody" name="body" placeholder="发生了什么？你试了什么？哪一步真的有用？"></textarea></div><div class="form-row"><div class="form-field"><label for="webComposePlace">发生在哪一带</label><div class="select-wrap"><select class="select" id="webComposePlace" name="place">${postingPlaceOptions('翠苑二区')}</select></div></div><div class="form-field"><label>配一张照片（可选）</label><button class="compose-photo ${state.composePhoto ? 'has-photo' : ''}" type="button" data-action="pick-compose-photo">${state.composePhoto ? `<img src="${photoSrc(state.composePhoto)}" alt="" /><span>更换照片</span>` : `${icon('camera')}<span>选一张社区照片</span>`}</button></div></div><div class="form-field"><label>放在哪个分类</label><div class="compose-tags">${tags.map((t) => `<button type="button" class="pill ${current === t ? 'is-active' : ''}" data-compose-tag="${t}">${t}</button>`).join('')}</div></div><p class="field-help">${icon('shield')}就医、门店和地点类内容只陈述亲历，不替医院、门店或地点下结论；具体判断留给读到的人。</p><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>先不写</button><button class="btn btn-primary" type="submit">发布</button></div></form>`);
}

function companionModal(prefillPlace = '') {
  state.composeTag = '猫友同路';
  modal(`<h2>找猫友同路</h2><p class="modal-sub">先约在公开、人少的遛猫地点。第一次见面用推车或背包，让两只猫隔着距离观察；不交换精确住址和私人电话。</p><form id="webCompanionForm" style="margin-top:16px"><div class="form-field"><label for="webCompanionTitle">想找什么样的散步搭子</label><input class="input" id="webCompanionTitle" name="title" placeholder="比如：想找一只不怕推车、节奏慢的猫，周末早上沿河走" /></div><div class="form-field"><label for="webCompanionBody">说说自家猫和希望遇到的情况</label><textarea class="textarea" id="webCompanionBody" name="body" placeholder="猫的年龄、性格、适应程度；希望对方猫的性格和体型；第一次见面怎么安排。"></textarea></div><div class="form-row"><div class="form-field"><label for="webCompanionPlace">公开见面地点</label><div class="select-wrap"><select class="select" id="webCompanionPlace" name="place">${postingPlaceOptions(prefillPlace || '翠苑二区')}</select></div></div><div class="form-field"><label for="webCompanionTime">适合时段</label><input class="input" id="webCompanionTime" name="time" placeholder="比如：周六 08:30 前后" /></div></div><div class="form-row"><div class="form-field"><label for="webCompanionCat">自家猫的性格与适应程度</label><select class="select" id="webCompanionCat" name="cat"><option>已习惯牵绳，能保持距离</option><option>还在推车适应期，先远距离看看</option><option>不怕狗，但对陌生猫谨慎</option><option>第一次出门，只做短时间观察</option></select></div><div class="form-field"><label for="webCompanionWant">希望遇到的猫</label><select class="select" id="webCompanionWant" name="want"><option>性格稳定、不主动追猫</option><option>同样在推车或背包里观察</option><option>已绝育、疫苗齐全</option><option>不急，先线上聊清楚再约</option></select></div></div><label class="check-line"><input type="checkbox" name="safe" /><span>我理解这是公开地点见面，不交换住址和私人电话；如猫出现应激、抢占地盘或身体不适，会立刻结束。</span></label><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>先不约</button><button class="btn btn-primary" type="submit">发布同路邀请</button></div></form>`);
}

/* 26-review.js */
function reviewModal(service) {
  if (!service) return;
  state.reviewStars = state.reviewStars || 5;
  modal(`<h2>分享一次真实体验</h2><p class="modal-sub">${esc(service.name)} · 评价会公开，商家可回复但不能删除，不同体验都会被保留。</p><form id="webReviewForm" style="margin-top:14px"><div class="form-field"><label>你给几颗星</label><div class="star-picker">${[1,2,3,4,5].map((n) => `<button type="button" class="${n <= state.reviewStars ? 'is-on' : ''}" data-web-star="${n}" aria-label="${n} 星">${icon('star')}</button>`).join('')}</div></div><div class="form-field"><label for="webReviewText">具体说说</label><textarea class="textarea" id="webReviewText" name="text" placeholder="什么让你觉得好？有什么需要提醒后来的人？"></textarea></div><div class="form-row"><div class="form-field"><label for="webReviewGood">最值得肯定</label><select class="select" id="webReviewGood" name="good">${['对猫温柔', '不推销', '价格透明', '环境干净', '适合新手'].map((v) => `<option>${v}</option>`).join('')}</select></div><div class="form-field"><label for="webReviewBad">需要提醒</label><select class="select" id="webReviewBad" name="bad">${['没有', '周末人多', '等位较久', '停车不便', '价格偏高'].map((v) => `<option>${v}</option>`).join('')}</select></div></div><div class="review-identity">${contributorAvatar(state.user.name, state.user.avatar)}<div><b>${esc(state.user.name)}</b><span>${contributorBadge(state.user.name, true)}</span></div><small>评价会显示你的昵称与社区贡献</small></div><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="submit">发布评价</button></div></form>`);
}

function placeModal(service) {
  const s = service || null;
  const isEdit = Boolean(s && s.type === '遛猫的地方' && s.submittedBy === userName());
  const draft = state.placeDraft && state.placeDraft.id === (s ? s.id : '') ? state.placeDraft : null;
  const sourcePhotos = draft && Array.isArray(draft.photos) ? draft.photos : (s && Array.isArray(s.photos) ? s.photos : []);
  const photos = [0, 1, 2].map((index) => sourcePhotos[index] || '');
  const field = (key, fallback = '') => esc(draft && draft[key] !== undefined ? draft[key] : fallback);
  state.placeDraft = { ...(draft || {}), id: s ? s.id : '', photos };
  modal(`<h2>${isEdit ? '补充遛猫地点' : '分享一个遛猫地点'}</h2><p class="modal-sub">写下你亲自走过的路线和环境。具体判断留给后来的人，不替商家或地点下结论。</p><form id="webPlaceForm" data-id="${s ? esc(s.id) : ''}" style="margin-top:14px">
    <div class="form-row"><div class="form-field"><label for="webPlaceName">地点名</label><input class="input" id="webPlaceName" name="name" placeholder="比如：丰潭路沿河绿道" value="${field('name', s ? s.name : '')}" required /></div><div class="form-field"><label for="webPlaceArea">所在区域</label><input class="input" id="webPlaceArea" name="area" placeholder="比如：丰潭路 · 河岸边" value="${field('area', s ? (s.area || s.address || '') : '')}" required /></div></div>
    <div class="form-field"><label for="webPlaceEnvironment">环境描述</label><textarea class="textarea" id="webPlaceEnvironment" name="environment" placeholder="路面是否平整？有没有树荫、长椅、水源？人多不多？">${field('environment', s && s.details ? (s.details.environment || '') : '')}</textarea></div>
    <div class="form-field"><label for="webPlaceAdvice">优点、适合谁，以及要提醒的时段</label><textarea class="textarea" id="webPlaceAdvice" name="advice" placeholder="比如：适合已经习惯牵绳的猫；傍晚遛狗的人多，建议错峰；第一次出门先用推车。">${field('advice', s && s.details ? (s.details.advice || '') : '')}</textarea></div>
    <div class="form-field"><label for="webPlaceExperience">你的遛猫心得（可选）</label><textarea class="textarea" id="webPlaceExperience" name="experience" placeholder="第一次带猫来是什么反应？哪一段最好走？有什么只有走过才知道的细节？">${field('experience', s && s.details ? (s.details.experience || '') : '')}</textarea></div>
    <div class="form-row"><div class="form-field"><label for="webPlaceHours">适合时段</label><input class="input" id="webPlaceHours" name="hours" placeholder="比如：全天开放 · 建议傍晚" value="${field('hours', s ? s.hours : '')}" /></div></div>
    <div class="form-field"><label>地图落点<small>拖动地图，把中央图钉对准位置；或选常用落点</small></label><div id="webPlacePickerHost" class="spot-picker"></div><p class="spot-picker-readout" id="webPlacePickerHostReadout"></p><div class="spot-chips">${MAP_SPOTS.map((spot) => `<button type="button" class="spot-chip" data-picker-spot="${spot.id}">${esc(spot.label)}</button>`).join('')}</div><p class="field-help">${icon('pin')}坐标用于地图展示与就近查重，公开时仍打码到街区。</p></div>
    <div class="form-field"><label>环境照片（可选，最多 3 张）</label><div class="place-photo-line">${[0,1,2].map((index) => { const photo = photos[index]; return `<button type="button" class="place-photo ${photo ? 'has-photo' : ''}" data-action="pick-place-photo" data-slot="${index}">${photo ? `<img src="${photoSrc(photo)}" alt="" />` : `${icon('camera')}<span>${index === 0 ? '主图' : '补充'}</span>`}</button>`; }).join('')}</div><p class="field-help">${icon('image')}只放公共环境照片，不要拍到具体住户门牌或陌生人正脸。</p></div>
    <label class="check-line"><input type="checkbox" name="truth" ${draft ? (draft.truth !== false ? 'checked' : '') : (s ? 'checked' : '')} /><span>我确认这是自己实际走过的公共区域，愿意让邻里补充不同体验。</span></label>
    <div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>先不分享</button><button class="btn btn-primary" type="submit">${isEdit ? '保存地点信息' : '发布遛猫地点'}</button></div>
  </form>`);
  const initialPick = (draft && Number.isFinite(Number(draft.lat))) ? { lat: Number(draft.lat), lng: Number(draft.lng) }
    : (s && Number.isFinite(Number(s.lat))) ? { lat: Number(s.lat), lng: Number(s.lng) }
    : (state.geo ? { lat: state.geo.lat, lng: state.geo.lng }
    : (MAP_SPOTS.find((item) => item.id === state.placeSpot) || MAP_SPOTS[0]));
  initSpotPicker('webPlacePickerHost', initialPick, (picked) => {
    if (!state.placeDraft) state.placeDraft = {};
    state.placeDraft.lat = picked.lat;
    state.placeDraft.lng = picked.lng;
  });
}


/* 27-app.js */
const PAGE_IDS = ['home', 'map', 'publish', 'community', 'services', 'service', 'profile', 'admin'];
const TAB_ITEMS = [
  { id: 'home', label: '发现', icon: 'compass' },
  { id: 'map', label: '地图', icon: 'map' },
  { id: 'publish', label: '上报', icon: 'plus' },
  { id: 'community', label: '广场', icon: 'square' },
  { id: 'profile', label: '我的', icon: 'user' }
];

function isLiked(post) { return state.likedPosts.includes(post.id); }
function postLikes(post) { return Number(post.likes || 0) + (isLiked(post) ? 1 : 0); }

function activeNavId() { return state.page === 'service' ? 'services' : state.page; }

function renderTabbar() {
  const root = $('#webTabbar');
  if (!root) return;
  const active = activeNavId();
  root.innerHTML = TAB_ITEMS.map((item) => `
    <button type="button" class="tab ${active === item.id ? 'is-active' : ''} ${item.id === 'publish' ? 'tab-publish' : ''}" data-page="${item.id}" ${active === item.id ? 'aria-current="page"' : ''}>
      ${item.id === 'publish' ? `<span class="tab-orb">${icon('plus')}</span>` : icon(item.icon)}
      <span>${item.label}</span>
    </button>`).join('');
}

function currentPage() {
  const pages = {
    home: renderHome,
    map: renderMap,
    publish: renderPublish,
    community: renderCommunity,
    services: renderServices,
    service: renderServiceDetail,
    profile: renderProfile,
    admin: renderAdmin
  };
  return (pages[state.page] || renderHome)();
}

function renderApp(options = {}) {
  const preserveScroll = options.preserveScroll === true;
  const scrollY = window.scrollY;
  renderHeader();
  renderTabbar();
  const view = $('#webView');
  if (!view) return;
  view.innerHTML = currentPage();
  bindSearch();
  initLiveMap();
  if (state.page === 'publish') {
    const host = $('#webPubPickerHost');
    if (host && (!spotPickerMap || !host.contains(spotPickerMap.getContainer()))) {
      initSpotPicker('webPubPickerHost', state.publish.picked || MAP_SPOTS.find((item) => item.id === state.publish.spot) || MAP_SPOTS[0], (picked) => {
        state.publish.picked = picked;
      });
    }
  } else if (spotPickerMap && state.page !== 'service') {
    closeSpotPicker();
  }
  if (state.page === 'admin' && state.user && state.user.isAdmin) {
    if (!state.admin.stats) fetchAdminStats();
    const listType = adminListType();
    if (listType && (!state.admin.list || state.admin.list.type !== listType)) fetchAdminList(listType);
  }
  window.scrollTo({ top: preserveScroll ? scrollY : 0, left: 0, behavior: 'auto' });
}

function hashPage() {
  const page = decodeURIComponent(location.hash.replace(/^#/, ''));
  return PAGE_IDS.includes(page) ? page : null;
}

function syncHash(page) {
  try {
    if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
  } catch (error) { /* file URLs may reject history updates */ }
}

function navigate(page) {
  const next = PAGE_IDS.includes(page) ? page : 'home';
  closeModal();
  state.page = next;
  syncHash(next);
  renderApp();
}

function openCat(id) {
  if (!catById(id)) return;
  state.selectedCat = id;
  catModal();
}

function openPost(id) {
  const post = postById(id);
  if (post) articleModal(post);
}

function openService(id) {
  if (!allPlaces().some((item) => item.id === id)) return;
  state.selectedService = id;
  state.page = 'service';
  syncHash('service');
  renderApp();
}

function toggleFavorite(id) {
  if (!requireAuth()) return;
  const cat = catById(id);
  const shouldFavorite = !state.favorites.includes(id);
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
  } else {
    state.favorites.push(id);
  }
  save();
  apiWrite(`/api/cats/${encodeURIComponent(id)}/favorite`, { method: 'POST' });
  if ($('#webOverlay .modal-detail')) catModal();
  else renderApp({ preserveScroll: true });
  toast(shouldFavorite ? `已收藏${cat ? cat.name : ''}，稍后再来看看` : '已取消收藏');
}

function toggleLike(id) {
  if (!requireAuth()) return;
  if (state.likedPosts.includes(id)) {
    state.likedPosts = state.likedPosts.filter((item) => item !== id);
    toast('已取消点赞');
  } else {
    state.likedPosts.push(id);
    toast('已点赞，稍后可在「我的 · 点赞」回看');
  }
  save();
  apiWrite(`/api/posts/${encodeURIComponent(id)}/like`, { method: 'POST', body: JSON.stringify({ liked: state.likedPosts.includes(id) }) });
  const active = state.activePost;
  if (active) articleModal(postById(active));
  else renderApp({ preserveScroll: true });
}

function bindSearch() {
  const input = $('#webSearch');
  if (!input) return;
  input.addEventListener('input', (event) => {
    state.query = event.target.value;
    updateHomeResults();
  });
}

function updateHomeResults() {
  const grid = $('#webCatGrid');
  if (!grid) return;
  const list = filteredCats();
  grid.innerHTML = list.length ? list.map((cat, index) => catTile(cat, index)).join('') : emptyCatsWeb();
  const meta = $('.result-meta');
  if (meta) meta.textContent = `${list.length} / ${availableCats().length} 只匹配`;
}

function resetFilters() {
  state.filters = { breed: '全部', age: '全部', sex: '全部', distance: DISTANCE_DEFAULT, citywide: false };
  state.quick = '全部';
  state.query = '';
}

function capturePublishForm() {
  const form = $('#webPublishForm');
  if (!form) return;
  const data = new FormData(form);
  ['name', 'breed', 'age', 'area', 'spot', 'note'].forEach((key) => {
    if (data.has(key)) state.publish[key] = String(data.get(key) || '');
  });
}

function publishPreview(source) {
  const p = source || state.publish;
  const photo = p.photos[0];
  const spot = MAP_SPOTS.find((item) => item.id === p.spot) || MAP_SPOTS[0];
  return `
    <div class="preview-kicker">LIVE PREVIEW · 邻里会看到</div>
    <div class="preview-photo">${photo ? `<img src="${photoSrc(photo)}" alt="预览猫照片" />` : `${icon('cat')}<span>选一张照片后预览</span>`}</div>
    <div class="preview-info"><h3>${esc(p.name || '还没有名字')}</h3><p>${esc(p.breed)} · ${esc(p.sex)} · ${esc(p.age)}</p><div class="preview-meta"><span>${icon('pin')}${esc(p.area || spot.label)}</span><span>${icon('shield')}${p.sterilized ? '疑似绝育' : '未绝育'}</span><span>${icon('paw')}${p.friendly ? '亲人可接近' : '比较怕生'}</span></div></div>`;
}

function refreshPublishPreview() {
  const card = $('#webPublishPreview');
  if (card) card.innerHTML = publishPreview();
}

function successModal(kind) {
  const isPublish = kind === 'publish';
  const title = isPublish ? '已经替它留了名。' : '申请已经送到。';
  const copy = isPublish
    ? '上报进入邻里核验。通过后会出现在附近发现与地图中。谢谢你没有只是路过。'
    : '上报人会在 48 小时内联系你。先约一次见面，不急着把猫带回家。';
  modal(`
    <div class="success-web">
      <div class="success-ring">${icon(isPublish ? 'paw' : 'send')}</div>
      <h2>${title}</h2>
      <p>${copy}</p>
      <div class="success-actions-web">
        <button class="btn" type="button" data-action="${isPublish ? 'back-home' : 'close-success'}">${isPublish ? '回到附近' : '继续看看'}</button>
        <button class="btn btn-primary" type="button" data-action="${isPublish ? 'view-published' : 'go-profile'}">${isPublish ? '看我上报的' : '查看我的申请'}</button>
      </div>
      <div class="success-foot">NO PAYMENT · NO RESELL · MEET FIRST</div>
    </div>`);
}

function infoModal(kind) {
  const info = {
    notice: {
      title: '附近的一点动静',
      body: `<p>翠苑二区南门，橘白猫“板栗”今天 08:42 被目击。目击者说它状态稳定，会主动蹭人。</p>
        <h3>附近动态</h3><ul><li>古荡新村：小灰的临时投喂点已补粮。</li><li>文三路：豆包等待疫苗完成，暂不接受领养。</li><li>沿河绿道：周六上午有群护队绝育车。</li></ul>`
    },
    settings: {
      title: '你的边界，你来定',
      body: `<p>闲猫默认不公开精确坐标。你的联系方式只在提交领养申请后对上报人可见。</p>
        <h3>实名与信用</h3><p>实名信息不会展示给其他用户，仅用于领养纠纷协调。邻里信用来自信息准确度、回访完成度和社区评价。</p>
        <div class="info-rule"><span>位置精度</span><b>只到街区</b></div>
        <div class="info-rule"><span>联系方式</span><b>申请后可见</b></div>
        <div class="info-rule"><span>领养费用</span><b>0 元</b></div>`
    },
    contact: {
      title: '先问清楚，再约见面',
      body: `<p>为了减少围堵和冲动领养，上报人的电话不会直接公开。提交领养申请并通过初审后，双方会交换联系方式。</p>
        <h3>第一次联系，建议先问</h3><ul><li>猫最近一次体检、驱虫和疫苗时间。</li><li>是否亲人，能否接受被摸、被抱。</li><li>约在公开、安静的街区见面，不单独进入对方家中。</li></ul>
        <div class="info-note">${icon('shield')} 领养不收取任何费用。遇到收费、配种或活体快递，请立即停止沟通。</div>`
    },
    recommend: {
      title: '推荐一家靠谱的店',
      body: `<p>闲猫的“附近好店”来自邻里真实推荐，收录不收费，不同体验都会保留。你可以推荐医院、猫粮店、猫咖，或适合牵绳散步、推车出门的遛猫地点。</p>
        <h3>写推荐时，尽量说清楚</h3><ul><li>你实际体验过什么项目，花了多少钱。</li><li>对猫是否温柔，有没有强行推销。</li><li>遛猫地点请补充：路面是否平整、是否允许牵绳、有无遛狗集中时段。</li></ul>
        <div class="info-note">${icon('shield')} 不接受商家付费排名，也不删除真实的不同体验。</div>`
    }
  }[kind] || {
    title: '先了解，再靠近',
    body: '<p>猫口点位只显示到街区，精确位置需要与上报人确认。</p>'
  };

  modal(`
    <div class="info-modal">
      <h2>${info.title}</h2>
      <div class="info-body">${info.body}</div>
      <div class="modal-actions">
        <button class="btn" type="button" data-close-modal>知道了</button>
        ${kind === 'recommend' ? `<button class="btn btn-primary" type="button" data-action="compose">去广场写一条</button>` : ''}
        ${kind === 'notice' ? `<button class="btn btn-primary" type="button" data-page="map">看看猫口地图</button>` : ''}
      </div>
    </div>`);
}

function locationModal() {
  const places = [
    { name: '翠苑 · 西湖区', meta: '当前区域 · 约 3km' },
    { name: '古荡 · 西湖区', meta: '2.1km 外 · 12 只猫' },
    { name: '文新 · 西湖区', meta: '3.4km 外 · 9 只猫' }
  ];
  modal(`
    <div class="location-modal">
      <h2>你现在看的是哪一带</h2>
      <p class="modal-sub">切换区域后，附近发现、猫口地图与好店会一起更新。定位只在本机用于计算距离，不上传服务器。</p>
      <div class="location-list">
        <button type="button" class="location-option ${state.geo ? 'is-active' : ''}" data-action="use-geo"><span>${icon('locate')}<b>使用我的位置</b></span><small>${state.geo ? '已开启 · 距离按你的真实位置计算' : '按你的真实位置计算附近发现与好店的距离'}</small>${state.geo ? icon('check') : icon('chevron')}</button>
        ${places.map((place) => `<button type="button" class="location-option ${!state.geo && state.location === place.name ? 'is-active' : ''}" data-location="${esc(place.name)}"><span>${icon('pin')}<b>${esc(place.name)}</b></span><small>${esc(place.meta)}</small>${!state.geo && state.location === place.name ? icon('check') : icon('chevron')}</button>`).join('')}
      </div>
    </div>`);
}

function copyText(text) {
  if (!text) return Promise.reject(new Error('empty'));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); } catch (error) { /* ignore */ }
  area.remove();
}

function handleAction(name, el) {
  if (name === 'scroll-to-cats') {
    $('#webCatGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (name === 'filters') { filterModal(); return; }
  if (name === 'reset-map') { resetMapView(); return; }
  if (name === 'open-map-full') { openFullMap(); return; }
  if (name === 'toggle-cat-list') { state.mapShowAll = !state.mapShowAll; renderApp({ preserveScroll: true }); return; }
  if (name === 'reset-filters') {
    resetFilters();
    closeModal();
    renderApp();
    toast('已清空筛选');
    return;
  }
  if (name === 'apply-filters') {
    closeModal();
    renderApp({ preserveScroll: true });
    toast(`筛好了，剩下 ${filteredCats().length} 只 · ${distanceScopeLabel()}`);
    return;
  }
  if (name === 'toggle-citywide') {
    state.filters.citywide = !isCitywide();
    const scrollTop = $('.filter-modal .modal')?.scrollTop || 0;
    filterModal();
    const reopened = $('.filter-modal .modal');
    if (reopened) reopened.scrollTop = scrollTop;
    return;
  }
  if (name === 'toggle-pub') {
    capturePublishForm();
    state.publish[el.dataset.key] = !state.publish[el.dataset.key];
    renderApp({ preserveScroll: true });
    return;
  }
  if (name === 'upload-photo') {
    openUploadPicker(el.dataset.target || 'publish', Number(el.dataset.slot || 0));
    return;
  }
  if (name === 'pick-photo') {
    state.photoSlot = Number(el.dataset.slot || 0);
    photoPickerModal();
    return;
  }
  if (name === 'clear-photo') {
    state.publish.photos[state.photoSlot] = null;
    closeModal();
    renderApp({ preserveScroll: true });
    toast('已移除这张照片');
    return;
  }
  if (name === 'account') { accountModal(); return; }
  if (name === 'report') { reportModal(el.dataset.type, el.dataset.id); return; }
  if (name === 'use-geo') {
    if (state.geo) {
      saveGeo(null);
      renderHeader();
      renderApp({ preserveScroll: true });
      locationModal();
      toast('已切回杭州演示区');
    } else {
      requestGeolocation();
    }
    return;
  }
  if (name === 'compose') { if (requireAuth()) composeModal(); return; }
  if (name === 'compose-companion') { if (requireAuth()) companionModal(el.dataset.place || ''); return; }
  if (name === 'add-walk-place') { if (requireAuth()) placeModal(null); return; }
  if (name === 'edit-walk-place') {
    if (!requireAuth()) return;
    const service = allPlaces().find((item) => item.id === el.dataset.id);
    placeModal(service);
    return;
  }
  if (name === 'pick-compose-photo') { simplePhotoPicker('给这条笔记配一张照片', state.composePhoto, 'compose'); return; }
  if (name === 'pick-place-photo') {
    state.photoSlot = Number(el.dataset.slot || 0);
    const form = $('#webPlaceForm');
    if (form) {
      const data = new FormData(form);
      state.placeDraft = {
        ...(state.placeDraft || {}),
        id: form.dataset.id || '',
        name: String(data.get('name') || ''),
        area: String(data.get('area') || ''),
        environment: String(data.get('environment') || ''),
        advice: String(data.get('advice') || ''),
        experience: String(data.get('experience') || ''),
        hours: String(data.get('hours') || ''),
        spot: String(data.get('spot') || ''),
        truth: Boolean(data.get('truth')),
        photos: state.placeDraft && Array.isArray(state.placeDraft.photos) ? state.placeDraft.photos : ['', '', '']
      };
    }
    const current = state.placeDraft && Array.isArray(state.placeDraft.photos) ? state.placeDraft.photos[state.photoSlot] : null;
    simplePhotoPicker('选择一张环境照片', current || null, 'place');
    return;
  }
  if (name === 'write-review') {
    if (!requireAuth()) return;
    const service = allPlaces().find((item) => item.id === el.dataset.id) || allPlaces().find((item) => item.id === state.selectedService);
    state.reviewService = service ? service.id : state.selectedService;
    reviewModal(service);
    return;
  }
  if (name === 'copy-phone') {
    const phone = el.dataset.phone;
    if (!phone) { toast('这家店没有公开电话，建议先到店或查看邻里评价'); return; }
    copyText(phone).then(() => toast(`已复制 ${phone}`)).catch(() => toast(`联系电话：${phone}`));
    return;
  }
    if (name === 'recommend-service') { placeModal(null); return; }
  if (name === 'location') { locationModal(); return; }
  if (name === 'notice') {
    state.noticeRead = true;
    save();
    renderHeader();
    infoModal('notice');
    return;
  }
  if (name === 'settings') { infoModal('settings'); return; }
  if (name === 'contact-reporter') { infoModal('contact'); return; }
  if (name === 'apply') {
    state.selectedCat = el.dataset.id || state.selectedCat;
    applyModal();
    return;
  }
  if (name === 'view-application') {
    closeModal();
    state.profileTab = 'applications';
    navigate('profile');
    return;
  }
  if (name === 'go-profile') {
    closeModal();
    state.profileTab = 'applications';
    navigate('profile');
    return;
  }
  if (name === 'view-published') {
    closeModal();
    state.profileTab = 'published';
    navigate('profile');
    return;
  }
  if (name === 'back-home') { closeModal(); navigate('home'); return; }
  if (name === 'close-success') { closeModal(); return; }
  if (name === 'reset-demo') {
    localStorage.removeItem(STORE);
    location.reload();
    return;
  }
}

document.addEventListener('click', (event) => {
  const authTab = event.target.closest('[data-auth-tab]');
  if (authTab) { event.preventDefault(); authModal(authTab.dataset.authTab); return; }

  if (event.target.closest('[data-logout]')) {
    event.preventDefault();
    saveAuth('');
    state.user = null;
    state.favorites = [];
    state.applications = [];
    state.adoptions = [];
    state.likedPosts = [];
    state.admin.stats = null;
    state.admin.list = null;
    closeModal();
    toast('已退出登录');
    renderApp();
    return;
  }

  const chip = event.target.closest('[data-picker-spot]');
  if (chip) { event.preventDefault(); pickSpotById(chip.dataset.pickerSpot); return; }

  const pwEyeBtn = event.target.closest('[data-pw-eye]');
  if (pwEyeBtn) {
    event.preventDefault();
    const input = document.getElementById(pwEyeBtn.dataset.pwEye);
    if (input) {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      const use = pwEyeBtn.querySelector('use');
      if (use) use.setAttribute('href', show ? '#i-eye-off' : '#i-eye');
      pwEyeBtn.setAttribute('aria-label', show ? '隐藏密码' : '显示或隐藏密码');
    }
    return;
  }

  const adminTabBtn = event.target.closest('[data-admin-tab]');
  if (adminTabBtn) { event.preventDefault(); state.admin.tab = adminTabBtn.dataset.adminTab; renderApp({ preserveScroll: true }); return; }

  const adminTypeBtn = event.target.closest('[data-admin-type]');
  if (adminTypeBtn) { event.preventDefault(); state.admin.contentType = adminTypeBtn.dataset.adminType; fetchAdminList(state.admin.contentType); return; }

  const adminStatusBtn = event.target.closest('[data-admin-status]');
  if (adminStatusBtn) {
    event.preventDefault();
    const parts = adminStatusBtn.dataset.adminStatus.split(':');
    state.admin.status[parts[0]] = parts[1];
    state.admin.page[parts[0]] = 1;
    fetchAdminList(parts[0]);
    return;
  }

  const adminGoBtn = event.target.closest('[data-admin-go]');
  if (adminGoBtn) {
    event.preventDefault();
    const type = adminGoBtn.dataset.adminGo;
    const input = document.querySelector('[data-admin-search="' + type + '"]');
    state.admin.q[type] = (input && input.value || '').trim();
    state.admin.page[type] = 1;
    fetchAdminList(type);
    return;
  }

  const adminPageBtn = event.target.closest('[data-admin-page]');
  if (adminPageBtn) {
    event.preventDefault();
    const parts = adminPageBtn.dataset.adminPage.split(':');
    state.admin.page[parts[0]] = Number(parts[1]);
    fetchAdminList(parts[0]);
    return;
  }

  const adminActionBtn = event.target.closest('[data-admin-action]');
  if (adminActionBtn) { event.preventDefault(); apiAdmin(`/api/admin/${adminActionBtn.dataset.adminAction}/${encodeURIComponent(adminActionBtn.dataset.id)}/${adminActionBtn.dataset.actionType}`, {}); return; }

  const adminResolveBtn = event.target.closest('[data-admin-resolve]');
  if (adminResolveBtn) { event.preventDefault(); apiAdmin(`/api/admin/reports/${adminResolveBtn.dataset.adminResolve}/resolve`, {}); return; }

  const adminUserBtn = event.target.closest('[data-admin-user]');
  if (adminUserBtn) { event.preventDefault(); apiAdmin(`/api/admin/users/${adminUserBtn.dataset.adminUser}`, { is_admin: adminUserBtn.dataset.isAdmin === '1' }); return; }

  const close = event.target.closest('[data-close-modal]');
  if (close) { event.preventDefault(); closeModal(); return; }

  const fav = event.target.closest('[data-fav]');
  if (fav) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(fav.dataset.fav);
    return;
  }

  const cat = event.target.closest('[data-open-cat]');
  if (cat) { event.preventDefault(); openCat(cat.dataset.openCat); return; }

  const post = event.target.closest('[data-open-post]');
  if (post) { event.preventDefault(); openPost(post.dataset.openPost); return; }

  const service = event.target.closest('[data-open-service]');
  if (service) { event.preventDefault(); openService(service.dataset.openService); return; }

  const quick = event.target.closest('[data-quick]');
  if (quick) {
    state.quick = quick.dataset.quick;
    renderApp({ preserveScroll: true });
    return;
  }

  const filter = event.target.closest('[data-filter-key]');
  if (filter) {
    state.filters[filter.dataset.filterKey] = filter.dataset.filterValue;
    $$('[data-filter-key="' + filter.dataset.filterKey + '"]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.filterValue === filter.dataset.filterValue));
    const result = $('[data-filter-result]');
    const action = $('[data-action="apply-filters"]');
    if (result) result.textContent = filteredCats().length;
    if (action) action.textContent = '看看 ' + filteredCats().length + ' 只猫';
    return;
  }

  const communityFilter = event.target.closest('[data-community-filter]');
  if (communityFilter) {
    state.communityFilter = communityFilter.dataset.communityFilter;
    renderApp({ preserveScroll: true });
    return;
  }

  const serviceFilter = event.target.closest('[data-service-filter]');
  if (serviceFilter) {
    state.servicesFilter = serviceFilter.dataset.serviceFilter;
    renderApp({ preserveScroll: true });
    return;
  }

  const profileTab = event.target.closest('[data-profile-tab]');
  if (profileTab) {
    state.profileTab = profileTab.dataset.profileTab;
    renderApp({ preserveScroll: true });
    return;
  }

  const seg = event.target.closest('[data-pub-seg]');
  if (seg) {
    capturePublishForm();
    state.publish[seg.dataset.pubSeg] = seg.dataset.value;
    renderApp({ preserveScroll: true });
    return;
  }

  const like = event.target.closest('[data-like-post]');
  if (like) { toggleLike(like.dataset.likePost); return; }

  const simplePick = event.target.closest('[data-pick-simple-photo]');
  if (simplePick) {
    const photo = simplePick.dataset.pickSimplePhoto;
    const action = simplePick.dataset.photoAction;
    if (action === 'compose') {
      state.composePhoto = photo;
      closeModal();
      composeModal();
    } else {
      const draft = state.placeDraft || { id: '', photos: ['', '', ''] };
      const photos = Array.isArray(draft.photos) ? draft.photos.slice() : ['', '', ''];
      while (photos.length < 3) photos.push('');
      photos[state.photoSlot] = photo;
      state.placeDraft = { ...draft, photos, truth: true };
      closeModal();
      const service = draft.id ? allPlaces().find((item) => item.id === draft.id) : null;
      placeModal(service || null);
    }
    return;
  }

  const simpleClear = event.target.closest('[data-clear-simple-photo]');
  if (simpleClear) {
    if (simpleClear.dataset.clearSimplePhoto === 'compose') state.composePhoto = null;
    else if (state.placeDraft) {
      const photos = state.placeDraft.photos.slice();
      photos[state.photoSlot] = '';
      state.placeDraft = { ...state.placeDraft, photos };
    } else state.placePhoto = null;
    closeModal();
    if (simpleClear.dataset.clearSimplePhoto === 'compose') composeModal();
    else placeModal(null);
    return;
  }

  const pick = event.target.closest('[data-pick-photo]');
  if (pick) {
    const photos = state.publish.photos.slice();
    while (photos.length < 3) photos.push(null);
    const chosen = pick.dataset.pickPhoto;
    for (let i = 0; i < photos.length; i += 1) {
      if (i !== state.photoSlot && photos[i] === chosen) photos[i] = null;
    }
    photos[state.photoSlot] = chosen;
    state.publish.photos = photos;
    closeModal();
    renderApp({ preserveScroll: true });
    toast('已放入照片位');
    return;
  }

  const composeTag = event.target.closest('[data-compose-tag]');
  if (composeTag) {
    state.composeTag = composeTag.dataset.composeTag;
    $$('[data-compose-tag]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.composeTag === state.composeTag));
    return;
  }

  const star = event.target.closest('[data-web-star]');
  if (star) {
    state.reviewStars = Number(star.dataset.webStar);
    $$('[data-web-star]').forEach((btn) => btn.classList.toggle('is-on', Number(btn.dataset.webStar) <= state.reviewStars));
    return;
  }

  const location = event.target.closest('[data-location]');
  if (location) {
    state.location = location.dataset.location;
    if (state.geo) {
      state.geo = null;
      saveGeo(null);
      applyGeoDistances();
    }
    save();
    renderHeader();
    renderApp({ preserveScroll: true });
    locationModal();
    toast(`已切换到 ${state.location}`);
    return;
  }

  const page = event.target.closest('[data-page]');
  if (page) {
    event.preventDefault();
    navigate(page.dataset.page);
    return;
  }

  const mapLayerButton = event.target.closest('[data-map-layer]');
  if (mapLayerButton) {
    event.preventDefault();
    setMapLayer(mapLayerButton.dataset.mapLayer);
    return;
  }

  const mapLocate = event.target.closest('[data-map-locate]');
  if (mapLocate) {
    event.preventDefault();
    locateCatOnMap(mapLocate.dataset.mapLocate);
    return;
  }

  const closeFull = event.target.closest('[data-close-full-map]');
  if (closeFull) { event.preventDefault(); closeFullMap(); return; }

  const fullLayer = event.target.closest('[data-full-layer]');
  if (fullLayer) { event.preventDefault(); switchFullMapLayer(fullLayer.dataset.fullLayer); return; }

  const mapOpen = event.target.closest('.map-open-hit, [data-action="open-map-full"]');
  if (mapOpen) { event.preventDefault(); openFullMap(); return; }

  const action = event.target.closest('[data-action]');
  if (action) {
    event.preventDefault();
    handleAction(action.dataset.action, action);
  }
});

let uploadPickerInput = null;

function openUploadPicker(target, slot) {
  if (uploadPickerInput) uploadPickerInput.remove();
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/jpeg,image/png,image/webp';
  picker.style.position = 'fixed';
  picker.style.left = '-9999px';
  picker.dataset.uploadInput = target;
  picker.dataset.slot = String(slot);
  picker.addEventListener('change', () => setTimeout(() => picker.remove(), 1200));
  document.body.appendChild(picker);
  uploadPickerInput = picker;
  picker.click();
}

function reopenUploadTarget(target, slot) {
  if (target === 'compose') { simplePhotoPicker('给这条笔记配一张照片', state.composePhoto, 'compose'); return; }
  if (target === 'place') {
    const service = allPlaces().find((item) => item.id === state.selectedService);
    const editable = service && service.type === '遛猫的地方' && service.submittedBy === userName() ? service : null;
    placeModal(editable);
    return;
  }
  state.photoSlot = slot;
  photoPickerModal();
}

async function handlePhotoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) { toast('这张照片超过 12MB，请先压缩或换一张'); input.value = ''; return; }
  const target = input.dataset.uploadInput;
  const slot = Number(input.dataset.slot || 0);
  toast('正在压缩照片…');
  try {
    const dataUrl = await compressImage(file, 1200, 0.78);
    if (target === 'compose') {
      state.composePhoto = dataUrl;
      closeModal();
      composeModal();
      toast('照片已放入，长边压缩到 1200px');
      return;
    }
    if (target === 'place') {
      const photos = state.placeDraft && Array.isArray(state.placeDraft.photos) ? state.placeDraft.photos.slice() : ['', '', ''];
      while (photos.length < 3) photos.push('');
      photos[slot] = dataUrl;
      state.placeDraft = { ...(state.placeDraft || { id: '' }), photos, truth: true };
      closeModal();
      const service = state.placeDraft.id ? allPlaces().find((item) => item.id === state.placeDraft.id) : null;
      placeModal(service || null);
      toast('环境照片已放入，表单内容已保留');
      return;
    }
    const photos = state.publish.photos.slice();
    while (photos.length < 3) photos.push(null);
    photos[slot] = dataUrl;
    state.publish.photos = photos;
    closeModal();
    renderApp({ preserveScroll: true });
    toast('照片已放入主图位');
  } catch (error) {
    toast(error.message || '照片处理失败，换一张试试');
  } finally {
    input.value = '';
  }
}

document.addEventListener('change', (event) => {
  const upload = event.target.closest('[data-upload-input]');
  if (upload) { handlePhotoUpload(upload); return; }
  if (event.target.closest('#webPublishForm')) {
    capturePublishForm();
    refreshPublishPreview();
  }
});


document.addEventListener('submit', (event) => {
  const form = event.target;

  if (form.id === 'webReportForm') {
    event.preventDefault();
    const data = new FormData(form);
    const reason = String(data.get('reason') || '');
    const detail = String(data.get('detail') || '').trim();
    const error = $('.form-error', form);
    API.request('/api/reports', { method: 'POST', body: JSON.stringify({ targetType: form.dataset.type, targetId: form.dataset.id, reason: detail ? `${reason}：${detail}` : reason }) }).then(() => {
      closeModal();
      toast('举报已提交，管理员会尽快处理');
    }).catch((requestError) => {
      if (error) error.textContent = requestError.message;
    });
    return;
  }

  if (form.id === 'webAuthForm') {
    event.preventDefault();
    const data = new FormData(form);
    const mode = form.dataset.mode === 'register' ? 'register' : 'login';
    const payload = {
      username: String(data.get('username') || '').trim(),
      password: String(data.get('password') || '')
    };
    if (mode === 'register') {
      payload.nickname = String(data.get('nickname') || '').trim();
      payload.password2 = String(data.get('password2') || '');
    }
    const error = $('.form-error', form);
    if (!payload.username) { if (error) error.textContent = '写一个用户名吧。'; return; }
    if (mode === 'register' && payload.password.length < 6) { if (error) error.textContent = '密码至少 6 位。'; return; }
    if (mode === 'register' && payload.password !== payload.password2) { if (error) error.textContent = '两次输入的密码不一致。'; return; }
    if (!payload.password) { if (error) error.textContent = '输入密码。'; return; }
    API.request(mode === 'register' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }).then((res) => {
      saveAuth(res.token);
      closeModal();
      toast(`欢迎，${res.user.name}`);
      return refreshBootstrap();
    }).catch((requestError) => {
      if (error) error.textContent = requestError.message;
    });
    return;
  }

  if (form.id === 'webProfileForm') {
    event.preventDefault();
    if (!state.user) return;
    const data = new FormData(form);
    const error = $('.form-error', form);
    API.request('/api/auth/profile', { method: 'POST', body: JSON.stringify({ nickname: String(data.get('nickname') || '').trim(), area: String(data.get('area') || '').trim() }) }).then((payload) => {
      applyBootstrap(payload);
      closeModal();
      toast('资料已更新');
      renderApp({ preserveScroll: true });
    }).catch((requestError) => {
      if (error) error.textContent = requestError.message;
    });
    return;
  }

  if (form.id === 'webApplyForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const error = $('.form-error', form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const reason = String(data.get('reason') || '').trim();
    if (!name || !phone || !reason) {
      if (error) error.textContent = '请把称呼、联系方式和申请理由填完整。';
      return;
    }
    if (!data.get('agree')) {
      if (error) error.textContent = '请先确认你理解领养不是购买，并愿意接受回访。';
      return;
    }
    const cat = catById(state.selectedCat);
    if (!cat) { toast('没有找到这只猫的档案'); return; }
    state.form = { name, phone, home: String(data.get('home') || ''), experience: String(data.get('experience') || ''), reason, agree: true };
    state.applications = [{ catId: cat.id, time: '刚刚', home: state.form.home, experience: state.form.experience, status: '等待初审' }].concat(state.applications);
    save();
    apiWrite(`/api/cats/${encodeURIComponent(cat.id)}/applications`, {
      method: 'POST',
      body: JSON.stringify({ name, phone, home: state.form.home, experience: state.form.experience, reason })
    });
    closeModal();
    successModal('apply');
    return;
  }

  if (form.id === 'webPublishForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    capturePublishForm();
    const p = state.publish;
    if (!p.photos[0]) { toast('先给猫选一张照片吧'); return; }
    if (!p.name.trim()) { toast('给它一个称呼，方便邻里辨认'); $('#webPubName')?.focus(); return; }
    if (!p.area.trim()) { toast('请填一个大致位置，不需要门牌号'); $('#webPubArea')?.focus(); return; }
    const ageGroup = p.age === '0–1 个月' || p.age === '1–3 个月' || p.age === '3–12 个月' ? '幼年' : p.age === '3 岁以上' ? '老年' : '成年';
    const spot = MAP_SPOTS.find((item) => item.id === p.spot) || MAP_SPOTS[0];
    const picked = state.publish.picked || { lat: spot.lat, lng: spot.lng };
    const cat = {
      id: 'pub-' + Date.now(),
      name: p.name.trim(),
      english: 'NEW NEIGHBOR',
      age: p.age === '不确定' ? '年龄未知' : p.age,
      ageMonths: p.age === '0–1 个月' ? 0.5 : p.age === '1–3 个月' ? 2 : p.age === '3–12 个月' ? 7 : p.age === '1–3 岁' ? 24 : p.age === '3 岁以上' ? 48 : 0,
      ageGroup,
      sex: p.sex,
      breed: p.breed,
      color: '待补充',
      distance: 0.6,
      area: p.area.trim(),
      areaShort: p.area.split('·')[0].trim(),
      status: '邻里上报',
      urgent: true,
      photo: p.photos[0],
      healthTags: [p.sterilized ? '疑似绝育' : '未绝育', p.friendly ? '亲人' : '怕生', '待核验'],
      traits: ['待补充'],
      note: p.note.trim() || '邻里刚刚上报，更多信息还在补充中。',
      reporter: state.user.name,
      reporterRole: `${state.user.area || '附近邻里'} · 邻里认证`,
      time: '刚刚',
      lat: picked.lat + (Math.random() - 0.5) * 0.0007,
      lng: picked.lng + (Math.random() - 0.5) * 0.0009,
      verification: '待核验',
      views: 0,
      applications: 0,
      reportedAt: new Date().toISOString(),
      healthBadge: '等待邻里核验',
      sterilization: p.sterilized ? '疑似已绝育' : '未绝育',
      vaccine: '未知',
      deworm: '未知',
      foster: '待确认'
    };
    state.published = state.published.concat(cat);
    save();
    apiWrite('/api/cats', {
      method: 'POST',
      body: JSON.stringify({
        name: cat.name, breed: cat.breed, color: cat.color, sex: cat.sex, age: cat.age,
        ageMonths: cat.ageMonths, ageGroup: cat.ageGroup, photo: cat.photo, note: cat.note,
        area: cat.area, lat: cat.lat, lng: cat.lng, traits: cat.traits, healthTags: cat.healthTags,
        sterilization: cat.sterilization, vaccine: cat.vaccine, deworm: cat.deworm, distance: cat.distance
      })
    });
    state.publish = { name: '', breed: '中华田园猫', age: '1–3 个月', sex: '公', area: '', spot: 'cuiyuan', note: '', photos: [], sterilized: true, friendly: true };
    renderApp({ preserveScroll: true });
    successModal('publish');
    return;
  }

  if (form.id === 'webComposeForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    const error = $('.form-error', form);
    if (!title || !body) {
      if (error) error.textContent = '标题和正文都写一点吧。';
      return;
    }
    const post = {
      id: 'p' + Date.now(),
      author: state.user.name,
      avatar: state.user.avatar,
      tone: '',
      time: '刚刚',
      place: String(data.get('place') || '翠苑二区').trim(),
      tag: state.composeTag,
      tagClass: state.composeTag === '捉猫实录' ? 'is-trap' : state.composeTag === '就医体验' ? 'is-pit' : state.composeTag === '猫咖打卡' ? 'is-checkin' : state.composeTag === '遛猫地点' ? 'is-walk' : state.composeTag === '猫友同路' ? 'is-companion' : '',
      title,
      excerpt: body.slice(0, 70),
      likes: 0,
      comments: 0,
      image: state.composePhoto || '',
      featured: false,
      body: '<p>' + esc(body).replace(/\n/g, '<br />') + '</p>',
      commentsList: []
    };
    state.posts.unshift(post);
    save();
    apiWrite('/api/posts', { method: 'POST', body: JSON.stringify({ id: post.id, tag: post.tag, title, body, place: post.place, image: post.image }) });
    state.composePhoto = null;
    closeModal();
    state.communityFilter = '全部';
    navigate('community');
    toast('已发布到广场，可以在「我的 · 我的发帖」找到');
    return;
  }

  if (form.id === 'webCompanionForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    const place = String(data.get('place') || '').trim();
    const time = String(data.get('time') || '').trim();
    const cat = String(data.get('cat') || '').trim();
    const want = String(data.get('want') || '').trim();
    const error = $('.form-error', form);
    if (!title || !body) { if (error) error.textContent = '写清楚想找什么样的搭子，以及自家猫的适应程度。'; return; }
    if (!data.get('safe')) { if (error) error.textContent = '请先确认公开地点见面和猫的应激边界。'; return; }
    const post = {
      id: 'p' + Date.now(), author: state.user.name, avatar: state.user.avatar, tone: '', time: '刚刚', place,
      tag: '猫友同路', tagClass: 'is-companion', title, excerpt: body.slice(0, 70),
      likes: 0, comments: 0, image: '', featured: false,
      body: `<p>${esc(body).replace(/\n/g, '<br />')}</p><p class="companion-meta">见面地点：${esc(place)}${time ? ' · ' + esc(time) : ''}<br />自家猫：${esc(cat)}<br />希望遇到：${esc(want)}</p>`,
      commentsList: []
    };
    state.posts.unshift(post);
    save();
    apiWrite('/api/posts', { method: 'POST', body: JSON.stringify({ id: post.id, tag: post.tag, title, body: `${body}\n\n见面地点：${place}${time ? ' · ' + time : ''}\n自家猫：${cat}\n希望遇到：${want}`, place }) });
    closeModal();
    state.communityFilter = '猫友同路';
    navigate('community');
    toast('同路邀请已发布，记得先在公开地点见一面');
    return;
  }

  if (form.id === 'webCommentForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    const error = $('.form-error', form);
    if (!text) {
      if (error) error.textContent = '写一句回应再发吧。';
      return;
    }
    const post = postById(form.dataset.postId);
    if (!post) return;
    const comment = { name: state.user.name, text, time: '刚刚' };
    post.commentsList = (post.commentsList || []).concat(comment);
    post.comments = post.commentsList.length;
    const savedIndex = state.posts.findIndex((item) => item.id === post.id);
    if (savedIndex >= 0) state.posts[savedIndex] = { ...state.posts[savedIndex], ...post };
    else state.posts.push({ ...post });
    save();
    apiWrite(`/api/posts/${encodeURIComponent(post.id)}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
    articleModal(post);
    toast('回应已发出，会计入你的社区贡献');
    return;
  }

  if (form.id === 'webPlaceForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const area = String(data.get('area') || '').trim();
    const environment = String(data.get('environment') || '').trim();
    const advice = String(data.get('advice') || '').trim();
    const experience = String(data.get('experience') || '').trim();
    const hours = String(data.get('hours') || '').trim() || '全天开放';
    const error = $('.form-error', form);
    if (!name || !area) {
      if (error) error.textContent = '至少写清地点名和所在区域。';
      return;
    }
    if (!environment || !advice) {
      if (error) error.textContent = '补一句环境描述和适合/提醒，别人才能判断要不要去。';
      return;
    }
    const spot = MAP_SPOTS.find((item) => item.id === state.placeSpot) || MAP_SPOTS[0];
    const pickedLat = state.placeDraft && Number.isFinite(Number(state.placeDraft.lat)) ? Number(state.placeDraft.lat) : spot.lat;
    const pickedLng = state.placeDraft && Number.isFinite(Number(state.placeDraft.lng)) ? Number(state.placeDraft.lng) : spot.lng;
    const existing = allPlaces().find((item) => item.id === form.dataset.id);
    const photos = state.placeDraft && Array.isArray(state.placeDraft.photos)
      ? state.placeDraft.photos.filter(Boolean)
      : (state.placePhoto ? [state.placePhoto] : (existing && existing.photos ? existing.photos : []));
    const place = {
      id: existing ? existing.id : 'walk-' + Date.now(),
      name,
      type: '遛猫的地方',
      icon: 'i-tree',
      markClass: 'is-walk',
      rating: existing ? existing.rating : 5,
      count: existing ? existing.count : 1,
      sub: environment.slice(0, 28) || '邻里补充的遛猫路线',
      tags: advice.split(/[，。；、\n]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 3),
      distance: existing ? existing.distance : 0.8,
      hours,
      address: area,
      price: '免费',
      phone: existing ? existing.phone : '',
      note: environment,
      spot: spot.id,
      lat: pickedLat,
      lng: pickedLng,
      photos,
      details: { environment, advice, experience },
      submittedBy: state.user.name,
      reviews: existing ? existing.reviews : [{ name: state.user.name, avatar: state.user.avatar, tone: '', stars: 5, time: '刚刚', text: advice, tags: ['邻里实走'], photos }]
    };
    if (existing) Object.assign(existing, place);
    else SERVICES.unshift(place);
    const savedIndex = state.places.findIndex((item) => item.id === place.id);
    if (savedIndex >= 0) state.places[savedIndex] = place;
    else state.places.push(place);
    state.placePhoto = null;
    state.placeDraft = null;
    save();
    apiWrite('/api/places', { method: 'POST', body: JSON.stringify({ id: place.id, name, type: '遛猫的地方', area, address: area, lat: pickedLat, lng: pickedLng, environment, advice, experience, hours, photos: photos }) }).then((payload) => {
      if (payload && payload.duplicateOf) {
        const svcIndex = SERVICES.findIndex((item) => item.id === place.id);
        if (svcIndex >= 0) SERVICES.splice(svcIndex, 1);
        state.places = state.places.filter((item) => item.id !== place.id);
        save();
        state.servicesFilter = '遛猫地点';
        toast(`这里已经有一条「${payload.duplicateName}」，带你去看看`);
        openService(payload.duplicateOf);
      }
    });
    state.servicesFilter = '遛猫地点';
    state.selectedService = place.id;
    closeModal();
    state.page = 'service';
    syncHash('service');
    renderApp();
    toast(existing ? '地点信息已更新' : '遛猫地点已收录，感谢你替邻居探路');
    return;
  }

  if (form.id === 'webReviewForm') {
    event.preventDefault();
    if (!requireAuth()) return;
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    const error = $('.form-error', form);
    if (!text) {
      if (error) error.textContent = '写一句真实感受吧。';
      return;
    }
    const service = allPlaces().find((item) => item.id === state.reviewService);
    if (service) {
      const good = String(data.get('good') || '').trim();
      const bad = String(data.get('bad') || '').trim();
      const tags = [good, bad].filter((tag) => tag && tag !== '没有');
      service.reviews.unshift({ name: state.user.name, avatar: state.user.avatar, tone: '', stars: state.reviewStars, time: '刚刚', text, tags });
      service.rating = Number(((Number(service.rating) * service.count + state.reviewStars) / (service.count + 1)).toFixed(1));
      service.count += 1;
      const savedIndex = state.places.findIndex((item) => item.id === service.id);
      if (savedIndex >= 0) state.places[savedIndex] = { ...state.places[savedIndex], ...service };
      else state.places.push({ ...service });
      save();
      apiWrite(`/api/places/${encodeURIComponent(service.id)}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ stars: state.reviewStars, text, tags })
      });
    }
    closeModal();
    renderApp({ preserveScroll: true });
    toast('评价已发布，谢谢你留下真实体验');
  }
});

document.addEventListener('keydown', (event) => {
  const adminSearch = event.target.closest && event.target.closest('[data-admin-search]');
  if (adminSearch && event.key === 'Enter') {
    event.preventDefault();
    const type = adminSearch.dataset.adminSearch;
    state.admin.q[type] = (adminSearch.value || '').trim();
    state.admin.page[type] = 1;
    fetchAdminList(type);
    return;
  }
  if (event.key === 'Escape') { closeFullMap(); closeModal(); return; }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target.closest('[data-open-cat], [data-open-post], [data-open-service]');
  if (!target || target !== event.target) return;
  if (target.tagName === 'BUTTON' || target.tagName === 'A') return;
  event.preventDefault();
  target.click();
});


window.addEventListener('popstate', () => {
  const page = hashPage();
  if (!page || page === state.page) return;
  closeModal();
  state.page = page;
  renderApp();
});

load();
if (state.geo) applyGeoDistances();
if (API.enabled) {
  API.request('/api/bootstrap').then((payload) => {
    applyBootstrap(payload);
    renderApp({ preserveScroll: true });
  }).catch((error) => console.warn('[xianmao] using localStorage fallback', error));
}
const initialPage = hashPage();
if (initialPage) state.page = initialPage;
renderApp();
if (API.enabled) setTimeout(maybeRequestGeo, 1200);

window.xianmao = {
  state,
  cats: allCats,
  go: navigate,
  reset() {
    localStorage.removeItem(STORE);
    location.reload();
  }
};
