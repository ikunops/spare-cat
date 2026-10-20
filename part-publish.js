function renderPublish() {
  const photos = state.publish.photos;
  const sel = (key, value) => state.publish[key] === value ? 'is-active' : '';
  return `
    <div class="publish-head">
      <div class="page-kicker">REPORT A CAT · 上报一只猫</div>
      <h1>让附近的人，<br />知道它在这里。</h1>
      <p>不需要很完整。一张照片、一个大致位置，就足够让关心它的人找到它。</p>
      <div class="publish-progress"><span class="is-on"></span><span class="is-on"></span><span class="${photos.length ? 'is-on' : ''}"></span><small>01 / 03</small></div>
    </div>
    <form class="publish-form" id="publishForm">
      <div class="form-card">
        <div class="form-card-head"><span class="num">01</span><h2>先给它一张照片</h2><small>最多 3 张</small></div>
        <div class="photo-grid">
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="选择照片">
            ${photos[0] ? `<img src="${A}${photos[0]}" alt="已选择的猫照片" /><span class="photo-badge">主图</span><span class="change-photo">更换</span>` : `${icon('camera')}<span>添加照片</span>`}
          </button>
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="添加第二张照片">
            ${photos[1] ? `<img src="${A}${photos[1]}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('plus')}<span>补充</span>`}
          </button>
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="添加第三张照片">
            ${photos[2] ? `<img src="${A}${photos[2]}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('image')}<span>环境</span>`}
          </button>
        </div>
        <p class="photo-note">尽量拍清楚毛色和体型。不要开闪光灯，不要为了拍照追赶它。</p>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">02</span><h2>它是谁</h2><small>不知道也可以留空</small></div>
        <div class="form-field"><label for="pubName">你给它的称呼</label><input class="input" id="pubName" name="name" placeholder="比如：南门小橘" value="${esc(state.publish.name)}" /></div>
        <div class="form-row">
          <div class="form-field"><label for="pubBreed">品种</label><div class="select-wrap"><select class="select" id="pubBreed" name="breed">${['中华田园猫', '英短蓝猫', '奶牛猫', '狸花猫', '不确定'].map((v) => `<option ${state.publish.breed === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
          <div class="form-field"><label for="pubAge">年龄段</label><div class="select-wrap"><select class="select" id="pubAge" name="age">${['幼年', '成年', '老年', '不确定'].map((v) => `<option ${state.publish.age === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        </div>
        <div class="form-field"><label>性别</label><div class="seg">${['公', '母', '不确定'].map((v) => `<button type="button" class="${sel('sex', v)}" data-pub-seg="sex" data-value="${v}">${v}</button>`).join('')}</div></div>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">03</span><h2>在哪里遇见</h2><small>只公开到街区</small></div>
        <div class="form-field"><label for="pubArea">大致位置</label><input class="input" id="pubArea" name="area" placeholder="比如：翠苑二区南门花坛" value="${esc(state.publish.area)}" /></div>
        <div class="toggle-row"><button class="toggle ${state.publish.sterilized ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="sterilized" aria-label="切换绝育状态"></button><p>看起来已绝育（有耳标或剪耳）</p></div>
        <div class="toggle-row"><button class="toggle ${state.publish.friendly ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="friendly" aria-label="切换亲人状态"></button><p>比较亲人，可以靠近</p></div>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">04</span><h2>想补充的话</h2><small>可选</small></div>
        <div class="form-field"><label for="pubNote">它的状态、习惯，或你担心的事</label><textarea class="textarea" id="pubNote" name="note" placeholder="比如：每天都在花坛边，看到人会蹭过来，但不太敢进楼道。">${esc(state.publish.note)}</textarea></div>
      </div>
      <div class="submit-area">
        <p class="submit-hint">${icon('shield')}请勿公开精确门牌号。上报后会经过邻里核验，通过后出现在附近发现与地图中。</p>
        <button class="submit-btn" type="submit">${icon('send')}提交上报</button>
      </div>
    </form>`;
}
