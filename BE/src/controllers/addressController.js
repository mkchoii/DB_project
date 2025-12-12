const db = require('../db');

// 배송지 추가
exports.createAddress = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { userId } = req.params;
    const { zipcode, city, add_detail, message, is_default } = req.body;

    if (!zipcode || !city || !add_detail) {
      return res.status(400).json({ error: '필수 값 누락' });
    }

    await connection.beginTransaction();

    // 기존 기본 배송지 존재 여부 확인
    const [exist] = await connection.query(
      `SELECT add_id FROM address WHERE user_id = ? AND is_default = 1`,
      [userId]
    );

    const finalIsDefault =
      exist.length === 0
        ? 1
        : (is_default === 1 ? 1 : 0);

    // 새 배송지를 기본 배송지로 설정하는 경우 기존 기본 배송지 해제
    if (finalIsDefault === 1) {
      await connection.query(
        `UPDATE address
         SET is_default = 0
         WHERE user_id = ?`,
        [userId]
      );
    }

    // 배송지 추가
    const [result] = await connection.query(
      `
      INSERT INTO address (user_id, add_detail, city, zipcode, message, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        add_detail,
        city,
        zipcode,
        message || null,
        finalIsDefault
      ]
    );

    await connection.commit();

    res.status(201).json({
      add_id: result.insertId,
      message: '배송지 추가 완료'
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '배송지 추가 실패' });
  } finally {
    connection.release();
  }
};


// 배송지 목록 조회
exports.getAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT add_id, zipcode, city, add_detail, message, is_default
       FROM address
       WHERE user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '배송지 조회 실패' });
  }
};

// 배송지 수정
exports.updateAddress = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { addId } = req.params;
    const { zipcode, city, add_detail, message, is_default } = req.body;

    if (!zipcode || !city || !add_detail) {
      return res.status(400).json({ error: '필수 값 누락' });
  }

  await connection.beginTransaction();

    // 1️⃣ 수정할 배송지 조회 (user_id 확인)
    const [rows] = await connection.query(
      `SELECT user_id FROM address WHERE add_id = ?`,
      [addId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '배송지 없음' });
    }

    const userId = rows[0].user_id;

    // is_default = 1 이면 기존 기본 배송지 해제
    if (is_default === 1) {
      await connection.query(
        `UPDATE address
         SET is_default = 0
         WHERE user_id = ?`,
        [userId]
      );
    }

    // 배송지 수정
    await connection.query(
      `
      UPDATE address
      SET zipcode = ?, city = ?, add_detail = ?, message = ?, is_default = ?
      WHERE add_id = ?
      `,
      [
        zipcode,
        city,
        add_detail,
        message || null,
        is_default ?? 0,
        addId
      ]
    );

    await connection.commit();

    res.json({ message: '배송지 수정 완료' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '배송지 수정 실패' });
  } finally {
    connection.release();
  }
};