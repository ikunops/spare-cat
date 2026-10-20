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


