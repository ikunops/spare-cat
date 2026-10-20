function mergeById(base, local) {
  const merged = new Map();
  base.forEach((item) => { if (item && item.id) merged.set(item.id, item); });
  local.forEach((item) => {
    if (!item || !item.id) return;
    const previous = merged.get(item.id) || {};
    merged.set(item.id, { ...previous, ...item, commentsList: Array.isArray(item.commentsList) ? item.commentsList : previous.commentsList });
  });
  return Array.from(merged.values());
}

function allPosts() {
  return mergeById(POSTS, state.posts);
}

function allPlaces() {
  return mergeById(SERVICES, state.places);
}

function postById(id) {
  return allPosts().find((post) => post.id === id) || null;
}

function allReviews() {
  const seen = new Set();
  return allPlaces().flatMap((service) => (service.reviews || []).map((review) => ({ ...review, service: service.name, serviceId: service.id })))
    .concat(state.reviews)
    .filter((review) => {
      const key = `${review.serviceId || review.service}|${review.name}|${review.text}|${review.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function memberContribution(name) {
  if (!name) return { verified: false, reports: 0, adoptions: 0, posts: 0, comments: 0, reviews: 0, places: 0, total: 0, level: '邻里', frame: '' };
  const verified = ['林小满', '阿桔', '周周', '车库老陈', '长河阿七'].includes(name);
  const reports = allCats().filter((cat) => (name === '林小满' ? isMine(cat) : cat.reporter === name)).length;
  const adoptions = state.adoptions.filter((adoption) => {
    const cat = catById(adoption.catId);
    return cat && (cat.reporter === name || (name === '林小满' && adoption.catId === 'banli'));
  }).length;
  const posts = allPosts().filter((post) => post.author === name).length;
  const comments = allPosts().reduce((total, post) => total + (post.commentsList || []).filter((comment) => comment.name === name).length, 0);
  const reviews = allReviews().filter((review) => review.name === name).length;
  const places = allPlaces().filter((place) => place.submittedBy === name).length;
  const total = reports + adoptions + posts + comments + reviews + places;
  const level = total >= 8 || reports >= 3 ? '资深邻里' : reports >= 1 || adoptions >= 1 || posts >= 2 ? '守护邻里' : total >= 1 ? '邻里' : '新邻居';
  const frame = level === '资深邻里' ? 'is-frame-senior' : level === '守护邻里' ? 'is-frame-guard' : level === '邻里' ? 'is-frame-neighbor' : '';
  return { verified, reports, adoptions, posts, comments, reviews, places, total, level, frame };
}

function contributorBadge(name, compact = false) {
  const c = memberContribution(name);
  const detail = compact
    ? [c.verified ? '已实名' : '', c.reports ? `上报 ${c.reports}` : '', c.adoptions ? `领养 ${c.adoptions}` : ''].filter(Boolean).join(' · ')
    : [c.verified ? '已实名' : '未实名', c.reports ? `上报 ${c.reports} 只` : '', c.adoptions ? `领养 ${c.adoptions} 只` : '', c.posts ? `${c.posts} 篇笔记` : '', c.comments ? `${c.comments} 条回应` : '', c.reviews ? `${c.reviews} 条评价` : ''].filter(Boolean).join(' · ');
  return `<span class="contributor-badge ${c.frame}"><b>${esc(c.level)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span>`;
}

function contributorAvatar(name, avatar, tone = '') {
  const c = memberContribution(name);
  const label = String(avatar || name || '邻').slice(0, 1);
  return `<span class="contributor-avatar ${c.frame}"><span class="avatar ${tone}">${esc(label)}</span></span>`;
}

function isMyComment(comment) {
  return comment.name === '林小满';
}

function myComments() {
  return allPosts().flatMap((post) => (post.commentsList || []).filter(isMyComment).map((comment) => ({ ...comment, post })));
}

function myLikedPosts() {
  return state.likedPosts.map(postById).filter(Boolean);
}

function myPosts() {
  return allPosts().filter((post) => post.author === '林小满');
}

function postCommentCount(post) {
  return Array.isArray(post.commentsList) && post.commentsList.length ? post.commentsList.length : Number(post.comments || 0);
}

function postingPlaceOptions(current) {
  return ['翠苑二区', '古荡新村', '文三路', '益乐路', '丰潭路', '嘉绿苑', '滨江·长河', '拱墅·小河'].map((place) => `<option ${current === place ? 'selected' : ''}>${place}</option>`).join('');
}

function sharedPlaceCategories() {
  return ['全部', '医院', '商店', '猫咖', '遛猫地点'];
}

function serviceTypeLabel(type) {
  return type === '遛猫的地方' ? '遛猫地点' : type;
}
