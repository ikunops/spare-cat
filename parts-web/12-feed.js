function feedPost(post) {
  return `
    <article class="feed-post">
      <div class="feed-post-head">${contributorAvatar(post.author, post.avatar, post.tone)}<div class="feed-post-author"><b>${esc(post.author)}</b><span>${esc(post.time)} · ${esc(post.place)}</span><small class="contributor-line">${contributorBadge(post.author, true)}</small></div><span class="feed-tag ${post.tagClass}">${esc(post.tag)}</span></div>
      <div data-open-post="${post.id}" tabindex="0" role="button" aria-label="阅读 ${esc(post.title)}">
        <h3>${esc(post.title)}</h3>
        <p class="feed-excerpt">${esc(post.excerpt)}</p>
      </div>
      <div class="feed-post-foot"><button class="feed-stat ${isLiked(post) ? 'is-liked' : ''}" type="button" data-like-post="${post.id}" aria-label="${isLiked(post) ? '取消点赞' : '点赞'}" aria-pressed="${isLiked(post)}">${icon('heart')}<span>${postLikes(post)}</span></button><button class="feed-stat" type="button" data-open-post="${post.id}">${icon('square')}<span>${postCommentCount(post)}</span></button><span class="place">${icon('pin')}${esc(post.place)}</span></div>
    </article>`;
}
