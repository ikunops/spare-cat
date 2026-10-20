function renderPublish() {
  const p = state.publish;
  const sel = (key, val) => p[key] === val ? 'is-active' : '';
  const slotPhoto = (index) => p.photos[index] || null;
  return `
    <header class="page-head">
      <div><div class="page-head-kicker">REPORT A CAT · 上报一只猫</div><h1>替它留一个<br /><em>名字</em>。</h1><p>不需要很完整。一张照片、一个大致位置，就足够让关心它的人找到它。请勿公开精确门牌号。</p></div>
      <div class="page-head-side"><span>NO ACCOUNT NEEDED</span><span>REVIEW IN 48 HOURS</span><span>NEIGHBOR VERIFIED</span></div>
    </header>
    <div class="publish-layout">
      <div class="publish-form-panel">
        <form id="webPublishForm">
          <div class="form-card">
            <div class="form-card-head"><span class="num">01</span><h2>先给它一张照片</h2><small>最多 3 张</small></div>
            <div class="photo-grid">
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="0">${slotPhoto(0) ? `<img src="${photoSrc(slotPhoto(0))}" alt="已选择的猫照片" /><span class="photo-badge">主图</span><span class="change-photo">更换</span>` : `${icon('camera')}<span>添加照片</span>`}</button>
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="1">${slotPhoto(1) ? `<img src="${photoSrc(slotPhoto(1))}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('plus')}<span>补充</span>`}</button>
              <button class="photo-slot" type="button" data-action="upload-photo" data-target="publish" data-slot="2">${slotPhoto(2) ? `<img src="${photoSrc(slotPhoto(2))}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('image')}<span>环境</span>`}</button>
            </div>
            <p class="photo-note">尽量拍清楚毛色和体型。不要开闪光灯，不要为了拍照追赶它。</p>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">02</span><h2>它是谁</h2><small>不知道也可以留空</small></div>
            <div class="form-field"><label for="webPubName">你给它的称呼</label><input class="input" id="webPubName" name="name" placeholder="比如：南门小橘" value="${esc(p.name)}" /></div>
            <div class="form-row">
              <div class="form-field"><label for="webPubBreed">品种</label><div class="select-wrap"><select class="select" id="webPubBreed" name="breed">${['中华田园猫', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫', '英短', '美短', '布偶猫', '暹罗猫', '缅因猫', '加菲猫', '折耳猫', '银渐层', '金渐层', '混血 / 不确定'].map((v) => `<option ${p.breed === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
              <div class="form-field"><label for="webPubAge">月龄 / 年龄</label><div class="select-wrap"><select class="select" id="webPubAge" name="age">${['0–1 个月', '1–3 个月', '3–12 个月', '1–3 岁', '3 岁以上', '不确定'].map((v) => `<option ${p.age === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
            </div>
            <p class="field-help">${icon('paw')}按能确认的阶段选就好。幼猫月龄变化快，拿不准时选“不确定”。</p>
            <div class="form-field"><label>性别</label><div class="seg">${['公', '母', '不确定'].map((v) => `<button type="button" class="${sel('sex', v)}" data-pub-seg="sex" data-value="${v}">${v}</button>`).join('')}</div></div>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">03</span><h2>在哪里遇见</h2><small>只公开到街区</small></div>
            <div class="form-field"><label for="webPubArea">大致位置</label><input class="input" id="webPubArea" name="area" placeholder="比如：翠苑二区南门花坛" value="${esc(p.area)}" /></div>
            <div class="form-field"><label for="webPubSpot">地图上的落点</label><div class="select-wrap"><select class="select" id="webPubSpot" name="spot">${MAP_SPOTS.map((spot) => `<option value="${spot.id}" ${p.spot === spot.id ? 'selected' : ''}>${esc(spot.label)}</option>`).join('')}</select></div><p class="field-help">${icon('pin')}只精确到小区或路口，不会公开具体门牌。</p></div>
            <div class="toggle-row"><button class="toggle ${p.sterilized ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="sterilized" aria-label="切换绝育状态"></button><p>看起来已绝育（有耳标或剪耳）</p></div>
            <div class="toggle-row"><button class="toggle ${p.friendly ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="friendly" aria-label="切换亲人状态"></button><p>比较亲人，可以靠近</p></div>
          </div>
          <div class="form-card">
            <div class="form-card-head"><span class="num">04</span><h2>想补充的话</h2><small>可选</small></div>
            <div class="form-field"><label for="webPubNote">它的状态、习惯，或你担心的事</label><textarea class="textarea" id="webPubNote" name="note" placeholder="比如：每天都在花坛边，看到人会蹭过来，但不太敢进楼道。">${esc(p.note)}</textarea></div>
          </div>
          <div class="submit-bar"><p class="privacy-note">${icon('shield')} 请勿公开精确门牌号。上报后会经过邻里核验，通过后出现在附近发现与地图中。</p><button class="btn btn-primary" type="submit">${icon('send')}提交上报</button></div>
        </form>
      </div>
      <aside class="publish-aside"><div class="aside-sticky">
        <div class="preview-card" id="webPublishPreview">${publishPreview(p)}</div>
        <div class="aside-tips"><h3>上报前，先确认三件事</h3><ul><li>照片是最近拍的，能看清毛色和体型。</li><li>位置写到小区或街道即可，不要写门牌。</li><li>如果猫受伤、怀孕或带崽，请直接联系群护队。</li></ul></div>
        <div class="stamp-note"><i></i>NO TRADE · NO RESELL · MEET FIRST</div>
      </div></aside>
    </div>`;
}
