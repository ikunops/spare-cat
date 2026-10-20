const AGE_FILTERS = [
  { value: '全部', label: '不限年龄', note: 'ALL' },
  { value: '0-1m', label: '0–1 个月', note: '奶猫 / 需人工喂养' },
  { value: '1-3m', label: '1–3 个月', note: '断奶过渡期' },
  { value: '3-12m', label: '3–12 个月', note: '幼猫期' },
  { value: '1-3y', label: '1–3 岁', note: '青年猫' },
  { value: '3y+', label: '3 岁以上', note: '成年猫' }
];

const BREED_FILTERS = [
  '全部', '中华田园猫', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫', '英短', '美短', '布偶猫', '暹罗猫', '缅因猫', '加菲猫', '折耳猫', '银渐层', '金渐层', '混血 / 不确定'
];

function normalizeCoatText(cat) {
  return [cat.breed, cat.color].filter(Boolean).join(' ');
}

function breedMatches(cat, value) {
  if (value === '全部') return true;
  const haystack = normalizeCoatText(cat);
  const aliases = {
    '英短': ['英短', '蓝猫'],
    '美短': ['美短'],
    '狸花猫': ['狸花'],
    '橘猫': ['橘'],
    '奶牛猫': ['奶牛', '黑白'],
    '三花猫': ['三花'],
    '玳瑁猫': ['玳瑁'],
    '白猫': ['白狸', '白猫', '纯白', '白色'],
    '黑猫': ['黑猫', '纯黑', '黑色'],
    '混血 / 不确定': ['混血', '不确定', '未知', '待补充']
  };
  const needles = aliases[value] || [value.replace('猫', '')];
  return needles.some((needle) => haystack.includes(needle));
}

function catAgeMonths(cat) {
  if (Number.isFinite(cat.ageMonths)) return cat.ageMonths;
  const years = /(\d+)\s*岁/.exec(cat.age || '');
  const months = /(\d+)\s*个月/.exec(cat.age || '');
  return (years ? Number(years[1]) * 12 : 0) + (months ? Number(months[1]) : 0);
}

function ageMatches(cat, value) {
  if (value === '全部') return true;
  const months = catAgeMonths(cat);
  if (!Number.isFinite(months)) return false;
  if (value === '0-1m') return months >= 0 && months < 1;
  if (value === '1-3m') return months >= 1 && months < 3;
  if (value === '3-12m') return months >= 3 && months < 12;
  if (value === '1-3y') return months >= 12 && months < 36;
  if (value === '3y+') return months >= 36;
  return true;
}

function ageLabelFor(value) {
  return (AGE_FILTERS.find((item) => item.value === value) || AGE_FILTERS[0]).label;
}

function isCitywide(filters = state.filters) {
  return Boolean(filters && filters.citywide);
}

function distanceMatches(cat, km, citywide = false) {
  return citywide ? true : cat.distance <= Number(km);
}

function distanceLabel(km) {
  const value = Number(km);
  if (value === DISTANCE_DEFAULT) return DISTANCE_DEFAULT + 'km 内都看看';
  return value >= DISTANCE_MAX ? DISTANCE_MAX + 'km 内都看看' : value + 'km 内';
}

function distanceScopeLabel(filters = state.filters) {
  if (isCitywide(filters)) return '全城都看看';
  return distanceLabel(filters.distance);
}

function distanceTicks() {
  const values = [DISTANCE_MIN, 5, 10, DISTANCE_MAX];
  return values.map((value) => {
    const percent = ((value - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)) * 100;
    return `<span style="left:${percent}%">${value}km</span>`;
  }).join('');
}

function previewFilterCount(key, value) {
  return availableCats().filter((cat) => {
    if (key === 'breed' && !breedMatches(cat, value)) return false;
    if (key === 'age') return ageMatches(cat, value);
    if (key === 'sex' && value !== '全部' && cat.sex !== value) return false;
    if (key === 'distance') return distanceMatches(cat, value, state.filters.citywide);
    return true;
  }).length;
}

function filterModal() {
  const f = state.filters;
  const special = ['全部', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫'];
  const common = BREED_FILTERS.filter((item) => special.includes(item));
  const more = BREED_FILTERS.filter((item) => !special.includes(item));
  const breedButton = (value) => `<button class="filter-option ${f.breed === value ? 'is-active' : ''}" type="button" data-filter-key="breed" data-filter-value="${esc(value)}"><span>${esc(value)}</span><small>${previewFilterCount('breed', value)}</small></button>`;

  modal(`
    <div class="filter-panel" data-filter-panel>
      <h2>找一只对得上的猫</h2>
      <p class="modal-sub">条件不用一次填满。月龄只是估计，见面时还可以再确认。</p>

      <section class="filter-group filter-breed-group">
        <div class="filter-label"><b>品种 / 毛色</b><span>BREED &amp; COAT · ${availableCats().length} 只建档</span></div>
        <div class="filter-options">${common.map(breedButton).join('')}</div>
        <details class="filter-more">
          <summary>更多品种与毛色 ${icon('chevron-down')}</summary>
          <div class="filter-options">${more.map(breedButton).join('')}</div>
        </details>
      </section>

      <section class="filter-group">
        <div class="filter-label"><b>月龄 / 年龄</b><span>AGE · 按更容易辨认的阶段</span></div>
        <div class="filter-age-grid">
          ${AGE_FILTERS.map((item) => `<button class="filter-age ${f.age === item.value ? 'is-active' : ''}" type="button" data-filter-key="age" data-filter-value="${item.value}"><b>${item.label}</b><small>${item.note}<i>${previewFilterCount('age', item.value)} 只</i></small></button>`).join('')}
        </div>
        <p class="filter-hint">${icon('paw')}0–1 个月的奶猫需要人工喂养和保温，和 2–3 个月的小猫照护节奏不同；1 岁以后可以按“年”来记。拿不准时选“不限年龄”，见面再确认。</p>
      </section>

      <section class="filter-group">
        <div class="filter-label"><b>距离</b><span>DISTANCE · 从你现在的街区算起</span></div>
        <div class="distance-filter">
          <div class="distance-value"><b data-distance-value>${distanceScopeLabel(f)}</b><span data-distance-count>约 ${previewFilterCount('distance', f.distance)} 只猫</span></div>
          <input type="range" min="${DISTANCE_MIN}" max="${DISTANCE_MAX}" step="0.5" value="${f.distance}" data-distance-range aria-label="按距离筛选猫只" />
          <div class="distance-ticks">${distanceTicks()}</div>
          <button class="distance-citywide ${isCitywide(f) ? 'is-active' : ''}" type="button" data-action="toggle-citywide" aria-pressed="${isCitywide(f) ? 'true' : 'false'}"><span class="distance-citywide-dot"></span><span><b>全城</b><small>不限距离，看看杭州全城待领养的猫</small></span><i data-citywide-count>${availableCats().length} 只</i></button>
        </div>
      </section>

      <section class="filter-group filter-group-last">
        <div class="filter-label"><b>性别</b><span>SEX</span></div>
        <div class="filter-options">${['全部', '公', '母'].map((value) => `<button class="filter-option ${f.sex === value ? 'is-active' : ''}" type="button" data-filter-key="sex" data-filter-value="${value}"><span>${value}</span><small>${previewFilterCount('sex', value)}</small></button>`).join('')}</div>
      </section>

      <div class="filter-result-note"><span>符合条件</span><b data-filter-result>${filteredCats().length}</b><span>只，看看哪只在等你</span></div>
      <div class="modal-actions"><button class="btn" type="button" data-action="reset-filters">重置</button><button class="btn btn-primary" type="button" data-action="apply-filters">看看 ${filteredCats().length} 只猫</button></div>
    </div>`, 'filter-modal');

  bindDistanceRange();
  syncRangeFill();
}

function bindDistanceRange() {
  const range = $('[data-distance-range]');
  if (!range) return;
  range.addEventListener('input', () => {
    state.filters.distance = Number(range.value);
    state.filters.citywide = false;
    const label = $('[data-distance-value]');
    const count = $('[data-distance-count]');
    const result = $('[data-filter-result]');
    const action = $('[data-action="apply-filters"]');
    const citywide = $('[data-action="toggle-citywide"]');
    if (label) label.textContent = distanceScopeLabel(state.filters);
    if (count) count.textContent = '约 ' + previewFilterCount('distance', state.filters.distance) + ' 只猫';
    if (citywide) {
      citywide.classList.remove('is-active');
      citywide.setAttribute('aria-pressed', 'false');
    }
    if (result) result.textContent = filteredCats().length;
    if (action) action.textContent = '看看 ' + filteredCats().length + ' 只猫';
    syncRangeFill();
  });
}

function syncRangeFill() {
  const range = $('[data-distance-range]');
  if (!range) return;
  const min = Number(range.min);
  const max = Number(range.max);
  const percent = ((Number(range.value) - min) / (max - min)) * 100;
  range.style.setProperty('--fill', percent + '%');
}
