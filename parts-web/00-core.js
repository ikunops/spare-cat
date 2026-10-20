const A = XianmaoData.assets;
const CATS = XianmaoData.cats;
const POSTS = XianmaoData.posts;
const SERVICES = XianmaoData.services;
const STORE = 'xianmao-web-v1';
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
      headers: { 'content-type': 'application/json' },
      ...options
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || '数据库请求失败');
    return payload;
  }
};

const state = {
  page: 'home',
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
const isMine = (cat) => Boolean(cat && (cat.reportedByMe || cat.reporter === '林小满'));

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
}

function apiWrite(path, options) {
  if (!API.enabled) return Promise.resolve(null);
  return API.request(path, options).then((payload) => {
    applyBootstrap(payload);
    return payload;
  }).catch((error) => {
    console.warn('[xianmao] database unavailable, keeping local state', error);
    return null;
  });
}
