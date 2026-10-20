function renderCommunity() {
  const filters = ['全部', '捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '领养回访'];
  const list = state.communityFilter === '全部' ? posts : posts.filter((p) => p.tag === state.communityFilter);
  return `
    <header class="topbar">
      <div class="brand-mini"><span class="seal">猫</span><div class="brand-mini-text"><b>广场</b><small>NEIGHBORHOOD NOTES</small></div></div>
      <button class="round-btn" type="button" data-action="search-community" aria-label="搜索帖子">${icon('search')}</button>
      <button class="round-btn" type="button" data-action="compose" aria-label="写一条">${icon('edit')}</button>
    </header>
    <section class="community-head">
      <div class="eyebrow">FIELD NOTES · 邻里经验</div>
      <div class="community-title-row">
        <h1>猫的事，<br /><em>大家的事。</em></h1>
        <button class="write-btn" type="button" data-action="compose">${icon('edit')}写一条</button>
      </div>
      <p>养猫经验、捉猫实录、就医体验、猫咖打卡、遛猫地点、领养回访。只陈述亲历，把判断留给后来的人。</p>
    </section>
    <div class="community-tabs" aria-label="帖子分类">${filters.map((f) => `<button class="chip ${state.communityFilter === f ? 'is-active' : ''}" type="button" data-community-filter="${f}">${f}</button>`).join('')}</div>
    <button class="hot-card" type="button" data-action="open-article" data-id="p1">
      <div class="hot-meta"><span>本周邻里热帖 · 01</span><span>1.2k 阅读</span></div>
      <h2>用航空箱 + 罐头，把南门那只橘白骗进去了</h2>
      <p>“捉猫不是比谁手快，是比谁更能等。你越急，它越能感觉到。”</p>
      <div class="hot-footer"><span>林小满 · 翠苑二区</span>${icon('arrow-up-right')}</div>
    </button>
    <button class="service-entry" type="button" data-nav="services">
      <span class="store-icon">${icon('store')}</span>
      <span><b>附近好店 · 4 家邻里推荐</b><p>医院、猫粮、猫咖、溜猫去处，都有真实评价</p></span>
      ${icon('arrow-right')}
    </button>
    <div class="feed">
      ${list.map((post, index) => postCard(post, index)).join('')}
      <div class="feed-end">— 已经看到这一带的所有经验 —</div>
    </div>`;
}

function postCard(post, index) {
  return `
    <article class="post-card" style="--i:${index}">
      <div class="post-top">
        <span class="avatar ${post.tone}">${esc(post.avatar)}</span>
        <div class="post-author"><b>${esc(post.author)}</b><span>${esc(post.time)} · ${esc(post.place)}</span></div>
        <span class="post-tag ${post.tagClass}">${esc(post.tag)}</span>
      </div>
      <button type="button" class="post-open" data-action="open-article" data-id="${post.id}" style="display:block;width:100%;border:0;background:transparent;padding:0;text-align:left">
        <h3>${esc(post.title)}</h3>
        <p class="excerpt">${esc(post.excerpt)}</p>
        ${post.image ? `<img class="post-media" src="${A}${post.image}" alt="${esc(post.title)}" loading="lazy" />` : ''}
      </button>
      <div class="post-foot">
        <button class="post-stat" type="button" data-action="like-post" data-id="${post.id}">${icon('heart')}<span>${post.likes}</span></button>
        <button class="post-stat" type="button" data-action="open-article" data-id="${post.id}">${icon('square')}<span>${post.comments}</span></button>
        <span class="post-place">${icon('pin')}${esc(post.place)}</span>
      </div>
    </article>`;
}
