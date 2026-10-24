const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const { DB_PATH, createDatabase, bootstrap } = require('./db');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
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

function api(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
    return json(res, 200, bootstrap(db, authUser(req)));
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    return body(req).then((data) => {
      const username = String(data.username || '').trim();
      const password = String(data.password || '');
      const nickname = String(data.nickname || '').trim() || username;
      if (!USERNAME_RE.test(username)) return json(res, 400, { error: '用户名需 3-20 位字母、数字、_ 或 -' });
      if (password.length < 6) return json(res, 400, { error: '密码至少 6 位' });
      if (!nickname || nickname.length > 12) return json(res, 400, { error: '昵称需 1-12 个字' });
      if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
        return json(res, 409, { error: '这个用户名已经被注册了' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const token = makeToken();
      db.prepare(`INSERT INTO users (id, display_name, avatar_text, area, verified, credit, username, password_hash, salt, token)
        VALUES (?, ?, ?, '', 0, 70, ?, ?, ?, ?)`)
        .run(`u-${crypto.randomBytes(6).toString('hex')}`, nickname, nickname.slice(0, 1), username, hashPassword(password, salt), salt, token);
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

