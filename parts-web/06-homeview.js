function renderHome() {
  const list = filteredCats();
  const filtered = Object.entries(state.filters).some(([k, v]) => {
    if (k === 'distance') return Number(v) !== DISTANCE_DEFAULT;
    if (k === 'citywide') return v === true;
    return v !== '全部';
  }) || state.quick !== '全部';
  return `
    <section class="hero">
      <div class="hero-left">
        <div class="hero-kicker">SPARE CAT · 杭州 · 邻里猫口志</div>
        <h1>附近的猫，<br />在等一个<em>家</em>。</h1>
        <p class="hero-sub">给附近那只还没被看见的猫，留一个空房间、一段时间。按品种、年龄、性别和距离找到它，读完照护笔记，再决定要不要去见一面。</p>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" data-action="scroll-to-cats">认识附近的猫 ${icon('arrow-right')}</button>
          <button class="btn" type="button" data-page="publish">${icon('plus')}上报一只猫</button>
        </div>
        <div class="hero-proof">
          <div><b>${availableCats().length}</b><span>只等家的猫</span></div><span class="proof-sep"></span>
          <div><b>476</b><span>条邻里经验</span></div><span class="proof-sep"></span>
          <div><b>0</b><span>元领养费用</span></div>
          <p class="proof-note">信息经基础核验；领养不收取任何费用。</p>
        </div>
      </div>
      <div class="hero-right">${heroFeature()}</div>
    </section>
    <section class="discover">
      <div class="discover-main">
        <div class="section-head"><h2>附近也在等<small>NEARBY, RIGHT NOW</small></h2><span class="result-meta">${list.length} / ${availableCats().length} 只匹配</span></div>
        <div class="filter-bar">
          <label class="search-box">${icon('search')}<input id="webSearch" type="search" placeholder="搜猫名、品种、街区" value="${esc(state.query)}" aria-label="搜索猫名、品种或街区" /></label>
          <div class="filter-pills" aria-label="快捷筛选">
            ${['全部', '亲人', '幼猫', '已绝育', '1km内'].map((x) => `<button class="pill ${state.quick === x ? 'is-active' : ''}" type="button" data-quick="${esc(x)}">${x === '1km内' ? icon('pin') : ''}${esc(x)}</button>`).join('')}
          </div>
          <button class="filter-toggle ${filtered ? 'has-filter' : ''}" type="button" data-action="filters">${icon('sliders')}筛选${filtered ? ' · ' + countActiveFilters() : ''}</button>
        </div>
        <div class="cat-mosaic" id="webCatGrid">
          ${list.length ? list.map((cat, i) => catTile(cat, i)).join('') : emptyCatsWeb()}
        </div>
        <div class="load-more-row"><button class="load-more" type="button" data-action="reset-filters">${icon('sliders')}换个条件再看看</button></div>
      </div>
      <aside class="discover-rail">
        ${miniMap()}
        <div class="rail-section"><div class="rail-section-head"><h3>邻里刚写的</h3><button type="button" data-page="community">去广场 ${icon('arrow-up-right')}</button></div>${railPosts()}</div>
        <div class="rail-section"><div class="rail-section-head"><h3>去过的人说</h3><button type="button" data-page="services">全部好店 ${icon('arrow-up-right')}</button></div>${railServices()}</div>
      </aside>
    </section>
    <section class="values-strip">
      <div class="values-intro">
        <h2>不是每只猫<br />都需要被领养。</h2>
        <p>有些只需要一口水、一次绝育，或一个不被驱赶的角落。闲猫把“找家”和“留在附近”放在同等重要的位置。</p>
        <div class="values-stamp"><i></i>SPARE A HOME · SHARE A LIFE</div>
      </div>
      <div class="values-list">
        <div class="value-item"><span>01 / NO TRADE</span><h3>不做活体交易</h3><p>平台只撮合领养，不提供买卖、配种与活体快递。发现交易可直接举报。</p></div>
        <div class="value-item"><span>02 / SAFE DISTANCE</span><h3>只公开到街区</h3><p>精确位置与联系方式，只在双方确认领养意向后交换，减少围堵和恶意领养。</p></div>
        <div class="value-item"><span>03 / HONEST REVIEW</span><h3>不同体验都会被保留</h3><p>好店评价记录亲历事实，商家可以公开回应。收录不收费，排序不售卖。</p></div>
      </div>
    </section>`;
}
