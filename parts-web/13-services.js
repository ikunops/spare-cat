function serviceTile(s) {
  return `<article class="service-tile">
    <button class="service-tile-open" type="button" data-open-service="${s.id}" aria-label="查看 ${esc(s.name)}">
    <div class="service-tile-top"><span class="service-tile-icon ${s.markClass}">${icon(s.icon.replace('i-', ''))}</span><div style="flex:1"><h2>${esc(s.name)}</h2><div class="service-tile-sub">${esc(s.sub)}</div></div><span class="service-tile-score">${icon('star')}${s.rating}</span></div>
    ${s.photos && s.photos.length ? `<div class="service-tile-photo"><img src="${photoSrc(s.photos[0])}" alt="${esc(s.name)} 的环境照片" /></div>` : ''}
    <div class="service-tile-tags">${s.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="service-tile-bottom"><span class="open">${serviceTypeLabel(s.type)}</span><span>${esc(s.hours)}</span><span>· ${s.distance}km</span><span class="arrow">${icon('arrow-up-right')}</span></div>
    </button>
    ${s.type === '遛猫的地方' ? `<button class="service-tile-companion" type="button" data-action="compose-companion" data-place="${esc(s.name)}">${icon('paw')}在这里找猫友同路</button>` : ''}
  </article>`;
}

function photoSrc(photo) {
  return /^(data:|https?:)/.test(photo || '') ? photo : A + photo;
}
