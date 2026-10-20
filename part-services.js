function renderServices() {
  const filters = ['全部', '医院', '商店', '猫咖', '去处'];
  const list = state.servicesFilter === '全部' ? services : services.filter((s) => s.type === state.servicesFilter);
  return `
    <div class="services-page">
      <div class="services-hero">
        <div class="services-top">
          <button class="round-btn" type="button" data-action="back-home" aria-label="返回">${icon('arrow-left')}</button>
          <span class="seal">荐</span>
        </div>
        <div class="page-kicker">NEIGHBORHOOD PICKS · 邻里亲测</div>
        <h1>街角那些<br />靠谱的地方。</h1>
        <p>医院、猫粮、猫咖、溜猫去处。不是广告位，是邻居们真的去过、愿意再去的地方。</p>
        <div class="hero-stats">
          <div><b>4</b><span>家收录</span></div>
          <div><b>4.7</b><span>平均评分</span></div>
          <div><b>476</b><span>条真实评价</span></div>
        </div>
      </div>
      <div class="services-filter">${filters.map((f) => `<button class="chip ${state.servicesFilter === f ? 'is-active' : ''}" type="button" data-service-filter="${f}">${f}</button>`).join('')}</div>
      <div class="services-list">
        ${list.map((service) => serviceCard(service)).join('')}
      </div>
      <div class="services-note">${icon('shield')}收录不收取费用。评价只记录亲历，保留不同体验；商家可以公开回复，但不能删除评价。遇到纠纷，建议先联系平台邻里协调员。</div>
    </div>`;
}

function serviceCard(service) {
  return `
    <button class="service-card" type="button" data-open-service="${service.id}">
      <span class="service-mark ${service.markClass}">${icon(service.icon.replace('i-', ''))}<span>${esc(service.type)}</span></span>
      <span class="service-info">
        <span class="service-name-row"><h3>${esc(service.name)}</h3><span class="service-rating">${icon('star')}${service.rating}</span></span>
        <span class="service-sub">${esc(service.sub)}</span>
        <span class="service-tags">${service.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</span>
        <span class="service-meta">${icon('pin')}${service.distance}km · ${esc(service.price)}<span class="service-open">${icon('chevron')}查看</span></span>
      </span>
    </button>`;
}

function renderServiceDetail() {
  const service = services.find((s) => s.id === state.reviewService) || services[0];
  const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="icon ${i < n ? 'is-on' : ''}" aria-hidden="true"><use href="#i-star"></use></svg>`).join('');
  return `
    <div class="services-page">
      <div class="service-detail-hero">
        <div class="service-detail-top">
          <button class="round-btn" type="button" data-action="back-services" aria-label="返回好店列表">${icon('arrow-left')}</button>
          <button class="round-btn" type="button" data-action="share-service" aria-label="分享这家店">${icon('send')}</button>
        </div>
        <div class="detail-kicker">${esc(service.type)} · ${service.distance} KM AWAY · ${service.open ? '营业中' : '休息中'}</div>
        <h1>${esc(service.name)}</h1>
        <p>${esc(service.sub)}</p>
      </div>
      <div class="service-detail-body">
        <div class="rating-summary">
          <div class="rating-big"><b>${service.rating}</b><div class="stars">${stars(5)}</div><span>${service.count} 条邻里评价</span></div>
          <div class="score-bars">
            <div class="score-row"><span>专业</span><span class="score-track"><i class="score-fill" style="width:94%"></i></span><b>4.8</b></div>
            <div class="score-row"><span>价格</span><span class="score-track"><i class="score-fill" style="width:82%"></i></span><b>4.2</b></div>
            <div class="score-row"><span>态度</span><span class="score-track"><i class="score-fill" style="width:91%"></i></span><b>4.7</b></div>
            <div class="score-row"><span>环境</span><span class="score-track"><i class="score-fill" style="width:87%"></i></span><b>4.5</b></div>
          </div>
        </div>
        <div class="service-info-grid">
          <div class="service-info-item"><span>营业时间</span><b>${esc(service.hours)}</b></div>
          <div class="service-info-item"><span>地址</span><b>${esc(service.address)}</b></div>
          <div class="service-info-item"><span>参考价格</span><b>${esc(service.price)}</b></div>
          <div class="service-info-item"><span>联系电话</span><b>${esc(service.phone || '暂无')}</b></div>
        </div>
        <div class="service-tagline">${esc(service.note)}</div>
        <div class="review-head"><h2>邻里怎么说</h2><button type="button" data-action="write-review" data-id="${service.id}">${icon('edit')}写评价</button></div>
        ${service.reviews.map((review) => `
          <div class="review">
            <div class="review-top"><span class="avatar ${review.tone}">${esc(review.avatar)}</span><div><b>${esc(review.name)}</b><span>${esc(review.time)}</span></div><span class="review-stars">${stars(review.stars)}</span></div>
            <p>${esc(review.text)}</p>
            <div class="review-tags">${review.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
          </div>`).join('')}
      </div>
      <div class="service-detail-foot"><button class="btn btn-primary" type="button" data-action="write-review" data-id="${service.id}">${icon('edit')}分享一次真实体验</button></div>
    </div>`;
}
