import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('econolearn.db');

db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      chapter_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      simple_explanation TEXT,
      category TEXT NOT NULL,
      difficulty INTEGER,
      order_num INTEGER NOT NULL,
      related_charts TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      status TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, chapter_id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, chapter_id)
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_category ON chapters(category);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
  `);

  initSampleChapters();
}

function initSampleChapters() {
  const sampleChapters = [
    {
      chapter_id: 'supply-demand',
      title: '供需理论',
      description: '解释市场价格形成的核心机制',
      content: '供需理论是经济学的基础。供给是指在特定价格下，生产者愿意出售的商品数量；需求是指在特定价格下，消费者愿意购买的商品数量。当供给等于需求时，市场达到均衡状态，形成均衡价格。',
      simple_explanation: '就像菜市场的菜价，买的人多、卖的人少，价格就涨；买的人少、卖的人多，价格就跌。',
      category: 'micro',
      difficulty: 2,
      order_num: 1,
      related_charts: '["supply-demand-chart"]',
      is_published: 1
    },
    {
      chapter_id: 'elasticity',
      title: '价格弹性',
      description: '衡量需求对价格变化的敏感程度',
      content: '价格弹性衡量的是当价格变化1%时，需求量变化的百分比。弹性大于1表示富有弹性（需求对价格敏感），弹性小于1表示缺乏弹性（需求对价格不敏感）。',
      simple_explanation: '奢侈品涨价大家就不买了，这是富有弹性；米面涨价大家还是得买，这是缺乏弹性。',
      category: 'micro',
      difficulty: 3,
      order_num: 2,
      related_charts: '[]',
      is_published: 1
    },
    {
      chapter_id: 'gdp',
      title: '国内生产总值',
      description: '衡量一个国家经济活动总量的指标',
      content: 'GDP 是指一个国家或地区在一定时期内生产的所有最终产品和服务的市场价值。它包括消费、投资、政府支出和净出口四个组成部分。',
      simple_explanation: '就像计算一个家庭一年赚了多少钱，GDP 就是计算整个国家一年创造了多少价值。',
      category: 'macro',
      difficulty: 2,
      order_num: 3,
      related_charts: '["gdp-chart"]',
      is_published: 1
    },
    {
      chapter_id: 'inflation',
      title: '通货膨胀',
      description: '物价总水平持续上涨的经济现象',
      content: '通货膨胀是指货币供给超过实际需求，导致货币贬值、物价普遍上涨的现象。适度的通胀（2%左右）通常被认为是健康的，但恶性通胀会破坏经济。',
      simple_explanation: '100块钱去年能买10斤猪肉，今年只能买8斤，这就是通货膨胀。',
      category: 'macro',
      difficulty: 2,
      order_num: 4,
      related_charts: '["inflation-chart"]',
      is_published: 1
    },
    {
      chapter_id: 'stocks',
      title: '股票投资基础',
      description: '理解股票市场的基本原理',
      content: '股票代表公司所有权的一部分。投资者购买股票，实际上是在购买公司未来收益的份额。股票价格受公司业绩、行业趋势、宏观经济等多种因素影响。',
      simple_explanation: '买股票就是入股当老板，公司赚钱你分红，公司赔钱你也亏损。',
      category: 'finance',
      difficulty: 2,
      order_num: 5,
      related_charts: '[]',
      is_published: 1
    },
    {
      chapter_id: 'bonds',
      title: '债券投资',
      description: '固定收益类金融工具',
      content: '债券是政府或企业向投资者发行的债务凭证。债券持有人定期获得利息，到期收回本金。债券风险通常低于股票，收益也相对稳定。',
      simple_explanation: '借钱给国家或公司，定期收利息，到期拿回本金。',
      category: 'finance',
      difficulty: 2,
      order_num: 6,
      related_charts: '[]',
      is_published: 1
    }
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO chapters 
    (id, chapter_id, title, description, content, simple_explanation, category, difficulty, order_num, related_charts, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const chapter of sampleChapters) {
    const id = crypto.randomUUID();
    insert.run(id, chapter.chapter_id, chapter.title, chapter.description, chapter.content, chapter.simple_explanation, chapter.category, chapter.difficulty, chapter.order_num, chapter.related_charts, chapter.is_published);
  }
}

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export {
  db,
  initDatabase,
  generateId,
  now,
  bcrypt
};
