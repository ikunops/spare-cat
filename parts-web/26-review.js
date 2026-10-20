function reviewModal(service) {
  if (!service) return;
  state.reviewStars = state.reviewStars || 5;
  modal(`<h2>分享一次真实体验</h2><p class="modal-sub">${esc(service.name)} · 评价会公开，商家可回复但不能删除，不同体验都会被保留。</p><form id="webReviewForm" style="margin-top:14px"><div class="form-field"><label>你给几颗星</label><div class="star-picker">${[1,2,3,4,5].map((n) => `<button type="button" class="${n <= state.reviewStars ? 'is-on' : ''}" data-web-star="${n}" aria-label="${n} 星">${icon('star')}</button>`).join('')}</div></div><div class="form-field"><label for="webReviewText">具体说说</label><textarea class="textarea" id="webReviewText" name="text" placeholder="什么让你觉得好？有什么需要提醒后来的人？"></textarea></div><div class="form-row"><div class="form-field"><label for="webReviewGood">最值得肯定</label><select class="select" id="webReviewGood" name="good">${['对猫温柔', '不推销', '价格透明', '环境干净', '适合新手'].map((v) => `<option>${v}</option>`).join('')}</select></div><div class="form-field"><label for="webReviewBad">需要提醒</label><select class="select" id="webReviewBad" name="bad">${['没有', '周末人多', '等位较久', '停车不便', '价格偏高'].map((v) => `<option>${v}</option>`).join('')}</select></div></div><div class="review-identity">${contributorAvatar('林小满', '林')}<div><b>林小满</b><span>${contributorBadge('林小满', true)}</span></div><small>评价会显示你的实名与社区贡献</small></div><div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button><button class="btn btn-primary" type="submit">发布评价</button></div></form>`);
}

function placeModal(service) {
  const s = service || null;
  const isEdit = Boolean(s && s.type === '遛猫的地方' && s.submittedBy === '林小满');
  const draft = state.placeDraft && state.placeDraft.id === (s ? s.id : '') ? state.placeDraft : null;
  const sourcePhotos = draft && Array.isArray(draft.photos) ? draft.photos : (s && Array.isArray(s.photos) ? s.photos : []);
  const photos = [0, 1, 2].map((index) => sourcePhotos[index] || '');
  const field = (key, fallback = '') => esc(draft && draft[key] !== undefined ? draft[key] : fallback);
  state.placeDraft = { ...(draft || {}), id: s ? s.id : '', photos };
  modal(`<h2>${isEdit ? '补充遛猫地点' : '分享一个遛猫地点'}</h2><p class="modal-sub">写下你亲自走过的路线和环境。具体判断留给后来的人，不替商家或地点下结论。</p><form id="webPlaceForm" data-id="${s ? esc(s.id) : ''}" style="margin-top:14px">
    <div class="form-row"><div class="form-field"><label for="webPlaceName">地点名</label><input class="input" id="webPlaceName" name="name" placeholder="比如：丰潭路沿河绿道" value="${field('name', s ? s.name : '')}" required /></div><div class="form-field"><label for="webPlaceArea">所在区域</label><input class="input" id="webPlaceArea" name="area" placeholder="比如：丰潭路 · 河岸边" value="${field('area', s ? (s.area || s.address || '') : '')}" required /></div></div>
    <div class="form-field"><label for="webPlaceEnvironment">环境描述</label><textarea class="textarea" id="webPlaceEnvironment" name="environment" placeholder="路面是否平整？有没有树荫、长椅、水源？人多不多？">${field('environment', s && s.details ? (s.details.environment || '') : '')}</textarea></div>
    <div class="form-field"><label for="webPlaceAdvice">优点、适合谁，以及要提醒的时段</label><textarea class="textarea" id="webPlaceAdvice" name="advice" placeholder="比如：适合已经习惯牵绳的猫；傍晚遛狗的人多，建议错峰；第一次出门先用推车。">${field('advice', s && s.details ? (s.details.advice || '') : '')}</textarea></div>
    <div class="form-field"><label for="webPlaceExperience">你的遛猫心得（可选）</label><textarea class="textarea" id="webPlaceExperience" name="experience" placeholder="第一次带猫来是什么反应？哪一段最好走？有什么只有走过才知道的细节？">${field('experience', s && s.details ? (s.details.experience || '') : '')}</textarea></div>
    <div class="form-row"><div class="form-field"><label for="webPlaceHours">适合时段</label><input class="input" id="webPlaceHours" name="hours" placeholder="比如：全天开放 · 建议傍晚" value="${field('hours', s ? s.hours : '')}" /></div><div class="form-field"><label for="webPlaceSpot">地图落点</label><div class="select-wrap"><select class="select" id="webPlaceSpot" name="spot">${MAP_SPOTS.map((spot) => `<option value="${spot.id}" ${(draft && draft.spot ? draft.spot : (s ? s.spot : state.placeSpot)) === spot.id ? 'selected' : ''}>${esc(spot.label)}</option>`).join('')}</select></div></div></div>
    <div class="form-field"><label>环境照片（可选，最多 3 张）</label><div class="place-photo-line">${[0,1,2].map((index) => { const photo = photos[index]; return `<button type="button" class="place-photo ${photo ? 'has-photo' : ''}" data-action="pick-place-photo" data-slot="${index}">${photo ? `<img src="${photoSrc(photo)}" alt="" />` : `${icon('camera')}<span>${index === 0 ? '主图' : '补充'}</span>`}</button>`; }).join('')}</div><p class="field-help">${icon('image')}只放公共环境照片，不要拍到具体住户门牌或陌生人正脸。</p></div>
    <label class="check-line"><input type="checkbox" name="truth" ${draft ? (draft.truth !== false ? 'checked' : '') : (s ? 'checked' : '')} /><span>我确认这是自己实际走过的公共区域，愿意让邻里补充不同体验。</span></label>
    <div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-close-modal>先不分享</button><button class="btn btn-primary" type="submit">${isEdit ? '保存地点信息' : '发布遛猫地点'}</button></div>
  </form>`);
}

