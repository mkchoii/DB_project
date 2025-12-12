const db = require('../db');

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 값 검증
    if (!email || !password) {
      return res.status(400).json({ error: '이메일 또는 비밀번호 누락' });
    }

    // 사용자 조회
    const [rows] = await db.query(
      `SELECT user_id, email, password, username
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다' });
    }

    const user = rows[0];

    // 비밀번호 확인
    if (user.password !== password) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다' });
    }

    // 세션에 로그인 정보 저장
    req.session.user = {
      user_id: user.user_id,
      email: user.email,
      username: user.username
    };

    res.json({
      message: '로그인 성공',
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '로그인 실패' });
  }
};

// 로그아웃
exports.logout = (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '로그아웃 실패' });
      }

      res.clearCookie('connect.sid'); // 세션 쿠키 제거
      res.json({ message: '로그아웃 완료' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '로그아웃 실패' });
  }
};
