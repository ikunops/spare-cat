function catDetail() {
  const cat = selectedCat();
  if (!cat) return;
  const applied = state.applications.some((app) => app.catId === cat.id);
  overlay(`
    <div class="sheet-scroll">
      <div class="detail-hero">
        <img class="hero-photo" src="${A}${cat.photo}" alt="${esc(cat.name)}，${esc(cat.breed)}" />
        <div class="detail-topbar">
          <button class="round-btn" type="button" data-action="close-overlay" aria-label="返回">${icon('arrow-left')}</button>
          <div class="detail-top-actions">
            <button class="round-btn" type="button" data-action="share-cat" aria-label="分享这只猫">${icon('send')}</button>
            <button class="round-btn ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button>
          </div>
        </div>
      </div>
      <div class="detail-sheet-head">
        <div class="detail-name-row">
          <div class="detail-name">${esc(cat.name)}<small>${esc(cat.english)} · ${esc(cat.areaShort)}</small></div>
          <span class="detail-distance">${cat.distance} km</span>
        </div>
        <div class="detail-tags">
          <span class="detail-tag is-accent">${esc(cat.status)}</span>
          ${cat.healthTags.map((tag) => `<span class="detail-tag">${esc(tag)}</span>`).join('')}
        </div>
        <div class="detail-meta-grid">
          <div><b>${esc(cat.sex)}</b><span>性别</span></div>
          <div><b>${esc(cat.age)}</b><span>年龄</span></div>
          <div><b>${esc(cat.breed)}</b><span>品种</span></div>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-block"><h3>关于它</h3><p>${esc(cat.note)}</p></div>
        <div class="detail-block">
          <h3>健康与照护</h3>
          <div class="detail-facts">
            <div class="fact"><span>绝育</span><b>${esc(cat.sterilization)}</b></div>
            <div class="fact"><span>疫苗</span><b>${esc(cat.vaccine)}</b></div>
            <div class="fact"><span>驱虫</span><b>${esc(cat.deworm)}</b></div>
            <div class="fact"><span>寄养</span><b>${esc(cat.foster)}</b></div>
          </div>
          <p>${esc(cat.healthBadge)}。领养前建议再次与上报人确认近期状态，并预约一次基础体检。</p>
        </div>
        <div class="detail-block">
          <h3>遇见它的地方</h3>
          <div class="location-card"><span class="location-map"></span><div><b>${esc(cat.area)}</b><p>仅显示到街区。为保护猫咪安全，精确位置需与上报人确认后提供。</p></div>${icon('pin')}</div>
        </div>
        <div class="publisher-card">
          <span class="avatar ${cat.urgent ? 'is-orange' : ''}">${esc(cat.reporter.slice(0, 1))}</span>
          <div><b>${esc(cat.reporter)}</b><span>${esc(cat.reporterRole)} · ${esc(cat.time)}</span></div>
          <button class="btn btn-small" type="button" data-action="contact-reporter">${icon('send')}联系</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="icon-btn ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button>
        <button class="btn ${applied ? 'btn-ghost' : 'btn-primary'}" type="button" data-action="${applied ? 'view-application' : 'apply'}" data-id="${cat.id}" ${applied ? 'disabled' : ''}>${applied ? '申请已提交 · 等待初审' : '申请领养 · 先见面再决定'}</button>
      </div>
    </div>`, true);
}
