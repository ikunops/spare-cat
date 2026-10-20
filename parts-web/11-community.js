function renderCommunity() {
  const filters = ['全部', '捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '猫友同路', '领养回访'];
  const posts = allPosts();
  const list = state.communityFilter === '全部' ? posts : posts.filter((p) => p.tag === state.communityFilter);
  const hot = list.find((p) => p.featured) || list[0];
  return `
    <header class="page-head">
      <div><div class="page-head-kicker">FIELD NOTES · 邻里经验</div><h1>猫的事，<br /><em>大家的事。</em></h1><p>养猫经验、捉猫实录、就医体验、猫咖打卡、遛猫路线和猫友同路。真实经验比广告更有用，也比“我觉得”更可靠。</p></div>
      <div class="community-share-row"><button class="btn is-primary" type="button" data-action="add-walk-place">${icon('pin')}分享遛猫地点</button><button class="btn" type="button" data-action="compose-companion">${icon('paw')}找猫友同路</button><button class="btn" type="button" data-action="compose">${icon('edit')}写一条</button></div>
    </header>
    <div class="community-page-grid">
      <div class="community-page-main">
        <div class="community-top-tabs" aria-label="广场分类"><span class="community-top-label">看哪一类</span>${filters.map((f) => `<button class="pill ${state.communityFilter === f ? 'is-active' : ''}" type="button" data-community-filter="${f}">${f}</button>`).join('')}</div>
        <div class="companion-banner"><div><span class="kicker">WALK TOGETHER · 猫友同路</span><h3>找一只脾气合得来的散步搭子</h3><p>先约在公开、人少的遛猫地点。用推车或背包让两只猫隔着距离观察，不交换住址和私人电话。</p></div><button class="btn btn-small" type="button" data-action="compose-companion">${icon('paw')}发起同路邀请</button></div>
        ${hot ? `<button class="hot-story" type="button" data-open-post="${hot.id}"><div>${hot.image ? `<img src="${photoSrc(hot.image)}" alt="${esc(hot.title)}" />` : ''}</div><div class="hot-story-body"><div class="hot-story-meta"><span>本周邻里热帖 · 01</span><span>1.2K READS</span></div><h2>${esc(hot.title)}</h2><p>${esc(hot.excerpt)}</p><div class="hot-story-footer"><span>${esc(hot.author)} · ${esc(hot.place)}</span>${icon('arrow-up-right')}</div></div></button>` : ''}
        <div class="feed">${list.map((post) => feedPost(post)).join('')}</div>
      </div>
      <aside class="community-aside">
        <div class="aside-editorial"><div class="kicker">EDITOR'S NOTE · 闲猫编辑部</div><h3>经验不必完美，<br />真实就够。</h3><p>你可以写一次失败的捕捉、一次需要提醒的就医经历，或一条人少好走的遛猫路线。请隐去门牌和个人电话，把判断留给后来的人。</p><button type="button" data-action="compose">写下你的邻里笔记 ${icon('arrow-up-right')}</button></div>
        <div class="rail-section" style="margin-top:28px"><div class="rail-section-head"><h3>附近的猫</h3><button type="button" data-page="home">全部 ${icon('arrow-up-right')}</button></div>${availableCats().slice(0,3).map((cat) => `<button class="service-mini" type="button" data-open-cat="${cat.id}"><span class="service-mini-icon" style="padding:0;overflow:hidden"><img src="${photoSrc(cat.photo)}" alt="" style="width:100%;height:100%;object-fit:cover" /></span><div><b>${esc(cat.name)}</b><span>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.areaShort)}</span></div>${icon('chevron')}</button>`).join('')}</div>
        <div class="rail-section"><div class="rail-section-head"><h3>去过的店</h3><button type="button" data-page="services">全部 ${icon('arrow-up-right')}</button></div>${railServices()}</div>
      </aside>
    </div>`;
}
