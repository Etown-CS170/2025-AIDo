import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

try {
  const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Tables in your database:');
    rows.forEach((r) => console.log(' -', r.table_name));
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await pool.end();
}