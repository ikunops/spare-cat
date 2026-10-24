const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const { DB_PATH, createDatabase, bootstrap } = require('./db');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const USERNAME_RE = /^[\u4e00-\u9fa5a-zA-Z0-9_\-.·]{2,20}$/;
// 测试模式：无令牌访问自动发访客身份（免注册），管理权限仍需真实注册账号
const TEST_MODE = process.env.TEST_MODE === '1';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

const db = createDatabase();

function makeToken() {
  return crypto.randomBytes(24).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), String(salt), 32).toString('hex');
}

function sameSecret(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function authUser(req) {
  const token = String(req.headers['x-user-token'] || '').trim();
  if (!token) return null;
  return db.prepare('SELECT * FROM users WHERE token = ?').get(token) || null;
}

function requireUser(req, res) {
  const user = authUser(req);
  if (!user) {
    json(res, 401, { error: '请先登录后再发布内容' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = authUser(req);
  if (!user) {
    json(res, 401, { error: '请先登录' });
    return null;
  }
  if (!user.is_admin) {
    json(res, 403, { error: '需要管理员权限' });
    return null;
  }
  return user;
}

// 本地敏感词库：重点拦截领养平台灰产话术（有偿领养变相交易、贩子引流）。
// 保守取向：宁可漏过由人工巡检兜底，避免误伤正常邻里交流。
const BLOCKED_WORDS = ['有偿', '营养费', '奶粉钱', '红包', '出售', '卖猫', '买猫', '收购', '贩子', '配种', '借配', '包活', '加v', '加微信', '加qq', 'vx', '威信', '看猫私聊', '转账', '代孕', '赌博'];

function checkBlocked(pairs) {
  for (const [field, value] of pairs) {
    const text = String(value || '').toLowerCase();
    const hit = BLOCKED_WORDS.find((word) => text.includes(word));
    if (hit) return `「${field}」包含受限内容（${hit}），请修改后重发；如有疑问可联系管理员`;
  }
  return null;
}

function adminStats() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const count = (sql) => db.prepare(sql).get().n;
  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  const catsByDay = new Map(db.prepare("SELECT date(reported_at) AS d, COUNT(*) AS n FROM cats WHERE date(reported_at) >= date('now', '-13 days') GROUP BY d").all().map((r) => [r.d, r.n]));
  const postsByDay = new Map(db.prepare("SELECT date(created_at) AS d, COUNT(*) AS n FROM posts WHERE date(created_at) >= date('now', '-13 days') GROUP BY d").all().map((r) => [r.d, r.n]));
  return {
    counts: {
      users: count('SELECT COUNT(*) AS n FROM users'),
      cats: count("SELECT COUNT(*) AS n FROM cats WHERE status != 'removed'"),
      pendingVerify: count("SELECT COUNT(*) AS n FROM cats WHERE verification = '待核验' AND status != 'removed'"),
      adopted: count("SELECT COUNT(*) AS n FROM cats WHERE adoption_state = '已领养'"),
      applications: count('SELECT COUNT(*) AS n FROM applications'),
      posts: count("SELECT COUNT(*) AS n FROM posts WHERE status != 'removed'"),
      places: count("SELECT COUNT(*) AS n FROM places WHERE status != 'removed'"),
      openReports: count("SELECT COUNT(*) AS n FROM reports WHERE status = 'open'"),
      todayCats: count(`SELECT COUNT(*) AS n FROM cats WHERE date(reported_at) = '${todayStr}'`)
    },
    funnel: { reported: count("SELECT COUNT(*) AS n FROM cats"), applied: count('SELECT COUNT(*) AS n FROM applications'), adopted: count("SELECT COUNT(*) AS n FROM cats WHERE adoption_state = '已领养'") },
    trend: days.map((date) => ({ date, cats: catsByDay.get(date) || 0, posts: postsByDay.get(date) || 0 }))
  };
}

function adminList(type, page, q, status) {
  const like = `%${q}%`;
  const off = (page - 1) * 20;
  const conds = [];
  let params = [];
  let rowsSql;
  let countSql;
  if (type === 'cats') {
    if (q) { conds.push('(name LIKE ? OR reporter_name LIKE ?)'); params.push(like, like); }
    if (status === 'pending') conds.push("verification = '待核验'");
    else if (status === 'published' || status === 'removed') conds.push(`status = '${status}'`);
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    rowsSql = `SELECT id, name, status, verification AS tag, adoption_state AS extra, reporter_name AS author_name, reported_at AS created_at FROM cats ${where} ORDER BY reported_at DESC LIMIT 20 OFFSET ?`;
    countSql = `SELECT COUNT(*) AS n FROM cats ${where}`;
  } else if (type === 'posts') {
    if (q) { conds.push('(title LIKE ? OR author_name LIKE ?)'); params.push(like, like); }
    if (status === 'published' || status === 'removed') conds.push(`status = '${status}'`);
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    rowsSql = `SELECT id, title AS name, status, '' AS tag, author_name, created_at FROM posts ${where} ORDER BY created_at DESC LIMIT 20 OFFSET ?`;
    countSql = `SELECT COUNT(*) AS n FROM posts ${where}`;
  } else if (type === 'places') {
    if (q) { conds.push('(p.name LIKE ? OR u.display_name LIKE ?)'); params.push(like, like); }
    if (status === 'published' || status === 'removed') conds.push(`p.status = '${status}'`);
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    rowsSql = `SELECT p.id, p.name, p.status, '' AS tag, u.display_name AS author_name, p.created_at FROM places p LEFT JOIN users u ON u.id = p.submitted_by ${where} ORDER BY p.created_at DESC LIMIT 20 OFFSET ?`;
    countSql = `SELECT COUNT(*) AS n FROM places p LEFT JOIN users u ON u.id = p.submitted_by ${where}`;
  } else if (type === 'users') {
    if (q) { conds.push('(display_name LIKE ? OR username LIKE ?)'); params.push(like, like); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    rowsSql = `SELECT id, display_name AS name, (CASE WHEN is_admin = 1 THEN 'admin' ELSE 'member' END) AS status, username AS tag, area AS extra, created_at FROM users ${where} ORDER BY created_at DESC LIMIT 20 OFFSET ?`;
    countSql = `SELECT COUNT(*) AS n FROM users ${where}`;
  } else if (type === 'reports') {
    if (q) { conds.push('(reason LIKE ? OR reporter_name LIKE ?)'); params.push(like, like); }
    if (status === 'open' || status === 'resolved') conds.push(`r.status = '${status}'`);
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    rowsSql = `SELECT r.id, COALESCE(c.name, r.target_id) AS name, r.status, r.target_type AS tag, r.reporter_name AS author_name, r.reason AS extra, r.created_at FROM reports r LEFT JOIN cats c ON c.id = r.target_id AND r.target_type = 'cat' ${where} ORDER BY r.created_at DESC LIMIT 20 OFFSET ?`;
    countSql = `SELECT COUNT(*) AS n FROM reports r LEFT JOIN cats c ON c.id = r.target_id AND r.target_type = 'cat' ${where}`;
  } else {
    return null;
  }
  const total = db.prepare(countSql).get(...params).n;
  const items = db.prepare(rowsSql).all(...params, off).map((row) => ({ ...row, author_name: row.author_name || '', tag: row.tag || '' }));
  return { items, total, page, pages: Math.max(1, Math.ceil(total / 20)) };
}


function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 8_000_000) { reject(new Error('payload too large')); req.destroy(); }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (error) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

function findOrCreateLocation({ label, area, address, lat, lng, coordSystem = 'GCJ-02' }) {
  const existing = db.prepare('SELECT id FROM locations WHERE label = ? AND lat = ? AND lng = ?').get(label, lat, lng);
  if (existing) return existing.id;
  return Number(db.prepare('INSERT INTO locations (label, area, address, lat, lng, coord_system, privacy) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(label, area || '', address || label, lat, lng, coordSystem, 'street').lastInsertRowid);
}

function placeholders(values) {
  return values.map(() => '?').join(',');
}

function makeGuest(db) {
  const code = crypto.randomBytes(2).toString('hex').toUpperCase();
  const token = makeToken();
  db.prepare(`INSERT INTO users (id, display_name, avatar_text, area, verified, credit, token, is_admin)
    VALUES (?, ?, '客', '测试访客', 0, 70, ?, 0)`)
    .run(`guest-${crypto.randomBytes(6).toString('hex')}`, `访客${code}`, token);
  return db.prepare('SELECT * FROM users WHERE token = ?').get(token);
}

function api(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
    const user = authUser(req);
    if (user) return json(res, 200, bootstrap(db, user));
    if (TEST_MODE) {
      const guest = makeGuest(db);
      return json(res, 200, { token: guest.token, guest: true, ...bootstrap(db, guest) });
    }
    return json(res, 200, bootstrap(db, null));
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    return body(req).then((data) => {
      const username = String(data.username || '').trim();
      const password = String(data.password || '');
      const nickname = String(data.nickname || '').trim() || username;
      if (!USERNAME_RE.test(username)) return json(res, 400, { error: '用户名需 2-20 位中文、字母、数字或 _ - . ·' });
      if (password.length < 6) return json(res, 400, { error: '密码至少 6 位' });
      if (!nickname || nickname.length > 12) return json(res, 400, { error: '昵称需 1-12 个字' });
      if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
        return json(res, 409, { error: '这个用户名已经被注册了' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const token = makeToken();
      const isAdmin = db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_admin = 1').get().n === 0 ? 1 : 0;
      db.prepare(`INSERT INTO users (id, display_name, avatar_text, area, verified, credit, username, password_hash, salt, token, is_admin)
        VALUES (?, ?, ?, '', 0, 70, ?, ?, ?, ?, ?)`)
        .run(`u-${crypto.randomBytes(6).toString('hex')}`, nickname, nickname.slice(0, 1), username, hashPassword(password, salt), salt, token, isAdmin);
      const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
      return json(res, 201, { token, ...bootstrap(db, user) });
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    return body(req).then((data) => {
      const username = String(data.username || '').trim();
      const password = String(data.password || '');
      const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      if (!row || !row.password_hash || !row.salt || !sameSecret(row.password_hash, hashPassword(password, row.salt))) {
        return json(res, 401, { error: '用户名或密码不对' });
      }
      const token = makeToken();
      db.prepare('UPDATE users SET token = ? WHERE id = ?').run(token, row.id);
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.id);
      return json(res, 200, { token, ...bootstrap(db, user) });
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/profile') {
    const user = requireUser(req, res);
    if (!user) return;
    return body(req).then((data) => {
      const nickname = String(data.nickname || '').trim() || user.display_name;
      const area = String(data.area || '').trim().slice(0, 20);
      if (nickname.length > 12) return json(res, 400, { error: '昵称最多 12 个字' });
      db.prepare('UPDATE users SET display_name = ?, avatar_text = ?, area = ? WHERE id = ?')
        .run(nickname, nickname.slice(0, 1), area, user.id);
      return json(res, 200, bootstrap(db, db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/cats') {
    return body(req).then((data) => {
      const user = requireUser(req, res);
      if (!user) return;
      const required = ['name', 'breed', 'sex', 'lat', 'lng'];
      if (required.some((key) => data[key] === undefined || data[key] === '')) {
        return json(res, 400, { error: '缺少必要字段' });
      }
      const blocked = checkBlocked([['猫名', data.name], ['说明', data.note]]);
      if (blocked) return json(res, 400, { error: blocked });
      const id = `pub-${Date.now()}`;
      const locationId = findOrCreateLocation({
        label: data.area || '附近街区', area: (data.area || '').split('·')[0].trim(), address: data.area || '',
        lat: Number(data.lat), lng: Number(data.lng), coordSystem: data.coordSystem || 'GCJ-02'
      });
      db.prepare(`INSERT INTO cats (id, name, english, breed, color, sex, age_months, age_label, age_group, status, photo, note, traits_json, health_tags_json, sterilization, vaccine, deworm, reporter_id, reporter_name, location_id, verification, adoption_state, view_count, application_count, distance_km, reported_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, datetime('now'))`).run(
        id, data.name, 'NEW NEIGHBOR', data.breed, data.color || '', data.sex, Number(data.ageMonths || 0), data.age || '', data.ageGroup || '成年',
        '邻里上报', data.photo || '', data.note || '', JSON.stringify(data.traits || []), JSON.stringify(data.healthTags || []),
        data.sterilization || '未知', data.vaccine || '未知', data.deworm || '未知', user.id, user.display_name, locationId,
        '待核验', '待领养', Number(data.distance || 0)
      );
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && /^\/api\/cats\/[^/]+\/favorite$/.test(url.pathname)) {
    const user = requireUser(req, res);
    if (!user) return;
    const catId = decodeURIComponent(url.pathname.split('/')[3]);
    const exists = db.prepare('SELECT 1 FROM cats WHERE id = ?').get(catId);
    if (!exists) return json(res, 404, { error: '没有这只猫' });
    const favorite = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND cat_id = ?').get(user.id, catId);
    if (favorite) db.prepare('DELETE FROM favorites WHERE user_id = ? AND cat_id = ?').run(user.id, catId);
    else db.prepare('INSERT INTO favorites (user_id, cat_id) VALUES (?, ?)').run(user.id, catId);
    return json(res, 200, bootstrap(db, user));
  }

  if (req.method === 'POST' && /^\/api\/cats\/[^/]+\/applications$/.test(url.pathname)) {
    const user = requireUser(req, res);
    if (!user) return;
    const catId = decodeURIComponent(url.pathname.split('/')[3]);
    return body(req).then((data) => {
      const cat = db.prepare('SELECT id FROM cats WHERE id = ?').get(catId);
      if (!cat) return json(res, 404, { error: '没有这只猫' });
      if (!data.name || !data.phone || !data.reason) return json(res, 400, { error: '申请信息不完整' });
      const blocked = checkBlocked([['申请理由', data.reason]]);
      if (blocked) return json(res, 400, { error: blocked });
      db.prepare(`INSERT INTO applications (cat_id, applicant_id, home_type, experience, reason, status)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (cat_id, applicant_id) DO UPDATE SET
        home_type = excluded.home_type, experience = excluded.experience, reason = excluded.reason, status = '等待初审'`)
        .run(catId, user.id, data.home || '', data.experience || '', data.reason, '等待初审');
      db.prepare('UPDATE cats SET application_count = application_count + 1, adoption_state = ? WHERE id = ?').run('申请中', catId);
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && /^\/api\/places\/[^/]+\/reviews$/.test(url.pathname)) {
    const user = requireUser(req, res);
    if (!user) return;
    const placeId = decodeURIComponent(url.pathname.split('/')[3]);
    return body(req).then((data) => {
      if (!data.text) return json(res, 400, { error: '写一句真实感受吧' });
      const blocked = checkBlocked([['评价', data.text]]);
      if (blocked) return json(res, 400, { error: blocked });
      const stars = Math.max(1, Math.min(5, Number(data.stars || 5)));
      db.prepare('INSERT INTO place_reviews (place_id, user_id, author_name, stars, text, tags_json) VALUES (?, ?, ?, ?, ?, ?)')
        .run(placeId, user.id, user.display_name, stars, data.text, JSON.stringify(data.tags || []));
      db.prepare('UPDATE places SET review_count = review_count + 1 WHERE id = ?').run(placeId);
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/posts') {
    return body(req).then((data) => {
      const user = requireUser(req, res);
      if (!user) return;
      if (!data.title || !data.body) return json(res, 400, { error: '标题和正文不能为空' });
      const blocked = checkBlocked([['标题', data.title], ['正文', data.body]]);
      if (blocked) return json(res, 400, { error: blocked });
      const id = String(data.id || `p-${Date.now()}`);
      const tag = String(data.tag || '邻里随记');
      const tagClass = tag === '捉猫实录' ? 'is-trap' : tag === '就医体验' ? 'is-pit' : tag === '猫咖打卡' ? 'is-checkin' : tag === '遛猫地点' ? 'is-walk' : tag === '猫友同路' ? 'is-companion' : '';
      const image = typeof data.image === 'string' && (/^data:image\//.test(data.image) || /^cat-[0-9]+\.(jpg|jpeg|png|webp)$/i.test(data.image)) ? data.image : '';
      db.prepare(`INSERT INTO posts (id, author_id, author_name, avatar_text, tag, title, body, place, image, tag_class, likes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`)
        .run(id, user.id, user.display_name, user.avatar_text, tag, data.title, String(data.body).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br />'), data.place || '翠苑二区', image, tagClass);
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && /^\/api\/posts\/[^/]+\/comments$/.test(url.pathname)) {
    const user = requireUser(req, res);
    if (!user) return;
    const postId = decodeURIComponent(url.pathname.split('/')[3]);
    return body(req).then((data) => {
      if (!data.text) return json(res, 400, { error: '评论不能为空' });
      const blocked = checkBlocked([['评论', data.text]]);
      if (blocked) return json(res, 400, { error: blocked });
      const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
      if (!post) return json(res, 404, { error: '没有这篇笔记' });
      db.prepare('INSERT INTO comments (post_id, author_id, author_name, text, time_label) VALUES (?, ?, ?, ?, ?)').run(postId, user.id, user.display_name, data.text, '刚刚');
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && /^\/api\/posts\/[^/]+\/like$/.test(url.pathname)) {
    const user = requireUser(req, res);
    if (!user) return;
    const postId = decodeURIComponent(url.pathname.split('/')[3]);
    return body(req).then((data) => {
      const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
      if (!post) return json(res, 404, { error: '没有这篇笔记' });
      const liked = Boolean(data.liked);
      const existing = db.prepare('SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?').get(user.id, postId);
      if (liked && !existing) {
        db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(user.id, postId);
        db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
      } else if (!liked && existing) {
        db.prepare('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?').run(user.id, postId);
        db.prepare('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?').run(postId);
      }
      return json(res, 200, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/places') {
    return body(req).then((data) => {
      const user = requireUser(req, res);
      if (!user) return;
      if (!data.name || !data.area) return json(res, 400, { error: '地点名和区域不能为空' });
      const blocked = checkBlocked([['地点名', data.name], ['环境描述', data.environment], ['适合与提醒', data.advice], ['遛猫心得', data.experience]]);
      if (blocked) return json(res, 400, { error: blocked });
      const id = String(data.id || `walk-${Date.now()}`);
      const spot = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
      const lat = Number(data.lat || 30.2886);
      const lng = Number(data.lng || 120.1283);
      if (!spot) {
        // 新建前查重：同名优先，其次坐标落在已有遛猫地点约 150m 范围内 → 不重复创建
        const byName = db.prepare('SELECT id, name FROM places WHERE name = ? LIMIT 1').get(String(data.name).trim());
        const byCoord = byName ? null : db.prepare(`SELECT p.id, p.name FROM places p JOIN locations l ON l.id = p.location_id
          WHERE l.lat IS NOT NULL AND abs(l.lat - ?) < 0.0014 AND abs(l.lng - ?) < 0.0018 LIMIT 1`).get(lat, lng);
        const duplicate = byName || byCoord;
        if (duplicate) {
          return json(res, 200, { duplicateOf: duplicate.id, duplicateName: duplicate.name, ...bootstrap(db, user) });
        }
      }
      const locationId = findOrCreateLocation({ label: data.area, area: data.area.split('·')[0].trim(), address: data.address || data.area, lat, lng });
      const photos = JSON.stringify(Array.isArray(data.photos) ? data.photos.filter((photo) => typeof photo === 'string' && (/^data:image\//.test(photo) || /^cat-[0-9]+\.(jpg|jpeg|png|webp)$/i.test(photo))).slice(0, 3) : []);
      const details = JSON.stringify({ environment: data.environment || '', advice: data.advice || '', experience: data.experience || '' });
      if (spot) {
        db.prepare('UPDATE places SET name = ?, type = ?, hours = ?, note = ?, location_id = ?, photos_json = ?, details_json = ?, submitted_by = ? WHERE id = ?')
          .run(data.name, '遛猫的地方', data.hours || spot.hours, data.environment || spot.note, locationId, photos, details, user.id, id);
      } else {
        db.prepare('INSERT INTO places (id, name, type, rating, review_count, tags_json, hours, phone, price, note, location_id, photos_json, details_json, submitted_by) VALUES (?, ?, ?, 5, 1, ?, ?, \'\', \'免费\', ?, ?, ?, ?, ?)')
          .run(id, data.name, '遛猫的地方', JSON.stringify(['邻里实走']), data.hours || '全天开放', data.environment || '', locationId, photos, details, user.id);
      }
      return json(res, 201, bootstrap(db, user));
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'POST' && url.pathname === '/api/reports') {
    return body(req).then((data) => {
      const user = requireUser(req, res);
      if (!user) return;
      const targetType = String(data.targetType || '');
      const targetId = String(data.targetId || '');
      const reason = String(data.reason || '').trim();
      if (!['cat', 'post', 'comment', 'place', 'review'].includes(targetType) || !targetId || !reason) {
        return json(res, 400, { error: '举报信息不完整' });
      }
      if (reason.length > 200) return json(res, 400, { error: '举报说明请控制在 200 字内' });
      db.prepare('INSERT INTO reports (target_type, target_id, reporter_id, reporter_name, reason) VALUES (?, ?, ?, ?, ?)')
        .run(targetType, targetId, user.id, user.display_name, reason);
      return json(res, 201, { ok: true });
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/stats') {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return json(res, 200, adminStats());
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/list') {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const list = adminList(
      url.searchParams.get('type') || 'cats',
      Math.max(1, Number(url.searchParams.get('page') || 1)),
      (url.searchParams.get('q') || '').trim().slice(0, 50),
      url.searchParams.get('status') || 'all'
    );
    if (!list) return json(res, 400, { error: '未知的列表类型' });
    return json(res, 200, list);
  }

  if (req.method === 'POST' && /^\/api\/admin\/(cats|posts|places)\/[^/]+\/(verify|reject|remove|restore)$/.test(url.pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const [, , , kind, id, action] = url.pathname.split('/');
    const sql = {
      'cats:verify': "UPDATE cats SET verification = '已核验' WHERE id = ?",
      'cats:reject': "UPDATE cats SET verification = '已退回' WHERE id = ?",
      'cats:remove': "UPDATE cats SET status = 'removed' WHERE id = ?",
      'cats:restore': "UPDATE cats SET status = 'published' WHERE id = ?",
      'posts:remove': "UPDATE posts SET status = 'removed' WHERE id = ?",
      'posts:restore': "UPDATE posts SET status = 'published' WHERE id = ?",
      'places:remove': "UPDATE places SET status = 'removed' WHERE id = ?",
      'places:restore': "UPDATE places SET status = 'published' WHERE id = ?"
    }[`${kind}:${action}`];
    if (!sql) return json(res, 400, { error: '未知操作' });
    db.prepare(sql).run(id);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && /^\/api\/admin\/comments\/[^/]+$/.test(url.pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const cid = Number(url.pathname.split('/')[4]);
    if (!Number.isInteger(cid)) return json(res, 400, { error: '无效的评论 ID' });
    db.prepare('DELETE FROM comments WHERE id = ?').run(cid);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && /^\/api\/admin\/reports\/\d+\/resolve$/.test(url.pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(Number(url.pathname.split('/')[4]));
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST' && /^\/api\/admin\/users\/[^/]+$/.test(url.pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return body(req).then((data) => {
      const targetId = url.pathname.split('/')[4];
      const isAdmin = Boolean(data.is_admin);
      if (targetId === admin.id && !isAdmin) return json(res, 400, { error: '不能取消自己的管理员权限' });
      db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(isAdmin ? 1 : 0, targetId);
      return json(res, 200, { ok: true });
    }).catch((error) => json(res, 400, { error: error.message }));
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true, database: DB_PATH, cats: db.prepare('SELECT COUNT(*) AS n FROM cats').get().n });
  }

  return json(res, 404, { error: 'not found' });
}

function staticFile(req, res, url) {
  const requested = decodeURIComponent(url.pathname === '/' ? '/web.html' : url.pathname);
  const file = path.resolve(ROOT, '.' + requested);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const forwardedPrefix = String(req.headers['x-forwarded-prefix'] || '').trim();
  if (type.startsWith('text/html') && forwardedPrefix) {
    let html = fs.readFileSync(file, 'utf8');
    const prefix = '/' + forwardedPrefix.replace(/^\/+|\/+$/g, '');
    html = html.replace('<meta name="xianmao-base" content="" />', `<meta name="xianmao-base" content="${prefix}" />`);
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache', 'content-length': Buffer.byteLength(html) });
    res.end(html);
    return;
  }
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    Promise.resolve(api(req, res, url)).catch((error) => {
      if (!res.headersSent) json(res, 500, { error: error.message });
      else res.end();
    });
    return;
  }
  staticFile(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`Xianmao running at http://${HOST}:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});

function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

