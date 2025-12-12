const db = require('../db');

// 리뷰 작성
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { user_id, title, content, rating } = req.body;

    // 필수 값 검증
    if (!user_id || !productId || !content) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    // rating 검증 (선택값, 기본 0)
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'rating 값 오류 (0~5)' });
    }

    // 상품 존재 여부 확인
    const [productRows] = await db.query(
      `SELECT product_id FROM product WHERE product_id = ?`,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 상품' });
    }

    // 리뷰 작성
    const [result] = await db.query(
      `
      INSERT INTO review (user_id, product_id, title, content, rating)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        user_id,
        productId,
        title || null,
        content,
        rating ?? 0  
      ]
    );

    res.status(201).json({
      review_id: result.insertId,
      message: '리뷰 작성 완료'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '리뷰 작성 실패' });
  }
};

// 리뷰 수정
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { user_id, title, content, rating } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'rating 값 오류 (0~5)' });
    }

    // 기존 리뷰 조회 (소유자 확인)
    const [rows] = await db.query(
      `
      SELECT user_id
      FROM review
      WHERE review_id = ?
      `,
      [reviewId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '리뷰 없음' });
    }

    if (rows[0].user_id !== user_id) {
      return res.status(403).json({ error: '수정 권한 없음' });
    }

    // 리뷰 수정
    await db.query(
      `
      UPDATE review
      SET title = ?, content = ?, rating = ?
      WHERE review_id = ?
      `,
      [
        title || null,
        content,
        rating ?? 0,
        reviewId
      ]
    );

    res.json({ message: '리뷰 수정 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '리뷰 수정 실패' });
  }
};

// 회원 리뷰 목록 조회
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT r.review_id, r.rating, r.title, r.content, r.created_at, p.name AS product_name
       FROM review r
       JOIN product p ON r.product_id = p.product_id
       WHERE r.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '리뷰 조회 실패' });
  }
};
