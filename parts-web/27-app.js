const PAGE_IDS = ['home', 'map', 'publish', 'community', 'services', 'service', 'profile'];
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
    profile: renderProfile
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
      <p class="modal-sub">切换区域后，附近发现、猫口地图与好店会一起更新。位置只用于筛选，不记录精确坐标。</p>
      <div class="location-list">
        ${places.map((place) => `<button type="button" class="location-option ${state.location === place.name ? 'is-active' : ''}" data-location="${esc(place.name)}"><span>${icon('pin')}<b>${esc(place.name)}</b></span><small>${esc(place.meta)}</small>${state.location === place.name ? icon('check') : icon('chevron')}</button>`).join('')}
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
  if (name === 'compose') { composeModal(); return; }
  if (name === 'compose-companion') { companionModal(el.dataset.place || ''); return; }
  if (name === 'add-walk-place') { placeModal(null); return; }
  if (name === 'edit-walk-place') {
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
    save();
    renderHeader();
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
    const editable = service && service.type === '遛猫的地方' && service.submittedBy === '林小满' ? service : null;
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

  if (form.id === 'webApplyForm') {
    event.preventDefault();
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
    capturePublishForm();
    const p = state.publish;
    if (!p.photos[0]) { toast('先给猫选一张照片吧'); return; }
    if (!p.name.trim()) { toast('给它一个称呼，方便邻里辨认'); $('#webPubName')?.focus(); return; }
    if (!p.area.trim()) { toast('请填一个大致位置，不需要门牌号'); $('#webPubArea')?.focus(); return; }
    const ageGroup = p.age === '0–1 个月' || p.age === '1–3 个月' || p.age === '3–12 个月' ? '幼年' : p.age === '3 岁以上' ? '老年' : '成年';
    const spot = MAP_SPOTS.find((item) => item.id === p.spot) || MAP_SPOTS[0];
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
      reporter: '林小满',
      reporterRole: '翠苑二区 · 已实名',
      time: '刚刚',
      lat: spot.lat + (Math.random() - 0.5) * 0.0007,
      lng: spot.lng + (Math.random() - 0.5) * 0.0009,
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
      author: '林小满',
      avatar: '林',
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
      id: 'p' + Date.now(), author: '林小满', avatar: '林', tone: '', time: '刚刚', place,
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
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    const error = $('.form-error', form);
    if (!text) {
      if (error) error.textContent = '写一句回应再发吧。';
      return;
    }
    const post = postById(form.dataset.postId);
    if (!post) return;
    const comment = { name: '林小满', text, time: '刚刚' };
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
    const spot = MAP_SPOTS.find((item) => item.id === String(data.get('spot') || '')) || MAP_SPOTS.find((item) => item.id === state.placeSpot) || MAP_SPOTS[0];
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
      photos,
      details: { environment, advice, experience },
      submittedBy: '林小满',
      reviews: existing ? existing.reviews : [{ name: '林小满', avatar: '林', tone: '', stars: 5, time: '刚刚', text: advice, tags: ['邻里实走'], photos }]
    };
    if (existing) Object.assign(existing, place);
    else SERVICES.unshift(place);
    const savedIndex = state.places.findIndex((item) => item.id === place.id);
    if (savedIndex >= 0) state.places[savedIndex] = place;
    else state.places.push(place);
    state.placePhoto = null;
    state.placeDraft = null;
    save();
    apiWrite('/api/places', { method: 'POST', body: JSON.stringify({ id: place.id, name, type: '遛猫的地方', area, address: area, lat: spot.lat, lng: spot.lng, environment, advice, experience, hours, photos: photos }) });
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
      service.reviews.unshift({ name: '林小满', avatar: '林', tone: '', stars: state.reviewStars, time: '刚刚', text, tags });
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
if (API.enabled) {
  API.request('/api/bootstrap').then((payload) => {
    applyBootstrap(payload);
    renderApp({ preserveScroll: true });
  }).catch((error) => console.warn('[xianmao] using localStorage fallback', error));
}
const initialPage = hashPage();
if (initialPage) state.page = initialPage;
renderApp();

window.xianmao = {
  state,
  cats: allCats,
  go: navigate,
  reset() {
    localStorage.removeItem(STORE);
    location.reload();
  }
};
