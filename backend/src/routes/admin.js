const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const pool = require('../config/db');

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const [members] = await pool.query(
      'SELECT COUNT(*) as total_members FROM members',
    );
    const [plans] = await pool.query(
      'SELECT COUNT(*) as total_plans FROM plans',
    );
    const [payments] = await pool.query(
      'SELECT COUNT(*) as total_payments, IFNULL(SUM(amount),0) as total_amount FROM payments',
    );
    return res.json({
      members: members[0].total_members,
      plans: plans[0].total_plans,
      payments_count: payments[0].total_payments,
      payments_amount: payments[0].total_amount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
