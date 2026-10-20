# 闲猫 · 手慢无 / SPARE CAT

> **Spare a home. Share a life.**
> 腾一个空房间，换一段猫生。

「闲猫」是一个免费的邻里流浪猫领养与照护平台。附近的猫被附近的人看见——
按品种、年龄、性别、距离筛选，在地图上看猫口分布，读到邻居写的照护笔记，
再决定要不要去见一面。

![闲猫 · 发现页](docs/screens/app-home.jpg)

## 三个入口

<table>
<tr>
<td width="33%"><img src="docs/screens/app-home.jpg" alt="发现页"><br><b>发现</b><br>附近的猫，在等一个家</td>
<td width="33%"><img src="docs/screens/app-map.jpg" alt="猫口地图"><br><b>猫口地图</b><br>猫不在列表里，在街角</td>
<td width="33%"><img src="docs/screens/app-profile.jpg" alt="我的猫事"><br><b>我的猫事</b><br>你留下的每一笔，都算数</td>
</tr>
</table>

## 桌面端

**发现页** —— 一整面墙的附近猫，按品种、月龄、性别、距离筛。

![桌面端发现页](docs/screens/pc-home.jpg)

**猫口地图** —— 左边是街，右边是猫。点位只公开到街区，双击进全屏可自由拖动缩放。

![桌面端猫口地图](docs/screens/pc-map.jpg)

**邻里广场** —— 养猫经验、遛猫地点、猫友同路，都是邻居亲手写的。

![桌面端邻里广场](docs/screens/pc-community.jpg)

**附近好店** —— 医院、猫粮店、猫咖、遛猫去处，亲历评价，差评也留着。

![附近好店与实拍环境图](docs/screens/pc-services.jpg)

**遛猫地点详情** —— 环境描述、地点优点、实拍图，都能自己写。

![遛猫地点详情](docs/screens/pc-walk.jpg)

## 手机端

<p>
<img src="docs/screens/mobile-home.jpg" width="240" alt="手机端发现页">
<img src="docs/screens/mobile-community.jpg" width="240" alt="手机端广场">
</p>

## 是什么

- **发现**：按品种、月龄、性别、距离筛选附近的待领养猫，读完档案再决定
- **猫口地图**：真实底图（高德 / OpenStreetMap 可切换），点位只公开到街区；
  支持片区聚合搜索（输入「古荡」「路」直接圈出这一带）、滚轮缩放至全国视野
- **上报一只猫**：照片、特征、绝育与亲人状态、位置，两分钟填完
- **邻里广场**：养猫经验、捉猫技巧、遛猫地点、猫友同路
- **附近好店**：医院、猫粮店、猫咖、遛猫去处，邻居亲历评价，差评也留着
- **我的猫事**：领养、上报、发帖、评论、收藏、遛猫地点，贡献换头像框

## 原则

- 不做活体交易，只搭合领养
- 公开大致街区，不公开精确坐标
- 好店评价保留差评，也保留解释

## 技术栈

零构建、零框架，纯静态 + 一个极小的 Node 服务：

```
index.html / styles.css / app.js     原生移动展示版
web.html / web.css / web.js          桌面 + 响应式 Web 版
parts-web/                           web.js 的源码分片（由 work/build-web.js 合并）
server/app.js                        Node HTTP 服务 + REST API
server/db.js                         SQLite 数据层（node:sqlite）
vendor/leaflet/                      Leaflet 本地副本
assets/                              猫照片与字体子集
previews/                            高清界面截图（宣传用）
docs/screens/                        README 用压缩截图
```

- 前端：原生 HTML / CSS / JavaScript，无打包步骤
- 地图：Leaflet + 高德中文街道底图 / OpenStreetMap
- 后端：Node 24（`node:sqlite`），SQLite 单文件数据库
- 响应式：1180 / 900 / 600 / 420 四档断点

## 本地运行

```bash
# 需要 Node 22.5+（用到内置 node:sqlite）
node server/app.js
# 默认 http://localhost:4173
```

数据库会在 `data/xianmao.sqlite` 自动创建并写入种子数据。

## 部署

见 [DEPLOY.md](DEPLOY.md)。概要：Docker 起 Node 24 容器，宿主端口 4173，
由上层 Nginx 以 `/xianmao/` 子路径反代。

## 说明

这是产品原型阶段的可交互前端，数据存于 SQLite（含少量演示数据）。
高清截图见 `previews/`，宣传文案见 [COPY.md](COPY.md)。
