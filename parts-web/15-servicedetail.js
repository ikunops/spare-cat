function renderServiceDetail() {
  const s = allPlaces().find((item) => item.id === state.selectedService) || SERVICES[0];
  const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="icon" style="${i < n ? '' : 'opacity:.18'}" aria-hidden="true"><use href="#i-star"></use></svg>`).join('');
  const related = allPlaces().filter((x) => x.id !== s.id).slice(0, 3);
  return `
    <div class="service-detail-head">
      <div>
        <button class="back-link" type="button" data-page="services">${icon('arrow-left')}回到附近好店</button>
        <div class="page-head-kicker" style="margin-top:17px">${esc(serviceTypeLabel(s.type))} · ${s.distance} KM AWAY · ${s.open ? '营业中' : '休息中'}</div>
        <h1>${esc(s.name)}</h1>
        <p>${esc(s.sub)}。收录来自邻里推荐，评价保留真实体验，不收取排名费用。</p>
        <div class="service-meta-line"><span>${icon('clock')}${esc(s.hours)}</span><span>${icon('pin')}${esc(s.address)}</span><span>${icon('send')}${esc(s.phone || '暂无电话')}</span></div>
      </div>
      <div class="stats">
        <div class="big-rating"><b>${s.rating}</b><div class="stars">${stars(5)}</div></div>
        <p>${s.count} 条邻里评价 · 综合推荐</p>
        <div class="score-lines">
          <div class="score-line"><span>专业</span><span class="track"><i class="fill" style="display:block;width:94%"></i></span><b>4.8</b></div>
          <div class="score-line"><span>价格</span><span class="track"><i class="fill" style="display:block;width:82%"></i></span><b>4.2</b></div>
          <div class="score-line"><span>态度</span><span class="track"><i class="fill" style="display:block;width:91%"></i></span><b>4.7</b></div>
          <div class="score-line"><span>环境</span><span class="track"><i class="fill" style="display:block;width:87%"></i></span><b>4.5</b></div>
        </div>
      </div>
    </div>
    <div class="service-detail-grid">
      <div class="service-detail-main">
        <div class="service-intro">
          <div class="info-item"><span>营业时间 / HOURS</span><b>${esc(s.hours)}</b></div>
          <div class="info-item"><span>参考价格 / PRICE</span><b>${esc(s.price)}</b></div>
          <div class="info-item wide"><span>地址 / ADDRESS</span><b>${esc(s.address)}</b></div>
        </div>
        <div class="service-tagline-web">${esc(s.note)}</div>
        ${s.photos && s.photos.length ? `<div class="service-photo-strip">${s.photos.map((photo) => `<img src="${photoSrc(photo)}" alt="${esc(s.name)} 的环境照片" />`).join('')}</div>` : ''}
        ${s.details ? `<div class="service-extra-details"><div><span>环境描述</span><p>${esc(s.details.environment || '暂未补充')}</p></div><div><span>适合与提醒</span><p>${esc(s.details.advice || '暂未补充')}</p></div>${s.details.experience ? `<div><span>遛猫心得</span><p>${esc(s.details.experience)}</p></div>` : ''}</div>` : ''}
        ${s.type === '遛猫的地方' ? `<button class="companion-invite" type="button" data-action="compose-companion" data-place="${esc(s.name)}">${icon('paw')}在这个地点找猫友同路<span>先公开见面，不交换住址和电话</span></button>` : ''}
        <div class="review-block">
          <div class="review-block-head"><h2>邻里怎么说 <span>${s.count} REVIEWS</span></h2><div class="review-block-actions">${s.type === '遛猫的地方' && s.submittedBy === '林小满' ? `<button type="button" data-action="edit-walk-place" data-id="${s.id}">${icon('edit')}补充地点</button>` : ''}<button type="button" data-action="write-review" data-id="${s.id}">${icon('edit')}写评价</button></div></div>
          ${s.reviews.map((r) => `<div class="review-web"><div class="review-web-head">${contributorAvatar(r.name, r.avatar, r.tone)}<div><b>${esc(r.name)}</b><span>${esc(r.time)}</span><small class="contributor-line">${contributorBadge(r.name, true)}</small></div><span class="review-web-stars">${stars(r.stars)}</span></div><p>${esc(r.text)}</p><div class="review-web-tags">${r.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>`).join('')}
        </div>
      </div>
      <aside class="service-detail-aside">
        <div class="aside-map">${bigMapSvg()}<span class="pin"></span><span class="map-label">${esc(s.address)} · 仅到街区</span></div>
        <div class="aside-contact"><b>${s.type === '遛猫的地方' ? '去之前，先确认' : '去之前，先问一句'}</b><p>${s.type === '医院' ? '是否有夜诊、是否接流浪猫、群护折扣怎么算。' : s.type === '猫咖' ? '今天哪些猫状态好，是否接受领养咨询。' : s.type === '遛猫的地方' ? '哪一段路人少、是否允许牵绳入内、附近有没有遛狗集中时段。' : '营业时间、停车与是否需要预约。'}</p><button type="button" data-action="copy-phone" data-phone="${esc(s.phone)}">${icon('send')}${s.phone ? '复制联系电话' : '查看联系方式'}</button></div>
        ${s.submittedBy ? `<div class="aside-contact place-submitter-web"><b>地点由邻里补充</b><div class="place-submitter-person">${contributorAvatar(s.submittedBy, s.submittedBy.slice(0, 1))}<div><strong>${esc(s.submittedBy)}</strong>${contributorBadge(s.submittedBy, true)}</div></div><p>环境、时段和照片由分享者亲历补充，后续体验欢迎继续留言。</p><button type="button" data-action="compose">${icon('edit')}写一条遛猫心得</button></div>` : ''}
        <div class="aside-related"><h3>顺路再去</h3>${related.map((r) => `<button class="related-service" type="button" data-open-service="${r.id}"><span class="service-tile-icon ${r.markClass}">${icon(r.icon.replace('i-', ''))}</span><div><b>${esc(r.name)}</b><span>${esc(r.type)} · ${r.distance}km · ${r.rating}</span></div>${icon('chevron')}</button>`).join('')}</div>
      </aside>
    </div>`;
}
