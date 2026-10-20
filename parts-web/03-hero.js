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
