const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE email = ?',
      [email],
    );
    if (existing.length)
      return res.status(400).json({ message: 'Admin with email exists' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (name,email,password) VALUES (?,?,?)',
      [name, email, hashed],
    );
    const token = signToken({ id: result.insertId, email, role: 'admin' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [
      email,
    ]);
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Public/member login — returns JWT for members as well
exports.publicLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  const { email, phone, password } = req.body;
  try {
    let query = '';
    let params = [];
    if (email) {
      query = 'SELECT * FROM members WHERE email = ?';
      params = [email];
    } else if (phone) {
      query = 'SELECT * FROM members WHERE phone = ?';
      params = [phone];
    } else {
      return res.status(400).json({ message: 'Provide email or phone' });
    }
    const [rows] = await pool.query(query, params);
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });
    const member = rows[0];
    if (!member.password)
      return res.status(401).json({ message: 'Member has no password set' });
    const match = await bcrypt.compare(password, member.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({
      id: member.id,
      role: 'member',
      name: member.name,
    });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
