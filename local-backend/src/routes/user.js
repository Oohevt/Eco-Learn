import express from 'express';
import { db, generateId, now } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/me', (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, is_admin FROM users WHERE id = ?').get(req.user.sub);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: true,
      is_admin: !!user.is_admin
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/progress', (req, res) => {
  try {
    const progress = db.prepare(`
      SELECT * FROM progress WHERE user_id = ?
    `).all(req.user.sub);

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/progress', (req, res) => {
  try {
    const { chapter_id, status } = req.body;

    if (!chapter_id || !status) {
      return res.status(400).json({ error: '请提供章节ID和状态' });
    }

    const existing = db.prepare('SELECT * FROM progress WHERE user_id = ? AND chapter_id = ?').get(req.user.sub, chapter_id);

    if (existing) {
      db.prepare(`
        UPDATE progress SET status = ?, updated_at = ?
        WHERE user_id = ? AND chapter_id = ?
      `).run(status, now(), req.user.sub, chapter_id);
    } else {
      const id = generateId();
      db.prepare(`
        INSERT INTO progress (id, user_id, chapter_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, req.user.sub, chapter_id, status, now(), now());
    }

    const progress = db.prepare('SELECT * FROM progress WHERE user_id = ? AND chapter_id = ?').get(req.user.sub, chapter_id);
    res.json(progress);
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/progress', (req, res) => {
  try {
    db.prepare('DELETE FROM progress WHERE user_id = ?').run(req.user.sub);
    res.json({ message: '进度已清空', success: true });
  } catch (error) {
    console.error('Clear progress error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/favorites', (req, res) => {
  try {
    const favorites = db.prepare(`
      SELECT f.*, c.title, c.category
      FROM favorites f
      JOIN chapters c ON f.chapter_id = c.chapter_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.sub);

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/favorites', (req, res) => {
  try {
    const { chapter_id } = req.body;

    if (!chapter_id) {
      return res.status(400).json({ error: '请提供章节ID' });
    }

    const id = generateId();
    db.prepare(`
      INSERT INTO favorites (id, user_id, chapter_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.sub, chapter_id, now());

    const favorite = db.prepare('SELECT * FROM favorites WHERE id = ?').get(id);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/favorites/:chapterId', (req, res) => {
  try {
    db.prepare(`
      DELETE FROM favorites WHERE user_id = ? AND chapter_id = ?
    `).run(req.user.sub, req.params.chapterId);

    res.json({ message: '已取消收藏', success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export { router as userRouter };
