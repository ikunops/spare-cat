function renderServices() {
  const filters = sharedPlaceCategories();
  const all = allPlaces();
  const list = state.servicesFilter === '全部' ? all : all.filter((s) => serviceTypeLabel(s.type) === state.servicesFilter || s.type === state.servicesFilter);
  return `
    <header class="services-page-head">
      <div><div class="page-head-kicker">NEIGHBORHOOD PICKS · 邻里亲测</div><h1>街角那些<br /><em>值得说说的地方。</em></h1><p>医院、猫粮、猫咖，还有适合牵绳散步、推车出门的遛猫地点。不是广告位，是邻居们真的去过、愿意再去的地方。收录不收费，不同的真实体验都会保留。</p></div>
      <div class="stats"><div><b>4.7</b><span>平均评分</span></div><div><b>476</b><span>条真实评价</span></div><div><b>${all.length}</b><span>处已收录</span></div></div>
    </header>
    <div class="service-filters"><div class="button-row">${filters.map((f) => `<button class="pill ${state.servicesFilter === f ? 'is-active' : ''}" type="button" data-service-filter="${f}">${f}</button>`).join('')}</div><div class="service-filter-actions"><button class="btn btn-small" type="button" data-action="add-walk-place">${icon('tree')}分享遛猫地点</button><button class="btn btn-small" type="button" data-action="recommend-service">${icon('plus')}推荐一家</button></div></div>
    <div class="service-grid">${list.map(serviceTile).join('')}</div>
    <div class="service-legend">${icon('shield')}收录不收取费用。评分保留不同体验，商家可公开回复，但不能删除评价。遛猫地点建议补充环境、路面、牵绳与错峰时段，方便别人自行判断。</div>`;
}
