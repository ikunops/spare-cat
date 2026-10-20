function applySheet() {
  const cat = selectedCat();
  if (!cat) return;
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>先认真回答几个问题</h2><p>这不是考试，是为了让双方都少一点冲动。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭申请表单">${icon('close')}</button></div>
      <div class="apply-summary"><img src="${A}${cat.photo}" alt="${esc(cat.name)}" /><div><b>${esc(cat.name)}</b><span>${esc(cat.breed)} · ${esc(cat.sex)} · ${esc(cat.areaShort)}</span></div></div>
      <form class="apply-form" id="applyForm">
        <div class="form-field"><label for="applyName">怎么称呼你</label><input class="input" id="applyName" name="name" placeholder="你的名字或昵称" value="${esc(state.form.name)}" /></div>
        <div class="form-field"><label for="applyPhone">联系方式（仅对上报人可见）</label><input class="input" id="applyPhone" name="phone" type="tel" placeholder="手机号或微信号" value="${esc(state.form.phone)}" /></div>
        <div class="form-row">
          <div class="form-field"><label for="applyHome">居住情况</label><div class="select-wrap"><select class="select" id="applyHome" name="home">${['整租 / 自有住房', '合租（室友同意）', '与家人同住', '其他'].map((v) => `<option ${state.form.home === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
          <div class="form-field"><label for="applyExp">养猫经验</label><div class="select-wrap"><select class="select" id="applyExp" name="experience">${['养过猫', '第一次养猫', '有照顾流浪猫经验', '暂无'].map((v) => `<option ${state.form.experience === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        </div>
        <div class="form-field"><label for="applyReason">为什么想了解它</label><textarea class="textarea" id="applyReason" name="reason" placeholder="说说你的居住环境、每天在家的时间，以及你理解它可能需要多长的适应期。">${esc(state.form.reason)}</textarea></div>
        <label class="check-line"><input type="checkbox" name="agree" ${state.form.agree ? 'checked' : ''} /><span>我理解领养不是购买。愿意接受双方见面、家访或视频回访，不因搬家、怀孕、掉毛等原因随意转送或遗弃。</span></label>
        <div class="form-error" role="alert"></div>
        <button class="btn btn-primary" type="submit">提交申请 · 等待上报人联系</button>
      </form>
    </div>`);
}
