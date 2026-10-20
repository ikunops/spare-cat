const STORE_KEY = 'xianmao-state-v1';
const DATA_ASSET_ROOT = 'assets/';

const cats = [
  {
    id: 'banli', name: '板栗', english: 'BANLI', age: '1 岁 2 个月', ageMonths: 14, ageGroup: '成年', sex: '公', breed: '中华田园猫', color: '橘白', distance: 0.4,
    area: '翠苑二区 · 南门花坛', areaShort: '翠苑二区', status: '已接回家', urgent: false, photo: 'cat-01.jpg',
    healthTags: ['已绝育', '亲人', '会用猫砂'], traits: ['会蹭手', '不怕狗', '贪吃'],
    note: '在南门花坛蹲了三天，会主动蹭人的裤脚。今年 9 月由林小满接回家，适应得很好。',
    reporter: '林小满', reporterRole: '翠苑二区 · 已实名', time: '今天 08:42', lat: 30.2886, lng: 120.1283,
    healthBadge: '已完成基础检查', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '可临时寄养 7 天',
    adoptionState: '已领养', verification: '已核验', views: 386, applications: 12, reportedByMe: true
  },
  {
    id: 'xiaohui', name: '小灰', english: 'XIAOHUI', age: '7 个月', ageMonths: 7, ageGroup: '幼年', sex: '母', breed: '英短蓝猫', color: '蓝灰', distance: 1.1,
    area: '古荡新村 · 3 幢车棚', areaShort: '古荡新村', status: '胆小但亲人', urgent: false, photo: 'cat-02.jpg',
    healthTags: ['已驱虫', '胆小', '需要耐心'], traits: ['慢热', '安静', '会踩奶'],
    note: '一直躲在车棚的纸箱里，喂了半个月才敢靠近。不抓人，但需要一点时间建立信任。适合有耐心、家里没有太吵闹的家庭。',
    reporter: '阿桔', reporterRole: '古荡新村 · 已实名', time: '昨天 19:10', lat: 30.2839, lng: 120.1196,
    healthBadge: '已完成基础检查', sterilization: '未绝育', vaccine: '未接种', deworm: '已驱虫', foster: '暂不支持寄养'
  },
  {
    id: 'doubao', name: '豆包', english: 'DOUBAO', age: '2 个月', ageMonths: 2, ageGroup: '幼年', sex: '母', breed: '中华田园猫', color: '狸花', distance: 0.8,
    area: '文三路 · 小区快递柜旁', areaShort: '文三路', status: '需要奶猫经验', urgent: false, photo: 'cat-03.jpg',
    healthTags: ['幼猫', '已驱虫', '需陪伴'], traits: ['精力旺', '爱玩', '会呼噜'],
    note: '和另外两只小猫一起被发现在快递柜后面。豆包是里面最不怕人的一只。希望领养人了解幼猫的喂养节奏，不冲动领养。',
    reporter: '周周', reporterRole: '文三路 · 已实名', time: '昨天 16:35', lat: 30.2801, lng: 120.1341,
    healthBadge: '待完成疫苗', sterilization: '未绝育', vaccine: '待接种', deworm: '已驱虫', foster: '可有条件寄养'
  },
  {
    id: 'danhuang', name: '蛋黄', english: 'DANHUANG', age: '2 岁', ageMonths: 24, ageGroup: '成年', sex: '公', breed: '中华田园猫', color: '橘猫', distance: 1.6,
    area: '益乐路 · 早餐店后巷', areaShort: '益乐路', status: '固定投喂中', urgent: false, photo: 'cat-04.jpg',
    healthTags: ['已绝育', '已接种', '圆润'], traits: ['稳重', '贪睡', '会看店'],
    note: '早餐店老板一直在喂，但店里不能养。蛋黄会自己在巷口晒太阳，和谁都熟。希望找一个能接受成年猫、不嫌弃它有点胖的家。',
    reporter: '早餐店王姨', reporterRole: '益乐路 · 邻里认证', time: '10 月 17 日', lat: 30.2922, lng: 120.1208,
    healthBadge: '疫苗齐全', sterilization: '已绝育', vaccine: '已接种', deworm: '已驱虫', foster: '可临时寄养 30 天',
    verification: '已核验', views: 512, applications: 18, reportedByMe: true
  },
  {
    id: 'tuanzi', name: '团子', english: 'TUANZI', age: '11 个月', ageMonths: 11, ageGroup: '幼年', sex: '母', breed: '三花猫', color: '三花', distance: 2.3,
    area: '丰潭路 · 河道绿化带', areaShort: '丰潭路', status: '需群护协助', urgent: false, photo: 'cat-05.jpg',
    healthTags: ['已绝育', '怕生', '会哈气'], traits: ['警惕', '独立', '夜行'],
    note: '河道边的群护猫，已经做了绝育。团子不适合强行家养，优先寻找有封闭院子的领养人，或愿意继续做群护的附近居民。',
    reporter: '河道群护队', reporterRole: '丰潭路 · 群护组织', time: '10 月 17 日', lat: 30.2971, lng: 120.1132,
    healthBadge: '已做 TNR', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '不适合寄养'
  },
  {
    id: 'mocha', name: '摩卡', english: 'MOCHA', age: '4 岁', ageMonths: 48, ageGroup: '成年', sex: '公', breed: '奶牛猫', color: '黑白', distance: 2.9,
    area: '嘉绿苑 · 北区车库', areaShort: '嘉绿苑', status: '老住户', urgent: false, photo: 'cat-06.jpg',
    healthTags: ['已绝育', '已接种', '老干部'], traits: ['话多', '黏人', '会开门'],
    note: '车库保安养了两年，最近要调走，没办法带走。摩卡会自己开门，喜欢趴在窗台看鸟。希望能找一个不嫌它话多的家。',
    reporter: '车库老陈', reporterRole: '嘉绿苑 · 邻里认证', time: '10 月 16 日', lat: 30.2872, lng: 120.1164,
    healthBadge: '疫苗齐全', sterilization: '已绝育', vaccine: '已接种', deworm: '已驱虫', foster: '暂不支持寄养'
  },
  {
    id: 'naigao', name: '奶糕', english: 'NAIGAO', age: '3 周', ageMonths: 0.7, ageGroup: '幼年', sex: '母', breed: '中华田园猫', color: '奶牛', distance: 1.3,
    area: '文二西路 · 便利店后门', areaShort: '文二西路', status: '需人工喂养', urgent: true, photo: 'cat-07.jpg',
    healthTags: ['奶猫', '需保温', '需人工喂养'], traits: ['怕冷', '需要频繁喂奶', '不能自行排便'],
    note: '便利店后门纸箱里发现的三周龄小猫，脐带已脱落，还没有断奶。发现人只能临时照看两天，急需有奶猫喂养经验的人接手，或联系附近群护队。',
    reporter: '便利店小赵', reporterRole: '文二西路 · 邻里认证', time: '今天 09:20', lat: 30.2792, lng: 120.1301,
    healthBadge: '待做奶猫检查', sterilization: '未绝育', vaccine: '未接种', deworm: '未驱虫', foster: '急需寄养'
  },
  {
    id: 'yingtao', name: '樱桃', english: 'YINGTAO', age: '9 个月', ageMonths: 9, ageGroup: '幼年', sex: '母', breed: '玳瑁猫', color: '玳瑁', distance: 6.8,
    area: '滨江·长河老街 · 河埠头', areaShort: '滨江·长河', status: '固定投喂中', urgent: false, photo: 'cat-14.jpg',
    healthTags: ['已绝育', '亲人', '会跟人走'], traits: ['爱晒太阳', '会蹭腿', '不挑食'],
    note: '长河老街河埠头的玳瑁，附近摊主轮流喂。最近老街上要整修，投喂点可能会断，想找一个愿意收留她的家。会跟人走一段，但不让抱。',
    reporter: '长河阿七', reporterRole: '滨江·长河 · 邻里认证', time: '10 月 18 日', lat: 30.2087, lng: 120.2112,
    healthBadge: '已完成基础检查', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '可临时寄养 14 天',
    verification: '已核验', views: 164, applications: 4
  },
  {
    id: 'wuzi', name: '乌子', english: 'WUZI', age: '3 岁', ageMonths: 36, ageGroup: '成年', sex: '公', breed: '黑猫', color: '纯黑', distance: 11.4,
    area: '拱墅·小河直街 · 巷口', areaShort: '拱墅·小河', status: '老住户', urgent: false, photo: 'cat-11.jpg',
    healthTags: ['已绝育', '慢热', '夜行'], traits: ['安静', '怕生', '会看家'],
    note: '小河直街巷口住了三年的黑猫，附近茶馆一直在喂。不主动靠近生人，但会在同一个人第三次出现时短暂露面。适合安静、有耐心的家。',
    reporter: '茶馆老周', reporterRole: '拱墅·小河 · 邻里认证', time: '10 月 15 日', lat: 30.3218, lng: 120.1401,
    healthBadge: '已做 TNR', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '暂不支持寄养',
    verification: '已核验', views: 92, applications: 2
  }
];

const posts = [
  {
    id: 'p1', author: '林小满', avatar: '林', tone: '', time: '2 小时前', place: '翠苑二区', tag: '捉猫实录', tagClass: 'is-trap',
    title: '用航空箱 + 罐头，把南门那只橘白骗进去了', excerpt: '第三次才成功。关键不是手快，是把退路堵住，然后人等远一点。抓到之后先别急着抱，盖块布它就不挣扎了。',
    likes: 128, comments: 34, image: 'cat-01.jpg', featured: true,
    body: '<p>板栗在南门花坛蹲了三天。前两天我带着罐头去，它吃完就走，根本不给靠近的机会。第三天我换了个思路：不追，先把路线想清楚。</p><h2>真正有用的，是“退路”</h2><p>航空箱放在花坛靠墙的一侧，开口朝向墙。罐头放在箱子里最深处。人退到五米以外，蹲下来，不看它。它绕了两圈，确认没有危险，才进去。进去的一瞬间，我走过去把门带上，全程没有喊，也没有跑。</p><blockquote>捉猫不是比谁手快，是比谁更能等。你越急，它越能感觉到。</blockquote><h2>抓到之后先别忙着高兴</h2><ul><li>先用深色布把航空箱盖住，减少视觉刺激。</li><li>不要立刻打开箱子检查，先让它安静十分钟。</li><li>直接去预约好的医院，路上尽量少颠簸。</li><li>如果是孕猫或带崽母猫，不要单独行动，联系群护队。</li></ul><p>板栗现在在医院做基础检查，性格比想象中稳定。它会在你伸手的时候主动蹭过来，应该是家猫遗弃。下一步是等一个愿意让它进卧室的人。</p><div class="article-note">提示：本文记录的是个人经验，不构成专业捕捉建议。遇到受伤、怀孕或攻击性强的猫，请联系本地群护组织或有经验的医院。</div>',
    commentsList: [{ name: '阿桔', text: '这个“退路”说法太对了，我之前就是追着跑，越追越远。' }, { name: '周周', text: '请问航空箱要提前铺尿垫吗？' }]
  },
  {
    id: 'p2', author: '阿桔', avatar: '桔', tone: 'is-orange', time: '昨天 19:10', place: '古荡新村', tag: '养猫技巧', tagClass: '',
    title: '新手接猫回家，前 7 天请把“热情”收一收', excerpt: '不要一进门就抱、不要全家围观、不要急着换粮。给它一个能躲起来的小空间，比买一堆玩具更重要。',
    likes: 96, comments: 21, image: 'cat-02.jpg', featured: false,
    body: '<p>很多新手接猫回家的第一晚，都会忍不住把猫抱出来“认识一下”。但对猫来说，换环境本身就是一次巨大的压力。前 7 天最重要的不是亲近，是让它确认：这里有水、有饭、有可以躲的地方。</p><h2>先给一个“安全屋”</h2><p>不需要很大，一个安静的房间、一个纸箱、一条有气味的旧毛巾就够。食盆、水盆、猫砂盆分开摆，猫砂盆离食盆越远越好。</p><h2>不要做的事</h2><ul><li>不要强行抱出来展示给家人看。</li><li>不要一回家就洗澡、换粮、剪指甲。</li><li>不要盯着它看，慢慢眨眼就好。</li><li>不要因为躲起来就把它拖出来。</li></ul><blockquote>猫不是不亲人，它只是在确认你是不是安全的。</blockquote><p>等它自己出来探索，再开始短时间的互动。第一天不吃饭很常见，但超过 24 小时完全不吃不喝，建议联系医生。</p>',
    commentsList: [{ name: '小鹿', text: '我家猫第三天就自己上沙发了，真的不能急。' }, { name: '林小满', text: '“慢慢眨眼”很有用，亲测。' }]
  },
  {
    id: 'p3', author: '奶油不甜', avatar: '奶', tone: 'is-dark', time: '昨天 14:22', place: '文三路', tag: '就医体验', tagClass: 'is-pit',
    title: '带流浪猫做检查，别一进门就被“全套套餐”带走', excerpt: '基础体检、驱虫、传染病筛查可以分开问价。先确认医院是否接流浪猫，有没有群护折扣，能省下的不是一点。',
    likes: 74, comments: 18, image: '', featured: false,
    body: '<p>第一次带流浪猫去医院，很容易被“全套”两个字说服。但流浪猫的检查项目应该按实际情况来，不是越贵越好。</p><h2>先问清楚三件事</h2><ul><li>是否接诊流浪猫，是否有群护/救助折扣。</li><li>基础体检包含哪些项目，是否含传染病筛查。</li><li>驱虫、疫苗、绝育是否可以分次进行。</li></ul><p>如果猫有明显外伤、呼吸急促、持续不进食，优先处理急症，不要为了凑套餐做一堆非必要项目。健康的成年流浪猫，可以先做基础体检 + 驱虫，观察一周再安排疫苗和绝育。</p><blockquote>好的医院会跟你解释“为什么现在不做”，而不是只告诉你“做了更放心”。</blockquote>',
    commentsList: [{ name: '板栗妈', text: '同意，先问群护折扣，很多店不会主动说。' }, { name: '老陈', text: '补充：记得要发票和检查报告。' }]
  },
  {
    id: 'p4', author: '一只糯米', avatar: '糯', tone: '', time: '10 月 17 日', place: '天目里', tag: '猫咖打卡', tagClass: 'is-checkin',
    title: '天目里这家猫咖，猫比人多，适合工作日发呆', excerpt: '下午三点去的，店里只有四个人。猫都在窗边睡觉，不营业也不躲。咖啡一般，但环境是真的安静。',
    likes: 63, comments: 12, image: 'cat-13.jpg', featured: false,
    body: '<p>工作日三点左右到店，只有两桌客人。店里的猫基本都在窗边睡觉，店员不会强行抱猫出来营业，这一点很加分。</p><h2>值得去的地方</h2><ul><li>窗边的长条座位，光线好，猫会自己过来。</li><li>书架区有几只年纪比较大的猫，不喜欢被摸肚子。</li><li>进门有消毒和鞋套，猫砂区没有异味。</li></ul><p>咖啡和甜点属于正常水平，不要抱太高期待。如果是冲着“撸猫”去，建议先问店员哪些猫今天状态好，不要追着睡着的猫摸。</p><blockquote>猫咖的第一条礼貌：猫不想营业的时候，让它睡。</blockquote>',
    commentsList: [{ name: '糯米团', text: '这家我去过，那只黑猫会自己跳腿上。' }, { name: '阿桔', text: '工作日人少是真的，周末就有点挤。' }]
  },
  {
    id: 'p5', author: '周周', avatar: '周', tone: 'is-orange', time: '10 月 16 日', place: '益乐路', tag: '领养回访', tagClass: '',
    title: '领养第 30 天：从躲床底，到每天门口接我下班', excerpt: '前两周几乎看不见猫。第三周开始，它会在我回家的时候从卧室探出头。不是猫变了，是它终于确定我不会走。',
    likes: 211, comments: 47, image: 'cat-14.jpg', featured: false,
    body: '<p>蛋黄来我家的第一个星期，只在半夜出来吃饭。白天完全看不到，床底像它的防空洞。我一度怀疑自己是不是不适合养猫。</p><h2>第三周的一个小变化</h2><p>那天我下班回家，开门的时候看到它从卧室门口探出半个头。没有过来，也没有躲。就那样看了我几秒，然后转身走了。但我知道，有什么东西开始松动了。</p><p>现在它会在我换鞋的时候蹲在门口，尾巴竖起来，绕着我走一圈。不是那种黏人的猫，但它会用自己的方式确认：你回来了。</p><blockquote>领养不是把猫带回家那一天，是猫决定把你当家人的那一天。</blockquote>',
    commentsList: [{ name: '林小满', text: '看哭了，蛋黄现在真的好幸福。' }, { name: '小鹿', text: '我家也是第三周才开始出来，真的需要等。' }]
  },
  {
    id: 'p7', author: '林小满', avatar: '林', tone: '', time: '10 月 15 日', place: '丰潭路', tag: '猫友同路', tagClass: 'is-companion',
    title: '周六早上沿河慢走，想找一只不追车的散步搭子', excerpt: '板栗刚习惯短时间下地牵绳，想找一位同样节奏慢、不主动追车追鸟的猫友。先在长椅边隔着推车观察。',
    likes: 28, comments: 1, image: '', featured: false,
    body: '<p>板栗已经习惯推车，最近开始短时间下地牵绳。想找一位同样节奏慢、不主动追车或追鸟的猫友，周六早上沿丰潭路河岸走一小段。</p><h2>希望怎么见面</h2><ul><li>先在沿河绿道的长椅旁碰面，两只猫都先在推车或背包里观察五分钟。</li><li>如果双方都能保持距离、不哈气，再并排走一小段。</li><li>任一只猫出现应激，就立刻结束，不勉强社交。</li></ul><blockquote>猫友同路不是让猫交朋友，是让习惯出门的猫在安全距离里熟悉彼此。</blockquote>',
    commentsList: [{ name: '阿桔', text: '这个节奏听起来很稳，先推车观察是对的。' }]
  }
];

const services = [
  { id: 's1', name: '青禾动物医院', type: '医院', icon: 'i-hospital', markClass: '', rating: 4.8, count: 126, sub: '猫科友好 · 流浪猫群护折扣', tags: ['夜间急诊', '猫科分离候诊', '群护折扣'], distance: 0.9, hours: '09:00 - 21:00', address: '文二西路 188 号', price: '基础体检 ¥120 起', phone: '0571-8888 3021', note: '医生会先问猫的情况再推荐项目，不会一上来推全套。流浪猫救助可提前电话报备。', reviews: [{ name: '林小满', avatar: '林', tone: '', stars: 5, time: '3 天前', text: '带板栗来做基础检查，医生很耐心，先摸了半天才让助手进来。没有乱推项目，群护折扣也主动提醒了。', tags: ['不推销', '对猫温柔'] }, { name: '奶油不甜', avatar: '奶', tone: 'is-dark', stars: 4, time: '1 周前', text: '夜间急诊等位有点久，但医生处理得很稳。候诊区有猫用费洛蒙，细节不错。', tags: ['急诊靠谱', '等位久'] }, { name: '阿桔', avatar: '桔', tone: 'is-orange', stars: 5, time: '2 周前', text: '小灰的驱虫就是在这做的，护士会教怎么喂药，没有那种“你自己回去弄”的感觉。', tags: ['护士耐心'] }] },
  { id: 's2', name: '尾巴杂货铺', type: '商店', icon: 'i-store', markClass: 'is-shop', rating: 4.6, count: 58, sub: '猫粮 · 罐头 · 猫砂', tags: ['小包装', '冻干试吃', '可拆封'], distance: 1.2, hours: '10:00 - 20:30', address: '古荡街道 42 号', price: '猫粮小包 ¥15 起', phone: '0571-8888 5510', note: '适合先买小包装试口味，不会一上来囤大袋。老板自己养了三只猫，会说实话。', reviews: [{ name: '周周', avatar: '周', tone: 'is-orange', stars: 5, time: '5 天前', text: '第一次养猫不知道买什么，老板问了猫的年龄和肠胃情况，给的都是小包装，没有硬推贵的。', tags: ['不硬推', '适合新手'] }, { name: '一只糯米', avatar: '糯', tone: '', stars: 4, time: '2 周前', text: '冻干试吃装很实用，但周末人多，结账要等。', tags: ['小包装'] }] },
  { id: 's3', name: '窗台猫咖', type: '猫咖', icon: 'i-coffee', markClass: 'is-cafe', rating: 4.4, count: 89, sub: '安静 · 不强行抱猫 · 可领养信息墙', tags: ['工作日人少', '有领养墙', '猫状态好'], distance: 2.1, hours: '11:00 - 22:00', address: '天目里 7 号楼 2F', price: '入场 ¥48 含饮品', phone: '0571-8888 7022', note: '店里有领养信息墙，和附近群护队有合作。不建议周末下午去，猫基本都在睡觉。', reviews: [{ name: '一只糯米', avatar: '糯', tone: '', stars: 5, time: '2 天前', text: '工作日三点去的，猫比人多。店员不会把睡着的猫抱起来营业，这点非常加分。', tags: ['不强行营业', '环境安静'] }, { name: '小鹿', avatar: '鹿', tone: 'is-dark', stars: 4, time: '1 周前', text: '咖啡一般，但猫的状态都很好。领养墙上有几只等家的猫，信息写得挺认真。', tags: ['猫状态好'] }] },
  { id: 's4', name: '沿河绿道', type: '遛猫的地方', icon: 'i-tree', markClass: 'is-walk', rating: 4.9, count: 203, sub: '牵绳遛猫 · 傍晚凉快 · 有长椅', tags: ['牵绳可走', '适合推车', '草坪可休息'], distance: 1.8, hours: '全天开放 · 建议傍晚', address: '丰潭路沿河绿化带', price: '免费', phone: '', note: '适合已经习惯牵引绳的猫，第一次出门建议先用推车熟悉环境。周末傍晚遛狗的人多，尽量错峰，避开草坪中央的活动区。', details: { environment: '沿河步道平整，有树荫和长椅，傍晚风比较凉。草坪中央周末人多。', advice: '适合已经习惯牵引绳的猫。第一次出门建议先用推车走一圈。傍晚六点后遛狗的人多，尽量错峰。', experience: '第一次带板栗来是推车走完整段，第二次才在长椅旁短时间下地。它更愿意贴着树荫走，不太喜欢草坪中央。' }, submittedBy: '林小满', reviews: [{ name: '老陈', avatar: '陈', tone: 'is-dark', stars: 5, time: '4 天前', text: '摩卡第一次出门就是来这，先推车走了一圈，第二次才敢下地牵绳。傍晚六点后比较舒服。', tags: ['适合推车', '傍晚凉快'] }, { name: '阿桔', avatar: '桔', tone: 'is-orange', stars: 5, time: '2 周前', text: '草地很干净，长椅也多。猫牵引绳要选防脱的，附近有遛狗的，看到大狗最好抱起来避一避。', tags: ['环境好', '要牵绳'] }] }
];


window.XianmaoData = { cats, posts, services, assets: DATA_ASSET_ROOT };


