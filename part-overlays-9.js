function infoSheet(kind) {
  const content = {
    notice: `<div class="info-content"><h3>今天的邻里提醒</h3><p>翠苑二区南门，橘白猫“板栗”今天 08:42 被目击。目击者说它状态稳定，会主动蹭人。</p><h3>附近动态</h3><ul><li>古荡新村：小灰的临时投喂点已补粮。</li><li>文三路：豆包等待疫苗完成，暂不接受领养。</li><li>沿河绿道：周六上午有群护队绝育车。</li></ul></div>`,
    location: `<div class="info-content"><h3>切换附近区域</h3><p>当前为翠苑街道，覆盖约 3km。切换区域后，发现、地图与好店会一起更新。</p><ul><li>翠苑街道 · 当前</li><li>古荡街道 · 2.1km</li><li>文新街道 · 3.4km</li></ul></div>`,
    howto: `<div class="info-content"><h3>地图怎么用</h3><p>猫口点位只显示到街区，精确位置需要与上报人确认。这样能减少围堵、弃养和恶意领养。</p><ul><li>点猫头像看简要档案。</li><li>点“查看档案”阅读性格与健康信息。</li><li>点筛选缩小距离、年龄和品种。</li></ul></div>`,
    settings: `<div class="info-content"><h3>隐私与位置</h3><p>闲猫默认不公开精确坐标。你的联系方式只在提交领养申请后对上报人可见。</p><h3>实名与信用</h3><p>实名信息不会展示给其他用户，仅用于领养纠纷协调。邻里信用来自信息准确度、回访完成度和社区评价。</p></div>`
  };
  const titles = { notice: '附近的一点动静', location: '切换附近区域', howto: '先了解，再靠近', settings: '你的边界，你来定' };
  overlay(`<div class="sheet-handle"></div><div class="sheet-scroll"><div class="sheet-head"><div><h2>${titles[kind] || titles.notice}</h2><p>闲猫 · 邻里互助说明</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭">${icon('close')}</button></div>${content[kind] || content.notice}</div>`);
}
