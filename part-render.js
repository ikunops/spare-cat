function render() {
  const view = $('#view');
  if (!view) return;
  const pages = {
    home: renderHome,
    map: renderMap,
    publish: renderPublish,
    community: renderCommunity,
    profile: renderProfile,
    services: renderServices,
    serviceDetail: renderServiceDetail
  };
  const page = pages[state.nav] || renderHome;
  view.innerHTML = page();
  const hideTab = state.nav === 'services' || state.nav === 'serviceDetail';
  $('#tabbar').style.display = hideTab ? 'none' : 'grid';
  view.style.paddingBottom = hideTab ? '0' : '102px';
  if (state.nav === 'home') {
    const search = $('#searchInput');
    if (search) {
      search.addEventListener('input', (event) => {
        state.query = event.target.value;
        renderHomeList();
      });
    }
  }
  syncNav();
  view.scrollTop = 0;
}

function renderHomeList() {
  const grid = $('#catGrid');
  if (!grid) return;
  const list = filteredCats();
  grid.innerHTML = list.length ? list.map((cat, index) => catCard(cat, index)).join('') : emptyCats();
  const count = $('.home-hero .count');
  if (count) count.textContent = String(list.length);
  const result = $('.result-count');
  if (result) result.textContent = `${list.length} / ${allCats().length} 只`;
}

function rerenderKeepScroll() {
  const view = $('#view');
  const top = view ? view.scrollTop : 0;
  render();
  if (view) view.scrollTop = top;
}

function toggleFav(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
  } else {
    state.favorites.push(id);
  }
  persist();
  const cat = allCats().find((item) => item.id === id);
  toast(state.favorites.includes(id) ? `已收藏${cat ? cat.name : ''}，稍后再来看看` : '已取消收藏');
  if (state.selectedCat) {
    catDetail();
  } else {
    rerenderKeepScroll();
  }
}
