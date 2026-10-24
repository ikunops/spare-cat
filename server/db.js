const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.XIANMAO_DB || path.join(DATA_DIR, 'xianmao.sqlite');

function formatTime(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${hh}:${mm}`;
}

function openDatabase(filename = DB_PATH) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_text TEXT NOT NULL DEFAULT '猫',
      area TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 0,
      credit INTEGER NOT NULL DEFAULT 0 CHECK (credit BETWEEN 0 AND 100),
      username TEXT UNIQUE,
      password_hash TEXT,
      salt TEXT,
      token TEXT UNIQUE,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      area TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      lat REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
      lng REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
      coord_system TEXT NOT NULL DEFAULT 'GCJ-02' CHECK (coord_system IN ('WGS84', 'GCJ-02', 'BD-09')),
      privacy TEXT NOT NULL DEFAULT 'street' CHECK (privacy IN ('exact', 'street', 'district')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON locations (lat, lng);

    CREATE TABLE IF NOT EXISTS cats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      english TEXT NOT NULL DEFAULT '',
      breed TEXT NOT NULL DEFAULT '混血 / 不确定',
      color TEXT NOT NULL DEFAULT '',
      sex TEXT NOT NULL DEFAULT '未知' CHECK (sex IN ('公', '母', '未知', '不确定')),
      age_months REAL NOT NULL DEFAULT 0 CHECK (age_months >= 0),
      age_label TEXT NOT NULL DEFAULT '',
      age_group TEXT NOT NULL DEFAULT '成年',
      status TEXT NOT NULL DEFAULT '邻里上报',
      photo TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      traits_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(traits_json)),
      health_tags_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(health_tags_json)),
      sterilization TEXT NOT NULL DEFAULT '未知',
      vaccine TEXT NOT NULL DEFAULT '未知',
      deworm TEXT NOT NULL DEFAULT '未知',
      reporter_id TEXT REFERENCES users (id) ON DELETE SET NULL,
      reporter_name TEXT NOT NULL DEFAULT '',
      location_id INTEGER REFERENCES locations (id) ON DELETE SET NULL,
      verification TEXT NOT NULL DEFAULT '待核验' CHECK (verification IN ('待核验', '已核验', '已退回')),
      adoption_state TEXT NOT NULL DEFAULT '待领养' CHECK (adoption_state IN ('待领养', '申请中', '已领养', '群护中')),
      view_count INTEGER NOT NULL DEFAULT 0,
      application_count INTEGER NOT NULL DEFAULT 0,
      distance_km REAL NOT NULL DEFAULT 0,
      reported_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cats_location ON cats (location_id);
    CREATE INDEX IF NOT EXISTS idx_cats_verification ON cats (verification, adoption_state);
    CREATE INDEX IF NOT EXISTS idx_cats_reporter ON cats (reporter_id, reported_at DESC);

    CREATE TABLE IF NOT EXISTS adoptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cat_id TEXT NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
      adopter_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      home_date TEXT NOT NULL,
      revisit_date TEXT,
      status TEXT NOT NULL DEFAULT '适应中',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (cat_id, adopter_id)
    );
    CREATE INDEX IF NOT EXISTS idx_adoptions_adopter ON adoptions (adopter_id, home_date DESC);

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cat_id TEXT NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
      applicant_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      home_type TEXT NOT NULL DEFAULT '',
      experience TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '等待初审' CHECK (status IN ('等待初审', '已约见面', '已通过', '已婉拒', '已撤回')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (cat_id, applicant_id)
    );
    CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications (applicant_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      cat_id TEXT NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, cat_id)
    );

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('医院', '商店', '猫咖', '遛猫的地方')),
      rating REAL NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
      review_count INTEGER NOT NULL DEFAULT 0,
      tags_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags_json)),
      hours TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      location_id INTEGER REFERENCES locations (id) ON DELETE SET NULL,
      photos_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(photos_json)),
      details_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details_json)),
      submitted_by TEXT REFERENCES users (id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS place_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT NOT NULL REFERENCES places (id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
      text TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags_json)),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_place_reviews_place ON place_reviews (place_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT REFERENCES users (id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      avatar_text TEXT NOT NULL DEFAULT '',
      tag TEXT NOT NULL DEFAULT '邻里随记',
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      place TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      tag_class TEXT NOT NULL DEFAULT '',
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
      author_id TEXT REFERENCES users (id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      text TEXT NOT NULL,
      time_label TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      post_id TEXT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id)
    );
  `);

  const userColumns = db.prepare('PRAGMA table_info(users)').all().map((column) => column.name);
  const authColumns = { username: 'TEXT UNIQUE', password_hash: 'TEXT', salt: 'TEXT', token: 'TEXT UNIQUE', is_admin: 'INTEGER NOT NULL DEFAULT 0' };
  for (const [name, ddl] of Object.entries(authColumns)) {
    if (!userColumns.includes(name)) db.exec(`ALTER TABLE users ADD COLUMN ${name} ${ddl}`);
  }
  // 内容软删除状态：published（可见）/ removed（管理员下架）
  for (const table of ['cats', 'posts', 'places']) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name);
    if (!cols.includes('status')) db.exec(`ALTER TABLE ${table} ADD COLUMN status TEXT NOT NULL DEFAULT 'published'`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_type TEXT NOT NULL CHECK (target_type IN ('cat','post','comment','place','review')),
      target_id TEXT NOT NULL,
      reporter_id TEXT REFERENCES users (id) ON DELETE SET NULL,
      reporter_name TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed(db) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM cats').get().n;
  if (count > 0) return;

  const insertUser = db.prepare('INSERT INTO users (id, display_name, avatar_text, area, verified, credit) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('u-linxiaoman', '林小满', '林', '翠苑二区', 1, 92);
  insertUser.run('u-ajie', '阿桔', '桔', '古荡新村', 1, 88);
  insertUser.run('u-zhouzhou', '周周', '周', '文三路', 1, 81);
  insertUser.run('u-chen', '车库老陈', '陈', '嘉绿苑', 0, 76);

  const insertLocation = db.prepare('INSERT INTO locations (label, area, address, lat, lng, coord_system, privacy) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const loc = (label, area, address, lat, lng, privacy = 'street') => Number(insertLocation.run(label, area, address, lat, lng, 'GCJ-02', privacy).lastInsertRowid);
  const locBanli = loc('翠苑二区 · 南门花坛', '翠苑二区', '南门花坛', 30.2886, 120.1283);
  const locXiaohui = loc('古荡新村 · 3 幢车棚', '古荡新村', '3 幢车棚', 30.2839, 120.1196);
  const locDoubao = loc('文三路 · 小区快递柜旁', '文三路', '快递柜旁', 30.2801, 120.1341);
  const locDanhuang = loc('益乐路 · 早餐店后巷', '益乐路', '早餐店后巷', 30.2922, 120.1208);
  const locTuanzi = loc('丰潭路 · 河道绿化带', '丰潭路', '河道绿化带', 30.2971, 120.1132);
  const locMocha = loc('嘉绿苑 · 北区车库', '嘉绿苑', '北区车库', 30.2872, 120.1164);
  const locNaigao = loc('文二西路 · 便利店后门', '文二西路', '便利店后门', 30.2792, 120.1301);
  const locYingtao = loc('滨江·长河老街 · 河埠头', '滨江·长河', '河埠头', 30.2087, 120.2112);
  const locWuzi = loc('拱墅·小河直街 · 巷口', '拱墅·小河', '巷口', 30.3218, 120.1401);

  const insertCat = db.prepare(`
    INSERT INTO cats (id, name, english, breed, color, sex, age_months, age_label, age_group, status, photo, note, traits_json, health_tags_json, sterilization, vaccine, deworm, reporter_id, reporter_name, location_id, verification, adoption_state, view_count, application_count, distance_km, reported_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const catRows = [
    ['banli', '板栗', 'BANLI', '中华田园猫', '橘白', '公', 14, '1 岁 2 个月', '成年', '已接回家', 'cat-01.jpg', '在南门花坛蹲了三天，会主动蹭人的裤脚。今年 9 月由林小满接回家，适应得很好。', ['会蹭手', '不怕狗', '贪吃'], ['已绝育', '亲人', '会用猫砂'], '已绝育', '未接种', '已驱虫', 'u-linxiaoman', '林小满', locBanli, '已核验', '已领养', 386, 12, 0.4, '2026-10-19 08:42:00'],
    ['xiaohui', '小灰', 'XIAOHUI', '英短蓝猫', '蓝灰', '母', 7, '7 个月', '幼年', '胆小但亲人', 'cat-02.jpg', '一直躲在车棚的纸箱里，喂了半个月才敢靠近。不抓人，但需要一点时间建立信任。', ['慢热', '安静', '会踩奶'], ['已驱虫', '胆小', '需要耐心'], '未绝育', '未接种', '已驱虫', 'u-ajie', '阿桔', locXiaohui, '已核验', '待领养', 241, 7, 1.1, '2026-10-18 19:10:00'],
    ['doubao', '豆包', 'DOUBAO', '中华田园猫', '狸花', '母', 2, '2 个月', '幼年', '需要奶猫经验', 'cat-03.jpg', '和另外两只小猫一起被发现在快递柜后面。希望领养人了解幼猫的喂养节奏，不冲动领养。', ['精力旺', '爱玩', '会呼噜'], ['幼猫', '已驱虫', '需陪伴'], '未绝育', '待接种', '已驱虫', 'u-zhouzhou', '周周', locDoubao, '已核验', '待领养', 198, 9, 0.8, '2026-10-18 16:35:00'],
    ['danhuang', '蛋黄', 'DANHUANG', '中华田园猫', '橘猫', '公', 24, '2 岁', '成年', '固定投喂中', 'cat-04.jpg', '早餐店老板一直在喂，但店里不能养。希望找一个能接受成年猫、不嫌弃它有点胖的家。', ['稳重', '贪睡', '会看店'], ['已绝育', '已接种', '圆润'], '已绝育', '已接种', '已驱虫', 'u-linxiaoman', '林小满', locDanhuang, '已核验', '待领养', 512, 18, 1.6, '2026-10-17 10:00:00'],
    ['tuanzi', '团子', 'TUANZI', '三花猫', '三花', '母', 11, '11 个月', '幼年', '需群护协助', 'cat-05.jpg', '河道边的群护猫，已经做了绝育。不适合强行家养，优先寻找有封闭院子的领养人。', ['警惕', '独立', '夜行'], ['已绝育', '怕生', '会哈气'], '已绝育', '未接种', '已驱虫', 'u-chen', '车库老陈', locTuanzi, '已核验', '群护中', 173, 3, 2.3, '2026-10-17 09:00:00'],
    ['mocha', '摩卡', 'MOCHA', '奶牛猫', '黑白', '公', 48, '4 岁', '成年', '老住户', 'cat-06.jpg', '车库保安养了两年，最近要调走，没办法带走。摩卡会自己开门，喜欢趴在窗台看鸟。', ['话多', '黏人', '会开门'], ['已绝育', '已接种', '老干部'], '已绝育', '已接种', '已驱虫', 'u-chen', '车库老陈', locMocha, '已核验', '待领养', 306, 5, 2.9, '2026-10-16 11:00:00'],
    ['naigao', '奶糕', 'NAIGAO', '中华田园猫', '奶牛', '母', 0.7, '3 周', '幼年', '需要人工喂养', 'cat-07.jpg', '便利店后门纸箱里发现的奶猫，还需要人工喂养。已联系附近群护志愿者接手。', ['需要保暖', '需喂奶', '怕冷'], ['奶猫', '需人工喂养', '待观察'], '未绝育', '未接种', '未驱虫', 'u-zhouzhou', '周周', locNaigao, '已核验', '待领养', 87, 2, 1.3, '2026-10-19 09:20:00'],
    ['yingtao', '樱桃', 'YINGTAO', '玳瑁猫', '玳瑁', '母', 9, '9 个月', '幼年', '固定投喂中', 'cat-14.jpg', '长河老街河埠头的玳瑁，附近摊主轮流喂。最近老街上要整修，投喂点可能会断，想找一个愿意收留她的家。', ['爱晒太阳', '会蹭腿', '不挑食'], ['已绝育', '亲人', '会跟人走'], '已绝育', '未接种', '已驱虫', 'u-ajie', '长河阿七', locYingtao, '已核验', '待领养', 164, 4, 6.8, '2026-10-18 15:10:00'],
    ['wuzi', '乌子', 'WUZI', '黑猫', '纯黑', '公', 36, '3 岁', '成年', '老住户', 'cat-11.jpg', '小河直街巷口住了三年的黑猫，附近茶馆一直在喂。不主动靠近生人，但会在同一个人第三次出现时短暂露面。', ['安静', '怕生', '会看家'], ['已绝育', '慢热', '夜行'], '已绝育', '未接种', '已驱虫', 'u-chen', '茶馆老周', locWuzi, '已核验', '待领养', 92, 2, 11.4, '2026-10-15 18:40:00']
  ];
  for (const row of catRows) {
    const values = row.slice();
    values[12] = JSON.stringify(values[12]);
    values[13] = JSON.stringify(values[13]);
    insertCat.run(...values);
  }

  const insertPlace = db.prepare('INSERT INTO places (id, name, type, rating, review_count, tags_json, hours, phone, price, note, location_id, photos_json, details_json, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertPlace.run('s1', '青禾动物医院', '医院', 4.8, 126, JSON.stringify(['夜间急诊', '猫科分离候诊', '群护折扣']), '09:00 - 21:00', '0571-8888 3021', '基础体检 ¥120 起', '医生会先问猫的情况再推荐项目，不会一上来推全套。', locBanli, '[]', '{}', null);
  insertPlace.run('s2', '尾巴杂货铺', '商店', 4.6, 58, JSON.stringify(['小包装', '冻干试吃', '可拆封']), '10:00 - 20:30', '0571-8888 5510', '猫粮小包 ¥15 起', '适合先买小包装试口味，不会一上来囤大袋。', locXiaohui, '[]', '{}', null);
  insertPlace.run('s3', '窗台猫咖', '猫咖', 4.4, 89, JSON.stringify(['工作日人少', '有领养墙', '猫状态好']), '11:00 - 22:00', '0571-8888 7022', '入场 ¥48 含饮品', '店里有领养信息墙，和附近群护队有合作。', locDanhuang, '[]', '{}', null);
  insertPlace.run('s4', '沿河绿道', '遛猫的地方', 4.9, 203, JSON.stringify(['牵绳可走', '适合推车', '草坪可休息']), '全天开放 · 建议傍晚', '', '免费', '适合已经习惯牵引绳的猫，第一次出门建议先用推车熟悉环境。', locTuanzi, JSON.stringify(['cat-05.jpg', 'cat-15.jpg']), JSON.stringify({ environment: '沿河步道平整，有树荫和长椅，傍晚风比较凉。草坪中央周末人多。', advice: '适合已经习惯牵引绳的猫。第一次出门建议先用推车走一圈。傍晚六点后遛狗的人多，尽量错峰。', experience: '第一次带板栗来是推车走完整段，第二次才在长椅旁短时间下地。它更愿意贴着树荫走，不太喜欢草坪中央。' }), 'u-linxiaoman');

  const insertReview = db.prepare('INSERT INTO place_reviews (place_id, user_id, author_name, stars, text, tags_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertReview.run('s1', 'u-linxiaoman', '林小满', 5, '带板栗来做基础检查，医生很耐心，没有乱推项目。', JSON.stringify(['不推销', '对猫温柔']), '2026-10-12 10:20:00');
  insertReview.run('s2', 'u-zhouzhou', '周周', 5, '第一次养猫不知道买什么，老板给的都是小包装，没有硬推贵的。', JSON.stringify(['不硬推', '适合新手']), '2026-10-13 18:40:00');
  insertReview.run('s3', 'u-ajie', '阿桔', 4, '工作日三点去的，猫比人多。店员不会把睡着的猫抱起来营业。', JSON.stringify(['不强行营业', '环境安静']), '2026-10-14 15:05:00');
  insertReview.run('s4', 'u-chen', '车库老陈', 5, '摩卡第一次出门就是来这，先推车走了一圈，第二次才敢下地牵绳。', JSON.stringify(['适合推车', '傍晚凉快']), '2026-10-15 17:30:00');

  const insertPost = db.prepare('INSERT INTO posts (id, author_id, author_name, avatar_text, tag, title, body, place, image, tag_class, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertPost.run('p1', 'u-linxiaoman', '林小满', '林', '捉猫实录', '用航空箱 + 罐头，把南门那只橘白骗进去了', '<p>板栗在南门花坛蹲了三天。前两天我带着罐头去，它吃完就走，根本不给靠近的机会。第三天我换了个思路：不追，先把路线想清楚。</p><h2>真正有用的，是“退路”</h2><p>航空箱放在花坛靠墙的一侧，开口朝向墙。罐头放在箱子里最深处。人退到五米以外，蹲下来，不看它。它绕了两圈，确认没有危险，才进去。</p><blockquote>捉猫不是比谁手快，是比谁更能等。你越急，它越能感觉到。</blockquote>', '翠苑二区', 'cat-01.jpg', 'is-trap', 128, '2026-10-19 08:20:00');
  insertPost.run('p2', 'u-ajie', '阿桔', '桔', '养猫技巧', '小猫刚到家，先别急着抱：第一周的“安全屋”怎么搭', '<p>小灰刚来的时候，我把阳台封好，给它留了一个安静的小房间。第一天它一直躲在洗衣机后面，只有半夜才出来吃饭。</p><h2>先给一个“安全屋”</h2><p>不需要很大，一个安静的房间、一个纸箱、一条有气味的旧毛巾就够。食盆、水盆、猫砂盆分开摆，猫砂盆离食盆越远越好。</p><h2>不要做的事</h2><ul><li>不要强行抱出来展示给家人看。</li><li>不要一回家就洗澡、换粮、剪指甲。</li><li>不要盯着它看，慢慢眨眼就好。</li><li>不要因为躲起来就把它拖出来。</li></ul><blockquote>猫不是不亲人，它只是在确认你是不是安全的。</blockquote>', '古荡新村', '', '', 96, '2026-10-18 21:10:00');
  insertPost.run('p3', 'u-zhouzhou', '周周', '周', '就医体验', '带流浪猫做检查，别一进门就被“全套套餐”带走', '<p>第一次带流浪猫去医院，很容易被“全套”两个字说服。但流浪猫的检查项目应该按实际情况来，不是越贵越好。</p><h2>先问清楚三件事</h2><ul><li>是否接诊流浪猫，是否有群护/救助折扣。</li><li>基础体检包含哪些项目，是否含传染病筛查。</li><li>驱虫、疫苗、绝育是否可以分次进行。</li></ul><p>如果猫有明显外伤、呼吸急促、持续不进食，优先处理急症，不要为了凑套餐做一堆非必要项目。</p><blockquote>好的医院会跟你解释“为什么现在不做”，而不是只告诉你“做了更放心”。</blockquote>', '文三路', '', 'is-pit', 74, '2026-10-18 14:22:00');
  insertPost.run('p4', 'u-chen', '车库老陈', '陈', '猫咖打卡', '天目里这家猫咖，猫比人多，适合工作日发呆', '<p>工作日三点左右到店，只有两桌客人。店里的猫基本都在窗边睡觉，店员不会强行抱猫出来营业，这一点很加分。</p><h2>值得去的地方</h2><ul><li>窗边的长条座位，光线好，猫会自己过来。</li><li>书架区有几只年纪比较大的猫，不喜欢被摸肚子。</li><li>进门有消毒和鞋套，猫砂区没有异味。</li></ul><blockquote>猫咖的第一条礼貌：猫不想营业的时候，让它睡。</blockquote>', '天目里', 'cat-13.jpg', 'is-checkin', 63, '2026-10-17 15:05:00');
  insertPost.run('p5', 'u-ajie', '阿桔', '桔', '领养回访', '领养第 30 天：从躲床底，到每天门口接我下班', '<p>蛋黄来我家的第一个星期，只在半夜出来吃饭。白天完全看不到，床底像它的防空洞。我一度怀疑自己是不是不适合养猫。</p><h2>第三周的一个小变化</h2><p>那天我下班回家，开门的时候看到它从卧室门口探出半个头。没有过来，也没有躲。就那样看了我几秒，然后转身走了。但我知道，有什么东西开始松动了。</p><blockquote>领养不是把猫带回家那一天，是猫决定把你当家人的那一天。</blockquote>', '益乐路', 'cat-14.jpg', '', 211, '2026-10-16 19:30:00');

  insertPost.run('p7', 'u-linxiaoman', '林小满', '林', '猫友同路', '周六早上沿河慢走，想找一只不追车的散步搭子', '<p>板栗已经习惯推车，最近开始短时间下地牵绳。想找一位同样节奏慢、不主动追车或追鸟的猫友，周六早上沿丰潭路河岸走一小段。</p><h2>希望怎么见面</h2><ul><li>先在沿河绿道的长椅旁碰面，两只猫都先在推车或背包里观察五分钟。</li><li>如果双方都能保持距离、不哈气，再并排走一小段。</li><li>任一只猫出现应激，就立刻结束，不勉强社交。</li></ul><blockquote>猫友同路不是让猫交朋友，是让习惯出门的猫在安全距离里熟悉彼此。</blockquote>', '丰潭路', '', 'is-companion', 28, '2026-10-15 09:20:00');
  insertPost.run('p6', 'u-linxiaoman', '林小满', '林', '遛猫地点', '沿河绿道往北走，有一段人少、树荫多的路线', '<p>从丰潭路的桥下往北，走到第二个长椅，这一段傍晚人不多，路面也平整。板栗第一次出门是推车，第二次才敢下地牵绳。</p><h2>我通常会带的东西</h2><ul><li>防脱牵引绳和合身的胸背。</li><li>折叠水碗，走二十分钟就停一下。</li><li>一块熟悉的垫子，遇到狗可以抱起来遮一遮。</li></ul><blockquote>先确认猫愿不愿意出门，再考虑走多远。</blockquote>', '丰潭路', '', 'is-walk', 41, '2026-10-15 18:10:00');

  const insertComment = db.prepare('INSERT INTO comments (post_id, author_id, author_name, text, time_label, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertComment.run('p1', 'u-ajie', '阿桔', '这个“退路”说法太对了，我之前就是追着跑，越追越远。', '2 小时前', '2026-10-19 09:10:00');
  insertComment.run('p1', 'u-zhouzhou', '周周', '请问航空箱要提前放罐头吗？', '1 小时前', '2026-10-19 09:50:00');
  insertComment.run('p2', 'u-chen', '车库老陈', '我家猫第三天就自己上沙发了，真的不能急。', '昨天', '2026-10-18 22:20:00');
  insertComment.run('p2', 'u-linxiaoman', '林小满', '“慢慢眨眼”很有用，亲测。', '昨天', '2026-10-18 22:40:00');
  insertComment.run('p3', 'u-linxiaoman', '林小满', '同意，先问群护折扣，很多店不会主动说。', '昨天', '2026-10-18 16:00:00');
  insertComment.run('p4', 'u-ajie', '阿桔', '工作日人少是真的，周末就有点挤。', '2 天前', '2026-10-17 18:00:00');
  insertComment.run('p5', 'u-linxiaoman', '林小满', '看哭了，蛋黄现在真的好幸福。', '3 天前', '2026-10-16 21:00:00');
  insertComment.run('p7', 'u-ajie', '阿桔', '这个节奏听起来很稳，先推车观察是对的。', '4 天前', '2026-10-15 11:10:00');

  db.prepare('INSERT INTO adoptions (cat_id, adopter_id, home_date, revisit_date, status, note) VALUES (?, ?, ?, ?, ?, ?)').run('banli', 'u-linxiaoman', '2026-09-28', '2026-12-28', '适应良好', '已经会主动睡在床边。');
  db.prepare('INSERT INTO favorites (user_id, cat_id) VALUES (?, ?)').run('u-linxiaoman', 'doubao');
  db.prepare('INSERT INTO applications (cat_id, applicant_id, home_type, experience, reason, status) VALUES (?, ?, ?, ?, ?, ?)').run('xiaohui', 'u-linxiaoman', '整租 / 自有住房', '养过猫', '家里安静，有养胆小猫的经验。', '已约见面');
}

function bootstrap(db, userRow = null) {
  const userId = userRow ? userRow.id : null;
  const user = userRow;
  const catRows = db.prepare(`
    SELECT c.*, l.label AS location_label, l.area AS location_area, l.address AS location_address, l.lat, l.lng, l.coord_system
    FROM cats c LEFT JOIN locations l ON l.id = c.location_id
    WHERE c.status != 'removed'
    ORDER BY c.reported_at DESC
  `).all();
  const cats = catRows.map((row) => ({
    id: row.id, name: row.name, english: row.english, breed: row.breed, color: row.color, sex: row.sex,
    age: row.age_label, ageMonths: row.age_months, ageGroup: row.age_group, status: row.status, photo: row.photo,
    note: row.note, traits: JSON.parse(row.traits_json), healthTags: JSON.parse(row.health_tags_json),
    sterilization: row.sterilization, vaccine: row.vaccine, deworm: row.deworm,
    reporter: row.reporter_name, area: row.location_label || '', areaShort: row.location_area || '',
    lat: row.lat, lng: row.lng, coordSystem: row.coord_system,
    verification: row.verification, adoptionState: row.adoption_state,
    views: row.view_count, applications: row.application_count, distance: row.distance_km,
    reportedAt: row.reported_at, time: formatTime(row.reported_at), reportedByMe: Boolean(userId && row.reporter_id === userId)
  }));
  const favoriteIds = db.prepare('SELECT cat_id FROM favorites WHERE user_id = ?').all(userId).map((row) => row.cat_id);
  const appRows = db.prepare(`
    SELECT a.*, c.name AS cat_name FROM applications a JOIN cats c ON c.id = a.cat_id
    WHERE a.applicant_id = ? ORDER BY a.created_at DESC
  `).all(userId);
  const adoptionRows = db.prepare(`
    SELECT a.*, c.name AS cat_name, c.photo, c.breed, c.sex, c.age_label FROM adoptions a
    JOIN cats c ON c.id = a.cat_id WHERE a.adopter_id = ? ORDER BY a.home_date DESC
  `).all(userId);
  const placeRows = db.prepare(`
    SELECT p.*, l.label AS location_label, l.area AS location_area, l.lat, l.lng,
      u.display_name AS submitter_name
    FROM places p LEFT JOIN locations l ON l.id = p.location_id
    LEFT JOIN users u ON u.id = p.submitted_by
    WHERE p.status != 'removed'
    ORDER BY p.rating DESC
  `).all();
  const postRows = db.prepare(`
    SELECT p.*, u.avatar_text AS avatar_text, u.display_name AS author_display
    FROM posts p LEFT JOIN users u ON u.id = p.author_id
    WHERE p.status != 'removed'
    ORDER BY p.created_at DESC
  `).all();
  const postIds = postRows.map((row) => row.id);
  const commentsByPost = new Map();
  if (postIds.length) {
    const placeholders = postIds.map(() => '?').join(',');
    db.prepare(`SELECT * FROM comments WHERE post_id IN (${placeholders}) ORDER BY created_at ASC`).all(...postIds).forEach((comment) => {
      const list = commentsByPost.get(comment.post_id) || [];
      list.push({ name: comment.author_name, text: comment.text, time: comment.time_label || formatTime(comment.created_at) });
      commentsByPost.set(comment.post_id, list);
    });
  }
  const likedPostIds = db.prepare('SELECT post_id FROM post_likes WHERE user_id = ?').all(userId).map((row) => row.post_id);
  return {
    user: user ? {
      id: user.id, name: user.display_name, avatar: user.avatar_text, area: user.area,
      verified: Boolean(user.verified), credit: user.credit, username: user.username || '',
      isAdmin: Boolean(user.is_admin)
    } : null,
    cats,
    favorites: favoriteIds,
    applications: appRows.map((row) => ({
      id: row.id, catId: row.cat_id, catName: row.cat_name, home: row.home_type,
      experience: row.experience, reason: row.reason, status: row.status,
      time: row.created_at.slice(0, 10)
    })),
    adoptions: adoptionRows.map((row) => ({
      id: row.id, catId: row.cat_id, catName: row.cat_name, photo: row.photo,
      breed: row.breed, sex: row.sex, age: row.age_label, homeDate: row.home_date,
      revisitDate: row.revisit_date, status: row.status, note: row.note
    })),
    places: placeRows.map((row) => ({
      id: row.id, name: row.name, type: row.type, rating: row.rating, count: row.review_count,
      tags: JSON.parse(row.tags_json), hours: row.hours, phone: row.phone, price: row.price,
      note: row.note, area: row.location_label || '', areaShort: row.location_area || '',
      lat: row.lat, lng: row.lng,
      photos: JSON.parse(row.photos_json || '[]'), details: JSON.parse(row.details_json || '{}'),
      submittedBy: row.submitter_name || '',
      reviews: db.prepare('SELECT author_name, stars, text, tags_json, created_at FROM place_reviews WHERE place_id = ? ORDER BY created_at DESC LIMIT 8').all(row.id).map((review) => ({
        name: review.author_name, avatar: review.author_name.slice(0, 1), stars: review.stars,
        text: review.text, tags: JSON.parse(review.tags_json), time: review.created_at.slice(0, 10)
      }))
    })),
    posts: postRows.map((row) => ({
      id: row.id, author: row.author_display || row.author_name, avatar: row.avatar_text || row.author_name.slice(0, 1),
      tone: '', time: formatTime(row.created_at), place: row.place, tag: row.tag, tagClass: row.tag_class,
      title: row.title, excerpt: row.body.replace(/<[^>]+>/g, '').slice(0, 70),
      body: row.body, image: row.image, likes: row.likes, comments: (commentsByPost.get(row.id) || []).length,
      commentsList: commentsByPost.get(row.id) || [], featured: false, authorId: row.author_id
    })),
    userPosts: postRows.filter((row) => userId && row.author_id === userId).map((row) => row.id),
    likedPosts: likedPostIds
  };
}

function createDatabase(filename) {
  const db = openDatabase(filename);
  migrate(db);
  seed(db);
  return db;
}

if (require.main === module) {
  const db = createDatabase();
  const summary = {
    database: DB_PATH,
    users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
    cats: db.prepare('SELECT COUNT(*) AS n FROM cats').get().n,
    places: db.prepare('SELECT COUNT(*) AS n FROM places').get().n,
    adoptions: db.prepare('SELECT COUNT(*) AS n FROM adoptions').get().n
  };
  console.log(JSON.stringify(summary, null, 2));
  db.close();
}

module.exports = { DB_PATH, openDatabase, migrate, seed, createDatabase, bootstrap };


