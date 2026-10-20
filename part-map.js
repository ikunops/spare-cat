function renderMap() {
  const pins = allCats().map((cat) => `
    <button class="map-pin ${state.mapSelected === cat.id ? 'is-selected' : ''}" type="button" style="left:${cat.lng}%;top:${cat.lat}%" data-map-cat="${cat.id}" aria-label="地图上的 ${esc(cat.name)}">
      <span class="map-pin-photo"><img src="${A}${cat.photo}" alt="" /></span>
      <span class="map-pin-name">${esc(cat.name)}</span>
    </button>`).join('');
  const cat = state.mapSelected ? allCats().find((c) => c.id === state.mapSelected) : null;
  return `
    <div class="map-page">
      <svg class="map-canvas" viewBox="0 0 380 780" preserveAspectRatio="xMidYMid slice" aria-label="翠苑附近猫口地图">
        <defs>
          <pattern id="blocks" width="86" height="72" patternUnits="userSpaceOnUse">
            <rect width="86" height="72" fill="#e9e4d4" />
            <rect x="3" y="3" width="75" height="61" rx="5" fill="#f2eee1" stroke="#d9d1bd" stroke-width=".8" />
            <rect x="9" y="9" width="28" height="21" rx="2" fill="#e4ddca" opacity=".7" />
            <rect x="43" y="9" width="30" height="21" rx="2" fill="#e4ddca" opacity=".55" />
            <rect x="9" y="36" width="64" height="22" rx="2" fill="#e4ddca" opacity=".4" />
          </pattern>
          <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="table" tableValues="0 .10" /></feComponentTransfer><feComposite in2="SourceGraphic" operator="over" /></filter>
        </defs>
        <rect width="380" height="780" fill="url(#blocks)" />
        <g opacity=".9">
          <path d="M-10 118 C70 104, 140 142, 214 122 S330 92, 395 110" fill="none" stroke="#c7d8cf" stroke-width="22" />
          <path d="M-10 118 C70 104, 140 142, 214 122 S330 92, 395 110" fill="none" stroke="#f7f3e7" stroke-width="2" stroke-dasharray="2 8" />
          <path d="M78 -10 C68 80, 92 160, 76 260 S48 410, 82 520 S120 680, 104 790" fill="none" stroke="#f9f5e9" stroke-width="15" />
          <path d="M78 -10 C68 80, 92 160, 76 260 S48 410, 82 520 S120 680, 104 790" fill="none" stroke="#c9c0ac" stroke-width="1" />
          <path d="M-10 448 C70 438, 170 464, 255 444 S352 420, 395 432" fill="none" stroke="#f9f5e9" stroke-width="12" />
          <path d="M-10 632 C100 618, 210 650, 395 620" fill="none" stroke="#f9f5e9" stroke-width="9" />
          <path d="M286 -10 C276 120, 300 240, 280 350 S262 560, 300 790" fill="none" stroke="#f9f5e9" stroke-width="10" />
        </g>
        <g fill="#c9d5c9" opacity=".85">
          <rect x="17" y="152" width="42" height="54" rx="5" />
          <rect x="124" y="178" width="56" height="40" rx="5" />
          <rect x="308" y="152" width="54" height="40" rx="5" />
          <rect x="179" y="350" width="51" height="41" rx="5" />
          <rect x="25" y="512" width="48" height="49" rx="5" />
          <rect x="306" y="488" width="55" height="51" rx="5" />
          <rect x="112" y="700" width="60" height="45" rx="5" />
        </g>
        <g fill="#a9b9a8" opacity=".55">
          <circle cx="39" cy="168" r="8" /><circle cx="57" cy="186" r="11" /><circle cx="150" cy="194" r="8" /><circle cx="335" cy="172" r="11" /><circle cx="203" cy="367" r="7" /><circle cx="47" cy="534" r="10" /><circle cx="334" cy="512" r="8" />
        </g>
        <g fill="#8a917f" opacity=".7" font-family="DM Mono, monospace" font-size="7" letter-spacing="1.2">
          <text x="22" y="122">WEN ER RD.</text>
          <text x="230" y="440">WEN SAN RD.</text>
          <text x="40" y="626">YILE RD.</text>
          <text x="302" y="690" transform="rotate(-88 302 690)">FENGTAN RD.</text>
          <text x="118" y="60">CUIYUAN</text>
          <text x="148" y="348">GUDANG</text>
        </g>
        <rect width="380" height="780" filter="url(#paperNoise)" opacity=".5" />
      </svg>
      <div class="map-top">
        <div class="map-brand"><span class="seal">猫</span><b>猫口地图</b></div>
        <button class="map-filter" type="button" data-action="filters" aria-label="打开筛选">${icon('sliders')}</button>
      </div>
      <div class="map-location">${icon('pin')}翠苑街道 · 西湖区 <span style="opacity:.5">/</span> 3km</div>
      <div class="map-you" style="left:45%;top:46%" aria-label="你的位置"></div>
      ${pins}
      <div class="map-scale">1 : 5,000</div>
      <div class="map-bottom ${cat ? 'has-cat' : ''}">
        ${cat ? `
          <button class="map-close" type="button" data-action="close-map-card" aria-label="关闭猫卡片">${icon('close')}</button>
          <div class="map-cat-card">
            <img src="${A}${cat.photo}" alt="${esc(cat.name)}" />
            <div class="map-cat-info">
              <div class="kicker">${esc(cat.areaShort)} · ${cat.distance} KM AWAY</div>
              <h3>${esc(cat.name)}</h3>
              <p>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}<br />${esc(cat.status)} / ${esc(cat.healthBadge)}</p>
              <button class="btn btn-primary" type="button" data-open-cat="${cat.id}">查看档案 ${icon('arrow-up-right')}</button>
            </div>
          </div>` : `
          <button class="map-hint" type="button" data-action="map-howto">
            <span class="map-hint-icon">${icon('paw')}</span>
            <span><b>${allCats().length} 个猫口坐标</b><p>点位只显示到街区，精确位置需联系上报人</p></span>
            ${icon('chevron')}
          </button>
          <div class="map-store-row">
            <button class="map-store-chip" type="button" data-nav="services">${icon('hospital')}青禾动物医院</button>
            <button class="map-store-chip" type="button" data-nav="services">${icon('coffee')}窗台猫咖</button>
            <button class="map-store-chip" type="button" data-nav="services">${icon('tree')}沿河绿道</button>
          </div>`}
      </div>
    </div>`;
}
