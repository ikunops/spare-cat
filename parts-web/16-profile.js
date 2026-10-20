function renderProfile() {
  const favList = allCats().filter((cat) => state.favorites.includes(cat.id));
  const adopted = state.adoptions || [];
  const mine = allCats().filter((cat) => isMine(cat));
  const posts = myPosts();
  const comments = myComments();
  const liked = myLikedPosts();
  const walkPlaces = placeSubmissions();
  const contribution = memberContribution('林小满');
  const tabs = [
    { id: 'adopted', label: '已领养', count: adopted.length },
    { id: 'published', label: '我的上报', count: mine.length },
    { id: 'walks', label: '遛猫地点', count: walkPlaces.length },
    { id: 'posts', label: '我的发帖', count: posts.length },
    { id: 'comments', label: '我的评论', count: comments.length },
    { id: 'liked', label: '点赞', count: liked.length },
    { id: 'favorites', label: '收藏', count: favList.length },
    { id: 'applications', label: '领养申请', count: state.applications.length }
  ];
  const activeTab = tabs.some((tab) => tab.id === state.profileTab) ? state.profileTab : 'adopted';
  const content = {
    adopted: () => profileAdoptions(adopted),
    published: () => profilePublished(),
    walks: () => profilePlaces(walkPlaces),
    posts: () => profilePosts(posts),
    comments: () => profileComments(comments),
    liked: () => profileLiked(liked),
    favorites: () => profileFavorites(favList),
    applications: () => profileApplications()
  }[activeTab]();
  return `
    <div class="profile-page">
      <aside class="profile-side">
        <div class="profile-card">
          <div class="profile-card-top"><span>MEMBER SINCE 2024<br />XM-0217</span></div>
          <div class="profile-avatar">林</div>
          <h1>林小满</h1>
          <div class="profile-badge-row">${contributorBadge('林小满', true)}</div>
          <p>翠苑二区 · ${contribution.verified ? '已实名' : '未实名'} · 愿意先见面</p>
          <div class="credit-box"><div class="credit-top">${icon('shield')}<b>92</b><span>邻里信用</span></div><div class="credit-track"><i></i></div><span class="credit-note">信息准确、按时回访、无纠纷</span></div>
        </div>
        <div class="profile-menu">
          <button type="button" data-page="services">${icon('store')}附近好店与遛猫地点${icon('chevron')}</button>
          <button type="button" data-action="add-walk-place">${icon('pin')}分享遛猫地点与心得${icon('chevron')}</button>
          <button type="button" data-action="compose-companion">${icon('paw')}发起猫友同路${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('shield')}领养信用与实名认证${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('notebook')}领养回访记录${icon('chevron')}</button>
          <button type="button" data-action="settings">${icon('settings')}隐私与精确位置${icon('chevron')}</button>
        </div>
      </aside>
      <main class="profile-main">
        <div class="profile-main-head"><div><h1>我的猫事</h1><p>已领养、上报的猫、分享过的遛猫地点、发帖、评论、点赞、收藏和领养申请，都在这里。所有领养申请都需要双方见面，不收取费用。</p></div><div class="profile-head-actions"><button class="btn btn-small" type="button" data-action="compose">${icon('edit')}写一条</button><button class="btn btn-small" type="button" data-page="publish">${icon('plus')}再上报一只</button></div></div>
        <div class="profile-contribution">
          <div class="profile-contribution-copy"><span class="contribution-kicker">COMMUNITY CONTRIBUTION · 邻里贡献</span><b>${esc(contribution.level)}</b><p>${contribution.reports} 只上报 · ${contribution.adoptions} 只领养 · ${contribution.posts} 篇发帖 · ${contribution.comments} 条评论 · ${contribution.reviews} 条评价</p></div>
          <span class="contribution-total"><b>${contribution.total}</b><span>次真实贡献</span></span>
        </div>
        <div class="profile-stats-web is-eight">
          <button type="button" data-profile-tab="adopted"><b>${adopted.length}</b><span>已领养</span></button>
          <button type="button" data-profile-tab="published"><b>${mine.length}</b><span>我的上报</span></button>
          <button type="button" data-profile-tab="walks"><b>${walkPlaces.length}</b><span>遛猫地点</span></button>
          <button type="button" data-profile-tab="posts"><b>${posts.length}</b><span>我的发帖</span></button>
          <button type="button" data-profile-tab="comments"><b>${comments.length}</b><span>我的评论</span></button>
          <button type="button" data-profile-tab="liked"><b>${liked.length}</b><span>点赞</span></button>
          <button type="button" data-profile-tab="favorites"><b>${favList.length}</b><span>收藏</span></button>
          <button type="button" data-profile-tab="applications"><b>${state.applications.length}</b><span>领养申请</span></button>
        </div>
        <div class="profile-quick-actions" aria-label="我的分享快捷入口">
          <button type="button" data-action="add-walk-place">${icon('pin')}<b>分享遛猫地点</b><span>填写环境、时段、照片与心得</span></button>
          <button type="button" data-action="compose-companion">${icon('paw')}<b>发起猫友同路</b><span>约在公开地点，不交换住址</span></button>
          <button type="button" data-action="compose">${icon('edit')}<b>写一条邻里笔记</b><span>养猫经验、捉猫实录或就医体验</span></button>
        </div>
        <div class="profile-tabs-web">
          ${tabs.map((tab) => `<button class="${activeTab === tab.id ? 'is-active' : ''}" type="button" data-profile-tab="${tab.id}">${tab.label}<span>${tab.count}</span></button>`).join('')}
        </div>
        <div class="profile-content-web">${content}</div>
      </main>
    </div>`;
}
