function articleView(post) {
  if (!post) return;
  overlay(`
    <div class="sheet-scroll">
      <div class="detail-topbar" style="position:sticky;top:0;background:rgba(242,237,224,.93);backdrop-filter:blur(10px);z-index:5;padding:12px 16px">
        <button class="round-btn" type="button" data-action="close-overlay" aria-label="返回广场">${icon('arrow-left')}</button>
        <div class="detail-top-actions"><button class="round-btn" type="button" data-action="share-cat" aria-label="分享这篇笔记">${icon('send')}</button></div>
      </div>
      ${post.image ? `<img class="article-cover" src="${A}${post.image}" alt="${esc(post.title)}" />` : ''}
      <div class="article-head">
        <span class="article-tag">${esc(post.tag)}</span>
        <h1>${esc(post.title)}</h1>
        <div class="article-byline"><span class="avatar ${post.tone}">${esc(post.avatar)}</span><div><b>${esc(post.author)}</b><span>${esc(post.place)} · ${esc(post.time)}</span></div><span class="article-date">FIELD NOTE</span></div>
      </div>
      <div class="article-body">${post.body}</div>
      <div class="article-foot"><span>${post.likes} 人觉得有用</span><button class="btn btn-small" type="button" data-action="like-post" data-id="${post.id}">${icon('heart')}收藏这条经验</button></div>
      <div class="comments"><h3>邻里回应 · ${post.comments}</h3>${post.commentsList.map((comment) => `<div class="comment"><span class="avatar">${esc(comment.name.slice(0, 1))}</span><p><b>${esc(comment.name)}</b>${esc(comment.text)}</p></div>`).join('')}</div>
    </div>`, true);
}
