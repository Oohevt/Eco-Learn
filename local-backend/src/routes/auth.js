import express from 'express';
import { db, generateId, now, bcrypt } from '../db/database.js';
import { createToken } from '../utils/jwt.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请提供用户名、邮箱和密码' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const id = generateId();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(id, username, email, passwordHash);

    res.status(201).json({
      message: `用户 ${username} 注册成功`,
      success: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请提供用户名和密码' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = createToken(user.id);

    res.json({
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: !!user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: '登出成功', success: true });
});

export { router as authRouter };
