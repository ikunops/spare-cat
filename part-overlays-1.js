function overlay(html, full = false) {
  const root = $('#overlayRoot');
  root.innerHTML = `<div class="overlay"><div class="overlay-backdrop" data-action="close-overlay"></div><div class="${full ? 'sheet sheet-full' : 'sheet'}" role="dialog" aria-modal="true">${html}</div></div>`;
  const focusable = $('#overlayRoot button, #overlayRoot input, #overlayRoot textarea, #overlayRoot select');
  if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 80);
}

function closeOverlay() {
  const root = $('#overlayRoot');
  if (root) root.innerHTML = '';
}

function filterSheet() {
  const groups = [
    { key: 'breed', label: '品种', hint: 'BREED', options: ['全部', '中华田园猫', '英短蓝猫', '奶牛猫'] },
    { key: 'age', label: '年龄', hint: 'AGE', options: ['全部', '幼年', '成年'] },
    { key: 'sex', label: '性别', hint: 'SEX', options: ['全部', '公', '母'] },
    { key: 'distance', label: '距离', hint: 'DISTANCE', options: ['1km', '3km', '全部'] }
  ];
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>缩小一点范围</h2><p>条件越少，越容易遇见本来没想到的猫。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭筛选">${icon('close')}</button></div>
      ${groups.map((group) => `
        <div class="filter-group">
          <div class="filter-label"><b>${group.label}</b><span>${group.hint}</span></div>
          <div class="filter-options">${group.options.map((option) => `<button class="filter-option ${state.filters[group.key] === option ? 'is-active' : ''}" type="button" data-filter-key="${group.key}" data-filter-value="${option}">${option === '1km' ? '1km 内' : option === '3km' ? '3km 内' : option}</button>`).join('')}</div>
        </div>`).join('')}
    </div>
    <div class="filter-actions"><button class="btn" type="button" data-action="clear-filters">重置</button><button class="btn btn-primary" type="button" data-action="apply-filters">看看 ${filteredCats().length} 只猫</button></div>`);
}
