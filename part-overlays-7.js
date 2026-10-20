function reviewSheet(service) {
  if (!service) return;
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>分享一次真实体验</h2><p>${esc(service.name)} · 评价会公开，商家可回复但不能删除。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭评价">${icon('close')}</button></div>
      <form class="apply-form" id="reviewForm">
        <div class="form-field"><label>你给几颗星</label><div class="review-form-stars">${[1,2,3,4,5].map((n) => `<button type="button" class="${n <= state.reviewStars ? 'is-on' : ''}" data-review-star="${n}" aria-label="${n} 星">${icon('star')}</button>`).join('')}</div></div>
        <div class="form-field"><label for="reviewText">具体说说</label><textarea class="textarea" id="reviewText" name="text" placeholder="什么让你觉得好？有什么需要提醒后来的人？"></textarea></div>
        <div class="form-row"><div class="form-field"><label for="reviewGood">最值得肯定</label><select class="select" id="reviewGood" name="good">${['对猫温柔', '不推销', '价格透明', '环境干净', '适合新手'].map((v) => `<option>${v}</option>`).join('')}</select></div><div class="form-field"><label for="reviewBad">需要提醒</label><select class="select" id="reviewBad" name="bad">${['没有', '周末人多', '等位较久', '停车不便', '价格偏高'].map((v) => `<option>${v}</option>`).join('')}</select></div></div>
        <div class="form-error" role="alert"></div>
        <button class="btn btn-primary" type="submit">发布评价</button>
      </form>
    </div>`);
}
