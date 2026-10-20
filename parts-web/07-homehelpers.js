function countActiveFilters() {
  let n = 0;
  Object.entries(state.filters).forEach(([k, v]) => {
    if (k === 'distance') { if (Number(v) !== DISTANCE_DEFAULT) n += 1; return; }
    if (k === 'citywide') { if (v === true) n += 1; return; }
    if (v !== '全部') n += 1;
  });
  return n;
}

function emptyCatsWeb() {
  return `<div class="empty-state-web" style="grid-column:1/-1">${icon('cat')}<h3>这一带暂时没有匹配的猫</h3><p>试试放宽距离或品种。<br />没有结果不代表没有猫，可能只是还没被看见。</p><button type="button" data-action="reset-filters">清空筛选</button></div>`;
}
