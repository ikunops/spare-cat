function catModal() {
  const cat = state.selectedCat ? catById(state.selectedCat) : null;
  if (!cat) return;
  const applied = state.applications.some((a) => a.catId === cat.id);
  modal(`
    <div class="detail-web">
      <div class="detail-web-photo"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}，${esc(cat.breed)}" /><button class="detail-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button><span class="photo-note">PHOTO BY NEIGHBOR · ${esc(cat.areaShort)}</span></div>
      <div class="detail-web-body">
        <div class="detail-web-kicker"><span>${esc(cat.english)} · ${esc(cat.areaShort)}</span><span>${cat.distance} KM AWAY</span></div>
        <div class="detail-web-name"><h2>${esc(cat.name)}</h2><span>${esc(cat.status)}</span></div>
        <div class="detail-web-meta"><span>${esc(cat.status)}</span>${cat.healthTags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="detail-web-facts"><div><b>${esc(cat.sex)}</b><span>性别 / SEX</span></div><div><b>${esc(cat.age)}</b><span>年龄 / AGE</span></div><div><b>${esc(cat.breed)}</b><span>品种 / BREED</span></div><div><b>${esc(cat.color)}</b><span>毛色 / COLOR</span></div></div>
        <div class="detail-web-section"><h3>关于它</h3><p>${esc(cat.note)}</p></div>
        <div class="detail-web-section"><h3>健康与照护</h3><div class="detail-health"><div><span>绝育 / NEUTERED</span><b>${esc(cat.sterilization)}</b></div><div><span>疫苗 / VACCINE</span><b>${esc(cat.vaccine)}</b></div><div><span>驱虫 / DEWORMED</span><b>${esc(cat.deworm)}</b></div><div><span>寄养 / FOSTER</span><b>${esc(cat.foster)}</b></div></div><p style="font-size:9px;color:var(--muted)">${esc(cat.healthBadge)}。领养前建议再次确认近期状态，并预约一次基础体检。</p></div>
        <div class="detail-web-section"><h3>遇见它的地方</h3><div class="detail-location"><span class="mini-thumb"></span><div><b>${esc(cat.area)}</b><p>仅显示到街区。为保护猫咪安全，精确位置需与上报人确认后提供。</p></div></div></div>
        <div class="detail-web-publisher"><span class="avatar ${cat.urgent ? 'is-orange' : ''}">${esc(cat.reporter.slice(0, 1))}</span><div><b>${esc(cat.reporter)}</b><span>${esc(cat.reporterRole)} · ${esc(cat.time)}</span></div><button class="btn btn-small" type="button" data-action="contact-reporter">${icon('send')}联系</button></div>
        <div class="detail-web-actions"><button class="secondary-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button><button class="btn btn-primary" type="button" data-action="${applied ? 'view-application' : 'apply'}" data-id="${cat.id}" ${applied ? 'disabled' : ''}>${applied ? '申请已提交 · 等待初审' : '申请领养 · 先见面再决定'}</button></div>
      </div>
    </div>`, 'modal-detail');
}
