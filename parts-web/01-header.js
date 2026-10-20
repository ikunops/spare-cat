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
        <button class="location-select" type="button" data-action="location">${icon('pin')}${esc(state.location)}${icon('chevron-down')}</button>
        <button class="header-store ${activePage === 'services' ? 'is-active' : ''}" type="button" data-page="services" aria-label="查看附近好店" ${activePage === 'services' ? 'aria-current="page"' : ''}>${icon('store')}<span>好店</span></button>
        <button class="header-icon" type="button" data-action="notice" aria-label="查看邻里提醒">${icon('bell')}${state.noticeRead ? '' : '<span class="dot"></span>'}</button>
        <button class="header-cta" type="button" data-page="publish">${icon('plus')}<span>上报一只猫</span></button>
      </div>
    </div>`;
}
