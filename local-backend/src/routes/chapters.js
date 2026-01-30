import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { category, page = 1, page_size = 50 } = req.query;
    const pageSize = Math.min(parseInt(page_size), 100);
    const offset = (parseInt(page) - 1) * pageSize;

    let query = 'SELECT * FROM chapters WHERE is_published = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_num ASC';

    const allChapters = db.prepare(query).all(...params);
    const total = allChapters.length;
    const items = allChapters.slice(offset, offset + pageSize);

    res.json({
      items: items.map(ch => ({
        ...ch,
        related_charts: JSON.parse(ch.related_charts || '[]'),
        is_published: !!ch.is_published
      })),
      total,
      page: parseInt(page),
      page_size: pageSize
    });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const categoryNames = {
      micro: '微观经济学',
      macro: '宏观经济学',
      finance: '金融学'
    };

    const stats = [];
    for (const [catId, catName] of Object.entries(categoryNames)) {
      const count = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE category = ? AND is_published = 1').get(catId).count;
      stats.push({
        category: catId,
        name: catName,
        count
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/:chapterId', (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = db.prepare('SELECT * FROM chapters WHERE chapter_id = ? AND is_published = 1').get(chapterId);

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    res.json({
      ...chapter,
      related_charts: JSON.parse(chapter.related_charts || '[]'),
      is_published: !!chapter.is_published
    });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as chaptersRouter };
