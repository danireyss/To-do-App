import pg from "pg";

const { Pool } = pg;

// Create a connection pool using DATABASE_URL or local defaults
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://todouser:todopass@localhost:5432/tododb",
});

// Create the todos table if it doesn't exist yet
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export default pool;
