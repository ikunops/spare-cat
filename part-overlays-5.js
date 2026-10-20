function composeSheet() {
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>写一条邻里笔记</h2><p>经验不必完美，真实就够。请隐去精确门牌与个人电话。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭发布">${icon('close')}</button></div>
      <form class="compose-form" id="composeForm">
        <div class="form-field"><label for="composeTitle">标题</label><input class="input" id="composeTitle" name="title" placeholder="一句话说清楚这条经验" /></div>
        <div class="form-field"><label for="composeBody">正文</label><textarea class="textarea" id="composeBody" name="body" placeholder="发生了什么？你试了什么？哪一步真的有用？"></textarea></div>
        <div class="form-field"><label>放在哪个分类</label><div class="compose-cats">${['捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '领养回访'].map((tag, i) => `<button class="chip ${i === 0 ? 'is-active' : ''}" type="button" data-compose-tag="${tag}">${tag}</button>`).join('')}</div></div>
        <div class="form-error" role="alert"></div>
        <div class="compose-actions"><button class="btn" type="button" data-action="close-overlay">先不写</button><button class="btn btn-primary" type="submit">${icon('send')}发布</button></div>
      </form>
    </div>`);
}
