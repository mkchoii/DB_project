const db = require('../db');

// 주문 생성
exports.createOrders = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { userId } = req.params;
    const { zipcode, city, add_detail, message, items } = req.body;

    if (!zipcode || !city || !add_detail || !items || items.length === 0) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (user_id, zipcode, city, add_detail, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        zipcode,
        city,
        add_detail,
        message || null
      ]
    );

    const orderId = orderResult.insertId;

    // orderDetail 생성 → 트리거가 total_price 자동 계산
    for (const item of items) {
      const [rows] = await connection.query(
        `SELECT price FROM product WHERE product_id = ?`,
        [item.product_id]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: '존재하지 않는 상품' });
      }

      await connection.query(
        `
        INSERT INTO orderDetail (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          item.quantity,
          rows[0].price
        ]
      );
    }

    await connection.commit();

    // 최종 주문 정보 조회 (트리거 반영된 total_price)
    const [orderRows] = await connection.query(
      `
      SELECT order_id, total_price, status
      FROM orders
      WHERE order_id = ?
      `,
      [orderId]
    );

    res.status(201).json({
      order_id: orderRows[0].order_id,
      total_price: orderRows[0].total_price,
      status: orderRows[0].status
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '주문 생성 실패' });
  } finally {
    connection.release();
  }
};

// 회원 주문 목록 조회
exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT order_id, status, total_price, order_date, city, add_detail, zipcode, message
       FROM orders
       WHERE user_id = ?
       ORDER BY order_date DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 목록 조회 실패' });
  }
};

// 주문 상세 조회
exports.getOrdersDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [rows] = await db.query(
      `SELECT order_id, orderDetail_id, price, product_id, quantity
       FROM orderDetail
       WHERE order_id = ?`,
      [orderId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '주문 목록 조회 실패' });
  }
};