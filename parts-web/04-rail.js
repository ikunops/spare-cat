function miniMap() {
  const pins = availableCats().slice(0, 5).map((cat, i) => {
    const left = 20 + (i * 17) + (i % 2) * 5;
    const top = 25 + ((i * 13) % 43);
    return `<button class="mini-map-pin" type="button" style="left:${left}%;top:${top}%" data-open-cat="${cat.id}" aria-label="${esc(cat.name)}"><img src="${photoSrc(cat.photo)}" alt="" /></button>`;
  }).join('');
  return `<div class="map-rail-card">
    <div class="mini-map-head"><div><h3>这一带的猫</h3><p>${esc(distanceScopeLabel())} · ${availableCats().length} PINNED</p></div><button type="button" data-page="map">放大 ${icon('arrow-up-right')}</button></div>
    <div class="mini-map" data-page="map" role="button" tabindex="0" aria-label="打开猫口地图">
      <svg viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
        <rect width="320" height="180" fill="#e9e4d5" />
        <g fill="#f2eee1" stroke="#d8d0bd" stroke-width=".7">
          <rect x="5" y="5" width="63" height="40" /><rect x="75" y="5" width="83" height="40" /><rect x="165" y="5" width="56" height="40" /><rect x="228" y="5" width="86" height="40" />
          <rect x="5" y="52" width="63" height="54" /><rect x="75" y="52" width="83" height="54" /><rect x="165" y="52" width="56" height="54" /><rect x="228" y="52" width="86" height="54" />
          <rect x="5" y="115" width="63" height="57" /><rect x="75" y="115" width="83" height="57" /><rect x="165" y="115" width="56" height="57" /><rect x="228" y="115" width="86" height="57" />
        </g>
        <path d="M0 111 C65 105, 115 124, 187 112 S265 101, 320 109" fill="none" stroke="#c4d6cc" stroke-width="10" />
        <path d="M68 0 C61 42, 84 71, 71 110 S54 153, 68 180" fill="none" stroke="#faf6ea" stroke-width="7" />
        <path d="M0 178 C92 169, 241 183, 320 169" fill="none" stroke="#faf6ea" stroke-width="6" />
        <g fill="#cad6ca" opacity=".9"><rect x="228" y="52" width="35" height="26" /><rect x="75" y="115" width="34" height="25" /><rect x="165" y="115" width="31" height="22" /></g>
        <g fill="#8a927f" font-family="DM Mono, monospace" font-size="5.5" letter-spacing=".8"><text x="8" y="106">WEN ER RD.</text><text x="82" y="148">YILE RD.</text><text x="173" y="47">GUDANG</text></g>
      </svg>
      <div class="you"></div>
      ${pins}
    </div>
    <div class="map-legend"><span><i></i>等待领养</span><span><i class="is-green"></i>你在附近</span><button class="legend-link" type="button" data-page="map">猫口地图 ${icon('chevron')}</button></div>
  </div>`;
}
