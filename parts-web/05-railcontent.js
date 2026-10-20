function railPosts() {
  return POSTS.slice(0, 3).map((post) => `
    <button class="rail-post" type="button" data-open-post="${post.id}">
      <div class="rail-post-meta"><span>${esc(post.tag)}</span><i></i><span>${esc(post.time)}</span></div>
      <h4>${esc(post.title)}</h4>
      <p>${esc(post.excerpt)}</p>
      <div class="rail-post-foot"><span>${icon('heart')}${postLikes(post)}</span><span>${icon('square')}${post.comments}</span><span>${esc(post.author)}</span></div>
    </button>`).join('');
}

function railServices() {
  return SERVICES.slice(0, 3).map((s) => `
    <button class="service-mini" type="button" data-open-service="${s.id}">
      <span class="service-mini-icon">${icon(s.icon.replace('i-', ''))}</span>
      <div><b>${esc(s.name)}</b><span>${esc(s.type)} · ${s.distance}km · ${esc(s.hours)}</span></div>
      <span class="service-mini-score">${icon('star')}${s.rating}</span>
      ${icon('chevron')}
    </button>`).join('');
}
