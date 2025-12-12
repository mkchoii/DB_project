const db = require('../db');

// 회원가입
exports.createUser = async (req, res) => {
  try {
    const { email, password, tel, username } = req.body;

    if (!email || !password || !tel || !username) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    const [result] = await db.query(
      'INSERT INTO users (email, password, tel, username) VALUES (?, ?, ?, ?)',
      [email, password, tel, username]
    );

    res.status(201).json({
      user_id: result.insertId,
      message: '회원가입 완료'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '회원가입 실패' });
  }
};

// 회원 정보 조회
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      'SELECT email, tel, username FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '회원 없음' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '회원 조회 실패' });
  }
};