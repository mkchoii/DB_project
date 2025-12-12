const db = require('../db');

/**
 * 상품 목록 조회
 * GET /products
 * (카테고리별 조회도 가능하도록 확장)
 */
exports.getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let sql = `
      SELECT product_id, name, price, stock, image, created_at
      FROM product
    `;
    const params = [];

    // 카테고리별 조회 (선택)
    if (categoryId) {
      sql += ` WHERE category_id = ?`;
      params.push(categoryId);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await db.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '상품 목록 조회 실패' });
  }
};

/**
 * 상품 상세 조회
 * GET /products/:productId
 */
exports.getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await db.query(
      `
      SELECT product_id, category_id, name, price, stock,
             description, image, created_at
      FROM product
      WHERE product_id = ?
      `,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '상품 없음' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '상품 상세 조회 실패' });
  }
};

// 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      price,
      stock,
      description,
      image
    } = req.body;

    // 필수 값 검증
    if (!category_id || !name || price == null || stock == null) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    // 카테고리 존재 여부 확인
    const [categoryRows] = await db.query(
      `SELECT category_id FROM category WHERE category_id = ?`,
      [category_id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 카테고리' });
    }

    // 상품 등록
    const [result] = await db.query(
      `
      INSERT INTO product
      (category_id, name, price, stock, description, image)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        category_id,
        name,
        price,
        stock,
        description || null,
        image || null
      ]
    );

    res.status(201).json({
      product_id: result.insertId,
      message: '상품 등록 완료'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '상품 등록 실패' });
  }
};
