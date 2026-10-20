function openCat(id) {
  state.selectedCat = id;
  catDetail();
}

document.addEventListener('click', (event) => {
  const fav = event.target.closest('[data-fav]');
  if (fav) {
    event.preventDefault();
    event.stopPropagation();
    toggleFav(fav.dataset.fav);
    return;
  }
  const open = event.target.closest('[data-open-cat]');
  if (open) {
    event.preventDefault();
    openCat(open.dataset.openCat);
    return;
  }
  const nav = event.target.closest('[data-nav]');
  if (nav && !nav.closest('#overlayRoot')) {
    event.preventDefault();
    go(nav.dataset.nav);
    return;
  }
  const quick = event.target.closest('[data-quick]');
  if (quick) {
    state.quick = quick.dataset.quick;
    render();
    return;
  }
  const filter = event.target.closest('[data-filter-key]');
  if (filter) {
    state.filters[filter.dataset.filterKey] = filter.dataset.filterValue;
    filterSheet();
    return;
  }
  const mapPin = event.target.closest('[data-map-cat]');
  if (mapPin) {
    state.mapSelected = mapPin.dataset.mapCat;
    render();
    return;
  }
  const communityFilter = event.target.closest('[data-community-filter]');
  if (communityFilter) {
    state.communityFilter = communityFilter.dataset.communityFilter;
    render();
    return;
  }
  const serviceFilter = event.target.closest('[data-service-filter]');
  if (serviceFilter) {
    state.servicesFilter = serviceFilter.dataset.serviceFilter;
    render();
    return;
  }
  const service = event.target.closest('[data-open-service]');
  if (service) {
    state.reviewService = service.dataset.openService;
    state.nav = 'serviceDetail';
    render();
    return;
  }
  const profileTab = event.target.closest('[data-profile-tab]');
  if (profileTab) {
    state.profileTab = profileTab.dataset.profileTab;
    render();
    return;
  }
  const seg = event.target.closest('[data-pub-seg]');
  if (seg) {
    state.publish[seg.dataset.pubSeg] = seg.dataset.value;
    render();
    return;
  }
  const photo = event.target.closest('[data-pick-photo]');
  if (photo) {
    const chosen = photo.dataset.pickPhoto;
    if (!state.publish.photos.includes(chosen)) {
      state.publish.photos = state.publish.photos.concat(chosen).slice(0, 3);
    }
    closeOverlay();
    render();
    return;
  }
  const composeTag = event.target.closest('[data-compose-tag]');
  if (composeTag) {
    const wrap = composeTag.parentElement;
    Array.from(wrap.children).forEach((btn) => btn.classList.remove('is-active'));
    composeTag.classList.add('is-active');
    return;
  }
  const reviewStar = event.target.closest('[data-review-star]');
  if (reviewStar) {
    state.reviewStars = Number(reviewStar.dataset.reviewStar);
    const buttons = Array.from(reviewStar.parentElement.children);
    buttons.forEach((btn, index) => btn.classList.toggle('is-on', index < state.reviewStars));
    return;
  }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  event.preventDefault();
  const name = action.dataset.action;
  if (name === 'close-overlay') { closeOverlay(); return; }
  if (name === 'filters') { filterSheet(); return; }
  if (name === 'apply-filters') { closeOverlay(); render(); toast('筛选已更新'); return; }
  if (name === 'clear-filters') {
    state.filters = { breed: '全部', age: '全部', sex: '全部', distance: '3km' };
    state.quick = '全部';
    closeOverlay();
    render();
    toast('已清空筛选');
    return;
  }
  if (name === 'all-cats') {
    state.quick = '全部';
    state.query = '';
    render();
    const grid = $('#catGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (name === 'open-article') {
    articleView(posts.find((post) => post.id === action.dataset.id));
    return;
  }
  if (name === 'like-post') {
    const post = posts.find((item) => item.id === action.dataset.id);
    if (post) { post.likes += 1; toast('已记为有用'); if (state.selectedCat) {} else render(); }
    return;
  }
  if (name === 'compose') { composeSheet(); return; }
  if (name === 'pick-photo') { photoPicker(); return; }
  if (name === 'toggle-pub') {
    state.publish[action.dataset.key] = !state.publish[action.dataset.key];
    render();
    return;
  }
  if (name === 'apply') { state.selectedCat = action.dataset.id; applySheet(); return; }
  if (name === 'close-map-card') { state.mapSelected = null; render(); return; }
  if (name === 'back-home') { closeOverlay(); go('home'); return; }
  if (name === 'back-services') { state.nav = 'services'; render(); return; }
  if (name === 'write-review') { reviewSheet(services.find((s) => s.id === action.dataset.id)); return; }
  if (name === 'notice') { infoSheet('notice'); return; }
  if (name === 'location') { infoSheet('location'); return; }
  if (name === 'map-howto') { infoSheet('howto'); return; }
  if (name === 'settings') { infoSheet('settings'); return; }
  if (name === 'share-cat') { toast('链接已复制，可分享给邻居'); return; }
  if (name === 'contact-reporter') { toast('已向上报人发送联系请求'); return; }
  if (name === 'view-application') { toast('申请已提交，正在等待初审'); return; }
  if (name === 'view-published') { closeOverlay(); state.profileTab = 'published'; go('profile'); return; }
  if (name === 'go-profile') { closeOverlay(); state.profileTab = 'applications'; go('profile'); return; }
  if (name === 'share-service') { toast('已复制这家店的分享链接'); return; }
  if (name === 'search-community') { toast('在原型里试试上方的分类筛选'); return; }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id === 'applyForm') {
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
    state.form = { name, phone, home: String(data.get('home') || ''), experience: String(data.get('experience') || ''), reason, agree: true };
    const cat = selectedCat();
    state.applications = state.applications.concat({ catId: cat.id, time: '刚刚', home: state.form.home, experience: state.form.experience, status: '等待初审' });
    persist();
    closeOverlay();
    successSheet('apply');
    return;
  }
  if (form.id === 'publishForm') {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const area = String(data.get('area') || '').trim();
    if (!state.publish.photos.length) { toast('先给猫选一张照片吧'); return; }
    if (!name) { toast('给它一个称呼，方便邻里辨认'); $('#pubName')?.focus(); return; }
    if (!area) { toast('请填一个大致位置，不需要门牌号'); $('#pubArea')?.focus(); return; }
    const newCat = {
      id: 'pub-' + Date.now(), name, english: 'NEW NEIGHBOR', age: state.publish.age === '不确定' ? '年龄未知' : state.publish.age, ageGroup: state.publish.age === '幼年' ? '幼年' : '成年', sex: state.publish.sex,
      breed: state.publish.breed, color: '待补充', distance: 0.6, area, areaShort: area.split('·')[0].trim(), status: '邻里上报', urgent: true, photo: state.publish.photos[0],
      healthTags: [state.publish.sterilized ? '疑似绝育' : '未绝育', state.publish.friendly ? '亲人' : '怕生', '待核验'],
      traits: ['待补充'], note: state.publish.note || '邻里刚刚上报，更多信息还在补充中。',
      reporter: '林小满', reporterRole: '翠苑二区 · 已实名', time: '刚刚', lat: 48 + Math.random() * 12, lng: 30 + Math.random() * 24,
      healthBadge: '等待邻里核验', sterilization: state.publish.sterilized ? '疑似已绝育' : '未绝育', vaccine: '未知', deworm: '未知', foster: '待确认'
    };
    state.publishedCats = state.publishedCats.concat(newCat);
    persist();
    state.publish = { name: '', breed: '中华田园猫', age: '成年', sex: '公', area: '', note: '', photos: [], sterilized: true, friendly: true };
    successSheet('publish');
    return;
  }
  if (form.id === 'composeForm') {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    if (!title || !body) { const err = $('.form-error', form); if (err) err.textContent = '标题和正文都写一点吧。'; return; }
    posts.unshift({ id: 'p' + Date.now(), author: '林小满', avatar: '林', tone: '', time: '刚刚', place: '翠苑二区', tag: '邻里随记', tagClass: '', title, excerpt: body.slice(0, 70), likes: 0, comments: 0, image: '', featured: false, body: '<p>' + esc(body) + '</p>', commentsList: [] });
    closeOverlay();
    go('community');
    toast('已发布到广场');
    return;
  }
  if (form.id === 'reviewForm') {
    event.preventDefault();
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    if (!text) { const err = $('.form-error', form); if (err) err.textContent = '写一句真实感受吧。'; return; }
    const service = services.find((s) => s.id === state.reviewService);
    if (service) {
      service.reviews.unshift({ name: '林小满', avatar: '林', tone: '', stars: state.reviewStars, time: '刚刚', text, tags: [String(data.get('good') || '')].filter(Boolean) });
      service.count += 1;
    }
    closeOverlay();
    render();
    toast('评价已发布，谢谢你留下真实体验');
    return;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeOverlay();
});

loadState();
render();

window.xianmao = {
  state,
  cats: allCats,
  reset() { localStorage.removeItem(STORE_KEY); location.reload(); },
  go
};
