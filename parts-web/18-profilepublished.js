function placeSubmissions() {
  return allPlaces().filter((place) => place.type === '遛猫的地方' && place.submittedBy === '林小满');
}

function profilePlaces(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('pin')}<h3>还没有分享过遛猫地点</h3><p>把你走过的公共路线、环境细节和错峰时段留给邻居。<br />照片只放公共区域，不拍门牌和陌生人正脸。</p><button type="button" data-action="add-walk-place">分享一个遛猫地点</button></div>`;
  return list.map((place) => {
    const photos = Array.isArray(place.photos) ? place.photos.filter(Boolean) : [];
    return `<div class="published-web place-submission-web">
      ${photos[0] ? `<img src="${photoSrc(photos[0])}" alt="${esc(place.name)} 的环境照片" />` : `<span class="profile-place-mark">${icon('pin')}</span>`}
      <div class="published-main" data-open-service="${place.id}" tabindex="0" role="button">
        <div class="published-head"><h3>${esc(place.name)}</h3><span class="is-ok">已分享</span></div>
        <p>${esc(place.address || '位置待补充')} · ${esc(place.hours || '全天开放')}</p>
        <p class="published-place">${icon('pin')}${esc(place.details && place.details.environment ? place.details.environment : '环境描述待补充')}</p>
        <div class="published-stats"><span>${icon('image')}${photos.length} 张环境照片</span><span>${icon('star')}${Number(place.count || 0)} 条评价</span></div>
      </div>
    </div>`;
  }).join('');
}

function profilePublished() {
  const mine = allCats().filter((cat) => isMine(cat));
  if (!mine.length) return `<div class="empty-state-web">${icon('paw')}<h3>还没有上报记录</h3><p>在附近遇见需要帮助的猫，可以替它留一份档案。<br />通过邻里核验后，会出现在发现和地图里。</p><button type="button" data-page="publish">上报一只猫</button></div>`;
  return mine.map((cat) => {
    const verified = cat.verification === '已核验';
    return `<div class="published-web">
      <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
      <div class="published-main" data-open-cat="${cat.id}" tabindex="0" role="button">
        <div class="published-head"><h3>${esc(cat.name)}</h3><span class="${verified ? 'is-ok' : 'is-pending'}">${verified ? '已核验' : '待核验'}</span></div>
        <p>${esc(cat.breed || '品种待补充')}${cat.color && cat.color !== '待补充' ? ' · ' + esc(cat.color) : ''} · ${esc(cat.age || '月龄待补充')} · ${esc(cat.sex || '')}</p>
        <p class="published-place">${icon('pin')}${esc(cat.area || '位置待补充')} · ${esc(cat.time || '刚刚')}</p>
        <div class="published-stats"><span>${icon('heart')}${Number(cat.views || 0)} 次浏览</span><span>${icon('send')}${Number(cat.applications || 0)} 份申请</span></div>
      </div>
    </div>`;
  }).join('');
}
