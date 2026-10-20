const STORE_KEY = 'xianmao-state-v1';
const A = 'assets/';
const DISTANCE_MIN = 0.5;
const DISTANCE_DEFAULT = 5;
const DISTANCE_MAX = 20;

const cats = [
  {
    id: 'banli', name: '板栗', english: 'BANLI', age: '1 岁 2 个月', ageMonths: 14, ageGroup: '成年', sex: '公', breed: '中华田园猫', color: '橘白', distance: 0.4,
    area: '翠苑二区 · 南门花坛', areaShort: '翠苑二区', status: '已接回家', urgent: false, photo: 'cat-01.jpg',
    healthTags: ['已绝育', '亲人', '会用猫砂'], traits: ['会蹭手', '不怕狗', '贪吃'],
    note: '在南门花坛蹲了三天，会主动蹭人的裤脚。今年 9 月由林小满接回家，适应得很好。',
    reporter: '林小满', reporterRole: '翠苑二区 · 已实名', time: '今天 08:42', lat: 52, lng: 35,
    healthBadge: '已完成基础检查', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '可临时寄养 7 天',
    adoptionState: '已领养', verification: '已核验', views: 386, applications: 12, reportedByMe: true
  },
  {
    id: 'xiaohui', name: '小灰', english: 'XIAOHUI', age: '7 个月', ageMonths: 7, ageGroup: '幼年', sex: '母', breed: '英短蓝猫', color: '蓝灰', distance: 1.1,
    area: '古荡新村 · 3 幢车棚', areaShort: '古荡新村', status: '胆小但亲人', urgent: false, photo: 'cat-02.jpg',
    healthTags: ['已驱虫', '胆小', '需要耐心'], traits: ['慢热', '安静', '会踩奶'],
    note: '一直躲在车棚的纸箱里，喂了半个月才敢靠近。不抓人，但需要一点时间建立信任。适合有耐心、家里没有太吵闹的家庭。',
    reporter: '阿桔', reporterRole: '古荡新村 · 已实名', time: '昨天 19:10', lat: 28, lng: 65,
    healthBadge: '已完成基础检查', sterilization: '未绝育', vaccine: '未接种', deworm: '已驱虫', foster: '暂不支持寄养'
  },
  {
    id: 'doubao', name: '豆包', english: 'DOUBAO', age: '2 个月', ageMonths: 2, ageGroup: '幼年', sex: '母', breed: '中华田园猫', color: '狸花', distance: 0.8,
    area: '文三路 · 小区快递柜旁', areaShort: '文三路', status: '需要奶猫经验', urgent: false, photo: 'cat-03.jpg',
    healthTags: ['幼猫', '已驱虫', '需陪伴'], traits: ['精力旺', '爱玩', '会呼噜'],
    note: '和另外两只小猫一起被发现在快递柜后面。豆包是里面最不怕人的一只。希望领养人了解幼猫的喂养节奏，不冲动领养。',
    reporter: '周周', reporterRole: '文三路 · 已实名', time: '昨天 16:35', lat: 64, lng: 48,
    healthBadge: '待完成疫苗', sterilization: '未绝育', vaccine: '待接种', deworm: '已驱虫', foster: '可有条件寄养'
  },
  {
    id: 'danhuang', name: '蛋黄', english: 'DANHUANG', age: '2 岁', ageMonths: 24, ageGroup: '成年', sex: '公', breed: '中华田园猫', color: '橘猫', distance: 1.6,
    area: '益乐路 · 早餐店后巷', areaShort: '益乐路', status: '固定投喂中', urgent: false, photo: 'cat-04.jpg',
    healthTags: ['已绝育', '已接种', '圆润'], traits: ['稳重', '贪睡', '会看店'],
    note: '早餐店老板一直在喂，但店里不能养。蛋黄会自己在巷口晒太阳，和谁都熟。希望找一个能接受成年猫、不嫌弃它有点胖的家。',
    reporter: '早餐店王姨', reporterRole: '益乐路 · 邻里认证', time: '10 月 17 日', lat: 74, lng: 72,
    healthBadge: '疫苗齐全', sterilization: '已绝育', vaccine: '已接种', deworm: '已驱虫', foster: '可临时寄养 30 天',
    verification: '已核验', views: 512, applications: 18, reportedByMe: true
  },
  {
    id: 'tuanzi', name: '团子', english: 'TUANZI', age: '11 个月', ageMonths: 11, ageGroup: '幼年', sex: '母', breed: '三花猫', color: '三花', distance: 2.3,
    area: '丰潭路 · 河道绿化带', areaShort: '丰潭路', status: '需群护协助', urgent: false, photo: 'cat-05.jpg',
    healthTags: ['已绝育', '怕生', '会哈气'], traits: ['警惕', '独立', '夜行'],
    note: '河道边的群护猫，已经做了绝育。团子不适合强行家养，优先寻找有封闭院子的领养人，或愿意继续做群护的附近居民。',
    reporter: '河道群护队', reporterRole: '丰潭路 · 群护组织', time: '10 月 17 日', lat: 38, lng: 20,
    healthBadge: '已做 TNR', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '不适合寄养'
  },
  {
    id: 'mocha', name: '摩卡', english: 'MOCHA', age: '4 岁', ageMonths: 48, ageGroup: '成年', sex: '公', breed: '奶牛猫', color: '黑白', distance: 2.9,
    area: '嘉绿苑 · 北区车库', areaShort: '嘉绿苑', status: '老住户', urgent: false, photo: 'cat-06.jpg',
    healthTags: ['已绝育', '已接种', '老干部'], traits: ['话多', '黏人', '会开门'],
    note: '车库保安养了两年，最近要调走，没办法带走。摩卡会自己开门，喜欢趴在窗台看鸟。希望能找一个不嫌它话多的家。',
    reporter: '车库老陈', reporterRole: '嘉绿苑 · 邻里认证', time: '10 月 16 日', lat: 82, lng: 30,
    healthBadge: '疫苗齐全', sterilization: '已绝育', vaccine: '已接种', deworm: '已驱虫', foster: '暂不支持寄养'
  },
  {
    id: 'naigao', name: '奶糕', english: 'NAIGAO', age: '3 周', ageMonths: 0.7, ageGroup: '幼年', sex: '母', breed: '中华田园猫', color: '奶牛', distance: 1.3,
    area: '文二西路 · 便利店后门', areaShort: '文二西路', status: '需人工喂养', urgent: true, photo: 'cat-07.jpg',
    healthTags: ['奶猫', '需保温', '需人工喂养'], traits: ['怕冷', '需要频繁喂奶', '不能自行排便'],
    note: '便利店后门纸箱里发现的三周龄小猫，脐带已脱落，还没有断奶。发现人只能临时照看两天，急需有奶猫喂养经验的人接手，或联系附近群护队。',
    reporter: '便利店小赵', reporterRole: '文二西路 · 邻里认证', time: '今天 09:20', lat: 54, lng: 44,
    healthBadge: '待做奶猫检查', sterilization: '未绝育', vaccine: '未接种', deworm: '未驱虫', foster: '急需寄养'
  },
  {
    id: 'yingtao', name: '樱桃', english: 'YINGTAO', age: '9 个月', ageMonths: 9, ageGroup: '幼年', sex: '母', breed: '玳瑁猫', color: '玳瑁', distance: 6.8,
    area: '滨江·长河老街 · 河埠头', areaShort: '滨江·长河', status: '固定投喂中', urgent: false, photo: 'cat-14.jpg',
    healthTags: ['已绝育', '亲人', '会跟人走'], traits: ['爱晒太阳', '会蹭腿', '不挑食'],
    note: '长河老街河埠头的玳瑁，附近摊主轮流喂。最近老街上要整修，投喂点可能会断，想找一个愿意收留她的家。会跟人走一段，但不让抱。',
    reporter: '长河阿七', reporterRole: '滨江·长河 · 邻里认证', time: '10 月 18 日', lat: 84, lng: 88,
    healthBadge: '已完成基础检查', sterilization: '已绝育', vaccine: '未接种', deworm: '已驱虫', foster: '可临时寄养 14 天',
    verification: '已核验', views: 164, applications: 4
  },
  {
    id: 'wuzi', name: '乌子', english: 'WUZI', age: '3 岁', ageMonths: 36, ageGroup: '成年', sex: '公', breed: '黑猫', color: '纯黑', distance: 11.4,
    area: '拱墅·小河直街 · 巷口', areaShort: '拱墅·小河', status: '老住户', urgent: false, photo: 'cat-11.jpg',
    healthTags: ['已绝育', '慢热', '夜行'], traits: ['安静', '怕生', '会看家'],
    note: '小河直街巷口住了三年的黑猫，附近茶馆一直在喂。不主动靠近生人，但会在同一个人第三次出现时短暂露面。适合安静、有耐心的家。',
    reporter: '茶馆老周', reporterRole: '拱墅·小河 · 邻里认证', time: '10 月 15 日', lat: 9, lng: 12,
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

const state = {
  nav: 'home',
  filters: { breed: '全部', age: '全部', sex: '全部', distance: DISTANCE_DEFAULT, citywide: false },
  quick: '全部',
  query: '',
  favorites: ['doubao'],
  likedPosts: ['p2'],
  applications: [],
  selectedCat: null,
  mapSelected: null,
  profileTab: 'adopted',
  communityFilter: '全部',
  servicesFilter: '全部',
  toastId: 0,
  form: freshForm(),
  publish: { name: '', breed: '中华田园猫', age: '1–3 个月', sex: '公', area: '', note: '', photos: [], sterilized: true, friendly: true },
  reviewStars: 5,
  reviewService: null,
  savedPosts: [],
  savedPlaces: [],
  savedReviews: [],
  placePhotos: [],
  placeSpot: 'cuiyuan',
  publishedCats: [],
  adoptions: [
    { catId: 'banli', homeDate: '2026-09-28', revisitDate: '2026-12-28', status: '适应良好' }
  ]
};

const PLACE_SPOTS = [
  { id: 'cuiyuan', label: '翠苑街道 · 二区一带', lat: 48, lng: 42 },
  { id: 'gudang', label: '古荡街道 · 新村一带', lat: 34, lng: 58 },
  { id: 'wensan', label: '文三路 · 快递柜一带', lat: 57, lng: 36 },
  { id: 'fengtan', label: '丰潭路 · 沿河绿道', lat: 42, lng: 22 },
  { id: 'jialv', label: '嘉绿苑 · 北区一带', lat: 63, lng: 68 },
  { id: 'changhe', label: '滨江 · 长河一带', lat: 72, lng: 78 }
];

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

function breedMatches(cat, value) {
  if (value === '全部') return true;
  const haystack = [cat.breed, cat.color].filter(Boolean).join(' ');
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
  return isCitywide(filters) ? '全城都看看' : distanceLabel(filters.distance);
}

function distanceTicks() {
  const values = [DISTANCE_MIN, 5, 10, DISTANCE_MAX];
  return values.map((value) => {
    const percent = ((value - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN)) * 100;
    return `<span style="left:${percent}%">${value}km</span>`;
  }).join('');
}

function freshForm() {
  return { name: '', phone: '', home: '整租 / 自有住房', experience: '养过猫', reason: '', agree: false };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    if (Array.isArray(saved.favorites)) state.favorites = saved.favorites;
    if (Array.isArray(saved.likedPosts)) state.likedPosts = saved.likedPosts;
    if (Array.isArray(saved.applications)) state.applications = saved.applications;
    if (Array.isArray(saved.publishedCats)) state.publishedCats = saved.publishedCats;
    if (Array.isArray(saved.adoptions)) state.adoptions = saved.adoptions;
    if (Array.isArray(saved.savedPosts)) state.savedPosts = saved.savedPosts;
    if (Array.isArray(saved.savedPlaces)) state.savedPlaces = saved.savedPlaces;
    if (Array.isArray(saved.savedReviews)) state.savedReviews = saved.savedReviews;
  } catch (error) { /* keep defaults */ }
}
function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      favorites: state.favorites,
      likedPosts: state.likedPosts,
      applications: state.applications,
      publishedCats: state.publishedCats,
      adoptions: state.adoptions,
      savedPosts: state.savedPosts,
      savedPlaces: state.savedPlaces,
      savedReviews: state.savedReviews
    }));
  } catch (error) { /* ignore */ }
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const photoSrc = (photo) => /^(data:|https?:|blob:)/.test(photo || '') ? photo : A + photo;
const PLACE_PHOTO_SAMPLES = ['cat-01.jpg', 'cat-03.jpg', 'cat-05.jpg', 'cat-07.jpg', 'cat-10.jpg', 'cat-12.jpg', 'cat-13.jpg', 'cat-15.jpg', 'cat-16.jpg'];

let uploadPickerInput = null;

function openUploadPicker(target, slot) {
  if (uploadPickerInput) uploadPickerInput.remove();
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/jpeg,image/png,image/webp';
  picker.style.position = 'fixed';
  picker.style.left = '-9999px';
  picker.dataset.uploadInput = target;
  picker.dataset.slot = String(slot);
  picker.addEventListener('change', () => setTimeout(() => picker.remove(), 1500));
  document.body.appendChild(picker);
  uploadPickerInput = picker;
  picker.click();
}

async function handlePhotoUpload(input) {
  const selected = input.files && input.files[0];
  if (!selected) return;
  if (selected.size > 12 * 1024 * 1024) { toast('这张照片超过 12MB，请先压缩或换一张'); input.value = ''; return; }
  const target = input.dataset.uploadInput;
  const slot = Number(input.dataset.slot || 0);
  toast('正在压缩照片…');
  try {
    const dataUrl = await compressImage(selected, 1000, 0.78);
    if (target === 'place') {
      const draft = placeDraftFromForm();
      const photos = draft && Array.isArray(draft.photos) ? draft.photos.slice() : state.placePhotos.slice();
      while (photos.length < 3) photos.push('');
      photos[slot] = dataUrl;
      state.placePhotos = photos;
      state.placeDraft = { ...(draft || { id: '' }), photos, truth: true };
      placeSheet(state.placeDraft.id ? allServices().find((item) => item.id === state.placeDraft.id) : null, state.placeDraft);
    } else if (target === 'compose') {
      state.composePhoto = dataUrl;
      composeSheet();
    } else {
      const photos = state.publish.photos.slice();
      while (photos.length < 3) photos.push('');
      photos[slot] = dataUrl;
      state.publish.photos = photos.filter(Boolean);
      photoPicker();
    }
    toast('照片已放入，长边已压缩');
  } catch (error) {
    toast(error.message || '照片处理失败，换一张试试');
  } finally {
    input.value = '';
  }
}

document.addEventListener('change', (event) => {
  const upload = event.target.closest('[data-upload-input]');
  if (upload) handlePhotoUpload(upload);
});

function compressImage(file, maxSize = 1000, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('请选择图片文件')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('图片格式无法识别'));
      img.onload = () => {
        try {
          const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) { reject(error); }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const isFav = (id) => state.favorites.includes(id);
const mergeById = (base, saved) => {
  const merged = new Map();
  base.forEach((item) => { if (item && item.id) merged.set(item.id, item); });
  saved.forEach((item) => { if (item && item.id) merged.set(item.id, { ...(merged.get(item.id) || {}), ...item }); });
  return Array.from(merged.values());
};
const allPosts = () => mergeById(posts, state.savedPosts);
const allServices = () => mergeById(services, state.savedPlaces);
const postById = (id) => allPosts().find((post) => post.id === id);
const postLikes = (post) => Number(post.likes || 0) + (isLiked(post) ? 1 : 0);
const isLiked = (post) => state.likedPosts.includes(post.id);
const postCommentCount = (post) => Array.isArray(post.commentsList) && post.commentsList.length ? post.commentsList.length : Number(post.comments || 0);
const myPosts = () => allPosts().filter((post) => post.author === '林小满');
const myComments = () => allPosts().flatMap((post) => (post.commentsList || []).filter((comment) => comment.name === '林小满').map((comment) => ({ ...comment, post })));
const myLikedPosts = () => state.likedPosts.map(postById).filter(Boolean);
const allCats = () => cats.concat(state.publishedCats);
const availableCats = () => allCats().filter((cat) => cat.adoptionState !== '已领养');
const selectedCat = () => allCats().find((cat) => cat.id === state.selectedCat);
const isMine = (cat) => Boolean(cat && (cat.reportedByMe || cat.reporter === '林小满'));

function memberContribution(name) {
  if (!name) return { verified: false, reports: 0, adoptions: 0, posts: 0, comments: 0, reviews: 0, places: 0, total: 0, level: '邻里', frame: '' };
  const verified = ['林小满', '阿桔', '周周', '老陈', '车库老陈', '长河阿七'].includes(name);
  const reports = allCats().filter((cat) => (name === '林小满' ? isMine(cat) : cat.reporter === name)).length;
  const adoptions = state.adoptions.filter((adoption) => {
    const cat = allCats().find((item) => item.id === adoption.catId);
    return cat && (cat.reporter === name || (name === '林小满' && adoption.catId === 'banli'));
  }).length;
  const authored = allPosts().filter((post) => post.author === name).length;
  const comments = allPosts().reduce((total, post) => total + (post.commentsList || []).filter((comment) => comment.name === name).length, 0);
  const reviews = allServices().reduce((total, place) => total + (place.reviews || []).filter((review) => review.name === name).length, 0);
  const places = allServices().filter((place) => place.submittedBy === name).length;
  const total = reports + adoptions + authored + comments + reviews + places;
  const level = total >= 8 || reports >= 3 ? '资深邻里' : reports >= 1 || adoptions >= 1 || authored >= 2 ? '守护邻里' : total >= 1 ? '邻里' : '新邻居';
  const frame = level === '资深邻里' ? 'is-frame-senior' : level === '守护邻里' ? 'is-frame-guard' : level === '邻里' ? 'is-frame-neighbor' : '';
  return { verified, reports, adoptions, posts: authored, comments, reviews, places, total, level, frame };
}

function contributorBadge(name, compact = false) {
  const c = memberContribution(name);
  const detail = compact
    ? [c.verified ? '已实名' : '', c.reports ? `上报 ${c.reports}` : '', c.adoptions ? `领养 ${c.adoptions}` : ''].filter(Boolean).join(' · ')
    : [c.verified ? '已实名' : '未实名', c.reports ? `上报 ${c.reports} 只` : '', c.adoptions ? `领养 ${c.adoptions} 只` : '', c.posts ? `${c.posts} 篇笔记` : '', c.comments ? `${c.comments} 条回应` : '', c.reviews ? `${c.reviews} 条评价` : ''].filter(Boolean).join(' · ');
  return `<span class="contributor-badge ${c.frame}"><b>${esc(c.level)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span>`;
}

function contributorAvatar(name, avatar, tone = '') {
  const c = memberContribution(name);
  const label = String(avatar || name || '邻').slice(0, 1);
  return `<span class="contributor-avatar ${c.frame}"><span class="avatar ${tone}">${esc(label)}</span></span>`;
}

function serviceTypeLabel(type) {
  return type === '遛猫的地方' ? '遛猫地点' : type;
}

function toast(message) {
  const root = $('#toastRoot');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = icon('check') + esc(message);
  root.appendChild(el);
  setTimeout(() => { el.remove(); }, 2600);
}

function syncNav() {
  $$('[data-nav]').forEach((btn) => {
    const active = btn.dataset.nav === state.nav;
    btn.classList.toggle('is-active', active);
    if (btn.classList.contains('tab')) btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

function go(nav) {
  closeOverlay();
  state.nav = nav;
  state.mapSelected = null;
  render();
}

function filteredCats() {
  const q = state.query.trim().toLowerCase();
  return availableCats().filter((cat) => {
    if (!breedMatches(cat, state.filters.breed)) return false;
    if (!ageMatches(cat, state.filters.age)) return false;
    if (state.filters.sex !== '全部' && cat.sex !== state.filters.sex) return false;
    if (!distanceMatches(cat, state.filters.distance, state.filters.citywide)) return false;
    if (state.quick === '亲人' && !cat.healthTags.concat(cat.traits).some((tag) => /亲人|黏人|蹭手|踩奶/.test(tag))) return false;
    if (state.quick === '幼猫' && cat.ageGroup !== '幼年') return false;
    if (state.quick === '已绝育' && cat.sterilization !== '已绝育') return false;
    if (state.quick === '1km内' && cat.distance > 1) return false;
    if (q && !(cat.name + cat.breed + cat.color + cat.area + cat.traits.join('')).toLowerCase().includes(q)) return false;
    return true;
  });
}

function catCard(cat, index) {
  const tags = cat.healthTags.slice(0, 2).map((tag, i) => `<span class="mini-tag ${i === 0 ? 'is-special' : ''}">${esc(tag)}</span>`).join('');
  return `
    <article class="cat-card" style="--i:${index}" data-open-cat="${cat.id}">
      <div class="cat-photo">
        <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}，${esc(cat.breed)}" loading="lazy" />
        <span class="status-pill ${cat.urgent ? '' : 'is-calm'}">${esc(cat.status)}</span>
        <button class="cat-fav ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'} ${esc(cat.name)}">${icon('heart')}</button>
      </div>
      <div class="cat-info">
        <div class="cat-name-row"><span class="cat-name">${esc(cat.name)}</span><span class="cat-distance">${cat.distance} km</span></div>
      <div class="cat-meta">${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}${cat.color && cat.color !== '待补充' ? ' · ' + esc(cat.color) : ''}</div>
        <div class="cat-tags">${tags}</div>
      </div>
    </article>`;
}

function emptyCats() {
  return `<div class="empty-results">${icon('cat')}<h3>这一带暂时没有匹配的猫</h3><p>试试放宽距离或品种。没有结果不代表没有猫，可能只是还没被看见。</p><button type="button" data-action="clear-filters">清空筛选</button></div>`;
}

function quickChip(label) {
  const active = state.quick === label;
  return `<button class="chip ${active ? 'is-active' : ''}" type="button" data-quick="${esc(label)}">${label === '1km内' ? icon('pin') : ''}${esc(label)}</button>`;
}

function featured() {
  const cat = availableCats()[0];
  return `
    <button class="featured-cat" type="button" data-open-cat="${cat.id}" aria-label="查看 ${esc(cat.name)} 的领养档案">
      <img src="${photoSrc(cat.photo)}" alt="橘白猫 ${esc(cat.name)} 坐在花坛边" />
      <div class="featured-top">
        <span class="status-pill">${esc(cat.status)}</span>
        <span class="featured-fav ${isFav(cat.id) ? 'is-active' : ''}" data-fav="${cat.id}" role="button" tabindex="0" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'} ${esc(cat.name)}">${icon('heart')}</span>
      </div>
      <div class="featured-body">
        <div class="featured-kicker">TODAY'S NEIGHBOR · 今日邻里</div>
        <div class="featured-name-row"><span class="featured-name">${esc(cat.name)}</span><span class="featured-name-note">${esc(cat.english)}</span></div>
        <div class="featured-desc">
          <span>${icon('pin')}${esc(cat.areaShort)} · ${cat.distance}km</span>
          <span>${esc(cat.sex)} · ${esc(cat.age)}</span>
          <span>${esc(cat.breed)}</span>
        </div>
        <div class="featured-cta"><span>${esc(cat.note)}</span><span class="arrow-circle">${icon('arrow-up-right')}</span></div>
      </div>
    </button>`;
}

function renderHome() {
  const list = filteredCats();
  return `
    <header class="topbar">
      <div class="brand-mini"><span class="seal">猫</span><div class="brand-mini-text"><b>闲猫·手慢无</b><small>SPARE CAT · SPARE A HOME</small></div></div>
      <button class="location-pill" type="button" data-action="location">${icon('pin')}翠苑 <small>· 西湖区</small>${icon('chevron-down')}</button>
      <button class="round-btn" type="button" data-action="notice" aria-label="查看提醒">${icon('bell')}<span class="dot"></span></button>
    </header>
    <section class="home-hero">
    <div class="eyebrow">NEARBY · ${isCitywide() ? 'ALL HANGZHOU' : Number(state.filters.distance) >= DISTANCE_MAX ? DISTANCE_MAX + 'KM RADIUS' : state.filters.distance + 'KM RADIUS'}</div>
      <h1>附近有 <span class="count">${list.length}</span> 只猫，<br />在等一个家。</h1>
      <div class="hero-foot">
        <p class="hero-note">来自邻里自愿上报的流浪猫档案。信息经基础核验，领养仍需双方见面。</p>
        <div class="hero-stamp">先见面<br />再决定</div>
      </div>
    </section>
    <div class="search-row">
      <label class="search-box">${icon('search')}<input id="searchInput" type="search" placeholder="搜猫名、品种、街区" value="${esc(state.query)}" aria-label="搜索猫名、品种或街区" /></label>
      <button class="filter-btn" type="button" data-action="filters" aria-label="打开筛选">${icon('sliders')}<span class="filter-badge"></span></button>
    </div>
    <div class="quick-chips" aria-label="快捷筛选">
      ${['全部', '亲人', '幼猫', '已绝育', '1km内'].map((label) => quickChip(label)).join('')}
    </div>
    <button class="notice-strip" type="button" data-action="notice">
      <span class="live-dot"></span>
      <p>古荡新村车棚：<b>胆小的小灰</b> 今天被目击，状态稳定，仍在等一个安静的家</p>
      ${icon('chevron')}
    </button>
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">今天，先认识它<small>ONE CAT AT A TIME</small></h2>
        <button class="section-link" type="button" data-action="all-cats">全部 ${availableCats().length} 只 ${icon('arrow-right')}</button>
      </div>
      ${featured()}
    </section>
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">附近也在等<small>NEARBY, RIGHT NOW</small></h2>
        <span class="result-count">${list.length} / ${availableCats().length} 只</span>
      </div>
      <div class="cat-grid" id="catGrid">
        ${list.length ? list.map((cat, index) => catCard(cat, index)).join('') : emptyCats()}
      </div>
    </section>
    <section class="section">
      <div class="section-head">
        <h2 class="section-title">带一点经验回家<small>FIELD NOTES</small></h2>
        <button class="section-link" type="button" data-nav="community">去广场 ${icon('arrow-right')}</button>
      </div>
      <div class="guide-grid">
        <button class="guide-card guide-trap" type="button" data-action="open-article" data-id="p1">
          <span class="guide-icon">${icon('trap')}</span><span class="guide-arrow">${icon('arrow-up-right')}</span>
          <h3>捉猫，<br />先学会等</h3><p>不追、不围、不硬抱。一份邻里实测的捕捉笔记。</p>
        </button>
        <button class="guide-card guide-care" type="button" data-action="open-article" data-id="p2">
          <span class="guide-icon">${icon('notebook')}</span><span class="guide-arrow">${icon('arrow-up-right')}</span>
          <h3>接猫回家<br />的前七天</h3><p>把热情收一收，让它先确认安全。</p>
        </button>
      </div>
    </section>
    <div class="home-closing">
      <p><b>不是每只猫都需要被领养。</b>有些只需要一口水、一次绝育，或一个不被驱赶的角落。</p>
      <span>XIANMAO<br />COMMUNITY<br />GUIDE 01</span>
    </div>`;
}
function renderMap() {
  const pins = availableCats().map((cat) => `
    <button class="map-pin ${state.mapSelected === cat.id ? 'is-selected' : ''}" type="button" style="left:${cat.lng}%;top:${cat.lat}%" data-map-cat="${cat.id}" aria-label="地图上的 ${esc(cat.name)}">
      <span class="map-pin-photo"><img src="${photoSrc(cat.photo)}" alt="" /></span>
      <span class="map-pin-name">${esc(cat.name)}</span>
    </button>`).join('');
  const cat = state.mapSelected ? availableCats().find((c) => c.id === state.mapSelected) : null;
  return `
    <div class="map-page">
      <svg class="map-canvas" viewBox="0 0 380 780" preserveAspectRatio="xMidYMid slice" aria-label="翠苑附近猫口地图">
        <defs>
          <pattern id="blocks" width="86" height="72" patternUnits="userSpaceOnUse">
            <rect width="86" height="72" fill="#e9e4d4" />
            <rect x="3" y="3" width="75" height="61" rx="5" fill="#f2eee1" stroke="#d9d1bd" stroke-width=".8" />
            <rect x="9" y="9" width="28" height="21" rx="2" fill="#e4ddca" opacity=".7" />
            <rect x="43" y="9" width="30" height="21" rx="2" fill="#e4ddca" opacity=".55" />
            <rect x="9" y="36" width="64" height="22" rx="2" fill="#e4ddca" opacity=".4" />
          </pattern>
          <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="table" tableValues="0 .10" /></feComponentTransfer><feComposite in2="SourceGraphic" operator="over" /></filter>
        </defs>
        <rect width="380" height="780" fill="url(#blocks)" />
        <g opacity=".9">
          <path d="M-10 118 C70 104, 140 142, 214 122 S330 92, 395 110" fill="none" stroke="#c7d8cf" stroke-width="22" />
          <path d="M-10 118 C70 104, 140 142, 214 122 S330 92, 395 110" fill="none" stroke="#f7f3e7" stroke-width="2" stroke-dasharray="2 8" />
          <path d="M78 -10 C68 80, 92 160, 76 260 S48 410, 82 520 S120 680, 104 790" fill="none" stroke="#f9f5e9" stroke-width="15" />
          <path d="M78 -10 C68 80, 92 160, 76 260 S48 410, 82 520 S120 680, 104 790" fill="none" stroke="#c9c0ac" stroke-width="1" />
          <path d="M-10 448 C70 438, 170 464, 255 444 S352 420, 395 432" fill="none" stroke="#f9f5e9" stroke-width="12" />
          <path d="M-10 632 C100 618, 210 650, 395 620" fill="none" stroke="#f9f5e9" stroke-width="9" />
          <path d="M286 -10 C276 120, 300 240, 280 350 S262 560, 300 790" fill="none" stroke="#f9f5e9" stroke-width="10" />
        </g>
        <g fill="#c9d5c9" opacity=".85">
          <rect x="17" y="152" width="42" height="54" rx="5" />
          <rect x="124" y="178" width="56" height="40" rx="5" />
          <rect x="308" y="152" width="54" height="40" rx="5" />
          <rect x="179" y="350" width="51" height="41" rx="5" />
          <rect x="25" y="512" width="48" height="49" rx="5" />
          <rect x="306" y="488" width="55" height="51" rx="5" />
          <rect x="112" y="700" width="60" height="45" rx="5" />
        </g>
        <g fill="#a9b9a8" opacity=".55">
          <circle cx="39" cy="168" r="8" /><circle cx="57" cy="186" r="11" /><circle cx="150" cy="194" r="8" /><circle cx="335" cy="172" r="11" /><circle cx="203" cy="367" r="7" /><circle cx="47" cy="534" r="10" /><circle cx="334" cy="512" r="8" />
        </g>
        <g fill="#8a917f" opacity=".7" font-family="DM Mono, monospace" font-size="7" letter-spacing="1.2">
          <text x="22" y="122">WEN ER RD.</text>
          <text x="230" y="440">WEN SAN RD.</text>
          <text x="40" y="626">YILE RD.</text>
          <text x="302" y="690" transform="rotate(-88 302 690)">FENGTAN RD.</text>
          <text x="118" y="60">CUIYUAN</text>
          <text x="148" y="348">GUDANG</text>
        </g>
        <rect width="380" height="780" filter="url(#paperNoise)" opacity=".5" />
      </svg>
      <div class="map-top">
        <div class="map-brand"><span class="seal">猫</span><b>猫口地图</b></div>
        <button class="map-filter" type="button" data-action="filters" aria-label="打开筛选">${icon('sliders')}</button>
      </div>
      <div class="map-location">${icon('pin')}翠苑街道 · 西湖区 <span style="opacity:.5">/</span> ${isCitywide() ? '全城' : state.filters.distance + 'km'}</div>
      <div class="map-you" style="left:45%;top:46%" aria-label="你的位置"></div>
      ${pins}
      <div class="map-scale">1 : 5,000</div>
      <div class="map-bottom ${cat ? 'has-cat' : ''}">
        ${cat ? `
          <button class="map-close" type="button" data-action="close-map-card" aria-label="关闭猫卡片">${icon('close')}</button>
          <div class="map-cat-card">
            <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
            <div class="map-cat-info">
              <div class="kicker">${esc(cat.areaShort)} · ${cat.distance} KM AWAY</div>
              <h3>${esc(cat.name)}</h3>
              <p>${esc(cat.sex)} · ${esc(cat.age)} · ${esc(cat.breed)}<br />${esc(cat.status)} / ${esc(cat.healthBadge)}</p>
              <button class="btn btn-primary" type="button" data-open-cat="${cat.id}">查看档案 ${icon('arrow-up-right')}</button>
            </div>
          </div>` : `
          <button class="map-hint" type="button" data-action="map-howto">
            <span class="map-hint-icon">${icon('paw')}</span>
            <span><b>${availableCats().length} 个猫口坐标</b><p>点位只显示到街区，精确位置需联系上报人</p></span>
            ${icon('chevron')}
          </button>
          <div class="map-store-row">
            <button class="map-store-chip" type="button" data-nav="services">${icon('hospital')}青禾动物医院</button>
            <button class="map-store-chip" type="button" data-nav="services">${icon('coffee')}窗台猫咖</button>
            <button class="map-store-chip" type="button" data-nav="services">${icon('tree')}沿河绿道</button>
          </div>`}
      </div>
    </div>`;
}

function renderPublish() {
  const photos = state.publish.photos;
  const sel = (key, value) => state.publish[key] === value ? 'is-active' : '';
  return `
    <div class="publish-head">
      <div class="page-kicker">REPORT A CAT · 上报一只猫</div>
      <h1>让附近的人，<br />知道它在这里。</h1>
      <p>不需要很完整。一张照片、一个大致位置，就足够让关心它的人找到它。</p>
      <div class="publish-progress"><span class="is-on"></span><span class="is-on"></span><span class="${photos.length ? 'is-on' : ''}"></span><small>01 / 03</small></div>
    </div>
    <form class="publish-form" id="publishForm">
      <div class="form-card">
        <div class="form-card-head"><span class="num">01</span><h2>先给它一张照片</h2><small>最多 3 张</small></div>
        <div class="photo-grid">
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="选择照片">
            ${photos[0] ? `<img src="${photoSrc(photos[0])}" alt="已选择的猫照片" /><span class="photo-badge">主图</span><span class="change-photo">更换</span>` : `${icon('camera')}<span>添加照片</span>`}
          </button>
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="添加第二张照片">
            ${photos[1] ? `<img src="${photoSrc(photos[1])}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('plus')}<span>补充</span>`}
          </button>
          <button class="photo-slot" type="button" data-action="pick-photo" aria-label="添加第三张照片">
            ${photos[2] ? `<img src="${photoSrc(photos[2])}" alt="已选择的猫照片" /><span class="change-photo">更换</span>` : `${icon('image')}<span>环境</span>`}
          </button>
        </div>
        <p class="photo-note">尽量拍清楚毛色和体型。不要开闪光灯，不要为了拍照追赶它。</p>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">02</span><h2>它是谁</h2><small>不知道也可以留空</small></div>
        <div class="form-field"><label for="pubName">你给它的称呼</label><input class="input" id="pubName" name="name" placeholder="比如：南门小橘" value="${esc(state.publish.name)}" /></div>
        <div class="form-row">
          <div class="form-field"><label for="pubBreed">品种 / 毛色</label><div class="select-wrap"><select class="select" id="pubBreed" name="breed">${['中华田园猫', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫', '英短', '美短', '布偶猫', '暹罗猫', '缅因猫', '加菲猫', '折耳猫', '银渐层', '金渐层', '混血 / 不确定'].map((v) => `<option ${state.publish.breed === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
          <div class="form-field"><label for="pubAge">月龄 / 年龄</label><div class="select-wrap"><select class="select" id="pubAge" name="age">${['0–1 个月', '1–3 个月', '3–12 个月', '1–3 岁', '3 岁以上', '不确定'].map((v) => `<option ${state.publish.age === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        </div>
        <div class="form-field"><label>性别</label><div class="seg">${['公', '母', '不确定'].map((v) => `<button type="button" class="${sel('sex', v)}" data-pub-seg="sex" data-value="${v}">${v}</button>`).join('')}</div></div>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">03</span><h2>在哪里遇见</h2><small>只公开到街区</small></div>
        <div class="form-field"><label for="pubArea">大致位置</label><input class="input" id="pubArea" name="area" placeholder="比如：翠苑二区南门花坛" value="${esc(state.publish.area)}" /></div>
        <div class="toggle-row"><button class="toggle ${state.publish.sterilized ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="sterilized" aria-label="切换绝育状态"></button><p>看起来已绝育（有耳标或剪耳）</p></div>
        <div class="toggle-row"><button class="toggle ${state.publish.friendly ? 'is-on' : ''}" type="button" data-action="toggle-pub" data-key="friendly" aria-label="切换亲人状态"></button><p>比较亲人，可以靠近</p></div>
      </div>
      <div class="form-card">
        <div class="form-card-head"><span class="num">04</span><h2>想补充的话</h2><small>可选</small></div>
        <div class="form-field"><label for="pubNote">它的状态、习惯，或你担心的事</label><textarea class="textarea" id="pubNote" name="note" placeholder="比如：每天都在花坛边，看到人会蹭过来，但不太敢进楼道。">${esc(state.publish.note)}</textarea></div>
      </div>
      <div class="submit-area">
        <p class="submit-hint">${icon('shield')}请勿公开精确门牌号。上报后会经过邻里核验，通过后出现在附近发现与地图中。</p>
        <button class="submit-btn" type="submit">${icon('send')}提交上报</button>
      </div>
    </form>`;
}

function renderCommunity() {
  const filters = ['全部', '捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '猫友同路', '领养回访'];
  const source = allPosts();
  const list = state.communityFilter === '全部' ? source : source.filter((p) => p.tag === state.communityFilter);
  const hot = list.find((post) => post.featured) || list[0];
  return `
    <header class="topbar">
      <div class="brand-mini"><span class="seal">猫</span><div class="brand-mini-text"><b>广场</b><small>NEIGHBORHOOD NOTES</small></div></div>
      <button class="round-btn" type="button" data-action="search-community" aria-label="搜索帖子">${icon('search')}</button>
      <button class="round-btn" type="button" data-action="compose" aria-label="写一条">${icon('edit')}</button>
    </header>
    <section class="community-head">
      <div class="eyebrow">FIELD NOTES · 邻里经验</div>
      <div class="community-title-row">
        <h1>猫的事，<br /><em>大家的事。</em></h1>
        <button class="write-btn" type="button" data-action="compose">${icon('edit')}写一条</button>
      </div>
      <div class="community-walk-actions">
        <button type="button" data-action="add-walk-place">${icon('pin')}分享遛猫地点</button>
        <button type="button" data-action="compose-companion">${icon('paw')}找猫友同路</button>
      </div>
      <p>养猫经验、捉猫实录、就医体验、猫咖打卡、遛猫路线和猫友同路。只陈述亲历，把判断留给后来的人。</p>
    </section>
    <div class="community-tabs" aria-label="帖子分类">${filters.map((f) => `<button class="chip ${state.communityFilter === f ? 'is-active' : ''}" type="button" data-community-filter="${f}">${f}</button>`).join('')}</div>
    ${hot ? `<button class="hot-card" type="button" data-action="open-article" data-id="${hot.id}">
      <div class="hot-meta"><span>本周邻里热帖 · 01</span><span>1.2k 阅读</span></div>
      <h2>${esc(hot.title)}</h2>
      <p>${esc(hot.excerpt)}</p>
      <div class="hot-footer"><span>${esc(hot.author)} · ${esc(hot.place)}</span>${icon('arrow-up-right')}</div>
    </button>` : ''}
    <div class="community-entry-row">
      <button class="service-entry" type="button" data-nav="services">
        <span class="store-icon">${icon('store')}</span>
        <span><b>附近好店 · ${allServices().length} 处邻里推荐</b><p>医院、猫粮、猫咖、遛猫地点，都有亲历评价</p></span>
        ${icon('arrow-right')}
      </button>
      <button class="walk-entry" type="button" data-action="add-walk-place">
        <span class="store-icon">${icon('pin')}</span>
        <span><b>分享遛猫地点</b><p>记录环境、时段和提醒</p></span>
        ${icon('arrow-right')}
      </button>
    </div>
    <button class="companion-entry" type="button" data-action="compose-companion">
      <span class="companion-entry-mark">${icon('paw')}</span>
      <span><b>猫友同路 · 找一只脾气合得来的散步搭子</b><p>先在公开地点见一面，用推车或背包观察彼此，不交换住址和私人电话</p></span>
      ${icon('arrow-right')}
    </button>
    <div class="feed">
      ${list.map((post, index) => postCard(post, index)).join('')}
      <div class="feed-end">— 已经看到这一带的所有经验 —</div>
    </div>`;
}

function postCard(post, index) {
  return `
    <article class="post-card" style="--i:${index}">
      <div class="post-top">
        ${contributorAvatar(post.author, post.avatar, post.tone)}
        <div class="post-author"><b>${esc(post.author)}</b><span>${esc(post.time)} · ${esc(post.place)}</span></div>
        <span class="post-tag ${post.tagClass}">${esc(post.tag)}</span>
      </div>
      <button type="button" class="post-open" data-action="open-article" data-id="${post.id}" style="display:block;width:100%;border:0;background:transparent;padding:0;text-align:left">
        <h3>${esc(post.title)}</h3>
        <p class="excerpt">${esc(post.excerpt)}</p>
        ${post.image ? `<img class="post-media" src="${photoSrc(post.image)}" alt="${esc(post.title)}" loading="lazy" />` : ''}
      </button>
      <div class="post-foot">
        <button class="post-stat ${isLiked(post) ? 'is-liked' : ''}" type="button" data-action="like-post" data-id="${post.id}" aria-pressed="${isLiked(post)}" aria-label="${isLiked(post) ? '取消点赞' : '点赞'}">${icon('heart')}<span>${postLikes(post)}</span></button>
        <button class="post-stat" type="button" data-action="open-article" data-id="${post.id}">${icon('square')}<span>${postCommentCount(post)}</span></button>
        <span class="post-place">${icon('pin')}${esc(post.place)}</span>
      </div>
    </article>`;
}

function renderServices() {
  const filters = ['全部', '医院', '商店', '猫咖', '遛猫的地方'];
  const list = state.servicesFilter === '全部' ? allServices() : allServices().filter((s) => s.type === state.servicesFilter);
  return `
    <div class="services-page">
      <div class="services-hero">
        <div class="services-top">
          <button class="round-btn" type="button" data-action="back-home" aria-label="返回">${icon('arrow-left')}</button>
          <span class="seal">荐</span>
        </div>
        <div class="page-kicker">NEIGHBORHOOD PICKS · 邻里亲测</div>
        <h1>街角那些<br />靠谱的地方。</h1>
        <p>医院、猫粮、猫咖，还有适合牵绳散步、推车出门的遛猫的地方。不是广告位，是邻居们真的去过、愿意再去的地方。</p>
        <div class="hero-stats">
          <div><b>${allServices().length}</b><span>处收录</span></div>
          <div><b>4.7</b><span>平均评分</span></div>
          <div><b>${allServices().reduce((total, place) => total + Number(place.count || 0), 0)}</b><span>条邻里评价</span></div>
        </div>
        <button class="services-add-place" type="button" data-action="add-walk-place">${icon('pin')}分享一个遛猫地点 ${icon('arrow-right')}</button>
      </div>
      <div class="services-filter">${filters.map((f) => `<button class="chip ${state.servicesFilter === f ? 'is-active' : ''}" type="button" data-service-filter="${f}">${f}</button>`).join('')}</div>
      <div class="services-list">
        ${list.map((service) => serviceCard(service)).join('')}
      </div>
      <div class="services-note">${icon('shield')}收录不收取费用。评价只记录亲历，保留不同体验；商家可以公开回复，但不能删除评价。遇到纠纷，建议先联系平台邻里协调员。</div>
    </div>`;
}

function serviceCard(service) {
  return `
    <button class="service-card" type="button" data-open-service="${service.id}">
      <span class="service-mark ${service.markClass}">${icon(service.icon.replace('i-', ''))}<span>${esc(serviceTypeLabel(service.type))}</span></span>
      <span class="service-info">
        <span class="service-name-row"><h3>${esc(service.name)}</h3><span class="service-rating">${icon('star')}${service.rating}</span></span>
        <span class="service-sub">${esc(service.sub)}</span>
        <span class="service-tags">${service.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</span>
        <span class="service-meta">${icon('pin')}${service.distance}km · ${esc(service.price)}<span class="service-open">${icon('chevron')}查看</span></span>
      </span>
    </button>`;
}

function renderServiceDetail() {
  const service = allServices().find((s) => s.id === state.reviewService) || allServices()[0];
  const stars = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="icon ${i < n ? 'is-on' : ''}" aria-hidden="true"><use href="#i-star"></use></svg>`).join('');
  return `
    <div class="services-page">
      <div class="service-detail-hero">
        <div class="service-detail-top">
          <button class="round-btn" type="button" data-action="back-services" aria-label="返回好店列表">${icon('arrow-left')}</button>
          <button class="round-btn" type="button" data-action="share-service" aria-label="分享这家店">${icon('send')}</button>
        </div>
        <div class="detail-kicker">${esc(serviceTypeLabel(service.type))} · ${service.distance} KM AWAY · ${service.open ? '营业中' : '休息中'}</div>
        <h1>${esc(service.name)}</h1>
        <p>${esc(service.sub)}</p>
      </div>
      <div class="service-detail-body">
        <div class="rating-summary">
          <div class="rating-big"><b>${service.rating}</b><div class="stars">${stars(5)}</div><span>${service.count} 条邻里评价</span></div>
          <div class="score-bars">
            <div class="score-row"><span>专业</span><span class="score-track"><i class="score-fill" style="width:94%"></i></span><b>4.8</b></div>
            <div class="score-row"><span>价格</span><span class="score-track"><i class="score-fill" style="width:82%"></i></span><b>4.2</b></div>
            <div class="score-row"><span>态度</span><span class="score-track"><i class="score-fill" style="width:91%"></i></span><b>4.7</b></div>
            <div class="score-row"><span>环境</span><span class="score-track"><i class="score-fill" style="width:87%"></i></span><b>4.5</b></div>
          </div>
        </div>
        <div class="service-info-grid">
          <div class="service-info-item"><span>营业时间</span><b>${esc(service.hours)}</b></div>
          <div class="service-info-item"><span>地址</span><b>${esc(service.address)}</b></div>
          <div class="service-info-item"><span>参考价格</span><b>${esc(service.price)}</b></div>
          <div class="service-info-item"><span>联系电话</span><b>${esc(service.phone || '暂无')}</b></div>
        </div>
        <div class="service-tagline">${esc(service.note)}</div>
        ${service.photos && service.photos.length ? `<div class="place-photo-strip">${service.photos.map((photo) => `<img src="${photoSrc(photo)}" alt="${esc(service.name)} 的环境照片" />`).join('')}</div>` : ''}
        ${service.details ? `<div class="place-details"><div><span>环境描述</span><p>${esc(service.details.environment || '暂未补充')}</p></div><div><span>适合与提醒</span><p>${esc(service.details.advice || '暂未补充')}</p></div>${service.details.experience ? `<div><span>遛猫心得</span><p>${esc(service.details.experience)}</p></div>` : ''}</div>` : ''}
        <div class="review-head"><h2>邻里怎么说</h2><div class="review-head-actions">${service.type === '遛猫的地方' && service.submittedBy === '林小满' ? `<button type="button" data-action="edit-walk-place" data-id="${service.id}">${icon('edit')}补充地点</button>` : ''}<button type="button" data-action="write-review" data-id="${service.id}">${icon('edit')}写评价</button></div></div>
        ${service.reviews.map((review) => `
          <div class="review">
            <div class="review-top">${contributorAvatar(review.name, review.avatar, review.tone)}<div><b>${esc(review.name)}</b><span>${esc(review.time)}</span><small class="contributor-line">${contributorBadge(review.name, true)}</small></div><span class="review-stars">${stars(review.stars)}</span></div>
            <p>${esc(review.text)}</p>
            <div class="review-tags">${review.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
          </div>`).join('')}
        ${service.submittedBy ? `<div class="place-submitter">${contributorAvatar(service.submittedBy, service.submittedBy.slice(0, 1))}<span>地点由 ${esc(service.submittedBy)} 补充</span>${contributorBadge(service.submittedBy, true)}</div>` : ''}
      </div>
      <div class="service-detail-foot"><button class="btn btn-primary" type="button" data-action="write-review" data-id="${service.id}">${icon('edit')}分享一次真实体验</button></div>
    </div>`;
}

function renderProfile() {
  const favCats = allCats().filter((cat) => state.favorites.includes(cat.id));
  const mine = allCats().filter(isMine);
  const adopted = state.adoptions;
  const authored = myPosts();
  const walkPlaces = allServices().filter((service) => service.type === '遛猫的地方' && service.submittedBy === '林小满');
  const comments = myComments();
  const liked = myLikedPosts();
  const contribution = memberContribution('林小满');
  const tabs = [
    { id: 'adopted', label: '已领养', count: adopted.length },
    { id: 'published', label: '我的上报', count: mine.length },
    { id: 'walks', label: '遛猫地点', count: walkPlaces.length },
    { id: 'posts', label: '我的发帖', count: authored.length },
    { id: 'comments', label: '我的评论', count: comments.length },
    { id: 'liked', label: '点赞', count: liked.length },
    { id: 'favorites', label: '收藏', count: favCats.length },
    { id: 'applications', label: '领养申请', count: state.applications.length }
  ];
  const activeTab = tabs.some((tab) => tab.id === state.profileTab) ? state.profileTab : 'adopted';
  const content = {
    adopted: () => renderAdoptions(adopted),
    published: () => renderPublished(),
    walks: () => renderWalkPlaces(walkPlaces),
    posts: () => renderMyPosts(authored),
    comments: () => renderMyComments(comments),
    liked: () => renderLikedPosts(liked),
    favorites: () => renderFavorites(favCats),
    applications: () => renderApplications()
  }[activeTab]();
  return `
    <div class="profile-hero">
      <div class="profile-top"><span class="seal">猫</span><span>MEMBER SINCE 2024 · 邻里编号 XM-0217</span></div>
      <div class="profile-id">
        <div class="profile-avatar ${contribution.frame}">林</div>
        <div><h1>林小满 ${contributorBadge('林小满', true)}</h1><p>翠苑二区 · ${contribution.verified ? '已实名' : '未实名'} · 愿意先见面</p></div>
      </div>
      <div class="profile-credit">
        ${icon('shield')}<b>92</b><span>邻里信用 · 信息准确、按时回访</span><span class="credit-meter"><i style="width:92%"></i></span>
      </div>
    </div>
    <div class="profile-body">
      <div class="profile-contribution">
        <div class="profile-contribution-copy"><span class="contribution-kicker">COMMUNITY CONTRIBUTION · 邻里贡献</span><b>${esc(contribution.level)}</b><p>${contribution.reports} 只上报 · ${contribution.adoptions} 只领养 · ${contribution.posts} 篇发帖 · ${contribution.comments} 条评论 · ${contribution.reviews} 条评价</p></div>
        <span class="contribution-total"><b>${contribution.total}</b><span>次真实贡献</span></span>
      </div>
      <div class="profile-stats">
        <button type="button" data-profile-tab="adopted"><b>${adopted.length}</b><span>已领养</span></button>
        <button type="button" data-profile-tab="published"><b>${mine.length}</b><span>我的上报</span></button>
        <button type="button" data-profile-tab="walks"><b>${walkPlaces.length}</b><span>遛猫地点</span></button>
        <button type="button" data-profile-tab="posts"><b>${authored.length}</b><span>我的发帖</span></button>
        <button type="button" data-profile-tab="comments"><b>${comments.length}</b><span>我的评论</span></button>
        <button type="button" data-profile-tab="liked"><b>${liked.length}</b><span>点赞</span></button>
        <button type="button" data-profile-tab="favorites"><b>${favCats.length}</b><span>收藏</span></button>
        <button type="button" data-profile-tab="applications"><b>${state.applications.length}</b><span>领养申请</span></button>
      </div>
      <div class="profile-quick-actions app-profile-quick-actions" aria-label="我的分享快捷入口">
        <button type="button" data-action="add-walk-place">${icon('pin')}<b>分享遛猫地点</b><span>写环境、时段、照片和心得</span></button>
        <button type="button" data-action="compose-companion">${icon('paw')}<b>发起猫友同路</b><span>约在公开地点，不交换住址</span></button>
      </div>
      <div class="profile-tabs">
        ${tabs.map((tab) => `<button type="button" class="${activeTab === tab.id ? 'is-active' : ''}" data-profile-tab="${tab.id}">${tab.label}<span>${tab.count}</span></button>`).join('')}
      </div>
      <div class="profile-list">
        ${content}
      </div>
      <div class="profile-settings">
        <button class="profile-setting" type="button" data-action="add-walk-place">${icon('pin')}分享一个遛猫地点${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-nav="services">${icon('store')}附近好店与遛猫地点${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-action="settings">${icon('shield')}领养信用与实名认证${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-action="settings">${icon('notebook')}领养回访记录${icon('chevron')}</button>
        <button class="profile-setting" type="button" data-action="settings">${icon('settings')}隐私与精确位置${icon('chevron')}</button>
      </div>
      <div class="profile-footer">XIANMAO · 让附近的猫，被附近的人看见</div>
    </div>`;
}

function renderWalkPlaces(list) {
  if (!list.length) return `<div class="profile-empty"><div class="empty-ring">${icon('pin')}</div><h3>还没有分享过遛猫地点</h3><p>把你走过的公共路线、环境细节和错峰时段留给邻居。<br />照片只放公共区域，不拍门牌和陌生人正脸。</p><button type="button" data-action="add-walk-place">分享一个遛猫地点</button></div>`;
  return list.map((place) => {
    const photos = Array.isArray(place.photos) ? place.photos.filter(Boolean) : [];
    return `<button class="profile-place-row" type="button" data-open-service="${place.id}">
      ${photos[0] ? `<img src="${photoSrc(photos[0])}" alt="${esc(place.name)} 的环境照片" />` : `<span class="profile-place-mark">${icon('pin')}</span>`}
      <span class="profile-place-copy"><b>${esc(place.name)}</b><span>${esc(place.address || '位置待补充')} · ${esc(place.hours || '全天开放')}</span><small>${esc(place.details && place.details.environment ? place.details.environment : '环境描述待补充')}</small></span>
      ${icon('chevron')}
    </button>`;
  }).join('');
}

function renderFavorites(favCats) {
  if (!favCats.length) return `<div class="profile-empty"><div class="empty-ring">${icon('heart')}</div><h3>还没有收藏的猫</h3><p>遇到想再想一想的猫，点一下心形。<br />它不会催你，但会在这里等你。</p><button type="button" data-nav="home">去附近看看</button></div>`;
  return favCats.map((cat) => `
    <div class="profile-cat-row">
      <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
      <button class="row-main" type="button" data-open-cat="${cat.id}"><h3>${esc(cat.name)}</h3><p>${esc(cat.breed)} · ${esc(cat.sex)} · ${cat.distance}km</p><span class="row-status ${cat.urgent ? 'is-wait' : ''}">${esc(cat.status)}</span></button>
      <button class="row-heart" type="button" data-fav="${cat.id}" aria-label="取消收藏 ${esc(cat.name)}">${icon('heart')}</button>
    </div>`).join('');
}

function renderMyPosts(list) {
  if (!list.length) return `<div class="profile-empty"><div class="empty-ring">${icon('edit')}</div><h3>还没有发过笔记</h3><p>养猫技巧、找猫经验、一次失败的捕捉，<br />都可以留给下一位邻居。</p><button type="button" data-action="compose">写一条邻里笔记</button></div>`;
  return list.map((post) => `
    <button class="profile-post-row" type="button" data-action="open-article" data-id="${post.id}">
      <span class="profile-row-mark">${post.image ? `<img src="${photoSrc(post.image)}" alt="" />` : icon('edit')}</span>
      <span class="profile-row-main"><span class="profile-row-tag">${esc(post.tag)} · ${esc(post.time)}</span><b>${esc(post.title)}</b><span>${esc(post.excerpt)}</span><span class="profile-row-foot">${icon('heart')}${postLikes(post)} 赞 · ${icon('square')}${postCommentCount(post)} 评论 · ${icon('pin')}${esc(post.place)}</span></span>
    </button>`).join('');
}

function renderMyComments(list) {
  if (!list.length) return `<div class="profile-empty"><div class="empty-ring">${icon('square')}</div><h3>还没有留下评论</h3><p>读到有共鸣的邻里笔记，可以留下一句。<br />评论也会计入你的社区贡献。</p><button type="button" data-nav="community">去广场看看</button></div>`;
  return list.map((comment) => `
    <button class="profile-comment-row" type="button" data-action="open-article" data-id="${comment.post.id}">
      <span class="profile-row-mark">${icon('square')}</span>
      <span class="profile-row-main"><b>${esc(comment.text)}</b><span class="profile-quote">${esc(comment.post.title)}</span><span class="profile-row-foot">${esc(comment.time || '刚刚')} · 来自 ${esc(comment.post.author)}</span></span>
      ${icon('chevron')}
    </button>`).join('');
}

function renderLikedPosts(list) {
  if (!list.length) return `<div class="profile-empty"><div class="empty-ring">${icon('heart')}</div><h3>还没有点赞的笔记</h3><p>点赞表示这条经验对你有用。<br />它会留在这里，方便你之后回看。</p><button type="button" data-nav="community">去广场看看</button></div>`;
  return list.map((post) => `
    <button class="profile-like-row" type="button" data-action="open-article" data-id="${post.id}">
      <span class="profile-row-mark is-heart">${icon('heart')}</span>
      <span class="profile-row-main"><span class="profile-row-tag">${esc(post.tag)}</span><b>${esc(post.title)}</b><span>${esc(post.author)} · ${esc(post.place)} · ${esc(post.time)}</span></span>
      ${icon('chevron')}
    </button>`).join('');
}

function renderApplications() {
  if (!state.applications.length) return `<div class="profile-empty"><div class="empty-ring">${icon('send')}</div><h3>还没有提交申请</h3><p>看到想认真了解的猫，可以提交领养申请。<br />平台会先安排双方见面，不收取任何费用。</p><button type="button" data-nav="home">去看看附近的猫</button></div>`;
  return state.applications.map((app) => {
    const cat = allCats().find((c) => c.id === app.catId);
    if (!cat) return '';
    return `
      <div class="application-row">
        <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
        <button class="row-main" type="button" data-open-cat="${cat.id}"><h3>${esc(cat.name)}</h3><p>${esc(app.time)} · ${esc(app.home)} · ${esc(app.experience)}</p></button>
        <span class="${app.status === '已通过初审' ? 'is-ok' : ''}">${esc(app.status)}</span>
      </div>`;
  }).join('');
}

function renderPublished() {
  const mine = allCats().filter(isMine);
  if (!mine.length) return `<div class="profile-empty"><div class="empty-ring">${icon('paw')}</div><h3>还没有上报记录</h3><p>在附近遇见需要帮助的猫，可以替它留一份档案。<br />通过邻里核验后，会出现在发现和地图里。</p><button type="button" data-nav="publish">上报一只猫</button></div>`;
  return mine.map((cat) => {
    const verified = cat.verification === '已核验';
    return `<div class="profile-cat-row is-published">
      <img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" />
      <button class="row-main" type="button" data-open-cat="${cat.id}">
        <h3>${esc(cat.name)}</h3>
        <p>${esc(cat.breed || '品种待补充')} · ${esc(cat.age || '月龄待补充')} · ${esc(cat.sex || '')}</p>
        <p>${icon('pin')}${esc(cat.area || '位置待补充')} · ${esc(cat.time || '刚刚')}</p>
        <span class="row-status ${verified ? '' : 'is-wait'}">${verified ? '已核验' : '待核验'}</span>
      </button>
      <div class="published-counts"><b>${Number(cat.views || 0)}</b><span>浏览</span><b>${Number(cat.applications || 0)}</b><span>申请</span></div>
    </div>`;
  }).join('');
}

function renderAdoptions(list) {
  if (!list.length) return `<div class="profile-empty"><div class="empty-ring">${icon('home')}</div><h3>还没有接猫回家</h3><p>领养完成后，猫咪档案会出现在这里。<br />可以记录接回日期、回访日期和当前状态。</p><button type="button" data-nav="home">去看看附近的猫</button></div>`;
  return list.map((adoption) => {
    const cat = allCats().find((item) => item.id === adoption.catId) || adoption.cat || {};
    const name = cat.name || adoption.name || '未命名';
    return `<div class="adoption-card">
      <img src="${photoSrc(cat.photo || adoption.photo)}" alt="${esc(name)}" />
      <div class="adoption-copy" ${cat.id ? `data-open-cat="${cat.id}" role="button" tabindex="0"` : ''}>
        <div class="adoption-title"><h3>${esc(name)}</h3><span>${esc(adoption.status || '已接回家')}</span></div>
        <p>${esc(cat.breed || adoption.breed || '品种待补充')} · ${esc(cat.sex || adoption.sex || '性别待补充')} · ${esc(cat.age || adoption.age || '月龄待补充')}</p>
        <div class="adoption-meta"><span>${icon('home')}接回 ${esc(adoption.homeDate || '待补充')}</span><span>${icon('notebook')}回访 ${esc(adoption.revisitDate || '待安排')}</span></div>
      </div>
    </div>`;
  }).join('');
}

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
  const f = state.filters;
  const special = ['全部', '狸花猫', '橘猫', '奶牛猫', '三花猫', '玳瑁猫', '白猫', '黑猫'];
  const common = BREED_FILTERS.filter((item) => special.includes(item));
  const more = BREED_FILTERS.filter((item) => !special.includes(item));
  const breedButton = (value) => `<button class="filter-option ${f.breed === value ? 'is-active' : ''}" type="button" data-filter-key="breed" data-filter-value="${esc(value)}">${esc(value)}</button>`;
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>缩小一点范围</h2><p>条件越少，越容易遇见本来没想到的猫。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭筛选">${icon('close')}</button></div>
      <div class="filter-group">
        <div class="filter-label"><b>品种 / 毛色</b><span>BREED &amp; COAT</span></div>
        <div class="filter-options">${common.map(breedButton).join('')}</div>
        <details class="filter-more"><summary>更多品种与毛色 ${icon('chevron-down')}</summary><div class="filter-options">${more.map(breedButton).join('')}</div></details>
      </div>
      <div class="filter-group">
        <div class="filter-label"><b>月龄 / 年龄</b><span>AGE</span></div>
        <div class="filter-age-grid">${AGE_FILTERS.map((item) => `<button class="filter-age ${f.age === item.value ? 'is-active' : ''}" type="button" data-filter-key="age" data-filter-value="${item.value}"><b>${item.label}</b><small>${item.note}</small></button>`).join('')}</div>
        <p class="filter-hint">${icon('paw')}3 个月前的喂养、驱虫和就医节奏都不同；拿不准时选“不限年龄”，见面再确认。</p>
      </div>
      <div class="filter-group">
        <div class="filter-label"><b>距离</b><span>DISTANCE</span></div>
        <div class="distance-filter">
          <div class="distance-value"><b data-distance-value>${distanceScopeLabel(f)}</b><span data-distance-count>约 ${previewDistanceCount(f.distance)} 只猫</span></div>
          <input type="range" min="${DISTANCE_MIN}" max="${DISTANCE_MAX}" step="0.5" value="${f.distance}" data-distance-range aria-label="按距离筛选猫只" />
          <div class="distance-ticks">${distanceTicks()}</div>
          <button class="distance-citywide ${isCitywide(f) ? 'is-active' : ''}" type="button" data-action="toggle-citywide" aria-pressed="${isCitywide(f) ? 'true' : 'false'}"><span class="distance-citywide-dot"></span><span><b>全城</b><small>不限距离，看看杭州全城待领养的猫</small></span><i>${availableCats().length} 只</i></button>
        </div>
      </div>
      <div class="filter-group">
        <div class="filter-label"><b>性别</b><span>SEX</span></div>
        <div class="filter-options">${['全部', '公', '母'].map((value) => `<button class="filter-option ${f.sex === value ? 'is-active' : ''}" type="button" data-filter-key="sex" data-filter-value="${value}">${value}</button>`).join('')}</div>
      </div>
    </div>
    <div class="filter-actions"><button class="btn" type="button" data-action="clear-filters">重置</button><button class="btn btn-primary" type="button" data-action="apply-filters">看看 <span data-filter-result>${filteredCats().length}</span> 只猫</button></div>`);
  bindDistanceRange();
  syncRangeFill();
}

function previewDistanceCount(km) {
  return availableCats().filter((cat) => distanceMatches(cat, km, state.filters.citywide)).length;
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
    const citywide = $('[data-action="toggle-citywide"]');
    if (label) label.textContent = distanceScopeLabel(state.filters);
    if (count) count.textContent = '约 ' + previewDistanceCount(state.filters.distance) + ' 只猫';
    if (citywide) {
      citywide.classList.remove('is-active');
      citywide.setAttribute('aria-pressed', 'false');
    }
    if (result) result.textContent = filteredCats().length;
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

function catDetail() {
  const cat = selectedCat();
  if (!cat) return;
  const applied = state.applications.some((app) => app.catId === cat.id);
  overlay(`
    <div class="sheet-scroll">
      <div class="detail-hero">
        <img class="hero-photo" src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}，${esc(cat.breed)}" />
        <div class="detail-topbar">
          <button class="round-btn" type="button" data-action="close-overlay" aria-label="返回">${icon('arrow-left')}</button>
          <div class="detail-top-actions">
            <button class="round-btn" type="button" data-action="share-cat" aria-label="分享这只猫">${icon('send')}</button>
            <button class="round-btn ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button>
          </div>
        </div>
      </div>
      <div class="detail-sheet-head">
        <div class="detail-name-row">
          <div class="detail-name">${esc(cat.name)}<small>${esc(cat.english)} · ${esc(cat.areaShort)}</small></div>
          <span class="detail-distance">${cat.distance} km</span>
        </div>
        <div class="detail-tags">
          <span class="detail-tag is-accent">${esc(cat.status)}</span>
          ${cat.healthTags.map((tag) => `<span class="detail-tag">${esc(tag)}</span>`).join('')}
        </div>
        <div class="detail-meta-grid">
          <div><b>${esc(cat.sex)}</b><span>性别</span></div>
          <div><b>${esc(cat.age)}</b><span>年龄</span></div>
          <div><b>${esc(cat.breed)}</b><span>品种</span></div>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-block"><h3>关于它</h3><p>${esc(cat.note)}</p></div>
        <div class="detail-block">
          <h3>健康与照护</h3>
          <div class="detail-facts">
            <div class="fact"><span>绝育</span><b>${esc(cat.sterilization)}</b></div>
            <div class="fact"><span>疫苗</span><b>${esc(cat.vaccine)}</b></div>
            <div class="fact"><span>驱虫</span><b>${esc(cat.deworm)}</b></div>
            <div class="fact"><span>寄养</span><b>${esc(cat.foster)}</b></div>
          </div>
          <p>${esc(cat.healthBadge)}。领养前建议再次与上报人确认近期状态，并预约一次基础体检。</p>
        </div>
        <div class="detail-block">
          <h3>遇见它的地方</h3>
          <div class="location-card"><span class="location-map"></span><div><b>${esc(cat.area)}</b><p>仅显示到街区。为保护猫咪安全，精确位置需与上报人确认后提供。</p></div>${icon('pin')}</div>
        </div>
        <div class="publisher-card">
          <span class="avatar ${cat.urgent ? 'is-orange' : ''}">${esc(cat.reporter.slice(0, 1))}</span>
          <div><b>${esc(cat.reporter)}</b><span>${esc(cat.reporterRole)} · ${esc(cat.time)}</span></div>
          <button class="btn btn-small" type="button" data-action="contact-reporter">${icon('send')}联系</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="icon-btn ${isFav(cat.id) ? 'is-active' : ''}" type="button" data-fav="${cat.id}" aria-label="${isFav(cat.id) ? '取消收藏' : '收藏'}">${icon('heart')}</button>
        <button class="btn ${applied ? 'btn-ghost' : 'btn-primary'}" type="button" data-action="${applied ? 'view-application' : 'apply'}" data-id="${cat.id}" ${applied ? 'disabled' : ''}>${applied ? '申请已提交 · 等待初审' : '申请领养 · 先见面再决定'}</button>
      </div>
    </div>`, true);
}

function applySheet() {
  const cat = selectedCat();
  if (!cat) return;
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>先认真回答几个问题</h2><p>这不是考试，是为了让双方都少一点冲动。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭申请表单">${icon('close')}</button></div>
      <div class="apply-summary"><img src="${photoSrc(cat.photo)}" alt="${esc(cat.name)}" /><div><b>${esc(cat.name)}</b><span>${esc(cat.breed)} · ${esc(cat.sex)} · ${esc(cat.areaShort)}</span></div></div>
      <form class="apply-form" id="applyForm">
        <div class="form-field"><label for="applyName">怎么称呼你</label><input class="input" id="applyName" name="name" placeholder="你的名字或昵称" value="${esc(state.form.name)}" /></div>
        <div class="form-field"><label for="applyPhone">联系方式（仅对上报人可见）</label><input class="input" id="applyPhone" name="phone" type="tel" placeholder="手机号或微信号" value="${esc(state.form.phone)}" /></div>
        <div class="form-row">
          <div class="form-field"><label for="applyHome">居住情况</label><div class="select-wrap"><select class="select" id="applyHome" name="home">${['整租 / 自有住房', '合租（室友同意）', '与家人同住', '其他'].map((v) => `<option ${state.form.home === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
          <div class="form-field"><label for="applyExp">养猫经验</label><div class="select-wrap"><select class="select" id="applyExp" name="experience">${['养过猫', '第一次养猫', '有照顾流浪猫经验', '暂无'].map((v) => `<option ${state.form.experience === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        </div>
        <div class="form-field"><label for="applyReason">为什么想了解它</label><textarea class="textarea" id="applyReason" name="reason" placeholder="说说你的居住环境、每天在家的时间，以及你理解它可能需要多长的适应期。">${esc(state.form.reason)}</textarea></div>
        <label class="check-line"><input type="checkbox" name="agree" ${state.form.agree ? 'checked' : ''} /><span>我理解领养不是购买。愿意接受双方见面、家访或视频回访，不因搬家、怀孕、掉毛等原因随意转送或遗弃。</span></label>
        <div class="form-error" role="alert"></div>
        <button class="btn btn-primary" type="submit">提交申请 · 等待上报人联系</button>
      </form>
    </div>`);
}

function photoPicker() {
  const choices = ['cat-01.jpg', 'cat-03.jpg', 'cat-05.jpg', 'cat-07.jpg', 'cat-10.jpg', 'cat-12.jpg', 'cat-13.jpg', 'cat-15.jpg', 'cat-16.jpg'];
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>添加一张照片</h2><p>从相册选择，或用相机拍一张。上传前会压缩到长边 1000px。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭照片选择">${icon('close')}</button></div>
      <label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="publish" data-slot="${state.photoSlot}" /><span>${icon('camera')}从相册选择 / 拍照</span></label>
      <p class="photo-picker-tip">想先体验，也可以用示例照片。</p>
      <div class="photo-picker-grid">${choices.map((photo) => `<button class="photo-pick ${state.publish.photos.includes(photo) ? 'is-selected' : ''}" type="button" data-pick-photo="${photo}"><img src="${photoSrc(photo)}" alt="候选猫照片" /></button>`).join('')}</div>
    </div>`);
}
function composeSheet() {
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>写一条邻里笔记</h2><p>经验不必完美，真实就够。请隐去精确门牌与个人电话，把判断留给后来的人。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭发布">${icon('close')}</button></div>
      <form class="compose-form" id="composeForm">
        <div class="form-field"><label for="composeTitle">标题</label><input class="input" id="composeTitle" name="title" placeholder="一句话说清楚这条经验" /></div>
        <div class="form-field"><label for="composeBody">正文</label><textarea class="textarea" id="composeBody" name="body" placeholder="发生了什么？你试了什么？哪一步真的有用？"></textarea></div>
        <div class="form-field"><label for="composePlace">发生在哪一带</label><div class="select-wrap"><select class="select" id="composePlace" name="place">${['翠苑二区', '古荡新村', '文三路', '益乐路', '丰潭路', '嘉绿苑', '滨江·长河', '拱墅·小河'].map((v) => `<option>${v}</option>`).join('')}</select></div></div>
        <div class="form-field"><label>放在哪个分类</label><div class="compose-cats">${['捉猫实录', '养猫技巧', '就医体验', '猫咖打卡', '遛猫地点', '猫友同路', '领养回访'].map((tag) => `<button class="chip ${state.composeTag === tag ? 'is-active' : ''}" type="button" data-compose-tag="${tag}">${tag}</button>`).join('')}</div></div>
        <div class="form-field"><label>配一张照片（可选）</label><button class="place-photo-choose ${state.composePhoto ? 'has-photo' : ''}" type="button" data-action="pick-compose-photo">${state.composePhoto ? `<img src="${photoSrc(state.composePhoto)}" alt="" /><span>更换照片</span>` : `${icon('camera')}<span>选一张社区照片</span>`}</button></div>
        <p class="field-help">${icon('shield')}就医、门店和地点类内容只陈述亲历，不替医院、门店或地点下结论；具体判断留给读到的人。</p>
        <div class="form-error" role="alert"></div>
        <div class="compose-actions"><button class="btn" type="button" data-action="close-overlay">先不写</button><button class="btn btn-primary" type="submit">${icon('send')}发布</button></div>
      </form>
    </div>`);
}

function companionSheet() {
  state.composeTag = '猫友同路';
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>找猫友同路</h2><p>先约在公开、人少的遛猫地点。第一次见面先用推车或背包，让两只猫隔着距离观察，不交换住址和私人电话。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭猫友同路表单">${icon('close')}</button></div>
      <form class="compose-form" id="companionForm">
        <input type="hidden" name="tag" value="猫友同路" />
        <div class="form-field"><label for="companionTitle">想找什么样的散步搭子</label><input class="input" id="companionTitle" name="title" placeholder="比如：想找一只不怕推车、节奏慢的猫，周末早上沿河走" /></div>
        <div class="form-field"><label for="companionBody">介绍一下自家猫和希望遇到的情况</label><textarea class="textarea" id="companionBody" name="body" placeholder="猫的年龄、性格、适应程度；希望对方猫的性格、体型、第一次见面怎么安排；想约的时段和大致路线。"></textarea></div>
        <div class="form-row">
          <div class="form-field"><label for="companionSpot">公开见面地点</label><div class="select-wrap"><select class="select" id="companionSpot" name="place">${PLACE_SPOTS.map((spot) => `<option value="${esc(spot.label.split(' · ')[0])}">${esc(spot.label)}</option>`).join('')}</select></div></div>
          <div class="form-field"><label for="companionTime">适合时段</label><input class="input" id="companionTime" name="time" placeholder="比如：周六 08:30 前后" /></div>
        </div>
        <div class="form-field"><label for="companionCat">自家猫的性格与适应程度</label><select class="select" id="companionCat" name="cat"><option>已习惯牵绳，能保持距离</option><option>还在推车适应期，先远距离看看</option><option>不怕狗，但对陌生猫谨慎</option><option>第一次出门，只做短时间观察</option></select></div>
        <div class="form-field"><label for="companionWant">希望遇到的猫</label><select class="select" id="companionWant" name="want"><option>性格稳定、不主动追猫</option><option>同样在推车或背包里观察</option><option>已绝育、疫苗齐全</option><option>不急，先线上聊清楚再约</option></select></div>
        <label class="check-line"><input type="checkbox" name="safe" /><span>我理解这是公开地点见面，不交换精确住址和私人电话；如猫出现应激、抢占地盘或身体不适，会立刻结束。</span></label>
        <div class="form-error" role="alert"></div>
        <div class="compose-actions"><button class="btn" type="button" data-action="close-overlay">先不约</button><button class="btn btn-primary" type="submit">${icon('send')}发布同路邀请</button></div>
      </form>
    </div>`);
}

function articleView(post) {
  if (!post) return;
  overlay(`
    <div class="sheet-scroll">
      <div class="detail-topbar" style="position:sticky;top:0;background:rgba(242,237,224,.93);backdrop-filter:blur(10px);z-index:5;padding:12px 16px">
        <button class="round-btn" type="button" data-action="close-overlay" aria-label="返回广场">${icon('arrow-left')}</button>
        <div class="detail-top-actions"><button class="round-btn" type="button" data-action="share-cat" aria-label="分享这篇笔记">${icon('send')}</button></div>
      </div>
      ${post.image ? `<img class="article-cover" src="${photoSrc(post.image)}" alt="${esc(post.title)}" />` : ''}
      <div class="article-head">
        <span class="article-tag">${esc(post.tag)}</span>
        <h1>${esc(post.title)}</h1>
        <div class="article-byline">${contributorAvatar(post.author, post.avatar, post.tone)}<div><b>${esc(post.author)}</b><span>${esc(post.place)} · ${esc(post.time)}</span><small class="contributor-line">${contributorBadge(post.author, true)}</small></div><span class="article-date">FIELD NOTE</span></div>
      </div>
      <div class="article-body">${post.body}</div>
      <div class="article-foot"><span>${postLikes(post)} 人觉得有用</span><button class="btn btn-small ${isLiked(post) ? 'is-liked' : ''}" type="button" data-action="like-post" data-id="${post.id}">${icon('heart')}${isLiked(post) ? '已点赞' : '点赞这条经验'}</button></div>
      ${post.tag === '猫友同路' ? `<button class="companion-join" type="button" data-action="join-companion" data-id="${post.id}">${icon('paw')}想同路，先在公开地点见一面</button>` : ''}
      <div class="comments"><h3>邻里回应 · ${postCommentCount(post)}</h3>${(post.commentsList || []).map((comment) => `<div class="comment">${contributorAvatar(comment.name, comment.name.slice(0, 1))}<p><b>${esc(comment.name)}</b>${esc(comment.text)}<span class="comment-badge">${contributorBadge(comment.name, true)}</span></p></div>`).join('')}
        <form class="comment-form" id="commentForm" data-post-id="${post.id}">
          <div class="comment-identity">${contributorAvatar('林小满', '林')}<span>以 <b>林小满</b> 回应 ${contributorBadge('林小满', true)}</span></div>
          <div class="comment-input-row"><input class="input" id="commentText" name="text" placeholder="写一句有用的回应..." autocomplete="off" /><button class="btn btn-primary btn-small" type="submit">${icon('send')}发送</button></div>
          <div class="form-error" role="alert"></div>
        </form>
      </div>
    </div>`, true);
}

function reviewSheet(service) {
  if (!service) return;
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>分享一次真实体验</h2><p>${esc(service.name)} · 评价会公开，商家可回复但不能删除，不同体验都会被保留。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭评价">${icon('close')}</button></div>
      <form class="apply-form" id="reviewForm">
        <div class="form-field"><label>你给几颗星</label><div class="review-form-stars">${[1,2,3,4,5].map((n) => `<button type="button" class="${n <= state.reviewStars ? 'is-on' : ''}" data-review-star="${n}" aria-label="${n} 星">${icon('star')}</button>`).join('')}</div></div>
        <div class="form-field"><label for="reviewText">具体说说</label><textarea class="textarea" id="reviewText" name="text" placeholder="什么让你觉得好？有什么需要提醒后来的人？"></textarea></div>
        <div class="form-row"><div class="form-field"><label for="reviewGood">最值得肯定</label><select class="select" id="reviewGood" name="good">${['对猫温柔', '不推销', '价格透明', '环境干净', '适合新手'].map((v) => `<option>${v}</option>`).join('')}</select></div><div class="form-field"><label for="reviewBad">需要提醒</label><select class="select" id="reviewBad" name="bad">${['没有', '周末人多', '等位较久', '停车不便', '价格偏高'].map((v) => `<option>${v}</option>`).join('')}</select></div></div>
        <div class="review-identity">${contributorAvatar('林小满', '林')}<div><b>林小满</b><span>${contributorBadge('林小满', true)}</span></div><small>评价会显示你的实名与社区贡献</small></div>
        <div class="form-error" role="alert"></div>
        <button class="btn btn-primary" type="submit">${icon('send')}发布评价</button>
      </form>
    </div>`);
}

function placeDraftFromForm() {
  const form = $('#placeForm');
  if (!form) return null;
  const data = new FormData(form);
  return {
    id: String(data.get('placeId') || ''),
    name: String(data.get('name') || ''),
    area: String(data.get('area') || ''),
    environment: String(data.get('environment') || ''),
    advice: String(data.get('advice') || ''),
    experience: String(data.get('experience') || ''),
    hours: String(data.get('hours') || ''),
    spot: String(data.get('spot') || state.placeSpot || ''),
    photos: state.placePhotos.slice()
  };
}

function placeSheet(service, draftOverride) {
  const place = service || null;
  const isEdit = Boolean(place && place.type === '遛猫的地方' && place.submittedBy === '林小满');
  const savedDraft = draftOverride || state.placeDraft;
  const sameDraft = savedDraft && String(savedDraft.id || '') === String(place ? place.id : '');
  const draft = sameDraft ? savedDraft : null;
  if (draft && draft.spot) state.placeSpot = draft.spot;
  const photos = draft && Array.isArray(draft.photos) ? draft.photos : (place && Array.isArray(place.photos) ? place.photos : []);
  state.placePhotos = [0, 1, 2].map((index) => photos[index] || '');
  state.placeDraft = { ...(draft || {}), id: place ? place.id : '', photos: state.placePhotos.slice() };
  state.placeSpot = place && place.spot ? place.spot : state.placeSpot;
  const field = (key, fallback = '') => esc(draft && draft[key] !== undefined ? draft[key] : fallback);
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>${isEdit ? '补充遛猫地点' : '分享一个遛猫地点'}</h2><p>写下你亲自走过的路线和环境。具体判断留给后来的人，不替地点下结论。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭地点表单">${icon('close')}</button></div>
      <form class="place-form" id="placeForm" data-id="${place ? esc(place.id) : ''}">
        <input type="hidden" name="placeId" value="${place ? esc(place.id) : ''}" />
        <div class="form-row">
          <div class="form-field"><label for="placeName">地点名</label><input class="input" id="placeName" name="name" placeholder="比如：丰潭路沿河绿道" value="${field('name', place ? place.name : '')}" /></div>
          <div class="form-field"><label for="placeArea">所在区域</label><input class="input" id="placeArea" name="area" placeholder="比如：丰潭路 · 河岸边" value="${field('area', place ? (place.address || place.area || '') : '')}" /></div>
        </div>
        <div class="form-field"><label for="placeEnvironment">环境描述</label><textarea class="textarea" id="placeEnvironment" name="environment" placeholder="路面是否平整？有没有树荫、长椅、水源？人多不多？">${field('environment', place && place.details ? (place.details.environment || '') : '')}</textarea></div>
        <div class="form-field"><label for="placeAdvice">优点、适合谁，以及要提醒的时段</label><textarea class="textarea" id="placeAdvice" name="advice" placeholder="比如：适合已经习惯牵绳的猫；傍晚遛狗的人多，建议错峰；第一次出门先用推车。">${field('advice', place && place.details ? (place.details.advice || '') : '')}</textarea></div>
        <div class="form-field"><label for="placeExperience">你的遛猫心得（可选）</label><textarea class="textarea" id="placeExperience" name="experience" placeholder="第一次带猫来是什么反应？哪一段最好走？有什么只有走过才知道的细节？">${field('experience', place && place.details ? (place.details.experience || '') : '')}</textarea></div>
        <div class="form-row">
          <div class="form-field"><label for="placeHours">适合时段</label><input class="input" id="placeHours" name="hours" placeholder="比如：全天开放 · 建议傍晚" value="${field('hours', place ? place.hours : '')}" /></div>
          <div class="form-field"><label for="placeSpot">地图落点</label><div class="select-wrap"><select class="select" id="placeSpot" name="spot">${PLACE_SPOTS.map((spot) => `<option value="${spot.id}" ${(draft && draft.spot ? draft.spot : (place ? place.spot : state.placeSpot)) === spot.id ? 'selected' : ''}>${esc(spot.label)}</option>`).join('')}</select></div></div>
        </div>
        <div class="form-field"><label>环境照片（可选，最多 3 张）</label><div class="place-photo-line">${[0,1,2].map((index) => { const photo = state.placePhotos[index]; return `<button type="button" class="place-photo ${photo ? 'has-photo' : ''}" data-place-photo="${index}">${photo ? `<img src="${photoSrc(photo)}" alt="" />` : `${icon('camera')}<span>${index === 0 ? '主图' : '补充'}</span>`}</button>`; }).join('')}</div><p class="field-help">${icon('image')}只放公共环境照片，不要拍到具体住户门牌或陌生人正脸。</p></div>
        <label class="check-line"><input type="checkbox" name="truth" ${draft ? (draft.truth !== false ? 'checked' : '') : (place ? 'checked' : '')} /><span>我确认这是自己实际走过的公共区域，愿意让邻里补充不同体验。</span></label>
        <div class="form-error" role="alert"></div>
        <div class="compose-actions"><button class="btn" type="button" data-action="close-overlay">先不分享</button><button class="btn btn-primary" type="submit">${icon('send')}${isEdit ? '保存地点信息' : '发布遛猫地点'}</button></div>
      </form>
    </div>`);
}

function successSheet(kind) {
  const isPublish = kind === 'publish';
  const title = isPublish ? '已经替它留了名。' : '申请已经送到。';
  const copy = isPublish ? '上报进入邻里核验。通过后会出现在附近发现与地图中。谢谢你没有只是路过。' : '上报人会在 48 小时内联系你。先约一次见面，不急着把猫带回家。';
  overlay(`
    <div class="success-wrap">
      <div class="success-backdrop"></div>
      <div class="success-card">
        <div class="success-seal">${icon(isPublish ? 'paw' : 'send')}</div>
        <h2>${title}</h2>
        <p>${copy}</p>
        <div class="success-actions">
          <button class="btn" type="button" data-action="${isPublish ? 'back-home' : 'close-overlay'}">${isPublish ? '回到附近' : '继续看看'}</button>
          <button class="btn btn-primary" type="button" data-action="${isPublish ? 'view-published' : 'go-profile'}">${isPublish ? '看我上报的' : '查看我的申请'}</button>
        </div>
        <div class="success-meta"><span>NO PAYMENT</span><span>NO RESELL</span><span>MEET FIRST</span></div>
      </div>
    </div>`);
}

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

function render() {
  const view = $('#view');
  if (!view) return;
  const pages = {
    home: renderHome,
    map: renderMap,
    publish: renderPublish,
    community: renderCommunity,
    profile: renderProfile,
    services: renderServices,
    serviceDetail: renderServiceDetail
  };
  const page = pages[state.nav] || renderHome;
  view.innerHTML = page();
  const hideTab = state.nav === 'services' || state.nav === 'serviceDetail';
  $('#tabbar').style.display = hideTab ? 'none' : 'grid';
  view.style.paddingBottom = hideTab ? '0' : '102px';
  if (state.nav === 'home') {
    const search = $('#searchInput');
    if (search) {
      search.addEventListener('input', (event) => {
        state.query = event.target.value;
        renderHomeList();
      });
    }
  }
  syncNav();
  view.scrollTop = 0;
}

function renderHomeList() {
  const grid = $('#catGrid');
  if (!grid) return;
  const list = filteredCats();
  grid.innerHTML = list.length ? list.map((cat, index) => catCard(cat, index)).join('') : emptyCats();
  const count = $('.home-hero .count');
  if (count) count.textContent = String(list.length);
  const result = $('.result-count');
  if (result) result.textContent = `${list.length} / ${availableCats().length} 只`;
}

function rerenderKeepScroll() {
  const view = $('#view');
  const top = view ? view.scrollTop : 0;
  render();
  if (view) view.scrollTop = top;
}

function toggleFav(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
  } else {
    state.favorites.push(id);
  }
  persist();
  const cat = allCats().find((item) => item.id === id);
  toast(state.favorites.includes(id) ? `已收藏${cat ? cat.name : ''}，稍后再来看看` : '已取消收藏');
  if (state.selectedCat) {
    catDetail();
  } else {
    rerenderKeepScroll();
  }
}

function openCat(id) {
  state.selectedCat = id;
  catDetail();
}

function toggleLike(id) {
  if (state.likedPosts.includes(id)) {
    state.likedPosts = state.likedPosts.filter((item) => item !== id);
    toast('已取消点赞');
  } else {
    state.likedPosts = state.likedPosts.concat(id);
    toast('已点赞，可在「我的 · 点赞」回看');
  }
  persist();
  if (state.nav === 'community') rerenderKeepScroll();
  if ($('#overlayRoot .sheet-full')) {
    const post = postById(id);
    if (post) articleView(post);
  }
}

function openArticle(id) {
  const post = postById(id);
  if (post) articleView(post);
}

function pickPlacePhoto(index) {
  const current = state.placePhotos[index] || '';
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>添加环境照片</h2><p>从相册选择，或用相机拍一张。上传前会压缩到长边 1000px；只放公共区域，不拍门牌和陌生人正脸。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭照片选择">${icon('close')}</button></div>
      <label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="place" data-slot="${index}" /><span>${icon('camera')}从相册选择 / 拍照</span></label>
      <p class="photo-picker-tip">想先体验，也可以用示例照片。</p>
      <div class="photo-picker-grid">${PLACE_PHOTO_SAMPLES.map((photo) => `<button class="photo-pick ${current === photo ? 'is-selected' : ''}" type="button" data-choose-place-photo="${photo}" data-slot="${index}"><img src="${photoSrc(photo)}" alt="候选环境照片" /></button>`).join('')}</div>
    </div>`);
}


document.addEventListener('click', (event) => {
  const fav = event.target.closest('[data-fav]');
  if (fav) {
    event.preventDefault();
    event.stopPropagation();
    toggleFav(fav.dataset.fav);
    return;
  }
  const open = event.target.closest('[data-open-cat]');
  if (open) {
    event.preventDefault();
    openCat(open.dataset.openCat);
    return;
  }
  const nav = event.target.closest('[data-nav]');
  if (nav && !nav.closest('#overlayRoot')) {
    event.preventDefault();
    go(nav.dataset.nav);
    return;
  }
  const quick = event.target.closest('[data-quick]');
  if (quick) {
    state.quick = quick.dataset.quick;
    render();
    return;
  }
  const filter = event.target.closest('[data-filter-key]');
  if (filter) {
    state.filters[filter.dataset.filterKey] = filter.dataset.filterValue;
    filterSheet();
    return;
  }
  const mapPin = event.target.closest('[data-map-cat]');
  if (mapPin) {
    state.mapSelected = mapPin.dataset.mapCat;
    render();
    return;
  }
  const communityFilter = event.target.closest('[data-community-filter]');
  if (communityFilter) {
    state.communityFilter = communityFilter.dataset.communityFilter;
    render();
    return;
  }
  const serviceFilter = event.target.closest('[data-service-filter]');
  if (serviceFilter) {
    state.servicesFilter = serviceFilter.dataset.serviceFilter;
    render();
    return;
  }
  const service = event.target.closest('[data-open-service]');
  if (service) {
    state.reviewService = service.dataset.openService;
    state.nav = 'serviceDetail';
    render();
    return;
  }
  const profileTab = event.target.closest('[data-profile-tab]');
  if (profileTab) {
    state.profileTab = profileTab.dataset.profileTab;
    render();
    return;
  }
  const seg = event.target.closest('[data-pub-seg]');
  if (seg) {
    state.publish[seg.dataset.pubSeg] = seg.dataset.value;
    render();
    return;
  }
  const uploadAction = event.target.closest('[data-action="upload-photo"]');
  if (uploadAction) {
    openUploadPicker(uploadAction.dataset.target || 'publish', Number(uploadAction.dataset.slot || 0));
    return;
  }
  const photo = event.target.closest('[data-pick-photo]');
  if (photo) {
    const chosen = photo.dataset.pickPhoto;
    if (!state.publish.photos.includes(chosen)) {
      state.publish.photos = state.publish.photos.concat(chosen).slice(0, 3);
    }
    closeOverlay();
    render();
    return;
  }
  const composeTag = event.target.closest('[data-compose-tag]');
  if (composeTag) {
    const wrap = composeTag.parentElement;
    Array.from(wrap.children).forEach((btn) => btn.classList.remove('is-active'));
    composeTag.classList.add('is-active');
    state.composeTag = composeTag.dataset.composeTag;
    return;
  }
  const placePhoto = event.target.closest('[data-place-photo]');
  if (placePhoto) {
    state.placeDraft = placeDraftFromForm() || state.placeDraft;
    pickPlacePhoto(Number(placePhoto.dataset.placePhoto));
    return;
  }
  const overlayService = event.target.closest('#overlayRoot [data-open-service]');
  if (overlayService) {
    state.reviewService = overlayService.dataset.openService;
    state.nav = 'serviceDetail';
    closeOverlay();
    render();
    return;
  }
  const chosenPlacePhoto = event.target.closest('[data-choose-place-photo]');
  if (chosenPlacePhoto) {
    const draft = placeDraftFromForm() || state.placeDraft || { id: '' };
    const photos = Array.isArray(draft.photos) ? draft.photos.slice() : state.placePhotos.slice();
    while (photos.length < 3) photos.push('');
    photos[Number(chosenPlacePhoto.dataset.slot)] = chosenPlacePhoto.dataset.choosePlacePhoto;
    state.placePhotos = photos;
    if (draft.spot) state.placeSpot = draft.spot;
    state.placeDraft = { ...draft, spot: draft.spot || state.placeSpot, photos, truth: true };
    placeSheet(state.placeDraft.id ? allServices().find((item) => item.id === state.placeDraft.id) : null, state.placeDraft);
    return;
  }
  const chosenComposePhoto = event.target.closest('[data-pick-compose-photo]');
  if (chosenComposePhoto) {
    state.composePhoto = chosenComposePhoto.dataset.pickComposePhoto;
    composeSheet();
    return;
  }
  const reviewStar = event.target.closest('[data-review-star]');
  if (reviewStar) {
    state.reviewStars = Number(reviewStar.dataset.reviewStar);
    const buttons = Array.from(reviewStar.parentElement.children);
    buttons.forEach((btn, index) => btn.classList.toggle('is-on', index < state.reviewStars));
    return;
  }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  event.preventDefault();
  const name = action.dataset.action;
  if (name === 'close-overlay') { closeOverlay(); return; }
  if (name === 'filters') { filterSheet(); return; }
  if (name === 'apply-filters') { closeOverlay(); render(); toast('筛选已更新'); return; }
  if (name === 'clear-filters') {
    state.filters = { breed: '全部', age: '全部', sex: '全部', distance: DISTANCE_DEFAULT, citywide: false };
    state.quick = '全部';
    closeOverlay();
    render();
    toast('已清空筛选');
    return;
  }
  if (name === 'toggle-citywide') {
    state.filters.citywide = !isCitywide();
    const scrollTop = $('.sheet-scroll')?.scrollTop || 0;
    filterSheet();
    const scroller = $('.sheet-scroll');
    if (scroller) scroller.scrollTop = scrollTop;
    return;
  }
  if (name === 'all-cats') {
    state.quick = '全部';
    state.query = '';
    render();
    const grid = $('#catGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (name === 'open-article') {
    openArticle(action.dataset.id);
    return;
  }
  if (name === 'like-post') {
    toggleLike(action.dataset.id);
    return;
  }
  if (name === 'compose') { composeSheet(); return; }
  if (name === 'compose-companion') { companionSheet(); return; }
  if (name === 'join-companion') {
    const post = postById(action.dataset.id);
    if (!post) return;
    state.composeTag = '猫友同路';
    const draft = `想一起走走。我家猫的情况是：\n\n方便的时间：\n\n先在 ${post.place || '公开地点'} 见一面，可以吗？`;
    overlay(`<div class="sheet-handle"></div><div class="sheet-scroll"><div class="sheet-head"><div><h2>先打个招呼</h2><p>不用交换住址和电话。先约公开地点，用推车或背包让猫隔着距离观察。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭">${icon('close')}</button></div><form class="compose-form" id="commentForm" data-post-id="${esc(post.id)}"><div class="form-field"><label for="commentText">回应这条同路邀请</label><textarea class="textarea" id="commentText" name="text">${esc(draft)}</textarea></div><div class="form-error" role="alert"></div><div class="compose-actions"><button class="btn" type="button" data-action="close-overlay">先不约</button><button class="btn btn-primary" type="submit">${icon('send')}发到回应里</button></div></form></div>`);
    return;
  }
  if (name === 'add-walk-place') { placeSheet(null); return; }
  if (name === 'edit-walk-place') { placeSheet(allServices().find((service) => service.id === action.dataset.id)); return; }
  if (name === 'pick-compose-photo') {
    overlay(`<div class="sheet-handle"></div><div class="sheet-scroll"><div class="sheet-head"><div><h2>添加一张照片</h2><p>从相册选择，或用相机拍一张。上传前会压缩到长边 1000px。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭照片选择">${icon('close')}</button></div><label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="compose" data-slot="0" /><span>${icon('camera')}从相册选择 / 拍照</span></label><p class="photo-picker-tip">想先体验，也可以用示例照片。</p><div class="photo-picker-grid">${PLACE_PHOTO_SAMPLES.map((photo) => `<button class="photo-pick ${state.composePhoto === photo ? 'is-selected' : ''}" type="button" data-pick-compose-photo="${photo}"><img src="${photoSrc(photo)}" alt="候选帖子照片" /></button>`).join('')}</div></div>`);
    return;
  }

  if (name === 'pick-photo') { photoPicker(); return; }
  if (name === 'upload-photo') { openUploadPicker(action.dataset.target || 'publish', Number(action.dataset.slot || 0)); return; }
  if (name === 'toggle-pub') {
    state.publish[action.dataset.key] = !state.publish[action.dataset.key];
    render();
    return;
  }
  if (name === 'apply') { state.selectedCat = action.dataset.id; applySheet(); return; }
  if (name === 'close-map-card') { state.mapSelected = null; render(); return; }
  if (name === 'back-home') { closeOverlay(); go('home'); return; }
  if (name === 'back-services') { state.nav = 'services'; render(); return; }
  if (name === 'write-review') { reviewSheet(allServices().find((s) => s.id === action.dataset.id)); return; }
  if (name === 'notice') { infoSheet('notice'); return; }
  if (name === 'location') { infoSheet('location'); return; }
  if (name === 'map-howto') { infoSheet('howto'); return; }
  if (name === 'settings') { infoSheet('settings'); return; }
  if (name === 'share-cat') { toast('链接已复制，可分享给邻居'); return; }
  if (name === 'contact-reporter') { toast('已向上报人发送联系请求'); return; }
  if (name === 'view-application') { toast('申请已提交，正在等待初审'); return; }
  if (name === 'view-published') { closeOverlay(); state.profileTab = 'published'; go('profile'); return; }
  if (name === 'go-profile') { closeOverlay(); state.profileTab = 'applications'; go('profile'); return; }
  if (name === 'share-service') { toast('已复制这家店的分享链接'); return; }
  if (name === 'search-community') { toast('在原型里试试上方的分类筛选'); return; }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id === 'applyForm') {
    event.preventDefault();
    const data = new FormData(form);
    const error = $('.form-error', form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const reason = String(data.get('reason') || '').trim();
    if (!name || !phone || !reason) {
      if (error) error.textContent = '请把称呼、联系方式和申请理由填完整。';
      return;
    }
    if (!data.get('agree')) {
      if (error) error.textContent = '请先确认你理解领养不是购买，并愿意接受回访。';
      return;
    }
    state.form = { name, phone, home: String(data.get('home') || ''), experience: String(data.get('experience') || ''), reason, agree: true };
    const cat = selectedCat();
    state.applications = state.applications.concat({ catId: cat.id, time: '刚刚', home: state.form.home, experience: state.form.experience, status: '等待初审' });
    persist();
    closeOverlay();
    successSheet('apply');
    return;
  }
  if (form.id === 'publishForm') {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const area = String(data.get('area') || '').trim();
    if (!state.publish.photos.length) { toast('先给猫选一张照片吧'); return; }
    if (!name) { toast('给它一个称呼，方便邻里辨认'); $('#pubName')?.focus(); return; }
    if (!area) { toast('请填一个大致位置，不需要门牌号'); $('#pubArea')?.focus(); return; }
    const ageMonths = state.publish.age === '0–1 个月' ? 0.5 : state.publish.age === '1–3 个月' ? 2 : state.publish.age === '3–12 个月' ? 7 : state.publish.age === '1–3 岁' ? 24 : state.publish.age === '3 岁以上' ? 48 : 0;
    const newCat = {
      id: 'pub-' + Date.now(), name, english: 'NEW NEIGHBOR', age: state.publish.age === '不确定' ? '年龄未知' : state.publish.age, ageMonths, ageGroup: ageMonths < 12 ? '幼年' : '成年', sex: state.publish.sex,
      breed: state.publish.breed, color: '待补充', distance: 0.6, area, areaShort: area.split('·')[0].trim(), status: '邻里上报', urgent: true, photo: state.publish.photos[0],
      healthTags: [state.publish.sterilized ? '疑似绝育' : '未绝育', state.publish.friendly ? '亲人' : '怕生', '待核验'],
      traits: ['待补充'], note: state.publish.note || '邻里刚刚上报，更多信息还在补充中。',
      reporter: '林小满', reporterRole: '翠苑二区 · 已实名', time: '刚刚', lat: 48 + Math.random() * 12, lng: 30 + Math.random() * 24,
      verification: '待核验', views: 0, applications: 0, reportedAt: new Date().toISOString(),
      healthBadge: '等待邻里核验', sterilization: state.publish.sterilized ? '疑似已绝育' : '未绝育', vaccine: '未知', deworm: '未知', foster: '待确认'
    };
    state.publishedCats = state.publishedCats.concat(newCat);
    persist();
    state.publish = { name: '', breed: '中华田园猫', age: '1–3 个月', sex: '公', area: '', note: '', photos: [], sterilized: true, friendly: true };
    successSheet('publish');
    return;
  }
  if (form.id === 'composeForm') {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    if (!title || !body) { const err = $('.form-error', form); if (err) err.textContent = '标题和正文都写一点吧。'; return; }
    const tag = state.composeTag || '捉猫实录';
    const tagClass = tag === '捉猫实录' ? 'is-trap' : tag === '就医体验' ? 'is-pit' : tag === '猫咖打卡' ? 'is-checkin' : tag === '遛猫地点' ? 'is-walk' : tag === '猫友同路' ? 'is-companion' : '';
    state.savedPosts.unshift({ id: 'p' + Date.now(), author: '林小满', avatar: '林', tone: '', time: '刚刚', place: String(data.get('place') || '翠苑二区'), tag, tagClass, title, excerpt: body.slice(0, 70), likes: 0, comments: 0, image: state.composePhoto || '', featured: false, body: '<p>' + esc(body).replace(/\n/g, '<br />') + '</p>', commentsList: [] });
    state.composePhoto = null;
    persist();
    closeOverlay();
    state.communityFilter = '全部';
    go('community');
    toast('已发布到广场，可以在「我的 · 我的发帖」找到');
    return;
  }
  if (form.id === 'companionForm') {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    const place = String(data.get('place') || '翠苑街道').trim();
    const time = String(data.get('time') || '').trim();
    const cat = String(data.get('cat') || '').trim();
    const want = String(data.get('want') || '').trim();
    const error = $('.form-error', form);
    if (!title || !body) { if (error) error.textContent = '写清楚想找什么样的搭子，以及自家猫的适应程度。'; return; }
    if (!data.get('safe')) { if (error) error.textContent = '请先确认公开地点见面和猫的应激边界。'; return; }
    state.savedPosts.unshift({ id: 'p' + Date.now(), author: '林小满', avatar: '林', tone: '', time: '刚刚', place, tag: '猫友同路', tagClass: 'is-companion', title, excerpt: body.slice(0, 70), likes: 0, comments: 0, image: '', featured: false, body: '<p>' + esc(body).replace(/\n/g, '<br />') + '</p><p class="companion-meta">见面地点：' + esc(place) + (time ? ' · ' + esc(time) : '') + '<br />自家猫：' + esc(cat) + '<br />希望遇到：' + esc(want) + '</p>', commentsList: [] });
    persist();
    closeOverlay();
    state.communityFilter = '猫友同路';
    go('community');
    toast('同路邀请已发布，记得先在公开地点见一面');
    return;
  }
  if (form.id === 'commentForm') {
    event.preventDefault();
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    const error = $('.form-error', form);
    if (!text) { if (error) error.textContent = '写一句回应再发吧。'; return; }
    const post = postById(form.dataset.postId);
    if (!post) return;
    post.commentsList = (post.commentsList || []).concat({ name: '林小满', text, time: '刚刚' });
    post.comments = post.commentsList.length;
    const savedIndex = state.savedPosts.findIndex((item) => item.id === post.id);
    if (savedIndex >= 0) state.savedPosts[savedIndex] = { ...state.savedPosts[savedIndex], ...post };
    else state.savedPosts.push({ ...post });
    persist();
    articleView(post);
    toast('回应已发出，会计入你的社区贡献');
    return;
  }
  if (form.id === 'placeForm') {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const area = String(data.get('area') || '').trim();
    const environment = String(data.get('environment') || '').trim();
    const advice = String(data.get('advice') || '').trim();
    const experience = String(data.get('experience') || '').trim();
    const hours = String(data.get('hours') || '').trim() || '全天开放';
    const error = $('.form-error', form);
    if (!name || !area) { if (error) error.textContent = '至少写清地点名和所在区域。'; return; }
    if (!environment || !advice) { if (error) error.textContent = '补一句环境描述和适合/提醒，别人才能判断要不要去。'; return; }
    if (!data.get('truth')) { if (error) error.textContent = '请确认这是你自己实际走过的公共区域。'; return; }
    const spot = PLACE_SPOTS.find((item) => item.id === String(data.get('spot') || '')) || PLACE_SPOTS[0];
    const existing = allServices().find((item) => item.id === form.dataset.id);
    const photos = state.placePhotos.filter(Boolean).slice(0, 3);
    state.placeDraft = null;
    const place = {
      id: existing ? existing.id : 'walk-' + Date.now(), name, type: '遛猫的地方', icon: 'i-tree', markClass: 'is-walk',
      rating: existing ? existing.rating : 5, count: existing ? existing.count : 1,
      sub: environment.slice(0, 28) || '邻里补充的遛猫路线',
      tags: advice.split(/[，。；、\n]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 3),
      distance: existing ? existing.distance : 0.8, hours, address: area, price: '免费', phone: existing ? existing.phone : '',
      note: environment, spot: spot.id, photos, details: { environment, advice, experience }, submittedBy: '林小满',
      reviews: existing ? existing.reviews : [{ name: '林小满', avatar: '林', tone: '', stars: 5, time: '刚刚', text: advice, tags: ['邻里实走'], photos }]
    };
    const savedIndex = state.savedPlaces.findIndex((item) => item.id === place.id);
    if (savedIndex >= 0) state.savedPlaces[savedIndex] = place;
    else state.savedPlaces.unshift(place);
    state.placePhotos = [];
    persist();
    closeOverlay();
    state.reviewService = place.id;
    state.nav = 'serviceDetail';
    render();
    toast(existing ? '地点信息已更新' : '遛猫地点已收录，感谢你替邻居探路');
    return;
  }
  if (form.id === 'reviewForm') {
    event.preventDefault();
    const data = new FormData(form);
    const text = String(data.get('text') || '').trim();
    if (!text) { const err = $('.form-error', form); if (err) err.textContent = '写一句真实感受吧。'; return; }
    const service = allServices().find((s) => s.id === state.reviewService);
    if (service) {
      service.reviews.unshift({ name: '林小满', avatar: '林', tone: '', stars: state.reviewStars, time: '刚刚', text, tags: [String(data.get('good') || '')].filter(Boolean) });
      service.count += 1;
      const savedIndex = state.savedPlaces.findIndex((item) => item.id === service.id);
      if (savedIndex >= 0) state.savedPlaces[savedIndex] = { ...state.savedPlaces[savedIndex], ...service };
      else state.savedPlaces.push({ ...service });
    }
    persist();
    state.reviewService = service ? service.id : state.reviewService;
    closeOverlay();
    state.nav = service ? 'serviceDetail' : 'services';
    render();
    toast('评价已发布，谢谢你留下真实体验');
    return;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeOverlay();
});

loadState();
render();

window.xianmao = {
  state,
  cats: allCats,
  reset() { localStorage.removeItem(STORE_KEY); location.reload(); },
  go
};



