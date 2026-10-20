function renderProfile() {
  const favCats = allCats().filter((cat) => state.favorites.includes(cat.id));
  return `
    <div class="profile-hero">
      <div class="profile-top"><span class="seal">猫</span><span>MEMBER SINCE 2024 · 邻里编号 XM-0217</span></div>
      <div class="profile-id">
        <div class="profile-avatar">林</div>
        <div><h1>林小满</h1><p>翠苑二区 · 已实名 · 愿意先见面</p></div>
      </div>
      <div class="profile-credit">
        ${icon('shield')}<b>92</b><span>邻里信用 · 信息准确、按时回访</span><span class="credit-meter"><i style="width:92%"></i></span>
      </div>
    </div>
    <div class="profile-body">
      <div class="profile-stats">
        <button type="button" data-profile-tab="favorites"><b>${favCats.length}</b><span>收藏的猫</span></button>
        <button type="button" data-profile-tab="applications"><b>${state.applications.length}</b><span>领养申请</span></button>
        <button type="button" data-profile-tab="published"><b>${state.publishedCats.length + 1}</b><span>上报记录</span></button>
      </div>
      <div class="profile-tabs">
        <button type="button" class="${state.profileTab === 'favorites' ? 'is-active' : ''}" data-profile-tab="favorites">收藏</button>
        <button type="button" class="${state.profileTab === 'applications' ? 'is-active' : ''}" data-profile-tab="applications">领养申请</button>
        <button type="button" class="${state.profileTab === 'published' ? 'is-active' : ''}" data-profile-tab="published">我的上报</button>
      </div>
      <div class="profile-list">
        ${state.profileTab === 'favorites' ? renderFavorites(favCats) : state.profileTab === 'applications' ? renderApplications() : renderPublished()}
      </div>
      <div class="profile-settings">
        <button class="profile-setting" type="button" data-action="settings">${icon('shield')}领养信用与实名认证${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-action="settings">${icon('notebook')}领养回访记录${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-action="settings">${icon('settings')}隐私与精确位置${icon('chevron')}</button>
      </div>
      <div class="profile-footer">XIANMAO · 让附近的猫，被附近的人看见</div>
    </div>`;
}

function renderFavorites(favCats) {
  if (!favCats.length) return `<div class="profile-empty"><div class="empty-ring">${icon('heart')}</div><h3>还没有收藏的猫</h3><p>遇到想再想一想的猫，点一下心形。<br />它不会催你，但会在这里等你。</p><button type="button" data-nav="home">去附近看看</button></div>`;
  return favCats.map((cat) => `
    <div class="profile-cat-row">
      <img src="${A}${cat.photo}" alt="${esc(cat.name)}" />
      <button class="row-main" type="button" data-open-cat="${cat.id}"><h3>${esc(cat.name)}</h3><p>${esc(cat.breed)} · ${esc(cat.sex)} · ${cat.distance}km</p><span class="row-status ${cat.urgent ? 'is-wait' : ''}">${esc(cat.status)}</span></button>
      <button class="row-heart" type="button" data-fav="${cat.id}" aria-label="取消收藏 ${esc(cat.name)}">${icon('heart')}</button>
    </div>`).join('');
}

function renderApplications() {
  if (!state.applications.length) return `<div class="profile-empty"><div class="empty-ring">${icon('send')}</div><h3>还没有提交申请</h3><p>看到想认真了解的猫，可以提交领养申请。<br />平台会先安排双方见面，不收取任何费用。</p><button type="button" data-nav="home">去看看附近的猫</button></div>`;
  return state.applications.map((app) => {
    const cat = allCats().find((c) => c.id === app.catId);
    if (!cat) return '';
    return `
      <div class="application-row">
        <img src="${A}${cat.photo}" alt="${esc(cat.name)}" />
        <button class="row-main" type="button" data-open-cat="${cat.id}"><h3>${esc(cat.name)}</h3><p>${esc(app.time)} · ${esc(app.home)} · ${esc(app.experience)}</p></button>
        <span class="${app.status === '已通过初审' ? 'is-ok' : ''}">${esc(app.status)}</span>
      </div>`;
  }).join('');
}

function renderPublished() {
  const mine = state.publishedCats.concat([{ id: 'mine-1', name: '南门小橘', photo: 'cat-16.jpg', breed: '中华田园猫', status: '已由邻里核验', area: '翠苑二区 · 南门', time: '10 月 12 日' }]);
  return mine.map((cat) => `
    <div class="application-row">
      <img src="${A}${cat.photo}" alt="${esc(cat.name)}" />
      <button class="row-main" type="button" ${cat.id === 'mine-1' ? '' : `data-open-cat="${cat.id}"`}><h3>${esc(cat.name)}</h3><p>${esc(cat.area || '翠苑二区')} · ${esc(cat.status || '等待核验')}</p></button>
      <span class="is-ok">${cat.id === 'mine-1' ? '已核验' : '待核验'}</span>
    </div>`).join('');
}
