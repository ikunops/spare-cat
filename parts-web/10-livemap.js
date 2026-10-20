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




