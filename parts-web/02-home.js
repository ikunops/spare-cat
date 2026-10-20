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
