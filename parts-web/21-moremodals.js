function articleModal(post) {
  if (!post) return;
  state.activePost = post.id;
  modal(`
    ${post.image ? `<img class="article-cover" src="${photoSrc(post.image)}" alt="${esc(post.title)}" />` : ''}
    <div class="article-content">
      <span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span>
      <h2 style="margin-top:12px">${esc(post.title)}</h2>
      <div class="article-byline">${contributorAvatar(post.author, post.avatar, post.tone)}<div><b>${esc(post.author)}</b><span>${esc(post.place)} · ${esc(post.time)}</span><small class="contributor-line">${contributorBadge(post.author, true)}</small></div><span class="article-date">FIELD NOTE</span></div>
      <div class="article-body">${post.body}</div>
      <div class="article-actions"><button class="article-stat ${isLiked(post) ? 'is-liked' : ''}" type="button" data-like-post="${post.id}" aria-pressed="${isLiked(post)}">${icon('heart')}<span>${postLikes(post)}</span> 点赞</button><span class="article-stat">${icon('square')}<span>${postCommentCount(post)}</span> 条回应</span></div>
      <div class="comments"><h3>邻里回应 · <span data-comment-total>${postCommentCount(post)}</span></h3><div data-comment-list>${(post.commentsList || []).map((c) => `<div class="comment">${contributorAvatar(c.name, c.name.slice(0, 1))}<div class="comment-copy"><div class="comment-byline"><b>${esc(c.name)}</b>${contributorBadge(c.name, true)}${c.time ? `<small>${esc(c.time)}</small>` : ''}</div><p>${esc(c.text)}</p></div></div>`).join('')}</div><form class="comment-form" id="webCommentForm" data-post-id="${post.id}"><label class="sr-only" for="webCommentText">写下你的回应</label><textarea class="textarea" id="webCommentText" name="text" placeholder="说说你的经验，或问一个具体问题。"></textarea><div class="comment-form-foot"><span>${contributorBadge('林小满', true)}</span><button class="btn btn-primary" type="submit">发出回应</button></div><div class="form-error" role="alert"></div></form></div>
    </div>`, 'article-web');
}
