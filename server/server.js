import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';


const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5001;

// --- helpers ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// --- Auth: register (optional; handy for testing) ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { rows: existing } = await pool.query('SELECT userId FROM "users" WHERE email=$1', [email]);
    if (existing.length) return res.status(409).json({ error: 'email already in use' });

    const hash = await bcrypt.hash(password, 12);
    const insert = `
      INSERT INTO "users" (firstName, lastName, email, password)
      VALUES ($1,$2,$3,$4)
      RETURNING userId, firstName, lastName, email
    `;
    const { rows } = await pool.query(insert, [firstName || '', lastName || '', email, hash]);
    const user = rows[0];
    const token = signToken({ userId: user.userid, email: user.email });
    res.status(201).json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// --- Auth: login ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT userId, email, password, firstName, lastName FROM "users" WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid Credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid Credentials' });

    const token = signToken({ userId: user.userid, email: user.email });
    res.json({
      token,
      user: {
        userId: user.userid,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/health', async (_req, res) => {
  const { rows } = await pool.query('SELECT NOW() as now');
  res.json({ ok: true, now: rows[0].now });
});

app.listen(PORT, () => {
  console.log(`AI-Do API listening on http://localhost:${PORT}`);
});
