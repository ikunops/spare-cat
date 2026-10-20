function successSheet(kind) {
  const isPublish = kind === 'publish';
  const title = isPublish ? '已经替它留了名。' : '申请已经送到。';
  const copy = isPublish ? '上报进入邻里核验。通过后会出现在附近发现与地图中。谢谢你没有只是路过。' : '上报人会在 48 小时内联系你。先约一次见面，不急着把猫带回家。';
  overlay(`
    <div class="success-wrap">
      <div class="success-backdrop"></div>
      <div class="success-card">
        <div class="success-seal">${icon(isPublish ? 'paw' : 'send')}</div>
        <h2>${title}</h2>
        <p>${copy}</p>
        <div class="success-actions">
          <button class="btn" type="button" data-action="${isPublish ? 'back-home' : 'close-overlay'}">${isPublish ? '回到附近' : '继续看看'}</button>
          <button class="btn btn-primary" type="button" data-action="${isPublish ? 'view-published' : 'go-profile'}">${isPublish ? '看我上报的' : '查看我的申请'}</button>
        </div>
        <div class="success-meta"><span>NO PAYMENT</span><span>NO RESELL</span><span>MEET FIRST</span></div>
      </div>
    </div>`);
}
