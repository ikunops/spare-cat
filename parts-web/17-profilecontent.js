function profileFavorites(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('heart')}<h3>还没有收藏的猫</h3><p>遇到想再想一想的猫，点一下心形。<br />它不会催你，但会在这里等你。</p><button type="button" data-page="home">去附近看看</button></div>`;
  return list.map((cat) => `<div class="favorite-tile"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div class="favorite-tile-info" data-open-cat="${cat.id}" tabindex="0" role="button"><h3>${esc(cat.name)}</h3><p>${esc(cat.breed)} · ${esc(cat.sex)} · ${cat.distance}km · ${esc(cat.areaShort)}</p><span>${esc(cat.status)}</span></div><button class="fav-remove" type="button" data-fav="${cat.id}" aria-label="取消收藏 ${esc(cat.name)}">${icon('heart')}</button></div>`).join('');
}

function profilePosts(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('edit')}<h3>还没有发过笔记</h3><p>养猫技巧、找猫经验、一次失败的捕捉，<br />都可以留给下一位邻居。</p><button type="button" data-action="compose">写一条邻里笔记</button></div>`;
  return list.map((post) => `<button class="profile-post-web" type="button" data-open-post="${post.id}">
    ${post.image ? `<img src="${photoSrc(post.image)}" alt="" />` : `<span class="profile-post-mark">${icon('edit')}</span>`}
    <div><div class="profile-post-top"><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span><small>${esc(post.time)}</small></div><h3>${esc(post.title)}</h3><p>${esc(post.excerpt)}</p><div class="profile-post-foot"><span>${icon('heart')}${postLikes(post)} 赞</span><span>${icon('square')}${postCommentCount(post)} 评论</span><span>${icon('pin')}${esc(post.place)}</span></div></div>
  </button>`).join('');
}

function profileComments(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('square')}<h3>还没有留下评论</h3><p>读到有共鸣的邻里笔记，可以留下一句。<br />评论也会计入你的社区贡献。</p><button type="button" data-page="community">去广场看看</button></div>`;
  return list.map((comment) => `<button class="profile-comment-web" type="button" data-open-post="${comment.post.id}">
    <span class="profile-comment-mark">${icon('square')}</span>
    <div><p>${esc(comment.text)}</p><div class="profile-comment-meta"><b>${esc(comment.post.title)}</b><span>${esc(comment.time || '刚刚')} · ${esc(comment.post.author)}</span></div></div>
    ${icon('chevron')}
  </button>`).join('');
}

function profileLiked(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('heart')}<h3>还没有点赞的笔记</h3><p>点赞表示这条经验对你有用。<br />它会留在这里，方便你之后回看。</p><button type="button" data-page="community">去广场看看</button></div>`;
  return list.map((post) => `<button class="profile-like-web" type="button" data-open-post="${post.id}">
    <span class="profile-like-mark">${icon('heart')}</span>
    <div><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span><h3>${esc(post.title)}</h3><p>${esc(post.author)} · ${esc(post.place)} · ${esc(post.time)}</p></div>
    ${icon('chevron')}
  </button>`).join('');
}

function profileApplications() {
  if (!state.applications.length) return `<div class="empty-state-web">${icon('send')}<h3>还没有提交申请</h3><p>看到想认真了解的猫，可以提交领养申请。<br />平台会先安排双方见面，不收取任何费用。</p><button type="button" data-page="home">去看看附近的猫</button></div>`;
  return state.applications.map((app) => { const cat = catById(app.catId); if (!cat) return ''; return `<div class="application-web"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div data-open-cat="${cat.id}" tabindex="0" role="button"><h3>${esc(cat.name)}</h3><p>${esc(app.time)} · ${esc(app.home)} · ${esc(app.experience)}</p></div><span>${esc(app.status)}</span></div>`; }).join('');
}

function profileAdoptions(list) {
  if (!list.length) return `<div class="empty-state-web">${icon('home')}<h3>还没有接猫回家</h3><p>领养完成后，猫咪档案会出现在这里。<br />可以记录接回日期、回访日期和当前状态。</p><button type="button" data-page="home">去看看附近的猫</button></div>`;
  return list.map((adoption) => {
    const cat = catById(adoption.catId) || adoption.cat || {};
    const name = cat.name || adoption.name || '未命名';
    const id = cat.id || '';
    return `<div class="adoption-web">
      <img src="${photoSrc(cat.photo || adoption.photo)}" alt="${esc(name)}" />
      <div class="adoption-main" ${id ? `data-open-cat="${id}" tabindex="0" role="button"` : ''}>
        <div class="adoption-head"><h3>${esc(name)}</h3><span>${esc(adoption.status || '已接回家')}</span></div>
        <p>${esc(cat.breed || adoption.breed || '品种待补充')} · ${esc(cat.sex || adoption.sex || '性别待补充')} · ${esc(cat.age || adoption.age || '月龄待补充')}</p>
        <div class="adoption-dates"><span>${icon('home')}接回 ${esc(adoption.homeDate || '待补充')}</span><span>${icon('notebook')}回访 ${esc(adoption.revisitDate || '待安排')}</span></div>
      </div>
    </div>`;
  }).join('');
}
