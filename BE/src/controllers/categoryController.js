const db = require('../db');

// 카테고리 목록 조회
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT category_id, category_name
      FROM category
      ORDER BY category_name ASC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '카테고리 목록 조회 실패' });
  }
};

// 카테고리별 상품 조회
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // 카테고리 존재 여부 확인
    const [categoryRows] = await db.query(
      `SELECT category_id FROM category WHERE category_id = ?`,
      [categoryId]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 카테고리' });
    }

    // 카테고리에 속한 상품 조회
    const [rows] = await db.query(
      `
      SELECT product_id, name, price
      FROM product
      WHERE category_id = ?
      ORDER BY product_id DESC
      `,
      [categoryId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '카테고리별 상품 조회 실패' });
  }
};
